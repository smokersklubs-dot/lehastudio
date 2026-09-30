// Marina Lehacaut Studio — prototype gris du film interactif (storyboard v0.2).
//
// Principe : UNE timeline maîtresse. Tout l'état visuel (caméra, objets, textes) est une
// fonction pure de la progression globale du scroll `gp` (0 → 100). On peut avancer,
// reculer ou recharger au milieu : l'image est toujours la bonne.
// Seules exceptions : l'ondulation au repos, la souris, et le mode interactif de la scène 07.
//
// 0 → 43 % : vidéos Flow V01 → V10 lues au rythme du scroll, voir FILM plus bas.
// Ensuite : 3D (Arcade qui naît, la galerie, le configurateur).

import * as THREE from './vendor/three.module.min.js';
import Lenis from './vendor/lenis.mjs';

// ---------------------------------------------------------------- timeline
const SCENES = [
  { id: '01', name: 'Le fil', a: 0, b: 5 },
  { id: '02', name: 'Entrer dans la matière', a: 5, b: 15 },
  { id: '03', name: "Sortie, envol, explosion", a: 15, b: 30 },
  { id: '04', name: 'Le geste', a: 30, b: 43 },
  { id: '05', name: 'Arcade naît', a: 43, b: 55 },
  { id: '06', name: 'La galerie impossible', a: 55, b: 67 },
  { id: '07', name: "Casser l'œuvre", a: 67, b: 77 },
  { id: '08', name: 'Du digital au réel', a: 77, b: 86 },
  { id: '09', name: "L'atelier", a: 86, b: 94 },
  { id: '10', name: 'Le studio', a: 94, b: 100 },
];

// Couleurs provisoires : à remplacer par les vraies laines des œuvres.
const WOOL = {
  rouge: '#C8372D', orange: '#E8762C', bleu: '#2F5DA8', rose: '#E9A0B5',
  jaune: '#F2C230', ecru: '#EDE6DA', sauge: '#7F9A7A', encre: '#1E1C1A',
};
const PALETTE5 = [WOOL.rouge, WOOL.orange, WOOL.bleu, WOOL.rose, WOOL.jaune];
const ECRU = new THREE.Color('#EEE9E1');
const GALERIE = new THREE.Color('#E6E0D6');

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

// ---------------------------------------------------------------- rendu
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(ECRU, 1, 100);
const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 260);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8074, 1.3));
const key = new THREE.DirectionalLight(0xffffff, 1.8);
key.position.set(4, 7, 6);
scene.add(key);
const rake = new THREE.DirectionalLight(0xfff1dd, 0.9); // lumière rasante : fait ressortir la laine
rake.position.set(-8, 1, 1.5);
scene.add(rake);

// Texture « laine » procédurale (bosses), partagée par tous les objets textiles.
function woolTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const v = 90 + Math.random() * 110;
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 1 + Math.random() * 2;
    const x = Math.random() * 256, y = Math.random() * 256;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3 + Math.random() * 5, y + (Math.random() - 0.5) * 3); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const WOOL_TEX = woolTexture();
const woolMat = (color, repeat = 4) => {
  const tex = WOOL_TEX.clone();
  tex.repeat.set(repeat, repeat);
  tex.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ color, roughness: 0.95, bumpMap: tex, bumpScale: 1.4 });
};

// ---------------------------------------------------------------- souris
const mouse = { x: 0, y: 0, sx: 0, sy: 0, px: -1, py: -1, has: false };
addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  mouse.px = e.clientX; mouse.py = e.clientY; mouse.has = true;
});

