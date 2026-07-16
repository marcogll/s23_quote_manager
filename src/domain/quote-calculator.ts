import type { Service } from "./catalog";

export type QuoteLine = { service: Service; quantity: number };

export const unitPriceInUsd = (service: Service, usdRates: Record<string, number>) => service.sourceCurrency === "MXN" ? service.price / (usdRates.mxn || 1) : service.price;

export const lineTotalInUsd = (line: QuoteLine, usdRates: Record<string, number>) => {
  const gross = unitPriceInUsd(line.service, usdRates) * line.quantity;
  const rule = line.service.volumeDiscount;
  return rule && line.quantity >= rule.minQuantity ? gross * (1 - rule.rate) : gross;
};

export const calculateQuote = (lines: QuoteLine[], discountRate: number, referral: boolean, usdRates: Record<string, number> = { usd: 1 }) => {
  const subtotal = lines.filter((line) => line.service.chargeType !== "third-party").reduce((total, line) => total + lineTotalInUsd(line, usdRates), 0);
  const thirdPartyTotal = lines.filter((line) => line.service.chargeType === "third-party").reduce((total, line) => total + lineTotalInUsd(line, usdRates), 0);
  const primaryDiscount = subtotal * discountRate;
  const referralDiscount = referral ? (subtotal - primaryDiscount) * 0.1 : 0;
  const discount = primaryDiscount + referralDiscount;

  const total = Math.max(0, subtotal - discount);
  return { subtotal, thirdPartyTotal, discount, total, projectTotal: total + thirdPartyTotal };
};

export const money = (amount: number, currency = "USD", rate = 1) => new Intl.NumberFormat(currency === "MXN" ? "es-MX" : "en-US", {
  style: "currency",
  currency,
  minimumFractionDigits: 2,
}).format(amount * rate);

export const billingLabel = { "one-time": "Único", monthly: "Mensual", annual: "Anual" } as const;
