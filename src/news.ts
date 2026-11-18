// news.ts - the news of Tuesday 17 November 2026, as reported on the day.
//
// The sandbox gives the program no feed, so the day's journalism is done
// here, in the open, as data: every story below was reported on
// 17 November 2026 by the day's wires and digests, and the wording is
// kept sober and close to that reporting - what happened, where, and
// what was said by the people in it, with claims attributed to the side
// that made them. The renderer in main.ts sets this data as a front
// page; nothing here reaches for the network.

import type { Rgb } from './canvas.ts';

export interface Story {
  kicker: string; // the section label above the headline
  accent: Rgb; // the colour that section wears on the page
  headline: string;
  deck: string; // the short summary under the headline
  deckShort: string; // the deck cut to two lines for the inside pages
  art: string; // which illustration in art.ts belongs to this story
}

export const PAPER = {
  name: 'THE DAILY MERIDIAN',
  tagline: "The world's news of one day, on one page",
  dateLine: 'Tuesday, 17 November 2026',
  edition: 'Vol. I · No. 17 · Set from the wires of the day',
};

export const LEAD: Story = {
  kicker: 'THE WAR IN UKRAINE',
  accent: [172, 32, 40],
  headline: 'UKRAINE BLASTS KERCH BRIDGE FOR A SECOND DAY',
  deck:
    "Ukrainian missiles and drones partly collapsed a span of the Kerch Strait bridge, Crimea's lifeline to Russia, in a second straight day of strikes. " +
    "Zelensky hailed an 'unprecedented' attack; Moscow said it downed 1,441 drones.",
  deckShort: '',
  art: 'bridge',
};

export const STORIES: Story[] = [
  {
    kicker: 'GULF · ENERGY',
    accent: [10, 105, 118],
    headline: 'MINES HIT MORE TANKERS IN THE STRAIT OF HORMUZ',
    deck:
      'Two more ships struck mines in the strait and a fourth tanker caught fire within 24 hours, as Iran warned vessels away from the American-patrolled route and Bahrain said it had thwarted a drone attack.',
    deckShort: 'Two more ships hit mines; a fourth tanker burned in the strait.',
    art: 'ship',
  },
  {
    kicker: 'DIPLOMACY · ASIA',
    accent: [29, 78, 137],
    headline: 'TRUMP, XI AND PUTIN SET FIRST THREE-WAY SUMMIT',
    deck:
      'Donald Trump opened his Asia trip in Manila, meeting Quad leaders, before a first-ever trilateral summit with Xi Jinping and Vladimir Putin in Shenzhen on Thursday, with the Iran war and nuclear arsenals on the table.',
    deckShort: 'Trump in Manila before a first summit with Xi and Putin Thursday.',
    art: 'globe',
  },
  {
    kicker: 'CLIMATE · COP31',
    accent: [43, 116, 58],
    headline: 'COP31 DRAFT BIDS FASTER FOSSIL PHASE-OUT',
    deck:
      'Negotiators at the COP31 talks in Antalya published a draft deal calling for a faster end to fossil fuels and at least $120 billion a year in adaptation finance for developing countries by 2035.',
    deckShort: 'Draft seeks faster fossil phase-out, $120bn a year for poor nations.',
    art: 'leaf',
  },
  {
    kicker: 'EUROPE · FRANCE',
    accent: [112, 62, 138],
    headline: 'FRANCE MARCHES: 146,000 IN STRIKE OVER PAY',
    deck:
      'Public-sector unions drew 146,000 people onto the streets - 28,000 of them in Paris - in a nationwide strike for higher wages, largely peaceful and aimed squarely at the government ahead of the 2027 election.',
    deckShort: 'Unions draw 146,000 people, 28,000 in Paris, in a strike over pay.',
    art: 'tower',
  },
];

export interface Brief {
  tag: string; // where or what, in a word or two
  text: string; // one line of news
}
export const BRIEFS: Brief[] = [
  {
    tag: 'SIBERIA',
    text: 'Russian transport plane crashes in Siberia; all 19 aboard killed',
  },
  {
    tag: 'HEALTH',
    text: 'US loses measles elimination status; cases hit a 40-year high',
  },
  {
    tag: 'GAZA',
    text: 'UK, Australia, Canada and Italy urge Israel to open aid crossings',
  },
  {
    tag: 'SPORT',
    text: 'India edge Pakistan by one wicket in last-ball U19 Asia Cup final',
  },
];

// The day in numbers: the figures the day's reporting kept returning
// to, each one as it was reported (and attributed where it is a claim).
export interface Stat {
  value: string; // the big numeral
  label: string; // what it counts, in a few words
}

export const STATS: Stat[] = [
  { value: '1,441', label: 'drones downed overnight' },
  { value: '146,000', label: 'march in France' },
  { value: '$120bn', label: 'climate finance a year' },
  { value: '5,400+', label: 'US measles cases' },
];