// =====================================================================
// 04 — LE GESTE : la toile, le pistolet, les lignes
// =====================================================================
const C = V(0, 0, -300);
const atelier = new THREE.Group();
atelier.position.copy(C);
scene.add(atelier);
const canvasW = 9, canvasH = 6.2;
const toile = new THREE.Mesh(new THREE.PlaneGeometry(canvasW, canvasH), new THREE.MeshStandardMaterial({ color: '#F8F5EF', roughness: 1, transparent: true }));
atelier.add(toile);
const frameMat = new THREE.MeshStandardMaterial({ color: '#B9A488', roughness: 0.8, transparent: true });
for (const [w, h, x, y] of [[canvasW + 0.5, 0.25, 0, canvasH / 2 + 0.12], [canvasW + 0.5, 0.25, 0, -canvasH / 2 - 0.12], [0.25, canvasH, canvasW / 2 + 0.12, 0], [0.25, canvasH, -canvasW / 2 - 0.12, 0]]) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), frameMat);
  b.position.set(x, y, -0.1);
  atelier.add(b);
}
// Lignes de laine tuftées.
const ROWS = 16, rowX0 = 3.9, rowW = 7.8, rowY0 = 2.45, rowStep = 0.32;
const rowGeo = new THREE.BoxGeometry(1, 0.24, 0.1);
const rows = [];
for (let k = 0; k < ROWS; k++) {
  const m = new THREE.Mesh(rowGeo, woolMat(['#DCD2C1', '#D3C7B3', '#E2D9CA'][k % 3], 2));
  m.material.transparent = true;
  m.position.set(0, rowY0 - k * rowStep, 0.06);
  atelier.add(m);
  rows.push(m);
}
// Fenêtres de tracé de chaque ligne (progression locale de la scène 04) : 3 lignes lentes, puis accélération.
const rowWin = [[0.35, 0.45], [0.5, 0.56], [0.57, 0.63]];
{
  // Lignes 3 → 15 : de plus en plus rapides, toutes terminées avant la fin de la scène.
  const n = ROWS - 3, u = (j) => 1 - Math.pow(1 - j / n, 1.7);
  for (let j = 0; j < n; j++) rowWin.push([0.635 + 0.355 * u(j), 0.635 + 0.355 * u(j + 1) - 0.003]);
}
// Le tufting gun (remplacé plus tard par un modèle glTF).
const gun = new THREE.Group();
{
  const dark = new THREE.MeshStandardMaterial({ color: '#2A2826', roughness: 0.45, metalness: 0.3 });
  const accent = new THREE.MeshStandardMaterial({ color: WOOL.orange, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 1.5), dark); body.position.z = 0.95;
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.3), dark); handle.position.set(0, -0.62, 1.35); handle.rotation.x = -0.35;
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.6), accent); top.position.set(0, 0.38, 1.2);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), new THREE.MeshStandardMaterial({ color: '#bbb', metalness: 0.9, roughness: 0.2 }));
  needle.rotation.x = Math.PI / 2; needle.position.z = 0.1;
  const spoolFeed = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 0.4, 1.5), V(0, 1.4, 2.2), V(0.4, 3, 2.6)]), 20, 0.025, 6), woolMat(WOOL.ecru, 1));
  gun.add(body, handle, top, needle, spoolFeed);
}
atelier.add(gun);
// Fibres qui suivent la souris.
const followers = [];
const followerGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.28, 5);
for (let i = 0; i < 46; i++) {
  const m = new THREE.Mesh(followerGeo, new THREE.MeshStandardMaterial({ color: i % 3 ? '#D9CDB8' : PALETTE5[i % 5], transparent: true }));
  m.userData = { k: rr(1.2, 5), off: V(rr(-0.7, 0.7), rr(-0.5, 0.5), rr(0.3, 1.2)), spin: rr(-2, 2) };
  m.position.set(0, 0, 1);
  followers.push(m);
  atelier.add(m);
}
const followPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -(C.z + 1));
const raycaster = new THREE.Raycaster();
const followTarget = V(0, 0, 1);

// =====================================================================
// 05 → 07 — ARCADE (zones géométriques = mêmes fichiers que le configurateur)
// =====================================================================
// Motif provisoire : à remplacer par la vectorisation réelle d'Arcade.
const archShape = (w, bottom, top) => {
  const s = new THREE.Shape();
  s.moveTo(-w, bottom); s.lineTo(w, bottom); s.lineTo(w, top); s.absarc(0, top, w, 0, Math.PI, false); s.lineTo(-w, bottom);
  return s;
};
const rectShape = (x0, y0, x1, y1) => { const s = new THREE.Shape(); s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.lineTo(x0, y0); return s; };
const circleShape = (x, y, r) => { const s = new THREE.Shape(); s.absarc(x, y, r, 0, Math.PI * 2, false); return s; };
const ZONES = [
  { key: 'A', name: 'Fond', shape: rectShape(-1, -1, 1, 1), color: WOOL.bleu, demo: WOOL.jaune, mono: '#E7E0D4', z: 0, form: 2, explode: V(0, 0, -2.2), rot: V(0, 0.25, 0) },
  { key: 'B', name: 'Arche', shape: archShape(0.62, -0.78, 0.12), color: WOOL.orange, demo: WOOL.rose, mono: '#DDD4C5', z: 1, form: 1, explode: V(-2.1, 0.5, 1.2), rot: V(0.2, -0.4, 0.1) },
  { key: 'C', name: 'Arche int.', shape: archShape(0.33, -0.78, 0.08), color: WOOL.rose, demo: WOOL.rouge, mono: '#EEE8DE', z: 2, form: 2, explode: V(1.9, 0.9, 2.4), rot: V(-0.2, 0.5, -0.1) },
  { key: 'D', name: 'Soleil', shape: circleShape(0, 0.05, 0.15), color: WOOL.jaune, demo: WOOL.ecru, mono: '#D6CCBB', z: 3, form: 2, explode: V(0.4, 2.6, 3.4), rot: V(0.4, 0.3, 0) },
  { key: 'E', name: 'Socle', shape: rectShape(-1, -1, 1, -0.78), color: WOOL.rouge, demo: WOOL.bleu, mono: '#D0C6B4', z: 4, form: 2, explode: V(0, -2.5, 0.9), rot: V(-0.4, 0, 0.15) },
];
const ARC_SIZE = 2.3; // demi-côté en unités monde
const arcade = new THREE.Group();
arcade.position.copy(C);
scene.add(arcade);
const zoneMeshes = ZONES.map((z, i) => {
  const geo = new THREE.ExtrudeGeometry(z.shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.012, bevelSegments: 2, curveSegments: 48 });
  const mat = woolMat(z.mono, 1.5);
  mat.transparent = true;
  const m = new THREE.Mesh(geo, mat);
  m.userData = { zone: i };
  const holder = new THREE.Group(); // holder = position de base ; m = relief (scale.z)
  holder.scale.set(ARC_SIZE, ARC_SIZE, ARC_SIZE);
  holder.add(m);
  arcade.add(holder);
  z.holder = holder; z.mesh = m; z.user = null;
  return m;
});
arcade.userData.work = { name: 'ARCADE Nº01', info: 'Œuvre textile · 51 × 51 cm', price: '1 400 €', url: '/oeuvres/arcade' };

