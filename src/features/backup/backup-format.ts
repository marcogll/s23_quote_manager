import type { Service } from "@/domain/catalog";
import type { AgentProfile } from "@/features/quotes/profile-dialog";
import type { StoredQuote } from "@/features/quotes/quote-history-dialog";

export const BACKUP_FORMAT = "s23-quote-manager-backup";
export const BACKUP_VERSION = 1;

export type BackupClient = Record<string, unknown>;

export type WorkspaceBackup = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: {
    quotes: StoredQuote[];
    clients: BackupClient[];
    customServices: Service[];
    agentProfiles: AgentProfile[];
    priceOverrides: Record<string, number>;
    preferences: {
      currency: "MXN" | "USD" | "CAD" | "EUR";
      showExchangeRate: boolean;
      selectedAgentId: string;
    };
    draft: unknown | null;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object");

const isService = (value: unknown): boolean => {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.name === "string"
    && typeof value.category === "string"
    && typeof value.description === "string"
    && typeof value.price === "number"
    && Number.isFinite(value.price)
    && ["one-time", "monthly", "annual"].includes(String(value.billing));
};

const isQuote = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.client) || !Array.isArray(value.lines)) return false;
  return typeof value.id === "string"
    && typeof value.number === "string"
    && typeof value.updatedAt === "string"
    && typeof value.client.name === "string"
    && typeof value.notes === "string"
    && value.lines.every((line) => isRecord(line) && isService(line.service) && typeof line.quantity === "number");
};

const isAgent = (value: unknown): boolean => isRecord(value)
  && typeof value.id === "string"
  && typeof value.name === "string"
  && typeof value.role === "string"
  && typeof value.email === "string"
  && typeof value.phone === "string";

export const isWorkspaceBackup = (value: unknown): value is WorkspaceBackup => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.format !== BACKUP_FORMAT || candidate.version !== BACKUP_VERSION) return false;
  if (!candidate.data || typeof candidate.data !== "object") return false;

  const data = candidate.data as Record<string, unknown>;
  return Array.isArray(data.quotes) && data.quotes.every(isQuote)
    && Array.isArray(data.clients)
    && Array.isArray(data.customServices) && data.customServices.every(isService)
    && Array.isArray(data.agentProfiles) && data.agentProfiles.every(isAgent)
    && Boolean(data.priceOverrides && typeof data.priceOverrides === "object")
    && Boolean(data.preferences && typeof data.preferences === "object");
};
