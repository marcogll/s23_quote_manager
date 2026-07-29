import type { QuoteLine } from "@/domain/quote-calculator";
import { billingLabel } from "@/domain/quote-calculator";
import type { AgentProfile } from "./profile-dialog";
import { MarkdownContent } from "./markdown-editor";

type Client = { name: string; company: string; email: string; phone: string };
type QuoteTotals = { subtotal: number; thirdPartyTotal: number; discount: number; total: number; projectTotal: number; vat: number; roundingAdjustment: number; payableTotal: number };

type QuoteDocumentProps = {
  number: string;
  date: Date;
  agent: AgentProfile;
  client: Client;
  lines: QuoteLine[];
  totals: QuoteTotals;
  discountLabel: string;
  currency: string;
  serviceOverview: string;
  notes: string;
  exchangeRate: number;
  exchangeDate: string;
  showExchangeRate: boolean;
  includeVat: boolean;
  displayMoney: (amount: number) => string;
  displayLineTotal: (line: QuoteLine) => string;
};

const logoUrl = "/soul23_logo.svg";

const DocumentLogo = () => (
  <div className="logo-wrap">
    <img src={logoUrl} alt="Soul:23" />
    <div className="tagline">Marketing &amp; Systems</div>
  </div>
);

const DocumentHeader = () => (
  <div className="compact-header">
    <span className="compact-brand">Soul:23</span>
    <span className="compact-tagline">Marketing &amp; Systems</span>
  </div>
);

const typeClass = (line: QuoteLine) => {
  if (line.service.chargeType === "third-party") return "badge-anual";
  if (line.service.billing === "monthly") return "badge-mensual";
  return "badge-unico";
};

const typeLabel = (line: QuoteLine) =>
  line.service.id === "support-remote" ? "Por hora" : billingLabel[line.service.billing];

