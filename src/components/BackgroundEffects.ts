export class BackgroundEffects {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: Particle[] = [];
    private animationFrameId: number | null = null;
    private currentTheme: string = 'scandinavian';

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    public setTheme(theme: string) {
        this.currentTheme = theme;
        this.initParticles();
    }

    private resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initParticles();
    }

    private initParticles() {
        this.particles = [];
        const count = 30; // Subtle density
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height, this.currentTheme));
        }
    }

    public start() {
        if (!this.animationFrameId) {
            this.animate();
        }
    }

    public stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    private animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.update(this.canvas.width, this.canvas.height);
            p.draw(this.ctx);
        });

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    private x: number;
    private y: number;
    private size: number;
    private vx: number;
    private vy: number;
    private opacity: number;
    private color: string;

    constructor(width: number, height: number, theme: string) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.3 + 0.1;

        // Theme specific particle colors
        switch (theme) {
            case 'warm':
                this.color = `rgba(212, 163, 115, ${this.opacity})`; // Terracotta/Sand
                break;
            case 'scandinavian':
            default:
                this.color = `rgba(163, 196, 188, ${this.opacity})`; // Seafoam
                break;
        }
    }

    update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}
