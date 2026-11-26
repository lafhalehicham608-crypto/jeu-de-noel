/* Le Jeu de Noël · Mini-jeu : Duel de mages (éléments feu / glace / foudre, sorcière illustrée) */
"use strict";
/* ================= Mini-jeu 10 : Duel de mages =================
   Combat de profil, 2 rounds gagnants. À chaque round, chaque mage reçoit un élément au hasard.
   Pour ajouter un élément : une nouvelle entrée dans ELEMENTS (couleurs, sort, effet, ultime),
   puis ses réactions dans REACTIONS. Le tirage l'inclut automatiquement. */
var ELEMENTS = {
  feu:   {nom:"Feu",   emoji:"🔥", col:"#ff6a2b", col2:"#ffd166", vit:640, deg:11, cd:0.55, rayon:13, effet:"brule", ulti:"meteores", ultiNom:"Pluie de météores"},
  glace: {nom:"Glace", emoji:"❄️", col:"#6fd8ff", col2:"#e8fbff", vit:540, deg:8,  cd:0.45, rayon:11, effet:"ralenti", ulti:"blizzard", ultiNom:"Blizzard"},
  foudre:{nom:"Foudre", emoji:"⚡", col:"#ffe14d", col2:"#b9f6ff", vit:950, deg:7,  cd:0.33, rayon:10, effet:"choc", ulti:"tempete", ultiNom:"Tempête", skin:"sorciere"}
};
/* Réaction quand un sort de l'élément A touche une cible sous l'effet B */
var REACTIONS = {
  "feu>gele":    function(c, deg){ c.eff.gele = 0; c.eff.stacks = 0; texteFlottant(c, "FONTE ! ×1,5", "#ffd166"); return deg*1.5; },
  "glace>brule": function(c, deg){ c.eff.brule = 0; texteFlottant(c, "ÉTEINT", "#e8fbff"); return deg; },
  "foudre>gele": function(c, deg){ c.eff.gele = 0; c.eff.stacks = 0; texteFlottant(c, "COURT-CIRCUIT ×1,6", "#ffe14d"); return deg*1.6; }
};
var EFFETS = {
  choc:    function(c){ c.eff.choc = 0.45; },
  brule:   function(c){ c.eff.brule = 3; },
  ralenti: function(c){ c.eff.ralenti = 2; c.eff.stacks = (c.eff.stacks||0)+1; if(c.eff.stacks>=3){ c.eff.stacks = 0; c.eff.gele = 1.5; texteFlottant(c, "GELÉ !", "#6fd8ff"); bip(1900, 0.2, 0.06); } }
};
var MG = {SOL:500, PV:100, DUREE:60, VIT:270, SAUT:680, GRAV:1700, BOUCLIER:0.8, CD_BOUCLIER:2.2, GAIN_EN_COUP:14, GAIN_EN_SUBI:6};
var MG_TOUCHES = {q:["b","g"], a:["b","g"], d:["b","d"], z:["b","saut"], w:["b","saut"], s:["b","sort"], e:["b","bouclier"], r:["b","ulti"],
  arrowleft:["v","g"], arrowright:["v","d"], arrowup:["v","saut"], arrowdown:["v","sort"], l:["v","sort"], k:["v","bouclier"], m:["v","ulti"]};
