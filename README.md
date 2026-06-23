# Agent Café — test & certify your x402 agent

**The hello world of agent payments.** Copy-paste working examples for [**`https://api.402.coffee`**](https://402.coffee) — a live [x402](https://x402.org) endpoint on Base that doubles as a **client conformance harness**.

Every other tool grades the *seller's* endpoint. Agent Café grades **your agent**: point your x402 client at a test route, it pays real USDC, and you get back a **public certificate** and a **README badge** of exactly what it did — because you can't fake an on-chain payment. Every result is a fact observed on-chain.

- **The menu (machine-readable):** https://api.402.coffee/inspect
- **Docs:** https://api.402.coffee/docs
- **Live status:** https://api.402.coffee/status

## The menu

| Route | Price | What it certifies |
|---|---|---|
| `GET /inspect` | free | the menu + how to run it. No wallet, no spend. |
| `POST /test/basic` | $0.25 | your agent completed a real x402 payment → certificate + badge |
| `POST /test/scam/start` | $0.50 | scam-resistance — does your agent refuse a deliberately over-priced order? |
| `POST /test/recipient/start` | $0.50 | recipient-awareness — does your agent notice a swapped recipient? |
| `POST /test/suite` | $0.75 | full certificate — payment + authorization-expiry hygiene + protocol/nonce facts |

## Certify your agent (start here)

```bash
cd examples/typescript && npm install

npm run certify                                   # free: see the menu (no spend)
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run certify       # $0.25 → certificate + badge
PAYER_PRIVATE_KEY=0xYOUR_KEY TEST=suite npm run certify  # $0.75 → full suite
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run scam          # $0.50 → does your agent get scammed?
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run recipient     # $0.50 → does your agent check who it's paying?
```

You earn a badge for your README:

[![x402 client verified](https://api.402.coffee/badge/0d8a0f9331ae93ec.svg)](https://api.402.coffee/cert/0d8a0f9331ae93ec)

The payment is **gasless** (EIP-3009) — your wallet only needs a little USDC on Base, no ETH. **Never commit a real private key.**

## How payment works (standard x402)

1. `POST /test/basic` with no payment → server replies **HTTP 402** with the x402 terms (scheme `exact`, network `eip155:8453` = Base mainnet, amount, USDC asset, `payTo`).
2. Your client signs an EIP-3009 USDC authorization (gasless) and retries with the payment header.
3. A facilitator settles on-chain → **HTTP 200** with your certificate (`verdict`, `level`, `cert_url`, `badge_url`).

See the live 402 in 5 seconds, no wallet, no spend:

```bash
curl -i -X POST https://api.402.coffee/test/basic
# → HTTP/2 402, with a base64 x402 challenge in the "payment-required" header
```

## Examples

| Language | Pays for real? | Folder |
|---|---|---|
| TypeScript — `certify.ts` / `scam.ts` | ✅ full certify + scam flow | [`examples/typescript`](examples/typescript) |
| curl | sees the 402 challenge (no spend) | [`examples/curl`](examples/curl) |
| Python | sees the 402 challenge (no spend) | [`examples/python`](examples/python) |
| Browser | sees the 402 from a browser (proves CORS) | [`examples/browser`](examples/browser) |

> The **TypeScript** examples are the fully-worked, mainnet-verified flows. The café also exposes novelty "coffee" routes (`/order/espresso`, …) that take a real payment the same way — a fun way to make a basic payment.

## Tests / CI

[`test/smoke.mjs`](test/smoke.mjs) is a dependency-free Node check that asserts the endpoint is healthy and challenges correctly — no funds needed. It runs in CI on every push (see [`.github/workflows/smoke.yml`](.github/workflows/smoke.yml)).

```bash
node test/smoke.mjs
```

## Notes

- **Idempotency:** retry the *same* payment and you get the cached result back (`X-Idempotent-Replay: true`) — no double charge.
- **Gasless:** the payer signs an EIP-3009 authorization; the facilitator submits the on-chain tx and covers gas. You only need USDC, not ETH.
- Not affiliated with Coinbase or the x402 maintainers — just a friendly reference + conformance endpoint for the ecosystem.

## License

MIT — see [LICENSE](LICENSE).
