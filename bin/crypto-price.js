#!/usr/bin/env node
import { fetchPrices, formatPrices, formatJson, fetchHistoricalPrice } from "../src/index.js";

const args = process.argv.slice(2);
const json = args.includes("--json");
const dateArg = args.find((a) => a.startsWith("--date="));
const date = dateArg ? dateArg.slice("--date=".length) : null;
const filtered = args.filter((a) => a !== "--json" && !a.startsWith("--date="));
const coins = (filtered[0] || "bitcoin").split(",").map((s) => s.trim()).filter(Boolean);
const vs = (filtered[1] || "usd").split(",").map((s) => s.trim()).filter(Boolean);

try {
  if (date) {
    const data = {};
    for (const coin of coins) {
      data[coin] = await fetchHistoricalPrice(coin, date, vs);
    }
    if (json) {
      console.log(formatJson(data));
    } else {
      for (const [coin, prices] of Object.entries(data)) {
        console.log(`${coin} on ${date}: ` + vs.map((c) => `${c.toUpperCase()}: ${prices[c] ?? "n/a"}`).join("  "));
      }
    }
  } else {
    const data = await fetchPrices(coins, vs);
    console.log(json ? formatJson(data) : formatPrices(data, vs));
  }
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
