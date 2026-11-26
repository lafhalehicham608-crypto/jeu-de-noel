/* Le Jeu de Noël · Écrans de la télé : accueil, joueurs, modes, intro de partie, roulette des mini-jeux */
"use strict";
/* ---------- Affichage TV ---------- */
var ECRANS = ["accueil","joueurs","modes","intro","roulette","reflexe","carte","chrono","course","uno","corde","duel","quiz","qui","mages","traque","libre","resultat","gage","fin","banque","persos","labo"];
function montrer(id){
  gen++;
  S.ecran = id;
  ECRANS.forEach(function(e){$(e).hidden = e!==id});
  $("hud").hidden = ["roulette","reflexe","carte","chrono","course","uno","corde","duel","quiz","qui","mages","traque","libre","resultat","gage"].indexOf(id)<0;
  if(id!=="gage") neon(null);
  $("btnQuitter").hidden = id==="accueil" || id==="banque" || id==="persos";
  $("btnPasser").hidden = ["roulette","reflexe","carte","chrono","course","uno","corde","duel","quiz","qui","mages","traque"].indexOf(id)<0; $("btnPasser").classList.remove("confirme"); $("btnPasser").textContent = "Passer ce jeu";
  annulerQuitter();
  majHud();
  var p = $(id).querySelector("[data-primary]:not([disabled])") || $(id).querySelector("input,button:not([disabled])");
  if(p) try{p.focus({preventScroll:true})}catch(e){}
  diffuser();
}
function neon(side){
  var n = $("neon");
  n.className = "";
  if(side){ void n.offsetWidth; n.className = side+" on"; }
}
function majHud(){
  $("hudG").innerHTML = "";
  var g = document.createElement("span");
  g.innerHTML = "Partie <b></b> · Manche <b></b>";
  g.children[0].textContent = (S.partie+1)+" "+SEQUENCE[S.partie].nom;
  g.children[1].textContent = S.manche+"/"+nbManches();
  $("hudG").appendChild(g);
  $("hudD").textContent = "";
  ["b","v"].forEach(function(s){
    var n = SOIREE[s], prec = hudPrec[s] || 0;
    var g = el("span","hud-verres c"+s);
    g.title = n+" verre"+(n>1?"s":"")+" ce soir pour "+(S.noms[s]||"?");
    if(AVATARS && AVATARS["t"+s]){ var ha = el("span","hud-ava"), hi = document.createElement("img"); hi.src = AVATARS["t"+s]; hi.alt = ""; ha.appendChild(hi); g.appendChild(ha); }
    g.appendChild(el("span","hud-nom", S.noms[s]||"?"));
    var box = el("span","hud-icones"), max = 8, visibles = Math.min(n, max);
    if(!n) box.appendChild(verreSVG(false));
    for(var i=0;i<visibles;i++){ var v = verreSVG(true); if(n>prec && i>=visibles-(n-prec)) v.classList.add("nouveau"); box.appendChild(v); }
    if(n>max) box.appendChild(el("span","hud-plus","+"+(n-max)));
    g.appendChild(box);
    g.appendChild(el("span","hud-compte", String(n)));
    $("hudD").appendChild(g);
    hudPrec[s] = n;
  });
}
var hudPrec = {b:0, v:0};
/* Passer un mini-jeu : on joue à un jeu libre dans la vraie vie et on désigne le gagnant */
var ECRANS_JEUX = ["roulette","reflexe","carte","chrono","course","uno","corde","duel","quiz","qui","mages","traque"];
function passerJeu(){
  if(ECRANS_JEUX.indexOf(S.ecran)<0) return;
  S.jeu = null; touches = {}; DIRK = {b:0,v:0};
  montrer("libre");
  $("libreB").textContent = S.noms.b+" a gagné"; $("libreV").textContent = S.noms.v+" a gagné";
}
function libreGagne(g){
  if(S.ecran!=="libre" || (g!=="b" && g!=="v")) return;
  finManche(autre(g), "Jeu libre : "+S.noms[g]+" a gagné");
}
$("libreB").onclick = function(){ libreGagne("b"); };
$("libreV").onclick = function(){ libreGagne("v"); };
var passerT = null;
$("btnPasser").onclick = function(){
  var b = $("btnPasser");
  if(b.classList.contains("confirme")){ clearTimeout(passerT); passerJeu(); return; }
  b.classList.add("confirme"); b.textContent = "Appuie encore pour passer";
  passerT = setTimeout(function(){ b.classList.remove("confirme"); b.textContent = "Passer ce jeu"; }, 3000);
};
/* Verres de toute la soirée : ne se remettent pas à zéro entre les parties.
   Gardés dans le navigateur de la télé, remis à zéro après 12 h sans nouveau verre. */
