# Portfolio d'Ethan Allouche

Site statique : aucun outil à installer, aucun « build ». GitHub Pages sert ces fichiers tels quels.

## Mettre en ligne

1. Dans le dépôt GitHub `Portfolio`, supprime les anciens fichiers.
2. Dépose **tout le contenu de ce dossier** à la racine du dépôt (`index.html` doit être à la racine).
3. Attends une à deux minutes, puis ouvre `https://ethan-allouche.github.io/Portfolio/`.

## Modifier le contenu

Ouvre `https://ethan-allouche.github.io/Portfolio/admin/`.

- Chaque texte existe en français, en anglais et en hébreu. Un champ laissé vide dans une langue s'affiche en orange ; le site montre alors le texte français à la place.
- Tes modifications sont gardées en brouillon dans le navigateur. Le bouton **Aperçu** montre le site avec ce brouillon.
- **Publier** envoie le contenu sur GitHub avec un jeton d'accès (à créer une fois, les étapes sont dans l'admin), ou te donne le fichier `data/content.js` à déposer à la main.
- Les photos ajoutées depuis l'admin sont allégées automatiquement.
- **Projets** : la première photo ou vidéo s'affiche en grand en haut de la page du projet, les suivantes illustrent le texte, puis viennent la maquette 3D et l'aperçu du rapport PDF. La case « Mettre en avant » place le projet sur l'accueil.
- **Vidéos** : elles tournent toutes seules, en boucle, sans le son et sans lecteur, sur les cartes des projets comme dans les pages. Pour enchaîner plusieurs vidéos, dépose à côté de `images/mon-projet-1.mp4` des fichiers `images/mon-projet-1-2.mp4`, `-1-3.mp4`… : ils sont lus à la suite, dans l'ordre. Pour un logo ou un schéma, coche « Montrer l'image en entier ».
- **Compétences** : chaque compétence a un niveau, une description et les projets qui la prouvent (cases à cocher). Sur le site, un clic sur la compétence mène à ces projets.
- **Expérience** : logo de l'entreprise et projet lié (un clic sur l'expérience ouvre ce projet). La case « Ne pas afficher dans le CV » garde une ligne sur le site sans l'imprimer dans le CV. Même case pour les formations.
- **Formation** et **Centres d'intérêt** : image et page détaillée facultatives.

L'adresse de l'admin n'est pas secrète, mais personne ne peut rien publier sans ton jeton GitHub.

## Organisation

| Dossier ou fichier | Rôle |
| --- | --- |
| `index.html` | La page du site (onglets Accueil, Compétences, Formation, Projets, Expérience, Centres d'intérêt). |
| `cv.html` | Le CV, généré à partir du même contenu, dans les trois langues. Le bouton « Enregistrer en PDF » l'exporte sur une page A4. |
| `admin/` | L'éditeur de contenu. |
| `data/content.js` | Tout le contenu du site. C'est le seul fichier que l'admin modifie. |
| `images/`, `projects/` | Photos, vidéos et rapports PDF des projets. |
| `assets/js/app.js` | Affichage des pages et navigation. |
| `assets/js/i18n.js` | Détection de la langue et textes de l'interface. |
| `assets/js/mascot.js` | Le robot : où il va et ce qu'il fait. Il vit sur les blocs de la page, saute de l'un à l'autre même quand personne ne le regarde, et ne suit pas le défilement. Aucun texte quand on clique dessus. |
| `assets/js/mascot3d.js` | Le corps du robot en 3D (visage, bras, roues, accessoires, poses de chaque émote). Sans WebGL, ou si le visiteur a demandé moins d'animations, le dessin 2D de `mascot.js` prend le relais. |
| `assets/js/decks.js` | Afficheurs et commandes de chaque maquette 3D. |
| `assets/js/world/` | La scène 3D : moteur (`world.js`), outils (`kit.js`) et une maquette par fichier dans `models/`. |
| `assets/vendor/` | three.js, hébergé avec le site (aucun chargement depuis un autre serveur). |

## Langues

Le site choisit la langue du navigateur du visiteur : hébreu, français ou anglais (anglais pour toute autre langue). Le visiteur peut changer avec les boutons en haut ; son choix est mémorisé. Pour partager un lien dans une langue précise : `?lang=he`, `?lang=fr` ou `?lang=en`.

## Tester sur son ordinateur

Les navigateurs refusent de charger les modules JavaScript depuis un fichier local. Lance un petit serveur dans ce dossier :

```
python3 -m http.server 8000
```

puis ouvre `http://localhost:8000`.
