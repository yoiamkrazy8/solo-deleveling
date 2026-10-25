/* Solo Deleveling's original city-at-night graphics and failure commentary.
   FableDevil's level definitions, trap updates, collisions, and physics stay intact. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const stars = Array.from({length:95},(_,i)=>({x:(i*173.31+41)%W,y:(i*79.39+19)%340,r:i%9?1:1.5,a:.14+(i%7)/17}));
  const skyline = Array.from({length:35},(_,i)=>({x:i*30-20,w:22+(i*17)%25,h:35+(i*71)%125}));
  const worlds = ['THE ROOFTOPS','THE UNDERCITY','THE VOID'];
  const rect=(x,y,w,h,c)=>{if(w<=0||h<=0)return;ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));};
  const line=(x,y,xx,yy,c,w=1)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();};
  const label=(s,x,y,size,c,align='left')=>{ctx.font=`${size}px Arial`;ctx.textAlign=align;ctx.fillStyle=c;ctx.fillText(s,x,y);};
  const glow=(x,y,r,c)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
  function background(menu=false){
    const world=menu?0:Math.min(2,Math.floor(Game.levelIndex/10)),sky=world===1?['#080f21','#132e3c']:world===2?['#100d24','#29203c']:['#0b1025','#172344'];
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,sky[0]);g.addColorStop(1,sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(const s of stars){ctx.globalAlpha=reduced?s.a:s.a*(.8+.2*Math.sin(Game.time*.7+s.x));rect(s.x,s.y,s.r,s.r,'#bbc8ea');}ctx.globalAlpha=1;
    const mx=menu?795:830,my=menu?127:132,mr=menu?48:33;glow(mx,my,mr*2.6,'#b2c5ec10');ctx.fillStyle=world===1?'#98cbb73b':'#b7c6e75c';ctx.beginPath();ctx.arc(mx,my,mr,0,Math.PI*2);ctx.fill();ctx.fillStyle=sky[0];ctx.beginPath();ctx.arc(mx+mr*.45,my-mr*.22,mr*.92,0,Math.PI*2);ctx.fill();
    for(let layer=0;layer<2;layer++){const base=layer?469:432;for(let j=0;j<skyline.length;j++){const s=skyline[j],x=s.x+(layer?0:12),h=s.h*(layer?.72:1.12);rect(x,base-h,s.w,h+H-base,layer?'#14223b':'#111b33');if(j%3===0){line(x+s.w/2,base-h,x+s.w/2,base-h-17,'#293a56');rect(x+s.w/2-2,base-h-20,5,2,'#53617c77');}for(let row=0;row<h/16-1;row++)for(let col=0;col<s.w/9-1;col++)if((row*3+col*7+j*11+layer)%5===0)rect(x+6+col*9,base-h+10+row*16,2,3,layer?'#526d8155':'#38516b55');}}
    const haze=ctx.createLinearGradient(0,360,0,H);haze.addColorStop(0,'transparent');haze.addColorStop(1,'#5264a015');ctx.fillStyle=haze;ctx.fillRect(0,360,W,H-360);
  }
  function platform(r,kind='stone',warning=false){
    if(r.w<=0||r.h<=0||r.x+r.w<0||r.x>W||r.y>H+60)return;
    const moving=kind==='moving',crumble=kind==='crumble',fill=moving?'#24374e':crumble?'#25314e':'#1e2c46',rim=moving?'#86b9c5':crumble?(warning?'#e393ae':'#9a91c8'):'#6b81ab';
    rect(r.x,r.y,r.w,r.h,fill);rect(r.x,r.y,r.w,3,rim);rect(r.x,r.y+3,r.w,4,'#334565');
    ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();
    if(!moving){for(let y=r.y+23;y<Math.min(H+30,r.y+r.h);y+=24){line(r.x,y,r.x+r.w,y,'#30405b80');for(let x=r.x+((Math.floor(y/24)%2)*23);x<Math.min(W+30,r.x+r.w);x+=46)line(x,y-23,x,y,'#30405b60');}}
    else for(let x=r.x+9;x<r.x+r.w;x+=20)line(x,r.y+13,x+7,r.y+7,'#84b9cc88',2);
    if(crumble)for(let x=r.x+12;x<r.x+r.w;x+=31){line(x,r.y+1,x+6,r.y+8,'#a394b399');line(x+6,r.y+8,x+1,r.y+15,'#a394b399');}
    if(r.y<=0)rect(r.x,r.y+r.h-3,r.w,3,rim);ctx.restore();
  }
  function spikes(x,y,w,h,dir='up'){
    if(h<=.2)return;const sign=dir==='up'?-1:1,n=Math.max(2,Math.round(w/18)),sw=w/n;
    for(let i=0;i<n;i++){const bx=x+i*sw;ctx.fillStyle='#df8fae';ctx.beginPath();ctx.moveTo(bx,y);ctx.lineTo(bx+sw/2,y+sign*h);ctx.lineTo(bx+sw,y);ctx.closePath();ctx.fill();line(bx+sw/2,y+sign*h,bx+sw,y,'#b26a91');}rect(x,y-1,w,2,'#b97a99');
  }
  function gear(x,y,r,spin=0){
    ctx.save();ctx.translate(x,y);ctx.rotate(reduced?0:spin);ctx.beginPath();for(let i=0;i<40;i++){const a=Math.PI*2*i/40,rr=r*(i%4<2?1:.76),xx=Math.cos(a)*rr,yy=Math.sin(a)*rr;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.fillStyle='#bdc4de';ctx.fill();ctx.strokeStyle='#757d9d';ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.48,0,Math.PI*2);ctx.fillStyle='#4d5779';ctx.fill();rect(-3,-3,6,6,'#dd8dab');ctx.restore();
  }
  function door(x,y,w=38,h=64){
    glow(x+w/2,y+h/2,66,'#8af2db1c');rect(x-5,y-5,w+10,h+5,'#233d4b');rect(x-2,y-2,w+4,h+2,'#8acabb');rect(x,y,w,h,'#112b34');const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#a3e5da25');g.addColorStop(1,'#071b2b');ctx.fillStyle=g;ctx.fillRect(x+3,y+3,w-6,h-5);rect(x+w-9,y+h/2,3,3,'#bff5df');label('EXIT',x+w/2,y-15,7,'#92bfb8','center');line(x+w/2-4,y-28,x+w/2+4,y-28,'#7faaa6');line(x+w/2,y-31,x+w/2+4,y-28,'#7faaa6');line(x+w/2,y-25,x+w/2+4,y-28,'#7faaa6');rect(x-8,y+h-1,w+16,2,'#81c6b34d');
  }
  function character(p){
    ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));ctx.scale((p.w||26)/22,(p.h||32)/32);
    const f=p.face||1,running=p.grounded&&Math.abs(p.vx||0)>20,step=running?Math.floor(Game.time*15)%2:0;
    rect(3,0,16,3,'#d6d9ed');rect(1,3,20,12,'#e1e6f4');rect(3,15,16,3,'#ccd5e7');rect(3,17,16,10,'#b3bdd6');rect(0,18,4,8,'#c8d4e8');rect(19,18,3,8,'#c8d4e8');rect(f>0?12:4,7,4,5,'#273650');rect(f>0?18:10,7,2,5,'#273650');rect(3,16,16,4,'#91d6ce');const flutter=reduced?0:Math.round(Math.sin(Game.time*8)*2);rect(f>0?-6:19,17+flutter,10,3,'#7cc1c2');rect(f>0?-10:27,19+flutter,5,3,'#66aaad');rect(4-(step?2:0),27,5,5,'#8292b2');rect(13+(step?2:0),27,5,5,'#8292b2');ctx.restore();
  }
  function menuScene(){
    background(true);platform(R(583,433,117,107));platform(R(754,433,206,107));platform(R(679,357,74,17),'crumble');spikes(795,433,42,24);door(901,379,30,54);character({x:648,y:401,w:22,h:32,grounded:true});for(let i=0;i<12;i++)rect(680+i*13,365-Math.sin(i/11*Math.PI)*34,2,2,'#8ba5c532');label('TRUST NOTHING.',610,480,7,'#7183a677');
    const shade=ctx.createLinearGradient(0,0,610,0);shade.addColorStop(0,'#0a0e2040');shade.addColorStop(1,'transparent');ctx.fillStyle=shade;ctx.fillRect(0,0,610,H);
  }
  // Only draw methods change below. No collision or trap update methods change.
  CollapseFloor.prototype.draw=function(){if(this.dy>H)return;const r=this.rect,ox=this.state==='shake'&&!reduced?Math.sin(Game.time*60)*2:0;if(this.state==='fall'){const n=Math.max(2,Math.floor(r.w/46)),w=r.w/n;for(let i=0;i<n;i++)platform(R(r.x+i*w+1,r.y+this.dy+Math.sin(i*7.3)*this.dy*.18,w-2,r.h));}else platform(R(r.x+ox,r.y,r.w,r.h));};
  PopSpikes.prototype.draw=function(){spikes(this.x,this.y,this.w,this.size*this.out,this.dir);};
  StaticSpikes.prototype.draw=function(){spikes(this.x,this.y,this.w,this.size,this.dir);};
  FallBlock.prototype.draw=function(){const r=this.rect,j=this.state==='shake'&&!reduced?Math.sin(Game.time*70)*2:0;platform(R(r.x+j,r.y,r.w,r.h),'moving');line(r.x+7+j,r.y+7,r.x+r.w-7+j,r.y+r.h-7,'#ce95aa88',2);line(r.x+r.w-7+j,r.y+7,r.x+7+j,r.y+r.h-7,'#ce95aa88',2);};
  Crusher.prototype.draw=function(){rect(this.x+this.w/2-6,this.topY,12,this.y-this.topY+3,'#354666');const h=this.headRect();platform(h,'moving');ctx.save();ctx.beginPath();ctx.rect(h.x,h.y+h.h-10,h.w,10);ctx.clip();for(let x=h.x-10;x<h.x+h.w;x+=14)line(x,h.y+h.h,x+10,h.y+h.h-10,'#c495ac',4);ctx.restore();};
  CrumblePlatform.prototype.draw=function(){const r=this.rect,j=this.state==='shaking'&&!reduced?Math.sin(Game.time*65)*2:0;platform(R(r.x+j,r.y,r.w,r.h),'crumble',this.state!=='idle');};
  SlidingHole.prototype.draw=function(){for(const r of this.solids())platform(r);};
  InvertZone.prototype.draw=function(){const r=this.rect,g=ctx.createLinearGradient(0,Math.max(0,r.y),0,r.y+r.h);g.addColorStop(0,'#ad8ce803');g.addColorStop(1,'#ad8ce818');ctx.fillStyle=g;ctx.fillRect(r.x,r.y,r.w,r.h);for(const x of[r.x,r.x+r.w])for(let y=r.y+10;y<r.y+r.h;y+=12)rect(x,y,1,4,'#b4a1e866');label('⇄',r.x+18,r.y+r.h-15,19,'#b4a1e8aa');};
  MovingPlatform.prototype.draw=function(){line(this.ax+this.w/2,this.ay+this.h/2,this.bx+this.w/2,this.by+this.h/2,'#6e9bb633');platform(R(this.px,this.py,this.w,this.h),'moving');};
  Conveyor.prototype.draw=function(){const r=this.rect;platform(r,'moving');ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();const off=(this.t*70)%32;for(let x=r.x-32+off;x<r.x+r.w;x+=32){const d=this.dir>0?1:-1,cx=x+16;line(cx-d*5,r.y+12,cx+d*5,r.y+20,'#84b9cc88',2);line(cx+d*5,r.y+20,cx-d*5,r.y+28,'#84b9cc88',2);}ctx.restore();};
  Saw.prototype.draw=function(){for(let i=1;i<this.path.length;i++)line(this.path[i-1].x,this.path[i-1].y,this.path[i].x,this.path[i].y,'#6980a53a');gear(this.x,this.y,this.r,this.spin);};
  Laser.prototype.draw=function(){const state=this._state(),b=this._beam();if(this.vertical){rect(this.x-8,this.y-8,16,8,'#526381');rect(this.x-8,this.y+this.len,16,8,'#526381');}else{rect(this.x-8,this.y-8,8,16,'#526381');rect(this.x+this.len,this.y-8,8,16,'#526381');}if(state==='off')return;if(state==='warn'){ctx.save();ctx.setLineDash([5,8]);line(this.x,this.y,this.vertical?this.x:this.x+this.len,this.vertical?this.y+this.len:this.y,'#e394bca0',2);ctx.restore();}else{rect(b.x-4,b.y-4,b.w+8,b.h+8,'#e08abc22');rect(b.x,b.y,b.w,b.h,'#e394bc');if(this.vertical)rect(b.x+b.w/2-1,b.y,2,b.h,'#fde1f0');else rect(b.x,b.y+b.h/2-1,b.w,2,'#fde1f0');}};
  Button.prototype.draw=function(){rect(this.x+4,this.y+4,this.w-8,this.h,'#334967');rect(this.x,this.y+this.dip*5,this.w,7,this.pressed?'#9ae5d3':'#b4a1da');rect(this.x+4,this.y+this.dip*5+2,this.w-8,2,'#d7eaf366');};
  Gate.prototype.draw=function(){const r=this._cur();platform(r,'moving');for(let i=0;i<3;i++)rect(r.x+r.w/2-2,r.y+10+i*r.h/3,4,r.h/6,this.open>.9?'#9ae5d3':'#ba9de4');};
  BlinkPlatform.prototype.draw=function(){const r=this.rect;if(this._on())platform(r);else{ctx.save();ctx.strokeStyle='#718caf77';ctx.setLineDash([5,5]);ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.restore();}};
  Pendulum.prototype.draw=function(){const b=this._bob();line(this.px,this.py,b.x,b.y,'#647998',2);rect(this.px-3,this.py-3,6,6,'#a8b6cf');gear(b.x,b.y,this.r,reduced?0:this.t*2);};
  Turret.prototype.draw=function(){rect(this.x-(this.dir<0?4:14),this.y-11,18,22,'#4d3f58');rect(this.x+(this.dir<0?-14:6),this.y-4,10,8,'#aa799b');for(const s of this.shots){glow(s.x,s.y,23,'#ee8ebd22');rect(s.x-this.r,s.y-this.r,this.r*2,this.r*2,'#eea3c4');rect(s.x-2,s.y-2,4,4,'#fff1fa');}};
  Door.prototype.draw=function(){const p=this.pos;door(p.x,p.y,this.w,this.h);};
  FakeDoor.prototype.draw=function(){door(this.x,this.y,this.w,this.h);if(this.label)label(this.label,this.x+this.w/2,this.y-12,9,'#9bacc966','center');if(this.out>.01){const n=4;for(let i=0;i<n;i++){const y=this.y+this.h-i*this.h/n,len=30*this.out;ctx.fillStyle='#df8fae';ctx.beginPath();ctx.moveTo(this.x+4,y);ctx.lineTo(this.x-len,y-this.h/n/2);ctx.lineTo(this.x+4,y-this.h/n);ctx.moveTo(this.x+this.w-4,y);ctx.lineTo(this.x+this.w+len,y-this.h/n/2);ctx.lineTo(this.x+this.w-4,y-this.h/n);ctx.fill();}}};
  Note.prototype.draw=function(){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);label(this.text,0,0,Math.max(8,this.size*.66),'#879bbb99','center');ctx.restore();};
  Game.drawPlayer=function(){character(this.player);};
  Game.draw=function(){
    ctx.save();ctx.imageSmoothingEnabled=false;
    if(this.state==='menu'){menuScene();ctx.restore();return;}
    background();if(this.shakeAmt>0&&!reduced)ctx.translate(Math.sin(this.time*120)*this.shakeAmt,Math.cos(this.time*85)*this.shakeAmt*.6);
    if(this.level){for(const s of this.level.solids){if(s.x+s.w<=0||s.x>=W)continue;platform(s);}this.level.door.draw();for(const t of this.level.traps)t.draw();if(['play','win','betweenLevels'].includes(this.state))this.drawPlayer();for(const p of particles){ctx.globalAlpha=clamp(1-p.t/p.life,0,1);const r=Math.max(2,Math.min(4,p.r));rect(p.x,p.y,r,r,p.grav?'#bac8ed':p.color);}ctx.globalAlpha=1;}
    if(['win','betweenLevels'].includes(this.state)){const alpha=clamp(this.winT*4,0,1);ctx.globalAlpha=alpha;label(this.levelIndex===29?'YOU OUTLASTED THE NIGHT.':'FINE. NEXT ROOM.',W/2,H/2-20,23,'#a1e8dc','center');ctx.globalAlpha=1;}
    const abyss=ctx.createLinearGradient(0,505,0,H);abyss.addColorStop(0,'transparent');abyss.addColorStop(1,'#060b1baa');ctx.fillStyle=abyss;ctx.fillRect(0,505,W,H-505);ctx.restore();
    // Retain the supplied transition without changing its duration or state.
    if(this.wipe>.001){const radius=(1-this.wipe)*(Math.hypot(W,H)/2+40);ctx.fillStyle='#080d1e';ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(W/2,H/2,Math.max(radius,0),0,Math.PI*2,true);ctx.fill();}
  };

  const taunts = [
    ['THE FLOOR WON. AGAIN.','A rematch is already being arranged.'],
    ['THE DOOR SAW THAT.','It is trying very hard not to laugh.'],
    ['GRAVITY: 1. YOU: 0.','A tough opponent. Very consistent.'],
    ['SO CLOSE. STILL DEAD.','Almost is doing a lot of work here.'],
    ['YOUR TIMING LEFT THE CHAT.','It said it needed some space.'],
    ['BOLD MOVE. SHORT LIFE.','Confidence was never the problem.'],
    ['THE SPIKES SAY THANKS.','Apparently they were getting bored.'],
    ['SAME ROOM. NEW EXCUSE.','Surely the next one is the run.'],
    ['THAT WAS THE EASY PART.','The exit is still right there.'],
    ['HAVE YOU TRIED LANDING?','Just a completely wild suggestion.'],
    ['ANOTHER FLAWLESS FAILURE.','You are getting very consistent.'],
    ['THE FLOOR ASKED FOR SECONDS.','You keep giving it exactly what it wants.'],
    ['SPEEDRUNNING THE WRONG ENDING.','The leaderboard has questions.'],
    ['THE EXIT IS LOSING PATIENCE.','It has literally one job.'],
    ['ONE MORE TRY. OBVIOUSLY.','This time, surely.'],
    ['THAT JUMP HAD POTENTIAL.','Briefly. Very briefly.'],
    ['NICE PLAN. HOW DID IT GO?','The floor would like to leave a review.'],
    ['EVEN THE MOON LOOKED AWAY.','It has seen enough for one night.'],
    ['THE TRAP DID NOT MOVE.','We are not pointing fingers.'],
    ['THE NIGHT SENDS ITS REGARDS.','And another room-sized helping of nonsense.'],
    ['YOUR EXCUSES ARE LEVELING UP.','Your character, less so.'],
    ['THE DOOR IS NOT EVEN LOCKED.','That somehow makes this funnier.'],
    ['THAT ONE FELT PERSONAL.','The floor assures us it was business.'],
    ['RESTART ALREADY?','The door did not even get a turn.'],
    ['IMMACULATE PANIC.','The landing could use some work.'],
    ['SKILL ISSUE?','The game has declined to comment.'],
    ['A LITTLE LESS CONFIDENCE.','A little more floor awareness.'],
    ['YOU FOUND THE TRAP.','Now try finding the exit.'],
    ['THE FLOOR IS UNDEFEATED.','And frankly getting smug about it.'],
    ['SEE YOU IN HALF A SECOND.','We both know you are trying again.']
  ];
  let deck=[],lastTaunt=-1,rageLeft=0,handledDeaths=Game.deaths;
  const failures=new Map();
  function dismiss(){rageLeft=0;$('rage-toast').classList.remove('show');$('rage-toast').setAttribute('aria-hidden','true');}
  function nextTaunt(){if(!deck.length){deck=taunts.map((_,i)=>i);for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}if(deck.at(-1)===lastTaunt)[deck[0],deck[deck.length-1]]=[deck.at(-1),deck[0]];}lastTaunt=deck.pop();return taunts[lastTaunt];}
  function fail(manual=false){
    if(handledDeaths===Game.deaths)return;handledDeaths=Game.deaths;
    const n=(failures.get(Game.levelIndex)||0)+1;failures.set(Game.levelIndex,n);
    const [title,detail]=nextTaunt();Game.deathLine=title;
    $('rage-meta').textContent=`ROOM ${String(Game.levelIndex+1).padStart(2,'0')} · TRY ${String(n+1).padStart(2,'0')}`;
    $('rage-title').textContent=title;$('rage-detail').textContent=manual?'A fresh start. The same questionable decisions.':detail;
    $('rage-toast').setAttribute('aria-hidden','false');$('rage-toast').classList.add('show');rageLeft=3.1;
  }
  const die=Game.die;Game.die=function(...args){die.apply(this,args);if(this.state==='dead')fail();};
  const play=Game.updatePlay;Game.updatePlay=function(dt){play.call(this,dt);if(this.state==='dead')fail();};
  const restart=Game.restartLevel;Game.restartLevel=function(manual){restart.call(this,manual);if(manual)fail(true);};
  const update=Game.update;Game.update=function(dt){update.call(this,dt);if(['menu','end','win','betweenLevels'].includes(this.state)){dismiss();return;}if(rageLeft>0){rageLeft-=dt;if(rageLeft<=0)dismiss();}};
  const load=Game.loadLevel;Game.loadLevel=function(i){load.call(this,i);$('hud-world').textContent=worlds[Math.min(2,Math.floor(i/10))];};
  const home=showMenu;showMenu=function(){dismiss();home();};
  const start=startGame;startGame=function(i){dismiss();start(i);};
  // Higher backing resolution, with the same 960 × 540 gameplay coordinates.
  const fitBase=fit;fit=function(){fitBase();const w=Math.max(1,Math.round(parseFloat(cv.style.width)*Math.min(devicePixelRatio||1,2))),h=Math.max(1,Math.round(parseFloat(cv.style.height)*Math.min(devicePixelRatio||1,2)));if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}ctx.setTransform(w/W,0,0,h/H,0,0);ctx.imageSmoothingEnabled=false;};
  addEventListener('resize',fit);if(window.visualViewport)window.visualViewport.addEventListener('resize',fit);fit();
})();
