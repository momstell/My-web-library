(function kakaoPatch(){
"use strict";
const sampleShare="https://link-page.kakao.com/open/content?utm_source=sh_clip&series_id=61577804";
const sampleWork="https://page.kakao.com/content/61577804";
function isKakao(raw){
 try{const host=new URL(raw).hostname.toLowerCase();return host==="page.kakao.com"||host==="link-page.kakao.com"||host==="kko.to"||host==="www.page.kakao.com"}catch{return false;}
}
function normalize(raw){
 try{
  const u=new URL(raw);
  if(!isKakao(raw))return "";
  const series=u.searchParams.get("series_id")||u.searchParams.get("seriesId");
  const direct=u.pathname.match(/^\/(?:content|link)\/(\d{5,12})(?:\/|$)/);
  const id=(series&&/^\d{5,12}$/.test(series)?series:"")||(direct?.[1]||"");
  return id?"https://page.kakao.com/content/"+id:"";
 }catch{return "";}
}
function candidates(b,a){
 const urls=[];
 const ps=(b?.platforms||[]).filter(p=>String(p.name||"").includes("카카오"));
 for(const p of ps)urls.push(...(p.shareUrls||[]),p.shareUrl,p.url,p.canonicalUrl);
 urls.push(...(b?.shareUrls||[]),b?.shareUrl,b?.sourceUrl,b?.canonicalUrl,a?.href);
 return [...new Set(urls.filter(x=>typeof x==="string"&&isKakao(x)))];
}
function selectedBook(card){
 const cards=[...document.querySelectorAll("#grid .card")];
 const ix=cards.indexOf(card);
 try{
  if(ix>=0&&typeof list==="function"&&typeof books!=="undefined")return list()[ix]||null;
 }catch{}
 return null;
}
function navigateWeb(raw){
 const dest=normalize(raw);
 if(!dest){note("작품 ID가 있는 카카오페이지 공유 주소를 확인해주세요.");return;}
 if(window.AndroidBridge?.openKakaoWorkWeb){
   window.AndroidBridge.openKakaoWorkWeb(raw);
 }else{
   window.open(dest,"_blank","noopener,noreferrer");
 }
}
function navigateApp(raw){
 const dest=normalize(raw);
 if(!dest){note("작품 ID가 있는 카카오페이지 공유 주소를 확인해주세요.");return;}
 if(window.AndroidBridge?.tryKakaoWorkApp)window.AndroidBridge.tryKakaoWorkApp(raw);
 else window.open(dest,"_blank","noopener,noreferrer");
}
// Run before legacy document-level click handling, which previously dropped
// Kakao's series_id and opened the installed application's launcher/home.
window.addEventListener("click",event=>{
 const a=event.target.closest?.("a.open");
 if(!a)return;
 const card=a.closest(".card");
 const b=selectedBook(card);
 const btnKakao=/카카오/.test(a.textContent||"")||isKakao(a.href);
 if(!btnKakao)return;
 const sources=candidates(b,a);
 const raw=sources.find(u=>normalize(u))||"";
 if(!raw)return;
 event.preventDefault();
 event.stopPropagation();
 event.stopImmediatePropagation();
 navigateWeb(raw);
},true);
// Some user library links are from the original share sheet. Keep those
// untouched in storage; only the click destination is normalized.
const style=document.createElement("style");style.textContent=`
.kakaoDiag{margin:12px 0 15px;padding:13px 15px;border:1px solid #ffe2b0;border-radius:15px;background:linear-gradient(125deg,#fffaf0,#fff1db);color:#66472a}
.kakaoDiag strong{font-size:13px}
.kakaoDiag p{font-size:11px;line-height:1.55;margin:5px 0 10px}
.kakaoDiag .kakaoBtns{display:flex;flex-wrap:wrap;gap:7px}
.kakaoDiag button{border:1px solid #ead0a2;border-radius:10px;background:#fff;color:#63421c;font-size:11px;font-weight:850;padding:9px 11px}
.kakaoDiag button.kakaoMain{background:#f9da81;border-color:#eec961}
#grid .kakaoAppTry{border:1px solid #e9d4a2;background:#fff8e6;color:#855b19}
`;document.head.appendChild(style);
const diag=document.createElement("section");diag.className="kakaoDiag";
diag.innerHTML=`<strong>🟡 카카오페이지 작품 연결 테스트 v4.9.4</strong><p>공유받은 작품의 고유번호를 사용합니다. 작품 상세 웹페이지가 기본 연결이며, 앱 직접 연결은 별도로 실험할 수 있어요.</p><div class="kakaoBtns"><button type="button" class="kakaoMain" id="kakaoExactWeb">응급 맞선 작품 상세 열기</button><button type="button" id="kakaoExactApp">카카오 앱 연결 시도</button></div>`;
const main=document.querySelector("main.main")||document.querySelector(".main");
if(main)main.insertAdjacentElement("afterbegin",diag);
diag.querySelector("#kakaoExactWeb").onclick=()=>navigateWeb(sampleShare);
diag.querySelector("#kakaoExactApp").onclick=()=>navigateApp(sampleShare);
// In the list view make the riskier app-link attempt explicitly opt-in.
const previousRender=render;let rendering=false;
render=function(){
 if(rendering)return;rendering=true;
 try{
  previousRender();
  const displayed=typeof list==="function"?list():[];
  [...document.querySelectorAll("#grid .card")].forEach((card,index)=>{
   const b=displayed[index];
   const platforms=(b?.platforms||[]);
   const kp=platforms.find(p=>String(p.name||"").includes("카카오"));
   if(!kp)return;
   const button=[...card.querySelectorAll("a.open")].find(a=>/카카오/.test(a.textContent||""));
   if(!button)return;
   const urls=candidates(b,button);
   const raw=urls.find(u=>normalize(u))||"";
   if(!raw)return;
   button.setAttribute("href",normalize(raw));
   button.textContent="카카오 작품 상세 보기";
   button.title="홈이 아닌 카카오페이지 작품 웹 상세로 이동합니다.";
   const area=card.querySelector(".actions");
   if(area&&!area.querySelector(".kakaoAppTry")){
    const direct=document.createElement("button");direct.type="button";
    direct.className="mini kakaoAppTry";direct.textContent="카카오 앱 시도";
    direct.title="카카오페이지 앱에서 작품 상세를 지원하는지 확인합니다.";
    direct.onclick=e=>{e.stopPropagation();navigateApp(raw);};
    area.append(direct);
   }
  });
 }finally{rendering=false;}
};
window.render=render;render();
})();