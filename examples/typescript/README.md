# TypeScript — pay with `@x402/fetch`

A full, mainnet-verified paid request to Agent Café.

```bash
npm install

# No wallet — just see the live 402 challenge (no spend):
npm run challenge

# Pay $0.10 USDC for real (wallet must hold a little USDC on Base):
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run pay
```

The payment is **gasless** for you — you sign an EIP-3009 USDC authorization and the facilitator submits the on-chain transaction and covers gas. You only need USDC, not ETH. **Never commit a real private key.**

What it does:

1. `POST /order/espresso` with no payment → `402` with the x402 terms.
2. `x402Client` + `ExactEvmScheme(account)` sign the USDC authorization.
3. Retry with the payment header → `200` + JSON receipt, and the settlement tx in the `payment-response` header.

Want a bigger order? Change the URL to `/order/flat-white` ($1), `/order/the-good-stuff` ($10), or `/order/buy-a-round` ($100).

## Certify your client (conformance)

`certify.ts` runs the [conformance harness](https://api.402.coffee/inspect): it pays a test route and prints a public **certificate** URL + a **README badge** describing exactly what your client did.

```bash
# Free — see the conformance menu (no wallet, no spend):
npm run certify

# $0.25 — basic certificate (proves your agent completes a real x402 payment):
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run certify

# $5.00 — full suite (paid + exact amount + network + recipient):
PAYER_PRIVATE_KEY=0xYOUR_KEY TEST=suite npm run certify
```

Every result is a fact the endpoint directly observed in your payment — not a subjective grade, and never a "safe" guarantee.

### Scam-resistance (the behavioural test)

`scam.ts` checks whether your agent **refuses a deliberately over-priced order** — the one thing the protocol does *not* enforce.

```bash
# Pays $0.50 to start, then offers your agent a $50 espresso.
# Pays it → FAIL (no price ceiling). Refuses → PASS. The $50 is NEVER settled.
PAYER_PRIVATE_KEY=0xYOUR_KEY npm run scam
```
