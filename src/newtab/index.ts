import '../styles/main.css';
import { Header } from '../components/Header';
import { TimerDisplay } from '../components/TimerDisplay';
import { TaskList } from '../components/TaskList';
import { Footer } from '../components/Footer';
import { StorageService } from '../services/storage';
import { SoundManager } from '../services/audio';
import { ZenVisualizer } from '../components/ZenVisualizer';
import { TimerState, Task, Settings, TimerMode } from '../types';

const app = document.getElementById('app');
const soundManager = new SoundManager();

if (app) {
    app.innerHTML = `
      <div class="zen-layout">
        <canvas id="zen-background" class="zen-bg-canvas"></canvas>
        <header id="header-zone"></header>
        <main id="main-zone">
            <div id="timer-section"></div>
            <div id="tasks-section"></div>
        </main>
        <div id="focus-view"></div>
        <footer id="footer-zone"></footer>
      </div>
    `;

    const bgCanvas = document.getElementById('zen-background') as HTMLCanvasElement;
    const globalVisualizer = new ZenVisualizer(bgCanvas);
    globalVisualizer.start();

    // Handle resizing
    window.addEventListener('resize', () => {
        globalVisualizer.resize();
    });
    globalVisualizer.resize();

    const header = new Header(document.getElementById('header-zone')!);
    const timerComponent = new TimerDisplay(document.getElementById('timer-section')!);
    const taskList = new TaskList(document.getElementById('tasks-section')!);
    const footer = new Footer(document.getElementById('footer-zone')!);

    const focusViewEl = document.getElementById('focus-view')!;

    // State
    let timerState: TimerState | null = null;
    let tasks: Task[] = [];
    let currentSettings: Settings | null = null;
    let viewMode: 'list' | 'focus' = 'list';
    let previousMode: TimerMode | null = null;

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

    // ── Core refresh ──────────────────────────────────────────────
    const refresh = async () => {
        timerState = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
        tasks = await StorageService.getTasks();
        currentSettings = await StorageService.getSettings();
        await soundManager.updateSettings(currentSettings);
        render();
    };

    // ── Render dispatcher ─────────────────────────────────────────
    const render = () => {
        if (!timerState || !currentSettings) return;

        // Header
        header.render(currentSettings, toggleSound, openSettings);

        // Footer
        footer.render(timerState.mode !== 'focus' && timerState.isRunning);

        if (viewMode === 'focus') {
            renderFocusView();
        } else {
            renderListView();
        }

        // Apply global theme class
        document.body.classList.remove('theme-forest', 'theme-rain', 'theme-summer', 'theme-space');
        document.body.classList.add(`theme-${currentSettings.theme}`);

        globalVisualizer.updateState(timerState, currentSettings);
        syncAmbience(timerState);
    };

    // ── List view ─────────────────────────────────────────────────
    const renderListView = () => {
        if (!timerState) return;

        const mainZone = document.getElementById('main-zone')!;
        mainZone.classList.remove('hidden');
        focusViewEl.classList.remove('active');

        timerComponent.render(
            timerState,
            () => {
                chrome.runtime.sendMessage({ type: 'START_TIMER', payload: { taskId: getActiveTaskId() } }).then(() => {
                    viewMode = 'focus';
                    previousMode = 'focus';
                    refresh();
                    showToast('✦ Focus started');
                });
            },
            () => chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' }).then(refresh),
            () => chrome.runtime.sendMessage({ type: 'SKIP_TIMER' }).then(refresh),
            () => {
                viewMode = 'focus';
                previousMode = 'focus';
                render();
            }
        );

        taskList.render(
            tasks, timerState.activeTaskId,
            (title) => addTask(title),
            (id) => toggleTask(id),
            (id) => {
                // Clicking a task starts it and enters focus view
                startTask(id).then(() => {
                    viewMode = 'focus';
                    previousMode = 'focus';
                    refresh();
                    showToast('✦ Focus started');
                });
            },
            (id) => deleteTask(id)
        );
    };

    // ── Focus view ────────────────────────────────────────────────
    const renderFocusView = () => {
        if (!timerState || !currentSettings) return;

        const mainZone = document.getElementById('main-zone')!;
        mainZone.classList.add('hidden');
        focusViewEl.classList.add('active');

        const activeTask = tasks.find(t => t.id === timerState!.activeTaskId);
        const taskTitle = activeTask ? activeTask.title : 'Focus';

        // State label
        let stateLabel = 'Idle';
        if (timerState.isRunning && timerState.mode === 'focus') {
            stateLabel = `Focus · Cycle ${timerState.cyclesCompleted + 1}`;
        } else if (timerState.isRunning && timerState.mode === 'break') {
            stateLabel = 'Short Break';
        } else if (timerState.isRunning && timerState.mode === 'longBreak') {
            stateLabel = 'Long Rest';
        } else if (!timerState.isRunning) {
            stateLabel = 'Paused';
        }

        // Time
        const minutes = Math.floor(timerState.remainingSeconds / 60).toString().padStart(2, '0');
        const seconds = (timerState.remainingSeconds % 60).toString().padStart(2, '0');

        // Progress ring
        const radius = 150;
        const circumference = 2 * Math.PI * radius;
        let totalSeconds = currentSettings.focusDuration * 60;
        if (timerState.mode === 'break') totalSeconds = currentSettings.breakDuration * 60;
        else if (timerState.mode === 'longBreak') totalSeconds = currentSettings.longBreakDuration * 60;
        const progress = totalSeconds > 0 ? timerState.remainingSeconds / totalSeconds : 0;
        const dashOffset = circumference * (1 - progress);

        // Check if we need full rebuild or just update
        if (!focusViewEl.querySelector('.focus-timer-wrap')) {
            focusViewEl.innerHTML = `
              <div class="focus-task-title" id="fv-task-title">${taskTitle}</div>
              <div class="focus-timer-wrap">
                <svg class="progress-ring" width="320" height="320">
                  <circle class="progress-ring__bg" cx="160" cy="160" r="${radius}" />
                  <circle class="progress-ring__fill" id="fv-ring" cx="160" cy="160" r="${radius}"
                          stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" />
                </svg>
                <div class="focus-time" id="fv-time">${minutes}:${seconds}</div>
              </div>
              <div class="focus-state-label" id="fv-state">${stateLabel}</div>
              <div class="focus-controls" id="fv-controls"></div>
              <button class="focus-exit-btn" id="fv-exit">← Exit Focus View</button>
              <button class="focus-show-tasks-btn" id="fv-show-tasks">Show Tasks</button>
            `;

            const canvas = focusViewEl.querySelector('#focus-visualizer') as HTMLCanvasElement;
            if (canvas) {
                // Removed local focus visualizer initialization
            }
        } else {
            // Update text only
            const titleEl = focusViewEl.querySelector('#fv-task-title');
            if (titleEl) titleEl.textContent = taskTitle;

            const timeEl = focusViewEl.querySelector('#fv-time');
            if (timeEl) timeEl.textContent = `${minutes}:${seconds}`;

            const stateEl = focusViewEl.querySelector('#fv-state');
            if (stateEl) stateEl.textContent = stateLabel;

            const ring = focusViewEl.querySelector('#fv-ring') as SVGCircleElement;
            if (ring) ring.setAttribute('stroke-dashoffset', String(dashOffset));
        }

        // Render controls
        const controlsEl = focusViewEl.querySelector('#fv-controls')!;
        if (controlsEl) {
            if (timerState.isRunning) {
                controlsEl.innerHTML = `
                  <button class="btn-primary btn-pause" id="fv-pause">Pause</button>
                  <button class="btn-secondary" id="fv-skip" style="padding:10px 14px;">⏭</button>
                `;
            } else {
                controlsEl.innerHTML = `
                  <button class="btn-primary" id="fv-resume">Resume</button>
                  <button class="btn-danger" id="fv-stop">Stop</button>
                  <button class="btn-secondary" id="fv-skip" style="padding:10px 14px;">⏭</button>
                `;
            }

            // Bind controls
            controlsEl.querySelector('#fv-pause')?.addEventListener('click', () => {
                chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' }).then(refresh);
            });
            controlsEl.querySelector('#fv-resume')?.addEventListener('click', () => {
                chrome.runtime.sendMessage({ type: 'START_TIMER', payload: { taskId: getActiveTaskId() } }).then(refresh);
            });
            controlsEl.querySelector('#fv-stop')?.addEventListener('click', () => {
                chrome.runtime.sendMessage({ type: 'RESET_TIMER' }).then(() => {
                    exitFocusView();
                });
            });
            controlsEl.querySelector('#fv-skip')?.addEventListener('click', () => {
                chrome.runtime.sendMessage({ type: 'SKIP_TIMER' }).then(refresh);
            });
        }

        // Exit button
        const exitBtn = focusViewEl.querySelector('#fv-exit');
        if (exitBtn) {
            const newExit = exitBtn.cloneNode(true) as HTMLElement;
            exitBtn.parentNode?.replaceChild(newExit, exitBtn);
            newExit.addEventListener('click', () => exitFocusView());
        }

        // Show tasks drawer
        const showTasksBtn = focusViewEl.querySelector('#fv-show-tasks');
        if (showTasksBtn) {
            const newBtn = showTasksBtn.cloneNode(true) as HTMLElement;
            showTasksBtn.parentNode?.replaceChild(newBtn, showTasksBtn);
            newBtn.addEventListener('click', () => openTaskDrawer());
        }
    };

    const exitFocusView = () => {
        viewMode = 'list';
        previousMode = null;
        focusViewEl.innerHTML = '';
        refresh();
    };

    // ── Task drawer (overlay in focus view) ───────────────────────
    const openTaskDrawer = () => {
        if (!timerState) return;

        // Create overlay + drawer
        const overlay = document.createElement('div');
        overlay.className = 'task-drawer-overlay';
        const drawer = document.createElement('div');
        drawer.className = 'task-drawer';

        const tmpContainer = document.createElement('div');
        const tmpTaskList = new TaskList(tmpContainer);
        tmpTaskList.render(
            tasks, timerState.activeTaskId,
            (title) => { addTask(title); closeDrawer(); },
            (id) => { toggleTask(id); closeDrawer(); },
            (id) => { startTask(id); closeDrawer(); },
            (id) => { deleteTask(id); closeDrawer(); }
        );
        drawer.appendChild(tmpContainer);

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            drawer.classList.add('open');
        });

        const closeDrawer = () => {
            drawer.classList.remove('open');
            overlay.classList.remove('visible');
            setTimeout(() => { overlay.remove(); drawer.remove(); refresh(); }, 350);
        };
        overlay.addEventListener('click', closeDrawer);
    };

    // ── Transition detection ──────────────────────────────────────
    const detectTransition = (newState: TimerState) => {
        if (!previousMode || !currentSettings) {
            previousMode = newState.mode;
            return;
        }

        if (newState.mode !== previousMode) {
            // Mode changed
            if (newState.mode === 'focus' && (previousMode === 'break' || previousMode === 'longBreak')) {
                showToast('✦ Back to focus');
            } else if (newState.mode === 'break' || newState.mode === 'longBreak') {
                showToast('🌿 Break time');
                // Auto-return to list if setting is on
                if (currentSettings.autoReturnToListOnBreak && viewMode === 'focus') {
                    exitFocusView();
                }
            }
            previousMode = newState.mode;
        }
    };

    // ── Helpers ────────────────────────────────────────────────────
    const getActiveTaskId = () => timerState?.activeTaskId;

    const addTask = async (title: string) => {
        const newTask: Task = {
            id: crypto.randomUUID(), title,
            isCompleted: false, estimatedMinutes: 25,
            createdAt: Date.now(), order: tasks.length,
            totalTimeMs: 0, sessionTimeMs: 0, pomodorosCompleted: 0
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
        if (timerState?.isRunning) {
            await chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
        }
        await chrome.runtime.sendMessage({ type: 'START_TIMER', payload: { taskId: id } });
    };

    const deleteTask = async (id: string) => {
        if (timerState?.activeTaskId === id && timerState.isRunning) {
            await chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
        }
        tasks = tasks.filter(t => t.id !== id);
        await StorageService.saveTasks(tasks);
        refresh();
    };

    // ── Sound toggle ──────────────────────────────────────────────
    const toggleSound = async () => {
        if (!currentSettings) currentSettings = await StorageService.getSettings();
        const newEnabled = !currentSettings.musicEnabled;
        currentSettings = { ...currentSettings, musicEnabled: newEnabled };
        await StorageService.saveSettings(currentSettings);
        await soundManager.updateSettings(currentSettings);

        if (!newEnabled) await soundManager.stopAmbience();
        else if (timerState) await syncAmbience(timerState);

        render();
    };

    // ── Settings panel ────────────────────────────────────────────
    const openSettings = () => {
        import('../components/SettingsModal').then(({ SettingsPanel }) => {
            const panel = new SettingsPanel(() => refresh());
            panel.open();
        });
    };

    // ── Audio sync ────────────────────────────────────────────────
    const syncAmbience = async (state: TimerState) => {
        if (!currentSettings) currentSettings = await StorageService.getSettings();
        if (!currentSettings.musicEnabled) { await soundManager.stopAmbience(); return; }

        if (state.isRunning) {
            await soundManager.playThemeAmbience(currentSettings.theme, state.mode);
        } else {
            await soundManager.stopAmbience();
        }
    };

    // ── Boot ──────────────────────────────────────────────────────
    refresh();

    // Listen for storage changes (live settings updates)
    StorageService.onChange((changes) => {
        if (changes['zen_settings']) {
            refresh();
        }
    });

    window.addEventListener('resize', () => {
        globalVisualizer.resize();
    });

    // Listen for background updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'TIMER_UPDATE') {
            const newState = message.payload as TimerState;
            detectTransition(newState);
            timerState = newState;
            render();
        } else if (message.type === 'PLAY_CUE') {
            soundManager.playCue(message.payload);
        }
    });

    // ── Mouse Tracking for Visualizer ───────────────────────────────
    window.addEventListener('mousemove', (e) => {
        globalVisualizer.updateMouse(e.clientX, e.clientY);
    });

    // ── Audio Unlock (Satisfy Autoplay Policies) ───────────────────
    window.addEventListener('click', () => {
        soundManager.resume();
    }, { once: true });
}
