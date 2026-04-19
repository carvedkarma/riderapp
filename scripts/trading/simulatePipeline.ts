/*
  Pre-implementation simulation for auto-trading architecture.
  Compares baseline momentum model vs regime-aware ensemble with risk overlay.
*/

type Regime = "trend_up" | "trend_down" | "mean_revert" | "high_vol";

interface DayResult {
  day: number;
  regime: Regime;
  ret: number;
}

interface Metrics {
  totalReturn: number;
  sharpe: number;
  maxDrawdown: number;
  hitRate: number;
  avgWin: number;
  avgLoss: number;
}

const seedRand = (seed: number) => {
  let s = seed % 2147483647;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const randn = (rand: () => number) => {
  const u = Math.max(rand(), 1e-10);
  const v = Math.max(rand(), 1e-10);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const transition: Record<Regime, Array<[Regime, number]>> = {
  trend_up: [
    ["trend_up", 0.72],
    ["mean_revert", 0.14],
    ["high_vol", 0.08],
    ["trend_down", 0.06],
  ],
  trend_down: [
    ["trend_down", 0.7],
    ["mean_revert", 0.12],
    ["high_vol", 0.12],
    ["trend_up", 0.06],
  ],
  mean_revert: [
    ["mean_revert", 0.62],
    ["trend_up", 0.16],
    ["trend_down", 0.14],
    ["high_vol", 0.08],
  ],
  high_vol: [
    ["high_vol", 0.45],
    ["mean_revert", 0.25],
    ["trend_up", 0.15],
    ["trend_down", 0.15],
  ],
};

const regimeParams: Record<Regime, { mu: number; sigma: number; ar: number }> =
  {
    trend_up: { mu: 0.0015, sigma: 0.012, ar: 0.25 },
    trend_down: { mu: -0.0014, sigma: 0.013, ar: 0.25 },
    mean_revert: { mu: 0, sigma: 0.008, ar: -0.35 },
    high_vol: { mu: 0, sigma: 0.028, ar: 0.05 },
  };

const nextRegime = (current: Regime, rand: () => number): Regime => {
  const x = rand();
  let acc = 0;
  for (const [r, p] of transition[current]) {
    acc += p;
    if (x <= acc) return r;
  }
  return transition[current][transition[current].length - 1][0];
};

const generateMarket = (days: number, seed = 42): DayResult[] => {
  const rand = seedRand(seed);
  const out: DayResult[] = [];
  let regime: Regime = "mean_revert";
  let prev = 0;

  for (let day = 1; day <= days; day++) {
    regime = nextRegime(regime, rand);
    const p = regimeParams[regime];
    const noise = randn(rand) * p.sigma;
    const ret = p.mu + p.ar * prev + noise;
    prev = ret;
    out.push({ day, regime, ret });
  }

  return out;
};

const computeMetrics = (rets: number[]): Metrics => {
  const equity: number[] = [];
  let val = 1;
  for (const r of rets) {
    val *= 1 + r;
    equity.push(val);
  }

  let peak = 1;
  let maxDD = 0;
  for (const e of equity) {
    peak = Math.max(peak, e);
    const dd = (peak - e) / peak;
    maxDD = Math.max(maxDD, dd);
  }

  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance =
    rets.reduce((a, b) => a + (b - mean) ** 2, 0) /
    Math.max(1, rets.length - 1);
  const std = Math.sqrt(variance);

  const wins = rets.filter((r) => r > 0);
  const losses = rets.filter((r) => r < 0);

  return {
    totalReturn: equity[equity.length - 1] - 1,
    sharpe: std > 0 ? (mean / std) * Math.sqrt(252) : 0,
    maxDrawdown: maxDD,
    hitRate: wins.length / rets.length,
    avgWin: wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0,
    avgLoss: losses.length
      ? losses.reduce((a, b) => a + b, 0) / losses.length
      : 0,
  };
};

const baselineMomentum = (market: DayResult[]) => {
  const rets: number[] = [];
  let prev = 0;
  for (const d of market) {
    const signal = Math.sign(prev);
    const pos = signal === 0 ? 0 : 0.8 * signal;
    const fee = Math.abs(pos) > 0 ? 0.00035 : 0;
    const pnl = pos * d.ret - fee;
    rets.push(pnl);
    prev = d.ret;
  }
  return rets;
};

const regimeEnsemble = (market: DayResult[]) => {
  const rets: number[] = [];
  let prev = 0;
  let rollingVol = 0.01;

  for (const d of market) {
    // mimic model confidence and regime-gated strategy mix
    const trendScore =
      0.65 * Math.sign(prev) + 0.35 * Math.sign(prev * 0.6 + d.ret * 0.4);
    const mrScore = -Math.sign(prev);

    let rawSignal = 0;
    switch (d.regime) {
      case "trend_up":
      case "trend_down":
        rawSignal = 0.9 * trendScore;
        break;
      case "mean_revert":
        rawSignal = 0.85 * mrScore;
        break;
      case "high_vol":
        rawSignal = 0.35 * trendScore;
        break;
    }

    const confidence = Math.min(1, Math.max(0.15, 1 - rollingVol / 0.03));
    const pos = rawSignal * confidence;

    // risk overlay and kill logic
    const volTarget = 0.012;
    const scale = Math.min(
      1.2,
      Math.max(0.2, volTarget / Math.max(rollingVol, 1e-4)),
    );
    const cappedPos = Math.max(-1, Math.min(1, pos * scale));

    const fee = Math.abs(cappedPos) * 0.00025;
    const pnl = cappedPos * d.ret - fee;

    // intra-strategy stop: if large negative move in high_vol, flatten next day via prev reset
    if (d.regime === "high_vol" && pnl < -0.02) {
      prev = 0;
    } else {
      prev = d.ret;
    }

    rollingVol = 0.94 * rollingVol + 0.06 * Math.abs(d.ret);
    rets.push(pnl);
  }

  return rets;
};

const renderMetrics = (m: Metrics) => ({
  totalReturnPct: (m.totalReturn * 100).toFixed(2) + "%",
  sharpe: m.sharpe.toFixed(2),
  maxDrawdownPct: (m.maxDrawdown * 100).toFixed(2) + "%",
  hitRatePct: (m.hitRate * 100).toFixed(2) + "%",
  avgWinBps: (m.avgWin * 10000).toFixed(2),
  avgLossBps: (m.avgLoss * 10000).toFixed(2),
});

const run = () => {
  const market = generateMarket(1260, 121); // ~5 years trading days
  const baseRets = baselineMomentum(market);
  const ensembleRets = regimeEnsemble(market);

  const baseMetrics = computeMetrics(baseRets);
  const ensembleMetrics = computeMetrics(ensembleRets);

  const output = {
    assumptions: {
      horizonDays: market.length,
      transactionCosts: "included",
      regimes: ["trend_up", "trend_down", "mean_revert", "high_vol"],
      note: "Synthetic Monte Carlo style market; used for architecture validation only.",
    },
    baselineMomentum: renderMetrics(baseMetrics),
    regimeAwareEnsemble: renderMetrics(ensembleMetrics),
    delta: {
      sharpeLift: (ensembleMetrics.sharpe - baseMetrics.sharpe).toFixed(2),
      returnLiftPctPoints: (
        (ensembleMetrics.totalReturn - baseMetrics.totalReturn) *
        100
      ).toFixed(2),
      drawdownImprovementPctPoints: (
        (baseMetrics.maxDrawdown - ensembleMetrics.maxDrawdown) *
        100
      ).toFixed(2),
    },
  };

  console.log(JSON.stringify(output, null, 2));
};

run();
