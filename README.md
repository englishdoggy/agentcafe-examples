# Agent Café — the trust layer for agent payments

Copy-paste working examples for [**`https://api.402.coffee`**](https://402.coffee) — a live [x402](https://x402.org) endpoint on Base that makes agent money safe at every step. Three services, one endpoint, all settling in real USDC on Base and verifiable on-chain:

- **Certify** — a paying agent proves it pays correctly, refuses over-priced scams, and checks who it's paying → a public certificate + README badge.
- **Score** — get a deterministic 0–100 payment-risk score for any wallet *before* you transact with it.
- **Escrow** — sell over x402 with buyer protection: funds held on-chain until an automated arbiter verifies delivery.

Every result is a fact the endpoint observed on-chain — never a subjective grade, and never a blanket "safe" guarantee.

- **The menu (machine-readable):** https://api.402.coffee/inspect
- **Docs:** https://api.402.coffee/docs · **Status:** https://api.402.coffee/status

```bash
cd examples/typescript && npm install
```

The payment is **gasless** (EIP-3009) — your wallet only needs a little USDC on Base, no ETH. **Never commit a real private key.**

---

## 1. Certify — for paying agents

Prove your agent pays safely and earn a public credential.

```bash
npm run certify                                    # free: see the menu (no spend)
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run certify        # $0.25 → certificate + badge
PAYER_PRIVATE_KEY=0xYOUR_KEY TEST=suite npm run certify   # $0.75 → full suite
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run scam           # $0.60 → pays a fair order AND refuses a $50 scam?
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run recipient      # $0.60 → pays the real recipient AND refuses a swap?
```

The behavioural tests need **positive evidence**: your agent must pay a fairly-priced control **and** refuse the bait (served in random order). A client that simply stalls earns no certificate.

You earn a badge for your README:

[![x402 client verified](https://api.402.coffee/badge/0d8a0f9331ae93ec.svg)](https://api.402.coffee/cert/0d8a0f9331ae93ec)

| Route | Price | What it certifies |
|---|---|---|
| `GET /inspect` | free | the menu + how to run it. No wallet, no spend. |
| `POST /test/basic` | $0.25 | your agent completed a real x402 payment → certificate + badge |
| `POST /test/scam/start` | $0.60 total | scam-resistance — pays a fair $0.10 control AND refuses a $50 bait (random order) |
| `POST /test/recipient/start` | $0.60 total | recipient-awareness — pays the real recipient AND refuses an identically-priced swap |
| `POST /test/suite` | $0.75 | full certificate — payment + authorization-expiry hygiene + protocol/nonce facts |

Each certificate is **valid for 30 days** (`valid_until`). The record is permanent and never voided — after that it's `expired` (no longer current) and the agent should re-verify.

---

## 2. Score — for sellers, wallets & marketplaces

Check any wallet *before* you let it transact. `/verify` is free; `/score` is the decision-grade signal.

```bash
npm run verify -- 0x<wallet>                        # free: boolean + per-capability detail
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run score -- 0x<wallet>   # $0.10: full 0–100 risk score
```

`score.ts` calls the free `/verify` then, if you provide a payer key, the paid `/score`:

```bash
# free, no wallet:
curl "https://api.402.coffee/verify?wallet=0x<agent>"
# paid ($0.10 USDC on Base) — deterministic 0–100 with itemized on-chain evidence, tier, flags:
curl -X POST https://api.402.coffee/score -H 'content-type: application/json' -d '{"wallet":"0x<agent>"}'
# batch up to 25 wallets in one $0.50 call:
curl -X POST https://api.402.coffee/score/batch -H 'content-type: application/json' -d '{"wallets":["0x…"]}'
```

The score is built only from behaviour observed on-chain — a payment-risk signal, not credit or investment advice, and never a guarantee of future conduct.

---

## 3. Escrow — for merchants selling over x402

Sell with buyer protection. Route your x402 payments through the 402.coffee delivery-protection operator: funds sit in an on-chain escrow contract until an automated arbiter verifies your delivery, then release to you **minus 1%** — or the buyer is refunded on failed delivery. **Non-custodial** (the escrow contract holds the funds, never us); if the arbiter is ever down, buyers self-refund after the escrow window.

Full policy, contracts, and fee terms: **https://api.402.coffee/escrow** · live reference route: `POST /escrow/demo`.

Merchant integration (Node/TypeScript, `@x402r/*`):

```ts
import { x402ResourceServer } from "@x402/next";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { CommerceServerScheme } from "@x402r/evm/commerce/server";
import { forwardToArbiter } from "@x402r/helpers";

// GET /escrow returns the exact operator, escrow, tokenCollector, and fee terms to put in `extra`.
const server = new x402ResourceServer(new HTTPFacilitatorClient({ url: "https://facilitator.ultravioletadao.xyz" }))
  .register("eip155:8453", new CommerceServerScheme())
  .onAfterSettle(forwardToArbiter("https://api.402.coffee/escrow")); // notifies the arbiter to verify + release
```

Quote the `commerce` scheme with `extra.operatorAddress` / `extra.feeReceiver = <operator>` / `minFeeBps:0, maxFeeBps: <=500` (see `/escrow`), and the arbiter handles release/refund. See [docs.x402r.org](https://docs.x402r.org/) for the full SDK.

---

## How payment works (standard x402)

1. `POST` a paid route with no payment → server replies **HTTP 402** with the x402 terms (scheme, network `eip155:8453` = Base mainnet, amount, USDC asset, `payTo`).
2. Your client signs an EIP-3009 USDC authorization (gasless) and retries with the payment header.
3. A facilitator settles on-chain → **HTTP 200** with the result.

See a live 402 in 5 seconds, no wallet, no spend:

```bash
curl -i -X POST https://api.402.coffee/test/basic
```

402.coffee is a registered **ERC-8004** agent on Base (#56900), built for autonomous agents — machine-readable discovery at [`/inspect`](https://api.402.coffee/inspect), [`/.well-known/agent.json`](https://api.402.coffee/.well-known/agent.json), and [`/llms.txt`](https://api.402.coffee/llms.txt).

## Notes

- **Idempotency:** retry the *same* payment and you get the cached result back (`X-Idempotent-Replay: true`) — no double charge.
- **Gasless:** the payer signs an EIP-3009 authorization; the facilitator submits the on-chain tx and covers gas. You only need USDC, not ETH.
- Not affiliated with Coinbase or the x402 maintainers — a friendly, neutral trust layer for the ecosystem.

## License

MIT — see [LICENSE](LICENSE).
