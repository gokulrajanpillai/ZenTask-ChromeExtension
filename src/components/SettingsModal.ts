import { StorageService } from '../services/storage';
import { Settings } from '../types';

let activePanel: SettingsPanel | null = null;

export class SettingsPanel {
  private overlay: HTMLElement;
  private panel: HTMLElement;
  private settings: Settings | null = null;
  private onClose: () => void;

  constructor(onClose: () => void) {
    // Singleton: destroy any existing panel first
    if (activePanel) {
      activePanel.close();
    }
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
                    <h3>Focus Sounds</h3>
                    <p style="font-size:0.8rem;color:var(--zen-text-muted);margin-bottom:10px;">
                        Background noise while you work
                    </p>
                    <div class="setting-item">
                        <label>Sound</label>
                        <select id="s-focus-sound">
                            <option value="none" ${this.settings.focusSound === 'none' ? 'selected' : ''}>None</option>
                            <option value="white_noise" ${this.settings.focusSound === 'white_noise' ? 'selected' : ''}>White Noise</option>
                            <option value="rain" ${this.settings.focusSound === 'rain' ? 'selected' : ''}>Gentle Rain</option>
                            <option value="coffee_shop" ${this.settings.focusSound === 'coffee_shop' ? 'selected' : ''}>Coffee Shop</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Volume</label>
                        <input type="range" id="s-focus-vol" min="0" max="100" value="${this.settings.focusVolume || 60}">
                    </div>
                </div>

                <div class="settings-group">
                    <h3>Break Sounds</h3>
                    <p style="font-size:0.8rem;color:var(--zen-text-muted);margin-bottom:10px;">
                        Meditative music during breaks
                    </p>
                    <div class="setting-item">
                        <label>Sound</label>
                        <select id="s-break-sound">
                            <option value="none" ${this.settings.breakSound === 'none' ? 'selected' : ''}>None</option>
                            <option value="singing_bowls" ${this.settings.breakSound === 'singing_bowls' ? 'selected' : ''}>Singing Bowls</option>
                            <option value="ocean_waves" ${this.settings.breakSound === 'ocean_waves' ? 'selected' : ''}>Ocean Waves</option>
                            <option value="forest_stream" ${this.settings.breakSound === 'forest_stream' ? 'selected' : ''}>Forest Stream</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Volume</label>
                        <input type="range" id="s-break-vol" min="0" max="100" value="${this.settings.breakVolume || 60}">
                    </div>
                </div>

                <div class="settings-group">
                    <h3>General Audio</h3>
                    <div class="setting-item">
                        <label>Enable sounds</label>
                        <input type="checkbox" id="s-enable" ${this.settings.enableSound ? 'checked' : ''}>
                    </div>
                    <div class="setting-item">
                        <label>Transition bong</label>
                        <input type="checkbox" id="s-cues" ${this.settings.enableCues !== false ? 'checked' : ''}>
                    </div>
                    <div class="setting-item">
                        <label>Master volume</label>
                        <input type="range" id="s-master" min="0" max="100" value="${this.settings.masterVolume || 80}">
                    </div>
                </div>
            </div>
            <div class="settings-footer">
                <button class="btn-primary" id="s-save" style="width:100%;">Save</button>
            </div>
        `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.panel);

    // Animate in
    requestAnimationFrame(() => {
      this.overlay.classList.add('visible');
      this.panel.classList.add('open');
    });

    // Bindings
    this.panel.querySelector('.settings-close-btn')?.addEventListener('click', () => this.close());
    this.panel.querySelector('#s-save')?.addEventListener('click', () => this.save());
    this.overlay.addEventListener('click', () => this.close());
  }

  close() {
    this.panel.classList.remove('open');
    this.overlay.classList.remove('visible');
    setTimeout(() => {
      this.overlay.remove();
      this.panel.remove();
      if (activePanel === this) activePanel = null;
      this.onClose();
    }, 350);
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
      enableSound: checked('#s-enable'),
      enableCues: checked('#s-cues'),
      focusSound: val('#s-focus-sound') as any,
      focusVolume: parseInt(val('#s-focus-vol')) || 60,
      breakSound: val('#s-break-sound') as any,
      breakVolume: parseInt(val('#s-break-vol')) || 60,
      masterVolume: parseInt(val('#s-master')) || 80,
    };

    await StorageService.saveSettings(newSettings);
    this.close();
  }
}

// Keep the old export name for backward compatibility with dynamic import
export { SettingsPanel as SettingsModal };
