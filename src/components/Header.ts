export class Header {
  constructor(private container: HTMLElement) { }

  render(statusText: string, soundEnabled: boolean, onToggleSound: () => void, onOpenSettings: () => void) {
    this.container.innerHTML = `
      <div class="zen-header">
        <div class="left">
          <span class="logo">☯ ZenTask</span>
        </div>
        <div class="center">
          <span class="status-text">${statusText}</span>
        </div>
        <div class="right" style="display:flex;gap:4px;">
          <button id="sound-toggle" class="icon-btn" title="${soundEnabled ? 'Mute' : 'Unmute'}">${soundEnabled ? '🔊' : '🔇'}</button>
          <button id="settings-btn" class="icon-btn" title="Settings">☰</button>
        </div>
      </div>
    `;

    this.container.querySelector('#sound-toggle')?.addEventListener('click', onToggleSound);
    this.container.querySelector('#settings-btn')?.addEventListener('click', onOpenSettings);
  }
}
