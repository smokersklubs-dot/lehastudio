// Marina Lehacaut Studio — Film interactif complet (0 → 100 %).
//
// Principe : UNE timeline maîtresse. Tout l'état visuel (caméra, objets, vidéos, textes) est une
// fonction pure de la progression globale du scroll `gp` (0 → 100). On peut avancer,
// reculer ou recharger au milieu : l'image est toujours la bonne.
//
// 0 → 56 %  : vidéos Flow V01 → V13 lues au rythme du scroll (+ fibres interactives en Scène 04).
// 55.6 → 77 % : WebGL / Three.js temps réel (Arcade V13 sculpté en laine bouclée,
//               Galerie architecturale ivoire, Casser l'œuvre, Configurateur & Vue Salon).
// 77 → 94.5 % : Vidéos & séquences macro d'atelier à Colombes (Scènes 08 & 09).
// 94.5 → 100 % : Le Studio, fiches œuvres, réservation d'ateliers & Tiroir Panier.

import * as THREE from './vendor/three.module.min.js';
import Lenis from './vendor/lenis.mjs';
import {
  WOOL,
  WOOL_LABELS,
  normalizePlanarUVs,
  createMuseumEnvMap,
  createWoolTextures,
  createPlasterTexture,
  createArcadeZones,
  createArcadePhotoMesh,
  renderArcadeSVG,
  buildIvoryGallery,
  createFloatingFibers,
} from './rugs3d.js?v=9';
import { createClassicalSoundtrack } from './classicalAudio.js?v=9';

// ---------------------------------------------------------------- timeline
const SCENES = [
  { id: '01', name: 'Le fil', a: 0, b: 5 },
  { id: '02', name: 'Entrer dans la matière', a: 5, b: 15 },
  { id: '03', name: "L'explosion", a: 15, b: 30 },
  { id: '04', name: 'Le geste', a: 30, b: 43 },
  { id: '05', name: 'Arcade naît', a: 43, b: 55 },
  { id: '06', name: 'La galerie ivoire', a: 55, b: 67 },
  { id: '07', name: "Casser l'œuvre", a: 67, b: 77 },
  { id: '08', name: 'Du digital au réel', a: 77, b: 86 },
  { id: '09', name: "L'atelier", a: 86, b: 94.5 },
  { id: '10', name: 'Le studio', a: 94.5, b: 100 },
];

const ECRU = new THREE.Color('#EEE9E1');
const GALERIE_BG = new THREE.Color('#EFE8DC');

// ---------------------------------------------------------------- utilitaires
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (x, a, b) => clamp((x - a) / (b - a));
const smooth = (a, b, x) => { const t = range(x, a, b); return t * t * (3 - 2 * t); };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const local = (gp, i) => range(gp, SCENES[i].a, SCENES[i].b);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const rr = (a, b) => a + rand() * (b - a);

// ---------------------------------------------------------------- rendu 3D
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.environment = createMuseumEnvMap(renderer, scene);
scene.fog = new THREE.Fog(ECRU, 22, 135);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 260);

// Éclairage architectural chaud (lumière de baie vitrée V13 + lumière rasante pour sculpter la laine)
scene.add(new THREE.HemisphereLight(0xfffcf5, 0xc8bca8, 1.25));
const key = new THREE.DirectionalLight(0xfffdf6, 1.45);
key.position.set(-16, 18, -310);
key.target.position.set(0, -2, -328);
key.castShadow = true;
key.shadow.mapSize.width = 1024;
key.shadow.mapSize.height = 1024;
key.shadow.camera.near = 2;
key.shadow.camera.far = 95;
key.shadow.camera.left = -22;
key.shadow.camera.right = 22;
key.shadow.camera.top = 18;
key.shadow.camera.bottom = -18;
key.shadow.bias = -0.0008;
scene.add(key);
scene.add(key.target);

const rake = new THREE.DirectionalLight(0xffeed4, 0.95); // lumière rasante latérale : révèle les boucles
rake.position.set(-9, 2.5, 2.5);
scene.add(rake);
const fill = new THREE.DirectionalLight(0xf6f0e6, 0.55);
fill.position.set(6, -3, 5);
scene.add(fill);

// Vraies textures PBR Poly Haven (boucles de laine `curly_teddy_natural` + stuc minéral)
const { diffTex: WOOL_DIFF, bumpTex: WOOL_BUMP, roughTex: WOOL_ROUGH } = createWoolTextures();
const PLASTER_TEX = createPlasterTexture();

const woolMat = (color, repeat = 3.5) => {
  return new THREE.MeshPhysicalMaterial({
    color,
    map: WOOL_DIFF,
    roughness: 0.86,
    roughnessMap: WOOL_ROUGH,
    metalness: 0.0,
    normalMap: WOOL_BUMP,
    normalScale: new THREE.Vector2(1.35, 1.35),
    sheen: 0.68,
    sheenRoughness: 0.70,
    sheenColor: new THREE.Color('#FFF7EA'),
  });
};

// ---------------------------------------------------------------- souris & tactile
const mouse = { x: 0, y: 0, sx: 0, sy: 0, px: innerWidth / 2, py: innerHeight / 2, has: false };
addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  mouse.px = e.clientX; mouse.py = e.clientY; mouse.has = true;
});
addEventListener('touchmove', (e) => {
  if (!e.touches.length) return;
  const t = e.touches[0];
  mouse.x = (t.clientX / innerWidth) * 2 - 1;
  mouse.y = -(t.clientY / innerHeight) * 2 + 1;
  mouse.px = t.clientX; mouse.py = t.clientY; mouse.has = true;
}, { passive: true });

const C = V(0, 0, -300); // centre de l'œuvre dans l'espace 3D
const raycaster = new THREE.Raycaster();

// =====================================================================
// 05 → 07 — ARCADE Nº01 (zones géométriques fidèles à V13)
// =====================================================================
const ZONES = createArcadeZones();
const ARC_SIZE = 2.15;
const arcade = new THREE.Group();
arcade.position.copy(C);
scene.add(arcade);

// Toile de fond / semelle textile au dos d'Arcade
const backingGeo = new THREE.BoxGeometry(2.0 * ARC_SIZE, 2.36 * ARC_SIZE, 0.045);
const backingMat = new THREE.MeshStandardMaterial({ color: '#18253B', roughness: 0.95 });
const backingMesh = new THREE.Mesh(backingGeo, backingMat);
backingMesh.position.z = -0.025;
arcade.add(backingMesh);

