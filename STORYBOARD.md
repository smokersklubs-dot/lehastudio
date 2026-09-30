# MARINA LEHACAUT STUDIO — Storyboard de l'expérience d'accueil

> Document de travail. Il sert de cahier des charges pour le design (DA, assets à produire) et pour le développement (chorégraphie du scroll, scènes 3D, perf).
> Version 0.1 — à valider avec Marina avant toute ligne de code.

---

## 0. Règles du jeu

### 0.1 Le rythme

L'accueil alterne les tensions. Chaque scène a une **intensité** (0 = vide, 5 = explosion). Il ne doit jamais y avoir deux pics d'affilée.

```
intensité
5 |            ███                                   
4 |          ██   █                                  
3 |        ██      █         ███          ██         
2 |     ███         █      ██   ██      ██  ██       
1 |  ███             ██  ██       ██  ██      ██     
0 |██                  ██           ██          ████ 
  +--------------------------------------------------
   INTRO  FIL   EXPLOSION  GESTE ARCADE  ŒUVRES  CRÉER  ATELIERS
   calme  matière   pic    calme  révél.  calme  jeu    chaleur
```

Le luxe vient du contraste : le **vide** avant et après l'explosion est aussi important que l'explosion elle‑même.

### 0.2 Les couleurs viennent des œuvres

Aucune couleur « décorative » inventée pour le site. On extrait une palette par œuvre (Arcade, Cubix, Vortex…) à partir des photos HD et des références de laine réellement utilisées. Chaque scène pioche dans ces palettes.

→ **Action Marina** : fournir, pour chaque œuvre, la liste des laines (marque + référence couleur) ou à défaut des photos à la lumière du jour.

### 0.3 Les garde‑fous (non négociables)

| Sujet | Règle |
|---|---|
| Visiteur pressé | Bouton **« Passer l'intro »** visible dès la 1re seconde, et saut automatique vers la galerie pour un visiteur qui revient (mémorisé localement). |
| Navigation | Petit monogramme **MLS** en haut à gauche + menu + panier, toujours présents, discrets (opacité 60 %). On ne prend jamais le visiteur en otage. |
| SEO | Le `<h1>` « Marina Lehacaut Studio — tapis et œuvres tuftées à la main » et un texte de présentation existent dans le HTML dès le chargement (visuellement révélés plus tard). Les pages œuvres et ateliers sont des pages classiques, rendues côté serveur. |
| Accessibilité | `prefers-reduced-motion` → version « éditoriale » : mêmes contenus, images fixes, fondus simples, aucune caméra. Tout le texte reste lisible sans WebGL. |
| Son | Coupé par défaut. Icône son en bas à droite. Activé seulement sur action volontaire. |
| Mobile | Mêmes 6 scènes, mais vidéos pré‑rendues à la place du temps réel 3D quand le GPU est faible (détection au chargement). |
| Performance | Premier affichage utile < 2,5 s en 4G. La 3D se charge **après** l'écran d'ouverture, scène par scène. |

### 0.4 Unités

- La page d'accueil est un long parcours scrollé. Sa longueur est exprimée en **vh** (1 vh = une hauteur d'écran).
- Les pourcentages ci‑dessous sont la **progression globale** du scroll de l'accueil (0 % = haut, 100 % = pied de page).
- Chaque scène a aussi sa progression locale `p` de 0 → 1, utilisée par l'animation.

---

## 1. Vue d'ensemble — la timeline

| Scène | Plage globale | Longueur | Intensité | Technique principale | But |
|---|---|---|---|---|---|
| 00 — Ouverture | avant scroll | 0 vh | 0 | HTML/CSS | Charger, poser le silence |
| 01 — Le fil | 0 → 14 % | 200 vh | 1 → 3 | Vidéo macro scrubbée + shader | Entrer dans la matière |
| 02 — L'explosion | 14 → 30 % | 240 vh | 3 → 5 → 1 | Three.js (bobines + fils) | Signature du site |
| 03 — Le geste | 30 → 46 % | 240 vh | 1 → 3 | WebM transparent + canvas/shader | Montrer le savoir‑faire |
| 03b — Révélation | 46 → 52 % | 90 vh | 3 | HTML + shader relief | Arcade + nom du studio |
| 04 — Les œuvres | 52 → 70 % | 280 vh | 1 → 2 | Galerie horizontale WebGL | Entrer dans le commerce |
| 05 — Créez la vôtre | 70 → 86 % | 220 vh | 2 → 3 | Configurateur (SVG/WebGL) | Personnalisation |
| 06 — Les ateliers | 86 → 100 % | 220 vh | 2 → 1 | Photos flottantes (CSS 3D) | Vendre les ateliers |
| Pied de page | après 100 % | — | 0 | HTML | Contact, newsletter, légal |

