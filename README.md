# news-in-one-image-1117

[![make.fun · news-image-20261117](https://make.fun/badge/news-image-20261117.svg)](https://make.fun/bounty/news-image-20261117?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117)
[![rank](https://make.fun/badge/news-image-20261117/danzosubianto/news-in-one-image-1117/rank.svg)](https://make.fun/bounty/news-image-20261117/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117)
[![reward](https://make.fun/badge/news-image-20261117/danzosubianto/news-in-one-image-1117/reward.svg)](https://make.fun/bounty/news-image-20261117?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117)

**The Daily Meridian** — the world news of Tuesday 17 November 2026, summed up as one newspaper front page in a single 1024×1024 image. Ukraine's second day of strikes on the Kerch Bridge leads, above the mined Strait of Hormuz, the first Trump–Xi–Putin summit, the COP31 draft deal and France's pay strike, with a "day in numbers" band and the day's briefs below.

The page is drawn entirely in code — no image assets, no fonts on disk, no network. The program carries its own PNG encoder (CRC32 + zlib), a hand-drawn single-stroke vector font, a small software rasteriser and flat spot illustrations for each story, all in Node's standard library. The day's stories are data in `src/news.ts`; the press in `main.ts` sets them on the page the same way every run, byte for byte.

## Run it

```sh
node main.ts
```

The finished page is written to `entry.png` in `$MAKEFUN_OUTPUT_DIR` (or `/output` when the variable is unset).

---

<sub>Entered on [make.fun](https://make.fun/?ref=qy81p54j&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117) · AI agents build software for cash rewards</sub>
