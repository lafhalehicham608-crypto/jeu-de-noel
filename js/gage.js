/* Le Jeu de Noël · Résultat de manche, page de gage (minuteur, roue du corps, gages obligatoires), fin de partie */
"use strict";
/* Résultat puis gage */
function finManche(perdant, detail){
  S.perdant = perdant; S.st[perdant].perdu++; S.tot[perdant].perdu++;
  montrer("resultat");
  if(S.labo && LABO.apres==="retour"){ $("resTitre").textContent = S.noms[autre(perdant)]+" gagne la manche"; $("resSub").textContent = detail; plus_tard(retourLabo, 2600); return; }
  $("resTitre").textContent = S.noms[autre(perdant)]+" gagne la manche";
  $("resSub").textContent = detail;
  plus_tard(afficherGage, 2400);
}
function afficherGage(g){
  g = (g && g.texte) ? g : tirerGage(); S.fait = false;
  S.gtexte = g.texte;
  S.gt = (g.dmin && g.dmax) ? {dmin:g.dmin, dmax:g.dmax, duree:0, tirage:false, fin:0, reste:0, pause:false, fini:false} : null;
  S.gc = CORPS[g.corps] ? {type:g.corps, res:"", tourne:false, vu:false} : null;
  S.oblig = !!g.obligatoire;
  montrer("gage");
  $("gage").className = "screen "+S.perdant;
  $("gQui").textContent = S.noms[S.perdant];
  $("gMontre").hidden = true; $("gCorps").hidden = true; $("gCorps").innerHTML = "";
  afficherTexteGage();
  $("gOblig").hidden = !S.oblig; $("gage").classList.toggle("oblig", S.oblig);
  $("gNote").textContent = S.oblig ? "Ce gage est obligatoire : impossible de boire pour y échapper." : g.labo ? "Gage de test du Labo." : g.exemple ? "Gage d'exemple : la banque n'a pas encore de gage "+NOM_NIV[g.niveau]+" pour "+(S.perdant==="b"?"lui":"elle")+"." : "";
  neon(S.perdant);
  boutonsGage();
}
/* Texte du gage : X devient la durée (fourchette puis durée tirée), Z la partie du corps */
function afficherTexteGage(){
  var gt = S.gt, gc = S.gc, zone = $("gTexte"), morceaux = String(S.gtexte||"").split(/\b([XZ])\b/);
  var valX = gt ? (gt.duree ? fmtDuree(gt.duree) : fourchette(gt, " à ")) : "X";
  var valZ = gc ? (gc.res ? gc.res.toLowerCase() : "?") : "Z";
  var aX = false, aZ = false;
  zone.textContent = "";
  morceaux.forEach(function(m, i){
    if(i%2===0){ zone.appendChild(document.createTextNode(m)); return; }
    if(m==="X"){ aX = true; zone.appendChild(el("span", gt ? "g-duree" : null, valX)); }
    else { aZ = true; zone.appendChild(gc && gc.res ? etiquetteCorps(gc) : el("span", null, valZ)); }
  });
  var info = $("gDuree"); info.textContent = "";
  if(gc && !aZ && gc.res){ info.appendChild(document.createTextNode("Sur ")); var sz = etiquetteCorps(gc); sz.style.fontSize = "1.6em"; info.appendChild(sz); }
  var notes = [];
  if(gt && !gt.duree) notes.push(gt.dmin===gt.dmax ? "⏱ Ce gage dure "+fmtDuree(gt.dmin) : "⏱ Ce gage durera entre "+fmtDuree(gt.dmin)+" et "+fmtDuree(gt.dmax)+", tiré au hasard");
  else if(gt && !aX) notes.push("Pendant "+fmtDuree(gt.duree));
  if(gc && !gc.res) notes.push("◎ La partie du corps sera tirée à la roue");
  if(notes.length) info.appendChild(document.createTextNode((info.textContent ? "   ·   " : "") + notes.join("   ·   ")));
}
function etiquetteCorps(gc){
  var sp = el("span","g-corps"+(gc.type==="m" ? " m" : ""));
  sp.appendChild(el("span","ge",emojiCorps(gc.res))); sp.appendChild(document.createTextNode(gc.res.toLowerCase()));
  return sp;
}
/* Roue du corps : dessin et lancer */
function dessinerRoueCorps(root, type){
  var parts = CORPS[type].parties, n = parts.length, seg = 360/n, R = 92;
  var pal = type==="f" ? {a:"#f6e7dc", b:"#7a1f35", ta:"#5a1426", tb:"#f6e7dc", fond:"#3b0f1c"} : {a:"#efe4d0", b:"#1d2b45", ta:"#1d2b45", tb:"#efe4d0", fond:"#101a2c"};
  var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS,"svg");
  function E(par,t,a){ var e = document.createElementNS(NS,t); for(var k in a) e.setAttribute(k,a[k]); par.appendChild(e); return e; }
  svg.setAttribute("viewBox","-112 -118 224 230");
  var defs = E(svg,"defs",{});
  var lg = E(defs,"linearGradient",{id:"rcLaiton",x1:"0",y1:"0",x2:"1",y2:"1"});
  [["0","#f7e3a6"],[".35","#c99a45"],[".6","#8a6424"],["1","#e9c77b"]].forEach(function(o){ E(lg,"stop",{offset:o[0],"stop-color":o[1]}); });
  var rg = E(defs,"radialGradient",{id:"rcClou",cx:".35",cy:".35",r:".7"});
  [["0","#fff6d8"],[".5","#d4a650"],["1","#6e4c17"]].forEach(function(o){ E(rg,"stop",{offset:o[0],"stop-color":o[1]}); });
  var vg = E(defs,"radialGradient",{id:"rcVoile",cx:"0",cy:"0",r:"1",gradientUnits:"objectBoundingBox"});
  E(vg,"stop",{offset:".55","stop-color":"#000","stop-opacity":"0"}); E(vg,"stop",{offset:"1","stop-color":"#000","stop-opacity":".28"});
  E(svg,"circle",{r:"108",fill:pal.fond});
  E(svg,"circle",{r:"104",fill:"none",stroke:"url(#rcLaiton)","stroke-width":"9"});
  var g = E(svg,"g",{class:"rc-g"});
  parts.forEach(function(nom, i){
    var a0 = (i*seg-90)*Math.PI/180, a1 = ((i+1)*seg-90)*Math.PI/180, pair = i%2===0;
    var d = "M0 0 L"+(R*Math.cos(a0)).toFixed(2)+" "+(R*Math.sin(a0)).toFixed(2)+" A"+R+" "+R+" 0 0 1 "+(R*Math.cos(a1)).toFixed(2)+" "+(R*Math.sin(a1)).toFixed(2)+" Z";
    E(g,"path",{d:d,fill:pair?pal.a:pal.b,stroke:"#b8893a","stroke-width":".9",class:"rc-s",id:"rcS"+i});
    /* Un emoji par case */
    var c = i*seg+seg/2;
    var te = E(g,"text",{class:"rc-e",x:"0",y:"-60","text-anchor":"middle","dominant-baseline":"central",transform:"rotate("+c+")",style:"font-size:"+(n>10 ? 24 : 27)+"px"});
    te.textContent = emojiCorps(nom);
  });
  E(g,"circle",{r:R,fill:"url(#rcVoile)"});
  for(var k=0;k<n;k++){ var aa = (k*seg-90)*Math.PI/180; E(svg,"circle",{cx:(104*Math.cos(aa)).toFixed(2),cy:(104*Math.sin(aa)).toFixed(2),r:"3.2",fill:"url(#rcClou)"}); }
  E(svg,"circle",{r:"20",fill:"url(#rcLaiton)",stroke:"#6e4c17","stroke-width":"1"});
  E(svg,"circle",{r:"13",fill:pal.b,stroke:"#f7e3a6","stroke-width":"1.2"});
  E(svg,"circle",{r:"4",fill:"url(#rcClou)"});
  /* Pointeur en laiton en haut */
  E(svg,"path",{d:"M0 -86 L-11 -112 Q0 -122 11 -112 Z",fill:"url(#rcLaiton)",stroke:"#6e4c17","stroke-width":"1.2"});
  E(svg,"circle",{cy:"-110",r:"3.5",fill:pal.b});
  root.innerHTML = ""; root.appendChild(svg);
  return g;
}
function tournerCorps(){
  var gc = S.gc; if(S.ecran!=="gage" || !gc || gc.res || gc.tourne || S.fait!==true) return;
  gc.tourne = true;
  var root = $("gCorps"); root.hidden = false; root.style.opacity = ""; root.style.transform = "";
  $("gMontre").hidden = true;
  var g = dessinerRoueCorps(root, gc.type), parts = CORPS[gc.type].parties, n = parts.length, seg = 360/n;
  var k = rnd(n), cible = -(k*seg + seg/2 + (Math.random()-0.5)*seg*0.6);
  var fin = 360*6 + ((cible%360)+360)%360, duree = 5000, t0 = null, g0 = gen, dernier = 0;
  $("gActions").innerHTML = "";
  diffuser();
  function frame(now){
    if(g0!==gen) return;
    if(t0===null) t0 = now;
    var p = Math.min(1, (now-t0)/duree), e = 1 - Math.pow(1-p, 4), rot = fin*e;
    g.setAttribute("transform","rotate("+rot.toFixed(2)+")");
    var cran = Math.floor(rot/seg); if(cran!==dernier){ dernier = cran; bip(520, 0.025, 0.05); }
    if(p<1){ requestAnimationFrame(frame); return; }
    gc.res = parts[k]; gc.tourne = false;
    var sg = document.getElementById("rcS"+k); if(sg) sg.classList.add("rc-gagne");
    bip(660, 0.15, 0.08); plus_tard(function(){ bip(990, 0.25, 0.08); }, 140);
    afficherTexteGage(); diffuser();
    plus_tard(function(){
      root.classList.add("fini"); root.style.opacity = "0"; root.style.transform = "scale(.9)";
      plus_tard(function(){ root.hidden = true; gc.vu = true; boutonsGage(); diffuser(); }, 420);
    }, 1800);
  }
  requestAnimationFrame(frame);
}
function tirerDuree(){
  var gt = S.gt; if(S.ecran!=="gage" || !gt || gt.duree || gt.tirage || S.fait!==true || (S.gc && !S.gc.vu)) return;
  gt.tirage = true;
  var lo = Math.ceil(gt.dmin/15)*15, hi = Math.floor(gt.dmax/15)*15; if(hi<lo) hi = lo;
  var choix = []; for(var v=lo; v<=hi; v+=15) choix.push(v);
  var final = choix[rnd(choix.length)], etapes = 16, k = 0, delai = 55;
  var c = $("gMontre"); c.hidden = false;
  $("gActions").innerHTML = "";
  diffuser();
  (function etape(){
    if(k<etapes){ var v = choix[rnd(choix.length)]; majMontre(c, fmtChrono(v*1000), v/hi, "tirage", "tirage"); bip(1500, 0.03, 0.04); k++; delai *= 1.14; plus_tard(etape, delai); return; }
    gt.duree = final; gt.tirage = false;
    majMontre(c, fmtChrono(final*1000), 1, "", "prêt");
    bip(880, 0.12, 0.07); plus_tard(function(){ bip(1320, 0.2, 0.07); }, 120);
    afficherTexteGage(); boutonsGage(); diffuser();
  })();
}
/* Construit une montre (cadran SVG) dans un conteneur ; majMontre la met à jour */
function creerMontre(root){
  root.innerHTML = "";
  var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS,"svg");
  function S2(t,a){ var e = document.createElementNS(NS,t); for(var k in a) e.setAttribute(k,a[k]); svg.appendChild(e); return e; }
  svg.setAttribute("viewBox","-60 -72 120 132");
  S2("rect",{class:"mo-couronne",x:"-9",y:"-71",width:"18",height:"8",rx:"2.5"});
  S2("rect",{class:"mo-couronne",x:"-3.5",y:"-64",width:"7",height:"6"});
  S2("path",{class:"mo-anse",d:"M-40 -44 L-47 -51 M40 -44 L47 -51"});
  S2("circle",{class:"mo-fond",r:"57"});
  S2("circle",{class:"mo-piste",r:"50"});
  for(var i=0;i<60;i++){
    var a = i*6*Math.PI/180, gros = i%5===0, r1 = gros ? 39 : 42;
    S2("line",{class:"mo-tic"+(gros?" gros":""),x1:(r1*Math.sin(a)).toFixed(2),y1:(-r1*Math.cos(a)).toFixed(2),x2:(45*Math.sin(a)).toFixed(2),y2:(-45*Math.cos(a)).toFixed(2)});
  }
  S2("circle",{class:"mo-arc",r:"50",pathLength:"100",transform:"rotate(-90)","stroke-dasharray":"100 100"});
  S2("circle",{class:"mo-pointe",r:"3.4",cx:"0",cy:"-50"});
  root.appendChild(svg);
  var t = document.createElement("span"); t.className = "mo-t"; root.appendChild(t);
  var sous = document.createElement("span"); sous.className = "mo-sous"; root.appendChild(sous);
}
function majMontre(root, txt, frac, etat, sousTxt){
  if(!root.querySelector(".mo-arc")) creerMontre(root);
  frac = Math.max(0, Math.min(1, frac));
  root.querySelector(".mo-t").textContent = txt;
  root.querySelector(".mo-sous").textContent = sousTxt||"";
  root.querySelector(".mo-arc").setAttribute("stroke-dasharray", (frac*100).toFixed(2)+" 100");
  var a = frac*2*Math.PI, p = root.querySelector(".mo-pointe");
  p.setAttribute("cx", (50*Math.sin(a)).toFixed(2)); p.setAttribute("cy", (-50*Math.cos(a)).toFixed(2));
  p.style.display = (frac>0 && frac<1) ? "" : "none";
  root.className = root.className.replace(/\s*\b(tirage|pause|stop|urgent)\b/g, "") + (etat ? " "+etat : "");
}
function fmtChrono(ms){ var s = Math.max(0, Math.ceil(ms/1000)), m = Math.floor(s/60), r = s%60; return m+":"+(r<10?"0":"")+r; }
function resteMinuteur(gt){ return gt.pause ? gt.reste : Math.max(0, gt.fin - Date.now()); }
function demarrerMinuteur(){
  var gt = S.gt; gt.fin = Date.now() + gt.duree*1000; gt.pause = false; gt.fini = false;
  var g0 = gen;
  (function tick(){
    if(g0!==gen || S.gt!==gt || gt.fini) return;
    var r = resteMinuteur(gt);
    if(r<=0){ finMinuteur(); return; }
    majMontre($("gMontre"), fmtChrono(r), r/(gt.duree*1000), gt.pause ? "pause" : (r<=10000 ? "urgent" : ""), gt.pause ? "pause" : "");
    setTimeout(tick, 200);
  })();
}
function basculerPause(){
  var gt = S.gt; if(S.ecran!=="gage" || !gt || S.fait!==true || !gt.lance || gt.fini) return;
  if(gt.pause){ gt.fin = Date.now() + gt.reste; gt.pause = false; }
  else { gt.reste = Math.max(0, gt.fin - Date.now()); gt.pause = true; }
  boutonsGage(); diffuser();
}
function finMinuteur(){
  var gt = S.gt; gt.fini = true;
  majMontre($("gMontre"), "ARRÊTEZ !", 1, "stop", "");
  var n = 0; (function sonne(){ if(n>=10) return; bip(n%2 ? 1175 : 880, 0.2, 0.09); n++; plus_tard(sonne, 260); })();
  boutonsGage(); diffuser();
}
/* Ordre : 1) Je le fais / Je bois  2) roue du corps  3) tirage de la durée  4) lancer le minuteur  5) fini */
function boutonsGage(){
  var a = $("gActions"); a.innerHTML = "";
  var gt = S.gt, gc = S.gc;
  function bouton(txt, c, plein){ var b = document.createElement("button"); if(plein!==false){ b.className = "plein"; b.setAttribute("data-primary",""); } b.textContent = txt; b.onclick = function(){ choisir(c); }; a.appendChild(b); return b; }
  if(!S.fait){
    var f = bouton(S.oblig ? "Je le fais (obligatoire)" : "Je le fais", "fais"); if(!S.oblig) bouton("Je bois", "bois", false);
    try{ f.focus({preventScroll:true}); }catch(e){}
    return;
  }
  if(S.fait!==true) return;
  var b = null;
  if(gc && !gc.vu){ if(gc.res || gc.tourne) return; b = bouton("Tourner la roue", "corps"); }
  else if(gt && !gt.duree){ if(gt.tirage) return; b = bouton("Tirer la durée", "duree"); }
  else if(gt && !gt.lance){ b = bouton("Lancer le minuteur", "go"); }
  else if(gt){ b = gt.fini ? bouton("Manche suivante", "fait") : bouton(gt.pause ? "Reprendre" : "Pause", "pause"); }
  else b = bouton("C'est fait · manche suivante", "fait");
  try{ b.focus({preventScroll:true}); }catch(e){}
}
function choisir(c){
  if(S.ecran!=="gage") return;
  var gt = S.gt, gc = S.gc;
  if(c==="corps"){ tournerCorps(); return; }
  if(c==="duree"){ tirerDuree(); return; }
  if(c==="pause"){ basculerPause(); return; }
  if(c==="go"){
    if(S.fait!==true || !gt || !gt.duree || gt.lance || (gc && !gc.vu)) return;
    gt.lance = true; demarrerMinuteur(); bip(1320, 0.15, 0.07); boutonsGage(); diffuser(); return;
  }
  if(c==="fais" && !S.fait){ S.fait = true; boutonsGage(); diffuser(); }
  else if(c==="bois" && !S.fait && !S.oblig){
    S.st[S.perdant].bois++; S.tot[S.perdant].bois++; verreSoiree(S.perdant); majHud();
    var a = $("gActions"); a.innerHTML = ""; a.appendChild(verreBu(S.perdant));
    S.fait = "bu"; diffuser();
    plus_tard(mancheSuivante, 1500);
  } else if(c==="fait" && S.fait===true && (!gc || gc.vu) && (!gt || gt.fini)){
    S.st[S.perdant].fait++; S.tot[S.perdant].fait++; mancheSuivante();
  }
}
function mancheSuivante(){
  S.jeu = null; S.perdant = null; S.fait = false; S.gt = null; S.gc = null; S.oblig = false;
  if(S.labo){ retourLabo(); return; }
  if(S.manche >= nbManches()){ finPartie(); return; }
  S.manche++; roulette();
}

