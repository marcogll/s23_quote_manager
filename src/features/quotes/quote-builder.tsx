"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive, Check,   ChevronLeft, ChevronRight, FilePenLine, Minus, Plus, Printer,
  RotateCcw, Save, Search, ShoppingBag, Trash2, UserRound, X, Pencil,
  LayoutGrid, Headphones, CalendarClock, Briefcase, FolderOpen, Watch,
  Key, Package, Server, PieChart, SlidersHorizontal, PlusCircle, Code2,
  MessageSquare, Palette, Megaphone, Video, GraduationCap, Cloud,
  BarChart3, Plug, Bot, Zap, Database, CheckCircle, Globe, LayoutTemplate,
  Smartphone, ShieldCheck, PenTool, Share2, Mail, Camera, Wrench, BookOpen,
  CloudUpload, BrainCircuit, FlaskConical, DatabaseBackup, HardDrive, Cpu,
  ScanLine, ShoppingCart, Target, Users, ClipboardList, Link2, Activity,
  Bell, Lock, Paintbrush, Layout, FolderKanban, CalendarDays, Rocket,
  Settings, Terminal, Wifi, PackageSearch
} from "lucide-react";
import { categories, categoryIcons, discountOptions, loadServices, type Service } from "@/domain/catalog";
import { billingLabel, calculateQuote, lineTotalInUsd, money, roundPayableTotal, unitPriceInUsd, type QuoteLine } from "@/domain/quote-calculator";
import { CustomServiceDialog } from "./custom-service-dialog";
import { ServiceEditDialog } from "./service-edit-dialog";
import { QuoteWizardDialog } from "./quote-wizard-dialog";
import { MarkdownEditor } from "./markdown-editor";
import { ProfileDialog, type AgentProfile } from "./profile-dialog";
import { QuoteDocument } from "./quote-document";
import { QuoteHistoryDialog, type QuoteStatus, type StoredQuote } from "./quote-history-dialog";
import { QuoteControlTable } from "./quote-control-table";
import { QuotePaymentDialog } from "./quote-payment-dialog";
import { SessionControls } from "@/features/auth/session-controls";
import { JsonImportPanel, QuoteWorkspaceNav, type WorkspaceSection } from "./quote-workspace-nav";
import { ClientManager } from "@/features/clients/client-manager";
import { BackupSettings } from "@/features/backup/backup-settings";
import { BACKUP_FORMAT, BACKUP_VERSION, isWorkspaceBackup, type BackupClient, type WorkspaceBackup } from "@/features/backup/backup-format";
import { quoteApi } from "@/features/quotes/quote-api";
import { isStoredQuote } from "@/features/quotes/quote-input";

type Client = { name: string; company: string; email: string; phone: string };
type CurrencyCode = "MXN" | "USD" | "CAD" | "EUR";
type QuoteDraft = { lineIds: { id: string; quantity: number }[]; client: Client; serviceOverview?: string; notes: string; discountId?: string; customDiscountName?: string; customDiscountRate?: number; includeVat?: boolean; roundTotal?: boolean; roundingStep?: number; targetPrice?: string };
const emptyClient: Client = { name: "", company: "", email: "", phone: "" };
const defaultAgent: AgentProfile = { id: "marco", name: "Marco Gallegos", role: "Lead Engineer", email: "marco@soul23.mx", phone: "+52 844 227 8408" };
const toCamelCase = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-zA-Z0-9]+(.)?/g, (_, character: string | undefined) => character?.toUpperCase() ?? "")
  .replace(/^./, (character) => character.toLowerCase());
const quotePdfName = (number: string, client: Client) => {
  const clientName = toCamelCase(client.company || client.name || "sinCliente");
  return `quote_${number}_${clientName}`;
};
const openPrintDialog = (filename: string) => {
  const previousTitle = document.title;
  document.title = filename;
  window.addEventListener("afterprint", () => { document.title = previousTitle; }, { once: true });
  window.print();
};
const readStoredArray = <T,>(key: string): T[] => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T[] : [];
  } catch {
    return [];
  }
};
const readStoredRecord = <T,>(key: string): Record<string, T> => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as Record<string, T> : {};
  } catch {
    return {};
  }
};

