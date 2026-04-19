export type Regime = "trend_up" | "trend_down" | "mean_revert" | "high_vol";

export interface TradingPosition {
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entry: number;
  mark: number;
  confidence: number;
  pnl: number;
}

export interface ExecutionReport {
  time: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  slippageBps: number;
  venue: string;
}

interface DailyPoint {
  date: string;
  nav: number;
  pnl: number;
}

const regimeSequence: Regime[] = [
  "trend_up",
  "trend_up",
  "mean_revert",
  "high_vol",
  "trend_down",
  "mean_revert",
];

export class TradingBrain {
  private tick = 0;

  private baseNav = 100000;

  private symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT"];

  private rand(seed: number): number {
    const x = Math.sin(seed * 999 + 11.17) * 10000;
    return x - Math.floor(x);
  }

  private regimeByTick(tick: number): Regime {
    return regimeSequence[tick % regimeSequence.length];
  }

  private noise(v: number, scale: number): number {
    return (this.rand(v) - 0.5) * scale;
  }

  private simulateNavPoint(dayIdx: number, nav: number): DailyPoint {
    const regime = this.regimeByTick(dayIdx);
    const drift =
      regime === "trend_up"
        ? 0.0022
        : regime === "trend_down"
          ? -0.0018
          : regime === "mean_revert"
            ? 0.0006
            : -0.0005;
    const vol = regime === "high_vol" ? 0.017 : 0.0085;
    const ret = drift + this.noise(dayIdx + 77, vol);
    const nextNav = nav * (1 + ret);

    return {
      date: new Date(Date.now() - (30 - dayIdx) * 86400000).toISOString(),
      nav: Number(nextNav.toFixed(2)),
      pnl: Number((nextNav - nav).toFixed(2)),
    };
  }

  getOverview() {
    this.tick += 1;

    const regime = this.regimeByTick(this.tick);
    const confidence = Number((0.62 + this.rand(this.tick) * 0.33).toFixed(2));

    const navSeries: DailyPoint[] = [];
    let nav = this.baseNav;
    for (let i = 1; i <= 30; i += 1) {
      const point = this.simulateNavPoint(i + this.tick, nav);
      nav = point.nav;
      navSeries.push(point);
    }

    const navNow = navSeries[navSeries.length - 1]?.nav ?? this.baseNav;
    const startNav = navSeries[0]?.nav ?? this.baseNav;
    const pnlToday = navSeries[navSeries.length - 1]?.pnl ?? 0;
    const maxNav = Math.max(...navSeries.map((d) => d.nav));
    const maxDrawdown = Number((((maxNav - navNow) / maxNav) * 100).toFixed(2));

    return {
      timestamp: new Date().toISOString(),
      nav: navNow,
      pnlToday,
      rollingReturnPct: Number(
        (((navNow - startNav) / startNav) * 100).toFixed(2),
      ),
      sharpeProxy: Number((1.1 + confidence * 2.7).toFixed(2)),
      maxDrawdownPct: maxDrawdown,
      openRiskPct: Number((1.5 + this.rand(this.tick + 8) * 2.4).toFixed(2)),
      regime,
      regimeConfidence: confidence,
      navSeries,
    };
  }

  getPositions(): TradingPosition[] {
    const regime = this.regimeByTick(this.tick);

    return this.symbols.map((symbol, idx) => {
      const basePrice = [68000, 3200, 180, 0.58][idx];
      const delta = this.noise(this.tick + idx * 9, basePrice * 0.05);
      const mark = Number((basePrice + delta).toFixed(4));
      const entry = Number((basePrice - delta * 0.55).toFixed(4));
      const side: "long" | "short" =
        regime === "trend_down" && idx % 2 === 1 ? "short" : "long";
      const qty = Number(
        (0.4 + this.rand(this.tick + idx + 13) * 2.1).toFixed(4),
      );
      const signed = side === "long" ? 1 : -1;
      const pnl = Number(
        (((mark - entry) * qty * signed) / basePrice).toFixed(4),
      );

      return {
        symbol,
        side,
        quantity: qty,
        entry,
        mark,
        confidence: Number(
          (0.58 + this.rand(this.tick + idx + 23) * 0.4).toFixed(2),
        ),
        pnl,
      };
    });
  }

