/* Le Jeu de Noël · Contenu de base, outils, état du jeu, banque à gages (données), avatars, durées, roues du corps */
"use strict";
/* ---------- Contenu du prototype ---------- */
var MANCHES = 10;
var SEQUENCE = [
  {nom:"Medium",     manches:5,  niveaux:["medium"],            desc:"Partie d'introduction, que des gages medium"},
  {nom:"Hard",       manches:10, niveaux:["medium","hard"],     desc:"Gages tirés au hasard entre medium et hard"},
  {nom:"Impossible", manches:10, niveaux:["hard","impossible"], desc:"Gages tirés au hasard entre hard et impossible"}
];
function nbManches(){ return SEQUENCE[S.partie].manches || MANCHES; }
var OBJECTIF = 500;
var NOM_NIV = {medium:"Medium", hard:"Hard", impossible:"Impossible"};
/* Gages d'exemple, utilisés seulement quand la banque n'a rien pour ce perdant et ce niveau */
var GAGES = {
  impossible:[
    "Fais 30 pompes d'affilée.",
    "Échange un vêtement avec l'autre jusqu'à la fin de la partie."
  ],
  medium:[
    "Imite l'autre pendant 20 secondes, sans rire.",
    "Raconte ton moment le plus gênant de l'année.",
    "Montre la dernière photo de ta galerie.",
    "Chante le refrain d'une chanson choisie par l'autre.",
    "Fais 15 squats pendant que l'autre compte à voix haute."
  ],
  hard:[
    "L'autre choisit ta photo de profil pour 24 heures.",
    "Danse 30 secondes sur une musique choisie par l'autre.",
    "Donne un massage des épaules d'une minute à l'autre."
  ]
};
var JEUX = [
  {id:"reflexe", type:"Réflexe", nom:"Premier qui tape"},
  {id:"carte",   type:"Chance",  nom:"Carte haute"},
  {id:"chrono",  type:"Feeling", nom:"Chrono à l'aveugle"},
  {id:"course",  type:"Course",  nom:"Mini circuit"},
  {id:"uno",     type:"Cartes",  nom:"Dernière carte"},
  {id:"corde",   type:"Force",   nom:"Tir à la corde"},
  {id:"duel",    type:"Combat",  nom:"Duel de tanks"},
  {id:"quiz",    type:"Culture", nom:"Quiz culture G"},
  {id:"qui",     type:"Déduction", nom:"Qui est-ce ?"},
  {id:"mages",   type:"Combat", nom:"Duel de mages"},
  {id:"traque",  type:"Poursuite", nom:"La Traque"}
];
var VALEURS = {11:"V",12:"D",13:"R",14:"A"};

/* ---------- Outils ---------- */
function $(id){return document.getElementById(id)}
function rnd(n){return Math.floor(Math.random()*n)}
function melange(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1),t=a[i];a[i]=a[j];a[j]=t}return a}
function autre(s){return s==="b"?"v":"b"}
function stats0(){return {perdu:0,fait:0,bois:0}}

