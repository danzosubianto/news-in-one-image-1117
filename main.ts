// main.ts - The Daily Meridian: the world news of Tuesday
// 17 November 2026, set as one newspaper front page.
//
// The program is a small printing press: it takes the day's stories
// from news.ts, draws them with the stroke font and spot art in
// src/, and writes the finished page to entry.png. It reads nothing,
// asks nothing and rolls the same page off the press every time.
//
// The layout is budgeted like a real page: every band returns the y
// it finished at, and the next band starts from there, so nothing
// can drift into its neighbour.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  Canvas,
  drawParagraph,
  drawText,
  drawTextCentered,
  drawTextRight,
  wrapText,
  type Rgb,
  type TextStyle,
} from './src/canvas.ts';
import { encodePng } from './src/png.ts';
import { drawArt } from './src/art.ts';
import { BRIEFS, LEAD, PAPER, STATS, STORIES, type Story } from './src/news.ts';

const W = 1024;
const H = 1024;
const MARGIN = 40;
const COLW = W - MARGIN * 2;

const PAPER_BG: Rgb = [247, 243, 233];
const INK: Rgb = [26, 26, 28];
const BODY: Rgb = [52, 50, 46];
const MUTED: Rgb = [104, 100, 90];
const FAINT: Rgb = [172, 164, 148];
const RED: Rgb = [172, 32, 40];

const cv = new Canvas(W, H, PAPER_BG);

// Top strip, the day bannered in red, the nameplate, the tagline,
// and the double rule every broadsheet masthead sits on.
function masthead(): number {
  drawText(cv, 'EST. MMXXVI · ONE DAY, ONE PAGE', MARGIN, 26, {
    size: 12.5,
    weight: 2.6,
    color: MUTED,
    tracking: 1.5,
  });
  drawTextRight(cv, PAPER.edition, W - MARGIN, 26, {
    size: 12.5,
    weight: 2.6,
    color: MUTED,
    tracking: 1,
  });
  cv.rule(MARGIN, 38, COLW, 1.2, FAINT);

  drawTextCentered(cv, PAPER.dateLine.toUpperCase(), W / 2, 70, {
    size: 29,
    weight: 6.2,
    color: RED,
    tracking: 3,
  });
  drawTextCentered(cv, PAPER.name, W / 2, 133, {
    size: 48,
    weight: 9.5,
    color: INK,
    tracking: 2,
  });
  drawTextCentered(cv, PAPER.tagline, W / 2, 157, {
    size: 15,
    weight: 3,
    color: MUTED,
    tracking: 1.5,
  });
  cv.rule(MARGIN, 171, COLW, 3.4, INK);
  cv.rule(MARGIN, 178, COLW, 1, INK);
  return 178;
}

// The lead story: kicker, a banner headline across the page, then
// the deck in a column beside the spot art.
function leadStory(yTop: number): number {
  drawText(cv, LEAD.kicker, MARGIN, yTop + 30, {
    size: 18,
    weight: 4.4,
    color: LEAD.accent,
    tracking: 2.5,
  });
  cv.rect(MARGIN, yTop + 40, 64, 3.4, LEAD.accent);

  const headStyle: TextStyle = { size: 43, weight: 8.6, color: INK, tracking: 0.5 };
  let baseline = yTop + 90;
  for (const line of wrapText(LEAD.headline, COLW, headStyle)) {
    drawText(cv, line, MARGIN, baseline, headStyle);
    baseline += 60;
  }

  const bodyY = yTop + 174;
  const artW = 348;
  const artX = W - MARGIN - artW;
  drawArt(cv, LEAD.art, artX, bodyY, artW, 150);
  drawParagraph(cv, LEAD.deck, MARGIN, bodyY, artX - MARGIN - 28, { size: 18, weight: 3.4, color: BODY }, 30);
  return bodyY + 176;
}

