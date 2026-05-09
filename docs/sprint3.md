# Avance del Sprint 3: Gestión de Inventario y Editor de Tours

Este documento resume las funcionalidades construidas y los archivos añadidos durante el Sprint 3, enfocados en el núcleo principal del negocio: la creación y administración de tours.

## 1. Componentes Base de Formulario (UI)
Se ampliaron los componentes base de la plataforma para permitir la captura de datos con un diseño consistente y acorde al estilo *Premium* (con *Glassmorphism*).

*   **`src/components/ui/input.tsx`**: Campo de texto estándar con bordes y fondos adaptativos.
*   **`src/components/ui/textarea.tsx`**: Área de texto redimensionable para descripciones largas.
*   **`src/components/ui/label.tsx`**: Etiquetas tipográficas para los campos de los formularios.

## 2. Listado de Tours ("Mis Tours")
Se creó la vista principal donde el guía puede visualizar su inventario actual.

*   **`src/app/tours/page.tsx`**: Página que muestra un *grid* (cuadrícula) con todos los tours. Incluye una barra de búsqueda y un botón principal para iniciar la creación de un nuevo tour. Todo renderizado con una animación de entrada escalonada gracias a Framer Motion.
*   **`src/components/tours/TourCard.tsx`**: Tarjeta visual reutilizable que muestra el resumen del tour:
    *   Imagen de portada con efecto de zoom sutil al pasar el cursor (`hover`).
    *   Estado dinámico (Activo/Borrador) mediante Badges superpuestos.
    *   Información clave: Título, Precio, Duración y Capacidad Máxima.
    *   Botón de acceso rápido para "Editar Tour".

## 3. Editor Profesional con Live Preview
Esta es la característica estrella del Sprint (*Core Feature*), lograda a través de una arquitectura de "Pantalla Dividida" (*Split Pane*).

*   **`src/app/tours/editor/page.tsx`**: La vista maestra del editor. Coordina el estado compartido (`tourData`) entre el formulario izquierdo y la vista previa derecha, garantizando que ambos estén sincronizados en tiempo real sin recargar la página.
*   **`src/components/tours/TourForm.tsx` (Lado Izquierdo)**: Un formulario dinámico encapsulado en un contenedor de cristal (`glass-panel`). Permite al guía introducir detalles detallados:
    *   Título, Descripción, Duración, Capacidad.
    *   Precio y selección de Moneda (USD/PEN).
    *   Enlace temporal de imagen para la portada.
*   **`src/components/tours/LivePreview.tsx` (Lado Derecho)**: Un simulador de dispositivo móvil interactivo. Renderiza los datos capturados en el `TourForm` de manera idéntica a cómo los visualizará el turista o cliente final. Incluye:
    *   Mockup tipo *Smartphone* con "notch" simulado en la parte superior.
    *   Tipografía y jerarquía visual optimizadas para conversión.
    *   Una "Barra Flotante de Reservas" (*Sticky Booking Bar*) en la parte inferior, mostrando el precio actualizado en vivo y un botón de llamada a la acción (CTA) persistente.