// =====================================================================
// 06 — LA GALERIE IMPOSSIBLE
// =====================================================================
const galerie = new THREE.Group();
scene.add(galerie);
const archi = new THREE.MeshStandardMaterial({ color: '#D5CDBF', roughness: 1 });
const archi2 = new THREE.MeshStandardMaterial({ color: '#C9C0B1', roughness: 1 });
const lineMat = new THREE.LineBasicMaterial({ color: '#8F877A' });
const G = (x, y, z) => V(C.x + x, C.y + y, C.z + z);
function arch(x, y, z, s, ry = 0) {
  const g = new THREE.Group();
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), archi); p1.position.set(-1.6, 0, 0);
  const p2 = p1.clone(); p2.position.x = 1.6;
  const top = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.2, 8, 32, Math.PI), archi); top.position.y = 2;
  g.add(p1, p2, top);
  g.position.copy(G(x, y, z)); g.scale.setScalar(s); g.rotation.y = ry;
  galerie.add(g);
}
arch(-6, -1, -4, 1.6, 0.4); arch(7, 0, -12, 2.2, -0.5); arch(-2, 1, -44, 2.8, 0.2); arch(9, 3, -52, 1.4, 0.8);
for (let i = 0; i < 14; i++) { // dalles suspendues
  const m = new THREE.Mesh(new THREE.BoxGeometry(rr(2, 7), 0.12, rr(1.5, 4)), i % 2 ? archi : archi2);
  m.position.copy(G((rand() > 0.5 ? 1 : -1) * rr(6, 14), rr(-5, 7), rr(-60, 4))); m.rotation.set(rr(-0.2, 0.2), rr(0, 3), rr(-0.15, 0.15));
  galerie.add(m);
}
for (let i = 0; i < 9; i++) { // escalier qui ne mène nulle part
  const m = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 0.9), archi);
  m.position.copy(G(-9 + i * 0.2, -4 + i * 0.55, -26 - i * 0.9));
  galerie.add(m);
}
function work(data, x, y, z, ry) {
  const g = new THREE.Group();
  g.position.copy(G(x, y, z)); g.rotation.y = ry;
  g.userData.work = data; g.userData.ry = ry;
  galerie.add(g);
  return g;
}
const cubix = work({ name: 'CUBIX', info: 'Pièce unique · 70 × 70 cm', price: '1 900 €', url: '/oeuvres/cubix' }, -7, 1.5, -18, 0.45);
for (let i = 0; i < 9; i++) {
  const d = i % 2 ? 0.28 : 0.14;
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, d), woolMat(PALETTE5[(i * 2) % 5], 1));
  m.position.set(((i % 3) - 1) * 1.2, (Math.floor(i / 3) - 1) * 1.2, d / 2);
  cubix.add(m);
}
cubix.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.4, 5.4, 5.4)), lineMat));
const vortex = work({ name: 'VORTEX', info: 'Personnalisable · dès 51 × 51 cm', price: 'dès 890 €', url: '/oeuvres/vortex' }, 7, -0.5, -34, -0.5);
for (let i = 0; i < 7; i++) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.25 + i * 0.28, 0.5 + i * 0.28, 64, 1, i * 0.4, Math.PI * 2 - 0.25), woolMat(PALETTE5[i % 5], 1));
  m.material.side = THREE.DoubleSide; m.position.z = i * 0.03;
  vortex.add(m);
}
for (let i = 0; i < 16; i++) { // spirale de plans autour de Vortex
  const a = i * 0.55, r = 3.2 + i * 0.12;
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.4, 0.08), archi2);
  m.position.set(Math.cos(a) * r, Math.sin(a) * r, -1 - i * 0.25); m.rotation.z = a;
  vortex.add(m);
}
const strates = work({ name: 'STRATES', info: 'Pièce unique · 90 × 60 cm', price: '2 100 €', url: '/oeuvres/strates' }, -3, 4, -48, 0.3);
for (let i = 0; i < 7; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.4, 0.14 + (i % 3) * 0.08), woolMat(PALETTE5[(i + 2) % 5], 1));
  m.position.x = (i - 3) * 0.55;
  strates.add(m);
}
const delta = work({ name: 'DELTA', info: 'Personnalisable · 70 × 70 cm', price: 'dès 1 190 €', url: '/oeuvres/delta' }, 4, 2, -58, -0.2);
for (let i = 0; i < 6; i++) {
  const s = new THREE.Shape(); s.moveTo(-0.8, -0.7); s.lineTo(0.8, -0.7); s.lineTo(0, 0.7); s.lineTo(-0.8, -0.7);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.15, bevelEnabled: false }), woolMat(PALETTE5[i % 5], 1));
  m.position.set(((i % 3) - 1) * 1.1, (i < 3 ? 0.7 : -0.7), 0); if (i >= 3) m.rotation.z = Math.PI;
  delta.add(m);
}
const WORKS = [arcade, cubix, vortex, strates, delta];
// Trajet caméra dans la galerie (positions / cibles).
const galPos = new THREE.CatmullRomCurve3([G(0, 0, 11), G(6, 2.5, 16), G(-2.5, 1.5, -6), G(2.5, -0.2, -24), G(-0.5, 3, -38), G(1.5, 2, -47), G(0, 16, -18), G(0, 0, 11)]);
const galLook = new THREE.CatmullRomCurve3([G(0, 0, 0), G(-1, 0, -12), G(-7, 1.5, -18), G(7, -0.5, -34), G(-3, 4, -48), G(4, 2, -58), G(0, 0, -26), G(0, 0, 0)]);

