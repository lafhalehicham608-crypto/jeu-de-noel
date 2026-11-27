# Le Jeu de Noël

Jeu de soirée à deux, du type « vodka games » : on joue à un mini-jeu, le perdant reçoit un gage, et il choisit entre **le faire** ou **boire**. Le jeu s'affiche sur la télé (navigateur de la smart TV ou ordinateur branché), et chaque joueur utilise son téléphone comme manette.

Conçu par Hicham (avec Claude) pour une longue soirée à deux. Les deux joueurs peuvent faire évoluer le site.

Site en ligne : https://lafhalehicham608-crypto.github.io/jeu-de-noel/

> Ce dépôt est **public**. N'y écrivez jamais de gages personnels, de phrase secrète, de lien privé, de code d'accès ou d'information personnelle. Les gages, les photos et les réglages privés vivent uniquement dans la base Firebase, rangés sous une clé secrète.

---

## 1. Comment on joue

1. **Accueil (télé)** : bouton JOUER et deux QR codes, **Lui** (bleu) et **Elle** (violet). Chacun scanne le sien : son téléphone devient sa manette.
2. **Joueurs** : chacun tape son prénom sur son téléphone.
3. **Modes** : mode classique, banque à gages, et le **Labo**.
   - Le Labo lance n'importe quel mini-jeu ou écran de gage (simple, minuteur, roue du corps, obligatoire, gage de la banque), puis revient au Labo.
   - Réglages : niveau des gages, gage après le mini-jeu ou retour direct, élément imposé aux mages, qui reçoit le gage.
4. **Mode classique** : une séquence de 3 parties.

   | Partie | Manches | Gages tirés |
   |---|---|---|
   | Medium | 5 | medium uniquement |
   | Hard | 10 | medium ou hard |
   | Impossible | 10 | hard ou impossible |

5. **Une manche** : une roue tire un mini-jeu → on joue → le perdant reçoit un gage.
6. **Fin de partie** : tableau par joueur (manches perdues, gages faits, verres bus).
7. **Compteur de verres** en haut à droite, sur toute la soirée.
8. **Passer ce jeu** : remplace le mini-jeu par un « choix libre » joué en vrai (on indique ensuite qui a gagné).
9. **Arrêter le jeu** : bouton en bas à gauche (double appui), touche Retour ou Échap.

Code couleur partout : **bleu = Lui**, **violet = Elle**.

### Les mini-jeux

| Mini-jeu | Principe |
|---|---|
| Premier qui tape | Réflexe : taper dès que l'écran s'allume (trop tôt = perdu). |
| Carte haute | Chacun retourne une carte, la plus basse perd. |
| Chrono à l'aveugle | Taper au plus près d'une durée cible annoncée. |
| Mini circuit | Course vue de dessus, 2 tours, sortir de la piste = explosion. |
| Dernière carte | Jeu de cartes à couleurs (main privée sur le téléphone). Design original. |
| Tir à la corde | Taper le plus vite possible. |
| Duel de bolides | Combat de voitures vue de dessus, 100 PV chacun, 90 s. Les voitures dérivent ; nitro (tenir), missiles à tête légèrement chercheuse, chocs qui font mal à celle qui se fait percuter, barils explosifs, plaques de boost, bonus (réparation, triple tir, nitro plein). Au temps : le plus de PV gagne. |
| Quiz culture G | 4 choix, premier à 2 bonnes réponses, jamais deux fois la même question. |
| Qui est-ce ? | 16 personnages ; thèmes imposés ou questions à deux ; accuser faux = éliminé. Le téléphone montre la fiche de son personnage, la grille d'élimination est cachée derrière un bouton. |
| Duel de mages | Combat de profil, 2 rounds gagnants, élément tiré au hasard (feu, glace, foudre) avec effets et ultimes. La Foudre utilise des illustrations (`sorciere-*.webp`). |
| La Traque | Vue de dessus : Kendrick (Lui) chasse Emilia (Elle) dans un cimetière. Pouvoirs, barils d'eau bénite, gargouilles, cryptes, ronces, fioles. Joystick sur le téléphone. |

Les touches clavier pour tester sans téléphone sont indiquées dans le code de chaque jeu (`js/jeux/…`).

### Les gages