var SOIREE = (function(){
  try{ var x = JSON.parse(localStorage.getItem("jdn-soiree") || "null"); if(x && Date.now()-x.maj < 12*3600*1000) return {b:x.b|0, v:x.v|0}; }catch(e){}
  return {b:0, v:0};
})();
function verreSoiree(cote){
  SOIREE[cote]++;
  try{ localStorage.setItem("jdn-soiree", JSON.stringify({b:SOIREE.b, v:SOIREE.v, maj:Date.now()})); }catch(e){}
}
/* Un petit verre à shot dessiné ; plein = rempli à la couleur du joueur (currentColor) */
function verreSVG(plein){
  var w = document.createElement("span");
  w.className = "verre-ic" + (plein ? "" : " vide");
  w.innerHTML = '<svg viewBox="0 0 24 32" aria-hidden="true">'
    + '<polygon class="liquide" points="4.25,11 19.75,11 18.62,26 5.38,26"/>'
    + '<ellipse class="surface" cx="12" cy="11" rx="7.75" ry="1.3"/>'
    + '<polygon class="fond" points="5.38,26 18.62,26 18.45,29.4 5.55,29.4"/>'
    + '<path class="contour" d="M3 2H21L18.5 29.2Q18.3 30.6 16.8 30.6H7.2Q5.7 30.6 5.5 29.2Z"/>'
    + '<line class="reflet" x1="6.2" y1="5" x2="7.5" y2="23"/></svg>';
  return w;
}
function verreBu(cote){
  var d = el("div","verre-bu c"+cote);
  d.appendChild(verreSVG(true));
  d.appendChild(el("p","verre","+1 verre"));
  return d;
}

/* Arrêter le jeu : 1er appui demande confirmation, 2e appui ramène à l'accueil */
var quitterTimer = null;
function annulerQuitter(){ clearTimeout(quitterTimer); quitterTimer=null; var b=$("btnQuitter"); b.classList.remove("confirme"); b.textContent="Arrêter le jeu"; }
function quitter(){ S.jeu=null; S.perdant=null; S.fait=false; S.gt=null; S.gc=null; S.oblig=false;
  if(S.labo && S.ecran!=="labo"){ retourLabo(); return; }
  S.labo=false; montrer("accueil"); }
$("btnQuitter").onclick = function(){
  var b=$("btnQuitter");
  if(b.classList.contains("confirme")){ quitter(); return; }
  b.classList.add("confirme"); b.textContent="Appuie encore pour quitter";
  quitterTimer = setTimeout(annulerQuitter, 3000);
};

/* Accueil */
$("btnJouer").onclick = function(){ montrer("joueurs"); majNoms(); };
$("btnBanqueAccueil").onclick = function(){ ouvrirBanque(); };

/* Joueurs */
function majNoms(){
  S.noms.b = $("nomB").value.trim(); S.noms.v = $("nomV").value.trim();
  [["carteB","b"],["carteV","v"]].forEach(function(c){
    var carte = $(c[0]), avant = carte.classList.contains("pret"), apres = !!S.noms[c[1]];
    carte.classList.toggle("pret", apres);
    var im = carte.querySelector(".av");
    if(im && apres && !avant){ im.className = "av"; void im.offsetWidth; im.className = "av hop"; }
  });
  $("btnParti").disabled = !(S.noms.b && S.noms.v);
}
$("nomB").oninput = majNoms; $("nomV").oninput = majNoms;
$("btnParti").onclick = function(){ majNoms(); if(S.noms.b&&S.noms.v) montrer("modes"); };

