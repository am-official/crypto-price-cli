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
    if (coins.length !== 1) {
      console.error("error: --date only supports a single coin");
      process.exit(1);
    }
    const prices = await fetchHistoricalPrice(coins[0], date, vs);
    const data = { [coins[0]]: prices };
    console.log(json ? formatJson(data) : `${coins[0]} on ${date}: ` + vs.map((c) => `${c.toUpperCase()}: ${prices[c] ?? "n/a"}`).join("  "));
  } else {
    const data = await fetchPrices(coins, vs);
    console.log(json ? formatJson(data) : formatPrices(data, vs));
  }
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
