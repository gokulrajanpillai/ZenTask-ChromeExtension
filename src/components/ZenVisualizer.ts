import { TimerState, AppTheme } from '../types';

export class ZenVisualizer {
    private ctx: CanvasRenderingContext2D;
    private animationId: number = 0;
    private state: TimerState | null = null;
    private theme: AppTheme = 'forest';
    private phase = 0;
    private particles: { x: number; y: number; r: number; speed: number; angle: number; dist: number; color?: string }[] = [];
    private mouse = { x: 0, y: 0, active: false };
    private prefersReducedMotion = false;

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.initParticles();
    }

    start() { this.animate(); }
    stop() { cancelAnimationFrame(this.animationId); }
    updateState(s: TimerState, theme: AppTheme) {
        this.state = s;
        if (this.theme !== theme) {
            this.theme = theme;
            this.initParticles(); // Re-init for theme colors
        }
    }
    updateMouse(x: number, y: number) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.mouse.active = true;
    }

    private initParticles() {
        this.particles = [];
        const count = this.theme === 'space' ? 60 : 30;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: 0, y: 0,
                r: Math.random() * 1.8 + 0.4,
                speed: Math.random() * 0.3 + 0.05,
                angle: Math.random() * Math.PI * 2,
                dist: Math.random() * 80 + 30,
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

        // ── Theme Palettes ──
        const palettes: Record<AppTheme, { r: number, g: number, b: number }> = {
            'forest': { r: 94, g: 190, b: 120 }, // Verdant Green
            'rain': { r: 94, g: 170, b: 239 },   // Azure Blue
            'summer': { r: 239, g: 190, b: 94 }, // Golden Sun
            'space': { r: 160, g: 120, b: 239 }  // Deep Nebula
        };

        const themeColor = palettes[this.theme];
        let speed = 0.015;
        let coreAlpha = 0.1;
        let particleAlpha = 0.15;

        if (this.state) {
            if (this.state.isRunning) {
                speed = this.state.mode === 'focus' ? 0.04 : 0.012;
                coreAlpha = this.state.mode === 'focus' ? 0.2 : 0.08;
                particleAlpha = this.state.mode === 'focus' ? 0.3 : 0.12;
            }
        }

        if (this.prefersReducedMotion) speed = 0;
        this.phase += speed;

        // ── Mouse Influence ──
        let ox = 0, oy = 0;
        if (this.mouse.active) {
            // Parallax shift based on mouse relative to center
            ox = (this.mouse.x - cx) * 0.05;
            oy = (this.mouse.y - cy) * 0.05;
        }

        const r = 90 + Math.sin(this.phase) * 12;

        // Outer glow
        const outerGrad = this.ctx.createRadialGradient(cx + ox, cy + oy, r * 0.2, cx + ox, cy + oy, r * 2.0);
        outerGrad.addColorStop(0, `rgba(${themeColor.r},${themeColor.g},${themeColor.b},${coreAlpha})`);
        outerGrad.addColorStop(0.7, `rgba(${themeColor.r},${themeColor.g},${themeColor.b},${coreAlpha * 0.2})`);
        outerGrad.addColorStop(1, 'rgba(0,0,0,0)');

        this.ctx.fillStyle = outerGrad;
        this.ctx.beginPath();
        this.ctx.arc(cx + ox, cy + oy, r * 2.0, 0, Math.PI * 2);
        this.ctx.fill();

        // ── Particles ──
        if (!this.prefersReducedMotion) {
            this.particles.forEach(p => {
                p.angle += p.speed * speed;
                const orbit = r + p.dist + Math.sin(this.phase + p.angle * 2) * 10;

                // Base orbit position
                let px = cx + Math.cos(p.angle) * orbit;
                let py = cy + Math.sin(p.angle) * orbit;

                // Mouse interaction for particles: gentle attraction/repulsion
                if (this.mouse.active) {
                    const dx = this.mouse.x - px;
                    const dy = this.mouse.y - py;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 100) {
                        const force = (100 - d) * 0.02;
                        px += dx * force;
                        py += dy * force;
                    }
                }

                // Distance fade
                const distToCenter = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2));
                const fade = Math.max(0, 1 - distToCenter / (r * 2.8));

                this.ctx.fillStyle = `rgba(${themeColor.r},${themeColor.g},${themeColor.b},${particleAlpha * fade})`;
                this.ctx.beginPath();
                this.ctx.arc(px, py, p.r, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
    }
}
