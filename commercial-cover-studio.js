(function coverStudio(){
"use strict";
const genres=["로맨스","로판","궁정","아카데미","판타지","미스터리","현대","동양풍","모험","힐링"];
const names=["장미의 편지","푸른 달의 왕국","금빛 왕관","마법 도서관","별빛의 길","검은 골목","오후 세 시","벚꽃의 노래","푸른 항해","작은 정원"];
const colors=[
 ["로즈","#c68ba6","#603853","#f4e4db","#e9b58b"],
 ["골드","#566583","#14243e","#f6d9a0","#bd9d6c"],
 ["세이지","#94bba8","#2e5e54","#f8e7c0","#bddb9a"],
 ["라일락","#ad95c2","#4c3e71","#e7d4ef","#edb9b5"],
 ["오션","#6db6c4","#214d74","#c5e9e3","#f9d5a0"]
];
const all=Array.from({length:50},(_,i)=>({id:i+1,genre:genres[i%10],name:names[i%10],scene:i%10,palette:Math.floor(i/10)}));
const esc=v=>String(v||"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[x]));
const circle=(x,y,r,f,o="")=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${o}/>`;
const rect=(x,y,w,h,f,o="")=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${o}/>`;
const path=(d,f,o="")=>`<path d="${d}" fill="${f}" ${o}/>`;
function scene(n,k,p){
const [name,light,dark,ivory,gold]=p;
const moon=circle(235,87,54,ivory,'opacity=".48"');
const mtn=path("M0 268 L60 157 128 240 202 137 320 266 320 306H0Z",dark,'opacity=".65"');
const spark=Array.from({length:24},(_,i)=>circle((i*47+n*21+k*11)%290+15,(i*41+n*8)%220+15,(i%4?1.4:2.8),ivory,'opacity=".55"')).join("");
const person=(x,y,f,h)=>`<g transform="translate(${x} ${y})">${path("M-29 39 Q-32-12-16-32 Q0-43 16-32 Q32-8 30 39Z",f)}${circle(0,-46,21,"#e9c9ae")}${path("M-22-49 Q-29-86-3-88 Q19-92 24-56 L18-43 Q14-71 4-68 Q-8-45-22-49Z",h)}</g>`;
switch(n){
case 0:return moon+path("M0 275 Q80 186 160 250 Q220 180 320 264V310H0Z",dark,'opacity=".6"')+person(115,214,dark,"#3a2938")+person(204,215,gold,"#6b4057")+path("M140 192 L178 171 215 197 177 222Z",ivory);
case 1:return moon+mtn+spark+path("M66 219 Q128 121 193 176 Q237 204 270 121 Q248 240 180 233 Q123 196 66 219Z",gold,'opacity=".55"');
case 2:return rect(47,65,228,208,dark,'opacity=".35"')+Array.from({length:4},(_,i)=>rect(65+i*56,82,33,176,ivory,'opacity=".18"')).join("")+path("M75 149 101 98 155 134 203 78 238 147 228 177H87Z",gold)+circle(155,149,13,dark);
case 3:return rect(39,41,238,245,dark,'opacity=".55"')+Array.from({length:4},(_,i)=>rect(48,91+i*53,220,6,gold)).join("")+Array.from({length:45},(_,i)=>rect(52+(i%15)*14,52+Math.floor(i/15)*54,8,25+(i*7)%17,i%3?ivory:light,'opacity=".7"')).join("")+person(145,243,gold,"#282438");
case 4:return spark+moon+mtn+path("M70 215 Q125 85 209 185 Q246 213 280 122 Q255 234 180 250 Q132 199 70 215Z",gold,'opacity=".5"');
case 5:return moon+Array.from({length:9},(_,i)=>rect(i*42-13,298-((i*29+55)%129+70),38,(i*29+55)%129+70,dark,'opacity=".86"')).join("")+path("M59 306L114 246 170 306Z",dark)+person(160,246,ivory,"#231c34");
case 6:return rect(42,45,240,242,ivory,'rx="108" opacity=".19"')+rect(74,72,184,179,dark,'rx="85" opacity=".36"')+path("M164 72V252 M75 166H257","none",`stroke="${ivory}" stroke-width="4"`)+rect(82,230,172,10,gold)+rect(115,194,52,36,ivory)+person(214,241,dark,"#493139");
case 7:return moon+mtn+path("M-8 82 Q103 82 171 15M45 47Q72 88 111 94","none",`stroke="${dark}" stroke-width="8"`)+Array.from({length:28},(_,i)=>circle((i*29+k*6)%176,(i*17)%145+19,3+i%3,ivory,'opacity=".88"')).join("")+person(197,243,gold,"#2a202e");
case 8:return moon+Array.from({length:6},(_,i)=>path(`M0 ${213+i*19} Q80 ${180+i*19} 160 ${213+i*19} T320 ${213+i*19}`,"none",`stroke="${i%2?gold:ivory}" stroke-width="7" opacity=".32"`)).join("")+path("M143 238H245L208 265H170Z",dark)+path("M191 236V123L247 233Z",ivory)+path("M187 135 154 235H185Z",gold);
default:return moon+Array.from({length:12},(_,i)=>{const x=14+i*27,y=238-(i%3)*17;return path(`M${x} 298 Q${x-19} ${y+2} ${x} ${y-27}`,"none",`stroke="${dark}" stroke-width="4"`)+circle(x,y-29,8,i%2?gold:ivory)+path(`M${x} ${y}q-23-18-32-4q15 13 32 4`,light)}).join("")+person(172,250,dark,"#6b422f");
}}
function coverSVG(t,title,author){
const p=colors[t.palette], [pal,light,dark,ivory,gold]=p;
const full=String(title||t.name),sep=full.length>13?Math.ceil(full.length/2):full.length;
const lines=full.length>13?[full.slice(0,sep),full.slice(sep)]:[full];
const ty=lines.length>1?350:371,size=full.length>20?18:full.length>11?22:28;
return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480" width="320" height="480"><defs>
<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${dark}" stop-opacity="0"/><stop offset=".28" stop-color="${dark}" stop-opacity=".84"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
${rect(0,0,320,480,"url(#a)")}${scene(t.scene,t.palette,p)}
${rect(0,260,320,220,"url(#b)")}
<rect x="18" y="18" width="284" height="444" rx="7" fill="none" stroke="${ivory}" stroke-opacity=".63" stroke-width="2"/>
<text x="160" y="321" text-anchor="middle" fill="${ivory}" font-family="Arial,sans-serif" font-size="10" letter-spacing="4">${esc(t.genre.toUpperCase())}</text>
${lines.map((line,i)=>`<text x="160" y="${ty+i*33}" fill="white" text-anchor="middle" font-family="Noto Sans KR,Malgun Gothic,Arial,sans-serif" font-size="${size}" font-weight="800">${esc(line)}</text>`).join("")}
<path d="M124 420H196" stroke="${gold}" stroke-width="2"/>
<text x="160" y="445" fill="${ivory}" text-anchor="middle" font-family="Noto Sans KR,Arial,sans-serif" font-size="12">${esc(author||"MY LIBRARY")}</text></svg>`;
}
const dataUri=svg=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
const style=document.createElement("style");style.textContent=`
.comDemo{margin:10px 0 16px;border:1px solid #e8d5e8;border-radius:14px;padding:10px 13px;background:#fff8ff;color:#6f4b71;font-size:12px;line-height:1.5}
.comBtn{margin:12px 0;border:1px solid #dfcbea;border-radius:12px;background:white;color:#5d4070;padding:10px 14px;font-size:13px;font-weight:900}
#comStudio{border:0;border-radius:22px;padding:0;width:min(925px,calc(100% - 18px));max-height:92vh;overflow:hidden}
#comStudio::backdrop{background:rgba(20,12,30,.74)}
#comStudio .top{padding:16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ece6f1}
#comStudio h3{margin:0;font-size:20px;color:#34233c}#comStudio .intro{color:#847b8c;font-size:11px;padding-top:4px}
#comStudio .x{border:0;background:#eeeaf2;border-radius:100%;width:34px;height:34px;font-size:22px}
#comStudio .cols{display:grid;grid-template-columns:minmax(0,1fr) 230px;height:min(690px,calc(92vh - 112px))}
#comStudio .browse{padding:12px;overflow-y:auto}
#comStudio .tabs,#comStudio .filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
#comStudio .tab,#comStudio .filter{font-size:12px;border:1px solid #ddd5e5;padding:8px 10px;border-radius:10px;background:white;color:#5b5070;font-weight:750}
#comStudio .filter{font-size:10px;padding:6px 9px;border-radius:99px}
#comStudio .on{background:#68488c;color:white;border-color:#68488c}
#comStudio .list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}
#comStudio .item{border:2px solid transparent;border-radius:10px;padding:3px;background:none;text-align:left;min-width:0}
#comStudio .item.on{border-color:#8861c8;background:#f2eaff}
#comStudio .item img{aspect-ratio:2/3;width:100%;display:block;object-fit:cover;border-radius:7px;box-shadow:0 3px 10px #0002}
#comStudio .item small{display:block;font-size:9px;margin:5px 1px;color:#5b5364;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
#comStudio .preview{background:#faf7fc;border-left:1px solid #eae0f0;padding:15px;display:flex;align-items:center;flex-direction:column;gap:11px;overflow-y:auto}
#comStudio .comTargetLabel{color:#685a72;font-size:11px;font-weight:850}#comStudio .comTarget{width:100%;border:1px solid #ded1e6;background:white;border-radius:9px;padding:7px;min-width:0;font-size:11px;color:#4a365c}#comStudio .preview img{width:100%;max-width:178px;aspect-ratio:2/3;object-fit:cover;border-radius:9px;box-shadow:0 8px 25px #0003}
#comStudio .preview .desc{font-size:12px;text-align:center;color:#5d5363;font-weight:700}
#comStudio .apply{background:#64447f;color:#fff;border:0;border-radius:12px;padding:12px;width:100%;font-weight:900}
#comStudio .upload{padding:20px;border:2px dashed #d6c1e8;border-radius:14px;background:#fdfaff;text-align:center;font-size:12px;line-height:1.9;color:#645572}
#comStudio .pick{padding:10px 15px;background:#64447f;color:white;border:0;border-radius:10px;font-weight:800}
#comStudio .foot{padding:10px 15px;text-align:center;font-size:10px;color:#928997;background:#fff}
@media(max-width:680px){#comStudio .cols{grid-template-columns:minmax(0,1fr) 120px}
#comStudio .list{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}
#comStudio .browse{padding:8px}#comStudio .preview{padding:9px 6px}
#comStudio .apply{font-size:11px;padding:10px 4px}#comStudio h3{font-size:17px}}
`;document.head.appendChild(style);
const main=document.querySelector("main.main")||document.querySelector(".main");
const ribbon=document.createElement("div");ribbon.className="comDemo";ribbon.textContent="📚 상업화 체험판 · 원작 표지 대신 앱 전용 일러스트 표지 50종과 내 사진을 자유롭게 선택해 보세요.";
main?.insertAdjacentElement("afterbegin",ribbon);
const button=document.createElement("button");button.type="button";button.className="comBtn";button.textContent="🎨 나만의 표지 스튜디오";
ribbon.insertAdjacentElement("afterend",button);
const cloud=document.getElementById("cloudBar");if(cloud)cloud.style.display="none";
const d=document.createElement("dialog");d.id="comStudio";
d.innerHTML=`<div class="top"><div><h3>표지 스튜디오 · 50종</h3><div class="intro">완성형 표지를 선택하거나 내 사진을 등록하세요.</div></div><button class="x" type="button">×</button></div>
<div class="cols"><div class="browse"><div class="tabs"><button type="button" class="tab on" data-mode="ready">추천 표지 50종</button><button type="button" class="tab" data-mode="mine">내 이미지 등록</button></div>
<div id="comReady"><div class="filters"></div><div class="list"></div></div>
<div id="comMine" hidden><div class="upload">휴대전화 사진을 직접 등록할 수 있습니다.<p><button class="pick" type="button">사진 선택하기</button><input type="file" id="comFile" accept="image/*" hidden></p><small>개인 이미지의 권리는 등록하는 이용자가 확인합니다.</small></div></div></div>
<div class="preview"><label class="comTargetLabel" for="comTarget">표지를 적용할 작품</label><select id="comTarget" class="comTarget"></select><img id="comPreview" alt="표지 미리보기"><div class="desc" id="comDesc"></div><button type="button" class="apply">이 표지 저장</button></div></div>
<div class="foot">이 앱의 기본 표지는 원작 이미지와 무관하게 만든 벡터 일러스트 템플릿입니다.</div>`;
document.body.appendChild(d);
const q=s=>d.querySelector(s),filters=q(".filters"),listGrid=q(".list");
let selected=all[0],mode="ready",filter="전체",targetId="",own="",usingForm=false;
function currentBook(){return books.find(x=>String(x.id)===String(targetId))||null;}
function titleAndAuthor(){
const b=currentBook();return [usingForm?document.querySelector("#title")?.value.trim()||b?.title||"나만의 소장도서":b?.title||"나만의 소장도서",usingForm?document.querySelector("#author")?.value.trim()||b?.author||"MY LIBRARY":b?.author||"MY LIBRARY"];
}
function preview(){
const [title,author]=titleAndAuthor();
q("#comPreview").src=mode==="mine"&&own?own:dataUri(coverSVG(selected,title,author));
q("#comDesc").textContent=mode==="mine"?(own?"내가 선택한 사진":"사진을 선택해주세요"):String(selected.id).padStart(2,"0")+" · "+selected.genre+" · "+colors[selected.palette][0];
}
function showGrid(){
listGrid.replaceChildren();
for(const t of all.filter(v=>filter==="전체"||v.genre===filter)){
 const b=document.createElement("button");b.type="button";b.className="item"+(t.id===selected.id?" on":"");
 const img=document.createElement("img");img.loading="lazy";img.alt=t.name;img.src=dataUri(coverSVG(t,t.name,"COLLECTION"));
 const text=document.createElement("small");text.textContent=String(t.id).padStart(2,"0")+" · "+t.name;
 b.append(img,text);b.onclick=()=>{selected=t;showGrid();preview()};listGrid.append(b);
}}
for(const g of ["전체",...genres]){
 const b=document.createElement("button");b.type="button";b.className="filter"+(g==="전체"?" on":"");b.textContent=g;
 b.onclick=()=>{filter=g;filters.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));showGrid()};filters.append(b);
}
function tab(v){
mode=v;
d.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x.dataset.mode===v));
q("#comReady").hidden=v!=="ready";q("#comMine").hidden=v!=="mine";preview();
}
d.querySelectorAll(".tab").forEach(b=>b.onclick=()=>tab(b.dataset.mode));
q(".x").onclick=()=>d.close();
const ownInput=q("#comFile");q(".pick").onclick=()=>ownInput.click();
function imageData(src){
return new Promise((resolve,reject)=>{
 const im=new Image();im.onload=()=>{
 try{
 const w=320,h=480,c=document.createElement("canvas");c.width=w;c.height=h;
 const ctx=c.getContext("2d",{alpha:false});ctx.fillStyle="#f3eaf3";ctx.fillRect(0,0,w,h);
 const sw=im.naturalWidth,sh=im.naturalHeight;if(!sw||!sh)throw Error("image size");
 const s=Math.max(w/sw,h/sh);ctx.drawImage(im,(w-sw*s)/2,(h-sh*s)/2,sw*s,sh*s);
 resolve(c.toDataURL("image/webp",.8));
 }catch(e){reject(e)}
 };im.onerror=()=>reject(Error("image load"));im.src=src;
});
}
ownInput.onchange=async()=>{
const file=ownInput.files?.[0];if(!file)return;
const url=URL.createObjectURL(file);
try{own=await imageData(url);preview();}catch{note("사진을 불러올 수 없습니다. JPG·PNG를 선택해주세요.");}
finally{URL.revokeObjectURL(url);ownInput.value=""}
};
let busy=false;
q(".apply").onclick=async()=>{
if(busy)return;
if(mode==="mine"&&!own){note("먼저 사진을 선택해주세요");return;}
busy=true;const b=q(".apply");b.disabled=true;b.textContent="저장 중…";
try{
 const [title,author]=titleAndAuthor();
 const raster=mode==="mine"?own:await imageData(dataUri(coverSVG(selected,title,author)));
 const input=document.getElementById("cover");
 if(input){input.value=raster;input.dataset.manual="1";input.dispatchEvent(new Event("change",{bubbles:true}));}
 const item=currentBook();
 if(item){item.cover=raster;item.coverManual=true;item.coverSource=mode==="mine"?"user-upload":"studio-template";item.coverTemplateId=mode==="ready"?selected.id:null;item.updatedAt=new Date().toISOString();save();note("책장에 표지가 저장됐습니다");}
 else note("표지를 선택했습니다. 작품 등록창에서도 저장해주세요.");
 d.close();
}catch(e){note("이미지 저장을 완료하지 못했습니다.");}
finally{busy=false;b.disabled=false;b.textContent="이 표지 저장";}
};
function open(id="",fromForm=false){
usingForm=fromForm;
targetId=fromForm?String(id||""):"";
const selector=q("#comTarget");selector.replaceChildren(new Option(fromForm&&!id?"새 작품 등록 중":"작품 선택",""));
if(!fromForm){for(const b of list())selector.appendChild(new Option(b.title||"제목 없음",String(b.id)));if(!targetId&&selector.options.length>1)targetId=selector.options[1].value;}
else if(id){const b=books.find(x=>String(x.id)===String(id));if(b)selector.appendChild(new Option(b.title||"제목 없음",String(b.id)));}
selector.value=targetId;selector.disabled=fromForm;
own="";filter="전체";filters.querySelectorAll(".filter").forEach(b=>b.classList.toggle("on",b.textContent==="전체"));
const book=currentBook();
if(book?.coverTemplateId)selected=all.find(t=>t.id===book.coverTemplateId)||all[0];
showGrid();tab("ready");if(!d.open)d.showModal();
}
q("#comTarget").onchange=e=>{targetId=e.target.value;preview()};
button.onclick=()=>open("",false);
const picker=document.querySelector("#coverPicker .coverPickActions");
if(picker){
const add=document.createElement("button");add.type="button";add.className="coverPickBtn";add.textContent="🎨 50종 표지 선택";
picker.prepend(add);add.onclick=()=>open(document.getElementById("id")?.value||"",true);
}
window.openCommercialCoverStudio=open;
// Seed fictitious sample book cards only inside an empty, separately installed prototype.
if(!books.length&&!localStorage.getItem("mwl_commercial_sample_seed")){
const titles=["겨울 편지","은빛 정원","시계탑 아래","달의 도서관","검은 장미","파도 너머"];
const now=new Date().toISOString();
titles.forEach((title,i)=>books.push({id:"demo-"+(i+1),title,author:"샘플 작품",type:"웹소설",status:"안 읽음",rating:"",review:"",memo:"상업화 표지 체험용 가상 작품",cover:"",platforms:[],updatedAt:now}));
localStorage.setItem("mwl_commercial_sample_seed","1");save();render();
}
})();