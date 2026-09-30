# MARINA LEHACAUT STUDIO — Storyboard du film interactif

> Cahier des charges créatif et technique de l'accueil.
> **v0.2** — l'accueil est pensé comme un film interactif, et plus comme une suite de sections. Remplace la v0.1.
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
   VIDE  FIBRE  EXPLOSION  GESTE  ARCADE  GALERIE  CASSER  RÉEL  ATELIER  STUDIO
   0     8      18         30     43      55       67      77    86       94   100 %
```

Deux « WOW » seulement : l'explosion (02) et l'œuvre qui se casse (06). Tout le reste est au service de ces deux moments.

### 0.3 Le désir avant la vente

Pendant **43 % du parcours, rien n'est à vendre**. Le premier élément commercial (« ARCADE Nº01 — Découvrir la pièce ») n'apparaît qu'à 50 %. C'est voulu : le produit est la récompense du voyage.

### 0.4 Les quatre types d'assets

| Type | Rôle | Scènes |
|---|---|---|
| **WebGL / 3D** (Three.js) | Filament, fibres, bobines, explosion, toile, œuvres flottantes, galerie | 01 → 06 |
| **GSAP** | Caméra virtuelle, textes, transitions, tout ce qui suit le scroll | toutes |
| **Vraies vidéos** | Mains, tufting, colle, découpe, rasage, atelier | 07, 08 |
| **Images HD** | Œuvres finales, fiches produit, e-commerce | 04 → 06, pages produit |

Pas de vidéo générée par IA. La 3D crée le rêve, la vidéo réelle crée la confiance.

### 0.5 Garde-fous (non négociables)

| Sujet | Règle |
|---|---|
| **Visiteur pressé** | Pas de menu au début (c'est voulu), mais un lien minuscule **« Passer »** en bas à gauche + touche Échap. Un visiteur qui revient arrive directement à la scène 06, la galerie (mémorisé localement). |
| **Menu** | Invisible de 0 à 8 %. Le monogramme apparaît avec le titre (≈ 6 %), le menu complet et le panier à 43 %, au moment où le commerce commence. |
| **Le scroll ne bloque jamais** | La personnalisation (scène 06) est *jouable* pendant le scroll, mais n'est jamais obligatoire : continuer à scroller fait avancer le film. Le configurateur complet vit sur sa propre page. |
| **SEO** | Le titre, la présentation du studio et les liens vers les œuvres et ateliers existent dans le HTML dès le chargement. Les pages œuvres/ateliers sont des pages classiques rendues côté serveur. |
| **Accessibilité** | `prefers-reduced-motion` → version « éditoriale » : mêmes textes et images, fondus simples, pas de caméra. |
| **Son** | Coupé par défaut, icône en bas à droite. |
| **Mobile** | Les interactions souris deviennent : inclinaison du téléphone (si autorisée) ou toucher-glisser. La 3D baisse en densité (moins de fibres, pas de post-process) ; sous un certain niveau de GPU, les scènes 01–02 passent en vidéo pré-rendue. |
| **Performance** | Premier affichage < 2,5 s en 4G. La scène 00 est légère ; le reste se charge pendant que le visiteur regarde le filament. |

---

## 1. Timeline

Longueur totale de l'accueil : **≈ 1 600 vh** (16 hauteurs d'écran). Les pourcentages sont la progression globale du scroll.

| # | Scène | Plage | vh | Maillon | Technique | Commerce |
|---|---|---|---|---|---|---|
| 01 | Le vide | 0 → 8 % | 130 | Fibre | WebGL (1 filament) | — |
| 02 | Entrer dans la fibre | 8 → 18 % | 160 | Fil, couleur | WebGL (fibres) | — |
| 03 | L'explosion | 18 → 30 % | 190 | Couleur | WebGL (bobines, fils) | — |
| 04 | Le geste | 30 → 43 % | 210 | Geste | WebGL + objet 3D pistolet | — |
| 05 | Arcade naît | 43 → 55 % | 190 | Forme, œuvre | WebGL + image HD | **1re apparition** |
| 06 | La galerie impossible | 55 → 67 % | 190 | Œuvre | WebGL (architecture) | Œuvres cliquables |
| 07 | Casser l'œuvre | 67 → 77 % | 160 | Personnalisation | WebGL + UI | **Configurateur** |
| 08 | Du digital au réel | 77 → 86 % | 150 | Main | Vraie vidéo | Réassurance |
| 09 | L'atelier | 86 → 94 % | 130 | Transmission | Vidéo + UI | **Ateliers** |
| 10 | Le studio | 94 → 100 % | 100 | — | HTML | Navigation normale |

---

## 2. Scène par scène

Pour chaque scène, `p` est la progression locale de 0 à 1.

### 01 — LE VIDE (0 → 8 %)

```
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│                                              │
│                      ·~                      │  ← un filament minuscule
│                                              │
│                                              │
│                                              │
│ passer                                   🔇  │
└──────────────────────────────────────────────┘
fond #0B0A09 — noir chaud
```

| p | Caméra | Image | Texte |
|---|---|---|---|
| avant scroll | Fixe, très loin | Un filament de laine de 2–3 cm à l'écran, légèrement ondulant. La souris le fait onduler un peu plus (réaction lente, comme dans l'eau). | — |
| 0,0 → 0,6 | Travelling avant lent | Le filament grandit, remplit l'écran. On découvre la torsion, le duvet, les fibres qui dépassent. Lumière rasante. | — |
| 0,6 → 0,9 | Continue | Le filament occupe tout l'écran, en diagonale. | **MARINA LEHACAUT / STUDIO** apparaît, **très petit** (11 px, lettres espacées), centré. |
| 0,9 → 1 | Accélère légèrement | On fonce vers la surface du filament. | Le titre s'efface. |

**Interaction** : la souris déplace le filament de quelques pixels (ressort amorti). Sur mobile : inclinaison.
**Technique** : courbe 3D + shader de fibre (torsion + duvet en particules). Pas de vidéo ici : le filament doit réagir à la souris.

### 02 — ENTRER DANS LA FIBRE (8 → 18 %)

| p | Caméra | Image |
|---|---|---|
| 0,0 → 0,3 | Traverse la surface | On passe *entre* les fibres : des dizaines de filaments en tube autour de la caméra, crème/écru. |
| 0,3 → 0,7 | Travelling continu, rotation lente sur l'axe | Les fibres deviennent abstraites (plus lisses, plus lumineuses) et prennent couleur une à une : **rouge → orange → bleu → rose → jaune** (couleurs réelles des laines d'Arcade, Cubix, Vortex). La couleur envahit l'espace. |
| 0,7 → 0,85 | **Recul brutal** (0,15 de p pour une grande distance, easing sec) | On ressort de la matière… |
| 0,85 → 1 | Stabilisé | … et on découvre que tout ce fil sort d'**une bobine**, qui flotte seule dans le noir. |

**Transition vers 03** : la bobine découverte *est* la première bobine de l'explosion. Aucune coupe.

### 03 — L'EXPLOSION (18 → 30 %) — WOW 1

| p | Image | Texte / son |
|---|---|---|
| 0,00 | 1 bobine, rotation lente. | — |
| 0,15 | 3 bobines. | — |
| 0,30 | 10 bobines, en apesanteur, orientations variées. Le scroll les fait tourner, la souris décale doucement tout le nuage. | — |
| 0,45 | 30 bobines. La rotation accélère. | (son) montée textile |
| 0,58 | **Figé, 0,2 s**. | Silence |
| 0,60 | 💥 Les bobines sont projetées hors du centre. Des centaines de fils se déroulent et traversent l'écran. | (son) souffle |
| 0,65 → 0,80 | **La caméra traverse l'explosion** (avance au milieu des fils qui passent devant elle). | **LA COULEUR N'A PAS DE LIMITES.** — une fraction de seconde (≈ 0,08 de p), plein écran. |
| 0,80 → 1 | Les fils ralentissent, s'éloignent, disparaissent. Fond qui s'éclaircit. | **Silence visuel.** |

**Technique** : `InstancedMesh` pour les bobines (modèle ≈ 3 000 triangles, normal map laine), fils en courbes animées sur GPU (400 desktop / 120 mobile). Bloom léger uniquement autour de 0,6.

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

**Technique** : pistolet = **modèle 3D** (glTF, ≈ 15 000 triangles) puisqu'il doit tourner dans l'espace. Lignes = bandes de laine générées (géométrie + normal map). Les lignes tracées ici *sont* les premières lignes du motif d'Arcade.

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

## 3. Parcours après l'accueil

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

## 4. Architecture technique

| Couche | Choix |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Scroll | Lenis (inertie) + GSAP ScrollTrigger (timelines) |
| 3D | Three.js via React Three Fiber — **un seul canvas** pour tout l'accueil |
| Shaders | GLSL : fibre, laine/relief, dissolution, explosion |
| Modèles | glTF compressés (Draco/Meshopt) : bobine, pistolet |
| Vidéo | MP4 H.264 (scrub, images clés rapprochées) + WebM |
| Commerce | Shopify headless (Storefront API) : produits, variantes, stock, panier, paiement |
| Hébergement | Vercel |

**Principe clé : une seule timeline maîtresse.** Tout l'état visuel (caméra, objets, textes) est une fonction pure de la progression du scroll. On peut aller en avant, en arrière, recharger au milieu : l'image est toujours la bonne. Le prototype applique déjà ce principe.

**Budget** : JS initial < 150 Ko ; 3D scènes 01–07 < 3 Mo au total, chargées progressivement ; vidéo 08 < 6 Mo desktop / 3 Mo mobile ; 60 fps desktop, 30 fps minimum mobile.

---

## 5. Assets à réunir

| # | Asset | Scène | Priorité |
|---|---|---|---|
| 1 | **Fichiers vectoriels d'Arcade par zone** (chaque forme séparée, nommée) | 04, 05, 07 | ★★★ |
| 2 | Références exactes des laines de chaque œuvre | toutes | ★★★ |
| 3 | Photos HD de face de chaque œuvre (lumière diffuse + rasante) | 05, 06, pages | ★★★ |
| 4 | Journée de tournage macro : main, tufting, colle, découpe, rasage, fibres, tapis retourné | 08 | ★★★ |
| 5 | Plans atelier : pistolet posé, seconde main qui le saisit | 09 | ★★ |
| 6 | Modèle 3D du tufting gun (modélisation à partir de photos du vrai) | 04 | ★★ |
| 7 | Modèle 3D d'une bobine + photo de la texture de laine | 01–03 | ★★ |
| 8 | Nuancier des laines disponibles pour la personnalisation | 07 | ★★ |
| 9 | Formats et prix de chaque modèle | 05, 07 | ★★★ |
| 10 | Textes : œuvres, studio, formules d'ateliers | 05, 06, 09 | ★★★ |
| 11 | Sons (optionnels) : montée, souffle, TAC du pistolet, atelier | 03, 04, 08 | ★ |

Les assets 4 et 5 peuvent être tournés le même jour, à l'atelier de Colombes.

---

## 6. Décisions à prendre

1. **Arcade** est-il bien l'œuvre signature, et fait-il bien 51 × 51 cm dans sa version originale ?
2. **Personnalisation** : quelles zones d'Arcade sont modifiables (proposition : 3 à 5), quelles laines, quels prix par format ?
3. **Langue** de la phrase de l'explosion : « LA COULEUR N'A PAS DE LIMITES. » (FR, proposée par défaut) ou « COLOUR HAS NO LIMITS. » ?
4. **Ateliers** : formules exactes, prix, capacité, outil de réservation.
5. **Shopify** : compte existant ? produits déjà saisis ?
6. **Tournage** : qui filme, quand ?

---

## 7. Plan de réalisation

| Phase | Contenu | Livrable |
|---|---|---|
| **1. Prototype gris** ✅ démarré | Les 10 scènes en formes simples, la vraie longueur, la timeline maîtresse, les interactions souris, la personnalisation factice. | `prototype/` — valider le **rythme** avant toute production. |
| **2. Scènes signatures** | Filament + fibres + explosion en vraie 3D ; Arcade vectorisé qui se casse. | Validation DA + test perf mobile. |
| **3. Tournage + assets** | Journée à Colombes, photos des œuvres, modèles 3D. | Assets finaux. |
| **4. Commerce** | Next.js + Shopify headless : galerie, fiches, panier, configurateur. | Achat de bout en bout. |
| **5. Finitions** | Scènes 08–10 avec vraies vidéos, mobile, reduced-motion, SEO, perf. | Mise en ligne. |
