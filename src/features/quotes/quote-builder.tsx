"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive, Check, ChevronRight, FilePenLine, Minus, Plus, Printer,
  RotateCcw, Save, Search, ShoppingBag, Trash2, UserRound, X,
  LayoutGrid, Headphones, CalendarClock, Briefcase, FolderOpen, Watch,
  Key, Package, Server, PieChart, SlidersHorizontal, PlusCircle, Code2,
  MessageSquare, Palette, Megaphone, Video, GraduationCap, Cloud,
  BarChart3, Plug, Bot, Zap, Database, CheckCircle, Globe, LayoutTemplate,
  Smartphone, ShieldCheck, PenTool, Share2, Mail, Camera, Wrench, BookOpen,
  CloudUpload, BrainCircuit, FlaskConical, DatabaseBackup, HardDrive, Cpu,
  ScanLine, ShoppingCart, Target, Users, ClipboardList, Link2, Activity,
  Bell, Lock, Paintbrush, Layout, FolderKanban, CalendarDays, Rocket,
  Settings, Terminal, Wifi
} from "lucide-react";
import { categories, categoryIcons, discountOptions, services, type Service } from "@/domain/catalog";
import { billingLabel, calculateQuote, lineTotalInUsd, money, unitPriceInUsd, type QuoteLine } from "@/domain/quote-calculator";
import { CustomServiceDialog } from "./custom-service-dialog";
import { QuoteWizardDialog } from "./quote-wizard-dialog";
import { MarkdownEditor } from "./markdown-editor";
import { ProfileDialog, type AgentProfile } from "./profile-dialog";
import { QuoteDocument } from "./quote-document";
import { QuoteHistoryDialog, type StoredQuote } from "./quote-history-dialog";
import { SessionControls } from "@/features/auth/session-controls";
import { JsonImportPanel, QuoteWorkspaceNav, type WorkspaceSection } from "./quote-workspace-nav";

type Client = { name: string; company: string; email: string; phone: string };
type CurrencyCode = "MXN" | "USD" | "CAD" | "EUR";
const emptyClient: Client = { name: "", company: "", email: "", phone: "" };
const defaultAgent: AgentProfile = { id: "marco", name: "Marco Gallegos", role: "Lead Engineer", email: "marco@soul23.mx", phone: "+52 844 227 8408" };
const readStoredArray = <T,>(key: string): T[] => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T[] : [];
  } catch {
    return [];
  }
};

