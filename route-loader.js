(()=>{
const id=new URLSearchParams(location.search).get('region')||'r12',region=window.JEOLLA_REGIONS.find(r=>r.id===id);
if(!region){document.querySelector('.route-heading h2').textContent='지역을 다시 선택해 주세요';return;}
document.title=region.name+' 가는 길 — 휴가중';document.querySelector('.route-heading h2 em').textContent=region.name+(region.name.endsWith('시')?'로':'으로')+' 갑니다.';const dest=document.querySelector('.journey-strip>div:last-child');dest.querySelector('strong').textContent=region.office;dest.querySelector('span').textContent=region.address;document.querySelector('#tour-next').href='tour.html?region='+id;document.querySelector('.route-sources>p').textContent='목적지: '+region.office+' · '+region.address+'. 청사 진입 도로 기준이며 주차 위치는 현장 안내를 확인하세요.';
const script=document.createElement('script');script.src='trips-v2/'+id+'.js';script.onload=()=>{const code=document.createElement('script');code.src='route.js';document.body.append(code)};script.onerror=()=>{document.querySelector('.map-empty h3').textContent='이 지역의 지도를 준비하고 있어요';document.querySelector('.map-empty p').textContent='볼거리·먹거리는 아래 버튼에서 먼저 볼 수 있어요.'};document.body.append(script);
})();
