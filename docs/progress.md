# Avance del Proyecto Andara

Este documento registra el progreso actual del desarrollo de la plataforma web.

---

## 📊 Estado General
*   **Fase Actual:** Fase 1 (MVP) e inicio de Inteligencia Artificial (AADD)
*   **Sprint Actual:** Sprint 7 - Landing Page y Reestructuración de Rutas
*   **Porcentaje de Completitud:** 100% (Sprint 7 finalizado ✅)

---

## 🏆 Logros Completados (Hasta la fecha)

### 1. Arquitectura de Datos (Supabase Core)
*   [x] Diseño del modelo relacional.
*   [x] Creación del archivo `schema.sql` con las tablas fundamentales (`profiles`, `tours`, `availability`, `bookings`, `leads_crm`).
*   [x] Configuración de políticas de seguridad a nivel de fila (RLS) para proteger los datos de cada guía.
*   [x] Stubs mockeados chainables de Supabase en `src/utils/supabase/server.ts` para posibilitar ejecuciones rápidas sin credenciales.

### 2. Setup del Proyecto Web & UI Kit Premium
*   [x] Inicialización del proyecto Next.js 14 usando App Router en el directorio `andara-web`.
*   [x] Configuración de TypeScript con validación estricta y compilación 100% limpia.
*   [x] Rediseño Premium con **Glassmorphism** y variables de Modo Claro/Oscuro en `globals.css`.
*   [x] Desarrollo de componentes base reutilizables:
    *   `Button` (múltiples variantes y tamaños)
    *   `Card` (elevación dinámica en hover y fondo cristal)
    *   `Badge` (etiquetas de estado adaptativas)
    *   `Table` (tablas adaptadas a interfaces oscuras)

### 3. Autenticación y Configuración de Perfil (Sprint 2 y 6)
*   [x] Pantallas inmersivas de Login y Registro en pantalla dividida (*Split Screen*).
*   [x] Sistema de autenticación local simulado en memoria (`USERS_DB`) y persistido en cookies seguras (`andara_session`).
*   [x] Middleware que asegura que la sesión simulada se mantenga validada en cada ruta.
*   [x] Edición de Perfil del Guía (/settings) con Server Action (`updateProfile`) compatible con tipos React.

### 4. Landing Page Pública (Sprint 7)
*   [x] Creación del `LayoutWrapper` de Next.js para ocultar dinámicamente las barras laterales y superiores de administración en rutas públicas (`/`, `/login`, `/register`).
*   [x] Reubicación del Dashboard Ejecutivo privado a `/dashboard` y reestructuración del Sidebar.
*   [x] Diseño e implementación de la página de inicio pública (`/`) con orbes de iluminación en gradiente de fondo.
*   [x] Sección Hero interactiva y expositor de características de tours, calendario y CRM con micro-animaciones Framer Motion.
*   [x] Redirección nativa y directa hacia el inicio de sesión y registro de usuarios.

### 5. Gestión de Tours con Live Preview (Sprint 3 y 6)
*   [x] Vista de cuadrícula ("Mis Tours") animada en cascada con barra de búsqueda funcional.
*   [x] CRUD completo de Tours en memoria local (`localStorage`), permitiendo crear, editar y borrar tours.
*   [x] Editor interactivo en pantalla dividida:
    *   **Formulario:** Captura de datos (título, precio, moneda, capacidad, duración, descripción e imagen) con validación estricta y visualización de errores en rojo.
    *   **Live Preview:** Smartphone simulado en tiempo real con notch interactivo, barra de reservas móvil y protección ante enlaces de imagen rotos (`onError`).

### 6. Calendario de Disponibilidad (Sprint 4)
*   [x] Vista mensual interactiva de calendario (`/calendar`) con navegación dinámica impulsada por Framer Motion.
*   [x] Panel de detalles diario responsivo (`DayDetailsPanel.tsx`).
*   [x] Gestión de cupos diarios y bloqueo manual de días en tiempo real.

### 7. Leads CRM (Sprint 5)
*   [x] Tablero Kanban responsivo completo (`crm/page.tsx`) optimizado para pantallas completas.
*   [x] Clasificación visual de clientes en 4 columnas de estado (Nuevos, Contactados, Negociando, Cerrados).
*   [x] **Botón Mágico de Conversión:** Automatiza y abre de inmediato chats directos de WhatsApp formateando el número telefónico del lead.

---

## 🛠️ Metodología de Desarrollo
*   **Sprint 1 al 5:** Desarrollo Frontend Core y estructuración visual del MVP.
*   **Sprint 6 & 7:** Consolidación mediante la metodología de **Desarrollo Guiado por Multi-Agentes (Multi-Agent Driven Development)**, estructurando roles virtuales de IA (`FrontendAgent`, `BackendAgent`, `QAAgent`, `DocsAgent`) para asegurar entregas robustas, libre de TypeScript errors y documentación alineada en la carpeta `/docs`.
