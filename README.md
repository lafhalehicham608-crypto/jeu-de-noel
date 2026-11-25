# Le Jeu de Noël

Jeu de soirée à deux, du type « vodka games » : on joue à un mini-jeu, le perdant reçoit un gage, et il a le choix entre **le faire** ou **boire**. Le jeu s'affiche sur la télé (navigateur de la smart TV ou ordinateur branché), et chaque joueur utilise son téléphone comme manette.

Il a été conçu par Hicham (avec Claude) pour une longue soirée à deux pendant les fêtes de Noël. Les deux joueurs peuvent faire évoluer le site.

Site en ligne : https://lafhalehicham608-crypto.github.io/jeu-de-noel/

> Ce dépôt est **public**. N'y écrivez jamais de gages, de phrase secrète, de code d'accès ou d'information personnelle. Les gages vivent uniquement dans la base Firebase, rangés sous une clé secrète.

---

## 1. Comment on joue

1. **Accueil (télé)** : titre néon, bouton JOUER, et deux QR codes, **Lui** (cadre bleu) et **Elle** (cadre violet). Chacun scanne le sien : son téléphone devient sa manette. Chaque QR indique « connecté » quand le téléphone est relié.
2. **Joueurs** : deux cartes avec un croquis (bleu à gauche pour lui, violet à droite pour elle). Chacun tape son prénom sur son téléphone, il s'affiche sur la télé.
3. **Choix du mode** :
   - **Mode classique** : le jeu principal (voir plus bas).
   - **Arcade** : prévu, pas encore fait (un défilement de gages, sans mini-jeux).
   - **Tester la course** / **Tester les cartes** : lancent directement un mini-jeu, pratique pour tester.
   - **Banque à gages** : pour écrire et gérer les gages (voir section 3).
4. **Mode classique** : une **séquence** de 3 parties.

   | Partie | Manches | Gages tirés |
   |---|---|---|
   | Medium (introduction) | 5 | medium uniquement |
   | Hard | 10 | au hasard entre medium et hard |
   | Impossible | 10 | au hasard entre hard et impossible |

   Le niveau d'une partie est un **plafond** : le tirage est aléatoire dans la fourchette.
5. **Une manche** :
   - une **roue** (avec ampoules, tic sonore, ralentissement) tire un mini-jeu ;
   - on joue sur les téléphones ;
   - le gagnant est annoncé, puis la **page de gage** s'affiche pour le perdant ;
   - page de gage volontairement **sobre** : fond sombre, cadre néon de la couleur du perdant tout autour de l'écran (bleu = lui, violet = elle), texte du gage en blanc, deux boutons **Je le fais** / **Je bois** (sur le téléphone du perdant uniquement) ;
   - « Je bois » ajoute un verre au compteur ; « Je le fais » laisse le gage affiché, puis « C'est fait » passe à la manche suivante.
6. **Fin de partie** : tableau par joueur (manches perdues, gages faits, verres bus), puis partie suivante ou menu.
7. **Arrêter le jeu** : bouton discret en bas à gauche de la télé (et en haut du téléphone), avec double appui pour confirmer. La touche Retour de la télécommande ou Échap font pareil.

Code couleur partout : **bleu = Lui**, **violet = Elle**.

### Les mini-jeux (dans la roue)

| Mini-jeu | Type | Règle |
|---|---|---|
| Premier qui tape | Réflexe | L'écran devient blanc après un délai aléatoire : le premier qui tape gagne. Taper trop tôt = faux départ = perdu. |
| Carte haute | Chance | Chacun retourne une carte, la plus basse perd. Égalité = on retire. |
| Chrono à l'aveugle | Feeling | Une cible entre 5 et 15 s est annoncée, le chrono disparaît après 3 s. Chacun tape quand il pense y être : le plus éloigné de la cible perd. |
| Mini circuit | Course | Course vue de dessus, 2 tours, les voitures accélèrent seules, on ne fait que tourner. Sortir de la piste = explosion et retour au départ. |
| Dernière carte | Cartes | Règles du jeu de cartes à couleurs bien connu (5 cartes chacun, +2, inversion, passe, joker, +4). Premier à vider sa main gagne. Limite 5 minutes. Chaque joueur voit sa main privée sur son téléphone. Le nom et le design des cartes sont originaux (on ne copie pas la marque). |

Commandes au clavier (pour tester sans téléphone) : Q/A et D pour Lui, flèches gauche/droite pour Elle.

---

## 2. Les manettes

- Chaque QR code ouvre `index.html?v=<version>#manette=<id du salon>&j=b` (Lui) ou `&j=v` (Elle).
- Le téléphone ne montre que les commandes de son joueur : un seul champ prénom, un seul gros bouton pour les mini-jeux, deux boutons gauche/droite pour la course, sa propre main au jeu de cartes.
- Seul le téléphone du perdant reçoit les boutons du gage.
- Le cadre du téléphone brille en permanence dans la couleur de son joueur.
- Une seule télé pilote la partie : la dernière ouverte prend la main, les autres affichent « Le jeu est ouvert sur un autre écran ».

---

## 3. La banque à gages

