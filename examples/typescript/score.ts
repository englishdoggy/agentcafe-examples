// For counterparties — check a wallet before you transact with it.
//
//   npm install
//   npm run verify -- 0x<wallet>            # FREE: has this wallet got current certs?
//   PAYER_PRIVATE_KEY=0x… npm run score -- 0x<wallet>   # $0.10: full 0–100 risk score
//
// /verify is free and needs no wallet. /score is a paid x402 call ($0.10 USDC on Base,
// gasless) that returns a deterministic 0–100 risk score with itemized on-chain evidence,
// a tier (A–F / unrated), and flags — the "check before you pay" for agent payments.
// NEVER commit a real private key.

import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const target = (process.argv[2] || "").toLowerCase();
if (!/^0x[0-9a-fA-F]{40}$/.test(target)) {
  console.log("Usage: npm run score -- 0x<wallet-to-check>");
  process.exit(1);
}

// 1) FREE — /verify: a quick boolean + per-capability detail, no wallet needed.
console.log(`\nGET /verify?wallet=${target} (free)…`);
const v = await fetch(`https://api.402.coffee/verify?wallet=${target}`);
const vj = await v.json();
console.log("  verified:", vj.verified, "| tested:", vj.tested);
for (const [cap, d] of Object.entries(vj.capabilities ?? {})) {
  console.log(`  ${cap}:`, (d as { result?: string; tested?: boolean }).result ?? (d as { tested?: boolean }).tested);
}

// 2) PAID — /score: the decision-grade signal. Only runs if you provide a payer key.
const KEY = process.env.PAYER_PRIVATE_KEY as `0x${string}` | undefined;
if (!KEY) {
  console.log("\nSet PAYER_PRIVATE_KEY (needs ~$0.10 USDC on Base) to fetch the full risk score.");
  process.exit(0);
}
const account = privateKeyToAccount(KEY);
const client = new x402Client().register("eip155:8453", new ExactEvmScheme(account));
const pay = wrapFetchWithPayment(fetch, client);

console.log(`\nPOST /score ($0.10) for ${target}…`);
const r = await pay("https://api.402.coffee/score", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ wallet: target }),
});
const j = await r.json();
console.log("  SCORE:", j.score, "TIER:", j.tier, "—", j.tier_meaning);
for (const [k, c] of Object.entries(j.components ?? {})) {
  const comp = c as { points: number; max: number };
  console.log(`   · ${k}: ${comp.points}/${comp.max}`);
}
if (j.flags?.length) console.log("  flags:", j.flags.join(", "));
console.log("  score_version:", j.score_version, "| computed_at:", j.computed_at);
console.log("\n  Tip: batch up to 25 wallets in one $0.50 call — POST /score/batch {\"wallets\":[…]}.");
