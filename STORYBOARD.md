# MARINA LEHACAUT STUDIO — Storyboard du film interactif

> Cahier des charges créatif et technique de l'accueil.
> **v0.3** — direction artistique ivoire, et intro (0 → 33 %) en vraies vidéos générées avec Flow, pilotées par le scroll. Voir aussi [§ 3. Production vidéo Flow](#3-production-vidéo-flow).
> v0.2 — l'accueil est pensé comme un film interactif, et plus comme une suite de sections.
> Prototype « gris » correspondant : [`prototype/`](prototype/).

---

## 0. Le concept

> Le visiteur entre dans un fil de laine. Il traverse la matière et la couleur. Il assiste à la naissance d'une œuvre. Il découvre qu'il peut l'acquérir ou la transformer. À la fin du voyage, il découvre qu'il peut lui-même prendre le tufting gun.

### 0.1 La colonne vertébrale

Chaque animation raconte une étape du processus de Marina. Si un effet ne correspond à aucun maillon de cette chaîne, il est retiré.

```
FIBRE → FIL → COULEUR → GESTE → FORME → ŒUVRE → PERSONNALISATION → MAIN → TRANSMISSION
  │       │       │        │       │       │            │              │          │
 01      01      02       03      04      04/05         06             07         08
```

C'est une **transformation continue de la matière**, pas une suite de tableaux. Aucune coupe franche avant la scène 07, où la coupe est justement le sens du moment (on quitte le rêve pour le réel).

### 0.2 Le rythme

```
intensité
5 |              ▲ WOW 1                  ▲ WOW 2
4 |             ███                      ███
3 |           ██   █        ███        ██   █
2 |      ████       █     ██   ███   ██      █   ██    ██
1 |   ██             █  ██        ███         ███  ████  ██
0 |███                ██                                   ███
  +-----------------------------------------------------------
   FIL   FIBRE  EXPLOSION  GESTE  ARCADE  GALERIE  CASSER  RÉEL  ATELIER  STUDIO
   0     5      15         30     43      55       67      77    86       94   100 %
```

Deux « WOW » seulement : l'explosion (02) et l'œuvre qui se casse (06). Tout le reste est au service de ces deux moments.

### 0.3 Le désir avant la vente

Pendant **43 % du parcours, rien n'est à vendre**. Le premier élément commercial (« ARCADE Nº01 — Découvrir la pièce ») n'apparaît qu'à 50 %. C'est voulu : le produit est la récompense du voyage.

### 0.4 Les quatre types d'assets

| Type | Rôle | Scènes |
|---|---|---|
| **Vidéos CGI générées (Flow)** | Fil, entrée dans la matière, couleur, sortie vers la bobine, envol, explosion, toile, pistolet | 01 → 04 |
| **WebGL / 3D** (Three.js) | Tout ce qui doit **réagir** au visiteur : Arcade qui naît en zones, galerie impossible, Arcade qui se casse, configurateur | 05 → 07 |
| **GSAP** | Lecture des vidéos au scroll, caméra virtuelle, textes, transitions | toutes |
| **Vraies vidéos tournées** | Mains, tufting, colle, découpe, rasage, atelier, participant·e | 08, 09 |
| **Images HD** | Œuvres finales, fiches produit, e-commerce | 05 → 07, pages produit |

**Règle de partage** : un plan *linéaire* (le visiteur le regarde) peut être une vidéo générée ; un plan *interactif* (le visiteur agit dessus) doit être en 3D ; un plan qui doit *prouver* (« ça existe ») doit être une vraie vidéo. Les textes ne sont **jamais** dans les vidéos : ils sont en HTML par-dessus (nets, traduisibles, indexables).

La vidéo générée crée le rêve, la vidéo réelle crée la confiance.

### 0.5 Garde-fous (non négociables)

| Sujet | Règle |
|---|---|
| **Visiteur pressé** | Pas de menu au début (c'est voulu), mais un lien minuscule **« Passer »** en bas à gauche + touche Échap. Un visiteur qui revient arrive directement à la scène 06, la galerie (mémorisé localement). |
| **Menu** | Invisible au début. Le monogramme apparaît avec le titre (≈ 1,2 %), le menu complet et le panier à 43 %, au moment où le commerce commence. |
| **Le scroll ne bloque jamais** | La personnalisation (scène 06) est *jouable* pendant le scroll, mais n'est jamais obligatoire : continuer à scroller fait avancer le film. Le configurateur complet vit sur sa propre page. |
| **SEO** | Le titre, la présentation du studio et les liens vers les œuvres et ateliers existent dans le HTML dès le chargement. Les pages œuvres/ateliers sont des pages classiques rendues côté serveur. |
| **Accessibilité** | `prefers-reduced-motion` → version « éditoriale » : mêmes textes et images, fondus simples, pas de caméra. |
| **Son** | Coupé par défaut, icône en bas à droite. |
| **Mobile** | Les interactions souris deviennent : inclinaison du téléphone (si autorisée) ou toucher-glisser. La 3D baisse en densité (pas de post-process). Les vidéos de l'intro ont une version portrait recadrée et plus légère. |
| **Performance** | Premier affichage < 2,5 s en 4G : la 1re image de V01 (espace ivoire presque vide) sert d'affiche. Les vidéos suivantes et la 3D se chargent pendant que le visiteur regarde le fil. |

---

## 1. Timeline

Longueur totale de l'accueil : **≈ 2 000 vh** (20 hauteurs d'écran). Les pourcentages sont la progression globale du scroll. **1 % = 20 vh** : un plan vidéo de 10 s sur 5 % se lit en 100 vh, soit environ une hauteur d'écran de scroll.

| # | Scène | Plage | vh | Maillon | Technique | Commerce |
|---|---|---|---|---|---|---|
| 01 | Le fil | 0 → 5 % | 100 | Fibre, fil | Vidéo Flow V01 | — |
| 02 | Entrer dans la matière | 5 → 15 % | 200 | Fil, couleur | Vidéos Flow V02 + V03 | — |
| 03 | Sortie, envol, explosion | 15 → 30 % | 300 | Couleur | Vidéos Flow V04 → V07 | — |
| 04 | Le geste | 30 → 43 % | 260 | Geste | Vidéos Flow V08 → V10 (prototype : 3D) | — |
| 05 | Arcade naît | 43 → 55 % | 240 | Forme, œuvre | WebGL + image HD | **1re apparition** |
| 06 | La galerie impossible | 55 → 67 % | 240 | Œuvre | WebGL (architecture) | Œuvres cliquables |
| 07 | Casser l'œuvre | 67 → 77 % | 200 | Personnalisation | WebGL + UI | **Configurateur** |
| 08 | Du digital au réel | 77 → 86 % | 180 | Main | Vraie vidéo | Réassurance |
| 09 | L'atelier | 86 → 94 % | 160 | Transmission | Vraie vidéo + UI | **Ateliers** |
| 10 | Le studio | 94 → 100 % | 120 | — | HTML | Navigation normale |

---

## 2. Scène par scène

Pour chaque scène, `p` est la progression locale de 0 à 1.

### 01 — LE FIL (0 → 5 %) — vidéo V01 ✅

Fond **ivoire chaud** (plus de noir). Un espace vide et lumineux, un fil corail qui entre par la gauche, puis la caméra s'approche jusqu'à ce que le fil remplisse l'écran.

| p | Image (V01) | Texte (HTML) |
|---|---|---|
| avant scroll | Espace ivoire presque vide, lumière de fenêtre douce. | « faites défiler ↓ » |
| 0,2 → 0,6 | Le fil corail entre et dessine une courbe. | **MARINA LEHACAUT / STUDIO**, très petit, en haut du tiers central (1,2 → 2,9 %). Monogramme MLS dans la nav. |
| 0,6 → 1 | Travelling avant : le fil grandit, le duvet apparaît, il remplit l'écran. | — |

**Interaction** : légère parallaxe de l'image à la souris (la matière « respire »). La vidéo avance et recule avec le scroll.

### 02 — ENTRER DANS LA MATIÈRE (5 → 15 %) — vidéos V02 ✅ + V03 ✅

| Plage | Image | Raccord |
|---|---|---|
| 5 → 10 % (V02) | On plonge dans le fil corail ; des fibres écrues géantes, puis des fibres framboise et rouges apparaissent. | Fondu court depuis la dernière image de V01 (fil corail en gros plan). |
| 10 → 15 % (V03) | Paysage de laines tressées corail/framboise, puis jaune, orange, bleu marine, cobalt envahissent l'espace, lumière ivoire au fond. | Fondu court. |

### 03 — SORTIE, ENVOL, EXPLOSION (15 → 30 %) — WOW 1

| Plage | Image | Statut |
|---|---|---|
| 15 → 21 % (V04) | Tunnel de laine multicolore → la caméra recule → **c'était le fil enroulé sur une bobine** qui flotte dans l'ivoire → d'autres bobines apparaissent. | ✅ |
| 21 → 25 % (V05) | L'envol : une bobine corail, puis des dizaines, en profondeur, qui convergent vers un point central. | ✅ |
| 25 → 30 % (V06) | La sphère de bobines, puis l'explosion : les bobines partent, les fils traversent l'image, la caméra passe au travers et finit sur **un gros plan de laine corail plein cadre**. | ✅ |
| 30 → 33 % (V07) | Macro de laine corail, les fils se séparent et s'éloignent, jusqu'à un **ivoire vide** : la toile de la scène 04 apparaît dans ce vide. | ✅ |

Texte HTML : **LA COULEUR N'A PAS DE LIMITES.** une fraction de seconde au cœur de l'explosion (≈ 27 → 28 %).

Le fil corail plein écran de la fin de V06 sert de transition vers la toile de la scène 04 : **explosion → fil plein écran → fil qui traverse une toile → tufting gun**.

### 04 — LE GESTE (30 → 43 %)

```
                 ┌──────────────────────────────────┐
                 │ ═══════════════                  │
                 │ ════════════════════════         │  toile immense, blanche
                 │                                  │
                 │                         ▟▀▀▙     │  le pistolet, objet 3D
                 │                           ▐      │
                 └──────────────────────────────────┘
                          ✦ ✦  ✦                       fibres qui suivent la souris
fond écru #EEE9E1
```

| p | Caméra | Image | Son |
|---|---|---|---|
| 0,00 | Face à la toile, grand angle | Une toile immense, blanche, tendue. Rien dessus. | — |
| 0,10 → 0,30 | **Orbite lente** (≈ 15°) | Le tufting gun **entre lentement dans le cadre comme un objet dans l'espace** : il avance en profondeur, pivote, la lumière glisse sur lui. | — |
| 0,35 | Revient face | 1re ligne. | TAC. |
| 0,50 | — | 2e ligne. | TAC TAC TAC. |
| 0,60 → 1 | Se rapproche peu à peu | 3e ligne, puis le rythme accélère. | TAC TAC TAC TAC… |

**Participation du visiteur** : autour du curseur, quelques fibres libres flottent et suivent le mouvement avec retard, puis se déposent près de la ligne en cours. Le visiteur ne dessine **pas** : il a juste l'impression d'accompagner la naissance.

**Technique** : vidéos Flow V07 → V10 lues au scroll (le prototype utilise encore une 3D provisoire). Les fibres qui suivent la souris sont une fine couche WebGL transparente **par-dessus** la vidéo. Les lignes tracées ici *sont* les premières lignes du motif d'Arcade : la forme exacte d'Arcade prend le relais en 3D/photo à la scène 05 (voir § 3.3).

### 05 — ARCADE NAÎT (43 → 55 %)

| p | Image | Texte |
|---|---|---|
| 0,00 → 0,20 | **Forme 1** — le pistolet trace la première grande forme d'Arcade (en blanc cassé, sans couleur). | — |
| 0,20 → 0,40 | **Forme 2** — les autres formes géométriques. Le motif est lisible, encore monochrome. | — |
| 0,40 → 0,55 | **Couleur** — les zones prennent leurs vraies couleurs, une par une. | — |
| 0,55 → 0,70 | **Volume** — la laine gonfle (relief), la caméra se rapproche : on voit les fibres. | — |
| 0,70 → 0,85 | Recul. Le pistolet et la toile disparaissent. **Arcade, terminé, flotte**, très grand, fond extrêmement sobre. | — |
| 0,85 → 1 | Arcade reste. Carte discrète en bas à gauche : | **ARCADE Nº01** · Œuvre textile · 51 × 51 cm · **Découvrir la pièce →** |

Le menu complet et le panier apparaissent ici (première apparition du commerce).

**Technique** : le motif d'Arcade est reconstruit en **zones vectorielles** (mêmes fichiers que le configurateur) : chaque zone = une forme extrudée, texture laine + relief. C'est ce qui permet ensuite de le casser en 07. Pour la version finale « terminée », on superpose l'image HD réelle (fondu) : la 3D construit, la photo prouve.

### 06 — LA GALERIE IMPOSSIBLE (55 → 67 %)

| p | Caméra | Image |
|---|---|---|
| 0,00 → 0,20 | Recul large | Arcade glisse sur le côté. On découvre qu'il flottait dans une **architecture** : arches, cubes, plans suspendus, escaliers qui ne mènent nulle part — construits à partir des formes des œuvres elles-mêmes. |
| 0,20 → 0,45 | Le scroll fait **avancer** la caméra dans l'espace | **CUBIX** apparaît, suspendu dans un cadre cubique. |
| 0,45 → 0,70 | Virage | **VORTEX**, au centre d'une spirale de plans. |
| 0,70 → 1 | Continue | Les autres œuvres. Puis la caméra remonte et revient face à Arcade. |

**Interaction** : survol d'une œuvre → elle se tourne légèrement vers le visiteur, son nom + « pièce unique / personnalisable » + prix apparaissent. Clic → zoom dans l'œuvre → fiche produit.

**Couleurs** : l'architecture est monochrome (écru, gris chaud). Seules les œuvres sont en couleur.

### 07 — CASSER L'ŒUVRE (67 → 77 %) — WOW 2

| p | Image | Interface |
|---|---|---|
| 0,00 | Face à Arcade. | Un seul bouton : **PERSONNALISER** |
| 0,05 → 0,30 | Arcade **se sépare** : chaque zone géométrique s'écarte dans l'espace, en profondeur, sans violence (vitesse lente, légère rotation). La caméra passe entre les éléments. | — |
| 0,30 | Les éléments se stabilisent, en éclaté. | **CHOISISSEZ VOTRE PALETTE** ● ● ● ● ● ● |
| — | Clic sur une couleur → la zone survolée/sélectionnée prend cette couleur, avec un effet de laine qui se « tufte » (≈ 0,6 s). | — |
| 0,55 | — | **FORMAT** 51 × 51 · 70 × 70 · 90 × 90 · Sur mesure |
| — | Changement de format → les éléments s'écartent davantage puis se réassemblent à la nouvelle échelle (repère d'échelle discret). Prix mis à jour. | — |
| 0,80 | — | **CRÉER MON ARCADE** |
| 0,85 → 1 | 💥 Toutes les pièces reviennent ensemble, avec les couleurs du visiteur. **Voici son tapis.** | Prix · délai · **Ajouter au panier** / **Continuer dans le configurateur →** |

