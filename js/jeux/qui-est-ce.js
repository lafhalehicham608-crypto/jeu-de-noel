/* Le Jeu de Noël · Mini-jeu : Qui est-ce ? (télé + téléphone) */
"use strict";
/* ================= Mini-jeu 9 : Qui est-ce ? =================
   16 personnages, chacun en a un secret. Un tour sur deux : un thème imposé (celui qui joue pose
   sa question à voix haute, l'autre répond sur son téléphone), sinon une question imposée à laquelle
   les deux répondent pour leur propre personnage. Accuser juste = gagné, accuser faux = éliminé. */
var QUI_N = 16;
var quiVus = {themes:{}, questions:{}};
/* Dosage selon la partie : Medium (0), Hard (1), Impossible (2) */
var DOSE_THEMES = [{soft:.75, spicy:.25}, {soft:.5, spicy:.5}, {soft:.15, spicy:.85}];
var DOSE_QUESTIONS = [{soft:.7, spicy:.25, hard:.05}, {soft:.25, spicy:.5, hard:.25}, {soft:.05, spicy:.35, hard:.6}];
function tirerNiveau(dose){ var r = Math.random(), acc = 0; for(var k in dose){ acc += dose[k]; if(r<acc) return k; } return Object.keys(dose)[0]; }
function poolThemes(niv){ return THEMES_BASE.filter(function(t){ return t.niv===niv; }).concat(TEXTES_QUI.themes.filter(function(t){ return t.niv===niv; }).map(function(t){ return {t:t.t, d:"", niv:t.niv}; })); }
function poolQuestions(niv){ return (QUESTIONS_QUI_BASE[niv]||[]).concat(TEXTES_QUI.questions.filter(function(q){ return q.niv===niv; }).map(function(q){ return q.t; })); }
function tirerTheme(sauf){
  var niv = tirerNiveau(DOSE_THEMES[S.partie]||DOSE_THEMES[0]), pool = poolThemes(niv);
  if(!pool.length) pool = poolThemes("soft");
  var dispo = pool.filter(function(t){ return t.t!==sauf && !quiVus.themes[t.t]; });
  if(!dispo.length){ pool.forEach(function(t){ delete quiVus.themes[t.t]; }); dispo = pool.filter(function(t){ return t.t!==sauf; }); if(!dispo.length) dispo = pool; }
  var t = dispo[rnd(dispo.length)]; quiVus.themes[t.t] = 1; return t;
}
function tirerQuestionQui(){
  var niv = tirerNiveau(DOSE_QUESTIONS[S.partie]||DOSE_QUESTIONS[0]), pool = poolQuestions(niv);
  if(!pool.length){ niv = "soft"; pool = poolQuestions("soft"); }
  var dispo = pool.filter(function(q){ return !quiVus.questions[q]; });
  if(!dispo.length){ pool.forEach(function(q){ delete quiVus.questions[q]; }); dispo = pool; }
  var q = dispo[rnd(dispo.length)]; quiVus.questions[q] = 1; return {t:q, niv:niv};
}
function quiCartes(){
  var L = listePersos(), avec = melange(L.filter(function(p){ return p.img; })), sans = melange(L.filter(function(p){ return !p.img; }));
  return avec.concat(sans).slice(0, QUI_N);
}
function qui(){
  var cartes = quiCartes();
  if(cartes.length<4){ S.jeu = null; montrer("qui"); $("quiPrompt").textContent = "Il faut au moins 4 personnages (page Personnages de la banque)."; plus_tard(function(){ passerJeu(); }, 4000); return; }
  var idx = melange(cartes.map(function(_, i){ return i; }));
  var J = S.jeu = {id:"qui", cle:Date.now().toString(36), cartes:cartes, secret:{b:idx[0], v:idx[1]}, elim:{b:{}, v:{}},
    joker:{b:1, v:1}, tour:Math.random()<.5 ? "b" : "v", type:Math.random()<.5 ? "theme" : "question", n:0, phase:"pose", rep:{b:null, v:null}, acc:null};
  montrer("qui");
  construireGrilleQui();
  publierImagesQui();
  quiTour(true);
}
/* Les images des 16 cartes sont envoyées une fois aux téléphones (salles/<id>/qui) */
function publierImagesQui(){
  var J = S.jeu; if(!SALLE || !window.firebase || !firebase.database) return;
  try{ firebase.database().ref("salles/"+SALLE+"/qui").set({cle:J.cle, imgs:J.cartes.map(function(p){ return p.img||""; })}).catch(function(){}); }catch(e){}
}
function quiTour(premier){
  var J = S.jeu; if(!J || J.id!=="qui") return;
  if(!premier){ J.tour = autre(J.tour); J.type = J.type==="theme" ? "question" : "theme"; }
  J.n++; J.phase = "pose"; J.rep = {b:null, v:null};
  if(J.type==="theme"){ J.theme = tirerTheme(J.theme && J.theme.t); J.question = null; }
  else { J.question = tirerQuestionQui(); J.theme = null; }
  bip(880, 0.1, 0.05);
  rendreQui(); diffuser();
}
function quiAction(d){
  var J = S.jeu; if(!J || J.id!=="qui" || !d) return;
  var s = d.side; if(s!=="b" && s!=="v") return;
  if(J.phase==="accuse") return;
  if(d.a==="elim"){
    var i = d.i|0; if(i<0 || i>=J.cartes.length) return;
    if(J.elim[s][i]) delete J.elim[s][i]; else J.elim[s][i] = 1;
    rendreQui(); diffuser(); return;
  }
  if(d.a==="joker"){
    if(J.type!=="theme" || J.phase!=="pose" || s!==J.tour || !J.joker[s]) return;
    J.joker[s] = 0; J.theme = tirerTheme(J.theme && J.theme.t); bip(660, 0.12, 0.06);
    rendreQui(); diffuser(); return;
  }
  if(d.a==="rep"){
    var r = ["oui","non","nsp"].indexOf(d.r)>=0 ? d.r : null; if(!r || J.phase!=="pose") return;
    if(J.type==="theme"){ if(s!==autre(J.tour)) return; J.rep[s] = r; J.phase = "repondu"; }
    else { if(J.rep[s]) return; J.rep[s] = r; if(J.rep.b && J.rep.v) J.phase = "repondu"; }
    if(J.phase==="repondu"){ bip(r==="oui" ? 1175 : 523, 0.2, 0.07); } else bip(700, 0.05, 0.04);
    rendreQui(); diffuser(); return;
  }
  if(d.a==="suivant"){ if(J.phase!=="repondu" || s!==J.tour) return; quiTour(false); return; }
  if(d.a==="accuse"){
    var k = d.i|0; if(k<0 || k>=J.cartes.length || J.phase==="fin") return;
    var ok = k===J.secret[autre(s)];
    J.phase = "accuse"; J.acc = {side:s, i:k, ok:ok};
    bip(300, 0.3, 0.06);
    rendreQui(); diffuser();
    plus_tard(function(){
      J.phase = "fin"; J.acc.revele = true;
      if(ok){ bip(1320, 0.25, 0.08); plus_tard(function(){ bip(1760, 0.35, 0.08); }, 160); } else { boum(); }
      rendreQui(); diffuser();
      var vrai = J.cartes[J.secret[autre(s)]].nom;
      plus_tard(function(){
        if(ok) finManche(autre(s), S.noms[s]+" a trouvé : c'était "+vrai+" !");
        else finManche(s, S.noms[s]+" s'est trompé·e : c'était "+vrai+", pas "+J.cartes[k].nom+".");
      }, 4200);
    }, 2200);
  }
}
var MOTS_REP = {oui:"OUI", non:"NON", nsp:"JE SAIS PAS"};
function construireGrilleQui(){
  var J = S.jeu, g = $("quiGrille"); g.innerHTML = "";
  J.cartes.forEach(function(p, i){
    var c = el("div","qc"); c.id = "qc"+i;
    c.appendChild(visuelPerso(p));
    c.appendChild(el("span","qc-nom",p.nom));
    g.appendChild(c);
  });
}
function rendreQui(){
  var J = S.jeu; if(!J || J.id!=="qui") return;
  var qui = S.noms[J.tour], autreNom = S.noms[autre(J.tour)];
  $("quiNum").textContent = "Qui est-ce ? · tour "+J.n;
  var box = $("quiBoite"); box.className = "qui-boite "+(J.type==="theme" ? J.tour : "deux")+(J.question ? " niv-"+J.question.niv : "");
  var lab = $("quiLabel"), pr = $("quiPrompt"), hint = $("quiHint"), rep = $("quiRep");
  rep.innerHTML = "";
  if(J.phase==="accuse" || J.phase==="fin"){
    var a = J.acc, cible = J.cartes[a.i];
    box.className = "qui-boite "+a.side;
    lab.textContent = S.noms[a.side]+" accuse !";
    pr.textContent = "« C'est "+cible.nom+" ! »";
    hint.textContent = J.phase==="fin" ? (a.ok ? "Bien joué, c'était bien ça !" : "Raté… c'était "+J.cartes[J.secret[autre(a.side)]].nom+".") : "Suspense…";
    if(J.phase==="fin") rep.appendChild(el("span","qui-verdict "+(a.ok ? "ok" : "ko"), a.ok ? "TROUVÉ" : "ÉLIMINÉ·E"));
  } else if(J.type==="theme"){
    lab.textContent = qui+", pose une question sur le thème :";
    pr.textContent = J.theme.t;
    hint.textContent = J.theme.d ? "("+J.theme.d+")" : "";
    if(J.phase==="repondu"){ var r = J.rep[autre(J.tour)]; rep.appendChild(el("span","qui-r "+r+" c"+autre(J.tour), autreNom+" : "+MOTS_REP[r])); }
    else rep.appendChild(el("span","qui-attente", autreNom+" répond sur son téléphone…"));
  } else {
    lab.textContent = "Question pour vous deux, répondez pour votre perso :";
    pr.textContent = J.question.t;
    hint.textContent = NIV_QUI[J.question.niv];
    if(J.phase==="repondu"){ ["b","v"].forEach(function(s){ rep.appendChild(el("span","qui-r "+J.rep[s]+" c"+s, S.noms[s]+" : "+MOTS_REP[J.rep[s]])); }); }
    else ["b","v"].forEach(function(s){ rep.appendChild(el("span","qui-attente c"+s, S.noms[s]+(J.rep[s] ? " a répondu ✓" : " réfléchit…"))); });
  }
  J.cartes.forEach(function(_, i){
    var c = $("qc"+i); if(!c) return;
    c.classList.remove("accuse","bon","mauvais");
    if(J.acc && J.acc.i===i) c.classList.add("accuse");
    if(J.phase==="fin"){ var vrai = J.secret[autre(J.acc.side)]; if(i===vrai) c.classList.add("bon"); else if(i===J.acc.i) c.classList.add("mauvais"); }
  });
  ["b","v"].forEach(function(s){
    var n = J.cartes.length - Object.keys(J.elim[s]).length;
    $(s==="b" ? "quiB" : "quiV").textContent = (s==="b" ? "← " : "")+S.noms[s]+" · "+n+" restant"+(n>1 ? "s" : "")+(J.joker[s] ? " · joker ✓" : " · joker utilisé")+(s==="v" ? " →" : "");
  });
}

