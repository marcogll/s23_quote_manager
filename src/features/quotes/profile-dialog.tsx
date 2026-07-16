"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";

export type AgentProfile = { id: string; name: string; role: string; email: string; phone: string };

type ProfileDialogProps = {
  open: boolean;
  profiles: AgentProfile[];
  selectedId: string;
  onSelect: (id: string) => void;
  onSave: (profile: AgentProfile) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

const emptyProfile = { name: "", role: "", email: "", phone: "" };

export const ProfileDialog = ({ open, profiles, selectedId, onSelect, onSave, onDelete, onClose }: ProfileDialogProps) => {
  const [form, setForm] = useState(emptyProfile);
  if (!open) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    onSave({ id: `agent-${Date.now()}`, ...form });
    setForm(emptyProfile);
  };

  return <div className="dialog-backdrop" onMouseDown={onClose}><section className="profile-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><header className="dialog-header"><div><p className="eyebrow">Emisor de cotización</p><h2>Perfiles de agente</h2></div><button onClick={onClose} aria-label="Cerrar"><X size={20} /></button></header><div className="profile-layout"><div className="profile-list"><span className="profile-label">Perfiles guardados</span>{profiles.map((profile) => <button key={profile.id} className={selectedId === profile.id ? "active" : ""} onClick={() => onSelect(profile.id)}><span className="profile-avatar">{profile.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span><b>{profile.name}</b><small>{profile.role}</small></span>{profile.id !== "marco" && <i onClick={(event) => { event.stopPropagation(); onDelete(profile.id); }}><Trash2 size={14} /></i>}</button>)}</div><form onSubmit={submit}><span className="profile-label">Crear perfil</span><label><span>Nombre</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nombre completo" /></label><label><span>Cargo</span><input required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} placeholder="Ej. Project Manager" /></label><label><span>Correo</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="correo@soul23.mx" /></label><label><span>Teléfono</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+52 ..." /></label><button type="submit" className="dialog-save"><Plus size={16} /> Guardar perfil</button></form></div></section></div>;
};
