import { AppTheme, TimerMode, Settings } from '../types';

export class SoundManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private ambienceGain: GainNode | null = null;
    private cueGain: GainNode | null = null;

    private ambienceElement: HTMLAudioElement | null = null;
    private ambienceSourceNode: MediaElementAudioSourceNode | null = null;
    private currentAmbienceId: string = 'none';
    private cuesEnabled = true;

    // Theme Sound Mapping
    private readonly THEME_SOUNDS: Record<AppTheme, { focus: string; break: string }> = {
        'forest': {
            focus: 'https://actions.google.com/sounds/v1/ambiences/forest_daybreak.ogg',
            break: 'https://actions.google.com/sounds/v1/water/stream_water_flowing.ogg'
        },
        'rain': {
            focus: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy_loud.ogg',
            break: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg'
        },
        'summer': {
            focus: 'https://actions.google.com/sounds/v1/ambiences/field_at_night.ogg',
            break: 'https://actions.google.com/sounds/v1/ambiences/morning_birds.ogg'
        },
        'space': {
            focus: 'white_noise', // Generated
            break: 'singing_bowls' // Generated
        }
    };

    private async init() {
        if (this.ctx) return;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.connect(this.masterGain);

        this.cueGain = this.ctx.createGain();
        this.cueGain.connect(this.masterGain);
    }

    async updateSettings(settings: Settings) {
        if (!this.ctx) await this.init();
        if (!this.ctx || !this.masterGain) return;

        if (this.ctx.state === 'suspended') await this.ctx.resume();

        const vol = settings.enableSound ? (settings.masterVolume / 100) : 0;
        this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
        this.cuesEnabled = settings.enableCues !== false;
    }

    // ── Transition Bong ──────────────────────────────────────────────
    async playCue(_type: 'start' | 'break' | 'resume' | 'complete') {
        if (!this.cuesEnabled) return;
        if (!this.ctx) await this.init();
        if (!this.ctx || !this.cueGain) return;

        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(220, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, now);

        const osc3 = this.ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(660, now);

        const envelope = this.ctx.createGain();
        envelope.connect(this.cueGain);

        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.6, now + 0.01);
        envelope.gain.exponentialRampToValueAtTime(0.3, now + 0.3);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + 3.0);

        osc1.connect(envelope);
        osc2.connect(envelope);
        osc3.connect(envelope);

        [osc1, osc2, osc3].forEach(o => {
            o.start(now);
            o.stop(now + 3.0);
        });
    }

    // ── Theme Experience ─────────────────────────────────────────────
    async playThemeAmbience(theme: AppTheme, mode: TimerMode) {
        if (!this.ctx) await this.init();
        if (!this.ctx || !this.ambienceGain) return;

        const sounds = this.THEME_SOUNDS[theme];
        const soundToPlay = mode === 'focus' ? sounds.focus : sounds.break;
        const ambienceId = `${theme}_${mode}`;

        if (this.currentAmbienceId === ambienceId) return;

        await this.stopAmbience();
        this.currentAmbienceId = ambienceId;

        // Default soft volume for themes
        const volume = 0.5;
        this.ambienceGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.ambienceGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 3);

        if (soundToPlay.startsWith('http')) {
            this.ambienceElement = new Audio(soundToPlay);
            this.ambienceElement.crossOrigin = 'anonymous';
            this.ambienceElement.loop = true;

            this.ambienceSourceNode = this.ctx.createMediaElementSource(this.ambienceElement);
            this.ambienceSourceNode.connect(this.ambienceGain);

            await this.ambienceElement.play().catch(e => console.error('Audio play failed:', e));
        } else if (soundToPlay !== 'none') {
            const buffer = this.generateNoise(soundToPlay);
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(this.ambienceGain);
            source.start();
            (this as any).generatedSource = source;
        }
    }

    async stopAmbience() {
        if (this.ctx && this.ambienceGain) {
            this.ambienceGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.ambienceGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.8);
        }

        if (this.ambienceElement) {
            const el = this.ambienceElement;
            const node = this.ambienceSourceNode;
            setTimeout(() => {
                el.pause();
                el.src = '';
                node?.disconnect();
            }, 1000);
            this.ambienceElement = null;
            this.ambienceSourceNode = null;
        }

        if ((this as any).generatedSource) {
            const src = (this as any).generatedSource;
            setTimeout(() => { try { src.stop(); src.disconnect(); } catch { } }, 1000);
            (this as any).generatedSource = null;
        }

        this.currentAmbienceId = 'none';
    }

    private generateNoise(type: string): AudioBuffer {
        if (!this.ctx) throw new Error('No AudioContext');
        const sr = this.ctx.sampleRate;
        const len = 4 * sr;
        const buf = this.ctx.createBuffer(1, len, sr);
        const data = buf.getChannelData(0);

        if (type === 'white_noise') {
            for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        else if (type === 'singing_bowls') {
            for (let i = 0; i < len; i++) {
                const t = i / sr;
                const f1 = 174 + Math.sin(t * 0.1) * 2;
                const f2 = f1 * 1.5;
                data[i] = (Math.sin(2 * Math.PI * f1 * t) * 0.4 + Math.sin(2 * Math.PI * f2 * t) * 0.2) * 0.3;
            }
        }

        return buf;
    }
}
