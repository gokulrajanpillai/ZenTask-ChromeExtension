import { StorageService } from '../services/storage';
import { Settings } from '../types';

let activePanel: SettingsPanel | null = null;

export class SettingsPanel {
  private overlay: HTMLElement;
  private panel: HTMLElement;
  private settings: Settings | null = null;
  private onClose: () => void;
  private saveTimeout: any = null;

  constructor(onClose: () => void) {
    if (activePanel) activePanel.close();
    activePanel = this;
    this.onClose = onClose;

    this.overlay = document.createElement('div');
    this.overlay.className = 'settings-overlay';

    this.panel = document.createElement('div');
    this.panel.className = 'settings-panel';
  }

  async open() {
    this.settings = await StorageService.getSettings();
    if (!this.settings) return;

    this.panel.innerHTML = `
      <div class="settings-panel-header">
        <h2>Settings</h2>
        <button class="settings-close-btn">✕</button>
      </div>
      <div class="settings-body">
        <div class="settings-group">
          <h3>Timer</h3>
          <div class="setting-item">
            <label>Focus (min)</label>
            <input type="number" id="s-focus" value="${this.settings.focusDuration}" min="1" max="120">
          </div>
          <div class="setting-item">
            <label>Short break (min)</label>
            <input type="number" id="s-break" value="${this.settings.breakDuration}" min="1" max="30">
          </div>
          <div class="setting-item">
            <label>Long break (min)</label>
            <input type="number" id="s-long" value="${this.settings.longBreakDuration}" min="5" max="60">
          </div>
          <div class="setting-item">
            <label>Cycles before long break</label>
            <input type="number" id="s-cycles" value="${this.settings.cyclesBeforeLongBreak || 4}" min="1" max="10">
          </div>
        </div>

        <div class="settings-group">
          <h3>Themed Experience</h3>
          <p>Visuals and sounds for your focus</p>
          <div class="setting-item">
            <label>Theme</label>
            <select id="s-theme">
              <option value="forest" ${this.settings.theme === 'forest' ? 'selected' : ''}>Forest Lore</option>
              <option value="rain" ${this.settings.theme === 'rain' ? 'selected' : ''}>Rainy Desktop</option>
              <option value="summer" ${this.settings.theme === 'summer' ? 'selected' : ''}>Eternal Summer</option>
              <option value="space" ${this.settings.theme === 'space' ? 'selected' : ''}>Deep Space</option>
            </select>
          </div>
        </div>

        <div class="settings-group">
          <h3>Audio</h3>
          <div class="setting-item">
            <label>Enable sounds</label>
            <input type="checkbox" id="s-enable" ${this.settings.enableSound ? 'checked' : ''}>
          </div>
          <div class="setting-item">
            <label>Master volume</label>
            <input type="range" id="s-master" min="0" max="100" value="${this.settings.masterVolume || 80}">
          </div>
          <div class="setting-item">
            <label>Transition cues</label>
            <input type="checkbox" id="s-cues" ${this.settings.enableCues !== false ? 'checked' : ''}>
          </div>
        </div>

        <div class="settings-group">
          <h3>Behavior</h3>
          <div class="setting-item">
            <label>Return to task list on break</label>
            <input type="checkbox" id="s-auto-return" ${this.settings.autoReturnToListOnBreak ? 'checked' : ''}>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);

    requestAnimationFrame(() => {
      this.overlay.classList.add('visible');
      this.panel.classList.add('open');
    });

    // Event handlers
    this.panel.querySelector('.settings-close-btn')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', () => this.close());

    // Auto-save on any change
    const inputs = this.panel.querySelectorAll('input, select');
    inputs.forEach(el => {
      el.addEventListener('input', () => this.handleInput());
      el.addEventListener('change', () => this.handleInput());
    });
  }

  close() {
    this.panel.classList.remove('open');
    this.overlay.classList.remove('visible');
    setTimeout(() => {
      this.overlay.remove();
      this.panel.remove();
      if (activePanel === this) activePanel = null;
      // IMPORTANT: Call onClose to trigger refresh in index.ts
      this.onClose();
    }, 350);
  }

  private handleInput() {
    // Debounce save to avoid thrashing storage
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.save(), 500);
  }

  private async save() {
    if (!this.settings) return;

    const val = (id: string) => (this.panel.querySelector(id) as HTMLInputElement)?.value ?? '';
    const checked = (id: string) => (this.panel.querySelector(id) as HTMLInputElement)?.checked ?? false;

    const newSettings: Settings = {
      ...this.settings,
      focusDuration: parseInt(val('#s-focus')) || 25,
      breakDuration: parseInt(val('#s-break')) || 5,
      longBreakDuration: parseInt(val('#s-long')) || 15,
      cyclesBeforeLongBreak: parseInt(val('#s-cycles')) || 4,
      theme: val('#s-theme') as any,
      enableSound: checked('#s-enable'),
      enableCues: checked('#s-cues'),
      masterVolume: parseInt(val('#s-master')) || 80,
      autoReturnToListOnBreak: checked('#s-auto-return'),
    };

    // Save
    await StorageService.saveSettings(newSettings);
    // We do NOT call onClose here because we want to keep the panel open while editing.
    // But we DO want to apply the settings live (audio).
    // Since saving to storage triggers nothing by default, we rely on the fact that
    // when the user closes, onClose() calls 'refresh()'.
    // BUT, for immediate audio feedback (volume sliders), we might want to notify.
    // Implementation detail: StorageService has an onChange listener we could use,
    // but for now, let's keep it simple. Index.ts refreshes on close.
    // If we want LIVE audio changes, we'd need to trigger a message.
    // Let's rely on 'close' for full refresh, but maybe we can just live with it for now.
  }
}

export { SettingsPanel as SettingsModal };