var estManette = location.hash.indexOf("#manette")===0;
/* Mode « banque seule » (…#banque) : pour écrire les gages depuis un téléphone sans prendre la place de la télé */
var modeBanque = !estManette && /(^#|&)banque\b/.test(location.hash);

/* ---------- État du jeu ---------- */
var S = {
  ecran:"accueil", noms:{b:"",v:""}, partie:0, manche:1,
  st:{b:stats0(),v:stats0()}, tot:{b:stats0(),v:stats0()},
  jeu:null, perdant:null, fait:false
};
var paquets = {}, utilises = {};
function tirerGage(){
  var niv = SEQUENCE[S.partie].niveaux;
  var pour = S.perdant==="b" ? "lui" : "elle";
  var ok = function(g){ return g.pour===pour && niv.indexOf(g.niveau)>=0; };
  var dispo = BANQUE.filter(function(g){ return ok(g) && !utilises[g.id]; });
  if(!dispo.length){
    dispo = BANQUE.filter(ok);
    dispo.forEach(function(g){ delete utilises[g.id]; });
  }
  if(dispo.length){
    var g = dispo[rnd(dispo.length)]; utilises[g.id] = 1;
    return {niveau:g.niveau, texte:g.texte, dmin:g.dmin, dmax:g.dmax, corps:g.corps, obligatoire:!!g.obligatoire};
  }
  var n = niv[rnd(niv.length)];
  if(!paquets[n] || !paquets[n].length) paquets[n] = melange(GAGES[n]);
  return {niveau:n, texte:paquets[n].pop(), exemple:true};
}

/* ---------- Banque à gages (sauvegardée en ligne) ---------- */
var db = null, BANQUE = [], banqueEtat = "chargement";
var F = {pour:"lui", niveau:"medium"};
var editId = null, editTexte = "", supId = null, supT = null;
var CLE = null, unsubBanque = null;
function gagesCol(){ return db.collection("salons").doc(CLE).collection("gages"); }
function brancherDb(){
  var t = setTimeout(function(){ if(banqueEtat==="chargement"){ banqueEtat="lent"; rendreBanque(); } }, 10000);
  if(unsubBanque) unsubBanque();
  unsubBanque = gagesCol().onSnapshot(function(snap){
    clearTimeout(t); banqueEtat = "ok";
    BANQUE = snap.docs.map(function(d){ var x = d.data()||{}; return {id:d.id, texte:String(x.texte||""), pour:x.pour, niveau:x.niveau, cree:+x.cree||0, dmin:+x.dmin||0, dmax:+x.dmax||0, corps:CORPS[x.corps] ? x.corps : "", obligatoire:!!x.obligatoire}; })
      .filter(function(g){ return g.texte && (g.pour==="lui"||g.pour==="elle") && NOM_NIV[g.niveau]; });
    rendreBanque();
  }, function(){ clearTimeout(t); banqueEtat = "erreur"; rendreBanque(); });
  chargerAvatars();
  brancherPersos();
}
function nomPour(p){ return p==="lui" ? "Lui" : "Elle"; }

/* ---------- Avatars cartoon (rangés en privé : salons/<clé>/medias/avatars) ---------- */
var AVATARS = null;   /* {b, v, tb, tv} : images entières et têtes, en data: URL */
function imgAvatar(cote, cls){
  var i = document.createElement("img"); i.src = AVATARS[cote]; i.alt = ""; i.className = "av" + (cls ? " "+cls : ""); i.draggable = false;
  return i;
}
function chargerAvatars(){
  if(!db || !CLE) return;
  db.collection("salons").doc(CLE).collection("medias").doc("avatars").get().then(function(d){
    var x = d.exists ? d.data() : null;
    if(x && /^data:image\//.test(x.b||"") && /^data:image\//.test(x.v||"")){ AVATARS = x; majAvatars(); }
  }).catch(function(){});
}
/* Les avatars ne servent que pour les portraits ronds de la barre des verres */
function majAvatars(){ if(AVATARS) majHud(); }
function el(tag, cls, txt){ var e = document.createElement(tag); if(cls) e.className = cls; if(txt!=null) e.textContent = txt; return e; }
function rendreBanque(){
  var total = BANQUE.length;
  $("bqTotal").textContent = total+" / "+OBJECTIF+" gages écrits";
  $("bqJauge").style.width = Math.min(100, total/OBJECTIF*100)+"%";
  Array.prototype.forEach.call($("bqPour").children, function(b){
    var p = b.getAttribute("data-pour");
    b.textContent = nomPour(p)+" · "+BANQUE.filter(function(g){return g.pour===p}).length;
    b.setAttribute("aria-pressed", String(F.pour===p));
  });
  Array.prototype.forEach.call($("bqNiv").children, function(b){
    var n = b.getAttribute("data-niv");
    b.textContent = NOM_NIV[n]+" · "+BANQUE.filter(function(g){return g.pour===F.pour && g.niveau===n}).length;
    b.setAttribute("aria-pressed", String(F.niveau===n));
  });
  $("bqAjouter").textContent = "Ajouter · "+nomPour(F.pour)+" · "+NOM_NIV[F.niveau];
  var nob = nbObligatoires(F.pour);
  $("bqObligN").textContent = "("+nob+" / "+MAX_OBLIG+" pour "+nomPour(F.pour)+")";
  $("bqOblig").disabled = nob>=MAX_OBLIG; if(nob>=MAX_OBLIG) $("bqOblig").checked = false;
  $("bqAjouter").disabled = !db || !CLE;
  $("bqCle").hidden = banqueEtat!=="cle";
  var courant = F.pour+"|"+F.niveau;
  if(courant!==dernierFiltre){ ouverts[courant] = true; dernierFiltre = courant; }
  var ul = $("bqListe"); ul.innerHTML = "";
  ["lui","elle"].forEach(function(p){
    var bloc = el("li","bq-bloc "+p);
    var tete = el("div","bq-bloc-tete");
    tete.appendChild(el("h3",null,nomPour(p)+" · "+BANQUE.filter(function(g){return g.pour===p}).length+" gages"));
    bloc.appendChild(tete);
    if(!deverrouille[p]){
      var v = el("div","bq-verrou");
      v.appendChild(el("span","sub","Gages cachés. Entre le code pour les voir."));
      var inp = el("input"); inp.id = "code-"+p; inp.type = "password"; inp.inputMode = "numeric"; inp.maxLength = 8; inp.autocomplete = "off"; inp.placeholder = "Code";
      inp.value = codeSaisi[p]||""; inp.oninput = function(){ codeSaisi[p] = inp.value; };
      var ok = el("button","mini ok","Déverrouiller");
      var essayer = function(){
        if((codeSaisi[p]||"") === (CODES[p]||"0000")){ deverrouille[p] = true; codeErreur[p] = false; }
        else codeErreur[p] = true;
        codeSaisi[p] = ""; rendreBanque();
      };
      ok.onclick = essayer;
      inp.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); essayer(); } });
      v.appendChild(inp); v.appendChild(ok);
      if(codeErreur[p]) v.appendChild(el("span","bq-err","Code incorrect"));
      bloc.appendChild(v); ul.appendChild(bloc);
      return;
    }
    var lock = el("button","mini","Verrouiller");
    lock.onclick = function(){ deverrouille[p] = false; editId = null; rendreBanque(); };
    tete.appendChild(lock);
    ["medium","hard","impossible"].forEach(function(n){
      var items = BANQUE.filter(function(g){ return g.pour===p && g.niveau===n; }).sort(function(a,b){ return b.cree-a.cree; });
      var key = p+"|"+n, det = el("details","bq-sec "+n);
      if(ouverts[key]) det.open = true;
      det.addEventListener("toggle", function(){ ouverts[key] = det.open; });
      det.appendChild(el("summary",null,NOM_NIV[n]+" · "+items.length));
      var liste = el("ul");
      items.forEach(function(g){ liste.appendChild(ligneGage(g)); });
      if(!items.length) liste.appendChild(el("li","bq-rien","Aucun gage pour l'instant."));
      det.appendChild(liste); bloc.appendChild(det);
    });
    ul.appendChild(bloc);
  });
  var vide = "";
  if(banqueEtat==="config") vide = "La banque n'est pas encore reliée à Firebase : remplis le fichier config.js (voir le guide).";
  else if(banqueEtat==="cle") vide = "";
  else if(banqueEtat==="indispo") vide = "Impossible de joindre la banque. Vérifie la connexion internet.";
  else if(banqueEtat==="chargement") vide = "Chargement des gages…";
  else if(banqueEtat==="lent") vide = "Le chargement prend du temps. Vérifie ta connexion.";
  else if(banqueEtat==="erreur") vide = "Impossible de lire la banque. Recharge la page.";
  $("bqVide").textContent = vide;
}
var ouverts = {}, dernierFiltre = null, editDmin = 0, editDmax = 0, editCorps = "", editOblig = false;
/* Codes de la banque : chacun ne voit que les gages dont il a le code */
var CODES = {lui:"0000", elle:"0000"}, deverrouille = {lui:false, elle:false}, codeSaisi = {}, codeErreur = {};
function ligneGage(g){
    var li = el("li"), acts = el("div","acts");
    if(editId===g.id){
      var ta = el("textarea"); ta.rows = 2; ta.value = editTexte; ta.oninput = function(){ editTexte = ta.value; };
      var ed = el("div","bq-duree"), sMin = el("select"), sMax = el("select");
      remplirSelectDuree(sMin, editDmin); remplirSelectDuree(sMax, editDmax);
      sMin.onchange = function(){ editDmin = +sMin.value||0; }; sMax.onchange = function(){ editDmax = +sMax.value||0; };
      ed.appendChild(el("span","sub","Minuteur : entre")); ed.appendChild(sMin); ed.appendChild(el("span","sub","et")); ed.appendChild(sMax);
      var sCo = el("select"); remplirSelectCorps(sCo, editCorps); sCo.onchange = function(){ editCorps = sCo.value; };
      ed.appendChild(el("span","sub","Roue :")); ed.appendChild(sCo);
      var lo = el("label","bq-oblig"), co = document.createElement("input"); co.type = "checkbox"; co.checked = editOblig;
      co.disabled = !editOblig && nbObligatoires(g.pour)>=MAX_OBLIG; co.onchange = function(){ editOblig = co.checked; };
      lo.appendChild(co); lo.appendChild(el("span",null," 🔒 Obligatoire")); ed.appendChild(lo);
      var sv = el("button","mini ok","Enregistrer"), an = el("button","mini","Annuler");
      sv.onclick = function(){
        var t = editTexte.trim().slice(0,300); if(!t) return;
        var d = lireDurees(sMin, sMax);
        gagesCol().doc(g.id).update({texte:t, dmin:d.dmin||null, dmax:d.dmax||null, corps:CORPS[sCo.value] ? sCo.value : null, obligatoire:co.checked ? true : null}).catch(function(){ $("bqMsg").textContent = "La modification n'a pas été enregistrée, réessaie."; });
        editId = null; rendreBanque();
      };
      an.onclick = function(){ editId = null; rendreBanque(); };
      li.appendChild(ta); li.appendChild(ed); acts.appendChild(sv); acts.appendChild(an);
    } else {
      var pt = el("p",null,g.texte);
      if(g.dmin) pt.appendChild(el("span","bq-chrono","⏱ "+(g.dmin===g.dmax ? fmtDuree(g.dmin) : fmtDuree(g.dmin)+" – "+fmtDuree(g.dmax))));
      if(g.corps) pt.appendChild(el("span","bq-chrono corps","◎ roue "+CORPS[g.corps].nom));
      if(g.obligatoire){ li.classList.add("oblig"); pt.insertBefore(el("span","bq-badge-oblig","🔒 OBLIGATOIRE"), pt.firstChild); }
      li.appendChild(pt);
      var md = el("button","mini","Modifier");
      md.onclick = function(){ editId = g.id; editTexte = g.texte; editDmin = g.dmin||0; editDmax = g.dmax||0; editCorps = g.corps||""; editOblig = !!g.obligatoire; rendreBanque(); };
      var sp = el("button","mini danger", supId===g.id ? "Confirmer" : "Supprimer");
      sp.onclick = function(){
        if(supId===g.id){ supId = null; gagesCol().doc(g.id).delete().catch(function(){ $("bqMsg").textContent = "La suppression a échoué, réessaie."; }); return; }
        supId = g.id; clearTimeout(supT); supT = setTimeout(function(){ supId = null; rendreBanque(); }, 3000); rendreBanque();
      };
      acts.appendChild(md); acts.appendChild(sp);
    }
    li.appendChild(acts);
    return li;
}
/* Durées proposées pour les gages à minuteur (en secondes) */
var DUREES = [15,30,45,60,75,90,105,120,150,180,210,240,300,360,420,480,600,720,900,1200,1800];
function fourchette(gt, mot, avant){ return gt.dmin===gt.dmax ? fmtDuree(gt.dmin) : (avant||"")+fmtDuree(gt.dmin)+mot+fmtDuree(gt.dmax); }
function fmtDuree(sec){
  sec = Math.round(sec); var m = Math.floor(sec/60), r = sec%60;
  if(!m) return r+" s";
  return m+" min"+(r ? " "+(r<10?"0":"")+r : "");
}
function remplirSelectDuree(sel, val){
  sel.innerHTML = "";
  var o = document.createElement("option"); o.value = "0"; o.textContent = "—"; sel.appendChild(o);
  DUREES.forEach(function(d){ var op = document.createElement("option"); op.value = String(d); op.textContent = fmtDuree(d); sel.appendChild(op); });
  sel.value = String(val||0);
}
function lireDurees(selMin, selMax){
  var a = +selMin.value||0, b = +selMax.value||0;
  if(!a && !b) return {dmin:0, dmax:0};
  if(!a) a = b; if(!b) b = a;
  return {dmin:Math.min(a,b), dmax:Math.max(a,b)};
}
remplirSelectDuree($("bqDmin"), 0); remplirSelectDuree($("bqDmax"), 0);
/* Roues du corps : féminine et masculine */
var CORPS = {
  f: {nom:"féminine", parties:["Pussy","Seins","Fesses","Bouche","Cou","Bras","Main","Ventre","Cuisse","Pied","Dos","Jambe"]},
  m: {nom:"masculine", parties:["Bite","Bouche","Cou","Bras","Main","Ventre","Cuisse","Pied","Dos","Jambe"]}
};
/* Emoji de chaque partie du corps (roue et résultat) */
var EMOJI_CORPS = {pussy:"🐱", seins:"🍈", fesses:"🍑", bite:"🥒", bouche:"👄", cou:"🦒", bras:"💪", main:"✋", ventre:"🍫", cuisse:"🍗", pied:"🦶", dos:"🔙", jambe:"🦵"};
function emojiCorps(nom){ return EMOJI_CORPS[String(nom||"").toLowerCase()] || ""; }
function remplirSelectCorps(sel, val){
  sel.innerHTML = "";
  [["","—"],["f","Féminine"],["m","Masculine"]].forEach(function(o){ var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op); });
  sel.value = val||"";
}
remplirSelectCorps($("bqCorps"), "");
/* Gages obligatoires : pas de « Je bois », 3 maximum par personne */
var MAX_OBLIG = 3;
function nbObligatoires(pour){ return BANQUE.filter(function(g){ return g.pour===pour && g.obligatoire; }).length; }
function ajouterGages(){
  if(!db) return;
  var lignes = $("bqTexte").value.split(/\r?\n/).map(function(l){ return l.trim(); }).filter(Boolean);
  if(!lignes.length){ $("bqMsg").textContent = "Écris d'abord un gage."; return; }
  var oblig = $("bqOblig").checked;
  if(oblig && nbObligatoires(F.pour)+lignes.length > MAX_OBLIG){ $("bqMsg").textContent = "Maximum "+MAX_OBLIG+" gages obligatoires pour "+nomPour(F.pour)+" : il en reste "+Math.max(0, MAX_OBLIG-nbObligatoires(F.pour))+"."; return; }
  var base = Date.now();
  Promise.all(lignes.map(function(l,i){
    var d = lireDurees($("bqDmin"), $("bqDmax")), doc = {texte:l.slice(0,300), pour:F.pour, niveau:F.niveau, cree:base+i};
    if(d.dmin){ doc.dmin = d.dmin; doc.dmax = d.dmax; }
    if(CORPS[$("bqCorps").value]) doc.corps = $("bqCorps").value;
    if(oblig) doc.obligatoire = true;
    return gagesCol().add(doc);
  })).then(function(){
    $("bqMsg").textContent = lignes.length===1 ? "Gage ajouté." : lignes.length+" gages ajoutés.";
  }).catch(function(){ $("bqMsg").textContent = "Certains gages n'ont pas été enregistrés, vérifie la liste."; });
  $("bqTexte").value = "";
  remplirSelectDuree($("bqDmin"), 0); remplirSelectDuree($("bqDmax"), 0); remplirSelectCorps($("bqCorps"), ""); $("bqOblig").checked = false;
}
function ouvrirBanque(){ deverrouille = {lui:false, elle:false}; codeSaisi = {}; codeErreur = {}; editId = null; montrer("banque"); $("bqMsg").textContent = ""; rendreBanque(); try{ $("bqTexte").focus({preventScroll:true}); }catch(e){} }
$("bqRetour").onclick = function(){ editId = null; deverrouille = {lui:false, elle:false}; montrer(S.noms.b && S.noms.v ? "modes" : "accueil"); };
$("bqAjouter").onclick = ajouterGages;
$("bqTexte").addEventListener("keydown", function(e){ if(e.key==="Enter" && (e.ctrlKey||e.metaKey)){ e.preventDefault(); ajouterGages(); } });
Array.prototype.forEach.call($("bqPour").children, function(b){ b.onclick = function(){ F.pour = b.getAttribute("data-pour"); editId = null; rendreBanque(); }; });
Array.prototype.forEach.call($("bqNiv").children, function(b){ b.onclick = function(){ F.niveau = b.getAttribute("data-niv"); editId = null; rendreBanque(); }; });

/* ---------- Minuteries annulables ---------- */
var gen = 0;
function plus_tard(fn,ms){var g=gen;setTimeout(function(){if(g===gen)fn()},ms)}
