const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/SettingsModal.js","assets/storage.js"])))=>i.map(i=>d[i]);
var M=Object.defineProperty;var w=(m,e,n)=>e in m?M(m,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):m[e]=n;var p=(m,e,n)=>w(m,typeof e!="symbol"?e+"":e,n);import"./main.js";import{S as g}from"./storage.js";const E="modulepreload",A=function(m){return"/"+m},x={},R=function(e,n,o){let s=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const t=document.querySelector("meta[property=csp-nonce]"),a=(t==null?void 0:t.nonce)||(t==null?void 0:t.getAttribute("nonce"));s=Promise.allSettled(n.map(r=>{if(r=A(r),r in x)return;x[r]=!0;const l=r.endsWith(".css"),u=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${r}"]${u}`))return;const c=document.createElement("link");if(c.rel=l?"stylesheet":E,l||(c.as="script"),c.crossOrigin="",c.href=r,a&&c.setAttribute("nonce",a),document.head.appendChild(c),l)return new Promise((f,b)=>{c.addEventListener("load",f),c.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${r}`)))})}))}function i(t){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=t,window.dispatchEvent(a),!a.defaultPrevented)throw t}return s.then(t=>{for(const a of t||[])a.status==="rejected"&&i(a.reason);return e().catch(i)})};class C{constructor(e){this.container=e}render(e,n,o){var s,i;this.container.innerHTML=`
      <div class="zen-header">
        <div class="left">
          <span style="font-weight:600;font-size:0.9rem;letter-spacing:0.04em;">☯ ZenTask</span>
        </div>
        <div class="center">
          <span class="status-text">${e}</span>
        </div>
        <div class="right" style="display:flex;gap:4px;">
          <button id="sound-toggle" class="icon-btn" title="Toggle sound">🔊</button>
          <button id="settings-btn" class="icon-btn" title="Settings">☰</button>
        </div>
      </div>
    `,(s=this.container.querySelector("#sound-toggle"))==null||s.addEventListener("click",n),(i=this.container.querySelector("#settings-btn"))==null||i.addEventListener("click",o)}}class I{constructor(e){p(this,"ctx");p(this,"animationId",0);p(this,"state",null);p(this,"phase",0);p(this,"particles",[]);p(this,"animate",()=>{this.render(),this.animationId=requestAnimationFrame(this.animate)});this.canvas=e,this.ctx=e.getContext("2d"),this.initParticles()}start(){this.animate()}stop(){cancelAnimationFrame(this.animationId)}updateState(e){this.state=e}initParticles(){for(let e=0;e<20;e++)this.particles.push({x:Math.random()*300,y:Math.random()*300,r:Math.random()*2+1,speed:Math.random()*.5+.1,angle:Math.random()*Math.PI*2})}render(){const e=this.canvas.width,n=this.canvas.height,o=e/2,s=n/2;this.ctx.clearRect(0,0,e,n);let i=.02,t="rgba(212, 163, 115, 0.1)";this.state&&(this.state.mode==="focus"&&this.state.isRunning?(i=.05,t="rgba(212, 163, 115, 0.2)"):this.state.mode==="break"&&(i=.015,t="rgba(141, 163, 153, 0.2)")),this.phase+=i;const a=100,r=Math.sin(this.phase)*10,l=a+r,u=this.ctx.createRadialGradient(o,s,l*.5,o,s,l);u.addColorStop(0,t),u.addColorStop(1,"rgba(0,0,0,0)"),this.ctx.fillStyle=u,this.ctx.beginPath(),this.ctx.arc(o,s,l,0,Math.PI*2),this.ctx.fill(),this.ctx.fillStyle="rgba(255,255,255,0.1)",this.particles.forEach(c=>{c.angle+=i*.5,c.x=o+Math.cos(c.angle)*(l+c.r*10),c.y=s+Math.sin(c.angle)*(l+c.r*10),this.ctx.beginPath(),this.ctx.arc(c.x,c.y,c.r,0,Math.PI*2),this.ctx.fill()})}}class G{constructor(e){p(this,"visualizer",null);this.container=e}render(e,n,o,s){var a;const i=Math.floor(e.remainingSeconds/60).toString().padStart(2,"0"),t=(e.remainingSeconds%60).toString().padStart(2,"0");if(this.container.innerHTML){const r=this.container.querySelector("#time-display");r&&(r.textContent=`${i}:${t}`);const l=this.container.querySelector(".status-indicator");l&&(l.textContent=this.getStatusText(e));const u=this.container.querySelector("#main-action-btn");if(u){const c=(a=u.textContent)==null?void 0:a.trim(),f=e.isRunning?"Pause":"Start Focus";c!==f&&(u.textContent=f,this.rebindMainAction(u,n,o,e.isRunning))}}else{this.container.innerHTML=`
              <div class="timer-container">
                <!-- Visualizer Background -->
                <canvas id="zen-visualizer" width="300" height="300" style="position: absolute; top:0; left:0; z-index:0; border-radius: 50%;"></canvas>
                
                <!-- Time & Controls Overlay -->
                <div style="z-index: 1; text-align: center; display: flex; flex-direction: column; align-items: center;">
                    <div class="timer-time" id="time-display">${i}:${t}</div>
                    
                    <div class="timer-controls">
                        <button id="main-action-btn" class="btn-primary">
                            ${e.isRunning?"Pause":"Start Focus"}
                        </button>
                        <button id="skip-btn" class="btn-secondary" style="padding: 12px;">
                            ⏭
                        </button>
                    </div>

                    <div class="status-indicator" style="margin-top: 30px; opacity: 0.8">
                         ${this.getStatusText(e)}
                    </div>
                </div>
              </div>
            `;const r=this.container.querySelector("canvas");r&&(this.visualizer=new I(r),this.visualizer.start()),this.bindEvents(n,o,s,e.isRunning)}this.visualizer&&this.visualizer.updateState(e)}getStatusText(e){return e.mode==="focus"?`Focus Cycle ${e.cyclesCompleted+1}`:e.mode==="break"?"Short Break":e.mode==="longBreak"?"Long Rest":"Ready"}bindEvents(e,n,o,s){var a;const i=this.container.querySelector("#main-action-btn"),t=()=>o();this.rebindMainAction(i,e,n,s),(a=this.container.querySelector("#skip-btn"))==null||a.addEventListener("click",t)}rebindMainAction(e,n,o,s){var t;const i=e.cloneNode(!0);(t=e.parentNode)==null||t.replaceChild(i,e),i.addEventListener("click",()=>{s?o():n()})}}class P{constructor(e){this.container=e}render(e,n,o,s,i,t){const a=[...e].sort((c,f)=>c.id===n?-1:f.id===n?1:(c.order||0)-(f.order||0));this.container.innerHTML=`
      <div class="task-list-panel">
        <div class="tasks-header">
            <span>Today's Cycle</span>
            <span style="font-size: 0.8em; opacity: 0.7">${e.filter(c=>c.isCompleted).length}/${e.length}</span>
        </div>

        <div class="task-list">
          ${a.length===0?'<div class="empty-state" style="text-align:center; padding: 40px; opacity: 0.5">Focus on one thing at a time.</div>':""}
          ${a.map(c=>this.renderTaskRow(c,n)).join("")}
        </div>
        
        <div class="task-input-container">
            <input type="text" id="new-task-input" class="task-input" placeholder="What is your next focus?" />
            <button id="add-task-btn" class="btn-secondary" style="padding: 10px 16px;">+</button>
        </div>
      </div>
    `;const r=this.container.querySelector("#new-task-input"),l=this.container.querySelector("#add-task-btn"),u=()=>{r.value.trim()&&(o(r.value.trim()),r.value="")};l==null||l.addEventListener("click",u),r==null||r.addEventListener("keypress",c=>{c.key==="Enter"&&u()}),this.container.querySelectorAll(".task-item").forEach(c=>{var b,T;const f=c.dataset.id;(b=c.querySelector(".task-checkbox"))==null||b.addEventListener("click",v=>{v.stopPropagation(),s(f)}),(T=c.querySelector(".delete-task-btn"))==null||T.addEventListener("click",v=>{v.stopPropagation(),t(f)}),c.addEventListener("click",()=>{!c.classList.contains("completed")&&f!==n&&i(f)})})}renderTaskRow(e,n){const o=e.id===n,s=e.isCompleted,i=Math.floor((e.totalTimeMs||0)/6e4),t=i>0?`${Math.floor(i/60)}h ${i%60}m`:"";return`
        <div class="task-item ${o?"active":""} ${s?"completed":""}" data-id="${e.id}">
            <div class="task-checkbox">
                ${s?"✓":""}
            </div>
            <div class="task-content">
                <span class="task-title">${e.title}</span>
                <div class="task-meta">
                    ${o?'<span style="color:var(--color-primary)">● Focusing</span>':""}
                    ${e.pomodorosCompleted>0?`<span>${e.pomodorosCompleted} 🍅</span>`:""}
                    ${t?`<span>${t}</span>`:""}
                </div>
            </div>
            <button class="delete-task-btn" style="background:none; border:none; color:inherit; opacity:0.5; cursor:pointer; padding:4px;">×</button>
        </div>
      `}}class ${constructor(e){this.container=e}render(e){if(!e){this.container.innerHTML="";return}const n=["Stretch your neck and shoulders","Close your eyes for 20 seconds","Drink some water","Take a deep breath"],o=n[Math.floor(Math.random()*n.length)];this.container.innerHTML=`
      <div class="zen-footer-reminder fade-in">
        <span class="reminder-icon">🍃</span>
        <span class="reminder-text">${o}</span>
      </div>
    `}}class L{constructor(){p(this,"ctx",null);p(this,"masterGain",null);p(this,"ambienceGain",null);p(this,"cueGain",null);p(this,"ambienceSource",null);p(this,"currentAmbienceType","none");p(this,"cuesEnabled",!0)}async init(){this.ctx||(this.ctx=new AudioContext,this.masterGain=this.ctx.createGain(),this.masterGain.connect(this.ctx.destination),this.ambienceGain=this.ctx.createGain(),this.ambienceGain.connect(this.masterGain),this.cueGain=this.ctx.createGain(),this.cueGain.connect(this.masterGain))}async updateSettings(e){if(this.ctx||await this.init(),!this.ctx||!this.masterGain)return;this.ctx.state==="suspended"&&await this.ctx.resume();const n=e.enableSound?e.masterVolume/100:0;this.masterGain.gain.setTargetAtTime(n,this.ctx.currentTime,.1),this.cuesEnabled=e.enableCues!==!1}async playCue(e){if(!this.cuesEnabled||(this.ctx||await this.init(),!this.ctx||!this.cueGain))return;const n=this.ctx.currentTime,o=this.ctx.createOscillator();o.type="sine",o.frequency.setValueAtTime(220,n);const s=this.ctx.createOscillator();s.type="sine",s.frequency.setValueAtTime(440,n);const i=this.ctx.createOscillator();i.type="sine",i.frequency.setValueAtTime(660,n);const t=this.ctx.createGain();t.connect(this.cueGain),t.gain.setValueAtTime(0,n),t.gain.linearRampToValueAtTime(.6,n+.01),t.gain.exponentialRampToValueAtTime(.3,n+.3),t.gain.exponentialRampToValueAtTime(.01,n+3),o.connect(t),s.connect(t),i.connect(t),[o,s,i].forEach(a=>{a.start(n),a.stop(n+3)})}async playAmbience(e,n){if(this.ctx||await this.init(),!this.ctx||!this.ambienceGain)return;if(this.currentAmbienceType===e&&this.ambienceSource){this.ambienceGain.gain.setTargetAtTime(n/100,this.ctx.currentTime,.5);return}if(await this.stopAmbience(),e==="none")return;this.currentAmbienceType=e,this.ambienceGain.gain.setValueAtTime(0,this.ctx.currentTime),this.ambienceGain.gain.linearRampToValueAtTime(n/100,this.ctx.currentTime+2);const o=this.generateNoise(e);this.ambienceSource=this.ctx.createBufferSource(),this.ambienceSource.buffer=o,this.ambienceSource.loop=!0,this.ambienceSource.connect(this.ambienceGain),this.ambienceSource.start()}async stopAmbience(){if(this.ambienceSource){try{this.ctx&&this.ambienceGain&&(this.ambienceGain.gain.cancelScheduledValues(this.ctx.currentTime),this.ambienceGain.gain.setTargetAtTime(0,this.ctx.currentTime,.5));const e=this.ambienceSource;setTimeout(()=>{try{e.stop(),e.disconnect()}catch{}},600)}catch{}this.ambienceSource=null}this.currentAmbienceType="none"}generateNoise(e){if(!this.ctx)throw new Error("No AudioContext");const n=this.ctx.sampleRate,o=4*n,s=this.ctx.createBuffer(1,o,n),i=s.getChannelData(0);switch(e){case"white_noise":for(let t=0;t<o;t++)i[t]=Math.random()*2-1;break;case"rain":for(let t=0;t<o;t++){const a=Math.random()*2-1,r=t>0?(i[t-1]+.02*a)/1.02:a,l=Math.random()>.997?Math.random()*.4:0;i[t]=r*2.5+l}break;case"coffee_shop":for(let t=0;t<o;t++){const a=Math.random()*2-1,r=t>0?(i[t-1]+.015*a)/1.015:a,l=Math.sin(t/n*2*Math.PI*3.7)*.15,u=Math.random()>.99?Math.random()*.2-.1:0;i[t]=(r*2+l+u)*.8}break;case"singing_bowls":for(let t=0;t<o;t++){const a=t/n,r=174+Math.sin(a*.3)*8,l=r*2,u=r*3;i[t]=(Math.sin(2*Math.PI*r*a)*.5+Math.sin(2*Math.PI*l*a)*.25+Math.sin(2*Math.PI*u*a)*.1)*.6}break;case"ocean_waves":for(let t=0;t<o;t++){const a=t/n,r=Math.random()*2-1,l=t>0?(i[t-1]+.02*r)/1.02:r,u=(Math.sin(2*Math.PI*a/6)+1)/2;i[t]=l*3*(.2+u*.8)}break;case"forest_stream":for(let t=0;t<o;t++){const a=Math.random()*2-1,r=t>0?(i[t-1]+.03*a)/1.03:a,l=Math.sin(t*.8+Math.random()*3)*.05;i[t]=(r*2.2+l)*.7}break;default:for(let t=0;t<o;t++){const a=Math.random()*2-1;i[t]=t>0?(i[t-1]+.02*a)/1.02:a,i[t]*=3.5}}return s}}const S=document.getElementById("app"),y=new L;if(S){S.innerHTML=`
      <div class="zen-layout">
        <header id="header-zone"></header>
        <main id="main-zone">
            <div id="timer-section"></div>
            <div id="tasks-section"></div>
        </main>
        <footer id="footer-zone"></footer>
      </div>
    `;const m=new C(document.getElementById("header-zone")),e=new G(document.getElementById("timer-section")),n=new P(document.getElementById("tasks-section")),o=new $(document.getElementById("footer-zone"));let s=null,i=[];const t=async()=>{s=await chrome.runtime.sendMessage({type:"GET_STATE"}),i=await g.getTasks();const d=await g.getSettings();await y.updateSettings(d),a()},a=()=>{if(!s)return;const d=s.isRunning?s.mode==="focus"?"Focusing...":"Resting...":"ZenTask";m.render(d,b,T),e.render(s,()=>chrome.runtime.sendMessage({type:"START_TIMER",payload:{taskId:r()}}).then(t),()=>chrome.runtime.sendMessage({type:"PAUSE_TIMER"}).then(t),()=>chrome.runtime.sendMessage({type:"SKIP_TIMER"}).then(t)),n.render(i,s.activeTaskId,h=>l(h),h=>u(h),h=>c(h),h=>f(h)),o.render(s.mode!=="focus"&&s.isRunning),v(s)},r=()=>s==null?void 0:s.activeTaskId,l=async d=>{const h={id:crypto.randomUUID(),title:d,isCompleted:!1,estimatedMinutes:25,createdAt:Date.now(),order:i.length,totalTimeMs:0,sessionTimeMs:0,pomodorosCompleted:0};i.push(h),await g.saveTasks(i),t()},u=async d=>{const h=i.find(k=>k.id===d);h&&(h.isCompleted=!h.isCompleted,await g.saveTasks(i),t())},c=async d=>{s!=null&&s.isRunning&&await chrome.runtime.sendMessage({type:"PAUSE_TIMER"}),await chrome.runtime.sendMessage({type:"START_TIMER",payload:{taskId:d}}),t()},f=async d=>{(s==null?void 0:s.activeTaskId)===d&&s.isRunning&&await chrome.runtime.sendMessage({type:"PAUSE_TIMER"}),i=i.filter(h=>h.id!==d),await g.saveTasks(i),t()},b=async()=>{const d=await g.getSettings(),h=!d.enableSound;await g.saveSettings({...d,enableSound:h}),await y.updateSettings({...d,enableSound:h}),h?v(s):y.stopAmbience()},T=()=>{R(async()=>{const{SettingsPanel:d}=await import("./SettingsModal.js");return{SettingsPanel:d}},__vite__mapDeps([0,1])).then(({SettingsPanel:d})=>{new d(()=>{t()}).open()})},v=async d=>{const h=await g.getSettings();if(!h.enableSound){y.stopAmbience();return}d.isRunning?d.mode==="focus"?y.playAmbience(h.focusSound,h.focusVolume):y.playAmbience(h.breakSound,h.breakVolume):y.stopAmbience()};t(),chrome.runtime.onMessage.addListener(d=>{d.type==="TIMER_UPDATE"?(s=d.payload,a()):d.type==="PLAY_CUE"&&y.playCue(d.payload)})}
