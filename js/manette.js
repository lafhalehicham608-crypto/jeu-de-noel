/* Le Jeu de Noël · Clavier de la télé, liaison téléphone ↔ télé, affichage de la manette */
"use strict";
/* ---------- Clavier / télécommande / clic sur la TV ---------- */
var TOUCHES_COURSE = {q:"bg", a:"bg", d:"bd", arrowleft:"vg", arrowright:"vd", e:"bn", arrowdown:"vn"};
var TOUCHES_TIR = {s:"b", z:"b", w:"b", arrowup:"v", enter:"v", " ":"v"};
function majDirClavier(){ DIRK.b = (touches.bd?1:0)-(touches.bg?1:0); DIRK.v = (touches.vd?1:0)-(touches.vg?1:0); NITK.b = touches.bn?1:0; NITK.v = touches.vn?1:0; }
document.addEventListener("keyup", function(e){ var t = TOUCHES_COURSE[String(e.key).toLowerCase()]; if(t){ touches[t] = false; majDirClavier(); } });
window.addEventListener("blur", function(){ touches = {}; majDirClavier(); });
document.addEventListener("keydown", function(e){
  if(estManette) return;
  var enJeu = S.ecran==="reflexe" || S.ecran==="carte" || S.ecran==="chrono" || S.ecran==="corde";
  var k = e.key;
  if((k==="Escape"||k==="Backspace"||k==="GoBack"||k==="BrowserBack") && S.ecran!=="accueil" && document.activeElement.tagName!=="INPUT" && document.activeElement.tagName!=="TEXTAREA"){ e.preventDefault(); $("btnQuitter").click(); return; }
  if(S.ecran==="quiz"){
    var qi = "1234".indexOf(k), qv = "7890".indexOf(k);
    if(qi>=0){ e.preventDefault(); quizRepondre("b", qi); } else if(qv>=0){ e.preventDefault(); quizRepondre("v", qv); }
    return;
  }
  if(S.ecran==="course" || S.ecran==="duel"){
    var kk = String(k).toLowerCase(), t = TOUCHES_COURSE[kk];
    if(t){ e.preventDefault(); touches[t] = true; majDirClavier(); }
    else if(S.ecran==="duel" && TOUCHES_TIR[kk] && !e.repeat){ e.preventDefault(); appui(TOUCHES_TIR[kk]); }
    return;
  }
  if(enJeu){
    if(e.repeat) return;
    if(k==="ArrowLeft"||k==="q"||k==="Q"||k==="a"||k==="A"){ e.preventDefault(); appui("b"); }
    else if(k==="ArrowRight"||k==="p"||k==="P"||k==="l"||k==="L"){ e.preventDefault(); appui("v"); }
    return;
  }
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].indexOf(k)>=0){
    var tag = document.activeElement && document.activeElement.tagName;
    if(tag==="TEXTAREA" || (tag==="INPUT" && (k==="ArrowLeft"||k==="ArrowRight"))) return;
    var els = Array.prototype.slice.call($(S.ecran).querySelectorAll("input,button:not([disabled])"));
    if(!els.length) return;
    e.preventDefault();
    var i = els.indexOf(document.activeElement);
    i = (k==="ArrowLeft"||k==="ArrowUp") ? (i<=0?els.length-1:i-1) : (i+1)%els.length;
    els[i].focus();
  }
});
["reflexe","carte","chrono","corde"].forEach(function(id){
  $(id).addEventListener("pointerdown", function(e){ appui(e.clientX < window.innerWidth/2 ? "b" : "v"); });
});