// Ombre portée murale douce (utilisée notamment en mode "Voir dans un salon")
const shadowCanvas = document.createElement('canvas');
shadowCanvas.width = shadowCanvas.height = 128;
const sg = shadowCanvas.getContext('2d');
const sGrad = sg.createRadialGradient(64, 64, 18, 64, 64, 62);
sGrad.addColorStop(0, 'rgba(20, 14, 8, 0.42)');
sGrad.addColorStop(0.65, 'rgba(20, 14, 8, 0.16)');
sGrad.addColorStop(1, 'rgba(20, 14, 8, 0.0)');
sg.fillStyle = sGrad;
sg.fillRect(0, 0, 128, 128);
const wallShadowMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2.55 * ARC_SIZE, 2.9 * ARC_SIZE),
  new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, opacity: 0.55, depthWrite: false })
);
wallShadowMesh.position.set(0.14, -0.16, -0.12);
arcade.add(wallShadowMesh);

const zoneMeshes = [];
ZONES.forEach((z, i) => {
  const holder = new THREE.Group();
  holder.scale.set(ARC_SIZE, ARC_SIZE, ARC_SIZE);
  const mat = woolMat(z.color, 3.0);

  const meshes = z.shapes.map((sh) => {
    const geo = new THREE.ExtrudeGeometry(sh, {
      depth: z.depth || 0.12,
      bevelEnabled: true,
      bevelThickness: 0.024,
      bevelSize: 0.016,
      bevelSegments: 3,
      curveSegments: 48,
    });
    normalizePlanarUVs(geo, -1.0, 1.0, -1.18, 1.18);
    const m = new THREE.Mesh(geo, mat);
    m.userData = { zone: i };
    m.castShadow = true;
    m.receiveShadow = true;
    holder.add(m);
    zoneMeshes.push(m);
    return m;
  });

  arcade.add(holder);
  z.holder = holder;
  z.meshes = meshes;
  z.mat = mat;
  z.user = null;
  z.pulse = 0;
});

// Plaque photographique V13 haute définition (affichée tant que l'œuvre est assemblée et non recolorée)
const arcadePhotoMesh = createArcadePhotoMesh(2.0 * ARC_SIZE, 2.36 * ARC_SIZE);
arcade.add(arcadePhotoMesh);

arcade.userData.work = {
  id: 'arcade',
  name: 'ARCADE Nº01',
  info: 'Œuvre textile signature · dès 51 × 51 cm · Laine de Nouvelle-Zélande',
  price: '1 400 €',
  priceNum: 1400,
  dims: '51 × 51 cm · 70 × 70 cm · 90 × 90 cm',
  url: '#oeuvres/arcade',
  desc: 'Pièce maîtresse du studio. Ses arches imbriquées mêlent bouclé serré et velours ciselé aux ciseaux, créant des sillons d’ombre qui dialoguent avec la lumière du jour.',
  palette: [WOOL.corail, WOOL.marine, WOOL.ocre, WOOL.rose, WOOL.ecru],
};

// =====================================================================
// 06 — LA GALERIE ARCHITECTURALE V13 (BLENDER 5.2 CYCLES + PBR)
// =====================================================================
const galerie = new THREE.Group();
scene.add(galerie);
const G = (x, y, z) => V(C.x + x, C.y + y, C.z + z);
const S = G(0, 0.20, -40.0); // Sanctuaire au fond de la nef où trône ARCADE Nº01 (fin Scène 06 -> Scène 07)

const { works: WORKS, arcadeEntrance } = buildIvoryGallery({
  scene,
  galerie,
  G,
  woolMat,
  plasterTex: PLASTER_TEX,
  arcade,
  ARC_SIZE,
});

const fibers = createFloatingFibers(scene, C);

// =====================================================================
// 04 — FIBRES DE LAINE QUI SUIVENT LE CURSEUR (STORYBOARD § 04)
// =====================================================================
const fxCanvas = document.getElementById('fx-fibers');
const fxCtx = fxCanvas.getContext('2d');
const cursorStrands = Array.from({ length: 18 }, (_, i) => ({
  x: innerWidth / 2,
  y: innerHeight / 2,
  vx: 0,
  vy: 0,
  angle: (i / 18) * Math.PI * 2,
  len: 14 + (i % 4) * 5,
  curve: (i % 2 === 0 ? 1 : -1) * (3 + (i % 3) * 2),
  color: [WOOL.corail, WOOL.ocre, WOOL.rose, WOOL.ecru, WOOL.marine][i % 5],
  lag: 0.04 + (i % 6) * 0.015,
  radius: 16 + (i % 5) * 11,
}));

function updateCursorFibers(gp, time) {
  const active = (gp >= 30 && gp < 43.2) || (gp >= 67 && gp < 77 && cfg.interactive);
  fxCanvas.style.visibility = active ? 'visible' : 'hidden';
  if (!active) return;

  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  const dpr = Math.min(devicePixelRatio, 2);
  fxCtx.save();
  fxCtx.scale(dpr, dpr);

  // Point d'attraction vers la ligne en cours de tufting au centre de la toile
  const settleMix = gp >= 35 && gp < 42.5 ? 0.18 : 0.0;
  const targetBaseX = lerp(mouse.px, innerWidth * 0.5, settleMix);
  const targetBaseY = lerp(mouse.py, innerHeight * 0.5, settleMix);

  cursorStrands.forEach((st, i) => {
    const orbitA = time * (0.8 + (i % 3) * 0.25) + i * 1.1;
    const tx = targetBaseX + Math.cos(orbitA) * st.radius;
    const ty = targetBaseY + Math.sin(orbitA) * st.radius;
    st.vx = (st.vx + (tx - st.x) * st.lag) * 0.82;
    st.vy = (st.vy + (ty - st.y) * st.lag) * 0.82;
    st.x += st.vx;
    st.y += st.vy;
    st.angle += 0.015 + (st.vx * 0.004);

    fxCtx.save();
    fxCtx.translate(st.x, st.y);
    fxCtx.rotate(st.angle);
    fxCtx.strokeStyle = st.color;
    fxCtx.lineWidth = 2.2;
    fxCtx.lineCap = 'round';
    fxCtx.globalAlpha = 0.78;
    fxCtx.beginPath();
    fxCtx.moveTo(-st.len * 0.5, 0);
    fxCtx.quadraticCurveTo(0, st.curve, st.len * 0.5, 0);
    fxCtx.stroke();
    fxCtx.restore();
  });

  fxCtx.restore();
}

