"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { BadgeDollarSign, Building2, FileText, Mail, Pencil, Phone, Plus, Search, Trash2, UserRound, X } from "lucide-react";

type Client = {
  id: string;
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
  updatedAt: string;
};

type ClientForm = {
  name: string;
  company: string;
  accountName: string;
  purchases: string;
  estimatedValue: string;
  currency: string;
  requiresInvoice: boolean;
  legalName: string;
  taxId: string;
  taxRegime: string;
  fiscalZipCode: string;
  cfdiUse: string;
  billingEmail: string;
  email: string;
  phone: string;
  notes: string;
};
const emptyForm: ClientForm = { name: "", company: "", accountName: "", purchases: "", estimatedValue: "", currency: "MXN", requiresInvoice: false, legalName: "", taxId: "", taxRegime: "", fiscalZipCode: "", cfdiUse: "", billingEmail: "", email: "", phone: "", notes: "" };

const clientApi = {
  list: async (): Promise<Client[]> => {
    const response = await fetch("/api/clients");
    if (!response.ok) throw new Error("No fue posible cargar los clientes");
    return response.json() as Promise<Client[]>;
  },
  save: async (form: ClientForm, id?: string): Promise<Client> => {
    const response = await fetch(id ? `/api/clients/${id}` : "/api/clients", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json() as Client | { error?: string };
    if (!response.ok) throw new Error("error" in data ? data.error : "No fue posible guardar el cliente");
    return data as Client;
  },
  remove: async (id: string): Promise<void> => {
    const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("No fue posible eliminar el cliente");
  },
};

export const ClientManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadClients = useCallback(async () => {
    try {
      setClients(await clientApi.list());
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadClients(); }, [loadClients]);

  const filteredClients = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) => [client.name, client.company, client.accountName, client.purchases, client.email, client.phone]
      .some((value) => value?.toLowerCase().includes(term)));
  }, [clients, query]);

  const closeForm = useCallback(() => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }, []);

  const startEdit = useCallback((client: Client) => {
    setEditingId(client.id);
    setForm({ name: client.name, company: client.company ?? "", accountName: client.accountName ?? "", purchases: client.purchases ?? "", estimatedValue: client.estimatedValue?.toString() ?? "", currency: client.currency, requiresInvoice: client.requiresInvoice, legalName: client.legalName ?? "", taxId: client.taxId ?? "", taxRegime: client.taxRegime ?? "", fiscalZipCode: client.fiscalZipCode ?? "", cfdiUse: client.cfdiUse ?? "", billingEmail: client.billingEmail ?? "", email: client.email ?? "", phone: client.phone ?? "", notes: client.notes ?? "" });
    setOpen(true);
  }, []);

  const submit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await clientApi.save(form, editingId ?? undefined);
      closeForm();
      await loadClients();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  }, [closeForm, editingId, form, loadClients]);

  const remove = useCallback(async (client: Client) => {
    if (!window.confirm(`¿Eliminar a ${client.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await clientApi.remove(client.id);
      setClients((current) => current.filter(({ id }) => id !== client.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocurrió un error");
    }
  }, []);

  return (
    <section className="clients-workspace clients-content">
        <div className="clients-title">
          <div><p className="eyebrow">Directorio comercial</p><h1>Clientes</h1><p>Registra su cuenta, qué compra, valor comercial y datos de facturación.</p></div>
          <button className="new-client-button" onClick={() => setOpen(true)}><Plus size={18} /> Nuevo cliente</button>
        </div>

        <div className="client-toolbar">
          <label className="client-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, empresa, correo o teléfono" /></label>
          <span>{filteredClients.length} {filteredClients.length === 1 ? "cliente" : "clientes"}</span>
        </div>

        {message && !open && <p className="clients-message" role="alert">{message}</p>}
        {loading ? <div className="clients-empty">Cargando clientes…</div> : filteredClients.length === 0 ? (
          <div className="clients-empty"><UserRound size={34} /><h2>{query ? "No encontramos coincidencias" : "Tu directorio está vacío"}</h2><p>{query ? "Prueba con otra búsqueda." : "Agrega tu primer cliente para comenzar."}</p></div>
        ) : (
          <div className="clients-grid">
            {filteredClients.map((client) => (
              <article className="client-card" key={client.id}>
                <div className="client-card-top"><span className="client-avatar">{client.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div className="client-card-actions"><button aria-label={`Editar ${client.name}`} onClick={() => startEdit(client)}><Pencil size={15} /></button><button className="danger" aria-label={`Eliminar ${client.name}`} onClick={() => void remove(client)}><Trash2 size={15} /></button></div></div>
                <h2>{client.name}</h2>
                <p className="client-company"><Building2 size={14} /> {client.company || "Sin empresa"}</p>
                <div className="client-business"><span><Building2 size={14} /> {client.accountName || "Sin cuenta asignada"}</span><span><BadgeDollarSign size={14} /> {client.purchases || "Sin compras registradas"}</span>{client.estimatedValue !== null && <strong>{new Intl.NumberFormat("es-MX", { style: "currency", currency: client.currency }).format(client.estimatedValue)}</strong>}</div>
                <div className="client-contact">
                  <span><Mail size={14} /> {client.email || "Sin correo"}</span>
                  <span><Phone size={14} /> {client.phone || "Sin teléfono"}</span>
                  {client.requiresInvoice && <span><FileText size={14} /> Factura · {client.taxId}</span>}
                </div>
                {client.notes && <p className="client-notes">{client.notes}</p>}
              </article>
            ))}
          </div>
        )}
      {open && <div className="client-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
        <section className="client-modal" role="dialog" aria-modal="true" aria-labelledby="client-form-title">
          <div className="client-modal-heading"><div><p className="eyebrow">Ficha de contacto</p><h2 id="client-form-title">{editingId ? "Editar cliente" : "Nuevo cliente"}</h2></div><button aria-label="Cerrar" onClick={closeForm}><X size={20} /></button></div>
          <form onSubmit={submit}>
            <label>Nombre completo *<input required autoFocus maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Empresa<input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></label>
            <div className="client-form-section-title"><b>Relación comercial</b><span>Cuenta y compras del cliente</span></div>
            <label>Cuenta o proyecto<input value={form.accountName ?? ""} onChange={(event) => setForm({ ...form, accountName: event.target.value })} placeholder="Ej. Cuenta corporativa Norte" /></label>
            <label>¿Qué compra?<textarea rows={3} value={form.purchases ?? ""} onChange={(event) => setForm({ ...form, purchases: event.target.value })} placeholder="Servicios, productos o plan contratado…" /></label>
            <div className="client-form-row"><label>Valor estimado<input type="number" min="0" step="0.01" value={form.estimatedValue} onChange={(event) => setForm({ ...form, estimatedValue: event.target.value })} /></label><label>Moneda<select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}><option value="MXN">MXN</option><option value="USD">USD</option></select></label></div>
            <div className="client-form-row"><label>Correo<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Teléfono<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label></div>
            <label className="client-invoice-toggle"><input type="checkbox" checked={form.requiresInvoice} onChange={(event) => setForm({ ...form, requiresInvoice: event.target.checked })} /><span><b>Requiere factura</b><small>Guardar datos fiscales para emitir CFDI</small></span></label>
            {form.requiresInvoice && <div className="client-fiscal-fields"><div className="client-form-section-title"><b>Datos fiscales</b><span>Información de la constancia de situación fiscal</span></div><label>Razón social *<input required value={form.legalName ?? ""} onChange={(event) => setForm({ ...form, legalName: event.target.value })} /></label><div className="client-form-row"><label>RFC *<input required maxLength={13} value={form.taxId ?? ""} onChange={(event) => setForm({ ...form, taxId: event.target.value.toUpperCase() })} /></label><label>Código postal fiscal *<input required inputMode="numeric" maxLength={5} value={form.fiscalZipCode ?? ""} onChange={(event) => setForm({ ...form, fiscalZipCode: event.target.value })} /></label></div><label>Régimen fiscal *<input required value={form.taxRegime ?? ""} onChange={(event) => setForm({ ...form, taxRegime: event.target.value })} placeholder="Ej. 601 · General de Ley Personas Morales" /></label><div className="client-form-row"><label>Uso de CFDI *<input required value={form.cfdiUse ?? ""} onChange={(event) => setForm({ ...form, cfdiUse: event.target.value })} placeholder="Ej. G03" /></label><label>Correo de facturación<input type="email" value={form.billingEmail ?? ""} onChange={(event) => setForm({ ...form, billingEmail: event.target.value })} /></label></div></div>}
            <label>Notas<textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Contexto, preferencias o próximos pasos…" /></label>
            {message && <p className="clients-message" role="alert">{message}</p>}
            <div className="client-form-actions"><button type="button" onClick={closeForm}>Cancelar</button><button type="submit" disabled={saving}>{saving ? "Guardando…" : editingId ? "Guardar cambios" : "Crear cliente"}</button></div>
          </form>
        </section>
      </div>}
    </section>
  );
};