export const QuoteDocument = ({ number, date, agent, client, lines, totals, discountLabel, currency, serviceOverview, notes, exchangeRate, exchangeDate, showExchangeRate, includeVat, displayMoney, displayLineTotal }: QuoteDocumentProps) => {
  const ownLines = lines.filter((line) => line.service.chargeType !== "third-party");
  const externalLines = lines.filter((line) => line.service.chargeType === "third-party");
  const linesWithDetail = lines.filter((line) => (line.service.features?.length ?? 0) > 0 || (line.service.content?.trim().length ?? 0) > 0);
  const hasDetailPage = linesWithDetail.length > 0;
  const generated = date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  const expires = new Date(date);
  expires.setDate(expires.getDate() + 15);
  const expiration = expires.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section className="print-quote machote-document">
      <article className="sheet">
        <DocumentLogo />
        <div className="parties">
          <div className="party">
            <h4>Agente</h4>
            <p className="name">{agent.name}</p>
            <p className="muted-line">{agent.role}</p>
            <p className="company-line">Soul:23 — Marketing &amp; Systems</p>
            <div className="contact-row"><span className="icon">✉</span><span>{agent.email}</span></div>
            <div className="contact-row"><span className="icon">☎</span><span>{agent.phone}</span></div>
          </div>
          <div className="party">
            <h4>Cliente</h4>
            <p className="name">{client.name || "Cliente"}</p>
            <p>{client.company}</p>
            <p className="muted-line">{client.email}</p>
            <p>{client.phone}</p>
          </div>
        </div>

        <div className="meta-box">
          <div className="page-label">Propuesta</div>
          <div className="quote-title">Propuesta de Servicios</div>
          <div>No. <span className="editable">{number}</span></div>
          <div>Generada: <b>{generated}</b></div>
          <div>Expira: <b>{expiration}</b></div>
        </div>

        <p className="table-kicker">Servicios Soul:23 · Honorarios</p>
        <table className="plan">
          <thead><tr><th>Servicio</th><th>Tipo</th><th>Monto</th></tr></thead>
          <tbody>{ownLines.map((line, index) => (
            <tr key={line.service.id}>
              <td className="name">{index + 1}. {line.service.name}<span className="sub">{line.service.description}</span></td>
              <td><span className={`type-badge ${typeClass(line)}`}>{typeLabel(line)}</span></td>
              <td className="amount">{displayLineTotal(line)}</td>
            </tr>
          ))}</tbody>
        </table>

        {externalLines.length > 0 && <>
          <p className="table-kicker external-kicker">Costos de terceros · Directos al proveedor (sin markup)</p>
          <table className="plan external-plan">
            <thead><tr><th>Servicio</th><th>Tipo</th><th>Monto</th></tr></thead>
            <tbody>{externalLines.map((line) => (
              <tr key={line.service.id}>
                <td className="name">{line.service.name}<span className="sub">{line.service.description}</span></td>
                <td><span className="type-badge badge-anual">Directo</span></td>
                <td className="amount">{displayLineTotal(line)}</td>
              </tr>
            ))}</tbody>
          </table>
        </>}

        <table className="totals-mini quote-totals">
          <tbody>
            <tr><td className="label">HONORARIOS SOUL:23<small>Servicios profesionales incluidos en esta propuesta.</small></td><td className="amount">{displayMoney(totals.subtotal)}</td></tr>
            {totals.discount > 0 && <tr><td className="label">{discountLabel.toUpperCase()}<small>Descuento aplicado.</small></td><td className="amount">−{displayMoney(totals.discount)}</td></tr>}
            {totals.thirdPartyTotal > 0 && <tr><td className="label">PAGOS DIRECTOS A PROVEEDORES<small>Referencia informativa; no pagaderos a Soul:23.</small></td><td className="amount">{displayMoney(totals.thirdPartyTotal)}</td></tr>}
            {includeVat && <tr><td className="label">IVA 16%<small>Calculado sobre honorarios Soul:23 después de descuentos.</small></td><td className="amount">{displayMoney(totals.vat)}</td></tr>}
            {Math.abs(totals.roundingAdjustment) > 0.001 && <tr><td className="label">AJUSTE AL PRECIO FINAL<small>Ajuste para alcanzar el total comercial definido.</small></td><td className="amount">{totals.roundingAdjustment < 0 ? "−" : "+"}{displayMoney(Math.abs(totals.roundingAdjustment))}</td></tr>}
            <tr className="total-row"><td className="label">TOTAL A PAGAR A SOUL:23<small>{currency} · {includeVat ? "IVA incluido · Requiere factura" : "Sin IVA · No requiere factura"}</small></td><td className="amount">{displayMoney(totals.payableTotal)}</td></tr>
          </tbody>
        </table>

        {serviceOverview.trim() && <div className="service-overview-inline"><MarkdownContent value={serviceOverview} /></div>}

        <div className="page-num">-</div>
      </article>

      {hasDetailPage && <article className="sheet sheet-detail sheet-compact">
        <DocumentHeader />
        <div className="page-label">Desglose y alcance</div>
        <h2>{client.company || client.name || "Cliente"} — Desglose y especificación</h2>
        <p className="detail-subtitle">Cotización {number} · Generada: {generated} · Expira: {expiration}</p>
        <div className="cols-2">
          {lines.map((line, index) => {
            const features = line.service.features ?? [];
            const content = line.service.content?.trim() ?? "";
            if (!features.length && !content) return null;
            return (
              <div className={`section ${line.service.chargeType === "third-party" ? "external-section" : ""}`} key={line.service.id}>
                <div className="section-head">
                  <div className="left"><div className="num">{index + 1}</div><div className="title">{line.service.name}</div><div className="type-badge badge-unico-dark">{line.service.chargeType === "third-party" ? "Pago a tercero" : typeLabel(line)}</div></div>
                  <div className="price">{displayLineTotal(line)}</div>
                </div>
                <div className="section-body">
                  {features.length > 0 && <ul>{features.map((feature) => <li key={feature}>{feature}</li>)}</ul>}
                  {content && <MarkdownContent value={content} />}
                  {line.service.chargeType === "third-party" && <div className="scope-note">Pago directo al proveedor.</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="page-num">-</div>
      </article>}

      <article className="sheet sheet-detail">
        <DocumentHeader />
        <div className="page-label">Términos y condiciones</div>
        <h2>Condiciones y forma de pago</h2>
        <p className="detail-subtitle">Cotización {number} · {client.company || client.name || "Cliente"} · Generada: {generated} · Expira: {expiration}</p>
        <div className="cta-note">
          <p className="kicker">Términos de pago</p>
          <MarkdownContent value={notes} />
          {totals.thirdPartyTotal > 0 && <p>Los costos de terceros se liquidan directamente con cada proveedor.</p>}
          <div className={`payment-info-grid ${showExchangeRate && currency !== "USD" && currency !== "MXN" ? "with-exchange" : ""}`}>
            <div className="deposit-section">
              <p className="kicker">Datos de depósito</p>
              <table className="deposit-table">
                <thead>
                  <tr><th>Tarjeta</th><th>Banco</th><th>Beneficiario</th><th>Anticipo 50%</th><th>Restante 50%</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="mono">5165 7601 0144 0492</td>
                    <td>Banco Azteca</td>
                    <td>Marco Gallegos</td>
                    <td className="amount">{displayMoney(totals.payableTotal * 0.5)}</td>
                    <td className="amount">{displayMoney(totals.payableTotal * 0.5)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {showExchangeRate && currency !== "USD" && currency !== "MXN" && <div className="exchange-section"><p className="kicker">Tipo de cambio</p><div className="exchange-value"><b>1 USD = {exchangeRate.toFixed(4)} {currency}</b><span>Actualizado {exchangeDate}</span></div></div>}
          </div>
        </div>
        <div className="condiciones"><div className="kicker">Aceptación de condiciones</div><p>{serviceOverview.trim() ? `El alcance descrito en la página anterior define los entregables incluidos. ` : ""}La aprobación de esta cotización confirma las condiciones aquí descritas. Cualquier cambio posterior se cotiza por separado.</p></div>
        <div className="page-num">-</div>
      </article>
    </section>
  );
};
