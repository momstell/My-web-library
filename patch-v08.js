(() => {
  const RAW = window.__V08_SHARE_QUERY || '';
  const RIDI_APP_HOSTS = ['link.ridi.com','ridi.abr.ge','ridi.airbridge.io'];

  function allUrlsFromRaw(){
    if(!RAW) return [];
    const q=new URLSearchParams(RAW.startsWith('?')?RAW.slice(1):RAW);
    const vals=[q.get('share_url')||'',q.get('share_text')||'',q.get('share_title')||''];
    const out=[];
    for(const v of vals){
      const ms=String(v).match(/https?:\/\/[^\s<>"']+/ig)||[];
      for(let u of ms){
        u=u.replace(/[),.\]]+$/,'');
        try{u=new URL(u).toString()}catch{}
        if(u&&!out.includes(u))out.push(u);
      }
    }
    return out;
  }
  function host(u=''){try{return new URL(u).hostname.toLowerCase()}catch{return''}}
  function platformOfUrls(urls){
    for(const u of urls){const p=plat(u);if(p)return p}
    return '';
  }
  function scoreUrl(p,u){
    const h=host(u);
    if(p==='리디'){
      if(h==='link.ridi.com')return 100;
      if(h==='ridi.abr.ge')return 99;
      if(h==='ridi.airbridge.io')return 98;
      if(h==='ridi.page.link')return 90;
      if(/(^|\.)ridibooks\.com$/.test(h))return 60;
      if(/(^|\.)ridi\.com$/.test(h))return 55;
    }
    if(p==='시리즈'){
      if(h==='naver.me')return 100;
      if(h==='series.naver.com')return 80;
    }
    if(p==='카카오페이지'){
      if(h==='kko.to')return 100;
      if(h==='page.kakao.com')return 80;
    }
    if(p==='미스터블루'){
      if(/(^|\.)mrblue\.com$/.test(h))return 90;
    }
    return 10;
  }
  function chooseBest(urls,p){
    return [...urls].sort((a,b)=>scoreUrl(p,b)-scoreUrl(p,a))[0]||'';
  }
  function primaryUrl(b,p){
    const urls=[];
    for(const u of [...(p?.shareUrls||[]),p?.shareUrl,b?.shareUrl,...(b?.shareUrls||[]),p?.url,b?.sourceUrl,p?.canonicalUrl,b?.canonicalUrl]){
      if(u&&!urls.includes(u))urls.push(u);
    }
    return chooseBest(urls,p?.name||platformOfUrls(urls));
  }
  function canonicalUrl(b,p){return p?.canonicalUrl||b?.canonicalUrl||p?.url||b?.sourceUrl||''}
  function isRidiNativeUrl(u){return RIDI_APP_HOSTS.includes(host(u))}
  function cleanTitle(v=''){
    return String(v||'').replace(/\s+/g,' ').trim()
      .replace(/\s*[-|·:]\s*(?:NAVER\s*)?시리즈.*$/i,'')
      .replace(/\s*[-|·:]\s*(?:RIDI|리디|카카오페이지|미스터블루).*$/i,'')
      .replace(/\s+(?:NAVER\s*시리즈|네이버\s*시리즈|시리즈|RIDI|리디|카카오페이지|미스터블루)\s*$/i,'').trim();
  }

  const sharedUrls=allUrlsFromRaw();
  if(sharedUrls.length){
    setTimeout(()=>{
      const recent=[...books].sort((a,b)=>(b.lastSharedAt||'').localeCompare(a.lastSharedAt||''))[0];
      if(!recent)return;
      const pName=platformOfUrls(sharedUrls)||(recent.platforms||[])[0]?.name||'';
      const best=chooseBest(sharedUrls,pName);
      recent.shareUrls=sharedUrls;
      recent.shareUrl=best;
      recent.sourceUrl=recent.sourceUrl||best;
      recent.platforms=recent.platforms||[];
      if(pName){
        let p=recent.platforms.find(x=>x.name===pName);
        if(!p){p={name:pName,ownership:'소장(범위 미확인)',range:'',url:best};recent.platforms.push(p)}
        p.shareUrls=sharedUrls;
        p.shareUrl=best;
        if(!p.url)p.url=best;
      }
      localStorage.setItem(KEY,JSON.stringify(books));
      render();
    },100);
  }

  window.showLinkDiag=function(id){
    const b=books.find(x=>x.id===id);if(!b)return;
    const rows=[];
    for(const p of (b.platforms||[])){
      const urls=[];
      for(const u of [...(p.shareUrls||[]),p.shareUrl,b.shareUrl,...(b.shareUrls||[]),p.url,b.sourceUrl,p.canonicalUrl,b.canonicalUrl])if(u&&!urls.includes(u))urls.push(u);
      rows.push(`${p.name}\n`+urls.map((u,i)=>`${i+1}. ${host(u)}\n${u}`).join('\n'));
    }
    const text=`작품: ${b.title}\n\n${rows.join('\n\n')}`;
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).catch(()=>{});
    alert(text+'\n\n(진단 내용은 클립보드에도 복사됩니다)');
  };

  window.render=function(){
    migrate();
    $('#nAll').textContent=books.length;
    $('#nFull').textContent=books.filter(b=>(b.platforms||[]).some(x=>x.ownership==='전권 소장')).length;
    $('#nRead').textContent=books.filter(b=>b.status==='읽는 중').length;
    $('#nDone').textContent=books.filter(b=>b.status==='완독').length;
    const a=list();$('#count').textContent=a.length+'개';
    $('#grid').innerHTML=a.length?a.map(b=>{
      const badges=(b.platforms||[]).map(x=>`<span class="badge ${PC[x.name]||''}">${esc(x.name)}${x.range?' · '+esc(x.range):''}</span>`).join('');
      let links=(b.platforms||[]).filter(p=>primaryUrl(b,p)).slice(0,2).map(p=>{
        const u=primaryUrl(b,p), cu=canonicalUrl(b,p), h=host(u);
        let label=`${p.name} 열기`;
        if(p.name==='리디')label=isRidiNativeUrl(u)?'리디 앱으로 열기':'리디 웹 열기';
        else if(p.name==='시리즈')label='시리즈 열기';
        else if(p.name==='미스터블루')label='미스터블루 열기';
        else if(p.name==='카카오페이지')label='카카오페이지 열기';
        const web=(cu&&cu!==u)?`<a class="mini" href="${esc(cu)}" target="_blank" rel="noopener">웹</a>`:'';
        return `<a class="open" href="${esc(u)}">${label}</a>${web}`;
      }).join('');
      if(!links){const u=primaryUrl(b,null);if(u)links=`<a class="open" href="${esc(u)}">원문 열기</a>`}
      const p0=(b.platforms||[])[0],u0=p0?primaryUrl(b,p0):primaryUrl(b,null),h0=host(u0);
      const linkInfo=h0?`<div class="memo">연결 주소: ${esc(h0)}${p0?.name==='리디'?(isRidiNativeUrl(u0)?' · 앱 지원 주소':' · 리디 앱 지원 주소 아님'):''}</div>`:'';
      return `<article class="card"><div class="cover">${b.cover?`<img src="${esc(b.cover)}" alt="">`:''}<span>${esc(cleanTitle(b.title))}</span></div><div class="meta"><div class="ttl">${esc(cleanTitle(b.title))}</div><div class="author">${esc(b.author||'작가 정보 확인 필요')} · ${esc(b.type||'웹소설')}</div><div class="badges"><span class="badge">${esc(b.status||'안 읽음')}</span>${badges}</div>${b.memo?`<div class="memo">${esc(b.memo)}</div>`:''}${linkInfo}</div><div class="actions">${links||'<button class="mini" disabled>링크 없음</button>'}<button class="mini" onclick="enrichById('${b.id}')">정보 보강</button><button class="mini" onclick="showLinkDiag('${b.id}')">링크 진단</button><button class="mini" onclick="edit('${b.id}')">수정</button></div></article>`;
    }).join(''):'<div class="empty">아직 등록된 작품이 없습니다.<br>원 앱에서 작품을 공유해 보세요.</div>';
    const foot=document.querySelector('.foot');if(foot)foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v0.8';
  };

  for(const b of books){b.title=cleanTitle(b.title)}
  localStorage.setItem(KEY,JSON.stringify(books));
  render();
})();