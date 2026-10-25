(() => {
  const THEME_KEY='mwl_theme_v48';
  const PATTERN_KEY='mwl_pattern_v48';
  const COLORS={
    violet:{name:'보라빛',a:'#6f55ff',b:'#a766ff',hero1:'#171a2a',hero2:'#362e70',bg:'#f5f6fb'},
    berry:{name:'베리핑크',a:'#ff4f9a',b:'#b65cff',hero1:'#311426',hero2:'#5b2858',bg:'#fff6fb'},
    mocha:{name:'모카',a:'#9a6b4d',b:'#c99b73',hero1:'#2b211d',hero2:'#5d4032',bg:'#faf6f1'},
    ocean:{name:'오션',a:'#2f8cff',b:'#43c8d7',hero1:'#102638',hero2:'#174e6a',bg:'#f3fbff'},
    forest:{name:'포레스트',a:'#3d936d',b:'#83b96b',hero1:'#17291f',hero2:'#315640',bg:'#f4faf5'},
    midnight:{name:'미드나잇',a:'#4f56d9',b:'#8c6dff',hero1:'#10131d',hero2:'#24264c',bg:'#f4f5f9'}
  };
  const PATTERNS={
    none:{name:'기본'},
    wood:{name:'묵직한 우드'},
    marble:{name:'깔끔한 대리석'},
    sea:{name:'바다'},
    woods:{name:'숲'}
  };
  let theme=localStorage.getItem(THEME_KEY)||'violet';
  let pattern=localStorage.getItem(PATTERN_KEY)||'none';

  const style=document.createElement('style');
  style.textContent=`
    :root{--v48a:#6f55ff;--v48b:#a766ff;--v48hero1:#171a2a;--v48hero2:#362e70;--v48bg:#f5f6fb}
    body{background:var(--v48bg)!important}
    .hero{position:relative;overflow:hidden;background:linear-gradient(135deg,var(--v48hero1),var(--v48hero2))!important}
    .hero:after{content:'';position:absolute;inset:0;pointer-events:none;opacity:.18;background:
      radial-gradient(circle at 78% 12%,rgba(255,255,255,.55),transparent 24%),
      radial-gradient(circle at 18% 92%,var(--v48b),transparent 34%)}
    .hero .wrap{position:relative;z-index:1}
    .brand{gap:13px!important}
    .logo{width:56px!important;height:56px!important;border-radius:18px!important;padding:0!important;overflow:hidden!important;
      background:#fff!important;box-shadow:0 9px 25px rgba(0,0,0,.20)!important}
    .logo img{width:100%;height:100%;display:block;object-fit:cover}
    .brandText h1,.brand h1{font-family:"Arial Rounded MT Bold","Trebuchet MS","Noto Sans KR",sans-serif!important;
      font-weight:950!important;letter-spacing:-1.2px!important;font-size:27px!important}
    .secretKicker{font-size:10px;font-weight:900;letter-spacing:.08em;color:#fff;opacity:.72;margin-bottom:2px}
    .themeButton{margin-left:auto;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;
      border-radius:999px;padding:8px 11px;font-size:11px;font-weight:900;backdrop-filter:blur(8px)}
    .primary{background:linear-gradient(135deg,var(--v48a),var(--v48b))!important}
    .chip.on,.quickStat.on{background:var(--v48hero1)!important;border-color:var(--v48hero1)!important}
    .shelfSwitch.on{background:var(--v48a)!important}
    .themeSheet{position:fixed;inset:0;z-index:999999;display:none;align-items:flex-end;background:rgba(12,14,22,.42)}
    .themeSheet.show{display:flex}
    .themePanel{width:min(720px,100%);max-height:82vh;overflow:auto;margin:0 auto;background:#fff;border-radius:24px 24px 0 0;
      padding:18px 18px calc(22px + env(safe-area-inset-bottom));box-shadow:0 -22px 70px rgba(0,0,0,.22)}
    .themeHead{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .themeHead h3{margin:0;font-size:19px}
    .themeClose{border:0;background:#f0f1f5;width:36px;height:36px;border-radius:50%;font-size:22px;color:#565b67}
    .themeLabel{font-size:12px;font-weight:900;margin:20px 0 9px;color:#444956}
    .paletteGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
    .paletteBtn{border:2px solid transparent;background:#f5f6f9;border-radius:15px;padding:8px;text-align:left;font-size:11px;font-weight:850;color:#555b67}
    .paletteBtn.on{border-color:var(--v48a);box-shadow:0 0 0 3px color-mix(in srgb,var(--v48a) 12%,transparent)}
    .swatch{height:38px;border-radius:10px;margin-bottom:6px}
    .patternGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
    .patternBtn{height:68px;border:2px solid transparent;border-radius:15px;overflow:hidden;position:relative;background:#eee}
    .patternBtn.on{border-color:var(--v48a)}
    .patternBtn span{position:absolute;left:8px;bottom:7px;background:rgba(255,255,255,.86);color:#2c3039;border-radius:999px;padding:4px 7px;font-size:10px;font-weight:900}
    .pat-none{background:linear-gradient(135deg,#f7f7fb,#eceef6)}
    .pat-wood{background:repeating-linear-gradient(8deg,#3c271c 0 12px,#533728 12px 18px,#2e1d16 18px 28px)}
    .pat-marble{background:
      linear-gradient(116deg,transparent 0 43%,rgba(150,155,170,.38) 44%,transparent 47%),
      linear-gradient(62deg,#fafafa,#e9eaed 45%,#fff 70%)}
    .pat-sea{background:
      radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.65),transparent 28%),
      repeating-radial-gradient(ellipse at 50% 120%,#45b7dd 0 12px,#2f8fc8 13px 20px,#72d5ec 21px 30px)}
    .pat-woods{background:
      radial-gradient(circle at 20% 25%,#a8c98a 0 11%,transparent 12%),
      radial-gradient(circle at 70% 60%,#638f63 0 16%,transparent 17%),
      linear-gradient(135deg,#dcebd5,#7aa474)}
    body[data-mwl-pattern="wood"] main.main{background:repeating-linear-gradient(8deg,rgba(57,36,25,.13) 0 10px,rgba(86,56,39,.08) 10px 18px),var(--v48bg)}
    body[data-mwl-pattern="marble"] main.main{background:
      linear-gradient(116deg,transparent 0 43%,rgba(150,155,170,.12) 44%,transparent 47%),
      linear-gradient(62deg,#fafafa,#eef0f3 45%,#fff 70%)}
    body[data-mwl-pattern="sea"] main.main{background:
      radial-gradient(ellipse at 30% 12%,rgba(255,255,255,.75),transparent 27%),
      linear-gradient(180deg,#effbff,#dff4fa 45%,#edf9fb)}
    body[data-mwl-pattern="woods"] main.main{background:
      radial-gradient(circle at 9% 8%,rgba(108,150,102,.12) 0 7%,transparent 8%),
      radial-gradient(circle at 88% 22%,rgba(71,123,82,.10) 0 9%,transparent 10%),
      linear-gradient(180deg,#f4faf4,#eaf4ea)}
    @media(max-width:520px){
      .logo{width:50px!important;height:50px!important;border-radius:16px!important}
      .brandText h1,.brand h1{font-size:23px!important}
      .themeButton{padding:7px 9px}
      .paletteGrid{grid-template-columns:repeat(3,1fr)}
    }
  `;
  document.head.appendChild(style);

  const brand=document.querySelector('.brand');
  const logo=document.querySelector('.logo');
  if(logo){
    logo.textContent='';
    const img=document.createElement('img');
    img.src='./library-icon-cute.webp?v=48';
    img.alt='';
    logo.appendChild(img);
  }
  if(brand){
    const title=brand.querySelector('h1');
    const holder=title?.parentElement;
    if(holder){
      holder.classList.add('brandText');
      if(!holder.querySelector('.secretKicker')){
        const k=document.createElement('div');
        k.className='secretKicker';
        k.textContent='PRIVATE LIBRARY · 비밀서재';
        holder.insertBefore(k,title);
      }
    }
    if(!brand.querySelector('.themeButton')){
      const b=document.createElement('button');
      b.type='button';b.className='themeButton';b.textContent='🎨 꾸미기';
      brand.appendChild(b);
    }
  }

  const sheet=document.createElement('div');
  sheet.className='themeSheet';
  sheet.innerHTML=`
    <section class="themePanel" role="dialog" aria-modal="true" aria-label="서재 꾸미기">
      <div class="themeHead"><h3>내 서재 꾸미기</h3><button type="button" class="themeClose">×</button></div>
      <div class="themeLabel">색 팔레트</div>
      <div class="paletteGrid">
        ${Object.entries(COLORS).map(([id,v])=>`<button type="button" class="paletteBtn" data-theme="${id}">
          <div class="swatch" style="background:linear-gradient(135deg,${v.a},${v.b})"></div>${v.name}</button>`).join('')}
      </div>
      <div class="themeLabel">무늬 팔레트</div>
      <div class="patternGrid">
        ${Object.entries(PATTERNS).map(([id,v])=>`<button type="button" class="patternBtn pat-${id}" data-pattern="${id}"><span>${v.name}</span></button>`).join('')}
      </div>
    </section>`;
  document.body.appendChild(sheet);

  function apply(){
    const t=COLORS[theme]||COLORS.violet;
    const root=document.documentElement;
    root.style.setProperty('--v48a',t.a);
    root.style.setProperty('--v48b',t.b);
    root.style.setProperty('--v48hero1',t.hero1);
    root.style.setProperty('--v48hero2',t.hero2);
    root.style.setProperty('--v48bg',t.bg);
    root.style.setProperty('--p',t.a);
    root.style.setProperty('--p2',t.b);
    document.body.dataset.mwlPattern=pattern;
    document.querySelectorAll('[data-theme]').forEach(x=>x.classList.toggle('on',x.dataset.theme===theme));
    document.querySelectorAll('[data-pattern]').forEach(x=>x.classList.toggle('on',x.dataset.pattern===pattern));
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',t.hero1);
  }
  apply();

  brand?.querySelector('.themeButton')?.addEventListener('click',()=>sheet.classList.add('show'));
  sheet.querySelector('.themeClose')?.addEventListener('click',()=>sheet.classList.remove('show'));
  sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.classList.remove('show')});
  sheet.querySelectorAll('[data-theme]').forEach(btn=>btn.addEventListener('click',()=>{
    theme=btn.dataset.theme;localStorage.setItem(THEME_KEY,theme);apply();
  }));
  sheet.querySelectorAll('[data-pattern]').forEach(btn=>btn.addEventListener('click',()=>{
    pattern=btn.dataset.pattern;localStorage.setItem(PATTERN_KEY,pattern);apply();
  }));

  const foot=document.querySelector('.foot');
  if(foot)foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 비밀서재 v4.8';
})();