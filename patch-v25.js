(() => {
  const PIN_KEY='mwl_secret_pin_hash_v1';
  const PIN_SALT_KEY='mwl_secret_pin_salt_v1';
  let secretMode=false;
  let secretUnlocked=false;

  const style=document.createElement('style');
  style.textContent=`
    .secretViewBtn{min-width:88px}
    .secretViewBtn.on{background:#27213f!important;color:#fff!important;box-shadow:0 2px 7px rgba(39,33,63,.20)!important}
    .secretShelfField{margin:12px 0 14px;padding:13px 14px;border:1px solid #eadffc;background:#faf8ff;border-radius:14px}
    .secretShelfCheck{display:flex;align-items:center;gap:9px;font-weight:850;color:#3a334d;cursor:pointer}
    .secretShelfCheck input{width:20px;height:20px;accent-color:#6756ef}
    .secretShelfHelp{margin-top:6px;color:#9891a9;font-size:11px;line-height:1.4}
    #secretPinDlg{border:0;border-radius:22px;padding:0;width:min(360px,88vw);box-shadow:0 24px 70px rgba(25,24,39,.28)}
    #secretPinDlg::backdrop{background:rgba(18,19,29,.56);backdrop-filter:blur(3px)}
    .secretPinBox{padding:24px}
    .secretPinIcon{width:58px;height:58px;margin:0 auto 14px;border-radius:18px;background:linear-gradient(145deg,#7868ff,#543ee6);display:grid;place-items:center;font-size:28px;box-shadow:0 9px 22px rgba(98,78,235,.25)}
    .secretPinBox h3{text-align:center;margin:0 0 7px;font-size:21px}
    .secretPinDesc{text-align:center;color:#7f8390;font-size:12px;line-height:1.5;margin-bottom:17px}
    #secretPinInput{width:100%;height:54px;border:1px solid #dfe1e8;border-radius:14px;text-align:center;font-size:25px;letter-spacing:12px;font-weight:900;outline:none;box-sizing:border-box}
    #secretPinInput:focus{border-color:#7766f3;box-shadow:0 0 0 3px rgba(119,102,243,.12)}
    .secretPinActions{display:flex;gap:9px;margin-top:14px}
    .secretPinActions button{flex:1;height:44px;border:0;border-radius:12px;font-weight:850;font-size:14px}
    #secretPinCancel{background:#eef0f5;color:#666b77}
    #secretPinOk{background:#6654ee;color:#fff}
    .secretPinError{height:18px;margin-top:8px;text-align:center;color:#d74d64;font-size:11px}
    .secretModeBadge{display:none;margin-left:8px;padding:4px 8px;border-radius:999px;background:#eee9ff;color:#5d49df;font-size:10px;font-weight:850}
    .secretModeBadge.show{display:inline-block}
  `;
  document.head.appendChild(style);

  const toggle=document.querySelector('.viewToggle');
  if(toggle && !document.querySelector('#secretViewBtn')){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='viewBtn secretViewBtn';
    btn.id='secretViewBtn';
    btn.innerHTML='🔒 비밀서재';
    toggle.appendChild(btn);
  }

  const plats=document.querySelector('#plats');
  if(plats && !document.querySelector('#secretShelfField')){
    const wrap=document.createElement('div');
    wrap.id='secretShelfField';
    wrap.className='secretShelfField';
    wrap.innerHTML=`
      <label class="secretShelfCheck">
        <input type="checkbox" id="secretShelfCheck">
        <span>🔒 비밀서재에 보관</span>
      </label>
      <div class="secretShelfHelp">체크한 작품은 일반 리스트·책장·검색·통계에서 숨겨지고, PIN을 입력한 비밀서재에서만 보입니다.</div>
    `;
    plats.parentElement.insertBefore(wrap,plats);
  }

  const title=document.querySelector('.titlebar h2');
  if(title && !document.querySelector('#secretModeBadge')){
    const badge=document.createElement('span');
    badge.id='secretModeBadge';
    badge.className='secretModeBadge';
    badge.textContent='PIN 보호';
    title.insertAdjacentElement('afterend',badge);
  }

  if(!document.querySelector('#secretPinDlg')){
    const d=document.createElement('dialog');
    d.id='secretPinDlg';
    d.innerHTML=`
      <form method="dialog" id="secretPinForm" class="secretPinBox">
        <div class="secretPinIcon">🔐</div>
        <h3 id="secretPinTitle">비밀서재</h3>
        <div class="secretPinDesc" id="secretPinDesc">4자리 PIN을 입력하세요.</div>
        <input id="secretPinInput" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off">
        <div class="secretPinError" id="secretPinError"></div>
        <div class="secretPinActions">
          <button type="button" id="secretPinCancel">취소</button>
          <button type="submit" id="secretPinOk">확인</button>
        </div>
      </form>
    `;
    document.body.appendChild(d);
  }

  const pinDlg=document.querySelector('#secretPinDlg');
  const pinInput=document.querySelector('#secretPinInput');
  const pinTitle=document.querySelector('#secretPinTitle');
  const pinDesc=document.querySelector('#secretPinDesc');
  const pinError=document.querySelector('#secretPinError');
  document.querySelector('#secretPinCancel')?.addEventListener('click',()=>pinDlg.close());

  function bytesToB64(bytes){
    let s='';
    for(let i=0;i<bytes.length;i+=0x8000){
      s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
    }
    return btoa(s);
  }
  function b64ToBytes(v){
    const s=atob(v),a=new Uint8Array(s.length);
    for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);
    return a;
  }
  async function derivePin(pin,salt){
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:120000,hash:'SHA-256'},key,256);
    return bytesToB64(new Uint8Array(bits));
  }
  async function savePin(pin){
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const hash=await derivePin(pin,salt);
    localStorage.setItem(PIN_SALT_KEY,bytesToB64(salt));
    localStorage.setItem(PIN_KEY,hash);
  }
  async function verifyPin(pin){
    const h=localStorage.getItem(PIN_KEY),s=localStorage.getItem(PIN_SALT_KEY);
    if(!h||!s)return false;
    return (await derivePin(pin,b64ToBytes(s)))===h;
  }

  function askPin(mode='unlock'){
    return new Promise(resolve=>{
      let first='';
      pinInput.value='';
      pinError.textContent='';
      if(mode==='setup'){
        pinTitle.textContent='비밀서재 PIN 설정';
        pinDesc.textContent='사용할 숫자 4자리를 입력하세요. 한 번 더 확인합니다.';
      }else{
        pinTitle.textContent='비밀서재';
        pinDesc.textContent='설정한 숫자 4자리 PIN을 입력하세요.';
      }
      const onClose=()=>{cleanup();resolve(false)};
      const onSubmit=async e=>{
        e.preventDefault();
        const pin=pinInput.value.replace(/\D/g,'').slice(0,4);
        if(pin.length!==4){pinError.textContent='숫자 4자리를 입력해 주세요.';return}
        if(mode==='setup'){
          if(!first){
            first=pin;pinInput.value='';pinError.textContent='';
            pinDesc.textContent='같은 PIN을 한 번 더 입력하세요.';
            pinInput.focus();return;
          }
          if(first!==pin){
            first='';pinInput.value='';pinError.textContent='PIN이 달라요. 처음부터 다시 입력해 주세요.';
            pinDesc.textContent='사용할 숫자 4자리를 다시 입력하세요.';
            return;
          }
          await savePin(pin);
          cleanup();pinDlg.close();resolve(true);return;
        }
        if(await verifyPin(pin)){
          cleanup();pinDlg.close();resolve(true);
        }else{
          pinInput.value='';pinError.textContent='PIN이 맞지 않습니다.';pinInput.focus();
        }
      };
      const cleanup=()=>{
        pinDlg.removeEventListener('close',onClose);
        document.querySelector('#secretPinForm')?.removeEventListener('submit',onSubmit);
      };
      pinDlg.addEventListener('close',onClose,{once:true});
      document.querySelector('#secretPinForm')?.addEventListener('submit',onSubmit);
      pinDlg.showModal();
      setTimeout(()=>pinInput.focus(),120);
    });
  }

  const listBeforeSecret=list;
  list=function(){
    const arr=listBeforeSecret();
    return arr.filter(b=>secretMode ? !!b.secretShelf : !b.secretShelf);
  };

  const renderBeforeSecret=render;
  render=function(){
    renderBeforeSecret();

    const visible=books.filter(b=>secretMode ? !!b.secretShelf : !b.secretShelf);
    const set=(id,val)=>{const el=document.querySelector(id);if(el)el.textContent=String(val)};
    set('#nAll',visible.length);
    set('#nRead',visible.filter(b=>b.status==='읽는 중').length);
    set('#nDone',visible.filter(b=>b.status==='완독').length);
    set('#nFull',visible.filter(b=>(b.platforms||[]).some(x=>x.ownership==='전권 소장')).length);
    set('#qAll',visible.length);
    set('#qDone',visible.filter(b=>b.status==='완독').length);
    set('#qReading',visible.filter(b=>b.status==='읽는 중').length);
    set('#qReread',visible.filter(b=>b.status==='완독'&&Number(b.rating||0)>=4).length);

    const btn=document.querySelector('#secretViewBtn');
    if(btn)btn.classList.toggle('on',secretMode);
    document.querySelectorAll('.viewBtn[data-view]').forEach(x=>{
      if(secretMode)x.classList.remove('on');
    });
    const h=document.querySelector('.titlebar h2');
    if(h)h.textContent=secretMode?'비밀서재':'내 작품';
    const badge=document.querySelector('#secretModeBadge');
    if(badge)badge.classList.toggle('show',secretMode);
    const search=document.querySelector('#search');
    if(search)search.placeholder=secretMode?'비밀서재에서 검색하세요':'작품명 또는 작가를 검색하세요';
  };

  document.querySelector('#secretViewBtn')?.addEventListener('click',async()=>{
    if(secretMode)return;
    const configured=!!localStorage.getItem(PIN_KEY);
    const ok=await askPin(configured?'unlock':'setup');
    if(!ok)return;
    secretUnlocked=true;
    const listBtn=document.querySelector('.viewBtn[data-view="list"]');
    if(listBtn)listBtn.click();
    secretMode=true;
    render();
    note(configured?'비밀서재를 열었습니다':'PIN을 설정하고 비밀서재를 열었습니다');
  });

  document.addEventListener('click',e=>{
    const normal=e.target.closest('.viewBtn[data-view="list"],.viewBtn[data-view="shelf"]');
    if(!normal||!secretMode)return;
    secretMode=false;
    secretUnlocked=false;
  },true);

  const editBeforeSecret=window.edit;
  window.edit=id=>{
    editBeforeSecret(id);
    const b=books.find(x=>String(x.id)===String(id));
    const ck=document.querySelector('#secretShelfCheck');
    if(ck)ck.checked=!!b?.secretShelf;
  };

  document.querySelector('#add')?.addEventListener('click',()=>{
    const ck=document.querySelector('#secretShelfCheck');
    if(ck)ck.checked=secretMode;
  });

  const form=document.querySelector('#form');
  if(form){
    form.addEventListener('submit',()=>{
      const existingId=document.querySelector('#id')?.value||'';
      const titleNow=document.querySelector('#title')?.value.trim()||'';
      const authorNow=document.querySelector('#author')?.value.trim()||'';
      const secret=!!document.querySelector('#secretShelfCheck')?.checked;
      setTimeout(()=>{
        let b=existingId?books.find(x=>String(x.id)===String(existingId)):null;
        if(!b){
          b=[...books]
            .filter(x=>String(x.title||'').trim()===titleNow && String(x.author||'').trim()===authorNow)
            .sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))[0];
        }
        if(!b)return;
        if(!!b.secretShelf===secret)return;
        b.secretShelf=secret;
        b.updatedAt=new Date().toISOString();
        save();
        note(secret?'비밀서재에 보관했습니다':'일반 서재로 이동했습니다');
      },0);
    });
  }

  render();
})();