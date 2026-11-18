// canvas.ts - a tiny software rasteriser: an RGB framebuffer, flat
// shapes with anti-aliased edges, and text drawn from the stroke font.
//
// Everything the page needs is here: filled rectangles and polygons for
// panels and silhouettes, discs and thick segments for lines and letter
// strokes, and circles for suns, globes and mines. All colour mixing is
// plain alpha blending over the pixel already on the page, so draw
// order is the only rule an artist has to keep.

import { glyphFor } from './font.ts';

export type Rgb = [number, number, number];

export class Canvas {
  readonly w: number;
  readonly h: number;
  readonly px: Uint8Array;

  constructor(w: number, h: number, bg: Rgb) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      this.px[i * 3] = bg[0];
      this.px[i * 3 + 1] = bg[1];
      this.px[i * 3 + 2] = bg[2];
    }
  }

  // Alpha-blend one pixel; coordinates outside the page are ignored.
  blend(x: number, y: number, color: Rgb, alpha: number) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || alpha <= 0) return;
    const i = (y * this.w + x) * 3;
    const a = alpha >= 1 ? 1 : alpha;
    this.px[i] = Math.round(this.px[i] * (1 - a) + color[0] * a);
    this.px[i + 1] = Math.round(this.px[i + 1] * (1 - a) + color[1] * a);
    this.px[i + 2] = Math.round(this.px[i + 2] * (1 - a) + color[2] * a);
  }

  // A filled disc with a one-pixel feathered edge - the stamp every
  // stroke and curve below is built from.
  disc(cx: number, cy: number, r: number, color: Rgb) {
    const x0 = Math.floor(cx - r - 1);
    const x1 = Math.ceil(cx + r + 1);
    const y0 = Math.floor(cy - r - 1);
    const y1 = Math.ceil(cy + r + 1);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        const alpha = Math.min(1, Math.max(0, r + 0.5 - d));
        if (alpha > 0) this.blend(x, y, color, alpha);
      }
    }
  }

  // A straight stroke of the given thickness with round caps, drawn as
  // a chain of overlapping discs spaced well under the radius apart.
  segment(x1: number, y1: number, x2: number, y2: number, thickness: number, color: Rgb) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const step = Math.max(0.5, thickness * 0.3);
    const n = Math.max(1, Math.ceil(len / step));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      this.disc(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, thickness / 2, color);
    }
  }

  polyline(points: number[][], thickness: number, color: Rgb) {
    if (points.length === 1) {
      this.disc(points[0][0], points[0][1], thickness * 0.75, color);
      return;
    }
    for (let i = 0; i + 1 < points.length; i++) {
      this.segment(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], thickness, color);
    }
  }

  rect(x: number, y: number, w: number, h: number, color: Rgb) {
    const x0 = Math.max(0, Math.round(x));
    const y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(this.w, Math.round(x + w));
    const y1 = Math.min(this.h, Math.round(y + h));
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const i = (yy * this.w + xx) * 3;
        this.px[i] = color[0];
        this.px[i + 1] = color[1];
        this.px[i + 2] = color[2];
      }
    }
  }

  // A horizontal rule, the newspaper's best friend.
  rule(x: number, y: number, w: number, thickness: number, color: Rgb) {
    this.rect(x, y - thickness / 2, w, thickness, color);
  }

  // Filled polygon by scanline, then its own outline stroked over the
  // edge in the same colour to soften the steps.
  polygon(points: number[][], color: Rgb) {
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }
    const y0 = Math.max(0, Math.floor(minY));
    const y1 = Math.min(this.h - 1, Math.ceil(maxY));
    for (let y = y0; y <= y1; y++) {
      const scan = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        if (a[1] <= scan && b[1] > scan || b[1] <= scan && a[1] > scan) {
          xs.push(a[0] + ((scan - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
        }
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const xa = Math.max(0, Math.round(xs[i]));
        const xb = Math.min(this.w, Math.round(xs[i + 1]));
        for (let x = xa; x < xb; x++) {
          const idx = (y * this.w + x) * 3;
          this.px[idx] = color[0];
          this.px[idx + 1] = color[1];
          this.px[idx + 2] = color[2];
        }
      }
    }
    const closed = [...points, points[0]];
    this.polyline(closed, 1.6, color);
  }

  circle(cx: number, cy: number, r: number, color: Rgb) {
    this.disc(cx, cy, r, color);
  }

  ring(cx: number, cy: number, r: number, thickness: number, color: Rgb) {
    const steps = Math.max(24, Math.ceil(r * 1.5));
    let prev: number[] | null = null;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const p = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      if (prev) this.segment(prev[0], prev[1], p[0], p[1], thickness, color);
      prev = p;
    }
  }
}

// ---- Text ------------------------------------------------------------

export interface TextStyle {
  size: number; // cap height in pixels
  weight: number; // stroke thickness in pixels
  color: Rgb;
  tracking?: number; // extra pixels of advance per character
}

export function measureText(text: string, style: TextStyle): number {
  const scale = style.size / 10;
  const tracking = style.tracking ?? 0;
  let width = 0;
  for (const ch of text) {
    width += glyphFor(ch).w * scale + tracking;
  }
  return text.length ? width - tracking : 0;
}

// Draw one line of text with its baseline at (x, y). Returns the width
// drawn, so callers can centre or right-align by measuring first.
export function drawText(cv: Canvas, text: string, x: number, y: number, style: TextStyle): number {
  const scale = style.size / 10;
  const tracking = style.tracking ?? 0;
  let cursor = x;
  for (const ch of text) {
    const glyph = glyphFor(ch);
    for (const stroke of glyph.strokes) {
      const points = stroke.map(([gx, gy]) => [cursor + gx * scale, y - gy * scale]);
      if (points.length === 1) {
        cv.disc(points[0][0], points[0][1], style.weight * 0.72, style.color);
      } else {
        cv.polyline(points, style.weight, style.color);
      }
    }
    cursor += glyph.w * scale + tracking;
  }
  return cursor - x - (text.length ? tracking : 0);
}

export function drawTextCentered(cv: Canvas, text: string, cx: number, y: number, style: TextStyle): number {
  const width = measureText(text, style);
  return drawText(cv, text, cx - width / 2, y, style);
}

export function drawTextRight(cv: Canvas, text: string, right: number, y: number, style: TextStyle): number {
  const width = measureText(text, style);
  return drawText(cv, text, right - width, y, style);
}

// Greedy word wrap: lines of at most maxWidth pixels in the given style.
export function wrapText(text: string, maxWidth: number, style: TextStyle): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const trial = line ? line + ' ' + word : word;
    if (measureText(trial, style) <= maxWidth || !line) {
      line = trial;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Draw a wrapped paragraph; returns the y just below its last line.
export function drawParagraph(
  cv: Canvas,
  text: string,
  x: number,
  yTop: number,
  maxWidth: number,
  style: TextStyle,
  lineHeight: number,
): number {
  const lines = wrapText(text, maxWidth, style);
  let baseline = yTop + style.size;
  for (const line of lines) {
    drawText(cv, line, x, baseline, style);
    baseline += lineHeight;
  }
  return baseline - lineHeight + style.size * 0.35;
}
