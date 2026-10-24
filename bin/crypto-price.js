#!/usr/bin/env node
import { fetchPrices, formatPrices } from "../src/index.js";

const args = process.argv.slice(2);
const coins = (args[0] || "bitcoin").split(",").map((s) => s.trim()).filter(Boolean);
const vs = (args[1] || "usd").split(",").map((s) => s.trim()).filter(Boolean);

try {
  const data = await fetchPrices(coins, vs);
  console.log(formatPrices(data, vs));
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
