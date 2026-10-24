import test from "node:test";
import assert from "node:assert/strict";
import { fetchPrices, formatPrices, formatJson } from "../src/index.js";

test("fetchPrices validates input", async () => {
  await assert.rejects(() => fetchPrices([]), /non-empty array/);
});

test("fetchPrices parses response", async () => {
  const mock = async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => ({ bitcoin: { usd: 100 } }),
  });
  const data = await fetchPrices(["bitcoin"], ["usd"], mock);
  assert.deepEqual(data, { bitcoin: { usd: 100 } });
});

test("fetchPrices throws on non-ok", async () => {
  const mock = async () => ({ ok: false, status: 429, statusText: "Too Many Requests", json: async () => ({}) });
  await assert.rejects(() => fetchPrices(["bitcoin"], ["usd"], mock), /429/);
});

test("formatPrices formats output", () => {
  const out = formatPrices({ bitcoin: { usd: 100, eur: 90 } }, ["usd", "eur"]);
  assert.equal(out, "bitcoin: USD: 100  EUR: 90");
});

test("formatJson formats output", () => {
  const out = formatJson({ bitcoin: { usd: 100 } });
  assert.equal(out, JSON.stringify({ bitcoin: { usd: 100 } }, null, 2));
});
