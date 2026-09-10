(() => {
  let ratingFilter = 'all';

  function isRereadCandidate(b){
    return b && b.status === '완독' && Number(b.rating || 0) >= 4;
  }
  function stars(n){
    n = Number(n || 0);
    return n ? '★'.repeat(n) + '☆'.repeat(5-n) : '';
  }

  // 이전 상태 체계를 새 체계로 정리합니다.
  let migrated = false;
  for(const b of books){
    if(b.status === '재탕 예정'){ b.status = '완독'; migrated = true; }
    if(!['안 읽음','읽는 중','완독','중도하차'].includes(b.status)){
      b.status = '안 읽음'; migrated = true;
    }
    if(b.rating != null && b.rating !== ''){
      const r = Math.max(1, Math.min(5, Number(b.rating) || 0));
      if(r !== Number(b.rating)){ b.rating = r || ''; migrated = true; }
    }
    if(b.review == null){ b.review = ''; migrated = true; }
  }
  if(migrated) localStorage.setItem(KEY, JSON.stringify(books));

  // 수정창 상태 옵션을 4개로 고정합니다.
  const statusSel = document.querySelector('#status');
  if(statusSel){
    statusSel.innerHTML = '<option>안 읽음</option><option>읽는 중</option><option>완독</option><option>중도하차</option>';
  }

  // 만족도 + 한줄평 입력란 추가
  if(statusSel && !document.querySelector('#rating')){
    const row = statusSel.closest('.row');
    const ratingRow = document.createElement('div');
    ratingRow.className = 'row';
    ratingRow.innerHTML = `
      <div class="field"><label>만족도</label>
        <select id="rating">
          <option value="">아직 평가 안 함</option>
          <option value="5">★★★★★ · 5점</option>
          <option value="4">★★★★☆ · 4점</option>
          <option value="3">★★★☆☆ · 3점</option>
          <option value="2">★★☆☆☆ · 2점</option>
          <option value="1">★☆☆☆☆ · 1점</option>
        </select>
      </div>
      <div class="field"><label>한줄평</label><input id="review" maxlength="100" placeholder="예: 후반부가 조금 아쉽지만 다시 읽고 싶은 작품"></div>`;
    row.insertAdjacentElement('afterend', ratingRow);
  }

  // 카드와 만족도 UI 보강 스타일
  const style = document.createElement('style');
  style.textContent = `
    .ratingBadge{background:#fff4d6!important;color:#775600!important;letter-spacing:.4px}
    .rereadBadge{background:#f0eaff!important;color:#5d3dc2!important}
    .reviewline{margin-top:8px;padding:8px 10px;border-radius:10px;background:#f7f7fb;color:#444957;font-size:12px;line-height:1.45;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .ratingFilters{margin-top:9px}
    .ratingLabel{font-size:12px;color:#7b808d;font-weight:800;display:flex;align-items:center;margin-right:2px}
    @media(min-width:721px){.stats{grid-template-columns:repeat(5,1fr)}}
  `;
  document.head.appendChild(style);

  // 재탕 후보 통계 추가
  const stats = document.querySelector('.stats');
  if(stats && !document.querySelector('#nReread')){
    stats.insertAdjacentHTML('beforeend','<div class="stat"><div id="nReread" class="num">0</div><div class="lab">재탕 후보</div></div>');
  }

  // 상태 필터를 새 체계로 교체
  const sfEl = document.querySelector('#sf');
  if(sfEl){
    sfEl.innerHTML = '<button class="chip on" data-s="all">상태 전체</button><button class="chip" data-s="안 읽음">안 읽음</button><button class="chip" data-s="읽는 중">읽는 중</button><button class="chip" data-s="완독">완독</button><button class="chip" data-s="중도하차">중도하차</button>';
  }

  // 만족도 필터 추가
  let rfEl = document.querySelector('#ratingFilters');
  if(!rfEl && sfEl){
    rfEl = document.createElement('div');
    rfEl.id = 'ratingFilters';
    rfEl.className = 'filters ratingFilters';
    rfEl.innerHTML = '<span class="ratingLabel">만족도</span><button class="chip on" data-r="all">전체</button><button class="chip" data-r="5">★5</button><button class="chip" data-r="4">★4</button><button class="chip" data-r="3">★3</button><button class="chip" data-r="2">★2</button><button class="chip" data-r="1">★1</button><button class="chip" data-r="reread">재탕 후보 ★4~5</button>';
    sfEl.insertAdjacentElement('afterend', rfEl);
    rfEl.addEventListener('click', e => {
      const v = e.target?.dataset?.r;
      if(!v) return;
      rfEl.querySelectorAll('.chip').forEach(x => x.classList.remove('on'));
      e.target.classList.add('on');
      ratingFilter = v;
      render();
    });
  }

  // 기존 검색/플랫폼/상태 필터 위에 만족도 조건을 추가
  const list09 = list;
  list = function(){
    const arr = list09();
    if(ratingFilter === 'all') return arr;
    if(ratingFilter === 'reread') return arr.filter(isRereadCandidate);
    return arr.filter(b => Number(b.rating || 0) === Number(ratingFilter));
  };
  window.list = list;

  // 기존 수정창을 열고 새 필드만 덧붙여 채웁니다.
  const edit09 = window.edit;
  window.edit = function(id){
    const b = books.find(x => x.id === id);
    if(!b) return;
    edit09(id);
    const r = document.querySelector('#rating');
    const rv = document.querySelector('#review');
    if(r) r.value = b.rating ? String(b.rating) : '';
    if(rv) rv.value = b.review || '';
  };

  // 새 작품 등록 시 평가 필드 초기화
  const addBtn = document.querySelector('#add');
  if(addBtn){
    addBtn.addEventListener('click', () => setTimeout(() => {
      const r = document.querySelector('#rating');
      const rv = document.querySelector('#review');
      if(r) r.value = '';
      if(rv) rv.value = '';
    }, 0));
  }

  // 저장 로직에 rating/review를 포함합니다. 기존 링크·공유 메타데이터는 보존합니다.
  const form = document.querySelector('#form');
  if(form){
    form.onsubmit = e => {
      e.preventDefault();
      const id = document.querySelector('#id').value || uid();
      const old = books.find(x => x.id === id);
      const ps = [...document.querySelectorAll('.platbox')]
        .filter(x => x.querySelector('.ck').checked)
        .map(x => {
          const oldp = old?.platforms?.find(p => p.name === x.dataset.n) || {};
          return {
            ...oldp,
            name:x.dataset.n,
            ownership:x.querySelector('.own').value,
            range:x.querySelector('.rng').value.trim(),
            url:x.querySelector('.url').value.trim() || oldp.url || ''
          };
        });
      const b = {
        ...(old || {}),
        id,
        title:document.querySelector('#title').value.trim(),
        author:document.querySelector('#author').value.trim(),
        type:document.querySelector('#type').value,
        status:document.querySelector('#status').value,
        rating:document.querySelector('#rating')?.value ? Number(document.querySelector('#rating').value) : '',
        review:document.querySelector('#review')?.value.trim() || '',
        cover:document.querySelector('#cover').value.trim(),
        memo:document.querySelector('#memo').value.trim(),
        platforms:ps,
        sourceUrl:old?.sourceUrl || ps.find(x => x.url)?.url || '',
        updatedAt:new Date().toISOString()
      };
      const i = books.findIndex(x => x.id === id);
      if(i >= 0) books[i] = b; else books.push(b);
      save();
      dlg.close();
      note('저장했습니다');
    };
  }

  // 기존 카드 렌더링 후 만족도/한줄평을 시각적으로 추가합니다.
  const render09 = render;
  render = function(){
    render09();
    const filtered = list();
    const cards = [...document.querySelectorAll('#grid .card')];
    cards.forEach((card, i) => {
      const b = filtered[i];
      if(!b) return;
      const badges = card.querySelector('.badges');
      if(badges && Number(b.rating || 0)){
        const rb = document.createElement('span');
        rb.className = 'badge ratingBadge';
        rb.textContent = stars(b.rating);
        badges.appendChild(rb);
      }
      if(badges && isRereadCandidate(b)){
        const rr = document.createElement('span');
        rr.className = 'badge rereadBadge';
        rr.textContent = '재탕 후보';
        badges.appendChild(rr);
      }
      if(b.review){
        const meta = card.querySelector('.meta');
        const el = document.createElement('div');
        el.className = 'reviewline';
        el.textContent = '“' + b.review + '”';
        const memo = meta?.querySelector('.memo');
        if(meta) meta.insertBefore(el, memo || null);
      }
    });
    const rr = document.querySelector('#nReread');
    if(rr) rr.textContent = books.filter(isRereadCandidate).length;
    const foot = document.querySelector('.foot');
    if(foot) foot.textContent = '콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v1.0';
  };
  window.render = render;
  render();
})();
