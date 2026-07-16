import { NextResponse } from "next/server";

type ExchangePayload = { date: string; usd: Record<string, number> };

const endpoints = [
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
  "https://latest.currency-api.pages.dev/v1/currencies/usd.min.json",
];

export const GET = async () => {
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { next: { revalidate: 86_400 } });
      if (!response.ok) continue;
      const payload = await response.json() as ExchangePayload;
      return NextResponse.json({ base: "USD", date: payload.date, rates: payload.usd });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "No fue posible consultar el tipo de cambio." }, { status: 503 });
};
