(()=>{
let enabled=false,ctx;try{enabled=localStorage.getItem('hyugajung-sound')==='on'}catch{}
const button=document.createElement('button');button.type='button';button.className='sound-toggle';document.body.append(button);
function label(){button.textContent=enabled?'♪ 소리 켜짐':'♪ 소리 꺼짐';button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'효과음 끄기':'효과음 켜기');}label();
function play(kind){if(!enabled||document.hidden)return;try{ctx||=new (window.AudioContext||window.webkitAudioContext)();ctx.resume();const notes=kind==='win'?[523.25,659.25,783.99,1046.5]:[659.25,880];notes.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.09;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.17);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.18);});}catch{}}
button.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem('hyugajung-sound',enabled?'on':'off')}catch{}if(!enabled&&ctx)ctx.suspend();label();play('tap')});document.addEventListener('click',e=>{if(e.target.closest('button,a')&&!e.target.closest('.sound-toggle'))play('tap')});window.tripSound=play;
})();
