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

    // Remote fallbacks for when local assets are missing
    private readonly REMOTE_FALLBACKS: Record<string, string> = {
        'forest_focus': 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Forest+Ambience&filename=24/246473-cb378298-2921-4f6c-8438-e67c870c52bb.mp3',
        'forest_break': 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Wind+in+trees&filename=24/246473-7e4e1f74-32b4-4b5a-9407-3a1b0c0343a4.mp3',
        'rain_focus': 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Heavy+Rain&filename=24/246473-61fc0f8d-c782-4c2e-9d8a-9e1e3b6e8a8b.mp3',
        'rain_break': 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Soft+Rain&filename=24/246473-b3c1d4e5-f6a7-4b8c-9e0a-1d2e3f4a5b6c.mp3',
        'summer_focus': 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Cicadas&filename=24/246473-d5e6f7a8-b9c0-4d1e-8f2a-3b4c5d6e7f8a.mp3',
        'summer_break': 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Birds+Singing&filename=24/246473-1a2b3c4d-5e6f-4a8c-9e0d-1f2e3a4b5c6d.mp3',
        'space_focus': 'https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptitle=Deep+Space&filename=24/246473-8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d.mp3',
        'space_break': 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bowl-single-hit-2090.mp3'
    };

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

    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
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

        const filename = `${theme}_${mode === 'focus' ? 'focus' : 'break'}.mp3`;
        const localUrl = chrome.runtime.getURL(`src/assets/audio/${filename}`);
        const fallbackUrl = this.REMOTE_FALLBACKS[ambienceId];

        const nextTrackIndex = (this.activeTrackIndex + 1) % 2;
        const currentTrack = this.tracks[this.activeTrackIndex];
        const nextTrack = this.tracks[nextTrackIndex];

        const now = this.ctx.currentTime;

        const playWithUrl = (url: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                nextTrack.element.src = url;
                nextTrack.element.oncanplaythrough = async () => {
                    nextTrack.element.oncanplaythrough = null;

                    // Fade out current
                    currentTrack.gain.gain.cancelScheduledValues(now);
                    currentTrack.gain.gain.exponentialRampToValueAtTime(0.001, now + this.CROSSFADE_TIME);
                    setTimeout(() => currentTrack.element.pause(), this.CROSSFADE_TIME * 1000);

                    // Fade in next
                    nextTrack.gain.gain.cancelScheduledValues(now);
                    nextTrack.gain.gain.setValueAtTime(0.001, now);
                    nextTrack.gain.gain.exponentialRampToValueAtTime(1.0, now + this.CROSSFADE_TIME);

                    try {
                        await nextTrack.element.play();
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                };
                nextTrack.element.onerror = (e) => reject(e);
                nextTrack.element.load();
            });
        };

        try {
            await playWithUrl(localUrl);
        } catch (e) {
            console.log(`Local asset ${filename} missing or blocked, trying remote...`);
            try {
                if (fallbackUrl) await playWithUrl(fallbackUrl);
            } catch (e2) {
                console.warn(`All attempts failed for ${ambienceId}`);
            }
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