Ordre à l'écran :
1. Le gage s'affiche, avec la fourchette de durée et la roue du corps s'il y en a.
2. **Je le fais / Je bois** (seulement « Je le fais » pour un gage obligatoire).
3. Si accepté : **roue du corps** → **tirage de la durée** (arrondie à 15 s) → **lancer le minuteur** (pause possible) → alarme « ARRÊTEZ ! » → manche suivante.

Dans le texte d'un gage :
- **X** = l'endroit où s'écrit la durée tirée ;
- **Z** = l'endroit où s'écrit la partie du corps tirée.

---

## 2. Banque à gages

- Objectif : 500 gages. Classement **Lui / Elle** et **Medium / Hard / Impossible**.
- Options par gage : **minuteur** (durée min / max), **roue du corps** (féminine ou masculine), **gage obligatoire** (pas de « Je bois », **3 maximum par personne**, badge doré).
- Écrire est libre ; lire les gages est protégé par un code.
- **Personnages** : bouton en haut de la banque. Liste des personnages de « Qui est-ce ? », ajout d'images (Ctrl+V ou photo), thèmes et questions personnalisés.
- **Mode banque seule** : ajouter `#banque` à l'adresse (avec le lien privé la première fois) pour remplir la banque depuis un téléphone sans prendre la place de la télé.
- **Clé privée** : la phrase secrète (ou le lien privé) donne une empreinte SHA-256 qui sert d'adresse aux données dans Firebase. Elle n'est jamais écrite dans le dépôt.

---

## 3. Organisation des fichiers

```
index.html            la page : tous les écrans (HTML) + chargement des scripts
style.css             tous les styles
config.js             configuration Firebase (non secrète)
js/base.js            contenu de base, outils, état du jeu, banque (données), avatars, durées, roues du corps
js/tv.js              écrans de la télé : accueil, joueurs, modes, intro, roulette
js/personnages.js     personnages, fiches, page Personnages, éditeur d'image, thèmes et questions
js/gage.js            résultat de manche, page de gage, fin de partie
js/labo.js            Labo : tests des mini-jeux et des écrans de gage
js/manette.js         clavier de la télé, liaison téléphone ↔ télé, affichage de la manette
js/demarrage.js       démarrage, salon temps réel, banque privée, mode banque seule, VERSION_SITE
js/jeux/quiz.js       quiz culture générale
js/jeux/qui-est-ce.js Qui est-ce ?
js/jeux/mages.js      Duel de mages
js/jeux/traque.js     La Traque
js/jeux/classiques.js corde, dernière carte, circuit, chrono, réflexe, carte haute
js/jeux/bolides.js    Duel de bolides
sorciere-*.webp       illustrations de la sorcière de la foudre
```

Les scripts sont de simples fichiers chargés dans l'ordre par `index.html` et partagent les mêmes variables globales : **l'ordre des balises `<script>` compte**.

### Données (Firebase, projet « Noel Game »)
- **Firestore** : `salons/{empreinte}/gages/{id}` (gages) et `salons/{empreinte}/medias/{id}` (avatars, images des personnages `p-…`, thèmes et questions `qui-textes`). Règles : seulement sous un salon de 64 caractères, collections `gages` et `medias`.
- **Realtime Database** : `salles/{id}` (état du jeu, actions des téléphones, présence, images de « Qui est-ce ? »). Règles : identifiant d'au moins 12 caractères.

---

## 4. Règles pour modifier le site

1. **Changer la version à chaque publication**, sinon télés et téléphones gardent l'ancienne en mémoire : remplacer partout `?v=39` dans `index.html` et `VERSION_SITE` dans `js/demarrage.js` par le numéro suivant. Les téléphones se rechargent tout seuls quand la télé a une version plus récente.
2. **Ne pas changer** les chemins Firebase ni le calcul de l'empreinte, sinon les données deviennent introuvables.
3. **Tester avant de jouer** : télé + deux téléphones (ou deux onglets avec les liens des QR codes), via le Labo : au moins le mini-jeu modifié et un gage.
4. **Ne pas modifier en même temps** que l'autre personne.
5. **Rien de personnel dans le dépôt** : il est public.
6. Publication : un commit sur `main` ; GitHub Pages met le site à jour en une minute environ.
