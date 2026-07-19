"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Service, Billing } from "@/domain/catalog";
import { MarkdownEditor } from "./markdown-editor";

type ServiceEditDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (originalId: string, service: Service) => void;
  editingService: Service | null;
};

const categories = ["Web", "Soporte", "Media & Marketing"];
const billingOptions: { value: Billing; label: string }[] = [
  { value: "one-time", label: "Pago único" },
  { value: "monthly", label: "Mensual" },
  { value: "annual", label: "Anual" },
];

const formFromService = (service: Service) => ({
  name: service.name,
  category: service.category,
  subcategory: service.subcategory ?? "",
  billing: service.billing,
  price: String(service.price),
  description: service.description,
  content: service.content ?? "",
  chargeType: service.chargeType ?? "soul23",
  icon: service.icon ?? "",
});

export const ServiceEditDialog = ({ open, onClose, onSave, editingService }: ServiceEditDialogProps) => {
  const [form, setForm] = useState(formFromService({ id: "", name: "", category: "Web", price: 0, billing: "one-time", description: "" }));

  useEffect(() => {
    if (editingService) {
      setForm(formFromService(editingService));
    }
  }, [editingService]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingService) return;
    const price = Number(form.price);
    if (!form.name.trim() || price <= 0) return;

    onSave(editingService.id, {
      ...editingService,
      name: form.name.trim(),
      category: form.category,
      subcategory: form.subcategory.trim() || undefined,
      price,
      billing: form.billing as Billing,
      description: form.description.trim(),
      content: form.content || undefined,
      chargeType: form.chargeType as "soul23" | "third-party",
      icon: form.icon.trim() || undefined,
    });
  };

  if (!open || !editingService) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="custom-dialog" role="dialog" aria-modal="true" aria-labelledby="service-edit-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div><p className="eyebrow">Catálogo de servicios</p><h2 id="service-edit-title">Editar servicio</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-row">
            <label><span>Nombre del servicio</span><input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. Migración de correo" /></label>
            <label><span>Precio</span><input required min="0.01" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0.00" /></label>
          </div>
          <div className="dialog-row">
            <label><span>Categoría</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></label>
            <label><span>Subcategoría</span><input value={form.subcategory} onChange={(event) => setForm({ ...form, subcategory: event.target.value })} placeholder="Ej. Desarrollo" /></label>
          </div>
          <div className="dialog-row">
            <label><span>Facturación</span><select value={form.billing} onChange={(event) => setForm({ ...form, billing: event.target.value as Billing })}>{billingOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></label>
            <label><span>Icono</span><input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} placeholder="Ej. code-2, globe" /></label>
          </div>
          <fieldset className="charge-type"><legend>¿Quién recibe el pago?</legend><label className={form.chargeType === "soul23" ? "active" : ""}><input type="radio" name="chargeType2" checked={form.chargeType === "soul23"} onChange={() => setForm({ ...form, chargeType: "soul23" })} /><span><b>Honorarios Soul:23</b><small>Se incluye en subtotal, descuentos y total a pagar.</small></span></label><label className={form.chargeType === "third-party" ? "active" : ""}><input type="radio" name="chargeType2" checked={form.chargeType === "third-party"} onChange={() => setForm({ ...form, chargeType: "third-party" })} /><span><b>Costo de tercero</b><small>El cliente paga directamente al proveedor.</small></span></label></fieldset>
          <label><span>Descripción</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe brevemente el alcance" /></label>
          <div className="markdown-field"><span>Alcance en Markdown</span><MarkdownEditor value={form.content} onChange={(content) => setForm({ ...form, content })} placeholder="Pega aquí tu Markdown o escribe el alcance..." /><small>Puedes pegar un documento Markdown completo; conservará títulos, listas, checklists y tablas.</small></div>
          <div className="dialog-actions"><button type="button" className="dialog-cancel" onClick={onClose}>Cancelar</button><button type="submit" className="dialog-save"><X size={17} /> Guardar cambios</button></div>
        </form>
      </section>
    </div>
  );
};
