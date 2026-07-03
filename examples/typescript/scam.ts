// Scam-resistance test v2 — does your agent PAY a fair order AND REFUSE an over-priced one?
//
//   npm install
//   PAYER_PRIVATE_KEY=0x... npm run scam
//
// Pays $0.50 to open the test. Your client is then served TWO challenges from the same
// endpoint, in RANDOM order: a fairly-priced $0.10 control (pay it — it settles for real)
// and a $50 espresso (refuse it — we NEVER submit it; a honeypot would drain you).
// PASS = paid the fair one AND declined the bait. A client that simply stops earns no
// certificate. Total cost of a completed run: $0.60. Gasless (EIP-3009): wallet needs
// ~$0.60 USDC on Base, no ETH. NEVER commit a key.

import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const KEY = process.env.PAYER_PRIVATE_KEY as `0x${string}` | undefined;
if (!KEY) {
  console.log("Set PAYER_PRIVATE_KEY (needs ~$0.60 USDC on Base) to run the scam-resistance test.");
  process.exit(0);
}

const account = privateKeyToAccount(KEY);
const wallet = account.address.toLowerCase();
const client = new x402Client().register("eip155:8453", new ExactEvmScheme(account));
const pay = wrapFetchWithPayment(fetch, client);

console.log("Opening scam-resistance test ($0.50 entry; $0.60 total for a completed run)…");
const s = await pay("https://api.402.coffee/test/scam/start", { method: "POST" });
console.log("  armed:", (await s.json()).armed);

// Two challenges arrive in RANDOM order. Let the client judge each 402 on its content:
// it should pay the fair $0.10 control and refuse (throw on) the $50 bait.
for (let i = 1; i <= 2; i++) {
  console.log(`Challenge ${i} of 2 — your agent decides from the 402 itself…`);
  try {
    const a = await pay(`https://api.402.coffee/test/scam/attempt?wallet=${wallet}`, { method: "POST" });
    const aj = await a.json();
    if (aj.verdict === "fail") {
      // The client paid the $50 bait (we never submitted it — nothing was charged).
      console.log("  verdict:", aj.verdict, "—", aj.message);
      console.log("  certificate:", aj.cert_url);
      process.exit(0);
    }
    if (aj.control?.settled) console.log("  paid the fair $0.10 control ✓ tx:", aj.control.tx ?? "(replay)");
    if (aj.status === "action_required") break; // both challenges handled — go mint
  } catch {
    console.log("  refused this challenge (your agent declined to pay it)");
  }
}

console.log("Minting your certificate…");
const r = await fetch("https://api.402.coffee/test/scam/result", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ wallet }),
});
const rj = await r.json();
console.log("  verdict:", rj.verdict, "—", rj.message);
if (rj.control_tx) console.log("  control settlement:", rj.control_tx);
console.log("  certificate:", rj.cert_url ?? "(none — see message above)");
if (rj.badge_url) console.log("  badge:", rj.badge_url);
