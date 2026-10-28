// ============================================================================
// Marina Lehacaut Studio — Univers 3D Photoréaliste (Blender 5.2 Cycles + PBR) :
// - Environnement 360° rendu sous Blender 5.2 Cycles (`gallery_v13_env_2k.jpg`)
// - Sol en Parquet Chêne Point de Hongrie + Travertin Romain + Bronze raytracé
//   sous Blender 5.2 Cycles (`gallery_floor_baked.jpg` + `parquet_nor/rough.jpg`)
// - Vraies textures PBR CC0 Poly Haven (`wool_diff/nor/rough`, `stone_diff/nor/rough`,
//   `plaster_diff/nor/rough`)
// - Tapisseries 3D rendues sous Blender 5.2 Cycles (`arcade_v13_albedo.jpg`,
//   `rug_cubix_albedo.jpg`, `rug_vortex_albedo.jpg`, `rug_strates_albedo.jpg`,
//   `rug_delta_albedo.jpg` + cartes de normales 3D)
// ============================================================================

import * as THREE from './vendor/three.module.min.js';

export const WOOL = {
  corail:   '#C84B39', // Corail terracotta signature
  marine:   '#1B2A44', // Bleu nuit profond
  ocre:     '#B88635', // Ocre doré / safran
  rose:     '#D49B94', // Vieux rose poudré
  ecru:     '#EAE0D0', // Écru laine naturelle
  orange:   '#D66B32', // Ambre brûlé
  sauge:    '#7A9376', // Vert sauge doux
  cobalt:   '#2C5AA0', // Bleu cobalt vif
  framboise:'#9E2B42', // Framboise profond
  encre:    '#1E1C1A', // Encre charbon
};

export const WOOL_LABELS = {
  corail: 'Corail Terracotta',
  marine: 'Bleu Nuit',
  ocre: 'Ocre Doré',
  rose: 'Rose Poudré',
  ecru: 'Écru Naturel',
  orange: 'Ambre Brûlé',
  sauge: 'Vert Sauge',
  cobalt: 'Bleu Cobalt',
  framboise: 'Framboise',
  encre: 'Encre',
};

const texLoader = new THREE.TextureLoader();

function loadPBRTex(url, { srgb = false, repeatX = 1, repeatY = 1, anisotropy = 8 } = {}) {
  const t = texLoader.load(url);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeatX !== 1 || repeatY !== 1) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
  } else {
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  }
  t.anisotropy = anisotropy;
  return t;
}

// Normalise les coordonnées UV planaires d'une géométrie ExtrudeGeometry dans [0..1]
export function normalizePlanarUVs(geo, xMin = -1.0, xMax = 1.0, yMin = -1.18, yMax = 1.18) {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  if (!pos || !uv) return geo;
  const dx = Math.max(0.0001, xMax - xMin);
  const dy = Math.max(0.0001, yMax - yMin);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv.setXY(i, (x - xMin) / dx, (y - yMin) / dy);
  }
  uv.needsUpdate = true;
  return geo;
}

// ----------------------------------------------------------------------------
// Environnement HDRI 360° rendu dans Blender 5.2 Cycles (`gallery_v13_env_2k.jpg`)
// ----------------------------------------------------------------------------
export function createMuseumEnvMap(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#E8DEC8');
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(40, 24, 12),
    new THREE.MeshBasicMaterial({ color: '#FFFDF8', side: THREE.BackSide })
  );
  sky.position.y = 14;
  envScene.add(sky);
  const fallbackEnv = pmrem.fromScene(envScene, 0.04).texture;

  texLoader.load('media/textures/gallery_v13_env_2k.jpg?v=7', (equirectTex) => {
    equirectTex.mapping = THREE.EquirectangularReflectionMapping;
    equirectTex.colorSpace = THREE.SRGBColorSpace;
    const envMap = pmrem.fromEquirectangular(equirectTex).texture;
    if (scene) scene.environment = envMap;
    pmrem.dispose();
  });

  return fallbackEnv;
}

