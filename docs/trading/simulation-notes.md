# Pre-Implementation Simulation Notes

Simulation command:

```bash
node scripts/trading/simulatePipeline.ts > docs/trading/simulation-results.json
```

## What was simulated

- Synthetic market with four regimes:
  - trend_up
  - trend_down
  - mean_revert
  - high_vol
- Baseline: momentum-only strategy with fixed exposure.
- Candidate architecture: regime-aware ensemble + confidence scaling + risk overlay.
- Transaction costs included in both cases.

## Why this matters

This simulation does **not** prove live profitability. It is an architectural sanity check to validate that:

1. Regime-aware gating can materially reduce drawdowns in unstable regimes.
2. Confidence-based sizing can improve risk-adjusted performance.
3. Precision filtering can improve hit rate while reducing tail losses.

## Interpretation rules

- Use this only as a design gate, not as an investment claim.
- Move to event-driven backtesting with realistic fills/latency before coding live execution.
- Require paper-trading evidence before enabling capital deployment.
