// art.ts - flat spot illustrations for the front page, one per story.
//
// No photographs exist in the sandbox, so each story gets a small drawn
// scene instead: bold silhouettes and two or three flat colours, in the
// spirit of a newspaper's spot art. Every scene is drawn inside the box
// it is given and paints its own backdrop first, so the layout in
// main.ts only has to place boxes.

import { Canvas, type Rgb } from './canvas.ts';

// Points along an ellipse arc, for globes, leaves and wave lines.
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, steps = 40): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

// A starburst for the explosion at the broken span.
function burst(cv: Canvas, cx: number, cy: number, r: number, color: Rgb) {
  const pts: number[][] = [];
  const spikes = 9;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  cv.polygon(pts, color);
}

// ---- The Kerch bridge, hit again -------------------------------------
function drawBridge(cv: Canvas, x: number, y: number, w: number, h: number) {
  const ink: Rgb = [38, 44, 52];
  cv.rect(x, y, w, h, [206, 219, 226]); // pale sky
  cv.rect(x, y, w, h * 0.3, [220, 230, 234]); // lighter band high in the sky
  cv.circle(x + w * 0.1, y + h * 0.16, h * 0.08, [240, 200, 90]); // low sun, clear of the smoke
  const seaY = y + h * 0.68;
  cv.rect(x, seaY, w, y + h - seaY, [43, 96, 110]); // the strait
  // wavelets
  cv.polyline(arc(x + w * 0.2, seaY + h * 0.12, w * 0.05, h * 0.02, Math.PI, Math.PI * 2), 2.5, [120, 170, 180]);
  cv.polyline(arc(x + w * 0.72, seaY + h * 0.18, w * 0.06, h * 0.02, Math.PI, Math.PI * 2), 2.5, [120, 170, 180]);
  cv.polyline(arc(x + w * 0.45, seaY + h * 0.24, w * 0.045, h * 0.018, Math.PI, Math.PI * 2), 2.2, [120, 170, 180]);
  cv.polyline(arc(x + w * 0.88, seaY + h * 0.1, w * 0.04, h * 0.018, Math.PI, Math.PI * 2), 2.2, [120, 170, 180]);

  const deckY = y + h * 0.52;
  // pylons
  cv.rect(x + w * 0.16, deckY - h * 0.3, w * 0.035, h * 0.3, ink);
  cv.rect(x + w * 0.78, deckY - h * 0.3, w * 0.035, h * 0.3, ink);
  // standing decks, left and right of the break
  cv.rect(x, deckY, w * 0.4, h * 0.05, ink);
  cv.rect(x + w * 0.66, deckY, w * 0.34, h * 0.05, ink);
  // cable stays fanning from each pylon top to its standing deck
  const stays: [number, number[]][] = [
    [x + w * 0.177, [-0.15, -0.05, 0.08, 0.18]],
    [x + w * 0.797, [-0.1, 0.06, 0.16]],
  ];
  for (const [px, offsets] of stays) {
    for (const dx of offsets) {
      cv.segment(px, deckY - h * 0.3, px + dx * w, deckY, 1.8, ink);
    }
  }
  // the fallen span, tilted into the water
  cv.polygon(
    [
      [x + w * 0.4, deckY + h * 0.02],
      [x + w * 0.64, deckY + h * 0.16],
      [x + w * 0.65, deckY + h * 0.21],
      [x + w * 0.41, deckY + h * 0.07],
    ],
    ink,
  );
  // foam where the span went in
  cv.polyline(arc(x + w * 0.52, seaY + h * 0.05, w * 0.09, h * 0.03, Math.PI, Math.PI * 2), 2.4, [225, 238, 240]);
  cv.polyline(arc(x + w * 0.6, seaY + h * 0.12, w * 0.05, h * 0.02, Math.PI, Math.PI * 2), 2, [225, 238, 240]);
  // the second day's incoming: one streak angling down at the break,
  // its head still bright above the burst
  cv.segment(x + w * 0.34, y + h * 0.08, x + w * 0.48, deckY - h * 0.12, 2, [250, 250, 248]);
  cv.circle(x + w * 0.485, deckY - h * 0.13, h * 0.022, [255, 255, 252]);
  // the strike itself, and smoke above it
  burst(cv, x + w * 0.52, deckY - h * 0.02, h * 0.15, [232, 116, 32]);
  burst(cv, x + w * 0.52, deckY - h * 0.02, h * 0.08, [248, 190, 60]);
  cv.circle(x + w * 0.47, deckY - h * 0.18, h * 0.07, [120, 124, 128]);
  cv.circle(x + w * 0.55, deckY - h * 0.26, h * 0.09, [140, 144, 148]);
  cv.circle(x + w * 0.44, deckY - h * 0.3, h * 0.055, [160, 164, 168]);
  cv.circle(x + w * 0.62, deckY - h * 0.33, h * 0.065, [152, 156, 160]);
  cv.circle(x + w * 0.68, deckY - h * 0.27, h * 0.045, [168, 172, 176]);
}

