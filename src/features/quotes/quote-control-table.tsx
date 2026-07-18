"use client";

import { useMemo, useState } from "react";
import { CircleDollarSign, Download, ExternalLink, Search, X } from "lucide-react";
import { paymentStatus } from "./quote-payment-dialog";
import type { QuoteStatus, StoredQuote } from "./quote-history-dialog";

type QuoteControlTableProps = {
  quotes: StoredQuote[];
  onOpen: (quote: StoredQuote) => void;
  onPrint: (quote: StoredQuote) => void;
  onTrackPayment: (quote: StoredQuote) => void;
  onStatusChange: (quoteId: string, status: QuoteStatus) => void;
};

const quoteStatuses: { value: QuoteStatus; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviada" },
  { value: "follow-up", label: "Seguimiento" },
  { value: "approved", label: "Aprobada" },
  { value: "rejected", label: "Rechazada" },
];

export const QuoteControlTable = ({ quotes, onOpen, onPrint, onTrackPayment, onStatusChange }: QuoteControlTableProps) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");

  const filteredQuotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      const status = quote.status ?? "draft";
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const searchable = `${quote.number} ${quote.client.name} ${quote.client.company} ${quote.client.email}`.toLowerCase();
      return matchesStatus && searchable.includes(normalizedQuery);
    });
  }, [query, quotes, statusFilter]);

  return (
    <section className="quote-control">
      <div className="quote-control-toolbar">
        <label className="quote-control-search"><Search size={17} /><span className="sr-only">Buscar cotizaciones</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar folio, cliente o correo…" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><X size={15} /></button>}</label>
        <label className="quote-status-filter"><span>Estado</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as QuoteStatus | "all")}><option value="all">Todos</option>{quoteStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
        <span className="quote-result-count">{filteredQuotes.length} de {quotes.length}</span>
      </div>

      {filteredQuotes.length === 0 ? <div className="quote-control-empty"><Search size={25} /><b>Sin coincidencias</b><p>Cambia la búsqueda o el filtro de estado.</p></div> : <div className="quote-table-scroll"><table className="quote-table">
        <thead><tr><th>Folio</th><th>Cliente</th><th>Estado</th><th>Cobranza</th><th>Conceptos</th><th>Actualizada</th><th><span className="sr-only">Acciones</span></th></tr></thead>
        <tbody>{filteredQuotes.map((quote) => { const payment = paymentStatus(quote.payment); const status = quote.status ?? "draft"; return <tr key={quote.id}>
          <td data-label="Folio"><button className="quote-number-link" onClick={() => onOpen(quote)}>{quote.number}</button></td>
          <td data-label="Cliente"><span className="quote-client"><b>{quote.client.company || quote.client.name || "Sin cliente"}</b><small>{quote.client.company && quote.client.name ? quote.client.name : quote.client.email || "Sin contacto"}</small></span></td>
          <td data-label="Estado"><select aria-label={`Estado de ${quote.number}`} className={`quote-status-tag ${status}`} value={status} onChange={(event) => onStatusChange(quote.id, event.target.value as QuoteStatus)}>{quoteStatuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td>
          <td data-label="Cobranza"><button className={`payment-status ${payment.tone}`} onClick={() => onTrackPayment(quote)}>{payment.label}</button></td>
          <td data-label="Conceptos"><span className="quote-line-count">{quote.lines.length}</span></td>
          <td data-label="Actualizada"><time>{new Date(quote.updatedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</time></td>
          <td className="quote-row-actions"><button onClick={() => onOpen(quote)} aria-label={`Abrir ${quote.number}`} title="Abrir"><ExternalLink size={15} /></button><button onClick={() => onPrint(quote)} aria-label={`Generar PDF de ${quote.number}`} title="Generar PDF"><Download size={15} /></button><button onClick={() => onTrackPayment(quote)} aria-label={`Registrar pago de ${quote.number}`} title="Cobranza"><CircleDollarSign size={16} /></button></td>
        </tr>; })}</tbody>
      </table></div>}
    </section>
  );
};
