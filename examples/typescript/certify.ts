// Certify your x402 CLIENT against Agent Café — get a public certificate + README badge.
//
//   npm install
//   npm run certify                                  # free: see the menu (no spend)
//   PAYER_PRIVATE_KEY=0x... npm run certify          # pays $0.25 → basic certificate
//   PAYER_PRIVATE_KEY=0x... TEST=suite npm run certify   # pays $0.75 → full suite
//
// Everyone else grades the SERVER. This grades YOUR client — because you can't fake an
// on-chain payment, so proving your paying agent actually works needs a real target.
// Gasless (EIP-3009): your wallet only needs USDC on Base, no ETH. NEVER commit a key.

import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const TEST = (process.env.TEST ?? "basic").toLowerCase() === "suite" ? "suite" : "basic";
const URL = `https://api.402.coffee/test/${TEST}`;
const KEY = process.env.PAYER_PRIVATE_KEY as `0x${string}` | undefined;

if (!KEY) {
  // No funds? Browse the free conformance menu — no wallet, no spend.
  const r = await fetch("https://api.402.coffee/inspect");
  console.log(JSON.stringify(await r.json(), null, 2));
  console.log("\nSet PAYER_PRIVATE_KEY (and optionally TEST=suite) to certify your client for real.");
  process.exit(0);
}

const account = privateKeyToAccount(KEY);
const client = new x402Client().register("eip155:8453", new ExactEvmScheme(account));
const payFetch = wrapFetchWithPayment(fetch, client);

console.log(`Certifying your client against ${URL} …`);
const res = await payFetch(URL, { method: "POST" });
const cert = await res.json();

console.log("HTTP", res.status);
console.log("verdict:", cert.verdict, "· level:", cert.level);
if (cert.checks) console.log("checks:", cert.checks);
if (cert.detected) console.log("detected:", cert.detected);
console.log("certificate:", cert.cert_url);
console.log("badge:", cert.badge_url);
if (cert.badge_markdown) console.log("\nPaste into your README:\n" + cert.badge_markdown);
