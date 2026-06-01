"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Map,
  CalendarDays,
  Users,
  ArrowRight,
  Compass,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Globe,
  Shield,
  Zap,
  MessageCircle,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Layers,
  MousePointerClick,
  PieChart,
  Send,
} from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut" as const // <-- AGREGA "as const" AQUÍ
    }
  }
}

const stats = [
  { value: "3x", label: "más conversiones", icon: TrendingUp },
  { value: "80%", label: "menos tiempo en gestión", icon: Clock },
  { value: "100%", label: "de leads centralizados", icon: Users },
  { value: "24/7", label: "disponibilidad online", icon: Globe },
]

const features = [
  {
    icon: Users,
    color: "from-blue-500 to-cyan-400",
    bgGlow: "bg-blue-500/10",
    title: "CRM Multicanal Inteligente",
    subtitle: "Todas tus conversaciones en un solo lugar",
    description:
      "Centraliza automáticamente los leads que llegan desde WhatsApp, Instagram y Facebook Messenger. Visualiza todo tu pipeline de ventas en un tablero Kanban interactivo, arrastra prospectos entre etapas y nunca pierdas una oportunidad de venta.",
    bullets: [
      "Tablero Kanban con columnas personalizables",
      "Captura automática desde 3 canales de redes sociales",
      "Contacto directo con un clic desde la tarjeta del lead",
      "Historial completo de interacciones por cliente",
      "Filtros avanzados por fuente, estado y prioridad",
    ],
  },
  {
    icon: CalendarDays,
    color: "from-amber-500 to-orange-400",
    bgGlow: "bg-amber-500/10",
    title: "Calendario de Disponibilidad",
    subtitle: "Control total sobre tus cupos",
    description:
      "Gestiona la disponibilidad de cada tour día a día con un calendario visual e intuitivo. Abre y cierra cupos, configura capacidades máximas y evita el overbooking que daña tu reputación con los turistas.",
    bullets: [
      "Vista mensual con indicadores de disponibilidad",
      "Configuración de cupos máximos por tour y por día",
      "Bloqueo rápido de fechas con un clic",
      "Sincronización en tiempo real con reservas",
      "Alertas cuando un tour está por llenarse",
    ],
  },
  {
    icon: Map,
    color: "from-emerald-500 to-teal-400",
    bgGlow: "bg-emerald-500/10",
    title: "Gestor de Itinerarios y Tours",
    subtitle: "Tu catálogo profesional de experiencias",
    description:
      "Crea y administra tu catálogo completo de experiencias turísticas. Incluye descripciones detalladas, precios en dólares y soles, galería de imágenes y previsualización móvil en tiempo real para ver exactamente cómo lo verá tu cliente.",
    bullets: [
      "Editor completo con previsualización móvil en vivo",
      "Precios duales: USD y PEN actualizados",
      "Categorización por tipo de experiencia",
      "Galería de imágenes y descripción rica",
      "Itinerario detallado hora por hora",
    ],
  },
  {
    icon: BarChart3,
    color: "from-violet-500 to-purple-400",
    bgGlow: "bg-violet-500/10",
    title: "Dashboard Analítico",
    subtitle: "Métricas que impulsan decisiones",
    description:
      "Accede a un panel de control con gráficos interactivos que te muestran en tiempo real el rendimiento de tu negocio turístico: leads por canal, tours más populares, tasa de conversión y tendencias de reserva por periodo.",
    bullets: [
      "Gráficos de barras y de dona interactivos",
      "Métricas clave: conversión, ingresos y leads",
      "Análisis por canal: WhatsApp vs Instagram vs Facebook",
      "Tendencias semanales y mensuales",
      "Últimas reservas y actividad reciente",
    ],
  },
]

