(() => {
  const SUPABASE_URL='https://ncbdmzuwphdstxcahxk.supabase.co';
  const SUPABASE_KEY='sb_publishable_KWkdlBv5ORt8BmHX8ewJGw_PuMrF-zM';
  const AUTH_KEY='mwl_supabase_session_v2';
  const BOUND_KEY='mwl_cloud_bound_user_v2';
  const SYNC_KEY='mwl_cloud_last_sync_v2';
  let cloudSession=null, cloudBusy=false, cloudDirty=false, pushTimer=null;

  function h(v=''){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function cloudStamp(){return localStorage.getItem(SYNC_KEY)||''}
  function setCloudStamp(v){if(v)localStorage.setItem(SYNC_KEY,v)}
  function loadSession(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{return null}}
  function saveSession(s){cloudSession=s;localStorage.setItem(AUTH_KEY,JSON.stringify(s));updateCloudUI()}
  function clearSession(){cloudSession=null;localStorage.removeItem(AUTH_KEY);updateCloudUI()}
  function authHeaders(token){return {'apikey':SUPABASE_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json'}}
  function publicHeaders(){return {'apikey':SUPABASE_KEY,'Content-Type':'application/json'}}
  async function jsonFetch(url,opt={}){const r=await fetch(url,opt);let j=null;try{j=await r.json()}catch{}if(!r.ok){const e=new Error(j?.msg||j?.message||j?.error_description||j?.error||('HTTP '+r.status));e.status=r.status;e.body=j;throw e}return j}

  async function refreshSession(){
    const s=cloudSession||loadSession();if(!s?.refresh_token)throw new Error('로그인이 필요합니다');
    const j=await jsonFetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:publicHeaders(),body:JSON.stringify({refresh_token:s.refresh_token})});
    const ns={access_token:j.access_token,refresh_token:j.refresh_token,expires_at:Date.now()+((j.expires_in||3600)-60)*1000,user:j.user||s.user};saveSession(ns);return ns;
  }
  async function validSession(){
    let s=cloudSession||loadSession();if(!s)return null;
    cloudSession=s;
    if(!s.expires_at||Date.now()>s.expires_at){try{s=await refreshSession()}catch{clearSession();return null}}
    return s;
  }

  async function signIn(email,password){
    const j=await jsonFetch(SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:publicHeaders(),body:JSON.stringify({email,password})});
    const s={access_token:j.access_token,refresh_token:j.refresh_token,expires_at:Date.now()+((j.expires_in||3600)-60)*1000,user:j.user};saveSession(s);return s;
  }
  async function signUp(email,password){
    const j=await jsonFetch(SUPABASE_URL+'/auth/v1/signup',{method:'POST',headers:publicHeaders(),body:JSON.stringify({email,password})});
    if(j.access_token){const s={access_token:j.access_token,refresh_token:j.refresh_token,expires_at:Date.now()+((j.expires_in||3600)-60)*1000,user:j.user};saveSession(s);return {session:s,confirm:false}}
    return {session:null,confirm:true};
  }
  async function signOut(){
    const s=await validSession();
    if(s)try{await fetch(SUPABASE_URL+'/auth/v1/logout',{method:'POST',headers:authHeaders(s.access_token)})}catch{}
    clearSession();localStorage.removeItem(BOUND_KEY);localStorage.removeItem(SYNC_KEY);setCloudStatus('기기 저장 중');note('클라우드에서 로그아웃했습니다');
  }

  function bookSig(b){
    const t=String(b?.title||'').trim().toLowerCase().replace(/\s+/g,' ');
    const ps=(b?.platforms||[]).map(x=>x.name).filter(Boolean).sort().join(',');
    return t+'|'+ps;
  }
  function newer(a,b){return String(a?.updatedAt||'')>=String(b?.updatedAt||'')?a:b}
  function mergePlatforms(a=[],b=[]){
    const m=new Map();
    for(const p of [...a,...b]){if(!p?.name)continue;const old=m.get(p.name)||{};m.set(p.name,{...old,...p,shareUrls:[...new Set([...(old.shareUrls||[]),...(p.shareUrls||[])])].filter(Boolean)})}
    return [...m.values()];
  }
  function mergeBook(a,b){
    if(!a)return b;if(!b)return a;
    const n=newer(a,b),o=n===a?b:a;
    const out={...o,...n};
    for(const k of ['author','cover','review','memo','shareUrl','sourceUrl','canonicalUrl'])if(!out[k]&&o[k])out[k]=o[k];
    if(!out.rating&&o.rating)out.rating=o.rating;
    out.platforms=mergePlatforms(o.platforms||[],n.platforms||[]);
    out.shareUrls=[...new Set([...(o.shareUrls||[]),...(n.shareUrls||[])])].filter(Boolean);
    return out;
  }
  function mergeLibraries(remote=[],local=[]){
    const m=new Map();
    for(const b of remote){const key=b.id?'id:'+b.id:'sig:'+bookSig(b);m.set(key,b)}
    for(const b of local){
      let key=b.id?'id:'+b.id:'sig:'+bookSig(b);
      if(m.has(key)){m.set(key,mergeBook(m.get(key),b));continue}
      const sig=bookSig(b);const hit=[...m.entries()].find(([,x])=>bookSig(x)===sig);
      if(hit)m.set(hit[0],mergeBook(hit[1],b));else m.set(key,b);
    }
    return [...m.values()];
  }

  async function fetchCloud(){
    const s=await validSession();if(!s)return null;
    const uid=s.user?.id;if(!uid)throw new Error('사용자 정보를 확인할 수 없습니다');
    const url=SUPABASE_URL+'/rest/v1/library_state?select=books,updated_at,version&user_id=eq.'+encodeURIComponent(uid)+'&limit=1';
    const rows=await jsonFetch(url,{headers:authHeaders(s.access_token)});
    return rows?.[0]||null;
  }
  async function pushCloud(loud=false){
    const s=await validSession();if(!s)return false;
    if(cloudBusy){cloudDirty=true;return false}
    cloudBusy=true;setCloudStatus('동기화 중…');
    try{
      const now=new Date().toISOString();
      const url=SUPABASE_URL+'/rest/v1/library_state?on_conflict=user_id';
      const body=[{user_id:s.user.id,books:books,version:2,updated_at:now}];
      const rows=await jsonFetch(url,{method:'POST',headers:{...authHeaders(s.access_token),'Prefer':'resolution=merge-duplicates,return=representation'},body:JSON.stringify(body)});
      setCloudStamp(rows?.[0]?.updated_at||now);localStorage.setItem(BOUND_KEY,s.user.id);cloudDirty=false;setCloudStatus('동기화 완료',s.user.email);if(loud)note('두 기기 서재를 동기화했습니다');return true;
    }catch(e){
      setCloudStatus(e.status===404?'클라우드 표 설정 필요':'동기화 실패');if(loud)note(e.status===404?'Supabase SQL 설정이 먼저 필요합니다':'동기화에 실패했습니다 · 인터넷 연결을 확인해주세요');return false;
    }finally{cloudBusy=false;if(cloudDirty){cloudDirty=false;schedulePush()}}
  }
  function schedulePush(){
    if(!(cloudSession||loadSession()))return;
    cloudDirty=true;clearTimeout(pushTimer);pushTimer=setTimeout(()=>pushCloud(false),900);
  }
  function setBooksLocal(arr){
    books=Array.isArray(arr)?arr:[];localStorage.setItem(KEY,JSON.stringify(books));render();
  }
  async function initialSync(loud=false){
    const s=await validSession();if(!s){setCloudStatus('로그인하면 두 기기 동기화');return}
    if(cloudBusy)return;cloudBusy=true;setCloudStatus('클라우드 확인 중…');
    try{
      const remote=await fetchCloud();const bound=localStorage.getItem(BOUND_KEY);
      if(!remote){cloudBusy=false;await pushCloud(loud);return}
      const rbooks=Array.isArray(remote.books)?remote.books:[];
      if(bound!==s.user.id){
        let merged;
        if(!books.length)merged=rbooks;else if(!rbooks.length)merged=books;else merged=mergeLibraries(rbooks,books);
        setBooksLocal(merged);localStorage.setItem(BOUND_KEY,s.user.id);setCloudStamp(remote.updated_at||'');cloudBusy=false;await pushCloud(loud);return;
      }
      const last=cloudStamp();
      if(remote.updated_at&&(!last||remote.updated_at>last)){
        setBooksLocal(rbooks);setCloudStamp(remote.updated_at);setCloudStatus('동기화 완료',s.user.email);if(loud)note('클라우드 서재를 불러왔습니다');
      }else setCloudStatus('동기화 완료',s.user.email);
    }catch(e){
      setCloudStatus(e.status===404?'클라우드 표 설정 필요':'동기화 실패');if(loud)note(e.status===404?'Supabase SQL 설정이 먼저 필요합니다':'클라우드 연결을 확인해주세요');
    }finally{cloudBusy=false}
  }

  // 기존 저장 함수에 클라우드 업로드를 연결합니다.
  const localSave=save;
  save=function(){localSave();schedulePush()};window.save=save;

  // UI
  const style=document.createElement('style');
  style.textContent=`
    .cloudbar{margin-top:10px;background:#eef7ff;border:1px solid #d6e8f6;border-radius:15px;padding:11px 13px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.cloudleft{display:flex;align-items:center;gap:9px;min-width:0}.cloudicon{width:34px;height:34px;border-radius:11px;background:#fff;display:grid;place-items:center;font-size:18px}.cloudtxt{min-width:0}.cloudtitle{font-size:12px;font-weight:900;color:#293440}.cloudsub{font-size:10px;color:#768493;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52vw}.cloudactions{display:flex;gap:6px}.cloudbtn{border:1px solid #d8e2ec;background:#fff;border-radius:9px;padding:7px 10px;font-size:11px;font-weight:800;color:#465361}.cloudbtn.main{background:#1d202d;color:#fff;border-color:#1d202d}.clouddlg .authmsg{font-size:11px;color:#737986;line-height:1.5;margin:-2px 0 12px}.authmode{display:flex;gap:6px;margin-bottom:13px}.authmode button{flex:1;border:1px solid #e0e2e8;background:#fff;border-radius:9px;padding:8px;font-size:12px;font-weight:800}.authmode button.on{background:#1d202d;color:#fff;border-color:#1d202d}
  `;document.head.appendChild(style);
  const notice=document.querySelector('.notice');
  if(notice&&!document.querySelector('#cloudBar'))notice.insertAdjacentHTML('afterend',`<section id="cloudBar" class="cloudbar"><div class="cloudleft"><div class="cloudicon">☁</div><div class="cloudtxt"><div class="cloudtitle">두 기기 클라우드 서재</div><div id="cloudStatus" class="cloudsub">로그인하면 두 핸드폰의 서재가 같아집니다</div></div></div><div id="cloudActions" class="cloudactions"><button class="cloudbtn main" id="cloudLogin">로그인</button></div></section>`);

  const cloudDlg=document.createElement('dialog');cloudDlg.className='clouddlg';cloudDlg.id='cloudDlg';cloudDlg.innerHTML=`<div class="dh"><h3>클라우드 서재</h3><button class="x" type="button" id="cloudClose">×</button></div><form id="cloudForm"><div class="authmode"><button type="button" class="on" data-mode="login">로그인</button><button type="button" data-mode="signup">처음 가입</button></div><div class="authmsg" id="authMsg">두 핸드폰에서 같은 이메일과 비밀번호로 로그인하세요.</div><div class="field"><label>이메일</label><input id="cloudEmail" type="email" autocomplete="email" required></div><div class="field"><label>비밀번호</label><input id="cloudPassword" type="password" autocomplete="current-password" minlength="6" required></div><div class="actions2"><button class="save" id="cloudSubmit">로그인</button></div></form>`;document.body.appendChild(cloudDlg);
  let authMode='login';
  function setCloudStatus(text,email=''){const e=document.querySelector('#cloudStatus');if(e)e.textContent=email?text+' · '+email:text}
  function updateCloudUI(){
    const a=document.querySelector('#cloudActions');if(!a)return;const s=cloudSession||loadSession();
    if(s?.user?.email){a.innerHTML='<button class="cloudbtn" id="cloudSync">지금 동기화</button><button class="cloudbtn" id="cloudLogout">로그아웃</button>';setCloudStatus('동기화 연결됨',s.user.email);document.querySelector('#cloudSync').onclick=()=>initialSync(true);document.querySelector('#cloudLogout').onclick=signOut}
    else{a.innerHTML='<button class="cloudbtn main" id="cloudLogin">로그인</button>';setCloudStatus('로그인하면 두 핸드폰의 서재가 같아집니다');document.querySelector('#cloudLogin').onclick=()=>cloudDlg.showModal()}
  }
  document.querySelector('#cloudClose').onclick=()=>cloudDlg.close();
  cloudDlg.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{authMode=b.dataset.mode;cloudDlg.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('on',x===b));document.querySelector('#cloudSubmit').textContent=authMode==='login'?'로그인':'계정 만들기';document.querySelector('#authMsg').textContent=authMode==='login'?'두 핸드폰에서 같은 이메일과 비밀번호로 로그인하세요.':'처음 한 번만 계정을 만든 뒤 이메일 확인이 필요할 수 있습니다.'});
  document.querySelector('#cloudForm').onsubmit=async e=>{
    e.preventDefault();const email=document.querySelector('#cloudEmail').value.trim(),password=document.querySelector('#cloudPassword').value;
    const btn=document.querySelector('#cloudSubmit');btn.disabled=true;btn.textContent='처리 중…';
    try{
      if(authMode==='signup'){
        const r=await signUp(email,password);
        if(r.confirm){document.querySelector('#authMsg').textContent='가입 확인 메일을 보냈습니다. 메일에서 확인한 뒤 이 화면에서 로그인하세요.';note('이메일 확인 후 로그인해주세요');authMode='login';cloudDlg.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('on',x.dataset.mode==='login'));return}
      }else await signIn(email,password);
      cloudDlg.close();note('클라우드 로그인 완료');await initialSync(true);
    }catch(err){document.querySelector('#authMsg').textContent='오류: '+(err.message||'로그인할 수 없습니다');note('로그인 정보를 확인해주세요')}
    finally{btn.disabled=false;btn.textContent=authMode==='login'?'로그인':'계정 만들기'}
  };

  cloudSession=loadSession();updateCloudUI();
  if(cloudSession)setTimeout(()=>initialSync(false),700);
  window.addEventListener('online',()=>{if(cloudSession)initialSync(false)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&cloudSession)initialSync(false)});
  setInterval(()=>{if(!document.hidden&&cloudSession)initialSync(false)},30000);

  const prevRender=render;
  render=function(){prevRender();const foot=document.querySelector('.foot');if(foot)foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v2.0 · 클라우드 동기화'};window.render=render;render();
})();