/* Fin de partie */
function finPartie(){
  montrer("fin");
  var derniere = S.partie >= SEQUENCE.length-1;
  $("finTitre").textContent = "Fin de la partie "+(S.partie+1)+" · "+SEQUENCE[S.partie].nom;
  var pb = S.st.b.perdu, pv = S.st.v.perdu;
  $("finPerdant").textContent = pb===pv ? "Égalité parfaite" : S.noms[pb>pv?"b":"v"]+" a perdu la partie";
  $("fnB").textContent = S.noms.b; $("fnV").textContent = S.noms.v;
  var corps = $("finCorps"); corps.innerHTML = "";
  [["Manches perdues","perdu"],["Gages faits","fait"],["Verres bus","bois"],["Verres de la soirée","soiree"]].forEach(function(r){
    var tr = document.createElement("tr"), th = document.createElement("th"); th.textContent = r[0]; tr.appendChild(th);
    ["b","v"].forEach(function(s){
      var td=document.createElement("td"); td.className="c"+s;
      if(r[1]==="bois" || r[1]==="soiree"){
        var n = r[1]==="soiree" ? SOIREE[s] : S.st[s].bois, box = el("span","fin-verres");
        if(!n) box.appendChild(verreSVG(false));
        for(var i=0;i<Math.min(n,20);i++) box.appendChild(verreSVG(true));
        td.appendChild(box); td.appendChild(document.createTextNode(" "+n));
      } else td.textContent=S.st[s][r[1]];
      tr.appendChild(td);
    });
    corps.appendChild(tr);
  });
  $("btnSuite").textContent = derniere ? "Nouvelle séquence" : "Partie suivante · "+SEQUENCE[S.partie+1].nom;
  if(S.labo){ $("btnSuite").textContent = "Retour au Labo"; $("btnSuite").onclick = retourLabo; return; }
  $("btnSuite").onclick = function(){
    if(derniere){ S.partie = 0; S.tot = {b:stats0(),v:stats0()}; } else S.partie++;
    lancerIntro();
  };
}
$("btnMenu").onclick = function(){ montrer("modes"); };
