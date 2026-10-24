(() => {
  // Android 네이티브 래퍼 안에서는 원 서비스 버튼을 네이티브 Intent로 넘깁니다.
  // 일반 PWA/브라우저에서는 기존 링크 동작을 그대로 유지합니다.
  function platformFromLink(a){
    const label=(a?.textContent||'').toLowerCase();
    const u=(a?.href||'').toLowerCase();
    if(label.includes('리디')||u.includes('ridi')) return '리디';
    if(label.includes('시리즈')||u.includes('series.naver')||u.includes('naver.me')) return '시리즈';
    if(label.includes('카카오')||u.includes('page.kakao')||u.includes('kakaopage')||u.includes('kko.to')) return '카카오페이지';
    if(label.includes('미스터블루')||u.includes('mrblue')) return '미스터블루';
    return '';
  }
  document.addEventListener('click', e => {
    const a=e.target.closest('a.open');
    if(!a || !window.AndroidBridge || typeof window.AndroidBridge.openPlatform!=='function') return;
    e.preventDefault();
    e.stopPropagation();
    try{
      const title=(a.dataset&&a.dataset.bookTitle)||(a.closest('.card')?.querySelector('.ttl')?.textContent||'').trim();
      let nativeUrl=(a.dataset&&a.dataset.nativeUrl)||a.href||'';
      try{
        if(typeof books!=='undefined'&&title){
          const book=books.find(b=>String(b.title||'').trim()===title);
          if(book){
            const platform=(book.platforms||[]).find(x=>String(x.name||'').includes('시리즈'));
            nativeUrl=(platform&&platform.canonicalUrl)||book.canonicalUrl||book.sourceUrl||(platform&&platform.url)||nativeUrl;
          }
        }
      }catch(_){}
      if(typeof window.AndroidBridge.openPlatformV2==='function'){
        window.AndroidBridge.openPlatformV2(platformFromLink(a), nativeUrl, title);
      }else{
        window.AndroidBridge.openPlatform(platformFromLink(a), nativeUrl);
      }
    }catch(err){
      location.href=a.href;
    }
  }, true);

  // 책장형에서는 표지 탭을 최우선으로 원 서비스 열기에 사용합니다.
  // 기존 카드 onclick(수정창)이 남아 있어도 capture 단계에서 먼저 차단합니다.
  document.addEventListener('click', e => {
    const cover=e.target.closest('#grid.shelfMode .card .cover');
    if(!cover) return;

    if((window.__mwlShelfSuppressClickUntil||0)>Date.now()){
      e.preventDefault();
      e.stopPropagation();
      if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
      return;
    }

    const card=cover.closest('.card');
    if(!card) return;

    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();

    const openLink=card.querySelector('a.open');
    if(openLink){
      openLink.click();
      return;
    }

    // 링크 없는 작품만 수정창을 엽니다.
    try{
      const title=(card.querySelector('.ttl')?.textContent||cover.textContent||'').trim();
      const book=(typeof books!=='undefined')
        ? books.find(b=>String(b.title||'').trim()===title)
        : null;
      if(book&&typeof edit==='function') edit(book.id);
    }catch(_){}
  }, true);

  const foot=document.querySelector('.foot');
  if(foot) foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v2.4';
})();