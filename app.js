const REGIONS=window.JEOLLA_REGIONS.map(region=>region.name);
const $=id=>document.getElementById(id);
let drawing=false;
REGIONS.forEach(name=>{const item=document.createElement('button');item.type='button';item.className='region';item.textContent=name;item.setAttribute('aria-label',name+' 여행 보기');item.addEventListener('click',()=>{if(drawing)return;location.href='route.html?region='+window.JEOLLA_REGIONS.find(r=>r.name===name).id;});$('regions').append(item)});
function showHome(){if(drawing)return;$('home').hidden=false;$('choose').hidden=true;window.scrollTo(0,0);$('start').focus()}
$('start').addEventListener('click',()=>{$('home').hidden=true;$('choose').hidden=false;window.scrollTo(0,0);$('draw').focus()});
$('back').addEventListener('click',showHome);
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();showHome()});
function randomIndex(n){const values=new Uint32Array(1);const limit=2**32-(2**32%n);do{crypto.getRandomValues(values)}while(values[0]>=limit);return values[0]%n}
$('draw').addEventListener('click',async()=>{
 if(drawing)return;drawing=true;$('draw').disabled=true;$('back').disabled=true;$('draw').textContent='여행지를 고르는 중…';$('next-preview').hidden=true;
 const cards=[...$('regions').children];cards.forEach(card=>{card.className='region';card.disabled=true;});
 const picked=randomIndex(REGIONS.length);
 $('result').textContent='어디로 떠나게 될까요?';$('office').textContent='서른여섯 곳 사이, 오늘의 여행지를 찾는 중';
 $('destination-title').textContent='운명에 맡겨볼까요.';
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   let previous=-1;
   for(let i=0;i<13;i++){
     let candidate;
     do{candidate=randomIndex(REGIONS.length)}while(candidate===previous);
     cards.forEach(card=>card.classList.remove('flashing'));
     cards[candidate].classList.add('flashing');previous=candidate;
     await new Promise(resolve=>setTimeout(resolve,240+Math.round(220*(i/12)**2)));
   }
 }
 cards.forEach(card=>card.classList.remove('flashing'));cards[picked].classList.add('selected');
 const name=REGIONS[picked];$('result').textContent=name;$('office').textContent=name+'청';$('destination-title').textContent=name+(name.endsWith('시')?'로':'으로')+' 떠나요.';$('next-name').textContent=name;$('route-next').href='route.html?region='+window.JEOLLA_REGIONS[picked].id;$('next-preview').hidden=false;$('draw').innerHTML='다시 뽑기 <span aria-hidden="true">↻</span>';$('draw-note').textContent='다시 뽑으면 같은 지역이 나올 수도 있어요.';$('draw').disabled=false;$('back').disabled=false;drawing=false;cards.forEach(card=>card.disabled=false);window.tripSound?.('win');
});
$('year').textContent=new Date().getFullYear();


if(location.hash==="#choose"){$("home").hidden=true;$("choose").hidden=false;}