// ----------------------------------------------------------------------------
// Chargement des vraies textures PBR de laine bouclée (Poly Haven `curly_teddy_natural`)
// ----------------------------------------------------------------------------
export function createWoolTextures() {
  const diffTex = loadPBRTex('media/textures/wool_diff.jpg?v=7', { srgb: true, repeatX: 3.5, repeatY: 3.5 });
  const bumpTex = loadPBRTex('media/textures/wool_nor.jpg?v=7', { srgb: false, repeatX: 3.5, repeatY: 3.5 });
  const roughTex = loadPBRTex('media/textures/wool_rough.jpg?v=7', { srgb: false, repeatX: 3.5, repeatY: 3.5 });
  return { diffTex, bumpTex, roughTex };
}

export function createPlasterTexture() {
  return loadPBRTex('media/textures/plaster_nor.jpg?v=7', { srgb: false, repeatX: 3, repeatY: 3 });
}

// Texture d'ombre de contact radiale douce au sol
function createSoftShadowTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 12, 128, 128, 122);
  grad.addColorStop(0, 'rgba(32, 22, 12, 0.42)');
  grad.addColorStop(0.55, 'rgba(32, 22, 12, 0.16)');
  grad.addColorStop(1, 'rgba(32, 22, 12, 0.0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// ----------------------------------------------------------------------------
// Utilitaires de formes géométriques 2D
// ----------------------------------------------------------------------------
function rectShape(x0, y0, x1, y1) {
  const s = new THREE.Shape();
  s.moveTo(x0, y0);
  s.lineTo(x1, y0);
  s.lineTo(x1, y1);
  s.lineTo(x0, y1);
  s.closePath();
  return s;
}

function frameShape(x0, y0, x1, y1, ix0, iy0, ix1, iy1) {
  const s = rectShape(x0, y0, x1, y1);
  const h = new THREE.Path();
  h.moveTo(ix0, iy0);
  h.lineTo(ix1, iy0);
  h.lineTo(ix1, iy1);
  h.lineTo(ix0, iy1);
  h.closePath();
  s.holes.push(h);
  return s;
}

function circleShape(cx, cy, r, a0 = 0, a1 = Math.PI * 2) {
  const s = new THREE.Shape();
  if (Math.abs(a1 - a0) < Math.PI * 2 - 0.001) {
    s.moveTo(cx, cy);
    s.absarc(cx, cy, r, a0, a1, false);
    s.closePath();
  } else {
    s.absarc(cx, cy, r, 0, Math.PI * 2, false);
  }
  return s;
}

function ringArcShape(cx, cy, rIn, rOut, a0, a1) {
  const s = new THREE.Shape();
  s.absarc(cx, cy, rOut, a0, a1, false);
  s.absarc(cx, cy, rIn, a1, a0, true);
  s.closePath();
  return s;
}

function archBandShape(cx, yBottom, ySpring, rIn, rOut) {
  const s = new THREE.Shape();
  s.moveTo(cx - rOut, yBottom);
  s.lineTo(cx - rOut, ySpring);
  s.absarc(cx, ySpring, rOut, Math.PI, 0, true);
  s.lineTo(cx + rOut, yBottom);
  s.lineTo(cx + rIn, yBottom);
  s.lineTo(cx + rIn, ySpring);
  s.absarc(cx, ySpring, rIn, 0, Math.PI, false);
  s.lineTo(cx - rIn, yBottom);
  s.closePath();
  return s;
}

function archSolidShape(cx, yBottom, ySpring, r) {
  const s = new THREE.Shape();
  s.moveTo(cx - r, yBottom);
  s.lineTo(cx + r, yBottom);
  s.lineTo(cx + r, ySpring);
  s.absarc(cx, ySpring, r, 0, Math.PI, false);
  s.lineTo(cx - r, yBottom);
  s.closePath();
  return s;
}

function polyShape(pts) {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}

// ============================================================================
// Définition officielle des 6 zones d'ARCADE Nº01 (d'après V13)
// ============================================================================
export function createArcadeZones() {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  return [
    {
      key: 'A',
      name: 'Cadre & Structure',
      color: WOOL.marine,
      demo: WOOL.encre,
      mono: '#D6CEC0',
      z: 0,
      form: 1,
      depth: 0.11,
      explode: V(0, 0, -1.8),
      rot: V(0.05, 0.14, -0.02),
      shapes: [
        frameShape(-1.0, -1.18, 1.0, 1.18, -0.92, -1.10, 0.92, 1.10),
        archBandShape(-0.43, -0.04, 0.48, 0.17, 0.28),
        archBandShape(0.18, 0.02, 0.56, 0.16, 0.25),
        archSolidShape(0.47, -0.64, -0.14, 0.14),
        ringArcShape(-0.02, -0.36, 0.42, 0.51, Math.PI * 0.72, Math.PI * 2.02),
        circleShape(-0.02, -0.36, 0.17, Math.PI * 1.5, Math.PI * 2.0),
      ],
    },
    {
      key: 'B',
      name: 'Arches Corail',
      color: WOOL.corail,
      demo: WOOL.framboise,
      mono: '#DFD7C9',
      z: 1,
      form: 1,
      depth: 0.135,
      explode: V(-1.65, 0.38, 0.95),
      rot: V(0.11, -0.22, 0.05),
      shapes: [
        archBandShape(-0.43, -0.04, 0.48, 0.28, 0.42),
        archBandShape(0.24, 0.14, 0.56, 0.34, 0.54),
        polyShape([
          [0.02, 0.56], [0.18, 0.56], [0.22, -0.16],
          [0.10, -0.34], [-0.02, -0.36], [-0.02, -0.18], [0.04, -0.06],
        ]),
        archSolidShape(0.09, 0.36, 0.55, 0.10),
        ringArcShape(-0.02, -0.36, 0.26, 0.41, Math.PI * 0.78, Math.PI * 1.5),
        ringArcShape(0.45, -1.03, 0.24, 0.38, 0, Math.PI * 0.52),
      ],
    },
    {
      key: 'C',
      name: 'Arches Rose Poudré',
      color: WOOL.rose,
      demo: WOOL.sauge,
      mono: '#E9E1D4',
      z: 2,
      form: 2,
      depth: 0.12,
      explode: V(1.55, 0.55, 1.55),
      rot: V(-0.10, 0.26, -0.06),
      shapes: [
        frameShape(-0.92, -1.10, 0.92, 1.10, -0.85, -1.03, 0.85, 1.03),
        archBandShape(-0.43, -0.04, 0.48, 0.09, 0.17),
        archBandShape(0.14, -0.02, 0.56, 0.10, 0.20),
        archBandShape(0.47, -0.64, -0.12, 0.14, 0.29),
        polyShape([[-0.85, -0.04], [-0.16, -0.04], [-0.52, -0.34]]),
        rectShape(-0.85, -1.03, -0.02, -0.62),
        circleShape(-0.02, -0.27, 0.16, Math.PI * 0.55, Math.PI * 1.48),
      ],
    },
    {
      key: 'D',
      name: 'Lumière Écru',
      color: WOOL.ecru,
      demo: WOOL.ecru,
      mono: '#F1EAE0',
      z: 3,
      form: 2,
      depth: 0.105,
      explode: V(-1.05, -1.15, 1.95),
      rot: V(0.14, 0.18, -0.07),
      shapes: [
        archSolidShape(-0.43, -0.04, 0.30, 0.09),
        rectShape(-0.02, 0.62, 0.16, 1.03),
        archBandShape(0.21, 0.10, 0.56, 0.25, 0.34),
        ringArcShape(-0.02, -0.36, 0.17, 0.26, Math.PI * 0.95, Math.PI * 1.98),
        polyShape([[0.16, -0.36], [0.33, -0.36], [0.33, 0.02], [0.20, 0.02]]),
        archSolidShape(0.51, -1.03, -0.68, 0.08),
      ],
    },
    {
      key: 'E',
      name: 'Soleils & Ocre Or',
      color: WOOL.ocre,
      demo: WOOL.cobalt,
      mono: '#DDD3C2',
      z: 4,
      form: 2,
      depth: 0.15,
      explode: V(0.38, 1.65, 2.45),
      rot: V(0.20, -0.14, 0.09),
      shapes: [
        polyShape([[-0.02, 0.68], [0.24, 1.03], [-0.02, 1.03]]),
        circleShape(0.08, 0.38, 0.135, -Math.PI * 0.5, Math.PI * 0.5),
        rectShape(-0.02, -0.26, 0.16, 0.02),
        rectShape(-0.02, -1.03, 0.43, -0.78),
        rectShape(0.68, -0.78, 0.85, -0.46),
        polyShape([[-0.85, 0.62], [-0.85, 1.03], [-0.46, 1.03]]),
      ],
    },
    {
      key: 'F',
      name: 'Accents Ambre',
      color: WOOL.orange,
      demo: WOOL.corail,
      mono: '#D4C9B8',
      z: 5,
      form: 2,
      depth: 0.145,
      explode: V(1.15, -1.45, 1.25),
      rot: V(-0.18, 0.10, 0.12),
      shapes: [
        circleShape(-0.43, 0.50, 0.075),
        circleShape(0.08, 0.38, 0.135, Math.PI * 0.5, Math.PI * 1.5),
        polyShape([[-0.85, -0.62], [-0.85, -0.04], [-0.52, -0.34]]),
        rectShape(-0.26, -0.34, -0.02, -0.04),
        rectShape(0.68, 0.10, 0.85, 0.66),
        ringArcShape(-0.02, -0.36, 0.34, 0.42, Math.PI * 1.5, Math.PI * 2.0),
      ],
    },
  ];
}

// Crée la plaque photographique haute-définition d'ARCADE Nº01 extraite de V13
export function createArcadePhotoMesh(width, height) {
  const albedo = loadPBRTex('media/textures/arcade_v13_albedo.jpg?v=7', { srgb: true });
  const nor = loadPBRTex('media/textures/arcade_v13_nor.jpg?v=7', { srgb: false });
  const bump = loadPBRTex('media/textures/arcade_v13_bump.jpg?v=7', { srgb: false });
  const rough = loadPBRTex('media/textures/wool_rough.jpg?v=7', { srgb: false, repeatX: 4, repeatY: 5 });

  const hw = width * 0.5;
  const hh = height * 0.5;
  const sh = rectShape(-hw, -hh, hw, hh);
  const geo = new THREE.ExtrudeGeometry(sh, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.025,
    bevelSegments: 4,
  });
  normalizePlanarUVs(geo, -hw - 0.025, hw + 0.025, -hh - 0.025, hh + 0.025);

  const mat = new THREE.MeshPhysicalMaterial({
    map: albedo,
    normalMap: nor,
    normalScale: new THREE.Vector2(1.4, 1.4),
    bumpMap: bump,
    bumpScale: 0.08,
    roughnessMap: rough,
    roughness: 0.85,
    metalness: 0.0,
    sheen: 0.68,
    sheenRoughness: 0.70,
    sheenColor: new THREE.Color('#FFF7EA'),
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.z = 0.08;
  return mesh;
}

export function renderArcadeSVG(svgEl, zones) {
  if (!svgEl) return;
  svgEl.setAttribute('viewBox', '-1.05 -1.23 2.1 2.46');
  const paths = [];
  paths.push(`<rect x="-1" y="-1.18" width="2" height="2.36" rx="0.02" fill="#1B2A44"/>`);
  for (const z of zones) {
    const col = z.user || z.color;
    for (const sh of z.shapes) {
      const pts = sh.getPoints(36);
      if (!pts.length) continue;
      let d = `M ${pts[0].x.toFixed(3)} ${(-pts[0].y).toFixed(3)} `;
      for (let i = 1; i < pts.length; i++) {
        d += `L ${pts[i].x.toFixed(3)} ${(-pts[i].y).toFixed(3)} `;
      }
      d += 'Z';
      if (sh.holes && sh.holes.length) {
        for (const h of sh.holes) {
          const hpts = h.getPoints(36);
          if (!hpts.length) continue;
          d += ` M ${hpts[0].x.toFixed(3)} ${(-hpts[0].y).toFixed(3)} `;
          for (let i = 1; i < hpts.length; i++) {
            d += `L ${hpts[i].x.toFixed(3)} ${(-hpts[i].y).toFixed(3)} `;
          }
          d += 'Z';
        }
      }
      paths.push(`<path d="${d}" fill="${col}" fill-rule="evenodd" stroke="rgba(20,16,14,0.14)" stroke-width="0.008"/>`);
    }
  }
  svgEl.innerHTML = paths.join('\n');
}

// ============================================================================
// Construction du Grand Musée Haussmann / Travertin / Parquet Chêne (Scène 06 & 07)
// - Zéro mur ou arche dans l'allée centrale (X in [-6.5, +6.5]) : vue 100 % dégagée
// - Sol en Parquet Point de Hongrie doré + Travertin + Bronze cuit sous Cycles
// - Dôme Panoramique 360° Classique (`gallery_v13_env_2k.jpg`) visible à 360°
// ============================================================================
export function buildIvoryGallery({ scene, galerie, G, woolMat, plasterTex, arcade, ARC_SIZE }) {
  const shadowTex = createSoftShadowTexture();

  // Chargement des textures PBR Poly Haven + Rendus Cycles
  const floorBakedTex = loadPBRTex('media/textures/gallery_floor_baked.jpg?v=7', { srgb: true });
  const parquetNorTex = loadPBRTex('media/textures/parquet_nor.jpg?v=7', { srgb: false, repeatX: 6, repeatY: 14 });
  const parquetRoughTex = loadPBRTex('media/textures/parquet_rough.jpg?v=7', { srgb: false, repeatX: 6, repeatY: 14 });

  const stoneDiffTex = loadPBRTex('media/textures/stone_diff.jpg?v=7', { srgb: true, repeatX: 2, repeatY: 3 });
  const stoneNorTex = loadPBRTex('media/textures/stone_nor.jpg?v=7', { srgb: false, repeatX: 2, repeatY: 3 });
  const stoneRoughTex = loadPBRTex('media/textures/stone_rough.jpg?v=7', { srgb: false, repeatX: 2, repeatY: 3 });

  const envDomeTex = loadPBRTex('media/textures/gallery_v13_env_2k.jpg?v=7', { srgb: true });

  // 0. Dôme Panoramique 360° Classique Blender Cycles (Plafond mouluré, verrières & colonnade)
  const envDome = new THREE.Mesh(
    new THREE.SphereGeometry(95, 64, 32),
    new THREE.MeshBasicMaterial({ map: envDomeTex, side: THREE.BackSide, fog: false })
  );
  envDome.position.copy(G(0, 2.2, -18));
  envDome.rotation.y = Math.PI * 0.5;
  galerie.add(envDome);

  // Matériaux architecturaux nobles à fort contraste
  const travertineStoneMat = new THREE.MeshStandardMaterial({
    color: '#E8D6BC',
    map: stoneDiffTex,
    normalMap: stoneNorTex,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughnessMap: stoneRoughTex,
    roughness: 0.52,
    metalness: 0.04,
  });

  const darkWalnutMat = new THREE.MeshStandardMaterial({
    color: '#2A1E17',
    roughness: 0.42,
    metalness: 0.15,
  });

  const architecturalBronzeMat = new THREE.MeshStandardMaterial({
    color: '#8C6D46',
    roughness: 0.28,
    metalness: 0.82,
  });

  const floorY = -3.35;

  function addFloorContactShadow(x, z, rx = 2.6, rz = 1.8, opacity = 0.52) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(rx * 2, rz * 2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.copy(G(x, floorY + 0.015, z));
    galerie.add(m);
    return m;
  }

  // 1. Sol Monumental en Parquet Chêne Point de Hongrie & Travertin Romain (`gallery_floor_baked.jpg`)
  const floorGeo = new THREE.PlaneGeometry(32, 68);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorBakedTex,
    color: '#FFFFFF',
    normalMap: parquetNorTex,
    normalScale: new THREE.Vector2(0.32, 0.32),
    roughnessMap: parquetRoughTex,
    roughness: 0.32,
    metalness: 0.05,
    envMapIntensity: 1.35,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.copy(G(0, floorY, -18));
  floor.receiveShadow = true;
  galerie.add(floor);

  // Baguettes d'incrustation en bronze architectural le long du parquet (X = ±7.5m)
  for (const sx of [-7.5, 7.5]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 68), architecturalBronzeMat);
    strip.position.copy(G(sx, floorY + 0.01, -18));
    galerie.add(strip);
  }

  // 2. Colonnade Périmétrique en Travertin Romain (X = ±8.8m — laisse 17.6m d'espace central 100 % libre !)
  for (let i = 0; i < 8; i++) {
    const zCol = 10 - i * 8.0;

    for (const side of [-1, 1]) {
      const xCol = side * 8.8;
      const colGroup = new THREE.Group();

      // Fût de pilier en pierre de travertin veinée
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.35, 9.2, 1.85), travertineStoneMat);
      shaft.position.y = floorY + 4.6;
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      colGroup.add(shaft);

      // Socle en bronze sombre & pierre
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.45, 2.15), darkWalnutMat);
      base.position.y = floorY + 0.225;
      colGroup.add(base);

      const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(1.70, 0.06, 2.20), architecturalBronzeMat);
      baseTrim.position.y = floorY + 0.46;
      colGroup.add(baseTrim);

      // Chapiteau mouluré
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.42, 2.18), travertineStoneMat);
      cap.position.y = floorY + 9.1;
      colGroup.add(cap);

      colGroup.position.copy(G(xCol, 0, zCol));
      galerie.add(colGroup);
      addFloorContactShadow(xCol, zCol, 1.6, 1.8, 0.42);
    }

    // Arche transversale haute (Y = +5.8m au-dessus de la nef, jamais devant la caméra)
    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(18.8, 0.55, 0.95), travertineStoneMat);
    archBeam.position.copy(G(0, floorY + 9.35, zCol));
    galerie.add(archBeam);

    const bronzeBeamTrim = new THREE.Mesh(new THREE.BoxGeometry(18.85, 0.06, 1.0), architecturalBronzeMat);
    bronzeBeamTrim.position.copy(G(0, floorY + 9.05, zCol));
    galerie.add(bronzeBeamTrim);
  }

  // 3. Podium Circulaire du Sanctuaire sous ARCADE Nº01 (à Z = -40.0)
  const sanctPlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.6, 0.36, 48),
    travertineStoneMat
  );
  sanctPlinth.position.copy(G(0, floorY + 0.18, -40.0));
  sanctPlinth.receiveShadow = true;
  galerie.add(sanctPlinth);

  const sanctBronzeRing = new THREE.Mesh(
    new THREE.CylinderGeometry(3.46, 3.46, 0.05, 48),
    architecturalBronzeMat
  );
  sanctBronzeRing.position.copy(G(0, floorY + 0.36, -40.0));
  galerie.add(sanctBronzeRing);
  addFloorContactShadow(0, -40.0, 4.2, 3.2, 0.55);

  // ==========================================================================
  // 4. LES ŒUVRES DE LA GALERIE (Rendus Photoréalistes Blender 5.2 Cycles)
  // Suspendues dans des cadres muséaux en Noyer & Bronze au-dessus de socles
  // en Travertin Romain — AUCUN mur derrière qui puisse boucher la vue !
  // ==========================================================================
  function createCyclesTapestryWork(data, texPrefix, x, y, z, ry, w, h) {
    const g = new THREE.Group();
    g.position.copy(G(x, y, z));
    g.rotation.y = ry;
    g.userData.work = data;
    g.userData.ry = ry;
    g.userData.baseY = g.position.y;

    const albedo = loadPBRTex(`media/textures/rug_${texPrefix}_albedo.jpg?v=7`, { srgb: true });
    const nor = loadPBRTex(`media/textures/rug_${texPrefix}_nor.jpg?v=7`, { srgb: false });
    const rough = loadPBRTex('media/textures/wool_rough.jpg?v=7', { srgb: false, repeatX: 4, repeatY: 4 });

    // Tapisserie 3D biseautée avec texture raytracée Blender Cycles
    const hw = w * 0.5;
    const hh = h * 0.5;
    const rugSh = rectShape(-hw, -hh, hw, hh);
    const rugGeo = new THREE.ExtrudeGeometry(rugSh, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.032,
      bevelSize: 0.024,
      bevelSegments: 4,
    });
    normalizePlanarUVs(rugGeo, -hw - 0.024, hw + 0.024, -hh - 0.024, hh + 0.024);

    const rugMat = new THREE.MeshPhysicalMaterial({
      map: albedo,
      normalMap: nor,
      normalScale: new THREE.Vector2(1.45, 1.45),
      roughnessMap: rough,
      roughness: 0.84,
      metalness: 0.0,
      sheen: 0.68,
      sheenRoughness: 0.70,
      sheenColor: new THREE.Color('#FFF7EA'),
    });

    const rugMesh = new THREE.Mesh(rugGeo, rugMat);
    rugMesh.castShadow = true;
    rugMesh.receiveShadow = true;
    g.add(rugMesh);

    // Châssis muséal en noyer sombre et filet de bronze brossé (sans paroi opaque !)
    const frameBox = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, h + 0.14, 0.09), darkWalnutMat);
    frameBox.position.z = -0.04;
    frameBox.castShadow = true;
    g.add(frameBox);

    const bronzeRim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.20, h + 0.20, 0.05), architecturalBronzeMat);
    bronzeRim.position.z = -0.06;
    g.add(bronzeRim);

    // Câbles de suspension muséaux en bronze montant vers les poutres
    for (const cx of [-w * 0.36, w * 0.36]) {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 6.5, 8), architecturalBronzeMat);
      cable.position.set(cx, h * 0.5 + 3.25, -0.04);
      g.add(cable);
    }

    // Socle muséal bas en pierre de travertin veinée au sol sous l'œuvre
    const plinthY = (floorY - y) + 0.28;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.65, 0.56, 1.25), travertineStoneMat);
    plinth.position.set(0, plinthY, 0.0);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    g.add(plinth);

    const plinthBronze = new THREE.Mesh(new THREE.BoxGeometry(w + 0.70, 0.04, 1.30), architecturalBronzeMat);
    plinthBronze.position.set(0, plinthY + 0.28, 0.0);
    g.add(plinthBronze);

    addFloorContactShadow(x, z, (w + 0.8) * 0.65, 1.35, 0.52);
    galerie.add(g);
    return g;
  }

  // --------------------------------------------------------------------------
  // PIÈCE D'ENTRÉE V13 : ARCADE Nº01 (Flottant à G(0, 0, 0) au début de Scène 06)
  // --------------------------------------------------------------------------
  const arcadeEntrance = new THREE.Group();
  arcadeEntrance.position.copy(G(0, 0.1, 0));
  arcadeEntrance.userData.work = arcade.userData.work;
  arcadeEntrance.userData.ry = 0;
  arcadeEntrance.userData.baseY = G(0, 0.1, 0).y;

  const entrancePlate = createArcadePhotoMesh(2.0 * ARC_SIZE, 2.36 * ARC_SIZE);
  arcadeEntrance.add(entrancePlate);
  const entranceBack = new THREE.Mesh(
    new THREE.BoxGeometry(2.0 * ARC_SIZE + 0.12, 2.36 * ARC_SIZE + 0.12, 0.06),
    darkWalnutMat
  );
  entranceBack.position.z = 0.02;
  arcadeEntrance.add(entranceBack);
  galerie.add(arcadeEntrance);
  addFloorContactShadow(0, 0, 2.6, 1.7, 0.42);

  // --------------------------------------------------------------------------
  // ŒUVRE 2 : CUBIX Nº04 (Baie Gauche 1, X = -4.2, Z = -9.5)
  // --------------------------------------------------------------------------
  const cubix = createCyclesTapestryWork(
    {
      id: 'cubix',
      name: 'CUBIX Nº04',
      info: 'Pièce unique · 70 × 70 cm · Laine de Nouvelle-Zélande',
      price: '1 900 €',
      dims: '70 × 70 cm',
      url: '#oeuvres/cubix',
      desc: 'Jeu architectural de volumes orthogonaux et d’arches tuftés à la main en trois hauteurs de mèches (bouclé bas, coupé ras et velours ciselé aux ciseaux).',
      palette: [WOOL.marine, WOOL.corail, WOOL.ocre, WOOL.ecru, WOOL.rose],
    },
    'cubix',
    -4.2, 0.20, -9.5, 0.32, 3.65, 3.65
  );

  // --------------------------------------------------------------------------
  // ŒUVRE 3 : VORTEX Nº02 (Baie Droite 2, X = +4.2, Z = -17.5)
  // --------------------------------------------------------------------------
  const vortex = createCyclesTapestryWork(
    {
      id: 'vortex',
      name: 'VORTEX Nº02',
      info: 'Édition personnalisable · dès 51 × 51 cm',
      price: 'dès 890 €',
      dims: '51 × 51 cm · 70 × 70 cm · 90 × 90 cm',
      url: '#oeuvres/vortex',
      desc: 'Spirale hypnotique de sillons biseautés aux ciseaux et à la tondeuse, capturant la lumière rasante sur cinq nuances de laine de Nouvelle-Zélande.',
      palette: [WOOL.corail, WOOL.orange, WOOL.ocre, WOOL.ecru, WOOL.marine],
    },
    'vortex',
    4.2, 0.20, -17.5, -0.32, 3.65, 3.65
  );

  // --------------------------------------------------------------------------
  // ŒUVRE 4 : STRATES Nº01 (Baie Gauche 3, X = -4.2, Z = -25.5)
  // --------------------------------------------------------------------------
  const strates = createCyclesTapestryWork(
    {
      id: 'strates',
      name: 'STRATES Nº01',
      info: 'Pièce unique · 90 × 60 cm · Tapisserie murale ou sol',
      price: '2 100 €',
      dims: '90 × 60 cm',
      url: '#oeuvres/strates',
      desc: 'Paysage minéral composé de sept strates verticales et d’arches solaires aux hauteurs de velours contrastées, du bouclé serré au poil long sculpté.',
      palette: [WOOL.ecru, WOOL.sauge, WOOL.ocre, WOOL.corail, WOOL.marine],
    },
    'strates',
    -4.2, 0.32, -25.5, 0.30, 3.15, 4.20
  );

  // --------------------------------------------------------------------------
  // ŒUVRE 5 : DELTA Nº03 (Baie Droite 4, X = +4.2, Z = -32.5)
  // --------------------------------------------------------------------------
  const delta = createCyclesTapestryWork(
    {
      id: 'delta',
      name: 'DELTA Nº03',
      info: 'Édition personnalisable · 70 × 70 cm',
      price: 'dès 1 190 €',
      dims: '70 × 70 cm',
      url: '#oeuvres/delta',
      desc: 'Dialogue géométrique entre arches biseautées et disques solaires, inspiré de l’architecture moderniste méditerranéenne.',
      palette: [WOOL.ocre, WOOL.corail, WOOL.marine, WOOL.ecru, WOOL.rose],
    },
    'delta',
    4.2, 0.20, -32.5, -0.30, 3.65, 3.65
  );

  return {
    works: [arcade, arcadeEntrance, cubix, vortex, strates, delta],
    arcadeEntrance,
  };
}

