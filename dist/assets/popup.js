import"./main.js";import{S as c}from"./storage.js";const s=document.getElementById("app");if(s){s.innerHTML=`
      <div class="popup-container">
        <header class="popup-header">
            <span class="zen-logo-small">Zen</span>
        </header>
        <div class="popup-timer">
            <div class="popup-time-display">--:--</div>
            <div class="popup-controls">
                <button id="pp-toggle" class="icon-btn">⏯</button> 
            </div>
        </div>
        <div class="popup-active-task">
            <span id="active-task-title">No active task</span>
            <button id="mark-done-btn" class="icon-btn" style="display:none">✓</button>
        </div>
        <button id="open-newtab" class="text-btn">Open Dashboard</button>
      </div>
    `;const p=s.querySelector(".popup-time-display"),l=s.querySelector("#pp-toggle"),r=s.querySelector("#active-task-title"),i=s.querySelector("#mark-done-btn"),u=s.querySelector("#open-newtab");let e=null,t=null;const o=async()=>{e=await chrome.runtime.sendMessage({type:"GET_STATE"}),e!=null&&e.activeTaskId?t=(await c.getTasks()).find(a=>a.id===e.activeTaskId)||null:t=null,d()},d=()=>{if(!e)return;const n=Math.floor(e.remainingSeconds/60).toString().padStart(2,"0"),a=(e.remainingSeconds%60).toString().padStart(2,"0");p.textContent=`${n}:${a}`,l.textContent=e.isRunning?"⏸":"▶",r.textContent=t?t.title:e.mode==="focus"?"Ready to focus":"Break Time",t&&e.mode==="focus"?i.style.display="inline-block":i.style.display="none"};l.addEventListener("click",()=>{if(e!=null&&e.isRunning)chrome.runtime.sendMessage({type:"PAUSE_TIMER"}).then(o);else{const n=(t==null?void 0:t.id)||(e==null?void 0:e.activeTaskId);chrome.runtime.sendMessage({type:"START_TIMER",payload:{taskId:n}}).then(o)}}),i.addEventListener("click",async()=>{if(t){const n=await c.getTasks(),a=n.find(y=>y.id===t.id);a&&(a.isCompleted=!0,await c.saveTasks(n),await chrome.runtime.sendMessage({type:"PAUSE_TIMER"}),o())}}),u.addEventListener("click",()=>{chrome.tabs.create({})}),o(),chrome.runtime.onMessage.addListener(n=>{n.type==="TIMER_UPDATE"&&(e=n.payload,d(),(e==null?void 0:e.activeTaskId)!==(t==null?void 0:t.id)?o():d())})}