/* Modes */
$("btnClassique").onclick = function(){
  S.labo = false;
  S.partie = 0; S.tot = {b:stats0(),v:stats0()}; paquets = {};
  lancerIntro();
};

$("btnBanque").onclick = function(){ ouvrirBanque(); };
/* Intro de partie */
function lancerIntro(){
  S.manche = 1; S.st = {b:stats0(),v:stats0()};
  $("introNum").textContent = "Partie "+(S.partie+1)+" sur "+SEQUENCE.length;
  $("introNiv").textContent = SEQUENCE[S.partie].nom;
  $("introSub").textContent = SEQUENCE[S.partie].desc+" · "+nbManches()+" manches";
  montrer("intro");
}
$("btnLancer").onclick = function(){ roulette(); };

/* Roulette */
/* Sons courts (débloqués au premier clic ou touche sur la télé) */
var audio = null;
function debloquerSon(){ try{ if(!audio){ var AC = window.AudioContext||window.webkitAudioContext; if(AC) audio = new AC(); } if(audio && audio.state==="suspended") audio.resume(); }catch(e){} }
document.addEventListener("pointerdown", debloquerSon);
document.addEventListener("keydown", debloquerSon);
function bip(freq, duree, vol){
  if(!audio || audio.state!=="running") return;
  try{
    var t = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
    o.type = "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(vol||0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t+duree);
    o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t+duree+0.02);
  }catch(e){}
}

