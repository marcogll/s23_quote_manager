"use client";

import { DatabaseBackup, Download, FileJson, Upload } from "lucide-react";

type BackupSettingsProps = {
  message: string;
  isError: boolean;
  isBusy: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  onDownloadExample: () => void;
};

export const BackupSettings = ({ message, isError, isBusy, onExport, onImport, onDownloadExample }: BackupSettingsProps) => (
  <div className="form-section backup-settings">
    <div className="backup-settings-copy">
      <DatabaseBackup size={22} />
      <div>
        <h3>Respaldo y restauración</h3>
        <p>Descarga cotizaciones, clientes, servicios personalizados, agentes, preferencias y el borrador actual en un solo JSON.</p>
      </div>
    </div>
    {message && <p className={isError ? "import-message error" : "import-message success"} role="status">{message}</p>}
    <div className="management-actions backup-actions">
      <button type="button" className="new-service-button" disabled={isBusy} onClick={onExport}><Download size={17} /> Descargar respaldo</button>
      <label className="ghost-button file-button" aria-disabled={isBusy}>
        <Upload size={17} /> Restaurar respaldo
        <input type="file" accept="application/json,.json" disabled={isBusy} onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImport(file);
          event.target.value = "";
        }} />
      </label>
      <button type="button" className="ghost-button" disabled={isBusy} onClick={onDownloadExample}><FileJson size={17} /> JSON de ejemplo</button>
    </div>
    <small>La restauración reemplaza los clientes actuales y los datos locales de este navegador. No incluye usuarios ni contraseñas.</small>
  </div>
);