Total ≈ **1 490 vh** de parcours. C'est long : c'est pourquoi le bouton « Passer l'intro » et le menu permanent sont obligatoires.

---

## 2. Storyboard scène par scène

### SCÈNE 00 — OUVERTURE (avant tout scroll)

**Ce que voit le visiteur**

```
┌──────────────────────────────────────────────┐
│ MLS                                   ☰   ◯ │   ← nav discrète
│                                              │
│                                              │
│                                              │
│                      │                       │   ← un seul fil, vertical,
│                      │                       │     qui respire (ondule à peine)
│                      │                       │
│                                              │
│                                              │
│                 faites défiler               │   ← apparaît après 2,5 s
│                      ↓                       │
│ Passer l'intro                          🔇  │
└──────────────────────────────────────────────┘
fond #0E0D0C (noir chaud, pas noir pur)
```

| Temps | Événement |
|---|---|
| 0 s | Écran noir chaud. Nav à 0 %. |
| 0,3 s | Le fil se dessine de haut en bas (tracé SVG, 1,2 s, easing `power2.out`). Couleur : le fil dominant d'Arcade. |
| 1,5 s | Le fil commence à onduler (bruit très lent, amplitude 2 px). |
| 1,5 s | Nav + « Passer l'intro » + icône son apparaissent (fondu 0,6 s). |
| 2,5 s | « faites défiler ↓ » apparaît. Si aucun scroll après 6 s, la flèche fait un petit rebond. |
| en fond | Préchargement de la vidéo de la scène 01 et de la scène 3D 02. |

**Technique** : 100 % HTML/SVG, zéro WebGL. C'est ce qui garantit un affichage instantané.

---

### SCÈNE 01 — LE FIL (0 → 14 %)

Intention : on ne regarde pas le fil, **on entre dedans**.

| p (local) | Caméra | Image | Texte |
|---|---|---|---|
| 0,00 | Plan fixe | Le fil SVG de l'ouverture est remplacé (fondu enchaîné) par la vidéo macro du même fil, parfaitement alignée. | — |
| 0,10 | Zoom avant lent | On distingue les fibres, le duvet de la laine, la torsion. | **FIL.** apparaît (lettres qui se « tissent » : chaque lettre monte depuis une ligne) |
| 0,25 | Zoom continue | Le fil se détord : il se sépare en 3 brins. | **FIL.** disparaît vers le haut |
| 0,40 | Traversée | On passe *entre* les brins. Chaque brin prend une couleur d'œuvre. | **COULEUR.** |
| 0,60 | Travelling latéral | Les 3 brins deviennent 12, puis des dizaines, qui ondulent. | **COULEUR.** sort · **MOUVEMENT.** entre |
| 0,80 | Recul | Les fibres remplissent tout l'écran : une matière textile vivante. | **MOUVEMENT.** sort |
| 1,00 | — | Écran rempli de fibres colorées → transition vers 02 | — |

**Transition 01 → 02** : les fibres qui remplissent l'écran se « rembobinent » vers le centre et forment la première bobine 3D. (Shader de dissolution : l'image vidéo se transforme en particules qui convergent.)

