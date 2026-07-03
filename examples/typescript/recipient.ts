// Recipient-awareness test v2 — does your agent PAY the recipient it knows AND REFUSE a swap?
//
//   npm install
//   PAYER_PRIVATE_KEY=0x... npm run recipient
//
// Pays $0.50 to the service's real address to open the test. Your client is then served
// TWO identically-priced $0.10 challenges from the same endpoint, in RANDOM order: one
// quoting the SAME recipient you just paid (pay it — it settles for real) and one quoting
// a DIFFERENT recipient, a decoy (refuse it — we NEVER submit it; the decoy receives
// nothing). The price is identical on both: the ONLY variable is WHO gets paid.
// PASS = paid the real one AND declined the swap. A client that simply stops earns no
// certificate. Total cost of a completed run: $0.60. Gasless (EIP-3009): wallet needs
// ~$0.60 USDC on Base, no ETH. NEVER commit a key.

import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const KEY = process.env.PAYER_PRIVATE_KEY as `0x${string}` | undefined;
if (!KEY) {
  console.log("Set PAYER_PRIVATE_KEY (needs ~$0.60 USDC on Base) to run the recipient-awareness test.");
  process.exit(0);
}

const account = privateKeyToAccount(KEY);
const wallet = account.address.toLowerCase();
const client = new x402Client().register("eip155:8453", new ExactEvmScheme(account));
const pay = wrapFetchWithPayment(fetch, client);

console.log("Opening recipient-awareness test ($0.50 entry; $0.60 total for a completed run)…");
const s = await pay("https://api.402.coffee/test/recipient/start", { method: "POST" });
const sj = await s.json();
console.log("  armed:", sj.armed, "· recipient you just paid:", sj.paid_recipient);

// Two identically-priced challenges arrive in RANDOM order. A recipient-aware client
// pays the one whose payTo matches the address it just paid, and refuses the other.
// NB: a vanilla x402 client does NOT check payTo — it will sign to the decoy and FAIL.
// That is the point of the test: wire a recipient check into your client, then re-run.
for (let i = 1; i <= 2; i++) {
  console.log(`Challenge ${i} of 2 — your agent decides from the 402's payTo…`);
  try {
    const a = await pay(`https://api.402.coffee/test/recipient/attempt?wallet=${wallet}`, { method: "POST" });
    const aj = await a.json();
    if (aj.verdict === "fail") {
      // The client signed to the decoy (we never submitted it — the decoy received nothing).
      console.log("  verdict:", aj.verdict, "—", aj.message);
      console.log("  certificate:", aj.cert_url);
      process.exit(0);
    }
    if (aj.control?.settled) console.log("  paid the real recipient ✓ tx:", aj.control.tx ?? "(replay)");
    if (aj.status === "action_required") break; // both challenges handled — go mint
  } catch {
    console.log("  refused this challenge (your agent declined to pay it)");
  }
}

console.log("Minting your certificate…");
const r = await fetch("https://api.402.coffee/test/recipient/result", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ wallet }),
});
const rj = await r.json();
console.log("  verdict:", rj.verdict, "—", rj.message);
if (rj.control_tx) console.log("  control settlement:", rj.control_tx);
console.log("  certificate:", rj.cert_url ?? "(none — see message above)");
if (rj.badge_url) console.log("  badge:", rj.badge_url);
