import { TimerState, AppTheme, Settings } from '../types';

export class ZenVisualizer {
    private ctx: CanvasRenderingContext2D;
    private animationId: number = 0;
    private state: TimerState | null = null;
    private settings: Settings | null = null;
    private theme: AppTheme = 'forest';
    private phase = 0;

    // Smooth Transitions
    private currentSpeedMult = 1.0;
    private currentAlphaMult = 1.0;
    private readonly TRANSITION_LERP = 0.05; // ~1.2s at 60fps

    // Advanced Particle System
    private particles: {
        x: number; y: number; r: number;
        vx: number; vy: number;
        baseDist: number; angle: number;
        life?: number; opacity?: number;
    }[] = [];

    private ripples: { x: number; y: number; r: number; life: number }[] = [];
    private mouse = { x: 0, y: 0, active: false };
    private prefersReducedMotion = false;

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.resize();
    }

    resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        this.initParticles();
    }

    start() { this.animate(); }
    stop() { cancelAnimationFrame(this.animationId); }
    updateState(s: TimerState, settings: Settings) {
        this.state = s;
        this.settings = settings;
        if (this.theme !== settings.theme) {
            this.theme = settings.theme;
            this.initParticles();
        }
    }

    updateMouse(x: number, y: number) {
        if (this.prefersReducedMotion || !this.settings?.backgroundInteractions) return;
        this.mouse.x = x;
        this.mouse.y = y;
        this.mouse.active = true;

        if (this.theme === 'rain' && Math.random() > 0.8) {
            this.ripples.push({ x, y, r: 0, life: 1.0 });
        }
    }

    private initParticles() {
        this.particles = [];
        const count = this.theme === 'space' ? 120 : 60;
        const w = this.canvas.width;
        const h = this.canvas.height;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 2.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                baseDist: Math.random() * 200 + 100,
                angle: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.4 + 0.1
            });
        }
    }

    private animate = () => {
        this.render();
        this.animationId = requestAnimationFrame(this.animate);
    };

    private render() {
        if (!this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        this.ctx.clearRect(0, 0, w, h);

        const palettes: Record<AppTheme, { r: number, g: number, b: number }> = {
            'forest': { r: 90, g: 180, b: 110 },
            'rain': { r: 100, g: 170, b: 230 },
            'summer': { r: 240, g: 190, b: 100 },
            'space': { r: 150, g: 100, b: 240 }
        };

        const themeColor = palettes[this.theme];
        let targetSpeedMult = 1.0;
        let targetAlphaMult = 1.0;

        if (this.state?.isRunning) {
            targetSpeedMult = this.state.mode === 'focus' ? 1.4 : 0.7;
            targetAlphaMult = this.state.mode === 'focus' ? 1.3 : 0.6;
        }

        // Apply Transition Lerp
        if (this.settings?.backgroundTransitions) {
            this.currentSpeedMult += (targetSpeedMult - this.currentSpeedMult) * this.TRANSITION_LERP;
            this.currentAlphaMult += (targetAlphaMult - this.currentAlphaMult) * this.TRANSITION_LERP;
        } else {
            this.currentSpeedMult = targetSpeedMult;
            this.currentAlphaMult = targetAlphaMult;
        }

        const effSpeed = 0.012 * this.currentSpeedMult;
        if (!this.prefersReducedMotion) this.phase += effSpeed;

        // ── Theme Specific Background Layer ──
        this.drawCore(w, h, themeColor, this.currentAlphaMult);

        // ── Ripple FX (Rain) ──
        if (this.theme === 'rain') {
            this.ripples = this.ripples.filter(r => r.life > 0);
            this.ripples.forEach(r => {
                r.r += 3;
                r.life -= 0.015;
                this.ctx.strokeStyle = `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${r.life * 0.3})`;
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
                this.ctx.stroke();
            });
        }

        // ── Interaction Logic ──
        const interact = this.settings?.backgroundInteractions && !this.prefersReducedMotion;

        this.particles.forEach(p => {
            // Base Movement
            p.x += p.vx * this.currentSpeedMult;
            p.y += p.vy * this.currentSpeedMult;

            // Wrapping
            if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

            let drawX = p.x;
            let drawY = p.y;

            if (interact) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (this.theme === 'space') {
                    if (dist < 200) {
                        const force = (200 - dist) * 0.04;
                        drawX -= dx / dist * force;
                        drawY -= dy / dist * force;
                    }
                } else if (this.theme === 'forest' || this.theme === 'rain') {
                    // Subtle parallax
                    drawX += (this.mouse.x - cx) * 0.01 * p.r;
                    drawY += (this.mouse.y - cy) * 0.01 * p.r;
                } else if (this.theme === 'summer') {
                    if (dist < 150) {
                        p.vx += (Math.random() - 0.5) * 0.05;
                        p.vy -= 0.03;
                    }
                }
            }

            // Render Particle
            const alpha = (p.opacity || 0.5) * this.currentAlphaMult;
            this.ctx.fillStyle = `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY, p.r, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    private drawCore(w: number, h: number, color: { r: number, g: number, b: number }, alphaMult: number) {
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.max(w, h) * 0.8;
        const ox = this.mouse.active ? (this.mouse.x - cx) * 0.03 : 0;
        const oy = this.mouse.active ? (this.mouse.y - cy) * 0.03 : 0;

        const grad = this.ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, radius);
        grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.12 * alphaMult})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);
    }
}
