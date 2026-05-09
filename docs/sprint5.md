# Avance del Sprint 5: Leads CRM

Este documento resume las funcionalidades desarrolladas durante el Sprint 5. Este módulo es el encargado de solucionar el principal dolor del guía turístico: perder clientes por falta de seguimiento en WhatsApp o Instagram.

## 1. Tablero Kanban Interactivo
Se implementó un sistema de gestión visual de prospectos basado en columnas de estado.

*   **`src/app/crm/page.tsx`**: La página base que aloja el CRM. Se diseñó para maximizar el espacio vertical (`h-[calc(100vh-8rem)]`), permitiendo que el tablero Kanban ocupe la pantalla completa sin generar scroll general en la página, sino únicamente dentro de cada columna.
*   **`src/components/crm/KanbanBoard.tsx`**: El motor del CRM. 
    *   Gestiona 4 columnas clave: **Nuevos, Contactados, Negociando, y Cerrados**.
    *   Utiliza un estado local (simulando la base de datos temporalmente) para mantener a los clientes.
    *   Muestra de forma destacada la cantidad de clientes en cada etapa para ayudar a la priorización.

## 2. Gestión Individual de Leads (Tarjetas)
Cada cliente potencial es una entidad valiosa, por lo que se diseñó una tarjeta específica.

*   **`src/components/crm/LeadCard.tsx`**: Tarjeta visual para representar a un prospecto.
    *   **Identificación Rápida**: Muestra iconos coloridos dependiendo de la fuente (Verde para WhatsApp, Rosa para Instagram).
    *   **Contexto**: Indica el tour por el cual está interesado el cliente para facilitar el argumento de venta.
    *   **Botón Mágico de Conversión (WhatsApp)**: Un botón destacado con el ícono de teléfono que formatea automáticamente el número del cliente y abre un chat directo en WhatsApp Web. Esta es la función más poderosa para el usuario final, pues acorta la fricción de contactar al turista.
    *   **Navegación entre Columnas**: Cuenta con flechas de acción rápida para avanzar (→) o retroceder (←) al cliente dentro del túnel de ventas del Kanban, acompañado de animaciones sutiles de *Framer Motion*.

## Estado de la Plataforma
Con la finalización de este Sprint, Andara Web Platform cuenta con su **Minimum Viable Product (MVP) completo a nivel Frontend**.
El ciclo completo (Dashboard -> Creación de Tours -> Calendario -> CRM) está operativo e integrado bajo el mismo lenguaje visual *Glassmorphism* y animaciones de alta fidelidad.