  getExecutions(): ExecutionReport[] {
    return Array.from({ length: 12 }).map((_, i) => {
      const symbol = this.symbols[i % this.symbols.length];
      const priceBase = symbol.startsWith("BTC")
        ? 68000
        : symbol.startsWith("ETH")
          ? 3200
          : symbol.startsWith("SOL")
            ? 180
            : 0.58;

      return {
        time: new Date(Date.now() - i * 180000).toISOString(),
        symbol,
        side: i % 2 === 0 ? "buy" : "sell",
        qty: Number((0.08 + this.rand(i + this.tick + 44) * 1.5).toFixed(4)),
        price: Number(
          (priceBase + this.noise(i + this.tick, priceBase * 0.012)).toFixed(4),
        ),
        slippageBps: Number((1 + this.rand(i + this.tick + 7) * 6).toFixed(2)),
        venue: i % 2 === 0 ? "Binance" : "Bybit",
      };
    });
  }

  runStrategySimulation(days = 720, seed = 121) {
    const random = (() => {
      let s = seed % 2147483647;
      return () => {
        s = (s * 48271) % 2147483647;
        return (s - 1) / 2147483646;
      };
    })();

    const nextGaussian = () => {
      const u = Math.max(random(), 1e-10);
      const v = Math.max(random(), 1e-10);
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };

    const regimes: Regime[] = [
      "trend_up",
      "trend_down",
      "mean_revert",
      "high_vol",
    ];
    let prevRet = 0;

    const baseline: number[] = [];
    const ensemble: number[] = [];

    for (let i = 0; i < days; i += 1) {
      const regime = regimes[Math.floor(random() * regimes.length)];
      const mu =
        regime === "trend_up" ? 0.0014 : regime === "trend_down" ? -0.0012 : 0;
      const sigma = regime === "high_vol" ? 0.028 : 0.011;
      const marketRet = mu + 0.2 * prevRet + nextGaussian() * sigma;

      const baselinePos = prevRet === 0 ? 0 : 0.8 * Math.sign(prevRet);
      baseline.push(baselinePos * marketRet - (baselinePos ? 0.00035 : 0));

      const trendScore =
        0.65 * Math.sign(prevRet) +
        0.35 * Math.sign(prevRet * 0.7 + marketRet * 0.3);
      const mrScore = -Math.sign(prevRet);
      const regimeSignal =
        regime === "mean_revert"
          ? 0.88 * mrScore
          : regime === "high_vol"
            ? 0.35 * trendScore
            : 0.92 * trendScore;
      const confidence = Math.min(
        1,
        Math.max(0.15, 1 - Math.abs(marketRet) / 0.03),
      );
      const pos = Math.max(-1, Math.min(1, regimeSignal * confidence));
      ensemble.push(pos * marketRet - Math.abs(pos) * 0.00025);

      prevRet = marketRet;
    }

    const summarize = (rets: number[]) => {
      let equity = 1;
      let peak = 1;
      let maxDD = 0;
      let wins = 0;
      for (const r of rets) {
        equity *= 1 + r;
        peak = Math.max(peak, equity);
        maxDD = Math.max(maxDD, (peak - equity) / peak);
        if (r > 0) wins += 1;
      }
      const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
      const variance =
        rets.reduce((a, b) => a + (b - mean) ** 2, 0) /
        Math.max(1, rets.length - 1);
      const std = Math.sqrt(variance);

      return {
        totalReturnPct: Number(((equity - 1) * 100).toFixed(2)),
        sharpe: Number((std ? (mean / std) * Math.sqrt(252) : 0).toFixed(2)),
        maxDrawdownPct: Number((maxDD * 100).toFixed(2)),
        hitRatePct: Number(((wins / rets.length) * 100).toFixed(2)),
      };
    };

    const base = summarize(baseline);
    const ens = summarize(ensemble);

    return {
      assumptions: {
        horizonDays: days,
        transactionCosts: "included",
        note: "Synthetic scenario for pre-implementation model architecture validation.",
      },
      baseline: base,
      ensemble: ens,
      deltas: {
        sharpeLift: Number((ens.sharpe - base.sharpe).toFixed(2)),
        drawdownImprovementPct: Number(
          (base.maxDrawdownPct - ens.maxDrawdownPct).toFixed(2),
        ),
      },
    };
  }
}

export const tradingBrain = new TradingBrain();
