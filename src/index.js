// crypto-price-cli: fetch cryptocurrency prices from CoinGecko (no API key).

const API_URL = "https://api.coingecko.com/api/v3/simple/price";

/**
 * Fetch prices for the given coin ids in the given fiat currencies.
 * @param {string[]} ids - CoinGecko coin ids (e.g. ["bitcoin","ethereum"])
 * @param {string[]} vs - target currencies (e.g. ["usd","eur"])
 * @returns {Promise<Record<string, Record<string, number>>>}
 */
export async function fetchPrices(ids, vs = ["usd"], fetchImpl = fetch) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("ids must be a non-empty array");
  }
  const params = new URLSearchParams({
    ids: ids.join(","),
    vs_currencies: vs.join(","),
  });
  const url = `${API_URL}?${params.toString()}`;
  const res = await fetchImpl(url, { headers: { accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`CoinGecko request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data || typeof data !== "object") {
    throw new Error("Unexpected response from CoinGecko");
  }
  return data;
}

export function formatPrices(data, vs = ["usd"]) {
  const lines = [];
  for (const [coin, prices] of Object.entries(data)) {
    const parts = vs.map((c) => `${c.toUpperCase()}: ${prices[c]}`).join("  ");
    lines.push(`${coin}: ${parts}`);
  }
  return lines.join("\n");
}

export function formatJson(data) {
  return JSON.stringify(data, null, 2);
}
