export interface Task {
    id: string;
    title: string;
    isCompleted: boolean;
    estimatedMinutes: number; // Default 25
    createdAt: number;
    updatedAt?: number;
    order: number;

    // New fields for timing
    totalTimeMs: number;
    sessionTimeMs: number; // Time in current session
    pomodorosCompleted: number;
    lastStartedAt?: number;
    lastStoppedAt?: number;
}

export type TimerMode = 'focus' | 'break' | 'longBreak';

export interface TimerState {
    isRunning: boolean;
    mode: TimerMode;
    remainingSeconds: number;
    activeTaskId: string | null;
    lastTick: number;
    cyclesCompleted: number;
}

export type AppTheme = 'forest' | 'rain' | 'summer' | 'space';

export interface Settings {
    // Timer
    focusDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;

    // Theme & Audio
    theme: AppTheme;
    enableSound: boolean;
    masterVolume: number;
    enableCues: boolean;
    cueVolume: number;

    // Visuals & Misc
    enableBreakReminders: boolean;
    backgroundIntensity: number;
    reduceMotion: boolean;

    // UX
    autoReturnToListOnBreak: boolean;
}