const today = new Date();
const createQuoteNumber = () => `S23-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  "layout-grid": LayoutGrid, "headphones": Headphones, "calendar-clock": CalendarClock,
  "briefcase": Briefcase, "folder-open": FolderOpen, "watch": Watch, "key": Key,
  "package": Package, "server": Server, "pie-chart": PieChart, "sliders": SlidersHorizontal,
  "plus-circle": PlusCircle, "code-2": Code2, "message-square": MessageSquare, "palette": Palette,
  "megaphone": Megaphone, "video": Video, "graduation-cap": GraduationCap, "cloud": Cloud,
  "cloud-upload": CloudUpload, "bar-chart-3": BarChart3, "plug": Plug, "bot": Bot,
  "zap": Zap, "database": Database, "database-backup": DatabaseBackup, "check-circle": CheckCircle,
  "globe": Globe, "layout-template": LayoutTemplate, "smartphone": Smartphone,
  "shield-check": ShieldCheck, "pen-tool": PenTool, "share-2": Share2, "search": Search,
  "mail": Mail, "camera": Camera, "wrench": Wrench, "book-open": BookOpen,
  "brain-circuit": BrainCircuit, "shopping-bag": ShoppingBag, "flask-conical": FlaskConical,
  "hard-drive": HardDrive, "cpu": Cpu, "scan-line": ScanLine, "shopping-cart": ShoppingCart,
  "target": Target, "users": Users, "clipboard-list": ClipboardList, "link": Link2,
  "activity": Activity, "bell": Bell, "lock": Lock, "paintbrush": Paintbrush,
  "layout": Layout, "folder-kanban": FolderKanban, "calendar-days": CalendarDays,
  "rocket": Rocket, "settings": Settings, "terminal": Terminal, "wifi": Wifi,
};

function ServiceIcon({ name, size = 20, className = "" }: { name?: string; size?: number; className?: string }) {
  const Icon = name ? iconMap[name] : undefined;
  if (!Icon) return null;
  return <Icon size={size} className={className} strokeWidth={1.8} />;
}

export const QuoteBuilder = () => {
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [discountId, setDiscountId] = useState("none");
  const [customDiscountRate, setCustomDiscountRate] = useState(0);
  const [referral, setReferral] = useState(false);
  const [client, setClient] = useState<Client>(emptyClient);
  const [notes, setNotes] = useState("Vigencia de 15 días. El proyecto inicia con 50% de anticipo.");
  const [mobileCart, setMobileCart] = useState(false);
  const [customDialog, setCustomDialog] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [customServices, setCustomServices] = useState<Service[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>("MXN");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [usdRates, setUsdRates] = useState<Record<string, number>>({ usd: 1, mxn: 1 });
  const [exchangeDate, setExchangeDate] = useState("");
  const [showExchangeRate, setShowExchangeRate] = useState(true);
  const [includeVat, setIncludeVat] = useState(false);
  const [exchangeStatus, setExchangeStatus] = useState<"loading" | "ready" | "error">("loading");
  const [profiles, setProfiles] = useState<AgentProfile[]>([defaultAgent]);
  const [selectedProfileId, setSelectedProfileId] = useState("marco");
  const [profileDialog, setProfileDialog] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<StoredQuote[]>([]);
  const [currentQuoteId, setCurrentQuoteId] = useState(() => `quote-${Date.now()}`);
  const [quoteNumber, setQuoteNumber] = useState(createQuoteNumber);
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("create");
  const [importFeedback, setImportFeedback] = useState({ message: "", isError: false });

  useEffect(() => {
    const savedCustom = readStoredArray<Service>("s23-custom-services");
    const savedCurrency = localStorage.getItem("s23-quote-currency") as CurrencyCode | null;
    if (savedCurrency) setCurrency(savedCurrency);
    setShowExchangeRate(localStorage.getItem("s23-show-exchange") !== "false");
    const savedProfiles = readStoredArray<AgentProfile>("s23-agent-profiles");
    setSavedQuotes(readStoredArray<StoredQuote>("s23-saved-quotes"));
    setProfiles([defaultAgent, ...savedProfiles.filter((profile) => profile.id !== "marco")]);
    setSelectedProfileId(localStorage.getItem("s23-selected-agent") ?? "marco");
    setCustomServices(savedCustom);
    const saved = localStorage.getItem("s23-quote-draft");
    if (saved) {
      try {
        const draft = JSON.parse(saved) as { lineIds: { id: string; quantity: number }[]; client: Client; notes: string; includeVat?: boolean };
        setLines((draft.lineIds ?? []).flatMap(({ id, quantity }) => {
          const service = [...services, ...savedCustom].find((candidate) => candidate.id === id);
          return service ? [{ service, quantity }] : [];
        }));
        setClient(draft.client ?? emptyClient);
        setNotes(draft.notes ?? notes);
        setIncludeVat(draft.includeVat ?? false);
      } catch {
        localStorage.removeItem("s23-quote-draft");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("s23-quote-draft", JSON.stringify({ lineIds: lines.map(({ service, quantity }) => ({ id: service.id, quantity })), client, notes, includeVat }));
  }, [lines, client, notes, includeVat, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("s23-custom-services", JSON.stringify(customServices));
  }, [customServices, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("s23-quote-currency", currency);
    localStorage.setItem("s23-show-exchange", String(showExchangeRate));
  }, [currency, showExchangeRate, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("s23-agent-profiles", JSON.stringify(profiles.filter((profile) => profile.id !== "marco")));
    localStorage.setItem("s23-selected-agent", selectedProfileId);
  }, [profiles, selectedProfileId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("s23-saved-quotes", JSON.stringify(savedQuotes));
  }, [savedQuotes, hydrated]);

  useEffect(() => {
    if (currency === "USD") {
      setExchangeRate(1);
      setExchangeDate(new Date().toISOString().slice(0, 10));
      setExchangeStatus("ready");
      return;
    }
    const controller = new AbortController();
    setExchangeStatus("loading");
    fetch("/api/exchange", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("exchange")))
      .then((payload: { date: string; rates: Record<string, number> }) => {
        const rate = payload.rates[currency.toLowerCase()];
        if (!rate) throw new Error("currency");
        setExchangeRate(rate);
        setUsdRates(payload.rates);
        setExchangeDate(payload.date);
        setExchangeStatus("ready");
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setExchangeStatus("error");
      });
    return () => controller.abort();
  }, [currency]);

  const allServices = useMemo(() => [...customServices, ...services], [customServices]);
  const allCategories = useMemo(() => customServices.length ? ["Todos", "Mis servicios", ...categories.slice(1)] : categories, [customServices]);

  const filtered = useMemo(() => allServices.filter((service) => {
    const matchesCategory = category === "Todos" || service.category === category;
    const searchable = `${service.name} ${service.description} ${service.category}`.toLowerCase();
    return matchesCategory && searchable.includes(query.toLowerCase());
  }), [allServices, category, query]);

  const selectedDiscount = discountId === "custom"
    ? { id: "custom", label: "Personalizado", rate: customDiscountRate }
    : discountOptions.find((option) => option.id === discountId) ?? discountOptions[0];
  const totals = calculateQuote(lines, selectedDiscount.rate, referral, usdRates);
  const vat = includeVat ? totals.total * 0.16 : 0;
  const payableTotal = totals.total + vat;
  const displayMoney = (amount: number) => money(amount, currency, exchangeRate);
  const displayServicePrice = (service: Service) => displayMoney(unitPriceInUsd(service, usdRates));
  const displayLineTotal = (line: QuoteLine) => displayMoney(lineTotalInUsd(line, usdRates));
  const selectedAgent = profiles.find((profile) => profile.id === selectedProfileId) ?? defaultAgent;

  const addService = (service: Service) => setLines((current) => {
    const existing = current.find((line) => line.service.id === service.id);
    if (!existing) return [...current, { service, quantity: 1 }];
    return current.map((line) => line.service.id === service.id ? { ...line, quantity: line.quantity + 1 } : line);
  });

  const changeQuantity = (id: string, delta: number) => setLines((current) => current.flatMap((line) => {
    if (line.service.id !== id) return [line];
    const quantity = line.quantity + delta;
    return quantity > 0 ? [{ ...line, quantity }] : [];
  }));

  const clearQuote = () => {
    setLines([]);
    setClient(emptyClient);
    setDiscountId("none");
    setReferral(false);
    setCustomDiscountRate(0);
    setIncludeVat(false);
    setCurrentQuoteId(`quote-${Date.now()}`);
    setQuoteNumber(createQuoteNumber());
  };

  const saveQuote = () => {
    const snapshot: StoredQuote = { id: currentQuoteId, number: quoteNumber, updatedAt: new Date().toISOString(), client, lines, notes, discountId, customDiscountRate, referral, currency, showExchangeRate, includeVat };
    setSavedQuotes((current) => [snapshot, ...current.filter((quote) => quote.id !== currentQuoteId)]);
  };

  const printQuote = () => {
    saveQuote();
    window.print();
  };

  const openSavedQuote = (quote: StoredQuote) => {
    setCurrentQuoteId(quote.id);
    setQuoteNumber(quote.number);
    setClient(quote.client);
    setLines(quote.lines);
    setNotes(quote.notes);
    setDiscountId(quote.discountId);
    setCustomDiscountRate(quote.customDiscountRate ?? 0);
    setReferral(quote.referral);
    setCurrency(quote.currency);
    setShowExchangeRate(quote.showExchangeRate);
    setIncludeVat(quote.includeVat ?? false);
    setHistoryOpen(false);
  };

  const startManualQuote = () => {
    clearQuote();
    setHistoryOpen(false);
    setCustomDialog(true);
  };

  const saveCustomService = (service: Service) => {
    setCustomServices((current) => [service, ...current]);
    addService(service);
    setCategory("Mis servicios");
    setCustomDialog(false);
  };

  const deleteCustomService = (id: string) => {
    setCustomServices((current) => current.filter((service) => service.id !== id));
    setLines((current) => current.filter((line) => line.service.id !== id));
  };

  const isStoredQuote = (value: unknown): value is StoredQuote => {
    if (!value || typeof value !== "object") return false;
    const quote = value as Partial<StoredQuote>;
    return typeof quote.id === "string"
      && typeof quote.number === "string"
      && typeof quote.updatedAt === "string"
      && typeof quote.client === "object"
      && Array.isArray(quote.lines)
      && quote.lines.every((line) => line && typeof line.quantity === "number" && typeof line.service?.id === "string");
  };

  const importQuotes = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      if (!candidates.length || !candidates.every(isStoredQuote)) throw new Error("invalid-format");
      setSavedQuotes((current) => [
        ...candidates,
        ...current.filter((quote) => !candidates.some((candidate) => candidate.id === quote.id)),
      ]);
      setImportFeedback({ message: `${candidates.length} cotización${candidates.length === 1 ? "" : "es"} importada${candidates.length === 1 ? "" : "s"}.`, isError: false });
    } catch {
      setImportFeedback({ message: "El archivo no tiene el formato esperado. Descarga la plantilla y verifica sus campos.", isError: true });
    }
  };

  const downloadJsonTemplate = () => {
    const template: StoredQuote = {
      id: "quote-ejemplo-001",
      number: `S23-${new Date().getFullYear()}-000001`,
      updatedAt: new Date().toISOString(),
      client: { name: "Nombre del contacto", company: "Empresa", email: "contacto@empresa.com", phone: "+52 000 000 0000" },
      lines: [{ service: services[0], quantity: 1 }],
      notes: "Vigencia de 15 días.",
      discountId: "none",
      customDiscountRate: 0,
      referral: false,
      currency: "MXN",
      showExchangeRate: true,
      includeVat: false,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify([template], null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "plantilla-cotizaciones-s23.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const changeSection = (section: WorkspaceSection) => {
    setActiveSection(section);
    if (section === "current" && window.matchMedia("(max-width: 820px)").matches) setMobileCart(true);
  };

  return (
    <main className="workspace">
      <header className="app-header">
        <div className="brand"><img src="https://raw.githubusercontent.com/marcogll/mg_data_storage/refs/heads/main/soul23/logo/soul23_logo.svg" alt="Soul:23" /><span><b>Cotizaciones</b><small>Marketing & Systems</small></span></div>
        <div className="header-tools"><button className="history-trigger" onClick={() => setHistoryOpen(true)}><Archive size={16} /> Cotizaciones</button><button className="agent-trigger" onClick={() => setProfileDialog(true)}><span className="profile-avatar">{selectedAgent.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span><b>{selectedAgent.name}</b><small>{selectedAgent.role}</small></span><ChevronRight size={14} /></button><div className="header-meta"><span>Borrador guardado</span><b>{quoteNumber}</b></div><SessionControls /></div>
      </header>

      <QuoteWorkspaceNav active={activeSection} quoteCount={savedQuotes.length} currentLineCount={lines.length} onChange={changeSection} />

      {activeSection === "create" && <section className="catalog-panel">
        <div className="section-title">
          <div><p className="eyebrow">Punto de venta</p><h1>Arma una cotización</h1><p>Selecciona servicios y personaliza el alcance.</p></div>
          <div className="title-actions"><button className="wizard-button" onClick={() => setWizardOpen(true)}>Modo guiado <ChevronRight size={16} /></button><button className="ghost-button" onClick={() => setHistoryOpen(true)}><Archive size={16} /> Cotizaciones</button><button className="ghost-button" onClick={startManualQuote}><FilePenLine size={16} /> Artesanal</button><button className="new-service-button" onClick={() => setCustomDialog(true)}><Plus size={17} /> Crear servicio</button></div>
        </div>

        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar servicio, plan o solución..." /></label>
        <div className="category-tabs" aria-label="Categorías">
          {allCategories.map((value) => {
            const catIcon = categoryIcons[value] || "layout-grid";
            return (
              <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>
                <ServiceIcon name={catIcon} size={16} className="tab-icon" />
                <span>{value}</span>
              </button>
            );
          })}
        </div>

        <div className="service-grid">
          {filtered.map((service) => {
            const selected = lines.some((line) => line.service.id === service.id);
            return (
              <article className={`service-card ${selected ? "selected" : ""}`} key={service.id}>
                <div className="card-top">
                  <span className="billing-badge">{billingLabel[service.billing]}{service.chargeType === "third-party" && " · Pago a tercero"}</span>
                  {service.id.startsWith("custom-") ? <button className="delete-custom" onClick={() => deleteCustomService(service.id)} aria-label={`Eliminar ${service.name}`}><Trash2 size={14} /> Eliminar</button> : service.recommended && <span className="recommended"><Check size={12} /> Recomendado</span>}
                </div>
                <div className="card-icon-wrap">
                  <ServiceIcon name={service.icon || categoryIcons[service.category] || "zap"} size={32} className="card-icon" />
                </div>
                <div><p className="card-category">{service.category}</p><h2>{service.name}</h2><p className="card-description">{service.description}</p></div>
                {service.features && <ul>{service.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}</ul>}
                <div className="card-footer"><p><strong>{displayServicePrice(service)}</strong><small>{service.billing === "monthly" ? "/ mes" : service.billing === "annual" ? "/ año" : service.id === "support-remote" ? "/ hora" : ` ${currency}`}</small></p><button onClick={() => addService(service)} aria-label={`Agregar ${service.name}`}><Plus size={18} /> Agregar</button></div>
              </article>
            );
          })}
        </div>
        {filtered.length === 0 && <div className="empty-results"><Search size={28} /><b>Sin resultados</b><p>Prueba con otro nombre o categoría.</p></div>}
      </section>}

      {activeSection === "current" && <section className="management-panel">
        <div className="section-title"><div><p className="eyebrow">En preparación</p><h1>Cotización actual</h1><p>Revisa el resumen y continúa editando los datos en el panel lateral.</p></div><button className="new-service-button" onClick={() => setActiveSection("create")}><Plus size={17} /> Agregar servicios</button></div>
        <div className="current-overview">
          <div><span>Folio</span><b>{quoteNumber}</b></div><div><span>Cliente</span><b>{client.company || client.name || "Sin asignar"}</b></div><div><span>Conceptos</span><b>{lines.length}</b></div><div><span>Total</span><b>{displayMoney(payableTotal)}</b></div>
        </div>
      </section>}

      {activeSection === "quotes" && <section className="management-panel">
        <div className="section-title"><div><p className="eyebrow">Archivo local</p><h1>Cotizaciones</h1><p>Consulta, importa y administra tus cotizaciones guardadas.</p></div><button className="new-service-button" onClick={() => { clearQuote(); setActiveSection("create"); }}><Plus size={17} /> Nueva cotización</button></div>
        <JsonImportPanel message={importFeedback.message} isError={importFeedback.isError} onImport={importQuotes} onDownloadTemplate={downloadJsonTemplate} />
        <div className="management-list">
          {savedQuotes.length === 0 ? <div className="management-empty"><Archive size={28} /><b>No hay cotizaciones guardadas</b><p>Crea una nueva o importa un archivo JSON.</p></div> : savedQuotes.map((quote) => <article key={quote.id}><button onClick={() => { openSavedQuote(quote); setActiveSection("current"); }}><span><b>{quote.client.company || quote.client.name || "Sin cliente"}</b><small>{quote.number} · {quote.lines.length} conceptos</small></span><time>{new Date(quote.updatedAt).toLocaleDateString("es-MX")}</time></button><button className="history-delete" onClick={() => setSavedQuotes((current) => current.filter((item) => item.id !== quote.id))} aria-label={`Eliminar ${quote.number}`}><Trash2 size={16} /></button></article>)}
        </div>
      </section>}

      {activeSection === "services" && <section className="management-panel">
        <div className="section-title"><div><p className="eyebrow">Catálogo</p><h1>Manejo de servicios</h1><p>Consulta el catálogo base y administra tus servicios personalizados.</p></div><button className="new-service-button" onClick={() => setCustomDialog(true)}><Plus size={17} /> Crear servicio</button></div>
        <div className="service-stats"><div><span>Servicios base</span><b>{services.length}</b></div><div><span>Personalizados</span><b>{customServices.length}</b></div><div><span>Categorías</span><b>{allCategories.length - 1}</b></div></div>
        <div className="management-list service-management-list">{customServices.length === 0 ? <div className="management-empty"><Package size={28} /><b>Aún no tienes servicios propios</b><p>Crea uno para agregarlo a tu catálogo.</p></div> : customServices.map((service) => <article key={service.id}><div><span><b>{service.name}</b><small>{service.category} · {displayServicePrice(service)}</small></span></div><button className="history-delete" onClick={() => deleteCustomService(service.id)} aria-label={`Eliminar ${service.name}`}><Trash2 size={16} /></button></article>)}</div>
      </section>}

      {activeSection === "settings" && <section className="management-panel">
        <div className="section-title"><div><p className="eyebrow">Preferencias</p><h1>Ajustes y configuración</h1><p>Configura valores predeterminados para nuevas cotizaciones.</p></div></div>
        <div className="settings-grid">
          <section><h2>Moneda y documento</h2><label><span>Moneda predeterminada</span><select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}><option value="MXN">MXN · Peso mexicano</option><option value="USD">USD · Dólar estadounidense</option><option value="CAD">CAD · Dólar canadiense</option><option value="EUR">EUR · Euro</option></select></label><label className="settings-check"><input type="checkbox" checked={showExchangeRate} onChange={(event) => setShowExchangeRate(event.target.checked)} /><span>Mostrar tipo de cambio en el documento</span></label></section>
          <section><h2>Perfil del asesor</h2><div className="settings-profile"><span className="profile-avatar">{selectedAgent.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><b>{selectedAgent.name}</b><small>{selectedAgent.role}</small></div></div><button className="ghost-button" onClick={() => setProfileDialog(true)}>Administrar perfiles</button></section>
        </div>
      </section>}

      <aside className={`ticket-panel ${mobileCart ? "mobile-open" : ""}`}>
        <div className="ticket-header"><div><p className="eyebrow">Cotización actual</p><h2>{lines.length} {lines.length === 1 ? "concepto" : "conceptos"}</h2></div><button className="close-mobile" onClick={() => setMobileCart(false)} aria-label="Cerrar"><X /></button></div>
        <div className="ticket-scroll">
          {lines.length === 0 ? (
            <div className="empty-ticket"><ShoppingBag size={32} /><b>Tu cotización está vacía</b><p>Agrega servicios del catálogo para comenzar.</p></div>
          ) : lines.map((line) => (
            <div className="ticket-line" key={line.service.id}>
              <div className="line-main"><div><b>{line.service.name}</b><span>{line.service.chargeType === "third-party" ? "Pago directo a tercero" : billingLabel[line.service.billing]} · {displayServicePrice(line.service)}{line.service.volumeDiscount && line.quantity >= line.service.volumeDiscount.minQuantity && <em className="volume-badge">−{line.service.volumeDiscount.rate * 100}% volumen</em>}</span></div><button onClick={() => changeQuantity(line.service.id, -line.quantity)} aria-label={`Quitar ${line.service.name}`}><Trash2 size={15} /></button></div>
              <div className="line-controls"><div className="stepper"><button onClick={() => changeQuantity(line.service.id, -1)} aria-label="Restar"><Minus size={14} /></button><span>{line.quantity}</span><button onClick={() => changeQuantity(line.service.id, 1)} aria-label="Sumar"><Plus size={14} /></button></div><strong>{displayLineTotal(line)}</strong></div>
            </div>
          ))}

          <div className="form-section"><h3>Cliente</h3><div className="field-grid">
            <label><span>Nombre</span><input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Nombre del contacto" /></label>
            <label><span>Empresa</span><input value={client.company} onChange={(e) => setClient({ ...client, company: e.target.value })} placeholder="Empresa" /></label>
            <label><span>Correo</span><input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} placeholder="correo@empresa.com" /></label>
            <label><span>Teléfono</span><input value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} placeholder="+52 844 000 0000" /></label>
          </div></div>

          <div className="form-section"><h3>Descuento</h3><label><span>Promoción principal</span><select value={discountId} onChange={(e) => setDiscountId(e.target.value)}>{discountOptions.map((option) => <option key={option.id} value={option.id}>{option.label}{option.rate ? ` · ${option.rate * 100}%` : ""}</option>)}<option value="custom">Personalizado</option></select></label>{discountId === "custom" && <label><span>Porcentaje personalizado</span><div className="percent-input"><input type="number" min="0" max="100" step="0.5" value={customDiscountRate * 100} onChange={(event) => setCustomDiscountRate(Math.min(1, Math.max(0, Number(event.target.value) / 100)))} /><b>%</b></div></label>}<label className="check-row"><input type="checkbox" checked={referral} onChange={(e) => setReferral(e.target.checked)} /><span>Agregar referral 10% <small>Único descuento acumulable</small></span></label></div>
          <div className="form-section currency-section"><h3>Moneda</h3><label><span>Mostrar cotización en</span><select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}><option value="MXN">MXN · Peso mexicano</option><option value="USD">USD · Dólar estadounidense</option><option value="CAD">CAD · Dólar canadiense</option><option value="EUR">EUR · Euro</option></select></label><div className={`exchange-note ${exchangeStatus}`}><span>1 USD = {exchangeStatus === "ready" ? `${exchangeRate.toFixed(4)} ${currency}` : exchangeStatus === "loading" ? "Consultando…" : "No disponible"}</span>{exchangeDate && <small>Actualizado {exchangeDate}</small>}</div><label className="check-row"><input type="checkbox" checked={showExchangeRate} onChange={(event) => setShowExchangeRate(event.target.checked)} /><span>Mostrar tipo de cambio <small>Incluye tasa y fecha en el PDF</small></span></label></div>
          <div className="form-section tax-section"><h3>Facturación e IVA</h3><label><span>Tratamiento fiscal</span><select value={includeVat ? "with-vat" : "without-vat"} onChange={(event) => setIncludeVat(event.target.value === "with-vat")}><option value="without-vat">Sin IVA · No requiere factura</option><option value="with-vat">Requiere factura · Agregar IVA 16%</option></select></label><p className="tax-note">El IVA aplica solamente a honorarios Soul:23, después de descuentos.</p></div>
          <div className="form-section"><div className="markdown-field"><span>Notas y condiciones</span><MarkdownEditor compact value={notes} onChange={setNotes} placeholder="Escribe condiciones en Markdown..." /></div></div>
        </div>

        <div className="ticket-totals"><div><span>Honorarios Soul:23</span><b>{displayMoney(totals.subtotal)}</b></div>{totals.discount > 0 && <div className="discount-row"><span>Descuento</span><b>−{displayMoney(totals.discount)}</b></div>}{totals.thirdPartyTotal > 0 && <div className="third-party-row"><span>Pagos directos a terceros</span><b>{displayMoney(totals.thirdPartyTotal)}</b></div>}{includeVat && <div className="vat-row"><span>IVA 16%</span><b>{displayMoney(vat)}</b></div>}<div className="grand-total"><span>Total a pagar a Soul:23</span><b>{displayMoney(payableTotal)}</b></div>{totals.thirdPartyTotal > 0 && <div className="project-total"><span>Costo total estimado del proyecto</span><b>{displayMoney(totals.thirdPartyTotal + payableTotal)}</b></div>}<button className="save-quote-button" disabled={!lines.length} onClick={saveQuote}><Save size={17} /> Guardar cotización</button><button className="primary-button" disabled={!lines.length || exchangeStatus !== "ready"} onClick={printQuote}><Printer size={18} /> Generar cotización <ChevronRight size={18} /></button><p>{exchangeStatus === "error" ? "No se pudo obtener el tipo de cambio." : "Se guardará y abrirá la vista lista para PDF."}</p></div>
      </aside>

      <button className="mobile-cart-button" onClick={() => setMobileCart(true)}><ShoppingBag size={18} /><span>Ver cotización ({lines.length})</span><b>{displayMoney(totals.total)}</b></button>
      <CustomServiceDialog open={customDialog} onClose={() => setCustomDialog(false)} onSave={saveCustomService} />
      <QuoteHistoryDialog open={historyOpen} quotes={savedQuotes} onClose={() => setHistoryOpen(false)} onOpen={openSavedQuote} onDelete={(id) => setSavedQuotes((current) => current.filter((quote) => quote.id !== id))} onNewManual={startManualQuote} />
      <ProfileDialog open={profileDialog} profiles={profiles} selectedId={selectedProfileId} onSelect={(id) => { setSelectedProfileId(id); setProfileDialog(false); }} onSave={(profile) => { setProfiles((current) => [...current, profile]); setSelectedProfileId(profile.id); setProfileDialog(false); }} onDelete={(id) => { setProfiles((current) => current.filter((profile) => profile.id !== id)); if (selectedProfileId === id) setSelectedProfileId("marco"); }} onClose={() => setProfileDialog(false)} />
      <QuoteWizardDialog open={wizardOpen} services={allServices} lines={lines} client={client} discountId={discountId} referral={referral} total={totals.total} currency={currency} exchangeRate={exchangeRate} usdRates={usdRates} exchangeDate={exchangeDate} showExchangeRate={showExchangeRate} onCurrencyChange={(value) => setCurrency(value as CurrencyCode)} onShowExchangeRateChange={setShowExchangeRate} onClose={() => setWizardOpen(false)} onClientChange={setClient} onAddService={addService} onQuantityChange={changeQuantity} onDiscountChange={setDiscountId} onReferralChange={setReferral} onPrint={printQuote} />

      <QuoteDocument number={quoteNumber} date={today} agent={selectedAgent} client={client} lines={lines} totals={{ ...totals, vat, payableTotal }} includeVat={includeVat} currency={currency} notes={notes} exchangeRate={exchangeRate} exchangeDate={exchangeDate} showExchangeRate={showExchangeRate} displayMoney={displayMoney} displayLineTotal={displayLineTotal} />
    </main>
  );
};
