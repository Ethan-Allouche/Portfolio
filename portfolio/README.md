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
