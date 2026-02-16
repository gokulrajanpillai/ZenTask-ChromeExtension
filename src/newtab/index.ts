import '../styles/main.css';
import { Header } from '../components/Header';
import { TimerDisplay } from '../components/TimerDisplay';
import { TaskList } from '../components/TaskList';
import { Footer } from '../components/Footer';
import { StorageService } from '../services/storage';
import { SoundManager } from '../services/audio';
import { TimerState, Task } from '../types';

const app = document.getElementById('app');
const soundManager = new SoundManager();

if (app) {
    app.innerHTML = `
      <div class="zen-layout">
        <header id="header-zone"></header>
        <main id="main-zone">
            <div id="timer-section"></div>
            <div id="tasks-section"></div>
        </main>
        <footer id="footer-zone"></footer>
      </div>
    `;

    const header = new Header(document.getElementById('header-zone')!);
    const timerComponent = new TimerDisplay(document.getElementById('timer-section')!);
    const taskListComponent = new TaskList(document.getElementById('tasks-section')!);
    const footer = new Footer(document.getElementById('footer-zone')!);

    // State
    let timerState: TimerState | null = null;
    let tasks: Task[] = [];

    // Actions
    const refresh = async () => {
        timerState = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
        tasks = await StorageService.getTasks();

        // Sync Audio settings on refresh to ensure volume/enabled state is correct
        const settings = await StorageService.getSettings();
        await soundManager.updateSettings(settings);

        render();
    };

    const render = () => {
        if (!timerState) return;

        // Header
        const statusText = timerState.isRunning
            ? (timerState.mode === 'focus' ? 'Focusing...' : 'Resting...')
            : 'ZenTask';

        header.render(statusText, toggleSound, openSettings);

        // Timer
        timerComponent.render(
            timerState,
            () => chrome.runtime.sendMessage({ type: 'START_TIMER', payload: { taskId: getActiveTaskId() } }).then(refresh),
            () => chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' }).then(refresh),
            () => chrome.runtime.sendMessage({ type: 'SKIP_TIMER' }).then(refresh)
        );

        // Tasks
        taskListComponent.render(
            tasks,
            timerState.activeTaskId,
            (title) => addTask(title),
            (id) => toggleTask(id),
            (id) => startTask(id),
            (id) => deleteTask(id)
        );

        // Footer
        footer.render(timerState.mode !== 'focus' && timerState.isRunning);

        // Audio Logic Sync (Ensure correct ambience is playing based on state)
        // Background handles logic, but actual audio playback might need to happen here if not in offscreen
        // Current plan: Listen for cue messages, but relying on background for state is safer.
        // However, we can also check state here and trigger ambience.
        syncAmbience(timerState);
    };

    // Helpers
    const getActiveTaskId = () => {
        return timerState?.activeTaskId;
    };

    const addTask = async (title: string) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            isCompleted: false,
            estimatedMinutes: 25,
            createdAt: Date.now(),
            order: tasks.length,
            totalTimeMs: 0,
            sessionTimeMs: 0,
            pomodorosCompleted: 0
        };
        tasks.push(newTask);
        await StorageService.saveTasks(tasks);
        refresh();
    };

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.isCompleted = !task.isCompleted;
            await StorageService.saveTasks(tasks);
            refresh();
        }
    };

    const startTask = async (id: string) => {
        // Stop current if running to ensure clean switch
        if (timerState?.isRunning) {
            await chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
        }
        await chrome.runtime.sendMessage({ type: 'START_TIMER', payload: { taskId: id } });
        refresh();
    };

    const deleteTask = async (id: string) => {
        // If deleting active task, maybe pause timer?
        if (timerState?.activeTaskId === id && timerState.isRunning) {
            await chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
        }

        tasks = tasks.filter(t => t.id !== id);
        await StorageService.saveTasks(tasks);
        refresh();
    }

    const toggleSound = async () => {
        const settings = await StorageService.getSettings();
        const newEnabled = !settings.enableSound;
        await StorageService.saveSettings({ ...settings, enableSound: newEnabled });
        await soundManager.updateSettings({ ...settings, enableSound: newEnabled });

        if (!newEnabled) soundManager.stopAmbience();
        else syncAmbience(timerState!);
    };

    const openSettings = () => {
        import('../components/SettingsModal').then(({ SettingsPanel }) => {
            const panel = new SettingsPanel(() => {
                refresh();
            });
            panel.open();
        });
    };

    const syncAmbience = async (state: TimerState) => {
        const settings = await StorageService.getSettings();
        if (!settings.enableSound) {
            soundManager.stopAmbience();
            return;
        }

        if (state.isRunning) {
            if (state.mode === 'focus') {
                soundManager.playAmbience(settings.focusSound, settings.focusVolume);
            } else {
                soundManager.playAmbience(settings.breakSound, settings.breakVolume);
            }
        } else {
            soundManager.stopAmbience();
        }
    };

    // Initial Load
    refresh();

    // Listen for updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'TIMER_UPDATE') {
            timerState = message.payload;
            render();
        } else if (message.type === 'PLAY_CUE') {
            soundManager.playCue(message.payload);
        }
    });
}
