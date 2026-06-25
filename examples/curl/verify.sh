#!/usr/bin/env bash
# Check an agent's conformance credential — no wallet, no account, no spend.
# This is what a seller, wallet, or marketplace runs to vet a paying agent.
set -euo pipefail

WALLET="${1:-0x0fa7894745f43960f979cb2b852d2bbebf3455ad}"  # pass a wallet, or use this sample

echo "== verify $WALLET =="
echo "Does it pay correctly, refuse scams, check who it's paying? Is the cert current (30-day validity)?"
curl -s "https://api.402.coffee/verify?wallet=${WALLET}"
echo

echo
echo "== portable credential (W3C-VC-shaped JSON) =="
curl -s "https://api.402.coffee/credential/${WALLET}"
echo

echo
echo "Public board of certified agents: https://api.402.coffee/board"
