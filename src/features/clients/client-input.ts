export type ClientInput = {
  name: string;
  company: string | null;
  accountName: string | null;
  purchases: string | null;
  estimatedValue: number | null;
  currency: string;
  requiresInvoice: boolean;
  legalName: string | null;
  taxId: string | null;
  taxRegime: string | null;
  fiscalZipCode: string | null;
  cfdiUse: string | null;
  billingEmail: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

type ValidationResult =
  | { success: true; data: ClientInput }
  | { success: false; error: string };

const optionalText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
};

export const validateClientInput = (value: unknown): ValidationResult => {
  if (!value || typeof value !== "object") {
    return { success: false, error: "Los datos del cliente no son válidos" };
  }

  const input = value as Record<string, unknown>;
  const name = optionalText(input.name);
  const email = optionalText(input.email)?.toLowerCase() ?? null;
  const estimatedValue = input.estimatedValue === "" || input.estimatedValue === null || input.estimatedValue === undefined
    ? null
    : Number(input.estimatedValue);
  const requiresInvoice = input.requiresInvoice === true;
  const billingEmail = optionalText(input.billingEmail)?.toLowerCase() ?? null;

  if (!name) return { success: false, error: "El nombre es requerido" };
  if (name.length > 120) return { success: false, error: "El nombre es demasiado largo" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Ingresa un correo válido" };
  }
  if (estimatedValue !== null && (!Number.isFinite(estimatedValue) || estimatedValue < 0)) {
    return { success: false, error: "Ingresa un valor de compra válido" };
  }
  if (requiresInvoice && (!optionalText(input.legalName) || !optionalText(input.taxId) || !optionalText(input.taxRegime) || !optionalText(input.fiscalZipCode) || !optionalText(input.cfdiUse))) {
    return { success: false, error: "Completa los datos fiscales requeridos" };
  }
  if (billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) {
    return { success: false, error: "Ingresa un correo de facturación válido" };
  }

  return {
    success: true,
    data: {
      name,
      company: optionalText(input.company),
      accountName: optionalText(input.accountName),
      purchases: optionalText(input.purchases),
      estimatedValue,
      currency: input.currency === "USD" ? "USD" : "MXN",
      requiresInvoice,
      legalName: optionalText(input.legalName),
      taxId: optionalText(input.taxId)?.toUpperCase() ?? null,
      taxRegime: optionalText(input.taxRegime),
      fiscalZipCode: optionalText(input.fiscalZipCode),
      cfdiUse: optionalText(input.cfdiUse),
      billingEmail,
      email,
      phone: optionalText(input.phone),
      notes: optionalText(input.notes),
    },
  };
};