/* ---------- Liaison téléphone ↔ télé ---------- */
var room = null;
function etat(){
  var u = null, U = S.jeu;
  if(S.ecran==="uno" && U && U.id==="uno"){
    u = {tour:U.tour, phase:U.phase, att:U.attenteCouleur, aPioche:U.aPioche,
         mains:{b:U.mains.b.slice(), v:U.mains.v.slice()},
         jouables:{b:U.mains.b.map(uJouable), v:U.mains.v.map(uJouable)},
         nb:{b:U.mains.b.length, v:U.mains.v.length}, msg:U.msg};
  }
  var qz = null;
  if(S.ecran==="quiz" && U && U.id==="quiz" && U.q){
    qz = {n:U.n, texte:U.q.texte, opts:U.q.opts, phase:U.phase, rep:U.rep, bonne: U.phase==="revele" ? U.q.bonne : null, score:U.score, msg:U.msg||""};
  }
  var gt = null;
  if(S.ecran==="gage" && S.gt){ var G = S.gt; gt = {dmin:G.dmin, dmax:G.dmax, duree:G.duree, tirage:G.tirage, pause:G.pause, fini:G.fini, lance:!!G.lance, reste: G.lance ? resteMinuteur(G) : 0}; }
  var gc = (S.ecran==="gage" && S.gc) ? {type:S.gc.type, res:S.gc.res, tourne:S.gc.tourne, vu:S.gc.vu} : null;
  var qq = null;
  if(S.ecran==="qui" && U && U.id==="qui"){
    qq = {cle:U.cle, cartes:U.cartes.map(function(p){ return {nom:p.nom, id:p.id, cat:p.cat}; }), secret:U.secret,
          elim:{b:Object.keys(U.elim.b).map(Number), v:Object.keys(U.elim.v).map(Number)}, joker:U.joker, tour:U.tour, type:U.type, n:U.n,
          phase:U.phase, rep:{b:U.rep.b||"", v:U.rep.v||""}, theme:U.theme||null, question:U.question||null, acc:U.acc||null};
  }
  var mg = null;
  if(S.ecran==="mages" && U && U.id==="mages"){
    var ms = function(c){ return {el:c.el, pv:Math.round(c.pv), en:Math.round(c.en)}; };
    mg = {round:U.round, wins:U.wins, m:{b:ms(U.m.b), v:ms(U.m.v)}, coups:U.coups, phase:U.phase};
  }
  var tq = null;
  if(S.ecran==="traque" && U && U.id==="traque") tq = {manche:U.manche, wins:U.wins, pret:tqEtatPouvoirs(), proche:!!U.proche, phase:U.phase};
  return {traque:tq, mages:mg, v:VERSION_SITE, ecran:S.ecran, phase:S.jeu?S.jeu.phase:null, perdant:S.perdant, noms:S.noms, fait:S.fait, manche:S.manche, uno:u, quiz:qz, qui:qq, gt:gt, gc:gc, oblig:S.ecran==="gage" && !!S.oblig};
}
function diffuser(){
  if(room && !estManette){ room.emit("etat", etat()).catch(function(){}); }
}
function cliquerPrincipal(){
  var b = $(S.ecran).querySelector("[data-primary]:not([disabled])");
  if(b) b.click();
}
function majEtatManette(){
  if(estManette) return;
  if(!room){ $("etatManette").textContent = "Pas de manette ici : joue au clavier (Q / D et ← / →) ou à la souris"; return; }
  var cotes = {};
  room.peers().forEach(function(p){ if(p.presence && p.presence.role==="manette") cotes[p.presence.cote] = true; });
  ["b","v"].forEach(function(c){
    var box = $(c==="b"?"qrBoxB":"qrBoxV");
    box.classList.toggle("connecte", !!cotes[c]);
    $(c==="b"?"etatB":"etatV").textContent = cotes[c] ? "connecté" : "en attente";
  });
  var n = (cotes.b?1:0) + (cotes.v?1:0);
  $("etatManette").textContent = n===2 ? "Les deux manettes sont connectées" : n===1 ? "Une manette connectée sur deux" : "Manettes : en attente";
}

