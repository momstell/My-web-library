(() => {
  const sel=document.querySelector('#sortSelect');
  if(sel){
    const current=sel.value;
    sel.innerHTML=`
      <option value="recent">등록순</option>
      <option value="rating">평점순</option>
      <option value="title">이름순</option>`;
    if(['recent','rating','title'].includes(current)) sel.value=current;
    else {
      sel.value='recent';
      sel.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }
  const foot=document.querySelector('.foot');
  if(foot) foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v2.3';
})();
