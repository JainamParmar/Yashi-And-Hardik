(function(){
const C=window.INVITE_CONFIG,$=s=>document.querySelector(s),audio=$('#song'),mBtn=$('#music');
if(window.emailjs&&C&&C.emailjs&&C.emailjs.publicKey&&!C.emailjs.publicKey.startsWith('YOUR_')){try{emailjs.init(C.emailjs.publicKey)}catch(e){}}
// petals
const P=$('.petals');for(let i=0;i<18;i++){const e=document.createElement('i');e.style.cssText=`left:${Math.random()*100}%;animation-duration:${10+Math.random()*12}s;animation-delay:${-Math.random()*20}s;transform:scale(${.6+Math.random()})`;P.appendChild(e)}
// directions
document.querySelectorAll('[data-dir]').forEach(a=>a.href=C.directions[a.dataset.dir]);
// music + veil
function play(){audio.play().then(()=>mBtn.classList.add('on')).catch(()=>{})}
$('#open').onclick=()=>{$('#veil').classList.add('gone');play();document.querySelectorAll('.hero .reveal').forEach(e=>e.classList.add('in'))};
mBtn.onclick=()=>{if(audio.paused)play();else{audio.pause();mBtn.classList.remove('on')}};
// reveal + nav
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
addEventListener('scroll',()=>$('#nav').classList.toggle('solid',scrollY>40),{passive:true});
// countdown
const t=new Date(C.weddingDate).getTime(),pad=n=>String(n).padStart(2,'0');
function tick(){let d=Math.max(0,t-Date.now());const v={d:Math.floor(d/864e5),h:Math.floor(d/36e5%24),m:Math.floor(d/6e4%60),s:Math.floor(d/1e3%60)};for(const k in v)$('#'+k).textContent=pad(v[k])}
tick();setInterval(tick,1000);
// RSVP
const f=$('#rsvpForm'),st=$('#status'),more=$('#more');
f.addEventListener('change',()=>{const no=f.attending.value&&f.attending.value.startsWith('Regret');more.classList.toggle('off',no)});
f.addEventListener('submit',async e=>{
  e.preventDefault();st.className='';
  const fd=new FormData(f);
  const guestName=(fd.get('guest_name')||'').trim(),guestEmail=(fd.get('guest_email')||'').trim(),guestPhone=(fd.get('guest_phone')||'').trim();
  if(!guestName||!/^\S+@\S+\.\S+$/.test(guestEmail)||guestPhone.replace(/\D/g,'').length<7||!fd.get('attending')){st.textContent='Please fill your name, a valid email, phone and attendance.';st.className='err';return}
  const going=!fd.get('attending').startsWith('Regret');
  const params={
    email:guestEmail,
    guest_email:guestEmail,
    reply_to:guestEmail,
    name:guestName,
    guest_name:guestName,
    from_name:guestName,
    phone:guestPhone,
    guest_phone:guestPhone,
    attending:fd.get('attending'),
    dates:going?(fd.getAll('dates').join(', ')||'Not specified'):'N/A',
    guest_count:going?fd.get('guest_count'):'0',
    message:fd.get('message')||'(no message)',
    to_name:'Yashi & Hardik'
  };
  const k=C.emailjs,btn=f.querySelector('button');
  if(k.publicKey.startsWith('YOUR_')){st.textContent='Demo mode: add your EmailJS keys in config.js to receive RSVPs.';st.className='err';console.log(params);return}
  btn.disabled=true;st.textContent='Sending…';
  try{
    await emailjs.send(k.serviceId,k.templateId,params,k.publicKey);
    st.textContent='Thank you! Your RSVP has been received ✦';
    st.className='ok';
    f.reset();
    more.classList.remove('off');
  }catch(err){
    console.error('EmailJS error:',err);
    st.textContent=(err&&(err.text||err.message))?`Error: ${err.text||err.message}`:'Something went wrong. Please try again.';
    st.className='err';
  }
  btn.disabled=false;
});

// ===== Road timeline =====
(function(){
const trip=$('#trip'),svg=$('#roadSvg'),cards=[...trip.querySelectorAll('.scard')],stops=[...trip.querySelectorAll('.stop')];
const NS='http://www.w3.org/2000/svg',RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
let S=[],knots=[],H=0,carG,carBody,cur=0,raf=0,active=-1,W=0;
function carSVG(){let w='';[[-15,-15],[11,-15],[-15,8],[11,8]].forEach(([x,y])=>w+=`<rect x="${x}" y="${y}" width="4.5" height="11" rx="2" fill="#3b4430"/><line class="tread" x1="${x+2.25}" y1="${y+1}" x2="${x+2.25}" y2="${y+10}"/>`);
return `<g id="carBody">${w}<rect x="-12" y="-25" width="24" height="50" rx="11" fill="#f2e394" stroke="#b89a3e" stroke-width="1.5"/><rect x="-8" y="4" width="16" height="7" rx="3" fill="#cfe3ea"/><rect x="-8" y="-17" width="16" height="5" rx="2" fill="#cfe3ea"/><rect x="-8" y="-10" width="16" height="13" rx="5" fill="#fffdf6"/><path d="M0-2.5c-3-2.6-4.2-4.2-4.2-5.6a2.2 2.2 0 014.2-.9 2.2 2.2 0 014.2.9c0 1.4-1.2 3-4.2 5.6z" fill="#d98a8a"/><circle cx="-7" cy="23" r="2.2" fill="#fff6c0"/><circle cx="7" cy="23" r="2.2" fill="#fff6c0"/><path d="M-4 15c2 2 6 2 8 0" stroke="#b89a3e" fill="none" stroke-linecap="round"/><circle cx="0" cy="-25" r="2.5" fill="#d98a8a"/></g>`}
function build(){
  W=trip.clientWidth;H=trip.clientHeight;const mob=W<700,cx=mob?44:W/2,amp=mob?9:Math.min(48,W*.05),rw=mob?42:56,sc=mob?.95:1.2;
  const tr=trip.getBoundingClientRect();
  S=stops.map((el,i)=>{const r=cards[i].getBoundingClientRect();return{y:r.top+r.height/2-tr.top,x:cx+(mob?(i%2?1:-1):(i%2?-1:1))*amp}});
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  const pts=[{x:cx,y:0},...S,{x:cx,y:H}];let d=`M${pts[0].x} 0`;
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],m=(a.y+b.y)/2;d+=`C${a.x} ${m} ${b.x} ${m} ${b.x} ${b.y}`}
  svg.innerHTML=`<path id="rb" d="${d}" fill="none" stroke="#fffdf6" stroke-width="${rw+10}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#b89a3e" stroke-opacity=".35" stroke-width="${rw+10}" stroke-linecap="round" style="mix-blend-mode:multiply"/><path id="rp" d="${d}" fill="none" stroke="#7d8a6c" stroke-width="${rw}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fffdf6" stroke-width="2.4" stroke-dasharray="10 12" stroke-linecap="round"/>`
  +S.map((s,i)=>`<circle cx="${s.x}" cy="${s.y}" r="${rw/2+7}" fill="none" stroke="#f2e394" stroke-width="3" stroke-dasharray="3 5"/>`).join('')
  +`<text x="${cx}" y="${H-6}" text-anchor="middle" font-size="26" fill="#d98a8a">♥</text><g id="carG"><g transform="scale(${sc})">${carSVG()}</g></g>`;
  carG=$('#carG');carBody=$('#carBody');
  const p=$('#rp'),L=p.getTotalLength();smp=[];for(let i=0;i<=500;i++){const q=p.getPointAtLength(L*i/500);smp.push(q)}
  const dw=Math.min(110,(S[1].y-S[0].y)/3);knots=[[0,0]];S.forEach(s=>knots.push([s.y-dw,s.y],[s.y+dw,s.y]));knots.push([H+1,H]);
  cur=target();place(cur);
}
let smp=[];
function target(){const top=trip.getBoundingClientRect().top,sy=innerHeight*.52-top;
  if(sy<=knots[0][0])return 0;for(let i=1;i<knots.length;i++){if(sy<=knots[i][0]){const[a,b]=[knots[i-1],knots[i]];return b[0]===a[0]?b[1]:a[1]+(b[1]-a[1])*(sy-a[0])/(b[0]-a[0])}}return H}
function place(y){let lo=0,hi=smp.length-1;while(hi-lo>1){const m=(lo+hi)>>1;smp[m].y<y?lo=m:hi=m}
  const a=smp[lo],b=smp[hi],t=b.y===a.y?0:(y-a.y)/(b.y-a.y),x=a.x+(b.x-a.x)*t,ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI-90;
  carG.setAttribute('transform',`translate(${x} ${y}) rotate(${ang})`);
  let near=-1;S.forEach((s,i)=>{if(Math.abs(s.y-y)<6)near=i});
  svg.classList.toggle('parked',near>-1||RM);
  if(near!==active){if(active>-1)cards[active].classList.remove('active');active=near;if(near>-1)arrive(near)}}
function arrive(i){cards[i].classList.add('active');if(RM)return;carBody.classList.remove('hop');void carBody.getBoundingClientRect();carBody.classList.add('hop');
  for(let k=0;k<6;k++){const s=document.createElement('span');s.className='spark';s.textContent='✦';s.style.cssText=`left:${10+Math.random()*80}%;top:${Math.random()*100}%;--dx:${(Math.random()-.5)*50}px;--dy:${-20-Math.random()*40}px;animation-delay:${k*70}ms`;cards[i].appendChild(s);setTimeout(()=>s.remove(),1400)}}
function loop(){const t=target();cur=RM?t:cur+(t-cur)*.14;place(cur);raf=Math.abs(t-cur)>.4?requestAnimationFrame(loop):0}
function kick(){if(!raf)raf=requestAnimationFrame(loop)}
addEventListener('scroll',kick,{passive:true});
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{build();kick()},150)});
build();addEventListener('load',()=>{build();kick()});document.fonts&&document.fonts.ready.then(()=>{build();kick()});
})();

})();