- Objectif : **500 gages** avant le jour J (une jauge le suit).
- Chaque gage a deux classements : **pour Lui / pour Elle**, et **Medium / Hard / Impossible** (pas de soft).
- On peut ajouter un gage, ou plusieurs d'un coup en en mettant **un par ligne**.
- **Écrire est libre, lire est verrouillé** : en bas de la page, les blocs Lui et Elle sont cachés derrière un code (actuellement `0000` pour les deux, à changer plus tard pour que chacun ne voie pas les gages de l'autre). C'est une protection contre les regards, pas une vraie sécurité.
- **Phrase secrète** : la première fois, chaque appareil demande votre phrase secrète commune. Elle n'est stockée nulle part en clair : le site en calcule une empreinte (SHA-256) qui sert d'adresse à vos gages dans Firebase. Même phrase sur tous les appareils = même banque.
- Si la banque est vide pour un perdant et un niveau, le jeu utilise un gage d'exemple et l'indique en petit.

---

## 4. Architecture technique

- **Un seul fichier** `index.html` (HTML, CSS et JavaScript), plus `config.js` (configuration Firebase, non secrète). Hébergé par **GitHub Pages** depuis la branche `main`, à la racine.
- Bibliothèques chargées par CDN : Firebase 10.12.2 (app, firestore, database, en version « compat ») et qrcodejs 1.0.0. Polices Google : Monoton (titres néon) et Sora.
- Projet Firebase : **Noel Game** (`noel-game`).

### Firestore : la banque à gages
- Chemin : `salons/{empreinte de la phrase secrète, 64 caractères}/gages/{id}`
- Document : `{ texte, pour: "lui" | "elle", niveau: "medium" | "hard" | "impossible", cree: timestamp }`
- Règles : lecture et écriture autorisées seulement sous un salon dont l'identifiant fait exactement 64 caractères. Tout le reste est refusé.

### Realtime Database : la liaison télé ↔ téléphones
- URL : `https://noel-game-default-rtdb.europe-west1.firebasedatabase.app`
- Chemin : `salles/{id}` où `id` est généré par la télé et gardé dans son navigateur (`localStorage`, clé `jdn-salle`).
  - `etat` : l'état du jeu publié par la télé (écran, prénoms, perdant, mains du jeu de cartes, etc.)
  - `vers_tv` : actions envoyées par les téléphones (`tap`, `nom`, `choix`, `ok`, `quitter`, `uno`), supprimées une fois lues
  - `presence/tv`, `presence/tel_b`, `presence/tel_v` : qui est connecté, effacé automatiquement à la déconnexion. La présence d'un téléphone porte aussi `dir` (direction tenue pendant la course).
- Règles : lecture et écriture seulement sous `salles/$s` avec un identifiant d'au moins 12 caractères.

### Repères dans le code (`index.html`)
- `SEQUENCE`, `JEUX`, `GAGES` (exemples), `MANCHES` : contenu et réglages de la partie.
- `montrer(id)` : change d'écran sur la télé. `neon(cote)` : cadre néon.
- `roulette()` / `construireRoue()` / `atterrir()` : la roue.
- `reflexe()`, `carteHaute()`, `chrono()`, `course()`, `uno()` : les mini-jeux. `demarrer(id)` les aiguille. `appui(cote)` reçoit les appuis.
- `finManche()`, `afficherGage()`, `choisir()`, `mancheSuivante()`, `finPartie()` : déroulé d'une manche.
- `tirerGage()` : tirage dans la banque (selon le perdant et le niveau de la partie, sans répétition).
- `rendreBanque()`, `ajouterGages()`, `CODES` : la banque à gages.
- `etat()` / `diffuser()` : ce que la télé envoie aux téléphones. `rendreManette()` : affichage côté téléphone.
- `SalonRT()` : liaison Firebase Realtime Database. `demarrerTV()`, `demarrerManette()`, `demarrerBanque()` : démarrage.

---

## 5. Règles pour modifier le site sans rien casser

1. **Augmenter la version à chaque publication**, sinon les navigateurs et les téléphones gardent l'ancienne en mémoire :
   - `var VERSION_SITE = "8";` dans `index.html` (le QR code l'utilise) ;
   - `<script src="config.js?v=8">` dans `index.html`.
   Passez les deux à la valeur suivante (9, 10…).
2. **Ne pas changer les chemins Firebase** (`salons/…/gages`, `salles/…`), ni la façon de calculer l'empreinte de la phrase secrète : sinon les gages déjà écrits deviennent introuvables.
3. **Rester sur un seul fichier** `index.html` + `config.js`.
4. **Publier** : sur GitHub, « Add file » puis « Upload files », glisser le fichier modifié, « Commit changes ». La mise en ligne prend environ une minute. Pour tester tout de suite, ouvrir le site avec `?v=` suivi d'un nouveau numéro.
5. **Tester avant de jouer** : télé + deux téléphones (ou deux onglets ouverts avec les liens des QR codes), au moins un mini-jeu, un gage, et le jeu de cartes.
6. **Ne pas modifier en même temps** que l'autre personne : le dernier envoi écrase le précédent. Se prévenir avant.
7. **Rien de personnel dans le dépôt** : il est public. Les gages restent dans Firebase.

---

## 6. Décisions de conception déjà prises

- Pas de mode « histoire » : simplement des parties de 10 manches (5 pour la partie d'introduction).
- Page de gage minimaliste, sans animation de carte ni badge de niveau.
- Pas de validation du gage par l'autre joueur : « C'est fait » suffit.
- Pas de bouton stop ni de veto à l'écran, pour garder l'immersion.
- Cartes du jeu de cartes : rendu réaliste, mais design et nom originaux.
- Le reste du jeu garde l'ambiance néon sombre.

## 7. Idées et choses à faire

- Mode **Arcade** (défilement de gages).
- Écran pour que chacun **choisisse son propre code** d'accès à la banque (au lieu de `0000`).
- **Croquis des personnages** : silhouettes néon simples ou dessins cartoon plus détaillés (pas encore tranché).
- Plus de **mini-jeux** dans la roue (duels d'arcade, etc.).
- **Bilan de fin de soirée** (sur toute la séquence).
- Nombre de parties dans une séquence : 3 pour l'instant, à ajuster.