// =====================================================================
// 07 — CONFIGURATEUR (état)
// =====================================================================
const FORMATS = [
  { label: '51 × 51 cm', scale: 1, price: 690 },
  { label: '70 × 70 cm', scale: 1.18, price: 1190 },
  { label: '90 × 90 cm', scale: 1.36, price: 1790 },
  { label: 'Sur mesure', scale: 1.1, price: null },
];
const cfg = { interactive: false, created: false, zone: 1, format: 0, explode: 0, target: 1, scale: 1, pulse: 0 };

// =====================================================================
// DOM
// =====================================================================
const $ = (s) => document.querySelector(s);
const timed = [...document.querySelectorAll('[data-in], [data-out]')].map((el) => ({
  el, a: parseFloat(el.dataset.in ?? '-1'), b: parseFloat(el.dataset.out ?? '101'),
  f: parseFloat(el.dataset.fade ?? '0.5'),
}));
const hud = { scene: $('#hud-scene'), pct: $('#hud-pct'), bar: $('#hud-bar'), cursor: $('#hud-cursor') };
for (const s of SCENES) {
  const sp = document.createElement('span');
  sp.style.width = `${s.b - s.a}%`; sp.textContent = s.id; sp.title = `${s.id} — ${s.name}`;
  sp.onclick = (e) => { e.stopPropagation(); goTo(s.a + 0.01); };
  hud.bar.appendChild(sp);
}
hud.bar.addEventListener('click', (e) => { const r = hud.bar.getBoundingClientRect(); goTo(((e.clientX - r.left) / r.width) * 100); });
addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') $('#hud').classList.toggle('off');
  if (e.key === 'Escape') skip();
});
const toastEl = $('#toast');
let toastT;
function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 2200); }
document.addEventListener('click', (e) => { const a = e.target.closest('[data-toast]'); if (a) { e.preventDefault(); toast(a.dataset.toast); } });
$('#sound').onclick = () => toast('Son : non inclus dans le prototype');

