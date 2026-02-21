var T=Object.defineProperty;var w=(h,e,t)=>e in h?T(h,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):h[e]=t;var l=(h,e,t)=>w(h,typeof e!="symbol"?e+"":e,t);import"./main.js";import{S as y}from"./storage.js";class S{constructor(e){this.container=e,this.render()}render(){const e=new Date().getHours();let t="Good morning";e>=12&&e<17?t="Good afternoon":e>=17&&(t="Good evening"),this.container.innerHTML=`
            <div class="greeting-container text-center animate-fade-in">
                <h1 class="text-2xl font-light tracking-wide text-muted" style="opacity: 0.8;">${t}</h1>
            </div>
        `}}class E{constructor(e){this.container=e}render(e,t,o,s,n){var g;const d=Math.floor(e.remainingSeconds/60).toString().padStart(2,"0"),r=(e.remainingSeconds%60).toString().padStart(2,"0");if(!this.container.querySelector(".timer-container"))this.container.innerHTML=`
        <div class="timer-container" style="position:relative; width:300px; height:300px; cursor: pointer;">
          <div style="position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">
            <div class="timer-time" id="time-display">${d}:${r}</div>

            <div class="timer-controls">
              <button id="main-action-btn" class="btn-primary ${e.isRunning?"btn-pause":""}">
                ${e.isRunning?"Pause":"Start Focus"}
              </button>
              <button id="skip-btn" class="btn-secondary" style="padding:10px 14px;">⏭</button>
            </div>

            <div class="status-indicator" id="status-text">${this.getStatusText(e)}</div>
          </div>
        </div>
      `,(g=this.container.querySelector(".timer-container"))==null||g.addEventListener("click",i=>{i.target.tagName.toLowerCase()!=="button"&&n()});else{const i=this.container.querySelector("#time-display");i&&(i.textContent=`${d}:${r}`,i.classList.remove("focus-glow","break-glow"),e.isRunning&&e.mode==="focus"?i.classList.add("focus-glow"):e.isRunning&&i.classList.add("break-glow"));const c=this.container.querySelector("#status-text");c&&(c.textContent=this.getStatusText(e))}this.bindButton("#main-action-btn",e.isRunning?"Pause":"Start Focus",i=>{i.stopPropagation(),e.isRunning?o():t()}),this.bindButton("#skip-btn",void 0,i=>{i.stopPropagation(),s()})}getStatusText(e){return e.mode==="focus"?`Focus · Cycle ${e.cyclesCompleted+1}`:e.mode==="break"?"Short Break":e.mode==="longBreak"?"Long Rest":"Ready"}bindButton(e,t,o){var d;const s=this.container.querySelector(e);if(!s)return;t!==void 0&&(s.textContent=t);const n=s.cloneNode(!0);(d=s.parentNode)==null||d.replaceChild(n,s),n.addEventListener("click",o)}}class L{constructor(e){this.container=e}render(e,t,o,s,n,d){const r=[...e].sort((i,c)=>i.id===t?-1:c.id===t?1:(i.order||0)-(c.order||0)),g=this.container.querySelector(".task-list-panel");if(g){const i=g.querySelector(".header-count");i&&(i.textContent=`${e.filter(m=>m.isCompleted).length}/${e.length}`);const c=g.querySelector(".task-list");c&&(c.innerHTML=r.length===0?'<div class="empty-state">Focus on one thing at a time.</div>':r.map(m=>this.renderTaskRow(m,t)).join(""))}else{this.container.innerHTML=`
                <div class="task-list-panel">
                    <div class="tasks-header">
                        <span class="header-title">Today's Cycle</span>
                        <span class="header-count" style="font-size:0.8em;opacity:0.7">${e.filter(v=>v.isCompleted).length}/${e.length}</span>
                    </div>

                    <div class="task-list">
                        ${r.length===0?'<div class="empty-state">Focus on one thing at a time.</div>':r.map(v=>this.renderTaskRow(v,t)).join("")}
                    </div>
                    
                    <div class="task-input-container">
                        <input type="text" id="new-task-input" class="task-input" placeholder="What is your next focus?" />
                        <button id="add-task-btn" class="btn-secondary" style="padding:10px 16px;">+</button>
                    </div>
                </div>
            `;const i=this.container.querySelector("#new-task-input"),c=this.container.querySelector("#add-task-btn"),m=()=>{i.value.trim()&&(o(i.value.trim()),i.value="")};c==null||c.addEventListener("click",m),i==null||i.addEventListener("keypress",v=>{v.key==="Enter"&&m()})}this.container.querySelectorAll(".task-item").forEach(i=>{var m,v;const c=i.dataset.id;(m=i.querySelector(".task-checkbox"))==null||m.addEventListener("click",b=>{b.stopPropagation(),s(c)}),(v=i.querySelector(".delete-task-btn"))==null||v.addEventListener("click",b=>{b.stopPropagation(),d(c)}),i.addEventListener("click",()=>{!i.classList.contains("completed")&&c!==t&&n(c)})})}renderTaskRow(e,t){const o=e.id===t,s=e.isCompleted,n=Math.floor((e.totalTimeMs||0)/6e4),d=n>0?`${Math.floor(n/60)}h ${n%60}m`:"";return`
        <div class="task-item ${o?"active":""} ${s?"completed":""}" data-id="${e.id}">
            <div class="task-checkbox">
                ${s?"✓":""}
            </div>
            <div class="task-content">
                <span class="task-title">${e.title}</span>
                <div class="task-meta">
                    ${o?'<span class="active-badge">◉ In Focus</span>':""}
                    ${e.pomodorosCompleted>0?`<span>${e.pomodorosCompleted} 🍅</span>`:""}
                    ${d?`<span>${d}</span>`:""}
                </div>
            </div>
            <button class="delete-task-btn">×</button>
        </div>
      `}}class ${constructor(e){this.container=e,this.render()}render(){var o;const e=localStorage.getItem("zen_scratchpad")||"";this.container.innerHTML=`
            <div class="quick-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); max-width: 600px; margin: 0 auto;">
                <!-- Scratchpad -->
                <div class="card p-4" style="height: 180px; display: flex; flex-direction: column;">
                    <div class="text-xs text-muted mb-2 font-medium uppercase tracking-tighter">Scratchpad</div>
                    <textarea id="scratchpad" class="w-full grow" style="background: transparent; border: none; resize: none; outline: none; font-size: 0.9rem;" placeholder="Quick thoughts...">${e}</textarea>
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
        `;const t=this.container.querySelector("#scratchpad");t==null||t.addEventListener("input",s=>{localStorage.setItem("zen_scratchpad",s.target.value)}),(o=this.container.querySelector("#breathe-trigger"))==null||o.addEventListener("click",()=>{this.showBreatheModal()})}showBreatheModal(){var r;const e=document.createElement("div");e.className="settings-overlay visible",e.style.zIndex="2000";const t=document.createElement("div");t.className="card p-8 flex-center flex-col animate-fade-in",t.style.position="fixed",t.style.top="50%",t.style.left="50%",t.style.transform="translate(-50%, -50%)",t.style.zIndex="2001",t.style.width="300px",t.innerHTML=`
            <div class="display-small mb-4 text-center" id="breathe-text">Prepare...</div>
            <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--color-primary); opacity: 0.2; transition: all 4s ease-in-out;" id="breathe-circle"></div>
            <button class="mt-8 text-xs text-muted uppercase tracking-widest" id="close-breathe">Exit</button>
        `,document.body.appendChild(e),document.body.appendChild(t);let o=!0;const s=t.querySelector("#breathe-circle"),n=t.querySelector("#breathe-text"),d=()=>{o&&(n.textContent="Inhale",s.style.transform="scale(2)",s.style.opacity="0.5",setTimeout(()=>{o&&(n.textContent="Exhale",s.style.transform="scale(1)",s.style.opacity="0.2",setTimeout(d,4e3))},4e3))};d(),(r=t.querySelector("#close-breathe"))==null||r.addEventListener("click",()=>{o=!1,e.remove(),t.remove()})}}class C{constructor(e){l(this,"canvas");l(this,"ctx");l(this,"particles",[]);l(this,"animationFrameId",null);l(this,"currentTheme","scandinavian");this.canvas=e,this.ctx=e.getContext("2d"),this.resize(),window.addEventListener("resize",()=>this.resize())}setTheme(e){this.currentTheme=e,this.initParticles()}resize(){this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight,this.initParticles()}initParticles(){this.particles=[];const e=30;for(let t=0;t<e;t++)this.particles.push(new I(this.canvas.width,this.canvas.height,this.currentTheme))}start(){this.animationFrameId||this.animate()}stop(){this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null)}animate(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.particles.forEach(e=>{e.update(this.canvas.width,this.canvas.height),e.draw(this.ctx)}),this.animationFrameId=requestAnimationFrame(()=>this.animate())}}class I{constructor(e,t,o){l(this,"x");l(this,"y");l(this,"size");l(this,"vx");l(this,"vy");l(this,"opacity");l(this,"color");switch(this.x=Math.random()*e,this.y=Math.random()*t,this.size=Math.random()*2+1,this.vx=(Math.random()-.5)*.2,this.vy=(Math.random()-.5)*.2,this.opacity=Math.random()*.3+.1,o){case"warm":this.color=`rgba(212, 163, 115, ${this.opacity})`;break;case"scandinavian":default:this.color=`rgba(163, 196, 188, ${this.opacity})`;break}}update(e,t){this.x+=this.vx,this.y+=this.vy,this.x<0&&(this.x=e),this.x>e&&(this.x=0),this.y<0&&(this.y=t),this.y>t&&(this.y=0)}draw(e){e.beginPath(),e.arc(this.x,this.y,this.size,0,Math.PI*2),e.fillStyle=this.color,e.fill()}}let f=null;class M{constructor(e){l(this,"overlay");l(this,"panel");l(this,"settings",null);l(this,"onClose");l(this,"saveTimeout",null);f&&f.close(),f=this,this.onClose=e,this.overlay=document.createElement("div"),this.overlay.className="settings-overlay",this.panel=document.createElement("div"),this.panel.className="settings-panel"}async open(){var t;if(this.settings=await y.getSettings(),!this.settings)return;this.panel.innerHTML=`
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
          <div class="setting-item">
            <label>Background Interactivity</label>
            <input type="checkbox" id="s-bg-interact" ${this.settings.backgroundInteractions?"checked":""}>
          </div>
          <div class="setting-item">
            <label>Smooth Transitions</label>
            <input type="checkbox" id="s-bg-trans" ${this.settings.backgroundTransitions?"checked":""}>
          </div>
        </div>

        <div class="settings-group">
          <h3>Ambient Music</h3>
          <div class="setting-item">
            <label>Enable music</label>
            <input type="checkbox" id="s-music-enable" ${this.settings.musicEnabled?"checked":""}>
          </div>
          <div class="setting-item">
            <label>Music volume</label>
            <input type="range" id="s-music-vol" min="0" max="100" value="${this.settings.musicVolume||50}">
          </div>
          <div class="setting-item">
            <label>Transition chime</label>
            <input type="checkbox" id="s-chime-enable" ${this.settings.showTransitionChime?"checked":""}>
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
    `,document.body.appendChild(this.overlay),document.body.appendChild(this.panel),requestAnimationFrame(()=>{this.overlay.classList.add("visible"),this.panel.classList.add("open")}),(t=this.panel.querySelector(".settings-close-btn"))==null||t.addEventListener("click",()=>this.close()),this.overlay.addEventListener("click",()=>this.close()),this.panel.querySelectorAll("input, select").forEach(o=>{o.addEventListener("input",()=>this.handleInput()),o.addEventListener("change",()=>this.handleInput())})}close(){this.panel.classList.remove("open"),this.overlay.classList.remove("visible"),setTimeout(()=>{this.overlay.remove(),this.panel.remove(),f===this&&(f=null),this.onClose()},350)}handleInput(){this.saveTimeout&&clearTimeout(this.saveTimeout),this.saveTimeout=setTimeout(()=>this.save(),500)}async save(){if(!this.settings)return;const e=s=>{var n;return((n=this.panel.querySelector(s))==null?void 0:n.value)??""},t=s=>{var n;return((n=this.panel.querySelector(s))==null?void 0:n.checked)??!1},o={...this.settings,focusDuration:parseInt(e("#s-focus"))||25,breakDuration:parseInt(e("#s-break"))||5,longBreakDuration:parseInt(e("#s-long"))||15,cyclesBeforeLongBreak:parseInt(e("#s-cycles"))||4,theme:e("#s-theme"),backgroundInteractions:t("#s-bg-interact"),backgroundTransitions:t("#s-bg-trans"),musicEnabled:t("#s-music-enable"),musicVolume:parseInt(e("#s-music-vol"))||50,showTransitionChime:t("#s-chime-enable"),autoReturnToListOnBreak:t("#s-auto-return")};await y.saveSettings(o)}}const x=document.getElementById("app");var k;if(x){x.innerHTML=`
      <div class="zen-layout flex-col flex-center" style="min-height: 100vh; padding: 40px; position: relative;">
        <!-- Top Right Settings -->
        <div style="position: absolute; top: 20px; right: 20px;">
            <button id="settings-btn" class="icon-btn" style="font-size: 1.5rem;" title="Settings">⚙️</button>
        </div>

        <!-- Greeting -->
        <div id="greeting-zone" class="mb-8"></div>

        <!-- Timer Centerpiece -->
        <div id="timer-zone" class="mb-12"></div>

        <!-- Main Focus Input -->
        <div id="focus-zone" class="w-full flex-center mb-12" style="min-height: 100px;"></div>

        <!-- Utility Grid -->
        <div id="grid-zone"></div>
      </div>
    `,new S(document.getElementById("greeting-zone"));const h=new E(document.getElementById("timer-zone")),e=new L(document.getElementById("focus-zone")),t=new $(document.getElementById("grid-zone")),o=document.getElementById("background-canvas");if(o){const a=new C(o);a.setTheme("scandinavian"),a.start()}let s=null,n=[];const d=(a,u=2500)=>{let p=document.querySelector(".zen-toast");p||(p=document.createElement("div"),p.className="zen-toast",document.body.appendChild(p)),p.textContent=a,p.classList.remove("show"),p.offsetWidth,p.classList.add("show"),setTimeout(()=>p.classList.remove("show"),u)},r=async()=>{s=await chrome.runtime.sendMessage({type:"GET_STATE"}),n=await y.getTasks(),g()},g=()=>{s&&(h.render(s,()=>chrome.runtime.sendMessage({type:"START_TIMER",payload:{taskId:i()}}).then(r),()=>chrome.runtime.sendMessage({type:"PAUSE_TIMER"}).then(r),()=>chrome.runtime.sendMessage({type:"SKIP_TIMER"}).then(r),()=>{}),e.render(n,s.activeTaskId,a=>c(a),a=>m(a),a=>v(a),a=>b(a)),t.render())},i=()=>{var a;return(s==null?void 0:s.activeTaskId)||((a=n.find(u=>!u.isCompleted))==null?void 0:a.id)},c=async a=>{const u={id:crypto.randomUUID(),title:a,isCompleted:!1,estimatedMinutes:25,createdAt:Date.now(),order:n.length,totalTimeMs:0,sessionTimeMs:0,pomodorosCompleted:0};n.push(u),await y.saveTasks(n),d("✦ Focus set"),r()},m=async a=>{const u=n.find(p=>p.id===a);u&&(u.isCompleted=!u.isCompleted,await y.saveTasks(n),u.isCompleted&&d("🌿 Task complete"),r())},v=async a=>{await chrome.runtime.sendMessage({type:"START_TIMER",payload:{taskId:a}}),r()},b=async a=>{n=n.filter(u=>u.id!==a),await y.saveTasks(n),r()};(k=document.getElementById("settings-btn"))==null||k.addEventListener("click",()=>{new M(()=>r()).open()}),r(),chrome.runtime.onMessage.addListener(a=>{a.type==="TIMER_UPDATE"&&(s=a.payload,g())}),y.onChange(()=>{r()})}
