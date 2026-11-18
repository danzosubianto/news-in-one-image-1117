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
  measureText,
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
  cv.rule(MARGIN, 36, COLW, 1.2, FAINT);

  drawTextCentered(cv, PAPER.dateLine.toUpperCase(), W / 2, 66, {
    size: 25,
    weight: 5.8,
    color: RED,
    tracking: 3.5,
  });
  drawTextCentered(cv, PAPER.name, W / 2, 133, {
    size: 50,
    weight: 9.5,
    color: INK,
    tracking: 2,
  });
  drawTextCentered(cv, PAPER.tagline, W / 2, 158, {
    size: 14.5,
    weight: 3,
    color: MUTED,
    tracking: 1.5,
  });
  cv.rule(MARGIN, 170, COLW, 3.4, INK);
  cv.rule(MARGIN, 177, COLW, 1, INK);
  return 177;
}

// The lead story: kicker, a banner headline across the page, then
// the deck in a column beside the spot art.
function leadStory(yTop: number): number {
  drawText(cv, LEAD.kicker, MARGIN, yTop + 28, {
    size: 18,
    weight: 4.4,
    color: LEAD.accent,
    tracking: 2.5,
  });
  cv.rect(MARGIN, yTop + 38, 88, 3.4, LEAD.accent);

  const headStyle: TextStyle = { size: 42, weight: 8.6, color: INK, tracking: 0.5 };
  let baseline = yTop + 86;
  for (const line of wrapText(LEAD.headline, COLW, headStyle)) {
    drawText(cv, line, MARGIN, baseline, headStyle);
    baseline += 58;
  }

  const bodyY = yTop + 162;
  const artW = 340;
  const artX = W - MARGIN - artW;
  const artH = 132;
  drawArt(cv, LEAD.art, artX, bodyY, artW, artH);
  // the picture's caption, ticked in the story's colour
  cv.rect(artX, bodyY + artH + 6, 24, 2.2, LEAD.accent);
  drawParagraph(cv, LEAD.caption ?? '', artX, bodyY + artH + 11, artW, { size: 10.5, weight: 2.6, color: MUTED }, 12.5);
  drawParagraph(cv, LEAD.deck, MARGIN, bodyY, artX - MARGIN - 26, { size: 17.5, weight: 3.4, color: BODY }, 26.5);
  return bodyY + 168;
}

// Four figures from the day's reporting, set large in a ruled band.
function numbersBand(yTop: number): number {
  drawText(cv, 'THE DAY IN NUMBERS', MARGIN, yTop + 21, {
    size: 14,
    weight: 4,
    color: INK,
    tracking: 2.5,
  });
  cv.rule(MARGIN + 218, yTop + 16, COLW - 218, 1, FAINT);
  const colW = COLW / STATS.length;
  STATS.forEach((stat, i) => {
    const x = MARGIN + i * colW;
    if (i > 0) cv.rect(x - 14, yTop + 34, 1, 44, FAINT);
    drawText(cv, stat.value, x, yTop + 56, { size: 27, weight: 7.4, color: RED });
    drawText(cv, stat.label, x, yTop + 73, { size: 12, weight: 2.7, color: MUTED });
  });
  return yTop + 74;
}

// One of the four inside stories: a square of spot art, then kicker,
// headline and the short deck in the column beside it.
function storyCard(story: Story, x: number, yTop: number, w: number): void {
  const artSize = 92;
  drawArt(cv, story.art, x, yTop + 10, artSize, artSize);
  const tx = x + artSize + 14;
  const tw = w - artSize - 14;
  drawText(cv, story.kicker, tx, yTop + 18, {
    size: 12,
    weight: 3.8,
    color: story.accent,
    tracking: 1.6,
  });
  const headStyle: TextStyle = { size: 17, weight: 5.2, color: INK };
  let baseline = yTop + 44;
  for (const line of wrapText(story.headline, tw, headStyle).slice(0, 2)) {
    drawText(cv, line, tx, baseline, headStyle);
    baseline += 24;
  }
  drawParagraph(cv, story.deckShort, tx, yTop + 80, tw, { size: 13.5, weight: 2.7, color: BODY }, 17);
}

function storyGrid(yTop: number): number {
  const gap = 28;
  const colW = (COLW - gap) / 2;
  const cardH = 124;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      storyCard(STORIES[row * 2 + col], MARGIN + col * (colW + gap), yTop + row * cardH, colW);
    }
  }
  // a hairline gutter down the middle, the way a two-column page breathes
  const gx = MARGIN + colW + gap / 2;
  cv.rect(gx, yTop + 12, 1, cardH * 2 - 24, FAINT);
  return yTop + cardH * 2;
}

// The briefs, two columns of two: a bold tag inline, then the
// one-liner flowing after it. Each row is measured from the lines
// its cells actually wrap to, so a two-line brief can never crowd
// the row beneath it.
function briefsBand(yTop: number): number {
  drawText(cv, 'ALSO TODAY', MARGIN, yTop + 15, {
    size: 14,
    weight: 4.4,
    color: RED,
    tracking: 2.5,
  });
  cv.rule(MARGIN + 128, yTop + 10, COLW - 128, 1, FAINT);
  const gap = 28;
  const colW = (COLW - gap) / 2;
  const tagStyle: TextStyle = { size: 12.5, weight: 4.6, color: INK, tracking: 1 };
  const textStyle: TextStyle = { size: 13.5, weight: 2.7, color: BODY };
  const lineH = 16.5;
  let rowY = yTop + 24;
  let bottom = rowY;
  for (let row = 0; row < 2; row++) {
    let rowH = 0;
    for (let col = 0; col < 2; col++) {
      const brief = BRIEFS[row * 2 + col];
      const x = MARGIN + col * (colW + gap);
      const tagW = measureText(brief.tag, tagStyle);
      drawText(cv, brief.tag, x, rowY + 13.5, tagStyle);
      const lines = wrapText(brief.text, colW - tagW - 9, textStyle);
      lines.forEach((line, j) => {
        drawText(cv, line, x + tagW + 9, rowY + 13.5 + j * lineH, textStyle);
      });
      rowH = Math.max(rowH, 13.5 + (lines.length - 1) * lineH + 5);
    }
    bottom = rowY + rowH;
    rowY = bottom + 11;
  }
  return bottom;
}

// ---- Set the page -----------------------------------------------------
let y = masthead();
y = leadStory(y + 5);
cv.rule(MARGIN, y + 8, COLW, 1.6, INK);
y = numbersBand(y + 14);
cv.rule(MARGIN, y + 8, COLW, 1, FAINT);
y = storyGrid(y + 12);
cv.rule(MARGIN, y + 8, COLW, 1, FAINT);
y = briefsBand(y + 12);

// A closing double rule signs the page off, answering the masthead's.
cv.rule(MARGIN, y + 12, COLW, 2.4, INK);
cv.rule(MARGIN, y + 18, COLW, 0.9, INK);

const png = encodePng(cv.px, W, H);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
writeFileSync(join(outDir, 'entry.png'), png);
