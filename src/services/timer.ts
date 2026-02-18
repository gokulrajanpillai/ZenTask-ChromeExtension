import { TimerState, TimerMode, Settings } from '../types';
import { StorageService } from './storage';

const ALARM_NAME = 'zen-timer-tick';

export class TimerService {
    private state: TimerState;
    private settings: Settings | null = null;

    constructor() {
        this.state = {
            isRunning: false,
            mode: 'focus',
            remainingSeconds: 25 * 60,
            activeTaskId: null,
            lastTick: Date.now(),
            cyclesCompleted: 0
        };
    }

    async init() {
        this.settings = await StorageService.getSettings();
        const savedState = await StorageService.getTimerState();

        // Listen for live settings changes
        StorageService.onChange((changes) => {
            if (changes['zen_settings']) {
                StorageService.getSettings().then(s => {
                    this.settings = s;
                    // If we're not running, update remaining seconds too
                    if (!this.state.isRunning) {
                        this.state.remainingSeconds = this.getDurationForMode(this.state.mode);
                        this.saveState();
                        this.broadcastState();
                        this.updateBadge();
                    }
                });
            }
        });

        if (savedState) {
            this.state = savedState;
            if (this.state.isRunning) {
                const now = Date.now();
                const elapsed = Math.floor((now - this.state.lastTick) / 1000);
                if (elapsed > 0) {
                    await this.tick(elapsed);
                }
            }
        }
    }

    async start(taskId?: string) {
        if (!this.settings) await this.init();

        if (taskId) {
            this.state.activeTaskId = taskId;
        }

        if (!this.state.isRunning) {
            this.broadcastSound('start');
        }

        this.state.isRunning = true;
        this.state.lastTick = Date.now();

        await this.updateActiveTaskStatus(true);
        await this.saveState();
        await this.createAlarm();
        this.broadcastState();
    }

    async pause() {
        this.state.isRunning = false;
        await this.updateActiveTaskStatus(false);
        await this.saveState();
        await this.clearAlarm();
        this.broadcastState();
    }

    async reset() {
        if (!this.settings) await this.init();
        this.state.isRunning = false;
        this.state.mode = 'focus';
        this.state.remainingSeconds = this.getDurationForMode('focus');
        this.state.cyclesCompleted = 0;

        await this.updateActiveTaskStatus(false);
        await this.saveState();
        await this.clearAlarm();
        this.broadcastState();
    }

    async skip() {
        await this.switchMode();
    }

    private getDurationForMode(mode: TimerMode): number {
        switch (mode) {
            case 'focus': return (this.settings?.focusDuration || 25) * 60;
            case 'break': return (this.settings?.breakDuration || 5) * 60;
            case 'longBreak': return (this.settings?.longBreakDuration || 15) * 60;
        }
    }

    async tick(seconds: number = 1) {
        if (!this.state.isRunning) return;

        const now = Date.now();
        this.state.lastTick = now;
        this.state.remainingSeconds -= seconds;

        if (this.state.mode === 'focus' && this.state.activeTaskId) {
            await this.updateTaskTime(this.state.activeTaskId, seconds * 1000);
        }

        if (this.state.remainingSeconds <= 0) {
            this.state.remainingSeconds = 0;
            await this.handleTimerComplete();
        } else {
            await this.saveState();
            this.broadcastState();
            this.updateBadge();
        }
    }

    private async handleTimerComplete() {
        if (this.state.mode === 'focus') {
            this.state.cyclesCompleted++;

            if (this.state.activeTaskId) {
                await this.incrementTaskPomodoros(this.state.activeTaskId);
            }

            const cyclesBeforeLong = this.settings?.cyclesBeforeLongBreak || 4;
            const shouldLongBreak = this.state.cyclesCompleted % cyclesBeforeLong === 0;

            this.state.mode = shouldLongBreak ? 'longBreak' : 'break';
            this.broadcastSound('break');

        } else {
            this.state.mode = 'focus';
            this.broadcastSound('resume');
        }

        this.state.remainingSeconds = this.getDurationForMode(this.state.mode);
        this.state.lastTick = Date.now();
        this.state.isRunning = true;

        await this.saveState();
        this.broadcastState();
        this.updateBadge();
        this.sendNotification();
    }

    private async switchMode() {
        if (this.state.mode === 'focus') {
            this.state.mode = 'break';
        } else {
            this.state.mode = 'focus';
        }

        this.state.remainingSeconds = this.getDurationForMode(this.state.mode);
        this.state.lastTick = Date.now();
        await this.saveState();
        this.broadcastState();
        this.updateBadge();
    }

    private async updateActiveTaskStatus(_active: boolean) {
        if (!this.state.activeTaskId) return;
        // console.debug(`Task ${this.state.activeTaskId} active state: ${active}`);
    }

    private async updateTaskTime(taskId: string, elapsedMs: number) {
        let tasks = await StorageService.getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].totalTimeMs = (tasks[taskIndex].totalTimeMs || 0) + elapsedMs;
            tasks[taskIndex].sessionTimeMs = (tasks[taskIndex].sessionTimeMs || 0) + elapsedMs;
            await StorageService.saveTasks(tasks);
        }
    }

    private async incrementTaskPomodoros(taskId: string) {
        let tasks = await StorageService.getTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].pomodorosCompleted = (tasks[taskIndex].pomodorosCompleted || 0) + 1;
            await StorageService.saveTasks(tasks);
        }
    }

    private async createAlarm() {
        await chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 / 60 });
    }

    private async clearAlarm() {
        await chrome.alarms.clear(ALARM_NAME);
    }

    private async saveState() {
        await StorageService.saveTimerState(this.state);
    }

    private broadcastState() {
        chrome.runtime.sendMessage({ type: 'TIMER_UPDATE', payload: this.state }).catch(() => { });
    }

    private broadcastSound(cue: 'start' | 'break' | 'resume') {
        chrome.runtime.sendMessage({ type: 'PLAY_CUE', payload: cue }).catch(() => { });
    }

    private updateBadge() {
        const minutes = Math.ceil(this.state.remainingSeconds / 60);
        chrome.action.setBadgeText({ text: minutes.toString() });
        const color = this.state.mode === 'focus' ? '#d4a373' : (this.state.mode === 'break' ? '#a3b18a' : '#588157');
        chrome.action.setBadgeBackgroundColor({ color });
    }

    private sendNotification() {
        const title = this.state.mode === 'focus' ? 'Back to focus' : 'Take a break';
        const message = this.state.mode === 'focus' ? 'Ready to flow?' : 'Relax and breathe.';

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icon128.png',
            title,
            message,
            priority: 1
        });
    }
}
