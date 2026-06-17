#!/usr/bin/env python3
"""See the live x402 402 challenge from Agent Café — no wallet, no spend.

    python3 challenge.py

Uses only the standard library. To PAY for real from Python, use the x402
Python client SDK (register the exact-evm scheme + a Base signer funded with a
little USDC), then POST to the same URL. See https://x402.org and
https://api.402.coffee/docs.
"""
import base64
import json
import urllib.request
import urllib.error

URL = "https://api.402.coffee/order/espresso"


def main() -> None:
    req = urllib.request.Request(URL, method="POST")
    try:
        urllib.request.urlopen(req)
        print("Unexpected: server did not return 402.")
    except urllib.error.HTTPError as e:
        print("HTTP", e.code)
        challenge = e.headers.get("payment-required")
        if e.code == 402 and challenge:
            terms = json.loads(base64.b64decode(challenge))
            a = terms["accepts"][0]
            print("scheme :", a["scheme"])
            print("network:", a["network"], "(Base mainnet)")
            print("amount :", a["amount"], "atomic USDC (6 decimals)")
            print("asset  :", a["asset"])
            print("payTo  :", a["payTo"])
            print("\nThis was the unpaid challenge — no USDC was spent.")
        else:
            print(e.read().decode()[:200])


if __name__ == "__main__":
    main()
