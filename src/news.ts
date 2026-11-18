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
    "President Zelensky hailed an 'unprecedented' attack planned over weeks; Moscow said its defences downed 1,441 drones overnight and halted all traffic across the bridge.",
  art: 'bridge',
};

export const STORIES: Story[] = [
  {
    kicker: 'GULF · ENERGY',
    accent: [10, 105, 118],
    headline: 'MINES HIT MORE TANKERS IN THE STRAIT OF HORMUZ',
    deck:
      'Two more ships struck mines in the strait and a fourth tanker caught fire within 24 hours, as Iran warned vessels away from the American-patrolled route and Bahrain said it had thwarted a drone attack.',
    art: 'ship',
  },
  {
    kicker: 'DIPLOMACY · ASIA',
    accent: [29, 78, 137],
    headline: 'TRUMP, XI AND PUTIN SET FIRST THREE-WAY SUMMIT',
    deck:
      'Donald Trump opened his Asia trip in Manila, meeting Quad leaders, before a first-ever trilateral summit with Xi Jinping and Vladimir Putin in Shenzhen on Thursday, with the Iran war and nuclear arsenals on the table.',
    art: 'globe',
  },
  {
    kicker: 'CLIMATE · COP31',
    accent: [43, 116, 58],
    headline: 'COP31 DRAFT BIDS TO SPEED FOSSIL FUEL PHASE-OUT',
    deck:
      'Negotiators at the COP31 talks in Antalya published a draft deal calling for a faster end to fossil fuels and at least $120 billion a year in adaptation finance for developing countries by 2035.',
    art: 'leaf',
  },
  {
    kicker: 'EUROPE · FRANCE',
    accent: [112, 62, 138],
    headline: '146,000 MARCH ACROSS FRANCE IN STRIKE OVER PAY',
    deck:
      'Public-sector unions drew 146,000 people onto the streets - 28,000 of them in Paris - in a nationwide strike for higher wages, largely peaceful and aimed squarely at the government ahead of the 2027 election.',
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
    text: 'Russian military transport plane crashes in the Kemerovo region; all 19 people aboard are killed',
  },
  {
    tag: 'HEALTH',
    text: 'United States loses its measles elimination status as cases pass 5,400, a 40-year high',
  },
  {
    tag: 'JAPAN',
    text: 'Fighter jets scrambled after two Russian aircraft violate Japanese airspace; Tokyo protests',
  },
  {
    tag: 'GAZA',
    text: 'Britain, Australia, Canada and Italy urge Israel to open the crossings to humanitarian aid',
  },
  {
    tag: 'YEMEN',
    text: 'Government forces retreat toward Aden as Houthi fighters advance along the Red Sea coast',
  },
  {
    tag: 'SPORT',
    text: 'India beat Pakistan by one wicket, off the very last ball, to win the Under-19 Asia Cup final',
  },
];

// The day in numbers: the figures the day's reporting kept returning
// to, each one as it was reported (and attributed where it is a claim).
export interface Stat {
  value: string; // the big numeral
  label: string; // what it counts, in a few words
}

export const STATS: Stat[] = [
  { value: '1,441', label: 'drones Moscow says its defences downed overnight' },
  { value: '146,000', label: 'people march across France in the strike over pay' },
  { value: '$120bn', label: 'a year in climate finance in the COP31 draft deal' },
  { value: '5,400+', label: 'measles cases in the US as elimination status is lost' },
];
