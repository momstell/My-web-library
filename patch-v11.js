(() => {
  const coverInput = document.querySelector('#cover');
  if(!coverInput) return;

  const field = coverInput.closest('.field');
  if(field){
    const label = field.querySelector('label');
    if(label) label.textContent = '표지 이미지';
    coverInput.style.display = 'none';
    field.insertAdjacentHTML('beforeend', `
      <div id="coverPicker" class="coverPicker">
        <div class="coverPreview" id="coverPreview"><span>표지 없음</span></div>
        <div class="coverPickActions">
          <label class="coverPickBtn">사진 선택<input id="coverFile" type="file" accept="image/*" hidden></label>
          <button type="button" class="coverRemoveBtn" id="coverRemove">표지 제거</button>
          <div class="coverHelp">휴대폰 사진을 선택하면 표지용 크기로 자동 압축해 저장합니다.</div>
        </div>
      </div>`);
  }

  const style = document.createElement('style');
  style.textContent = `
    .coverPicker{display:flex;gap:12px;align-items:center;padding:11px;border:1px solid #e1e3eb;border-radius:13px;background:#fafafe}
    .coverPreview{width:74px;height:102px;flex:0 0 74px;border-radius:10px;overflow:hidden;background:linear-gradient(145deg,#d6d8e4,#a8adbd);display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;font-size:11px;font-weight:800;padding:6px}
    .coverPreview img{width:100%;height:100%;object-fit:cover;display:block}
    .coverPickActions{flex:1;min-width:0;display:flex;gap:7px;flex-wrap:wrap;align-items:center}
    .coverPickBtn,.coverRemoveBtn{border:1px solid #dedfe7;background:#fff;color:#555b69;border-radius:10px;padding:9px 11px;font-size:12px;font-weight:800;cursor:pointer}
    .coverPickBtn{background:#1d202d;color:#fff;border-color:#1d202d}
    .coverHelp{flex-basis:100%;font-size:10px;color:#8b909d;line-height:1.45}
  `;
  document.head.appendChild(style);

  const fileInput = document.querySelector('#coverFile');
  const preview = document.querySelector('#coverPreview');
  const removeBtn = document.querySelector('#coverRemove');

  function showPreview(src=''){
    if(!preview) return;
    preview.innerHTML = src ? `<img src="${src.replace(/"/g,'&quot;')}" alt="표지 미리보기">` : '<span>표지 없음</span>';
  }

  async function loadImage(file){
    if('createImageBitmap' in window){
      try{return await createImageBitmap(file)}catch{}
    }
    return await new Promise((resolve,reject)=>{
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
      img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('image'))};
      img.src=url;
    });
  }

  function dims(img){return {w:img.naturalWidth||img.width,h:img.naturalHeight||img.height}}

  async function compressCover(file){
    const img = await loadImage(file);
    const d=dims(img);
    if(!d.w||!d.h) throw new Error('size');
    let maxW=300,maxH=450,scale=Math.min(1,maxW/d.w,maxH/d.h);
    let w=Math.max(1,Math.round(d.w*scale)),h=Math.max(1,Math.round(d.h*scale));
    let quality=.76, data='';
    for(let i=0;i<4;i++){
      const c=document.createElement('canvas');c.width=w;c.height=h;
      const x=c.getContext('2d',{alpha:false});x.drawImage(img,0,0,w,h);
      data=c.toDataURL('image/webp',quality);
      if(data.length<115000)break;
      w=Math.max(120,Math.round(w*.82));h=Math.max(180,Math.round(h*.82));quality=Math.max(.55,quality-.08);
    }
    if(img.close)try{img.close()}catch{}
    return data;
  }

  if(fileInput){
    fileInput.addEventListener('change', async e=>{
      const file=e.target.files?.[0];
      if(!file)return;
      if(!file.type.startsWith('image/')){note('이미지 파일을 선택해주세요');return}
      try{
        note('표지 사진을 준비하는 중…');
        const data=await compressCover(file);
        coverInput.value=data;
        showPreview(data);
        note('표지 사진을 등록했습니다');
      }catch{note('이 사진을 불러오지 못했습니다')}
      e.target.value='';
    });
  }
  if(removeBtn) removeBtn.addEventListener('click',()=>{coverInput.value='';showPreview('');note('표지를 제거했습니다')});

  const edit10=window.edit;
  window.edit=function(id){
    edit10(id);
    setTimeout(()=>showPreview(document.querySelector('#cover')?.value||''),0);
  };

  const add=document.querySelector('#add');
  if(add) add.addEventListener('click',()=>setTimeout(()=>showPreview(''),0));

  // 직접 URL을 다시 넣는 경우에도 미리보기 동기화 (개발/복원용)
  coverInput.addEventListener('change',()=>showPreview(coverInput.value||''));

  const render10=render;
  render=function(){
    render10();
    const foot=document.querySelector('.foot');
    if(foot)foot.textContent='콘텐츠는 원 서비스에서 열립니다 · 개인용 소장목록 v1.1';
  };
  window.render=render;
  render();
})();