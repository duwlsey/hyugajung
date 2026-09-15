(()=>{
'use strict';
const get=id=>document.getElementById(id),data=window.DAMYANG_ROUTE;
const localISO=date=>new Date(date.getTime()+9*3600000).toISOString().slice(0,16);
get('departure').value=localISO(new Date());
function isReady(d){return d?.status==='verified'&&d.highwayMeters===0&&Number.isFinite(d.distanceMeters)&&d.distanceMeters>0&&Number.isFinite(d.durationSeconds)&&d.durationSeconds>0&&d.maps?.length>0&&d.maps.every(m=>((typeof m.svg==='string'&&m.svg.startsWith('<svg'))||m.src)&&m.title)&&Array.isArray(d.directions)&&d.sources?.length>0;}
if(!isReady(data))return;
get('distance').textContent=(data.distanceMeters/1000).toFixed(1)+' km';
const minutes=Math.max(1,Math.round(data.durationSeconds/60));
get('duration').textContent=minutes>=60?`${Math.floor(minutes/60)}시간 ${minutes%60}분`:`약 ${minutes}분`;
function updateArrival(){const value=get('departure').value;const time=Date.parse(value+'+09:00');get('arrival').textContent=Number.isFinite(time)?new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(time+data.durationSeconds*1000)):'출발 시각을 입력하세요';}
get('departure').addEventListener('input',updateArrival);updateArrival();

const stages=data.stages||[
 {title:'광주 출발',map:1,details:[5,6],steps:[0,1,2],next:'동문대로에서 국도 29호선으로 이어집니다.'},
 {title:'국도 29호선 따라',map:2,details:[7],steps:[3],next:'죽향대로를 따라 담양읍 회전교차로로 이어집니다.'},
 {title:'담양읍 진입',map:3,details:[8,9],steps:[4,5],next:'중앙로를 따라 중파사거리로 이어집니다.'},
 {title:'담양군청 도착',map:4,details:[10],steps:[6,7],next:'담양군청 도착. 주차 위치는 현장 안내를 확인하세요.'}
];
get('provenance').textContent='경로 확인: '+data.checkedAt+' · '+data.sources.join(' / ')+' · '+data.notes;
const panel=document.createElement('section');panel.className='stage-guide';panel.setAttribute('aria-live','polite');
const heading=document.createElement('h3'),instructions=document.createElement('ol'),nextHint=document.createElement('p'),detailTabs=document.createElement('div');detailTabs.className='detail-tabs';
panel.append(heading,instructions,nextHint,detailTabs);get('map-view').before(panel);
const pager=document.createElement('nav');pager.className='stage-pager';pager.setAttribute('aria-label','구간 이동');
const prev=document.createElement('button'),progress=document.createElement('span'),next=document.createElement('button');pager.append(prev,progress,next);get('map-caption').after(pager);
let current=0,stage=-1,objectURL,renderToken=0;
const escapeXML=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pendingMaps=new Map();
function loadMap(m){
 if(m.svg)return Promise.resolve(m.svg);
 if(pendingMaps.has(m.src))return pendingMaps.get(m.src);
 const promise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=m.src;
 script.onload=()=>{const svg=window.HYUGA_MAP_SVGS?.[m.key];script.remove();if(!svg){pendingMaps.delete(m.src);reject(Error('Missing map'));return;}m.svg=svg;delete window.HYUGA_MAP_SVGS[m.key];resolve(svg)};
 script.onerror=()=>{script.remove();pendingMaps.delete(m.src);reject(Error('Map unavailable'))};document.body.append(script);
 });pendingMaps.set(m.src,promise);return promise;
}
async function showMap(index){current=index;const token=++renderToken,m=data.maps[index];get('download').disabled=true;get('map-view').setAttribute('aria-busy','true');get('map-caption').textContent='선택한 지도를 불러오는 중…';
 try{await loadMap(m)}catch{if(token===renderToken){get('map-view').removeAttribute('aria-busy');get('map-caption').textContent='지도를 불러오지 못했습니다. 구간 버튼을 다시 눌러 주세요.'}return;}
 if(token!==renderToken)return;if(objectURL)URL.revokeObjectURL(objectURL);
 const detailNumber=stage<0?0:stages[stage].details.indexOf(index)+1;
 const title=stage<0?'전체 경로':String(stage+1).padStart(2,'0')+' '+stages[stage].title+(index===stages[stage].map?'':' · 확대 '+detailNumber);
 const svg=m.svg.replace(/(<text[^>]*>)(휴가중[^<]*)(<\/text>)/,'$1'+escapeXML('휴가중 · '+(data.region||'담양군')+' / '+title)+'$3');
 objectURL=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));const img=new Image();img.alt=title;
 img.onload=()=>{if(token===renderToken){get('download').disabled=false;get('map-view').removeAttribute('aria-busy')}};img.onerror=()=>{if(token===renderToken){get('map-view').removeAttribute('aria-busy');get('map-caption').textContent='지도를 불러오지 못했습니다. 구간을 다시 선택해 주세요.'}};get('download').disabled=true;img.src=objectURL;get('map-view').replaceChildren(img);
 get('map-caption').textContent=(stage<0?'전체 여정':title)+' · '+m.caption+(stage>=0&&index===stages[stage].map?' · 빨간선과 숫자는 위 확대 버튼에 해당하는 위치입니다.':'')+' · 지도 A에서 B 방향으로 이동합니다. 구간 끝 B에서 다음 구간의 A로 이어집니다.';
 [...detailTabs.children].forEach(button=>{const selected=Number(button.dataset.map)===index;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected))});
}
function selectStage(index){stage=index;instructions.replaceChildren();detailTabs.replaceChildren();
 heading.textContent=index<0?'오늘의 길, '+stages.length+'구간으로 따라가기':String(index+1).padStart(2,'0')+' '+stages[index].title;
 if(index<0){nextHint.textContent='주요 갈림길과 이어지는 도로를 기준으로 나눴어요. 01 광주 출발부터 차례로 따라가세요.'}
 else{const st=stages[index];st.steps.forEach(i=>{const li=document.createElement('li');li.textContent=data.directions[i].description.replace(/분기 A 지도를 함께 보세요\./,'1번 우치로 확대를 함께 보세요.').replace(/분기 D 지도를 확인하세요\./,'1번 죽향대로 확대를 확인하세요.');instructions.append(li)});nextHint.textContent=(index===stages.length-1?'도착 · ':'다음 연결 · ')+st.next;
 [st.map,...st.details].forEach((mi,i)=>{const button=document.createElement('button');button.dataset.map=mi;if(i>0)button.className='zoom-location';button.textContent=i===0?'이 구간 전체':i+' '+data.maps[mi].title.replace(/^분기 [A-Z] · /,'')+' 확대';button.addEventListener('click',()=>showMap(mi));detailTabs.append(button)});}
 [...get('map-tabs').children].forEach((button,i)=>{button.classList.toggle('selected',i===index+1);button.setAttribute('aria-pressed',String(i===index+1))});
 [...get('directions').children].forEach((li,i)=>{li.classList.toggle('current-stage',i===index);li.querySelector('button').setAttribute('aria-current',i===index?'step':'false')});
 prev.disabled=index<0;prev.textContent=index<=0?'← 전체 경로':'← '+String(index).padStart(2,'0')+' '+stages[index-1].title;
 next.disabled=index===stages.length-1;next.textContent=index===stages.length-1?(data.office||'담양군청')+' 도착 ✓':String(index+2).padStart(2,'0')+' '+stages[index+1].title+' →';progress.textContent=index<0?'전체 여정':(index+1)+' / '+stages.length+' 구간';
 get('map-tabs').children[index+1]?.scrollIntoView({block:'nearest',inline:'nearest'});showMap(index<0?0:stages[index].map);
}
prev.addEventListener('click',()=>selectStage(stage-1));next.addEventListener('click',()=>selectStage(stage+1));
get('map-tabs').replaceChildren();['전체 경로',...stages.map((st,i)=>String(i+1).padStart(2,'0')+' '+st.title)].forEach((title,i)=>{const button=document.createElement('button');button.textContent=title;button.addEventListener('click',()=>selectStage(i-1));get('map-tabs').append(button)});
get('directions').replaceChildren();stages.forEach((st,i)=>{const li=document.createElement('li'),button=document.createElement('button');button.textContent=String(i+1).padStart(2,'0')+' '+st.title+' →';button.addEventListener('click',()=>{selectStage(i);get('map-tabs').scrollIntoView({block:'start',behavior:'instant'})});li.append(button,document.createTextNode(st.next));get('directions').append(li)});
get('download').addEventListener('click',async()=>{const button=get('download');button.disabled=true;try{const img=get('map-view').querySelector('img');await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(img,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG conversion failed');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`휴가중_${data.region||"담양군"}_${current+1}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}catch(e){get('map-caption').textContent='이미지 저장에 실패했습니다. 지도를 다시 선택한 후 시도해 주세요.'}finally{button.disabled=false}});
selectStage(-1);
})();