**Technique**
- Vidéo macro tournée pour de vrai (pas de 3D ici : rien ne rendra mieux la vraie laine qu'une vraie caméra macro).
- Encodée avec **une image clé par frame** pour pouvoir la scrubber au scroll sans saccade (ou découpée en séquence d'images WebP si le scrub vidéo reste instable sur Safari).
- Les mots en HTML par‑dessus (`mix-blend-mode: difference` pour rester lisibles).

**Assets à produire**
- Plan macro 1 : un fil unique, zoom lent vers la fibre (10 s, 4K, fond noir).
- Plan macro 2 : 3 brins qui se détordent (10 s).
- Plan macro 3 : dizaines de fils de couleurs d'œuvres qui bougent (10 s).

---

### SCÈNE 02 — L'EXPLOSION (14 → 30 %)

Intention : c'est la **signature** du site. Le seul vrai pic d'intensité de l'accueil.

```
p 0,0          p 0,3              p 0,55                p 0,7               p 1,0
                                    
    ◉            ◉   ◉          ◉ ◉  ◉ ◉ ◉          ╲  │  ╱ ─── ~~         LA COULEUR
               ◉   ◉   ◉       ◉  ◉ ◉  ◉ ◉ ◉     ── ~~ ✺ ~~ ──             PREND FORME.
                 ◉   ◉          ◉ ◉ ◉ ◉  ◉          ╱  │  ╲  ~~ ───          
 1 bobine     10 bobines      30 bobines,        explosion de fils,       fils qui retombent
 qui tourne   qui flottent    accélération       traversent l'écran       lentement, calme
```

| p | Caméra | Scène 3D | Texte / son |
|---|---|---|---|
| 0,00 | Face, proche | Une bobine, née de la transition, tourne lentement sur elle‑même. Lumière rasante (on sent la texture). | — |
| 0,15 | Recul doux | Une 2e bobine apparaît, puis une 3e… | — |
| 0,30 | Recul + légère orbite | 10 bobines flottent en apesanteur, chacune d'une couleur d'œuvre. Un fil relie certaines d'entre elles. | — |
| 0,45 | Orbite plus rapide | 30 bobines. Elles accélèrent, tournent de plus en plus vite. Léger flou de mouvement. | (son) grondement textile qui monte |
| 0,55 | **Arrêt net 0,2 s** | Tout se fige une fraction de seconde. Silence. | Silence |
| 0,60 | Secousse de caméra | 💥 Les bobines se déroulent d'un coup : des centaines de fils colorés partent dans toutes les directions, traversent l'écran, passent *devant* la caméra. | (son) « whoosh » de laine |
| 0,75 | Ralenti | Les fils ralentissent, flottent comme sous l'eau. | — |
| 0,85 | Stabilisation | Les fils retombent doucement et s'organisent en lignes horizontales parallèles — comme une trame. | **LA COULEUR PREND FORME.** (grand, centré) |
| 1,00 | Fond passe au clair | La trame devient la toile de la scène 03. Le noir bascule en écru (#EFEAE2). | Le texte sort |

**Technique**
- Three.js / React Three Fiber, une seule scène, chorégraphiée par GSAP ScrollTrigger (la timeline est « scrubbée » : le visiteur contrôle la vitesse, peut revenir en arrière).
- Bobines : un modèle 3D léger (≈ 3 000 triangles) instancié (`InstancedMesh`) avec une texture de laine normal map + couleur par instance.
- Fils : courbes (`TubeGeometry` ou lignes épaisses en shader) animées sur GPU. Cible : 400 fils max desktop, 120 mobile.
- Bloom très léger en post‑process uniquement pendant l'explosion (coût GPU).
- **Fallback** (GPU faible / mobile ancien) : vidéo pré‑rendue de la même scène, scrubbée.

**Assets à produire**
- Modèle 3D de bobine (cône de laine industriel) + textures.
- Palette RVB exacte de chaque œuvre.
- 2 sons : montée textile, « whoosh » d'explosion (optionnels).

---

### SCÈNE 03 — LE GESTE (30 → 46 %)

Intention : **tout se calme**. Fond clair, beaucoup de vide. On montre la main de l'artiste à travers son outil.

```
┌──────────────────────────────────────────────┐
│                                              │
│      ┌──────────────────────────────┐        │
│      │ ════════════                 │        │   toile tendue (vue de face)
│      │ ════════════════════         │        │   les lignes de laine s'accumulent
│      │ ═══════                      │        │
│      │                  🔫 ←        │        │   tufting gun détouré qui avance
│      │                              │        │
│      └──────────────────────────────┘        │
│                                              │
│     De milliers de fils naît une pièce unique.│
└──────────────────────────────────────────────┘
fond écru #EFEAE2
```

| p | Image | Texte / son |
|---|---|---|
| 0,00 | Toile blanche tendue sur cadre, vue de face, légère perspective. Le tufting gun flotte à droite, immobile. | — |
| 0,10 | Le pistolet se met à vibrer et avance vers la toile. | (son) moteur du pistolet |
| 0,15 | 1re ligne : le pistolet traverse la toile de droite à gauche. Derrière lui, une ligne de laine apparaît, avec son relief. | TAC‑TAC‑TAC (synchronisé au scroll) |
| 0,30 | 2e ligne, 3e ligne. On reconnaît des blocs de couleur. | — |
| 0,50 | Le rythme s'accélère : les passages deviennent plus rapides, plusieurs zones se remplissent. | — |
| 0,75 | Le motif d'**Arcade** est reconnaissable à 80 %. | **De milliers de fils naît une pièce unique.** |
| 0,90 | Le pistolet sort du cadre. Les derniers vides se comblent tout seuls. | Son s'arrête. Silence. |
| 1,00 | Motif complet, vu *de face*. | — |

**Technique**
- Le **pistolet** : vidéo WebM avec transparence (HEVC alpha pour Safari), tournée sur fond vert puis détourée. Plus crédible et bien moins cher qu'un modèle 3D animé.
- Le **tapis qui se construit** : l'image HD d'Arcade est révélée par un **masque** qui suit le trajet du pistolet (shader : le masque est une texture qu'on « peint » ligne par ligne selon `p`). Une normal map donne le relief de la laine.
- Le trajet du pistolet est défini une fois pour toutes (liste de lignes) pour que pistolet et révélation soient parfaitement synchronisés.

**Assets à produire**
- Tournage : pistolet de tufting en action, fond vert, caméra fixe, 3 à 4 passages.
- Photo d'Arcade parfaitement de face, lumière rasante (pour la normal map) + lumière diffuse (pour la couleur).
- Enregistrement son du pistolet (optionnel).

---

### SCÈNE 03b — RÉVÉLATION : ARCADE (46 → 52 %)

Intention : le moment « générique ». Le nom du studio n'apparaît **qu'ici**.

| p | Image | Texte |
|---|---|---|
| 0,00 | Arcade occupe 60 % de l'écran. | — |
| 0,30 | La caméra avance : Arcade remplit tout l'écran. La souris fait bouger la lumière → on sent le relief de la laine. | — |
| 0,55 | Arcade s'assombrit légèrement (voile 30 %). | **MARINA LEHACAUT STUDIO** (grand, lettres qui se posent une à une) |
| 0,70 | — | *Architecture visuelle des émotions.* |
| 0,85 | — | **ENTRER** (bouton, cercle qui se remplit au survol) |
| 1,00 | Arcade recule et se range comme la **première œuvre** de la galerie → la scène 04 commence sans coupure. | — |

« ENTRER » fait défiler automatiquement jusqu'à la galerie. Continuer à scroller fait la même chose.

---

### SCÈNE 04 — LES ŒUVRES (52 → 70 %)

Intention : **on entre dans le commerce, sans grille Shopify**. Une galerie d'exposition.

```
┌──────────────────────────────────────────────┐
│ MLS            ŒUVRES · ATELIERS · STUDIO  ◯ │
│                                              │
│   ▯        ┌──────────────────┐        ▯     │   œuvre précédente / suivante
│   ▯        │                  │        ▯     │   (petites, floutées, en profondeur)
│   ▯        │      ARCADE      │        ▯     │
│   ▯        │                  │        ▯     │
│            └──────────────────┘              │
│   ARCADE                    Pièce unique     │
│   90 × 90 cm · laine        1 400 €          │   (prix : exemple, à confirmer)
│                                              │
│   ◀  01 / 06  ▶           Glisser  ⟷         │
└──────────────────────────────────────────────┘
```

| p | Événement |
|---|---|
| 0,00 | Arcade est au centre. À droite, à moitié hors écran et en retrait, Cubix attend. |
| scroll ↓ | La page **ne descend pas** : elle est épinglée et le scroll vertical fait glisser la galerie horizontalement. Drag souris / swipe et flèches clavier fonctionnent aussi. |
| entre deux œuvres | L'œuvre sortante recule et s'incline légèrement ; l'entrante avance. Le **fond change de teinte** selon la couleur dominante de l'œuvre (très désaturée). |
| survol | Parallaxe de la lumière sur le relief (même shader que 03b). Le curseur devient un disque « VOIR ». |
| clic | **Zoom** dans l'œuvre : elle grossit jusqu'à remplir l'écran, on voit les fibres, puis transition vers la fiche produit (l'image reste en place, la fiche se construit autour). |
| p = 1 | Dernière œuvre + une carte **« Toutes les œuvres → »** (lien vers la page catalogue complète). |

**Fiche produit (page à part, `/oeuvres/arcade`)**
- Haut : l'œuvre plein écran, relief interactif, zoom macro au clic.
- Puis : nom, dimensions, matière, pièce unique / édition, prix, **Ajouter au panier**.
- Puis : « L'histoire de l'œuvre » (texte de Marina), photos en situation, vidéo de fabrication si disponible.
- Si l'œuvre existe en version personnalisable → bloc « Créez la vôtre à partir d'Arcade » vers la scène 05 / configurateur.

**Technique**
- Galerie : un seul canvas WebGL avec des plans texturés (pas une div par œuvre) pour les effets de profondeur, la déformation au glissement et la transition de zoom.
- Données produits : **Shopify Storefront API** (headless). Les œuvres sont des produits Shopify ; le site ne fait que les afficher.
- Chaque œuvre a sa page statique générée → bon référencement.

---

### SCÈNE 05 — CRÉEZ LA VÔTRE (70 → 86 %)

Intention : transformer la personnalisation en **jeu créatif**, pas en formulaire.

Sur l'accueil c'est un **aperçu jouable** ; le configurateur complet vit sur `/creer/arcade`.

```
┌──────────────────────────────────────────────┐
│  CRÉEZ LA VÔTRE                              │
│                                              │
│  FORMAT            ┌────────────────┐        │
│  ○ 51 × 51         │                │        │
│  ● 70 × 70         │    ARCADE      │        │   le tapis flotte, tourne
│  ○ 90 × 90         │   (vos coul.)  │        │   très légèrement
│  ○ Sur mesure      │                │        │
│                    └────────────────┘        │
│  ZONE  [ A ][ B ][ C ]                       │
│  PALETTE ● ● ● ● ● ● ● ●                     │
│                                              │
│  USAGE   ( Mural | Sol )                     │
│  [ Voir dans un intérieur ]                  │
│                                              │
│  À partir de 690 €        [ Commander → ]    │   (prix : exemple)
└──────────────────────────────────────────────┘
```

| Étape (scroll ou clic) | Ce qui se passe |
|---|---|
| Entrée | Le tapis arrive en tournant et se pose au centre. Les options apparaissent une par une à gauche. |
| Format | Le tapis change de taille, avec un repère d'échelle (silhouette d'une chaise ou d'une main) pour que la taille soit concrète. |
| Zone A → couleur | Clic sur une pastille → la couleur **se propage** dans la zone comme de la laine qui se tufte (même effet de révélation que la scène 03, en 0,6 s). |
| Zone B, zone C | Idem. Le prix se met à jour en direct. |
| Mural / Sol | Mural : le tapis se redresse, ombre portée sur un mur. Sol : il bascule à plat, vue en plongée. |
| Voir dans un intérieur | Le fond se transforme en pièce (3 ambiances photo : salon, chambre, entrée). Le tapis s'y pose en perspective. |
| Commander | Crée l'article dans le panier Shopify avec les options choisies (propriétés de ligne). Pour « sur mesure » → formulaire de demande de devis. |

**Règles de personnalisation** (à valider avec Marina)
- Nombre de zones modifiables par modèle (proposition : 3 max, sinon ça devient un logiciel).
- Palette limitée aux laines réellement disponibles en stock (8 à 12 teintes).
- Délai de fabrication affiché clairement.

**Technique**
- Le motif de chaque modèle personnalisable est redessiné en **SVG vectoriel par zones** (une forme = une zone nommée). La couleur change par simple remplissage, puis une texture de laine + relief est appliquée par‑dessus en shader.
- « Voir dans un intérieur » : photos de pièces avec les 4 coins de l'emplacement pré‑calculés (déformation perspective simple, pas de 3D lourde). Une version AR mobile (modèle USDZ/GLB) peut venir plus tard.

**Assets à produire**
- Fichiers vectoriels des motifs personnalisables (Arcade en premier).
- Nuancier photographié des laines disponibles.
- 3 photos d'intérieurs (libres de droits ou shooting).

---

### SCÈNE 06 — LES ATELIERS (86 → 100 %)

Intention : **changement d'univers**. On quitte la galerie, on entre dans l'atelier. Plus chaud, plus humain.

| p | Image | Texte |
|---|---|---|
| 0,00 | Transition : fond qui passe d'écru à un ton chaud (terracotta très clair). Grain photo léger. | — |
| 0,10 | Des photos/vidéos courtes arrivent comme des **tirages papier** qui flottent dans l'espace, à différentes profondeurs, légèrement inclinés, avec une ombre douce. | — |
| 0,10 → 0,60 | La caméra **avance à travers** les tirages, dans l'ordre du processus : bobines → toile → mains → tufting gun → découpe → laine au sol → œuvre terminée. Chaque tirage vidéo se lance quand il passe au centre. | Légende manuscrite sous chaque tirage (« 1. choisir ses couleurs »…) |
| 0,65 | Les tirages s'écartent, laissant un grand vide central. | **CETTE FOIS,** |
| 0,75 | — | **C'EST VOUS QUI CRÉEZ.** |
| 0,85 | Infos concrètes : durée, nombre de places, prix, ce qu'on repart avec. | **ATELIERS TUFTING — COLOMBES** |
| 0,95 | — | [ **Découvrir l'expérience** ] → `/ateliers` · prochaine date disponible affichée à côté du bouton |
| 1,00 | Pied de page. | — |

**Technique**
- CSS 3D (`perspective` + `translateZ`) piloté par GSAP : pas besoin de WebGL ici, c'est plus léger et suffisant.
- Vidéos courtes (3–5 s) en boucle, muettes, chargées uniquement à l'approche.
- La prochaine date vient de l'outil de réservation (Shopify produit « atelier » avec dates en variantes, ou outil externe type Calendly/Tipee — à décider).

**Assets à produire**
- Shooting atelier : 7 photos + 7 micro‑vidéos (une par étape), cadrage vertical 4:5.
- Textes : déroulé d'un atelier, prix, durée, capacité, adresse.

---

## 3. Le parcours après l'accueil

```
                     ACCUEIL (expérience)
                            │
        ┌───────────────────┼────────────────────┐
        ▼                   ▼                    ▼
   /oeuvres            /creer/[modèle]        /ateliers
   pièces uniques      personnalisables       réservation
        │                   │                    │
   /oeuvres/[œuvre]         │                    │
        │                   │                    │
        └─────────┬─────────┘                    │
                  ▼                              ▼
             PANIER (tiroir latéral)  ◄──────────┘
                  │
                  ▼
        Checkout Shopify (paiement, livraison)
```

- **/oeuvres** : catalogue complet (la galerie de l'accueil en version navigable + filtre « disponible / vendu / personnalisable »).
- **/studio** : Marina, la démarche, presse, expositions.
- **Panier** : tiroir latéral stylé au site. Le **checkout** reste celui de Shopify (sécurité, paiements, TVA) aux couleurs du studio.
- Les pages intérieures sont **sobres** : l'immersion est concentrée sur l'accueil et sur les transitions. Une fiche produit doit rester rapide et claire.

---

## 4. Architecture technique

| Couche | Choix | Rôle |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Pages, rendu serveur, SEO |
| Scroll fluide | Lenis | Inertie du scroll, synchronisée avec GSAP |
| Chorégraphie | GSAP + ScrollTrigger | Toutes les timelines, épinglages, scrub |
| 3D | Three.js via React Three Fiber (+ drei) | Scène 02, galerie 04, relief 03b |
| Shaders | GLSL maison | Dissolution 01→02, révélation 03, relief laine, fond 04 |
| Vidéo | MP4/WebM (scrub) + WebM alpha / HEVC alpha | Scènes 01 et 03 |
| Commerce | Shopify headless (Storefront API) | Produits, variantes, stock, panier, paiement |
| Contenu | Shopify metafields (ou CMS léger) | Textes des œuvres, histoire, ateliers |
| Hébergement | Vercel | Déploiement, images optimisées |

**Organisation du code (proposition)**

```
app/
  page.tsx                 ← accueil : monte les 6 scènes
  oeuvres/[slug]/page.tsx
  creer/[slug]/page.tsx
  ateliers/page.tsx
components/experience/
  ExperienceCanvas.tsx     ← UN seul canvas WebGL partagé par toutes les scènes
  Scene00Ouverture.tsx
  Scene01Fil.tsx
  Scene02Explosion.tsx
  Scene03Geste.tsx
  Scene03bRevelation.tsx
  Scene04Galerie.tsx
  Scene05Creer.tsx
  Scene06Ateliers.tsx
  useScrollScene.ts        ← donne p (0→1) à chaque scène
  quality.ts               ← détecte le niveau GPU → high / low / reduced-motion
lib/shopify/               ← requêtes Storefront API
```

Principe clé : **un seul canvas WebGL** pour tout l'accueil (et non un par scène), chaque scène ne monte ses objets 3D que lorsqu'elle est proche de l'écran.

**Budget performance**

| Élément | Budget |
|---|---|
| JS initial (avant 3D) | < 150 Ko compressé |
| Scène 02 (modèle + textures) | < 1,5 Mo |
| Vidéo scène 01 | < 4 Mo desktop, < 2 Mo mobile |
| Vidéo pistolet scène 03 | < 2 Mo |
| Images galerie | AVIF/WebP, chargées à l'approche |
| Images/seconde | 60 fps desktop, 30 fps minimum mobile |

---

## 5. Liste des assets à réunir (récapitulatif)

| # | Asset | Scène | Qui | Priorité |
|---|---|---|---|---|
| 1 | Photos HD de face de chaque œuvre (lumière diffuse + rasante) | 03, 03b, 04 | Photographe / Marina | ★★★ |
| 2 | Palette laines de chaque œuvre (références) | toutes | Marina | ★★★ |
| 3 | Fichiers vectoriels des motifs personnalisables (Arcade d'abord) | 05 | Marina / graphiste | ★★★ |
| 4 | Tournage pistolet sur fond vert | 03 | Vidéaste | ★★★ |
| 5 | 3 plans macro de laine | 01 | Vidéaste | ★★ |
| 6 | Modèle 3D de bobine | 02 | Dev 3D | ★★ |
| 7 | Shooting atelier (7 photos + 7 micro‑vidéos) | 06 | Photographe | ★★ |
| 8 | Nuancier des laines disponibles | 05 | Marina | ★★ |
| 9 | 3 photos d'intérieurs | 05 | Banque d'images / shooting | ★ |
| 10 | Sons (textile, explosion, pistolet) | 01–03 | Sound design | ★ |
| 11 | Textes : histoire des œuvres, studio, ateliers | 04, 06 | Marina | ★★★ |

Un seul jour de tournage peut couvrir 4, 5 et 7.

---

## 6. Questions ouvertes pour Marina

1. **Œuvres** : quelles œuvres sont à vendre au lancement ? Lesquelles sont des pièces uniques, lesquelles sont déclinables ?
2. **Personnalisation** : quels modèles sont personnalisables ? Combien de zones de couleur ? Quels formats exacts et quels prix ?
3. **Arcade** est‑elle bien l'œuvre « signature » qui se construit en scène 03 ? (Elle doit être très reconnaissable et graphique.)
4. **Ateliers** : durée, capacité, prix, fréquence ? Réservation via le site (Shopify) ou via un outil existant ?
5. **Shopify** : compte déjà existant ? Produits déjà saisis ?
6. **Son** : on le garde (optionnel, coupé par défaut) ou on l'abandonne ?
7. **Langues** : français seul au lancement, ou français + anglais ?
8. **Tournage** : qui filme ? Disponibilité de l'atelier de Colombes pour une journée ?

---

## 7. Plan de réalisation proposé

| Phase | Contenu | Livrable |
|---|---|---|
| **1. Prototype « gris »** | Les 6 scènes en formes simples (cubes, aplats, textes), la vraie timeline de scroll, la vraie longueur, Lenis + GSAP. | Lien de test pour **valider le rythme** avant de produire le moindre asset coûteux. |
| **2. Scène signature** | Scène 02 (explosion) finalisée en vraie 3D + scène 03 avec un faux pistolet. | Valider la DA et la faisabilité perf mobile. |
| **3. Tournage + assets** | Journée de tournage, photos des œuvres, vectorisation d'Arcade. | Assets finaux. |
| **4. Commerce** | Shopify headless : galerie, fiches, panier, configurateur Arcade. | Achat possible de bout en bout. |
| **5. Ateliers + finitions** | Scène 06, page ateliers, reduced‑motion, mobile, SEO, perf. | Mise en ligne. |

La phase 1 est la plus importante : c'est elle qui dira si ~1 500 vh c'est trop long, si l'explosion arrive au bon moment, et si le passage vers l'achat est naturel. Elle se fait avant de dépenser un euro en tournage.
