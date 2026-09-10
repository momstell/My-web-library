(() => {
  const BAD='https://ncbdmzuwphdstxcahxk.supabase.co';
  const GOOD='https://ncbdmzuwhphdstxcahxk.supabase.co';
  const originalFetch=window.fetch.bind(window);

  window.fetch=function(input,init){
    if(typeof input==='string' && input.startsWith(BAD)) input=GOOD+input.slice(BAD.length);
    else if(input instanceof URL && input.href.startsWith(BAD)) input=new URL(GOOD+input.href.slice(BAD.length));
    return originalFetch(input,init);
  };

  // 이전 잘못된 주소 때문에 남아 있던 오류 문구를 정리합니다.
  setTimeout(()=>{
    const msg=document.querySelector('#authMsg');
    if(msg && /Failed to fetch/i.test(msg.textContent||'')){
      msg.textContent='두 핸드폰에서 같은 이메일과 비밀번호로 로그인하세요.';
    }
    const foot=document.querySelector('.foot');
    if(foot)foot.textContent='콘텐츠는 원 서비스에서 열립니다 · v2.0.1 클라우드 동기화';
  },50);
})();
