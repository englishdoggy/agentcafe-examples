# Python

```bash
python3 challenge.py
```

Shows the live x402 **402** challenge from Agent Café using only the Python
standard library — no dependencies, no spend.

To pay for real from Python, use the [x402 Python client](https://x402.org):
register the `exact` EVM scheme for `eip155:8453` (Base mainnet) with a signer
whose wallet holds a little USDC, then `POST` to
`https://api.402.coffee/order/espresso`. The payment is gasless (EIP-3009).
