(function themeUpgrade(){
 const sheet=document.querySelector(".themeSheet"),panel=document.querySelector(".themePanel");
 if(!sheet||!panel)return;
 const colorKey="mwl_custom_color_v49", materialKey="mwl_material_v49";
 const materials=[
 ["none","기본","linear-gradient(140deg,#f4effc,#e8def5)"],
 ["walnut","월넛우드","linear-gradient(92deg,#452a1c,#8d6041 13%,#422719 34%,#ae7c4f 40%,#57341e 68%,#2e1d15)"],
 ["marble-ivory","아이보리 대리석","linear-gradient(133deg,#faf8f3,#e9e4db 42%,#fffcf7 65%,#ddd8cf)"],
 ["marble-silver","실버 대리석","linear-gradient(130deg,#fbfbfb,#c5c8cc 53%,#f5f5f5)"],
 ["marble-emerald","에메랄드 대리석","linear-gradient(130deg,#174138,#49756b 52%,#092a28)"],
 ["marble-cream","크림 대리석","linear-gradient(140deg,#f6eddb,#dec6ab 50%,#fdf8ec)"],
 ["sea","투명한 바다","linear-gradient(165deg,#4aaacc,#b5eef0 50%,#9bd1bb)"],
 ["woods","햇살 숲길","linear-gradient(130deg,#192f1f,#82a86e 40%,#2d5d3a)"]
 ];
 const extra=document.createElement("section");extra.id="v49ThemeSection";
 extra.innerHTML=`<div class="themeLabel">내가 고르는 색상</div>
 <div class="colorEditor"><label class="colorWell" for="v49Color"><input type="color" id="v49Color" value="#7654ef" aria-label="내 서재 색상 선택"></label>
 <input id="v49Hex" class="colorHex" maxlength="7" value="#7654ef" spellcheck="false" aria-label="HEX 색상 코드 입력">
 <button type="button" class="ghost" id="v49ApplyColor">적용</button></div>
 <div class="themeLabel">질감 · 서재 배경</div>
 <div class="materialGrid">${materials.map(([id,n,bg])=>`<button type="button" class="materialTile" data-material="${id}" style="--matcolor:${bg}"><span class="materialThumb"></span><span class="materialName">${n}</span></button>`).join("")}</div>
 <div class="materialHint">배경은 질감 중심으로 표현하며 작품 카드와 텍스트는 선명하게 유지합니다.</div>`;
 const old=panel.querySelector(".patternGrid")?.previousElementSibling;
 const pattern=panel.querySelector(".patternGrid");
 if(old&&old.textContent?.includes("무늬"))old.style.display="none";
 if(pattern)pattern.style.display="none";
 panel.appendChild(extra);
 const css=document.createElement("style");
 css.textContent=`
 .themePanel{max-height:min(88vh,880px)!important}
 .colorEditor{display:flex;align-items:center;gap:9px}
 .colorWell{width:54px;height:47px;border-radius:13px;display:grid;place-items:center;overflow:hidden;border:1px solid #ddd;flex-shrink:0}
 .colorWell input{width:80px;height:70px;border:0;padding:0;background:none;cursor:pointer}
 .colorHex{font:700 14px monospace;border:1px solid #ddd;border-radius:11px;height:46px;min-width:0;flex:1;padding:8px}
 .materialGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .materialTile{border:2px solid transparent;background:#f6f5f7;border-radius:16px;padding:7px;color:#303038;text-align:left;min-width:0}
 .materialTile.on{border-color:var(--lib-accent);background:var(--lib-tint)}
 .materialThumb{background:var(--matcolor);border-radius:11px;display:block;width:100%;height:78px}
 .materialName{display:block;font-size:12px;font-weight:800;padding:7px 3px 3px}
 .materialHint{font-size:11px;color:#89828e;line-height:1.5;margin:9px 0}
 body[data-mwl-material]{background-attachment:fixed!important;background-repeat:repeat!important}
 body[data-mwl-material="none"]{background-image:none!important;background-color:var(--v48bg)!important}
 body[data-mwl-material="walnut"]{background-color:#4f2d1d!important;background-image:
 radial-gradient(ellipse 270px 36px at 45% 22%, transparent 78%,rgba(13,5,2,.30) 80%,transparent 83%,rgba(235,193,136,.13) 88%,transparent 91%),
 repeating-linear-gradient(177deg,rgba(26,9,3,.2) 0 1px,transparent 2px 9px,rgba(248,187,103,.12) 10px,transparent 11px 17px),
 linear-gradient(95deg,#302016,#6c4329 21%,#996b44 31%,#3e2619 48%,#795139 63%,#42281b 85%,#302015)!important;background-size:400px 220px,100% 200px,100% 100%!important}
 body[data-mwl-material="marble-ivory"],body[data-mwl-material="marble-silver"],body[data-mwl-material="marble-emerald"],body[data-mwl-material="marble-cream"]{background-size:650px 650px,480px 480px,100% 100%!important}
 body[data-mwl-material="marble-ivory"]{background-color:#f9f6ef!important;background-image:linear-gradient(121deg,transparent 22%,rgba(140,131,113,.1) 22.2%,transparent 22.6%,rgba(140,131,113,.09) 23%,transparent 23.5%,transparent 75%,rgba(152,146,139,.12) 75.2%,transparent 76%),linear-gradient(154deg,transparent 54%,rgba(166,158,146,.10) 54.3%,transparent 55%),linear-gradient(140deg,#fcfaf5,#e7e2db,#fffdf8)!important}
 body[data-mwl-material="marble-silver"]{background-color:#e7e8eb!important;background-image:linear-gradient(130deg,transparent 26%,rgba(92,102,114,.19) 26.2%,transparent 26.8%,transparent 71%,rgba(116,122,127,.17) 71.3%,transparent 72%),linear-gradient(53deg,transparent 45%,rgba(70,87,99,.16) 45.2%,transparent 45.6%),linear-gradient(120deg,#fafafa,#d6d9dd,#f4f6f7)!important}
 body[data-mwl-material="marble-emerald"]{background-color:#14463a!important;background-image:linear-gradient(131deg,transparent 21%,rgba(217,235,222,.26) 21.3%,transparent 22%,transparent 77%,rgba(228,237,215,.22) 77.3%,transparent 78%),linear-gradient(62deg,transparent 55%,rgba(231,240,226,.17) 55.3%,transparent 56%),linear-gradient(135deg,#123b33,#3a6e61,#0b2828)!important}
 body[data-mwl-material="marble-cream"]{background-color:#f5ead9!important;background-image:linear-gradient(125deg,transparent 35%,rgba(171,129,82,.15) 35.3%,transparent 35.9%,transparent 71%,rgba(168,123,83,.12) 71.3%,transparent 72%),linear-gradient(57deg,transparent 58%,rgba(172,145,121,.11) 58.4%,transparent 59%),linear-gradient(142deg,#fffaf0,#e5d2ba,#f7f0e6)!important}
 body[data-mwl-material="sea"]{background-color:#b9e9f0!important;background-image:
 repeating-radial-gradient(ellipse 320px 110px at 30% 120%,rgba(255,255,255,.23) 0 2px,transparent 4px 36px,rgba(255,255,255,.20) 38px,transparent 42px 75px),
 linear-gradient(155deg,#a5e8f2,#3caec9 48%,#b7eada)!important;background-size:430px 220px,100% 100%!important}
 body[data-mwl-material="woods"]{background-color:#346244!important;background-image:
 radial-gradient(ellipse 40px 75px at 13% 15%,rgba(165,204,130,.3) 0 69%,transparent 74%),
 radial-gradient(ellipse 80px 35px at 75% 65%,rgba(18,66,43,.3) 0 68%,transparent 73%),
 radial-gradient(ellipse at 35% 4%,rgba(252,235,153,.22),transparent 44%),
 linear-gradient(130deg,#1f3b2d,#6d9d64,#284d38)!important;background-size:300px 240px,360px 310px,100% 100%,100% 100%!important}
 body[data-mwl-material]:not([data-mwl-material="none"]) main.main{background:transparent!important}
 .main .card,.main .quickStat,.main .chip,.main .ghost,.main .viewTools,.main .sortSelect,.main .empty{box-shadow:0 4px 18px rgba(10,14,20,.035)}
 @media(max-width:600px){.materialThumb{height:66px}}
 `;
 document.head.appendChild(css);
 const picker=extra.querySelector("#v49Color"),hex=extra.querySelector("#v49Hex");
 function applyColor(raw,store){
   if(!/^#[0-9a-fA-F]{6}$/.test(raw))return false;
   const c=raw.toLowerCase();
   const rgb=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
   const mixed=(a,b,t)=>"#"+a.map((v,i)=>Math.round(v*(1-t)+b[i]*t).toString(16).padStart(2,"0")).join("");
   const deep=mixed(rgb,[13,12,20],.58);
   const pale=mixed(rgb,[255,255,255],.89);
   const line=mixed(rgb,[255,255,255],.74);
   const root=document.documentElement;
   root.style.setProperty("--lib-accent",c);root.style.setProperty("--lib-deep",deep);
   root.style.setProperty("--lib-tint",pale);root.style.setProperty("--lib-line",line);
   root.style.setProperty("--v48a",c);root.style.setProperty("--v48b",mixed(rgb,[255,255,255],.16));
   root.style.setProperty("--v48hero1",deep);root.style.setProperty("--v48hero2",mixed(rgb,[0,0,0],.36));
   root.style.setProperty("--p",c);root.style.setProperty("--p2",mixed(rgb,[255,255,255],.16));
   root.style.setProperty("--line",line);
   picker.value=c;hex.value=c;
   if(store)localStorage.setItem(colorKey,c);
   return true;
 }
 picker.oninput=()=>applyColor(picker.value,true);
 hex.onchange=()=>{if(!applyColor(hex.value,true))hex.value=picker.value;};
 extra.querySelector("#v49ApplyColor").onclick=()=>{if(!applyColor(hex.value,true))note("HEX 색상을 확인해주세요");};
 function setMaterial(id){
   if(!materials.some(x=>x[0]===id))id="none";
   document.body.dataset.mwlMaterial=id;
   // Reset previous v4.8 pattern so an older CSS skin cannot override the new material.
   document.body.dataset.mwlPattern="none";
   localStorage.setItem(materialKey,id);
   localStorage.setItem("mwl_pattern_v48","none");
   extra.querySelectorAll("[data-material]").forEach(x=>x.classList.toggle("on",x.dataset.material===id));
 }
 extra.addEventListener("click",e=>{const x=e.target.closest("[data-material]");if(x)setMaterial(x.dataset.material);});
 const saved=localStorage.getItem(colorKey);
 if(saved)applyColor(saved,false);
 setMaterial(localStorage.getItem(materialKey)||localStorage.getItem("mwl_pattern_v48")||"none");
 sheet.addEventListener("click",e=>{
    if(e.target.closest(".paletteBtn")){localStorage.removeItem(colorKey);setTimeout(()=>{const col=getComputedStyle(document.documentElement).getPropertyValue("--v48a").trim();if(/^#[0-9a-f]{6}$/i.test(col))applyColor(col,false);},20);}
 });
})();