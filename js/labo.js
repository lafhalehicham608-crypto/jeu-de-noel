/* Le Jeu de Noël · Labo : tester chaque mini-jeu et chaque écran de gage sans lancer une partie */
"use strict";
var LABO = {partie:0, apres:"gage", el:"", perdant:"b"};
try{ var lbSauve = JSON.parse(localStorage.getItem("jdn-labo")||"null"); if(lbSauve) for(var lbK in LABO) if(lbSauve[lbK]!==undefined) LABO[lbK] = lbSauve[lbK]; }catch(e){}
function sauverLabo(){ try{ localStorage.setItem("jdn-labo", JSON.stringify(LABO)); }catch(e){} }

var LB_JEUX_INFO = {
  reflexe:"Taper dès que l'écran s'allume", carte:"La carte la plus basse perd", chrono:"Taper au plus près de la cible",
  course:"Course vue de dessus, 2 tours", uno:"Main privée sur le téléphone", corde:"Taper le plus vite possible",
  duel:"Arène, 3 vies chacun", quiz:"Premier à 2 bonnes réponses", qui:"16 personnages, fiches sur les téléphones",
  mages:"Combat de profil, 2 rounds", traque:"Kendrick chasse Emilia"
};
/* Gages de test : textes neutres, chacun montre une option */
var LB_GAGES = [
  {id:"simple", nom:"Gage simple", info:"Je le fais / Je bois", g:{texte:"Gage test : fais un compliment à l'autre."}},
  {id:"minuteur", nom:"Avec minuteur", info:"Durée tirée entre 30 s et 1 min 30", g:{texte:"Gage test : masse les épaules de l'autre pendant X.", dmin:30, dmax:90}},
  {id:"roue", nom:"Avec roue du corps", info:"Partie du corps de l'autre", g:{texte:"Gage test : un bisou sur Z.", corps:"auto"}},
  {id:"complet", nom:"Minuteur + roue", info:"Roue, puis durée, puis minuteur", g:{texte:"Gage test : masse Z de l'autre pendant X.", dmin:15, dmax:60, corps:"auto"}},
  {id:"oblig", nom:"Gage obligatoire", info:"Pas de « Je bois », cadre doré", g:{texte:"Gage test obligatoire : fais 10 squats.", obligatoire:true}},
  {id:"banque", nom:"Tiré de la banque", info:"Un vrai gage, selon le niveau choisi", g:null},
  {id:"bq-oblig", nom:"Obligatoire de la banque", info:"Un des gages obligatoires enregistrés", g:null}
];

function reinitLabo(){
  S.labo = true; S.partie = LABO.partie; S.manche = 1;
  S.st = {b:stats0(),v:stats0()}; S.tot = {b:stats0(),v:stats0()}; paquets = {};
  S.jeu = null; S.perdant = null; S.fait = false; S.gt = null; S.gc = null; S.oblig = false;
  if(!S.noms.b) S.noms.b = "Lui"; if(!S.noms.v) S.noms.v = "Elle";
}
function retourLabo(){
  S.jeu = null; S.perdant = null; S.fait = false; S.gt = null; S.gc = null; S.oblig = false;
  if(typeof touches!=="undefined") touches = {};
  if(typeof DIRK!=="undefined") DIRK = {b:0,v:0};
  S.labo = true; rendreLabo(); montrer("labo");
}
function laboJeu(id){ reinitLabo(); demarrer(id); }
function laboGage(t){
  reinitLabo();
  var s = LABO.perdant, pour = s==="b" ? "lui" : "elle", g = null;
  if(t.id==="banque"){
    var niv = SEQUENCE[S.partie].niveaux, dispo = BANQUE.filter(function(x){ return x.pour===pour && niv.indexOf(x.niveau)>=0; });
    if(!dispo.length){ laboMessage("La banque n'a pas de gage "+niv.map(function(n){ return NOM_NIV[n]; }).join(" ou ")+" pour "+pour+"."); return; }
    g = dispo[rnd(dispo.length)];
  } else if(t.id==="bq-oblig"){
    var ob = BANQUE.filter(function(x){ return x.pour===pour && x.obligatoire; });
    if(!ob.length){ laboMessage("Aucun gage obligatoire enregistré pour "+pour+"."); return; }
    g = ob[rnd(ob.length)];
  } else {
    g = {}; for(var k in t.g) g[k] = t.g[k];
    if(g.corps==="auto") g.corps = s==="b" ? "f" : "m";
    g.labo = true; g.niveau = "medium";
  }
  S.perdant = s;
  afficherGage({niveau:g.niveau, texte:g.texte, dmin:g.dmin, dmax:g.dmax, corps:g.corps, obligatoire:!!g.obligatoire, labo:!!g.labo});
}
function laboAutre(id){
  reinitLabo();
  if(id==="roulette"){ roulette(); return; }
  if(id==="libre"){ montrer("libre"); $("libreB").textContent = S.noms.b+" a gagné"; $("libreV").textContent = S.noms.v+" a gagné"; return; }
  if(id==="fin"){
    S.st = {b:{perdu:3,fait:2,bois:1}, v:{perdu:2,fait:1,bois:1}};
    finPartie();
  }
}
var lbMsgT = null;
function laboMessage(txt){
  var m = $("lbMsg"); if(!m){ m = el("p","lb-msg"); m.id = "lbMsg"; $("lbGages").after(m); }
  m.textContent = txt; m.hidden = false; clearTimeout(lbMsgT); lbMsgT = setTimeout(function(){ m.hidden = true; }, 4000);
}