**Comportement du scroll** : si le visiteur scrolle sans cliquer, le film joue tout seul (Arcade se casse, une palette de démonstration se colore, se réassemble). S'il clique « PERSONNALISER » ou une couleur, le scroll est mis en pause dans cette scène jusqu'à « Créer mon Arcade » ou un bouton « Continuer le voyage ↓ ». **Il n'est jamais bloqué sans sortie visible.**

**Commerce** : « Ajouter au panier » crée une ligne Shopify avec les options (couleurs par zone, format). « Sur mesure » → demande de devis.

### 08 — DU DIGITAL AU RÉEL (77 → 86 %)

**Cut.** Première coupe franche du film. Plein écran, vraie vidéo.

| p | Plan (vraie vidéo macro) |
|---|---|
| 0,00 | La main de Marina (pas de visage). |
| 0,12 | Le tufting gun qui pique la toile. |
| 0,25 | La laine, les bobines réelles. |
| 0,38 | La colle étalée au dos. |
| 0,50 | La découpe. |
| 0,62 | Le rasage. |
| 0,75 | Les fibres qui volent. |
| 0,88 | Le tapis terminé, retourné. |

Texte : **FAIT À LA MAIN.** (≈ 0,3) puis **À COLOMBES.** (≈ 0,7).

**Technique** : un montage vidéo unique (≈ 30 s, sans son ou avec son d'atelier optionnel). Le scroll fait avancer le montage (vidéo encodée pour être scrubbée) ; alternative plus légère si le scrub saccade : chaque plan est un clip court qui se lance quand on arrive sur sa plage.

### 09 — L'ATELIER (86 → 94 %)

Changement de point de vue : jusqu'ici *je regarde Marina créer* ; maintenant *je peux créer*.

| p | Image | Texte |
|---|---|---|
| 0,00 → 0,30 | Vidéo : le tufting gun est **posé** sur l'établi. La caméra s'approche. | — |
| 0,30 → 0,55 | Transition : **une autre main** (celle d'un·e participant·e) entre dans le cadre et le saisit. | — |
| 0,55 | — | **À VOUS.** |
| 0,70 | — | **ATELIERS TUFTING — COLOMBES** |
| 0,80 | Formules (à définir) : Initiation 2 h · Création 3 h · Atelier privé. | Prochaine date disponible |
| 0,90 | — | **Découvrir les ateliers →** |

### 10 — LE STUDIO (94 → 100 %)

Silence. Fond clair. Une seule œuvre. Retour à une navigation parfaitement normale.

```
┌──────────────────────────────────────────────┐
│                                              │
│                  ┌──────┐                    │
│                  │ œuvre│                    │
│                  └──────┘                    │
│                                              │
│             MARINA LEHACAUT                  │
│                 STUDIO                       │
│                                              │
│  ŒUVRES · COLLECTIONS · SUR MESURE ·         │
│  ATELIERS · LE STUDIO                        │
│                                              │
│  Instagram · Pinterest · Contact             │
└──────────────────────────────────────────────┘
```

---

## 3. Production vidéo Flow

On ne génère **jamais** l'intro en une seule vidéo : chaque séquence fait 8–10 s, et c'est le site qui les raccorde et les lit au rythme du scroll. On avance comme une production : une séquence validée devient la référence visuelle de la suivante.

### 3.1 Découpage et statut

| V | Séquence | Place sur le site | Fabrication | Statut |
|---|---|---|---|---|
| 01 | Le fil | 0 → 5 % | Flow | ✅ `v01-fil` |
| 02 | Entrée dans la matière | 5 → 10 % | Flow | ✅ `v02-matiere` |
| 03 | La couleur | 10 → 15 % | Flow | ✅ `v03-couleur` |
| 04 | Sortie → la bobine | 15 → 21 % | Flow | ✅ `v04-sortie` |
| 05 | L'envol | 21 → 25 % | Flow | ✅ `v05-envol` |
| 06 | Explosion | 25 → 30 % | Flow | ✅ `v06-explosion` |
| 07 | Transition toile (fibres qui s'écartent → ivoire vide) | 30 → 33 % | Flow | ✅ `v07-toile` |
| 08 | Le fil entre dans la toile, le tufting gun entre | 33 → 36 % | Flow | ⏳ prochaine |
| 09 | Premier trait (TAC) | 36 → 39 % | Flow | ⏳ |
| 10 | Construction du motif | 39 → 43 % | Flow **ou** 3D | ⏳ voir 3.3 |
| 11 | Révélation d'Arcade | 43 → 52 % | 3D + photo HD | — |
| 12 | Matière (travelling sur le tapis fini) | 52 → 55 % | Flow ou vraie macro | ⏳ |
| 13 | Galerie | 55 → 67 % | **3D** (interactive) | — |
| 14 | Décomposition | 67 → 72 % | **3D** (interactive) | — |
| 15 | Reconstruction | 72 → 77 % | **3D** (interactive) | — |
| 16 | Intérieur | configurateur | Photo d'intérieur + vrai tapis incrusté | — |
| 17 | Retour au réel | 77 % | **Vraie vidéo** | à tourner |
| 18 | Fabrication | 77 → 86 % | **Vraie vidéo** | à tourner |
| 19 | Atelier | 86 → 90 % | **Vraie vidéo** | à tourner |
| 20 | Transmission | 90 → 94 % | **Vraie vidéo** | à tourner |

Les séquences 13 à 15 peuvent quand même être générées dans Flow pour les réseaux sociaux ou comme référence de mise en scène, mais sur le site elles doivent réagir au visiteur (survol, clic, couleurs choisies) : elles sont en 3D.
Les séquences 17 à 20 doivent être **tournées pour de vrai** : leur rôle est de prouver « ça existe, c'est fait à la main à Colombes ». Un plan généré ici détruirait l'argument.
La 16 montre un produit que le client va acheter : c'est la vraie photo du tapis incrustée dans un intérieur, jamais un tapis réinventé par l'IA.

### 3.2 Règles de raccord

1. **La dernière image d'une séquence est l'image de départ de la suivante** (« frames to video » dans Flow). Les dernières images des plans validés sont dans [`flow/frames/`](flow/frames/).
2. Le prompt maître (ADN commun) est collé dans **chaque** prompt, sans modification.
3. Même format partout : 16:9, 1920 × 1080, 24 i/s, 8–10 s, **sans son**, **sans texte**.
4. Même vitesse de caméra en fin de plan N et en début de plan N+1. Si Flow démarre « à l'arrêt », le site masque 0,3 s de raccord par un fondu enchaîné, pas plus.
5. On garde l'ivoire chaud comme fond de tous les plans « rêve ». Pas de pièce réelle (fenêtres, sol béton) sauf décision contraire.

### 3.3 Observations sur V01 → V07

- **Ce qui marche** : l'ivoire, la texture de laine, la palette (corail, framboise, orange, jaune, marine, cobalt), et la révélation « c'était une bobine » de V04. Les quatre raccords passent avec un fondu de 0,35 % de scroll.
- **Doublon** : deux des fichiers reçus sont identiques (`Coral_red_wool_thread_floating…`) ; un seul est utilisé.
- **V05 → V07** : le trio fonctionne. V07 est un excellent raccord : les fibres corail s'écartent et laissent un ivoire vide, exactement ce qu'il faut pour faire apparaître la toile.
- **Rupture 1 — le type de bobine (21 %)** : V04 finit sur des **bobines en bois à joues** multicolores (type couture) ; V05 et V06 utilisent des **tubes à mandrin carton, sans joues, d'une seule couleur**. Au fondu, la bobine change de nature. Correction la moins chère : **régénérer la fin de V04** (sortie du tunnel) en demandant « a single coral-red wool tube spool with a cardboard core, no flanges », pour qu'elle révèle la bobine corail de la première image de V05.
- **Rupture 2 — le décor (25 %)** : V05 se passe dans le vide ivoire ; V06 commence dans une **vraie salle d'exposition** (fenêtres, piliers, sol béton). Deux options : (a) régénérer le début de V06 à partir de la dernière image de V05 (la sphère se forme dans le vide ivoire) ; (b) assumer la salle comme un « avant-goût » de la galerie impossible. Recommandé : (a), pour garder l'espace abstrait jusqu'à la toile.
- **Construction d'Arcade (V10)** : Flow ne reproduira pas fidèlement le vrai motif d'Arcade. Deux options : (a) Flow génère le geste et les lignes, et la forme exacte d'Arcade est révélée en 3D/photo par-dessus ; (b) tout en 3D. Recommandé : (a).

### 3.4 Ajout à tous les prompts à partir de V08

À coller à la fin de chaque prompt, avec la dernière image du plan précédent (dossier `flow/frames/`) comme image de départ :

```text
Start exactly from the provided start image.
Keep the same warm ivory void, the same soft diffused light and the same camera lens.
No room, no walls, no windows, no furniture, no floor details in view.
Silent. No text.
```

**V08 / V09 — le pistolet** : les images de départ proposées (fil qui touche la toile, pistolet devant un cadre en bois) sont bonnes pour le geste, mais le pistolet est **dans un atelier meublé** (étagères, fenêtres, cônes). Pour rester dans le rêve jusqu'à Arcade, garder le cadre et le pistolet **seuls dans le vide ivoire**. Et fournir à Flow **une photo du vrai pistolet de Marina** : un pistolet inventé serait repéré immédiatement par les participant·es des ateliers.

### 3.5 Encodage pour le site

Chaque plan est livré en deux fichiers (`prototype/media/`), avec des images clés très rapprochées pour pouvoir sauter à n'importe quelle image au scroll :

```bash
# Safari : H.264, toutes images clés
ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libx264 -preset slow -crf 28 -g 1 -pix_fmt yuv420p -movflags +faststart out.mp4
# Chrome / Firefox : VP9, une image clé toutes les 6 images
ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libvpx-vp9 -crf 38 -b:v 0 -g 6 -row-mt 1 out.webm
```

Poids actuel : 1,4 à 4,5 Mo par plan en WebM (≈ 19 Mo pour les 7 plans), 3 à 5,9 Mo en MP4. C’est acceptable pour un prototype, trop lourd pour la production : chaque plan sera chargé juste avant d’être vu, et la version mobile sera en 720 px. Pour la production : version mobile portrait recadrée (720 px de large), et première image de V01 en affiche.

---

## 4. Parcours après l'accueil

```
                           ACCUEIL (film)
                                │
   ┌──────────┬─────────────┬───┴────────┬─────────────┬──────────┐
   ▼          ▼             ▼            ▼             ▼          ▼
/oeuvres  /collections  /sur-mesure   /ateliers    /studio    /contact
pièces    modèles       devis          réservation
uniques   personnal.
   │          │
/oeuvres/  /creer/[modèle]  ← même scène 3D que la scène 07, en plein écran
[œuvre]       │
   └────┬─────┘
        ▼
  PANIER (tiroir)  →  Checkout Shopify
```

Les pages intérieures sont sobres et rapides. L'immersion vit dans l'accueil, dans les transitions et dans le configurateur.

---

## 5. Architecture technique

| Couche | Choix |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Scroll | Lenis (inertie) + GSAP ScrollTrigger (timelines) |
| 3D | Three.js via React Three Fiber — **un seul canvas** pour tout l'accueil |
| Shaders | GLSL : fibre, laine/relief, dissolution, explosion |
| Modèles | glTF compressés (Draco/Meshopt), si besoin pour les scènes 05–07 |
| Vidéo | Plans Flow + vraies vidéos, lus au scroll : WebM VP9 + MP4 H.264, images clés rapprochées (voir § 3.5) |
| Commerce | Shopify headless (Storefront API) : produits, variantes, stock, panier, paiement |
| Hébergement | Vercel |

**Principe clé : une seule timeline maîtresse.** Tout l'état visuel (caméra, objets, textes) est une fonction pure de la progression du scroll. On peut aller en avant, en arrière, recharger au milieu : l'image est toujours la bonne. Le prototype applique déjà ce principe.

**Budget** : JS initial < 150 Ko ; vidéos de l'intro chargées une par une, en avance d'un plan (≈ 3 Mo chacune desktop, 1,5 Mo mobile) ; 3D scènes 05–07 < 3 Mo ; 60 fps desktop, 30 fps minimum mobile.

---

## 6. Assets à réunir

| # | Asset | Scène | Priorité |
|---|---|---|---|
| 1 | **Fichiers vectoriels d'Arcade par zone** (chaque forme séparée, nommée) | 04, 05, 07 | ★★★ |
| 2 | Références exactes des laines de chaque œuvre | toutes | ★★★ |
| 3 | Photos HD de face de chaque œuvre (lumière diffuse + rasante) | 05, 06, pages | ★★★ |
| 4 | Journée de tournage macro : main, tufting, colle, découpe, rasage, fibres, tapis retourné | 08 | ★★★ |
| 5 | Plans atelier : pistolet posé, seconde main qui le saisit | 09 | ★★ |
| 6 | Vidéos Flow V05 → V10 et V12 (voir § 3) | 03, 04 | ★★★ |
| 7 | Photos du vrai tufting gun (référence pour Flow) | 04 | ★★ |
| 8 | Nuancier des laines disponibles pour la personnalisation | 07 | ★★ |
| 9 | Formats et prix de chaque modèle | 05, 07 | ★★★ |
| 10 | Textes : œuvres, studio, formules d'ateliers | 05, 06, 09 | ★★★ |
| 11 | Sons (optionnels) : montée, souffle, TAC du pistolet, atelier | 03, 04, 08 | ★ |

Les assets 4 et 5 peuvent être tournés le même jour, à l'atelier de Colombes.

---

## 7. Décisions à prendre

1. **Arcade** est-il bien l'œuvre signature, et fait-il bien 51 × 51 cm dans sa version originale ?
2. **Personnalisation** : quelles zones d'Arcade sont modifiables (proposition : 3 à 5), quelles laines, quels prix par format ?
3. **Langue** de la phrase de l'explosion : « LA COULEUR N'A PAS DE LIMITES. » (FR, proposée par défaut) ou « COLOUR HAS NO LIMITS. » ?
4. **Ateliers** : formules exactes, prix, capacité, outil de réservation.
5. **Shopify** : compte existant ? produits déjà saisis ?
6. **Tournage** : qui filme, quand ?
7. **Bobines** : on garde les bobines à joues de V04 pour toute l'intro, ou on régénère V04 avec des cônes/tubes comme dans les références ?

---

## 8. Plan de réalisation

| Phase | Contenu | Livrable |
|---|---|---|
| **1. Prototype gris** ✅ | Les 10 scènes en formes simples, la vraie longueur, la timeline maîtresse, les interactions souris, la personnalisation factice. | `prototype/` — valider le **rythme**. |
| **2. Intro vidéo** 🟡 en cours | Plans Flow V01 → V10 intégrés au scroll (V01 → V07 faits) ; Arcade vectorisé qui se casse. | Validation DA + test perf mobile. |
| **3. Tournage + assets** | Journée à Colombes, photos des œuvres, modèles 3D. | Assets finaux. |
| **4. Commerce** | Next.js + Shopify headless : galerie, fiches, panier, configurateur. | Achat de bout en bout. |
| **5. Finitions** | Scènes 08–10 avec vraies vidéos, mobile, reduced-motion, SEO, perf. | Mise en ligne. |
