# Avance del Proyecto Andara

Este documento registra el progreso actual del desarrollo de la plataforma web.

## Estado General
**Fase Actual:** Fase 1 (MVP)
**Sprint Actual:** Sprint 1 - Setup y Estructura Base
**Porcentaje de Completitud (Sprint 1):** 100%

---

## Logros Completados (Hasta la fecha)

### 1. Arquitectura de Datos (Supabase)
- [x] Diseño del modelo relacional.
- [x] Creación del archivo `schema.sql` con las tablas fundamentales:
  - `profiles`
  - `tours`
  - `availability`
  - `bookings`
  - `leads_crm`
- [x] Configuración de políticas de seguridad a nivel de fila (RLS) para proteger los datos de cada guía.

### 2. Setup del Proyecto Web
- [x] Inicialización del proyecto Next.js 14 usando App Router en el directorio `andara-web`.
- [x] Configuración de TypeScript con validación estricta.
- [x] Configuración de Tailwind CSS (v4) con la paleta de colores corporativa (Primario: `#1F7A63`, Secundario: `#F4A261`).

### 3. Sistema de Diseño (UI Kit)
- [x] Creación de utilidad `cn` para fusión de clases CSS.
- [x] Desarrollo de componentes base reutilizables (inspirados en Shadcn/UI):
  - `Button` (Múltiples variantes y tamaños)
  - `Card` (Estructura de tarjetas para contenido)
  - `Badge` (Etiquetas de estado: Éxito, Advertencia, Destructivo)
  - `Table` (Tablas de datos completas)

### 4. Componentes y Layouts
- [x] **Sidebar:** Menú de navegación lateral responsivo con enlaces a las secciones principales (Dashboard, Tours, Calendario, CRM).
- [x] **Header:** Barra superior con input de búsqueda global y notificaciones.
- [x] Integración de Sidebar y Header en el `RootLayout` (`app/layout.tsx`).

### 5. Dashboard Principal
- [x] Construcción de la vista del Dashboard Ejecutivo (`app/page.tsx`).
- [x] Componente `StatCard`: Tarjetas de KPI para visualizar "Ingresos Totales", "Reservas Confirmadas" y "Leads por Cerrar", incluyendo indicadores de tendencia.
- [x] Componente `RecentBookings`: Tabla de datos que muestra las últimas reservas con diseño de estados dinámicos (badges de confirmación/cancelación).
- [x] Verificación de compilación del proyecto (Cero errores de build).

---

## Próximos Pasos Inmediatos
- Iniciar el **Sprint 2**, comenzando por la conexión real del proyecto Next.js con un proyecto de Supabase para configurar la Autenticación (Login/Registro).
