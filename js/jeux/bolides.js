/* Le Jeu de Noël · Mini-jeu : Duel de bolides (remplace le duel de tanks)
   Arène vue de dessus, voitures qui dérivent, nitro, missiles, barils explosifs, bonus.
   Clavier TV : Lui Q/D tourner, Z/S tirer, E nitro · Elle ←/→ tourner, ↑/Entrée tirer, ↓ nitro */
"use strict";
var BL = {
  W:1600, H:900, DUREE:90, PV:100,
  VMAX:560, VNITRO:930, ACC:1.7, ACC_N:2.8,          /* vitesse cible et vitesse d'approche */
  VIRAGE:3.3, GRIP:10, GRIP_DERIVE:3.6,               /* rad/s, adhérence latérale */
  R:19, AV:22,                                       /* 2 cercles de collision par voiture (avant/arrière) */
  MISSILE:980, CADENCE:0.42, DEGAT_MISSILE:13, SOUFFLE:70,
  NITRO_CONSO:42, NITRO_RECHARGE:13
};
var NITK = {b:0,v:0}, NITM = {b:0,v:0};
var BL_OBST = [
  {r:[300,180,220,44]}, {r:[300,224,44,130]}, {r:[1080,676,220,44]}, {r:[1256,546,44,130]},
  {r:[1080,180,220,44]}, {r:[1256,224,44,130]}, {r:[300,676,220,44]}, {r:[300,546,44,130]},
  {c:[800,450,74]}
];
var BL_BARILS = [[600,300],[1000,600],[600,600],[1000,300]];
var BL_BOOST = [{x:800,y:120,a:0},{x:800,y:780,a:Math.PI}];
var BL_BONUS_POS = [[800,250],[800,650],[170,130],[1430,770],[170,770],[1430,130],[520,450],[1080,450]];
var BL_BONUS = {
  repa:{emoji:"🔧", nom:"RÉPARATION", col:"#4dff9a"},
  triple:{emoji:"🚀", nom:"TRIPLE TIR", col:"#ffb347"},
  nitro:{emoji:"⚡", nom:"NITRO PLEIN", col:"#5ad8ff"}
};

