# Avance del Sprint 4: Calendario y Disponibilidad

Este documento resume las funcionalidades desarrolladas durante el Sprint 4, centrado en la gestión del tiempo y la capacidad (inventario) de los guías turísticos.

## 1. Infraestructura de Fechas
Se integró la librería `date-fns` para manejar toda la lógica de cálculo de días, semanas y meses, garantizando soporte multi-idioma (Español configurado por defecto) y previniendo errores de zonas horarias locales.

## 2. Sistema Visual del Calendario
El núcleo visual de esta etapa es la pantalla `/calendar`. Se ha construido desde cero, manteniendo la estética *Premium* de Andara.

*   **`src/app/calendar/page.tsx`**: Página principal que orquesta la vista. En pantallas de escritorio (`lg`), utiliza un diseño responsivo dividiendo la pantalla entre la cuadrícula del calendario (2/3) y el panel de detalles (1/3). En dispositivos móviles, el panel de detalles se convierte en un *Modal/Overlay* emergente que aparece desde la parte inferior de la pantalla.
*   **`src/components/calendar/CalendarGrid.tsx`**: Componente de cuadrícula mensual.
    *   Genera dinámicamente los días del mes actual.
    *   Incluye botones de navegación (Mes anterior / Siguiente) con animaciones de desplazamiento direccionales creadas con *Framer Motion* (`AnimatePresence`).
    *   Los días que contienen reservas o tours tienen indicadores visuales sutiles (puntos esmeralda y ámbar) en la esquina inferior izquierda.
    *   Los días seleccionados se resaltan con anillos primarios y un cambio de color de fondo que respeta el Modo Oscuro.

## 3. Gestión Diaria (Day Details Panel)
Para interactuar con fechas específicas, se creó un panel de control rápido.

*   **`src/components/calendar/DayDetailsPanel.tsx`**: Panel lateral o modal (dependiendo de la pantalla) que reacciona instantáneamente al seleccionar un día en la cuadrícula.
    *   **Indicadores de Estado:** Muestra claramente mediante `Badges` si el día está "Abierto" o "Agotado" (Cerrado).
    *   **Ocupación:** Un resumen rápido de los cupos reservados vs. el total de cupos del día.
    *   **Lista de Reservas:** Despliega tarjetas de resumen de las personas que reservaron ese día, mostrando nombre, tipo de tour y número de pasajeros (pax).
    *   **Botones de Acción Rápida:** Incluye botones para bloquear temporalmente la disponibilidad o ajustar los cupos, preparando el terreno para la conexión directa con la tabla `availability` de Supabase.

## 4. Diseño Responsivo y Experiencia de Usuario
Al igual que en las fases anteriores, se prestó especial atención a la experiencia móvil (Mobile-First approach en los modales) y al uso de desenfoques de fondo (*Backdrop Blur*) al abrir detalles, garantizando que el usuario no pierda el contexto espacial de dónde está navegando.
