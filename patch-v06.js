(() => {
  const RAW = window.__V06_SHARE_QUERY || '';
  const IS_ANDROID = /Android/i.test(navigator.userAgent);
  const SERIES_APP = 'https://app.nbooks.naver.com/naverbooks';

  function badAuthor(v=''){
    const a=String(v||'').replace(/\s+/g,' ').trim();
    if(!a)return true;
    return /^(이전\s*페이지|다음\s*페이지|작가\s*(정보\s*)?(확인\s*필요|미입력)|저자|글|NAVER|네이버|시리즈|미스터블루|RIDI|리디|카카오페이지|웹소설|웹툰|소설|만화|전체\s*이용가)$/i.test(a);
  }
  function tidyAuthor(v=''){
    let a=String(v||'').replace(/\s+/g,' ').trim();
    a=a.replace(/\s*(?:작가\s*신간.*|출판사.*|전체\s*이용가.*|15세.*|19세.*|12세.*)$/i,'').trim();
    return badAuthor(a)?'':a.slice(0,60);
  }
  function cleanMetaTitle(v=''){
    return String(v||'').replace(/\s+/g,' ').trim()
      .replace(/\s*[-|·:]\s*(?:NAVER\s*)?시리즈.*$/i,'')
      .replace(/\s*[-|·:]\s*(?:RIDI|리디|카카오페이지|미스터블루).*$/i,'')
      .replace(/\s+(?:NAVER\s*시리즈|네이버\s*시리즈|시리즈|RIDI|리디|카카오페이지|미스터블루)\s*$/i,'')
      .trim();
  }
  function typeFromUrl(u='',fallback='웹소설'){
    const x=String(u).toLowerCase();
    if(/\/webtoon\//.test(x)||/comic\/detail/.test(x))return '웹툰';
    if(/\/comic\//.test(x))return '만화';
    if(/\/ebook\//.test(x))return 'e북';
    if(/\/novel\//.test(x)||/novel\/detail/.test(x))return '웹소설';
    return fallback||'웹소설';
  }
  function authorFromPageText(text=''){
    const raw=String(text||'');
    const lines=raw.split(/\r?\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
    for(const line of lines.slice(0,300)){
      let m=line.match(/^(?:글|글쓴이|작가|저자)\s*[:：]?\s*(.{1,60})$/i);
      if(m){const a=tidyAuthor(m[1]);if(a)return a}
      m=line.match(/^(.{1,60}?)\s+(?:저자|작가)$/i);
      if(m){const a=tidyAuthor(m[1]);if(a)return a}
    }
    const c=raw.replace(/\s+/g,' ');
    for(const re of [
      /(?:^|\s)글\s*([가-힣A-Za-z0-9_().·,&-]{2,40})(?=\s*(?:그림|출판사|전체\s*이용가|15세|19세|12세|평점|완결|\||$))/,
      /(?:작가|저자)\s*[:：]?\s*([가-힣A-Za-z0-9_().·,&-]{2,40})(?=\s|$)/,
      /([가-힣A-Za-z0-9_().·,&-]{2,40})\s+저자\b/
    ]){const m=c.match(re);if(m){const a=tidyAuthor(m[1]);if(a)return a}}
    return '';
  }
  function rawSharedUrl(){
    if(!RAW)return '';
    const q=new URLSearchParams(RAW.startsWith('?')?RAW.slice(1):RAW);
    const vals=[q.get('share_url'),q.get('share_text'),q.get('share_title')];
    for(const v of vals){const m=String(v||'').match(/https?:\/\/[^\s<>"']+/i);if(m)return norm(m[0].replace(/[),.\]]+$/,''))}
    return '';
  }
  function preferredUrl(b,p){
    return norm(p?.shareUrl||b?.shareUrl||p?.url||p?.canonicalUrl||b?.canonicalUrl||b?.sourceUrl||'');
  }

  window.enrich = async function(b,loud=false){
    let p0=(b.platforms||[]).find(x=>x.shareUrl||x.url||x.canonicalUrl);
    let u=b.shareUrl||p0?.shareUrl||b.sourceUrl||p0?.url||b.canonicalUrl||p0?.canonicalUrl||'';
    if(!u){if(loud)note('원문 링크가 없어 정보를 가져올 수 없습니다');return b}
    if(loud)note('작품 정보를 가져오는 중…');
    try{
      const api=new URL('https://api.microlink.io/');
      api.searchParams.set('url',u);
      api.searchParams.set('data.pageText.selector','body');
      api.searchParams.set('data.pageText.attr','text');
      api.searchParams.set('data.pageText.type','string');
      const r=await fetch(api.toString()),j=await r.json();
      if(!r.ok||j.status!=='success')throw new Error('metadata');
      const d=j.data||{},cu=norm(d.url||u),p=plat(cu)||plat(u)||(b.platforms||[])[0]?.name||'';
      const mt=cleanMetaTitle(d.title||'');
      if(mt&&mt.length>1&&!/^(NAVER\s*시리즈|미스터블루|카카오페이지|리디)$/i.test(mt))b.title=mt;
      else b.title=cleanMetaTitle(b.title);
      let a=tidyAuthor(d.author||'');if(!a)a=authorFromPageText(d.pageText||'');
      if(a&&(!b.author||badAuthor(b.author)))b.author=a;
      if(b.author&&badAuthor(b.author))b.author='';
      if(d.image?.url&&!b.cover)b.cover=d.image.url;
      b.canonicalUrl=cu;b.sourceUrl=b.sourceUrl||u;b.type=typeFromUrl(cu,b.type);
      if(p&&P.includes(p)){
        b.platforms=b.platforms||[];
        let x=b.platforms.find(x=>x.name===p);
        if(!x){x={name:p,ownership:'소장(범위 미확인)',range:'',url:u};b.platforms.push(x)}
        x.canonicalUrl=cu;if(!x.url)x.url=u;
      }
      b.updatedAt=new Date().toISOString();
      localStorage.setItem(KEY,JSON.stringify(books));render();
      if(loud)note(b.author?'작가·표지 정보를 보강했습니다':'표지·링크 정보를 보강했습니다');
    }catch{
      b.title=cleanMetaTitle(b.title);if(b.author&&badAuthor(b.author))b.author='';
      localStorage.setItem(KEY,JSON.stringify(books));render();
      if(loud)note('자동 정보 조회가 제한되어 기본 정보만 유지합니다');
    }
    return b;
  };
  window.enrichById=id=>{const b=books.find(x=>x.id===id);if(b)enrich(b,true)};

  window.render = function(){
    migrate();
    document.querySelector('#nAll').textContent=books.length;
    document.querySelector('#nFull').textContent=books.filter(b=>(b.platforms||[]).some(x=>x.ownership==='전권 소장')).length;
    document.querySelector('#nRead').textContent=books.filter(b=>b.status==='읽는 중').length;
    document.querySelector('#nDone').textContent=books.filter(b=>b.status==='완독').length;
    let a=list();document.querySelector('#count').textContent=a.length+'개';
    document.querySelector('#grid').innerHTML=a.length?a.map(b=>{
      const badges=(b.platforms||[]).map(x=>`<span class="badge ${PC[x.name]||''}">${esc(x.name)}${x.range?' · '+esc(x.range):''}</span>`).join('');
      let links=(b.platforms||[]).slice(0,2).map(x=>{
        const u=preferredUrl(b,x);if(!u)return '';
        if(x.name==='시리즈'&&IS_ANDROID){
          return `<a class="open" href="${SERIES_APP}" target="_blank" rel="noopener">시리즈 앱</a><a class="mini" href="${esc(u)}" target="_blank" rel="noopener">작품 페이지</a>`;
        }
        return `<a class="open" href="${esc(u)}" target="_blank" rel="noopener">${esc(x.name)}에서 열기</a>`;
      }).join('');
      if(!links){const u=preferredUrl(b,null);if(u)links=`<a class="open" href="${esc(u)}" target="_blank" rel="noopener">원문에서 열기</a>`}
      return `<article class="card"><div class="cover">${b.cover?`<img src="${esc(b.cover)}" alt="">`:''}<span>${esc(b.title)}</span></div><div class="meta"><div class="ttl">${esc(b.title)}</div><div class="author">${esc(b.author||'작가 정보 확인 필요')} · ${esc(b.type||'웹소설')}</div><div class="badges"><span class="badge">${esc(b.status||'안 읽음')}</span>${badges}</div>${b.memo?`<div class="memo">${esc(b.memo)}</div>`:''}</div><div class="actions">${links||'<button class="mini" disabled>링크 없음</button>'}<button class="mini" onclick="enrichById('${b.id}')">정보 보강</button><button class="mini" onclick="edit('${b.id}')">수정</button></div></article>`;
    }).join(''):'<div class="empty">아직 등록된 작품이 없습니다.<br>원 앱에서 작품을 공유해 보세요.</div>';
  };

  const shared=rawSharedUrl();
  if(shared){
    const p=plat(shared);
    const recent=[...books].sort((a,b)=>(b.lastSharedAt||'').localeCompare(a.lastSharedAt||''))[0];
    if(recent){
      recent.shareUrl=shared;recent.sourceUrl=recent.sourceUrl||shared;
      recent.platforms=recent.platforms||[];
      if(p){let x=recent.platforms.find(x=>x.name===p);if(!x){x={name:p,ownership:'소장(범위 미확인)',range:'',url:shared};recent.platforms.push(x)}x.shareUrl=shared;if(!x.url)x.url=shared}
      localStorage.setItem(KEY,JSON.stringify(books));
    }
  }

  let changed=false;
  for(const b of books){
    const t=cleanMetaTitle(b.title);if(t&&t!==b.title){b.title=t;changed=true}
    if(b.author&&badAuthor(b.author)){b.author='';changed=true}
    b.platforms=b.platforms||[];
    if(!b.sourceUrl){const p=b.platforms.find(x=>x.url);if(p?.url){b.sourceUrl=p.url;changed=true}}
  }
  if(changed)localStorage.setItem(KEY,JSON.stringify(books));
  render();
  const recent=books.find(b=>b.lastSharedAt&&(Date.now()-Date.parse(b.lastSharedAt)<120000));
  if(recent)setTimeout(()=>enrich(recent,false),250);
})();