// Configurateur
const zonesEl = $('#zones'), swEl = $('#swatches'), fmtEl = $('#formats');
ZONES.forEach((z, i) => {
  const b = document.createElement('button'); b.textContent = `${z.key} · ${z.name}`;
  b.onclick = () => { enterConfig(); cfg.zone = i; refreshCfg(); };
  zonesEl.appendChild(b);
});
for (const [name, hex] of Object.entries(WOOL)) {
  const b = document.createElement('button'); b.style.background = hex; b.title = name;
  b.onclick = () => { enterConfig(); ZONES[cfg.zone].user = hex; };
  swEl.appendChild(b);
}
FORMATS.forEach((f, i) => {
  const b = document.createElement('button'); b.textContent = f.label;
  b.onclick = () => { enterConfig(); cfg.format = i; cfg.pulse = 1; refreshCfg(); };
  fmtEl.appendChild(b);
});
function refreshCfg() {
  [...zonesEl.children].forEach((b, i) => b.classList.toggle('on', i === cfg.zone));
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
function leaveConfig() {
  cfg.interactive = false;
  lenis.start();
  $('#cfg-continue').hidden = true;
  document.body.classList.remove('cfg-on');
  goTo(77.2);
}
$('#cfg-start').onclick = enterConfig;
$('#cfg-create').onclick = () => {
  enterConfig();
  // Les couleurs non choisies prennent celles de la démonstration.
  const t = local(gp, 6);
  ZONES.forEach((z) => { if (!z.user) z.user = t > 0.3 ? z.demo : z.color; });
  cfg.target = 0; cfg.created = true;
  $('#cfg-done').hidden = false;
};
$('#cfg-cart').onclick = () => { const n = $('#cart-count'); n.textContent = +n.textContent + 1; toast('Arcade personnalisé ajouté au panier (factice)'); };
$('#cfg-continue').onclick = leaveConfig;

// Scène 10 : l'œuvre en SVG
$('#studio-art').innerHTML = `
  <rect x="-1" y="-1" width="2" height="2" fill="${WOOL.bleu}"/>
  <path d="M-.62 .78 L.62 .78 L.62 -.12 A.62 .62 0 0 0 -.62 -.12 Z" fill="${WOOL.orange}"/>
  <path d="M-.33 .78 L.33 .78 L.33 -.08 A.33 .33 0 0 0 -.33 -.08 Z" fill="${WOOL.rose}"/>
  <circle cx="0" cy="-.05" r=".15" fill="${WOOL.jaune}"/>
  <rect x="-1" y=".78" width="2" height=".22" fill="${WOOL.rouge}"/>`;

const SHOTS = ['La main de Marina.', 'Le tufting gun pique la toile.', 'La laine, les bobines.', 'La colle étalée au dos.', 'La découpe.', 'Le rasage.', 'Les fibres qui volent.', 'Le tapis terminé, retourné.'];

// =====================================================================
// FILM — vidéos Flow pilotées par le scroll (0 → 43 %)
// =====================================================================
// Chaque plan occupe une plage du scroll ; sa position dans la plage donne son temps.
// Deux encodages par plan, avec des images clés très rapprochées pour pouvoir sauter
// à n'importe quelle image sans saccade : WebM/VP9 (Chrome, Firefox) et MP4/H.264
// « toutes images clés » (Safari). Entre deux plans : fondu enchaîné court.
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
];
const XF = 0.35; // durée du fondu enchaîné, en % de scroll
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
// iOS n'affiche une vidéo scrubbée qu'après une première lecture déclenchée par un geste.
addEventListener('touchstart', () => { for (const c of CLIPS) c.el.play().then(() => c.el.pause()).catch(() => {}); }, { once: true, passive: true });

function updateFilm(gp) {
  const on = gp < CLIPS[CLIPS.length - 1].b + XF;
  filmEl.style.visibility = on ? 'visible' : 'hidden';
  if (!on) return;
  // Légère parallaxe à la souris : la matière « respire ».
  filmEl.style.transform = `scale(1.04) translate(${-mouse.sx * 0.8}%, ${mouse.sy * 0.6}%)`;
  CLIPS.forEach((c, i) => {
    const last = i === CLIPS.length - 1;
    const o = Math.min(i === 0 ? 1 : range(gp, c.a - XF, c.a), last ? 1 - range(gp, c.b, c.b + XF) : 1);
    const visible = gp >= c.a - XF && gp < c.b + XF;
    c.el.style.opacity = visible ? o : 0;
    // Le plan suivant se pose par-dessus le précédent : pas de creux de luminosité.
    c.el.style.zIndex = i;
    if (!visible || !c.el.duration || c.el.seeking) return;
    const t = range(gp, c.a, c.b) * (c.el.duration - 0.05);
    if (Math.abs(c.el.currentTime - t) > 1 / 60) c.el.currentTime = t;
  });
}

// =====================================================================
// Scroll
// =====================================================================
const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
function goTo(pct, immediate = true) { lenis.scrollTo((clamp(pct, 0, 100) / 100) * maxScroll(), { immediate, force: true }); }
function skip() { goTo(55, false); try { localStorage.setItem('mls-seen', '1'); } catch {} }
$('#skip').onclick = skip;
const params = new URLSearchParams(location.search);
if (params.has('p')) requestAnimationFrame(() => goTo(parseFloat(params.get('p'))));
else { try { if (localStorage.getItem('mls-seen') && !params.has('intro')) requestAnimationFrame(() => goTo(55)); } catch {} }
addEventListener('scroll', () => { if (gp > 50) { try { localStorage.setItem('mls-seen', '1'); } catch {} } }, { passive: true });

