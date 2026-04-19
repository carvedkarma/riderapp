# Autonomous Crypto Trading System - Full Design Before Implementation

## 1) Product Vision

Build a production-grade autonomous crypto trading platform that is:

- **Model-first** (alpha quality is the center of the system)
- **Risk-ruthless** (capital protection over trade frequency)
- **Execution-aware** (slippage/fees/latency are first-class citizens)
- **Operator-visible** (dashboards for every critical subsystem)

This design is intended to be implemented in phases only after simulation and validation gates are passed.

---

## 2) End-to-End Architecture

```text
Data Sources (exchanges, derivatives, on-chain, news)
  -> Ingestion (stream + batch)
  -> Data Quality + Time Alignment + Feature Store
  -> Model Stack (regime classifier + alpha ensemble + uncertainty)
  -> Decision Layer (signal fusion + meta labeling)
  -> Risk Layer (hard limits + soft controls + kill-switch)
  -> Execution Layer (smart order router + venue adapter)
  -> Post-trade Analytics + Monitoring + Retraining
```

### Core Services

1. **market-data-service**
   - Collects L1/L2 trades, candles, funding, OI, liquidations.
2. **feature-pipeline-service**
   - Event-time alignment, lag-safe transforms, online/offline parity.
3. **model-service**
   - Serves regime probabilities, signal scores, uncertainty bands.
4. **portfolio-service**
   - Converts model outputs into target exposure vectors.
5. **risk-service**
   - Enforces drawdown, leverage, concentration, and event blackout rules.
6. **execution-service**
   - Places/cancels orders, routing logic, slippage guardrails.
7. **monitoring-service**
   - PnL attribution, drift alerts, infra health, incident telemetry.

---

## 3) Trading Brain (Primary Design)

### 3.1 Regime Layer (Gatekeeper)

- Predicts `trend_up`, `trend_down`, `mean_revert`, `high_vol`.
- Every downstream strategy is weighted by regime confidence.
- If confidence is low, risk layer shrinks leverage and may force flat mode.

### 3.2 Signal Layer (Ensemble)

- **Microstructure model** (short horizon): order flow imbalance, spread state, trade toxicity.
- **Momentum model** (intraday): trend persistence and continuation probabilities.
- **Mean reversion model**: dislocation snapback probability.
- **Carry/basis model**: funding + term structure edges.

### 3.3 Meta Model

- Estimates probability a candidate trade reaches target before stop.
- Acts as a precision filter to reduce low-quality entries.

### 3.4 Uncertainty Layer

- Produces confidence intervals and calibration metrics.
- Position size is scaled down when predictive uncertainty increases.

---

## 4) Risk Architecture (Non-negotiable)

### Hard limits

- Daily max loss (strategy and portfolio level)
- Weekly max drawdown cap
- Symbol concentration cap
- Venue exposure cap
- Max notional and leverage limits

### Soft controls

- Regime-conditioned sizing
- News/event blackout windows
- Liquidity stress multipliers (reduce size)
- Drift-triggered auto de-risking

### Safety automation

- Global kill-switch endpoint
- Auto flat mode on exchange degradation
- Auto fallback to conservative baseline strategy

---

## 5) Dashboard and Pages (Complete UX Map)

## A. Operator Console (Web)

1. **Global Overview**
   - Real-time NAV, intraday PnL, drawdown, open risk.
   - Model confidence heatmap across symbols.
2. **Regime Monitor**
   - Current regime probabilities and transition timeline.
   - Regime-specific strategy contribution.
3. **Execution Quality**
   - Slippage vs expected by venue/symbol.
   - Fill ratio, reject ratio, cancel latency.
4. **Risk Command Center**
   - Hard limit utilization bars.
   - Kill-switch controls and incident timeline.
5. **Strategy Performance**
   - Per-strategy Sharpe, win-rate, turnover, decay.
6. **Model Diagnostics**
   - Feature drift, label drift, calibration curves.
7. **Attribution Explorer**
   - PnL by factor, regime, and execution cost.

## B. Research Dashboard (Quant)

1. **Experiment Tracker**
   - Run metadata, dataset snapshot, hyperparameters.
2. **Backtest Explorer**
   - Walk-forward results with purging/embargo splits.
3. **Stress Test Lab**
   - Scenario replay for crash and liquidity drought windows.

## C. Admin + Audit Dashboard

1. **Model Registry View**
   - Approved models, canary cohorts, rollback pointers.
2. **Key Management + Access Logs**
   - API key usage, permission anomalies.
3. **Compliance Audit Trail**
   - Full order decision trace with reason codes.

---

## 6) Simulation-First Delivery Plan

### Stage 1: Architecture simulation (already prepared)

- Compare baseline momentum vs regime-aware ensemble with risk overlay.
- Include fees and position scaling.

### Stage 2: Event-driven backtest simulation

- Simulate fills, latency, partial fills, funding, and impact.

### Stage 3: Paper trading (shadow mode)

- Live market data, no real capital.
- Validate signal behavior and risk responses.

### Stage 4: Controlled live canary

- Tiny capital, strict notional cap, auto rollback.

---

## 7) Go/No-Go Criteria Before Real Implementation

- Out-of-sample Sharpe above predefined threshold for multiple regimes.
- Max drawdown below risk mandate.
- Slippage model error within tolerance.
- Drift alarms tested and rollback proven.
- Paper-trade incident-free period completed.

---

## 8) Immediate Next Implementation Artifacts

1. Service contracts (OpenAPI/gRPC schema)
2. Data contracts (topic + table schema)
3. Risk policy configuration package
4. Model input feature dictionary
5. Dashboard page components and navigation map
6. CI checks for simulation and risk rule regression
