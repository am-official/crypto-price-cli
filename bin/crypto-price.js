#!/usr/bin/env node
import { fetchPrices, formatPrices, formatJson } from "../src/index.js";

const args = process.argv.slice(2);
const json = args.includes("--json");
const filtered = args.filter((a) => a !== "--json");
const coins = (filtered[0] || "bitcoin").split(",").map((s) => s.trim()).filter(Boolean);
const vs = (filtered[1] || "usd").split(",").map((s) => s.trim()).filter(Boolean);

try {
  const data = await fetchPrices(coins, vs);
  console.log(json ? formatJson(data) : formatPrices(data, vs));
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
