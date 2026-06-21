# Agent Café — x402 examples

**The hello world of agent payments.** Copy-paste working examples that pay a live [x402](https://x402.org) endpoint — real USDC on Base — and get a machine-readable receipt.

The endpoint is **[`https://api.402.coffee`](https://402.coffee)**. It's always on, speaks plain standard x402 (no special extensions required), and any standard x402 client can pay it first try. Use it to prove your agent can actually pay for something.

- **Live status:** https://api.402.coffee/status
- **Machine-readable menu:** https://api.402.coffee/menu
- **Docs:** https://api.402.coffee/docs

## The flow (every example does this)

1. `POST /order/espresso` with no payment → server replies **HTTP 402** with the x402 payment terms (scheme `exact`, network `eip155:8453` = Base mainnet, amount, USDC asset, `payTo`).
2. Your client signs an EIP-3009 USDC authorization (gasless for you) and retries with the payment header.
3. A facilitator settles on-chain → server replies **HTTP 200** with the JSON receipt. The order shows up on the public [wall](https://402.coffee/#wall).

## The menu

| Item | Price | `POST` |
|---|---|---|
| Espresso | $0.10 | `/order/espresso` |
| Flat White | $1.00 | `/order/flat-white` |
| The Good Stuff | $10.00 | `/order/the-good-stuff` |
| Buy a Round | $100.00 | `/order/buy-a-round` |

Prices are real USDC on Base mainnet. Start with **espresso ($0.10)**.

## Examples

| Language | Pays for real? | Folder |
|---|---|---|
| curl | sees the 402 challenge (no spend) | [`examples/curl`](examples/curl) |
| TypeScript (`@x402/fetch`) | ✅ full paid flow | [`examples/typescript`](examples/typescript) |
| Python | sees the 402 challenge (no spend) | [`examples/python`](examples/python) |
| Browser | sees the 402 challenge from a browser (proves CORS) | [`examples/browser`](examples/browser) |

> The **TypeScript** example is the fully-worked, mainnet-verified paid request. The others show the live 402 challenge without spending — paying from them uses the x402 client for that language.

## Try it in 5 seconds (no wallet, no spend)

```bash
curl -i -X POST https://api.402.coffee/order/espresso
# → HTTP/2 402, with a base64 x402 challenge in the "payment-required" header
```

## Certify your x402 client

Agent Café also runs an **x402 client conformance harness** — the inverse of the tools that grade *servers*. Point your **paying agent** at a test route; it pays, and you get back a public, timestamped **certificate** of exactly what your client did, plus a **README badge**. Because you can't fake an on-chain payment, it's real proof your agent can transact.

```bash
cd examples/typescript && npm install

# Free — see the conformance menu, no wallet, no spend:
npm run certify

# Certify for real ($0.25) → certificate + badge:
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run certify

# Full suite ($5) → paid + exact amount + network + recipient:
PAYER_PRIVATE_KEY=0xYOUR_KEY TEST=suite npm run certify
```

Browse the menu in a browser: **https://api.402.coffee/inspect** · Every result is a fact the endpoint directly observed in your payment — not a subjective grade, never a "safe" guarantee.

## Tests / CI

[`test/smoke.mjs`](test/smoke.mjs) is a dependency-free Node check that asserts the endpoint is healthy and challenges correctly — no funds needed. It runs in CI on every push (see [`.github/workflows/smoke.yml`](.github/workflows/smoke.yml)); copy it into your own pipeline to fail your build if your agent's payment target ever goes down.

```bash
node test/smoke.mjs
```

## Notes

- **Idempotency:** retry the *same* payment and you get the cached receipt back (`X-Idempotent-Replay: true`) — no double charge. Lost the response? Recover by tx: `GET /receipt?tx=0x…`.
- **Gasless:** the payer signs an EIP-3009 authorization; the facilitator submits the on-chain tx and covers gas. You only need USDC, not ETH.
- Not affiliated with Coinbase or the x402 maintainers — just a friendly reference endpoint for the ecosystem.

## License

MIT — see [LICENSE](LICENSE).
