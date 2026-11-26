/* Le Jeu de Noël · Personnages de « Qui est-ce ? » : liste de base, fiches, page Personnages, éditeur d'image, thèmes et questions */
"use strict";
/* ================= Personnages (pour « Qui est-ce ? ») =================
   Liste de base ci-dessous ; les images, les personnages ajoutés et les modifications
   sont rangés en privé dans Firestore : salons/<clé>/medias/p-<id> (kind:"perso").
   Thèmes et questions ajoutés : salons/<clé>/medias/qui-textes. */
var CAT_PERSO = ["Célébrité","Acteur X","Série","Film","Disney","Anime","Jeu vidéo"];
/* [nom, sexe f/m, catégorie, précision pour la recherche d'image] */
var PERSOS_BASE = [
  ["Cristiano Ronaldo","m","Célébrité",""],["Lionel Messi","m","Célébrité",""],["Kylian Mbappé","m","Célébrité",""],["Neymar","m","Célébrité","footballeur"],
  ["Achraf Hakimi","m","Célébrité",""],["Beyoncé","f","Célébrité",""],["Rihanna","f","Célébrité",""],["Shakira","f","Célébrité",""],
  ["Nicki Minaj","f","Célébrité",""],["Latto","f","Célébrité","rappeuse"],["Ice Spice","f","Célébrité",""],["Drake","m","Célébrité","rappeur"],
  ["The Weeknd","m","Célébrité",""],["Aya Nakamura","f","Célébrité",""],["Booba","m","Célébrité","rappeur"],["Tiakola","m","Célébrité",""],
  ["Jorja Smith","f","Célébrité",""],["Taylor Swift","f","Célébrité",""],["Brad Pitt","m","Célébrité",""],["Leonardo DiCaprio","m","Célébrité",""],
  ["Johnny Depp","m","Célébrité",""],["Tom Felton","m","Célébrité",""],["Margot Robbie","f","Célébrité",""],["Zendaya","f","Célébrité",""],
  ["Sydney Sweeney","f","Célébrité",""],["Omar Sy","m","Célébrité",""],["Kim Kardashian","f","Célébrité",""],["Elon Musk","m","Célébrité",""],
  ["Lana Rhoades","f","Acteur X",""],["Mia Khalifa","f","Acteur X",""],["Sophie Rain","f","Acteur X",""],["Gattouz","m","Acteur X",""],["Johnny Sins","m","Acteur X",""],
  ["Daenerys Targaryen","f","Série","Game of Thrones"],["Jon Snow","m","Série","Game of Thrones"],["Tyrion Lannister","m","Série","Game of Thrones"],["Cersei Lannister","f","Série","Game of Thrones"],
  ["Le Professeur","m","Série","La Casa de Papel"],["Tommy Shelby","m","Série","Peaky Blinders"],["Walter White","m","Série","Breaking Bad"],["Homelander","m","Série","The Boys"],
  ["Michael Scofield","m","Série","Prison Break"],["Ragnar Lothbrok","m","Série","Vikings"],
  ["Lane","m","Série","Campus Drivers"],["Donovan","m","Série","Campus Drivers"],["Lewis","m","Série","Campus Drivers"],["Adam","m","Série","Campus Drivers"],
  ["Jack Sparrow","m","Film",""],["James Bond","m","Film",""],["John Wick","m","Film",""],["Tony Stark","m","Film","Iron Man"],["Thor","m","Film","Marvel"],
  ["Wonder Woman","f","Film",""],["Harley Quinn","f","Film",""],["Catwoman","f","Film",""],["Le Joker","m","Film","Joker"],["Barbie","f","Film","film"],["Shrek","m","Film",""],
  ["Elsa","f","Disney","La Reine des neiges"],["Raiponce","f","Disney","Disney"],["Esmeralda","f","Disney","Le Bossu de Notre-Dame"],["Aladdin","m","Disney","Disney"],
  ["Flynn Rider","m","Disney","Raiponce"],["Tarzan","m","Disney","Disney"],["Gaston","m","Disney","La Belle et la Bête"],
  ["Judy Hopps","f","Disney","Zootopie"],["Nick Wilde","m","Disney","Zootopie"],
  ["Nico Robin","f","Anime","One Piece"],["Boa Hancock","f","Anime","One Piece"],["Nami","f","Anime","One Piece après l'ellipse"],["Tsunade","f","Anime","Naruto"],
  ["Erza Scarlet","f","Anime","Fairy Tail"],["Yoruichi","f","Anime","Bleach"],["Makima","f","Anime","Chainsaw Man"],["Albedo","f","Anime","Overlord"],
  ["Satoru Gojo","m","Anime","Jujutsu Kaisen"],["Toji Fushiguro","m","Anime","Jujutsu Kaisen"],["Livaï Ackerman","m","Anime","L'Attaque des Titans"],
  ["Lucia","f","Jeu vidéo","GTA VI"]
];
/* Fiches des personnages (affichées sur le téléphone du joueur qui a ce personnage) */
var FICHES = {"p-cristiano-ronaldo":[["Né en","1985"],["Origine","Madère, Portugal"],["Taille","1,87 m"],["Célèbre pour","Footballeur, 5 Ballons d'or, meilleur buteur de l'histoire"],["Club","Al-Nassr (Arabie saoudite)"],["Signes","Célébration « Siuuu », corps sculpté, obsédé par la forme"],["Côté cœur","Fiancé à Georgina Rodríguez"]],"p-lionel-messi":[["Né en","1987"],["Origine","Rosario, Argentine"],["Taille","1,70 m"],["Célèbre pour","Footballeur, 8 Ballons d'or, champion du monde 2022"],["Club","Inter Miami (États-Unis)"],["Signes","Gaucher, discret et timide, barbe"],["Côté cœur","Marié à Antonela, son amour d'enfance"]],"p-kylian-mbappe":[["Né en","1998"],["Origine","Bondy (93), père camerounais, mère algérienne"],["Taille","1,78 m"],["Célèbre pour","Footballeur, champion du monde 2018, capitaine des Bleus"],["Club","Real Madrid"],["Signes","Vitesse de fusée, célébration bras croisés, crâne rasé"]],"p-neymar":[["Né en","1992"],["Origine","São Paulo, Brésil"],["Taille","1,75 m"],["Célèbre pour","Footballeur ultra-technique (Santos, Barça, PSG)"],["Signes","Dribbles, simulations, coiffures changeantes, tatouages"],["Réputation","Fêtard, gros joueur de poker"]],"p-achraf-hakimi":[["Né en","1998"],["Origine","Madrid, parents marocains, joue pour le Maroc"],["Taille","1,81 m"],["Célèbre pour","Latéral droit du PSG, demi-finale du Mondial 2022 avec le Maroc"],["Signes","Ultra-rapide, tatouages, coupe dégradée"]],"p-beyonce":[["Née en","1981"],["Origine","Houston, Texas (États-Unis)"],["Célèbre pour","Chanteuse, ex-Destiny's Child, « Queen B »"],["Signes","Danse, voix puissante, longs cheveux blonds-caramel"],["Côté cœur","Mariée au rappeur Jay-Z, 3 enfants"]],"p-rihanna":[["Née en","1988"],["Origine","La Barbade (Caraïbes)"],["Célèbre pour","Chanteuse (« Umbrella »), milliardaire grâce à Fenty Beauty"],["Signes","Look audacieux, nombreux tatouages, accent caribéen"],["Côté cœur","En couple avec A$AP Rocky, mère de plusieurs enfants"]],"p-shakira":[["Née en","1977"],["Origine","Barranquilla, Colombie (père d'origine libanaise)"],["Célèbre pour","Chanteuse (« Hips Don't Lie », « Waka Waka »)"],["Signes","Danse du ventre, cheveux blonds ondulés, petite taille"],["Côté cœur","Séparée de Gerard Piqué, 2 fils"]],"p-nicki-minaj":[["Née en","1982"],["Origine","Trinité-et-Tobago, a grandi dans le Queens (New York)"],["Célèbre pour","Rappeuse (« Anaconda », « Super Bass »)"],["Signes","Perruques colorées, formes généreuses, fans appelés les « Barbz »"],["Côté cœur","Mariée, un fils"]],"p-latto":[["Née en","1998"],["Origine","Ohio, a grandi à Atlanta (États-Unis)"],["Célèbre pour","Rappeuse (« Big Energy », « Put It On Da Floor »)"],["Signes","Look glamour, longs cheveux, ancien nom de scène « Mulatto »"]],"p-ice-spice":[["Née en","2000"],["Origine","Le Bronx, New York (mère dominicaine, père nigérian)"],["Célèbre pour","Rappeuse drill (« Munch », « Boy's a Liar »)"],["Signes","Cheveux roux bouclés très volumineux, petite taille"]],"p-drake":[["Né en","1986"],["Origine","Toronto, Canada"],["Célèbre pour","Rappeur le plus streamé (« Hotline Bling », « God's Plan »)"],["Signes","Barbe taillée, hibou OVO, ancien acteur de série ado"],["Réputation","Grand romantique, clash légendaire avec Kendrick Lamar"]],"p-the-weeknd":[["Né en","1990"],["Origine","Toronto, Canada (parents éthiopiens)"],["Célèbre pour","Chanteur (« Blinding Lights », « Starboy »), mi-temps du Super Bowl"],["Signes","Voix aiguë, univers sombre, coiffures changeantes"]],"p-aya-nakamura":[["Née en","1995"],["Origine","Bamako (Mali), a grandi à Aulnay-sous-Bois"],["Célèbre pour","Chanteuse (« Djadja », « Pookie »), artiste francophone la plus écoutée au monde"],["Signes","Grande, look glamour, a chanté aux JO de Paris 2024"]],"p-booba":[["Né en","1976"],["Origine","Boulogne-Billancourt (père sénégalais)"],["Célèbre pour","Rappeur, ex-Lunatic, « le Duc de Boulogne »"],["Signes","Très musclé, tatoué, vit à Miami"],["Réputation","Roi des clashs sur les réseaux"]],"p-tiakola":[["Né en","1999"],["Origine","Bondy, origine congolaise, a grandi à La Courneuve"],["Célèbre pour","Rappeur, ex-4Keus (« Meuda », « Notre Dame » avec Gazo)"],["Signes","Mélodies chantées, dernier d'une fratrie de 8"]],"p-jorja-smith":[["Née en","1997"],["Origine","Walsall, Angleterre (père jamaïcain)"],["Célèbre pour","Chanteuse R&B-soul (« Blue Lights », « Be Honest »)"],["Signes","Voix douce et grave, cheveux bouclés, style naturel"]],"p-taylor-swift":[["Née en","1989"],["Origine","Pennsylvanie (États-Unis)"],["Célèbre pour","Chanteuse, l'Eras Tour (la tournée la plus rentable de l'histoire)"],["Signes","Blonde, rouge à lèvres rouge, chante ses ex"],["Côté cœur","Fiancée au footballeur américain Travis Kelce"]],"p-brad-pitt":[["Né en","1963"],["Origine","Oklahoma (États-Unis)"],["Célèbre pour","Acteur (Fight Club, Troie, Once Upon a Time… in Hollywood)"],["Signes","Blond, mâchoire carrée, sex-symbol des années 90-2000"],["Côté cœur","Ex-mari d'Angelina Jolie, 6 enfants"]],"p-leonardo-dicaprio":[["Né en","1974"],["Origine","Los Angeles (États-Unis)"],["Célèbre pour","Acteur (Titanic, Le Loup de Wall Street), Oscar en 2016"],["Signes","Écolo, casquette et barbe en vacances"],["Réputation","Ne sort qu'avec des femmes de moins de 25 ans (selon la légende)"]],"p-johnny-depp":[["Né en","1963"],["Origine","Kentucky (États-Unis)"],["Célèbre pour","Acteur (Jack Sparrow, Edward aux mains d'argent)"],["Signes","Bagues, chapeaux, look bohème, égérie Dior Sauvage"],["Côté cœur","Procès très médiatisé contre Amber Heard en 2022"]],"p-tom-felton":[["Né en","1987"],["Origine","Epsom, Angleterre"],["Célèbre pour","Acteur, Drago Malefoy dans Harry Potter"],["Signes","Blond, accent british, joue de la guitare"]],"p-margot-robbie":[["Née en","1990"],["Origine","Gold Coast, Australie"],["Célèbre pour","Actrice (Barbie, Harley Quinn, Le Loup de Wall Street)"],["Signes","Blonde, yeux bleus, accent australien"],["Côté cœur","Mariée, un enfant"]],"p-zendaya":[["Née en","1996"],["Origine","Oakland, Californie (États-Unis)"],["Taille","1,78 m"],["Célèbre pour","Actrice (Euphoria, Dune, Spider-Man)"],["Signes","Icône de mode, cheveux bouclés"],["Côté cœur","Fiancée à Tom Holland (Spider-Man)"]],"p-sydney-sweeney":[["Née en","1997"],["Origine","Spokane, État de Washington (États-Unis)"],["Célèbre pour","Actrice (Cassie dans Euphoria, The White Lotus, Tout sauf toi)"],["Signes","Blonde, yeux bleus, sex-symbol de sa génération"]],"p-omar-sy":[["Né en","1978"],["Origine","Trappes (père sénégalais, mère mauritanienne)"],["Taille","1,90 m"],["Célèbre pour","Acteur (Intouchables, Lupin), César du meilleur acteur"],["Signes","Rire communicatif, ancien duo comique avec Fred"]],"p-kim-kardashian":[["Née en","1980"],["Origine","Los Angeles (origine arménienne)"],["Célèbre pour","Téléréalité, marque SKIMS, business woman"],["Signes","Formes iconiques, cheveux noirs, contouring"],["Côté cœur","Ex-femme de Kanye West, 4 enfants"]],"p-elon-musk":[["Né en","1971"],["Origine","Pretoria, Afrique du Sud"],["Célèbre pour","Patron de Tesla, SpaceX et X, l'homme le plus riche du monde"],["Signes","Tweets provocants, veut aller sur Mars"],["Côté cœur","Plus de 10 enfants avec plusieurs femmes"]],"p-lana-rhoades":[["Née en","1996"],["Origine","Illinois (États-Unis)"],["Célèbre pour","Ancienne actrice X parmi les plus recherchées au monde"],["Signes","Brune, yeux clairs, a arrêté le X et regrette publiquement"],["Aujourd'hui","Podcast, maman d'un petit garçon"]],"p-mia-khalifa":[["Née en","1993"],["Origine","Beyrouth, Liban"],["Célèbre pour","Carrière X de seulement quelques mois, devenue un mème mondial"],["Signes","Grosses lunettes, brune, très drôle sur les réseaux"],["Aujourd'hui","Streameuse et influenceuse"]],"p-sophie-rain":[["Née en","2004"],["Origine","Floride (père américain, mère philippine)"],["Célèbre pour","Star d'OnlyFans, a annoncé 43 millions de dollars gagnés en un an"],["Signes","Look « fille d'à côté », très présente sur TikTok"]],"p-gattouz":[["Célèbre pour","Créateur de contenu adulte, un des plus viraux de 2025-2026"],["Collabs","Lily Phillips, Bonnie Blue, Johnny Sins…"],["Réputation","Ses lives et ses déclarations font souvent le buzz"]],"p-johnny-sins":[["Né en","1978"],["Origine","Pittsburgh (États-Unis)"],["Célèbre pour","Acteur X légendaire, mème « il a fait tous les métiers »"],["Signes","Crâne rasé, barbe, très musclé"],["Réputation","A joué médecin, plombier, astronaute, prof…"]],"p-daenerys-targaryen":[["Univers","Game of Thrones (série)"],["Âge","Jeune femme"],["Rôle","Reine, « Mère des dragons », veut conquérir le Trône de fer"],["Physique","Cheveux blond platine, yeux violets"],["Pouvoirs","Insensible au feu, 3 dragons"],["Côté cœur","Khal Drogo, puis Jon Snow (son neveu)"],["Fin","Bascule dans la folie et brûle Port-Réal"]],"p-jon-snow":[["Univers","Game of Thrones (série)"],["Rôle","Bâtard Stark (en vrai un Targaryen), Garde de Nuit, roi du Nord"],["Physique","Cheveux bruns bouclés, barbe, air triste"],["Caractère","Honnête, loyal, toujours sérieux"],["Côté cœur","Ygritte, puis Daenerys (sa tante)"],["Signes","Loup blanc Fantôme, « Tu ne sais rien, Jon Snow »"]],"p-tyrion-lannister":[["Univers","Game of Thrones (série)"],["Rôle","Nain de la riche famille Lannister, Main de la Reine"],["Physique","Petit, cicatrice au visage, cheveux blonds"],["Caractère","Le plus intelligent, drôle, sarcastique"],["Signes","« Je bois et je sais des choses », adore le vin"],["Côté cœur","Habitué des maisons closes, amoureux de Shae"]],"p-cersei-lannister":[["Univers","Game of Thrones (série)"],["Rôle","Reine des Sept Couronnes, la grande méchante"],["Physique","Blonde, toujours un verre de vin à la main"],["Caractère","Manipulatrice, prête à tout pour le pouvoir"],["Côté cœur","Relation secrète avec son frère jumeau Jaime"],["Signes","La « marche de la honte » : « Shame ! Shame ! »"]],"p-le-professeur":[["Univers","La Casa de Papel (série espagnole)"],["Vrai nom","Sergio Marquina"],["Rôle","Cerveau des braquages de la Fabrique de la Monnaie et de la Banque d'Espagne"],["Physique","Lunettes, barbe, costume classique"],["Caractère","Génie, timide, maladroit en amour"],["Côté cœur","Raquel, l'inspectrice devenue « Lisbonne »"]],"p-tommy-shelby":[["Univers","Peaky Blinders (série anglaise)"],["Rôle","Chef de gang à Birmingham dans les années 1920"],["Physique","Yeux bleus perçants, coupe « undercut », casquette avec lames de rasoir"],["Caractère","Froid, stratège, traumatisé par la guerre"],["Signes","Whisky, cigarettes, chevaux"]],"p-walter-white":[["Univers","Breaking Bad (série)"],["Rôle","Prof de chimie devenu baron de la drogue, alias « Heisenberg »"],["Physique","Chauve, barbichette, lunettes, chapeau noir"],["Caractère","Orgueilleux, de plus en plus dangereux"],["Signes","Atteint d'un cancer, « I am the one who knocks »"]],"p-homelander":[["Univers","The Boys (série)"],["Rôle","Super-héros le plus puissant… et totalement psychopathe"],["Physique","Blond, sourire figé, cape drapeau américain"],["Pouvoirs","Vole, yeux laser, invulnérable"],["Signes","Obsédé par le lait et par l'amour du public"]],"p-michael-scofield":[["Univers","Prison Break (série)"],["Rôle","Ingénieur qui se fait enfermer exprès pour faire évader son frère"],["Physique","Crâne rasé, yeux bleus, torse couvert d'un tatouage géant"],["Signes","Le plan de la prison est caché dans son tatouage"],["Côté cœur","Sara, la médecin de la prison"]],"p-ragnar-lothbrok":[["Univers","Vikings (série)"],["Rôle","Fermier devenu roi viking, attaque l'Angleterre et Paris"],["Physique","Yeux bleus, crâne rasé avec tresse, barbe"],["Caractère","Curieux, rusé, charismatique"],["Côté cœur","Lagertha, la guerrière, puis la princesse Aslaug"]],"p-lane":[["Univers","Campus Drivers (série Prime Video, d'après les romans)"],["Rôle","Étudiant à l'université de Belrose, fondateur de l'appli Campus Drivers"],["Concept","Lui et ses potes conduisent les étudiants en voitures vintage"],["Côté cœur","Tombe sous le charme de Loïs"],["Acteur","Baptiste Masseline"]],"p-donovan":[["Univers","Campus Drivers (série Prime Video)"],["Rôle","Un des trois meilleurs amis de Lane, chauffeur Campus Drivers"],["Côté cœur","Dans les livres, Carrie l'aide à changer sa façon d'aimer"],["Acteur","Madior Fall"]],"p-lewis":[["Univers","Campus Drivers (série Prime Video)"],["Rôle","Un des trois meilleurs amis de Lane, chauffeur Campus Drivers"],["Signes","Héros du tome « Crash Test », où il forme Amy, une mécano"],["Acteur","Esteban Vial"]],"p-adam":[["Univers","Campus Drivers (série Prime Video)"],["Rôle","Un des trois meilleurs amis de Lane, complète la bande des 4 chauffeurs"],["Acteur","Félix Nebel"]],"p-jack-sparrow":[["Univers","Pirates des Caraïbes (films)"],["Rôle","Capitaine pirate du Black Pearl"],["Physique","Dreadlocks, eye-liner, dents en or, foulard rouge"],["Caractère","Excentrique, menteur, chanceux, démarche bizarre"],["Signes","« Pourquoi il n'y a plus de rhum ? »"]],"p-james-bond":[["Univers","Films 007"],["Rôle","Espion britannique du MI6 avec le « permis de tuer »"],["Physique","Smoking, toujours impeccable"],["Caractère","Séducteur, froid, sûr de lui"],["Signes","Martini « au shaker, pas à la cuillère », Aston Martin, une James Bond girl par film"]],"p-john-wick":[["Univers","John Wick (films)"],["Rôle","Tueur à gages légendaire sorti de sa retraite pour venger son chien"],["Physique","Cheveux longs, barbe, costume noir"],["Caractère","Silencieux, inarrêtable"],["Signes","Peut tuer avec un crayon"]],"p-tony-stark":[["Univers","Marvel (films)"],["Rôle","Iron Man, milliardaire génie inventeur de son armure"],["Physique","Bouc taillé, lunettes teintées"],["Caractère","Arrogant, drôle, playboy"],["Côté cœur","Pepper Potts"],["Fin","Se sacrifie dans Avengers : Endgame"]],"p-thor":[["Univers","Marvel (films)"],["Rôle","Dieu nordique du tonnerre, prince d'Asgard"],["Physique","Géant musclé, cheveux longs blonds (ou courts)"],["Pouvoirs","Foudre, marteau Mjolnir"],["Signes","Frère adoptif de Loki"]],"p-wonder-woman":[["Univers","DC Comics (films)"],["Vrai nom","Diana, princesse des Amazones"],["Physique","Brune, grande, armure rouge et or, diadème"],["Pouvoirs","Force surhumaine, lasso de vérité, bracelets pare-balles"],["Côté cœur","Steve Trevor, le pilote"]],"p-harley-quinn":[["Univers","DC Comics (Suicide Squad, Birds of Prey)"],["Rôle","Ex-psychiatre devenue folle, partenaire du Joker"],["Physique","Couettes rose et bleu, maquillage, short à paillettes"],["Caractère","Imprévisible, drôle, violente"],["Signes","Batte de baseball"]],"p-catwoman":[["Univers","DC Comics (Batman)"],["Vrai nom","Selina Kyle"],["Rôle","Cambrioleuse acrobate"],["Physique","Combinaison noire moulante, oreilles de chat, fouet"],["Côté cœur","Jeu du chat et de la souris avec Batman"]],"p-le-joker":[["Univers","DC Comics (Batman)"],["Rôle","Pire ennemi de Batman, roi du chaos"],["Physique","Cheveux verts, visage blanc, sourire peint en rouge"],["Caractère","Fou, imprévisible, rire terrifiant"],["Côté cœur","Harley Quinn"]],"p-barbie":[["Univers","Barbie (film 2023)"],["Rôle","La poupée la plus célèbre du monde, vit à Barbieland"],["Physique","Blonde, tout en rose"],["Caractère","Toujours positive… jusqu'à découvrir le vrai monde"],["Côté cœur","Ken, qui n'existe que pour elle"]],"p-shrek":[["Univers","Shrek (films d'animation)"],["Rôle","Ogre vert qui vit seul dans son marais"],["Physique","Vert, gros, oreilles en trompette"],["Caractère","Grognon mais au grand cœur"],["Côté cœur","Princesse Fiona"],["Signes","Accompagné de l'Âne, « Les ogres, c'est comme les oignons »"]],"p-elsa":[["Univers","La Reine des neiges (Disney)"],["Âge","21 ans"],["Rôle","Reine d'Arendelle"],["Physique","Longue tresse blond platine, robe de glace"],["Pouvoirs","Contrôle la glace et la neige"],["Signes","« Libérée, délivrée », sœur d'Anna, célibataire"]],"p-raiponce":[["Univers","Raiponce (Disney)"],["Âge","18 ans"],["Rôle","Princesse enlevée, enfermée dans une tour"],["Physique","Cheveux blonds magiques de 21 mètres"],["Signes","Se bat avec une poêle à frire, caméléon Pascal"],["Côté cœur","Flynn Rider"]],"p-esmeralda":[["Univers","Le Bossu de Notre-Dame (Disney)"],["Rôle","Danseuse gitane dans le Paris du Moyen Âge"],["Physique","Cheveux noirs, yeux verts, peau mate"],["Caractère","Rebelle, défend les opprimés"],["Côté cœur","Désirée par Quasimodo, Frollo et Phœbus"],["Signes","Sa chèvre Djali"]],"p-aladdin":[["Univers","Aladdin (Disney)"],["Âge","18 ans"],["Rôle","Voleur des rues d'Agrabah"],["Physique","Torse nu sous un petit gilet violet, pantalon bouffant"],["Signes","Le singe Abu, la lampe du Génie, le tapis volant"],["Côté cœur","Princesse Jasmine"]],"p-flynn-rider":[["Univers","Raiponce (Disney)"],["Vrai nom","Eugene Fitzherbert"],["Rôle","Voleur charmeur recherché par tout le royaume"],["Physique","Brun, bouc, gilet bleu"],["Signes","Son « regard qui tue », se plaint que son nez est raté sur les avis de recherche"],["Côté cœur","Raiponce"]],"p-tarzan":[["Univers","Tarzan (Disney)"],["Rôle","Homme élevé par des gorilles dans la jungle"],["Physique","Très musclé, longs cheveux bruns, pagne"],["Signes","Son cri, se déplace avec des lianes, parle aux animaux"],["Côté cœur","Jane"]],"p-gaston":[["Univers","La Belle et la Bête (Disney)"],["Rôle","Chasseur le plus admiré du village, le méchant"],["Physique","Montagne de muscles, cheveux noirs en catogan, poitrine velue"],["Caractère","Vaniteux, macho, idiot"],["Signes","Mange 5 douzaines d'œufs, veut épouser Belle de force"]],"p-judy-hopps":[["Univers","Zootopie (Disney)"],["Espèce","Lapine"],["Rôle","Première lapine policière de Zootopie"],["Caractère","Optimiste, têtue, ultra-motivée"],["Signes","Petite mais rapide, stylo-carotte enregistreur"],["Duo","Fait équipe avec Nick Wilde"]],"p-nick-wilde":[["Univers","Zootopie (Disney)"],["Espèce","Renard"],["Rôle","Arnaqueur devenu policier"],["Physique","Chemise hawaïenne verte, cravate"],["Caractère","Roublard, sarcastique, cool"],["Duo","Fait équipe avec Judy Hopps"]],"p-nico-robin":[["Univers","One Piece (anime)"],["Âge","30 ans"],["Rôle","Archéologue de l'équipage de Luffy"],["Physique","Grande, cheveux noirs, yeux bleus"],["Pouvoirs","Fait pousser des bras partout (fruit Hana Hana)"],["Signes","Seule à savoir lire les Ponéglyphes, calme et mystérieuse"]],"p-boa-hancock":[["Univers","One Piece (anime)"],["Âge","31 ans"],["Rôle","Impératrice pirate de l'île des femmes (Amazon Lily)"],["Physique","« La plus belle femme du monde », longs cheveux noirs"],["Pouvoirs","Pétrifie ceux qui la désirent (fruit Mero Mero)"],["Côté cœur","Folle amoureuse de Luffy"]],"p-nami":[["Univers","One Piece (anime)"],["Âge","20 ans"],["Rôle","Navigatrice de l'équipage de Luffy"],["Physique","Cheveux orange, tatouage sur l'épaule"],["Caractère","Adore l'argent et les mandarines, colérique"],["Arme","Bâton météo (Clima-Tact)"]],"p-tsunade":[["Univers","Naruto (anime)"],["Âge","Plus de 50 ans, mais paraît 25 grâce à une technique"],["Rôle","5e Hokage, la meilleure ninja médecin"],["Physique","Blonde, deux couettes basses, losange sur le front, très pulpeuse"],["Pouvoirs","Force monstrueuse"],["Signes","Parieuse qui perd toujours, boit beaucoup de saké"]],"p-erza-scarlet":[["Univers","Fairy Tail (anime)"],["Âge","19 ans"],["Rôle","Mage la plus redoutée de la guilde, surnommée « Titania »"],["Physique","Longs cheveux rouge écarlate, armure"],["Pouvoirs","Change d'armure en un instant"],["Signes","Fan de fraisiers, autoritaire"],["Côté cœur","Jellal"]],"p-yoruichi":[["Univers","Bleach (anime)"],["Rôle","Ancienne capitaine, « la Déesse de la Vitesse »"],["Physique","Peau mate, cheveux violets, yeux dorés"],["Pouvoirs","Se transforme en chat noir, rapidité extrême"],["Caractère","Taquine, joueuse, sûre d'elle"]],"p-makima":[["Univers","Chainsaw Man (anime)"],["Rôle","Chef des chasseurs de démons, en réalité le Démon de la Domination"],["Physique","Cheveux roux tressés, yeux jaunes à cercles"],["Caractère","Calme, manipulatrice, contrôle tout le monde"],["Côté cœur","Denji est fou d'elle"]],"p-albedo":[["Univers","Overlord (anime)"],["Espèce","Succube"],["Rôle","Gardienne en chef du tombeau de Nazarick"],["Physique","Cheveux noirs, cornes, ailes noires, robe blanche"],["Côté cœur","Amour obsessionnel pour son maître Ainz"]],"p-satoru-gojo":[["Univers","Jujutsu Kaisen (anime)"],["Âge","28 ans"],["Rôle","Le sorcier le plus fort, professeur"],["Physique","Cheveux blancs, bandeau ou lunettes sur des yeux bleus"],["Pouvoirs","L'Infini (rien ne peut le toucher), les Six Yeux"],["Caractère","Arrogant, blagueur, gamin"]],"p-toji-fushiguro":[["Univers","Jujutsu Kaisen (anime)"],["Rôle","« Le tueur de sorciers », mercenaire"],["Physique","Très musclé, cicatrice au coin de la bouche"],["Pouvoirs","Aucune énergie occulte mais un corps surhumain"],["Signes","Père de Megumi, parieur, mauvais père"]],"p-livai-ackerman":[["Univers","L'Attaque des Titans (anime)"],["Rôle","Capitaine, « le soldat le plus fort de l'humanité »"],["Physique","Petit (1,60 m), coupe undercut, regard froid"],["Caractère","Froid, maniaque de la propreté"],["Signes","Tient sa tasse de thé par le haut"]],"p-lucia":[["Univers","GTA VI (jeu vidéo)"],["Vrai nom","Lucia Caminos"],["Rôle","Première héroïne jouable de GTA depuis 30 ans, sortie de prison"],["Origine","Latina, État de Leonida (Floride fictive), Vice City"],["Duo","Fait équipe avec Jason dans des braquages"]]};
var THEMES_BASE = [
  {t:"Physique", d:"cheveux, taille, corps, look", niv:"soft"},
  {t:"Origine", d:"pays, continent, langue", niv:"soft"},
  {t:"Âge", d:"jeune, vieux, génération", niv:"soft"},
  {t:"Célébrité", d:"pourquoi il est connu, métier, univers", niv:"soft"},
  {t:"Caractère", d:"gentil, méchant, drôle, arrogant…", niv:"soft"},
  {t:"Argent", d:"riche, pauvre, dépensier", niv:"soft"},
  {t:"Talents", d:"pouvoirs, sport, combat, chant…", niv:"soft"},
  {t:"Style", d:"vêtements, tenue, accessoires", niv:"soft"},
  {t:"Taille du sexe", d:"pénis ou poitrine", niv:"spicy"},
  {t:"Fesses et corps", d:"fesses, corps nu, partie la plus sexy", niv:"spicy"},
  {t:"Au lit", d:"dominant ou soumis, endurance, bruyant…", niv:"spicy"},
  {t:"Partenaires", d:"nombre de partenaires, expérience", niv:"spicy"},
  {t:"Kinks", d:"ses fantasmes et pratiques probables", niv:"spicy"},
  {t:"Fidélité", d:"fidèle, infidèle, plan à trois", niv:"spicy"},
  {t:"Sex-appeal", d:"est-ce qu'il est hot, tu coucherais avec ?", niv:"spicy"},
  {t:"Attirances", d:"son genre de partenaire, ce qui l'excite", niv:"spicy"}
];
var QUESTIONS_QUI_BASE = {
  soft:[
    "Ton perso pourrait-il te mettre une raclée ?","Tu ramènerais ton perso manger chez tes parents ?","Ton perso a-t-il déjà fait pleurer quelqu'un ?",
    "Ton perso survivrait-il une semaine seul dans la jungle ?","Ton perso est-il plus riche que tout ton entourage réuni ?","Ton perso sait-il cuisiner autre chose que des pâtes ?",
    "Ton perso ferait-il un bon parent ?","Ton perso est-il du genre à arriver en retard ?","Ton perso tiendrait-il une soirée entière sans parler de lui ?",
    "Ton perso a-t-il déjà tué quelqu'un, pour de vrai ou à l'écran ?","Ton perso est-il plus vieux que toi ?","Ton perso porte-t-il souvent du noir ?",
    "Ton perso pourrait-il devenir président ?","Ton perso a-t-il les cheveux longs ?","Ton perso parle-t-il français ?",
    "Ton perso gagnerait-il un concours de danse ?","Ton perso est-il connu dans le monde entier ?","Ton perso survivrait-il un mois sans téléphone ?"
  ],
  spicy:[
    "Ton perso a-t-il de belles fesses, selon toi ?","Ton perso est-il du genre à attacher… ou à se faire attacher ?","Ton perso tiendrait-il plus de 10 minutes au lit ?",
    "Ton perso enverrait-il des nudes dès le premier soir ?","Ton perso crie-t-il au lit ?","Ton perso accepterait-il un plan à trois ?",
    "Ton perso a-t-il un OnlyFans… ou devrait-il en ouvrir un ?","Ton perso t'écrit à 2 h du matin : tu réponds ?","Ton perso est-il plus doué avec sa bouche qu'avec ses mains ?",
    "Ton perso embrasse-t-il bien, selon toi ?","Ton perso a-t-il déjà trompé quelqu'un ?","Ton perso dort-il nu ?",
    "Ton perso est-il câlin après l'amour ?","Ton perso a-t-il un corps à se balader torse nu ?","Ton perso draguerait-il ton ou ta partenaire ?",
    "Ton perso a-t-il plus de 50 ex ?","Ton perso coucherait-il dès le premier rendez-vous ?","Ton perso porte-t-il des sous-vêtements sexy ?"
  ],
  hard:[
    "Ton perso aimerait-il se faire fesser ?","Ton perso a-t-il déjà couché dans un lieu public ?","Ton perso finit-il en moins de deux minutes ?",
    "Ton perso a-t-il des jouets dans sa table de nuit ?","Ton perso a-t-il déjà tourné une sextape ?","Ton perso aime-t-il qu'on lui tire les cheveux ?",
    "Ton perso dirait-il oui à une partie à plusieurs ?","Tu coucherais avec ton perso ce soir ?","Ton perso est-il bien monté ou bien doté, selon toi ?",
    "Ton perso aime-t-il être dominé au lit ?","Ton perso a-t-il déjà couché avec quelqu'un de célèbre ?","Ton perso est-il du genre à tout essayer au lit ?",
    "Ton perso coucherait-il avec toi pour de l'argent ?","Ton perso l'a-t-il déjà fait à plus de deux ?","Ton perso aime-t-il qu'on le regarde pendant l'acte ?",
    "Ton perso a-t-il un fétiche bizarre ?"
  ]
};
var NIV_QUI = {soft:"Soft", spicy:"Spicy", hard:"Très hard"};
function slugPerso(n){ return "p-"+String(n).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
var PERSOS_DB = {}, TEXTES_QUI = {themes:[], questions:[]}, unsubPersos = null, unsubTextes = null, persosEtat = "chargement";
function medias(){ return db.collection("salons").doc(CLE).collection("medias"); }
function brancherPersos(){
  if(!db || !CLE) return;
  if(unsubPersos) unsubPersos(); if(unsubTextes) unsubTextes();
  persosEtat = "chargement";
  unsubPersos = medias().where("kind","==","perso").onSnapshot(function(snap){
    PERSOS_DB = {}; snap.docs.forEach(function(d){ PERSOS_DB[d.id] = d.data()||{}; });
    persosEtat = "ok"; if(S.ecran==="persos") rendrePersos();
  }, function(){ persosEtat = "erreur"; if(S.ecran==="persos") rendrePersos(); });
  unsubTextes = medias().doc("qui-textes").onSnapshot(function(d){
    var x = d.exists ? d.data()||{} : {};
    TEXTES_QUI = {themes:Array.isArray(x.themes) ? x.themes : [], questions:Array.isArray(x.questions) ? x.questions : []};
    if(S.ecran==="persos") rendrePersos();
  }, function(){});
}
/* Liste fusionnée : base + modifications + ajouts, sans les supprimés */
function listePersos(){
  var out = [], vus = {};
  PERSOS_BASE.forEach(function(b){
    var id = slugPerso(b[0]), x = PERSOS_DB[id] || {}; vus[id] = 1;
    if(x.suppr) return;
    out.push({id:id, nom:x.nom||b[0], sexe:x.sexe||b[1], cat:x.cat||b[2], rech:b[3], img:/^data:image\//.test(x.img||"") ? x.img : "", base:true});
  });
  Object.keys(PERSOS_DB).forEach(function(id){
    var x = PERSOS_DB[id]; if(vus[id] || x.suppr || !x.nom) return;
    out.push({id:id, nom:String(x.nom), sexe:x.sexe==="f" ? "f" : "m", cat:CAT_PERSO.indexOf(x.cat)>=0 ? x.cat : "Célébrité", rech:"", img:/^data:image\//.test(x.img||"") ? x.img : "", base:false, cree:+x.cree||0});
  });
  return out;
}
function initiales(n){ return String(n).replace(/^(le|la|les)\s+/i,"").split(/\s+/).filter(Boolean).slice(0,2).map(function(w){ return w.charAt(0).toUpperCase(); }).join(""); }
function teinte(n){ var h = 0; for(var i=0;i<n.length;i++) h = (h*31 + n.charCodeAt(i)) % 360; return h; }
/* Visuel d'un personnage : son image, sinon ses initiales */
function visuelPerso(p, cls){
  var v = el("div", "pv"+(cls ? " "+cls : ""));
  if(p.img){ var i = document.createElement("img"); i.src = p.img; i.alt = ""; i.draggable = false; v.appendChild(i); }
  else { v.classList.add("sans"); v.style.setProperty("--h", teinte(p.nom)); v.appendChild(el("span","ini",initiales(p.nom))); }
  return v;
}
function lienRecherche(p){ return "https://www.google.com/search?tbm=isch&q="+encodeURIComponent(p.nom+(p.rech ? " "+p.rech : "")); }
function sauverPerso(id, champs){ return medias().doc(id).set(Object.assign({kind:"perso"}, champs), {merge:true}); }

/* ---------- Page Personnages ---------- */
var PF = {filtre:"tous", cat:"", cherche:""}, peEdit = null, peSup = null, peSupT = null, peAjout = false;
function ouvrirPersos(){ montrer("persos"); peEdit = null; peAjout = false; rendrePersos(); }
function rendrePersos(){
  var L = listePersos(), avec = L.filter(function(p){ return p.img; }).length;
  $("peTotal").textContent = avec+" / "+L.length+" personnages ont une image";
  $("peJauge").style.width = (L.length ? avec/L.length*100 : 0)+"%";
  Array.prototype.forEach.call($("peFiltre").children, function(b){ b.classList.toggle("on", b.getAttribute("data-f")===PF.filtre); });
  var msg = !CLE ? "Relie d'abord la banque avec votre phrase secrète (page Banque à gages)." : persosEtat==="erreur" ? "Impossible de lire les personnages. Vérifie la connexion." : persosEtat==="chargement" ? "Chargement…" : "";
  $("peMsg").textContent = msg;
  $("peAjoutBox").hidden = !peAjout;
  var q = PF.cherche.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  var vis = L.filter(function(p){
    if(PF.filtre==="sans" && p.img) return false;
    if(PF.filtre==="avec" && !p.img) return false;
    if(PF.cat && p.cat!==PF.cat) return false;
    if(q && p.nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").indexOf(q)<0) return false;
    return true;
  });
  var g = $("peGrille"); g.innerHTML = "";
  vis.forEach(function(p){ g.appendChild(cartePerso(p)); });
  if(!vis.length) g.appendChild(el("p","sub","Aucun personnage ici."));
  rendreTextesQui();
}
function cartePerso(p){
  var c = el("div","pe-carte "+p.sexe);
  if(peEdit===p.id){
    c.classList.add("edit");
    var n = el("input"); n.value = p.nom; n.maxLength = 40;
    var sx = el("select"); [["f","Femme"],["m","Homme"]].forEach(function(o){ var op = el("option",null,o[1]); op.value = o[0]; sx.appendChild(op); }); sx.value = p.sexe;
    var ct = el("select"); CAT_PERSO.forEach(function(k){ var op = el("option",null,k); op.value = k; ct.appendChild(op); }); ct.value = p.cat;
    c.appendChild(n); c.appendChild(sx); c.appendChild(ct);
    var r = el("div","pe-act");
    var ok = el("button","mini plein","OK"); ok.onclick = function(){ var nom = n.value.trim().slice(0,40); if(!nom) return; sauverPerso(p.id, {nom:nom, sexe:sx.value, cat:ct.value}).catch(function(){}); peEdit = null; rendrePersos(); };
    var an = el("button","mini","Annuler"); an.onclick = function(){ peEdit = null; rendrePersos(); };
    var sp = el("button","mini danger", peSup===p.id ? "Confirmer ?" : "Supprimer");
    sp.onclick = function(){
      if(peSup!==p.id){ peSup = p.id; clearTimeout(peSupT); peSupT = setTimeout(function(){ peSup = null; if(S.ecran==="persos") rendrePersos(); }, 3000); rendrePersos(); return; }
      peSup = null; peEdit = null;
      (p.base ? medias().doc(p.id).set({kind:"perso", suppr:true}) : medias().doc(p.id).delete()).catch(function(){});
      rendrePersos();
    };
    r.appendChild(ok); r.appendChild(an); r.appendChild(sp); c.appendChild(r);
    return c;
  }
  var v = visuelPerso(p); v.onclick = function(){ ouvrirEditeur(p); }; c.appendChild(v);
  c.appendChild(el("p","pe-nom",p.nom));
  c.appendChild(el("p","pe-cat",p.cat+" · "+(p.sexe==="f" ? "femme" : "homme")));
  var a = el("div","pe-act");
  var ch = el("a","mini","Chercher"); ch.href = lienRecherche(p); ch.target = "_blank"; ch.rel = "noopener";
  ch.onclick = function(){ setTimeout(function(){ ouvrirEditeur(p); }, 300); };
  var im = el("button","mini plein", p.img ? "Changer" : "Image"); im.onclick = function(){ ouvrirEditeur(p); };
  var md = el("button","mini","⋯"); md.title = "Modifier"; md.onclick = function(){ peEdit = p.id; rendrePersos(); };
  a.appendChild(ch); a.appendChild(im); a.appendChild(md); c.appendChild(a);
  return c;
}
$("peFiltre").onclick = function(e){ var f = e.target.getAttribute && e.target.getAttribute("data-f"); if(f){ PF.filtre = f; rendrePersos(); } };
(function(){ var s = $("peCat"); var o = el("option",null,"Toutes catégories"); o.value = ""; s.appendChild(o); CAT_PERSO.forEach(function(k){ var op = el("option",null,k); op.value = k; s.appendChild(op); }); s.onchange = function(){ PF.cat = s.value; rendrePersos(); };
  var a = $("peNCat"); CAT_PERSO.forEach(function(k){ var op = el("option",null,k); op.value = k; a.appendChild(op); }); })();
$("peCherche").oninput = function(){ PF.cherche = $("peCherche").value; rendrePersos(); };
$("peRetour").onclick = function(){ ouvrirBanque(); };
$("bqPersos").onclick = function(){ ouvrirPersos(); };
$("peAjouter").onclick = function(){ peAjout = !peAjout; rendrePersos(); if(peAjout) try{ $("peNNom").focus(); }catch(e){} };
$("peNOk").onclick = function(){
  var nom = $("peNNom").value.trim().slice(0,40); if(!nom || !CLE) return;
  var id = "p-x"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  sauverPerso(id, {nom:nom, sexe:$("peNSexe").value, cat:$("peNCat").value, cree:Date.now()}).catch(function(){});
  $("peNNom").value = ""; peAjout = false; PF.filtre = "tous"; rendrePersos();
};

/* ---------- Éditeur d'image : coller (Ctrl+V) ou choisir une photo, recadrer en carré ---------- */
var ED = null;   /* {p, img, z, x, y} : x, y = centre du cadrage dans l'image, z = zoom */
var ED_TAILLE = 320;
function ouvrirEditeur(p){
  if(!CLE) return;
  ED = {p:p, img:null, z:1, x:0, y:0};
  $("edNom").textContent = p.nom;
  $("edChercher").href = lienRecherche(p);
  $("edRetirer").hidden = !p.img;
  $("edZoom").value = "1";
  $("edMsg").textContent = "";
  $("editeur").hidden = false;
  if(p.img){ var i = new Image(); i.onload = function(){ chargerDansEditeur(i, true); }; i.src = p.img; }
  else dessinerEditeur();
}
function fermerEditeur(){ $("editeur").hidden = true; ED = null; }
function chargerDansEditeur(img, existante){
  if(!ED) return;
  ED.img = img; ED.z = 1; $("edZoom").value = "1";
  var w = img.naturalWidth, h = img.naturalHeight, cote = Math.min(w, h);
  ED.x = w/2;
  /* Portrait : on cadre plutôt le haut, là où est le visage */
  ED.y = h>w && !existante ? Math.min(h/2, cote/2 + (h-cote)*0.12) : h/2;
  $("edMsg").textContent = existante ? "" : "Glisse pour recadrer, puis Enregistrer.";
  dessinerEditeur();
}
function cadre(){ var w = ED.img.naturalWidth, h = ED.img.naturalHeight, c = Math.min(w,h)/ED.z; ED.x = Math.max(c/2, Math.min(w-c/2, ED.x)); ED.y = Math.max(c/2, Math.min(h-c/2, ED.y)); return c; }
function dessinerEditeur(){
  var cv = $("edCanvas"), ctx = cv.getContext("2d");
  ctx.fillStyle = "#0d0d1c"; ctx.fillRect(0,0,cv.width,cv.height);
  $("edSauver").disabled = !(ED && ED.img);
  $("edVide").hidden = !!(ED && ED.img);
  if(!ED || !ED.img) return;
  var c = cadre();
  ctx.drawImage(ED.img, ED.x-c/2, ED.y-c/2, c, c, 0, 0, cv.width, cv.height);
}
function lireFichierImage(f){
  if(!f || !/^image\//.test(f.type)){ $("edMsg").textContent = "Ce n'est pas une image."; return; }
  var u = URL.createObjectURL(f), i = new Image();
  i.onload = function(){ chargerDansEditeur(i, false); URL.revokeObjectURL(u); };
  i.onerror = function(){ $("edMsg").textContent = "Image illisible, essaie une autre."; };
  i.src = u;
}
document.addEventListener("paste", function(e){
  if(!ED || $("editeur").hidden) return;
  var it = (e.clipboardData && e.clipboardData.items) || [];
  for(var k=0;k<it.length;k++){ if(it[k].type && it[k].type.indexOf("image/")===0){ e.preventDefault(); lireFichierImage(it[k].getAsFile()); return; } }
  $("edMsg").textContent = "Pas d'image dans le presse-papiers : fais « Copier l'image » (pas le lien).";
});
$("edFichier").onchange = function(){ if(this.files && this.files[0]) lireFichierImage(this.files[0]); this.value = ""; };
$("edZoom").oninput = function(){ if(!ED || !ED.img) return; ED.z = +this.value || 1; dessinerEditeur(); };
(function(){
  var cv = $("edCanvas"), dep = null;
  cv.addEventListener("pointerdown", function(e){ if(!ED || !ED.img) return; dep = {x:e.clientX, y:e.clientY, ox:ED.x, oy:ED.y}; try{ cv.setPointerCapture(e.pointerId); }catch(er){} });
  cv.addEventListener("pointermove", function(e){
    if(!dep || !ED || !ED.img) return;
    var c = Math.min(ED.img.naturalWidth, ED.img.naturalHeight)/ED.z, k = c/cv.getBoundingClientRect().width;
    ED.x = dep.ox - (e.clientX-dep.x)*k; ED.y = dep.oy - (e.clientY-dep.y)*k; dessinerEditeur();
  });
  ["pointerup","pointercancel"].forEach(function(t){ cv.addEventListener(t, function(){ dep = null; }); });
  cv.addEventListener("wheel", function(e){ if(!ED || !ED.img) return; e.preventDefault(); ED.z = Math.max(1, Math.min(4, ED.z*(e.deltaY<0 ? 1.1 : 0.9))); $("edZoom").value = String(ED.z); dessinerEditeur(); }, {passive:false});
})();
$("edSauver").onclick = function(){
  if(!ED || !ED.img) return;
  var out = document.createElement("canvas"); out.width = out.height = ED_TAILLE;
  var c = cadre();
  out.getContext("2d").drawImage(ED.img, ED.x-c/2, ED.y-c/2, c, c, 0, 0, ED_TAILLE, ED_TAILLE);
  var url;
  try{ url = out.toDataURL("image/jpeg", 0.82); }catch(e){ $("edMsg").textContent = "Cette image est protégée : télécharge-la puis choisis-la avec « Choisir une photo »."; return; }
  var p = ED.p; $("edSauver").disabled = true; $("edMsg").textContent = "Enregistrement…";
  var champs = {img:url}; if(!p.base){ champs.nom = p.nom; champs.sexe = p.sexe; champs.cat = p.cat; }
  sauverPerso(p.id, champs).then(function(){ fermerEditeur(); }).catch(function(){ $("edMsg").textContent = "Échec de l'enregistrement, réessaie."; $("edSauver").disabled = false; });
};
$("edRetirer").onclick = function(){ if(!ED) return; var p = ED.p; sauverPerso(p.id, {img:null}).catch(function(){}); fermerEditeur(); };
$("edFermer").onclick = fermerEditeur;
$("editeur").addEventListener("click", function(e){ if(e.target===$("editeur")) fermerEditeur(); });

/* ---------- Thèmes et questions ajoutés ---------- */
function rendreTextesQui(){
  $("peBaseThemes").textContent = THEMES_BASE.map(function(t){ return t.t+" ("+NIV_QUI[t.niv]+")"; }).join(" · ");
  var nq = QUESTIONS_QUI_BASE.soft.length + QUESTIONS_QUI_BASE.spicy.length + QUESTIONS_QUI_BASE.hard.length;
  $("peBaseQ").textContent = nq+" questions de base : "+QUESTIONS_QUI_BASE.soft.length+" soft, "+QUESTIONS_QUI_BASE.spicy.length+" spicy, "+QUESTIONS_QUI_BASE.hard.length+" très hard.";
  var ul = $("peTextes"); ul.innerHTML = "";
  [["themes","Thème"],["questions","Question"]].forEach(function(k){
    TEXTES_QUI[k[0]].forEach(function(x, i){
      var li = el("li"); li.appendChild(el("p",null,k[1]+" · "+(NIV_QUI[x.niv]||x.niv)+" — "+x.t));
      var b = el("button","mini","Supprimer"); b.onclick = function(){ var a = TEXTES_QUI[k[0]].slice(); a.splice(i,1); var m = {}; m[k[0]] = a; medias().doc("qui-textes").set(m, {merge:true}).catch(function(){}); };
      li.appendChild(b); ul.appendChild(li);
    });
  });
  if(!TEXTES_QUI.themes.length && !TEXTES_QUI.questions.length) ul.appendChild(el("li","bq-rien","Aucun thème ni question ajoutés pour l'instant."));
}
$("peTOk").onclick = function(){
  var t = $("peTTexte").value.trim().slice(0,200), type = $("peTType").value, niv = $("peTNiv").value;
  if(!t || !CLE) return;
  if(type==="themes" && niv==="hard") niv = "spicy";
  var a = TEXTES_QUI[type].slice(); a.push({t:t, niv:niv}); var m = {}; m[type] = a;
  medias().doc("qui-textes").set(m, {merge:true}).catch(function(){});
  $("peTTexte").value = "";
};
