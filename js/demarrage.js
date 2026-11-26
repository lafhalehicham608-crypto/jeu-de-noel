/* Le Jeu de Noël · Démarrage : salon temps réel (Firebase), banque privée, mode banque seule */
"use strict";
/* ---------- Démarrage ---------- */
if(estManette){ $("tv").hidden = true; $("manette").hidden = false; document.body.style.overflow = "hidden"; }
else { montrer("accueil"); }

var VERSION_SITE = "38";
/* ---------- Liaison télé ↔ téléphone (Firebase Realtime Database) ----------
   La télé et la manette partagent un « salon » salles/<id> :
   - etat        : l'état du jeu publié par la télé
   - vers_tv     : actions envoyées par la manette (supprimées une fois lues)
   - presence/tv, presence/tel : qui est connecté (effacé automatiquement à la déconnexion) */
function nettoyer(v){ try{ return JSON.parse(JSON.stringify(v===undefined ? null : v)); }catch(e){ return null; } }
function SalonRT(id, role){
  var base = firebase.database().ref("salles/"+id);
  var autresRoles = role==="tv" ? ["tel_b","tel_v"] : ["tv"];
  var handlers = {}, peersFns = [], moi = {en_ligne:true}, pres = {};
  var instance = Math.random().toString(36).slice(2, 12);
  if(role==="tv") moi.instance = instance;
  function declencher(t, d){ (handlers[t] || []).forEach(function(fn){ try{ fn({topic:t, data:d, sameTab:false}); }catch(e){} }); }
  function notifier(j, l){ var ps = api.peers(); peersFns.forEach(function(fn){ try{ fn({peers:ps, joined:j, left:l, updated:[]}); }catch(e){} }); }
  var api = {
    emit: function(t, d){
      if(role==="tv" && !api.actif) return Promise.resolve();
      if(role==="tv" && t==="etat") base.child("etat").set({d:nettoyer(d), ts:Date.now()}).catch(function(){});
      else if(role!=="tv") base.child("vers_tv").push({t:t, d:nettoyer(d)}).catch(function(){});
      return Promise.resolve();
    },
    on: function(t, fn){ (handlers[t] = handlers[t] || []).push(fn); return function(){}; },
    presence: function(p){
      for(var k in p){ if(p[k]===null) delete moi[k]; else moi[k] = p[k]; }
      if(role==="tv" && !api.actif) return Promise.resolve();
      base.child("presence/"+role).set(nettoyer(moi)).catch(function(){});
      return Promise.resolve();
    },
    peers: function(){ return autresRoles.filter(function(r){ return pres[r]; }).map(function(r){ return {presence:pres[r]}; }); },
    onPeers: function(fn){ peersFns.push(fn); return function(){}; },
    onClose: null, onOpen: null, onActif: null, actif: true,
    reprendre: function(){ api.actif = true; maPresence.onDisconnect().remove(); maPresence.set(nettoyer(moi)).catch(function(){}); if(api.onActif) api.onActif(true); }
  };
  var maPresence = base.child("presence/"+role);
  firebase.database().ref(".info/connected").on("value", function(s){
    if(s.val()===true && api.actif){ maPresence.onDisconnect().remove(); maPresence.set(nettoyer(moi)).catch(function(){}); }
  });
  autresRoles.forEach(function(r){
    base.child("presence/"+r).on("value", function(s){
      var avant = !!pres[r], v = s.val();
      if(v && typeof v==="object") pres[r] = v; else delete pres[r];
      if(!avant && pres[r]){ notifier([1], []); if(api.onOpen) api.onOpen(); }
      else if(avant && !pres[r]){ notifier([], [1]); if(api.onClose) api.onClose(); }
      else notifier([], []);
    });
  });
  if(role==="tv"){
    /* Une seule télé pilote le salon : la dernière ouverte prend la main */
    var revendique = false;
    maPresence.set(nettoyer(moi)).then(function(){ revendique = true; }).catch(function(){ revendique = true; });
    maPresence.on("value", function(s){
      if(!revendique) return;
      var v = s.val();
      if(!v){ if(api.actif){ maPresence.onDisconnect().remove(); maPresence.set(nettoyer(moi)).catch(function(){}); } return; }
      var actif = v.instance===instance;
      if(actif!==api.actif){ api.actif = actif; if(!actif) maPresence.onDisconnect().cancel(); if(api.onActif) api.onActif(actif); }
    });
    var inbox = base.child("vers_tv");
    inbox.remove().catch(function(){});
    inbox.on("child_added", function(s){
      if(!api.actif) return;
      var m = s.val(); s.ref.remove().catch(function(){});
      if(m && typeof m.t==="string") declencher(m.t, m.d);
    });
  } else {
    base.child("etat").on("value", function(s){ var v = s.val(); if(v && v.d && pres.tv) declencher("etat", v.d); });
  }
  return api;
}
function idAleatoire(){ return "jdn"+Math.random().toString(36).slice(2,12)+Math.random().toString(36).slice(2,8); }
function afficherQR(id){
  ["b","v"].forEach(function(c){
    var url = location.origin + location.pathname + "?v=" + VERSION_SITE + "#manette=" + id + "&j=" + c;
    var box = $(c==="b"?"qrB":"qrV"); box.innerHTML = "";
    if(window.QRCode){ try{ new QRCode(box, {text:url, width:220, height:220, colorDark:"#000000", colorLight:"#ffffff", correctLevel:QRCode.CorrectLevel.M}); }catch(e){} }
    box.title = url;
  });
}
function firebaseOK(){
  var cfg = window.FIREBASE_CONFIG;
  if(!window.firebase || !cfg || !cfg.apiKey || /REMPLACE/.test(cfg.apiKey)) return false;
  try{ if(!firebase.apps.length) firebase.initializeApp(cfg); return true; }catch(e){ return false; }
}
function demarrerTV(){
  if(!firebaseOK() || !firebase.database){ $("qrBoxB").hidden = true; $("qrBoxV").hidden = true; $("etatManette").textContent = "Manette indisponible : vérifie la connexion internet de la télé."; return; }
  var id = null; try{ id = localStorage.getItem("jdn-salle"); }catch(e){}
  if(!id || !/^jdn[a-z0-9]{10,}$/.test(id)){ id = idAleatoire(); try{ localStorage.setItem("jdn-salle", id); }catch(e){} }
  room = SalonRT(id, "tv"); SALLE = id;
  var ov = document.createElement("section");
  ov.className = "screen"; ov.hidden = true; ov.style.zIndex = "60"; ov.style.background = "var(--bg)";
  ov.appendChild(el("p","big","Le jeu est ouvert sur un autre écran"));
  ov.appendChild(el("p","sub","Une seule télé peut piloter la partie à la fois. Ferme cet onglet, ou reprends la main ici."));
  var rp = el("button","plein","Jouer sur cet écran"); rp.onclick = function(){ room.reprendre(); diffuser(); };
  ov.appendChild(rp); document.body.appendChild(ov);
  room.onActif = function(a){ ov.hidden = a; if(a) diffuser(); };
  brancherTV();
  room.presence({role:"tv"});
  afficherQR(id);
  majEtatManette();
}
function lireHash(){
  var o = {};
  location.hash.replace(/^#/, "").split("&").forEach(function(kv){ var p = kv.split("="); if(p[0]) o[p[0]] = decodeURIComponent(p[1]||""); });
  return o;
}
function demarrerManette(){
  var h = lireHash();
  var id = (h.manette || "").replace(/[^a-z0-9]/gi, "");
  COTE = h.j==="b" || h.j==="v" ? h.j : null;
  if(id && !COTE){
    $("mAttTitre").textContent = "Qui es-tu ?";
    $("mAttSub").textContent = "Choisis ton joueur pour cette manette.";
    var ch = el("div","m-choix-cote");
    [["b","Lui"],["v","Elle"]].forEach(function(x){ var b = el("button","m-gros "+x[0], x[1]); b.onclick = function(){ location.hash = "manette="+id+"&j="+x[0]; location.reload(); }; ch.appendChild(b); });
    $("m-attente").insertBefore(ch, $("btnRetourTV"));
    return;
  }
  if(!id || id.length < 12 || !firebaseOK() || !firebase.database){
    $("mAttTitre").textContent = "Scanne le QR code";
    $("mAttSub").textContent = "Ouvre le jeu sur la télé et scanne le code affiché sur l'écran d'accueil.";
    return;
  }
  /* Ce téléphone ne garde que les commandes de son joueur */
  Array.prototype.forEach.call(document.querySelectorAll(".pad, .pad4"), function(p){ if(p.getAttribute("data-side")!==COTE) p.hidden = true; });
  document.querySelector(".pads").classList.add("solo"); document.querySelector(".pads4").classList.add("solo");
  $(COTE==="b"?"mNomV":"mNomB").hidden = true;
  $(COTE==="b"?"mNomB":"mNomV").placeholder = "Ton prénom";
  neon(COTE);
  room = SalonRT(id, "tel_"+COTE); SALLE = id;
  brancherManette();
  $("mAttTitre").textContent = "Recherche de la télé…";
  $("mAttSub").textContent = "Garde le jeu ouvert sur la télé.";
  var t = setTimeout(function(){
    if(!room.peers().length){ $("mAttTitre").textContent = "Télé introuvable"; $("mAttSub").textContent = "Vérifie que le jeu est ouvert sur la télé, puis scanne à nouveau son QR code."; }
  }, 6000);
  room.onOpen = function(){ clearTimeout(t); $("mAttTitre").textContent = "Manette connectée"; $("mAttSub").textContent = "Regarde la télé."; };
  room.onClose = function(){ mMontrer("m-attente"); M.ecran = null; $("mAttTitre").textContent = "Télé déconnectée"; $("mAttSub").textContent = "La manette se reconnectera dès que le jeu sera rouvert sur la télé."; };
}

/* ---------- Banque à gages : Firestore, rangée sous une clé secrète ---------- */
/* Jeu privé : la banque s'ouvre avec le lien privé (…#cle=<64 caractères>) ou avec la phrase secrète.
   Sans l'un des deux, la télé affiche un écran « Jeu privé ». */
function lienPrive(){ return location.origin + location.pathname + "#cle=" + CLE; }
function empreinte(txt){
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode("jeu-de-noel:"+txt.toLowerCase())).then(function(buf){
    return Array.prototype.map.call(new Uint8Array(buf), function(b){ return ("0"+b.toString(16)).slice(-2); }).join("");
  });
}
function appliquerCle(hex){
  if(unsubBanque){ unsubBanque(); unsubBanque = null; }
  CLE = hex; try{ localStorage.setItem("jdn-cle", CLE); }catch(e){}
  BANQUE = []; banqueEtat = "chargement"; rendreBanque(); brancherDb();
  var v = $("verrouPrive"); if(v) v.hidden = true;
}
function afficherVerrou(){
  if($("verrouPrive")){ $("verrouPrive").hidden = false; return; }
  var ov = document.createElement("section");
  ov.className = "screen"; ov.id = "verrouPrive"; ov.style.zIndex = "70"; ov.style.background = "var(--bg)";
  ov.appendChild(el("p","eyebrow","Jeu privé"));
  ov.appendChild(el("h2","titre","Le Jeu de Noël"));
  ov.appendChild(el("p","sub","Ouvre le lien privé que tu as reçu sur cet appareil, ou entre votre phrase secrète."));
  var row = el("div","row"), inp = el("input"); inp.type = "password"; inp.id = "verrouTxt"; inp.placeholder = "Phrase secrète"; inp.autocomplete = "off";
  inp.style.cssText = "font:600 18px var(--text);color:var(--fg);background:var(--bg2);border:2px solid var(--line);border-radius:12px;padding:.6em .8em;min-width:min(80vw,320px)";
  var ok = el("button","plein","Entrer"), err = el("p","bq-err","");
  function go(){ var t = inp.value.trim(); if(t.length < 8){ err.textContent = "Il faut au moins 8 caractères."; return; } empreinte(t).then(appliquerCle); }
  ok.onclick = go; inp.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); go(); } });
  row.appendChild(inp); row.appendChild(ok); ov.appendChild(row); ov.appendChild(err);
  document.body.appendChild(ov);
}
function demarrerBanque(){
  var h = lireHash();
  if(h.cle && /^[0-9a-f]{64}$/.test(h.cle)){
    try{ localStorage.setItem("jdn-cle", h.cle); }catch(e){}
    try{ history.replaceState(null, "", location.pathname + location.search + (modeBanque ? "#banque" : "")); }catch(e){}
  }
  if(!firebaseOK()){ banqueEtat = "config"; rendreBanque(); return; }
  try{ db = firebase.firestore(); }catch(e){ banqueEtat = "config"; rendreBanque(); return; }
  try{ CLE = localStorage.getItem("jdn-cle"); }catch(e){}
  if(CLE && CLE.length===64){ banqueEtat = "chargement"; brancherDb(); }
  else { CLE = null; banqueEtat = "cle"; rendreBanque(); afficherVerrou(); }
}
function definirCle(){
  var txt = $("bqCleTxt").value.trim();
  if(txt.length < 8){ $("bqCleErr").textContent = "Il faut au moins 8 caractères."; return; }
  if(!window.crypto || !crypto.subtle || !window.TextEncoder){ $("bqCleErr").textContent = "Ce navigateur ne peut pas relier la banque."; return; }
  empreinte(txt).then(function(hex){ $("bqCleTxt").value = ""; $("bqCleErr").textContent = ""; appliquerCle(hex); });
}
$("bqLien").onclick = function(){
  if(!CLE) return;
  var url = lienPrive();
  function montrerLien(){ $("bqMsg").textContent = "Lien privé : " + url; }
  try{ navigator.clipboard.writeText(url).then(function(){ $("bqMsg").textContent = "Lien privé copié. Envoie-le uniquement à ta partenaire."; }, montrerLien); }catch(e){ montrerLien(); }
};
$("bqCleOk").onclick = definirCle;
$("bqChangerCle").onclick = function(){ if(!db) return; if(unsubBanque){ unsubBanque(); unsubBanque = null; } CLE = null; BANQUE = []; banqueEtat = "cle"; rendreBanque(); try{ $("bqCleTxt").focus(); }catch(e){} };
$("bqCleTxt").addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); definirCle(); } });

if(estManette) demarrerManette();
else if(modeBanque){ demarrerBanque(); $("bqRetour").hidden = true; ouvrirBanque(); }
else { demarrerTV(); demarrerBanque(); }


/* Garder l'écran allumé pendant la soirée */
function veille(){ try{ if(navigator.wakeLock) navigator.wakeLock.request("screen").catch(function(){}); }catch(e){} }
document.addEventListener("click", veille, {once:true});
document.addEventListener("visibilitychange", function(){ if(document.visibilityState==="visible") veille(); });
