export class QuickGrid {
    constructor(private container: HTMLElement) {
        this.render();
    }

    public render() {
        const scratchpadContent = localStorage.getItem('zen_scratchpad') || '';

        this.container.innerHTML = `
            <div class="quick-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); max-width: 600px; margin: 0 auto;">
                <!-- Scratchpad -->
                <div class="card p-4" style="height: 180px; display: flex; flex-direction: column;">
                    <div class="text-xs text-muted mb-2 font-medium uppercase tracking-tighter">Scratchpad</div>
                    <textarea id="scratchpad" class="w-full grow" style="background: transparent; border: none; resize: none; outline: none; font-size: 0.9rem;" placeholder="Quick thoughts...">${scratchpadContent}</textarea>
                </div>

                <!-- Quick Links -->
                <div class="card p-4" style="height: 180px;">
                    <div class="text-xs text-muted mb-4 font-medium uppercase tracking-tighter">Daily Tools</div>
                    <div class="flex-col gap-2">
                        <a href="https://calendar.google.com" target="_blank" class="text-sm hover:text-main block">Calendar</a>
                        <a href="https://mail.google.com" target="_blank" class="text-sm hover:text-main block">Mail</a>
                        <a href="https://github.com" target="_blank" class="text-sm hover:text-main block">GitHub</a>
                        <a href="https://linear.app" target="_blank" class="text-sm hover:text-main block">Linear</a>
                    </div>
                </div>

                <!-- Breathe -->
                <div class="card p-4 flex-center flex-col" style="height: 120px; cursor: pointer;" id="breathe-trigger">
                    <div class="text-xs text-muted mb-2 font-medium uppercase tracking-tighter">Breathe</div>
                    <div style="font-size: 1.5rem;">🌬️</div>
                </div>

                <!-- Quote -->
                <div class="card p-4 flex-center flex-col text-center" style="height: 120px;">
                    <div class="text-xs text-muted mb-2 font-medium uppercase tracking-tighter">Wisdom</div>
                    <div class="text-xs italic text-muted" style="line-height: 1.4;">"Do one thing at a time, and do it well."</div>
                </div>
            </div>
        `;

        // Event Listeners
        const textarea = this.container.querySelector('#scratchpad') as HTMLTextAreaElement;
        textarea?.addEventListener('input', (e) => {
            localStorage.setItem('zen_scratchpad', (e.target as HTMLTextAreaElement).value);
        });

        this.container.querySelector('#breathe-trigger')?.addEventListener('click', () => {
            this.showBreatheModal();
        });
    }

    private showBreatheModal() {
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay visible';
        overlay.style.zIndex = '2000';

        const modal = document.createElement('div');
        modal.className = 'card p-8 flex-center flex-col animate-fade-in';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.zIndex = '2001';
        modal.style.width = '300px';

        modal.innerHTML = `
            <div class="display-small mb-4 text-center" id="breathe-text">Prepare...</div>
            <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--color-primary); opacity: 0.2; transition: all 4s ease-in-out;" id="breathe-circle"></div>
            <button class="mt-8 text-xs text-muted uppercase tracking-widest" id="close-breathe">Exit</button>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        let breathing = true;
        const circle = modal.querySelector('#breathe-circle') as HTMLElement;
        const text = modal.querySelector('#breathe-text') as HTMLElement;

        const cycle = () => {
            if (!breathing) return;
            text.textContent = 'Inhale';
            circle.style.transform = 'scale(2)';
            circle.style.opacity = '0.5';
            setTimeout(() => {
                if (!breathing) return;
                text.textContent = 'Exhale';
                circle.style.transform = 'scale(1)';
                circle.style.opacity = '0.2';
                setTimeout(cycle, 4000);
            }, 4000);
        };
        cycle();

        modal.querySelector('#close-breathe')?.addEventListener('click', () => {
            breathing = false;
            overlay.remove();
            modal.remove();
        });
    }
}
