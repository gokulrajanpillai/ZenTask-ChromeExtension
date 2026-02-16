import { TimerState } from '../types';

export class ZenVisualizer {
    private ctx: CanvasRenderingContext2D;
    private animationId: number = 0;
    private state: TimerState | null = null;

    // Animation vars
    private phase = 0;
    private particles: { x: number, y: number, r: number, speed: number, angle: number }[] = [];

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.initParticles();
    }

    start() {
        this.animate();
    }

    stop() {
        cancelAnimationFrame(this.animationId);
    }

    updateState(newState: TimerState) {
        this.state = newState;
    }

    private initParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * 300,
                y: Math.random() * 300,
                r: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    private animate = () => {
        this.render();
        this.animationId = requestAnimationFrame(this.animate);
    }

    private render() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        this.ctx.clearRect(0, 0, w, h);

        // Determine Speed based on state
        let speed = 0.02; // Idle
        let baseColor = 'rgba(212, 163, 115, 0.1)'; // Primary dim

        if (this.state) {
            if (this.state.mode === 'focus' && this.state.isRunning) {
                speed = 0.05; // Faster breathing
                baseColor = 'rgba(212, 163, 115, 0.2)';
            } else if (this.state.mode === 'break') {
                speed = 0.015; // Slow breathing
                baseColor = 'rgba(141, 163, 153, 0.2)';
            }
        }

        this.phase += speed;

        // Draw breathing circle
        // Radius oscillates
        const baseR = 100;
        const breathe = Math.sin(this.phase) * 10;
        const r = baseR + breathe;

        // Gradient
        const grad = this.ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();

        // Particles
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        this.particles.forEach(p => {
            p.angle += speed * 0.5;
            p.x = cx + Math.cos(p.angle) * (r + p.r * 10);
            p.y = cy + Math.sin(p.angle) * (r + p.r * 10);

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}
