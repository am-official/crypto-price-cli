#!/usr/bin/env node
import { fetchPrices, formatPrices, formatJson, fetchHistoricalPrice } from "../src/index.js";

const args = process.argv.slice(2);
const apiKey = process.env.COINGECKO_API_KEY || process.env.CG_API_KEY || "";
const opts = apiKey ? { apiKey } : {};

if (args.includes("-h") || args.includes("--help") || args.includes("help")) {
  console.log(`crypto-price — fetch cryptocurrency prices from CoinGecko (no API key required)

Usage:
  crypto-price [coins] [currencies] [options]

Arguments:
  coins        Comma-separated coin ids or tickers (btc,eth,sol,...). Default: bitcoin
  currencies   Comma-separated fiat currencies. Default: usd

Options:
  --date=YYYY-MM-DD   Historical price on that date (loops over coins)
  --json              Machine-readable JSON output
  -h, --help          Show this help

Environment:
  COINGECKO_API_KEY / CG_API_KEY   Optional demo API key (sent as x-cg-demo-api-key)

Examples:
  crypto-price
  crypto-price bitcoin,ethereum usd,eur
  crypto-price btc eth usd
  crypto-price bitcoin usd --date=2024-01-15
  crypto-price bitcoin usd --json
`);
  process.exit(0);
}

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
      data[coin] = await fetchHistoricalPrice(coin, date, vs, fetch, opts);
    }
    if (json) {
      console.log(formatJson(data));
    } else {
      for (const [coin, prices] of Object.entries(data)) {
        console.log(`${coin} on ${date}: ` + vs.map((c) => `${c.toUpperCase()}: ${prices[c] ?? "n/a"}`).join("  "));
      }
    }
  } else {
    const data = await fetchPrices(coins, vs, fetch, opts);
    console.log(json ? formatJson(data) : formatPrices(data, vs));
  }
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
