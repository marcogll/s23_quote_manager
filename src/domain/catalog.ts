export type Billing = "one-time" | "monthly" | "annual";

export type Service = {
  id: string;
  name: string;
  category: string;
  price: number;
  billing: Billing;
  description: string;
  features?: string[];
  content?: string;
  chargeType?: "soul23" | "third-party";
  sourceCurrency?: "USD" | "MXN";
  volumeDiscount?: { minQuantity: number; rate: number };
  recommended?: boolean;
  is_custom?: boolean;
  icon?: string;
};

const item = (id: string, name: string, category: string, price: number, billing: Billing, description: string, features?: string[], recommended?: boolean, icon?: string): Service => ({ id, name, category, price, billing, description, features, recommended, icon });

export const services: Service[] = [
  /* ──────────────── Soul:23 Core ──────────────── */
  { id: "support-remote", name: "Soporte remoto", category: "Soporte", price: 950, sourceCurrency: "MXN", billing: "one-time", description: "Sesión de soporte remoto de 1 hora.", features: ["Atención remota", "Diagnóstico y resolución", "15% de descuento desde 4 horas"], chargeType: "soul23", volumeDiscount: { minQuantity: 4, rate: 0.15 }, icon: "headphones" },

  item("plan-starter", "Starter", "Planes mensuales", 240.95, "monthly", "Presencia digital y automatización esencial.", ["Landing page inicial", "1–2 workflows", "1 red social", "Soporte y reporte mensual"], false, "zap"),
  item("plan-grow", "Grow", "Planes mensuales", 486.95, "monthly", "Operación multicanal con IA y métricas.", ["2 redes sociales", "SEO + contenido", "Integración IA", "Dashboard", "Soporte prioritario"], true, "trending-up"),
  item("plan-scale", "Scale", "Planes mensuales", 907.95, "monthly", "Ejecución avanzada con PMO, BI e IA.", ["PMO parcial", "Automatización avanzada", "Paid media", "BI en tiempo real", "Seguimiento semanal"], false, "bar-chart-3"),
  item("plan-enterprise", "Enterprise", "Planes mensuales", 1717.95, "monthly", "Equipo dedicado con SLA y supervisión senior.", ["PMO dedicado", "1 perfil técnico", "Automatización integral", "Standup diario", "SLA garantizado"], false, "shield-check"),
  item("plan-marketing", "Marketing 360°", "Planes mensuales", 711.95, "monthly", "Marketing integral en tres canales.", ["3 redes sociales", "SEO", "Meta + Google Ads", "Dashboard unificado"], false, "megaphone"),

  item("ret-social", "Redes sociales", "Servicios especializados", 269.95, "monthly", "2 redes, copy, publicaciones y métricas.", undefined, false, "share-2"),
  item("ret-seo", "SEO técnico", "Servicios especializados", 318.95, "monthly", "Posicionamiento, blog y link building.", undefined, false, "search"),
  item("ret-paid", "Paid media", "Servicios especializados", 284.95, "monthly", "Gestión de Meta y Google Ads.", undefined, false, "target"),
  item("ret-staff", "Staffing", "Servicios especializados", 1079.95, "monthly", "Dev, diseñador o copy supervisado.", undefined, false, "users"),

  item("project-diagnostic", "Diagnóstico / Consultoría", "Proyectos", 417.95, "one-time", "Mapeo de procesos y roadmap priorizado.", ["Sesión de 2–3 horas", "Documento PDF", "Seguimiento 30 días"], false, "clipboard-list"),
  item("project-landing", "Landing Page", "Proyectos", 436.95, "one-time", "Página de alta conversión conectada a tu funnel.", ["UI/UX custom", "Copy", "CRM", "SEO on-page", "Analytics", "10 días"], false, "layout"),
  item("project-auto-basic", "Automatización Básica", "Proyectos", 589.95, "one-time", "1–2 workflows con CRM y mensajería.", ["Email/WhatsApp", "14 días"], false, "bot"),
  item("project-site", "Sitio Corporativo", "Proyectos", 1079.95, "one-time", "Sitio administrable de hasta 8 secciones.", ["CMS", "SEO técnico", "Hosting y dominio 1 año", "21 días"], false, "globe"),
  item("project-audit", "Auditoría TI", "Proyectos", 686.95, "one-time", "Revisión técnica y de experiencia de usuario.", ["Código", "UI/UX", "Reporte ejecutivo", "7 días"], false, "scan-line"),
  item("project-auto-advanced", "Automatización Avanzada", "Proyectos", 1374.95, "one-time", "Automatización n8n multi-sistema con IA.", ["WhatsApp Business", "APIs", "Monitoreo", "3 meses soporte", "30 días"], false, "cpu"),
  item("project-commerce", "E-commerce", "Proyectos", 1865.95, "one-time", "Tienda con pagos, CFDI y WhatsApp.", ["Catálogo ilimitado", "Pasarelas MX", "45 días"], false, "shopping-cart"),
  item("project-bi", "Sistema BI + IA", "Proyectos", 2700.95, "one-time", "Inteligencia de negocio y agentes autónomos.", ["Scoring predictivo", "Reportes automáticos", "6 meses soporte", "60 días"], false, "brain-circuit"),

  item("hw-basic", "Reloj básico", "Asistencia · Hardware", 202, "one-time", "Huella/PIN para hasta 50 empleados.", undefined, false, "watch"),
  item("hw-pro", "Reloj Pro", "Asistencia · Hardware", 398, "one-time", "Facial + huella para hasta 200 empleados.", undefined, false, "watch"),
  item("hw-enterprise", "Reloj Enterprise", "Asistencia · Hardware", 722, "one-time", "Facial + huella + NFC, empleados ilimitados.", undefined, false, "watch"),
  item("lic-month", "Licencia mensual", "Asistencia · Licencias", 49.99, "monthly", "Software de control de asistencia.", undefined, false, "key"),
  item("lic-quarter", "Licencia trimestral", "Asistencia · Licencias", 129.99, "one-time", "Tres meses de licencia, ahorro aproximado 13%.", undefined, false, "key"),
  item("lic-half", "Licencia semestral", "Asistencia · Licencias", 219.99, "one-time", "Seis meses de licencia, ahorro aproximado 26%.", undefined, false, "key"),
  item("lic-year", "Licencia anual", "Asistencia · Licencias", 349.99, "annual", "Doce meses de licencia, ahorro aproximado 41%.", undefined, true, "key"),
  item("bundle-starter", "Bundle Starter", "Asistencia · Bundles", 497, "one-time", "Reloj básico + licencia anual.", undefined, false, "package"),
  item("bundle-pro", "Bundle Pro", "Asistencia · Bundles", 674, "one-time", "Reloj Pro + licencia anual.", undefined, false, "package"),
  item("bundle-enterprise", "Bundle Enterprise", "Asistencia · Bundles", 943, "one-time", "Reloj Enterprise + licencia anual.", undefined, false, "package"),
  item("self-hosted", "Asistencia self-hosted", "Asistencia · Self-hosted", 260, "one-time", "Licencia perpetua; infraestructura estimada $400/año.", undefined, false, "server"),

  item("dashboard-base", "Dashboard base", "Dashboards", 462, "one-time", "Hasta 6 widgets, filtros y exportación.", ["UI/UX", "PDF/Excel", "1 revisión"], false, "pie-chart"),
  item("dash-data-medium", "Datos medianos", "Dashboards · Variables", 231, "one-time", "Ajuste por volumen de datos mediano.", undefined, false, "hard-drive"),
  item("dash-data-large", "Datos grandes", "Dashboards · Variables", 693, "one-time", "Ajuste por gran volumen de datos.", undefined, false, "hard-drive"),
  item("dash-api", "Conexión API estándar", "Dashboards · Variables", 144, "one-time", "Conectividad mediante API estándar.", undefined, false, "plug"),
  item("dash-db", "Conexión BD directa", "Dashboards · Variables", 202, "one-time", "Conexión directa a base de datos.", undefined, false, "database"),
  item("dash-erp", "Conexión custom / ERP", "Dashboards · Variables", 462, "one-time", "Integración personalizada o ERP.", undefined, false, "link"),
  item("dash-dedicated", "Cloud dedicado", "Dashboards · Variables", 115, "one-time", "Configuración dedicada; hosting $69/mes.", undefined, false, "cloud"),
  item("dash-self", "Servidor self-hosted", "Dashboards · Variables", 202, "one-time", "Configuración en servidor propio.", undefined, false, "server"),
  item("addon-widget", "Widget adicional", "Dashboards · Add-ons", 46, "one-time", "Widget adicional al alcance base.", undefined, false, "plus-circle"),
  item("addon-alerts", "Alertas automáticas", "Dashboards · Add-ons", 144, "one-time", "Alertas basadas en reglas.", undefined, false, "bell"),
  item("addon-roles", "Multiusuario con roles", "Dashboards · Add-ons", 173, "one-time", "Accesos y permisos por rol.", undefined, false, "lock"),
  item("addon-realtime", "Tiempo real", "Dashboards · Add-ons", 231, "one-time", "Actualización de datos en tiempo real.", undefined, false, "activity"),
  item("addon-whitelabel", "White-label", "Dashboards · Add-ons", 289, "one-time", "Personalización completa de marca.", undefined, false, "paintbrush"),

  /* ──────────────── Servicios MXN (Nuevos) ──────────────── */
  { id: "mxn-dev-fullstack", name: "Desarrollo Web Full Stack", category: "Tecnología", price: 25000, sourceCurrency: "MXN", billing: "one-time", description: "Desarrollo de aplicación web completa con frontend y backend.", features: ["Hasta 3 revisiones", "No incluye hosting", "2 semanas de entrega"], chargeType: "soul23", icon: "code-2" },
  { id: "mxn-landing", name: "Landing Page Profesional", category: "Tecnología", price: 6500, sourceCurrency: "MXN", billing: "one-time", description: "Página de aterrizaje optimizada para conversión.", features: ["Diseño responsive", "Formulario de contacto", "5 días de entrega"], chargeType: "soul23", icon: "layout-template" },
  { id: "mxn-app-mobile", name: "App Móvil iOS/Android", category: "Tecnología", price: 45000, sourceCurrency: "MXN", billing: "one-time", description: "Aplicación móvil nativa o híbrida.", features: ["Publicación en stores", "Mantenimiento primer mes gratis", "6 semanas de entrega"], chargeType: "soul23", icon: "smartphone" },

  { id: "mxn-consultoria", name: "Consultoría IT", category: "Consultoría", price: 2000, sourceCurrency: "MXN", billing: "one-time", description: "Asesoría técnica especializada en infraestructura.", features: ["Mínimo 2 horas", "Reporte escrito incluido", "1 hora por sesión"], chargeType: "soul23", icon: "message-square" },
  { id: "mxn-audit-seg", name: "Auditoría de Seguridad", category: "Consultoría", price: 11000, sourceCurrency: "MXN", billing: "one-time", description: "Revisión completa de vulnerabilidades.", features: ["Reporte ejecutivo", "Plan de remediación", "1 semana de entrega"], chargeType: "soul23", icon: "shield-check" },

  { id: "mxn-branding", name: "Branding Corporativo", category: "Diseño", price: 12500, sourceCurrency: "MXN", billing: "one-time", description: "Creación de identidad visual completa.", features: ["Logo, paleta y tipografía", "Manual básico incluido", "10 días de entrega"], chargeType: "soul23", icon: "palette" },
  { id: "mxn-uxui", name: "Diseño UX/UI App", category: "Diseño", price: 22000, sourceCurrency: "MXN", billing: "one-time", description: "Diseño de interfaz y experiencia de usuario.", features: ["Prototipo interactivo", "Entrega en Figma", "2 semanas de entrega"], chargeType: "soul23", icon: "pen-tool" },

  { id: "mxn-social", name: "Redes Sociales - Gestión Mensual", category: "Marketing", price: 5500, sourceCurrency: "MXN", billing: "monthly", description: "Administración de 3 redes sociales.", features: ["12 posts mensuales", "Reporte mensual", "Respuesta a comentarios"], chargeType: "soul23", icon: "share-2" },
  { id: "mxn-seo", name: "SEO Técnico On-Page", category: "Marketing", price: 6000, sourceCurrency: "MXN", billing: "one-time", description: "Optimización técnica para motores de búsqueda.", features: ["Análisis de keywords", "10 páginas optimizadas", "1 semana de entrega"], chargeType: "soul23", icon: "search" },
  { id: "mxn-newsletter", name: "Newsletter Mensual Diseñada", category: "Marketing", price: 2500, sourceCurrency: "MXN", billing: "one-time", description: "Diseño y maquetación de newsletter.", features: ["Diseño responsive", "2 revisiones", "1 semana de entrega"], chargeType: "soul23", icon: "mail" },

  { id: "mxn-video", name: "Video Corporativo 2min", category: "Multimedia", price: 2500, sourceCurrency: "MXN", billing: "one-time", description: "Video institucional con edición profesional.", features: ["Locución incluida", "Música de stock", "2 revisiones", "5 días de entrega"], chargeType: "soul23", icon: "video" },
  { id: "mxn-foto", name: "Fotografía de Producto", category: "Multimedia", price: 4000, sourceCurrency: "MXN", billing: "one-time", description: "Sesión fotográfica profesional de productos.", features: ["20 fotos retocadas", "Estudio incluido", "1 día de entrega"], chargeType: "soul23", icon: "camera" },

  { id: "mxn-mantenimiento", name: "Mantenimiento Web Mensual", category: "Soporte", price: 2500, sourceCurrency: "MXN", billing: "monthly", description: "Actualizaciones, backups y monitoreo mensual.", features: ["Hasta 2 horas de cambios menores", "Backups automáticos", "Monitoreo 24/7"], chargeType: "soul23", icon: "wrench" },

  { id: "mxn-excel", name: "Capacitación Excel Avanzado", category: "Capacitación", price: 8000, sourceCurrency: "MXN", billing: "one-time", description: "Curso presencial o virtual de 6 horas.", features: ["Material digital incluido", "Máximo 10 participantes", "3 días de entrega"], chargeType: "soul23", icon: "graduation-cap" },
  { id: "mxn-python", name: "Capacitación Python Básico", category: "Capacitación", price: 12000, sourceCurrency: "MXN", billing: "one-time", description: "Curso introductorio de Python para principiantes.", features: ["Ejercicios prácticos", "Máximo 8 participantes", "5 días de entrega"], chargeType: "soul23", icon: "book-open" },

  { id: "mxn-cloud-mig", name: "Migración a Cloud", category: "Servicios Cloud", price: 20000, sourceCurrency: "MXN", billing: "one-time", description: "Migración de infraestructura a AWS/Azure/GCP.", features: ["Configuración básica", "Documentación incluida", "1 semana de entrega"], chargeType: "soul23", icon: "cloud-upload" },
  { id: "mxn-backup", name: "Backup Automatizado Cloud", category: "Servicios Cloud", price: 3000, sourceCurrency: "MXN", billing: "one-time", description: "Configuración de backups automáticos en la nube.", features: ["Primer mes de monitoreo", "Storage no incluido", "2 días de entrega"], chargeType: "soul23", icon: "cloud" },

  { id: "mxn-analytics", name: "Análisis de Datos Básico", category: "Análisis de Datos", price: 7000, sourceCurrency: "MXN", billing: "one-time", description: "Dashboard y análisis exploratorio de datos.", features: ["Hasta 3 fuentes de datos", "Power BI o Looker", "3 días de entrega"], chargeType: "soul23", icon: "bar-chart-3" },
  { id: "mxn-ml", name: "Machine Learning Básico", category: "Análisis de Datos", price: 35000, sourceCurrency: "MXN", billing: "one-time", description: "Modelo predictivo con datos proporcionados.", features: ["Documentación incluida", "Deployment básico", "3 semanas de entrega"], chargeType: "soul23", icon: "brain-circuit" },

  { id: "mxn-api-int", name: "Integración API Terceros", category: "Integración", price: 12000, sourceCurrency: "MXN", billing: "one-time", description: "Conexión con APIs externas (Stripe, Twilio, etc.).", features: ["Manejo de errores básico", "Logs configurados", "1 semana de entrega"], chargeType: "soul23", icon: "plug" },

  { id: "mxn-chatbot", name: "Chatbot WhatsApp Business", category: "Automatización", price: 18000, sourceCurrency: "MXN", billing: "one-time", description: "Bot automatizado para WhatsApp Business API.", features: ["No incluye costos Meta/Facebook", "Flujo básico", "2 semanas de entrega"], chargeType: "soul23", icon: "message-circle" },

  { id: "mxn-ecommerce", name: "E-commerce Shopify/WooCommerce", category: "Tecnología", price: 20000, sourceCurrency: "MXN", billing: "one-time", description: "Tienda en línea funcional con pasarela de pago.", features: ["Hasta 20 productos", "Stripe/MercadoPago", "2 semanas de entrega"], chargeType: "soul23", icon: "shopping-bag" },

  { id: "mxn-optimizacion", name: "Optimización de Velocidad Web", category: "Optimización", price: 6000, sourceCurrency: "MXN", billing: "one-time", description: "Mejora de Core Web Vitals y velocidad.", features: ["Objetivo: score 90+ PageSpeed", "No garantizado", "3 días de entrega"], chargeType: "soul23", icon: "zap" },

  { id: "mxn-db-design", name: "Base de Datos - Diseño", category: "Base de Datos", price: 10000, sourceCurrency: "MXN", billing: "one-time", description: "Modelado relacional y normalización.", features: ["Diagrama ER", "Scripts DDL", "1 semana de entrega"], chargeType: "soul23", icon: "database" },
  { id: "mxn-db-mig", name: "Base de Datos - Migración", category: "Base de Datos", price: 15000, sourceCurrency: "MXN", billing: "one-time", description: "Migración de datos entre plataformas.", features: ["Validación incluida", "Rollback plan", "2 semanas de entrega"], chargeType: "soul23", icon: "database-backup" },

  { id: "mxn-qa-manual", name: "Testing QA Manual", category: "QA", price: 8000, sourceCurrency: "MXN", billing: "one-time", description: "Pruebas funcionales de aplicación web/móvil.", features: ["Reporte de bugs", "Hasta 50 casos de prueba", "1 semana de entrega"], chargeType: "soul23", icon: "check-circle" },
  { id: "mxn-qa-auto", name: "Testing QA Automatizado", category: "QA", price: 25000, sourceCurrency: "MXN", billing: "one-time", description: "Suite de pruebas automatizadas (Selenium/Cypress).", features: ["Framework base", "Mantenimiento no incluido", "3 semanas de entrega"], chargeType: "soul23", icon: "flask-conical" },

  { id: "mxn-vps", name: "Servidor VPS Configuración", category: "Infraestructura", price: 5000, sourceCurrency: "MXN", billing: "one-time", description: "Configuración inicial de VPS (Ubuntu/CentOS).", features: ["Hardening básico", "Firewall y SSL", "1 día de entrega"], chargeType: "soul23", icon: "server" },

  { id: "mxn-server-local", name: "Configuración de Server Local", category: "Infraestructura", price: 8900, sourceCurrency: "MXN", billing: "one-time", description: "Setup completo de servidor local con servicios empresariales: impresión remota, monitoreo de sitio web, NAS (almacenamiento compartido), aplicaciones internas y utilidades críticas para el negocio.", features: ["Impresión remota configurada", "Monitoreo de sitio web 24/7", "NAS con backups automáticos", "Aplicaciones internas deployadas", "2 días de entrega"], chargeType: "soul23", icon: "hard-drive" },

  { id: "mxn-dominio", name: "Dominio + Certificado SSL", category: "Dominios", price: 1500, sourceCurrency: "MXN", billing: "one-time", description: "Registro de dominio .com + SSL LetsEncrypt.", features: ["Renovación anual por cuenta del cliente", "1 día de entrega"], chargeType: "soul23", icon: "globe" },
];

