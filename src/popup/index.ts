import '../styles/main.css';
import { StorageService } from '../services/storage';
import { TimerState, Task } from '../types';

const app = document.getElementById('app');

if (app) {
    app.innerHTML = `
      <div class="popup-container">
        <header class="popup-header">
            <span class="zen-logo-small">Zen</span>
        </header>
        <div class="popup-timer">
            <div class="popup-time-display">--:--</div>
            <div class="popup-controls">
                <button id="pp-toggle" class="icon-btn">⏯</button> 
            </div>
        </div>
        <div class="popup-active-task">
            <span id="active-task-title">No active task</span>
            <button id="mark-done-btn" class="icon-btn" style="display:none">✓</button>
        </div>
        <button id="open-newtab" class="text-btn">Open Dashboard</button>
      </div>
    `;

    const timeDisplay = app.querySelector('.popup-time-display')!;
    const ppBtn = app.querySelector('#pp-toggle')!;
    const taskTitle = app.querySelector('#active-task-title')!;
    const markDoneBtn = app.querySelector('#mark-done-btn') as HTMLElement;
    const openNewTabBtn = app.querySelector('#open-newtab')!;

    let timerState: TimerState | null = null;
    let activeTask: Task | null = null;

    const refresh = async () => {
        timerState = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
        const settings = await StorageService.getSettings(); // Fetch settings

        // Apply theme to body
        if (settings?.theme) {
            document.body.classList.remove('theme-forest', 'theme-rain', 'theme-summer', 'theme-space');
            document.body.classList.add(`theme-${settings.theme}`);
        }

        if (timerState?.activeTaskId) {
            const tasks = await StorageService.getTasks();
            activeTask = tasks.find(t => t.id === timerState!.activeTaskId) || null;
        } else {
            activeTask = null;
        }
        render();
    };

    const render = () => {
        if (!timerState) return;

        const minutes = Math.floor(timerState.remainingSeconds / 60).toString().padStart(2, '0');
        const seconds = (timerState.remainingSeconds % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${minutes}:${seconds}`;

        ppBtn.textContent = timerState.isRunning ? '⏸' : '▶';
        taskTitle.textContent = activeTask ? activeTask.title : (timerState.mode === 'focus' ? 'Ready to focus' : 'Break Time');

        if (activeTask && timerState.mode === 'focus') {
            markDoneBtn.style.display = 'inline-block';
        } else {
            markDoneBtn.style.display = 'none';
        }
    };

    ppBtn.addEventListener('click', () => {
        if (timerState?.isRunning) {
            chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' }).then(refresh);
        } else {
            // Resume or Start
            const taskId = activeTask?.id || timerState?.activeTaskId;
            chrome.runtime.sendMessage({ type: 'START_TIMER', payload: { taskId } }).then(refresh);
        }
    });

    markDoneBtn.addEventListener('click', async () => {
        // Mark task done logic... requires tasks access or message
        // For simplicity, let's just stop timer or complete task via message if we had that.
        // Since we have StorageService, we can update tasks directly.
        if (activeTask) {
            const tasks = await StorageService.getTasks();
            const t = tasks.find(x => x.id === activeTask!.id);
            if (t) {
                t.isCompleted = true;
                await StorageService.saveTasks(tasks);
                // Also stop timer?
                await chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
                refresh();
            }
        }
    });

    openNewTabBtn.addEventListener('click', () => {
        chrome.tabs.create({});
    });

    // Initial
    refresh();

    // Updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'TIMER_UPDATE') {
            timerState = message.payload;
            render(); // fetching active task might be needed?
            // Ideally payload should include active task name or ID is enough if we cache tasks.
            // For now, let's re-fetch if ID changed
            if (timerState?.activeTaskId !== activeTask?.id) {
                refresh();
            } else {
                render();
            }
        }
    });
}
