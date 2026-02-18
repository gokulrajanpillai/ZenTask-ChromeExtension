import { AppTheme, TimerMode, Settings } from '../types';

export class SoundManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private chimeGain: GainNode | null = null;

    // Dual tracks for crossfading
    private tracks: { element: HTMLAudioElement; source: MediaElementAudioSourceNode; gain: GainNode }[] = [];
    private activeTrackIndex: number = 0;

    private currentAmbienceId: string = 'none';
    private settings: Settings | null = null;

    private readonly CROSSFADE_TIME = 1.2; // 1200ms

    private async init() {
        if (this.ctx) return;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        this.chimeGain = this.ctx.createGain();
        this.chimeGain.connect(this.masterGain);

        // Initialize two tracks for crossfading
        for (let i = 0; i < 2; i++) {
            const element = new Audio();
            element.loop = true;
            element.crossOrigin = 'anonymous';

            const source = this.ctx.createMediaElementSource(element);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, this.ctx.currentTime);

            source.connect(gain);
            gain.connect(this.masterGain);

            this.tracks.push({ element, source, gain });
        }
    }

    async updateSettings(settings: Settings) {
        if (!this.ctx) await this.init();
        if (!this.ctx || !this.masterGain) return;
        this.settings = settings;

        if (this.ctx.state === 'suspended') await this.ctx.resume();

        const vol = settings.musicEnabled ? (settings.musicVolume / 100) : 0;
        this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }

    async playCue(_type: 'start' | 'break' | 'resume' | 'complete') {
        if (!this.settings?.showTransitionChime) return;
        if (!this.ctx || !this.chimeGain) await this.init();
        if (!this.ctx || !this.chimeGain) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.3, now + 0.05);
        env.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.connect(env);
        env.connect(this.chimeGain);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    async playThemeAmbience(theme: AppTheme, mode: TimerMode) {
        if (!this.ctx) await this.init();
        if (!this.ctx) return;

        const ambienceId = `${theme}_${mode}`;
        if (this.currentAmbienceId === ambienceId) return;

        // Path to local assets
        const filename = `${theme}_${mode === 'focus' ? 'focus' : 'break'}.mp3`;
        const url = chrome.runtime.getURL(`src/assets/audio/${filename}`);

        const nextTrackIndex = (this.activeTrackIndex + 1) % 2;
        const currentTrack = this.tracks[this.activeTrackIndex];
        const nextTrack = this.tracks[nextTrackIndex];

        const now = this.ctx.currentTime;

        // Fade out current
        currentTrack.gain.gain.cancelScheduledValues(now);
        currentTrack.gain.gain.exponentialRampToValueAtTime(0.001, now + this.CROSSFADE_TIME);
        setTimeout(() => {
            if (this.currentAmbienceId !== ambienceId) {
                currentTrack.element.pause();
            }
        }, this.CROSSFADE_TIME * 1000);

        // Fade in next
        nextTrack.element.src = url;
        nextTrack.gain.gain.cancelScheduledValues(now);
        nextTrack.gain.gain.setValueAtTime(0.001, now);
        nextTrack.gain.gain.exponentialRampToValueAtTime(1.0, now + this.CROSSFADE_TIME);

        try {
            await nextTrack.element.play();
        } catch (e) {
            console.warn(`Audio asset missing: ${filename}. Please add it to src/assets/audio/`);
        }

        this.activeTrackIndex = nextTrackIndex;
        this.currentAmbienceId = ambienceId;
    }

    async stopAmbience() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.tracks.forEach(t => {
            t.gain.gain.cancelScheduledValues(now);
            t.gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
            setTimeout(() => t.element.pause(), 1000);
        });
        this.currentAmbienceId = 'none';
    }
}
