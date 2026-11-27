/* Le Jeu de Noël · Mini-jeux : tir à la corde, dernière carte, mini circuit, chrono, réflexe, carte haute + appuis */
"use strict";
/* Mini-jeu 6 : tir à la corde (chaque tape tire la corde de son côté) */
var CORDE_PAS = 0.05, CORDE_DUREE = 20000;
function majCorde(side){
  var J = S.jeu;
  $("crCorde").style.setProperty("--p", J.p.toFixed(3));
  $("crTapB").textContent = J.taps.b; $("crTapV").textContent = J.taps.v;
  if(side){
    var z = $(side==="b"?"crZoneB":"crZoneV"); z.classList.add("flash"); clearTimeout(z._t); z._t = setTimeout(function(){ z.classList.remove("flash"); }, 120);
    var c = $("crCorde"); c.classList.remove("secoue"); void c.offsetWidth; c.classList.add("secoue");
  }
}
function corde(){
  S.jeu = {id:"corde", phase:"pret", p:0, taps:{b:0, v:0}};
  montrer("corde");
  $("crB").textContent = "← "+S.noms.b; $("crV").textContent = S.noms.v+" →";
  $("crSub").textContent = "Tapez le plus vite possible sur votre téléphone pour tirer le nœud dans votre zone.";
  majCorde();
  var n = 3; $("crMsg").textContent = "3"; bip(660, 0.15, 0.07);
  (function decompte(){
    plus_tard(function(){
      n--;
      if(n>0){ $("crMsg").textContent = String(n); bip(660, 0.15, 0.07); decompte(); return; }
      $("crMsg").textContent = "TIREZ !"; bip(1320, 0.25, 0.08);
      S.jeu.phase = "go"; diffuser();
      plus_tard(function(){ if(S.jeu && S.jeu.phase==="go") $("crMsg").textContent = ""; }, 900);
      plus_tard(function(){
        if(!S.jeu || S.jeu.phase!=="go") return;
        if(S.jeu.p===0){ S.jeu.phase = "fini"; $("crMsg").textContent = "Égalité !"; $("crSub").textContent = "On recommence."; plus_tard(corde, 2000); }
        else gagnerCorde(S.jeu.p<0 ? "b" : "v", true);
      }, CORDE_DUREE);
    }, 900);
  })();
}
function gagnerCorde(g, parTemps){
  var J = S.jeu; J.phase = "fini";
  $("crMsg").textContent = S.noms[g]+" gagne !";
  $("crSub").textContent = parTemps ? "Temps écoulé : le nœud était de son côté." : "";
  bip(880, 0.15, 0.07); plus_tard(function(){ bip(1320, 0.3, 0.07); }, 150);
  diffuser();
  plus_tard(function(){ finManche(autre(g), S.noms[g]+" a tiré la corde ("+J.taps[g]+" tapes contre "+J.taps[autre(g)]+")"); }, 2400);
}