function brancherTV(){
  room.presence({role:"tv"}).catch(function(){});
  room.on("tap", function(m){ if(m.data) appui(m.data.side); });
  room.on("choix", function(m){ if(m.data && (!m.data.side || m.data.side===S.perdant)) choisir(m.data.c); });
  room.on("uno", function(m){ if(m.data && S.ecran==="uno") unoAction(m.data); });
  room.on("quitter", function(){ if(S.ecran!=="accueil") quitter(); });
  room.on("passer", function(){ passerJeu(); });
  room.on("quiz", function(m){ if(m.data) quizRepondre(m.data.side, m.data.i); });
  room.on("qui", function(m){ if(m.data && S.ecran==="qui") quiAction(m.data); });
  room.on("traque", function(m){ if(m.data && S.ecran==="traque") pouvoirTraque(m.data.side, m.data.p); });
  room.on("mage", function(m){ if(m.data && S.ecran==="mages") actionMage(m.data.side, m.data.a); });
  room.on("libre", function(m){ if(m.data) libreGagne(m.data.g); });
  room.on("ok", function(){ if(["accueil","joueurs","modes","intro","fin"].indexOf(S.ecran)>=0) cliquerPrincipal(); });
  room.on("nom", function(m){
    if(!m.data) return;
    if(typeof m.data.b==="string") $("nomB").value = m.data.b.slice(0,16);
    if(typeof m.data.v==="string") $("nomV").value = m.data.v.slice(0,16);
    majNoms();
    if(S.ecran==="accueil") montrer("joueurs");
  });
  room.onPeers(function(c){ majEtatManette(); lireDirManette(c.peers); if((c.joined.length || c.left.length) && S.ecran==="uno") rendreUno(); if(c.joined.length) diffuser(); });
  setInterval(diffuser, 4000);
  majEtatManette();
}

