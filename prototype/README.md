# Prototype gris — film interactif

Prototype de rythme de l'accueil, fidèle au [storyboard v0.2](../STORYBOARD.md). Les 10 scènes existent avec leur vraie longueur de scroll (1 600 vh), leur caméra et leurs interactions, mais avec des formes simples à la place des vrais assets.

**But : valider le rythme et l'enchaînement avant de payer un tournage ou de la 3D finale.**

## Lancer

Les modules ES ne fonctionnent pas en `file://`, il faut un petit serveur :

```bash
cd prototype
npx http-server -p 8765   # ou : python3 -m http.server 8765
```

Puis ouvrir http://localhost:8765.

## Outils de revue

| Action | Effet |
|---|---|
| Barre en bas (HUD) | Scène en cours, % global, progression locale `p`. Cliquer un numéro saute à la scène. |
| `H` | Masque / affiche le HUD. |
| `?p=50` dans l'URL | Ouvre directement à 50 % du parcours. |
| `?intro` | Force l'intro même si on a déjà vu le film (sinon saut direct à la galerie). |
| `Échap` / « passer » | Saute à la galerie (55 %). |

## Ce qui est provisoire

| Élément du prototype | Sera remplacé par |
|---|---|
| Filament, fibres, bobines en géométrie simple + texture laine procédurale | Modèles et shaders de fibre (phase 2) |
| Pistolet en boîtes | Modèle glTF modélisé d'après le vrai pistolet |
| Motif « Arcade » inventé (fond, arche, arche intérieure, soleil, socle) | Vectorisation réelle d'Arcade, zone par zone |
| Œuvres Cubix, Vortex, Strates, Delta : formes évoquant | Photos HD + reliefs des vraies œuvres |
| Couleurs | Références exactes des laines |
| Prix, formats, dates d'atelier | Données Shopify |
| Scènes 08–09 : cadres vides avec légendes | Vraies vidéos macro tournées à Colombes |

Pas encore traité : son, version `prefers-reduced-motion`, fallback vidéo pour GPU faible.

## Principe technique à garder

Tout l'état visuel est une **fonction pure de la progression du scroll** (`gp`, 0 → 100) : on peut avancer, reculer, recharger au milieu, l'image est toujours juste. Le seul état « libre » est le mode interactif du configurateur (scène 07), qui met le scroll en pause jusqu'à « Continuer le voyage ».

Librairies embarquées dans `vendor/` : three.js r169, Lenis 1.1.22.
