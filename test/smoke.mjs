// Dependency-free smoke test / uptime monitor for the Agent Café x402 conformance endpoint.
// No funds needed — it only checks health + that the paid routes correctly challenge with 402.
//   node test/smoke.mjs            (exit 0 = healthy, 1 = something is down)
// Point it elsewhere with AGENT_CAFE_BASE=https://your-endpoint node test/smoke.mjs
const BASE = process.env.AGENT_CAFE_BASE || "https://api.402.coffee";

let failures = 0;
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const check = async (name, fn) => {
  try { await fn(); console.log("  ✓", name); }
  catch (e) { failures++; console.log("  ✗", name, "—", e.message); }
};

console.log("smoke-testing", BASE, "\n");

await check("GET /health → ok:true", async () => {
  const r = await fetch(`${BASE}/health`);
  assert(r.status === 200, `status ${r.status}`);
  assert((await r.json()).ok === true, "ok !== true");
});

await check("GET /status → ok:true", async () => {
  const r = await fetch(`${BASE}/status`, { headers: { accept: "application/json" } });
  assert((await r.json()).ok === true, "status not ok");
});

await check("GET /inspect → 200 + menu", async () => {
  const r = await fetch(`${BASE}/inspect`);
  assert(r.status === 200, `status ${r.status}`);
  const j = await r.json();
  assert(Array.isArray(j.menu) && j.menu.length >= 1, "no menu");
});

await check("POST /test/basic → 402 + x402 challenge", async () => {
  const r = await fetch(`${BASE}/test/basic`, { method: "POST" });
  assert(r.status === 402, `expected 402, got ${r.status}`);
  assert(r.headers.get("payment-required"), "no payment-required header");
});

await check("POST /test/scam/start → 402 + x402 challenge", async () => {
  const r = await fetch(`${BASE}/test/scam/start`, { method: "POST" });
  assert(r.status === 402, `expected 402, got ${r.status}`);
  assert(r.headers.get("payment-required"), "no payment-required header");
});

await check("GET /receipt?tx=<unknown> → 404", async () => {
  const tx = "0x" + "0".repeat(64);
  const r = await fetch(`${BASE}/receipt?tx=${tx}`);
  assert(r.status === 404, `expected 404, got ${r.status}`);
});

console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed ✓");
process.exit(failures ? 1 : 0);
