import test from "node:test";
import assert from "node:assert/strict";
import { fetchPrices, formatPrices, formatJson, clearCache, fetchHistoricalPrice } from "../src/index.js";

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
  clearCache();
  const mock = async () => ({ ok: false, status: 429, statusText: "Too Many Requests", json: async () => ({}) });
  await assert.rejects(() => fetchPrices(["bitcoin"], ["usd"], mock), /429/);
});

test("formatPrices formats output", () => {
  const out = formatPrices({ bitcoin: { usd: 100, eur: 90 } }, ["usd", "eur"]);
  assert.equal(out, "bitcoin: USD: 100  EUR: 90");
});

test("fetchPrices caches results", async () => {
  clearCache();
  let calls = 0;
  const mock = async () => {
    calls += 1;
    return { ok: true, status: 200, statusText: "OK", json: async () => ({ bitcoin: { usd: 100 } }) };
  };
  const a = await fetchPrices(["bitcoin"], ["usd"], mock, { cacheTtlMs: 10000 });
  const b = await fetchPrices(["bitcoin"], ["usd"], mock, { cacheTtlMs: 10000 });
  assert.deepEqual(a, b);
  assert.equal(calls, 1);
  clearCache();
});

test("formatJson formats output", () => {
  const out = formatJson({ bitcoin: { usd: 100 } });
  assert.equal(out, JSON.stringify({ bitcoin: { usd: 100 } }, null, 2));
});

test("fetchHistoricalPrice validates date", async () => {
  await assert.rejects(() => fetchHistoricalPrice("bitcoin", "not-a-date"), /YYYY-MM-DD/);
});

test("fetchHistoricalPrice parses response", async () => {
  const mock = async (url) => {
    assert.match(url, /date=15-01-2024/);
    return {
      ok: true, status: 200, statusText: "OK",
      json: async () => ({ market_data: { current_price: { usd: 42000, eur: 38000 } } }),
    };
  };
  const out = await fetchHistoricalPrice("bitcoin", "2024-01-15", ["usd"], mock);
  assert.deepEqual(out, { usd: 42000 });
});
