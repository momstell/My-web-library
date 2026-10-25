(function shelfLockAndCovers(){
  "use strict";
  const PIN_KEY="mwl_secret_pin_v49";
  const PIN_SALT_BYTES=16;
  const PBKDF2_ROUNDS=135000;
  let unlocked=false;
  let failures=0, lockoutUntil=0;
  let pendingAction=null;
  let busyRepair=new Set(),repairAttempts=0;
  const MAX_AUTOREPAIRS=8;
  const PIN_OPTIONS={credential:""};
  function secret(b){return !!(b&&(b.shelf==="secret"||b.privateShelf===true));}
  function verifier(){try{return JSON.parse(localStorage.getItem(PIN_KEY)||"null");}catch{return null;}}
  function hasPin(){return !!verifier()?.hash;}
  async function makeHash(pin,salt,iterations=PBKDF2_ROUNDS){
    const raw=new TextEncoder().encode(pin);
    const key=await crypto.subtle.importKey("raw",raw,"PBKDF2",false,["deriveBits"]);
    const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:new Uint8Array(salt),iterations,hash:"SHA-256"},key,256);
    return [...new Uint8Array(bits)].map(n=>n.toString(16).padStart(2,"0")).join("");
  }
  function pinDialog(){
    const d=document.createElement("dialog");d.className="secretDialog";d.id="secretPinDlg";
    d.innerHTML=`<div class="dh"><h3 id="pinTitle">비밀서재 잠금</h3><button type="button" class="x" id="pinX" aria-label="닫기">×</button></div>
      <form id="pinForm" autocomplete="off">
       <p id="pinIntro">이 기기에서 사용할 비밀번호를 설정하세요.</p>
       <div class="field"><label id="pinLabel" for="pinInput">숫자 비밀번호 (6~12자리)</label>
         <input id="pinInput" type="password" inputmode="numeric" pattern="[0-9]{6,12}" maxlength="12" autocomplete="new-password" required></div>
       <div id="pinConfirmBox" class="field"><label for="pinConfirm">비밀번호 확인</label><input id="pinConfirm" type="password" inputmode="numeric" pattern="[0-9]{6,12}" maxlength="12" autocomplete="new-password"></div>
       <p class="pinError" id="pinError" role="alert"></p>
       <p class="pinCaution">잠금은 화면 접근을 제한합니다. 저장 데이터 자체의 암호화는 아니며, 이 기기별로 별도 설정됩니다.</p>
       <div class="actions2"><button type="submit" class="save" id="pinSubmit">설정하고 열기</button></div>
      </form>`;
    document.body.appendChild(d);return d;
  }
  const css=document.createElement("style");
  css.textContent=`
   .secretDialog{max-width:430px;width:calc(100% - 32px);border:0;border-radius:23px;padding:0;box-shadow:0 24px 80px rgba(10,8,24,.35)}
   .secretDialog form{padding:17px 20px 22px}.secretDialog p{margin:0 0 14px;font-size:12px;line-height:1.7;color:#585369}
   .secretDialog::backdrop{background:rgba(13,9,20,.68)}
   .secretDialog .pinError{color:#c22d52;min-height:17px;margin:2px 0 7px}
   .secretDialog .pinCaution{font-size:10px;color:#887f93;margin-top:8px}
   .secretCoverBlank{position:absolute;inset:0;display:flex;justify-content:center;align-items:center;background:linear-gradient(150deg,var(--lib-tint),#ddd0ea);color:var(--lib-deep);font-size:11px;text-align:center;padding:6px;font-weight:800}
   .card .cover img{z-index:2;display:block}
   .card .cover span{z-index:1;display:none!important}
   .card .cover[data-fallback="yes"] span{display:block!important}
   .card .cover[data-fallback="yes"] img{display:none!important}
   #libShelfBar .libLockStatus{font-size:11px;color:#5a4e63;font-weight:850}
   #libShelfBar .libLockButton{background:#fff4fa;color:#74344f}
   .coverRetry{border:1px solid var(--lib-line);background:white;color:var(--lib-deep);padding:6px 8px;border-radius:9px;font-size:11px;font-weight:850;margin-top:5px}
  `;document.head.appendChild(css);
  const dlgPin=pinDialog();
  const f=dlgPin.querySelector("#pinForm");
  const pinInput=dlgPin.querySelector("#pinInput"),pinConfirm=dlgPin.querySelector("#pinConfirm");
  const intro=dlgPin.querySelector("#pinIntro"),pinLabel=dlgPin.querySelector("#pinLabel"),confirmBox=dlgPin.querySelector("#pinConfirmBox");
  const err=dlgPin.querySelector("#pinError"),submit=dlgPin.querySelector("#pinSubmit");
  dlgPin.querySelector("#pinX").onclick=()=>{dlgPin.close();pendingAction=null;};
  let mode="unlock";
  function showPin(nextMode,action=null){
    mode=nextMode;pendingAction=action;err.textContent="";
    f.reset();
    const initial=nextMode==="setup",changing=nextMode==="change";
    dlgPin.querySelector("#pinTitle").textContent=initial?"비밀서재 비밀번호 만들기":changing?"비밀번호 변경":"🔒 비밀서재";
    intro.textContent=initial?"6~12자리 숫자 비밀번호를 만들면 비밀서재에 들어갈 때마다 입력하게 됩니다.":changing?"기존 비밀번호를 입력해 변경을 시작합니다.":"비밀서재를 보려면 이 기기의 비밀번호를 입력하세요.";
    pinLabel.textContent=initial?"새 비밀번호":"비밀번호";
    confirmBox.hidden=!initial;
    pinConfirm.required=initial;
    submit.textContent=initial?"설정하고 열기":changing?"확인":"잠금 해제";
    if(!dlgPin.open)dlgPin.showModal();
    setTimeout(()=>pinInput.focus(),60);
  }
  async function finishUnlock(){
    unlocked=true;failures=0;dlgPin.close();render();
    const a=pendingAction;pendingAction=null;
    if(typeof a==="function")a();
  }
  f.onsubmit=async e=>{
    e.preventDefault();if(Date.now()<lockoutUntil){err.textContent="입력 횟수를 초과했습니다. 잠시 후 다시 입력해주세요.";return;}
    const pin=pinInput.value;
    if(!/^\d{6,12}$/.test(pin)){err.textContent="숫자 6~12자리로 입력해주세요.";return;}
    submit.disabled=true;
    try{
      if(mode==="setup"){
        if(pin!==pinConfirm.value){err.textContent="비밀번호 확인이 다릅니다.";return;}
        const salt=Array.from(crypto.getRandomValues(new Uint8Array(PIN_SALT_BYTES)));
        const hash=await makeHash(pin,salt);
        localStorage.setItem(PIN_KEY,JSON.stringify({salt,hash,iterations:PBKDF2_ROUNDS,createdAt:new Date().toISOString()}));
        await finishUnlock();note("비밀서재 비밀번호를 설정했습니다");
      }else{
        const saved=verifier();
        if(!saved){showPin("setup",pendingAction);return;}
        const actual=await makeHash(pin,saved.salt,saved.iterations||PBKDF2_ROUNDS);
        if(actual!==saved.hash){
          failures++;pinInput.value="";
          if(failures>=5){lockoutUntil=Date.now()+60000;failures=0;err.textContent="5회 실패 · 1분 후 다시 시도하세요.";}
          else err.textContent=`비밀번호가 일치하지 않습니다. (${failures}/5)`;
          return;
        }
        if(mode==="change"){
          // Keep the old verifier if the user cancels the new PIN dialog.
          showPin("setup",null);mode="reset";return;
        }
        if(mode==="reset"){return;}
        await finishUnlock();
      }
    }catch(ex){err.textContent="보안 기능을 사용할 수 없습니다. Chrome/WebView 업데이트를 확인해주세요.";}
    finally{submit.disabled=false;}
  };
  // change mode: confirm current PIN, then replace verifier only after confirming new PIN.
  const actualSubmit=f.onsubmit;
  f.onsubmit=async e=>{
    if(mode!=="reset")return actualSubmit(e);
    e.preventDefault();
    const pin=pinInput.value;
    if(!/^\d{6,12}$/.test(pin)||pin!==pinConfirm.value){err.textContent="새 비밀번호 두 칸에 같은 숫자 6~12자리를 입력해주세요.";return;}
    submit.disabled=true;
    try{
      const salt=Array.from(crypto.getRandomValues(new Uint8Array(PIN_SALT_BYTES)));
      localStorage.setItem(PIN_KEY,JSON.stringify({salt,hash:await makeHash(pin,salt),iterations:PBKDF2_ROUNDS,createdAt:new Date().toISOString()}));
      await finishUnlock();note("비밀번호를 변경했습니다");
    }catch{err.textContent="비밀번호를 변경하지 못했습니다.";}
    finally{submit.disabled=false;}
  };
  const bar=document.getElementById("libShelfBar");
  const lockBtn=document.createElement("button");lockBtn.type="button";lockBtn.className="libLockButton";lockBtn.textContent="🔒 잠금 설정";
  const lockNote=document.createElement("span");lockNote.className="libLockStatus";
  if(bar){bar.appendChild(lockBtn);bar.appendChild(lockNote);}
  const themePanel=document.querySelector(".themePanel");
  if(themePanel){
    const area=document.createElement("section");area.className="themeLabel";
    area.innerHTML='<button type="button" class="ghost" id="secretSettingLink">🔐 비밀서재 비밀번호 관리</button>';
    themePanel.appendChild(area);
    area.querySelector("button").addEventListener("click",()=>{document.querySelector(".themeSheet")?.classList.remove("show");showPin(hasPin()?"change":"setup");});
  }
  lockBtn.onclick=()=>{
    if(unlocked){unlocked=false;note("비밀서재를 잠갔습니다");render();}
    else showPin(hasPin()?"unlock":"setup");
  };
  function unlockGate(action){
    if(unlocked){action?.();return;}
    showPin(hasPin()?"unlock":"setup",action);
  }
  if(bar)bar.addEventListener("click",e=>{
    const target=e.target.closest("[data-shelf]");
    if(!target)return;
    if((target.dataset.shelf==="secret"||target.dataset.shelf==="all")&&!unlocked){
      e.preventDefault();e.stopImmediatePropagation();
      unlockGate(()=>target.click());
    }
  },true);
  // Prevent saving a secret book without first setting a PIN.
  document.querySelector("#form")?.addEventListener("submit",e=>{
    const target=document.getElementById("libShelf");
    if(target?.value!=="secret"||unlocked)return;
    e.preventDefault();e.stopImmediatePropagation();
    unlockGate(()=>document.querySelector("#form")?.requestSubmit());
  },true);
  document.querySelector("#backup")?.addEventListener("click",e=>{
    if(!unlocked&&books.some(secret)){
      e.preventDefault();e.stopImmediatePropagation();
      unlockGate(()=>document.getElementById("backup")?.click());
    }
  },true);
  const oldList=list;
  list=function(){return oldList().filter(b=>unlocked||!secret(b));};
  window.list=list;
  const oldEdit=window.edit;
  window.edit=function(id){
    const b=books.find(x=>String(x.id)===String(id));
    if(b&&secret(b)&&!unlocked){unlockGate(()=>oldEdit(id));return;}
    return oldEdit(id);
  };
  let fillRender=false;
  const oldRender=render;
  render=function(){
    if(fillRender)return;
    fillRender=true;
    try{
      oldRender();
      const permitted=books.filter(b=>unlocked||!secret(b));
      const counts=[
        ["qAll",permitted.length],
        ["qDone",permitted.filter(b=>b.status==="완독").length],
        ["qReading",permitted.filter(b=>b.status==="읽는 중").length],
        ["qReread",permitted.filter(b=>b.status==="완독"&&Number(b.rating||0)>=4).length],
        ["nAll",permitted.length],
        ["nDone",permitted.filter(b=>b.status==="완독").length],
        ["nRead",permitted.filter(b=>b.status==="읽는 중").length]
      ];
      counts.forEach(([id,n])=>{const el=document.getElementById(id);if(el)el.textContent=n;});
      if(bar){
        lockBtn.textContent=unlocked?"🔓 지금 잠그기":hasPin()?"🔒 잠금 해제":"🔑 비밀번호 설정";
        lockNote.textContent=unlocked?"열림":hasPin()?"잠김":"미설정";
        const sel=bar.querySelector(".libCategory");
        if(sel&&!unlocked){
          const allowed=[...new Set(permitted.map(b=>b.category).filter(Boolean))];
          for(const opt of [...sel.options])if(opt.value!=="all"&&opt.value!=="미분류"&&!allowed.includes(opt.value))opt.remove();
        }
      }
      const ordered=list();
      document.querySelectorAll("#grid .card").forEach((card,i)=>{
        const b=ordered[i],c=card.querySelector(".cover");
        if(!b||!c)return;
        const img=c.querySelector("img"),span=c.querySelector("span");
        c.dataset.fallback=img?"no":"yes";
        if(img){
          let src=String(b.cover||"");
          const bad=/naver.*login|login.*naver|nid\.naver|favicon|\/logo\b|\/profile\b/i.test(src);
          if(bad){c.dataset.fallback="yes";img.remove();if(!b.coverManual)scheduleCoverRepair(b);return;}
          const okay=()=>{
            if(!img.isConnected)return;
            if((b.platforms||[]).some(p=>p.name==="시리즈")&&img.naturalWidth>=img.naturalHeight&&!b.coverManual){
              c.dataset.fallback="yes";scheduleCoverRepair(b);return;
            }
            c.dataset.fallback="no";
          };
          const error=()=>{c.dataset.fallback="yes";if(!b.coverManual)scheduleCoverRepair(b);};
          if(img.complete){if(img.naturalWidth>0)okay();else error();}
          else {img.addEventListener("load",okay,{once:true});img.addEventListener("error",error,{once:true});}
        }else if(!b.coverManual){scheduleCoverRepair(b);}
        if(span)span.setAttribute("aria-label",b.title||"표지 없음");
      });
    }finally{fillRender=false;}
  };
  window.render=render;

  function scheduleCoverRepair(b){
    if(!b||b.coverManual||repairAttempts>=MAX_AUTOREPAIRS||busyRepair.has(b.id))return;
    const k="mwl_cover_try_v49_"+b.id;
    if(Date.now()-Number(localStorage.getItem(k)||0)<86400000)return;
    localStorage.setItem(k,String(Date.now()));repairAttempts++;
    busyRepair.add(b.id);
    setTimeout(()=>repairCover(b,false).finally(()=>busyRepair.delete(b.id)),1000+repairAttempts*900);
  }
  async function checkImage(src){
    return await new Promise(res=>{
      const im=new Image();let done=false;
      const finish=ok=>{if(!done){done=true;res(ok);}};
      im.onload=()=>finish(im.naturalWidth>=65&&im.naturalHeight>=90&&im.naturalWidth/im.naturalHeight<1.28);
      im.onerror=()=>finish(false);
      im.src=src;
      setTimeout(()=>finish(false),6500);
    });
  }
  async function repairCover(b,loud=false){
    if(!b||b.coverManual)return;
    const p=(b.platforms||[]).find(x=>x.name==="시리즈")||(b.platforms||[])[0];
    const source=b.shareUrl||b.sourceUrl||p?.canonicalUrl||b.canonicalUrl||p?.url||"";
    if(!source||!/^https?:\/\//i.test(source)){if(loud)note("작품 원문 링크가 없습니다");return;}
    const series=(p?.name==="시리즈"||/series\.naver\.com|naver\.me/i.test(source));
    let found="";
    if(series){
      try{
        const u=new URL("https://ncbdmzuwhphdstxcahxk.supabase.co/functions/v1/library-cover-resolver");
        u.searchParams.set("url",source);u.searchParams.set("title",b.title||"");
        const r=await fetch(u,{signal:AbortSignal.timeout(15000)});
        if(r.ok){const j=await r.json();found=j.coverDataUrl||j.cover||"";}
      }catch{}
    }
    if(!found){
      try{
        const u=new URL("https://ncbdmzuwhphdstxcahxk.supabase.co/functions/v1/book-meta-resolver");
        u.searchParams.set("url",source);u.searchParams.set("title",b.title||"");
        const r=await fetch(u,{signal:AbortSignal.timeout(15000)});
        if(r.ok){const j=await r.json();found=j.coverDataUrl||j.cover||"";}
      }catch{}
    }
    if(found&&await checkImage(found)){
      b.cover=found;b.coverManual=false;b.updatedAt=new Date().toISOString();
      save();
      if(loud)note("실제 작품 표지를 다시 가져왔습니다");
      return true;
    }
    if(loud)note("이 작품은 사이트의 이미지 접근 제한으로 표지를 자동 조회하지 못했습니다");
    return false;
  }
  window.mwlRepairCover=id=>{const b=books.find(x=>String(x.id)===String(id));if(b)repairCover(b,true);};
  // Repair whenever the user intentionally asks for metadata refresh.
  const oldEnrich=window.enrichById;
  window.enrichById=function(id){if(oldEnrich)oldEnrich(id);const b=books.find(x=>String(x.id)===String(id));if(b&&!b.coverManual)setTimeout(()=>repairCover(b,false),600);};
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden&&unlocked){unlocked=false;render();}
  });
  render();
})();