"use client";

import { useRef, useState } from "react";
import { Bold, CheckSquare, Eye, Heading2, Italic, List, ListOrdered, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
};

type MarkdownContentProps = { value: string; className?: string };

export const MarkdownContent = ({ value, className = "" }: MarkdownContentProps) => <div className={`markdown-content ${className}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown></div>;

export const MarkdownEditor = ({ value, onChange, placeholder, compact = false }: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const insert = (before: string, after = "", fallback = "texto") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  return (
    <div className={`markdown-editor ${compact ? "compact" : ""}`}>
      <div className="markdown-toolbar" aria-label="Formato Markdown">
        <button type="button" onClick={() => insert("## ", "", "Sección")} title="Título"><Heading2 size={15} /></button>
        <button type="button" onClick={() => insert("**", "**")} title="Negritas"><Bold size={15} /></button>
        <button type="button" onClick={() => insert("_", "_")} title="Cursivas"><Italic size={15} /></button>
        <span />
        <button type="button" onClick={() => insert("- ", "", "Concepto")} title="Lista"><List size={15} /></button>
        <button type="button" onClick={() => insert("1. ", "", "Concepto")} title="Lista numerada"><ListOrdered size={15} /></button>
        <button type="button" onClick={() => insert("- [ ] ", "", "Entregable")} title="Checklist"><CheckSquare size={15} /></button>
        <button type="button" className={`preview-toggle ${preview ? "active" : ""}`} onClick={() => setPreview((current) => !current)}>{preview ? <Pencil size={15} /> : <Eye size={15} />}<em>{preview ? "Editar" : "Vista previa"}</em></button>
      </div>
      {preview ? <MarkdownContent value={value || "_Sin contenido todavía._"} /> : <textarea ref={textareaRef} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} spellCheck />}
    </div>
  );
};