// =====================================================================
// Boucle
// =====================================================================
let gp = 0, currentExplode = 0, hovered = null, last = performance.now();
const tmpV = new THREE.Vector3(), tmpC = new THREE.Color(), bg = new THREE.Color();
const monoC = new THREE.Color(), baseC = new THREE.Color();

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  // En portrait, on recule un peu pour garder les œuvres entières.
  camera.fov = camera.aspect < 0.8 ? 62 : 45;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const time = now / 1000;
  lenis.raf(now);
  gp = clamp((lenis.scroll / Math.max(1, maxScroll())) * 100, 0, 100);
  mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 2.5);
  mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 2.5);

  const P = SCENES.map((_, i) => local(gp, i));
  const up = V(0, 1, 0);
  let camPos = V(0, 0, 10), look = V(0, 0, 0), roll = 0;

  // ---------------- fond, brouillard
  bg.copy(ECRU).lerp(GALERIE, smooth(55, 58, gp) * (1 - smooth(66, 68, gp)));
  renderer.setClearColor(bg);
  scene.fog.color.copy(bg);
  if (gp >= 55 && gp < 67) { scene.fog.near = 10; scene.fog.far = lerp(15, 75, smooth(55, 58.5, gp)); } // la galerie se découvre
  else { scene.fog.near = 14; scene.fog.far = 120; }

  // ---------------- visibilités (on ne dessine que ce qui sert)
  atelier.visible = gp >= 42.6 && gp < 54;
  arcade.visible = gp >= 43 && gp < 77.5;
  galerie.visible = gp >= 55 && gp < 68;

  // ================= 01 → 04 début — FILM (vidéos Flow)
  updateFilm(gp);

  // ================= 04 — LE GESTE  (+ début 05)
  if (atelier.visible) {
    const p = P[3];
    const p5 = P[4];
    // Toile et lignes
    const fadeOut = 1 - smooth(0.7, 0.85, p5);
    toile.material.opacity = fadeOut; frameMat.opacity = fadeOut;
    const rowsFade = 1 - smooth(0.05, 0.35, p5);
    let active = -1;
    rows.forEach((r, k) => {
      const [a, b] = rowWin[k];
      const d = range(p, a, b);
      r.visible = d > 0 && rowsFade > 0;
      r.scale.x = Math.max(0.0001, d * rowW);
      r.position.x = rowX0 - (d * rowW) / 2;
      r.material.opacity = rowsFade;
      if (p >= a && p < b) active = k;
    });
    // Pistolet
    const enter = easeInOut(range(p, 0.1, 0.32));
    const restPos = V(rowX0, rowY0, 0.25);
    const g0 = V(9, 2.5, 7);
    gun.position.lerpVectors(g0, restPos, enter);
    gun.rotation.set(0.1 * (1 - enter), lerp(1.3, 0, enter), lerp(-0.4, 0, enter));
    if (active >= 0) {
      const [a, b] = rowWin[active];
      const d = range(p, a, b);
      gun.position.set(rowX0 - d * rowW, rowY0 - active * rowStep, 0.25);
      gun.position.x += Math.sin(time * 90) * 0.006; gun.position.z += Math.cos(time * 70) * 0.01;
    } else if (p > 0.35) {
      // Entre deux lignes : le pistolet remonte au début de la suivante.
      let k = rowWin.findIndex(([a]) => a > p);
      if (k < 0) k = ROWS - 1;
      const prev = Math.max(0, k - 1);
      const t = smooth(rowWin[prev][1], rowWin[k][0], p);
      gun.position.set(lerp(rowX0 - rowW, rowX0, t), lerp(rowY0 - prev * rowStep, rowY0 - k * rowStep, t), 0.25 + Math.sin(t * Math.PI) * 0.4);
    }
    // Scène 05 : le pistolet trace les formes d'Arcade puis sort.
    if (p5 > 0) {
      const t = range(p5, 0, 0.4);
      const ang = t * Math.PI * 4;
      const r = ARC_SIZE * lerp(0.62, 0.3, t);
      const outT = smooth(0.4, 0.55, p5);
      gun.position.set(Math.cos(ang) * r + outT * 9, -0.3 + Math.sin(ang) * r * 0.9 + outT * 3, 0.35 + outT * 5);
      gun.rotation.set(0, outT * 1.2, 0);
    }
    gun.visible = p5 < 0.56;
    // Fibres qui suivent la souris
    const fOn = smooth(0.3, 0.4, p) * (1 - smooth(0.3, 0.5, p5));
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    if (mouse.has && raycaster.ray.intersectPlane(followPlane, followTarget)) followTarget.sub(C);
    else followTarget.set(1.5, -1, 1);
    followers.forEach((f, i) => {
      const u = f.userData;
      f.visible = fOn > 0.01;
      tmpV.copy(followTarget).add(u.off);
      tmpV.z = 0.3 + u.off.z * 0.6;
      f.position.lerp(tmpV, Math.min(1, dt * u.k));
      f.rotation.set(time * u.spin, i, time * u.spin * 0.7);
      f.material.opacity = fOn;
    });
    if (gp >= 30 && gp < 43) {
      const orbit = 0.26 * Math.sin(Math.PI * range(p, 0.1, 0.36));
      const d = 12.5 - 3 * smooth(0.6, 1, p);
      camPos.copy(C).add(V(Math.sin(orbit) * d + mouse.sx * 0.3, 0.4 + mouse.sy * 0.2 - 0.6 * smooth(0.6, 1, p) * 0, Math.cos(orbit) * d));
      look.copy(C).add(V(0, 0, 0));
    }
  }

  // ================= ARCADE (05 → 07)
  if (arcade.visible) {
    const p5 = P[4], p7 = P[6];
    // Éclatement : piloté par le scroll… ou par le visiteur en mode interactif.
    let explode;
    if (cfg.interactive) {
      cfg.explode += (cfg.target + cfg.pulse * 0.6 - cfg.explode) * Math.min(1, dt * 3);
      cfg.pulse = Math.max(0, cfg.pulse - dt * 1.6);
      explode = cfg.explode;
    } else {
      explode = easeInOut(range(p7, 0.05, 0.3)) * (1 - easeInOut(range(p7, 0.85, 0.97)));
    }
    currentExplode = explode;
    const fmtScale = cfg.interactive || cfg.created ? FORMATS[cfg.format].scale : 1;
    cfg.scale += (fmtScale - cfg.scale) * Math.min(1, dt * 4);
    arcade.scale.setScalar(cfg.scale);

    ZONES.forEach((z, i) => {
      // Forme 1 (arche) puis formes 2, couleur, volume.
      const appear = z.form === 1 ? smooth(0.02, 0.2, p5) : smooth(0.2 + i * 0.03, 0.3 + i * 0.03, p5);
      const colorT = smooth(0.4 + i * 0.025, 0.47 + i * 0.025, p5);
      const vol = lerp(0.12, 1, smooth(0.55, 0.7, p5));
      z.mesh.material.opacity = appear;
      z.mesh.visible = appear > 0.001;
      z.mesh.scale.set(1, 1, Math.max(0.02, vol * appear));
      monoC.set(z.mono); baseC.set(z.color);
      tmpC.copy(monoC).lerp(baseC, colorT);
      if (gp >= 67) {
        if (z.user) tmpC.set(z.user);
        else tmpC.lerp(new THREE.Color(z.demo), smooth(0.32 + i * 0.04, 0.4 + i * 0.04, p7));
      }
      z.mesh.material.color.lerp(tmpC, Math.min(1, dt * 8));
      const sel = cfg.interactive && !cfg.created && i === cfg.zone;
      z.mesh.material.emissive.set(sel ? '#3a2a10' : '#000000');
      z.holder.position.set(z.explode.x * explode, z.explode.y * explode, 0.07 + z.z * 0.035 + z.explode.z * explode);
      z.holder.rotation.set(z.rot.x * explode, z.rot.y * explode, z.rot.z * explode);
    });
    // Flotter : légère respiration + souris (une fois l'œuvre terminée).
    const floatOn = smooth(0.7, 0.85, p5);
    arcade.rotation.set(-mouse.sy * 0.12 * floatOn + Math.sin(time * 0.5) * 0.02 * floatOn, mouse.sx * 0.18 * floatOn, 0);
    arcade.position.copy(C);
    arcade.position.y += Math.sin(time * 0.7) * 0.06 * floatOn;
    if (gp >= 55 && gp < 67) arcade.position.x += -3.8 * smooth(0, 0.18, P[5]) * (1 - smooth(0.86, 1, P[5]));

    if (gp >= 43 && gp < 55) {
      // Caméra : se rapproche pour le volume, puis recule — l'œuvre est terminée.
      const close = smooth(0.52, 0.66, p5) * (1 - smooth(0.7, 0.85, p5));
      const d = lerp(9.5, 4.2, close) + 1.5 * smooth(0.7, 0.85, p5);
      const side = close * 2.2;
      camPos.copy(C).add(V(side + mouse.sx * 0.3, -close * 0.8 + mouse.sy * 0.2, d));
      look.copy(C).add(V(0, -close * 0.4, 0));
    }
    if (gp >= 67) {
      const p = p7;
      // Laisse la place au panneau : à gauche sur ordinateur, en bas sur mobile.
      const panelShift = camera.aspect < 0.8 ? V(0, -3.2, 4) : V(-3, 0, 0);
      if (cfg.interactive) {
        const a = mouse.sx * 0.5, d = 13 + 2 * cfg.scale;
        camPos.copy(C).add(V(Math.sin(a) * d, mouse.sy * 1.2, Math.cos(a) * d)).add(panelShift);
        look.copy(C).add(panelShift);
      } else {
        const a = 0.85 * Math.sin(Math.PI * smooth(0.05, 0.8, p));
        const d = 11 + 3 * Math.sin(Math.PI * smooth(0.05, 0.85, p));
        const shift = panelShift.clone().multiplyScalar(smooth(0.2, 0.35, p));
        camPos.copy(C).add(V(Math.sin(a) * d, 0.8 * Math.sin(a * 0.7), Math.cos(a) * d)).add(shift);
        look.copy(C).add(shift);
      }
    }
  }

  // ================= 06 — LA GALERIE IMPOSSIBLE
  if (gp >= 55 && gp < 67) {
    const p = P[5];
    const t = easeInOut(p) * 0.98 + p * 0.02;
    camPos.copy(galPos.getPoint(t)).add(V(mouse.sx * 0.5, mouse.sy * 0.3, 0));
    look.copy(galLook.getPoint(t));
  }
  // Survol des œuvres
  let hit = null;
  if (mouse.has && (gp >= 55 && gp < 67) && !cfg.interactive) {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const hits = raycaster.intersectObjects(WORKS, true);
    if (hits.length) { let o = hits[0].object; while (o && !o.userData.work) o = o.parent; hit = o; }
  }
  hovered = hit;
  for (const w of WORKS) if (w !== arcade) w.rotation.y += ((w === hovered ? w.userData.ry * 0.3 : w.userData.ry) - w.rotation.y) * Math.min(1, dt * 4);
  const tip = $('#tip');
  if (hovered) {
    const w = hovered.userData.work;
    tip.innerHTML = `<b>${w.name}</b>${w.info}<br>${w.price} · voir →`;
    tip.style.left = `${mouse.px + 18}px`; tip.style.top = `${mouse.py + 18}px`; tip.style.opacity = 1;
    canvas.style.cursor = 'pointer';
  } else { tip.style.opacity = 0; canvas.style.cursor = ''; }

  // ================= caméra
  camera.position.copy(camPos);
  camera.up.copy(up);
  camera.lookAt(look);
  if (roll) camera.rotateZ(roll);

  // ================= DOM
  for (const t of timed) {
    let o = t.f === 0 ? (gp >= t.a && gp < t.b ? 1 : 0) : Math.min(range(gp, t.a, t.a + t.f), 1 - range(gp, t.b - t.f, t.b));
    if (cfg.interactive && t.el.closest('#config')) o = t.el.id === 'cfg-start' ? 0 : 1;
    if (cfg.created && t.el.closest('#config') && t.el.classList.contains('cfg-block')) o = 0;
    t.el.style.opacity = o;
    t.el.style.visibility = o > 0.001 ? 'visible' : 'hidden';
  }
  if (gp >= 77 && gp < 86) {
    const i = Math.min(7, Math.floor(P[7] * 8));
    $('#shot-n').textContent = String(i + 1).padStart(2, '0');
    $('#shot-t').textContent = SHOTS[i];
  }
  if (gp >= 86 && gp < 94.5) {
    const p = P[8];
    $('#atelier-t').textContent = p < 0.3 ? "Le tufting gun est posé sur l'établi. La caméra s'approche." : p < 0.55 ? 'Une autre main entre dans le cadre et le saisit.' : 'La main du participant, le pistolet, la toile.';
  }

  // HUD
  const si = Math.max(0, SCENES.findIndex((s) => gp < s.b));
  hud.scene.textContent = `${SCENES[si].id} — ${SCENES[si].name}`;
  hud.pct.textContent = `${gp.toFixed(1)} %  ·  p ${P[si].toFixed(2)}${cfg.interactive ? '  ·  CONFIG' : ''}`;
  hud.cursor.style.left = `${gp}%`;

  if ((gp >= 42.6 && gp < 77.3) || cfg.interactive) renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// Clic dans la galerie / sur les zones
canvas.addEventListener('click', () => {
  if (hovered) { toast(`→ zoom dans l'œuvre, puis fiche produit ${hovered.userData.work.url}`); return; }
  if (gp >= 67 && gp < 77) {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    const h = raycaster.intersectObjects(zoneMeshes, false)[0];
    if (h) { enterConfig(); cfg.zone = h.object.userData.zone; refreshCfg(); }
  }
});

requestAnimationFrame(frame);
