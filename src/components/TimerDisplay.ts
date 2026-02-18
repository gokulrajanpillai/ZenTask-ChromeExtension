import { TimerState } from '../types';

export class TimerDisplay {
  constructor(private container: HTMLElement) { }

  render(state: TimerState, onStart: () => void, onPause: () => void, onSkip: () => void, onViewClick: () => void) {
    const minutes = Math.floor(state.remainingSeconds / 60).toString().padStart(2, '0');
    const seconds = (state.remainingSeconds % 60).toString().padStart(2, '0');

    if (!this.container.querySelector('.timer-container')) {
      this.container.innerHTML = `
        <div class="timer-container" style="position:relative; width:300px; height:300px; cursor: pointer;">
          <div style="position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
            <div class="timer-time" id="time-display">${minutes}:${seconds}</div>

            <div class="timer-controls">
              <button id="main-action-btn" class="btn-primary ${state.isRunning ? 'btn-pause' : ''}">
                ${state.isRunning ? 'Pause' : 'Start Focus'}
              </button>
              <button id="skip-btn" class="btn-secondary" style="padding:10px 14px;">⏭</button>
            </div>

            <div class="status-indicator" id="status-text">${this.getStatusText(state)}</div>
          </div>
        </div>
      `;

      this.container.querySelector('.timer-container')?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName.toLowerCase() !== 'button') {
          onViewClick();
        }
      });

    } else {
      const timeEl = this.container.querySelector('#time-display');
      if (timeEl) {
        timeEl.textContent = `${minutes}:${seconds}`;
        timeEl.classList.remove('focus-glow', 'break-glow');
        if (state.isRunning && state.mode === 'focus') timeEl.classList.add('focus-glow');
        else if (state.isRunning) timeEl.classList.add('break-glow');
      }

      const statusEl = this.container.querySelector('#status-text');
      if (statusEl) statusEl.textContent = this.getStatusText(state);
    }

    this.bindButton('#main-action-btn', state.isRunning ? 'Pause' : 'Start Focus',
      (e) => { e.stopPropagation(); state.isRunning ? onPause() : onStart(); });
    this.bindButton('#skip-btn', undefined, (e) => { e.stopPropagation(); onSkip(); });
  }

  private getStatusText(state: TimerState): string {
    if (state.mode === 'focus') return `Focus · Cycle ${state.cyclesCompleted + 1}`;
    if (state.mode === 'break') return 'Short Break';
    if (state.mode === 'longBreak') return 'Long Rest';
    return 'Ready';
  }

  private bindButton(selector: string, label: string | undefined, handler: (e: Event) => void) {
    const btn = this.container.querySelector(selector) as HTMLButtonElement;
    if (!btn) return;
    if (label !== undefined) btn.textContent = label;
    const fresh = btn.cloneNode(true) as HTMLButtonElement;
    btn.parentNode?.replaceChild(fresh, btn);
    fresh.addEventListener('click', handler);
  }
}