// Trajet caméra Steadicam 100 % fluide et cohérent vers l'avant (Z : +10.2 -> -29.2)
// Zéro retour arrière, zéro plongée au plafond, zéro obstacle dans la nef centrale
const galPos = new THREE.CatmullRomCurve3([
  G(0.0,   0.10,  10.2), // 0.00 : Raccord exact avec la fin de V13 face à Arcade d'entrée (Z = 0)
  G(0.55,  0.18,   2.2), // 0.16 : Avance douce le long du parquet Point de Hongrie
  G(0.65,  0.20,  -3.8), // 0.33 : Cadre CUBIX Nº04 (baie gauche 1, Z = -9.5)
  G(-0.60, 0.20, -11.2), // 0.50 : Cadre VORTEX Nº02 (baie droite 2, Z = -17.5)
  G(0.60,  0.22, -19.0), // 0.67 : Cadre STRATES Nº01 (baie gauche 3, Z = -25.5)
  G(-0.50, 0.22, -25.2), // 0.84 : Cadre DELTA Nº03 (baie droite 4, Z = -32.5)
  G(0.0,   0.20, -29.2), // 1.00 : Arrivée face au Sanctuaire d'ARCADE Nº01 (S.z + 10.8)
]);
const galLook = new THREE.CatmullRomCurve3([
  G(0.0,   0.10,   0.0), // 0.00 : Regarde Arcade d'entrée (Z = 0)
  G(-1.8,  0.18,  -5.8), // 0.16 : Regard doux vers la première baie
  G(-2.8,  0.20,  -9.8), // 0.33 : Admire CUBIX Nº04
  G(2.8,   0.20, -17.6), // 0.50 : Admire VORTEX Nº02
  G(-2.7,  0.26, -25.6), // 0.67 : Admire STRATES Nº01
  G(2.6,   0.20, -32.6), // 0.84 : Admire DELTA Nº03
  G(0.0,   0.20, -40.0), // 1.00 : Regarde ARCADE Nº01 au centre du Sanctuaire (S)
]);

// =====================================================================
// 07 — CONFIGURATEUR & MISE EN SITUATION SALON (état)
// =====================================================================
const FORMATS = [
  { label: '51 × 51 cm', scale: 1, price: 690 },
  { label: '70 × 70 cm', scale: 1.16, price: 1190 },
  { label: '90 × 90 cm', scale: 1.32, price: 1790 },
  { label: 'Sur mesure (devis)', scale: 1.12, price: null },
];
const cfg = { interactive: false, created: false, interior: false, zone: 1, format: 0, explode: 0, target: 1, scale: 1, pulse: 0 };

// =====================================================================
// DOM & INTERACTIONS
// =====================================================================
const $ = (s) => document.querySelector(s);
const timed = [...document.querySelectorAll('[data-in], [data-out]')].map((el) => ({
  el, a: parseFloat(el.dataset.in ?? '-1'), b: parseFloat(el.dataset.out ?? '101'),
  f: parseFloat(el.dataset.fade ?? '0.5'),
}));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!$('#work-modal').hidden) closeModal();
    else if (!$('#cart-drawer').hidden) closeCartDrawer();
    else skip();
  }
});

const toastEl = $('#toast');
let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('on'), 2600);
}

// Liens de navigation rapide par chapitre
document.addEventListener('click', (e) => {
  const jumpEl = e.target.closest('[data-jump]');
  if (jumpEl) {
    e.preventDefault();
    if (cfg.interactive) leaveConfig(false);
    goTo(parseFloat(jumpEl.dataset.jump), false);
    return;
  }
  const a = e.target.closest('[data-toast]');
  if (a) { e.preventDefault(); toast(a.dataset.toast); }
});
$('#nav-home').onclick = (e) => { e.preventDefault(); goTo(0, false); };

// =====================================================================
// AMBIANCE MUSICALE CLASSIQUE & SYMPHONIQUE AU SCROLL (Beethoven / Mozart)
// =====================================================================
const soundBtn = $('#sound');
const soundSys = createClassicalSoundtrack({
  onStatusChange(playing) {
    soundBtn.textContent = playing ? '♪ couper la musique' : '♪ activer la musique';
    soundBtn.classList.toggle('on', playing);
  },
});
soundBtn.textContent = '♪ activer la musique';
['pointerdown', 'mousedown', 'touchstart'].forEach((ev) => {
  soundBtn.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });
});
soundBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  soundSys.toggle();
  toast(soundSys.on ? 'Symphonie interactive activée' : 'Musique coupée');
});

// Démarre l'ambiance musicale classique dès le premier geste hors bouton #sound
['pointerdown', 'touchstart', 'keydown'].forEach((ev) => {
  addEventListener(ev, (e) => {
    if (e.target && e.target.closest && e.target.closest('#sound')) return;
    soundSys.autoStartOnGesture();
  }, { passive: true });
});

// =====================================================================
// TIROIR PANIER SHOPIFY & MODAL FICHE ŒUVRE / ATELIER
// =====================================================================
const cartItems = [];
const cartDrawerEl = $('#cart-drawer');
const cartItemsEl = $('#cart-items');
const cartTotalEl = $('#cart-total');