// Four figures from the day's reporting, set large in a ruled band.
function numbersBand(yTop: number): number {
  drawText(cv, 'THE DAY IN NUMBERS', MARGIN, yTop + 22, {
    size: 14,
    weight: 4,
    color: INK,
    tracking: 2.5,
  });
  cv.rule(MARGIN + 218, yTop + 17, COLW - 218, 1, FAINT);
  const colW = COLW / STATS.length;
  STATS.forEach((stat, i) => {
    const x = MARGIN + i * colW;
    drawText(cv, stat.value, x, yTop + 58, { size: 28, weight: 7.2, color: RED });
    drawText(cv, stat.label, x, yTop + 76, { size: 13, weight: 2.7, color: MUTED });
  });
  return yTop + 82;
}

// One of the four inside stories: a square of spot art, then kicker,
// headline and the short deck in the column beside it.
function storyCard(story: Story, x: number, yTop: number, w: number): void {
  const artSize = 96;
  drawArt(cv, story.art, x, yTop + 8, artSize, artSize);
  const tx = x + artSize + 14;
  const tw = w - artSize - 14;
  drawText(cv, story.kicker, tx, yTop + 16, {
    size: 12,
    weight: 3.8,
    color: story.accent,
    tracking: 1.6,
  });
  const headStyle: TextStyle = { size: 17.5, weight: 5.2, color: INK };
  let baseline = yTop + 40;
  for (const line of wrapText(story.headline, tw, headStyle).slice(0, 2)) {
    drawText(cv, line, tx, baseline, headStyle);
    baseline += 23;
  }
  drawParagraph(cv, story.deckShort, tx, yTop + 72, tw, { size: 13.5, weight: 2.7, color: BODY }, 17);
}

function storyGrid(yTop: number): number {
  const gap = 28;
  const colW = (COLW - gap) / 2;
  const cardH = 118;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      storyCard(STORIES[row * 2 + col], MARGIN + col * (colW + gap), yTop + row * 118, colW);
    }
  }
  return yTop + cardH + 118;
}

// The briefs, two columns of two: a bold tag inline, then the
// one-liner flowing after it and underneath.
function briefsBand(yTop: number): number {
  drawText(cv, 'ALSO TODAY', MARGIN, yTop + 16, {
    size: 14,
    weight: 4.4,
    color: RED,
    tracking: 2.5,
  });
  cv.rule(MARGIN + 128, yTop + 11, COLW - 128, 1, FAINT);
  const gap = 28;
  const colW = (COLW - gap) / 2;
  const tagStyle: TextStyle = { size: 12.5, weight: 4.6, color: INK, tracking: 1 };
  const textStyle: TextStyle = { size: 13.5, weight: 2.7, color: BODY };
  let bottom = yTop;
  for (let i = 0; i < BRIEFS.length; i++) {
    const brief = BRIEFS[i];
    const x = MARGIN + (i % 2) * (colW + gap);
    const cellY = yTop + 24 + Math.floor(i / 2) * 42;
    const tagW = drawText(cv, brief.tag, x, cellY + 13.5, tagStyle);
    bottom = Math.max(bottom, drawParagraph(cv, brief.text, x + tagW + 9, cellY, colW - tagW - 9, textStyle, 17));
  }
  return bottom;
}

// ---- Set the page -----------------------------------------------------
let y = masthead();
y = leadStory(y + 7);
cv.rule(MARGIN, y + 8, COLW, 1.6, INK);
y = numbersBand(y + 16);
cv.rule(MARGIN, y + 8, COLW, 1, FAINT);
y = storyGrid(y + 16);
cv.rule(MARGIN, y + 8, COLW, 1, FAINT);
y = briefsBand(y + 16);

// A closing rule signs the page off.
cv.rule(MARGIN, y + 11, COLW, 2.4, INK);

const png = encodePng(cv.px, W, H);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
writeFileSync(join(outDir, 'entry.png'), png);
