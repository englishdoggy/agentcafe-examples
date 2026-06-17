#!/usr/bin/env bash
# See the live x402 402 challenge from Agent Café — no wallet, no spend.
set -euo pipefail

echo "== POST with no payment → expect HTTP 402 + an x402 challenge =="
curl -i -X POST https://api.402.coffee/order/espresso

echo
echo "== decode the challenge (scheme=exact, network=eip155:8453, amount, USDC asset, payTo) =="
curl -s -i -X POST https://api.402.coffee/order/espresso \
  | tr -d '\r' \
  | awk 'tolower($1)=="payment-required:"{print $2}' \
  | base64 -d 2>/dev/null | sed 's/.*/&/' || true

echo
echo "To actually pay, sign the USDC authorization and retry with the payment header —"
echo "see the TypeScript example for a full paid request."