/* Mini-jeu 5 : Dernière carte (premier à vider sa main) */
var UC = ["r","j","v","b"], NOM_COUL = {r:"Rouge", j:"Jaune", v:"Vert", b:"Bleu"}, MAIN_DEPART = 5;
function unoPaquet(){
  var d = [];
  UC.forEach(function(c){ d.push(c+"0"); for(var n=1;n<=9;n++){ d.push(c+n); d.push(c+n); } ["+2","R","S"].forEach(function(x){ d.push(c+x); d.push(c+x); }); });
  for(var i=0;i<4;i++){ d.push("W"); d.push("W4"); }
  return melange(d);
}
function uCoul(k){ return k.charAt(0)==="W" ? null : k.charAt(0); }
function uVal(k){ return k.charAt(0)==="W" ? k : k.slice(1); }
function uJouable(k){
  var U = S.jeu, h = U.defausse[U.defausse.length-1];
  if(k.charAt(0)==="W") return true;
  return uCoul(k)===U.couleur || (uCoul(h)!==null && uVal(k)===uVal(h));
}
function uPiocher1(){
  var U = S.jeu;
  if(!U.pioche.length && U.defausse.length>1){ var top = U.defausse.pop(); U.pioche = melange(U.defausse); U.defausse = [top]; }
  return U.pioche.length ? U.pioche.pop() : null;
}
function nomCarte(k){
  var v = uVal(k), c = NOM_COUL[uCoul(k)];
  if(v==="W") return "un joker"; if(v==="W4") return "un +4";
  if(v==="R") return "une inversion "+c; if(v==="S") return "un passe "+c;
  return v+" "+c;
}
function carteEl(k, cls, bouton){
  var e = document.createElement(bouton ? "button" : "div"), c = uCoul(k), v = uVal(k);
  e.className = "uc "+(c ? "k-"+c : "k-w")+(cls ? " "+cls : "");
  var sym = v==="R" ? "⇄" : v==="S" ? "⊘" : v==="W" ? "★" : v==="W4" ? "+4" : v;
  var c1 = el("span","ui-coin",sym), c2 = el("span","ui-coin bas",sym), mid = el("span","ui-centre");
  mid.appendChild(el("span",null, v==="W" ? "" : sym));
  e.appendChild(c1); e.appendChild(mid); e.appendChild(c2);
  e.setAttribute("aria-label", nomCarte(k));
  return e;
}
function uno(){
  var p = unoPaquet();
  var U = {id:"uno", phase:"jeu", pioche:p, defausse:[], mains:{b:[],v:[]}, tour:Math.random()<0.5?"b":"v", couleur:null, revele:false, aPioche:false, attenteCouleur:false, effet:null, msg:""};
  S.jeu = U;
  for(var i=0;i<MAIN_DEPART;i++){ U.mains.b.push(p.pop()); U.mains.v.push(p.pop()); }
  var k = p.pop(), essais = 0;
  while(!/^[rjvb]\d$/.test(k) && essais++ < 50){ p.unshift(k); k = p.pop(); }
  U.defausse.push(k); U.couleur = uCoul(k);
  U.msg = S.noms[U.tour]+" commence";
  montrer("uno"); rendreUno();
  plus_tard(function(){ if(S.jeu===U && U.phase==="jeu") finUno(null); }, 300000);
}
function unoAction(d){
  var U = S.jeu;
  if(!U || U.id!=="uno" || U.phase!=="jeu" || !d) return;
  if(d.side && d.side!==U.tour) return;
  var s = U.tour, main = U.mains[s];
  if(d.a==="voir"){ U.revele = true; }
  else if(d.a==="couleur"){
    if(!U.attenteCouleur || !NOM_COUL[d.c]) return;
    U.couleur = d.c; U.attenteCouleur = false; U.msg += " · couleur "+NOM_COUL[d.c];
    apresCoup(U.effet);
  }
  else if(U.attenteCouleur) return;
  else if(d.a==="jouer"){
    var i = d.i|0, k = main[i];
    if(!k || !uJouable(k)) return;
    main.splice(i,1); U.defausse.push(k); bip(990, 0.06, 0.05);
    U.msg = S.noms[s]+" joue "+nomCarte(k);
    if(!main.length){ if(uCoul(k)) U.couleur = uCoul(k); finUno(s); }
    else if(k.charAt(0)==="W"){ U.attenteCouleur = true; U.effet = uVal(k); }
    else { U.couleur = uCoul(k); apresCoup(uVal(k)); }
  }
  else if(d.a==="piocher"){
    if(U.aPioche) return;
    var c = uPiocher1(); if(c) main.push(c);
    U.aPioche = true; U.msg = S.noms[s]+" pioche une carte";
  }
  else if(d.a==="passer"){
    if(!U.aPioche) return;
    U.msg = S.noms[s]+" passe"; changerTour();
  }
  rendreUno(); diffuser();
}
function apresCoup(eff){
  var U = S.jeu, s = U.tour, o = autre(s);
  if(eff==="+2" || eff==="W4"){
    var n = eff==="+2" ? 2 : 4;
    for(var i=0;i<n;i++){ var c = uPiocher1(); if(c) U.mains[o].push(c); }
    U.msg += " · "+S.noms[o]+" pioche "+n+" et passe son tour"; U.aPioche = false;
  } else if(eff==="R" || eff==="S"){
    U.msg += " · "+S.noms[o]+" passe son tour"; U.aPioche = false;
  } else changerTour();
}
function changerTour(){ var U = S.jeu; U.tour = autre(U.tour); U.revele = false; U.aPioche = false; }
function finUno(gagnant){
  var U = S.jeu; U.phase = "fini";
  var parTemps = gagnant===null;
  if(parTemps) gagnant = U.mains.b.length <= U.mains.v.length ? "b" : "v";
  var perd = autre(gagnant);
  U.msg = parTemps ? "Temps écoulé : "+S.noms[gagnant]+" a le moins de cartes" : S.noms[gagnant]+" a posé sa dernière carte !";
  bip(880,0.15,0.07); plus_tard(function(){ bip(1320,0.3,0.07); },150);
  rendreUno(); diffuser();
  plus_tard(function(){ finManche(perd, U.msg); }, 2800);
}
function manetteConnectee(){
  return !!(room && room.peers().some(function(p){ return p.presence && p.presence.role==="manette"; }));
}
function rendreUno(){
  var U = S.jeu; if(!U || U.id!=="uno") return;
  var h = U.defausse[U.defausse.length-1];
  $("unoNomB").textContent = S.noms.b; $("unoNomV").textContent = S.noms.v;
  ["b","v"].forEach(function(s){
    var n = U.mains[s].length, dos = $(s==="b"?"unoDosB":"unoDosV"); dos.innerHTML = "";
    for(var i=0;i<Math.min(n,12);i++) dos.appendChild(el("div","uc dos"));
    $(s==="b"?"unoNbB":"unoNbV").textContent = n+" carte"+(n>1?"s":"");
  });
  $("unoHaut").innerHTML = ""; $("unoHaut").appendChild(carteEl(h, "grand"));
  $("unoCoul").textContent = U.couleur ? "Couleur demandée : "+NOM_COUL[U.couleur] : "";
  $("unoCoul").className = "uno-coul k-"+(U.couleur||"w");
  $("unoTour").className = "uno-tour c"+U.tour;
  $("unoTour").textContent = U.phase!=="jeu" ? "" : U.attenteCouleur ? S.noms[U.tour]+" choisit une couleur" : "Au tour de "+S.noms[U.tour];
  $("unoMsg").textContent = U.msg;
  neon(U.phase==="jeu" ? U.tour : null);
  var zone = $("unoMain"); zone.innerHTML = "";
  var tv = !manetteConnectee() && U.phase==="jeu";
  zone.hidden = !tv;
  if(!tv) return;
  if(U.attenteCouleur){
    UC.forEach(function(c){ var b = el("button","choix k-"+c, NOM_COUL[c]); b.onclick = function(){ unoAction({a:"couleur", c:c}); }; zone.appendChild(b); });
    return;
  }
  U.mains[U.tour].forEach(function(k,i){ var b = carteEl(k, "", true); b.disabled = !uJouable(k); b.onclick = function(){ unoAction({a:"jouer", i:i}); }; zone.appendChild(b); });
  var act = el("button", "petit", U.aPioche ? "Passer" : "Piocher");
  act.onclick = function(){ unoAction({a: U.aPioche ? "passer" : "piocher"}); };
  zone.appendChild(act);
}