/* ---------- Vue manette ---------- */
var M = {ecran:null};
var COTE = null;  /* "b" (Lui) ou "v" (Elle) pour ce téléphone */
var SALLE = null; /* identifiant du salon temps réel */
var MV = ["m-attente","m-noms","m-pads","m-course","m-duel","m-mages","m-traque","m-uno","m-quiz","m-qui","m-libre","m-gage","m-ok"];
function rendreUnoManette(u, noms){
  mMontrer("m-uno");
  var box = $("mUnoCorps"); box.innerHTML = "";
  var aMoi = u.tour===COTE && u.phase==="jeu";
  $("mUnoInfo").className = "eyebrow c"+u.tour;
  $("mUnoInfo").textContent = u.phase!=="jeu" ? "Partie terminée" : aMoi ? (u.att ? "Choisis une couleur" : "À toi de jouer") : (u.att ? noms[u.tour]+" choisit une couleur" : "Au tour de "+noms[u.tour]);
  if(u.msg) box.appendChild(el("p","sub",u.msg));
  if(aMoi && u.att){
    var g = el("div","m-uno-choix");
    UC.forEach(function(c){ var b = el("button","m-gros k-"+c, NOM_COUL[c]); b.onclick = function(){ envoyer("uno",{a:"couleur", c:c, side:COTE}); }; g.appendChild(b); });
    box.appendChild(g);
  }
  var maMain = (u.mains && u.mains[COTE]) || [], jou = (u.jouables && u.jouables[COTE]) || [];
  var main = el("div","m-main");
  maMain.forEach(function(k,i){ var b = carteEl(k,"",true); b.disabled = !(aMoi && !u.att && jou[i]); b.onclick = function(){ envoyer("uno",{a:"jouer", i:i, side:COTE}); }; main.appendChild(b); });
  box.appendChild(main);
  if(aMoi && !u.att){
    var act = el("button","m-gros", u.aPioche ? "Passer" : "Piocher");
    act.onclick = function(){ envoyer("uno",{a: u.aPioche ? "passer" : "piocher", side:COTE}); };
    box.appendChild(act);
  }
}
function lireDirManette(peers){
  var d = {b:0,v:0}, joy = {b:{x:0,y:0}, v:{x:0,y:0}};
  peers.forEach(function(p){ var pr = p.presence; if(pr && pr.role==="manette" && pr.joy && (pr.cote==="b" || pr.cote==="v")) joy[pr.cote] = {x:+pr.joy.x||0, y:+pr.joy.y||0}; });
  JOY = joy;
  peers.forEach(function(p){ var pr = p.presence; if(pr && pr.role==="manette" && pr.dir){ d.b += +pr.dir.b||0; d.v += +pr.dir.v||0; } });
  DIRM.b = Math.max(-1, Math.min(1, d.b)); DIRM.v = Math.max(-1, Math.min(1, d.v));
  var n = {b:0,v:0}; peers.forEach(function(p){ var pr = p.presence; if(pr && pr.role==="manette" && pr.nit){ n.b = n.b || +pr.nit.b||0; n.v = n.v || +pr.nit.v||0; } }); NITM.b = n.b?1:0; NITM.v = n.v?1:0;
}
/* Manette course : l'état des boutons tenus part en continu dans la présence */
var tenu = {b:{}, v:{}};
function envoyerDir(){
  if(!room) return;
  var dir = {b:(tenu.b["1"]?1:0)-(tenu.b["-1"]?1:0), v:(tenu.v["1"]?1:0)-(tenu.v["-1"]?1:0)};
  var nit = {b:tenu.b.n?1:0, v:tenu.v.n?1:0};
  room.presence({dir:dir, nit:nit}).catch(function(){});
}
Array.prototype.forEach.call(document.querySelectorAll(".pad4"), function(p){
  var s = p.getAttribute("data-side"), d = p.getAttribute("data-d");
  p.addEventListener("pointerdown", function(e){ e.preventDefault(); tenu[s][d] = true; p.classList.add("appui"); envoyerDir(); if(navigator.vibrate) try{navigator.vibrate(15)}catch(x){} });
  ["pointerup","pointercancel","pointerleave"].forEach(function(ev){
    p.addEventListener(ev, function(){ if(tenu[s][d]){ tenu[s][d] = false; p.classList.remove("appui"); envoyerDir(); } });
  });
});
function mMontrer(id){
  MV.forEach(function(v){$(v).hidden = v!==id});
  var a = $("mAvatar");
  if(a){ if(["m-attente","m-ok","m-noms"].indexOf(id)>=0){ var sec = $(id); if(a.parentNode!==sec) sec.insertBefore(a, sec.firstChild); a.hidden = false; } else a.hidden = true; }
}
function chargerAvatarManette(){
  var cle = null; try{ cle = localStorage.getItem("jdn-cle"); }catch(e){}
  if(!cle || cle.length!==64 || !COTE) return;
  try{
    firebase.firestore().collection("salons").doc(cle).collection("medias").doc("avatars").get().then(function(d){
      var x = d.exists ? d.data() : null; if(!x || !/^data:image\//.test(x[COTE]||"")) return;
      var i = document.createElement("img"); i.id = "mAvatar"; i.className = "m-avatar"; i.alt = ""; i.src = x[COTE];
      var vis = MV.filter(function(v){ return !$(v).hidden; })[0] || "m-attente";
      document.body.appendChild(i); mMontrer(vis);
    }).catch(function(){});
  }catch(e){}
}
function envoyer(topic,data){ if(room) room.emit(topic,data).catch(function(){}); if(navigator.vibrate) try{navigator.vibrate(25)}catch(e){} }

function rendreManette(e){
  /* La télé a une version plus récente : le téléphone se recharge tout seul (une fois par version) */
  if(e.v && e.v!==VERSION_SITE){
    var deja = null; try{ deja = sessionStorage.getItem("jdn-maj"); }catch(er){}
    if(deja!==e.v){ try{ sessionStorage.setItem("jdn-maj", e.v); }catch(er){} location.replace(location.pathname+"?v="+e.v+location.hash); return; }
  }
  var noms = e.noms||{b:"",v:""};
  $("mPadB").textContent = noms.b || "Bleu"; $("mPadV").textContent = noms.v || "Violet";
  neon(COTE);
  $("mCrB").textContent = noms.b || "Bleu"; $("mCrV").textContent = noms.v || "Violet";
  if(M.ecran==="traque" && e.ecran!=="traque") envoyerJoy(0, 0, true);
  if((M.ecran==="course" || M.ecran==="duel" || M.ecran==="mages") && e.ecran!==M.ecran){ tenu = {b:{}, v:{}}; envoyerDir(); }
  if(e.ecran==="quiz" && e.quiz){
    mMontrer("m-quiz");
    var z = e.quiz, moi = z.rep ? z.rep[COTE] : null, cleQ = z.n+"|"+z.phase+"|"+moi;
    var bx = $("mQzBtns");
    if(bx.getAttribute("data-k")!==cleQ){
      bx.setAttribute("data-k", cleQ); bx.innerHTML = "";
      $("mQzQ").textContent = z.texte;
      var pts = function(s){ return "●".repeat(z.score[s]) + "○".repeat(Math.max(0, 2-z.score[s])); };
      $("mQzInfo").textContent = z.phase==="revele" ? (z.msg||"") : (moi!==null && moi!==undefined ? "Raté ! Attends l'autre…" : "Question "+z.n+" · "+(noms[COTE]||"")+" "+pts(COTE));
      z.opts.forEach(function(t, i){
        var b = el("button","qz-rep qz"+i);
        b.appendChild(el("span","lettre","ABCD".charAt(i))); b.appendChild(el("span",null,t));
        if(z.phase==="revele"){ b.disabled = i!==z.bonne; if(i===z.bonne) b.classList.add("choisie"); }
        else if(moi!==null && moi!==undefined){ b.disabled = true; if(i===moi) b.classList.add("choisie"); }
        b.onclick = function(){ envoyer("quiz",{i:i, side:COTE}); Array.prototype.forEach.call(bx.children, function(c){ c.disabled = true; }); b.classList.add("choisie"); };
        bx.appendChild(b);
      });
    }
  } else if(e.ecran==="qui" && e.qui){
    rendreQuiManette(e.qui, noms);
  } else if(e.ecran==="libre"){
    mMontrer("m-libre");
    var lb = $("mLibreBtns");
    if(lb.getAttribute("data-k")!==noms.b+"|"+noms.v){
      lb.setAttribute("data-k", noms.b+"|"+noms.v); lb.innerHTML = "";
      [["b","plein"],["v",""]].forEach(function(x){ var bt = el("button","m-gros "+x[1], (noms[x[0]]||"")+" a gagné"); bt.style.borderColor = "var(--"+(x[0]==="b"?"bleu":"violet")+")"; bt.onclick = function(){ envoyer("libre",{g:x[0]}); }; lb.appendChild(bt); });
    }
  } else if(e.ecran==="traque"){
    rendreTraqueManette(e.traque, noms);
  } else if(e.ecran==="mages"){
    rendreMagesManette(e.mages, noms);
  } else if(e.ecran==="duel"){
    mMontrer("m-duel");
  } else if(e.ecran==="course"){
    mMontrer("m-course");
  } else if(e.ecran==="uno" && e.uno){
    rendreUnoManette(e.uno, noms);
  } else if(e.ecran==="joueurs"){
    if(M.ecran!=="joueurs"){ $(COTE==="b"?"mNomB":"mNomV").value = noms[COTE]||""; }
    mMontrer("m-noms");
  } else if(e.ecran==="reflexe" || e.ecran==="carte" || e.ecran==="chrono" || e.ecran==="corde"){
    mMontrer("m-pads");
  } else if(e.ecran==="gage" && (e.perdant==="b"||e.perdant==="v")){
    mMontrer("m-gage");
    $("mGageQui").textContent = "Gage pour "+(noms[e.perdant]||"");
    var box = $("mGageBtns"); box.className = "m-gage "+e.perdant;
    var gt = e.gt, gc = e.gc, moi = e.perdant===COTE, qui = noms[e.perdant]||"L'autre";
    if(gt && gt.lance && !gt.fini){ mChrono.fin = Date.now() + (gt.reste||0); mChrono.pause = !!gt.pause; mChrono.reste = gt.reste||0; mChrono.total = (gt.duree||1)*1000; }
    var cle = e.perdant+"|"+e.fait+"|"+e.manche+"|"+(e.oblig?1:0)+"|"+(gt ? [gt.duree, gt.tirage, gt.pause, gt.fini, gt.lance].join(",") : "")+"|"+(gc ? [gc.res, gc.tourne, gc.vu].join(",") : "");
    if(box.getAttribute("data-k")!==cle){
      box.setAttribute("data-k",cle); box.innerHTML = "";
      var btn = function(txt, c, plein){ var b = el("button", (plein===false ? "" : "plein ")+"m-gros", txt); b.onclick = function(){ envoyer("choix", c==="pause" ? {c:"pause"} : {c:c, side:COTE}); }; box.appendChild(b); return b; };
      var info = function(txt){ box.appendChild(el("p","sub",txt)); };
      if(gc && gc.res && e.fait!=="bu"){ var rz = el("p","m-corps"); rz.appendChild(etiquetteCorps(gc)); box.appendChild(rz); }
      if(gt && gt.duree && e.fait===true && !gt.lance) info("Durée : "+fmtDuree(gt.duree));
      if(e.fait==="bu"){ box.appendChild(verreBu(e.perdant)); }
      else if(e.fait===false){
        if(gt && !gt.duree) info(gt.dmin===gt.dmax ? "⏱ Ce gage dure "+fmtDuree(gt.dmin) : "⏱ Ce gage durera entre "+fmtDuree(gt.dmin)+" et "+fmtDuree(gt.dmax)+", tiré au hasard");
        if(gc && !gc.res) info("◎ La partie du corps sera tirée à la roue");
        if(e.oblig){ var ob = el("p","m-oblig","🔒 Gage exceptionnel · obligatoire"); box.appendChild(ob); info("Impossible de boire pour y échapper."); }
        if(moi){ btn(e.oblig ? "Je le fais (obligatoire)" : "Je le fais", "fais"); if(!e.oblig) btn("Je bois", "bois", false); }
        else info("C'est à "+qui+" de choisir : le faire ou boire.");
      }
      /* le gage est accepté : roue, durée, minuteur */
      else if(gc && !gc.vu){
        if(moi && !gc.res && !gc.tourne){ info("Roue du corps "+(CORPS[gc.type] ? CORPS[gc.type].nom : "")); btn("Tourner la roue", "corps"); }
        else info(gc.res ? "Regarde la télé…" : gc.tourne ? "La roue tourne…" : qui+" doit tourner la roue.");
      } else if(gt && !gt.duree){
        if(moi && !gt.tirage){ info("Durée : "+fourchette(gt, " et ", "entre ")); btn("Tirer la durée", "duree"); }
        else info(gt.tirage ? "Tirage de la durée…" : qui+" doit tirer la durée.");
      } else if(gt && !gt.lance){
        if(moi) btn("Lancer le minuteur", "go"); else info(qui+" va lancer le minuteur.");
      } else if(gt){
        var mc = el("div","montre m-montre"); mc.id = "mChrono"; mc.style.color = "var(--"+(e.perdant==="b"?"bleu":"violet")+")"; box.appendChild(mc);
        if(gt.fini){ majMontre(mc, "ARRÊTEZ !", 1, "stop", ""); if(moi) btn("Manche suivante", "fait"); }
        else { majMontre(mc, fmtChrono(gt.reste||0), (gt.reste||0)/((gt.duree||1)*1000), gt.pause ? "pause" : "", gt.pause ? "pause" : ""); btn(gt.pause ? "Reprendre" : "Pause", "pause", false); }
      } else {
        if(moi) btn("C'est fait", "fait"); else info(qui+" fait son gage. Surveille bien !");
      }
    }
  } else if(e.ecran==="roulette" || e.ecran==="resultat" || e.ecran==="banque" || e.ecran==="persos" || e.ecran==="qui" || e.ecran==="labo"){
    mMontrer("m-ok"); $("mOkTitre").textContent = e.ecran==="roulette" ? "Tirage du mini-jeu…" : e.ecran==="banque" ? "Banque à gages ouverte sur la télé" : e.ecran==="persos" ? "Personnages ouverts sur la télé" : e.ecran==="labo" ? "Labo ouvert sur la télé" : e.ecran==="qui" ? "Qui est-ce ? · regarde la télé" : "Résultat à l'écran";
    $("mOk").hidden = true;
  } else {
    mMontrer("m-ok"); $("mOk").hidden = false;
    var titres = {accueil:"Accueil", modes:"Choix du mode", intro:"Nouvelle partie", fin:"Fin de partie"};
    $("mOkTitre").textContent = titres[e.ecran] || "";
    $("mOk").textContent = e.ecran==="accueil" ? "Jouer" : e.ecran==="modes" ? "Mode classique" : e.ecran==="intro" ? "Lancer la partie" : "Continuer";
  }
  $("mQuitter").hidden = e.ecran==="accueil";
  $("mPasser").hidden = ["roulette","reflexe","carte","chrono","course","uno","corde","duel","quiz","qui","mages","traque"].indexOf(e.ecran)<0;
  M.ecran = e.ecran;
}
function brancherManette(){
  room.presence({role:"manette", cote:COTE}).catch(function(){});
  $("mAttTitre").textContent = "Connexion à la télé…";
  $("mAttSub").textContent = "Garde le jeu ouvert sur la télé.";
  room.on("etat", function(m){ if(m.data && !m.sameTab) rendreManette(m.data); });
}
Array.prototype.forEach.call(document.querySelectorAll(".pad:not(.pad4)"), function(p){
  p.addEventListener("pointerdown", function(e){
    e.preventDefault(); var s = p.getAttribute("data-side");
    p.classList.add("appui"); setTimeout(function(){p.classList.remove("appui")},120);
    envoyer("tap",{side:s});
  });
});
$("mValiderNoms").onclick = function(){ var d = {}; d[COTE] = $(COTE==="b"?"mNomB":"mNomV").value.trim(); envoyer("nom", d); };
$("mOk").onclick = function(){ envoyer("ok",{}); };
var mqT=null, mpT=null;
/* Minuteur affiché sur le téléphone, recalé à chaque état reçu de la télé */
var mChrono = {fin:0, pause:false, reste:0, total:1000};
setInterval(function(){
  var c = document.getElementById("mChrono"); if(!c || c.classList.contains("stop")) return;
  var r = Math.max(0, mChrono.pause ? mChrono.reste : mChrono.fin - Date.now());
  majMontre(c, fmtChrono(r), r/mChrono.total, mChrono.pause ? "pause" : (r<=10000 ? "urgent" : ""), mChrono.pause ? "pause" : "");
}, 250);
$("mPasser").addEventListener("pointerdown", function(e){ e.stopPropagation(); });
$("mPasser").onclick = function(){
  var b = $("mPasser");
  if(b.classList.contains("confirme")){ clearTimeout(mpT); b.classList.remove("confirme"); b.textContent = "Passer ce jeu"; envoyer("passer",{}); return; }
  b.classList.add("confirme"); b.textContent = "Appuie encore pour passer";
  mpT = setTimeout(function(){ b.classList.remove("confirme"); b.textContent = "Passer ce jeu"; }, 3000);
};
$("mQuitter").addEventListener("pointerdown", function(e){ e.stopPropagation(); });
$("mQuitter").onclick = function(){
  var b=$("mQuitter");
  if(b.classList.contains("confirme")){ clearTimeout(mqT); b.classList.remove("confirme"); b.textContent="Arrêter le jeu"; envoyer("quitter",{}); return; }
  b.classList.add("confirme"); b.textContent="Appuie encore pour quitter";
  mqT=setTimeout(function(){ b.classList.remove("confirme"); b.textContent="Arrêter le jeu"; },3000);
};
$("btnRetourTV").onclick = function(){ location.href = location.pathname; };
