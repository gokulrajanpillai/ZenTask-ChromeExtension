import { TimerState } from '../types';
import { ZenVisualizer } from './ZenVisualizer';

export class TimerDisplay {
  private visualizer: ZenVisualizer | null = null;

  constructor(private container: HTMLElement) { }

  render(state: TimerState, onStart: () => void, onPause: () => void, onSkip: () => void) {
    const minutes = Math.floor(state.remainingSeconds / 60).toString().padStart(2, '0');
    const seconds = (state.remainingSeconds % 60).toString().padStart(2, '0');

    // Only full re-render if structure changes (start/stop) to avoid canvas churn
    // For now, simpler approach: check if container has content
    if (!this.container.innerHTML) {
      this.container.innerHTML = `
              <div class="timer-container">
                <!-- Visualizer Background -->
                <canvas id="zen-visualizer" width="300" height="300" style="position: absolute; top:0; left:0; z-index:0; border-radius: 50%;"></canvas>
                
                <!-- Time & Controls Overlay -->
                <div style="z-index: 1; text-align: center; display: flex; flex-direction: column; align-items: center;">
                    <div class="timer-time" id="time-display">${minutes}:${seconds}</div>
                    
                    <div class="timer-controls">
                        <button id="main-action-btn" class="btn-primary">
                            ${state.isRunning ? 'Pause' : 'Start Focus'}
                        </button>
                        <button id="skip-btn" class="btn-secondary" style="padding: 12px;">
                            ⏭
                        </button>
                    </div>

                    <div class="status-indicator" style="margin-top: 30px; opacity: 0.8">
                         ${this.getStatusText(state)}
                    </div>
                </div>
              </div>
            `;

      // Init Visualizer
      const canvas = this.container.querySelector('canvas');
      if (canvas) {
        this.visualizer = new ZenVisualizer(canvas);
        this.visualizer.start();
      }

      // Bind events
      this.bindEvents(onStart, onPause, onSkip, state.isRunning);
    } else {
      // Update Text
      const timeDisplay = this.container.querySelector('#time-display');
      if (timeDisplay) timeDisplay.textContent = `${minutes}:${seconds}`;

      // Update Status
      const statusInd = this.container.querySelector('.status-indicator');
      if (statusInd) statusInd.textContent = this.getStatusText(state);

      // Update Button State if changed
      // simpler to re-bind if isRunning flip
      const btn = this.container.querySelector('#main-action-btn');
      if (btn) {
        const currentText = btn.textContent?.trim();
        const validText = state.isRunning ? 'Pause' : 'Start Focus';
        if (currentText !== validText) {
          btn.textContent = validText;
          // Rebind necessary? No, just closure toggle in bindEvents? 
          // Actually better to replace node or re-render if state flips significantly
          // For stability let's re-render controls if running state changes
          this.rebindMainAction(btn as HTMLButtonElement, onStart, onPause, state.isRunning);
        }
      }
    }

    // Update Visualizer
    if (this.visualizer) {
      this.visualizer.updateState(state);
    }
  }

  private getStatusText(state: TimerState): string {
    if (state.mode === 'focus') return `Focus Cycle ${state.cyclesCompleted + 1}`;
    if (state.mode === 'break') return 'Short Break';
    if (state.mode === 'longBreak') return 'Long Rest';
    return 'Ready';
  }

  private bindEvents(onStart: () => void, onPause: () => void, onSkip: () => void, isRunning: boolean) {
    const btn = this.container.querySelector('#main-action-btn') as HTMLButtonElement;
    const skipRequest = () => onSkip();

    this.rebindMainAction(btn, onStart, onPause, isRunning);
    this.container.querySelector('#skip-btn')?.addEventListener('click', skipRequest);
  }

  private rebindMainAction(btn: HTMLButtonElement, onStart: () => void, onPause: () => void, isRunning: boolean) {
    // Clone to wipe listeners
    const newBtn = btn.cloneNode(true) as HTMLButtonElement;
    btn.parentNode?.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      if (isRunning) onPause();
      else onStart();
    });
  }
}