export const categories = ["Todos", ...Array.from(new Set(services.map((service) => service.category)))];

export const categoryIcons: Record<string, string> = {
  "Todos": "layout-grid",
  "Soporte": "headphones",
  "Planes mensuales": "calendar-clock",
  "Servicios especializados": "briefcase",
  "Proyectos": "folder-open",
  "Asistencia · Hardware": "watch",
  "Asistencia · Licencias": "key",
  "Asistencia · Bundles": "package",
  "Asistencia · Self-hosted": "server",
  "Dashboards": "pie-chart",
  "Dashboards · Variables": "sliders",
  "Dashboards · Add-ons": "plus-circle",
  "Tecnología": "code-2",
  "Consultoría": "message-square",
  "Diseño": "palette",
  "Marketing": "megaphone",
  "Multimedia": "video",
  "Capacitación": "graduation-cap",
  "Servicios Cloud": "cloud",
  "Análisis de Datos": "bar-chart-3",
  "Integración": "plug",
  "Automatización": "bot",
  "Optimización": "zap",
  "Base de Datos": "database",
  "QA": "check-circle",
  "Infraestructura": "server",
  "Dominios": "globe",
};

export const discountOptions = [
  { id: "none", label: "Sin descuento", rate: 0, stackable: false },
  { id: "onboarding", label: "Onboarding · Mes 1", rate: 0.3, stackable: false },
  { id: "early", label: "Early adopter", rate: 0.2, stackable: false },
  { id: "annual", label: "Pago anual", rate: 0.15, stackable: false },
  { id: "referral", label: "Referral", rate: 0.1, stackable: true },
] as const;
