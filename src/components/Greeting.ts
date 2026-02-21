export class Greeting {
    constructor(private container: HTMLElement) {
        this.render();
    }

    private render() {
        const hour = new Date().getHours();
        let salute = 'Good morning';
        if (hour >= 12 && hour < 17) salute = 'Good afternoon';
        else if (hour >= 17) salute = 'Good evening';

        this.container.innerHTML = `
            <div class="greeting-container text-center animate-fade-in">
                <h1 class="text-2xl font-light tracking-wide text-muted" style="opacity: 0.8;">${salute}</h1>
            </div>
        `;
    }
}
