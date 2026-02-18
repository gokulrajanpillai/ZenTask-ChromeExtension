export class Footer {
    private currentReminder: string = '';
    private lastChangeTime: number = 0;

    constructor(private container: HTMLElement) { }

    render(isBreak: boolean) {
        if (!isBreak) {
            this.container.innerHTML = '';
            this.currentReminder = '';
            return;
        }

        const now = Date.now();
        // Only change reminder every 2.5 seconds minimum
        if (this.currentReminder && (now - this.lastChangeTime) < 2500) {
            return; // keep current message
        }

        const reminders = [
            'Stretch your neck and shoulders',
            'Close your eyes for 20 seconds',
            'Drink some water',
            'Take a deep breath'
        ];

        // Pick a different one than current
        let next = reminders[Math.floor(Math.random() * reminders.length)];
        if (next === this.currentReminder && reminders.length > 1) {
            next = reminders[(reminders.indexOf(next) + 1) % reminders.length];
        }

        this.currentReminder = next;
        this.lastChangeTime = now;

        this.container.innerHTML = `
      <div class="zen-footer-reminder fade-in">
        <span class="reminder-icon">🍃</span>
        <span class="reminder-text">${next}</span>
      </div>
    `;
    }
}
