"use client";

import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import type { Service } from "@/domain/catalog";
import { MarkdownEditor } from "./markdown-editor";

type CustomServiceDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
};

const initialForm = { name: "", description: "", price: "", chargeType: "soul23" as "soul23" | "third-party", content: "## Alcance\n\n- Entregable principal\n- Configuración y puesta en marcha\n\n## Condiciones\n\n- [ ] Accesos proporcionados por el cliente\n- [ ] Alcance aprobado" };

export const CustomServiceDialog = ({ open, onClose, onSave }: CustomServiceDialogProps) => {
  const [form, setForm] = useState(initialForm);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || price <= 0) return;

    onSave({
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      category: "Mis servicios",
      price,
      billing: "one-time",
      description: form.description.trim() || "Servicio personalizado de pago único.",
      features: form.content.split("\n").filter((line) => /^[-*] (?!\[)/.test(line)).map((line) => line.replace(/^[-*] /, "").trim()).slice(0, 3),
      content: form.content,
      chargeType: form.chargeType,
    });
    setForm(initialForm);
  };

  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="custom-dialog" role="dialog" aria-modal="true" aria-labelledby="custom-service-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div><p className="eyebrow">Catálogo reutilizable</p><h2 id="custom-service-title">Nuevo servicio único</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <label><span>Nombre del servicio</span><input autoFocus required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. Migración de correo" /></label>
          <div className="dialog-row">
            <label><span>Precio USD</span><input required min="0.01" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0.00" /></label>
            <div className="fixed-type"><span>Tipo</span><b>Pago único</b><small>One-time</small></div>
          </div>
          <fieldset className="charge-type"><legend>¿Quién recibe el pago?</legend><label className={form.chargeType === "soul23" ? "active" : ""}><input type="radio" name="chargeType" checked={form.chargeType === "soul23"} onChange={() => setForm({ ...form, chargeType: "soul23" })} /><span><b>Honorarios Soul:23</b><small>Se incluye en subtotal, descuentos y total a pagar.</small></span></label><label className={form.chargeType === "third-party" ? "active" : ""}><input type="radio" name="chargeType" checked={form.chargeType === "third-party"} onChange={() => setForm({ ...form, chargeType: "third-party" })} /><span><b>Costo de tercero</b><small>El cliente paga directamente al proveedor.</small></span></label></fieldset>
          <label><span>Descripción</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe brevemente el alcance" /></label>
          <div className="markdown-field"><span>Alcance en Markdown</span><MarkdownEditor value={form.content} onChange={(content) => setForm({ ...form, content })} placeholder="Pega aquí tu Markdown o escribe el alcance..." /><small>Puedes pegar un documento Markdown completo; conservará títulos, listas, checklists y tablas.</small></div>
          <div className="dialog-actions"><button type="button" className="dialog-cancel" onClick={onClose}>Cancelar</button><button type="submit" className="dialog-save"><Plus size={17} /> Guardar servicio</button></div>
        </form>
      </section>
    </div>
  );
};
