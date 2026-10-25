(function patchV29(){
  "use strict";
  const bar=document.getElementById("libShelfBar"),cat=bar?.querySelector("select.libCategory");
  if(!bar||!cat)return;
  const all=bar.querySelector('[data-shelf="all"]'),lock=bar.querySelector(".libLockButton");
  const st=document.createElement("style");
  st.textContent=`
    #libShelfBar{display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:7px!important;margin:12px 0!important}
    #libShelfBar>[data-shelf="normal"],#libShelfBar>[data-shelf="secret"]{padding:8px 10px!important;flex:0 0 auto;min-height:37px!important;font-size:12px!important}
    #libShelfBar>select.libCategory,#libShelfBar>[data-shelf="all"],#libShelfBar>.libLockButton,#libShelfBar>.libLockStatus{display:none!important}
    #libShelfBar>.compactFilter{margin-left:auto;border:1px solid var(--lib-line);background:#fff;border-radius:12px;white-space:nowrap;min-height:37px!important;padding:7px 12px!important;font-size:12px!important;color:var(--lib-deep);font-weight:800}
    .toolbar,#sf,#ratingFilters{display:none!important}
    #compactFilterDialog{width:min(440px,calc(100% - 28px));border:0;border-radius:20px;padding:18px;max-height:88vh;overflow:auto}
    #compactFilterDialog::backdrop{background:rgba(26,20,33,.55)}
    #compactFilterDialog .cfHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px}
    #compactFilterDialog h3{font-size:20px;margin:0}
    #compactFilterDialog button{cursor:pointer}
    #compactFilterDialog .cfClose{border:0;background:#f1edf5;border-radius:100%;width:34px;height:34px;font-size:20px}
    #compactFilterDialog .cfFields{display:grid;grid-template-columns:1fr 1fr;gap:11px}
    #compactFilterDialog label{font-size:12px;color:#625b6e;font-weight:850;display:block;margin-bottom:5px}
    #compactFilterDialog select{width:100%;min-width:0;height:42px;border:1px solid #ddd6e4;border-radius:10px;background:white;padding:7px;color:#322a3c;font-size:13px}
    #compactFilterDialog .cfActions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin:16px 0}
    #compactFilterDialog .cfActions button,#compactFilterDialog .cfMore button{border:1px solid var(--lib-line);border-radius:10px;background:#fff;color:var(--lib-deep);padding:8px 10px;font-size:12px;font-weight:850}
    #compactFilterDialog .cfActions .cfApply{background:var(--lib-deep);color:#fff}
    #compactFilterDialog .cfMore{border-top:1px solid #eee7f2;padding-top:13px;display:flex;gap:8px;flex-wrap:wrap}
    #compactFilterDialog .tools{display:flex;flex-wrap:wrap;gap:8px;width:100%}
    #grid .cover img{object-fit:cover!important}
    #grid .cover[data-fallback="yes"] img{display:none!important}
    #grid .cover[data-fallback="yes"] span{display:block!important}
    #grid .retryCover{flex:1;border:1px solid var(--lib-line);background:#fff;border-radius:9px;color:var(--lib-deep);padding:7px;font-size:11px;font-weight:850}
    @media(max-width:410px){#libShelfBar{gap:5px!important}#libShelfBar>[data-shelf]{padding:7px 8px!important;font-size:11px!important}#libShelfBar>.compactFilter{padding:7px 9px!important;font-size:11px!important}}
  `;
  document.head.appendChild(st);
  const trigger=document.createElement("button");trigger.type="button";trigger.className="compactFilter";trigger.textContent="☷ 필터";bar.appendChild(trigger);
  const dialog=document.createElement("dialog");dialog.id="compactFilterDialog";
  dialog.innerHTML=`<div class="cfHeader"><h3>서재 필터</h3><button type="button" class="cfClose">×</button></div>
  <div class="cfFields">
   <div><label>플랫폼</label><select id="cPlatform"><option value="all">전체</option><option>리디</option><option>시리즈</option><option>카카오페이지</option><option>미스터블루</option></select></div>
   <div><label>읽기 상태</label><select id="cStatus"><option value="all">전체</option><option>안 읽음</option><option>읽는 중</option><option>완독</option><option>재탕 예정</option></select></div>
   <div><label>카테고리</label><select id="cCategory"></select></div>
   <div><label>만족도</label><select id="cRating"><option value="all">전체</option><option value="5">★5</option><option value="4">★4</option><option value="3">★3</option><option value="2">★2</option><option value="1">★1</option></select></div>
  </div><div class="cfActions"><button type="button" id="cReset">초기화</button><button type="button" class="cfApply" id="cApply">결과 보기</button></div>
  <div class="cfMore"><button type="button" id="cAll">전체 서재</button><button type="button" id="cLock">🔒 잠금 관리</button><button type="button" id="cRepair">누락 표지 재검색</button></div>`;
  document.body.appendChild(dialog);
  const q=id=>dialog.querySelector("#"+id);
  const value=(sel,key)=>document.querySelector(sel+" .on")?.dataset[key]||"all";
  const selectChip=(sel,key,v)=>[...document.querySelectorAll(sel)].find(x=>x.dataset[key]===v)?.click();
  trigger.onclick=()=>{
    q("cCategory").replaceChildren(...[...cat.options].map(x=>new Option(x.text,x.value)));
    q("cCategory").value=cat.value;
    q("cPlatform").value=value("#pf","p");
    q("cStatus").value=value("#sf","s");
    q("cRating").value=value("#ratingFilters","r");
    dialog.showModal();
  };
  dialog.querySelector(".cfClose").onclick=()=>dialog.close();
  q("cReset").onclick=()=>["cCategory","cPlatform","cStatus","cRating"].forEach(id=>q(id).value="all");
  q("cApply").onclick=()=>{
    selectChip("#pf [data-p]","p",q("cPlatform").value);
    selectChip("#sf [data-s]","s",q("cStatus").value);
    selectChip("#ratingFilters [data-r]","r",q("cRating").value);
    cat.value=q("cCategory").value;
    cat.dispatchEvent(new Event("change",{bubbles:true}));dialog.close();
  };
  q("cAll").onclick=()=>{dialog.close();all?.click()};
  q("cLock").onclick=()=>{dialog.close();lock?.click()};
  const toolGroup=document.querySelector(".toolbar .tools");if(toolGroup)dialog.querySelector(".cfMore").appendChild(toolGroup);
  const bad=s=>/naver.?login|nid\.naver|\/login|19.?age|19.?only|19.?over|19.?up|age.?verify|adult.?auth|no.?image|placeholder|default.?cover|favicon|\/logo(?:[_.\/]|$)/i.test(String(s||""));
  function looksPlaceholder(img){
    try{
      if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth/img.naturalHeight>1.25)return true;
      const cv=document.createElement("canvas");cv.width=24;cv.height=32;
      const cx=cv.getContext("2d",{willReadFrequently:true});cx.drawImage(img,0,0,24,32);
      const a=cx.getImageData(0,0,24,32).data;
      let s=0,y=0,y2=0,white=0;
      for(let i=0;i<a.length;i+=4){
        const r=a[i],g=a[i+1],b=a[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b),v=(r+g+b)/3;
        s+=(max-min)/255;y+=v;y2+=v*v;if(v>208&&max-min<18)white++;
      }
      const n=a.length/4;
      return s/n<.07 && (y2/n-(y/n)**2<1000||white/n>.85);
    }catch{return false}
  }
  async function validImage(url){
    if(!url||bad(url)||!(/^https:\/\//i.test(url)||/^data:image\/(jpeg|webp|png|gif);base64,/i.test(url)))return false;
    return new Promise(ok=>{
      const im=new Image();let finished=false;
      const finish=x=>{if(!finished){finished=true;ok(x)}};
      im.onload=()=>finish(!looksPlaceholder(im));im.onerror=()=>finish(false);im.src=url;
      setTimeout(()=>finish(false),6500);
    });
  }
  const busy=new Set(),attempts=new Set();
  async function repair(b,loud=false){
    if(!b||busy.has(b.id)||b.coverManual&&!loud)return false;
    if(b.coverManual&&loud&&!confirm("직접 선택한 표지를 자동 표지로 교체할까요?"))return false;
    busy.add(b.id);
    try{
      const sources=[...new Set([...(b.platforms||[]).flatMap(p=>[p.canonicalUrl,p.url,p.shareUrl]),b.canonicalUrl,b.sourceUrl,b.shareUrl,...(b.shareUrls||[])].filter(x=>typeof x==="string"&&/^https:\/\//i.test(x)))].slice(0,3);
      for(const src of sources){
        const isSeries=/series\.naver\.com|naver\.me/i.test(src);
        for(const slug of isSeries?["library-cover-resolver","book-meta-resolver"]:["book-meta-resolver"]){
          try{
            const url=new URL("https://ncbdmzuwhphdstxcahxk.supabase.co/functions/v1/"+slug);
            url.searchParams.set("url",src);url.searchParams.set("title",b.title||"");
            if(slug==="book-meta-resolver")url.searchParams.set("platform",(b.platforms||[])[0]?.name||"");
            const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),12000);
            let response;try{response=await fetch(url,{signal:abort.signal})}finally{clearTimeout(timer)}
            if(!response.ok)continue;
            const data=await response.json(),pic=data.coverDataUrl||data.cover||"";
            if(await validImage(pic)){
              b.cover=pic;b.coverManual=false;b.coverVerifiedAt=new Date().toISOString();save();
              if(loud)note("작품 표지를 가져왔습니다");return true;
            }
          }catch{}
        }
      }
      if(loud)note("원 서비스의 이미지 접근 제한으로 자동 복구가 어렵습니다");
      return false;
    }finally{busy.delete(b.id)}
  }
  q("cRepair").onclick=async()=>{
    dialog.close();let searched=0,restored=0;
    for(const b of list()){
      if(searched>=8)break;
      if(b.coverManual||b.cover&&!bad(b.cover)&&await validImage(b.cover))continue;
      searched++;if(await repair(b,false))restored++;
    }
    note(searched?`표지 ${searched}개 확인 · ${restored}개 복구`:"현재 보이는 목록에서 누락 표지가 없습니다");
  };
  const prevRender=render;
  let rendering=false;
  render=function(){
    if(rendering)return;rendering=true;
    try{
      prevRender();
      const a=list();
      [...document.querySelectorAll("#grid .card")].forEach((card,i)=>{
        const b=a[i],cover=card.querySelector(".cover");if(!b||!cover)return;
        const image=cover.querySelector("img");
        const fallback=()=>{cover.dataset.fallback="yes";if(image)image.style.display="none"};
        if(!image||bad(b.cover))fallback();
        else{
          image.style.display="";
          if(image.complete&&image.naturalWidth&&looksPlaceholder(image))fallback();
          else if(!image.complete)image.addEventListener("load",()=>{if(looksPlaceholder(image)){fallback();if(!b.coverManual)setTimeout(()=>repair(b,false),600)}},{once:true});
        }
        if(!b.coverManual&&(!image||bad(b.cover)||cover.dataset.fallback==="yes")){
          const key=b.id+"|"+String(b.cover||"").slice(0,35);
          if(!attempts.has(key)&&attempts.size<8){
            attempts.add(key);setTimeout(()=>repair(b,false),2500+attempts.size*600);
          }
          const area=card.querySelector(".actions");
          if(area&&!area.querySelector(".retryCover")){
            const button=document.createElement("button");button.type="button";button.className="retryCover";button.textContent="표지 다시 찾기";
            button.onclick=e=>{e.stopPropagation();e.preventDefault();repair(b,true)};
            area.appendChild(button);
          }
        }
      });
      const count=[value("#pf","p"),value("#sf","s"),value("#ratingFilters","r"),cat.value].filter(x=>x!=="all").length;
      trigger.textContent=count?"☷ 필터 · "+count:"☷ 필터";
    }finally{rendering=false}
  };
  window.render=render;render();
})();