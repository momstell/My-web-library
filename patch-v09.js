(() => {
  function badAuthor09(v=''){
    const a=String(v||'').replace(/\s+/g,' ').trim();
    if(!a) return true;
    return /^(이전\s*페이지|다음\s*페이지|작가\s*(정보\s*)?(확인\s*필요|미입력)|저자|글|원작|NAVER|네이버|시리즈|미스터블루|RIDI|리디|카카오페이지|웹소설|웹툰|소설|만화|전체\s*이용가)$/i.test(a);
  }
  function tidyAuthor09(v=''){
    let a=String(v||'').replace(/[\u00a0\t\r\n]+/g,' ').replace(/\s+/g,' ').trim();
    a=a.replace(/^(?:글|작가|저자|원작)\s*[:：]?\s*/i,'').trim();
    a=a.replace(/\s*(?:출판사|그림|웹소설|웹툰|로맨스|로판|판타지|현판|무협|BL|미스터리|라이트노벨|전체\s*이용가|15세\s*이용가|19세\s*이용가|12세\s*이용가).*$/i,'').trim();
    if(a.length>60) a=a.slice(0,60).trim();
    return badAuthor09(a)?'':a;
  }
  function titleCore09(v=''){
    return String(v||'').replace(/\s*\[[^\]]+\]\s*/g,' ').replace(/\s+/g,' ').trim();
  }
  function corpus09(d={}){
    const vals=[];
    for(const k of ['author','description','title','pageText']){
      const v=d?.[k];
      if(typeof v==='string'&&v.trim()) vals.push(v);
    }
    return vals.join('\n');
  }
  function authorFrom09(d,b,platform=''){
    const direct=tidyAuthor09(d?.author||'');
    if(direct) return direct;
    const raw=corpus09(d), flat=raw.replace(/[\u00a0\t\r\n]+/g,' ').replace(/\s+/g,' ').trim();
    const lines=raw.split(/\r?\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);

    for(const line of lines.slice(0,500)){
      let m=line.match(/^(?:글|작가|저자|원작)\s*[:：]?\s*(.{1,60}?)(?=\s*(?:출판사|그림|웹소설|웹툰|전체\s*이용가|15세|19세|12세|$))/i);
      if(m){const a=tidyAuthor09(m[1]);if(a)return a}
      m=line.match(/^(.{1,60}?)\s+(?:저자|작가)$/i);
      if(m){const a=tidyAuthor09(m[1]);if(a)return a}
    }

    const common=[
      /(?:^|\s)글\s*[:：]?\s*([가-힣A-Za-z0-9_().·,&\- ]{1,50}?)(?=\s*(?:출판사|그림|전체\s*이용가|15세|19세|12세|평점|완결|연재|\||$))/i,
      /(?:작가|저자|원작)\s*[:：]?\s*([가-힣A-Za-z0-9_().·,&\- ]{1,50}?)(?=\s*(?:출판사|그림|전체\s*이용가|15세|19세|12세|평점|완결|연재|\||$))/i,
      /([가-힣A-Za-z0-9_().·,&\- ]{1,50}?)\s+(?:저자|작가)\b/i
    ];
    for(const re of common){const m=flat.match(re);if(m){const a=tidyAuthor09(m[1]);if(a)return a}}

    if(platform==='시리즈'){
      for(const re of [
        /작가\s*([가-힣A-Za-z0-9_().·,&\- ]{1,40}?)\s*의\s*다른\s*(?:웹소설|만화|e북)/i,
        /평점\s*[0-9.]+\s*\|\s*([가-힣A-Za-z0-9_().·,&\- ]{1,40}?)\s*\|\s*20\d{2}[.\-/]/i,
        /(?:완결|미완결)\s+(?:로맨스|로판|판타지|현판|무협|미스터리|라이트노벨|BL)?\s*글\s*([가-힣A-Za-z0-9_().·,&\- ]{1,40}?)\s*출판사/i
      ]){const m=flat.match(re);if(m){const a=tidyAuthor09(m[1]);if(a)return a}}
    }

    if(platform==='카카오페이지'){
      const t=titleCore09(b?.title||'');
      if(t){
        const idx=flat.indexOf(t);
        if(idx>=0){
          const tail=flat.slice(idx+t.length,idx+t.length+140);
          const m=tail.match(/^\s*([가-힣A-Za-z0-9_().·,&\- ]{1,40}?)\s+(?:웹소설|웹툰)\b/i);
          if(m){const a=tidyAuthor09(m[1]);if(a)return a}
        }
      }
    }

    if(platform==='리디'){
      const m=flat.match(/([가-힣A-Za-z0-9_().·,&\- ]{1,40}?)\s+저자\b/i);
      if(m){const a=tidyAuthor09(m[1]);if(a)return a}
    }
    return '';
  }

  async function serverMeta09(url,b,platform=''){
    const api=new URL('https://ncbdmzuwhphdstxcahxk.supabase.co/functions/v1/book-meta-resolver');
    api.searchParams.set('url',url);
    api.searchParams.set('title',b?.title||'');
    api.searchParams.set('platform',platform||'');
    const r=await fetch(api.toString(),{headers:{'Accept':'application/json'}});
    const j=await r.json();
    if(!r.ok||!j?.ok) throw new Error(j?.error||'metadata');
    return j;
  }

  async function microlink09(url){
    const api=new URL('https://api.microlink.io/');
    api.searchParams.set('url',url);
    api.searchParams.set('data.pageText.selector','body');
    api.searchParams.set('data.pageText.attr','text');
    api.searchParams.set('data.pageText.type','string');
    const r=await fetch(api.toString());
    const j=await r.json();
    if(!r.ok||j.status!=='success') throw new Error('metadata');
    return j.data||{};
  }

  enrich = async function(b,loud=false){
    let p0=(b.platforms||[]).find(x=>x.shareUrl||x.url||x.canonicalUrl);
    let u=b.shareUrl||p0?.shareUrl||b.sourceUrl||p0?.url||b.canonicalUrl||p0?.canonicalUrl||'';
    if(!u){if(loud)note('원문 링크가 없어 정보를 가져올 수 없습니다');return b}
    if(loud)note('작품 정보를 자동으로 가져오는 중…');

    let platform=plat(u)||(b.platforms||[])[0]?.name||'';
    let got=false;

    try{
      const d=await serverMeta09(u,b,platform);
      const mt=String(d.title||'').replace(/\s+/g,' ').trim();
      const au=tidyAuthor09(d.author||'');
      const cv=String(d.cover||'').trim();
      const cu=norm(d.canonicalUrl||u);

      if(mt&&mt.length>1&&!/^(NAVER\s*시리즈|미스터블루|카카오페이지|리디)$/i.test(mt)) b.title=mt;
      if(au&&(!b.author||badAuthor09(b.author))) b.author=au;
      if(cv&&(!b.cover||String(b.cover).startsWith('data:image/'))) b.cover=cv;
      if(cu)b.canonicalUrl=cu;
      b.sourceUrl=b.sourceUrl||u;

      platform=d.platform||platform||plat(cu);
      if(platform&&P.includes(platform)){
        b.platforms=b.platforms||[];
        let p=b.platforms.find(x=>x.name===platform);
        if(!p){p={name:platform,ownership:'소장(범위 미확인)',range:'',url:u};b.platforms.push(p)}
        if(cu)p.canonicalUrl=cu;
      }
      got=!!(mt||au||cv);
    }catch{}

    // 서버 resolver에서 못 얻은 항목만 기존 Microlink로 보조합니다.
    if(!got || !b.author || !b.cover){
      try{
        let d=await microlink09(u);
        let cu=norm(d.url||u);
        platform=plat(cu)||plat(u)||platform||(b.platforms||[])[0]?.name||'';
        let a=authorFrom09(d,b,platform);

        if(!a && cu && norm(cu)!==norm(u)){
          try{
            const d2=await microlink09(cu);
            d={...d,...d2,pageText:d2.pageText||d.pageText,description:d2.description||d.description,title:d2.title||d.title,author:d2.author||d.author,image:d2.image||d.image,url:d2.url||d.url};
            cu=norm(d.url||cu);
            platform=plat(cu)||platform;
            a=authorFrom09(d,b,platform);
          }catch{}
        }

        const mt=String(d.title||'').replace(/\s+/g,' ').trim()
          .replace(/\s*[-|·:]\s*(?:NAVER\s*)?시리즈.*$/i,'')
          .replace(/\s*[-|·:]\s*(?:RIDI|리디|카카오페이지|미스터블루).*$/i,'')
          .replace(/\s+(?:NAVER\s*시리즈|네이버\s*시리즈|시리즈|RIDI|리디|카카오페이지|미스터블루)\s*$/i,'').trim();

        if(mt&&mt.length>1&&!/^(NAVER\s*시리즈|미스터블루|카카오페이지|리디)$/i.test(mt) && (!b.title||b.title.startsWith('제목 확인 필요'))) b.title=mt;
        if(a && (!b.author||badAuthor09(b.author))) b.author=a;
        if(d.image?.url&&!b.cover)b.cover=d.image.url;
        if(cu)b.canonicalUrl=b.canonicalUrl||cu;
      }catch{}
    }

    if(b.author&&badAuthor09(b.author)) b.author='';
    b.updatedAt=new Date().toISOString();
    localStorage.setItem(KEY,JSON.stringify(books));
    render();

    if(loud){
      if(b.title&&!b.title.startsWith('제목 확인 필요')&&b.author&&b.cover) note('제목·작가·표지를 자동 보강했습니다');
      else if(b.cover||b.author) note('가져올 수 있는 작품 정보를 보강했습니다');
      else note('자동 정보 조회가 제한되어 기본 정보만 유지합니다');
    }
    return b;
  };
  window.enrich=enrich;
  window.enrichById=id=>{const b=books.find(x=>x.id===id);if(b)enrich(b,true)};

  const render08=render;
  render=function(){
    render08();
    const foot=document.querySelector('.foot');
    if(foot)foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v0.9';
  };
  window.render=render;
  render();

  // 막 공유된 작품은 제목·작가·표지 상태와 관계없이 새 resolver로 한 번 확정 보강합니다.
  setTimeout(()=>{
    const recent=[...books].sort((a,b)=>(b.lastSharedAt||'').localeCompare(a.lastSharedAt||''))[0];
    if(recent && recent.lastSharedAt && Date.now()-Date.parse(recent.lastSharedAt)<180000){
      enrich(recent,false);
    }
  },900);

  // 기존 서재도 이번 버전에서 한 번만, 누락된 작품만 천천히 자동 보강합니다.
  const BACKFILL_KEY='mwl_meta_backfill_v27';
  if(!localStorage.getItem(BACKFILL_KEY)){
    localStorage.setItem(BACKFILL_KEY,'started');
    const pending=books.filter(b=>
      !b.author || badAuthor09(b.author) || !b.cover ||
      !b.title || String(b.title).startsWith('제목 확인 필요')
    );
    (async()=>{
      for(const b of pending){
        try{ await enrich(b,false); }catch{}
        await new Promise(r=>setTimeout(r,450));
      }
      localStorage.setItem(BACKFILL_KEY,'done');
      if(pending.length) note('기존 작품의 누락 정보도 자동 보강했습니다');
    })();
  }
})();