/* ---------- Sprites pré-dessinés (une fois) ---------- */
var BLS = {};
function blCanvas(w, h){ var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function blLueur(col){
  var k = "g"+col; if(BLS[k]) return BLS[k];
  var c = blCanvas(128,128), x = c.getContext("2d"), g = x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0, col); g.addColorStop(0.25, col); g.addColorStop(1, "rgba(0,0,0,0)");
  x.globalAlpha = 1; x.fillStyle = g; x.fillRect(0,0,128,128);
  BLS[k] = c; return c;
}
function blFumee(){
  if(BLS.fumee) return BLS.fumee;
  var c = blCanvas(96,96), x = c.getContext("2d"), g = x.createRadialGradient(48,48,0,48,48,48);
  g.addColorStop(0,"rgba(255,255,255,0.9)"); g.addColorStop(0.5,"rgba(255,255,255,0.35)"); g.addColorStop(1,"rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0,0,96,96); BLS.fumee = c; return c;
}
/* Voiture vue de dessus, nez vers la droite. Q = facteur de résolution */
function blTracerCarrosserie(x){
  x.beginPath();
  x.moveTo(-38,-14); x.quadraticCurveTo(-40,-19,-33,-19.5);
  x.lineTo(20,-19); x.quadraticCurveTo(34,-18.5,38,-11); x.quadraticCurveTo(40.5,0,38,11);
  x.quadraticCurveTo(34,18.5,20,19); x.lineTo(-33,19.5); x.quadraticCurveTo(-40,19,-38,14); x.closePath();
}
function blVoiture(col, s, mode){
  var k = "car"+col+s+mode; if(BLS[k]) return BLS[k];
  var Q = 3, c = blCanvas(92*Q, 52*Q), x = c.getContext("2d");
  x.scale(Q,Q); x.translate(46,26);
  if(mode==="blanc"){ blTracerCarrosserie(x); x.fillStyle = "#ffffff"; x.fill(); BLS[k] = c; return c; }
  var epave = mode==="epave";
  var base = epave ? "#1b1b1f" : col;
  /* carrosserie */
  blTracerCarrosserie(x);
  var g = x.createLinearGradient(0,-20,0,20);
  g.addColorStop(0, epave ? "#0d0d10" : "rgba(0,0,0,0.55)"); g.addColorStop(0.18, base); g.addColorStop(0.5, epave ? "#2a2a30" : blEclaircir(col,0.35)); g.addColorStop(0.82, base); g.addColorStop(1, epave ? "#0d0d10" : "rgba(0,0,0,0.6)");
  x.fillStyle = base; x.fill(); x.fillStyle = g; x.fill();
  x.lineWidth = 1.2; x.strokeStyle = "rgba(0,0,0,0.65)"; x.stroke();
  if(!epave){
    /* bandes de course : doubles pour Lui, une large pour Elle */
    x.fillStyle = "rgba(255,255,255,0.88)";
    if(s==="b"){ x.fillRect(-36,-5.5,74,3.2); x.fillRect(-36,2.3,74,3.2); }
    else { x.beginPath(); x.moveTo(-36,-3); x.lineTo(37,-2); x.lineTo(37,2); x.lineTo(-36,3); x.closePath(); x.fill();
           x.fillStyle = "rgba(0,0,0,0.25)"; x.fillRect(-36,-0.6,73,1.2); }
  }
  /* pare-brise, toit, lunette arrière */
  x.fillStyle = epave ? "#050506" : "#0b1220";
  x.beginPath(); x.moveTo(12,-14); x.quadraticCurveTo(19,0,12,14); x.lineTo(2,12.5); x.quadraticCurveTo(5,0,2,-12.5); x.closePath(); x.fill();
  var vg = x.createLinearGradient(2,-12,14,12); vg.addColorStop(0,"rgba(160,210,255,0.55)"); vg.addColorStop(0.5,"rgba(255,255,255,0.05)"); vg.addColorStop(1,"rgba(120,170,255,0.35)");
  if(!epave){ x.fillStyle = vg; x.fill(); }
  x.fillStyle = epave ? "#121215" : blAssombrir(col,0.25);
  x.beginPath(); x.moveTo(2,-12.5); x.quadraticCurveTo(5,0,2,12.5); x.lineTo(-14,12.5); x.quadraticCurveTo(-16,0,-14,-12.5); x.closePath(); x.fill();
  x.fillStyle = epave ? "#050506" : "#0b1220";
  x.beginPath(); x.moveTo(-14,-12.5); x.quadraticCurveTo(-16,0,-14,12.5); x.lineTo(-22,11); x.quadraticCurveTo(-23.5,0,-22,-11); x.closePath(); x.fill();
  if(!epave){
    /* phares, feux arrière, rétroviseurs, aileron */
    x.fillStyle = "#fffbe6"; x.beginPath(); x.ellipse(36,-12,2.6,4,0.5,0,Math.PI*2); x.fill(); x.beginPath(); x.ellipse(36,12,2.6,4,-0.5,0,Math.PI*2); x.fill();
    x.fillStyle = "#ff2b3a"; x.fillRect(-39.5,-16,2.5,7); x.fillRect(-39.5,9,2.5,7);
    x.fillStyle = blAssombrir(col,0.35); x.fillRect(6,-22,5,3); x.fillRect(6,19,5,3);
    x.fillStyle = "#0a0a0f"; x.fillRect(-38,-20,5,40);
    x.fillStyle = blEclaircir(col,0.15); x.fillRect(-37.5,-19,1.6,38);
  } else {
    x.strokeStyle = "rgba(255,120,40,0.35)"; x.lineWidth = 1;
    for(var i=0;i<6;i++){ x.beginPath(); x.moveTo(-30+i*11,-15+Math.random()*6); x.lineTo(-24+i*11,4+Math.random()*10); x.stroke(); }
  }
  BLS[k] = c; return c;
}
function blHex(col){ var m = /^#?([0-9a-f]{6})$/i.exec(String(col).trim()); if(!m) return [120,120,255]; var n = parseInt(m[1],16); return [n>>16&255, n>>8&255, n&255]; }
function blEclaircir(col, k){ var c = blHex(col); return "rgb("+c.map(function(v){ return Math.round(v+(255-v)*k); }).join(",")+")"; }
function blAssombrir(col, k){ var c = blHex(col); return "rgb("+c.map(function(v){ return Math.round(v*(1-k)); }).join(",")+")"; }

/* Sol de l'arène : asphalte, marquages, obstacles en relief */
function blSol(Q, C){
  var c = blCanvas(Math.round(BL.W*Q), Math.round(BL.H*Q)), x = c.getContext("2d"); x.scale(Q,Q);
  var g = x.createRadialGradient(800,450,80,800,450,950); g.addColorStop(0,"#26262e"); g.addColorStop(1,"#101014");
  x.fillStyle = g; x.fillRect(0,0,BL.W,BL.H);
  /* grain de l'asphalte */
  for(var i=0;i<9000;i++){ var l = Math.random(); x.fillStyle = l<0.5 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.18)"; x.fillRect(Math.random()*BL.W, Math.random()*BL.H, 1+Math.random()*2, 1+Math.random()*2); }
  /* taches et plaques */
  for(i=0;i<26;i++){ var px = Math.random()*BL.W, py = Math.random()*BL.H, r = 30+Math.random()*90, tg = x.createRadialGradient(px,py,0,px,py,r);
    tg.addColorStop(0,"rgba(0,0,0,0.22)"); tg.addColorStop(1,"rgba(0,0,0,0)"); x.fillStyle = tg; x.fillRect(px-r,py-r,r*2,r*2); }
  /* marquages : cercle central, ligne médiane, zones de départ */
  x.strokeStyle = "rgba(255,255,255,0.10)"; x.lineWidth = 6; x.setLineDash([26,22]);
  x.beginPath(); x.moveTo(800,30); x.lineTo(800,360); x.moveTo(800,540); x.lineTo(800,870); x.stroke(); x.setLineDash([]);
  x.lineWidth = 5; x.beginPath(); x.arc(800,450,150,0,Math.PI*2); x.stroke();
  [["b",160],["v",1440]].forEach(function(z){
    x.strokeStyle = z[0]==="b" ? "rgba(47,168,255,0.35)" : "rgba(184,77,255,0.35)"; x.lineWidth = 4;
    x.strokeRect(z[1]-70, 400, 140, 100);
    x.fillStyle = z[0]==="b" ? "rgba(47,168,255,0.06)" : "rgba(184,77,255,0.06)"; x.fillRect(z[1]-70,400,140,100);
  });
  /* murs du bord : glissière avec bandes rouge/blanc */
  var m = 18;
  x.fillStyle = "#0a0a0d"; x.fillRect(0,0,BL.W,m); x.fillRect(0,BL.H-m,BL.W,m); x.fillRect(0,0,m,BL.H); x.fillRect(BL.W-m,0,m,BL.H);
  for(var k=0;k<BL.W;k+=40){ x.fillStyle = (k/40)%2 ? "#d8d8de" : "#d6283a"; x.fillRect(k,m-6,40,6); x.fillRect(k,BL.H-m,40,6); }
  for(k=0;k<BL.H;k+=40){ x.fillStyle = (k/40)%2 ? "#d8d8de" : "#d6283a"; x.fillRect(m-6,k,6,40); x.fillRect(BL.W-m,k,6,40); }
  /* obstacles : ombre portée puis bloc de béton */
  BL_OBST.forEach(function(o){
    x.save(); x.fillStyle = "rgba(0,0,0,0.5)"; x.filter = "blur(6px)";
    if(o.r) x.fillRect(o.r[0]+10,o.r[1]+12,o.r[2],o.r[3]); else { x.beginPath(); x.arc(o.c[0]+10,o.c[1]+12,o.c[2],0,Math.PI*2); x.fill(); }
    x.restore();
  });
  BL_OBST.forEach(function(o){
    if(o.r){
      var r = o.r, bg = x.createLinearGradient(r[0],r[1],r[0]+r[2],r[1]+r[3]); bg.addColorStop(0,"#5a5a66"); bg.addColorStop(1,"#30303a");
      x.fillStyle = bg; x.fillRect(r[0],r[1],r[2],r[3]);
      x.fillStyle = "rgba(255,255,255,0.12)"; x.fillRect(r[0],r[1],r[2],3); x.fillRect(r[0],r[1],3,r[3]);
      x.fillStyle = "rgba(0,0,0,0.35)"; x.fillRect(r[0],r[1]+r[3]-4,r[2],4); x.fillRect(r[0]+r[2]-4,r[1],4,r[3]);
      /* bandes de danger */
      x.save(); x.beginPath(); x.rect(r[0]+5,r[1]+5,r[2]-10,r[3]-10); x.clip(); x.globalAlpha = 0.5;
      for(var s=-r[3];s<r[2]+r[3];s+=18){ x.fillStyle = "#e0b100"; x.beginPath(); x.moveTo(r[0]+s,r[1]+r[3]); x.lineTo(r[0]+s+9,r[1]+r[3]); x.lineTo(r[0]+s+9+r[3],r[1]); x.lineTo(r[0]+s+r[3],r[1]); x.closePath(); x.fill(); }
      x.restore();
    } else {
      var cc = o.c, rg = x.createRadialGradient(cc[0]-20,cc[1]-24,10,cc[0],cc[1],cc[2]);
      rg.addColorStop(0,"#6a6a78"); rg.addColorStop(1,"#26262e");
      x.fillStyle = rg; x.beginPath(); x.arc(cc[0],cc[1],cc[2],0,Math.PI*2); x.fill();
      /* pile de pneus */
      for(var a=0;a<12;a++){ var an = a/12*Math.PI*2; x.fillStyle = "#121216"; x.beginPath(); x.arc(cc[0]+Math.cos(an)*(cc[2]-9), cc[1]+Math.sin(an)*(cc[2]-9), 10, 0, Math.PI*2); x.fill();
        x.fillStyle = "#2c2c34"; x.beginPath(); x.arc(cc[0]+Math.cos(an)*(cc[2]-9), cc[1]+Math.sin(an)*(cc[2]-9), 4, 0, Math.PI*2); x.fill(); }
      x.font = "700 30px Sora, system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "rgba(255,255,255,0.75)"; x.fillText("🎄", cc[0], cc[1]+2);
    }
  });
  /* vignette */
  var v = x.createRadialGradient(800,450,350,800,450,980); v.addColorStop(0,"rgba(0,0,0,0)"); v.addColorStop(1,"rgba(0,0,0,0.55)");
  x.fillStyle = v; x.fillRect(0,0,BL.W,BL.H);
  return c;
}

/* ---------- Le jeu ---------- */
function duel(){
  touches = {}; DIRK = {b:0,v:0}; NITK = {b:0,v:0};
  function voiture(s, x, a){ return {s:s, x:x, y:450, a:a, vx:0, vy:0, spin:0, pv:BL.PV, pvAff:BL.PV, nitro:100, nitroPause:0, nitroOn:false,
    cd:0, flash:0, triple:0, derive:0, mort:false, fumeeT:0, roueA:0, moteur:null}; }
  S.jeu = {id:"duel", phase:"decompte", msg:"3", msgT:0, t:{b:voiture("b",160,0), v:voiture("v",1440,Math.PI)},
    missiles:[], parts:[], nombres:[], bonus:[], bonusT:5, barils:BL_BARILS.map(function(p){ return {x:p[0], y:p[1], ok:true, t:0}; }),
    secousse:0, gel:0, ralenti:0, zoom:{k:1, x:800, y:450}, reste:BL.DUREE, fin:false, flashEcran:0, degats:{b:0,v:0}};
  montrer("duel");
  var cv = $("cvDuel"), ctx = cv.getContext("2d");
  var C = {b:couleur("--bleu")||"#2fa8ff", v:couleur("--violet")||"#b84dff", fg:couleur("--fg")||"#fff", mute:couleur("--mute")||"#999"};
  var sol = null, decals = null, solQ = 0, g0 = gen, last = null, debut = performance.now(), dernierMsg = null;
  function redim(){
    var r = Math.min(window.devicePixelRatio||1, 1.75), w = Math.max(320, Math.round(cv.clientWidth*r)), h = Math.max(200, Math.round(cv.clientHeight*r));
    if(cv.width!==w || cv.height!==h){ cv.width = w; cv.height = h; }
    var q = Math.min(2, Math.max(0.6, Math.min(w/BL.W, h/BL.H)*1.05));
    if(!sol || Math.abs(q-solQ)>0.15){
      solQ = q; sol = blSol(q, C);
      var nd = blCanvas(sol.width, sol.height); if(decals) nd.getContext("2d").drawImage(decals, 0, 0, nd.width, nd.height); decals = nd;
      S.jeu.decals = decals; S.jeu.solQ = q;
    }
  }
  redim();
  blMoteurs(true);
  function boucle(now){
    if(g0!==gen){ blMoteurs(false); return; }
    var J = S.jeu, dtr = last===null ? 0 : Math.min(0.05, (now-last)/1000); last = now;
    var e = (now-debut)/1000;
    redim();
    if(J.phase==="decompte"){
      J.msg = e<3 ? String(3-Math.floor(e)) : "GO !";
      if(J.msg!==dernierMsg){ dernierMsg = J.msg; J.msgT = 0; bip(J.msg==="GO !"?1320:660, 0.2, 0.07); }
      if(e>=3){ J.phase = "duel"; diffuser(); }
      blRalenti(J, dtr, true);
    } else if(J.phase==="duel" || J.phase==="fini"){
      if(J.phase==="duel" && e>4.2 && J.msg==="GO !") J.msg = "";
      var ech = J.ralenti>0 ? 0.28 : 1; J.ralenti = Math.max(0, J.ralenti-dtr);
      var dt = dtr*ech;
      if(J.gel>0){ J.gel -= dtr; }
      else {
        var n = Math.max(1, Math.ceil(dt/(1/120)));
        for(var i=0;i<n;i++) blPhysique(J, dt/n);
      }
      blParticules(J, dt);
      if(J.phase==="duel"){
        J.reste = Math.max(0, J.reste-dt);
        if(J.reste<=0) blFinTemps(J);
      }
    }
    J.msgT += dtr; J.secousse = Math.max(0, J.secousse-dtr*1.8); J.flashEcran = Math.max(0, J.flashEcran-dtr*3);
    blMajMoteurs(J);
    blDessiner(ctx, cv, C, sol, decals, J, now);
    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
}
/* Pendant le décompte : les voitures attendent, le moteur ronfle */
function blRalenti(J, dt){ ["b","v"].forEach(function(s){ var c = J.t[s]; c.pvAff = c.pv; }); blParticules(J, dt); }

function blDir(c){ return {x:Math.cos(c.a), y:Math.sin(c.a)}; }
function blPhysique(J, dt){
  ["b","v"].forEach(function(s){
    var c = J.t[s]; if(c.mort){ c.vx *= Math.exp(-2.5*dt); c.vy *= Math.exp(-2.5*dt); c.x += c.vx*dt; c.y += c.vy*dt; c.a += c.spin*dt; c.spin *= Math.exp(-2*dt); blMurs(J, c); return; }
    c.cd = Math.max(0, c.cd-dt); c.flash = Math.max(0, c.flash-dt); c.triple = Math.max(0, c.triple-dt);
    var dir = blDir(c), nx = -dir.y, ny = dir.x;
    var f = c.vx*dir.x + c.vy*dir.y, l = c.vx*nx + c.vy*ny;
    var volant = J.phase==="duel" ? Math.max(-1, Math.min(1, DIRK[s]+DIRM[s])) : 0;
    var veutNitro = J.phase==="duel" && (NITK[s] || NITM[s]);
    if(veutNitro && (c.nitroOn ? c.nitro>0 : c.nitro>8)){ c.nitroOn = true; c.nitro = Math.max(0, c.nitro-BL.NITRO_CONSO*dt); c.nitroPause = 0.7; }
    else { c.nitroOn = false; c.nitroPause = Math.max(0, c.nitroPause-dt); if(c.nitroPause<=0) c.nitro = Math.min(100, c.nitro+BL.NITRO_RECHARGE*dt); }
    var cible = J.phase==="duel" ? (c.nitroOn ? BL.VNITRO : BL.VMAX) : 0;
    f += (cible-f)*(1-Math.exp(-(c.nitroOn ? BL.ACC_N : BL.ACC)*dt));
    var vit = Math.abs(f), derive = volant!==0 && vit>330;
    l *= Math.exp(-(derive ? BL.GRIP_DERIVE : BL.GRIP)*dt);
    c.a += volant*BL.VIRAGE*Math.min(1, 0.3+vit/260)*(derive ? 1.12 : 1)*dt + c.spin*dt;
    c.spin *= Math.exp(-3.2*dt);
    c.roueA += (volant*0.5 - c.roueA)*Math.min(1, dt*14);
    c.vx = f*dir.x + l*nx; c.vy = f*dir.y + l*ny;
    /* plaques de boost */
    BL_BOOST.forEach(function(b){
      var dx = c.x-b.x, dy = c.y-b.y, ca = Math.cos(-b.a), sa = Math.sin(-b.a), lx = dx*ca-dy*sa, ly = dx*sa+dy*ca;
      if(Math.abs(lx)<70 && Math.abs(ly)<30){
        var bx = Math.cos(b.a), by = Math.sin(b.a), along = c.vx*bx + c.vy*by;
        if(along<1000){ c.vx += bx*2600*dt; c.vy += by*2600*dt; if(!c.boostSon || c.boostSon<0){ bip(520,0.25,0.05); bip(1040,0.25,0.03); c.boostSon = 0.6; } }
      }
    });
    c.boostSon = (c.boostSon||0)-dt;
    c.x += c.vx*dt; c.y += c.vy*dt;
    c.derive = Math.abs(l);
    blMurs(J, c);
    /* traces de pneus et fumée quand ça glisse */
    if(c.derive>95 || (c.nitroOn && vit<500)) blTraces(J, c, Math.min(1, c.derive/400));
    else c.trace = null;
    if(c.nitroOn){ c.fumeeT -= dt; if(c.fumeeT<=0){ c.fumeeT = 0.016; blFlammeNitro(J, c); } }
    if(c.derive>180 && Math.random()<dt*30) blFumeePneu(J, c);
    if(c.pv<50 && Math.random()<dt*(c.pv<25 ? 26 : 10)) blFumeeDegats(J, c);
  });
  /* collision voiture contre voiture */
  var a = J.t.b, b = J.t.v;
  blChoc(J, a, b);
  /* missiles */
  for(var i=J.missiles.length-1;i>=0;i--){
    var m = J.missiles[i], cib = J.t[m.cible];
    if(!cib.mort){
      var dx = cib.x-m.x, dy = cib.y-m.y, ang = Math.atan2(dy,dx), cur = Math.atan2(m.vy,m.vx), d = blAngle(ang-cur);
      if(Math.abs(d)<0.42){ var tour = Math.max(-1.6*dt, Math.min(1.6*dt, d)), v = Math.hypot(m.vx,m.vy); cur += tour; m.vx = Math.cos(cur)*v; m.vy = Math.sin(cur)*v; }
    }
    m.x += m.vx*dt; m.y += m.vy*dt; m.vie -= dt; m.trail -= dt;
    if(m.trail<=0){ m.trail = 0.012; J.parts.push({k:"fumee", x:m.x-m.vx*0.012, y:m.y-m.vy*0.012, vx:(Math.random()-0.5)*30, vy:(Math.random()-0.5)*30, vie:0.5, max:0.5, r:7, r2:18, col:"200,200,210", a:0.35});
      J.parts.push({k:"lueur", x:m.x, y:m.y, vx:0, vy:0, vie:0.08, max:0.08, r:22, col:"#ffb347"}); }
    var fini = false, touche = null;
    if(m.vie<=0 || m.x<18 || m.x>BL.W-18 || m.y<18 || m.y>BL.H-18 || blDansObstacle(m.x, m.y, 2)) fini = true;
    if(!cib.mort && blDansVoiture(cib, m.x, m.y, 5)){ fini = true; touche = m.cible; }
    J.barils.forEach(function(br){ if(br.ok && Math.hypot(br.x-m.x, br.y-m.y)<22){ fini = true; blExploserBaril(J, br, m.s); } });
    if(fini){
      J.missiles.splice(i,1);
      blExplosion(J, m.x, m.y, touche ? 1 : 0.55, m.s, touche);
      if(touche){
        var tc = J.t[touche], k = 300/ Math.max(1, Math.hypot(m.vx,m.vy));
        tc.vx += m.vx*k; tc.vy += m.vy*k; tc.spin += (Math.random()<0.5?-1:1)*(3+Math.random()*3);
        blDegats(J, touche, BL.DEGAT_MISSILE, m.s);
      }
    }
  }
  /* barils qui réapparaissent */
  J.barils.forEach(function(br){ if(!br.ok){ br.t -= dt; if(br.t<=0 && !blOccupe(J, br.x, br.y, 60)){ br.ok = true; br.pop = 0.4; } } else if(br.pop>0) br.pop -= dt; });
  /* les voitures foncent dans les barils */
  ["b","v"].forEach(function(s){ var c = J.t[s]; if(c.mort) return;
    J.barils.forEach(function(br){ if(br.ok && Math.hypot(br.x-c.x, br.y-c.y)<40) blExploserBaril(J, br, null); }); });
  /* bonus */
  J.bonusT -= dt;
  if(J.phase==="duel" && J.bonusT<=0 && J.bonus.length<2){
    J.bonusT = 6+Math.random()*4;
    var libres = BL_BONUS_POS.filter(function(p){ return !J.bonus.some(function(q){ return q.x===p[0] && q.y===p[1]; }) && !blOccupe(J, p[0], p[1], 120); });
    if(libres.length){ var p = libres[rnd(libres.length)], types = Object.keys(BL_BONUS), t = types[rnd(types.length)];
      J.bonus.push({x:p[0], y:p[1], t:t, age:0}); bip(1500,0.08,0.03); }
  }
  for(var j=J.bonus.length-1;j>=0;j--){
    var bo = J.bonus[j]; bo.age += dt;
    ["b","v"].forEach(function(s){ var c = J.t[s]; if(bo.pris || c.mort) return;
      if(Math.hypot(c.x-bo.x, c.y-bo.y)<46){ bo.pris = true; blPrendreBonus(J, c, bo); } });
    if(bo.pris) J.bonus.splice(j,1);
  }
}
function blAngle(d){ while(d>Math.PI) d -= Math.PI*2; while(d<-Math.PI) d += Math.PI*2; return d; }
function blCercles(c){ var d = blDir(c); return [{x:c.x+d.x*BL.AV, y:c.y+d.y*BL.AV}, {x:c.x-d.x*BL.AV, y:c.y-d.y*BL.AV}]; }
function blDansObstacle(x, y, m){
  for(var i=0;i<BL_OBST.length;i++){ var o = BL_OBST[i];
    if(o.r){ var r = o.r; if(x>r[0]-m && x<r[0]+r[2]+m && y>r[1]-m && y<r[1]+r[3]+m) return true; }
    else if(Math.hypot(x-o.c[0], y-o.c[1])<o.c[2]+m) return true; }
  return false;
}
function blDansVoiture(c, x, y, m){
  var dx = x-c.x, dy = y-c.y, ca = Math.cos(-c.a), sa = Math.sin(-c.a), lx = dx*ca-dy*sa, ly = dx*sa+dy*ca;
  return Math.abs(lx)<40+m && Math.abs(ly)<20+m;
}
function blOccupe(J, x, y, r){ return ["b","v"].some(function(s){ var c = J.t[s]; return Math.hypot(c.x-x, c.y-y)<r; }); }
/* Murs et obstacles : on repousse et on fait rebondir */
function blMurs(J, c){
  var pire = 0;
  blCercles(c).forEach(function(p){
    var push = [];
    if(p.x<18+BL.R) push.push({nx:1, ny:0, d:18+BL.R-p.x});
    if(p.x>BL.W-18-BL.R) push.push({nx:-1, ny:0, d:p.x-(BL.W-18-BL.R)});
    if(p.y<18+BL.R) push.push({nx:0, ny:1, d:18+BL.R-p.y});
    if(p.y>BL.H-18-BL.R) push.push({nx:0, ny:-1, d:p.y-(BL.H-18-BL.R)});
    BL_OBST.forEach(function(o){
      if(o.r){ var r = o.r, qx = Math.max(r[0], Math.min(p.x, r[0]+r[2])), qy = Math.max(r[1], Math.min(p.y, r[1]+r[3])), dx = p.x-qx, dy = p.y-qy, d = Math.hypot(dx,dy);
        if(d<BL.R){ if(d<0.001){ dx = p.x-(r[0]+r[2]/2); dy = p.y-(r[1]+r[3]/2); d = Math.hypot(dx,dy)||1; push.push({nx:dx/d, ny:dy/d, d:BL.R}); } else push.push({nx:dx/d, ny:dy/d, d:BL.R-d}); } }
      else { var cx = p.x-o.c[0], cy = p.y-o.c[1], dd = Math.hypot(cx,cy); if(dd<o.c[2]+BL.R){ push.push({nx:cx/(dd||1), ny:cy/(dd||1), d:o.c[2]+BL.R-dd}); } }
    });
    push.forEach(function(q){
      c.x += q.nx*q.d; c.y += q.ny*q.d;
      var vn = c.vx*q.nx + c.vy*q.ny;
      if(vn<0){
        c.vx -= 1.4*vn*q.nx; c.vy -= 1.4*vn*q.ny;
        c.vx *= 0.88; c.vy *= 0.88;
        if(-vn>pire){ pire = -vn; c.choc = {x:p.x-q.nx*BL.R, y:p.y-q.ny*BL.R, nx:q.nx, ny:q.ny}; }
      }
    });
  });
  if(pire>160 && c.choc){
    blEtincelles(J, c.choc.x, c.choc.y, c.choc.nx, c.choc.ny, Math.min(26, 6+pire/30), "#ffd27a");
    J.secousse = Math.min(1, J.secousse + Math.min(0.35, pire/1600));
    bip(110+Math.random()*40, 0.12, Math.min(0.09, pire/7000));
    c.spin += (Math.random()-0.5)*pire/180;
  }
}
/* Choc entre les deux voitures : on compare la vitesse d'approche, celle qui fonce fait mal */
function blChoc(J, a, b){
  var best = null;
  blCercles(a).forEach(function(p){ blCercles(b).forEach(function(q){ var dx = q.x-p.x, dy = q.y-p.y, d = Math.hypot(dx,dy);
    if(d<BL.R*2 && (!best || d<best.d)) best = {d:d, nx:dx/(d||1), ny:dy/(d||1), x:(p.x+q.x)/2, y:(p.y+q.y)/2}; }); });
  if(!best) return;
  var o = (BL.R*2-best.d)/2;
  a.x -= best.nx*o; a.y -= best.ny*o; b.x += best.nx*o; b.y += best.ny*o;
  var rv = (b.vx-a.vx)*best.nx + (b.vy-a.vy)*best.ny;
  if(rv>=0) return;
  var j = -rv*0.75;
  a.vx -= j*best.nx; a.vy -= j*best.ny; b.vx += j*best.nx; b.vy += j*best.ny;
  var choc = -rv;
  if(choc>140){
    blEtincelles(J, best.x, best.y, -best.nx, -best.ny, 12, "#ffffff"); blEtincelles(J, best.x, best.y, best.nx, best.ny, 12, "#ffd27a");
    J.secousse = Math.min(1, J.secousse + Math.min(0.6, choc/1200));
    a.spin += (Math.random()-0.5)*choc/120; b.spin += (Math.random()-0.5)*choc/120;
    bip(80, 0.18, Math.min(0.12, choc/5000)); bip(160, 0.1, Math.min(0.08, choc/6000));
  }
  if(choc>260 && !a.mort && !b.mort && J.phase==="duel"){
    /* l'attaquant : celle dont la vitesse pointe le plus vers l'autre */
    var pa = a.vx*best.nx + a.vy*best.ny, pb = -(b.vx*best.nx + b.vy*best.ny);
    var att = pa>=pb ? a : b, vic = att===a ? b : a, dmg = Math.round((choc-260)*0.045)+4;
    J.gel = Math.max(J.gel, 0.07);
    blDegats(J, vic.s, Math.min(30, dmg), att.s, "PERCUTÉ !");
    blDegats(J, att.s, Math.max(1, Math.round(dmg*0.25)), null);
  }
}
function blDegats(J, s, n, de, cri){
  var c = J.t[s]; if(c.mort || J.phase!=="duel") return;
  c.pv = Math.max(0, c.pv-n); c.flash = 0.13;
  if(de) J.degats[de] += n;
  J.nombres.push({x:c.x+(Math.random()-0.5)*20, y:c.y-34, txt:"-"+n, col:"#ffffff", vie:1, max:1, gros:n>=15});
  if(cri) J.nombres.push({x:c.x, y:c.y-64, txt:cri, col:"#ffd27a", vie:1.1, max:1.1, gros:true});
  if(c.pv<=0) blDetruire(J, s);
}
function blDetruire(J, s){
  var c = J.t[s]; c.mort = true; c.nitroOn = false;
  blExplosion(J, c.x, c.y, 2.4, null, null);
  for(var i=0;i<14;i++) J.parts.push({k:"debris", x:c.x, y:c.y, vx:(Math.random()-0.5)*900, vy:(Math.random()-0.5)*900, vie:1.4+Math.random(), max:2.4, r:3+Math.random()*6, rot:Math.random()*6, vr:(Math.random()-0.5)*20, col:Math.random()<0.5 ? couleur(s==="b"?"--bleu":"--violet") : "#222"});
  c.spin += (Math.random()<0.5?-1:1)*9;
  J.ralenti = 1.3; J.gel = 0.16; J.flashEcran = 1; J.secousse = 1;
  J.zoom.cible = {x:c.x, y:c.y};
  boum(); plus_tard(boum, 180);
  var g = autre(s);
  J.phase = "fini"; J.msg = S.noms[g]+" gagne !"; J.msgT = 0;
  plus_tard(function(){ bip(880,0.15,0.07); plus_tard(function(){ bip(1320,0.3,0.07); },150); }, 900);
  plus_tard(function(){ finManche(s, S.noms[g]+" a fait exploser la voiture de "+S.noms[s]); }, 3400);
}
function blFinTemps(J){
  var b = J.t.b, v = J.t.v;
  if(b.pv===v.pv){
    if(J.degats.b===J.degats.v){ J.phase = "fini"; J.msg = "Égalité, on recommence !"; J.msgT = 0; plus_tard(duel, 2600); return; }
  }
  var g = b.pv!==v.pv ? (b.pv>v.pv ? "b" : "v") : (J.degats.b>J.degats.v ? "b" : "v");
  J.phase = "fini"; J.msg = "Temps écoulé : "+S.noms[g]+" gagne !"; J.msgT = 0;
  plus_tard(function(){ bip(880,0.15,0.07); plus_tard(function(){ bip(1320,0.3,0.07); },150); }, 300);
  plus_tard(function(){ finManche(autre(g), "Temps écoulé : "+S.noms[g]+" a plus de points de vie"); }, 2800);
}
function blPrendreBonus(J, c, bo){
  var info = BL_BONUS[bo.t];
  if(bo.t==="repa") c.pv = Math.min(BL.PV, c.pv+30);
  else if(bo.t==="triple") c.triple = 8;
  else c.nitro = 100;
  J.nombres.push({x:c.x, y:c.y-50, txt:info.nom, col:info.col, vie:1.2, max:1.2, gros:true});
  for(var i=0;i<22;i++){ var an = i/22*Math.PI*2; J.parts.push({k:"etincelle", x:bo.x, y:bo.y, vx:Math.cos(an)*320, vy:Math.sin(an)*320, vie:0.4, max:0.4, col:info.col, l:10}); }
  J.parts.push({k:"anneau", x:bo.x, y:bo.y, vie:0.35, max:0.35, r:10, r2:90, col:info.col, w:5});
  bip(990,0.08,0.05); plus_tard(function(){ bip(1480,0.12,0.05); }, 70);
}

/* Tir (bouton FEU, ou touche) */
function tirer(s){
  var J = S.jeu; if(!J || J.id!=="duel" || J.phase!=="duel") return;
  var c = J.t[s]; if(c.mort || c.cd>0) return;
  c.cd = BL.CADENCE;
  var angles = c.triple>0 ? [-0.16, 0, 0.16] : [0];
  angles.forEach(function(da){
    var a = c.a+da, dx = Math.cos(a), dy = Math.sin(a), f = Math.max(0, c.vx*dx + c.vy*dy);
    J.missiles.push({x:c.x+dx*44, y:c.y+dy*44, vx:dx*(BL.MISSILE+f*0.5), vy:dy*(BL.MISSILE+f*0.5), vie:1.3, s:s, cible:autre(s), trail:0});
  });
  var d = blDir(c);
  J.parts.push({k:"lueur", x:c.x+d.x*46, y:c.y+d.y*46, vx:c.vx, vy:c.vy, vie:0.09, max:0.09, r:46, col:"#ffd27a"});
  for(var i=0;i<6;i++) J.parts.push({k:"fumee", x:c.x+d.x*44, y:c.y+d.y*44, vx:c.vx*0.4+(Math.random()-0.5)*90, vy:c.vy*0.4+(Math.random()-0.5)*90, vie:0.45, max:0.45, r:6, r2:20, col:"220,220,225", a:0.3});
  c.vx -= d.x*40; c.vy -= d.y*40;
  J.secousse = Math.min(1, J.secousse+0.06);
  blBruit(0.18, 0.06, 1800, 0.6); bip(240, 0.08, 0.04);
}

/* ---------- Effets ---------- */
function blExplosion(J, x, y, force, de, dejaTouche){
  var f = force;
  J.parts.push({k:"flash", x:x, y:y, vie:0.12, max:0.12, r:70*f});
  J.parts.push({k:"anneau", x:x, y:y, vie:0.4, max:0.4, r:10, r2:120*f, col:"#ffffff", w:6*f});
  for(var i=0;i<Math.round(18*f);i++){ var an = Math.random()*Math.PI*2, sp = (120+Math.random()*320)*f;
    J.parts.push({k:"feu", x:x, y:y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, vie:0.35+Math.random()*0.35, max:0.7, r:14*f+Math.random()*16*f}); }
  for(i=0;i<Math.round(14*f);i++){ var a2 = Math.random()*Math.PI*2, s2 = (40+Math.random()*160)*f;
    J.parts.push({k:"fumee", x:x, y:y, vx:Math.cos(a2)*s2, vy:Math.sin(a2)*s2, vie:0.9+Math.random()*0.9, max:1.8, r:16*f, r2:52*f, col:"60,60,68", a:0.55}); }
  for(i=0;i<Math.round(20*f);i++){ var a3 = Math.random()*Math.PI*2, s3 = (300+Math.random()*600)*f;
    J.parts.push({k:"etincelle", x:x, y:y, vx:Math.cos(a3)*s3, vy:Math.sin(a3)*s3, vie:0.25+Math.random()*0.3, max:0.55, col:Math.random()<0.5?"#ffd27a":"#ff7b2e", l:14}); }
  /* trace noire au sol */
  if(J.decals){ var d = J.decals.getContext("2d"), q = J.solQ, r = 34*f*q, g = d.createRadialGradient(x*q,y*q,0,x*q,y*q,r);
    g.addColorStop(0,"rgba(0,0,0,0.55)"); g.addColorStop(0.6,"rgba(10,8,6,0.3)"); g.addColorStop(1,"rgba(0,0,0,0)"); d.fillStyle = g; d.fillRect(x*q-r,y*q-r,r*2,r*2); }
  J.secousse = Math.min(1, J.secousse + 0.25*f);
  J.gel = Math.max(J.gel, 0.035*f);
  if(f>=0.9) boum(); else blBruit(0.35, 0.08, 500, 0.9);
  /* souffle : dégâts et poussée autour */
  if(force>=0.5) ["b","v"].forEach(function(s){
    var c = J.t[s]; if(c.mort || s===dejaTouche || s===de) return;
    var dx = c.x-x, dy = c.y-y, dd = Math.hypot(dx,dy), rayon = BL.SOUFFLE*f*1.4;
    if(dd<rayon){ var k = 1-dd/rayon; c.vx += dx/(dd||1)*520*k; c.vy += dy/(dd||1)*520*k; c.spin += (Math.random()-0.5)*8*k;
      if(force>=0.9 && de) blDegats(J, s, Math.max(2, Math.round(9*k)), de); }
  });
}
function blExploserBaril(J, br, de){
  if(!br.ok) return; br.ok = false; br.t = 12;
  J.parts.push({k:"flash", x:br.x, y:br.y, vie:0.18, max:0.18, r:180});
  blExplosion(J, br.x, br.y, 1.6, null, null);
  ["b","v"].forEach(function(s){
    var c = J.t[s]; if(c.mort) return;
    var dx = c.x-br.x, dy = c.y-br.y, dd = Math.hypot(dx,dy);
    if(dd<170){ var k = 1-dd/170; c.vx += dx/(dd||1)*900*k; c.vy += dy/(dd||1)*900*k; c.spin += (Math.random()<0.5?-1:1)*12*k;
      blDegats(J, s, Math.max(3, Math.round(26*k)), de && de!==s ? de : null, k>0.5 ? "BOUM !" : null); }
  });
  J.gel = Math.max(J.gel, 0.1); J.secousse = 1;
  J.barils.forEach(function(o){ if(o!==br && o.ok && Math.hypot(o.x-br.x, o.y-br.y)<190) plus_tard(function(){ blExploserBaril(J, o, de); }, 140); });
}
function blEtincelles(J, x, y, nx, ny, n, col){
  for(var i=0;i<n;i++){ var an = Math.atan2(ny,nx)+(Math.random()-0.5)*1.9, sp = 200+Math.random()*500;
    J.parts.push({k:"etincelle", x:x, y:y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, vie:0.15+Math.random()*0.3, max:0.45, col:col, l:9}); }
}
function blTraces(J, c, k){
  if(!J.decals) return;
  var d = J.decals.getContext("2d"), q = J.solQ, dir = blDir(c), nx = -dir.y, ny = dir.x;
  var roues = [[-24,-14],[-24,14],[22,-14],[22,14]].map(function(o){ return {x:c.x+dir.x*o[0]+nx*o[1], y:c.y+dir.y*o[0]+ny*o[1]}; });
  if(c.trace){
    d.strokeStyle = "rgba(8,8,10,"+(0.18+0.3*k).toFixed(3)+")"; d.lineWidth = 5.5*q; d.lineCap = "round";
    d.beginPath(); for(var i=0;i<4;i++){ d.moveTo(c.trace[i].x*q, c.trace[i].y*q); d.lineTo(roues[i].x*q, roues[i].y*q); } d.stroke();
  }
  c.trace = roues;
}
function blFumeePneu(J, c){
  var dir = blDir(c), nx = -dir.y, ny = dir.x, cote = Math.random()<0.5 ? -1 : 1;
  J.parts.push({k:"fumee", x:c.x-dir.x*24+nx*14*cote, y:c.y-dir.y*24+ny*14*cote, vx:c.vx*0.15+(Math.random()-0.5)*50, vy:c.vy*0.15+(Math.random()-0.5)*50, vie:0.9, max:0.9, r:10, r2:38, col:"215,215,222", a:0.32});
}
function blFlammeNitro(J, c){
  var dir = blDir(c), nx = -dir.y, ny = dir.x;
  [-8,8].forEach(function(o){
    J.parts.push({k:"nitro", x:c.x-dir.x*42+nx*o, y:c.y-dir.y*42+ny*o, vx:c.vx*0.6-dir.x*420+(Math.random()-0.5)*60, vy:c.vy*0.6-dir.y*420+(Math.random()-0.5)*60, vie:0.16, max:0.16, r:11});
  });
}
function blFumeeDegats(J, c){
  var dir = blDir(c), feu = c.pv<25;
  J.parts.push({k:"fumee", x:c.x+dir.x*18, y:c.y+dir.y*18, vx:(Math.random()-0.5)*40, vy:(Math.random()-0.5)*40, vie:1.1, max:1.1, r:8, r2:30, col:feu ? "40,40,44" : "120,120,128", a:0.45});
  if(feu && Math.random()<0.6) J.parts.push({k:"feu", x:c.x+dir.x*18+(Math.random()-0.5)*14, y:c.y+dir.y*18+(Math.random()-0.5)*14, vx:(Math.random()-0.5)*30, vy:(Math.random()-0.5)*30, vie:0.3, max:0.3, r:10});
}
function blParticules(J, dt){
  var ps = J.parts;
  if(ps.length>900) ps.splice(0, ps.length-900);
  for(var i=ps.length-1;i>=0;i--){ var p = ps[i]; p.vie -= dt; if(p.vie<=0){ ps.splice(i,1); continue; }
    if(p.vx!==undefined){ p.x += p.vx*dt; p.y += p.vy*dt; var fr = p.k==="etincelle" ? 3 : p.k==="debris" ? 1.6 : 2.4; p.vx *= Math.exp(-fr*dt); p.vy *= Math.exp(-fr*dt); }
    if(p.vr) p.rot += p.vr*dt; }
  for(var j=J.nombres.length-1;j>=0;j--){ var nb = J.nombres[j]; nb.vie -= dt; nb.y -= 46*dt; if(nb.vie<=0) J.nombres.splice(j,1); }
  ["b","v"].forEach(function(s){ var c = J.t[s]; c.pvAff += (c.pv-c.pvAff)*Math.min(1, dt*(c.pvAff>c.pv ? 2.2 : 8)); });
  /* les traces au sol s'effacent doucement */
  if(J.decals){ J.effT = (J.effT||0)+dt; if(J.effT>0.25){ J.effT = 0; var d = J.decals.getContext("2d"); d.globalCompositeOperation = "destination-out"; d.fillStyle = "rgba(0,0,0,0.012)"; d.fillRect(0,0,J.decals.width,J.decals.height); d.globalCompositeOperation = "source-over"; } }
  if(J.zoom.cible){ J.zoom.k += (1.45-J.zoom.k)*Math.min(1, dt*3); J.zoom.x += (J.zoom.cible.x-J.zoom.x)*Math.min(1, dt*3); J.zoom.y += (J.zoom.cible.y-J.zoom.y)*Math.min(1, dt*3); }
}

/* ---------- Sons : moteurs continus + bruits ---------- */
var BL_BRUIT = null;
function blBruit(duree, vol, freq, q){
  if(!audio || audio.state!=="running") return;
  try{
    if(!BL_BRUIT){ var len = Math.floor(audio.sampleRate*1), b = audio.createBuffer(1, len, audio.sampleRate), d = b.getChannelData(0); for(var i=0;i<len;i++) d[i] = Math.random()*2-1; BL_BRUIT = b; }
    var t = audio.currentTime, src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
    src.buffer = BL_BRUIT; f.type = "bandpass"; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, freq*0.25), t+duree); f.Q.value = q||1;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t+duree);
    src.connect(f); f.connect(g); g.connect(audio.destination); src.start(t); src.stop(t+duree+0.05);
  }catch(e){}
}
var BL_MOT = null;
function blMoteurs(on){
  if(BL_MOT){ BL_MOT.forEach(function(m){ try{ m.g.gain.setTargetAtTime(0, audio.currentTime, 0.05); m.o.stop(audio.currentTime+0.3); }catch(e){} }); BL_MOT = null; }
  if(!on || !audio || audio.state!=="running") return;
  try{
    BL_MOT = ["b","v"].map(function(s){
      var o = audio.createOscillator(), f = audio.createBiquadFilter(), g = audio.createGain();
      o.type = "sawtooth"; o.frequency.value = 40; f.type = "lowpass"; f.frequency.value = 380; g.gain.value = 0;
      o.connect(f); f.connect(g); g.connect(audio.destination); o.start();
      return {s:s, o:o, f:f, g:g};
    });
  }catch(e){ BL_MOT = null; }
}
function blMajMoteurs(J){
  if(!BL_MOT){ if(audio && audio.state==="running" && J.phase!=="fini") blMoteurs(true); return; }
  if(J.phase==="fini" && J.ralenti<=0 && J.msgT>1.5){ blMoteurs(false); return; }
  var t = audio.currentTime;
  BL_MOT.forEach(function(m){
    var c = J.t[m.s], v = Math.hypot(c.vx,c.vy);
    m.o.frequency.setTargetAtTime(c.mort ? 30 : 38 + v*0.09 + (c.nitroOn ? 22 : 0), t, 0.06);
    m.f.frequency.setTargetAtTime(c.nitroOn ? 900 : 380, t, 0.08);
    m.g.gain.setTargetAtTime(c.mort ? 0 : 0.022 + Math.min(0.02, v/40000), t, 0.08);
  });
}