// ---- A tanker and a mine in the strait -------------------------------
function drawShip(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.rect(x, y, w, h, [214, 226, 230]);
  const seaY = y + h * 0.62;
  cv.rect(x, seaY, w, y + h - seaY, [16, 92, 104]);
  cv.polyline(arc(x + w * 0.24, seaY + h * 0.14, w * 0.07, h * 0.025, Math.PI, Math.PI * 2), 2.5, [110, 175, 185]);
  cv.polyline(arc(x + w * 0.6, seaY + h * 0.2, w * 0.08, h * 0.025, Math.PI, Math.PI * 2), 2.5, [110, 175, 185]);
  const hullY = y + h * 0.52;
  // hull
  cv.polygon(
    [
      [x + w * 0.06, hullY],
      [x + w * 0.86, hullY],
      [x + w * 0.78, hullY + h * 0.14],
      [x + w * 0.16, hullY + h * 0.14],
    ],
    [30, 32, 38],
  );
  cv.rect(x + w * 0.06, hullY - h * 0.035, w * 0.8, h * 0.035, [172, 32, 40]); // red boot-top
  // container stacks
  const cols: Rgb[] = [[46, 110, 170], [64, 148, 92], [216, 130, 40], [120, 124, 132], [46, 110, 170]];
  cols.forEach((c, i) => {
    cv.rect(x + w * (0.14 + i * 0.115), hullY - h * 0.16, w * 0.1, h * 0.125, c);
  });
  cols.slice(0, 3).forEach((c, i) => {
    cv.rect(x + w * (0.14 + i * 0.115), hullY - h * 0.27, w * 0.1, h * 0.1, c);
  });
  // bridge tower and funnel
  cv.rect(x + w * 0.74, hullY - h * 0.3, w * 0.09, h * 0.27, [238, 238, 240]);
  cv.rect(x + w * 0.755, hullY - h * 0.38, w * 0.035, h * 0.09, [30, 32, 38]);
  // smoke curling from the funnel
  cv.circle(x + w * 0.78, hullY - h * 0.44, h * 0.035, [150, 154, 158]);
  cv.circle(x + w * 0.82, hullY - h * 0.5, h * 0.05, [168, 172, 176]);
  cv.circle(x + w * 0.87, hullY - h * 0.55, h * 0.04, [184, 188, 192]);
  // portholes along the hull
  for (let i = 0; i < 5; i++) {
    cv.circle(x + w * (0.22 + i * 0.11), hullY + h * 0.07, h * 0.016, [200, 214, 218]);
  }
  // the wake at the stern
  cv.polyline(arc(x + w * 0.1, seaY + h * 0.22, w * 0.07, h * 0.02, Math.PI, Math.PI * 2), 2.2, [225, 238, 240]);
  // a second mine, smaller and farther off
  cv.circle(x + w * 0.3, seaY + h * 0.26, h * 0.032, [22, 24, 28]);
  cv.segment(x + w * 0.3 - h * 0.05, seaY + h * 0.26, x + w * 0.3 + h * 0.05, seaY + h * 0.26, 2, [22, 24, 28]);
  cv.segment(x + w * 0.3, seaY + h * 0.26 - h * 0.05, x + w * 0.3, seaY + h * 0.26 + h * 0.05, 2, [22, 24, 28]);
  // the mine, close in the foreground
  const mx = x + w * 0.84;
  const my = seaY + h * 0.16;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cv.segment(mx, my, mx + Math.cos(a) * h * 0.13, my + Math.sin(a) * h * 0.13, 3.5, [22, 24, 28]);
  }
  cv.circle(mx, my, h * 0.085, [22, 24, 28]);
  cv.circle(mx - h * 0.03, my - h * 0.03, h * 0.02, [90, 96, 104]);
}

