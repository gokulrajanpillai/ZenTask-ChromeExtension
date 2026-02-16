import { SoundType, BreakSoundType, Settings } from '../types';

export class SoundManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private ambienceGain: GainNode | null = null;
    private cueGain: GainNode | null = null;

    private ambienceSource: AudioBufferSourceNode | null = null;
    private currentAmbienceType: string = 'none';
    private cuesEnabled = true;

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
    // Plays a rich, resonant bong (like a singing bowl strike) for all state transitions.
    async playCue(_type: 'start' | 'break' | 'resume' | 'complete') {
        if (!this.cuesEnabled) return;
        if (!this.ctx) await this.init();
        if (!this.ctx || !this.cueGain) return;

        const now = this.ctx.currentTime;

        // Fundamental
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(220, now); // A3

        // Harmonic
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, now); // A4

        // Sub-harmonic for depth
        const osc3 = this.ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(660, now); // E5

        const envelope = this.ctx.createGain();
        envelope.connect(this.cueGain);

        // Bell-like envelope: sharp attack, long natural decay
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.6, now + 0.01);  // instant attack
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

    // ── Ambience ──────────────────────────────────────────────────────
    async playAmbience(type: SoundType | BreakSoundType, volume: number) {
        if (!this.ctx) await this.init();
        if (!this.ctx || !this.ambienceGain) return;

        // Same track → just update volume
        if (this.currentAmbienceType === type && this.ambienceSource) {
            this.ambienceGain.gain.setTargetAtTime(volume / 100, this.ctx.currentTime, 0.5);
            return;
        }

        await this.stopAmbience();
        if (type === 'none') return;

        this.currentAmbienceType = type;
        this.ambienceGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.ambienceGain.gain.linearRampToValueAtTime(volume / 100, this.ctx.currentTime + 2);

        // Generate the appropriate procedural noise
        const buffer = this.generateNoise(type);
        this.ambienceSource = this.ctx.createBufferSource();
        this.ambienceSource.buffer = buffer;
        this.ambienceSource.loop = true;
        this.ambienceSource.connect(this.ambienceGain);
        this.ambienceSource.start();
    }

    async stopAmbience() {
        if (this.ambienceSource) {
            try {
                if (this.ctx && this.ambienceGain) {
                    this.ambienceGain.gain.cancelScheduledValues(this.ctx.currentTime);
                    this.ambienceGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
                }
                const old = this.ambienceSource;
                setTimeout(() => { try { old.stop(); old.disconnect(); } catch (_e) { /* noop */ } }, 600);
            } catch (_e) { /* noop */ }
            this.ambienceSource = null;
        }
        this.currentAmbienceType = 'none';
    }

    // ── Noise Generators ──────────────────────────────────────────────
    private generateNoise(type: string): AudioBuffer {
        if (!this.ctx) throw new Error('No AudioContext');

        const sr = this.ctx.sampleRate;
        const len = 4 * sr; // 4 second loop
        const buf = this.ctx.createBuffer(1, len, sr);
        const data = buf.getChannelData(0);

        switch (type) {
            case 'white_noise':
                for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
                break;

            case 'rain':
                // Rain = filtered noise bursts layered over soft brown noise base
                for (let i = 0; i < len; i++) {
                    const white = Math.random() * 2 - 1;
                    const brown = i > 0 ? (data[i - 1] + 0.02 * white) / 1.02 : white;
                    // Occasional "drop" peaks
                    const drop = Math.random() > 0.997 ? (Math.random() * 0.4) : 0;
                    data[i] = brown * 2.5 + drop;
                }
                break;

            case 'coffee_shop':
                // Low rumble + occasional mid-freq murmur bursts
                for (let i = 0; i < len; i++) {
                    const white = Math.random() * 2 - 1;
                    const brown = i > 0 ? (data[i - 1] + 0.015 * white) / 1.015 : white;
                    // Periodic "chatter" modulation
                    const mod = Math.sin(i / sr * 2 * Math.PI * 3.7) * 0.15;
                    const chatter = Math.random() > 0.99 ? (Math.random() * 0.2 - 0.1) : 0;
                    data[i] = (brown * 2.0 + mod + chatter) * 0.8;
                }
                break;

            case 'singing_bowls':
                // Slow sine sweep with harmonics — meditative drone
                for (let i = 0; i < len; i++) {
                    const t = i / sr;
                    const f1 = 174 + Math.sin(t * 0.3) * 8; // slow frequency drift
                    const f2 = f1 * 2;
                    const f3 = f1 * 3;
                    data[i] = (Math.sin(2 * Math.PI * f1 * t) * 0.5 +
                        Math.sin(2 * Math.PI * f2 * t) * 0.25 +
                        Math.sin(2 * Math.PI * f3 * t) * 0.1) * 0.6;
                }
                break;

            case 'ocean_waves':
                // Slow amplitude-modulated noise to simulate wave crests
                for (let i = 0; i < len; i++) {
                    const t = i / sr;
                    const white = Math.random() * 2 - 1;
                    const brown = i > 0 ? (data[i - 1] + 0.02 * white) / 1.02 : white;
                    // Wave envelope: slow rise and fall (~6 second cycle)
                    const wave = (Math.sin(2 * Math.PI * t / 6) + 1) / 2;
                    data[i] = brown * 3.0 * (0.2 + wave * 0.8);
                }
                break;

            case 'forest_stream':
                // Soft pink-ish noise with gentle high-frequency trickle
                for (let i = 0; i < len; i++) {
                    const white = Math.random() * 2 - 1;
                    const pink = i > 0 ? (data[i - 1] + 0.03 * white) / 1.03 : white;
                    // High-freq trickle
                    const trickle = Math.sin(i * 0.8 + Math.random() * 3) * 0.05;
                    data[i] = (pink * 2.2 + trickle) * 0.7;
                }
                break;

            default:
                // Fallback: brown noise
                for (let i = 0; i < len; i++) {
                    const w = Math.random() * 2 - 1;
                    data[i] = i > 0 ? (data[i - 1] + 0.02 * w) / 1.02 : w;
                    data[i] *= 3.5;
                }
        }

        return buf;
    }
}
