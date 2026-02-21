import '../styles/main.css';
import { Greeting } from '../components/Greeting';
import { TimerDisplay } from '../components/TimerDisplay';
import { TaskList } from '../components/TaskList';
import { QuickGrid } from '../components/QuickGrid';
import { BackgroundEffects } from '../components/BackgroundEffects';
import { StorageService } from '../services/storage';
import { TimerState, Task } from '../types';
import { SettingsModal } from '../components/SettingsModal';

const app = document.getElementById('app');

if (app) {
    app.innerHTML = `
      <div class="zen-layout flex-col flex-center" style="min-height: 100vh; padding: 40px; position: relative;">
        <!-- Top Right Settings -->
        <div style="position: absolute; top: 20px; right: 20px;">
            <button id="settings-btn" class="icon-btn" style="font-size: 1.5rem;" title="Settings">⚙️</button>
        </div>

        <!-- Greeting -->
        <div id="greeting-zone" class="mb-8"></div>

        <!-- Timer Centerpiece -->
        <div id="timer-zone" class="mb-12"></div>

        <!-- Main Focus Input -->
        <div id="focus-zone" class="w-full flex-center mb-12" style="min-height: 100px;"></div>

        <!-- Utility Grid -->
        <div id="grid-zone"></div>
      </div>
    `;

    // Initialize Components
    new Greeting(document.getElementById('greeting-zone')!);
    const timerDisplay = new TimerDisplay(document.getElementById('timer-zone')!);
    const taskList = new TaskList(document.getElementById('focus-zone')!);
    const quickGrid = new QuickGrid(document.getElementById('grid-zone')!);

    // Background Effects
    const bgCanvas = document.getElementById('background-canvas') as HTMLCanvasElement;
    if (bgCanvas) {
        const bgEffects = new BackgroundEffects(bgCanvas);
        bgEffects.setTheme('scandinavian');
        bgEffects.start();
    }

    // State
    let timerState: TimerState | null = null;
    let tasks: Task[] = [];

    // ── Toast system ──────────────────────────────────────────────
    const showToast = (text: string, durationMs = 2500) => {
        let toast = document.querySelector('.zen-toast') as HTMLElement;
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'zen-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.classList.remove('show');
        void toast.offsetWidth; // reflow
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), durationMs);
    };

    // ── Refresh Logic ─────────────────────────────────────────────
    const refresh = async () => {
        timerState = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
        tasks = await StorageService.getTasks();
        render();
    };

    // ── Render ───────────────────────────────────────────────────
    const render = () => {
        if (!timerState) return;

        timerDisplay.render(
            timerState,
            () => chrome.runtime.sendMessage({ type: 'START_TIMER', payload: { taskId: getActiveTaskId() } }).then(refresh),
            () => chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' }).then(refresh),
            () => chrome.runtime.sendMessage({ type: 'SKIP_TIMER' }).then(refresh)
        );

        taskList.render(
            tasks,
            timerState.activeTaskId,
            (title) => addTask(title),
            (id) => toggleTask(id),
            (id) => deleteTask(id)
        );

        quickGrid.render();
    };

    // ── Actions ──────────────────────────────────────────────────
    const getActiveTaskId = () => timerState?.activeTaskId || tasks.find(t => !t.isCompleted)?.id;

    const addTask = async (title: string) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            title,
            isCompleted: false,
            estimatedMinutes: 25,
            createdAt: Date.now(),
            order: tasks.length
        };
        tasks.push(newTask);
        await StorageService.saveTasks(tasks);
        showToast('✦ Focus set');
        refresh();
    };

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.isCompleted = !task.isCompleted;
            await StorageService.saveTasks(tasks);
            if (task.isCompleted) showToast('🌿 Task complete');
            refresh();
        }
    };

    const deleteTask = async (id: string) => {
        tasks = tasks.filter(t => t.id !== id);
        await StorageService.saveTasks(tasks);
        refresh();
    };

    // ── Settings ─────────────────────────────────────────────────
    document.getElementById('settings-btn')?.addEventListener('click', () => {
        new SettingsModal(() => refresh()).render();
    });

    // ── Init ─────────────────────────────────────────────────────
    refresh();

    // Listen for background updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'TIMER_UPDATE') {
            timerState = message.payload;
            render();
        }
    });

    // Storage listeners for live sync
    StorageService.onChange(() => {
        refresh();
    });
}
