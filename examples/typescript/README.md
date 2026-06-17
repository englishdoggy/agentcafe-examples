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
