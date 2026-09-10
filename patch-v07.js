(() => {
  const RAW = window.__V07_SHARE_QUERY || '';
  const SHORT_LINK = /ridi\.page\.link|naver\.me|kko\.to|mrblue\.com/i;

  function rawSharedUrl(){
    if(!RAW) return '';
    const q=new URLSearchParams(RAW.startsWith('?')?RAW.slice(1):RAW);
    for(const v of [q.get('share_url'),q.get('share_text'),q.get('share_title')]){
      const m=String(v||'').match(/https?:\/\/[^\s<>"']+/i);
      if(m) return norm(m[0].replace(/[),.\]]+$/,''));
    }
    return '';
  }
  function preferred(b,p){
    return norm(p?.shareUrl||b?.shareUrl||p?.url||b?.sourceUrl||p?.canonicalUrl||b?.canonicalUrl||'');
  }
  function canonical(b,p){
    return norm(p?.canonicalUrl||b?.canonicalUrl||p?.url||b?.sourceUrl||'');
  }
  function cleanTitle(v=''){
    return String(v||'').replace(/\s+/g,' ').trim()
      .replace(/\s*[-|·:]\s*(?:NAVER\s*)?시리즈.*$/i,'')
      .replace(/\s*[-|·:]\s*(?:RIDI|리디|카카오페이지|미스터블루).*$/i,'')
      .replace(/\s+(?:NAVER\s*시리즈|네이버\s*시리즈|시리즈|RIDI|리디|카카오페이지|미스터블루)\s*$/i,'').trim();
  }

  const shared=rawSharedUrl();
  if(shared){
    setTimeout(()=>{
      const recent=[...books].sort((a,b)=>(b.lastSharedAt||'').localeCompare(a.lastSharedAt||''))[0];
      if(!recent) return;
      const pName=plat(shared);
      recent.shareUrl=shared;
      recent.sourceUrl=recent.sourceUrl||shared;
      recent.platforms=recent.platforms||[];
      if(pName){
        let p=recent.platforms.find(x=>x.name===pName);
        if(!p){p={name:pName,ownership:'소장(범위 미확인)',range:'',url:shared};recent.platforms.push(p)}
        p.shareUrl=shared;
        if(!p.url || SHORT_LINK.test(shared)) p.url=shared;
      }
      localStorage.setItem(KEY,JSON.stringify(books));
      render();
    },80);
  }

  let changed=false;
  for(const b of books){
    const t=cleanTitle(b.title); if(t&&t!==b.title){b.title=t;changed=true}
    b.platforms=b.platforms||[];
    for(const p of b.platforms){
      if(!p.shareUrl && p.url && /ridi\.page\.link|naver\.me|kko\.to/i.test(p.url)){p.shareUrl=p.url;changed=true}
    }
    if(!b.shareUrl){
      const p=b.platforms.find(x=>x.shareUrl);
      if(p?.shareUrl){b.shareUrl=p.shareUrl;changed=true}
    }
  }
  if(changed)localStorage.setItem(KEY,JSON.stringify(books));

  window.render=function(){
    migrate();
    $('#nAll').textContent=books.length;
    $('#nFull').textContent=books.filter(b=>(b.platforms||[]).some(x=>x.ownership==='전권 소장')).length;
    $('#nRead').textContent=books.filter(b=>b.status==='읽는 중').length;
    $('#nDone').textContent=books.filter(b=>b.status==='완독').length;
    const a=list(); $('#count').textContent=a.length+'개';
    $('#grid').innerHTML=a.length?a.map(b=>{
      const badges=(b.platforms||[]).map(x=>`<span class="badge ${PC[x.name]||''}">${esc(x.name)}${x.range?' · '+esc(x.range):''}</span>`).join('');
      const ps=(b.platforms||[]).filter(x=>preferred(b,x)).slice(0,2);
      let links=ps.map(p=>{
        const u=preferred(b,p), cu=canonical(b,p), hasWeb=cu&&cu!==u;
        return `<a class="open" href="${esc(u)}">${esc(p.name)} 열기</a>${hasWeb?`<a class="mini" href="${esc(cu)}" target="_blank" rel="noopener">웹</a>`:''}`;
      }).join('');
      if(!links){const u=preferred(b,null);if(u)links=`<a class="open" href="${esc(u)}">원문 열기</a>`}
      return `<article class="card"><div class="cover">${b.cover?`<img src="${esc(b.cover)}" alt="">`:''}<span>${esc(b.title)}</span></div><div class="meta"><div class="ttl">${esc(b.title)}</div><div class="author">${esc(b.author||'작가 정보 확인 필요')} · ${esc(b.type||'웹소설')}</div><div class="badges"><span class="badge">${esc(b.status||'안 읽음')}</span>${badges}</div>${b.memo?`<div class="memo">${esc(b.memo)}</div>`:''}</div><div class="actions">${links||'<button class="mini" disabled>링크 없음</button>'}<button class="mini" onclick="enrichById('${b.id}')">정보 보강</button><button class="mini" onclick="edit('${b.id}')">수정</button></div></article>`;
    }).join(''):'<div class="empty">아직 등록된 작품이 없습니다.<br>원 앱에서 작품을 공유해 보세요.</div>';
    const foot=document.querySelector('.foot'); if(foot) foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v0.7';
  };

  render();
})();