/* ---------- Dessin ---------- */
function blDessiner(ctx, cv, C, sol, decals, J, now){
  var W = cv.width, H = cv.height, haut = Math.round(H*0.075), bas = Math.round(H*0.17);
  var sc = Math.min(W/BL.W, (H-haut-bas)/BL.H), ox = (W-BL.W*sc)/2, oy = haut + (H-haut-bas-BL.H*sc)/2;
  ctx.setTransform(1,0,0,1,0,0); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
  ctx.fillStyle = "#07070a"; ctx.fillRect(0,0,W,H);
  /* secousse (trauma²) et zoom de fin */
  var tr = J.secousse*J.secousse, sx = (Math.sin(now*0.071)+Math.sin(now*0.043))*14*tr*sc*2, sy = (Math.sin(now*0.067+1)+Math.sin(now*0.039+2))*14*tr*sc*2;
  var z = J.zoom.k;
  /* le point (cx,cy) reste au centre de l'arène affichée */
  var cx = BL.W/2 + (J.zoom.x-BL.W/2)*(1-1/z), cy = BL.H/2 + (J.zoom.y-BL.H/2)*(1-1/z);
  ctx.save(); ctx.beginPath(); ctx.rect(ox-2, oy-2, BL.W*sc+4, BL.H*sc+4); ctx.clip();
  ctx.setTransform(sc*z, 0, 0, sc*z, ox + BL.W*sc/2 - cx*sc*z + sx, oy + BL.H*sc/2 - cy*sc*z + sy);
  ctx.drawImage(sol, 0, 0, BL.W, BL.H);
  ctx.drawImage(decals, 0, 0, BL.W, BL.H);
  /* plaques de boost : chevrons qui défilent */
  BL_BOOST.forEach(function(b){
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
    ctx.fillStyle = "rgba(90,216,255,0.10)"; ctx.fillRect(-70,-30,140,60);
    ctx.strokeStyle = "rgba(90,216,255,0.55)"; ctx.lineWidth = 2; ctx.strokeRect(-70,-30,140,60);
    ctx.beginPath(); ctx.rect(-70,-30,140,60); ctx.clip();
    var off = (now*0.12)%40;
    for(var i=-3;i<4;i++){ var px = i*40+off; ctx.globalAlpha = 0.35+0.65*Math.max(0, 1-Math.abs(px)/80);
      ctx.strokeStyle = "#5ad8ff"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(px-10,-16); ctx.lineTo(px+6,0); ctx.lineTo(px-10,16); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
  });
  /* barils */
  J.barils.forEach(function(br){
    if(!br.ok) return;
    var pk = br.pop>0 ? 1+br.pop*0.8 : 1, pulse = 0.5+0.5*Math.sin(now*0.006+br.x);
    ctx.save(); ctx.translate(br.x, br.y); ctx.scale(pk,pk);
    ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.beginPath(); ctx.ellipse(5,7,20,20,0,0,Math.PI*2); ctx.fill();
    var g = ctx.createRadialGradient(-6,-6,2,0,0,19); g.addColorStop(0,"#ff6b5a"); g.addColorStop(1,"#8c1010");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,18,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#2a0606"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle = "#ffd200"; ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(7,5); ctx.lineTo(-7,5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#2a0606"; ctx.font = "700 9px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("!", 0, 1.5);
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.18+0.2*pulse; ctx.drawImage(blLueur("#ff3020"), -40,-40,80,80);
    ctx.restore();
  });
  /* bonus : caisse lumineuse qui flotte */
  J.bonus.forEach(function(bo){
    var info = BL_BONUS[bo.t], app = Math.min(1, bo.age*3), fl = Math.sin(now*0.005+bo.x)*4;
    ctx.save(); ctx.translate(bo.x, bo.y+fl); ctx.scale(app, app);
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.55; ctx.drawImage(blLueur(info.col), -60,-60,120,120);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.rotate(Math.sin(now*0.002)*0.15);
    ctx.fillStyle = "rgba(10,10,16,0.85)"; ctx.strokeStyle = info.col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-22,-22,44,44,10) : ctx.rect(-22,-22,44,44); ctx.fill(); ctx.stroke();
    ctx.font = "26px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(info.emoji, 0, 2);
    ctx.restore();
  });
  /* fumées (sous les voitures) */
  var fum = blFumee();
  J.parts.forEach(function(p){ if(p.k!=="fumee") return; var k = p.vie/p.max, r = p.r2+(p.r-p.r2)*k;
    ctx.globalAlpha = p.a*k; ctx.drawImage(blTeinte(fum, p.col), p.x-r, p.y-r, r*2, r*2); });
  ctx.globalAlpha = 1;
  /* voitures */
  ["b","v"].forEach(function(s){ blDessinerVoiture(ctx, J, J.t[s], C[s], now); });
  /* missiles */
  J.missiles.forEach(function(m){
    var a = Math.atan2(m.vy, m.vx);
    ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(a);
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.9; ctx.drawImage(blLueur("#ffb347"), -34,-20,40,40);
    ctx.globalAlpha = 0.6; ctx.drawImage(blLueur(C[m.s]), -16,-16,32,32);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.fillStyle = "#e9e9ef"; ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(4,-4); ctx.lineTo(-10,-4); ctx.lineTo(-10,4); ctx.lineTo(4,4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C[m.s]; ctx.fillRect(-10,-6,5,12); ctx.fillStyle = "#ff3b3b"; ctx.beginPath(); ctx.arc(10,0,2.4,0,Math.PI*2); ctx.fill();
    ctx.restore();
  });
  /* débris */
  J.parts.forEach(function(p){ if(p.k!=="debris") return; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, p.vie*1.5); ctx.fillStyle = p.col; ctx.fillRect(-p.r,-p.r*0.6,p.r*2,p.r*1.2); ctx.restore(); });
  /* feu, étincelles, lueurs : en mode additif */
  ctx.globalCompositeOperation = "lighter";
  J.parts.forEach(function(p){
    var k = Math.max(0, p.vie/p.max);
    if(p.k==="feu"){ var r = p.r*(0.6+0.8*(1-k)); ctx.globalAlpha = k; ctx.drawImage(blLueur(k>0.55 ? "#ffe08a" : k>0.25 ? "#ff7b2e" : "#b3200f"), p.x-r, p.y-r, r*2, r*2); }
    else if(p.k==="nitro"){ var rn = p.r*(0.5+k); ctx.globalAlpha = k; ctx.drawImage(blLueur(k>0.5 ? "#bff4ff" : "#2f7bff"), p.x-rn, p.y-rn, rn*2, rn*2); }
    else if(p.k==="lueur"){ ctx.globalAlpha = k; ctx.drawImage(blLueur(p.col), p.x-p.r, p.y-p.r, p.r*2, p.r*2); }
    else if(p.k==="etincelle"){ ctx.globalAlpha = k; ctx.strokeStyle = p.col; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x-p.vx*0.022*p.l/10, p.y-p.vy*0.022*p.l/10); ctx.stroke(); }
    else if(p.k==="flash"){ ctx.globalAlpha = k; ctx.drawImage(blLueur("#fff6d8"), p.x-p.r*2, p.y-p.r*2, p.r*4, p.r*4); }
  });
  ctx.globalCompositeOperation = "source-over";
  J.parts.forEach(function(p){ if(p.k!=="anneau") return; var k = Math.max(0, p.vie/p.max), r = p.r2+(p.r-p.r2)*k;
    ctx.globalAlpha = k*0.8; ctx.strokeStyle = p.col; ctx.lineWidth = p.w*k+1; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.stroke(); });
  ctx.globalAlpha = 1;
  /* chiffres de dégâts */
  J.nombres.forEach(function(nb){
    var k = nb.vie/nb.max, pop = 1+Math.max(0, (k-0.8))*2.5, taille = (nb.gros ? 30 : 22)*pop;
    ctx.globalAlpha = Math.min(1, k*2); ctx.font = "800 "+taille.toFixed(1)+"px Sora, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 5; ctx.strokeStyle = "rgba(0,0,0,0.8)"; ctx.strokeText(nb.txt, nb.x, nb.y); ctx.fillStyle = nb.col; ctx.fillText(nb.txt, nb.x, nb.y);
  });
  ctx.globalAlpha = 1;
  ctx.restore();
  /* flash d'écran à la destruction */
  ctx.setTransform(1,0,0,1,0,0);
  if(J.flashEcran>0){ ctx.globalAlpha = J.flashEcran*0.55; ctx.fillStyle = "#fff4dc"; ctx.fillRect(0,0,W,H); ctx.globalAlpha = 1; }
  if(J.ralenti>0){ var vg = ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.9); vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,"+(0.5*Math.min(1,J.ralenti)).toFixed(2)+")"); ctx.fillStyle = vg; ctx.fillRect(0,0,W,H); }
  blInterface(ctx, W, H, bas, C, J, now);
}
var BL_TEINTE = {};
function blTeinte(img, col){
  var k = col; if(BL_TEINTE[k]) return BL_TEINTE[k];
  var c = blCanvas(img.width, img.height), x = c.getContext("2d");
  x.drawImage(img,0,0); x.globalCompositeOperation = "source-in"; x.fillStyle = "rgb("+col+")"; x.fillRect(0,0,c.width,c.height);
  BL_TEINTE[k] = c; return c;
}
function blDessinerVoiture(ctx, J, c, col, now){
  var dir = blDir(c), v = Math.hypot(c.vx, c.vy);
  /* traînée fantôme en nitro */
  if(c.nitroOn && !c.mort){
    var spr0 = blVoiture(col, c.s, "");
    for(var g=3;g>=1;g--){ ctx.save(); ctx.translate(c.x-c.vx*0.018*g, c.y-c.vy*0.018*g); ctx.rotate(c.a); ctx.globalAlpha = 0.12*(4-g); ctx.drawImage(spr0, -46, -26, 92, 52); ctx.restore(); }
    ctx.globalAlpha = 1;
  }
  ctx.save(); ctx.translate(c.x, c.y);
  /* ombre */
  ctx.save(); ctx.translate(6, 9); ctx.rotate(c.a); ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.ellipse(0,0,44,24,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  /* phares (cône de lumière) */
  if(!c.mort){
    ctx.save(); ctx.rotate(c.a); ctx.globalCompositeOperation = "lighter";
    var lg = ctx.createRadialGradient(40,0,4,40,0,170); lg.addColorStop(0,"rgba(255,248,220,0.22)"); lg.addColorStop(1,"rgba(255,248,220,0)");
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(36,-14); ctx.lineTo(200,-70); ctx.lineTo(200,70); ctx.lineTo(36,14); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.5; ctx.drawImage(blLueur("#ff2030"), -56,-26,24,24); ctx.drawImage(blLueur("#ff2030"), -56,2,24,24);
    ctx.restore();
  }
  ctx.rotate(c.a);
  /* roues (les avant tournent avec le volant) */
  ctx.fillStyle = "#08080a";
  [[-24,-17],[-24,17],[23,-17],[23,17]].forEach(function(w, i){
    ctx.save(); ctx.translate(w[0], w[1]); if(i>=2) ctx.rotate(c.roueA*0.8);
    ctx.fillRect(-8,-4.5,16,9); ctx.fillStyle = "#3a3a42"; ctx.fillRect(-6,-1,12,2); ctx.fillStyle = "#08080a"; ctx.restore();
  });
  /* carrosserie */
  var spr = blVoiture(col, c.s, c.mort ? "epave" : "");
  ctx.drawImage(spr, -46, -26, 92, 52);
  if(c.flash>0){ ctx.globalAlpha = Math.min(1, c.flash*9); ctx.drawImage(blVoiture(col, c.s, "blanc"), -46, -26, 92, 52); ctx.globalAlpha = 1; }
  /* lueur de l'équipe sous la voiture */
  if(!c.mort){ ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.22; ctx.drawImage(blLueur(col), -70,-46,140,92); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; }
  if(c.triple>0 && !c.mort){ ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.3+0.2*Math.sin(now*0.02); ctx.drawImage(blLueur("#ffb347"), 20,-26,52,52); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; }
  ctx.restore();
  /* petite barre de vie au-dessus */
  if(!c.mort){
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(c.x-30, c.y-48, 60, 7);
    ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.fillRect(c.x-29, c.y-47, 58*c.pvAff/BL.PV, 5);
    ctx.fillStyle = c.pv<25 ? "#ff3b3b" : col; ctx.fillRect(c.x-29, c.y-47, 58*c.pv/BL.PV, 5);
  }
}
function blInterface(ctx, W, H, bas, C, J, now){
  var fs = Math.max(13, Math.round(H/36)), y0 = H-bas+Math.round(bas*0.08), bw = Math.min(W*0.32, 520), bh = Math.max(10, Math.round(H/60)), m = Math.round(W*0.03);
  ctx.textBaseline = "alphabetic";
  ["b","v"].forEach(function(s, i){
    var c = J.t[s], x0 = i ? W-m-bw : m, col = C[s];
    ctx.font = "800 "+fs+"px Sora, system-ui, sans-serif"; ctx.textAlign = i ? "right" : "left"; ctx.fillStyle = col;
    ctx.fillText((S.noms[s]||"")+"  "+Math.ceil(c.pv)+" PV"+(c.triple>0 ? "   🚀 "+Math.ceil(c.triple)+" s" : ""), i ? x0+bw : x0, y0+fs*0.9);
    var yb = y0+fs*1.35;
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(x0, yb, bw, bh);
    ctx.fillStyle = "rgba(255,255,255,0.8)"; var wA = bw*c.pvAff/BL.PV; ctx.fillRect(i ? x0+bw-wA : x0, yb, wA, bh);
    var w = bw*c.pv/BL.PV; ctx.fillStyle = c.pv<25 && Math.floor(now/180)%2 ? "#ff3b3b" : col; ctx.fillRect(i ? x0+bw-w : x0, yb, w, bh);
    /* jauge de nitro */
    var yn = yb+bh+Math.round(bh*0.6), wn = bw*0.6*c.nitro/100, xn = i ? x0+bw-wn : x0;
    ctx.fillStyle = "rgba(90,216,255,0.12)"; ctx.fillRect(i ? x0+bw*0.4 : x0, yn, bw*0.6, Math.round(bh*0.55));
    ctx.fillStyle = c.nitroOn ? "#bff4ff" : "#5ad8ff"; ctx.fillRect(xn, yn, wn, Math.round(bh*0.55));
    ctx.font = "600 "+Math.round(fs*0.62)+"px Sora, system-ui, sans-serif"; ctx.fillStyle = "rgba(90,216,255,0.8)";
    ctx.textAlign = i ? "right" : "left"; ctx.fillText("NITRO", i ? x0+bw-bw*0.6-8 : x0+bw*0.6+8, yn+Math.round(bh*0.55));
  });
  if(J.reste!=null && J.phase!=="decompte"){
    var r = Math.ceil(J.reste); ctx.textAlign = "center"; ctx.font = "800 "+Math.round(fs*1.5)+"px Sora, system-ui, sans-serif";
    ctx.fillStyle = r<=10 && J.phase==="duel" ? (Math.floor(now/250)%2 ? "#ff3b3b" : "#ffffff") : C.fg; ctx.fillText(r+" s", W/2, y0+fs*1.6);
  }
  if(J.msg){
    var pop = Math.max(0, 1-J.msgT*5), big = Math.round(H/(J.msg.length>12 ? 11 : 6)*(1+pop*0.5));
    ctx.font = "900 "+big+"px Sora, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(4, big/12); ctx.strokeStyle = "rgba(0,0,0,0.85)"; ctx.strokeText(J.msg, W/2, H*0.45);
    ctx.fillStyle = J.msg==="GO !" ? "#ffd27a" : C.fg; ctx.fillText(J.msg, W/2, H*0.45);
  }
}
