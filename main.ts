// Bot A: swing dip-buy with symmetric take-profit.
// Tracks the running peak of closes while flat. When price is at least DIP below
// that peak, buys with full equity at the next open. While holding, sells the whole
// position at the next open once price is at least TAKE_PROFIT above the entry fill
// (entry approximated by the next open times one round-trip cost), then resets the
// peak so the next entry waits for a fresh high and a fresh dip.

import { BPS, runBars, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const DIP_NUM = 985n; // 98.5% of the peak -> -1.5%
const DIP_DEN = 1000n;
const TP_NUM = 1015n; // +1.5% over entry
const TP_DEN = 1000n;
const RT_COST_NUM = 10026n; // one round trip ~26 bps (4 fee + 2 slip + ~7 impact each way)
const RT_COST_DEN = 10000n;
const MAX_SLIPPAGE_BPS = 100;

/** Running peak of closes while flat; reset after each exit so the next entry needs a fresh high. */
let peak = 0n;
/** Estimated cost basis of the open position, in quote units, for the take-profit check. */
let entryCost = 0n;

await runBars({
  onBatch(state: BarsState, batch) {
    const symbol = state.hello.symbols[0].symbol;
    const close = state.close(symbol);
    if (close === null) return [];
    const { caps, fees } = state.hello;

    const held = state.positions.get(symbol);
    if (held === undefined) {
      if (peak === 0n || close > peak) peak = close;
      if (peak === 0n) return [];
      // buy when close <= peak * 0.985
      if (close * DIP_DEN > peak * DIP_NUM) return [];
      const byWeight = (BigInt(caps.max_weight_bps) * state.equity) / BPS;
      const spend = state.cash < byWeight ? state.cash : byWeight;
      if (spend === 0n || spend < BigInt(fees.min_notional_quote_units)) return [];
      entryCost = spend * RT_COST_NUM / RT_COST_DEN;
      const buy: BuyInput = { side: 'buy', symbol, notional_quote_units: spend, max_slippage_bps: MAX_SLIPPAGE_BPS };
      return [buy];
    }

    // held: sell at take-profit over the estimated entry cost
    const value = state.value(symbol, held.qty);
    if (value * TP_DEN >= entryCost * TP_NUM) {
      peak = 0n;
      entryCost = 0n;
      const sell: SellInput = { side: 'sell', symbol, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS };
      return [sell];
    }
    return [];
  },
});