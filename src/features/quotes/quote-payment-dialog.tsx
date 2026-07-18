"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import type { PaymentTracking, StoredQuote } from "./quote-history-dialog";

type QuotePaymentDialogProps = {
  quote: StoredQuote | null;
  onClose: () => void;
  onSave: (quoteId: string, payment: PaymentTracking) => void;
};

const emptyPayment: PaymentTracking = {
  depositPaid: false,
  depositDate: "",
  depositMethod: "",
  balancePaid: false,
  balanceDate: "",
  balanceMethod: "",
  notes: "",
};

const paymentMethods = ["Transferencia", "Efectivo", "Tarjeta", "Cheque", "PayPal", "Otro"];

export const paymentStatus = (payment?: PaymentTracking) => {
  if (payment?.balancePaid) return { label: "Liquidada", tone: "paid" };
  if (payment?.depositPaid) return { label: "Con anticipo", tone: "deposit" };
  return { label: "Pendiente", tone: "pending" };
};

export const QuotePaymentDialog = ({ quote, onClose, onSave }: QuotePaymentDialogProps) => {
  const [payment, setPayment] = useState<PaymentTracking>(emptyPayment);

  useEffect(() => {
    setPayment(quote?.payment ?? emptyPayment);
  }, [quote]);

  if (!quote) return null;

  const save = () => {
    onSave(quote.id, payment);
    onClose();
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="payment-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="dialog-header">
          <div><p className="eyebrow">Control de cobranza</p><h2 id="payment-dialog-title">{quote.number}</h2><small>{quote.client.company || quote.client.name || "Sin cliente"}</small></div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </header>
        <div className="payment-dialog-body">
          <fieldset className={payment.depositPaid ? "payment-stage complete" : "payment-stage"}>
            <label className="payment-stage-check"><input type="checkbox" checked={payment.depositPaid} onChange={(event) => setPayment({ ...payment, depositPaid: event.target.checked, depositDate: event.target.checked && !payment.depositDate ? new Date().toISOString().slice(0, 10) : payment.depositDate })} /><span><b>Anticipo recibido</b><small>Marca cuando se confirme el primer pago.</small></span></label>
            <div className="payment-fields">
              <label><span>Fecha del anticipo</span><input type="date" disabled={!payment.depositPaid} value={payment.depositDate} onChange={(event) => setPayment({ ...payment, depositDate: event.target.value })} /></label>
              <label><span>Forma de pago</span><select disabled={!payment.depositPaid} value={payment.depositMethod} onChange={(event) => setPayment({ ...payment, depositMethod: event.target.value })}><option value="">Selecciona una opción</option>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select></label>
            </div>
          </fieldset>
          <fieldset className={payment.balancePaid ? "payment-stage complete" : "payment-stage"}>
            <label className="payment-stage-check"><input type="checkbox" checked={payment.balancePaid} onChange={(event) => setPayment({ ...payment, balancePaid: event.target.checked, depositPaid: event.target.checked || payment.depositPaid, balanceDate: event.target.checked && !payment.balanceDate ? new Date().toISOString().slice(0, 10) : payment.balanceDate })} /><span><b>Saldo liquidado</b><small>Confirma que se recibió el resto del pago.</small></span></label>
            <div className="payment-fields">
              <label><span>Fecha de liquidación</span><input type="date" disabled={!payment.balancePaid} value={payment.balanceDate} onChange={(event) => setPayment({ ...payment, balanceDate: event.target.value })} /></label>
              <label><span>Forma de pago</span><select disabled={!payment.balancePaid} value={payment.balanceMethod} onChange={(event) => setPayment({ ...payment, balanceMethod: event.target.value })}><option value="">Selecciona una opción</option>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select></label>
            </div>
          </fieldset>
          <label className="payment-notes"><span>Notas de cobranza</span><textarea rows={3} value={payment.notes} onChange={(event) => setPayment({ ...payment, notes: event.target.value })} placeholder="Referencia, folio o cualquier detalle del pago..." /></label>
        </div>
        <footer className="payment-dialog-footer"><button type="button" onClick={onClose}>Cancelar</button><button type="button" className="dialog-save" onClick={save}><Save size={16} /> Guardar seguimiento</button></footer>
      </section>
    </div>
  );
};