/* La roue */
var NS = "http://www.w3.org/2000/svg", rot = 0;
function sv(tag, attrs){ var e = document.createElementNS(NS, tag); for(var k in attrs) e.setAttribute(k, attrs[k]); return e; }
function construireRoue(){
  var svg = $("roueSvg");
  if(svg.getAttribute("data-n")===String(JEUX.length)) return;
  svg.innerHTML = ""; svg.setAttribute("data-n", String(JEUX.length));
  var defs = sv("defs",{}), f = sv("filter",{id:"lueur",x:"-50%",y:"-50%",width:"200%",height:"200%"});
  f.appendChild(sv("feGaussianBlur",{stdDeviation:"2.2",result:"b"}));
  var m = sv("feMerge",{}); m.appendChild(sv("feMergeNode",{in:"b"})); m.appendChild(sv("feMergeNode",{in:"SourceGraphic"})); f.appendChild(m);
  defs.appendChild(f); svg.appendChild(defs);
  svg.appendChild(sv("circle",{class:"rim2",r:"100"}));
  var n = JEUX.length, seg = 360/n, R = 94, g = sv("g",{id:"roueG",transform:"rotate("+rot+")"});
  JEUX.forEach(function(j,i){
    var a0 = (i*seg-90)*Math.PI/180, a1 = ((i+1)*seg-90)*Math.PI/180;
    var d = "M0 0 L"+(R*Math.cos(a0)).toFixed(2)+" "+(R*Math.sin(a0)).toFixed(2)+" A"+R+" "+R+" 0 "+(seg>180?1:0)+" 1 "+(R*Math.cos(a1)).toFixed(2)+" "+(R*Math.sin(a1)).toFixed(2)+" Z";
    g.appendChild(sv("path",{d:d,id:"seg"+i,class:"seg s"+(i%3)}));
    /* Texte le long du rayon, du bord vers le centre ; retourné sur la moitié gauche pour rester lisible */
    var c = i*seg+seg/2, gauche = c>180, tr = "rotate("+(gauche ? c+90 : c-90)+")";
    var x = gauche ? "-87" : "87", ancre = gauche ? "start" : "end";
    var place = 64, fs = Math.min(8, place/(j.nom.length*0.56));
    var t1 = sv("text",{id:"lbl"+i,class:"lbl",x:x,y:"1",dy:"0","text-anchor":ancre,transform:tr,style:"font-size:"+fs.toFixed(2)+"px"}); t1.textContent = j.nom;
    var t2 = sv("text",{id:"typ"+i,class:"typ",x:x,y:"8.5","text-anchor":ancre,transform:tr}); t2.textContent = j.type;
    g.appendChild(t2); g.appendChild(t1);
  });
  svg.appendChild(g);
  svg.appendChild(sv("circle",{class:"rim",r:"95",filter:"url(#lueur)"}));
  for(var k=0;k<28;k++){
    var a = k*360/28*Math.PI/180;
    svg.appendChild(sv("circle",{class:"ampoule"+(k%2?"":" on"),cx:(105*Math.cos(a)).toFixed(2),cy:(105*Math.sin(a)).toFixed(2),r:"2.6",filter:"url(#lueur)"}));
  }
  svg.appendChild(sv("circle",{class:"hub",r:"15"}));
  svg.appendChild(sv("circle",{class:"pointeur",r:"3.5",filter:"url(#lueur)"}));
  svg.appendChild(sv("polygon",{class:"pointeur",points:"0,-84 -9,-112 9,-112",filter:"url(#lueur)"}));
}
function ampoules(fn){ Array.prototype.forEach.call($("roueSvg").querySelectorAll(".ampoule"), fn); }
function roulette(){
  montrer("roulette");
  $("rouletteTitre").textContent = "Manche "+S.manche+" · tirage du mini-jeu";
  $("rouletteNom").textContent = "";
  construireRoue();
  JEUX.forEach(function(j,i){ $("seg"+i).classList.remove("gagne"); $("lbl"+i).classList.remove("gagne-t"); $("typ"+i).classList.remove("gagne-t"); });
  var n = JEUX.length, seg = 360/n, choix = rnd(n);
  var cible = (((-(choix*seg + seg/2 + (Math.random()-0.5)*seg*0.6)) % 360) + 360) % 360;
  var depart = rot, fin = depart + 360*5 + (((cible - depart) % 360) + 360) % 360;
  var duree = 5200, g0 = gen, dernier = null, t0 = null;
  function frame(now){
    if(g0!==gen) return;
    if(t0===null) t0 = now;
    var p = Math.min(1, (now-t0)/duree), e = 1 - Math.pow(1-p, 4);
    rot = depart + (fin-depart)*e;
    $("roueG").setAttribute("transform","rotate("+rot.toFixed(2)+")");
    var s = Math.floor(((((-rot) % 360) + 360) % 360) / seg);
    if(s!==dernier){ dernier = s; bip(1500, 0.03, 0.05); var k=0; ampoules(function(a){ a.classList.toggle("on", (k++ + s) % 2 === 0); }); }
    if(p<1) requestAnimationFrame(frame); else { rot = rot % 360; atterrir(choix); }
  }
  plus_tard(function(){ requestAnimationFrame(frame); }, 500);
}
function atterrir(choix){
  $("seg"+choix).classList.add("gagne"); $("lbl"+choix).classList.add("gagne-t"); $("typ"+choix).classList.add("gagne-t");
  $("rouletteNom").textContent = JEUX[choix].nom;
  bip(880, 0.15, 0.07); plus_tard(function(){ bip(1320, 0.25, 0.07); }, 130);
  var c = 0;
  (function flash(){ var on = c%2===0; ampoules(function(a){ a.classList.toggle("on", on); }); c++; if(c<10) plus_tard(flash, 140); })();
  plus_tard(function(){ demarrer(JEUX[choix].id); }, 2200);
}
function demarrer(id){ if(id==="reflexe") reflexe(); else if(id==="chrono") chrono(); else if(id==="course") course(); else if(id==="uno") uno(); else if(id==="corde") corde(); else if(id==="duel") duel(); else if(id==="quiz") quiz(); else if(id==="qui") qui(); else if(id==="mages") mages(); else if(id==="traque") traque(); else carteHaute(); }
