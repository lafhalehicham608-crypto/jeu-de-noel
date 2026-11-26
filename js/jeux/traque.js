/* Le Jeu de Noël · Mini-jeu : La Traque (Kendrick chasse Emilia) */
"use strict";
/* ================= Mini-jeu 11 : La Traque =================
   Vue de dessus dans un jardin gothique. Kendrick (Lui, vampire alpha) chasse Emilia (Elle, vampire beta).
   Il gagne la manche s'il la touche ; elle gagne si elle tient jusqu'à la fin du temps. 2 manches gagnantes. */
var TQ = {DUREE:60, R:16, VK:225, VE:200, ACC_K:4.5, ACC_E:10, PRISE:30, REVEIL:1.2};
var TQ_NOMS = {b:"Kendrick", v:"Emilia"};
var TQ_POUVOIRS = {
  b:[{id:"ruee", nom:"Ruée", cd:6, icone:"💨"}, {id:"instinct", nom:"Instinct", cd:12, icone:"👁"}, {id:"hurlement", nom:"Hurlement", cd:0, unique:true, icone:"🐺"}],
  v:[{id:"brume", nom:"Brume", cd:10, icone:"🌫"}, {id:"nuee", nom:"Nuée", cd:12, icone:"🦇"}, {id:"charme", nom:"Charme", cd:0, unique:true, icone:"💋"}]
};
/* Carte : murs (haies, tombes, fontaine, colonnes) + mécaniques
   - baril d'eau bénite : explose au contact, étourdit Kendrick, repousse tout le monde, revient après 12 s
   - gargouille : rebond violent (les deux)
   - crypte : téléporte vers la crypte jumelle
   - ronces : ralentissent
   - fiole de sang : recharge tous les pouvoirs de celui qui la prend */
