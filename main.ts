// main.ts - The Daily Meridian: the world news of Tuesday
// 17 November 2026, set as one newspaper front page.
//
// The program is a small printing press: it takes the day's stories
// from news.ts, draws them with the stroke font and spot art in
// src/, and writes the finished page to entry.png. It reads nothing,
// asks nothing and rolls the same page off the press every time.

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
const MUTED: Rgb = [104, 100, 90];
const FAINT: Rgb = [172, 164, 148];
const RED: Rgb = [172, 32, 40];

const cv = new Canvas(W, H, PAPER_BG);

// A centred dateline, the way the old broadsheets banner the day.
function masthead(): number {
  drawText(cv, 'EST. MMXXVI · ONE DAY, ONE PAGE', MARGIN, 30, {
    size: 12.5,
    weight: 2.6,
    color: MUTED,
    tracking: 1.5,
  });
  drawTextRight(cv, PAPER.edition, W - MARGIN, 30, {
    size: 12.5,
    weight: 2.6,
    color: MUTED,
    tracking: 1,
  });
  cv.rule(MARGIN, 42, COLW, 1.2, FAINT);

  drawTextCentered(cv, PAPER.dateLine.toUpperCase(), W / 2, 82, {
    size: 31,
    weight: 6.4,
    color: RED,
    tracking: 3,
  });
  drawTextCentered(cv, PAPER.name, W / 2, 148, {
    size: 55,
    weight: 9.5,
    color: INK,
    tracking: 2,
  });
  drawTextCentered(cv, PAPER.tagline, W / 2, 178, {
    size: 15.5,
    weight: 3,
    color: MUTED,
    tracking: 1.5,
  });
  cv.rule(MARGIN, 194, COLW, 3.4, INK);
  cv.rule(MARGIN, 201, COLW, 1, INK);
  return 201;
}

// The lead story: kicker and a banner headline across the page, then
// the deck in a column beside the spot art and its caption.
function leadStory(yTop: number): number {
  const kickerStyle: TextStyle = { size: 18, weight: 4.4, color: LEAD.accent, tracking: 2.5 };
  drawText(cv, LEAD.kicker, MARGIN, yTop + 26, kickerStyle);
  cv.rect(MARGIN, yTop + 36, 64, 3.4, LEAD.accent);

  const headStyle: TextStyle = { size: 53, weight: 8.6, color: INK, tracking: 0.5 };
  const headLines = wrapText(LEAD.headline, COLW, headStyle);
  let baseline = yTop + 100;
  for (const line of headLines) {
    drawText(cv, line, MARGIN, baseline, headStyle);
    baseline += 60;
  }

  const bodyY = baseline - 60 + 34;
  const artW = 348;
  const artX = W - MARGIN - artW;
  drawArt(cv, LEAD.art, artX, bodyY, artW, 178);
  drawParagraph(
    cv,
    "The Kerch Strait bridge - Crimea's road and rail lifeline to Russia - under fire for a second day.",
    artX,
    bodyY + 186,
    artW,
    { size: 12.5, weight: 2.6, color: MUTED },
    17,
  );

  const deckStyle: TextStyle = { size: 19.5, weight: 3.4, color: INK };
  const deckBottom = drawParagraph(cv, LEAD.deck, MARGIN, bodyY, artX - MARGIN - 28, deckStyle, 28);
  return Math.max(deckBottom, bodyY + 224) + 14;
}

// Four figures from the day's reporting, set large.
function numbersBand(yTop: number): number {
  drawText(cv, 'THE DAY IN NUMBERS', MARGIN, yTop + 16, {
    size: 14,
    weight: 4,
    color: INK,
    tracking: 2.5,
  });
  cv.rule(MARGIN + 218, yTop + 11, COLW - 218, 1, FAINT);
  const colW = COLW / STATS.length;
  STATS.forEach((stat, i) => {
    const x = MARGIN + i * colW;
    drawText(cv, stat.value, x, yTop + 62, { size: 37, weight: 7.5, color: RED });
    drawParagraph(cv, stat.label, x, yTop + 74, colW - 22, { size: 13, weight: 2.7, color: MUTED }, 17.5);
  });
  return yTop + 118;
}

// One of the four inside stories: a square of spot art, then kicker,
// headline and deck in the column beside it.
function storyCard(story: Story, x: number, yTop: number, w: number): number {
  const artSize = 108;
  drawArt(cv, story.art, x, yTop, artSize, artSize);
  const tx = x + artSize + 16;
  const tw = w - artSize - 16;
  drawText(cv, story.kicker, tx, yTop + 15, {
    size: 12,
    weight: 3.8,
    color: story.accent,
    tracking: 1.6,
  });
  const headStyle: TextStyle = { size: 19.5, weight: 5.2, color: INK };
  const lines = wrapText(story.headline, tw, headStyle);
  let baseline = yTop + 42;
  for (const line of lines.slice(0, 2)) {
    drawText(cv, line, tx, baseline, headStyle);
    baseline += 23.5;
  }
  const deckStyle: TextStyle = { size: 13.5, weight: 2.7, color: [58, 56, 52] };
  drawParagraph(cv, story.deck, tx, baseline - 16, tw, deckStyle, 18);
  return yTop + artSize;
}

function storyGrid(yTop: number): number {
  const gap = 28;
  const colW = (COLW - gap) / 2;
  let y = yTop;
  for (let row = 0; row < 2; row++) {
    let rowBottom = y;
    for (let col = 0; col < 2; col++) {
      const story = STORIES[row * 2 + col];
      rowBottom = Math.max(rowBottom, storyCard(story, MARGIN + col * (colW + gap), y, colW));
    }
    y = rowBottom + 20;
  }
  return y;
}

// The briefs: one line each, in two columns, tags in the section red.
function briefsBand(yTop: number): number {
  drawText(cv, 'ALSO TODAY', MARGIN, yTop + 15, {
    size: 14,
    weight: 4.4,
    color: RED,
    tracking: 2.5,
  });
  cv.rule(MARGIN + 128, yTop + 10, COLW - 128, 1, FAINT);
  const colW = (COLW - 28) / 2;
  const tagStyle: TextStyle = { size: 13, weight: 4.6, color: INK, tracking: 0.8 };
  const textStyle: TextStyle = { size: 13, weight: 2.7, color: [58, 56, 52] };
  let y = yTop + 26;
  for (let row = 0; row < 3; row++) {
    let rowBottom = y;
    for (let col = 0; col < 2; col++) {
      const brief = BRIEFS[row * 2 + col];
      const x = MARGIN + col * (colW + 28);
      const tagW = drawText(cv, brief.tag, x, y + 13, tagStyle);
      const bottom = drawParagraph(cv, brief.text, x + tagW + 10, y, colW - tagW - 10, textStyle, 17.5);
      rowBottom = Math.max(rowBottom, bottom);
    }
    y = rowBottom + 9;
  }
  return y;
}

// ---- Set the page -----------------------------------------------------
let y = masthead();
y = leadStory(y + 8);
cv.rule(MARGIN, y, COLW, 1.6, INK);
y = numbersBand(y + 12);
cv.rule(MARGIN, y, COLW, 1, FAINT);
y = storyGrid(y + 14);
cv.rule(MARGIN, y, COLW, 1, FAINT);
y = briefsBand(y + 12);
cv.rule(MARGIN, Math.min(y + 4, H - 18), COLW, 2.4, INK);

const png = encodePng(cv.px, W, H);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
writeFileSync(join(outDir, 'entry.png'), png);