// ============================================================================
// Particules de fibres de laine & poussière dorée flottantes dans les rayons
// ============================================================================
export function createFloatingFibers(scene, C) {
  const count = 95;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);

  const palette = [
    new THREE.Color(WOOL.corail),
    new THREE.Color(WOOL.ocre),
    new THREE.Color(WOOL.rose),
    new THREE.Color('#FFF8E7'),
    new THREE.Color(WOOL.marine),
  ];

  for (let i = 0; i < count; i++) {
    pos[i * 3] = C.x + (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = C.y + (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = C.z - Math.random() * 48 + 6;

    const c = palette[i % palette.length];
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;

    seeds[i * 3] = pos[i * 3];
    seeds[i * 3 + 1] = pos[i * 3 + 1];
    seeds[i * 3 + 2] = pos[i * 3 + 2];
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.07,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  return {
    points,
    update(time, mouse, gp) {
      const visible = gp >= 54.5 && gp < 77.2;
      points.visible = visible;
      if (!visible) return;
      const arr = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        arr[ix] = seeds[ix] + Math.sin(time * 0.55 + i) * 0.28 + mouse.sx * 0.55;
        arr[ix + 1] = seeds[ix + 1] + Math.cos(time * 0.45 + i * 1.3) * 0.28 + mouse.sy * 0.40;
        arr[ix + 2] = seeds[ix + 2] + Math.sin(time * 0.35 + i * 0.7) * 0.18;
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}
