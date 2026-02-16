var c=Object.defineProperty;var u=(t,e,s)=>e in t?c(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var n=(t,e,s)=>u(t,typeof e!="symbol"?e+"":e,s);import{S as l}from"./storage.js";let o=null;class g{constructor(e){n(this,"overlay");n(this,"panel");n(this,"settings",null);n(this,"onClose");o&&o.close(),o=this,this.onClose=e,this.overlay=document.createElement("div"),this.overlay.className="settings-overlay",this.panel=document.createElement("div"),this.panel.className="settings-panel"}async open(){var e,s;this.settings=await l.getSettings(),this.settings&&(this.panel.innerHTML=`
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
                    <h3>Focus Sounds</h3>
                    <p style="font-size:0.8rem;color:var(--zen-text-muted);margin-bottom:10px;">
                        Background noise while you work
                    </p>
                    <div class="setting-item">
                        <label>Sound</label>
                        <select id="s-focus-sound">
                            <option value="none" ${this.settings.focusSound==="none"?"selected":""}>None</option>
                            <option value="white_noise" ${this.settings.focusSound==="white_noise"?"selected":""}>White Noise</option>
                            <option value="rain" ${this.settings.focusSound==="rain"?"selected":""}>Gentle Rain</option>
                            <option value="coffee_shop" ${this.settings.focusSound==="coffee_shop"?"selected":""}>Coffee Shop</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Volume</label>
                        <input type="range" id="s-focus-vol" min="0" max="100" value="${this.settings.focusVolume||60}">
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
                            <option value="none" ${this.settings.breakSound==="none"?"selected":""}>None</option>
                            <option value="singing_bowls" ${this.settings.breakSound==="singing_bowls"?"selected":""}>Singing Bowls</option>
                            <option value="ocean_waves" ${this.settings.breakSound==="ocean_waves"?"selected":""}>Ocean Waves</option>
                            <option value="forest_stream" ${this.settings.breakSound==="forest_stream"?"selected":""}>Forest Stream</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Volume</label>
                        <input type="range" id="s-break-vol" min="0" max="100" value="${this.settings.breakVolume||60}">
                    </div>
                </div>

                <div class="settings-group">
                    <h3>General Audio</h3>
                    <div class="setting-item">
                        <label>Enable sounds</label>
                        <input type="checkbox" id="s-enable" ${this.settings.enableSound?"checked":""}>
                    </div>
                    <div class="setting-item">
                        <label>Transition bong</label>
                        <input type="checkbox" id="s-cues" ${this.settings.enableCues!==!1?"checked":""}>
                    </div>
                    <div class="setting-item">
                        <label>Master volume</label>
                        <input type="range" id="s-master" min="0" max="100" value="${this.settings.masterVolume||80}">
                    </div>
                </div>
            </div>
            <div class="settings-footer">
                <button class="btn-primary" id="s-save" style="width:100%;">Save</button>
            </div>
        `,document.body.appendChild(this.overlay),document.body.appendChild(this.panel),requestAnimationFrame(()=>{this.overlay.classList.add("visible"),this.panel.classList.add("open")}),(e=this.panel.querySelector(".settings-close-btn"))==null||e.addEventListener("click",()=>this.close()),(s=this.panel.querySelector("#s-save"))==null||s.addEventListener("click",()=>this.save()),this.overlay.addEventListener("click",()=>this.close()))}close(){this.panel.classList.remove("open"),this.overlay.classList.remove("visible"),setTimeout(()=>{this.overlay.remove(),this.panel.remove(),o===this&&(o=null),this.onClose()},350)}async save(){if(!this.settings)return;const e=a=>{var i;return((i=this.panel.querySelector(a))==null?void 0:i.value)??""},s=a=>{var i;return((i=this.panel.querySelector(a))==null?void 0:i.checked)??!1},r={...this.settings,focusDuration:parseInt(e("#s-focus"))||25,breakDuration:parseInt(e("#s-break"))||5,longBreakDuration:parseInt(e("#s-long"))||15,cyclesBeforeLongBreak:parseInt(e("#s-cycles"))||4,enableSound:s("#s-enable"),enableCues:s("#s-cues"),focusSound:e("#s-focus-sound"),focusVolume:parseInt(e("#s-focus-vol"))||60,breakSound:e("#s-break-sound"),breakVolume:parseInt(e("#s-break-vol"))||60,masterVolume:parseInt(e("#s-master"))||80};await l.saveSettings(r),this.close()}}export{g as SettingsModal,g as SettingsPanel};
