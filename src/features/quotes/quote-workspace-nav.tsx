"use client";

import {
  FileJson,
  FilePlus2,
  FolderArchive,
  PackageSearch,
  Settings2,
  ShoppingBag,
  UsersRound,
} from "lucide-react";

export type WorkspaceSection = "create" | "current" | "quotes" | "services" | "clients" | "settings";

type QuoteWorkspaceNavProps = {
  active: WorkspaceSection;
  quoteCount: number;
  currentLineCount: number;
  onChange: (section: WorkspaceSection) => void;
};

const items: { id: WorkspaceSection; label: string; icon: typeof FilePlus2 }[] = [
  { id: "create", label: "Crear cotización", icon: FilePlus2 },
  { id: "current", label: "Actual", icon: ShoppingBag },
  { id: "quotes", label: "Cotizaciones", icon: FolderArchive },
  { id: "services", label: "Servicios", icon: PackageSearch },
  { id: "clients", label: "Clientes", icon: UsersRound },
  { id: "settings", label: "Ajustes", icon: Settings2 },
];

export const QuoteWorkspaceNav = ({ active, quoteCount, currentLineCount, onChange }: QuoteWorkspaceNavProps) => (
  <nav className="workspace-nav" aria-label="Secciones de cotizaciones">
    {items.map(({ id, label, icon: Icon }) => {
      const count = id === "quotes" ? quoteCount : id === "current" ? currentLineCount : null;
      return (
        <button
          key={id}
          type="button"
          className={active === id ? "active" : ""}
          aria-current={active === id ? "page" : undefined}
          onClick={() => onChange(id)}
        >
          <Icon size={17} />
          <span>{label}</span>
          {count !== null && <small>{count}</small>}
        </button>
      );
    })}
  </nav>
);

type JsonImportPanelProps = {
  message: string;
  isError: boolean;
  onImport: (file: File) => void;
  onExport: () => void;
  onDownloadTemplate: () => void;
};

export const JsonImportPanel = ({ message, isError, onImport, onExport, onDownloadTemplate }: JsonImportPanelProps) => (
  <section className="json-import-card" aria-labelledby="json-import-title">
    <div className="management-icon"><FileJson size={24} /></div>
    <div>
      <p className="eyebrow">Importación</p>
      <h2 id="json-import-title">Importar cotizaciones JSON</h2>
      <p>Carga un archivo exportado o utiliza nuestra plantilla para agregar cotizaciones al archivo local.</p>
      {message && <p className={isError ? "import-message error" : "import-message success"} role="status">{message}</p>}
    </div>
    <div className="management-actions">
      <button type="button" className="ghost-button" onClick={onExport}>Exportar cotizaciones</button>
      <label className="new-service-button file-button">
        <FileJson size={17} /> Importar JSON
        <input type="file" accept="application/json,.json" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImport(file);
          event.target.value = "";
        }} />
      </label>
      <button type="button" className="ghost-button" onClick={onDownloadTemplate}>Descargar plantilla</button>
    </div>
  </section>
);
