(function coverStudio(){
"use strict";
const rows=[
  // 20 male leads
  ["male","서재의 교수님","지적","현대 로맨스","s1",0,1],
  ["male","위험한 대표님","섹시","현대 로맨스","s1",1,1],
  ["male","비 내리는 밤의 남자","과묵","현대 로맨스","s1",2,1],
  ["male","벚꽃 캠퍼스의 연하남","귀여움","캠퍼스","s1",3,1],
  ["male","달빛 궁의 황태자","냉미남","로맨스판타지","s2",4,0],
  ["male","오후의 파티시에","다정","현대 로맨스","s2",5,0],
  ["male","도시의 설계자","도시적","현대 로맨스","s3",0,0],
  ["male","책방의 지적인 남자","지적","현대 로맨스","s3",1,0],
  ["male","봄날의 기타리스트","청량","캠퍼스","s3",3,0],
  ["male","달의 기사","냉미남","판타지","s3",4,0],
  ["male","푸른 마법사","신비","판타지","s4",0,0],
  ["male","황금빛 왕자","우아","궁정","s4",1,0],
  ["male","빵 굽는 곰돌이","포근","현대 로맨스","sp1",0,0],
  ["male","조선의 암행어사","과묵","궁중·조선","sp1",1,0],
  ["male","바다의 제독","제복","밀리터리·스파이","sp1",2,0],
  ["male","하얀 가운의 의사","지적","의료","med",0,0],
  ["male","꼬마 환자의 주치의","다정","의료·아이","med",1,0],
  ["male","서울의 건축가","도시적","다양한 인물","div",0,0],
  ["male","오래된 서점의 작가","우아","다양한 인물","div",1,0],
  ["male","카메라 너머의 사진가","과묵","현대 로맨스","s4",2,0],
  // 15 female leads
  ["female","달빛 아래의 그녀","청순","로맨스판타지","s1",4,0],
  ["female","붉은 궁의 여왕","도도·악녀","궁정","s1",5,0],
  ["female","도시를 걷는 커리어우먼","당찬","현대 로맨스","s4",3,1],
  ["female","비밀을 품은 황후","우아","궁중·조선","s4",5,0],
  ["female","은빛 마녀의 초대","신비","판타지","s5",1,1],
  ["female","나의 완벽한 상사","도도","현대 로맨스","s5",2,0],
  ["female","장미 정원의 영애","청순","로맨스판타지","s5",3,1],
  ["female","검은 장미 악녀","도도·악녀","궁정","s5",4,1],
  ["female","포근한 책방 주인","포근","현대 로맨스","sp1",3,0],
  ["female","궁궐의 비밀을 아는 여인","도도","궁중·조선","sp1",4,0],
  ["female","도심의 스파이","과묵","밀리터리·스파이","sp1",5,0],
  ["female","수술실의 스타 의사","당찬","의료","med",2,0],
  ["female","아이 곁의 소아과 의사","다정","의료·아이","med",3,0],
  ["female","자신감 있는 외과 전문의","당찬","의료·다양한 인물","div",2,0],
  ["female","비 오는 날의 작가","우아","다양한 인물","div",3,0],
  // 15 couples and family covers
  ["couple","오피스 라이벌","도시적","현대 로맨스","s7",0,1],
  ["couple","계약결혼의 첫날","설렘","궁정","s7",1,1],
  ["couple","마법사의 적과 사랑","강한 서사","판타지","s7",4,1],
  ["couple","황태자와 영애의 약속","우아","로맨스판타지","s8",1,1],
  ["couple","우리 동네 빵집에서","포근","현대 로맨스","s8",3,0],
  ["couple","통통한 우리 둘","포근","현대 로맨스·다양한 체형","sp2",0,0],
  ["couple","비밀 서찰과 조선의 연인","궁중 암투","궁중·조선","sp2",1,0],
  ["couple","함정 위의 해군 장교","제복","밀리터리·스파이","sp2",2,0],
  ["couple","작전명: 두 사람","과묵","밀리터리·스파이","sp2",3,0],
  ["couple","군의관의 약속","다정","밀리터리·의료","sp2",4,0],
  ["couple","궁중 마차에서 내린 가족","가족","아이·가족·궁중","med",4,0],
  ["couple","유치원 가는 날","가족","아이·가족","med",5,0],
  ["couple","소아과 진료실의 작은 손님","다정","아이·가족·의료","med",1,0],
  ["couple","서울의 저녁, 서로의 온기","설렘","다양한 인물","div",4,0],
  ["couple","낯선 왕국의 두 사람","강한 서사","로맨스판타지·다양한 인물","div",5,0]
];
// 50 additional original covers for the 100-cover expansion.
rows.push(
  // 20 additional male leads (catalogue total: 40)
  ["male","옥상 위의 반항아","반항아","학원물·스쿨룩·캠퍼스","new",0,0],
  ["male","검은 라운지의 수장","위험한 매력","조직·느와르·현대 로맨스","new",1,0],
  ["male","교복 대신 바시티 재킷","청량","학원물·스쿨룩·캠퍼스","new",2,0],
  ["male","호텔의 야간 지배인","우아","호텔리어·현대 로맨스","new",3,0],
  ["male","응급실의 다정한 의사","다정","의료·현대 로맨스","new",4,0],
  ["male","코드네임 블루","과묵","특임대·스파이","new",5,0],
  ["male","파도를 지휘하는 장교","냉미남","해군·밀리터리","new",6,0],
  ["male","제복의 귀환","묵직함","군복·밀리터리","new",7,0],
  ["male","자정의 파티 초대장","섹시","파티룩·현대 로맨스","new",8,0],
  ["male","재벌가의 문제적 후계자","도도","조직·현대 로맨스","new",9,0],
  ["male","피아노에 머문 밤","감성","파티룩·현대 로맨스","new",10,0],
  ["male","통통한 제빵사의 고백","포근","다양한 체형·현대 로맨스","new",11,0],
  ["male","비단 도포의 선비","과묵","궁중·조선·한복","new",12,0],
  ["male","호텔 로비의 외교관","지적","호텔리어·다양한 인물","new",13,0],
  ["male","밤의 미술관 큐레이터","우아","직업·다양한 인물","new",14,0],
  ["male","완벽한 셰프의 비밀","섹시","직업·현대 로맨스","new",15,0],
  ["male","사건 현장의 형사","과묵","수사·현대 로맨스","new",16,0],
  ["male","비행운을 쫓는 파일럿","청량","직업·현대 로맨스","new",17,0],
  ["male","교무실의 젊은 선생님","다정","학원물·직업·현대 로맨스","new",18,0],
  ["male","매트리스 위의 눈빛","몽환","현대 로맨스","new",19,0],
  // 15 additional female leads (catalogue total: 30)
  ["female","붉은 드레스의 승부사","당찬","파티룩·현대 로맨스","new",20,0],
  ["female","호텔의 총지배인","우아","호텔리어·현대 로맨스","new",21,0],
  ["female","암호명 라일락","과묵","스파이·특임대","new",22,0],
  ["female","비밀을 쥔 궁녀","도도","궁중·조선·한복","new",23,0],
  ["female","하얀 가운의 외과의","당찬","의료·직업","new",24,0],
  ["female","캠퍼스의 늦은 오후","청순","학원물·스쿨룩·캠퍼스","new",25,0],
  ["female","통통한 디자이너의 계절","귀여움","다양한 체형·현대 로맨스","new",26,0],
  ["female","재즈가 흐르는 파티","섹시","파티룩·다양한 인물","new",27,0],
  ["female","은빛 영애의 무도회","우아","로맨스판타지·파티룩","new",28,0],
  ["female","함교 위의 해군 장교","냉미녀","해군·밀리터리","new",29,0],
  ["female","특임대 팀장 강서윤","과묵","특임대·밀리터리","new",30,0],
  ["female","첫눈 오는 날의 담임","다정","학원물·직업·현대 로맨스","new",31,0],
  ["female","조직의 후계자","도도","조직·느와르","new",32,0],
  ["female","호텔 컨시어지의 미소","청량","호텔리어·다양한 인물","new",33,0],
  ["female","밤을 달리는 밴드 보컬","반항아","학원물·캠퍼스·다양한 인물","new",34,0],
  // 15 additional couples and family covers (catalogue total: 30)
  ["couple","워커홀릭 앙숙의 야근","앙숙·설렘","오피스·현대 로맨스·앙숙","new",35,0],
  ["couple","가면무도회의 약속","강한 서사","파티룩·로맨스판타지","new",36,0],
  ["couple","호텔 스위트룸의 비밀","섹시","호텔리어·현대 로맨스","new",37,0],
  ["couple","서로를 겨눈 두 사람","긴장감","조직·느와르·현대 로맨스","new",38,0],
  ["couple","작전명: 한밤의 파트너","강한 서사","스파이·특임대","new",39,0],
  ["couple","파도 위의 귀환","설렘","해군·밀리터리·현대 로맨스","new",40,0],
  ["couple","당직실에 남은 두 의사","다정","의료·현대 로맨스","new",41,0],
  ["couple","비단 장막 너머의 서약","궁중 암투","궁중·조선·한복","new",42,0],
  ["couple","마차에서 내린 세 사람","가족","아이·가족·궁중","new",43,0],
  ["couple","유치원 앞 작은 손","포근","아이·가족·현대 로맨스","new",44,0],
  ["couple","우리 둘의 포근한 계절","포근","다양한 체형·현대 로맨스","new",45,0],
  ["couple","서울의 밤, 서로의 편","설렘","다양한 인물·현대 로맨스","new",46,0],
  ["couple","백야의 무도회","우아","다양한 인물·파티룩","new",47,0],
  ["couple","호텔리어와 단골 손님","청량","호텔리어·현대 로맨스","new",48,0],
  ["couple","꼬마 손님과 수의사의 하루","다정","아이·가족·다양한 인물","new",49,0]
);
rows.push(["couple","레인 끝에서 만난 승부사들","청량·설렘","스포츠·수영·테니스·현대 로맨스","sports",0,0]);
const sources={
  s1:"exec-dae66234-ff3a-4577-b73a-9b1212322796.png",
  s2:"exec-51f60eb0-1f6e-4b3d-a852-ff132540dbd0.png",
  s3:"exec-1009fa9a-f2ad-4c78-b8fb-b3792741c0a0.png",
  s4:"exec-58f0f069-04b8-4791-a121-5494360897ed.png",
  s5:"exec-1051ba8f-fd51-468c-94b9-c8aa5e00b9b1.png",
  s7:"exec-a43c276c-fbdb-40de-9135-42e413d1079b.png",
  s8:"exec-5a1c21c8-3f4f-4ba8-b185-7ddace562c23.png",
  sp1:"exec-22f3c37b-d2da-4f7b-833f-8805667000c0.png",
  sp2:"exec-a04df655-3d9c-40c4-bc18-f1953986d0cf.png",
  med:"exec-002502dd-3a74-46bd-a653-477fc6fa671d.png",
  div:"exec-8cfd8194-f5e4-4126-a99e-974e930dd6a3.png"
};
const all=rows.map((r,i)=>({id:i+1,group:r[0],name:r[1],mood:r[2],genre:r[3],image:`./cover-art/${String(i+1).padStart(2,"0")}.webp`,featured:!!r[6]}));
const groupCount=key=>all.filter(x=>x.group===key).length;
const esc=v=>String(v||"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const style=document.createElement("style");style.textContent=`
#comStudio{border:0;border-radius:22px;padding:0;width:min(980px,calc(100% - 16px));max-height:94vh;overflow:hidden}
#comStudio::backdrop{background:rgba(20,12,30,.74)}
#comStudio .top{padding:16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ece6f1}
#comStudio h3{margin:0;font-size:20px;color:#34233c}#comStudio .intro{color:#847b8c;font-size:11px;padding-top:4px}
#comStudio .x{border:0;background:#eeeaf2;border-radius:100%;width:34px;height:34px;font-size:22px}
#comStudio .cols{display:grid;grid-template-columns:minmax(0,1fr) 245px;height:min(720px,calc(94vh - 116px))}
#comStudio .browse{padding:12px;overflow-y:auto}
#comStudio .tabs,#comStudio .filters{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;white-space:nowrap;margin-bottom:10px;padding-bottom:3px;scrollbar-width:thin}
#comStudio .tab,#comStudio .filter{font-size:12px;border:1px solid #ddd5e5;padding:8px 10px;border-radius:10px;background:white;color:#5b5070;font-weight:750}
#comStudio .filter{font-size:10px;padding:6px 9px;border-radius:99px}
#comStudio .tab.on,#comStudio .filter.on{background:#68488c;color:white;border-color:#68488c}
#comStudio .filterLabel{font-size:10px;font-weight:900;color:#91869b;margin:10px 2px 6px}
#comStudio .search{width:100%;box-sizing:border-box;border:1px solid #ddd5e5;border-radius:10px;padding:9px 11px;margin:2px 0 10px;font-size:12px;color:#453b4d}
#comStudio .list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
#comStudio .item{border:2px solid transparent;border-radius:11px;padding:3px;background:none;text-align:left;min-width:0}
#comStudio .item.on{border-color:#8861c8;background:#f2eaff}
#comStudio .item img{aspect-ratio:2/3;width:100%;display:block;object-fit:cover;border-radius:8px;box-shadow:0 3px 10px #0002}
#comStudio .item small{display:block;font-size:8px;line-height:1.35;margin:5px 1px 3px;color:#68488c;white-space:normal;overflow-wrap:anywhere;min-height:22px}
#comStudio .preview{background:#faf7fc;border-left:1px solid #eae0f0;padding:15px;display:flex;align-items:center;flex-direction:column;gap:10px;overflow-y:auto}
#comStudio .comTargetLabel{color:#685a72;font-size:11px;font-weight:850}#comStudio .comTarget{width:100%;border:1px solid #ded1e6;background:white;border-radius:9px;padding:8px;min-width:0;font-size:11px;color:#4a365c}
#comStudio .preview img{width:100%;max-width:184px;aspect-ratio:2/3;object-fit:cover;border-radius:9px;box-shadow:0 8px 25px #0003}
#comStudio .desc{font-size:11px;text-align:center;color:#5d5363;font-weight:750;line-height:1.5}
#comStudio .apply{background:#64447f;color:#fff;border:0;border-radius:12px;padding:12px;width:100%;font-weight:900}
#comStudio .upload{padding:20px;border:2px dashed #d6c1e8;border-radius:14px;background:#fdfaff;text-align:center;font-size:12px;line-height:1.9;color:#645572}
#comStudio .pick{padding:10px 15px;background:#64447f;color:white;border:0;border-radius:10px;font-weight:800}
#comStudio .foot{padding:10px 15px;text-align:center;font-size:10px;color:#928997;background:#fff}
@media(max-width:680px){
  #comStudio{width:calc(100vw - 20px);max-height:92dvh;border-radius:18px}
  #comStudio .cols{display:flex;flex-direction:column;height:min(78dvh,760px);overflow:hidden}
  #comStudio .browse{flex:1;min-height:0;padding:8px;overflow-y:auto}
  #comStudio .list{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px}
  #comStudio .item{padding:2px;border-width:1px}
  #comStudio .item img{width:100%;height:auto;max-height:150px;aspect-ratio:2/3;object-fit:cover}
  #comStudio .item small{font-size:8px;min-height:22px}
  #comStudio .preview{flex:none;display:grid;grid-template-columns:62px minmax(0,1fr);align-items:center;gap:5px 9px;border-left:0;border-top:1px solid #eae0f0;padding:8px 10px;overflow:visible}
  #comStudio .comTargetLabel,#comStudio .comTarget,#comStudio .preview .desc{grid-column:2}
  #comStudio .comTargetLabel{grid-row:1}
  #comStudio .comTarget{grid-row:2;padding:6px}
  #comStudio .preview img{grid-column:1;grid-row:1/4;width:62px;height:93px;max-width:none;aspect-ratio:2/3;object-fit:cover}
  #comStudio .preview .desc{grid-row:3;text-align:left}
  #comStudio .apply{grid-column:1/-1;font-size:12px;padding:10px}
  #comStudio .foot{font-size:9px}
  #comStudio h3{font-size:17px}
}
`;document.head.appendChild(style);
const d=document.createElement("dialog");d.id="comStudio";
d.innerHTML=`<div class="top"><div><h3>캐릭터 표지 스튜디오 · ${all.length}종</h3><div class="intro">표정을 보고, 분위기를 고르고, 책장에 직접 꽂아 보세요.</div></div><button class="x" type="button" aria-label="닫기">×</button></div>
<div class="cols"><div class="browse"><div class="tabs"><button type="button" class="tab on" data-mode="all">전체 ${all.length}</button><button type="button" class="tab" data-mode="male">남자 ${groupCount("male")}</button><button type="button" class="tab" data-mode="female">여자 ${groupCount("female")}</button><button type="button" class="tab" data-mode="couple">커플·가족 ${groupCount("couple")}</button><button type="button" class="tab" data-mode="mine">내 이미지</button></div>
<div id="comReady"><input class="search" type="search" placeholder="표지명·분위기·장르·의상 검색" aria-label="표지 검색"><div class="filterLabel">먼저 만나볼 12종</div><div class="filters featuredFilters"><button type="button" class="filter on" data-feature="all">전체 보기</button><button type="button" class="filter" data-feature="featured">추천 12종</button></div><div class="filterLabel">분위기</div><div class="filters moods"></div><div class="filterLabel">장르·테마·의상</div><div class="filters genres"></div><div class="list"></div></div>
<div id="comMine" hidden><div class="upload">휴대전화 사진으로 나만의 표지를 등록할 수 있어요.<p><button class="pick" type="button">사진 선택하기</button><input type="file" id="comFile" accept="image/*" hidden></p><small>등록한 사진의 권리는 이용자가 확인합니다.</small></div></div></div>
<div class="preview"><label class="comTargetLabel" for="comTarget">표지를 적용할 작품</label><select id="comTarget" class="comTarget"></select><img id="comPreview" alt="표지 미리보기"><div class="desc" id="comDesc"></div><button type="button" class="apply">이 표지 저장</button></div></div>
<div class="foot">오리지널 캐릭터 일러스트 · 원작 작품이나 캐릭터를 복제하지 않은 앱 전용 샘플</div>`;
document.body.appendChild(d);
const q=s=>d.querySelector(s),listGrid=q(".list");
let selected=all[0],mode="all",mood="전체",genre="전체",searchTerm="",featuredOnly=false,targetId="",own="",previewSeq=0,usingForm=false;
function currentBook(){return books.find(x=>String(x.id)===String(targetId))||null;}
function titleAndAuthor(){const b=currentBook();return [usingForm?document.querySelector("#title")?.value.trim()||b?.title||"나만의 소장도서":b?.title||"나만의 소장도서",usingForm?document.querySelector("#author")?.value.trim()||b?.author||"MY LIBRARY":b?.author||"MY LIBRARY"]}
function wrapTitle(ctx,title,maxWidth){const words=Array.from(String(title||"나만의 소장도서"));const lines=[];let line="";for(const ch of words){if(line&&ctx.measureText(line+ch).width>maxWidth){lines.push(line);line=ch}else line+=ch}if(line)lines.push(line);if(lines.length>2){lines[1]=lines.slice(1).join("").slice(0,10)+"…";lines.length=2}return lines}
function completedCover(t,title,author){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{try{const c=document.createElement("canvas");c.width=480;c.height=720;const ctx=c.getContext("2d");ctx.drawImage(img,0,0,c.width,c.height);const g=ctx.createLinearGradient(0,390,0,720);g.addColorStop(0,"rgba(17,14,28,0)");g.addColorStop(.36,"rgba(17,14,28,.67)");g.addColorStop(1,"rgba(17,14,28,.94)");ctx.fillStyle=g;ctx.fillRect(0,360,480,360);ctx.textAlign="center";ctx.fillStyle="#f6dfb0";ctx.font="700 18px 'Noto Sans KR',sans-serif";ctx.fillText(t.genre.toUpperCase(),240,493);ctx.fillStyle="#fff";ctx.font=`800 ${String(title).length>15?32:40}px 'Noto Sans KR',sans-serif`;const lines=wrapTitle(ctx,title,410),start=lines.length>1?555:572;lines.forEach((line,i)=>ctx.fillText(line,240,start+i*48));ctx.fillStyle="#e5c889";ctx.fillRect(174,640,132,2);ctx.fillStyle="#f6f2ee";ctx.font="500 18px 'Noto Sans KR',sans-serif";ctx.fillText(String(author||"MY LIBRARY").slice(0,22),240,679);resolve(c.toDataURL("image/webp",.88))}catch(e){reject(e)}};img.onerror=()=>reject(new Error("cover art load"));img.src=t.image})}
async function preview(){const seq=++previewSeq;const [title,author]=titleAndAuthor();try{const src=mode==="mine"&&own?own:await completedCover(selected,title,author);if(seq!==previewSeq)return;q("#comPreview").src=src;q("#comDesc").textContent=mode==="mine"?(own?"내가 선택한 사진":"사진을 선택해주세요"):`${String(selected.id).padStart(2,"0")} · ${selected.group==="male"?"남자":selected.group==="female"?"여자":"커플·가족"} · ${selected.mood} · ${selected.genre}`}catch{q("#comDesc").textContent="표지 미리보기를 불러오지 못했습니다"}}
function activeGroup(){return mode==="male"||mode==="female"||mode==="couple"?mode:null}
function filtered(){return all.filter(t=>(!activeGroup()||t.group===activeGroup())&&(!featuredOnly||t.featured)&&(mood==="전체"||t.mood===mood)&&(genre==="전체"||t.genre.split("·").some(x=>x.trim()===genre)||t.genre===genre)&&(!searchTerm||`${t.name} ${t.mood} ${t.genre} ${coverTags(t).join(" ")}`.toLowerCase().includes(searchTerm)))}
function coverTags(t){const text=`${t.name} ${t.mood} ${t.genre}`.toLowerCase(),tags=[];const add=(ok,tag)=>{if(ok&&!tags.includes(tag))tags.push(tag)};
add(/의사|의료|직업|오피스|호텔리어|호텔|수사|교수|파티시에|건축가|작가|사진가|셰프|선생님|파일럿|외교관|컨시어지|전문의/.test(text),"전문직");
add(/학원물|캠퍼스|스쿨룩|교복|옥상|밴드/.test(text),"학원물");
add(/앙숙|혐관|원수|라이벌|서로를 겨눈|적과 사랑/.test(text),"혐관");
add(/안경|너드|지적|교수님|서재/.test(text),"너드");
add(/과묵|냉미남|냉미녀|도도|반항아|위험한 매력|악녀|묵직함|긴장감/.test(text),"까칠");
add(/설렘|다정|포근|가족|서약|약속|온기|순애|첫날|마차|작은 손/.test(text),"순애보");
add(/궁중|조선|궁정|황태자|황후|영애|한복/.test(text),"궁중암투");
add(/스파이|특임대|밀리터리|해군|군복|작전/.test(text),"제복·스파이");
add(/스포츠|수영|테니스|선수/.test(text),"스포츠");
add(/다양한 체형|통통/.test(text),"다양한체형");
add(/파티룩|무도회|파티/.test(text),"파티룩");
add(/로맨스판타지|로판/.test(text),"로판");
add(/판타지|마법|마녀|기사/.test(text),"판타지");
add(/호텔|호텔리어|컨시어지/.test(text),"호텔리어");
const moodTag=String(t.mood||"").replace(/[·\s]/g,"");add(!!moodTag,moodTag||"로맨스");
const genreTag=String(t.genre||"").split("·")[0].replace(/[·\s]/g,"");add(!!genreTag,genreTag||"로맨스");
return tags.slice(0,3).map(tag=>"#"+tag)}
function buildChips(kind){const host=q(kind==="mood"?".moods":".genres");host.replaceChildren();const group=activeGroup(),pool=all.filter(x=>!group||x.group===group),values=["전체",...new Set(pool.flatMap(x=>kind==="mood"?[x.mood]:x.genre.split("·").map(v=>v.trim())))];for(const value of values){const b=document.createElement("button");b.type="button";b.className="filter"+((kind==="mood"?mood:genre)===value?" on":"");b.textContent=value;b.onclick=()=>{if(kind==="mood")mood=value;else genre=value;buildChips(kind);showGrid()};host.append(b)}}
function showGrid(){const top=listGrid.scrollTop,items=filtered();listGrid.replaceChildren();if(items.length&&!items.some(x=>x.id===selected.id)){selected=items[0];preview()}for(const t of items){const b=document.createElement("button");b.type="button";b.className="item"+(t.id===selected.id&&mode!=="mine"?" on":"");const img=document.createElement("img");img.loading="lazy";img.alt=coverTags(t).join(" ");img.src=t.image;const tags=document.createElement("small");tags.className="coverTags";tags.textContent=coverTags(t).join(" ");b.append(img,tags);b.onclick=()=>{selected=t;showGrid();preview()};listGrid.append(b)}if(!listGrid.children.length){const empty=document.createElement("p");empty.textContent="이 조건에 맞는 표지가 없습니다.";empty.style.cssText="grid-column:1/-1;text-align:center;color:#8a8190;padding:24px";listGrid.append(empty)}listGrid.scrollTop=top}
function setMode(v){mode=v;d.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x.dataset.mode===v));q("#comReady").hidden=v==="mine";q("#comMine").hidden=v!=="mine";if(v!=="mine"){mood="전체";genre="전체";featuredOnly=false;q('[data-feature="all"]').classList.add("on");q('[data-feature="featured"]').classList.remove("on");buildChips("mood");buildChips("genre");showGrid()}preview()}
for(const b of d.querySelectorAll(".tab"))b.onclick=()=>setMode(b.dataset.mode);
for(const b of d.querySelectorAll("[data-feature]"))b.onclick=()=>{featuredOnly=b.dataset.feature==="featured";d.querySelectorAll("[data-feature]").forEach(x=>x.classList.toggle("on",x===b));showGrid()};
q(".x").onclick=()=>d.close();const ownInput=q("#comFile");q(".pick").onclick=()=>ownInput.click();
function imageData(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{try{const w=480,h=720,c=document.createElement("canvas");c.width=w;c.height=h;const ctx=c.getContext("2d",{alpha:false});ctx.fillStyle="#f3eaf3";ctx.fillRect(0,0,w,h);const sw=im.naturalWidth,sh=im.naturalHeight;if(!sw||!sh)throw Error("image size");const s=Math.max(w/sw,h/sh);ctx.drawImage(im,(w-sw*s)/2,(h-sh*s)/2,sw*s,sh*s);resolve(c.toDataURL("image/webp",.82))}catch(e){reject(e)}};im.onerror=()=>reject(Error("image load"));im.src=src})}
ownInput.onchange=async()=>{const file=ownInput.files?.[0];if(!file)return;const url=URL.createObjectURL(file);try{own=await imageData(url);preview()}catch{note("사진을 불러올 수 없습니다. JPG·PNG를 선택해주세요.")}finally{URL.revokeObjectURL(url);ownInput.value=""}};
let busy=false;
q(".apply").onclick=async()=>{if(busy)return;if(mode==="mine"&&!own){note("먼저 사진을 선택해주세요");return}busy=true;const b=q(".apply");b.disabled=true;b.textContent="저장 중…";try{const [title,author]=titleAndAuthor();const raster=mode==="mine"?own:await completedCover(selected,title,author);const input=document.getElementById("cover");if(input){input.value=raster;input.dataset.manual="1";input.dataset.coverSource=mode==="mine"?"user-upload":"character-template";input.dataset.coverTemplateId=mode==="mine"?"":String(selected.id);input.dataset.coverCategory=mode==="mine"?"":selected.group;input.dispatchEvent(new Event("change",{bubbles:true}))}const item=currentBook();if(item){item.cover=raster;item.coverManual=true;item.coverSource=mode==="mine"?"user-upload":"character-template";item.coverTemplateId=mode==="mine"?null:selected.id;item.coverCategory=mode==="mine"?null:selected.group;item.coverMood=mode==="mine"?null:selected.mood;item.coverGenre=mode==="mine"?null:selected.genre;item.updatedAt=new Date().toISOString();save();note("책장에 표지가 저장됐어요") }else note("표지를 골랐어요. 작품 등록창에서 저장을 눌러주세요.");d.close()}catch(e){note("이미지 저장을 완료하지 못했습니다.")}finally{busy=false;b.disabled=false;b.textContent="이 표지 저장"}};
function open(id="",fromForm=false){usingForm=fromForm;targetId=fromForm?String(id||""):"";const selector=q("#comTarget");selector.replaceChildren(new Option(fromForm&&!id?"새 작품 등록 중":"작품 선택",""));if(!fromForm){for(const b of list())selector.appendChild(new Option(b.title||"제목 없음",String(b.id)));if(!targetId&&selector.options.length>1)targetId=selector.options[1].value}else if(id){const b=books.find(x=>String(x.id)===String(id));if(b)selector.appendChild(new Option(b.title||"제목 없음",String(b.id)))}selector.value=targetId;selector.disabled=fromForm;own="";mood="전체";genre="전체";searchTerm="";q(".search").value="";featuredOnly=false;selected=all.find(t=>t.id===(currentBook()?.coverTemplateId||1))||all[0];q('[data-feature="all"]').classList.add("on");q('[data-feature="featured"]').classList.remove("on");buildChips("mood");buildChips("genre");showGrid();setMode("all");if(!d.open)d.showModal()}
q("#comTarget").onchange=e=>{targetId=e.target.value;preview()};
q(".search").oninput=e=>{searchTerm=e.target.value.trim().toLowerCase();showGrid()};
document.querySelector("#title")?.addEventListener("input",()=>{if(d.open&&usingForm)preview()});document.querySelector("#author")?.addEventListener("input",()=>{if(d.open&&usingForm)preview()});
const picker=document.querySelector("#coverPicker .coverPickActions");if(picker){const add=document.createElement("button");add.type="button";add.className="coverPickBtn";add.textContent="🎨 캐릭터 표지";picker.prepend(add);add.onclick=()=>open(document.getElementById("id")?.value||"",true)}
const form=document.querySelector("#form");form?.addEventListener("submit",()=>setTimeout(()=>{const source=document.querySelector("#cover")?.dataset||{};const t=source.coverTemplateId;if(!t)return;const title=document.querySelector("#title")?.value.trim()||"",author=document.querySelector("#author")?.value.trim()||"";const b=[...books].reverse().find(x=>x.title===title&&String(x.author||"")===author);if(!b)return;b.coverSource="character-template";b.coverTemplateId=Number(t);b.coverCategory=source.coverCategory||"";b.coverMood=all.find(x=>x.id===Number(t))?.mood||"";b.coverGenre=all.find(x=>x.id===Number(t))?.genre||"";localStorage.setItem(KEY,JSON.stringify(books));document.querySelector("#cover").dataset.coverTemplateId=""},0));
window.openCommercialCoverStudio=open;window.commercialCoverCatalog=all;buildChips("mood");buildChips("genre");showGrid();preview();
})();
