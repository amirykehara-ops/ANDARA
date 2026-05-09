# Avance del Sprint 2: Supabase y Rediseño Premium

Este documento resume los cambios y mejoras principales realizados en la carpeta `src/` durante el inicio del Sprint 2.

## 1. Conexión a Supabase (Backend as a Service)
Se ha establecido la infraestructura base para conectar la aplicación con Supabase utilizando la librería oficial `@supabase/ssr`.

*   **`src/utils/supabase/server.ts`**: Cliente configurado para realizar consultas a la base de datos desde los *Server Components* de Next.js.
*   **`src/utils/supabase/client.ts`**: Cliente ligero para usar en componentes interactivos del lado del navegador (*Client Components*).
*   **`src/utils/supabase/middleware.ts`**: Utilidad que maneja la persistencia y actualización de los tokens de sesión del usuario en las cookies.
*   **`src/middleware.ts`**: Middleware raíz de Next.js que intercepta las rutas y asegura que la sesión de Supabase se mantenga activa y validada en cada solicitud. *(Actualmente cuenta con un bypass temporal hasta que se configuren las variables de entorno reales en el archivo `.env.local`).*

## 2. Rediseño Premium y Animaciones (UI/UX)
Se realizó una reestructuración profunda de los estilos para soportar un Modo Oscuro nativo, vibrante y profesional, incorporando el concepto de *Glassmorphism* (cristal esmerilado) y animaciones con **Framer Motion**.

*   **`src/app/globals.css`**: 
    *   Se implementó un sistema de variables semánticas (`--background`, `--foreground`, `--primary`, etc.) para garantizar un contraste perfecto tanto en modo claro como oscuro.
    *   Se reemplazaron los fondos planos por gradientes radiales sutiles y se crearon las clases `.glass` y `.glass-panel` para los contenedores traslúcidos.
*   **`src/app/layout.tsx`**: Se actualizó el body para consumir las variables de fondo y color semánticas, mejorando la selección de texto.
*   **`src/app/page.tsx` (Dashboard Principal)**: Se añadieron contenedores de `framer-motion` para lograr un efecto visual de cascada (*stagger*) al cargar la página, donde las tarjetas y la tabla entran deslizándose suavemente desde abajo.

### Mejora de Componentes:
*   **`src/components/ui/card.tsx`**: Ahora es un componente animado que reacciona al pasar el mouse (`hover`) elevándose y proyectando una sombra dinámica, con fondo *glassmorphism*.
*   **`src/components/ui/button.tsx`**: Integración de efectos de escala (se agrandan al tocarlos/hacer clic) y botones con gradientes llamativos y bordes luminosos.
*   **`src/components/ui/table.tsx`**: Ajuste de los bordes y colores de texto (usando `text-muted-foreground`) para asegurar legibilidad en fondos oscuros.
*   **`src/components/layout/Sidebar.tsx`**: 
    *   Diseño translúcido que permite ver sutilmente el fondo animado.
    *   Indicador de pestaña activa animado con Framer Motion (píldora que se desliza entre opciones).
    *   Logo de Andara con texto en gradiente.
*   **`src/components/layout/Header.tsx`**: Barra superior de cristal con campo de búsqueda interactivo que brilla al ser enfocado.
*   **`src/components/dashboard/StatCard.tsx` & `RecentBookings.tsx`**: Corrección drástica de colores. Se eliminaron las referencias estáticas a colores oscuros (`text-slate-900`) reemplazándolas por clases semánticas que se adaptan al entorno.

## 3. Autenticación de Usuarios (Auth)
Se implementaron las pantallas visuales y la lógica de backend para el registro e inicio de sesión de guías.

*   **`src/app/login/page.tsx`**: Pantalla de inicio de sesión (*Login*). Utiliza un diseño de pantalla dividida (*Split Screen*), con el formulario de un lado y una imagen de alta calidad de Machu Picchu del otro lado para mantener la estética turística.
*   **`src/app/register/page.tsx`**: Pantalla de registro de nueva cuenta de guía. Similar al Login, pide datos básicos y está decorada con el desierto de Huacachina.
*   **`src/app/login/actions.ts`**: Lógica de *Server Actions* de Next.js para interactuar con la base de datos de Supabase de manera segura (funciones `login`, `signup`, y `logout`).
*   **`src/components/layout/Sidebar.tsx`**: Se integró el botón funcional de **"Cerrar Sesión"** en la parte inferior, conectado directamente a la acción de servidor.

## 4. Gestión del Perfil del Guía
Se desarrolló la interfaz para que cada guía administre su marca personal.

*   **`src/app/settings/page.tsx`**: Pantalla `/settings` con un formulario en un contenedor de cristal (*glass-panel*) que permite editar: Nombre, Biografía profesional, Ubicación y Enlace de WhatsApp.
*   **`src/app/settings/actions.ts`**: *Server Action* dedicada (`updateProfile`) que sincroniza de forma segura (usando *upsert*) los cambios del formulario con la tabla `profiles` de Supabase.