function lbChoix(root, options, val, change){
  root.innerHTML = "";
  options.forEach(function(o){
    var b = el("button","lb-opt"+(o.cls ? " "+o.cls : ""), o.nom);
    b.setAttribute("aria-pressed", String(o.v===val));
    b.onclick = function(){ change(o.v); sauverLabo(); rendreLabo(); try{ $(root.id).querySelector('[aria-pressed="true"]').focus({preventScroll:true}); }catch(e){} };
    root.appendChild(b);
  });
}
function lbTuile(root, nom, info, fn, cls){
  var b = el("button","lb-tuile"+(cls ? " "+cls : ""));
  b.appendChild(el("span","lb-nom",nom)); b.appendChild(el("span","lb-info",info));
  b.onclick = fn; root.appendChild(b);
}
function rendreLabo(){
  lbChoix($("lbPartie"), SEQUENCE.map(function(q,i){ return {v:i, nom:q.nom}; }), LABO.partie, function(v){ LABO.partie = v; });
  lbChoix($("lbApres"), [{v:"gage", nom:"Gage puis retour"},{v:"retour", nom:"Retour direct"}], LABO.apres, function(v){ LABO.apres = v; });
  var els = [{v:"", nom:"Hasard"}]; Object.keys(ELEMENTS).forEach(function(k){ els.push({v:k, nom:ELEMENTS[k].nom || (k.charAt(0).toUpperCase()+k.slice(1))}); });
  lbChoix($("lbElement"), els, LABO.el, function(v){ LABO.el = v; });
  lbChoix($("lbPerdant"), [{v:"b", nom:S.noms.b||"Lui", cls:"b"},{v:"v", nom:S.noms.v||"Elle", cls:"v"}], LABO.perdant, function(v){ LABO.perdant = v; });
  var j = $("lbJeux"); j.innerHTML = "";
  JEUX.forEach(function(x){ lbTuile(j, x.nom, LB_JEUX_INFO[x.id]||x.type, function(){ laboJeu(x.id); }); });
  var g = $("lbGages"); g.innerHTML = "";
  LB_GAGES.forEach(function(t){ lbTuile(g, t.nom, t.info, function(){ laboGage(t); }, t.id.indexOf("oblig")>=0 ? "or" : ""); });
  var a = $("lbAutres"); a.innerHTML = "";
  lbTuile(a, "Roulette", "Tire un mini-jeu au hasard", function(){ laboAutre("roulette"); });
  lbTuile(a, "Choix libre", "L'écran « Passer ce jeu »", function(){ laboAutre("libre"); });
  lbTuile(a, "Fin de partie", "Tableau avec des chiffres d'exemple", function(){ laboAutre("fin"); });
}
$("btnLabo").onclick = function(){ retourLabo(); };
$("btnLaboRetour").onclick = function(){ S.labo = false; montrer("modes"); };