/* ---------- Côté téléphone ---------- */
var MQ = {cle:null, imgs:[], accuse:false, choix:null, elim:{}};
var quiImgsRef = null;
function ecouterImagesQui(){
  if(quiImgsRef || !SALLE || !window.firebase || !firebase.database) return;
  quiImgsRef = firebase.database().ref("salles/"+SALLE+"/qui");
  quiImgsRef.on("value", function(s){ var v = s.val(); if(v && v.cle){ MQ.imgsCle = v.cle; MQ.imgs = Array.isArray(v.imgs) ? v.imgs : []; majImagesManette(); } });
}
function majImagesManette(){
  if(MQ.imgsCle!==MQ.cle) return;
  Array.prototype.forEach.call(document.querySelectorAll("#m-qui [data-i]"), function(c){
    var i = +c.getAttribute("data-i"), src = MQ.imgs[i], v = c.querySelector(".pv");
    if(src && v && !v.querySelector("img")){ v.classList.remove("sans"); v.innerHTML = ""; var im = document.createElement("img"); im.src = src; im.alt = ""; v.appendChild(im); }
  });
}
function rendreQuiManette(z, noms){
  mMontrer("m-qui"); MQ.noms = noms;
  z.rep = z.rep || {}; z.joker = z.joker || {};
  ecouterImagesQui();
  var moi = COTE, lui = autre(COTE);
  if(MQ.cle!==z.cle){
    MQ.cle = z.cle; MQ.accuse = false; MQ.choix = null;
    var g = $("mQuiGrille"); g.innerHTML = "";
    z.cartes.forEach(function(p, i){
      var c = el("button","mqc"); c.setAttribute("data-i", i);
      c.appendChild(visuelPerso({nom:p.nom, img:""}));
      c.appendChild(el("span","qc-nom",p.nom));
      c.onclick = function(){
        if(MQ.accuse){ MQ.choix = i; majGrilleManette(MQ.dernier); majActionsQui(MQ.dernier, MQ.noms||{}); return; }
        c.classList.toggle("elim"); envoyer("qui",{a:"elim", side:COTE, i:i});
      };
      g.appendChild(c);
    });
    var sp = z.cartes[z.secret[moi]];
    var sec = $("mQuiSecret"); sec.innerHTML = "";
    var tete = el("div","mf-tete"); tete.setAttribute("data-i", z.secret[moi]);
    tete.appendChild(visuelPerso({nom:sp.nom, img:""}));
    sec.appendChild(tete);
    sec.appendChild(el("small",null,"Ton personnage"));
    sec.appendChild(el("h3",null,sp.nom));
    if(sp.cat) sec.appendChild(el("p","mf-cat",sp.cat));
    var fi = FICHES[sp.id] || FICHES[slugPerso(sp.nom)];
    if(fi && fi.length){
      var dl = el("dl","mf-infos");
      fi.forEach(function(l){ dl.appendChild(el("dt",null,l[0])); dl.appendChild(el("dd",null,l[1])); });
      sec.appendChild(dl);
    } else sec.appendChild(el("p","sub","Pas encore de fiche pour ce personnage : réponds avec ce que tu sais."));
    MQ.grille = false;
    majImagesManette();
  }
  MQ.dernier = z;
  majGrilleManette(z);
  majActionsQui(z, noms);
}
function majGrilleManette(z){
  var el2 = {}; ((z.elim && z.elim[COTE]) || []).forEach(function(i){ el2[i] = 1; });
  Array.prototype.forEach.call($("mQuiGrille").children, function(c){
    var i = +c.getAttribute("data-i");
    c.classList.toggle("elim", !!el2[i]);
    c.classList.toggle("choisi", MQ.accuse && MQ.choix===i);
  });
  $("m-qui").classList.toggle("mode-accuse", MQ.accuse);
  var ouvert = MQ.accuse || MQ.grille;
  $("mQuiPanneau").hidden = !ouvert;
  $("mQuiPanTitre").textContent = MQ.accuse ? "Accusation : touche son personnage" : "Touche un personnage pour le barrer";
  var nb = Object.keys(el2).length;
  $("mQuiVoir").textContent = MQ.grille ? "Masquer mes éliminations" : "Mes éliminations ("+(z.cartes.length-nb)+" restants)";
}
function majActionsQui(z, noms){
  var box = $("mQuiAct"), moi = COTE, lui = autre(COTE);
  var cle = [z.n, z.phase, z.type, z.rep.b, z.rep.v, z.joker[moi], MQ.accuse, MQ.choix, z.theme && z.theme.t].join("|");
  if(box.getAttribute("data-k")===cle) return;
  box.setAttribute("data-k", cle); box.innerHTML = "";
  if(z.phase==="accuse" || z.phase==="fin"){
    box.appendChild(el("p","mq-label", (noms[z.acc.side]||"")+" accuse : "+z.cartes[z.acc.i].nom));
    box.appendChild(el("p","mq-prompt", z.phase==="fin" ? (z.acc.ok ? "Trouvé !" : "Raté !") : "Regarde la télé…"));
    $("mQuiAccuser").hidden = true; $("mQuiVoir").hidden = true; $("mQuiPanneau").hidden = true; return;
  }
  $("mQuiAccuser").hidden = false; $("mQuiVoir").hidden = false;
  $("mQuiAccuser").textContent = MQ.accuse ? "Annuler l'accusation" : "Accuser";
  if(MQ.accuse){
    box.appendChild(el("p","mq-label","Accusation : touche le personnage de "+(noms[lui]||"l'autre")));
    if(MQ.choix!==null && MQ.choix!==undefined){
      box.appendChild(el("p","mq-prompt","C'est "+z.cartes[MQ.choix].nom+" ?"));
      var ok = el("button","plein m-gros","Oui, j'accuse !"); ok.onclick = function(){ var i = MQ.choix; MQ.accuse = false; MQ.choix = null; envoyer("qui",{a:"accuse", side:COTE, i:i}); };
      box.appendChild(ok);
    }
    box.appendChild(el("p","sub","Si tu te trompes, tu es éliminé·e."));
    return;
  }
  var repBtns = function(){
    var r = el("div","mq-rep");
    [["oui","Oui"],["non","Non"],["nsp","Je sais pas"]].forEach(function(x){ var b = el("button","m-gros "+x[0], x[1]); b.onclick = function(){ envoyer("qui",{a:"rep", side:COTE, r:x[0]}); r.querySelectorAll("button").forEach(function(o){ o.disabled = true; }); b.classList.add("choisie"); }; r.appendChild(b); });
    return r;
  };
  if(z.type==="theme"){
    box.appendChild(el("p","mq-label", z.tour===moi ? "À toi ! Pose une question sur le thème :" : (noms[z.tour]||"L'autre")+" pose une question sur le thème :"));
    box.appendChild(el("p","mq-prompt", z.theme.t));
    if(z.tour===moi){
      if(z.phase==="pose"){
        box.appendChild(el("p","sub","Pose-la à voix haute, "+(noms[lui]||"l'autre")+" répond sur son téléphone."));
        if(z.joker[moi]){ var j = el("button","m-gros","Joker : changer de thème"); j.onclick = function(){ envoyer("qui",{a:"joker", side:COTE}); }; box.appendChild(j); }
      } else {
        box.appendChild(el("p","mq-r "+z.rep[lui], (noms[lui]||"")+" : "+MOTS_REP[z.rep[lui]]));
        box.appendChild(el("p","sub","Élimine des personnages, puis passe au tour suivant."));
        var nx = el("button","plein m-gros","Tour suivant"); nx.onclick = function(){ envoyer("qui",{a:"suivant", side:COTE}); }; box.appendChild(nx);
      }
    } else {
      if(z.phase==="pose"){ box.appendChild(el("p","sub","Écoute sa question et réponds pour ton personnage :")); box.appendChild(repBtns()); }
      else box.appendChild(el("p","mq-r "+z.rep[moi], "Tu as répondu : "+MOTS_REP[z.rep[moi]]));
    }
  } else {
    box.appendChild(el("p","mq-label","Question pour vous deux · "+NIV_QUI[z.question.niv]));
    box.appendChild(el("p","mq-prompt", z.question.t));
    if(z.phase==="pose"){
      if(z.rep[moi]) box.appendChild(el("p","mq-r "+z.rep[moi], "Tu as répondu : "+MOTS_REP[z.rep[moi]]+" · on attend "+(noms[lui]||"l'autre")+"…"));
      else { box.appendChild(el("p","sub","Réponds pour TON personnage :")); box.appendChild(repBtns()); }
    } else {
      box.appendChild(el("p","mq-r "+z.rep[lui], (noms[lui]||"")+" : "+MOTS_REP[z.rep[lui]]));
      if(z.tour===moi){ var nx2 = el("button","plein m-gros","Tour suivant"); nx2.onclick = function(){ envoyer("qui",{a:"suivant", side:COTE}); }; box.appendChild(nx2); }
      else box.appendChild(el("p","sub","Élimine des personnages. "+(noms[z.tour]||"L'autre")+" lance le tour suivant."));
    }
  }
}
$("mQuiVoir").onclick = function(){ MQ.grille = !MQ.grille; if(MQ.dernier) majGrilleManette(MQ.dernier); if(MQ.grille) try{ $("mQuiPanneau").scrollIntoView({behavior:"smooth"}); }catch(e){} };
$("mQuiFermer").onclick = function(){ MQ.grille = false; MQ.accuse = false; MQ.choix = null; if(MQ.dernier){ majGrilleManette(MQ.dernier); majActionsQui(MQ.dernier, MQ.noms||{}); } };
$("mQuiAccuser").onclick = function(){ MQ.accuse = !MQ.accuse; MQ.choix = null; if(MQ.dernier){ majGrilleManette(MQ.dernier); majActionsQui(MQ.dernier, MQ.noms||{}); } };
