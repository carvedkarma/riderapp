# Trading Brain + PC Dashboard Implementation Plan

## What is now implemented

- **Backend brain service** with:
  - regime-aware telemetry stream
  - open positions feed
  - recent execution feed
  - simulation API for baseline vs ensemble comparison
- **PC dashboard route** at `/trading` with:
  - KPI cards (NAV, PnL, Sharpe proxy, drawdown)
  - NAV chart
  - positions/executions tables
  - simulation panel that calls backend comparator API

## API Surface

- `GET /api/trading/overview`
- `GET /api/trading/positions`
- `GET /api/trading/executions`
- `POST /api/trading/simulate` with JSON body:

```json
{
  "days": 720,
  "seed": 121
}
```

## How to run

1. Start server:

```bash
npm run server:dev
```

2. Open:

- `http://localhost:5000/trading`

## Next hardening tasks

1. Replace synthetic brain values with real exchange ingestion.
2. Move simulation engine into event-driven fill-aware backtester.
3. Add persistent strategy config and risk-limit controls.
4. Add auth and role-based controls for command actions.