// ---- A globe for the summit ------------------------------------------
function drawGlobe(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.rect(x, y, w, h, [222, 232, 240]);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) * 0.4;
  cv.circle(cx, cy, r, [52, 116, 178]);
  // light from the upper left, shade gathering lower right
  cv.disc(cx - r * 0.34, cy - r * 0.36, r * 0.52, [96, 152, 204]);
  cv.disc(cx + r * 0.42, cy + r * 0.44, r * 0.55, [40, 98, 156]);
  // continents, deliberately schematic
  cv.polygon(
    [
      [cx - r * 0.62, cy - r * 0.5],
      [cx - r * 0.3, cy - r * 0.66],
      [cx - r * 0.18, cy - r * 0.3],
      [cx - r * 0.34, cy + r * 0.05],
      [cx - r * 0.26, cy + r * 0.5],
      [cx - r * 0.48, cy + r * 0.42],
    ],
    [74, 150, 88],
  );
  cv.polygon(
    [
      [cx + r * 0.08, cy - r * 0.62],
      [cx + r * 0.55, cy - r * 0.55],
      [cx + r * 0.7, cy - r * 0.2],
      [cx + r * 0.4, cy + r * 0.02],
      [cx + r * 0.52, cy + r * 0.44],
      [cx + r * 0.2, cy + r * 0.3],
      [cx + r * 0.05, cy - r * 0.1],
    ],
    [74, 150, 88],
  );
  // graticule
  for (const f of [0.45, 0.8]) {
    cv.polyline(arc(cx, cy, r * f, r, 0, Math.PI * 2, 48), 1.6, [30, 84, 132]);
    cv.polyline(arc(cx, cy, r, r * f, 0, Math.PI * 2, 48), 1.6, [30, 84, 132]);
  }
  cv.ring(cx, cy, r, 2.4, [30, 84, 132]);
  // three summit pins
  for (const [px, py] of [
    [cx - r * 0.42, cy - r * 0.4],
    [cx + r * 0.38, cy - r * 0.34],
    [cx + r * 0.12, cy + r * 0.3],
  ]) {
    cv.polygon(
      [
        [px - r * 0.09, py - r * 0.1],
        [px + r * 0.09, py - r * 0.1],
        [px, py + r * 0.16],
      ],
      [196, 44, 52],
    );
    cv.circle(px, py - r * 0.1, r * 0.085, [196, 44, 52]);
    cv.circle(px, py - r * 0.1, r * 0.035, [245, 245, 245]);
  }
}

// ---- Sun and leaf for the climate talks -------------------------------
function drawLeaf(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.rect(x, y, w, h, [226, 238, 224]);
  // sun with rays, top right
  const sx = x + w * 0.76;
  const sy = y + h * 0.26;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cv.segment(
      sx + Math.cos(a) * h * 0.13,
      sy + Math.sin(a) * h * 0.13,
      sx + Math.cos(a) * h * 0.19,
      sy + Math.sin(a) * h * 0.19,
      3.5,
      [226, 164, 32],
    );
  }
  cv.circle(sx, sy, h * 0.105, [240, 186, 48]);
  // the leaf: two arcs meeting at tip and stem
  const leafPts: number[][] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    leafPts.push([x + w * (0.18 + 0.56 * t), y + h * (0.78 - 0.52 * t) - Math.sin(t * Math.PI) * h * 0.2]);
  }
  for (let i = 24; i >= 0; i--) {
    const t = i / 24;
    leafPts.push([x + w * (0.18 + 0.56 * t), y + h * (0.78 - 0.52 * t) + Math.sin(t * Math.PI) * h * 0.16]);
  }
  cv.polygon(leafPts, [52, 140, 74]);
  // its vein, and the side veins branching off it
  cv.segment(x + w * 0.2, y + h * 0.76, x + w * 0.72, y + h * 0.28, 3, [30, 96, 46]);
  for (const t of [0.3, 0.52, 0.74]) {
    const vx = x + w * (0.2 + 0.52 * t);
    const vy = y + h * (0.76 - 0.48 * t);
    cv.segment(vx, vy, vx - w * 0.1, vy - h * 0.09, 1.8, [30, 96, 46]);
    cv.segment(vx, vy, vx + w * 0.09, vy + h * 0.02, 1.8, [30, 96, 46]);
  }
  // a young sprout at its foot: two small leaves on a stem
  cv.segment(x + w * 0.82, y + h * 0.86, x + w * 0.82, y + h * 0.68, 2.6, [30, 96, 46]);
  cv.polygon(
    [
      [x + w * 0.82, y + h * 0.7],
      [x + w * 0.7, y + h * 0.62],
      [x + w * 0.78, y + h * 0.56],
      [x + w * 0.83, y + h * 0.64],
    ],
    [84, 168, 96],
  );
  cv.polygon(
    [
      [x + w * 0.82, y + h * 0.7],
      [x + w * 0.94, y + h * 0.62],
      [x + w * 0.86, y + h * 0.56],
      [x + w * 0.81, y + h * 0.64],
    ],
    [84, 168, 96],
  );
  // ground
  cv.rule(x + w * 0.08, y + h * 0.86, w * 0.84, 4, [90, 110, 84]);
}