const createQuoteNumber = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const unique = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `S23${year}${month}${unique}`;
};

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
  "package-search": PackageSearch,
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
  const [subcategory, setSubcategory] = useState("Todos");
  const [discountId, setDiscountId] = useState("none");
  const [customDiscountName, setCustomDiscountName] = useState("");
  const [customDiscountRate, setCustomDiscountRate] = useState(0);
  const [referral, setReferral] = useState(false);
  const [client, setClient] = useState<Client>(emptyClient);
  const [serviceOverview, setServiceOverview] = useState("");
  const [notes, setNotes] = useState("Vigencia de 15 días. El proyecto inicia con 50% de anticipo.");
  const [mobileCart, setMobileCart] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [roundTotal, setRoundTotal] = useState(true);
  const [roundingStep, setRoundingStep] = useState(100);
  const [targetPrice, setTargetPrice] = useState("");
  const [exchangeStatus, setExchangeStatus] = useState<"loading" | "ready" | "error">("loading");
  const [profiles, setProfiles] = useState<AgentProfile[]>([defaultAgent]);
  const [selectedProfileId, setSelectedProfileId] = useState("marco");
  const [profileDialog, setProfileDialog] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<StoredQuote[]>([]);
  const [paymentQuote, setPaymentQuote] = useState<StoredQuote | null>(null);
  const [currentQuoteId, setCurrentQuoteId] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteDate, setQuoteDate] = useState<Date>(undefined as unknown as Date);
  const [pendingPrint, setPendingPrint] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<WorkspaceSection>("create");
  const [importFeedback, setImportFeedback] = useState({ message: "", isError: false });
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [serviceOverrides, setServiceOverrides] = useState<Record<string, Partial<Service>>>({});
  const [masterServices, setMasterServices] = useState<Service[]>([]);
  const [serviceCategory, setServiceCategory] = useState("Todos");
  const [serviceQuery, setServiceQuery] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [editingCustomService, setEditingCustomService] = useState<Service | null>(null);
  const [editingCatalogService, setEditingCatalogService] = useState<Service | null>(null);
  const [backupFeedback, setBackupFeedback] = useState({ message: "", isError: false });
  const [backupBusy, setBackupBusy] = useState(false);

  useEffect(() => {
    const savedCustom = readStoredArray<Service>("s23-custom-services");
    const savedPriceOverrides = readStoredRecord<number>("s23-service-price-overrides");
    setPriceOverrides(savedPriceOverrides);
    const savedServiceOverrides = readStoredRecord<Partial<Service>>("s23-service-overrides");
    setServiceOverrides(savedServiceOverrides);
    const savedCurrency = localStorage.getItem("s23-quote-currency") as CurrencyCode | null;
    if (savedCurrency) setCurrency(savedCurrency);
    setShowExchangeRate(localStorage.getItem("s23-show-exchange") !== "false");
    const savedProfiles = readStoredArray<AgentProfile>("s23-agent-profiles");
    const localQuotes = readStoredArray<StoredQuote>("s23-saved-quotes").filter(isStoredQuote);
    setProfiles([defaultAgent, ...savedProfiles.filter((profile) => profile.id !== "marco")]);
    setSelectedProfileId(localStorage.getItem("s23-selected-agent") ?? "marco");
    setCustomServices(savedCustom);
    const draftJson = localStorage.getItem("s23-quote-draft");
    let draft: QuoteDraft | null = null;
    if (draftJson) {
      try {
        draft = JSON.parse(draftJson) as QuoteDraft;
      } catch {
        localStorage.removeItem("s23-quote-draft");
      }
    }
    void (async () => {
      let loaded: Service[] = [];
      try {
        loaded = await loadServices();
        setMasterServices(loaded);
      } catch {
        setMasterServices([]);
      }
      if (draft) {
        setLines((draft.lineIds ?? []).flatMap(({ id, quantity }) => {
          const service = [...loaded, ...savedCustom].find((candidate) => candidate.id === id);
          return service ? [{ service: { ...service, price: savedPriceOverrides[service.id] ?? service.price }, quantity }] : [];
        }));
        setClient(draft.client ?? emptyClient);
        setServiceOverview(draft.serviceOverview ?? "");
        setNotes(draft.notes ?? notes);
        setDiscountId(draft.discountId ?? "none");
        setCustomDiscountName(draft.customDiscountName ?? "");
        setCustomDiscountRate(draft.customDiscountRate ?? 0);
        setIncludeVat(draft.includeVat ?? false);
        setRoundTotal(draft.roundTotal ?? true);
        setRoundingStep(draft.roundingStep === 50 ? 50 : 100);
        setTargetPrice(draft.targetPrice ?? "");
      }
      setCurrentQuoteId(`quote-${Date.now()}`);
      setQuoteNumber(createQuoteNumber());
      setQuoteDate(new Date());
      setHydrated(true);
      try {
        const persistedQuotes = localQuotes.length ? await quoteApi.import(localQuotes) : await quoteApi.list();
        setSavedQuotes(persistedQuotes);
        if (localQuotes.length) localStorage.removeItem("s23-saved-quotes");
      } catch {
        setSavedQuotes(localQuotes);
        setImportFeedback({ message: "No fue posible sincronizar las cotizaciones con el servidor.", isError: true });
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("s23-quote-draft", JSON.stringify({ lineIds: lines.map(({ service, quantity }) => ({ id: service.id, quantity })), client, serviceOverview, notes, discountId, customDiscountName, customDiscountRate, includeVat, roundTotal, roundingStep, targetPrice }));
  }, [lines, client, serviceOverview, notes, discountId, customDiscountName, customDiscountRate, includeVat, roundTotal, roundingStep, targetPrice, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("s23-custom-services", JSON.stringify(customServices));
  }, [customServices, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("s23-service-price-overrides", JSON.stringify(priceOverrides));
  }, [priceOverrides, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("s23-service-overrides", JSON.stringify(serviceOverrides));
  }, [serviceOverrides, hydrated]);

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
    if (!pendingPrint) return;
    const frame = window.requestAnimationFrame(() => {
      openPrintDialog(pendingPrint);
      setPendingPrint(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pendingPrint]);

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

  const catalogServices = useMemo(() => masterServices.map((service) => ({
    ...service,
    ...serviceOverrides[service.id],
    price: priceOverrides[service.id] ?? serviceOverrides[service.id]?.price ?? service.price,
  })), [masterServices, priceOverrides, serviceOverrides]);
  const allServices = useMemo(() => [...customServices, ...catalogServices], [customServices, catalogServices]);
  const allCategories = useMemo(() => customServices.length ? ["Todos", "Mis servicios", ...categories.slice(1)] : categories, [customServices]);
  const subcategories = useMemo(() => {
    if (category === "Todos" || category === "Mis servicios") return [];
    const cats = Array.from(new Set(allServices.filter((s) => s.category === category).map((s) => s.subcategory).filter(Boolean))) as string[];
    return ["Todos", ...cats];
  }, [category, allServices]);
  const serviceCategories = useMemo(() => ["Todos", ...Array.from(new Set(allServices.map((service) => service.category)))], [allServices]);
  const servicesByCategory = useMemo(() => allServices.filter((service) => {
    const matchesCategory = serviceCategory === "Todos" || service.category === serviceCategory;
    const searchable = `${service.name} ${service.description} ${service.category} ${service.subcategory ?? ""}`.toLowerCase();
    return matchesCategory && searchable.includes(serviceQuery.trim().toLowerCase());
  }), [allServices, serviceCategory, serviceQuery]);

  const filtered = useMemo(() => allServices.filter((service) => {
    const matchesCategory = category === "Todos" || service.category === category;
    const matchesSubcategory = subcategory === "Todos" || service.subcategory === subcategory;
    const searchable = `${service.name} ${service.description} ${service.category}`.toLowerCase();
    return matchesCategory && matchesSubcategory && searchable.includes(query.toLowerCase());
  }), [allServices, category, subcategory, query]);

  const selectedDiscount = discountId === "custom"
    ? { id: "custom", label: customDiscountName.trim() || "Descuento personalizado", rate: customDiscountRate }
    : discountOptions.find((option) => option.id === discountId) ?? discountOptions[0];
  const totals = calculateQuote(lines, selectedDiscount.rate, referral, usdRates);
  const vat = includeVat ? totals.total * 0.16 : 0;
  const unroundedPayableTotal = totals.total + vat;
  const numericTargetPrice = Number(targetPrice);
  const hasTargetPrice = currency === "MXN" && targetPrice.trim() !== "" && Number.isFinite(numericTargetPrice) && numericTargetPrice >= 0 && exchangeRate > 0;
  const payableTotal = hasTargetPrice
    ? numericTargetPrice / exchangeRate
    : roundPayableTotal(unroundedPayableTotal, currency, exchangeRate, roundTotal ? roundingStep : 0);
  const roundingAdjustment = payableTotal - unroundedPayableTotal;
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
    setServiceOverview("");
    setDiscountId("none");
    setCustomDiscountName("");
    setReferral(false);
    setCustomDiscountRate(0);
    setIncludeVat(false);
    setRoundTotal(true);
    setRoundingStep(100);
    setTargetPrice("");
    setCurrentQuoteId(`quote-${Date.now()}`);
    setQuoteNumber(createQuoteNumber());
    setQuoteDate(new Date());
  };

  const createQuoteSnapshot = (): StoredQuote => {
    const existing = savedQuotes.find((quote) => quote.id === currentQuoteId);
    return { id: currentQuoteId, number: quoteNumber, updatedAt: new Date().toISOString(), date: quoteDate.toISOString(), client, lines, serviceOverview, notes, discountId, customDiscountName, customDiscountRate, referral, currency, showExchangeRate, includeVat, roundTotal, roundingStep, targetPrice, status: existing?.status ?? "draft", archivedAt: existing?.archivedAt, agent: selectedAgent, exchangeRate, exchangeDate, payment: existing?.payment };
  };

  const persistQuote = async (quote: StoredQuote) => {
    setSavedQuotes((current) => [quote, ...current.filter((item) => item.id !== quote.id)]);
    try {
      await quoteApi.save(quote);
    } catch (error) {
      setImportFeedback({ message: error instanceof Error ? error.message : "No fue posible guardar la cotización.", isError: true });
    }
  };

  const saveQuote = () => {
    void persistQuote(createQuoteSnapshot());
  };

  const savePaymentTracking = (quoteId: string, payment: NonNullable<StoredQuote["payment"]>) => {
    const quote = savedQuotes.find((item) => item.id === quoteId);
    if (quote) void persistQuote({ ...quote, payment, updatedAt: new Date().toISOString() });
  };

  const saveQuoteStatus = (quoteId: string, status: QuoteStatus) => {
    const quote = savedQuotes.find((item) => item.id === quoteId);
    if (quote) void persistQuote({ ...quote, status, updatedAt: new Date().toISOString() });
  };

  const changeQuoteArchive = (quote: StoredQuote, archived: boolean) => {
    void persistQuote({ ...quote, archivedAt: archived ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() });
  };

  const deleteQuote = (id: string) => {
    setSavedQuotes((current) => current.filter((quote) => quote.id !== id));
    void quoteApi.remove(id);
  };

  const printQuote = () => {
    saveQuote();
    openPrintDialog(quotePdfName(quoteNumber, client));
  };

  const openSavedQuote = (quote: StoredQuote) => {
    setCurrentQuoteId(quote.id);
    setQuoteNumber(quote.number);
    setQuoteDate(new Date(quote.date ?? quote.updatedAt));
    setClient(quote.client);
    setLines(quote.lines);
    setServiceOverview(quote.serviceOverview ?? "");
    setNotes(quote.notes);
    setDiscountId(quote.discountId);
    setCustomDiscountName(quote.customDiscountName ?? "");
    setCustomDiscountRate(quote.customDiscountRate ?? 0);
    setReferral(quote.referral);
    setCurrency(quote.currency);
    setShowExchangeRate(quote.showExchangeRate);
    setIncludeVat(quote.includeVat ?? false);
    setRoundTotal(quote.roundTotal ?? false);
    setRoundingStep(quote.roundingStep === 50 ? 50 : 100);
    setTargetPrice(quote.targetPrice ?? "");
    if (quote.agent) {
      setProfiles((current) => current.some((profile) => profile.id === quote.agent?.id) ? current : [...current, quote.agent!]);
      setSelectedProfileId(quote.agent.id);
    }
    if (quote.exchangeRate) setExchangeRate(quote.exchangeRate);
    if (quote.exchangeDate) setExchangeDate(quote.exchangeDate);
    setHistoryOpen(false);
  };

  const reprintSavedQuote = (quote: StoredQuote) => {
    openSavedQuote(quote);
    setPendingPrint(quotePdfName(quote.number, quote.client));
  };

  const startManualQuote = () => {
    clearQuote();
    setHistoryOpen(false);
    setCustomDialog(true);
  };

  const saveCustomService = (service: Service) => {
    const exists = customServices.some((s) => s.id === service.id);
    if (exists) {
      setCustomServices((current) => current.map((s) => s.id === service.id ? service : s));
      setLines((current) => current.map((line) => line.service.id === service.id ? { ...line, service } : line));
    } else {
      setCustomServices((current) => [service, ...current]);
      addService(service);
      setCategory("Mis servicios");
    }
    setCustomDialog(false);
    setEditingCustomService(null);
  };

  const startEditingPrice = (service: Service) => {
    setEditingServiceId(service.id);
    setEditingPrice(String(service.price));
  };

  const startEditCustomService = (service: Service) => {
    setEditingCustomService(service);
    setCustomDialog(true);
  };

  const startEditCatalogService = (service: Service) => {
    setEditingCatalogService(service);
  };

  const saveCatalogService = (originalId: string, updated: Service) => {
    setServiceOverrides((current) => ({ ...current, [originalId]: updated }));
    setLines((current) => current.map((line) => line.service.id === originalId ? { ...line, service: updated } : line));
    setEditingCatalogService(null);
  };

  const saveServicePrice = (service: Service) => {
    const price = Number(editingPrice);
    if (!Number.isFinite(price) || price <= 0) return;
    if (service.id.startsWith("custom-")) {
      setCustomServices((current) => current.map((item) => item.id === service.id ? { ...item, price } : item));
    } else {
      setPriceOverrides((current) => ({ ...current, [service.id]: price }));
    }
    setLines((current) => current.map((line) => line.service.id === service.id ? { ...line, service: { ...line.service, price } } : line));
    setEditingServiceId(null);
  };

  const deleteCustomService = (id: string) => {
    setCustomServices((current) => current.filter((service) => service.id !== id));
    setLines((current) => current.filter((line) => line.service.id !== id));
  };

  const importQuotes = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      const quotes = Array.isArray(data) ? data : [data];
      const valid = quotes.filter(isStoredQuote) as StoredQuote[];
      if (!valid.length) { setImportFeedback({ message: "No se encontraron cotizaciones válidas en el archivo.", isError: true }); return; }
      setSavedQuotes(await quoteApi.import(valid));
      setImportFeedback({ message: `Se importaron ${valid.length} cotización(es) correctamente.`, isError: false });
      setTimeout(() => setImportFeedback({ message: "", isError: false }), 3000);
    } catch {
      setImportFeedback({ message: "Error al leer el archivo. Verifica que sea un JSON válido.", isError: true });
    }
  };

  const downloadJsonTemplate = () => {
    const sampleNumber = createQuoteNumber();
    const sample: StoredQuote = { id: sampleNumber.toLowerCase(), number: sampleNumber, updatedAt: new Date().toISOString(), client: { name: "Cliente ejemplo", company: "Empresa S.A. de C.V.", email: "contacto@empresa.com", phone: "+52 844 000 0000" }, lines: [], serviceOverview: "Descripción general del alcance, objetivos y entregables incluidos en el servicio.", notes: "Vigencia de 15 días.", discountId: "none", customDiscountName: "", customDiscountRate: 0, referral: false, currency: "MXN", showExchangeRate: true, includeVat: false };
    const blob = new Blob([JSON.stringify([sample], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "plantilla-cotizaciones.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = (value: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const createBackup = (clients: BackupClient[]): WorkspaceBackup => ({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      quotes: savedQuotes,
      clients,
      customServices,
      agentProfiles: profiles.filter((profile) => profile.id !== defaultAgent.id),
      priceOverrides,
      serviceOverrides,
      preferences: { currency, showExchangeRate, selectedAgentId: selectedProfileId },
      draft: (() => {
        try { return JSON.parse(localStorage.getItem("s23-quote-draft") ?? "null") as unknown; }
        catch { return null; }
      })(),
    },
  });

  const exportBackup = async () => {
    setBackupBusy(true);
    setBackupFeedback({ message: "", isError: false });
    try {
      const response = await fetch("/api/backup");
      const payload = await response.json() as { clients?: BackupClient[]; error?: string };
      if (!response.ok || !payload.clients) throw new Error(payload.error ?? "No fue posible leer los clientes");
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(createBackup(payload.clients), `respaldo-s23-${date}.json`);
      setBackupFeedback({ message: "Respaldo descargado correctamente.", isError: false });
    } catch (error) {
      setBackupFeedback({ message: error instanceof Error ? error.message : "No fue posible crear el respaldo.", isError: true });
    } finally {
      setBackupBusy(false);
    }
  };

  const importBackup = async (file: File) => {
    setBackupFeedback({ message: "", isError: false });
    try {
      const backup = JSON.parse(await file.text()) as unknown;
      if (!isWorkspaceBackup(backup)) throw new Error("El archivo no es un respaldo S23 compatible o contiene datos inválidos.");
      if (!window.confirm("La restauración reemplazará tus clientes y datos locales actuales. ¿Deseas continuar?")) return;

      setBackupBusy(true);
      const response = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: backup.data.clients }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "No fue posible restaurar los clientes");

      await quoteApi.import(backup.data.quotes);
      localStorage.setItem("s23-custom-services", JSON.stringify(backup.data.customServices));
      localStorage.setItem("s23-agent-profiles", JSON.stringify(backup.data.agentProfiles));
      localStorage.setItem("s23-service-price-overrides", JSON.stringify(backup.data.priceOverrides));
      localStorage.setItem("s23-service-overrides", JSON.stringify(backup.data.serviceOverrides));
      localStorage.setItem("s23-quote-currency", backup.data.preferences.currency);
      localStorage.setItem("s23-show-exchange", String(backup.data.preferences.showExchangeRate));
      localStorage.setItem("s23-selected-agent", backup.data.preferences.selectedAgentId);
      if (backup.data.draft) localStorage.setItem("s23-quote-draft", JSON.stringify(backup.data.draft));
      else localStorage.removeItem("s23-quote-draft");
      window.location.reload();
    } catch (error) {
      setBackupFeedback({ message: error instanceof Error ? error.message : "No fue posible restaurar el respaldo.", isError: true });
      setBackupBusy(false);
    }
  };

  const downloadBackupExample = () => {
    const exampleClient: BackupClient = { name: "Cliente ejemplo", company: "Empresa S.A. de C.V.", accountName: "Cuenta principal", purchases: "Servicios de tecnología", estimatedValue: 25000, currency: "MXN", requiresInvoice: false, legalName: null, taxId: null, taxRegime: null, fiscalZipCode: null, cfdiUse: null, billingEmail: null, email: "contacto@empresa.com", phone: "+52 844 000 0000", notes: "Registro de ejemplo" };
    downloadJson(createBackup([exampleClient]), "ejemplo-respaldo-s23.json");
  };

  const changeSection = (section: WorkspaceSection) => setActiveSection(section);

  return (
    <main className={`workspace${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <header className="app-header">
        <div className="brand"><img src="https://raw.githubusercontent.com/marcogll/mg_data_storage/refs/heads/main/soul23/logo/soul23_logo.svg" alt="Soul:23" /><span><b>Cotizaciones</b><small>Marketing & Systems</small></span></div>
        <div className="header-tools"><button className="history-trigger" onClick={() => setHistoryOpen(true)}><Archive size={16} /> Cotizaciones</button><button className="agent-trigger" onClick={() => setProfileDialog(true)}><span className="profile-avatar">{selectedAgent.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span><b>{selectedAgent.name}</b><small>{selectedAgent.role}</small></span><ChevronRight size={14} /></button><div className="header-meta"><span>Borrador guardado</span><b>{quoteNumber}</b></div><SessionControls /></div>
      </header>

      <QuoteWorkspaceNav active={activeSection} quoteCount={savedQuotes.filter((quote) => !quote.archivedAt).length} currentLineCount={lines.length} onChange={changeSection} />

      {activeSection === "create" && (
        <section className="catalog-panel">
          <div className="section-title">
            <div><p className="eyebrow">Punto de venta</p><h1>Arma una cotización</h1><p>Selecciona servicios y personaliza el alcance.</p></div>
            <div className="title-actions"><button className="wizard-button" onClick={() => setWizardOpen(true)}>Modo guiado <ChevronRight size={16} /></button><button className="ghost-button" onClick={() => setHistoryOpen(true)}><Archive size={16} /> Cotizaciones</button><button className="ghost-button" onClick={startManualQuote}><FilePenLine size={16} /> Artesanal</button><button className="new-service-button" onClick={() => setCustomDialog(true)}><Plus size={17} /> Crear servicio</button></div>
          </div>

          <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar servicio, plan o solución..." /></label>
          <div className="category-tabs" aria-label="Categorías">
            {allCategories.map((value) => {
              const catIcon = categoryIcons[value] || "layout-grid";
              return (
                <button key={value} className={category === value ? "active" : ""} onClick={() => { setCategory(value); setSubcategory("Todos"); }}>
                  <ServiceIcon name={catIcon} size={16} className="tab-icon" />
                  <span>{value}</span>
                </button>
              );
            })}
          </div>

          {subcategories.length > 1 && (
            <div className="subcategory-tabs" aria-label="Subcategorías">
              {subcategories.map((value) => (
                <button key={value} className={subcategory === value ? "active" : ""} onClick={() => setSubcategory(value)}>
                  <span>{value}</span>
                </button>
              ))}
            </div>
          )}

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
        </section>
      )}

      {activeSection === "current" && (
        <section className="quotes-panel">
          <div className="section-title"><div><p className="eyebrow">Cotización actual</p><h1>Resumen</h1><p>{lines.length} {lines.length === 1 ? "concepto" : "conceptos"} en la cotización.</p></div></div>
          {lines.length === 0 ? <div className="empty-results"><ShoppingBag size={28} /><b>Sin servicios</b><p>Agrega servicios desde la sección "Crear cotización".</p></div> : <div className="current-summary">{lines.map((line) => (<div className="summary-line" key={line.service.id}><div className="summary-line-info"><h3>{line.service.name}</h3><p>{line.service.description}</p></div><div className="summary-line-meta"><span>{displayServicePrice(line.service)} × {line.quantity}</span><strong>{displayLineTotal(line)}</strong></div></div>))}</div>}
        </section>
      )}

      {activeSection === "quotes" && (
        <section className="quotes-panel">
          <div className="section-title"><div><p className="eyebrow">Control comercial</p><h1>Cotizaciones</h1><p>Consulta, clasifica y da seguimiento a cada oportunidad.</p></div></div>
          <JsonImportPanel message={importFeedback.message} isError={importFeedback.isError} onImport={importQuotes} onExport={() => downloadJson(savedQuotes, `cotizaciones-s23-${new Date().toISOString().slice(0, 10)}.json`)} onDownloadTemplate={downloadJsonTemplate} />
          <QuoteControlTable quotes={savedQuotes} onOpen={openSavedQuote} onPrint={reprintSavedQuote} onTrackPayment={(quote) => setPaymentQuote(quote)} onStatusChange={saveQuoteStatus} onArchiveChange={changeQuoteArchive} onDelete={deleteQuote} />
        </section>
      )}

      {activeSection === "services" && (
        <section className="quotes-panel services-panel">
          <div className="section-title"><div><p className="eyebrow">Catálogo de servicios</p><h1>Mis servicios</h1><p>Administra precios y agrega conceptos a una cotización desde un solo lugar.</p></div><div className="title-actions"><button className="new-service-button" onClick={() => setCustomDialog(true)}><Plus size={17} /> Crear servicio</button></div></div>
          <div className="services-overview" aria-label="Resumen del catálogo">
            <div><PackageSearch size={19} /><span><b>{allServices.length}</b><small>Servicios activos</small></span></div>
            <div><LayoutGrid size={19} /><span><b>{serviceCategories.length - 1}</b><small>Categorías</small></span></div>
            <div><PenTool size={19} /><span><b>{customServices.length}</b><small>Personalizados</small></span></div>
          </div>
          <div className="services-toolbar">
            <label className="services-search"><Search size={18} /><span className="sr-only">Buscar en el catálogo</span><input value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder="Buscar por nombre, categoría o descripción…" />{serviceQuery && <button type="button" onClick={() => setServiceQuery("")} aria-label="Limpiar búsqueda"><X size={16} /></button>}</label>
            <span>{servicesByCategory.length} {servicesByCategory.length === 1 ? "resultado" : "resultados"}</span>
          </div>
          <div className="category-tabs service-category-tabs" aria-label="Filtrar servicios por categoría">{serviceCategories.map((value) => { const count = value === "Todos" ? allServices.length : allServices.filter((service) => service.category === value).length; return <button key={value} className={serviceCategory === value ? "active" : ""} onClick={() => setServiceCategory(value)}><ServiceIcon name={categoryIcons[value] ?? "package-search"} size={16} className="tab-icon" /><span>{value}</span><small>{count}</small></button>; })}</div>
          {servicesByCategory.length > 0 ? <div className="services-management-grid">{servicesByCategory.map((service) => { const inQuote = lines.some((line) => line.service.id === service.id); return (<article className="service-management-card" key={service.id}>
            <div className="service-management-head"><span className="service-management-icon"><ServiceIcon name={service.icon || categoryIcons[service.category] || "zap"} size={22} /></span><div><p className="card-category">{service.category}{service.subcategory && ` · ${service.subcategory}`}</p><h3>{service.name}</h3></div>{service.id.startsWith("custom-") && <span className="custom-badge">Personalizado</span>}</div>
            <p className="service-management-description">{service.description}</p>
            <div className="service-management-price"><span>{billingLabel[service.billing]}</span><strong>{displayServicePrice(service)}</strong></div>
            {editingServiceId === service.id ? <div className="service-price-editor"><span>$</span><input aria-label={`Nuevo precio para ${service.name}`} autoFocus type="number" min="0.01" step="0.01" value={editingPrice} onChange={(event) => setEditingPrice(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveServicePrice(service); if (event.key === "Escape") setEditingServiceId(null); }} /><small>{service.sourceCurrency ?? "MXN"}</small><button type="button" onClick={() => saveServicePrice(service)}>Guardar</button><button type="button" onClick={() => setEditingServiceId(null)}>Cancelar</button></div> : <div className="service-item-actions"><button className="edit-service-price" onClick={() => startEditingPrice(service)}><Pencil size={14} /> Editar precio</button><button className={`add-from-catalog ${inQuote ? "added" : ""}`} onClick={() => addService(service)}><Plus size={14} /> {inQuote ? "Agregar otro" : "Cotizar"}</button>{service.id.startsWith("custom-") ? <><button className="edit-custom" onClick={() => startEditCustomService(service)}><Pencil size={14} /> Editar</button><button className="delete-custom" onClick={() => deleteCustomService(service.id)} aria-label={`Eliminar ${service.name}`}><Trash2 size={14} /></button></> : <button className="edit-catalog" onClick={() => startEditCatalogService(service)}><Pencil size={14} /> Editar</button>}</div>}
          </article>); })}</div> : <div className="services-empty"><Search size={26} /><b>No encontramos servicios</b><p>Prueba con otra búsqueda o cambia la categoría.</p><button type="button" onClick={() => { setServiceQuery(""); setServiceCategory("Todos"); }}>Limpiar filtros</button></div>}
        </section>
      )}

      {activeSection === "clients" && <ClientManager />}

      {activeSection === "settings" && (
        <section className="quotes-panel">
          <div className="section-title"><div><p className="eyebrow">Configuración</p><h1>Ajustes</h1><p>Personaliza el comportamiento de la herramienta.</p></div></div>
          <div className="settings-section">
            <div className="form-section"><h3>Apariencia</h3><label className="check-row"><input type="checkbox" checked={showExchangeRate} onChange={(event) => setShowExchangeRate(event.target.checked)} /><span>Mostrar tipo de cambio <small>Incluye tasa y fecha en el PDF</small></span></label></div>
            <div className="form-section"><h3>Agentes</h3><p>Administra los perfiles de agente desde el botón de perfil en la cabecera.</p><button className="ghost-button" onClick={() => setProfileDialog(true)}><UserRound size={16} /> Administrar agentes</button></div>
            <BackupSettings message={backupFeedback.message} isError={backupFeedback.isError} isBusy={backupBusy} onExport={() => void exportBackup()} onImport={(file) => void importBackup(file)} onDownloadExample={downloadBackupExample} />
          </div>
        </section>
      )}

      <aside className={`ticket-panel${sidebarCollapsed ? " collapsed" : ""}${mobileCart ? " mobile-open" : ""}`}>
        <div className="ticket-header"><div><p className="eyebrow">Cotización actual</p><h2>{lines.length} {lines.length === 1 ? "concepto" : "conceptos"}</h2></div><button className="close-panel" onClick={() => { setSidebarCollapsed(true); setMobileCart(false); }} aria-label="Cerrar panel"><X /></button></div>
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

          <div className="form-section"><h3>Descuento</h3><label><span>Promoción principal</span><select value={discountId} onChange={(e) => setDiscountId(e.target.value)}>{discountOptions.map((option) => <option key={option.id} value={option.id}>{option.label}{option.rate ? ` · ${option.rate * 100}%` : ""}</option>)}<option value="custom">Personalizado</option></select></label>{discountId === "custom" && <><label><span>Nombre del descuento</span><input value={customDiscountName} onChange={(event) => setCustomDiscountName(event.target.value)} placeholder="Ej. Convenio especial" /></label><label><span>Porcentaje personalizado</span><div className="percent-input"><input type="number" min="0" max="100" step="0.5" value={customDiscountRate * 100} onChange={(event) => setCustomDiscountRate(Math.min(1, Math.max(0, Number(event.target.value) / 100)))} /><b>%</b></div></label></>}<label className="check-row"><input type="checkbox" checked={referral} onChange={(e) => setReferral(e.target.checked)} /><span>Agregar referral 10% <small>Único descuento acumulable</small></span></label></div>
          <div className="form-section currency-section"><h3>Moneda</h3><label><span>Mostrar cotización en</span><select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)}><option value="MXN">MXN · Peso mexicano</option><option value="USD">USD · Dólar estadounidense</option><option value="CAD">CAD · Dólar canadiense</option><option value="EUR">EUR · Euro</option></select></label><div className={`exchange-note ${exchangeStatus}`}><span>1 USD = {exchangeStatus === "ready" ? `${exchangeRate.toFixed(4)} ${currency}` : exchangeStatus === "loading" ? "Consultando…" : "No disponible"}</span>{exchangeDate && <small>Actualizado {exchangeDate}</small>}</div><label className="check-row"><input type="checkbox" checked={showExchangeRate} onChange={(event) => setShowExchangeRate(event.target.checked)} /><span>Mostrar tipo de cambio <small>Incluye tasa y fecha en el PDF</small></span></label></div>
          <div className="form-section tax-section"><h3>Facturación e IVA</h3><label><span>Tratamiento fiscal</span><select value={includeVat ? "with-vat" : "without-vat"} onChange={(event) => setIncludeVat(event.target.value === "with-vat")}><option value="without-vat">Sin IVA · No requiere factura</option><option value="with-vat">Requiere factura · Agregar IVA 16%</option></select></label><p className="tax-note">El IVA aplica solamente a honorarios Soul:23, después de descuentos.</p>{currency === "MXN" && <><label><span>Precio final objetivo (opcional)</span><input type="number" min="0" step="50" value={targetPrice} onChange={(event) => setTargetPrice(event.target.value)} placeholder="Ej. 4100" /></label><label className="check-row"><input type="checkbox" checked={roundTotal && !hasTargetPrice} onChange={(event) => setRoundTotal(event.target.checked)} disabled={hasTargetPrice} /><span>Redondeo automático <small>Al múltiplo de <select value={roundingStep} onChange={(event) => setRoundingStep(Number(event.target.value))} onClick={(event) => event.stopPropagation()} disabled={hasTargetPrice}><option value="50">$50</option><option value="100">$100</option></select> más cercano</small></span></label></>}</div>
          <div className="form-section"><div className="markdown-field"><span>Descripción general del servicio</span><MarkdownEditor compact value={serviceOverview} onChange={setServiceOverview} placeholder="Describe qué incluye el servicio en general, sus objetivos y alcance..." /></div><p className="tax-note">Aparece en la propuesta antes del desglose de conceptos.</p></div>
          <div className="form-section"><div className="markdown-field"><span>Notas y condiciones</span><MarkdownEditor compact value={notes} onChange={setNotes} placeholder="Escribe condiciones en Markdown..." /></div></div>
        </div>

        <div className="ticket-totals"><div><span>Honorarios Soul:23</span><b>{displayMoney(totals.subtotal)}</b></div>{totals.discount > 0 && <div className="discount-row"><span>Descuento</span><b>−{displayMoney(totals.discount)}</b></div>}{totals.thirdPartyTotal > 0 && <div className="third-party-row"><span>Pagos directos a terceros</span><b>{displayMoney(totals.thirdPartyTotal)}</b></div>}{includeVat && <div className="vat-row"><span>IVA 16%</span><b>{displayMoney(vat)}</b></div>}{Math.abs(roundingAdjustment) > 0.001 && <div><span>Ajuste por redondeo</span><b>{roundingAdjustment < 0 ? "−" : "+"}{displayMoney(Math.abs(roundingAdjustment))}</b></div>}<div className="grand-total"><span>Total a pagar a Soul:23</span><b>{displayMoney(payableTotal)}</b></div>{totals.thirdPartyTotal > 0 && <div className="project-total"><span>Costo total estimado del proyecto</span><b>{displayMoney(totals.thirdPartyTotal + payableTotal)}</b></div>}<button className="save-quote-button" disabled={!lines.length} onClick={saveQuote}><Save size={17} /> Guardar cotización</button><button className="primary-button" disabled={!lines.length || (currency !== "MXN" && exchangeStatus !== "ready")} onClick={printQuote}><Printer size={18} /> Generar cotización <ChevronRight size={18} /></button><p>{exchangeStatus === "error" && currency !== "MXN" ? "No se pudo obtener el tipo de cambio." : "Se guardará y abrirá la vista lista para PDF."}</p></div>
      </aside>

      <button className="mobile-cart-button" onClick={() => setMobileCart(true)}><ShoppingBag size={18} /><span>Ver cotización ({lines.length})</span><b>{displayMoney(totals.total)}</b></button>
      <button className="sidebar-reopen" onClick={() => setSidebarCollapsed(false)} aria-label="Abrir panel"><ChevronLeft size={18} /></button>
      <CustomServiceDialog open={customDialog} onClose={() => { setCustomDialog(false); setEditingCustomService(null); }} onSave={saveCustomService} editingService={editingCustomService} />
      <ServiceEditDialog open={!!editingCatalogService} onClose={() => setEditingCatalogService(null)} onSave={saveCatalogService} editingService={editingCatalogService} />
      <QuoteHistoryDialog open={historyOpen} quotes={savedQuotes} onClose={() => setHistoryOpen(false)} onOpen={openSavedQuote} onReprint={reprintSavedQuote} onDelete={deleteQuote} onTrackPayment={(quote) => { setPaymentQuote(quote); setHistoryOpen(false); }} onArchiveChange={changeQuoteArchive} onNewManual={startManualQuote} />
      <QuotePaymentDialog quote={paymentQuote} onClose={() => setPaymentQuote(null)} onSave={savePaymentTracking} />
      <ProfileDialog open={profileDialog} profiles={profiles} selectedId={selectedProfileId} onSelect={(id) => { setSelectedProfileId(id); setProfileDialog(false); }} onSave={(profile) => { setProfiles((current) => [...current, profile]); setSelectedProfileId(profile.id); setProfileDialog(false); }} onDelete={(id) => { setProfiles((current) => current.filter((profile) => profile.id !== id)); if (selectedProfileId === id) setSelectedProfileId("marco"); }} onClose={() => setProfileDialog(false)} />
      <QuoteWizardDialog open={wizardOpen} services={allServices} lines={lines} client={client} discountId={discountId} referral={referral} total={totals.total} currency={currency} exchangeRate={exchangeRate} usdRates={usdRates} exchangeDate={exchangeDate} showExchangeRate={showExchangeRate} onCurrencyChange={(value) => setCurrency(value as CurrencyCode)} onShowExchangeRateChange={setShowExchangeRate} onClose={() => setWizardOpen(false)} onClientChange={setClient} onAddService={addService} onQuantityChange={changeQuantity} onDiscountChange={setDiscountId} onReferralChange={setReferral} onPrint={printQuote} />

      {hydrated && <QuoteDocument number={quoteNumber} date={quoteDate} agent={selectedAgent} client={client} lines={lines} totals={{ ...totals, vat, roundingAdjustment, payableTotal }} discountLabel={selectedDiscount.label} includeVat={includeVat} currency={currency} serviceOverview={serviceOverview} notes={notes} exchangeRate={exchangeRate} exchangeDate={exchangeDate} showExchangeRate={showExchangeRate} displayMoney={displayMoney} displayLineTotal={displayLineTotal} />}
    </main>
  );
};