var TQ_MURS = [
  ["fontaine",500,300,46],
  ["haie",230,230,24,140],["haie",746,230,24,140],
  ["haie",380,60,90,22],["haie",530,60,90,22],["haie",380,518,90,22],["haie",530,518,90,22],
  ["tombe",160,410,24,30],["tombe",816,160,24,30],["tombe",420,196,24,30],["tombe",556,374,24,30],
  ["colonne",430,410,14],["colonne",570,190,14]
];
var TQ_GARGOUILLES = [[500,128],[500,472],[372,300],[628,300]];
var TQ_BARILS_POS = [[300,140],[700,460],[300,460],[700,140],[110,170],[890,430]];
var TQ_CRYPTES = [{x:62,y:62,vers:1,col:"#b3001b"},{x:938,y:538,vers:0,col:"#b3001b"},{x:938,y:62,vers:3,col:"#3fb68b"},{x:62,y:538,vers:2,col:"#3fb68b"}];
var TQ_RONCES = [[140,232,62,70],[798,298,62,70]];
var TQ_DECOR = TQ_MURS;
var JOY = {b:{x:0,y:0}, v:{x:0,y:0}}, JOYK = {b:{}, v:{}};
function tqCollision(x, y, r){
  if(x<r+10 || x>990-r || y<r+10 || y>590-r) return true;
  var J = S.jeu;
  if(J && J.barils) for(var b=0;b<J.barils.length;b++){ var B = J.barils[b]; if(B.vivant && Math.hypot(x-B.x, y-B.y) < 16+r) return true; }
  for(var i=0;i<TQ_DECOR.length;i++){
    var d = TQ_DECOR[i], t = d[0];
    if(t==="fontaine" || t==="colonne" || t==="arbre"){ if(Math.hypot(x-d[1], y-d[2]) < d[3]+r) return true; }
    else { var cx = Math.max(d[1], Math.min(x, d[1]+d[3])), cy = Math.max(d[2], Math.min(y, d[2]+d[4])); if(Math.hypot(x-cx, y-cy) < r) return true; }
  }
  return false;
}
function tqPerso(s){
  return {s:s, x:s==="b" ? 120 : 880, y:300, vx:0, vy:0, a:s==="b" ? 0 : Math.PI, cd:{}, utilise:{}, ruee:0, brume:0, ralenti:0, fige:0, stun:0, knock:0, tp:0, trace:[]};
}
function traque(){
  JOYK = {b:{}, v:{}};
  S.jeu = {id:"traque", phase:"intro", manche:1, wins:{b:0,v:0}, parts:[], leurres:[], instinct:0, msg:"", sous:"", t0:0, reste:TQ.DUREE, pret:{}, proche:false,
    p:{b:tqPerso("b"), v:tqPerso("v")}, brouillard:[]};
  for(var i=0;i<14;i++) S.jeu.brouillard.push({x:Math.random()*1000, y:Math.random()*600, r:80+Math.random()*120, v:6+Math.random()*12});
  montrer("traque");
  var cv = $("cvTraque"), ctx = cv.getContext("2d"), r = Math.min(window.devicePixelRatio||1, 1.5);
  cv.width = Math.max(300, cv.clientWidth*r); cv.height = Math.max(200, cv.clientHeight*r);
  var g0 = gen, last = null;
  tqManche();
  function boucle(now){
    if(g0!==gen) return;
    var dt = last===null ? 0 : Math.min(0.05, (now-last)/1000); last = now;
    majTraque(dt, now); dessinerTraque(ctx, cv, now);
    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
}
function tqManche(){
  var J = S.jeu;
  J.p = {b:tqPerso("b"), v:tqPerso("v")}; J.leurres = []; J.instinct = 0; J.reste = TQ.DUREE;
  J.barils = TQ_BARILS_POS.map(function(p){ return {x:p[0], y:p[1], vivant:true, retour:0}; });
  J.garg = TQ_GARGOUILLES.map(function(){ return 0; });
  J.fiole = null; J.fioleT = 6; J.explosions = []; J.textes = [];
  J.phase = "intro"; J.introT = 0; J.msg = "Manche "+J.manche; J.sous = "Kendrick traque Emilia…";
  diffuser();
}
function majTraque(dt, now){
  var J = S.jeu; if(!J || J.id!=="traque") return;
  majParticules(dt);
  J.brouillard.forEach(function(b){ b.x += b.v*dt; if(b.x-b.r>1000) b.x = -b.r; });
  if(J.phase==="intro"){
    J.introT += dt;
    if(J.introT<3.2){ J.msg = "Manche "+J.manche; J.sous = "Kendrick traque Emilia…"; }
    else if(J.introT<4){ J.msg = "Fuis, Emilia !"; J.sous = ""; }
    else { J.phase = "chasse"; J.t0 = now; J.msg = ""; J.sous = ""; bip(220, 0.4, 0.08); diffuser(); }
    if(J.introT>3.2 && J.introT-dt<=3.2) bip(660, 0.15, 0.06);
    return;
  }
  if(J.phase!=="chasse"){ return; }
  var e = (now-J.t0)/1000;
  J.reste = Math.max(0, TQ.DUREE - e);
  ["b","v"].forEach(function(s){
    var c = J.p[s];
    for(var k in c.cd) c.cd[k] = Math.max(0, c.cd[k]-dt);
    c.ruee = Math.max(0, c.ruee-dt); c.brume = Math.max(0, c.brume-dt); c.ralenti = Math.max(0, c.ralenti-dt); c.fige = Math.max(0, c.fige-dt);
    c.stun = Math.max(0, c.stun-dt); c.knock = Math.max(0, c.knock-dt); c.tp = Math.max(0, c.tp-dt);
    var j = JOY[s], jk = JOYK[s], jx = j.x + (jk.d?1:0) - (jk.g?1:0), jy = j.y + (jk.b?1:0) - (jk.h?1:0);
    var n = Math.hypot(jx, jy); if(n>1){ jx /= n; jy /= n; }
    if(s==="b" && e<TQ.REVEIL){ jx = 0; jy = 0; }
    if(c.fige>0 || c.stun>0){ jx = 0; jy = 0; }
    var ronce = TQ_RONCES.some(function(r){ return c.x>r[0] && c.x<r[0]+r[2] && c.y>r[1] && c.y<r[1]+r[3]; });
    if(ronce && Math.random()<dt*8) J.parts.push({x:c.x, y:c.y, vx:(Math.random()-0.5)*40, vy:(Math.random()-0.5)*40, vie:0.5, max:0.5, t:3, col:"#3b6b2a"});
    var vmax = (s==="b" ? TQ.VK : TQ.VE) * (c.ruee>0 ? 2.3 : 1) * (c.ralenti>0 ? 0.5 : 1) * (ronce ? 0.5 : 1);
    var acc = s==="b" ? TQ.ACC_K*(c.ruee>0 ? 3 : 1) : TQ.ACC_E;
    if(c.knock>0) acc *= 0.12;
    var k2 = Math.min(1, acc*dt);
    c.vx += (jx*vmax - c.vx)*k2; c.vy += (jy*vmax - c.vy)*k2;
    var nx = c.x + c.vx*dt, ny = c.y + c.vy*dt;
    if(!tqCollision(nx, c.y, TQ.R)) c.x = nx; else c.vx *= -0.2;
    if(!tqCollision(c.x, ny, TQ.R)) c.y = ny; else c.vy *= -0.2;
    if(Math.hypot(c.vx, c.vy)>20) c.a = Math.atan2(c.vy, c.vx);
    TQ_GARGOUILLES.forEach(function(g, gi){
      var dx = c.x-g[0], dy = c.y-g[1], d = Math.hypot(dx, dy), rr = 20+TQ.R;
      if(d<rr && d>0.01){
        var ux = dx/d, uy = dy/d; c.x = g[0]+ux*(rr+1); c.y = g[1]+uy*(rr+1);
        c.vx = ux*520; c.vy = uy*520; c.knock = 0.35; J.garg[gi] = 0.3;
        bip(320+Math.random()*80, 0.08, 0.07);
        for(var q=0;q<10;q++) J.parts.push({x:g[0]+ux*20, y:g[1]+uy*20, vx:ux*180+(Math.random()-0.5)*120, vy:uy*180+(Math.random()-0.5)*120, vie:0.4, max:0.4, t:3, col:"#5ff2d0"});
      }
    });
    J.barils.forEach(function(B){ if(B.vivant && Math.hypot(c.x-B.x, c.y-B.y) < 16+TQ.R+3) tqExplosion(B); });
    if(c.tp<=0) TQ_CRYPTES.forEach(function(cr){
      if(c.tp>0 || Math.hypot(c.x-cr.x, c.y-cr.y)>20) return;
      var dest = TQ_CRYPTES[cr.vers], ux = 500-dest.x, uy = 300-dest.y, n = Math.hypot(ux, uy);
      for(var q=0;q<18;q++) J.parts.push({x:c.x, y:c.y, vx:(Math.random()-0.5)*160, vy:(Math.random()-0.5)*160, vie:0.5, max:0.5, t:4, col:cr.col});
      c.x = dest.x + ux/n*34; c.y = dest.y + uy/n*34; c.tp = 2.5; c.trace = [];
      for(var q2=0;q2<18;q2++) J.parts.push({x:c.x, y:c.y, vx:(Math.random()-0.5)*160, vy:(Math.random()-0.5)*160, vie:0.5, max:0.5, t:4, col:cr.col});
      bip(1600, 0.12, 0.05); bip(800, 0.2, 0.04);
    });
    c.trace.push({x:c.x, y:c.y, t:now}); while(c.trace.length && now-c.trace[0].t>450) c.trace.shift();
    if(c.ruee>0 && Math.random()<dt*60) J.parts.push({x:c.x, y:c.y, vx:(Math.random()-0.5)*30, vy:(Math.random()-0.5)*30, vie:0.4, max:0.4, t:4, col:"#2fa8ff"});
  });
  /* leurre de chauves-souris */
  J.leurres.forEach(function(l){ l.vie -= dt; l.x += l.vx*dt; l.y += l.vy*dt; if(tqCollision(l.x, l.y, TQ.R)){ l.vx *= -1; l.vy *= -1; } });
  J.leurres = J.leurres.filter(function(l){ if(l.vie<=0){ for(var i=0;i<10;i++) J.parts.push({x:l.x, y:l.y, vx:(Math.random()-0.5)*160, vy:(Math.random()-0.5)*160, vie:0.6, max:0.6, t:4, col:"#3a2350"}); return false; } return true; });
  J.instinct = Math.max(0, J.instinct-dt);
  J.garg = J.garg.map(function(g){ return Math.max(0, g-dt); });
  J.barils.forEach(function(B){ if(!B.vivant){ B.retour -= dt; if(B.retour<=0 && Math.hypot(J.p.b.x-B.x, J.p.b.y-B.y)>60 && Math.hypot(J.p.v.x-B.x, J.p.v.y-B.y)>60){ B.vivant = true; } } });
  J.explosions = J.explosions.filter(function(x){ x.t += dt; return x.t<0.6; });
  if(!J.fiole){ J.fioleT -= dt; if(J.fioleT<=0){ for(var essai=0;essai<30;essai++){ var fx = 80+Math.random()*840, fy = 80+Math.random()*440; if(!tqCollision(fx, fy, 22) && Math.hypot(fx-J.p.b.x, fy-J.p.b.y)>150 && Math.hypot(fx-J.p.v.x, fy-J.p.v.y)>150){ J.fiole = {x:fx, y:fy}; bip(1800, 0.1, 0.04); break; } } J.fioleT = 3; } }
  else ["b","v"].forEach(function(s){
    var c = J.p[s]; if(!J.fiole || Math.hypot(c.x-J.fiole.x, c.y-J.fiole.y)>26) return;
    c.cd = {}; J.fiole = null; J.fioleT = 9;
    J.textes.push({x:c.x, y:c.y-30, txt:"POUVOIRS RECHARGÉS", col:"#ff4d6d", vie:1.2});
    bip(1200, 0.1, 0.06); plus_tard(function(){ bip(1600, 0.15, 0.06); }, 90); diffuser();
  });
  J.textes.forEach(function(tx){ tx.vie -= dt; tx.y -= 30*dt; }); J.textes = J.textes.filter(function(tx){ return tx.vie>0; });
  /* tension : proximité */
  var K = J.p.b, E = J.p.v, d = Math.hypot(K.x-E.x, K.y-E.y);
  var proche = d<170;
  if(proche!==J.proche){ J.proche = proche; diffuser(); }
  /* pouvoirs prêts ? (on prévient les téléphones quand ça change) */
  var pret = tqEtatPouvoirs(), cle = JSON.stringify(pret);
  if(cle!==J.pretCle){ J.pretCle = cle; diffuser(); }
  /* capture */
  if(d<TQ.PRISE && E.brume<=0){
    J.phase = "fin"; J.gagnant = "b"; J.capT = 0; J.capX = E.x; J.capY = E.y;
    for(var i=0;i<60;i++) J.parts.push({x:E.x, y:E.y, vx:(Math.random()-0.5)*300, vy:(Math.random()-0.5)*300, vie:0.9, max:0.9, t:3+Math.random()*4, col:Math.random()<.6 ? "#b3001b" : "#ff4d6d"});
    boum(); J.msg = "CAPTURÉE !"; J.sous = "Kendrick a mordu Emilia"; tqFinManche("b"); return;
  }
  if(J.reste<=0){ J.phase = "fin"; J.gagnant = "v"; J.msg = "ÉCHAPPÉE !"; J.sous = "Emilia a survécu à la traque"; bip(880,0.15,0.07); plus_tard(function(){ bip(1320,0.3,0.07); },150); tqFinManche("v"); }
}
function tqExplosion(B){
  var J = S.jeu; B.vivant = false; B.retour = 12;
  J.explosions.push({x:B.x, y:B.y, t:0});
  for(var i=0;i<50;i++){ var an = Math.random()*Math.PI*2, v = 80+Math.random()*320; J.parts.push({x:B.x, y:B.y, vx:Math.cos(an)*v, vy:Math.sin(an)*v, vie:0.7, max:0.7, t:3+Math.random()*4, col:["#e8fbff","#9fd8ff","#ffe8a8","#ffffff"][i%4]}); }
  boum();
  ["b","v"].forEach(function(s){
    var c = J.p[s], dx = c.x-B.x, dy = c.y-B.y, d = Math.hypot(dx, dy) || 1;
    if(d>110) return;
    var f = 260 + 380*(1-d/110); c.vx = dx/d*f; c.vy = dy/d*f; c.knock = 0.4;
    if(s==="b"){ c.stun = 1.7; c.ruee = 0; J.textes.push({x:c.x, y:c.y-34, txt:"BRÛLÉ PAR L'EAU BÉNITE !", col:"#9fd8ff", vie:1.4}); }
  });
  diffuser();
}
function tqFinManche(g){
  var J = S.jeu; J.wins[g]++; J.leurres = []; diffuser();
  plus_tard(function(){
    if(J.wins[g]>=2){
      J.msg = TQ_NOMS[g]+" gagne la traque !"; J.sous = J.wins.b+" – "+J.wins.v; diffuser();
      plus_tard(function(){
        if(g==="b") finManche("v", "Kendrick a capturé Emilia ("+J.wins.b+"-"+J.wins.v+")");
        else finManche("b", "Emilia a échappé à Kendrick ("+J.wins.v+"-"+J.wins.b+")");
      }, 2600);
    } else { J.manche++; tqManche(); }
  }, 3200);
}
function tqEtatPouvoirs(){
  var J = S.jeu, out = {};
  ["b","v"].forEach(function(s){ var c = J.p[s]; out[s] = TQ_POUVOIRS[s].map(function(p){ return p.unique ? !c.utilise[p.id] : !(c.cd[p.id]>0); }); });
  return out;
}
function pouvoirTraque(s, id){
  var J = S.jeu; if(!J || J.id!=="traque" || J.phase!=="chasse") return;
  var c = J.p[s], o = J.p[autre(s)], P = null;
  TQ_POUVOIRS[s].forEach(function(p){ if(p.id===id) P = p; }); if(!P || c.fige>0 || c.stun>0) return;
  if(P.unique){ if(c.utilise[id]) return; c.utilise[id] = true; } else { if(c.cd[id]>0) return; c.cd[id] = P.cd; }
  if(id==="ruee"){ c.ruee = 0.8; bip(180, 0.25, 0.07); }
  else if(id==="instinct"){ J.instinct = 2.2; bip(1400, 0.3, 0.05); }
  else if(id==="hurlement"){ o.ralenti = 2; bip(140, 0.8, 0.09); J.onde = {x:c.x, y:c.y, t:0, col:"#2fa8ff"}; }
  else if(id==="brume"){ c.brume = 2; bip(500, 0.3, 0.05); for(var i=0;i<30;i++) J.parts.push({x:c.x, y:c.y, vx:(Math.random()-0.5)*90, vy:(Math.random()-0.5)*90, vie:0.9, max:0.9, t:8, col:"rgba(200,180,255,.5)"}); }
  else if(id==="nuee"){
    var vx = c.vx, vy = c.vy, n = Math.hypot(vx, vy); if(n<40){ vx = Math.cos(c.a)*TQ.VE; vy = Math.sin(c.a)*TQ.VE; }
    J.leurres.push({x:c.x, y:c.y, vx:-vy*0.9+vx*0.4, vy:vx*0.9+vy*0.4, a:c.a, vie:3});
    for(var i2=0;i2<16;i2++) J.parts.push({x:c.x, y:c.y, vx:(Math.random()-0.5)*200, vy:(Math.random()-0.5)*200, vie:0.5, max:0.5, t:5, col:"#2a1838"});
    bip(2000, 0.08, 0.04); bip(2400, 0.08, 0.04);
  }
  else if(id==="charme"){ o.fige = 1.5; bip(990, 0.4, 0.06); J.onde = {x:c.x, y:c.y, t:0, col:"#ff6ad5"}; }
  diffuser();
}
/* ---------- Dessin ---------- */
function tqDessinerDecor(ctx, now){
  var t = now/1000;
  TQ_DECOR.forEach(function(d){
    var ty = d[0];
    ctx.save();
    if(ty==="haie"){
      ctx.fillStyle = "#0f2418"; ctx.fillRect(d[1], d[2], d[3], d[4]);
      ctx.fillStyle = "#17361f";
      for(var x=d[1]+6;x<d[1]+d[3];x+=12) for(var y=d[2]+6;y<d[2]+d[4];y+=12){ ctx.beginPath(); ctx.arc(x+(y%7), y, 7, 0, Math.PI*2); ctx.fill(); }
      ctx.strokeStyle = "rgba(0,0,0,.5)"; ctx.lineWidth = 2; ctx.strokeRect(d[1], d[2], d[3], d[4]);
    } else if(ty==="tombe"){
      ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.fillRect(d[1]+4, d[2]+5, d[3], d[4]);
      ctx.fillStyle = "#5a5870"; ctx.beginPath(); ctx.moveTo(d[1], d[2]+d[4]); ctx.lineTo(d[1], d[2]+10); ctx.arc(d[1]+d[3]/2, d[2]+10, d[3]/2, Math.PI, 0); ctx.lineTo(d[1]+d[3], d[2]+d[4]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#2f2d40"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(d[1]+d[3]/2, d[2]+8); ctx.lineTo(d[1]+d[3]/2, d[2]+24); ctx.moveTo(d[1]+d[3]/2-6, d[2]+14); ctx.lineTo(d[1]+d[3]/2+6, d[2]+14); ctx.stroke();
    } else if(ty==="fontaine"){
      ctx.fillStyle = "#3d3a52"; ctx.beginPath(); ctx.arc(d[1], d[2], d[3], 0, Math.PI*2); ctx.fill();
      var gw = ctx.createRadialGradient(d[1], d[2], 4, d[1], d[2], d[3]-8); gw.addColorStop(0,"#5a1a2a"); gw.addColorStop(1,"#2a0a14");
      ctx.fillStyle = gw; ctx.beginPath(); ctx.arc(d[1], d[2], d[3]-8, 0, Math.PI*2); ctx.fill();   /* bassin de sang */
      ctx.strokeStyle = "rgba(255,120,140,.25)"; ctx.lineWidth = 1.5;
      for(var k=0;k<3;k++){ var rr = ((t*18 + k*16) % 44)+4; ctx.globalAlpha = 1-rr/48; ctx.beginPath(); ctx.arc(d[1], d[2], rr, 0, Math.PI*2); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.fillStyle = "#6a6680"; ctx.beginPath(); ctx.arc(d[1], d[2], 9, 0, Math.PI*2); ctx.fill();
    } else if(ty==="cercueil"){
      ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.translate(4,5);
      tqCercueil(ctx, d); ctx.fill(); ctx.translate(-4,-5);
      ctx.fillStyle = "#3b2216"; tqCercueil(ctx, d); ctx.fill();
      ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = "#b08a4a"; ctx.beginPath(); ctx.moveTo(d[1]+d[3]*0.3, d[2]+d[4]/2); ctx.lineTo(d[1]+d[3]*0.55, d[2]+d[4]/2); ctx.moveTo(d[1]+d[3]*0.42, d[2]+6); ctx.lineTo(d[1]+d[3]*0.42, d[2]+d[4]-6); ctx.stroke();
    } else if(ty==="colonne"){
      ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.beginPath(); ctx.arc(d[1]+4, d[2]+5, d[3], 0, Math.PI*2); ctx.fill();
      var gc = ctx.createRadialGradient(d[1]-5, d[2]-5, 2, d[1], d[2], d[3]); gc.addColorStop(0,"#8a879e"); gc.addColorStop(1,"#3c3a50");
      ctx.fillStyle = gc; ctx.beginPath(); ctx.arc(d[1], d[2], d[3], 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#ff9a3c"; ctx.shadowColor = "#ff9a3c"; ctx.shadowBlur = 20 + Math.sin(t*9)*5; ctx.beginPath(); ctx.arc(d[1], d[2], 4, 0, Math.PI*2); ctx.fill(); /* bougie */
    } else if(ty==="arbre"){
      ctx.strokeStyle = "#1d1626"; ctx.lineCap = "round";
      for(var b=0;b<6;b++){ var an = b*1.05+0.3; ctx.lineWidth = 6-b*0.5; ctx.beginPath(); ctx.moveTo(d[1], d[2]); ctx.quadraticCurveTo(d[1]+Math.cos(an+0.4)*d[3], d[2]+Math.sin(an+0.4)*d[3], d[1]+Math.cos(an)*d[3]*2.2, d[2]+Math.sin(an)*d[3]*2.2); ctx.stroke(); }
      ctx.fillStyle = "#2a2033"; ctx.beginPath(); ctx.arc(d[1], d[2], d[3]*0.6, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  });
}
function tqDessinerMecaniques(ctx, now){
  var J = S.jeu, t = now/1000;
  TQ_RONCES.forEach(function(r){
    ctx.fillStyle = "rgba(30,55,22,.75)"; ctx.fillRect(r[0], r[1], r[2], r[3]);
    ctx.strokeStyle = "#4f8a35"; ctx.lineWidth = 1.6;
    for(var i=0;i<14;i++){ var x = r[0]+((i*37)%r[2]), y = r[1]+((i*23)%r[3]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+6, y-7); ctx.moveTo(x+3, y-3); ctx.lineTo(x+9, y-1); ctx.stroke(); }
    ctx.strokeStyle = "rgba(79,138,53,.6)"; ctx.setLineDash([4,4]); ctx.strokeRect(r[0], r[1], r[2], r[3]); ctx.setLineDash([]);
  });
  TQ_CRYPTES.forEach(function(cr){
    ctx.fillStyle = "#14101c"; ctx.beginPath(); ctx.arc(cr.x, cr.y, 24, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = cr.col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cr.x, cr.y, 24, 0, Math.PI*2); ctx.stroke();
    for(var k=0;k<3;k++){ ctx.globalAlpha = 0.6-k*0.15; ctx.beginPath(); ctx.arc(cr.x, cr.y, 18-k*5, t*3+k*2, t*3+k*2+Math.PI*1.3); ctx.stroke(); }
    ctx.globalAlpha = 1;
  });
  TQ_GARGOUILLES.forEach(function(g, gi){
    var f = J.garg ? J.garg[gi] : 0, r = 20 + f*14;
    ctx.fillStyle = "rgba(0,0,0,.4)"; ctx.beginPath(); ctx.arc(g[0]+3, g[1]+4, r, 0, Math.PI*2); ctx.fill();
    var gg = ctx.createRadialGradient(g[0]-6, g[1]-6, 2, g[0], g[1], r); gg.addColorStop(0,"#7b7891"); gg.addColorStop(1,"#2f2d42");
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(g[0], g[1], r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "rgba(95,242,208,"+Math.min(1, 0.45+0.3*Math.sin(t*4+gi)+f*2)+")"; ctx.lineWidth = 2.5; ctx.shadowColor = "#5ff2d0"; ctx.shadowBlur = 12+f*40;
    ctx.beginPath(); ctx.arc(g[0], g[1], r-4, 0, Math.PI*2); ctx.stroke();
    for(var k=0;k<6;k++){ var an = k*Math.PI/3 + t*0.6; ctx.beginPath(); ctx.moveTo(g[0]+Math.cos(an)*(r-9), g[1]+Math.sin(an)*(r-9)); ctx.lineTo(g[0]+Math.cos(an)*(r-14), g[1]+Math.sin(an)*(r-14)); ctx.stroke(); }
    ctx.shadowBlur = 0;
  });
  (J.barils||[]).forEach(function(B){
    if(!B.vivant){ ctx.strokeStyle = "rgba(159,216,255,.25)"; ctx.lineWidth = 1.5; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.arc(B.x, B.y, 16, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]); return; }
    var pul = 0.5+0.5*Math.sin(t*5+B.x);
    var gl = ctx.createRadialGradient(B.x, B.y, 6, B.x, B.y, 34); gl.addColorStop(0,"rgba(159,216,255,"+(0.25+pul*0.2)+")"); gl.addColorStop(1,"rgba(159,216,255,0)");
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(B.x, B.y, 34, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#5a3a22"; ctx.beginPath(); ctx.arc(B.x, B.y, 16, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#2b1a10"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(B.x, B.y, 12, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = "#9a9aa8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(B.x, B.y, 16, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = "#e8fbff"; ctx.lineWidth = 2.6; ctx.shadowColor = "#9fd8ff"; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(B.x, B.y-7); ctx.lineTo(B.x, B.y+7); ctx.moveTo(B.x-5, B.y-2); ctx.lineTo(B.x+5, B.y-2); ctx.stroke(); ctx.shadowBlur = 0;
  });
  (J.explosions||[]).forEach(function(x){ var k = x.t/0.6; ctx.strokeStyle = "rgba(232,251,255,"+(1-k)+")"; ctx.lineWidth = 6*(1-k)+1; ctx.beginPath(); ctx.arc(x.x, x.y, 20+k*100, 0, Math.PI*2); ctx.stroke(); ctx.fillStyle = "rgba(200,235,255,"+(0.35*(1-k))+")"; ctx.beginPath(); ctx.arc(x.x, x.y, 20+k*90, 0, Math.PI*2); ctx.fill(); });
  if(J.fiole){
    var fx = J.fiole.x, fy = J.fiole.y + Math.sin(t*3)*3;
    ctx.fillStyle = "rgba(255,40,70,.25)"; ctx.beginPath(); ctx.arc(fx, fy, 22+Math.sin(t*6)*3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#b3001b"; ctx.shadowColor = "#ff2b3d"; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.moveTo(fx-3, fy-12); ctx.lineTo(fx+3, fy-12); ctx.lineTo(fx+3, fy-5); ctx.quadraticCurveTo(fx+10, fy, fx+8, fy+8); ctx.quadraticCurveTo(fx, fy+13, fx-8, fy+8); ctx.quadraticCurveTo(fx-10, fy, fx-3, fy-5); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = "#c9b38a"; ctx.fillRect(fx-3.5, fy-15, 7, 4);
  }
}
function tqCercueil(ctx, d){
  var x = d[1], y = d[2], w = d[3], h = d[4];
  ctx.beginPath(); ctx.moveTo(x, y+h*0.3); ctx.lineTo(x+w*0.25, y); ctx.lineTo(x+w, y+h*0.15); ctx.lineTo(x+w, y+h*0.85); ctx.lineTo(x+w*0.25, y+h); ctx.lineTo(x, y+h*0.7); ctx.closePath();
}
/* Vampire vu de dessus : cape en goutte orientée dans la direction, tête, cheveux, yeux lumineux */
function tqDessinerVampire(ctx, c, now, alpha, leurre){
  var t = now/1000, s = c.s || "v", K = s==="b";
  var col = K ? "#2fa8ff" : "#c06bff", vit = Math.hypot(c.vx||0, c.vy||0), ond = Math.sin(t*14)*Math.min(1, vit/120);
  ctx.save(); ctx.globalAlpha = alpha;
  /* traînée */
  if(c.trace && !leurre){ c.trace.forEach(function(p, i){ var k = i/c.trace.length; ctx.fillStyle = col; ctx.globalAlpha = alpha*k*0.25; ctx.beginPath(); ctx.arc(p.x, p.y, TQ.R*k, 0, Math.PI*2); ctx.fill(); }); ctx.globalAlpha = alpha; }
  ctx.translate(c.x, c.y); ctx.rotate(c.a); ctx.scale(1.35, 1.35);
  /* ombre */
  ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.beginPath(); ctx.ellipse(-4, 4, 24, 16, 0, 0, Math.PI*2); ctx.fill();
  if(K){
    /* cape noire à doublure bleue, épaules larges */
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(6,-17); ctx.quadraticCurveTo(-18,-22-ond*3,-34,-14+ond*4); ctx.lineTo(-30,0); ctx.lineTo(-34,14-ond*4); ctx.quadraticCurveTo(-18,22+ond*3,6,17); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#0b0b14"; ctx.beginPath(); ctx.moveTo(6,-15); ctx.quadraticCurveTo(-16,-19-ond*3,-30,-12+ond*4); ctx.lineTo(-26,0); ctx.lineTo(-30,12-ond*4); ctx.quadraticCurveTo(-16,19+ond*3,6,15); ctx.closePath(); ctx.fill();
    /* col relevé */
    ctx.strokeStyle = "#7a0f1f"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0,0,13,Math.PI*0.6,Math.PI*1.4); ctx.stroke();
    /* tête, cheveux courts plaqués */
    ctx.fillStyle = "#d9c9c4"; ctx.beginPath(); ctx.arc(2,0,9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#111018"; ctx.beginPath(); ctx.arc(-1,0,9.5,Math.PI*0.45,Math.PI*1.55); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-3,-9); ctx.quadraticCurveTo(6,-8,7,0); ctx.quadraticCurveTo(6,8,-3,9); ctx.closePath(); ctx.fill();
  } else {
    /* robe violette qui flotte + longs cheveux qui traînent */
    ctx.fillStyle = "#3a1458"; ctx.beginPath(); ctx.moveTo(6,-12); ctx.quadraticCurveTo(-14,-20-ond*4,-30,-16+ond*5); ctx.quadraticCurveTo(-24,0,-30,16-ond*5); ctx.quadraticCurveTo(-14,20+ond*4,6,12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col; ctx.globalAlpha = alpha*0.8; ctx.beginPath(); ctx.moveTo(4,-10); ctx.quadraticCurveTo(-10,-14-ond*3,-22,-12+ond*4); ctx.quadraticCurveTo(-18,0,-22,12-ond*4); ctx.quadraticCurveTo(-10,14+ond*3,4,10); ctx.closePath(); ctx.fill(); ctx.globalAlpha = alpha;
    ctx.fillStyle = "#120a1e";
    ctx.beginPath(); ctx.moveTo(4,-8); ctx.bezierCurveTo(-10,-12,-22,-6-ond*5,-36,-4+ond*6); ctx.bezierCurveTo(-24,2+ond*4,-12,10,4,8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e8cfc4"; ctx.beginPath(); ctx.arc(3,0,7.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#120a1e"; ctx.beginPath(); ctx.arc(1,0,8,Math.PI*0.5,Math.PI*1.5); ctx.fill();
    /* lèvres rouges */
    ctx.fillStyle = "#c2304f"; ctx.beginPath(); ctx.arc(9.5,0,1.4,0,Math.PI*2); ctx.fill();
  }
  /* yeux lumineux */
  ctx.fillStyle = K ? "#ff2b3d" : "#ff6ad5"; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(8,-3.5,1.8,0,Math.PI*2); ctx.arc(8,3.5,1.8,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.restore();
}
function dessinerTraque(ctx, cv, now){
  var J = S.jeu; if(!J || J.id!=="traque") return;
  var W = cv.width, H = cv.height, sc = Math.min(W/1000, H/600), ox = (W-1000*sc)/2, oy = (H-600*sc)/2, t = now/1000;
  ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle = "#06060c"; ctx.fillRect(0,0,W,H);
  ctx.setTransform(sc,0,0,sc,ox,oy);
  /* sol : herbe sombre + allées */
  var gs = ctx.createRadialGradient(500,300,50,500,300,620); gs.addColorStop(0,"#1a2a22"); gs.addColorStop(1,"#0a120e");
  ctx.fillStyle = gs; ctx.fillRect(0,0,1000,600);
  ctx.fillStyle = "rgba(120,110,140,.12)";
  ctx.fillRect(0,282,1000,36); ctx.fillRect(482,0,36,600);
  ctx.beginPath(); ctx.arc(500,300,90,0,Math.PI*2); ctx.fill();
  tqDessinerDecor(ctx, now);
  tqDessinerMecaniques(ctx, now);
  /* leurres */
  J.leurres.forEach(function(l){
    var rev = J.instinct>0;
    if(rev){ ctx.fillStyle = "#2a1838"; for(var i=0;i<6;i++){ var a = t*8+i; ctx.beginPath(); ctx.ellipse(l.x+Math.cos(a)*12, l.y+Math.sin(a*1.3)*10, 6, 3, a, 0, Math.PI*2); ctx.fill(); } }
    else tqDessinerVampire(ctx, {s:"v", x:l.x, y:l.y, vx:l.vx, vy:l.vy, a:Math.atan2(l.vy, l.vx)}, now, Math.min(1, l.vie), true);
  });
  /* vampires */
  var K = J.p.b, E = J.p.v;
  tqDessinerVampire(ctx, E, now, E.brume>0 ? 0.13 : 1);
  if(J.instinct>0){ ctx.strokeStyle = "rgba(255,60,80,"+(0.5+0.4*Math.sin(t*12))+")"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(E.x, E.y, 30, 0, Math.PI*2); ctx.stroke(); }
  if(!(J.phase==="fin" && J.gagnant==="b" && Math.floor(t*10)%2)) tqDessinerVampire(ctx, K, now, 1);
  if(K.fige>0){ ctx.fillStyle = "#ff6ad5"; ctx.font = "800 18px Sora, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("♥ charmé ♥", K.x, K.y-34); }
  ["b","v"].forEach(function(s){ var c = J.p[s]; if(c.stun>0){ ctx.fillStyle = "#ffe14d"; for(var i=0;i<3;i++){ var an = t*6+i*2.1; ctx.font = "16px serif"; ctx.textAlign = "center"; ctx.fillText("★", c.x+Math.cos(an)*22, c.y-28+Math.sin(an)*6); } } });
  (J.textes||[]).forEach(function(tx){ ctx.globalAlpha = Math.min(1, tx.vie*2); ctx.font = "800 17px Sora, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = tx.col; ctx.shadowColor = "#000"; ctx.shadowBlur = 8; ctx.fillText(tx.txt, tx.x, tx.y); ctx.shadowBlur = 0; });
  ctx.globalAlpha = 1;
  if(E.ralenti>0){ ctx.fillStyle = "#2fa8ff"; ctx.font = "800 16px Sora, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("terrifiée", E.x, E.y-32); }
  if(J.onde){ J.onde.t += 1/60; var rr = J.onde.t*700; ctx.strokeStyle = J.onde.col; ctx.globalAlpha = Math.max(0, 1-J.onde.t*1.6); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(J.onde.x, J.onde.y, rr, 0, Math.PI*2); ctx.stroke(); ctx.globalAlpha = 1; if(J.onde.t>0.7) J.onde = null; }
  J.parts.forEach(function(p){ var k = Math.max(0, p.vie/p.max); ctx.globalAlpha = k; ctx.fillStyle = p.col; ctx.fillRect(p.x-p.t/2, p.y-p.t/2, p.t, p.t); });
  ctx.globalAlpha = 1;
  /* brouillard qui dérive */
  J.brouillard.forEach(function(b){ var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r); g.addColorStop(0,"rgba(180,170,210,.07)"); g.addColorStop(1,"rgba(180,170,210,0)"); ctx.fillStyle = g; ctx.fillRect(b.x-b.r, b.y-b.r, b.r*2, b.r*2); });
  ctx.setTransform(1,0,0,1,0,0);
  /* vignette nocturne + rouge quand il est proche */
  var d = Math.hypot(K.x-E.x, K.y-E.y), danger = J.phase==="chasse" ? Math.max(0, 1-d/220) : 0;
  var vg = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.35, W/2, H/2, Math.max(W,H)*0.75);
  vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1, danger>0 ? "rgba(120,0,20,"+(0.4+danger*0.45*(0.7+0.3*Math.sin(t*10)))+")" : "rgba(0,0,0,.65)");
  ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);
  /* HUD */
  ctx.setTransform(sc,0,0,sc,ox,oy);
  ctx.textBaseline = "alphabetic";
  [["b",40,"left"],["v",960,"right"]].forEach(function(x){
    var s = x[0], c = J.p[s];
    ctx.textAlign = x[2]; ctx.font = "800 24px Sora, system-ui, sans-serif"; ctx.fillStyle = s==="b" ? "#2fa8ff" : "#c06bff";
    ctx.fillText(TQ_NOMS[s], x[1], 96);
    ctx.font = "600 13px Sora, system-ui, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.fillText((s==="b" ? "vampire alpha · " : "vampire beta · ")+(S.noms[s]||""), x[1], 114);
    var ic = TQ_POUVOIRS[s].map(function(p){ var ok = p.unique ? !c.utilise[p.id] : !(c.cd[p.id]>0); return (ok ? "" : "·")+p.icone; }).join("  ");
    ctx.font = "18px serif"; ctx.fillText(ic, x[1], 138);
    for(var k=0;k<2;k++){ ctx.fillStyle = k<J.wins[s] ? "#ff2b3d" : "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.arc(s==="b" ? x[1]+8+k*20 : x[1]-8-k*20, 152, 7, 0, Math.PI*2); ctx.fill(); }
  });
  ctx.textAlign = "center"; ctx.font = "800 34px Sora, system-ui, sans-serif"; ctx.fillStyle = J.reste<10 && J.phase==="chasse" ? "#ff4d6d" : "rgba(255,255,255,.85)";
  if(J.phase==="chasse") ctx.fillText(String(Math.ceil(J.reste)), 500, 104);
  ctx.font = "600 14px Sora, system-ui, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillText("MANCHE "+J.manche, 500, 126);
  if(J.msg){
    ctx.textBaseline = "middle";
    ctx.font = "900 72px Sora, system-ui, sans-serif"; ctx.fillStyle = J.msg==="CAPTURÉE !" ? "#ff2b3d" : "#ffffff"; ctx.shadowColor = "rgba(0,0,0,.95)"; ctx.shadowBlur = 26;
    ctx.fillText(J.msg, 500, 270);
    if(J.sous){ ctx.font = "700 28px Sora, system-ui, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.88)"; ctx.fillText(J.sous, 500, 334); }
    ctx.shadowBlur = 0;
  }
  if(J.phase==="intro"){
    ctx.fillStyle = "rgba(5,5,12,.8)"; ctx.fillRect(150, 386, 700, 150);
    ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.strokeRect(150, 386, 700, 150);
    ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.font = "600 17px Sora, system-ui, sans-serif";
    [["#9fd8ff","✚ Baril d'eau bénite : explose, étourdit Kendrick et repousse tout le monde"],
     ["#5ff2d0","◎ Gargouille : rebondit violemment, pour les deux"],
     ["#ff4d6d","↺ Crypte : téléporte à la crypte de même couleur, à l'autre bout"],
     ["#7fbf5a","≋ Ronces : ralentissent"],
     ["#ff2b3d","♦ Fiole de sang : recharge tous tes pouvoirs"]].forEach(function(l, i){ ctx.fillStyle = l[0]; ctx.fillText(l[1], 176, 410+i*26); });
  }
  ctx.setTransform(1,0,0,1,0,0);
}
/* Clavier : Kendrick ZQSD (ou WASD) + 1 2 3 ; Emilia flèches + 8 9 0 */
var TQ_TOUCHES = {z:["b","h"], w:["b","h"], s:["b","b"], q:["b","g"], a:["b","g"], d:["b","d"],
  arrowup:["v","h"], arrowdown:["v","b"], arrowleft:["v","g"], arrowright:["v","d"]};
var TQ_TOUCHES_P = {"1":["b","ruee"], "2":["b","instinct"], "3":["b","hurlement"], "8":["v","brume"], "9":["v","nuee"], "0":["v","charme"]};
document.addEventListener("keydown", function(e){
  if(estManette || S.ecran!=="traque") return;
  var k = String(e.key).toLowerCase(), t = TQ_TOUCHES[k], p = TQ_TOUCHES_P[k];
  if(t){ e.preventDefault(); e.stopImmediatePropagation(); JOYK[t[0]][t[1]] = true; }
  else if(p){ e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat) pouvoirTraque(p[0], p[1]); }
}, true);
document.addEventListener("keyup", function(e){
  if(estManette) return;
  var t = TQ_TOUCHES[String(e.key).toLowerCase()]; if(t) JOYK[t[0]][t[1]] = false;
}, true);
/* ---------- Téléphone : joystick + pouvoirs ---------- */
var tqJoyEnvoi = 0, tqJoyDernier = {x:0, y:0}, tqProche = false;
function envoyerJoy(x, y, force){
  var now = Date.now();
  if(!force && now-tqJoyEnvoi<60 && Math.hypot(x-tqJoyDernier.x, y-tqJoyDernier.y)<0.5) return;
  tqJoyEnvoi = now; tqJoyDernier = {x:x, y:y};
  if(room) room.presence({joy:{x:Math.round(x*100)/100, y:Math.round(y*100)/100}}).catch(function(){});
}
(function(){
  var zone = $("mTqJoy"), bouton = $("mTqBouton"), actif = null;
  if(!zone) return;
  function maj(e){
    var r = zone.getBoundingClientRect(), cx = r.left+r.width/2, cy = r.top+r.height/2, R = r.width/2;
    var dx = (e.clientX-cx)/R, dy = (e.clientY-cy)/R, n = Math.hypot(dx, dy);
    if(n>1){ dx /= n; dy /= n; }
    if(n<0.12){ dx = 0; dy = 0; }
    bouton.style.transform = "translate("+(dx*R*0.6)+"px,"+(dy*R*0.6)+"px)";
    envoyerJoy(dx, dy, false);
  }
  zone.addEventListener("pointerdown", function(e){ e.preventDefault(); actif = e.pointerId; try{ zone.setPointerCapture(e.pointerId); }catch(x){} maj(e); });
  zone.addEventListener("pointermove", function(e){ if(actif===e.pointerId) maj(e); });
  ["pointerup","pointercancel"].forEach(function(t){ zone.addEventListener(t, function(e){ if(actif!==e.pointerId) return; actif = null; bouton.style.transform = ""; envoyerJoy(0, 0, true); }); });
})();
function rendreTraqueManette(z, noms){
  mMontrer("m-traque");
  if(!z) return;
  var K = COTE==="b";
  $("mTqRole").textContent = K ? "Tu es Kendrick 🧛 · attrape-la !" : "Tu es Emilia 🦇 · survis !";
  $("mTqInfo").textContent = "Manche "+z.manche+" · "+z.wins.b+" – "+z.wins.v;
  var box = $("mTqPouvoirs"), pr = (z.pret && z.pret[COTE]) || [], cle = COTE+"|"+pr.join(",");
  if(box.getAttribute("data-k")!==cle){
    box.setAttribute("data-k", cle); box.innerHTML = "";
    TQ_POUVOIRS[COTE].forEach(function(p, i){
      var b = el("button","tq-btn"+(p.unique ? " unique" : "")); b.disabled = pr[i]===false;
      b.appendChild(el("span","tq-ic",p.icone)); b.appendChild(el("b",null,p.nom));
      b.appendChild(el("small",null, p.unique ? "1 fois" : (pr[i]===false ? "recharge…" : "prêt")));
      b.addEventListener("pointerdown", function(e){ e.preventDefault(); if(b.disabled) return; envoyer("traque",{side:COTE, p:p.id}); b.disabled = true; });
      box.appendChild(b);
    });
  }
  if(z.proche && !tqProche && navigator.vibrate) try{ navigator.vibrate(K ? [40] : [80,60,80]); }catch(e){}
  tqProche = !!z.proche;
  $("m-traque").classList.toggle("danger", !!z.proche);
}
