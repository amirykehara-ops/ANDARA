# Roadmap del Proyecto Andara

Este documento detalla el plan de desarrollo de la Plataforma Web Andara (SaaS B2B para Guías Turísticos) desde su inicio hasta el final, dividido en Fases y Sprints.

## Fase 1: MVP (Minimum Viable Product) y Funcionalidades Core
**Objetivo:** Construir la base de la plataforma, permitiendo a los guías gestionar su perfil, crear tours y visualizar sus reservas.

*   **Sprint 1: Setup y Estructura Base (1-2 Semanas)**
    *   Diseño del esquema de base de datos en Supabase.
    *   Configuración del proyecto Next.js 14 (App Router).
    *   Configuración de Tailwind CSS y creación de UI kit base.
    *   Desarrollo de layouts (Sidebar, Header).
    *   Desarrollo del Dashboard Principal UI (KPIs y tabla de reservas).
*   **Sprint 2: Autenticación y Perfil (1-2 Semanas)**
    *   Integración de Supabase Auth (Login/Register con Email y Google).
    *   Gestión de sesiones.
    *   Creación de interfaz para edición del Perfil del Guía (Marca personal, Bio, Contacto).
*   **Sprint 3: Gestión de Inventario (Tours) (2 Semanas)**
    *   CRUD de Tours en base de datos.
    *   Editor de Tours Profesional con *Live Preview*.
    *   Subida y gestión de imágenes para tours (Storage).
*   **Sprint 4: Calendario y Disponibilidad (2 Semanas)**
    *   Creación de la vista de Calendario Mensual/Semanal.
    *   Gestión de disponibilidad (abrir/cerrar cupos por fecha).
    *   Visualización de reservas dentro del calendario.

## Fase 2: CRM Inteligente y Gestión de Ventas
**Objetivo:** Centralizar la gestión de clientes (leads) y automatizar el embudo de conversión para los guías.

*   **Sprint 5: Motor de Reservas B2B/B2C (2 Semanas)**
    *   Formulario de captura de reservas (manuales por parte del guía).
    *   Visualización detallada de la reserva y cambio de estados (Pendiente, Confirmado, Cancelado).
    *   Envío de correos transaccionales básicos (Reserva confirmada).
*   **Sprint 6: Módulo CRM y Leads (2 Semanas)**
    *   Desarrollo de la interfaz de chat/CRM tipo kanban o listado de leads.
    *   Integración para clasificar leads manualmente (Caliente, Tibio, Frío).
    *   Registro de origen del lead (WhatsApp, Instagram, Web).
*   **Sprint 7: Clasificación IA para CRM (1-2 Semanas)**
    *   Integración con API de OpenAI (o similar).
    *   Clasificación automática del `intent_score` (Intención de compra) basada en el último mensaje del lead.

## Fase 3: Analítica Avanzada y Optimización
**Objetivo:** Brindar información de valor al guía para mejorar su negocio y pulir la experiencia de usuario.

*   **Sprint 8: Analítica y Gráficos (1 Semana)**
    *   Integración de librería de gráficos (ej. Recharts).
    *   Gráficos de ventas mensuales y tasas de conversión en el Dashboard.
    *   Reportes exportables a CSV/PDF.
*   **Sprint 9: Pulido de UX/UI y Responsividad (1 Semana)**
    *   Micro-interacciones y animaciones (Framer Motion).
    *   Auditoría de accesibilidad y SEO técnico.
    *   Testing exhaustivo en dispositivos móviles.
*   **Sprint 10: Testing, QA y Lanzamiento (1 Semana)**
    *   Pruebas E2E (Cypress o Playwright).
    *   Despliegue a producción (Vercel).
    *   Configuración de dominio personalizado y SSL.
