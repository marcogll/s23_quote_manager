"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Printer, Search, X } from "lucide-react";
import type { Service } from "@/domain/catalog";
import { billingLabel, lineTotalInUsd, money, unitPriceInUsd, type QuoteLine } from "@/domain/quote-calculator";

type Client = { name: string; company: string; email: string; phone: string };

type QuoteWizardDialogProps = {
  open: boolean;
  services: Service[];
  lines: QuoteLine[];
  client: Client;
  discountId: string;
  referral: boolean;
  total: number;
  currency: string;
  exchangeRate: number;
  usdRates: Record<string, number>;
  exchangeDate: string;
  showExchangeRate: boolean;
  onCurrencyChange: (currency: string) => void;
  onShowExchangeRateChange: (enabled: boolean) => void;
  onClose: () => void;
  onClientChange: (client: Client) => void;
  onAddService: (service: Service) => void;
  onQuantityChange: (id: string, delta: number) => void;
  onDiscountChange: (id: string) => void;
  onReferralChange: (enabled: boolean) => void;
  onPrint: () => void;
};

const steps = ["Cliente", "Servicios", "Condiciones", "Revisar"];

export const QuoteWizardDialog = ({ open, services, lines, client, discountId, referral, total, currency, exchangeRate, usdRates, exchangeDate, showExchangeRate, onCurrencyChange, onShowExchangeRateChange, onClose, onClientChange, onAddService, onQuantityChange, onDiscountChange, onReferralChange, onPrint }: QuoteWizardDialogProps) => {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => services.filter((service) => `${service.name} ${service.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12), [query, services]);

  if (!open) return null;

  const close = () => { setStep(0); onClose(); };
  const nextDisabled = step === 0 ? !client.name.trim() && !client.company.trim() : step === 1 ? !lines.length : false;
  const displayMoney = (amount: number) => money(amount, currency, exchangeRate);
  const serviceMoney = (service: Service) => displayMoney(unitPriceInUsd(service, usdRates));

  return (
    <div className="dialog-backdrop wizard-backdrop" role="presentation">
      <section className="quote-wizard" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
        <header className="wizard-header">
          <div><p className="eyebrow">Asistente de cotización</p><h2 id="wizard-title">{steps[step]}</h2></div>
          <button onClick={close} aria-label="Cerrar"><X size={20} /></button>
        </header>
        <nav className="wizard-steps" aria-label="Progreso">
          {steps.map((label, index) => <button key={label} className={index === step ? "active" : index < step ? "done" : ""} onClick={() => index <= step && setStep(index)}><span>{index < step ? <Check size={13} /> : index + 1}</span>{label}</button>)}
        </nav>

        <div className="wizard-content">
          {step === 0 && <div className="wizard-client"><div className="wizard-copy"><h3>¿Para quién es la propuesta?</h3><p>Estos datos aparecerán en el encabezado de la cotización.</p></div><div className="wizard-fields"><label><span>Nombre del contacto</span><input autoFocus value={client.name} onChange={(event) => onClientChange({ ...client, name: event.target.value })} placeholder="Nombre completo" /></label><label><span>Empresa</span><input value={client.company} onChange={(event) => onClientChange({ ...client, company: event.target.value })} placeholder="Razón social o negocio" /></label><label><span>Correo</span><input type="email" value={client.email} onChange={(event) => onClientChange({ ...client, email: event.target.value })} placeholder="correo@empresa.com" /></label><label><span>Teléfono</span><input value={client.phone} onChange={(event) => onClientChange({ ...client, phone: event.target.value })} placeholder="+52 844 000 0000" /></label></div></div>}

          {step === 1 && <div><label className="wizard-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar servicio..." /></label><div className="wizard-service-list">{filtered.map((service) => { const line = lines.find((candidate) => candidate.service.id === service.id); return <article key={service.id}><div><small>{service.category}</small><b>{service.name}</b><span>{serviceMoney(service)} · {service.id === "support-remote" ? "Por hora" : billingLabel[service.billing]}</span></div>{line ? <div className="wizard-stepper"><button onClick={() => onQuantityChange(service.id, -1)}><Minus size={14} /></button><b>{line.quantity}</b><button onClick={() => onQuantityChange(service.id, 1)}><Plus size={14} /></button></div> : <button className="wizard-add" onClick={() => onAddService(service)}><Plus size={15} /> Agregar</button>}</article>; })}</div></div>}

          {step === 2 && <div className="wizard-conditions"><div className="wizard-copy"><h3>Moneda y condiciones</h3><p>Elige cómo se presentarán los importes finales.</p></div><div className="wizard-currency"><label><span>Moneda de cotización</span><select value={currency} onChange={(event) => onCurrencyChange(event.target.value)}><option value="MXN">MXN · Peso mexicano</option><option value="USD">USD · Dólar estadounidense</option><option value="CAD">CAD · Dólar canadiense</option><option value="EUR">EUR · Euro</option></select></label><div><b>1 USD = {exchangeRate.toFixed(4)} {currency}</b><small>{exchangeDate || "Consultando tipo de cambio"}</small></div></div><label className="wizard-referral"><input type="checkbox" checked={showExchangeRate} onChange={(event) => onShowExchangeRateChange(event.target.checked)} /><span><b>Mostrar tipo de cambio en PDF</b><small>Registra la tasa y fecha usadas.</small></span></label><div className="wizard-copy condition-heading"><h3>Descuento</h3><p>Solo referral puede acumularse con otra promoción.</p></div><div className="discount-options">{[{ id: "none", label: "Sin descuento", rate: "Precio de lista" }, { id: "onboarding", label: "Onboarding", rate: "30% · Mes 1" }, { id: "early", label: "Early adopter", rate: "20%" }, { id: "annual", label: "Pago anual", rate: "15%" }, { id: "recurring", label: "Cliente recurrente", rate: "10%" }].map((option) => <button key={option.id} className={discountId === option.id ? "active" : ""} onClick={() => onDiscountChange(option.id)}><span>{discountId === option.id && <Check size={14} />}</span><b>{option.label}</b><small>{option.rate}</small></button>)}</div><label className="wizard-referral"><input type="checkbox" checked={referral} onChange={(event) => onReferralChange(event.target.checked)} /><span><b>Agregar referral</b><small>10% adicional cuando el referido firma.</small></span></label></div>}

          {step === 3 && <div className="wizard-review"><div className="review-client"><small>PREPARADO PARA</small><h3>{client.company || client.name}</h3><p>{client.name}{client.email && ` · ${client.email}`}</p></div><div className="review-lines">{lines.map((line) => <div key={line.service.id}><span><b>{line.service.name}</b><small>{line.quantity} × {serviceMoney(line.service)}{line.service.volumeDiscount && line.quantity >= line.service.volumeDiscount.minQuantity && ` · −${line.service.volumeDiscount.rate * 100}%`}</small></span><strong>{displayMoney(lineTotalInUsd(line, usdRates))}</strong></div>)}</div><div className="review-total"><span>Total {currency}</span><b>{displayMoney(total)}</b></div></div>}
        </div>

        <footer className="wizard-footer"><button className="wizard-back" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ArrowLeft size={17} /> Anterior</button><span>Paso {step + 1} de {steps.length}</span>{step < 3 ? <button className="wizard-next" disabled={nextDisabled} onClick={() => setStep((current) => current + 1)}>Continuar <ArrowRight size={17} /></button> : <button className="wizard-next" onClick={onPrint}><Printer size={17} /> Generar PDF</button>}</footer>
      </section>
    </div>
  );
};
