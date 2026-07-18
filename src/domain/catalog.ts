export type Billing = "one-time" | "monthly" | "annual";

export type Service = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
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

const item = (id: string, name: string, category: string, subcategory: string | undefined, price: number, billing: Billing, description: string, features?: string[], recommended?: boolean, icon?: string): Service => ({ id, name, category, subcategory, price, billing, description, features, recommended, icon });

export const services: Service[] = [
  /* ──────────────── Soul:23 Core ──────────────── */
  { id: "support-remote", name: "Soporte remoto", category: "Soporte", subcategory: "Soporte Técnico", price: 950, sourceCurrency: "MXN", billing: "one-time", description: "Sesión de soporte remoto de 1 hora.", features: ["Atención remota", "Diagnóstico y resolución", "15% de descuento desde 4 horas"], chargeType: "soul23", volumeDiscount: { minQuantity: 4, rate: 0.15 }, icon: "headphones" },

  item("plan-starter", "Starter", "Web", "Planes Mensuales", 240.95, "monthly", "Presencia digital y automatización esencial.", ["Landing page inicial", "1–2 workflows", "1 red social", "Soporte y reporte mensual"], false, "zap"),
  item("plan-grow", "Grow", "Web", "Planes Mensuales", 486.95, "monthly", "Operación multicanal con IA y métricas.", ["2 redes sociales", "SEO + contenido", "Integración IA", "Dashboard", "Soporte prioritario"], true, "trending-up"),
  item("plan-scale", "Scale", "Web", "Planes Mensuales", 907.95, "monthly", "Ejecución avanzada con PMO, BI e IA.", ["PMO parcial", "Automatización avanzada", "Paid media", "BI en tiempo real", "Seguimiento semanal"], false, "bar-chart-3"),
  item("plan-enterprise", "Enterprise", "Web", "Planes Mensuales", 1717.95, "monthly", "Equipo dedicado con SLA y supervisión senior.", ["PMO dedicado", "1 perfil técnico", "Automatización integral", "Standup diario", "SLA garantizado"], false, "shield-check"),
  item("plan-marketing", "Marketing 360°", "Media & Marketing", "Planes", 711.95, "monthly", "Marketing integral en tres canales.", ["3 redes sociales", "SEO", "Meta + Google Ads", "Dashboard unificado"], false, "megaphone"),

  item("ret-social", "Redes sociales", "Media & Marketing", "Redes Sociales", 269.95, "monthly", "2 redes, copy, publicaciones y métricas.", undefined, false, "share-2"),
  item("ret-seo", "SEO técnico", "Media & Marketing", "SEO", 318.95, "monthly", "Posicionamiento, blog y link building.", undefined, false, "search"),
  item("ret-paid", "Paid media", "Media & Marketing", "Anuncios", 284.95, "monthly", "Gestión de Meta y Google Ads.", undefined, false, "target"),
  item("ret-staff", "Staffing", "Web", "Staffing", 1079.95, "monthly", "Dev, diseñador o copy supervisado.", undefined, false, "users"),

  item("project-diagnostic", "Diagnóstico / Consultoría", "Web", "Proyectos", 417.95, "one-time", "Mapeo de procesos y roadmap priorizado.", ["Sesión de 2–3 horas", "Documento PDF", "Seguimiento 30 días"], false, "clipboard-list"),
  item("project-landing", "Landing Page", "Web", "Proyectos", 436.95, "one-time", "Página de alta conversión conectada a tu funnel.", ["UI/UX custom", "Copy", "CRM", "SEO on-page", "Analytics", "10 días"], false, "layout"),
  item("project-auto-basic", "Automatización Básica", "Web", "Proyectos", 589.95, "one-time", "1–2 workflows con CRM y mensajería.", ["Email/WhatsApp", "14 días"], false, "bot"),
  item("project-site", "Sitio Corporativo", "Web", "Proyectos", 1079.95, "one-time", "Sitio administrable de hasta 8 secciones.", ["CMS", "SEO técnico", "Hosting y dominio 1 año", "21 días"], false, "globe"),
  item("project-audit", "Auditoría TI", "Web", "Proyectos", 686.95, "one-time", "Revisión técnica y de experiencia de usuario.", ["Código", "UI/UX", "Reporte ejecutivo", "7 días"], false, "scan-line"),
  item("project-auto-advanced", "Automatización Avanzada", "Web", "Proyectos", 1374.95, "one-time", "Automatización n8n multi-sistema con IA.", ["WhatsApp Business", "APIs", "Monitoreo", "3 meses soporte", "30 días"], false, "cpu"),
  item("project-commerce", "E-commerce", "Web", "Proyectos", 1865.95, "one-time", "Tienda con pagos, CFDI y WhatsApp.", ["Catálogo ilimitado", "Pasarelas MX", "45 días"], false, "shopping-cart"),
  item("project-bi", "Sistema BI + IA", "Web", "Proyectos", 2700.95, "one-time", "Inteligencia de negocio y agentes autónomos.", ["Scoring predictivo", "Reportes automáticos", "6 meses soporte", "60 días"], false, "brain-circuit"),

  item("hw-basic", "Reloj básico", "Soporte", "Asistencia", 202, "one-time", "Huella/PIN para hasta 50 empleados.", undefined, false, "watch"),
  item("hw-pro", "Reloj Pro", "Soporte", "Asistencia", 398, "one-time", "Facial + huella para hasta 200 empleados.", undefined, false, "watch"),
  item("hw-enterprise", "Reloj Enterprise", "Soporte", "Asistencia", 722, "one-time", "Facial + huella + NFC, empleados ilimitados.", undefined, false, "watch"),
  item("lic-month", "Licencia mensual", "Soporte", "Asistencia", 49.99, "monthly", "Software de control de asistencia.", undefined, false, "key"),
  item("lic-quarter", "Licencia trimestral", "Soporte", "Asistencia", 129.99, "one-time", "Tres meses de licencia, ahorro aproximado 13%.", undefined, false, "key"),
  item("lic-half", "Licencia semestral", "Soporte", "Asistencia", 219.99, "one-time", "Seis meses de licencia, ahorro aproximado 26%.", undefined, false, "key"),
  item("lic-year", "Licencia anual", "Soporte", "Asistencia", 349.99, "annual", "Doce meses de licencia, ahorro aproximado 41%.", undefined, true, "key"),
  item("bundle-starter", "Bundle Starter", "Soporte", "Asistencia", 497, "one-time", "Reloj básico + licencia anual.", undefined, false, "package"),
  item("bundle-pro", "Bundle Pro", "Soporte", "Asistencia", 674, "one-time", "Reloj Pro + licencia anual.", undefined, false, "package"),
  item("bundle-enterprise", "Bundle Enterprise", "Soporte", "Asistencia", 943, "one-time", "Reloj Enterprise + licencia anual.", undefined, false, "package"),
  item("self-hosted", "Asistencia self-hosted", "Soporte", "Asistencia", 260, "one-time", "Licencia perpetua; infraestructura estimada $400/año.", undefined, false, "server"),

  item("dashboard-base", "Dashboard base", "Web", "Dashboards", 462, "one-time", "Hasta 6 widgets, filtros y exportación.", ["UI/UX", "PDF/Excel", "1 revisión"], false, "pie-chart"),
  item("dash-data-medium", "Datos medianos", "Web", "Dashboards", 231, "one-time", "Ajuste por volumen de datos mediano.", undefined, false, "hard-drive"),
  item("dash-data-large", "Datos grandes", "Web", "Dashboards", 693, "one-time", "Ajuste por gran volumen de datos.", undefined, false, "hard-drive"),
  item("dash-api", "Conexión API estándar", "Web", "Dashboards", 144, "one-time", "Conectividad mediante API estándar.", undefined, false, "plug"),
  item("dash-db", "Conexión BD directa", "Web", "Dashboards", 202, "one-time", "Conexión directa a base de datos.", undefined, false, "database"),
  item("dash-erp", "Conexión custom / ERP", "Web", "Dashboards", 462, "one-time", "Integración personalizada o ERP.", undefined, false, "link"),
  item("dash-dedicated", "Cloud dedicado", "Web", "Dashboards", 115, "one-time", "Configuración dedicada; hosting $69/mes.", undefined, false, "cloud"),
  item("dash-self", "Servidor self-hosted", "Web", "Dashboards", 202, "one-time", "Configuración en servidor propio.", undefined, false, "server"),
  item("addon-widget", "Widget adicional", "Web", "Dashboards", 46, "one-time", "Widget adicional al alcance base.", undefined, false, "plus-circle"),
  item("addon-alerts", "Alertas automáticas", "Web", "Dashboards", 144, "one-time", "Alertas basadas en reglas.", undefined, false, "bell"),
  item("addon-roles", "Multiusuario con roles", "Web", "Dashboards", 173, "one-time", "Accesos y permisos por rol.", undefined, false, "lock"),
  item("addon-realtime", "Tiempo real", "Web", "Dashboards", 231, "one-time", "Actualización de datos en tiempo real.", undefined, false, "activity"),
  item("addon-whitelabel", "White-label", "Web", "Dashboards", 289, "one-time", "Personalización completa de marca.", undefined, false, "paintbrush"),

  /* ──────────────── Servicios MXN (Nuevos) ──────────────── */
  { id: "mxn-dev-fullstack", name: "Desarrollo Web Full Stack", category: "Web", subcategory: "Desarrollo", price: 25000, sourceCurrency: "MXN", billing: "one-time", description: "Desarrollo de aplicación web completa con frontend y backend.", features: ["Hasta 3 revisiones", "No incluye hosting", "2 semanas de entrega"], chargeType: "soul23", icon: "code-2" },
  { id: "mxn-landing", name: "Landing Page Profesional", category: "Web", subcategory: "Desarrollo", price: 6500, sourceCurrency: "MXN", billing: "one-time", description: "Página de aterrizaje optimizada para conversión.", features: ["Diseño responsive", "Formulario de contacto", "5 días de entrega"], chargeType: "soul23", icon: "layout-template" },
  { id: "mxn-app-mobile", name: "App Móvil iOS/Android", category: "Web", subcategory: "Desarrollo", price: 45000, sourceCurrency: "MXN", billing: "one-time", description: "Aplicación móvil nativa o híbrida.", features: ["Publicación en stores", "Mantenimiento primer mes gratis", "6 semanas de entrega"], chargeType: "soul23", icon: "smartphone" },

  { id: "mxn-consultoria", name: "Consultoría IT", category: "Soporte", subcategory: "Consultoría", price: 2000, sourceCurrency: "MXN", billing: "one-time", description: "Asesoría técnica especializada en infraestructura.", features: ["Mínimo 2 horas", "Reporte escrito incluido", "1 hora por sesión"], chargeType: "soul23", icon: "message-square" },
  { id: "mxn-audit-seg", name: "Auditoría de Seguridad", category: "Soporte", subcategory: "Consultoría", price: 11000, sourceCurrency: "MXN", billing: "one-time", description: "Revisión completa de vulnerabilidades.", features: ["Reporte ejecutivo", "Plan de remediación", "1 semana de entrega"], chargeType: "soul23", icon: "shield-check" },

  { id: "mxn-branding", name: "Branding Corporativo", category: "Web", subcategory: "Diseño", price: 12500, sourceCurrency: "MXN", billing: "one-time", description: "Creación de identidad visual completa.", features: ["Logo, paleta y tipografía", "Manual básico incluido", "10 días de entrega"], chargeType: "soul23", icon: "palette" },
  { id: "mxn-uxui", name: "Diseño UX/UI App", category: "Web", subcategory: "Diseño", price: 22000, sourceCurrency: "MXN", billing: "one-time", description: "Diseño de interfaz y experiencia de usuario.", features: ["Prototipo interactivo", "Entrega en Figma", "2 semanas de entrega"], chargeType: "soul23", icon: "pen-tool" },

  { id: "mxn-social", name: "Redes Sociales - Gestión Mensual", category: "Media & Marketing", subcategory: "Redes Sociales", price: 5500, sourceCurrency: "MXN", billing: "monthly", description: "Administración de 3 redes sociales.", features: ["12 posts mensuales", "Reporte mensual", "Respuesta a comentarios"], chargeType: "soul23", icon: "share-2" },
  { id: "mxn-seo", name: "SEO Técnico On-Page", category: "Media & Marketing", subcategory: "SEO", price: 6000, sourceCurrency: "MXN", billing: "one-time", description: "Optimización técnica para motores de búsqueda.", features: ["Análisis de keywords", "10 páginas optimizadas", "1 semana de entrega"], chargeType: "soul23", icon: "search" },
  { id: "mxn-newsletter", name: "Newsletter Mensual Diseñada", category: "Media & Marketing", subcategory: "Email Marketing", price: 2500, sourceCurrency: "MXN", billing: "one-time", description: "Diseño y maquetación de newsletter.", features: ["Diseño responsive", "2 revisiones", "1 semana de entrega"], chargeType: "soul23", icon: "mail" },

  { id: "mxn-video", name: "Video Corporativo 2min", category: "Media & Marketing", subcategory: "Video", price: 2500, sourceCurrency: "MXN", billing: "one-time", description: "Video institucional con edición profesional.", features: ["Locución incluida", "Música de stock", "2 revisiones", "5 días de entrega"], chargeType: "soul23", icon: "video" },
  { id: "mxn-grabacion-pro", name: "Grabación Profesional · Audio, Video e Iluminación", category: "Media & Marketing", subcategory: "Video", price: 4500, sourceCurrency: "MXN", billing: "one-time", description: "Producción profesional con audio, video e iluminación. Entregable en alta resolución para redes sociales. La carga o publicación se cotiza por separado.", features: ["Audio profesional", "Video alta resolución", "Iluminación incluida", "Formato optimizado para redes", "Publicación no incluida"], chargeType: "soul23", icon: "clapperboard" },
  { id: "mxn-foto", name: "Fotografía de Producto", category: "Media & Marketing", subcategory: "Fotografía", price: 4000, sourceCurrency: "MXN", billing: "one-time", description: "Sesión fotográfica profesional de productos.", features: ["20 fotos retocadas", "Estudio incluido", "1 día de entrega"], chargeType: "soul23", icon: "camera" },

  { id: "mxn-mantenimiento", name: "Mantenimiento Web Mensual", category: "Soporte", subcategory: "Mantenimiento", price: 2500, sourceCurrency: "MXN", billing: "monthly", description: "Actualizaciones, backups y monitoreo mensual.", features: ["Hasta 2 horas de cambios menores", "Backups automáticos", "Monitoreo 24/7"], chargeType: "soul23", icon: "wrench" },

  { id: "mxn-excel", name: "Capacitación Excel Avanzado", category: "Soporte", subcategory: "Capacitación", price: 8000, sourceCurrency: "MXN", billing: "one-time", description: "Curso presencial o virtual de 6 horas.", features: ["Material digital incluido", "Máximo 10 participantes", "3 días de entrega"], chargeType: "soul23", icon: "graduation-cap" },
  { id: "mxn-python", name: "Capacitación Python Básico", category: "Soporte", subcategory: "Capacitación", price: 12000, sourceCurrency: "MXN", billing: "one-time", description: "Curso introductorio de Python para principiantes.", features: ["Ejercicios prácticos", "Máximo 8 participantes", "5 días de entrega"], chargeType: "soul23", icon: "book-open" },

  { id: "mxn-cloud-mig", name: "Migración a Cloud", category: "Soporte", subcategory: "Cloud", price: 20000, sourceCurrency: "MXN", billing: "one-time", description: "Migración de infraestructura a AWS/Azure/GCP.", features: ["Configuración básica", "Documentación incluida", "1 semana de entrega"], chargeType: "soul23", icon: "cloud-upload" },
  { id: "mxn-backup", name: "Backup Automatizado Cloud", category: "Soporte", subcategory: "Cloud", price: 3000, sourceCurrency: "MXN", billing: "one-time", description: "Configuración de backups automáticos en la nube.", features: ["Primer mes de monitoreo", "Storage no incluido", "2 días de entrega"], chargeType: "soul23", icon: "cloud" },

  { id: "mxn-analytics", name: "Análisis de Datos Básico", category: "Soporte", subcategory: "Datos", price: 7000, sourceCurrency: "MXN", billing: "one-time", description: "Dashboard y análisis exploratorio de datos.", features: ["Hasta 3 fuentes de datos", "Power BI o Looker", "3 días de entrega"], chargeType: "soul23", icon: "bar-chart-3" },
  { id: "mxn-ml", name: "Machine Learning Básico", category: "Soporte", subcategory: "Datos", price: 35000, sourceCurrency: "MXN", billing: "one-time", description: "Modelo predictivo con datos proporcionados.", features: ["Documentación incluida", "Deployment básico", "3 semanas de entrega"], chargeType: "soul23", icon: "brain-circuit" },

  { id: "mxn-api-int", name: "Integración API Terceros", category: "Web", subcategory: "Desarrollo", price: 12000, sourceCurrency: "MXN", billing: "one-time", description: "Conexión con APIs externas (Stripe, Twilio, etc.).", features: ["Manejo de errores básico", "Logs configurados", "1 semana de entrega"], chargeType: "soul23", icon: "plug" },

  { id: "mxn-chatbot", name: "Chatbot WhatsApp Business", category: "Web", subcategory: "Desarrollo", price: 18000, sourceCurrency: "MXN", billing: "one-time", description: "Bot automatizado para WhatsApp Business API.", features: ["No incluye costos Meta/Facebook", "Flujo básico", "2 semanas de entrega"], chargeType: "soul23", icon: "message-circle" },

  { id: "mxn-ecommerce", name: "E-commerce Shopify/WooCommerce", category: "Web", subcategory: "Desarrollo", price: 20000, sourceCurrency: "MXN", billing: "one-time", description: "Tienda en línea funcional con pasarela de pago.", features: ["Hasta 20 productos", "Stripe/MercadoPago", "2 semanas de entrega"], chargeType: "soul23", icon: "shopping-bag" },

  { id: "mxn-video-short", name: "Video Corto Individual", category: "Media & Marketing", subcategory: "Video", price: 1400, sourceCurrency: "MXN", billing: "one-time", description: "Video corto profesional de 30–60 segundos para redes sociales o web.", features: ["Edición profesional", "Música de stock", "1 revisión", "3 días de entrega"], chargeType: "soul23", icon: "video" },
  { id: "mxn-pack-video", name: "Pack Video Creation · 4 videos", category: "Media & Marketing", subcategory: "Video", price: 4590, sourceCurrency: "MXN", billing: "one-time", description: "Pack de 4 videos: $5,400 MXN a precio unitario, menos 15% de descuento. Total del pack: $4,590 MXN.", features: ["4 videos profesionales", "$1,350 MXN por video", "15% OFF incluido", "Locución y música incluidas", "2 revisiones por video"], chargeType: "soul23", icon: "film" },
  { id: "mxn-optimizacion", name: "Optimización de Velocidad Web", category: "Web", subcategory: "Desarrollo", price: 6000, sourceCurrency: "MXN", billing: "one-time", description: "Mejora de Core Web Vitals y velocidad.", features: ["Objetivo: score 90+ PageSpeed", "No garantizado", "3 días de entrega"], chargeType: "soul23", icon: "zap" },

  { id: "mxn-db-design", name: "Base de Datos - Diseño", category: "Web", subcategory: "Desarrollo", price: 10000, sourceCurrency: "MXN", billing: "one-time", description: "Modelado relacional y normalización.", features: ["Diagrama ER", "Scripts DDL", "1 semana de entrega"], chargeType: "soul23", icon: "database" },
  { id: "mxn-db-mig", name: "Base de Datos - Migración", category: "Web", subcategory: "Desarrollo", price: 15000, sourceCurrency: "MXN", billing: "one-time", description: "Migración de datos entre plataformas.", features: ["Validación incluida", "Rollback plan", "2 semanas de entrega"], chargeType: "soul23", icon: "database-backup" },

  { id: "mxn-qa-manual", name: "Testing QA Manual", category: "Web", subcategory: "Desarrollo", price: 8000, sourceCurrency: "MXN", billing: "one-time", description: "Pruebas funcionales de aplicación web/móvil.", features: ["Reporte de bugs", "Hasta 50 casos de prueba", "1 semana de entrega"], chargeType: "soul23", icon: "check-circle" },
  { id: "mxn-qa-auto", name: "Testing QA Automatizado", category: "Web", subcategory: "Desarrollo", price: 25000, sourceCurrency: "MXN", billing: "one-time", description: "Suite de pruebas automatizadas (Selenium/Cypress).", features: ["Framework base", "Mantenimiento no incluido", "3 semanas de entrega"], chargeType: "soul23", icon: "flask-conical" },

  { id: "mxn-vps", name: "Servidor VPS Configuración", category: "Soporte", subcategory: "Infraestructura", price: 5000, sourceCurrency: "MXN", billing: "one-time", description: "Configuración inicial de VPS (Ubuntu/CentOS).", features: ["Hardening básico", "Firewall y SSL", "1 día de entrega"], chargeType: "soul23", icon: "server" },

  { id: "mxn-server-local", name: "Configuración de Server Local", category: "Soporte", subcategory: "Infraestructura", price: 8900, sourceCurrency: "MXN", billing: "one-time", description: "Setup completo de servidor local con servicios empresariales: impresión remota, monitoreo de sitio web, NAS (almacenamiento compartido), aplicaciones internas y utilidades críticas para el negocio.", features: ["Impresión remota configurada", "Monitoreo de sitio web 24/7", "NAS con backups automáticos", "Aplicaciones internas deployadas", "2 días de entrega"], chargeType: "soul23", icon: "hard-drive" },

  { id: "mxn-dominio", name: "Dominio + Certificado SSL", category: "Web", subcategory: "Desarrollo", price: 1500, sourceCurrency: "MXN", billing: "one-time", description: "Registro de dominio .com + SSL LetsEncrypt.", features: ["Renovación anual por cuenta del cliente", "1 día de entrega"], chargeType: "soul23", icon: "globe" },
];

export const categories = ["Todos", "Web", "Soporte", "Media & Marketing"];

export const categoryIcons: Record<string, string> = {
  "Todos": "layout-grid",
  "Web": "globe",
  "Soporte": "headphones",
  "Media & Marketing": "megaphone",
};

export const discountOptions = [
  { id: "none", label: "Sin descuento", rate: 0, stackable: false },
  { id: "onboarding", label: "Onboarding · Mes 1", rate: 0.3, stackable: false },
  { id: "early", label: "Early adopter", rate: 0.2, stackable: false },
  { id: "annual", label: "Pago anual", rate: 0.15, stackable: false },
  { id: "recurring", label: "Cliente recurrente", rate: 0.1, stackable: false },
  { id: "referral", label: "Referral", rate: 0.1, stackable: true },
] as const;