function nouveauMage(s){
  return {s:s, x:s==="b" ? 230 : 770, y:MG.SOL, vx:0, vy:0, face:s==="b" ? 1 : -1, pv:MG.PV, en:0, cd:0, bouclier:0, cdB:0, touche:0, coups:0,
    eff:{brule:0, ralenti:0, gele:0, stacks:0, choc:0}, el:"feu", anim:0};
}
function mages(){
  touches = {}; DIRK = {b:0,v:0};
  S.jeu = {id:"mages", phase:"tirage", round:1, wins:{b:0,v:0}, msg:"", sous:"", sorts:[], parts:[], textes:[], meteores:[], neige:0,
    m:{b:nouveauMage("b"), v:nouveauMage("v")}, t0:0, reste:MG.DUREE, coups:{b:0,v:0}};
  montrer("mages");
  var cv = $("cvMages"), ctx = cv.getContext("2d"), r = Math.min(window.devicePixelRatio||1, 1.5);
  cv.width = Math.max(300, cv.clientWidth*r); cv.height = Math.max(200, cv.clientHeight*r);
  var g0 = gen, last = null;
  nouveauRound();
  function boucle(now){
    if(g0!==gen) return;
    var dt = last===null ? 0 : Math.min(0.05, (now-last)/1000); last = now;
    majMages(dt, now);
    dessinerMages(ctx, cv, now);
    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
}
function nouveauRound(){
  var J = S.jeu, cles = Object.keys(ELEMENTS);
  J.m = {b:nouveauMage("b"), v:nouveauMage("v")};
  J.m.b.el = cles[rnd(cles.length)]; J.m.v.el = cles[rnd(cles.length)];
  if(S.labo && typeof LABO!=="undefined" && ELEMENTS[LABO.el]){ J.m.b.el = LABO.el; J.m.v.el = LABO.el; }
  J.sorts = []; J.meteores = []; J.eclairs = []; J.flashs = []; J.textes = []; J.neige = 0; J.reste = MG.DUREE;
  J.phase = "tirage"; J.msg = "Round "+J.round; J.sous = ""; J.tirageT = 0;
  diffuser();
}
function majMages(dt, now){
  var J = S.jeu; if(!J || J.id!=="mages") return;
  majParticules(dt);
  J.textes = J.textes.filter(function(t){ t.vie -= dt; t.y -= 40*dt; return t.vie>0; });
  if(J.phase==="tirage"){
    J.tirageT += dt;
    var cles = Object.keys(ELEMENTS);
    if(J.tirageT<1.6){ if(Math.floor(J.tirageT*12)!==Math.floor((J.tirageT-dt)*12)){ J.affB = cles[rnd(cles.length)]; J.affV = cles[rnd(cles.length)]; bip(900, 0.03, 0.04); } }
    else { if(J.affB!==J.m.b.el || J.affV!==J.m.v.el){ J.affB = J.m.b.el; J.affV = J.m.v.el; bip(1320, 0.18, 0.07); } }
    J.sous = "";
    if(J.tirageT>3.2){ J.phase = "decompte"; J.dec = 0; J.dernierDec = null; }
    return;
  }
  if(J.phase==="decompte"){
    J.dec += dt;
    var m = J.dec<2.4 ? String(3-Math.floor(J.dec/0.8)) : "COMBAT !";
    if(m!==J.dernierDec){ J.dernierDec = m; J.msg = m; bip(m==="COMBAT !" ? 1320 : 660, 0.16, 0.07); }
    if(J.dec>=2.4){ J.phase = "combat"; J.t0 = now; diffuser(); }
    physMages(dt*0.0); return;
  }
  if(J.phase==="combat"){
    if(J.dec<3.4){ J.dec += dt; if(J.dec>=3.4) J.msg = ""; }
    physMages(dt);
    J.reste = Math.max(0, MG.DUREE - (now-J.t0)/1000);
    var b = J.m.b, v = J.m.v, gagnant = null, detail = "";
    if(b.pv<=0 || v.pv<=0){
      if(b.pv<=0 && v.pv<=0){ finRound(null, "Double K.O. !"); return; }
      gagnant = b.pv<=0 ? "v" : "b"; finRound(gagnant, "K.O. !");
    } else if(J.reste<=0){
      if(Math.round(b.pv)===Math.round(v.pv)) finRound(null, "Temps écoulé, égalité !");
      else finRound(b.pv>v.pv ? "b" : "v", "Temps écoulé !");
    }
    return;
  }
  if(J.phase==="pause") physMages(dt*0.25);
}
function finRound(g, txt){
  var J = S.jeu; J.phase = "pause"; J.gagnantRound = g; J.sorts = []; J.meteores = []; J.eclairs = []; J.msgUlti = null; J.neige = 0;
  J.msg = txt; J.sous = g ? S.noms[g]+" remporte le round" : "Round à rejouer";
  if(g){ J.wins[g]++; plus_tard(function(){ bip(880,0.15,0.07); plus_tard(function(){ bip(1320,0.3,0.07); },150); }, 300); }
  diffuser();
  plus_tard(function(){
    if(g && J.wins[g]>=2){
      J.msg = S.noms[g]+" gagne le duel !"; J.sous = J.wins.b+" – "+J.wins.v; diffuser();
      plus_tard(function(){ finManche(autre(g), S.noms[g]+" a battu "+S.noms[autre(g)]+" en duel de mages ("+Math.max(J.wins.b,J.wins.v)+"-"+Math.min(J.wins.b,J.wins.v)+")"); }, 2600);
    } else { if(g) J.round++; nouveauRound(); }
  }, 2600);
}
function actionMage(s, a){
  var J = S.jeu; if(!J || J.id!=="mages" || J.phase!=="combat") return;
  var c = J.m[s]; if(!c || c.pv<=0 || c.eff.gele>0 || c.eff.choc>0) return;
  var E = ELEMENTS[c.el];
  if(a==="saut"){ if(c.y>=MG.SOL-0.5){ c.vy = -MG.SAUT*(c.eff.ralenti>0 ? 0.8 : 1); bip(500, 0.05, 0.03); } }
  else if(a==="sort"){
    if(c.cd>0 || c.bouclier>0) return;
    c.cd = E.cd*(c.eff.ralenti>0 ? 1.4 : 1); c.anim = E.skin ? 0.32 : 0.25;
    J.sorts.push({s:s, el:c.el, x:c.x+c.face*(E.skin ? 80 : 46), y:c.y-(E.skin ? 130 : 72), vx:c.face*E.vit, vie:2.2, r:E.rayon, t:0});
    bip(c.el==="feu" ? 300 : 1500, 0.06, 0.05);
  }
  else if(a==="bouclier"){ if(c.cdB>0) return; c.bouclier = MG.BOUCLIER; c.cdB = MG.CD_BOUCLIER; bip(700, 0.08, 0.04); diffuser(); }
  else if(a==="ulti"){ if(c.en<100) return; c.en = 0; lancerUlti(s); diffuser(); }
}
function lancerUlti(s){
  var J = S.jeu, c = J.m[s], cible = J.m[autre(s)], E = ELEMENTS[c.el];
  c.ultiT = 1.6;
  texteFlottant(c, E.ultiNom.toUpperCase()+" !", E.col2);
  J.msgUlti = {txt:E.emoji+" "+E.ultiNom, col:E.col, vie:1.6};
  if(E.ulti==="meteores"){
    for(var i=0;i<9;i++) J.meteores.push({s:s, el:c.el, x:cible.x + (Math.random()-0.5)*360, y:-60 - i*70, vy:520+Math.random()*160, vx:(Math.random()-0.5)*60});
    bip(180, 0.6, 0.08);
  } else if(E.ulti==="tempete"){
    for(var e2=0;e2<4;e2++) J.eclairs.push({s:s, el:c.el, t:0.15+e2*0.38});
    bip(90, 0.5, 0.08);
  } else if(E.ulti==="blizzard"){
    J.neige = 2.2;
    if(cible.bouclier>0){ texteFlottant(cible, "BLOQUÉ", "#ffffff"); }
    else { cible.eff.gele = 2; cible.eff.stacks = 0; cible.eff.brule = 0; blesser(cible, 12, s); }
    bip(2200, 0.5, 0.06);
  }
}
function texteFlottant(c, txt, col){ S.jeu.textes.push({x:c.x, y:c.y-150, txt:txt, col:col, vie:1.2}); }
function blesser(c, deg, de){
  var J = S.jeu; if(c.pv<=0) return;
  c.pv = Math.max(0, c.pv - deg); c.touche = 0.25; c.hitT = 0.4; J.coups[c.s] = (J.coups[c.s]||0)+1;
  c.en = Math.min(100, c.en + MG.GAIN_EN_SUBI);
  if(de){ var a = J.m[de]; a.en = Math.min(100, a.en + MG.GAIN_EN_COUP); }
  eclats(c.x, c.y-60, ELEMENTS[de ? J.m[de].el : c.el].col, 14, 220);
  bip(220, 0.12, 0.08);
  if(c.pv<=0){ eclats(c.x, c.y-60, "#ffffff", 60, 380); boum(); }
  diffuser();
}
function toucherMage(c, sort){
  if(c.bouclier>0){ eclats(sort.x, sort.y, "#ffffff", 10, 160); texteFlottant(c, "BLOQUÉ", "#ffffff"); bip(1200, 0.06, 0.05); return; }
  var E = ELEMENTS[sort.el], deg = E.deg;
  ["gele","brule","choc"].forEach(function(etat){ var f = REACTIONS[sort.el+">"+etat]; if(f && c.eff[etat]>0) deg = f(c, deg); });
  blesser(c, deg, sort.s);
  if(c.pv>0 && EFFETS[E.effet]) EFFETS[E.effet](c);
}
function physMages(dt){
  var J = S.jeu; if(dt<=0) return;
  ["b","v"].forEach(function(s){
    var c = J.m[s], o = J.m[autre(s)];
    c.cd = Math.max(0, c.cd-dt); c.cdB = Math.max(0, c.cdB-dt); c.bouclier = Math.max(0, c.bouclier-dt);
    c.touche = Math.max(0, c.touche-dt); c.anim = Math.max(0, c.anim-dt);
    c.hitT = Math.max(0, (c.hitT||0)-dt); c.ultiT = Math.max(0, (c.ultiT||0)-dt);
    ["ralenti","gele","choc"].forEach(function(k){ c.eff[k] = Math.max(0, (c.eff[k]||0)-dt); });
    if(c.eff.ralenti<=0) c.eff.stacks = 0;
    if(c.eff.brule>0){ c.eff.brule = Math.max(0, c.eff.brule-dt); if(c.pv>0){ c.pv = Math.max(0, c.pv - 2.2*dt); if(Math.random()<dt*14) J.parts.push({x:c.x+(Math.random()-0.5)*40, y:c.y-Math.random()*100, vx:0, vy:-60, vie:0.5, max:0.5, t:4, col:Math.random()<.5 ? "#ff6a2b" : "#ffd166"}); } }
    var dir = c.pv>0 && c.eff.gele<=0 && c.eff.choc<=0 && J.phase==="combat" ? Math.max(-1, Math.min(1, DIRK[s]+DIRM[s])) : 0;
    c.vx = dir*MG.VIT*(c.eff.ralenti>0 ? 0.5 : 1);
    c.x = Math.max(40, Math.min(960, c.x + c.vx*dt));
    c.vy += MG.GRAV*dt; c.y += c.vy*dt;
    if(c.y>=MG.SOL){ c.y = MG.SOL; c.vy = 0; }
    if(c.pv>0) c.face = o.x>=c.x ? 1 : -1;
  });
  /* Sorts : déplacement, collisions entre sorts, touches */
  J.sorts.forEach(function(p){
    p.x += p.vx*dt; p.vie -= dt; p.t += dt;
    if(Math.random()<dt*40) J.parts.push({x:p.x, y:p.y+(Math.random()-0.5)*p.r, vx:-p.vx*0.05, vy:(Math.random()-0.5)*40, vie:0.35, max:0.35, t:3+Math.random()*3, col:Math.random()<.5 ? ELEMENTS[p.el].col : ELEMENTS[p.el].col2});
    if(p.vie<=0 || p.x<-30 || p.x>1030) p.mort = true;
  });
  J.sorts.forEach(function(p){
    if(p.mort) return;
    J.sorts.forEach(function(q){
      if(p.mort || q.mort || q===p || q.s===p.s) return;
      if(Math.abs(q.x-p.x)<p.r+q.r && Math.abs(q.y-p.y)<p.r+q.r){
        var vap = p.el!==q.el;
        eclats((p.x+q.x)/2, p.y, vap ? "#dfe9f2" : ELEMENTS[p.el].col, vap ? 30 : 16, vap ? 140 : 200);
        if(vap) texteFlottant({x:(p.x+q.x)/2, y:p.y+80}, "VAPEUR", "#dfe9f2");
        bip(vap ? 400 : 800, 0.1, 0.05);
        p.mort = q.mort = true;
      }
    });
    if(p.mort) return;
    var c = J.m[autre(p.s)];
    if(c.pv>0 && Math.abs(p.x-c.x)<34+p.r && p.y>c.y-145 && p.y<c.y+4){ toucherMage(c, p); p.mort = true; }
  });
  J.sorts = J.sorts.filter(function(p){ return !p.mort; });
  /* Météores */
  for(var j=J.meteores.length-1;j>=0;j--){
    var me = J.meteores[j]; me.y += me.vy*dt; me.x += me.vx*dt;
    if(me.y>0 && Math.random()<dt*50) J.parts.push({x:me.x, y:me.y, vx:(Math.random()-0.5)*30, vy:-40, vie:0.4, max:0.4, t:4+Math.random()*4, col:Math.random()<.5 ? "#ff6a2b" : "#ffd166"});
    var ci = J.m[autre(me.s)];
    if(ci.pv>0 && Math.abs(me.x-ci.x)<44 && me.y>ci.y-130 && me.y<ci.y){ toucherMage(ci, {s:me.s, el:me.el, x:me.x, y:me.y}); J.meteores.splice(j,1); continue; }
    if(me.y>=MG.SOL){ eclats(me.x, MG.SOL, "#ff6a2b", 12, 200); bip(160, 0.08, 0.05); J.meteores.splice(j,1); }
  }
  /* Éclairs de la tempête : frappent là où se trouve l'adversaire */
  (J.eclairs||[]).forEach(function(ec){
    ec.t -= dt; if(ec.t>0 || ec.fait) return; ec.fait = true;
    var ci = J.m[autre(ec.s)], x = ci.x + (Math.random()-0.5)*30;
    J.flashs.push({x:x, vie:0.3, pts:null});
    eclats(x, MG.SOL, "#ffe14d", 18, 260); bip(120+Math.random()*80, 0.12, 0.09);
    if(ci.pv>0 && Math.abs(x-ci.x)<46) toucherMage(ci, {s:ec.s, el:ec.el, x:x, y:ci.y-60});
  });
  J.eclairs = (J.eclairs||[]).filter(function(ec){ return !ec.fait; });
  J.flashs = (J.flashs||[]).filter(function(f){ f.vie -= dt; return f.vie>0; });
  if(J.neige>0) J.neige = Math.max(0, J.neige-dt);
  if(J.msgUlti){ J.msgUlti.vie -= dt; if(J.msgUlti.vie<=0) J.msgUlti = null; }
}

/* Skin « sorcière de la foudre » : dessinée face à droite, pieds en (0,0), environ 180 de haut */
function arcElectrique(ctx, x1, y1, x2, y2, amp, seg){
  ctx.beginPath(); ctx.moveTo(x1, y1);
  for(var i=1;i<seg;i++){ var k = i/seg; ctx.lineTo(x1+(x2-x1)*k+(Math.random()-0.5)*amp, y1+(y2-y1)*k+(Math.random()-0.5)*amp); }
  ctx.lineTo(x2, y2); ctx.stroke();
}
function dessinerSorciere(ctx, c, now, col){
  var t = now/1000, E = ELEMENTS[c.el], sol = c.y>=MG.SOL-1;
  var bob = sol ? Math.sin(t*2.6 + (c.s==="b"?0:1.3))*2.2 : 0, cast = c.anim>0;
  var PEAU = "#f0c4a2", PEAU_O = "#c98f6e", ROBE = "#1a1033", ROBE2 = "#2c1b55", OR = "#ffe14d", CYAN = "#9ff4ff";
  ctx.save(); ctx.translate(c.x, c.y);
  /* ombre au sol */
  ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.beginPath(); ctx.ellipse(0, 4, 34*(1-(MG.SOL-c.y)/500), 6, 0, 0, Math.PI*2); ctx.fill();
  ctx.scale(c.face, 1); ctx.translate(0, bob);
  if(c.touche>0) ctx.translate((Math.random()-0.5)*6, 0);
  var vent = Math.sin(t*2.2), vent2 = Math.sin(t*3.1+1);

  /* --- Cheveux (arrière) : volume sur le crâne, longues vagues jusqu'aux reins --- */
  var gh = ctx.createLinearGradient(0,-180,-30,-70); gh.addColorStop(0,"#33245c"); gh.addColorStop(0.5,"#140d2a"); gh.addColorStop(1,"#3d2c80");
  ctx.fillStyle = gh;
  ctx.beginPath();
  ctx.moveTo(14,-170);
  ctx.bezierCurveTo(10,-184,-12,-186,-20,-170);
  ctx.bezierCurveTo(-28,-158,-26,-142,-30-vent*2,-126);
  ctx.bezierCurveTo(-34-vent*3,-110,-30-vent*5,-100,-36-vent*7,-84);
  ctx.bezierCurveTo(-38-vent*8,-74,-30-vent*6,-68,-26-vent2*5,-74);
  ctx.bezierCurveTo(-24-vent2*4,-66,-14-vent2*3,-70,-16,-82);
  ctx.bezierCurveTo(-18,-96,-10,-108,-12,-124);
  ctx.bezierCurveTo(-12,-138,-6,-148,2,-154);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(159,244,255,.32)"; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(-2,-180); ctx.bezierCurveTo(-24,-166,-22,-130,-32-vent*7,-86); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10,-170); ctx.bezierCurveTo(-18,-140,-16,-110,-24-vent2*5,-76); ctx.stroke();
  ctx.strokeStyle = "rgba(255,225,77,.25)";
  ctx.beginPath(); ctx.moveTo(-16,-160); ctx.bezierCurveTo(-26,-130,-24,-104,-34-vent*7,-90); ctx.stroke();

  /* --- Cape (doublure couleur du joueur) --- */
  ctx.fillStyle = col; ctx.globalAlpha *= 0.85;
  ctx.beginPath(); ctx.moveTo(-8,-128); ctx.bezierCurveTo(-30,-110, -46-vent*8,-60, -44-vent*10,-8); ctx.lineTo(-22-vent*4,-4); ctx.bezierCurveTo(-26,-50,-18,-100,-4,-124); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = c.pv<=0 ? 0.35 : 1;
  ctx.fillStyle = "#0d0820";
  ctx.beginPath(); ctx.moveTo(-6,-128); ctx.bezierCurveTo(-26,-110, -40-vent*8,-60, -38-vent*10,-10); ctx.lineTo(-20-vent*4,-6); ctx.bezierCurveTo(-22,-50,-16,-100,-2,-124); ctx.closePath(); ctx.fill();
  /* motif éclair sur la cape */
  ctx.strokeStyle = OR; ctx.lineWidth = 1.5; ctx.globalAlpha *= 0.7;
  ctx.beginPath(); ctx.moveTo(-20,-96); ctx.lineTo(-27,-76); ctx.lineTo(-21,-74); ctx.lineTo(-30-vent*4,-48); ctx.stroke();
  ctx.globalAlpha = c.pv<=0 ? 0.35 : 1;

  /* --- Jambe arrière : cuissarde noire, talon --- */
  ctx.fillStyle = "#0b0814";
  ctx.beginPath(); ctx.moveTo(-9,-66); ctx.bezierCurveTo(-12,-48,-12,-30,-10,-12); ctx.lineTo(-11,-2); ctx.lineTo(-2,-1); ctx.lineTo(-3,-12); ctx.bezierCurveTo(-1,-32,0,-50,1,-64); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#0b0814"; ctx.fillRect(-11,-4,2,5);

  /* --- Jupe longue, fendue devant --- */
  var gj = ctx.createLinearGradient(0,-96,0,-4); gj.addColorStop(0,ROBE2); gj.addColorStop(1,ROBE);
  ctx.fillStyle = gj;
  ctx.beginPath();
  ctx.moveTo(-14,-84);
  ctx.bezierCurveTo(-22,-78,-22,-66,-17,-56);              /* hanche arrière */
  ctx.bezierCurveTo(-18,-38,-22-vent*2,-18,-24-vent*3,-4); /* tombe jusqu'au sol */
  ctx.lineTo(-2,-6);
  ctx.bezierCurveTo(0,-30,2,-50,4,-62);                    /* bord de la fente */
  ctx.bezierCurveTo(8,-70,12,-76,13,-82);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = OR; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-2,-6); ctx.bezierCurveTo(0,-30,2,-50,4,-62); ctx.stroke();

  /* --- Jambe avant : cuisse visible par la fente, cuissarde --- */
  var gl = ctx.createLinearGradient(0,-70,12,-40); gl.addColorStop(0,PEAU); gl.addColorStop(1,PEAU_O);
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.moveTo(4,-72); ctx.bezierCurveTo(14,-64,16,-52,13,-42); ctx.lineTo(5,-42); ctx.bezierCurveTo(4,-52,2,-62,1,-68); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#0b0814";
  ctx.beginPath(); ctx.moveTo(4,-44); ctx.lineTo(14,-44); ctx.bezierCurveTo(14,-30,12,-18,12,-8); ctx.lineTo(19,-4); ctx.lineTo(19,0); ctx.lineTo(6,0); ctx.lineTo(6,-8); ctx.bezierCurveTo(5,-20,4,-32,4,-44); ctx.closePath(); ctx.fill();
  ctx.fillRect(6,-3,2,5);
  ctx.strokeStyle = OR; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(4,-44); ctx.lineTo(14,-44); ctx.stroke();

  /* --- Buste : corset sablier --- */
  var gc = ctx.createLinearGradient(-10,-130,14,-90); gc.addColorStop(0,ROBE2); gc.addColorStop(1,"#120a26");
  ctx.fillStyle = gc;
  ctx.beginPath();
  ctx.moveTo(-9,-127);
  ctx.bezierCurveTo(-11,-116,-7,-104,-7,-97);    /* dos cambré */
  ctx.bezierCurveTo(-8,-92,-13,-88,-15,-82);     /* hanche */
  ctx.lineTo(12,-82);
  ctx.bezierCurveTo(10,-88,6,-93,6,-98);         /* taille fine */
  ctx.bezierCurveTo(6,-102,9,-105,13,-108);      /* sous la poitrine */
  ctx.bezierCurveTo(21,-112,21,-122,13,-125);    /* poitrine */
  ctx.closePath(); ctx.fill();
  /* décolleté (peau) */
  ctx.fillStyle = PEAU;
  ctx.beginPath(); ctx.moveTo(-6,-127); ctx.lineTo(4,-131); ctx.bezierCurveTo(10,-130,14,-127,13,-124); ctx.bezierCurveTo(9,-121,6,-123,4,-120); ctx.bezierCurveTo(1,-124,-3,-125,-6,-127); ctx.closePath(); ctx.fill();
  /* bordures dorées + laçage */
  ctx.strokeStyle = OR; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-6,-127); ctx.bezierCurveTo(-3,-125,1,-124,4,-120); ctx.bezierCurveTo(6,-123,9,-121,13,-124); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14,-83); ctx.lineTo(12,-83); ctx.stroke();
  ctx.lineWidth = 0.9; for(var l=0;l<3;l++){ var ly = -103+l*6; ctx.beginPath(); ctx.moveTo(4,ly); ctx.lineTo(8,ly+3); ctx.moveTo(8,ly); ctx.lineTo(4,ly+3); ctx.stroke(); }
  /* ceinture éclair */
  ctx.fillStyle = OR; ctx.beginPath(); ctx.moveTo(1,-90); ctx.lineTo(5,-90); ctx.lineTo(2,-86); ctx.lineTo(6,-86); ctx.lineTo(0,-79); ctx.lineTo(2,-84); ctx.lineTo(-1,-84); ctx.closePath(); ctx.fill();

  /* --- Bras arrière, main sur la hanche --- */
  ctx.strokeStyle = PEAU_O; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(-6,-124); ctx.lineTo(-17,-106); ctx.lineTo(-9,-92); ctx.stroke();
  ctx.strokeStyle = CYAN; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-15,-100); ctx.lineTo(-12,-96); ctx.stroke();

  /* --- Cou + épaules --- */
  ctx.fillStyle = PEAU; ctx.fillRect(-1,-142,6,13);
  ctx.beginPath(); ctx.ellipse(-3,-127,7,3.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = OR; ctx.fillRect(-1,-135,6,2.2);                                  /* collier ras-du-cou */
  ctx.beginPath(); ctx.moveTo(2,-133); ctx.lineTo(4,-133); ctx.lineTo(2.5,-129); ctx.closePath(); ctx.fill();

  /* --- Tête de profil (légèrement agrandie) --- */
  ctx.save(); ctx.translate(2,-140); ctx.scale(1.16,1.16); ctx.translate(-2,140);
  ctx.fillStyle = PEAU;
  ctx.beginPath();
  ctx.moveTo(-6,-150);
  ctx.bezierCurveTo(-8,-164,2,-170,9,-166);
  ctx.bezierCurveTo(14,-162,15,-157,14,-154);   /* front */
  ctx.lineTo(17,-149);                          /* nez */
  ctx.lineTo(14,-148);
  ctx.bezierCurveTo(15,-146,15,-145,14,-144);   /* lèvres */
  ctx.bezierCurveTo(14,-142,13,-140,10,-139);   /* menton */
  ctx.bezierCurveTo(6,-138,2,-140,0,-142);
  ctx.closePath(); ctx.fill();
  /* lèvres */
  ctx.fillStyle = "#c2304f"; ctx.beginPath(); ctx.ellipse(13.6,-145.4,1.8,1.3,0,0,Math.PI*2); ctx.fill();
  /* œil : iris lumineux, cils */
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(9.5,-154.5,2.8,1.6,-0.1,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = OR; ctx.shadowColor = OR; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(10.6,-154.5,1.3,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = "#0b0814"; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(6.6,-156); ctx.quadraticCurveTo(10,-157.6,13,-155.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12.6,-155.6); ctx.lineTo(14.4,-157.4); ctx.moveTo(11.4,-156.6); ctx.lineTo(12.6,-158.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7,-159.5); ctx.quadraticCurveTo(10.5,-161,13.5,-159); ctx.stroke(); /* sourcil */

  /* --- Cheveux (avant) : frange et mèche le long du visage --- */
  ctx.fillStyle = "#1c1336";
  ctx.beginPath(); ctx.moveTo(-6,-152); ctx.bezierCurveTo(-8,-170,6,-176,14,-166); ctx.bezierCurveTo(12,-166,8,-164,6,-160); ctx.bezierCurveTo(2,-164,-2,-158,-2,-150); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,-160); ctx.bezierCurveTo(-2,-148,-1,-138,2-vent*1.5,-126); ctx.lineTo(-2,-126); ctx.bezierCurveTo(-5,-140,-5,-150,-3,-160); ctx.closePath(); ctx.fill();
  /* diadème éclair */
  ctx.fillStyle = OR; ctx.shadowColor = OR; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(5,-170); ctx.lineTo(9,-170); ctx.lineTo(6.5,-165.5); ctx.lineTo(10,-165.5); ctx.lineTo(4,-158); ctx.lineTo(6,-163.5); ctx.lineTo(3,-163.5); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  /* --- Bras avant : levé avec l'orbe, tendu quand elle lance --- */
  var ex = cast ? 24 : 18, ey = cast ? -124 : -138, hx = cast ? 40 : 26, hy = cast ? -126 : -160;
  ctx.strokeStyle = PEAU; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(6,-126); ctx.lineTo(ex,ey); ctx.stroke();
  ctx.lineWidth = 4.6; ctx.beginPath(); ctx.moveTo(ex,ey); ctx.lineTo(hx,hy); ctx.stroke();
  ctx.fillStyle = PEAU; ctx.beginPath(); ctx.arc(6,-125,4,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = CYAN; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex+(hx-ex)*0.55,ey+(hy-ey)*0.55); ctx.lineTo(ex+(hx-ex)*0.75,ey+(hy-ey)*0.75); ctx.stroke();
  /* orbe de foudre */
  var ox = hx+(cast ? 7 : 3), oy = hy-(cast ? 0 : 7), r = 7 + Math.sin(t*9)*1.2 + (cast ? 3 : 0);
  var go = ctx.createRadialGradient(ox,oy,1,ox,oy,r+8); go.addColorStop(0,"#ffffff"); go.addColorStop(0.35,"#fff6a8"); go.addColorStop(0.7,"rgba(255,225,77,.55)"); go.addColorStop(1,"rgba(159,244,255,0)");
  ctx.fillStyle = go; ctx.beginPath(); ctx.arc(ox,oy,r+8,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = "rgba(220,250,255,.9)"; ctx.lineWidth = 1.2; ctx.shadowColor = CYAN; ctx.shadowBlur = 10;
  for(var a=0;a<3;a++){ var an = Math.random()*Math.PI*2, d = r+6+Math.random()*10; arcElectrique(ctx, ox, oy, ox+Math.cos(an)*d, oy+Math.sin(an)*d, 5, 4); }
  ctx.shadowBlur = 0;
  ctx.restore();

  /* --- Aura : petits arcs électriques autour d'elle --- */
  if(c.pv>0 && Math.random()<0.35){
    ctx.strokeStyle = Math.random()<.5 ? "rgba(255,225,77,.8)" : "rgba(159,244,255,.8)"; ctx.lineWidth = 1.3;
    var ax = c.x+(Math.random()-0.5)*50, ay = c.y-20-Math.random()*140;
    arcElectrique(ctx, ax, ay, ax+(Math.random()-0.5)*30, ay+(Math.random()-0.5)*30, 6, 4);
  }
}

/* Illustrations de la sorcière de la foudre (fichiers .webp à la racine du site).
   ax / sol = position des pieds dans l'image ; toutes les poses regardent vers la droite. */
var SPRITES_SORCIERE = {"repos": {"w": 323, "h": 433, "ax": 207, "sol": 420}, "attaque": {"w": 420, "h": 433, "ax": 202, "sol": 424}, "touchee": {"w": 323, "h": 445, "ax": 160, "sol": 430}, "ultime": {"w": 512, "h": 440, "ax": 269, "sol": 424}, "victoire": {"w": 504, "h": 461, "ax": 286, "sol": 451}};
(function(){ for(var k in SPRITES_SORCIERE){ var im = new Image(); im.src = "sorciere-"+k+".webp?v="+(typeof VERSION_SITE!=="undefined" ? VERSION_SITE : "1"); SPRITES_SORCIERE[k].img = im; } })();
function dessinerSorciereSprite(ctx, c, now, col){
  var J = S.jeu, t = now/1000, pose = "repos";
  if(J.phase==="pause" && J.gagnantRound===c.s) pose = "victoire";
  else if((c.ultiT||0)>0) pose = "ultime";
  else if((c.hitT||0)>0) pose = "touchee";
  else if(c.anim>0) pose = "attaque";
  var P = SPRITES_SORCIERE[pose];
  if(!P || !P.img || !P.img.complete || !P.img.naturalWidth){ P = SPRITES_SORCIERE.repos; if(!P.img.complete || !P.img.naturalWidth) return false; }
  var sc = 190/400, sol = c.y>=MG.SOL-1;
  var souffle = pose==="repos" ? Math.sin(t*2.4 + (c.s==="b"?0:1.2))*0.012 : 0;
  /* ombre + lueur au sol */
  ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.beginPath(); ctx.ellipse(c.x, c.y+4, 46*(1-(MG.SOL-c.y)/500), 8, 0, 0, Math.PI*2); ctx.fill();
  var gl = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, 70); gl.addColorStop(0,"rgba(159,244,255,.35)"); gl.addColorStop(1,"rgba(159,244,255,0)");
  ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(c.x, c.y, 70, 16, 0, 0, Math.PI*2); ctx.fill();
  ctx.save();
  ctx.translate(c.x + (c.touche>0 ? (Math.random()-0.5)*8 : 0), c.y + (sol && pose==="repos" ? Math.sin(t*2.4)*1.2 : 0));
  ctx.scale(c.face*sc, sc*(1+souffle));
  if(c.eff.gele>0){ ctx.filter = "saturate(.4) brightness(1.2) hue-rotate(160deg)"; }
  if(c.hitT>0 && Math.floor(c.hitT*30)%2) ctx.globalAlpha *= 0.75;
  ctx.drawImage(P.img, -P.ax, -P.sol, P.w, P.h);
  ctx.filter = "none";
  ctx.restore();
  /* petits arcs électriques autour d'elle */
  if(c.pv>0 && Math.random()<0.4){
    ctx.strokeStyle = Math.random()<.5 ? "rgba(255,225,77,.85)" : "rgba(190,150,255,.85)"; ctx.lineWidth = 1.4;
    var ax = c.x+(Math.random()-0.5)*80, ay = c.y-20-Math.random()*170;
    arcElectrique(ctx, ax, ay, ax+(Math.random()-0.5)*34, ay+(Math.random()-0.5)*34, 7, 4);
  }
  return true;
}
/* ---------- Dessin ---------- */
function dessinerMage(ctx, c, now, col){
  if(ELEMENTS[c.el] && ELEMENTS[c.el].skin==="sorciere"){
    if(c.pv<=0) ctx.globalAlpha = 0.35;
    if(!dessinerSorciereSprite(ctx, c, now, col)) dessinerSorciere(ctx, c, now, col);
    dessinerEffetsMage(ctx, c); ctx.globalAlpha = 1; return;
  }
  var E = ELEMENTS[c.el], t = now/1000, bob = c.y<MG.SOL-1 ? 0 : Math.sin(t*3 + (c.s==="b"?0:1.5))*3;
  if(c.pv<=0){ ctx.globalAlpha = 0.35; }
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.face, 1);
  /* ombre */
  ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.beginPath(); ctx.ellipse(0, 4 + (MG.SOL-c.y)*0, 38*(1-(MG.SOL-c.y)/500), 7, 0, 0, Math.PI*2); ctx.fill();
  ctx.translate(0, bob);
  if(c.touche>0) ctx.translate((Math.random()-0.5)*6, 0);
  /* cape */
  ctx.fillStyle = "rgba(0,0,0,.5)";
  ctx.beginPath(); ctx.moveTo(-14,-92); ctx.quadraticCurveTo(-46 - Math.sin(t*4)*5, -40, -34, 0); ctx.lineTo(-8,0); ctx.closePath(); ctx.fill();
  /* robe */
  var gr = ctx.createLinearGradient(0,-100,0,0); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(20,20,40,1)");
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-14,-92); ctx.lineTo(14,-92); ctx.lineTo(28,0); ctx.lineTo(-28,0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = E.col; ctx.lineWidth = 2; ctx.globalAlpha *= 0.8; ctx.beginPath(); ctx.moveTo(-26,-6); ctx.lineTo(26,-6); ctx.stroke(); ctx.globalAlpha = c.pv<=0 ? 0.35 : 1;
  /* ceinture */
  ctx.fillStyle = E.col; ctx.fillRect(-16,-58,32,5);
  /* tête */
  ctx.fillStyle = "#1b1b30"; ctx.beginPath(); ctx.arc(0,-104,14,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = E.col2; ctx.shadowColor = E.col; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(5,-106,2.6,0,Math.PI*2); ctx.arc(11,-106,2.6,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
  /* chapeau pointu */
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-24,-112); ctx.lineTo(24,-112); ctx.quadraticCurveTo(4,-128, -10 - Math.sin(t*2)*4,-162); ctx.quadraticCurveTo(-6,-130,-24,-112); ctx.closePath(); ctx.fill();
  ctx.fillStyle = E.col; ctx.fillRect(-20,-118,40,5);
  /* bâton + orbe */
  var lev = c.anim>0 ? -18 : 0;
  ctx.strokeStyle = "#8a6a45"; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(26,-4); ctx.lineTo(34,-104+lev); ctx.stroke();
  var orb = 9 + Math.sin(t*6)*1.5 + (c.anim>0 ? 4 : 0);
  ctx.fillStyle = E.col2; ctx.shadowColor = E.col; ctx.shadowBlur = 24;
  ctx.beginPath(); ctx.arc(35,-112+lev,orb,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = E.col; ctx.beginPath(); ctx.arc(35,-112+lev,orb*0.55,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  dessinerEffetsMage(ctx, c);
  ctx.globalAlpha = 1;
}
function dessinerEffetsMage(ctx, c){
  if(c.eff.choc>0){
    ctx.strokeStyle = "rgba(255,225,77,.9)"; ctx.lineWidth = 1.6;
    for(var z=0;z<3;z++){ var zx = c.x+(Math.random()-0.5)*60, zy = c.y-10-Math.random()*150; arcElectrique(ctx, zx, zy, zx+(Math.random()-0.5)*40, zy+(Math.random()-0.5)*40, 8, 4); }
  }
  if(c.eff.gele>0){
    ctx.fillStyle = "rgba(170,230,255,.35)"; ctx.strokeStyle = "rgba(230,250,255,.9)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(c.x-40,c.y+4); ctx.lineTo(c.x-46,c.y-90); ctx.lineTo(c.x-20,c.y-178); ctx.lineTo(c.x+24,c.y-170); ctx.lineTo(c.x+46,c.y-80); ctx.lineTo(c.x+40,c.y+4); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if(c.eff.ralenti>0){
    ctx.fillStyle = "#e8fbff"; for(var k=0;k<c.eff.stacks;k++){ ctx.beginPath(); ctx.arc(c.x-12+k*12, c.y-186, 4, 0, Math.PI*2); ctx.fill(); }
  }
  if(c.bouclier>0){
    var a = Math.min(1, c.bouclier*3);
    ctx.strokeStyle = "rgba(255,255,255,"+(0.9*a)+")"; ctx.fillStyle = "rgba(255,255,255,"+(0.12*a)+")"; ctx.lineWidth = 3;
    ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.ellipse(c.x, c.y-80, 62, 100, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
  }
}
function dessinerSort(ctx, p, now){
  var E = ELEMENTS[p.el];
  ctx.save(); ctx.translate(p.x, p.y); ctx.shadowColor = E.col; ctx.shadowBlur = 26;
  if(p.el==="foudre"){
    var dirx = p.vx>0 ? 1 : -1;
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; arcElectrique(ctx, -dirx*34, 0, dirx*10, 0, 10, 6);
    ctx.strokeStyle = E.col; ctx.lineWidth = 1.6; arcElectrique(ctx, -dirx*40, 0, dirx*12, 0, 14, 6);
    ctx.fillStyle = "#fffbe0"; ctx.beginPath(); ctx.arc(dirx*10, 0, 5, 0, Math.PI*2); ctx.fill();
  } else if(p.el==="glace"){
    ctx.scale(p.vx>0 ? 1 : -1, 1);
    ctx.fillStyle = E.col2; ctx.beginPath(); ctx.moveTo(22,0); ctx.lineTo(-10,-9); ctx.lineTo(-18,0); ctx.lineTo(-10,9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = E.col; ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-6,-5); ctx.lineTo(-6,5); ctx.closePath(); ctx.fill();
  } else {
    var g = ctx.createRadialGradient(0,0,2,0,0,p.r+6); g.addColorStop(0,"#fff6d0"); g.addColorStop(0.4,E.col2); g.addColorStop(1,"rgba(255,80,20,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,p.r+6+Math.sin(now/60)*2,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
function barre(ctx, x, y, w, h, k, col, droite){
  ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; var ww = w*Math.max(0, Math.min(1, k));
  ctx.fillRect(droite ? x+w-ww : x, y, ww, h);
  ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h);
}
function dessinerMages(ctx, cv, now){
  var J = S.jeu; if(!J || J.id!=="mages") return;
  var W = cv.width, H = cv.height, sc = Math.min(W/1000, H/600), ox = (W-1000*sc)/2, oy = (H-600*sc)/2;
  var C = {b:couleur("--bleu"), v:couleur("--violet"), fg:couleur("--fg")};
  ctx.setTransform(1,0,0,1,0,0);
  var ciel = ctx.createLinearGradient(0,0,0,H); ciel.addColorStop(0,"#0b0820"); ciel.addColorStop(0.7,"#1a1236"); ciel.addColorStop(1,"#0a0a14");
  ctx.fillStyle = ciel; ctx.fillRect(0,0,W,H);
  ctx.setTransform(sc,0,0,sc,ox,oy);
  /* étoiles, lune, montagnes */
  ctx.fillStyle = "rgba(255,255,255,.6)";
  for(var i=0;i<40;i++){ var sx = (i*137)%1000, sy = (i*71)%260; ctx.globalAlpha = 0.3+0.5*Math.abs(Math.sin(now/900+i)); ctx.fillRect(sx, sy, 2, 2); }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f3e9c8"; ctx.shadowColor = "#f3e9c8"; ctx.shadowBlur = 40; ctx.beginPath(); ctx.arc(860,250,34,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = "#151030"; ctx.beginPath(); ctx.moveTo(0,420); ctx.lineTo(120,300); ctx.lineTo(230,380); ctx.lineTo(380,260); ctx.lineTo(520,390); ctx.lineTo(660,290); ctx.lineTo(800,380); ctx.lineTo(920,310); ctx.lineTo(1000,360); ctx.lineTo(1000,520); ctx.lineTo(0,520); ctx.fill();
  /* sol de pierre */
  var sol = ctx.createLinearGradient(0,MG.SOL,0,600); sol.addColorStop(0,"#2b2540"); sol.addColorStop(1,"#120f1e");
  ctx.fillStyle = sol; ctx.fillRect(-200,MG.SOL,1400,140);
  ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 1;
  for(var x=0;x<1000;x+=80){ ctx.beginPath(); ctx.moveTo(x,MG.SOL); ctx.lineTo(x-40,600); ctx.stroke(); }
  ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.beginPath(); ctx.moveTo(0,MG.SOL); ctx.lineTo(1000,MG.SOL); ctx.stroke();
  /* mages, sorts, météores, particules */
  ["b","v"].forEach(function(s){ dessinerMage(ctx, J.m[s], now, C[s]); });
  J.sorts.forEach(function(p){ dessinerSort(ctx, p, now); });
  J.meteores.forEach(function(me){ if(me.y<-20) return; dessinerSort(ctx, {el:"feu", x:me.x, y:me.y, r:20, vx:1}, now); });
  J.parts.forEach(function(p){ var k = Math.max(0, p.vie/p.max); ctx.globalAlpha = k; ctx.fillStyle = p.col; ctx.fillRect(p.x-p.t/2, p.y-p.t/2, p.t, p.t); });
  ctx.globalAlpha = 1;
  (J.flashs||[]).forEach(function(f){
    var k = f.vie/0.3;
    ctx.fillStyle = "rgba(255,250,210,"+(0.22*k)+")"; ctx.fillRect(-200,-100,1400,800);
    ctx.shadowColor = "#ffe14d"; ctx.shadowBlur = 30;
    ctx.strokeStyle = "rgba(255,255,255,"+k+")"; ctx.lineWidth = 6; arcElectrique(ctx, f.x+(Math.random()-0.5)*40, -20, f.x, MG.SOL, 40, 9);
    ctx.strokeStyle = "rgba(255,225,77,"+k+")"; ctx.lineWidth = 2.5; arcElectrique(ctx, f.x+(Math.random()-0.5)*40, -20, f.x, MG.SOL, 50, 9);
    ctx.shadowBlur = 0;
  });
  if(J.neige>0){ ctx.fillStyle = "rgba(200,240,255,"+(0.18*Math.min(1,J.neige))+")"; ctx.fillRect(-200,-100,1400,800); ctx.fillStyle = "#ffffff";
    for(var n=0;n<80;n++){ var nx = ((n*97 + now/4*(1+n%3))%1100)-50, ny = ((n*53 + now/6)%650)-25; ctx.fillRect(nx, ny, 3, 3); } }
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  J.textes.forEach(function(t){ ctx.globalAlpha = Math.min(1, t.vie*2); ctx.font = "800 22px Sora, system-ui, sans-serif"; ctx.fillStyle = t.col; ctx.shadowColor = "#000"; ctx.shadowBlur = 8; ctx.fillText(t.txt, t.x, t.y); });
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  /* HUD */
  ["b","v"].forEach(function(s, i){
    var c = J.m[s], E = ELEMENTS[c.el], x = i ? 560 : 40, w = 400, d = !!i;
    ctx.font = "800 22px Sora, system-ui, sans-serif"; ctx.textAlign = d ? "right" : "left"; ctx.textBaseline = "alphabetic";
    var Y = 72;
    ctx.fillStyle = C[s]; ctx.fillText(S.noms[s]+"  "+(J.phase==="tirage" && J.tirageT<1.6 ? "" : E.emoji+" "+E.nom), d ? x+w : x, Y+38);
    barre(ctx, x, Y+48, w, 18, c.pv/MG.PV, c.pv>30 ? C[s] : "#ff5a6e", d);
    barre(ctx, x+(d ? w-260 : 0), Y+72, 260, 8, c.en/100, c.en>=100 ? E.col2 : E.col, d);
    if(c.en>=100){ ctx.font = "700 13px Sora, system-ui, sans-serif"; ctx.fillStyle = E.col2; ctx.textAlign = d ? "right" : "left"; ctx.fillText("ULTIME PRÊT", d ? x+w-270 : x+270, Y+81); }
    for(var k=0;k<2;k++){ ctx.fillStyle = k<J.wins[s] ? "#ffd166" : "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.arc(d ? x+w-8-k*20 : x+8+k*20, Y+98, 7, 0, Math.PI*2); ctx.fill(); }
  });
  ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = "800 30px Sora, system-ui, sans-serif";
  if(J.phase==="combat" || J.phase==="decompte") ctx.fillText(String(Math.ceil(J.reste)), 500, 138);
  ctx.font = "600 14px Sora, system-ui, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillText("ROUND "+J.round, 500, 162);
  /* Tirage des éléments */
  if(J.phase==="tirage"){
    ctx.fillStyle = "rgba(5,5,15,.72)"; ctx.fillRect(-200,-100,1400,800);
    ctx.font = "800 40px Sora, system-ui, sans-serif"; ctx.fillStyle = "#ffffff"; ctx.fillText("Round "+J.round+" · tirage des éléments", 500, 190);
    [["b",290],["v",710]].forEach(function(x){
      var E = ELEMENTS[x[0]==="b" ? J.affB||"feu" : J.affV||"glace"];
      ctx.font = "92px serif"; ctx.fillText(E.emoji, x[1], 310);
      ctx.font = "800 34px Sora, system-ui, sans-serif"; ctx.fillStyle = E.col; ctx.fillText(E.nom, x[1], 395);
      ctx.font = "700 22px Sora, system-ui, sans-serif"; ctx.fillStyle = C[x[0]]; ctx.fillText(S.noms[x[0]], x[1], 432); ctx.fillStyle = "#ffffff";
    });
    ctx.font = "800 40px Sora, system-ui, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fillText("VS", 500, 330);
  }
  if(J.msgUlti){ ctx.globalAlpha = Math.min(1, J.msgUlti.vie*2); ctx.font = "900 46px Sora, system-ui, sans-serif"; ctx.fillStyle = J.msgUlti.col; ctx.shadowColor = J.msgUlti.col; ctx.shadowBlur = 30; ctx.fillText(J.msgUlti.txt, 500, 215); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
  if(J.msg && J.phase!=="tirage"){
    ctx.font = "900 80px Sora, system-ui, sans-serif"; ctx.fillStyle = "#ffffff"; ctx.shadowColor = "rgba(0,0,0,.9)"; ctx.shadowBlur = 24; ctx.fillText(J.msg, 500, 270); ctx.shadowBlur = 0;
    if(J.sous){ ctx.font = "700 30px Sora, system-ui, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillText(J.sous, 500, 340); }
  }
  ctx.setTransform(1,0,0,1,0,0);
}
/* Clavier (pour tester sans téléphone) */
var mgTenu = {};
document.addEventListener("keydown", function(e){
  if(estManette || S.ecran!=="mages") return;
  var t = MG_TOUCHES[String(e.key).toLowerCase()]; if(!t) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if(t[1]==="g" || t[1]==="d"){ mgTenu[t[0]+t[1]] = true; DIRK[t[0]] = (mgTenu[t[0]+"d"]?1:0)-(mgTenu[t[0]+"g"]?1:0); }
  else if(!e.repeat) actionMage(t[0], t[1]);
}, true);
document.addEventListener("keyup", function(e){
  if(estManette) return;
  var t = MG_TOUCHES[String(e.key).toLowerCase()]; if(!t || (t[1]!=="g" && t[1]!=="d")) return;
  mgTenu[t[0]+t[1]] = false; DIRK[t[0]] = (mgTenu[t[0]+"d"]?1:0)-(mgTenu[t[0]+"g"]?1:0);
}, true);
/* ---------- Téléphone ---------- */
var mgDernierCoup = 0;
function rendreMagesManette(z, noms){
  mMontrer("m-mages");
  if(!z) return;
  var moi = z.m && z.m[COTE]; if(!moi) return;
  var E = ELEMENTS[moi.el] || ELEMENTS.feu;
  $("mMgInfo").textContent = (noms[COTE]||"")+" · "+E.emoji+" "+E.nom+" · Round "+z.round+" ("+z.wins.b+"-"+z.wins.v+")";
  $("mMgPv").style.width = Math.max(0, moi.pv)+"%";
  $("mMgEn").style.width = Math.max(0, moi.en)+"%";
  $("mMgEn").style.background = E.col;
  var u = $("mMgUlti"); u.disabled = moi.en<100; u.textContent = moi.en>=100 ? E.ultiNom+" !" : "Ultime "+Math.floor(moi.en)+"%";
  u.style.borderColor = E.col;
  $("mMgSort").style.borderColor = E.col; $("mMgSort").querySelector("small").textContent = E.nom;
  var coups = z.coups ? z.coups[COTE]||0 : 0;
  if(coups>mgDernierCoup && navigator.vibrate) try{ navigator.vibrate(90); }catch(e){}
  mgDernierCoup = coups;
}
Array.prototype.forEach.call(document.querySelectorAll("#m-mages [data-a]"), function(b){
  b.addEventListener("pointerdown", function(e){ e.preventDefault(); if(b.disabled) return; envoyer("mage",{side:COTE, a:b.getAttribute("data-a")}); b.classList.add("appui"); });
  ["pointerup","pointercancel","pointerleave"].forEach(function(ev){ b.addEventListener(ev, function(){ b.classList.remove("appui"); }); });
});
