# TypeScript examples — `@x402/fetch`

Fully-worked, mainnet-verified flows for [402.coffee](https://402.coffee), the trust layer for agent payments. All payments are **gasless** (EIP-3009) — your wallet only needs a little USDC on Base, no ETH. **Never commit a real private key.**

```bash
npm install
```

## Certify — prove your agent pays safely

```bash
npm run challenge                                  # free: see a live 402 (no spend)
PAYER_PRIVATE_KEY=0x… npm run certify               # $0.25 → certificate + badge
PAYER_PRIVATE_KEY=0x… TEST=suite npm run certify    # $0.75 → full suite
PAYER_PRIVATE_KEY=0x… npm run scam                  # $0.60 → pays a fair order AND refuses a $50 scam?
PAYER_PRIVATE_KEY=0x… npm run recipient             # $0.60 → pays the real recipient AND refuses a swap?
```

`certify.ts` prints a public **certificate** URL + a **README badge**. `scam.ts` and `recipient.ts` are the behavioural tests — each serves two challenges in random order; a PASS needs your agent to pay the fairly-priced control **and** refuse the bait. A client that simply stops earns no certificate. Every result is a fact observed on-chain.

## Score — check any wallet before you transact

`score.ts` calls the free `/verify`, then the paid `/score` if you provide a payer key:

```bash
npm run verify -- 0x<wallet>                         # free: boolean + per-capability detail
PAYER_PRIVATE_KEY=0x… npm run score -- 0x<wallet>    # $0.10: deterministic 0–100 risk score
```

The score is itemized from on-chain evidence (payment capability, scam-resistance, recipient-awareness, history, on-chain activity), with a tier (A–F / unrated) and flags. Batch up to 25 wallets in one $0.50 call: `POST /score/batch {"wallets":[…]}`.

## Escrow — sell with buyer protection

Escrow is a **merchant** integration: route your own x402 sales through the 402.coffee delivery-protection operator so funds are held on-chain until an automated arbiter verifies delivery (release minus 1%, or buyer refund). It's non-custodial. See the full policy + integration snippet at **https://api.402.coffee/escrow** and [docs.x402r.org](https://docs.x402r.org/). Live reference route: `POST /escrow/demo`.

## Coffee (novelty)

`pay.ts` makes a basic payment against a novelty "coffee" route (`/order/espresso`, `/order/flat-white`) — a fun way to run a plain x402 payment.

```bash
PAYER_PRIVATE_KEY=0x… npm run pay
```
