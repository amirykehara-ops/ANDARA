# Avance del Sprint 8: Motor Multicanal de Webhooks (Meta) y Simulación CRM

Este documento resume las funcionalidades críticas, los desafíos de integración resueltos y las optimizaciones de código realizadas durante el Sprint 8, orientadas a dotar a **Andara** de un sistema automatizado de captura de *leads* en tiempo real desde **WhatsApp, Facebook Messenger e Instagram Direct**.

---

## 1. Arquitectura y Robustez del Webhook Unificado (`src/app/api/webhook/route.ts`)
Diseñamos e implementamos un endpoint robusto y de alto rendimiento capaz de procesar de forma unificada las peticiones entrantes desde los servidores de Meta, soportando entornos mixtos de producción, pruebas de API y simulación local.

* **Verificación de Seguridad en Dos Pasos (GET):**
    * Implementamos el handshake obligatorio requerido por la API Graph de Meta, validando el modo de suscripción y protegiendo el endpoint mediante la verificación segura de un token propietario (`MiTokenSecretoDeAndara123`).
* **Lectura Híbrida Ultra-Resistente (POST):**
    * **Problema:** Los entornos de ejecución modernos de Next.js a veces fallan o bloquean el hilo de ejecución al procesar payloads JSON vacíos, corruptos o mal formateados enviados por herramientas externas de escaneo o pings de Meta.
    * **Solución:** Desarrollamos un bloque interceptor asíncrono que lee la petición en formato de texto plano (`request.text()`). Si el cuerpo físico viene vacío, lo mitiga devolviendo un estado controlado `200 OK` antes de que el parseador de JSON arroje un error crítico de infraestructura.
* **Enrutamiento Condicional por Discriminación de Payloads:**
    * Meta cambia radicalmente la estructura del JSON dependiendo de si el mensaje proviene de WhatsApp (`whatsapp_business_account`), Instagram (`object: "instagram"`) o Facebook (`object: "page"`). 
    * El backend fue programado para mapear dinámicamente las propiedades internas (`changes`, `value.messages`, `entry.messaging`), extrayendo de forma homogénea tres variables clave: **Nombre**, **Identificador** (teléfono o ID de usuario) y el **Texto del mensaje**, independientemente de la complejidad del anidamiento de Meta.

---

## 2. Optimización del Flujo Kanban e Inyección Local (`src/components/KanbanBoard.tsx`)
Para agilizar el proceso de control de calidad y permitir la validación del sistema sin necesidad de desplegar en servidores de producción finales ni depender del panel de Meta Developers, rediseñamos la botonera del CRM.

* **Aislamiento de la Simulación Multicanal:**
    * **Problema:** Inicialmente, el botón de pruebas genérico del panel de Meta cruzaba las variables de validación, interpretando erróneamente los payloads planos de WhatsApp como tráfico de Facebook Messenger debido a coincidencias de campos en la raíz del JSON (`field: "messages"`).
    * **Solución:** Reestructuramos la lógica del cliente inyectando una propiedad de discriminación segura (`messaging_product: "facebook_mock"`). Esto eliminó las colisiones en las estructuras de control del backend.
* **Simulación Espejo de Peticiones HTTP:**
    * Al presionar los botones interactivos de la interfaz (**WhatsApp, Messenger o Instagram**), el cliente genera una carga útil idéntica en formato, variables y codificación a la que Meta despacha en producción.
    * Esta carga es enviada inmediatamente mediante una llamada interna de `fetch` hacia `/api/webhook`, permitiendo que el sistema simule la entrada de leads reales de manera local, persistiendo los datos en el estado Kanban e imprimiendo la confirmación en la consola del servidor.

---

## 3. Logs de Control y Trazabilidad del Servidor
Para facilitar la depuración visual en la terminal de desarrollo, dotamos al flujo del backend de un sistema de insignias (*badges*) personalizadas por colores. Cada vez que un lead golpea el webhook (ya sea vía simulación web o comandos remotos de red), el servidor imprime un reporte limpio y formateado:

```bash
========================================================
🟢 [WHATSAPP WEBHOOK] ¡LEAD PROCESADO EN VIVO!
👤 Nombre: Carlos
🆔 ID/Tel: +51953XXXXXX
💬 Mensaje: "Hola, estoy interesado en separar una cita para el Tour VIP."
========================================================