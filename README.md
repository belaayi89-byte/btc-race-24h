# btc-race-24h

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/belaayi89-byte/btc-race-24h/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/belaayi89-byte/btc-race-24h/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

cbBTC 1-minute swing bot for make.fun bounty
[`btc-race-24h-20261117-0603`](https://make.fun/bounty/btc-race-24h-20261117-0603).

## Strategy

- While flat, track the running peak of 1-minute closes.
- Buy with full equity at the next open when price is at least 1.5% below that peak.
- While holding, sell the whole position at the next open once price is at least 1.5%
  above the estimated entry cost (one round trip of fees, slippage and price impact).
- Reset the peak after each exit so the next entry waits for a fresh high and a fresh dip.

Long only, one position at a time, no leverage. Deterministic: two runs on the same
bars produce the same orders (all arithmetic on integers or fixed constants; no wall
clock, no randomness, no network, no files outside the repository).

## Layout

- `main.ts` — the bot (Node 22, erasable TypeScript only)
- `vendor/makefun-bars.ts` — byte-identical copy of the make.fun bars SDK shim

## License

MIT