// ---- The tower for the Paris marches ----------------------------------
function drawTower(cv: Canvas, x: number, y: number, w: number, h: number) {
  cv.rect(x, y, w, h, [228, 226, 234]);
  const ink: Rgb = [52, 50, 66];
  const cx = x + w * 0.5;
  const base = y + h * 0.78;
  const top = y + h * 0.08;
  // silhouette: two legs sweeping in to the spire
  cv.polygon(
    [
      [cx - w * 0.3, base],
      [cx - w * 0.1, y + h * 0.42],
      [cx - w * 0.045, top + h * 0.1],
      [cx - w * 0.012, top],
      [cx + w * 0.012, top],
      [cx + w * 0.045, top + h * 0.1],
      [cx + w * 0.1, y + h * 0.42],
      [cx + w * 0.3, base],
      [cx + w * 0.17, base],
      [cx + w * 0.07, y + h * 0.52],
      [cx - w * 0.07, y + h * 0.52],
      [cx - w * 0.17, base],
    ],
    ink,
  );
  // platforms cut back out in the sky colour
  cv.rect(cx - w * 0.13, y + h * 0.4, w * 0.26, h * 0.035, [228, 226, 234]);
  cv.rect(cx - w * 0.085, y + h * 0.24, w * 0.17, h * 0.03, [228, 226, 234]);
  // a tricolour flying from the spire
  cv.segment(cx, top, cx, top - h * 0.07, 2.2, ink);
  cv.rect(cx, top - h * 0.07, w * 0.055, h * 0.06, [0, 85, 164]);
  cv.rect(cx + w * 0.055, top - h * 0.07, w * 0.055, h * 0.06, [245, 245, 245]);
  cv.rect(cx + w * 0.11, top - h * 0.07, w * 0.055, h * 0.06, [239, 65, 70]);
  // the crowd: heads and placards along the boulevard
  const heads: Rgb[] = [[196, 44, 52], [52, 92, 150], [226, 164, 32], [70, 130, 84], [120, 90, 150]];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 9; i++) {
      const hx = x + w * (0.1 + i * 0.1) + (row ? w * 0.04 : 0);
      const hy = base + h * (0.07 + row * 0.09);
      cv.circle(hx, hy, h * 0.028, heads[(i + row * 3) % heads.length]);
    }
  }
  cv.rect(x + w * 0.16, base - h * 0.1, w * 0.13, h * 0.09, [245, 245, 245]);
  cv.segment(x + w * 0.225, base - h * 0.01, x + w * 0.225, base + h * 0.05, 2.5, ink);
  cv.rect(x + w * 0.42, base - h * 0.13, w * 0.13, h * 0.09, [245, 245, 245]);
  cv.segment(x + w * 0.485, base - h * 0.04, x + w * 0.485, base + h * 0.05, 2.5, ink);
  cv.rect(x + w * 0.68, base - h * 0.1, w * 0.13, h * 0.09, [245, 245, 245]);
  cv.segment(x + w * 0.745, base - h * 0.01, x + w * 0.745, base + h * 0.05, 2.5, ink);
  cv.rule(x + w * 0.05, base + h * 0.03, w * 0.9, 3, ink);
}

const SCENES: Record<string, (cv: Canvas, x: number, y: number, w: number, h: number) => void> = {
  bridge: drawBridge,
  ship: drawShip,
  globe: drawGlobe,
  leaf: drawLeaf,
  tower: drawTower,
};

export function drawArt(cv: Canvas, key: string, x: number, y: number, w: number, h: number) {
  const scene = SCENES[key];
  if (scene) scene(cv, x, y, w, h);
}
