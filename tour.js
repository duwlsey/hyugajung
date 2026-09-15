(()=>{
const id=new URLSearchParams(location.search).get('region')||'r12';
const region=window.JEOLLA_REGIONS.find(x=>x.id===id),tour=window.JEOLLA_TOUR.find(x=>x.id===id);
if(!region||!tour){document.querySelector('.tour-intro h2').textContent='지역을 다시 골라주세요.';return;}
document.title=region.name+'의 즐거움 — 휴가중';document.getElementById('region-name').textContent=region.name+',';document.getElementById('back-route').href='route.html?region='+id;
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
for(const [type,label]of [['sight','둘러볼 곳'],['food','맛볼 곳']]){
 const section=make('section',null,'tour-group '+type),groupTitle=make('h2',label+' 3곳','tour-group-heading');
 section.append(groupTitle);const grid=make('div',null,'tour-grid');section.append(grid);document.getElementById('tour-cards').append(section);
 for(const [index,item] of (tour[type+'s']||[tour[type]]).entries()){
 const card=make('article',null,'tour-card '+type),title=make('div',null,'tour-card-title');
 title.append(make('span',String(index+1).padStart(2,'0')+' '+label,'tour-label'),make('h3',item.name));card.append(title,make('p',item.description,'tour-description'));
 const dl=make('dl');const fact=(key,value)=>{dl.append(make('dt',key),make('dd',value));};
 fact(type==='sight'?'추천 산책':'추천 메뉴',item.course||item.menu);
 if(type==='food'){fact('지도 리뷰',item.reviews+' 건');fact('표시 별점',item.rating?'★ '+item.rating.toFixed(2)+' / 5':'별점 미표시');if(item.waiting)fact('대기 참고',item.waiting);if(item.hours)fact('운영시간',item.hours);if(item.price)fact('가격',item.price);}
 else{fact('운영시간',item.hours||'방문 전 시설의 현재 운영시간을 확인해 주세요.');fact('입장·체험료',item.price||'최신 요금은 방문 전 시설에 확인해 주세요.');}
 card.append(dl);if(item.asof)card.append(make('p',item.asof+' 기준 · 현재 요금·휴무는 재확인','fact-date'));
 grid.append(card);
 }
}
})();