/* Mini-jeu 4 : mini circuit (vue de dessus, 2 tours) */
var CIRCUIT = [[70,300],[100,130],[290,70],[490,150],[650,80],[860,90],[935,230],[850,345],[915,470],[740,540],[480,470],[280,540],[85,470]];
var ROUTE = 96, TOURS = 2, DUREE_MAX = 100, MARGE = 4, piste = null;
var DIRK = {b:0,v:0}, DIRM = {b:0,v:0}, touches = {};
function construirePiste(){
  if(piste) return;
  var P = CIRCUIT, n = P.length, pts = [];
  for(var i=0;i<n;i++){
    var p0=P[(i-1+n)%n], p1=P[i], p2=P[(i+1)%n], p3=P[(i+2)%n];
    for(var s=0;s<30;s++){
      var t=s/30, t2=t*t, t3=t2*t, q=[];
      for(var a=0;a<2;a++) q.push(0.5*(2*p1[a] + (-p0[a]+p2[a])*t + (2*p0[a]-5*p1[a]+4*p2[a]-p3[a])*t2 + (-p0[a]+3*p1[a]-3*p2[a]+p3[a])*t3));
      pts.push(q);
    }
  }
  var d = [0];
  for(var k=1;k<pts.length;k++) d.push(d[k-1] + Math.hypot(pts[k][0]-pts[k-1][0], pts[k][1]-pts[k-1][1]));
  piste = {pts:pts, d:d, L:d[d.length-1] + Math.hypot(pts[0][0]-pts[pts.length-1][0], pts[0][1]-pts[pts.length-1][1])};
}
function plusProche(x, y, idx){
  var pts = piste.pts, N = pts.length, best = idx, bd = 1e18;
  for(var k=idx-25;k<=idx+25;k++){
    var i = ((k%N)+N)%N, dx = pts[i][0]-x, dy = pts[i][1]-y, dd = dx*dx+dy*dy;
    if(dd<bd){ bd = dd; best = i; }
  }
  return {i:best, dist:Math.sqrt(bd)};
}
function couleur(nom){ return getComputedStyle(document.documentElement).getPropertyValue(nom).trim(); }
function course(){
  construirePiste();
  var i0 = 5, p = piste.pts[i0], q = piste.pts[i0+3];
  var ang = Math.atan2(q[1]-p[1], q[0]-p[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
  function voiture(off){ return {x:p[0]+nx*off, y:p[1]+ny*off, a:ang, v:0, idx:i0, tours:0, fini:false, mort:0, bx:p[0]+nx*off, by:p[1]+ny*off, ba:ang, bi:i0, booms:0}; }
  touches = {}; DIRK = {b:0,v:0};
  S.jeu = {id:"course", phase:"decompte", car:{b:voiture(-20), v:voiture(20)}, msg:"3", parts:[]};
  montrer("course");
  var cv = $("cvCourse"), ctx = cv.getContext("2d");
  var r = Math.min(window.devicePixelRatio||1, 1.5);
  cv.width = Math.max(300, cv.clientWidth*r); cv.height = Math.max(200, cv.clientHeight*r);
  var C = {bg:couleur("--bg"), b:couleur("--bleu"), v:couleur("--violet"), fg:couleur("--fg"), mute:couleur("--mute")};
  var g0 = gen, last = null, debut = performance.now(), dernierMsg = null;
  function boucle(now){
    if(g0!==gen) return;
    var dt = last===null ? 0 : Math.min(0.05, (now-last)/1000); last = now;
    var e = (now-debut)/1000;
    if(S.jeu.phase==="decompte"){
      S.jeu.msg = e<3 ? String(3-Math.floor(e)) : "GO";
      if(S.jeu.msg!==dernierMsg){ dernierMsg = S.jeu.msg; bip(S.jeu.msg==="GO"?1320:660, 0.18, 0.07); }
      if(e>=3){ S.jeu.phase = "course"; diffuser(); }
    } else if(S.jeu.phase==="course"){
      if(e>4.2) S.jeu.msg = "";
      physique(dt);
      var cb = S.jeu.car.b, cvv = S.jeu.car.v, gagnant = null;
      if(cb.fini && !cvv.fini) gagnant = "b"; else if(cvv.fini && !cb.fini) gagnant = "v";
      else if(e-3 > DUREE_MAX){ gagnant = avance(cb) >= avance(cvv) ? "b" : "v"; }
      if(gagnant){
        S.jeu.phase = "fini"; S.jeu.msg = S.noms[gagnant]+" gagne !"; bip(880,0.15,0.07); plus_tard(function(){ bip(1320,0.3,0.07); },150);
        var perd = autre(gagnant);
        plus_tard(function(){ finManche(perd, S.noms[gagnant]+" a bouclé les "+TOURS+" tours en premier"); }, 2600);
      }
    } else if(S.jeu.phase==="fini"){
      ["b","v"].forEach(function(s){ S.jeu.car[s].v *= 0.92; S.jeu.car[s].x += Math.cos(S.jeu.car[s].a)*S.jeu.car[s].v*dt; S.jeu.car[s].y += Math.sin(S.jeu.car[s].a)*S.jeu.car[s].v*dt; });
    }
    dessinerCourse(ctx, cv, C);
    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
}
function avance(c){ return c.tours*piste.L + piste.d[c.idx]; }
function physique(dt){
  var N = piste.pts.length;
  majParticules(dt);
  ["b","v"].forEach(function(s){
    var c = S.jeu.car[s];
    if(c.mort > 0){
      c.mort -= dt;
      if(c.mort <= 0){ c.mort = 0; c.x = c.bx; c.y = c.by; c.a = c.ba; c.idx = c.bi; c.v = 0; c.revient = 1; }
      return;
    }
    if(c.revient > 0) c.revient -= dt;
    var pp = plusProche(c.x, c.y, c.idx);
    c.v += (270 - c.v) * Math.min(1, dt*1.3);
    var dir = Math.max(-1, Math.min(1, DIRK[s] + DIRM[s]));
    c.a += dir * 3.8 * dt * Math.min(1, c.v/120);
    c.x = Math.max(8, Math.min(992, c.x + Math.cos(c.a)*c.v*dt));
    c.y = Math.max(8, Math.min(592, c.y + Math.sin(c.a)*c.v*dt));
    var ni = plusProche(c.x, c.y, pp.i).i;
    if(plusProche(c.x, c.y, ni).dist > ROUTE/2 + MARGE){ exploser(c, s); return; }
    if(c.idx > N*0.85 && ni < N*0.15) c.tours++;
    else if(c.idx < N*0.15 && ni > N*0.85) c.tours--;
    c.idx = ni;
    if(c.tours >= TOURS) c.fini = true;
  });
  var a = S.jeu.car.b, b = S.jeu.car.v, dx = b.x-a.x, dy = b.y-a.y, dist = Math.hypot(dx,dy);
  if(!a.mort && !b.mort && dist < 22 && dist > 0.01){
    var o = (22-dist)/2, ux = dx/dist, uy = dy/dist;
    a.x -= ux*o; a.y -= uy*o; b.x += ux*o; b.y += uy*o; a.v *= 0.92; b.v *= 0.92;
  }
}
function exploser(c, s){
  c.mort = 1.3; c.booms++;
  var cols = [c===S.jeu.car.b ? couleur("--bleu") : couleur("--violet"), "#ffb347", "#ffffff", "#ff5a3d"];
  for(var i=0;i<44;i++){
    var an = Math.random()*Math.PI*2, sp = 60 + Math.random()*260;
    S.jeu.parts.push({x:c.x, y:c.y, vx:Math.cos(an)*sp + Math.cos(c.a)*c.v*0.3, vy:Math.sin(an)*sp + Math.sin(c.a)*c.v*0.3, vie:0.5+Math.random()*0.6, max:1.1, t:2+Math.random()*4, col:cols[i%cols.length]});
  }
  S.jeu.parts.push({x:c.x, y:c.y, vx:0, vy:0, vie:0.35, max:0.35, flash:true, col:"#ffffff"});
  boum();
}
function majParticules(dt){
  var ps = S.jeu.parts;
  for(var i=ps.length-1;i>=0;i--){ var p = ps[i]; p.vie -= dt; if(p.vie <= 0){ ps.splice(i,1); continue; } p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= 0.94; p.vy *= 0.94; }
}
function boum(){
  if(!audio || audio.state!=="running") return;
  try{
    var t = audio.currentTime, len = Math.floor(audio.sampleRate*0.6), buf = audio.createBuffer(1, len, audio.sampleRate), d = buf.getChannelData(0);
    for(var i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/len, 2.5);
    var src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
    src.buffer = buf; f.type = "lowpass"; f.frequency.value = 700; g.gain.value = 0.35;
    src.connect(f); f.connect(g); g.connect(audio.destination); src.start(t);
  }catch(e){}
}
/* Éclats de particules (utilisé par le Duel de mages) */
function eclats(x, y, col, n, vit){
  for(var i=0;i<n;i++){ var an = Math.random()*Math.PI*2, sp = vit*(0.3+Math.random());
    S.jeu.parts.push({x:x, y:y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp, vie:0.4+Math.random()*0.6, max:1, t:2+Math.random()*4, col: i%3 ? col : (i%2 ? "#ffb347" : "#ffffff")}); }
}
function tracerPiste(ctx){
  var pts = piste.pts; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for(var i=1;i<pts.length;i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}
function dessinerCourse(ctx, cv, C){
  var W = cv.width, H = cv.height, sc = Math.min(W/1000, H/600), ox = (W-1000*sc)/2, oy = (H-600*sc)/2;
  ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H);
  ctx.setTransform(sc,0,0,sc,ox,oy);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  tracerPiste(ctx);
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = ROUTE+22; ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = ROUTE+5; ctx.stroke();
  ctx.strokeStyle = "#13132b"; ctx.lineWidth = ROUTE; ctx.stroke();
  ctx.setLineDash([14,18]); ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
  var p0 = piste.pts[0], p1 = piste.pts[2], an = Math.atan2(p1[1]-p0[1], p1[0]-p0[0]);
  ctx.save(); ctx.translate(p0[0], p0[1]); ctx.rotate(an);
  for(var r=0;r<2;r++) for(var k=0;k<8;k++){ ctx.fillStyle = (r+k)%2 ? "#ffffff" : "#000000"; ctx.fillRect(r*9-9, -ROUTE/2 + k*ROUTE/8, 9, ROUTE/8); }
  ctx.restore();
  S.jeu.parts.forEach(function(p){
    var k = Math.max(0, p.vie/p.max);
    ctx.globalAlpha = k;
    ctx.fillStyle = p.col;
    if(p.flash){ ctx.beginPath(); ctx.arc(p.x, p.y, 70*(1-k)+10, 0, Math.PI*2); ctx.fill(); }
    else ctx.fillRect(p.x-p.t/2, p.y-p.t/2, p.t, p.t);
  });
  ctx.globalAlpha = 1;
  ["b","v"].forEach(function(s){
    var c = S.jeu.car[s], col = C[s];
    if(c.mort > 0) return;
    if(c.revient > 0 && Math.floor(c.revient*10)%2) return;
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a);
    ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.fillStyle = col; ctx.fillRect(-15,-8,30,16);
    ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillRect(4,-6,6,12);
    ctx.fillStyle = "#000"; ctx.fillRect(-12,-10,7,3); ctx.fillRect(-12,7,7,3); ctx.fillRect(6,-10,7,3); ctx.fillRect(6,7,7,3);
    ctx.restore();
  });
  ctx.setTransform(1,0,0,1,0,0);
  var fs = Math.max(14, Math.round(H/26));
  ctx.font = "700 "+fs+"px Sora, system-ui, sans-serif"; ctx.textBaseline = "top";
  ["b","v"].forEach(function(s,i){
    var c = S.jeu.car[s], t = S.noms[s]+" · tour "+Math.min(TOURS, Math.max(1, c.tours+1))+"/"+TOURS+(c.mort>0?" · BOUM":"");
    ctx.fillStyle = C[s]; ctx.textAlign = i ? "right" : "left";
    ctx.fillText(t, i ? W-fs : fs, fs*0.4);
  });
  if(S.jeu.msg){
    var big = Math.round(H/6);
    ctx.font = "800 "+big+"px Sora, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = C.fg; ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 20;
    ctx.fillText(S.jeu.msg, W/2, H/2); ctx.shadowBlur = 0;
  }
}

/* Mini-jeu 3 : chrono à l'aveugle */
function fmt(s){ return s.toFixed(2).replace(".",","); }
function chrono(){
  S.jeu = {id:"chrono", phase:"pret", t:{b:null,v:null}};
  montrer("chrono");
  S.jeu.cible = 5 + rnd(11);
  $("chAff").classList.remove("cache"); $("chAff").textContent = fmt(S.jeu.cible);
  $("chSub").textContent = "Visez "+S.jeu.cible+" secondes pile. Le chrono disparaît au bout de 3 s, tapez sur votre moitié quand vous pensez y être.";
  $("chB").textContent = "← "+S.noms.b; $("chV").textContent = S.noms.v+" →";
  plus_tard(function(){
    S.jeu.phase = "go"; S.jeu.t0 = performance.now(); $("chSub").textContent = ""; diffuser();
    var g0 = gen;
    (function tick(){
      if(g0!==gen || !S.jeu || S.jeu.phase!=="go") return;
      var e = (performance.now()-S.jeu.t0)/1000;
      if(e < 3){ $("chAff").textContent = fmt(e); requestAnimationFrame(tick); }
      else { $("chAff").textContent = "?,??"; $("chAff").classList.add("cache"); }
    })();
    plus_tard(function(){ if(S.jeu && S.jeu.phase==="go") revelerChrono(); }, 25000);
  }, 3500);
}
function revelerChrono(){
  S.jeu.phase = "fini";
  var tb = S.jeu.t.b, tv = S.jeu.t.v;
  var cb = S.jeu.cible;
  var eb = tb===null ? Infinity : Math.abs(tb-cb), ev = tv===null ? Infinity : Math.abs(tv-cb);
  $("chAff").classList.remove("cache"); $("chAff").textContent = fmt(cb);
  $("chB").textContent = S.noms.b+" · "+(tb===null ? "pas tapé" : fmt(tb)+" s");
  $("chV").textContent = S.noms.v+" · "+(tv===null ? "pas tapé" : fmt(tv)+" s");
  if(eb===ev){ $("chSub").textContent = "Égalité parfaite, on rejoue !"; plus_tard(chrono, 2500); return; }
  var perd = eb > ev ? "b" : "v";
  $("chSub").textContent = S.noms[autre(perd)]+" est le plus proche";
  diffuser();
  plus_tard(function(){
    finManche(perd, S.noms.b+" "+(tb===null?"pas tapé":fmt(tb)+" s")+" · "+S.noms.v+" "+(tv===null?"pas tapé":fmt(tv)+" s"));
  }, 2800);
}

/* Mini-jeu 1 : réflexe */
function reflexe(){
  S.jeu = {id:"reflexe", phase:"pret"};
  montrer("reflexe");
  $("reflexe").classList.remove("go");
  $("rfTexte").textContent = "Doigts prêts";
  $("rfSub").textContent = "Tapez sur votre moitié dès que l'écran devient blanc. Trop tôt = perdu.";
  $("rfB").textContent = "← "+S.noms.b; $("rfV").textContent = S.noms.v+" →";
  plus_tard(function(){
    S.jeu.phase = "attends"; $("rfTexte").textContent = "Attendez…"; $("rfSub").textContent = ""; diffuser();
    plus_tard(function(){
      S.jeu.phase = "go"; S.jeu.t0 = performance.now();
      $("reflexe").classList.add("go"); $("rfTexte").textContent = "TAPEZ !"; diffuser();
    }, 1500 + rnd(3000));
  }, 1800);
}

/* Mini-jeu 2 : carte haute */
function carteHaute(){
  S.jeu = {id:"carte", phase:"tirage", c:{b:null,v:null}};
  montrer("carte");
  resetCartes();
}
function resetCartes(){
  S.jeu.c = {b:null,v:null}; S.jeu.phase = "tirage";
  ["B","V"].forEach(function(x){ var c=$("c"+x); c.classList.remove("face"); c.textContent="?"; });
  $("cnB").textContent = S.noms.b; $("cnV").textContent = S.noms.v;
  $("cSub").textContent = "Chacun tape sur sa moitié pour retourner sa carte";
  diffuser();
}

/* Appui d'un joueur (téléphone, clavier ou clic) */
function appui(side){
  if(!S.jeu || (side!=="b" && side!=="v")) return;
  if(S.ecran==="duel"){ tirer(side); return; }
  if(S.ecran==="reflexe"){
    if(S.jeu.phase==="attends"){ S.jeu.phase="fini"; finManche(side, "Faux départ de "+S.noms[side]+" !"); }
    else if(S.jeu.phase==="go"){
      S.jeu.phase="fini";
      var ms = Math.round(performance.now()-S.jeu.t0);
      finManche(autre(side), S.noms[side]+" a tapé en "+(ms/1000).toFixed(2).replace(".",",")+" s");
    }
  } else if(S.ecran==="corde" && S.jeu.phase==="go"){
    S.jeu.taps[side]++;
    S.jeu.p = Math.max(-1, Math.min(1, S.jeu.p + (side==="b" ? -CORDE_PAS : CORDE_PAS)));
    majCorde(side);
    if(Math.abs(S.jeu.p) >= 1) gagnerCorde(S.jeu.p<0 ? "b" : "v", false);
  } else if(S.ecran==="chrono" && S.jeu.phase==="go" && S.jeu.t[side]===null){
    S.jeu.t[side] = (performance.now()-S.jeu.t0)/1000;
    $(side==="b"?"chB":"chV").textContent = S.noms[side]+" · a tapé ✓";
    bip(990, 0.06, 0.05);
    if(S.jeu.t.b!==null && S.jeu.t.v!==null) revelerChrono();
  } else if(S.ecran==="carte" && S.jeu.phase==="tirage" && S.jeu.c[side]===null){
    var v = 2 + rnd(13); S.jeu.c[side] = v;
    var el = $(side==="b"?"cB":"cV"); el.textContent = VALEURS[v]||String(v); el.classList.add("face");
    if(S.jeu.c.b!==null && S.jeu.c.v!==null){
      S.jeu.phase = "compare";
      plus_tard(function(){
        if(S.jeu.c.b===S.jeu.c.v){ $("cSub").textContent = "Égalité ! On retire."; plus_tard(resetCartes,1600); }
        else { var perd = S.jeu.c.b < S.jeu.c.v ? "b" : "v"; finManche(perd, "Carte la plus basse"); }
      }, 900);
    }
  }
}
