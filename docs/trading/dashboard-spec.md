# Trading Platform Dashboard Specification

## Navigation Structure

- `/ops/overview`
- `/ops/regimes`
- `/ops/execution`
- `/ops/risk`
- `/ops/strategies`
- `/ops/models`
- `/ops/attribution`
- `/research/experiments`
- `/research/backtests`
- `/research/stress-lab`
- `/admin/models`
- `/admin/audit`

## Shared UI Components

- KPI card (value + sparkline + threshold state)
- Regime badge cluster (confidence, change delta)
- Risk meter (green/yellow/red)
- Time-series chart with event markers
- Symbol table with sortable metrics
- Alert feed panel
- Incident timeline panel

## Page-by-Page Requirements

### 1) Overview (`/ops/overview`)

**Goal:** One-screen health + capital status.

- KPIs: NAV, daily PnL, rolling Sharpe, max drawdown, open risk.
- Charts: NAV curve, PnL decomposition, leverage utilization.
- Table: Top positions with confidence and stop distance.

### 2) Regime Monitor (`/ops/regimes`)

**Goal:** Validate the brain's context awareness.

- Regime probability timeline by symbol.
- Transition matrix heatmap.
- Regime-strategy contribution matrix.

### 3) Execution Quality (`/ops/execution`)

**Goal:** Control hidden cost leakage.

- Slippage expected vs realized.
- Fill ratio by venue and order type.
- Reject/error breakdown by reason.
- Latency p50/p95/p99.

### 4) Risk Command (`/ops/risk`)

**Goal:** Prevent catastrophic loss.

- Hard-limit utilization bars.
- Live alerts for nearing limits.
- Kill-switch controls (global / per strategy / per venue).
- Auto-de-risk event log.

### 5) Strategies (`/ops/strategies`)

**Goal:** Evaluate alpha components.

- Per-strategy return, Sharpe, turnover, drawdown.
- Signal quality decay chart.
- Exposure by regime and symbol cluster.

### 6) Models (`/ops/models`)

**Goal:** Keep model behavior trustworthy.

- Drift monitors (feature + concept drift).
- Calibration reliability chart.
- Confidence distribution and abstention rate.
- Model version and canary status.

### 7) Attribution (`/ops/attribution`)

**Goal:** Explain where PnL came from.

- Factor/regime/venue contribution waterfall.
- Cost attribution: fees, slippage, impact.
- Missed-opportunity panel.

### 8) Research Pages (`/research/*`)

**Goal:** Support systematic iteration.

- Experiment metadata + result comparison.
- Walk-forward backtest explorer.
- Stress scenario replay timeline.

### 9) Admin & Audit (`/admin/*`)

**Goal:** Operability and compliance.

- Model promotion and rollback controls.
- Immutable order decision logs.
- API key access and action audit.

## Alerting UX

- Severity: info/warn/critical.
- Routing: Slack + email + pager.
- Mandatory acknowledgment for critical risk alerts.

## Role-based Access

- Trader: ops pages + limited controls.
- Quant: research pages + model diagnostics.
- Risk Officer: risk + audit + controls.
- Admin: full access.
