import { Task, TimerState, Settings } from '../types';

const KEYS = {
    TASKS: 'zen_tasks',
    TIMER: 'zen_timer',
    SETTINGS: 'zen_settings',
};

const DEFAULT_SETTINGS: Settings = {
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,

    enableSound: true,
    masterVolume: 80,
    focusSound: 'none',
    focusVolume: 50,
    breakSound: 'singing_bowls',
    breakVolume: 50,
    enableCues: true,
    cueVolume: 70,

    enableBreakReminders: true,
    backgroundIntensity: 50,
    reduceMotion: false,
};

const DEFAULT_TIMER: TimerState = {
    isRunning: false,
    mode: 'focus',
    remainingSeconds: 20 * 60,
    activeTaskId: null,
    lastTick: Date.now(),
    cyclesCompleted: 0,
};

export const StorageService = {
    async getTasks(): Promise<Task[]> {
        // Try local first
        const result = await chrome.storage.local.get(KEYS.TASKS);
        let tasks = (result[KEYS.TASKS] as Task[]) || [];

        // Migration: Check if we have tasks in sync storage and none in local
        if (tasks.length === 0) {
            const syncResult = await chrome.storage.sync.get(KEYS.TASKS);
            const syncTasks = (syncResult[KEYS.TASKS] as any[]) || [];

            if (syncTasks.length > 0) {
                console.log('Migrating tasks from sync to local...');
                tasks = syncTasks.map(t => ({
                    ...t,
                    // Ensure new fields exist
                    id: t.id || crypto.randomUUID(),
                    totalTimeMs: t.totalTimeMs || 0,
                    sessionTimeMs: 0,
                    pomodorosCompleted: t.pomodorosCompleted || 0,
                    updatedAt: Date.now()
                }));
                await this.saveTasks(tasks);
                // Optional: Clear sync storage to avoid confusion? 
                // chrome.storage.sync.remove(KEYS.TASKS);
            }
        }

        return tasks;
    },

    async saveTasks(tasks: Task[]): Promise<void> {
        await chrome.storage.local.set({ [KEYS.TASKS]: tasks });
    },

    async getTimerState(): Promise<TimerState> {
        const result = await chrome.storage.local.get(KEYS.TIMER);
        return (result[KEYS.TIMER] as TimerState) || DEFAULT_TIMER;
    },

    async saveTimerState(state: TimerState): Promise<void> {
        await chrome.storage.local.set({ [KEYS.TIMER]: state });
    },

    async getSettings(): Promise<Settings> {
        const result = await chrome.storage.local.get(KEYS.SETTINGS);
        return { ...DEFAULT_SETTINGS, ...(result[KEYS.SETTINGS] as Partial<Settings> || {}) };
    },

    async saveSettings(settings: Settings): Promise<void> {
        await chrome.storage.local.set({ [KEYS.SETTINGS]: settings });
    },

    // Helper to observe changes
    onChange(callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void) {
        chrome.storage.onChanged.addListener(callback);
    }
};
