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
      const nativeUrl=(a.dataset&&a.dataset.nativeUrl)||a.href||'';
      const title=(a.dataset&&a.dataset.bookTitle)||(a.closest('.card')?.querySelector('.ttl')?.textContent||'').trim();
      if(typeof window.AndroidBridge.openPlatformV2==='function'){
        window.AndroidBridge.openPlatformV2(platformFromLink(a), nativeUrl, title);
      }else{
        window.AndroidBridge.openPlatform(platformFromLink(a), nativeUrl);
      }
    }catch(err){
      location.href=a.href;
    }
  }, true);

  const foot=document.querySelector('.foot');
  if(foot) foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v2.4';
})();