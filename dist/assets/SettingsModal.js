var c=Object.defineProperty;var u=(s,e,t)=>e in s?c(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var i=(s,e,t)=>u(s,typeof e!="symbol"?e+"":e,t);import{S as r}from"./storage.js";let a=null;class v{constructor(e){i(this,"overlay");i(this,"panel");i(this,"settings",null);i(this,"onClose");i(this,"saveTimeout",null);a&&a.close(),a=this,this.onClose=e,this.overlay=document.createElement("div"),this.overlay.className="settings-overlay",this.panel=document.createElement("div"),this.panel.className="settings-panel"}async open(){var t;if(this.settings=await r.getSettings(),!this.settings)return;this.panel.innerHTML=`
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
            <input type="number" id="s-cycles" value="${this.settings.cyclesBeforeLongBreak||4}" min="1" max="10">
          </div>
        </div>

        <div class="settings-group">
          <h3>Themed Experience</h3>
          <p>Visuals and sounds for your focus</p>
          <div class="setting-item">
            <label>Theme</label>
            <select id="s-theme">
              <option value="forest" ${this.settings.theme==="forest"?"selected":""}>Forest Lore</option>
              <option value="rain" ${this.settings.theme==="rain"?"selected":""}>Rainy Desktop</option>
              <option value="summer" ${this.settings.theme==="summer"?"selected":""}>Eternal Summer</option>
              <option value="space" ${this.settings.theme==="space"?"selected":""}>Deep Space</option>
            </select>
          </div>
        </div>

        <div class="settings-group">
          <h3>Audio</h3>
          <div class="setting-item">
            <label>Enable sounds</label>
            <input type="checkbox" id="s-enable" ${this.settings.enableSound?"checked":""}>
          </div>
          <div class="setting-item">
            <label>Master volume</label>
            <input type="range" id="s-master" min="0" max="100" value="${this.settings.masterVolume||80}">
          </div>
          <div class="setting-item">
            <label>Transition cues</label>
            <input type="checkbox" id="s-cues" ${this.settings.enableCues!==!1?"checked":""}>
          </div>
        </div>

        <div class="settings-group">
          <h3>Behavior</h3>
          <div class="setting-item">
            <label>Return to task list on break</label>
            <input type="checkbox" id="s-auto-return" ${this.settings.autoReturnToListOnBreak?"checked":""}>
          </div>
        </div>
      </div>
    `,document.body.appendChild(this.overlay),document.body.appendChild(this.panel),requestAnimationFrame(()=>{this.overlay.classList.add("visible"),this.panel.classList.add("open")}),(t=this.panel.querySelector(".settings-close-btn"))==null||t.addEventListener("click",()=>this.close()),this.overlay.addEventListener("click",()=>this.close()),this.panel.querySelectorAll("input, select").forEach(l=>{l.addEventListener("input",()=>this.handleInput()),l.addEventListener("change",()=>this.handleInput())})}close(){this.panel.classList.remove("open"),this.overlay.classList.remove("visible"),setTimeout(()=>{this.overlay.remove(),this.panel.remove(),a===this&&(a=null),this.onClose()},350)}handleInput(){this.saveTimeout&&clearTimeout(this.saveTimeout),this.saveTimeout=setTimeout(()=>this.save(),500)}async save(){if(!this.settings)return;const e=o=>{var n;return((n=this.panel.querySelector(o))==null?void 0:n.value)??""},t=o=>{var n;return((n=this.panel.querySelector(o))==null?void 0:n.checked)??!1},l={...this.settings,focusDuration:parseInt(e("#s-focus"))||25,breakDuration:parseInt(e("#s-break"))||5,longBreakDuration:parseInt(e("#s-long"))||15,cyclesBeforeLongBreak:parseInt(e("#s-cycles"))||4,theme:e("#s-theme"),enableSound:t("#s-enable"),enableCues:t("#s-cues"),masterVolume:parseInt(e("#s-master"))||80,autoReturnToListOnBreak:t("#s-auto-return")};await r.saveSettings(l)}}export{v as SettingsModal,v as SettingsPanel};
