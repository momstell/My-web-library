(function v48fix(){
  "use strict";
  // Appended after v25: keep platform deep links and Supabase code untouched.
  const THEMES={
    violet:{accent:"#7356ee",deep:"#34224b",tint:"#f2edff",line:"#d9cafd"},
    berry:{accent:"#e64195",deep:"#51233f",tint:"#fff0f7",line:"#fac4de"},
    mocha:{accent:"#916244",deep:"#432d23",tint:"#faf0e7",line:"#dfc4ac"},
    ocean:{accent:"#1679bf",deep:"#153d5b",tint:"#eaf8ff",line:"#b5e0f8"},
    forest:{accent:"#337b58",deep:"#213f30",tint:"#eafaee",line:"#bee1cb"},
    midnight:{accent:"#6460d6",deep:"#22213d",tint:"#f0efff",line:"#d0cdf9"}
  };
  const css=document.createElement("style");
  css.id="v48-ui-corrections";
  css.textContent=`
  :root { --lib-accent:#7356ee;--lib-deep:#34224b;--lib-tint:#f2edff;--lib-line:#d9cafd; }
  html{min-height:100%;background:var(--v48bg)}
  body{min-height:100vh;color:#2b2834;background-color:var(--v48bg)!important;transition:background-color .2s ease}
  .main{background:transparent!important;border-radius:0;min-height:75vh}
  .hero{background:linear-gradient(122deg,var(--lib-deep),var(--v48hero2))!important}
  .logo{flex-shrink:0;width:62px!important;height:62px!important;padding:3px!important;background:#fff!important;display:flex;align-items:center;justify-content:center;overflow:hidden!important;border-radius:20px!important}
  .logo img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important}
  .brandText{flex:1;min-width:0}
  .brandText h1{font-family:"Arial Rounded MT Bold","NanumSquareRound","Noto Sans KR",sans-serif!important;font-size:clamp(23px,4.4vw,31px)!important;line-height:1.22!important;letter-spacing:-.065em!important;word-break:keep-all}
  .secretKicker{font-size:10px!important;letter-spacing:.03em!important;white-space:normal}
  .sub{line-height:1.6;word-break:keep-all;color:rgba(255,255,255,.82)!important}
  .themeButton{flex:0 0 auto;white-space:nowrap;max-width:76px}
  .primary,.save,#cloudActions .main,.cloudbtn.main{background:linear-gradient(125deg,var(--lib-accent),var(--v48b))!important;color:white!important;border-color:transparent!important}
  .chip.on,.quickStat.on,.badge.categoryTag,.shelfSwitch.on{background:var(--lib-deep)!important;color:#fff!important;border-color:var(--lib-deep)!important}
  .quickStat.on strong{color:#fff!important}
  .viewBtn.on{color:var(--lib-deep)!important}
  .viewToggle{background:var(--lib-tint)!important}
  .sortSelect:focus,.search:focus,.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--lib-accent)!important;box-shadow:0 0 0 3px var(--lib-tint);outline:0!important}
  .open{background:var(--lib-deep)!important}
  .mini,.ghost,.chip,.stat,.cloudbar,.card,.empty,.notice,.quickStat,.arrangeWrap{border-color:var(--lib-line)!important}
  .cloudbar{background:var(--lib-tint)!important}
  .cloudtitle,.notice b{color:var(--lib-deep)!important}
  .paletteBtn.on,.patternBtn.on{border-color:var(--lib-accent)!important;box-shadow:0 0 0 2px var(--lib-tint)!important}
  .shelfSwitch.on{background:var(--lib-accent)!important}
  #libShelfBar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:13px 0 9px}
  #libShelfBar button{border:1px solid var(--lib-line);background:#fff;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:850;color:var(--lib-deep);min-height:37px}
  #libShelfBar button.active{background:var(--lib-deep);color:#fff}
  #libShelfBar .libCategory{margin-left:auto;min-height:37px;max-width:155px;padding:7px 10px;border:1px solid var(--lib-line);border-radius:12px;background:#fff;color:var(--lib-deep);font-size:12px;font-weight:750}
  .libInfoHint{font-size:11px;color:#85808e;margin:0 0 7px}
  .secretShelfNote{font-size:11px;color:#666;padding:3px 5px}
  #grid .badge.secretMark{background:#fae6f2!important;color:#8a215b!important}
  #grid .badge.categoryMark{background:var(--lib-tint)!important;color:var(--lib-deep)!important}
  .patternBtn.pat-wood,body[data-mwl-pattern="wood"]{
     background-color:#543526!important;
     background-image:
       radial-gradient(ellipse 280px 45px at 75% 42%,transparent 68%,rgba(28,13,8,.38) 72%,transparent 76%,rgba(244,193,124,.20) 80%,transparent 84%),
       repeating-linear-gradient(178deg,rgba(23,11,6,.10) 0px,rgba(28,11,4,.24) 1px,transparent 2px,rgba(232,165,96,.075) 4px,transparent 9px,rgba(22,8,4,.15) 14px,transparent 20px),
       linear-gradient(92deg,#2f1d16 0%,#694532 18%,#44291e 39%,#805438 53%,#452a1e 78%,#382219 100%)!important;
     background-size:420px 260px,100% 180px,100% 100%!important;
  }
  .patternBtn.pat-marble,body[data-mwl-pattern="marble"]{
    background-color:#f1f1f1!important;
    background-image:
      linear-gradient(108deg,transparent 0 32%,rgba(112,124,135,.13) 32.2%,transparent 32.7%,rgba(135,144,147,.12) 33%,transparent 33.5%),
      linear-gradient(155deg,transparent 0 65%,rgba(151,160,163,.17) 65.2%,transparent 65.6%,rgba(125,129,139,.12) 66%,transparent 66.4%),
      radial-gradient(ellipse at 30% 12%,white,#e5e7e8 80%)!important;
    background-size:380px 380px,570px 470px,100% 100%!important;
  }
  .patternBtn.pat-sea,body[data-mwl-pattern="sea"]{
    background-color:#d6f2fb!important;
    background-image:
      radial-gradient(ellipse at 20% 5%,rgba(255,255,255,.66),transparent 36%),
      repeating-radial-gradient(ellipse 270px 90px at 55% 120%,transparent 0 23px,rgba(255,255,255,.19) 24px 28px,transparent 29px 51px),
      linear-gradient(165deg,#c6f5fb,#81cada 55%,#d0f3ec)!important;
    background-size:100% 100%,450px 250px,100% 100%!important;
  }
  .patternBtn.pat-woods,body[data-mwl-pattern="woods"]{
    background-color:#e6efe0!important;
    background-image:
      radial-gradient(ellipse 60px 23px at 14% 22%,rgba(48,101,56,.22) 0 67%,transparent 70%),
      radial-gradient(ellipse 72px 30px at 76% 75%,rgba(71,120,61,.17) 0 67%,transparent 70%),
      radial-gradient(ellipse 46px 20px at 36% 83%,rgba(80,135,76,.16) 0 65%,transparent 70%),
      linear-gradient(120deg,#eff6e8,#cce0c7)!important;
    background-size:260px 240px,320px 270px,260px 250px,100% 100%!important;
  }
  body[data-mwl-pattern="none"]{background-image:none!important}
  body[data-mwl-pattern]:not([data-mwl-pattern="none"]) .main{background:transparent!important}
  .patternBtn.pat-wood{background-size:220px 140px,100% 180px,100% 100%!important}
  .patternBtn.pat-marble,.patternBtn.pat-sea,.patternBtn.pat-woods{background-size:100% 100%!important}
  @media(max-width:520px){.logo{width:58px!important;height:58px!important;border-radius:19px!important}.brand{gap:9px!important}.brandText h1{font-size:23px!important}.themeButton{padding:7px 8px!important}.secretKicker{font-size:9px!important}#libShelfBar{gap:5px}#libShelfBar button{padding:7px 10px}#libShelfBar .libCategory{max-width:135px}}
  `;
  document.head.appendChild(css);
  const img=document.querySelector(".logo img");
  if(img) {img.src="./library-icon-v48.webp?v=48b";img.alt="내 소장도서관 책 캐릭터";}
  let chosenShelf=localStorage.getItem("mwl_shelf_filter_v48")||"normal";
  let chosenCategory=localStorage.getItem("mwl_category_filter_v48")||"all";
  const bar=document.createElement("nav");bar.id="libShelfBar";bar.setAttribute("aria-label","서재 및 카테고리 분류");
  bar.innerHTML='<button type="button" data-shelf="normal">📚 일반서재</button><button type="button" data-shelf="secret">🔒 비밀서재</button><button type="button" data-shelf="all">전체 보기</button><select class="libCategory" aria-label="카테고리 선택"><option value="all">모든 카테고리</option></select>';
  const toolbar=document.querySelector(".toolbar");
  if(toolbar)toolbar.insertAdjacentElement("beforebegin",bar);

  // Fields are persisted on each book object to reuse existing backup and cloud sync.
  const form=document.querySelector("#form");
  const kinds=['로맨스','로맨스판타지','판타지','무협','현대물','BL','GL','미스터리','드라마','기타'];
  const row=document.createElement("div");row.className="row";row.id="libExtraFields";
  row.innerHTML='<div class="field"><label for="libShelf">보관 서재</label><select id="libShelf"><option value="normal">📚 일반서재</option><option value="secret">🔒 비밀서재</option></select></div><div class="field"><label for="libCategory">카테고리 (직접 입력 가능)</label><input id="libCategory" list="libCategoryOptions" placeholder="예: 로맨스판타지" maxlength="40"><datalist id="libCategoryOptions">'+kinds.map(x=>'<option value="'+x+'"></option>').join('')+'</datalist></div><div class="field"><label for="libBlank">블랭크 · 자유 분류 (선택)</label><input id="libBlank" maxlength="80" placeholder="원하는 분류나 표시를 입력하세요"></div>';
  if(form){const memo=document.querySelector("#memo")?.closest(".field");if(memo)memo.insertAdjacentElement("afterend",row);else form.insertBefore(row,document.querySelector("#plats"));}
  function loadFields(b){const a=document.querySelector("#libShelf"),c=document.querySelector("#libCategory"),k=document.querySelector("#libBlank");if(a)a.value=(b?.privateShelf||b?.shelf==="secret")?"secret":"normal";if(c)c.value=b?.category||"";if(k)k.value=b?.blank||"";}
  const oldEdit=window.edit;
  if(typeof oldEdit==="function")window.edit=function(id){oldEdit(id);loadFields(books.find(b=>String(b.id)===String(id)));};
  document.querySelector("#add")?.addEventListener("click",()=>setTimeout(()=>loadFields(null),0));
  if(form){
    const oldSubmit=form.onsubmit;
    form.onsubmit=function(ev){
      const id=document.querySelector("#id")?.value||"";
      const shelf=document.querySelector("#libShelf")?.value==="secret"?"secret":"normal";
      const cat=document.querySelector("#libCategory")?.value.trim()||"";
      const blank=document.querySelector("#libBlank")?.value.trim()||"";
      oldSubmit.call(this,ev);
      const b=id?books.find(x=>String(x.id)===String(id)):books[books.length-1];
      if(b){b.shelf=shelf;b.privateShelf=shelf==="secret";b.category=cat;b.blank=blank;save();}
    };
  }

  const oldList=list;
  list=function(){return oldList().filter(b=>{
    const inSecret=b.shelf==="secret"||b.privateShelf===true;
    return (chosenShelf==="all"||(chosenShelf==="secret"?inSecret:!inSecret))&&(chosenCategory==="all"||(b.category||"미분류")===chosenCategory);
  });};
  window.list=list;
  const oldRender=render;
  render=function(){
    oldRender();
    bar.querySelectorAll("[data-shelf]").forEach(b=>b.classList.toggle("active",b.dataset.shelf===chosenShelf));
    const select=bar.querySelector(".libCategory");
    const names=[...new Set(books.map(b=>String(b.category||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"ko"));
    const options=["all","미분류",...names]; if(!options.includes(chosenCategory))chosenCategory="all";
    select.innerHTML=options.map(v=>'<option value="'+esc(v)+'">'+(v==="all"?"모든 카테고리":v)+'</option>').join("");
    select.value=chosenCategory;
    const filtered=list();
    document.querySelectorAll("#grid .card").forEach((card,i)=>{
      const b=filtered[i];if(!b)return;
      const place=card.querySelector(".badges");if(!place)return;
      if(b.shelf==="secret"||b.privateShelf===true){const badge=document.createElement("span");badge.className="badge secretMark";badge.textContent="비밀서재";place.appendChild(badge);}
      if(b.category){const badge=document.createElement("span");badge.className="badge categoryMark";badge.textContent=b.category;place.appendChild(badge);}
    });
    const label=document.querySelector(".titlebar h2");
    if(label)label.textContent=chosenShelf==="secret"?"비밀서재":chosenShelf==="all"?"전체 작품":"내 작품";
  };
  window.render=render;
  bar.addEventListener("click",e=>{const b=e.target.closest("[data-shelf]");if(!b)return;chosenShelf=b.dataset.shelf;localStorage.setItem("mwl_shelf_filter_v48",chosenShelf);render();});
  bar.querySelector(".libCategory").addEventListener("change",e=>{chosenCategory=e.target.value;localStorage.setItem("mwl_category_filter_v48",chosenCategory);render();});

  function applyTheme(){
    const t=THEMES[localStorage.getItem("mwl_theme_v48")]||THEMES.violet;
    const r=document.documentElement;
    r.style.setProperty("--lib-accent",t.accent);r.style.setProperty("--lib-deep",t.deep);r.style.setProperty("--lib-tint",t.tint);r.style.setProperty("--lib-line",t.line);
    // Baseline components and all accent-driven controls share the same palette.
    r.style.setProperty("--line",t.line);r.style.setProperty("--p",t.accent);
  }
  applyTheme();
  document.querySelector(".themeSheet")?.addEventListener("click",e=>{
    if(e.target.closest("[data-theme]"))setTimeout(applyTheme,0);
  });
  const footer=document.querySelector(".foot");
  if(footer)footer.textContent="콘텐츠는 원 서비스에서 열립니다 · 내 소장도서관 v4.8 개선판";
  render();
})();