export type Billing = "one-time" | "monthly" | "annual";

export type Service = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  billing: Billing;
  description: string;
  features?: string[];
  content?: string;
  chargeType?: "soul23" | "third-party";
  sourceCurrency?: "USD" | "MXN";
  volumeDiscount?: { minQuantity: number; rate: number };
  recommended?: boolean;
  is_custom?: boolean;
  icon?: string;
};

let _services: Service[] | null = null;

export async function loadServices(): Promise<Service[]> {
  if (_services) return _services;
  const response = await fetch("/data/servicios.json");
  if (!response.ok) throw new Error("Error al cargar servicios");
  _services = await response.json() as Service[];
  return _services;
}

export const categories = ["Todos", "Web", "Soporte", "Media & Marketing"];

export const categoryIcons: Record<string, string> = {
  "Todos": "layout-grid",
  "Web": "globe",
  "Soporte": "headphones",
  "Media & Marketing": "megaphone",
};

export const discountOptions = [
  { id: "none", label: "Sin descuento", rate: 0, stackable: false },
  { id: "onboarding", label: "Onboarding · Mes 1", rate: 0.3, stackable: false },
  { id: "early", label: "Early adopter", rate: 0.2, stackable: false },
  { id: "annual", label: "Pago anual", rate: 0.15, stackable: false },
  { id: "recurring", label: "Cliente recurrente", rate: 0.1, stackable: false },
  { id: "referral", label: "Referral", rate: 0.1, stackable: true },
] as const;
