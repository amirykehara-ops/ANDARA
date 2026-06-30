# Sprint 9: Corrección Exhaustiva de Duplicados en Canales de Meta (WhatsApp, Instagram y Messenger)

Este documento detalla la reingeniería y corrección de la capa de comunicación y sincronización en tiempo real aplicada durante el Sprint 9.

---

## 1. Diagnóstico y Causas Raíz

Mediante un script de diagnóstico exhaustivo (`scratch/diagnostico_meta.js`) que consultó directamente las tablas de Supabase y la Meta Graph API, se identificaron las siguientes causas raíz:

### A. `message_echoes` de Messenger (Causa Principal de Duplicados FB)
Facebook Messenger envía **dos webhooks distintos** por cada mensaje recibido:
1. El mensaje real del usuario (`entry[0].messaging[0].message`)
2. Un "echo" del mismo mensaje (`message.is_echo = true`) — confirmación de entrega para la página

El código no filtraba este segundo evento, procesándolo como un segundo lead/mensaje.

### B. Doble Escritura en Memoria y Base de Datos
El webhook POST guardaba registros en dos lugares: la lista global en memoria (`listaLeadsCompartida`) y en Supabase. Al procesar por UUID de Supabase, el registro en memoria (ID `mem_xxxxx`) persistía y volvía a procesarse en el próximo ciclo de polling.

### C. Token de Página Expirado / No Encontrado
El token de página (`page_access_token`) guardado en `paginas_vinculadas` tenía expiración de 1-2 horas (token de corto plazo del SDK de Facebook). Al expirar, `fetchSenderProfile` fallaba silenciosamente devolviendo `null`, y el sistema usaba el placeholder `"Usuario FB (ID)"` o `"Usuario IG (ID)"`.

### D. `localStorage` como Guard de Deduplicación (Inconsistente)
El `LayoutWrapper` usaba `localStorage('andara_processed_sigs')` para recordar mensajes procesados. Al borrar caché del navegador, abrir otra pestaña o reconectar sesión, todo el historial de mensajes se reprocesaba duplicando leads en el CRM.

### E. Read Receipts y Delivery Notifications sin Filtrar
Facebook envía webhooks adicionales para confirmaciones de lectura (`m.read`) y entrega (`m.delivery`) que se procesaban como mensajes entrantes válidos.

---

## 2. Soluciones Técnicas Implementadas

### A. Filtro de `is_echo`, `read` y `delivery` en Messenger
En `POST /api/webhook`, antes de procesar cualquier evento de `object === "page"`:
```typescript
// ⚠️ Ignorar message_echoes (mensajes enviados POR la página)
if (m.message?.is_echo === true) {
  return NextResponse.json({ received: true }, { status: 200 });
}
// Ignorar read receipts y delivery confirmations
if (m.read || m.delivery) {
  return NextResponse.json({ received: true }, { status: 200 });
}
// Solo procesar si hay texto
if (!m.message?.text) {
  return NextResponse.json({ received: true }, { status: 200 });
}
```

### B. Supabase como Única Fuente de Verdad
Se eliminó completamente la lista global en memoria (`listaLeadsCompartida`). Todo el flujo ahora pasa por Supabase:
- `POST`: Guarda en `mensajes_entrantes` con deduplicación de 30 segundos previa
- `GET`: Lee de `mensajes_entrantes` filtrando por `guide_email`
- `DELETE`: Borra de `mensajes_entrantes` después de procesar

### C. Extensión de Tokens a Largo Plazo
En `/api/facebook/connect`:
- Si existe la variable de entorno `META_CLIENT_SECRET`, el backend intercambia automáticamente el token de corto plazo por uno de largo plazo (60 días)
- Los tokens de página obtenidos con el user-token de largo plazo **nunca expiran**

### D. Eliminación del Guard de `localStorage`
El `LayoutWrapper.tsx` ya no usa `localStorage('andara_processed_sigs')`. La deduplicación está íntegramente en `processIncomingMessageDirect` en `crm.ts`, que consulta la tabla `mensajes` en Supabase para verificar duplicados en los últimos 30 segundos.

### E. Resolución de Nombre con Fallback Jerárquico
```
1. _mockName (si viene del simulador)
2. fetchSenderProfile → Meta Graph API (si hay pageAccessToken válido)
3. Nombre incluido en payload (WhatsApp: contact.profile.name)
4. Fallback de último recurso: "Usuario FB (ID)" o "Usuario IG (ID)"
```

### F. Fallback de Token para Páginas No Encontradas
Si el `targetPageId` del webhook no coincide exactamente con la tabla `paginas_vinculadas` (ej: variaciones en el ID), el sistema busca cualquier token disponible del mismo tipo de plataforma para el guía.

### G. Limpieza de Base de Datos
Se ejecutó `scratch/limpiar_duplicados.js` que eliminó:
- **53 leads duplicados** de un total de 71
- **12 leads con nombres de placeholder** (`Usuario IG`, `Usuario FB`)
- Todos los mensajes de la tabla `mensajes_entrantes` pendientes

---

## 3. Herramientas de Diagnóstico Creadas

- **`scratch/diagnostico_meta.js`**: Verifica validez de tokens, detecta duplicados en mensajes_entrantes y leads, y prueba resolución de perfiles desde Meta Graph API.
- **`scratch/limpiar_duplicados.js`**: Elimina leads duplicados y con nombres de placeholder de Supabase.

---

## 4. Estado Final y Requisitos

Para funcionamiento completo:
1. ✅ `META_CLIENT_SECRET` agregada como variable en Vercel
2. 🔄 **Reconectar cuenta de Facebook en `/settings`** (para generar token de larga duración)
3. ✅ Código desplegado con filtros de echo, read y delivery
4. ✅ Base de datos limpia de duplicados históricos
