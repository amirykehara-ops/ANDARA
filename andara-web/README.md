# Andara - Plataforma B2C para Guías Turísticos 🏔️

Andara es una moderna plataforma SaaS B2C diseñada exclusivamente para empoderar a guías turísticos en Perú. Soluciona los problemas críticos de gestión de disponibilidad, desorganización en el inventario de tours y pérdida de prospectos de ventas provenientes de redes sociales.

## 🌟 Características Principales

Este proyecto es un **Minimum Viable Product (MVP)** de Alta Fidelidad completamente funcional en el entorno cliente.

*   **🎨 Diseño Premium y Glassmorphism:** Interfaz de usuario de vanguardia utilizando Tailwind CSS v4, con soporte completo para Modo Claro / Modo Oscuro, tipografías modernas y variables semánticas.
*   **✨ Interacciones Animadas:** Transiciones fluidas, entradas escalonadas y física de resortes (*springs*) impulsadas por Framer Motion para una experiencia nativa.
*   **🔐 Autenticación Simulada:** Pantallas de Login y Registro con un diseño *Split-Screen* inmersivo.
*   **📦 Gestión de Inventario (Tours):**
    *   **CRUD Completo Funcional:** Creación, edición y eliminación de tours persistidos de forma segura en la memoria del navegador (`localStorage`).
    *   **Live Preview:** Un editor de tours profesional de pantalla dividida que simula en tiempo real cómo verá el turista la experiencia en su teléfono móvil.
*   **🗓️ Calendario Inteligente de Disponibilidad:**
    *   Motor personalizado de fechas (`date-fns`) con vistas mensuales y transiciones animadas.
    *   Panel lateral dinámico que simula datos diarios (reservas, apertura/cierre de fechas).
    *   Funcionalidad de bloqueo manual de fechas y ajuste de cupos diarios almacenados en la sesión (State).
*   **🤝 Leads CRM (Tablero de Ventas):**
    *   Tablero tipo Kanban visual para hacer seguimiento a clientes de WhatsApp e Instagram.
    *   Botones de acción rápida ("Botón Mágico") que formatean el número del cliente y abren WhatsApp Web automáticamente.

## 🛠️ Stack Tecnológico

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
*   **Iconografía:** [Lucide React](https://lucide.dev/)
*   **Utilidades de Fecha:** [date-fns](https://date-fns.org/)
*   **Arquitectura Futura (Backend):** Supabase (Autenticación y PostgreSQL) - *Estructura ya preparada en el código.*

## 🚀 Instrucciones para Ejecutar el Proyecto (Modo Local)

Sigue estos pasos para arrancar la demostración funcional en tu computadora:

1. **Abre una terminal** y navega a la carpeta del proyecto web:
   ```bash
   cd andara-web
   ```

2. **Instala las dependencias** (si es la primera vez que lo descargas):
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador web** y dirígete a:
   [http://localhost:3000](http://localhost:3000)

> **Nota para Evaluadores/Docentes:** Para facilitar la revisión del MVP, todas las lógicas de guardado (como crear un tour, ajustar cupos de disponibilidad o mover prospectos en el CRM) están enlazadas a la memoria del navegador (`localStorage` y React State). Esto significa que **puedes probar todas las funcionalidades y tu información no se perderá al recargar la página**, operando de manera aislada y perfecta para pruebas sin necesidad de configurar variables de entorno o bases de datos externas.

## 📂 Estructura del Proyecto de Interés

*   `/src/app`: Rutas principales de Next.js (Dashboard, CRM, Tours, Calendar, Settings, Auth).
*   `/src/components`: Componentes reutilizables de UI (Tarjetas, Formularios, Sidebar).
*   `/src/app/globals.css`: Sistema base de diseño y variables CSS (Modo Oscuro/Claro).
*   `/docs`: Documentación interna del equipo, registro de Sprints y Roadmap del producto.