const howItWorks = [
  {
    step: "01",
    icon: MessageCircle,
    title: "Recibe leads automáticamente",
    description:
      "Tus clientes te escriben por WhatsApp, Instagram o Facebook. Andara captura cada mensaje y lo convierte en un lead estructurado dentro de tu CRM, sin que tengas que hacer nada.",
  },
  {
    step: "02",
    icon: MousePointerClick,
    title: "Gestiona con el tablero Kanban",
    description:
      "Arrastra cada lead por tu embudo de ventas: nuevo → contactado → cotizado → reservado. Contacta directamente desde la plataforma y mantén todo organizado.",
  },
  {
    step: "03",
    icon: CalendarDays,
    title: "Controla tu disponibilidad",
    description:
      "Configura qué días operas cada tour, cuántos cupos tienes y deja que el sistema se encargue de evitar sobreventa. Tu calendario siempre actualizado.",
  },
  {
    step: "04",
    icon: PieChart,
    title: "Analiza y mejora",
    description:
      "Revisa tus métricas en el dashboard: qué canal genera más reservas, qué tour es el más popular y cómo mejorar tu tasa de conversión mes a mes.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-primary/30 font-sans overflow-x-hidden">
      {/* Ambient lights */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 blur-[200px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/6 blur-[180px] rounded-full pointer-events-none" />

      {/* ─── HEADER ─── */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-2.5 rounded-xl border border-primary/20">
            <Compass className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">Andara</span>
            <span className="hidden sm:inline text-xs text-slate-500 ml-2 font-medium">Software Turístico</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Cómo funciona</a>
          <a href="#about" className="hover:text-white transition-colors">Sobre Andara</a>
        </nav>
        <Link href="/login">
          <button className="text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            Acceder
          </button>
        </Link>
      </header>

      <main className="relative z-10 w-full flex flex-col items-center">
        {/* ─── HERO ─── */}
        <section className="w-full max-w-6xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-1.5 text-xs font-medium text-slate-300 mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Plataforma integral para guías turísticos en Perú</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 max-w-5xl"
          >
            La herramienta{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              todo-en-uno
            </span>{" "}
            para tu negocio turístico
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl font-normal leading-relaxed mb-12"
          >
            Andara centraliza la gestión de leads multicanal, reservas, disponibilidad de tours y
            métricas de rendimiento en una sola plataforma diseñada específicamente para operadores
            turísticos y guías independientes del Perú.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/login">
              <button className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_50px_rgba(16,185,129,0.25)]">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center">
                  Comenzar ahora — es gratis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            <p className="mt-4 text-xs text-slate-500">Sin tarjeta de crédito · Configuración en 2 minutos</p>
          </motion.div>
        </section>

        {/* ─── STATS BAR ─── */}
        <section className="w-full max-w-5xl mx-auto px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-center backdrop-blur-sm hover:border-slate-700 transition-colors"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-3 opacity-60" />
                <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ─── FEATURES DETAILED ─── */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              Funcionalidades
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Todo lo que necesitas para operar
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Cuatro módulos integrados que cubren cada aspecto de tu operación turística,
              desde la captación del cliente hasta el análisis de resultados.
            </p>
          </motion.div>

          <div className="space-y-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                className={`group relative rounded-[2rem] bg-slate-900/80 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all duration-300 ${i % 2 === 0 ? "" : ""
                  }`}
              >
                {/* Glow */}
                <div className={`absolute top-0 ${i % 2 === 0 ? "right-0" : "left-0"} w-[350px] h-[350px] ${feature.bgGlow} blur-[100px] rounded-full pointer-events-none -translate-y-1/3`} />

                <div className="relative z-10 flex flex-col lg:flex-row items-start gap-8 p-8 md:p-12">
                  {/* Left: Text content */}
                  <div className="flex-1 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} bg-opacity-10 flex items-center justify-center mb-6`}
                      style={{ background: `linear-gradient(135deg, ${feature.color.includes("blue") ? "rgba(59,130,246,0.15)" : feature.color.includes("amber") ? "rgba(245,158,11,0.15)" : feature.color.includes("emerald") ? "rgba(16,185,129,0.15)" : "rgba(139,92,246,0.15)"}, transparent)` }}
                    >
                      <feature.icon className="w-7 h-7 text-white opacity-90" />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-primary font-medium text-sm mb-4">{feature.subtitle}</p>
                    <p className="text-slate-400 leading-relaxed text-base mb-6 max-w-xl">
                      {feature.description}
                    </p>
                  </div>

                  {/* Right: Bullets */}
                  <div className="lg:w-[380px] shrink-0">
                    <div className="bg-slate-950/50 rounded-2xl border border-slate-800/60 p-6">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        Características incluidas
                      </p>
                      <ul className="space-y-3">
                        {feature.bullets.map((bullet, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how-it-works" className="w-full border-t border-slate-800/60 bg-slate-950/40">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block text-xs font-semibold tracking-widest text-secondary uppercase mb-4">
                Proceso
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Cómo funciona Andara
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">
                De la primera consulta del turista a la reserva confirmada, en cuatro pasos simples.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="relative group"
                >
                  <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all h-full">
                    <span className="text-5xl font-black text-slate-800 group-hover:text-slate-700 transition-colors block mb-4 select-none">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Connector arrow (not on last) */}
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-20">
                      <ChevronRight className="w-6 h-6 text-slate-700" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── INTEGRATIONS / CHANNELS ─── */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-10 md:p-16 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">
                  Integraciones
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Tus canales de venta, unificados
                </h2>
                <p className="text-slate-400 leading-relaxed text-base mb-8 max-w-lg">
                  Andara conecta los tres canales de comunicación más importantes del turismo peruano.
                  Cada mensaje de un cliente potencial se convierte automáticamente en un lead rastreable
                  dentro de tu CRM, sin importar por dónde escriba.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
                    <Send className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-300">WhatsApp Business</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    <MessageCircle className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium text-pink-300">Instagram DM</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">Facebook Messenger</span>
                  </div>
                </div>
              </div>

              {/* Visual: channel flow diagram */}
              <div className="lg:w-[340px] shrink-0">
                <div className="bg-slate-950/70 rounded-2xl border border-slate-800 p-6 space-y-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Flujo de captura</div>
                  {[
                    { label: "Cliente escribe por WhatsApp", color: "border-green-500/30 text-green-400" },
                    { label: "Lead creado automáticamente", color: "border-primary/30 text-primary" },
                    { label: "Aparece en tu tablero Kanban", color: "border-blue-500/30 text-blue-400" },
                    { label: "Lo contactas con un clic", color: "border-amber-500/30 text-amber-400" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg border ${step.color} flex items-center justify-center text-xs font-bold shrink-0`}>
                        {i + 1}
                      </div>
                      <span className="text-sm text-slate-300">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── ABOUT / VALUE PROPOSITION ─── */}
        <section id="about" className="w-full border-t border-slate-800/60 bg-slate-950/30">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-16 items-center"
            >
              <div className="flex-1">
                <span className="inline-block text-xs font-semibold tracking-widest text-secondary uppercase mb-4">
                  Sobre nosotros
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Construido para el turismo peruano
                </h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Andara nació de una necesidad real: los guías turísticos y operadores en Perú
                  manejan sus reservas con libretas, hojas de Excel y mensajes de WhatsApp dispersos.
                  Pierden clientes, sufren overbooking y no tienen visibilidad de su rendimiento.
                </p>
                <p className="text-slate-400 leading-relaxed mb-8">
                  Nuestra plataforma resuelve esto con un software moderno, rápido y visual que
                  cualquier operador puede usar sin capacitación técnica. Desde el guía independiente
                  en Cusco hasta la agencia con 20 tours activos en Lima — Andara escala contigo.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                    <span className="text-sm font-medium text-slate-300">Datos seguros</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <Zap className="w-6 h-6 text-secondary mx-auto mb-2" />
                    <span className="text-sm font-medium text-slate-300">Ultra rápido</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <Layers className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                    <span className="text-sm font-medium text-slate-300">Todo integrado</span>
                  </div>
                </div>
              </div>

              {/* Visual: testimonial card */}
              <div className="lg:w-[380px] shrink-0">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                      &ldquo;Antes perdía mensajes de turistas en Instagram y WhatsApp. Con Andara todo
                      llega a un solo lugar, puedo ver quién me escribió, qué tour le interesa y
                      contactarlo de inmediato. Mi tasa de cierre mejoró notablemente.&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
                        CM
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Carlos M.</p>
                        <p className="text-xs text-slate-500">Guía turístico · Cusco</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="w-full">
          <div className="max-w-4xl mx-auto px-6 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                ¿Listo para profesionalizar tu operación?
              </h2>
              <p className="text-slate-400 mb-10 text-lg max-w-2xl mx-auto">
                Únete a la nueva generación de guías turísticos que gestionan su negocio
                con tecnología. Regístrate gratis y comienza a organizar tus leads, tours y reservas hoy.
              </p>
              <Link href="/register">
                <button className="bg-white text-slate-900 font-bold px-10 py-4 rounded-full hover:bg-slate-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:scale-105">
                  Crear cuenta gratis
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="w-full border-t border-slate-800 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Compass className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-white">Andara</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">
                Software de gestión integral para operadores turísticos y guías independientes en Perú.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <p className="font-semibold text-slate-300 mb-3">Plataforma</p>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#features" className="hover:text-slate-300 transition-colors">CRM Multicanal</a></li>
                  <li><a href="#features" className="hover:text-slate-300 transition-colors">Calendario</a></li>
                  <li><a href="#features" className="hover:text-slate-300 transition-colors">Gestor de Tours</a></li>
                  <li><a href="#features" className="hover:text-slate-300 transition-colors">Dashboard</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-3">Empresa</p>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#about" className="hover:text-slate-300 transition-colors">Sobre nosotros</a></li>
                  <li><a href="#how-it-works" className="hover:text-slate-300 transition-colors">Cómo funciona</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-600">
            © 2026 Andara. Todos los derechos reservados. Hecho con ❤ para el turismo peruano.
          </div>
        </div>
      </footer>
    </div>
  )
}
