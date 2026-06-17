// Pay Agent Café for real — USDC on Base mainnet — with @x402/fetch.
//
//   npm install
//   npm run challenge          # no wallet: just see the live 402 (no spend)
//   PAYER_PRIVATE_KEY=0x... npm run pay     # pays $0.10 USDC for real
//
// Your wallet needs a little USDC on Base. The payment is gasless (EIP-3009) —
// no ETH required. NEVER commit a real private key.

import { wrapFetchWithPayment, x402Client, decodePaymentResponseHeader } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const URL = "https://api.402.coffee/order/espresso";
const KEY = process.env.PAYER_PRIVATE_KEY as `0x${string}` | undefined;

if (!KEY) {
  // No funds? Show the live 402 challenge without spending anything.
  const r = await fetch(URL, { method: "POST" });
  console.log("HTTP", r.status, "— set PAYER_PRIVATE_KEY to actually pay.");
  const challenge = r.headers.get("payment-required");
  console.log("payment-required header present:", Boolean(challenge));
  process.exit(0);
}

// Register the exact-EVM scheme for Base mainnet with your signer, then pay.
const account = privateKeyToAccount(KEY);
const client = new x402Client().register("eip155:8453", new ExactEvmScheme(account));
const payFetch = wrapFetchWithPayment(fetch, client);

const res = await payFetch(URL, { method: "POST" });
console.log("HTTP", res.status);
console.log("receipt:", await res.json());

const pr = res.headers.get("payment-response");
if (pr) {
  try {
    console.log("settlement:", decodePaymentResponseHeader(pr));
  } catch {
    /* header present but not decodable in this runtime */
  }
}