function parsePriceNumber(priceStr) {
  if (!priceStr) return 0;
  const digits = String(priceStr).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function addToCart(item) {
  cartItems.push(item);
  $('#cart-count').textContent = cartItems.length;
  renderCartDrawer();
  soundSys.playChime(587.33);
}

function renderCartDrawer() {
  if (!cartItems.length) {
    cartItemsEl.innerHTML = `<div class="cart-empty">Votre panier est vide.<br>Explorez la galerie ou créez votre pièce sur mesure.</div>`;
    cartTotalEl.textContent = '0 €';
    return;
  }
  let total = 0;
  cartItemsEl.innerHTML = '';
  cartItems.forEach((it, idx) => {
    total += it.priceNum || 0;
    const row = document.createElement('div');
    row.className = 'cart-item';
    const swHtml = (it.swatches || []).map((c) => `<i style="background:${c}"></i>`).join('');
    row.innerHTML = `
      <div>
        <div class="cart-item-title">${it.title}</div>
        <div class="cart-item-meta">${it.meta}</div>
        ${swHtml ? `<div class="cart-item-swatches">${swHtml}</div>` : ''}
      </div>
      <div class="cart-item-right">
        <div class="cart-item-price">${it.priceLabel}</div>
        <button class="cart-item-rm" data-rm="${idx}">Retirer</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });
  cartItemsEl.querySelectorAll('[data-rm]').forEach((btn) => {
    btn.onclick = () => {
      cartItems.splice(parseInt(btn.dataset.rm, 10), 1);
      $('#cart-count').textContent = cartItems.length;
      renderCartDrawer();
    };
  });
  cartTotalEl.textContent = total > 0 ? `${total.toLocaleString('fr-FR')} €` : 'Sur devis';
}

function openCartDrawer() {
  renderCartDrawer();
  cartDrawerEl.hidden = false;
}
function closeCartDrawer() {
  cartDrawerEl.hidden = true;
}
$('#cart-btn').onclick = openCartDrawer;
$('#cart-close').onclick = closeCartDrawer;
$('#cart-close-bg').onclick = closeCartDrawer;
$('#cart-checkout').onclick = () => {
  if (!cartItems.length) {
    toast('Ajoutez une œuvre ou un atelier avant de commander');
    return;
  }
  closeCartDrawer();
  toast(`Redirection vers le paiement sécurisé Shopify (${cartTotalEl.textContent})…`);
};

const modalEl = $('#work-modal');
let currentModalWork = null;

function openWorkModal(workData) {
  currentModalWork = workData;
  $('#modal-tag').textContent = workData.isWorkshop ? 'ATELIER TUFTING — COLOMBES' : 'ŒUVRE TEXTILE TISSÉE MAIN';
  $('#modal-title').textContent = workData.name;
  $('#modal-meta').textContent = workData.info || workData.dims || '';
  $('#modal-desc').textContent = workData.desc || '';
  $('#modal-price').textContent = workData.price || '';

  const palEl = $('#modal-palette');
  palEl.innerHTML = '';
  if (workData.palette && workData.palette.length) {
    palEl.hidden = false;
    workData.palette.forEach((hex) => {
      const s = document.createElement('span');
      s.style.background = hex;
      palEl.appendChild(s);
    });
  } else {
    palEl.hidden = true;
  }

  $('#modal-customize').hidden = !!workData.isWorkshop;
  $('#modal-add-cart').textContent = workData.isWorkshop ? 'Réserver ce créneau' : 'Ajouter au panier';
  modalEl.hidden = false;
}

function closeModal() {
  modalEl.hidden = true;
}
$('#modal-close').onclick = closeModal;
$('#modal-close-bg').onclick = closeModal;
$('#open-arcade-card').onclick = () => openWorkModal(arcade.userData.work);

$('#modal-customize').onclick = () => {
  closeModal();
  goTo(71.5, false);
  setTimeout(() => enterConfig(), 450);
};
$('#modal-add-cart').onclick = () => {
  if (!currentModalWork) return;
  addToCart({
    title: currentModalWork.name,
    meta: currentModalWork.info || currentModalWork.dims || 'Atelier Colombes',
    priceLabel: currentModalWork.price || 'Sur devis',
    priceNum: parsePriceNumber(currentModalWork.price),
    swatches: currentModalWork.palette || [],
  });
  closeModal();
  openCartDrawer();
};

// Cartes d'ateliers (Scène 09)
document.querySelectorAll('.offer-card').forEach((card) => {
  card.onclick = () => {
    openWorkModal({
      isWorkshop: true,
      name: `ATELIER ${card.querySelector('b').textContent.toUpperCase()}`,
      info: `${card.querySelector('span').textContent} · Atelier Marina Lehacaut, Colombes`,
      price: card.querySelector('em').textContent,
      desc: 'Prenez en main le tufting gun dans notre atelier lumineux de Colombes. Laines de Nouvelle-Zélande, toile tendue, collage et finitions aux ciseaux inclus. Vous repartez avec votre création.',
    });
  };
});
$('#btn-book-atelier').onclick = () => {
  openWorkModal({
    isWorkshop: true,
    name: 'ATELIER CRÉATION (4 H)',
    info: 'Format 50 × 50 cm · Samedi 14h ou Mercredi 18h30 · 4 places max',
    price: '145 €',
    desc: 'Initiez-vous au geste du tufting aux côtés de Marina à Colombes. Dessinez votre motif, choisissez vos cônes de laine, plantez vos boucles et sculptez le relief de votre pièce.',
  });
};

// =====================================================================
// TEXTES DU FILM — accroches animées, pilotées par le scroll
// =====================================================================
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
function splitWords(el) {
  const out = [];
  const add = (text, wrapTag) => {
    for (const word of text.split(/(\s+)/)) {
      if (!word) continue;
      if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(' ')); continue; }
      const w = document.createElement('span'); w.className = 'w';
      const inner = document.createElement('span'); inner.textContent = word;
      if (wrapTag) { const t = document.createElement(wrapTag); t.appendChild(inner); w.appendChild(t); out.push(inner); }
      else { w.appendChild(inner); out.push(inner); }
      el.appendChild(w);
    }
  };
  const nodes = [...el.childNodes];
  el.textContent = '';
  for (const n of nodes) {
    if (n.nodeType === 3) add(n.textContent);
    else if (n.nodeName === 'BR') el.appendChild(document.createElement('br'));
    else add(n.textContent, n.nodeName.toLowerCase());
  }
  return out;
}
function splitChars(el) {
  const out = [];
  const add = (text, parent) => {
    text.split(/(\s+)/).forEach((word) => {
      if (!word) return;
      if (/^\s+$/.test(word)) { parent.appendChild(document.createTextNode(' ')); return; }
      const wd = document.createElement('span'); wd.className = 'wd';
      for (const ch of word) {
        const c = document.createElement('span'); c.className = 'c'; c.textContent = ch;
        c.dataset.dx = rr(-1, 1).toFixed(3); c.dataset.dy = rr(-1, 1).toFixed(3); c.dataset.r = rr(-1, 1).toFixed(3);
        wd.appendChild(c); out.push(c);
      }
      parent.appendChild(wd);
    });
  };
  const nodes = [...el.childNodes];
  el.textContent = '';
  for (const n of nodes) {
    if (n.nodeType === 3) add(n.textContent, el);
    else if (n.nodeName === 'BR') el.appendChild(document.createElement('br'));
    else { const t = document.createElement(n.nodeName.toLowerCase()); el.appendChild(t); add(n.textContent, t); }
  }
  return out;
}
const BEATS = [...document.querySelectorAll('.beat')].map((el) => {
  const b = { el, a: +el.dataset.a, b: +el.dataset.b, fx: el.dataset.fx };
  if (b.fx === 'words') b.parts = splitWords(el);
  if (b.fx === 'letters' || b.fx === 'type') b.parts = splitChars(el);
  if (b.fx === 'counter') { b.num = el.querySelector('.num'); b.to = +el.dataset.to; }
  return b;
});
function updateBeats(gp) {
  for (const b of BEATS) {
    const on = gp > b.a && gp < b.b;
    b.el.style.visibility = on ? 'visible' : 'hidden';
    if (!on) continue;
    const q = range(gp, b.a, b.b);
    const enter = range(q, 0, 0.35), exit = range(q, 0.72, 1);
    const st = b.el.style;
    if (b.fx === 'words') {
      const n = b.parts.length;
      b.parts.forEach((p, i) => {
        const e = easeOut(range(enter, (i / n) * 0.6, (i / n) * 0.6 + 0.4));
        const x = easeOut(range(exit, (i / n) * 0.3, (i / n) * 0.3 + 0.7));
        p.style.transform = `translateY(${(1 - e) * 115 - x * 115}%) rotate(${(1 - e) * 6}deg)`;
      });
    } else if (b.fx === 'letters') {
      const n = b.parts.length;
      b.parts.forEach((p, i) => {
        const e = easeOut(range(enter, (i / n) * 0.45, (i / n) * 0.45 + 0.55));
        const x = exit * exit;
        const k = (1 - e) + x;
        const d = p.dataset;
        p.style.transform = `translate(${d.dx * k * 60}vw, ${d.dy * k * 45}vh) rotate(${d.r * k * 180}deg) scale(${1 + k * 1.5})`;
        p.style.opacity = 1 - Math.min(1, k * 1.2);
        p.style.filter = k > 0.01 ? `blur(${k * 10}px)` : 'none';
      });
    } else if (b.fx === 'type') {
      const n = b.parts.length;
      b.parts.forEach((p, i) => { p.style.opacity = (enter * n > i ? 1 : 0) * (1 - exit); });
    } else if (b.fx === 'mask') {
      const e = easeOut(enter);
      st.clipPath = `inset(0 ${(1 - e) * 100}% 0 ${exit * 100}%)`;
      st.letterSpacing = `${(1 - e) * 0.25 - 0.035}em`;
    } else if (b.fx === 'fade') {
      const e = easeOut(enter);
      st.opacity = e * (1 - exit);
      st.transform = `translateY(${(1 - e) * 24 - exit * 16}px)`;
    } else if (b.fx === 'counter') {
      st.opacity = easeOut(enter) * (1 - exit);
      const v = Math.round(b.to * easeOut(range(q, 0.05, 0.8)) / 10) * 10;
      b.num.textContent = v.toLocaleString('fr-FR');
    } else if (b.fx === 'marquee') {
      st.opacity = Math.min(enter * 2, 1 - exit);
      st.transform = `translateX(${lerp(8, -58, q)}%)`;
    }
  }
}

// Repères de rétention
const chapterEl = $('#chapter'), threadFill = $('#thread i'), threadBob = $('#thread b'), nudgeEl = $('#nudge');
let chapterIdx = -1, lastGp = -1, lastMove = performance.now();
function updateRetention(gp, now) {
  const si = Math.max(0, SCENES.findIndex((s) => gp < s.b));
  if (si !== chapterIdx) {
    chapterIdx = si;
    chapterEl.classList.add('swap');
    setTimeout(() => {
      chapterEl.querySelector('.ch-n').textContent = SCENES[si].id;
      chapterEl.querySelector('.ch-name').textContent = SCENES[si].name;
      chapterEl.classList.remove('swap');
    }, 250);
  }
  chapterEl.style.visibility = gp > 1.2 && gp < 94 ? 'visible' : 'hidden';
  threadFill.style.transform = `scaleY(${gp / 100})`;
  threadBob.style.top = `calc(${gp}% - 7px)`;
  if (Math.abs(gp - lastGp) > 0.01) { lastGp = gp; lastMove = now; }
  const idle = now - lastMove > 3500 && gp > 1.5 && gp < 93 && !cfg.interactive;
  if (idle && SCENES[si + 1]) nudgeEl.querySelector('span').textContent = SCENES[si + 1].name;
  nudgeEl.classList.toggle('on', idle);
}

// =====================================================================
// CONFIGURATEUR 3D & VUE SALON (Scène 07)
// =====================================================================
const zonesEl = $('#zones'), swEl = $('#swatches'), fmtEl = $('#formats'), swNameEl = $('#swatch-name');
const interiorBgEl = $('#interior-bg'), interiorBtn = $('#cfg-interior');

function setInteriorMode(on) {
  cfg.interior = on;
  interiorBgEl.classList.toggle('on', on);
  interiorBtn.textContent = on ? 'Vue éclatée 3D' : 'Voir dans un salon';
  if (on) {
    cfg.target = 0; // rassemble les pièces sur le mur du salon
  } else if (!cfg.created) {
    cfg.target = 1;
  }
}

interiorBtn.onclick = () => {
  enterConfig();
  setInteriorMode(!cfg.interior);
  soundSys.playChime(cfg.interior ? 493.88 : 392.0);
};

ZONES.forEach((z, i) => {
  const b = document.createElement('button');
  b.textContent = `${z.key} · ${z.name}`;
  b.onclick = () => {
    enterConfig();
    cfg.zone = i;
    ZONES[i].pulse = 1;
    soundSys.playChime(330 + i * 45);
    refreshCfg();
  };
  zonesEl.appendChild(b);
});

for (const [keyName, hex] of Object.entries(WOOL)) {
  const b = document.createElement('button');
  b.style.background = hex;
  b.dataset.hex = hex;
  b.dataset.key = keyName;
  b.title = WOOL_LABELS[keyName] || keyName;
  b.onclick = () => {
    enterConfig();
    ZONES[cfg.zone].user = hex;
    ZONES[cfg.zone].pulse = 1.2;
    swNameEl.textContent = WOOL_LABELS[keyName] || keyName;
    soundSys.playTac(1.2);
    renderArcadeSVG($('#studio-art'), ZONES);
    refreshCfg();
  };
  swEl.appendChild(b);
}

FORMATS.forEach((f, i) => {
  const b = document.createElement('button');
  b.textContent = f.label;
  b.onclick = () => {
    enterConfig();
    cfg.format = i;
    cfg.pulse = 1;
    soundSys.playChime(440 + i * 60);
    refreshCfg();
  };
  fmtEl.appendChild(b);
});

function refreshCfg() {
  [...zonesEl.children].forEach((b, i) => b.classList.toggle('on', i === cfg.zone));
  const activeColor = (ZONES[cfg.zone].user || ZONES[cfg.zone].color).toLowerCase();
  [...swEl.children].forEach((b) => {
    const match = b.dataset.hex.toLowerCase() === activeColor;
    b.classList.toggle('on', match);
    if (match) swNameEl.textContent = b.title;
  });
  [...fmtEl.children].forEach((b, i) => b.classList.toggle('on', i === cfg.format));
  const f = FORMATS[cfg.format];
  $('#price').textContent = f.price ? `${f.price.toLocaleString('fr-FR')} €` : 'Sur devis';
}
refreshCfg();

function enterConfig() {
  if (cfg.interactive) return;
  cfg.interactive = true; cfg.created = false; cfg.target = 1;
  cfg.explode = currentExplode;
  lenis.stop();
  $('#cfg-continue').hidden = false; $('#cfg-done').hidden = true;
  document.body.classList.add('cfg-on');
}
function leaveConfig(jumpNext = true) {
  cfg.interactive = false;
  setInteriorMode(false);
  lenis.start();
  $('#cfg-continue').hidden = true;
  document.body.classList.remove('cfg-on');
  if (jumpNext) goTo(77.2, false);
}
$('#cfg-start').onclick = enterConfig;
$('#cfg-create').onclick = () => {
  enterConfig();
  const t = local(gp, 6);
  ZONES.forEach((z) => { if (!z.user) z.user = t > 0.3 ? z.demo : z.color; });
  cfg.target = 0; cfg.created = true;
  const f = FORMATS[cfg.format];
  $('#cfg-summary').textContent = `Format ${f.label} · ${f.price ? f.price.toLocaleString('fr-FR') + ' €' : 'Sur devis'} · Tufté à la main sous 3 à 4 semaines à Colombes.`;
  $('#cfg-done').hidden = false;
  renderArcadeSVG($('#studio-art'), ZONES);
  soundSys.playChime(523.25);
};
$('#cfg-reset').onclick = () => {
  ZONES.forEach((z) => { z.user = z.color; z.pulse = 0.8; });
  renderArcadeSVG($('#studio-art'), ZONES);
  refreshCfg();
  toast('Palette originale Arcade Nº01 restaurée');
};
$('#cfg-reedit').onclick = () => {
  cfg.created = false;
  cfg.target = cfg.interior ? 0 : 1;
  $('#cfg-done').hidden = true;
};
$('#cfg-cart').onclick = () => {
  const f = FORMATS[cfg.format];
  addToCart({
    title: 'ARCADE Nº01 — SUR MESURE',
    meta: `Format ${f.label} · Palette personnalisée (6 zones)`,
    priceLabel: f.price ? `${f.price.toLocaleString('fr-FR')} €` : 'Sur devis',
    priceNum: f.price || 0,
    swatches: ZONES.map((z) => z.user || z.color),
  });
  openCartDrawer();
};
$('#cfg-continue').onclick = () => leaveConfig(true);

// Scène 10 : l'œuvre Arcade en SVG vectoriel fidèle à V13
renderArcadeSVG($('#studio-art'), ZONES);

// =====================================================================
// SCÈNES 08 & 09 : VRAIES VIDÉOS MACRO & PHOTOGRAPHIES D'ATELIER
// =====================================================================
const SHOTS_08 = [
  { src: 'media/atelier/s08-01-main.jpg', text: 'La main de Marina effleure la toile de coton tendue.' },
  { src: 'media/atelier/s08-02-pistolet.jpg', text: 'Le tufting gun pique la toile et plante les boucles corail et marine.' },
  { src: 'media/atelier/s08-03-bobines.jpg', text: 'Les cônes de laine de Nouvelle-Zélande alimentent le cadre.' },
  { src: 'media/atelier/s08-04-colle.jpg', text: 'Le latex naturel est étalé à la spatule au dos de l’œuvre.' },
  { src: 'media/atelier/s08-05-decoupe.jpg', text: 'La pièce est libérée du cadre aux ciseaux de tailleur.' },
  { src: 'media/atelier/s08-06-rasage.jpg', text: 'Chaque zone est sculptée et biseautée à la tondeuse.' },
  { src: 'media/atelier/s08-07-fibres.jpg', text: 'Les fibres de laine s’envolent dans la lumière de Colombes.' },
  { src: 'media/atelier/s08-08-tapis.jpg', text: 'L’œuvre terminée est retournée sur l’établi.' },
];

const SHOTS_09 = [
  { src: 'media/atelier/s09-01-etabli.jpg', text: "Le tufting gun est posé sur l'établi de Colombes. La caméra s'approche." },
  { src: 'media/atelier/s09-02-saisie.jpg', text: 'Votre main entre dans le cadre et saisit le pistolet.' },
  { src: 'media/atelier/s09-03-creation.jpg', text: 'Face à la toile blanche tendue : à vous de tracer votre œuvre.' },
];

const realStillsEl = $('#real-stills');
const realStillNodes = SHOTS_08.map((s) => {
  const d = document.createElement('div');
  d.className = 'still';
  d.style.backgroundImage = `url('${s.src}')`;
  realStillsEl.appendChild(d);
  return d;
});

const atelierStillsEl = $('#atelier-stills');
const atelierStillNodes = SHOTS_09.map((s) => {
  const d = document.createElement('div');
  d.className = 'still';
  d.style.backgroundImage = `url('${s.src}')`;
  atelierStillsEl.appendChild(d);
  return d;
});

const vidReal = $('#vid-real');
const vidAtelier = $('#vid-atelier');

// =====================================================================
// FILM — vidéos Flow pilotées par le scroll (0 → 56 %)
// =====================================================================
const CLIPS = [
  { src: 'media/v01-fil', a: 0, b: 5 },
  { src: 'media/v02-matiere', a: 5, b: 10 },
  { src: 'media/v03-couleur', a: 10, b: 15 },
  { src: 'media/v04-sortie', a: 15, b: 21 },
  { src: 'media/v05-envol', a: 21, b: 25 },
  { src: 'media/v06-explosion', a: 25, b: 30 },
  { src: 'media/v07-toile', a: 30, b: 33 },
  { src: 'media/v08-pistolet', a: 33, b: 36 },
  { src: 'media/v09-premier-trait', a: 36, b: 39 },
  { src: 'media/v10-construction', a: 39, b: 43 },
  { src: 'media/v11-revelation', a: 43, b: 48 },
  { src: 'media/v12-matiere', a: 48, b: 53 },
  { src: 'media/v13-arcade-flotte', a: 53, b: 56 },
];
const XF = 0.42;
const filmEl = document.getElementById('film');
for (const c of CLIPS) {
  const v = document.createElement('video');
  for (const [ext, type] of [['webm', 'video/webm; codecs="vp9"'], ['mp4', 'video/mp4']]) {
    const so = document.createElement('source'); so.src = `${c.src}.${ext}`; so.type = type; v.appendChild(so);
  }
  v.muted = true; v.playsInline = true; v.preload = 'auto';
  v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  filmEl.appendChild(v);
  c.el = v;
}
addEventListener('touchstart', () => {
  for (const c of CLIPS) c.el.play().then(() => c.el.pause()).catch(() => { });
  [vidReal, vidAtelier].forEach((v) => v && v.play().then(() => v.pause()).catch(() => { }));
}, { once: true, passive: true });

function updateFilm(gp) {
  const on = gp < CLIPS[CLIPS.length - 1].b + XF;
  filmEl.style.visibility = on ? 'visible' : 'hidden';
  if (!on) return;
  filmEl.style.transform = `scale(1.04) translate(${-mouse.sx * 0.8}%, ${mouse.sy * 0.6}%)`;
  CLIPS.forEach((c, i) => {
    const last = i === CLIPS.length - 1;
    const o = Math.min(i === 0 ? 1 : range(gp, c.a - XF, c.a), last ? 1 - range(gp, c.b - 0.15, c.b + XF) : 1);
    const visible = gp >= c.a - XF && gp < c.b + XF;
    c.el.style.opacity = visible ? o : 0;
    c.el.style.zIndex = i;
    if (!visible || !c.el.duration || c.el.seeking) return;
    const t = range(gp, c.a, c.b) * (c.el.duration - 0.05);
    if (Math.abs(c.el.currentTime - t) > 1 / 60) c.el.currentTime = t;
  });
}

// =====================================================================
// Scroll — Toujours démarrer à la Scène 01 (0 %) au chargement
// =====================================================================
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
try { localStorage.removeItem('mls-seen'); } catch { }
window.scrollTo(0, 0);

const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
function goTo(pct, immediate = true) { lenis.scrollTo((clamp(pct, 0, 100) / 100) * maxScroll(), { immediate, force: true }); }
function skip() { goTo(55.8, false); }
$('#skip').onclick = skip;
const params = new URLSearchParams(location.search);
if (params.has('p')) {
  requestAnimationFrame(() => goTo(parseFloat(params.get('p'))));
} else {
  requestAnimationFrame(() => goTo(0, true));
}

// =====================================================================
// Boucle principale
// =====================================================================
let gp = 0, currentExplode = 0, hovered = null, last = performance.now();
const tmpC = new THREE.Color(), bg = new THREE.Color();
const monoC = new THREE.Color(), baseC = new THREE.Color();

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < 0.8 ? 62 : 45;
  camera.updateProjectionMatrix();

  const dpr = Math.min(devicePixelRatio, 2);
  fxCanvas.width = innerWidth * dpr;
  fxCanvas.height = innerHeight * dpr;
}
addEventListener('resize', resize);
resize();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const time = now / 1000;
  lenis.raf(now);
  gp = clamp((lenis.scroll / Math.max(1, maxScroll())) * 100, 0, 100);
  soundSys.update(gp, lenis.velocity || 0);
  mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 2.5);
  mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 2.5);

  const P = SCENES.map((_, i) => local(gp, i));
  const up = V(0, 1, 0);
  let camPos = V(C.x, C.y, C.z + 10.6), look = V(C.x, C.y, C.z), roll = 0;

  if (Math.abs(gp - 35.2) < 0.18 || Math.abs(gp - 36.7) < 0.22) {
    soundSys.playTac(1.0);
  }

  // ---------------- fond, brouillard ivoire chaud (ou transparent en mode Salon)
  bg.copy(ECRU).lerp(GALERIE_BG, smooth(55, 58, gp) * (1 - smooth(66, 68, gp)));
  const inSalon = cfg.interactive && cfg.interior && gp >= 66.5 && gp < 77.5;
  renderer.setClearColor(bg, inSalon ? 0 : 1);
  scene.fog.color.copy(bg);
  scene.fog.near = 65;
  scene.fog.far = 165;
  if (!inSalon && interiorBgEl.classList.contains('on')) {
    interiorBgEl.classList.remove('on');
    cfg.interior = false;
  }

  // ---------------- visibilités WebGL (54.8 → 77.5 %)
  arcade.visible = gp >= 54.8 && gp < 77.5;
  galerie.visible = gp >= 54.8 && gp < 77.5 && !inSalon;
  fibers.update(time, mouse, gp);
  updateCursorFibers(gp, time);

  // ================= 01 → 05 — FILM (vidéos Flow)
  updateFilm(gp);

  // ================= ARCADE D'ENTRÉE (Raccord V13 à Z = 0) & ARCADE SANCTUAIRE (S à Z = -40)
  if (arcadeEntrance) {
    const p6 = P[5];
    arcadeEntrance.visible = gp >= 54.8 && gp < 63.0 && !inSalon;
    const v13Tilt = -(1 - smooth(55.4, 57.4, gp)) * 0.142;
    const stepAside = smooth(0.03, 0.22, p6);
    arcadeEntrance.position.set(
      C.x - 3.85 * stepAside,
      C.y + 0.10 + Math.sin(time * 0.7) * 0.04,
      C.z - 1.5 * stepAside
    );
    arcadeEntrance.userData.baseY = C.y + 0.10;
    arcadeEntrance.userData.ry = 0.32 * stepAside;
    if (hovered !== arcadeEntrance) {
      arcadeEntrance.rotation.set(
        -mouse.sy * 0.05,
        arcadeEntrance.userData.ry + mouse.sx * 0.07,
        v13Tilt
      );
    }
  }

  // ================= ARCADE SANCTUAIRE & SCÈNE 07 (Casser l'œuvre / Configurateur)
  if (arcade.visible) {
    const p5 = P[4], p6 = P[5], p7 = P[6];
    let explode;
    if (cfg.interactive) {
      cfg.explode += (cfg.target + cfg.pulse * 0.45 - cfg.explode) * Math.min(1, dt * 3.2);
      cfg.pulse = Math.max(0, cfg.pulse - dt * 1.8);
      explode = cfg.explode;
    } else {
      explode = easeInOut(range(p7, 0.05, 0.32)) * (1 - easeInOut(range(p7, 0.84, 0.97)));
    }
    currentExplode = explode;
    const baseFmtScale = cfg.interactive || cfg.created ? FORMATS[cfg.format].scale : 1;
    const salonScale = inSalon ? baseFmtScale * 0.68 : baseFmtScale;
    cfg.scale += (salonScale - cfg.scale) * Math.min(1, dt * 4);
    arcade.scale.setScalar(cfg.scale);

    // Bascule nette sans artefact de transparence :
    // Quand l'œuvre est assemblée et en couleurs d'origine, la plaque photographique V13 est devant (z = 0.20) ;
    // Dès qu'elle s'éclate (explode > 0.015) ou est personnalisée en Scène 07, les 6 zones 3D sculptées prennent le relais
    const hasCustom = ZONES.some((z) => z.user !== null);
    const demoColorShift = gp >= 67 ? smooth(0.28, 0.38, p7) : 0;
    const showZones = explode > 0.015 || hasCustom || demoColorShift > 0.02 || cfg.interactive;
    arcadePhotoMesh.visible = !showZones;

    backingMesh.position.z = -0.04 - explode * 2.4;
    backingMesh.scale.setScalar(1 - explode * 0.10);
    wallShadowMesh.visible = explode < 0.25;
    wallShadowMesh.material.opacity = (1 - explode * 4) * (inSalon ? 0.68 : 0.35);

    ZONES.forEach((z, i) => {
      z.pulse = Math.max(0, (z.pulse || 0) - dt * 2.4);
      z.holder.visible = showZones;
      const pulseBoost = 1 + (z.pulse || 0) * 0.28;

      z.meshes.forEach((m) => {
        m.scale.set(1, 1, Math.max(0.05, pulseBoost));
      });

      baseC.set(z.color);
      tmpC.copy(baseC);
      if (gp >= 67) {
        if (z.user) tmpC.set(z.user);
        else tmpC.lerp(new THREE.Color(z.demo), smooth(0.32 + i * 0.04, 0.42 + i * 0.04, p7));
      }
      z.mat.color.lerp(tmpC, Math.min(1, dt * 8));
      const sel = cfg.interactive && !cfg.created && !inSalon && i === cfg.zone;
      z.mat.emissive.set(sel ? '#2c1d0b' : '#000000');

      const zOff = 0.04 + z.z * 0.018 + z.explode.z * explode + (z.pulse || 0) * 0.25;
      z.holder.position.set(z.explode.x * explode, z.explode.y * explode, zOff);
      z.holder.rotation.set(z.rot.x * explode, z.rot.y * explode, z.rot.z * explode);
    });

    const floatOn = inSalon ? 0.15 : 1.0;
    arcade.rotation.set(
      -mouse.sy * 0.09 * floatOn + Math.sin(time * 0.55) * 0.018 * floatOn,
      mouse.sx * 0.14 * floatOn,
      0
    );
    arcade.position.copy(S);
    arcade.position.y += inSalon ? 0.65 : Math.sin(time * 0.7) * 0.05 * floatOn;

    if (gp >= 67) {
      const p = p7;
      const panelShift = camera.aspect < 0.8 ? V(0, -3.2, 4) : V(inSalon ? -1.6 : -2.8, 0, 0);
      if (cfg.interactive) {
        const a = mouse.sx * (inSalon ? 0.12 : 0.48);
        const d = inSalon ? 12.2 : 12.4 + 1.6 * cfg.scale;
        camPos.copy(S).add(V(Math.sin(a) * d, mouse.sy * (inSalon ? 0.35 : 1.05), Math.cos(a) * d)).add(panelShift);
        look.copy(S).add(panelShift);
      } else {
        const a = 0.68 * Math.sin(Math.PI * smooth(0.05, 0.82, p));
        const d = 10.8 + 2.2 * Math.sin(Math.PI * smooth(0.05, 0.85, p));
        const shift = panelShift.clone().multiplyScalar(smooth(0.18, 0.34, p));
        camPos.copy(S).add(V(Math.sin(a) * d, 0.55 * Math.sin(a * 0.7), Math.cos(a) * d)).add(shift);
        look.copy(S).add(shift);
      }
    }
  }

  // ================= 06 — LA GALERIE ARCHITECTURALE V13 (Promenade Steadicam fluide)
  if (gp >= 54.8 && gp < 67) {
    const p = P[5];
    const t = smooth(0, 1, p);
    camPos.copy(galPos.getPoint(t)).add(V(mouse.sx * 0.32, mouse.sy * 0.18, 0));
    look.copy(galLook.getPoint(t)).add(V(mouse.sx * 0.18, mouse.sy * 0.12, 0));
  }

  // Survol des œuvres dans la galerie
  let hit = null;
  if (mouse.has && (gp >= 55.6 && gp < 67) && !cfg.interactive && modalEl.hidden && cartDrawerEl.hidden) {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const hits = raycaster.intersectObjects(WORKS, true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && !o.userData.work) o = o.parent;
      hit = o;
    }
  }
  hovered = hit;
  for (const w of WORKS) {
    if (w !== arcade && w !== arcadeEntrance) {
      const targetRy = w === hovered ? w.userData.ry * 0.35 : w.userData.ry;
      w.rotation.y += (targetRy - w.rotation.y) * Math.min(1, dt * 4.5);
      w.position.y = w.userData.baseY + Math.sin(time * 0.8 + w.position.x) * 0.04;
    }
  }
  const tip = $('#tip');
  if (hovered) {
    const w = hovered.userData.work;
    tip.innerHTML = `<b>${w.name}</b>${w.info}<br><strong>${w.price}</strong> · Cliquer pour explorer →`;
    tip.style.left = `${Math.min(innerWidth - 260, mouse.px + 18)}px`;
    tip.style.top = `${Math.min(innerHeight - 90, mouse.py + 18)}px`;
    tip.style.opacity = 1;
    canvas.style.cursor = 'pointer';
  } else {
    tip.style.opacity = 0;
    canvas.style.cursor = gp >= 67 && gp < 77 ? 'grab' : '';
  }

  // ================= caméra
  camera.position.copy(camPos);
  camera.up.copy(up);
  camera.lookAt(look);
  if (roll) camera.rotateZ(roll);

  // ================= DOM & Scènes 08–09
  updateBeats(gp);
  updateRetention(gp, now);
  for (const t of timed) {
    let o = t.f === 0 ? (gp >= t.a && gp < t.b ? 1 : 0) : Math.min(range(gp, t.a, t.a + t.f), 1 - range(gp, t.b - t.f, t.b));
    if (cfg.interactive && t.el.closest('#config')) o = t.el.id === 'cfg-start' ? 0 : 1;
    if (cfg.created && t.el.closest('#config') && t.el.classList.contains('cfg-block')) o = 0;
    t.el.style.opacity = o;
    t.el.style.visibility = o > 0.001 ? 'visible' : 'hidden';
  }

  // Scène 08 — Du digital au réel (77 → 86 %)
  if (gp >= 76.8 && gp < 86.2) {
    const p8 = P[7];
    const idx = Math.min(SHOTS_08.length - 1, Math.floor(p8 * SHOTS_08.length));
    $('#shot-n').textContent = String(idx + 1).padStart(2, '0');
    $('#shot-t').textContent = SHOTS_08[idx].text;
    $('#shot-bar-fill').style.width = `${(p8 * 100).toFixed(1)}%`;

    if (vidReal && vidReal.duration && !vidReal.seeking) {
      const vt = p8 * (vidReal.duration - 0.05);
      if (Math.abs(vidReal.currentTime - vt) > 1 / 30) vidReal.currentTime = vt;
    }
    realStillNodes.forEach((node, i) => {
      const active = i === idx;
      node.style.opacity = active ? 0.88 : 0;
      if (active) {
        const subP = (p8 * SHOTS_08.length) - idx;
        const sc = 1.02 + subP * 0.05;
        node.style.transform = `scale(${sc.toFixed(3)}) translate(${(-mouse.sx * 0.6).toFixed(2)}%, ${(mouse.sy * 0.4).toFixed(2)}%)`;
      }
    });
  }

  // Scène 09 — L'atelier (86 → 94.5 %)
  if (gp >= 85.8 && gp < 94.6) {
    const p9 = P[8];
    const idx = p9 < 0.32 ? 0 : p9 < 0.62 ? 1 : 2;
    $('#atelier-t').textContent = SHOTS_09[idx].text;

    if (vidAtelier && vidAtelier.duration && !vidAtelier.seeking) {
      const vt = p9 * (vidAtelier.duration - 0.05);
      if (Math.abs(vidAtelier.currentTime - vt) > 1 / 30) vidAtelier.currentTime = vt;
    }
    atelierStillNodes.forEach((node, i) => {
      const active = i === idx;
      node.style.opacity = active ? 0.88 : 0;
      if (active) {
        const sc = 1.03 + (p9 * 0.05);
        node.style.transform = `scale(${sc.toFixed(3)}) translate(${(-mouse.sx * 0.6).toFixed(2)}%, ${(mouse.sy * 0.4).toFixed(2)}%)`;
      }
    });
  }

  if ((gp >= 54.8 && gp < 77.5) || cfg.interactive) renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// Clic dans la galerie (ouvre la fiche œuvre) ou sur les zones d'Arcade (Scène 07)
canvas.addEventListener('click', () => {
  if (hovered && hovered.userData.work) {
    soundSys.playChime(523.25);
    openWorkModal(hovered.userData.work);
    return;
  }
  if (gp >= 67 && gp < 77) {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const h = raycaster.intersectObjects(zoneMeshes, false)[0];
    if (h) {
      enterConfig();
      cfg.zone = h.object.userData.zone;
      ZONES[cfg.zone].pulse = 1;
      soundSys.playChime(380 + cfg.zone * 40);
      refreshCfg();
    }
  }
});

requestAnimationFrame(frame);
