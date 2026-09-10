(() => {
  const VIEW_KEY='mwl_view_v22';
  const SORT_KEY='mwl_sort_v22';
  let viewMode=localStorage.getItem(VIEW_KEY)||'list';
  let sortMode=localStorage.getItem(SORT_KEY)||'recent';

  // 큰 통계 카드와 긴 안내 박스는 숨기고, 필요한 정보만 한 줄 요약으로 대체합니다.
  const stats=document.querySelector('.stats');
  if(stats) stats.style.display='none';
  const notice=document.querySelector('.notice');
  if(notice) notice.style.display='none';

  const style=document.createElement('style');
  style.textContent=`
    .libraryCompact{margin:12px 0 4px;display:flex;align-items:center;justify-content:space-between;gap:9px;flex-wrap:wrap}
    .quickStats{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;max-width:100%;padding-bottom:1px}
    .quickStats::-webkit-scrollbar{display:none}
    .quickStat{border:1px solid #e2e4ec;background:#fff;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:800;color:#5f6572;white-space:nowrap}
    .quickStat strong{color:#1b1e29;margin-left:3px;font-size:12px}
    .quickStat.on{background:#1d202d;border-color:#1d202d;color:#fff}
    .quickStat.on strong{color:#fff}
    .viewTools{display:flex;align-items:center;gap:6px;margin-left:auto}
    .viewToggle{display:flex;background:#eceef5;border-radius:10px;padding:3px;gap:2px}
    .viewBtn{border:0;background:transparent;color:#777d89;border-radius:8px;padding:7px 9px;font-size:11px;font-weight:850;white-space:nowrap}
    .viewBtn.on{background:#fff;color:#1d202d;box-shadow:0 1px 5px rgba(24,27,40,.08)}
    .sortSelect{height:34px;border:1px solid #e0e2ea;background:#fff;color:#555b68;border-radius:10px;padding:0 8px;font-size:11px;font-weight:750;outline:none}
    .shelfHint{display:none;color:#9297a3;font-size:10px;margin:6px 1px 2px}
    .toolbar{margin-top:12px}
    #ratingFilters{margin-top:7px}

    #grid.shelfMode{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px 8px;align-items:start}
    #grid.shelfMode .card{display:block;padding:0;border:0;border-radius:10px;background:transparent;box-shadow:none;min-width:0;cursor:pointer}
    #grid.shelfMode .cover{width:100%;height:auto;aspect-ratio:2/3;border-radius:9px;padding:6px;font-size:10px;box-shadow:0 3px 10px rgba(26,30,45,.10);background:linear-gradient(145deg,#b37bc4,#603253)}
    #grid.shelfMode .cover span{font-size:10px;line-height:1.2}
    #grid.shelfMode .meta,#grid.shelfMode .actions{display:none!important}
    #grid.shelfMode .empty{grid-column:1/-1}
    #grid.shelfMode .card:active{transform:scale(.98)}

    @media(max-width:720px){
      .main{padding-top:12px}
      .libraryCompact{align-items:stretch}
      .quickStats{width:100%}
      .viewTools{width:100%;justify-content:space-between;margin-left:0}
      .viewToggle{flex:1}
      .viewBtn{flex:1}
      .sortSelect{width:122px}
      .toolbar{margin:10px 0 8px}
      #pf,#sf,#ratingFilters{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
      #pf::-webkit-scrollbar,#sf::-webkit-scrollbar,#ratingFilters::-webkit-scrollbar{display:none}
      #pf .chip,#sf .chip,#ratingFilters .chip{white-space:nowrap;flex:0 0 auto}
      .shelfHint.show{display:block}
    }
  `;
  document.head.appendChild(style);

  const compact=document.createElement('section');
  compact.className='libraryCompact';
  compact.id='libraryCompact';
  compact.innerHTML=`
    <div class="quickStats" id="quickStats">
      <button class="quickStat" data-q="all">전체 <strong id="qAll">0</strong></button>
      <button class="quickStat" data-q="done">완독 <strong id="qDone">0</strong></button>
      <button class="quickStat" data-q="reading">읽는 중 <strong id="qReading">0</strong></button>
      <button class="quickStat" data-q="reread">재탕 <strong id="qReread">0</strong></button>
    </div>
    <div class="viewTools">
      <div class="viewToggle" aria-label="보기 방식">
        <button class="viewBtn" data-view="list">☰ 리스트</button>
        <button class="viewBtn" data-view="shelf">▦ 책장</button>
      </div>
      <select class="sortSelect" id="sortSelect" aria-label="정렬">
        <option value="recent">최근 등록순</option>
        <option value="rating">만족도 높은순</option>
        <option value="title">작품명순</option>
        <option value="author">작가명순</option>
      </select>
    </div>`;

  const cloud=document.querySelector('#cloudBar');
  const toolbar=document.querySelector('.toolbar');
  if(cloud) cloud.insertAdjacentElement('afterend',compact);
  else if(toolbar) toolbar.insertAdjacentElement('beforebegin',compact);

  const hint=document.createElement('div');
  hint.id='shelfHint';
  hint.className='shelfHint';
  hint.textContent='표지를 누르면 작품 정보를 수정할 수 있습니다.';
  const titlebar=document.querySelector('.titlebar');
  if(titlebar) titlebar.insertAdjacentElement('beforebegin',hint);

  // 현재 필터 결과 안에서 정렬만 바꿉니다.
  const listBefore22=list;
  list=function(){
    const arr=[...listBefore22()];
    const txt=v=>String(v||'').trim();
    if(sortMode==='rating') arr.sort((a,b)=>(Number(b.rating||0)-Number(a.rating||0))||txt(a.title).localeCompare(txt(b.title),'ko'));
    else if(sortMode==='title') arr.sort((a,b)=>txt(a.title).localeCompare(txt(b.title),'ko'));
    else if(sortMode==='author') arr.sort((a,b)=>txt(a.author).localeCompare(txt(b.author),'ko')||txt(a.title).localeCompare(txt(b.title),'ko'));
    else arr.sort((a,b)=>String(b.updatedAt||b.lastSharedAt||'').localeCompare(String(a.updatedAt||a.lastSharedAt||'')));
    return arr;
  };
  window.list=list;

  function clickChip(selector){
    const el=document.querySelector(selector);
    if(el) el.click();
  }
  function resetRating(){clickChip('#ratingFilters [data-r="all"]')}
  function resetStatus(){clickChip('#sf [data-s="all"]')}

  document.querySelector('#quickStats')?.addEventListener('click',e=>{
    const q=e.target.closest('[data-q]')?.dataset.q;
    if(!q)return;
    document.querySelectorAll('.quickStat').forEach(x=>x.classList.remove('on'));
    e.target.closest('[data-q]').classList.add('on');
    if(q==='all'){resetStatus();resetRating()}
    if(q==='done'){resetRating();clickChip('#sf [data-s="완독"]')}
    if(q==='reading'){resetRating();clickChip('#sf [data-s="읽는 중"]')}
    if(q==='reread'){resetStatus();clickChip('#ratingFilters [data-r="reread"]')}
  });

  document.querySelectorAll('.viewBtn').forEach(btn=>btn.addEventListener('click',()=>{
    viewMode=btn.dataset.view;
    localStorage.setItem(VIEW_KEY,viewMode);
    render();
  }));
  const sortSelect=document.querySelector('#sortSelect');
  if(sortSelect){
    sortSelect.value=sortMode;
    sortSelect.addEventListener('change',()=>{
      sortMode=sortSelect.value;
      localStorage.setItem(SORT_KEY,sortMode);
      render();
    });
  }

  const renderBefore22=render;
  render=function(){
    renderBefore22();
    const arr=list();
    const grid=document.querySelector('#grid');
    if(grid){
      grid.classList.toggle('shelfMode',viewMode==='shelf');
      const cards=[...grid.querySelectorAll('.card')];
      cards.forEach((card,i)=>{
        const b=arr[i];
        if(!b)return;
        if(viewMode==='shelf'){
          card.onclick=e=>{if(e.target.closest('a,button,input,select,textarea'))return;edit(b.id)};
          card.setAttribute('aria-label',`${b.title||'작품'} 정보 열기`);
          card.tabIndex=0;
          card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();edit(b.id)}};
        }else{
          card.onclick=null;card.onkeydown=null;card.removeAttribute('aria-label');card.removeAttribute('tabindex');
        }
      });
    }
    document.querySelectorAll('.viewBtn').forEach(x=>x.classList.toggle('on',x.dataset.view===viewMode));
    const sh=document.querySelector('#shelfHint');if(sh)sh.classList.toggle('show',viewMode==='shelf');
    const qAll=document.querySelector('#qAll'),qDone=document.querySelector('#qDone'),qReading=document.querySelector('#qReading'),qReread=document.querySelector('#qReread');
    if(qAll)qAll.textContent=books.length;
    if(qDone)qDone.textContent=books.filter(b=>b.status==='완독').length;
    if(qReading)qReading.textContent=books.filter(b=>b.status==='읽는 중').length;
    if(qReread)qReread.textContent=books.filter(b=>b.status==='완독'&&Number(b.rating||0)>=4).length;
    const foot=document.querySelector('.foot');if(foot)foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v2.2';
  };
  window.render=render;
  render();
})();