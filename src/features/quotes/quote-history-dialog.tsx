"use client";

import { Archive, ArchiveRestore, CircleDollarSign, Download, FilePenLine, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Service } from "@/domain/catalog";
import type { AgentProfile } from "./profile-dialog";
import { paymentStatus } from "./quote-payment-dialog";

export type PaymentTracking = {
  depositPaid: boolean;
  depositDate: string;
  depositMethod: string;
  balancePaid: boolean;
  balanceDate: string;
  balanceMethod: string;
  notes: string;
};

export type QuoteStatus = "draft" | "sent" | "follow-up" | "approved" | "rejected";

export type StoredQuote = {
  id: string;
  number: string;
  updatedAt: string;
  client: { name: string; company: string; email: string; phone: string };
  lines: { service: Service; quantity: number }[];
  serviceOverview?: string;
  notes: string;
  discountId: string;
  customDiscountName?: string;
  customDiscountRate: number;
  referral: boolean;
  currency: "MXN" | "USD" | "CAD" | "EUR";
  showExchangeRate: boolean;
  includeVat: boolean;
  roundTotal?: boolean;
  roundingStep?: number;
  targetPrice?: string;
  status?: QuoteStatus;
  date?: string;
  agent?: AgentProfile;
  exchangeRate?: number;
  exchangeDate?: string;
  payment?: PaymentTracking;
  archivedAt?: string;
};

type QuoteHistoryDialogProps = {
  open: boolean;
  quotes: StoredQuote[];
  onClose: () => void;
  onOpen: (quote: StoredQuote) => void;
  onReprint: (quote: StoredQuote) => void;
  onDelete: (id: string) => void;
  onTrackPayment: (quote: StoredQuote) => void;
  onArchiveChange: (quote: StoredQuote, archived: boolean) => void;
  onNewManual: () => void;
};

export const QuoteHistoryDialog = ({ open, quotes, onClose, onOpen, onReprint, onDelete, onTrackPayment, onArchiveChange, onNewManual }: QuoteHistoryDialogProps) => {
  const [showArchived, setShowArchived] = useState(false);
  const visibleQuotes = useMemo(() => quotes.filter((quote) => Boolean(quote.archivedAt) === showArchived), [quotes, showArchived]);
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="history-dialog" role="dialog" aria-modal="true" aria-labelledby="quote-history-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div><p className="eyebrow">Archivo local</p><h2 id="quote-history-title">Cotizaciones</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <div className="history-toolbar"><button className="new-service-button" onClick={onNewManual}><Plus size={17} /> Cotización artesanal</button><button className="history-view-toggle" onClick={() => setShowArchived((current) => !current)}>{showArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}{showArchived ? "Ver activas" : "Ver archivadas"}</button><span>{visibleQuotes.length} {showArchived ? "archivadas" : "activas"}</span></div>
        <div className="history-list">
          {visibleQuotes.length === 0 ? <div className="history-empty"><FilePenLine size={30} /><b>{showArchived ? "No hay cotizaciones archivadas" : "Aún no hay cotizaciones guardadas"}</b><p>{showArchived ? "Las cotizaciones que archives aparecerán aquí." : "Genera una cotización o comienza una artesanal desde cero."}</p></div> : visibleQuotes.map((quote) => {
            const status = paymentStatus(quote.payment);
            return <article key={quote.id}>
              <button className="history-open" onClick={() => onOpen(quote)}>
                <span><b>{quote.client.company || quote.client.name || "Sin cliente"}</b><small>{quote.number} · {quote.lines.length} conceptos</small><i className={`payment-status ${status.tone}`}>{status.label}</i></span>
                <time>{new Date(quote.updatedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</time>
              </button>
              <button className="history-print" onClick={() => onReprint(quote)} aria-label={`Generar PDF de ${quote.number}`} title="Generar PDF"><Download size={16} /></button>
              <button className="history-payment" onClick={() => onTrackPayment(quote)} aria-label={`Registrar pagos de ${quote.number}`} title="Cobranza"><CircleDollarSign size={17} /></button>
              <button className="history-archive" onClick={() => onArchiveChange(quote, !quote.archivedAt)} aria-label={`${quote.archivedAt ? "Restaurar" : "Archivar"} ${quote.number}`} title={quote.archivedAt ? "Restaurar" : "Archivar"}>{quote.archivedAt ? <ArchiveRestore size={16} /> : <Archive size={16} />}</button>
              <button className="history-delete" onClick={() => onDelete(quote.id)} aria-label={`Eliminar ${quote.number}`}><Trash2 size={15} /></button>
            </article>;
          })}
        </div>
      </section>
    </div>
  );
};
