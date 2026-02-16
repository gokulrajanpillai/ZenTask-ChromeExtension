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

export type SoundType = 'none' | 'white_noise' | 'rain' | 'coffee_shop';
export type BreakSoundType = 'none' | 'singing_bowls' | 'ocean_waves' | 'forest_stream';

export interface Settings {
    // Timer
    focusDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;

    // Audio
    enableSound: boolean;
    masterVolume: number;
    focusSound: SoundType;
    focusVolume: number;
    breakSound: BreakSoundType;
    breakVolume: number;
    enableCues: boolean;
    cueVolume: number;

    // Visuals & Misc
    enableBreakReminders: boolean; // Keep for legacy, though specific reminder setting might be redundant with auto-switches
    backgroundIntensity: number;
    reduceMotion: boolean;
}

