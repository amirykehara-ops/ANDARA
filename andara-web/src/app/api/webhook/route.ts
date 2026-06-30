import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

const TOKEN_PRODUCCION_META = "AndaraMeta2026"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dhmrtidehbmnyabwveds.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---------------------------------------------------------------------------
// Busca el perfil real del remitente en la Meta Graph API.
// - Facebook Messenger (PSID): devuelve first_name + last_name
// - Instagram (IGSID): devuelve @username o name
// ---------------------------------------------------------------------------
async function fetchSenderProfile(
  senderId: string,
  pageAccessToken: string,
  platform: 'facebook' | 'instagram'
): Promise<{ name: string } | null> {
  try {
    if (!senderId || !pageAccessToken) return null;
    // Ignorar IDs de sandbox/prueba
    if (/mock|test|tester|sample/i.test(senderId)) return null;

    // Para Facebook: el PSID puede consultarse con el page token
    // Para Instagram: el IGSID puede consultarse con el page token de la página FB vinculada a esa cuenta IG
    const fields = platform === 'facebook' ? 'first_name,last_name,name' : 'username,name';
    const url = `https://graph.facebook.com/v25.0/${senderId}?fields=${fields}&access_token=${pageAccessToken}`;

    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();

    if (data.error) {
      console.warn(`⚠️ [fetchSenderProfile] Error Meta API [${platform}] para ID ${senderId}: ${data.error.message} (code=${data.error.code})`);
      return null;
    }

    if (platform === 'facebook') {
      const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ").trim();
      if (fullName) {
        console.log(`✅ [Messenger] Nombre resuelto para ${senderId}: "${fullName}"`);
        return { name: fullName };
      }
      return null;
    } else {
      // Instagram: preferir @username sobre name
      if (data.username) {
        console.log(`✅ [Instagram] Usuario resuelto para ${senderId}: @${data.username}`);
        return { name: `@${data.username}` };
      }
      if (data.name) {
        console.log(`✅ [Instagram] Nombre resuelto para ${senderId}: ${data.name}`);
        return { name: data.name };
      }
      return null;
    }
  } catch (e) {
    console.warn("⚠️ [fetchSenderProfile] Error de red:", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// GET — Polling de mensajes pendientes / verificación de webhook Meta
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Verificación de webhook por Meta
  if (mode === "subscribe" && token === TOKEN_PRODUCCION_META) {
    return new NextResponse(challenge, { status: 200 })
  }

  // Leer email del guía desde el query param o cookie de sesión
  let guideEmail = searchParams.get("guide_email") || "";
  if (!guideEmail) {
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get('andara_session')
      if (sessionCookie) {
        let val = sessionCookie.value.trim()
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
        val = decodeURIComponent(val)
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
        const session = JSON.parse(Buffer.from(val, 'base64').toString('utf-8'))
        if (session?.email) guideEmail = session.email;
      }
    } catch {}
  }
  if (!guideEmail) guideEmail = "guia@andara.pe";

  // Leer mensajes pendientes de Supabase (fuente única de verdad)
  try {
    const { data, error } = await supabase
      .from('mensajes_entrantes')
      .select('id, name, phone, text, created_at')
      .eq('guide_email', guideEmail)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      const mapped = data.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        text: item.text,
        time: new Date(item.created_at).toLocaleTimeString()
      }));

      // Deduplicar por (phone + text) para el caso de reintentos ya guardados
      const seen = new Set<string>();
      const deduped = mapped.filter(el => {
        const key = `${el.phone}_${el.text}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return new NextResponse(JSON.stringify(deduped), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }
  } catch (e) {
    console.error("GET /api/webhook error:", e);
  }

  return new NextResponse(JSON.stringify([]), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

// ---------------------------------------------------------------------------
// POST — Procesa webhooks entrantes de Meta
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    let body: any;
    try {
      const rawBody = await request.text()
      if (!rawBody?.trim()) return NextResponse.json({ received: true }, { status: 200 })
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Evento especial de conexión de guía
    if (body.setup_event === "USER_CONNECTED") {
      console.log("🚀 Nuevo guía vinculó su WhatsApp. WABA:", body.whatsapp_business_account_id);
      return NextResponse.json({ success: true }, { status: 200 })
    }

    console.log("📦 WEBHOOK RECIBIDO:", JSON.stringify(body, null, 2))

    // -----------------------------------------------------------------------
    // PARSEO DEL PAYLOAD — Detectar canal y extraer datos
    // -----------------------------------------------------------------------
    let source: "whatsapp" | "instagram" | "facebook" = "whatsapp"
    let nombre = ""
    let identificador = ""
    let texto = ""
    let isMock = false
    let targetPageId: string | null = null

    // ── Simulador / payload de muestra ──────────────────────────────────────
    if (body.sample || (body.field === "messages" && !body.entry && body.value?.messaging_product !== "whatsapp")) {
      source = "facebook"
      const sd = body.sample || body
      identificador = sd?.value?.sender?.id || "FB-Tester"
      texto = sd?.value?.message?.text || "[Mensaje de prueba]"
      nombre = body._mockName || "Meta Tester"
      isMock = true
    }

    // ── Instagram Direct Message ─────────────────────────────────────────────
    else if (body.object === "instagram" && body.entry?.[0]) {
      source = "instagram"
      const entry = body.entry[0]
      targetPageId = entry.id?.toString() || null

      // Ignorar echo de mensajes enviados por la cuenta
      const msgObj = entry.changes?.[0]?.value || entry.messaging?.[0]
      if (msgObj?.message?.is_echo || msgObj?.is_echo) {
        console.log("🔇 [Instagram] Echo de mensaje propio ignorado.");
        return NextResponse.json({ received: true }, { status: 200 })
      }

      if (entry.changes?.[0]?.value) {
        const v = entry.changes[0].value
        identificador = v.sender?.id || v.from?.id || ""
        texto = v.message?.text || v.text || ""
      } else if (entry.messaging?.[0]) {
        const m = entry.messaging[0]
        identificador = m.sender?.id || ""
        texto = m.message?.text || ""
      }

      if (body._mockName) { nombre = body._mockName; isMock = true; }
    }

    // ── Facebook Messenger ───────────────────────────────────────────────────
    else if (body.object === "page" && body.entry?.[0]) {
      source = "facebook"
      const entry = body.entry[0]
      targetPageId = entry.id?.toString() || null

      if (entry.changes?.[0]?.value) {
        const v = entry.changes[0].value
        // Ignorar eventos que no son mensajes de texto entrantes
        if (!v.message?.text && !v.text) {
          console.log("🔇 [Messenger] Evento sin texto ignorado (reactions, postbacks, etc.).");
          return NextResponse.json({ received: true }, { status: 200 })
        }
        identificador = v.sender?.id || v.from?.id || ""
        texto = v.message?.text || v.text || ""
      } else if (entry.messaging?.[0]) {
        const m = entry.messaging[0]
        
        // ⚠️ CRÍTICO: Ignorar message_echoes (mensajes enviados POR la página)
        // Meta envía un segundo webhook "echo" de los mensajes salientes → causa duplicados
        if (m.message?.is_echo === true) {
          console.log(`🔇 [Messenger] Echo de mensaje propio ignorado. (mid=${m.message?.mid})`);
          return NextResponse.json({ received: true }, { status: 200 })
        }

        // Ignorar read receipts y delivery confirmations
        if (m.read || m.delivery) {
          console.log("🔇 [Messenger] Read receipt / Delivery confirmation ignorado.");
          return NextResponse.json({ received: true }, { status: 200 })
        }

        // Solo procesar mensajes con texto
        if (!m.message?.text) {
          console.log("🔇 [Messenger] Mensaje sin texto (sticker, adjunto, etc.) ignorado.");
          return NextResponse.json({ received: true }, { status: 200 })
        }

        identificador = m.sender?.id || ""
        texto = m.message?.text || ""
      }

      if (body._mockName) { nombre = body._mockName; isMock = true; }
    }

    // ── WhatsApp Business API ────────────────────────────────────────────────
    else if (body.object === "whatsapp_business_account" && body.entry?.[0]?.changes?.[0]) {
      source = "whatsapp"
      const change = body.entry[0].changes[0]
      const value = change.value
      const message = value?.messages?.[0]
      const contact = value?.contacts?.[0]

      // WhatsApp incluye el nombre directamente en el payload del contacto ✅
      nombre = contact?.profile?.name || ""
      identificador = message?.from || ""
      texto = message?.text?.body || ""

      const phone_number_id = value?.metadata?.phone_number_id;
      if (phone_number_id) targetPageId = `wa_${phone_number_id}`;
      if (body._mockName) { nombre = body._mockName; isMock = true; }
    }

    // ── WhatsApp (formato alternativo) ───────────────────────────────────────
    else if (body.field === "messages" && body.value?.messaging_product === "whatsapp") {
      source = "whatsapp"
      const value = body.value
      const message = value.messages?.[0]
      const contact = value.contacts?.[0]
      nombre = contact?.profile?.name || ""
      identificador = message?.from || ""
      texto = message?.text?.body || ""
      const phone_number_id = value?.metadata?.phone_number_id;
      if (phone_number_id) targetPageId = `wa_${phone_number_id}`;
      if (body._mockName) { nombre = body._mockName; isMock = true; }
    }

    // ── Payload no reconocido ────────────────────────────────────────────────
    else {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Validar que haya algo útil
    if (!texto.trim() && !identificador) {
      console.log("🔇 Webhook sin texto ni identificador útil. Ignorando.");
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // -----------------------------------------------------------------------
    // RESOLUCIÓN DE guideEmail Y pageAccessToken
    // -----------------------------------------------------------------------
    let guideEmail = "guia@andara.pe";
    let pageAccessToken: string | null = null;

    if (targetPageId) {
      try {
        const { data, error } = await supabase
          .from('paginas_vinculadas')
          .select('guide_email, page_access_token, platform')
          .eq('page_id', targetPageId)
          .single();

        if (!error && data) {
          if (data.guide_email) guideEmail = data.guide_email;
          if (data.page_access_token) pageAccessToken = data.page_access_token;
          console.log(`🎯 Ruteado → guía: ${guideEmail} | página: ${targetPageId} | plataforma: ${data.platform}`);
        } else {
          // Si no encontró la página exacta, buscar cualquier entrada del mismo guía para FB/IG
          console.warn(`⚠️ Página ${targetPageId} no encontrada. Buscando token alternativo para ${source}...`);
          const dbPlatform = source === 'whatsapp' ? 'facebook' : source;
          const { data: anyPage } = await supabase
            .from('paginas_vinculadas')
            .select('guide_email, page_access_token')
            .eq('platform', dbPlatform)
            .limit(1)
            .single();

          if (anyPage) {
            guideEmail = anyPage.guide_email || guideEmail;
            pageAccessToken = anyPage.page_access_token || null;
            console.log(`↪️ Usando token alternativo de plataforma "${dbPlatform}" para guía: ${guideEmail}`);
          }
        }
      } catch (dbErr) {
        console.error("Error buscando página vinculada:", dbErr);
      }
    } else {
      // Sin targetPageId, leer email de cookie de sesión
      try {
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get('andara_session')
        if (sessionCookie) {
          let val = sessionCookie.value.trim()
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
          val = decodeURIComponent(val)
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
          const session = JSON.parse(Buffer.from(val, 'base64').toString('utf-8'))
          if (session?.email) guideEmail = session.email;
        }
      } catch {}
    }

    // -----------------------------------------------------------------------
    // RESOLUCIÓN DE NOMBRE desde Meta Graph API
    // -----------------------------------------------------------------------
    if (!isMock && identificador) {
      if (source === 'facebook' && pageAccessToken) {
        // Messenger: usar el page_access_token de la PÁGINA (no el de Instagram)
        const profile = await fetchSenderProfile(identificador, pageAccessToken, 'facebook');
        if (profile?.name) nombre = profile.name;
        else nombre = nombre || `Usuario FB (${identificador})`;

      } else if (source === 'instagram' && pageAccessToken) {
        // Instagram: el page_access_token de la página FB funciona también para IG
        const profile = await fetchSenderProfile(identificador, pageAccessToken, 'instagram');
        if (profile?.name) nombre = profile.name;
        else nombre = nombre || `Usuario IG (${identificador})`;

      } else if (source === 'whatsapp') {
        // WhatsApp: el nombre ya viene en el payload (contact.profile.name)
        if (!nombre) nombre = `WA (${identificador})`;
      }
    } else if (isMock && !nombre) {
      nombre = source === 'instagram' ? "Usuario IG Demo" : source === 'facebook' ? "Usuario FB Demo" : "Cliente WA Demo";
    } else if (!nombre) {
      if (source === 'instagram') nombre = `Usuario IG (${identificador})`;
      else if (source === 'facebook') nombre = `Usuario FB (${identificador})`;
      else nombre = `WA (${identificador})`;
    }

    console.log(`✨ [${source.toUpperCase()}] ${nombre} → "${texto.substring(0, 80)}"`);

    // -----------------------------------------------------------------------
    // PREFIJO DE CANAL en el campo phone (identificador único)
    // -----------------------------------------------------------------------
    const phoneWithPrefix = source === "whatsapp"
      ? `whatsapp:+${identificador}`
      : `${source}:${identificador}`;

    // -----------------------------------------------------------------------
    // DEDUPLICACIÓN en DB — ventana de 30 segundos
    // -----------------------------------------------------------------------
    try {
      const treintaSegAtras = new Date(Date.now() - 30000).toISOString();
      const { data: existentes } = await supabase
        .from('mensajes_entrantes')
        .select('id')
        .eq('guide_email', guideEmail)
        .eq('phone', phoneWithPrefix)
        .eq('text', texto)
        .gte('created_at', treintaSegAtras)
        .limit(1);

      if (existentes && existentes.length > 0) {
        console.log(`♻️ DEDUPLICADO (30s): "${nombre}" → "${texto.substring(0, 50)}" ya existe.`);
        return NextResponse.json({ received: true, duplicated: true }, { status: 200 });
      }
    } catch (errDedup) {
      console.warn("⚠️ Error en deduplicador de DB:", errDedup);
    }

    // -----------------------------------------------------------------------
    // GUARDAR en mensajes_entrantes (fuente única de verdad)
    // -----------------------------------------------------------------------
    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('mensajes_entrantes')
        .insert([{
          guide_email: guideEmail,
          name: nombre,
          phone: phoneWithPrefix,
          text: texto
        }])
        .select('id')
        .single();

      if (!insertErr && inserted?.id) {
        console.log(`✅ Guardado en mensajes_entrantes. UUID: ${inserted.id}`);
      } else {
        console.error("❌ Error guardando en mensajes_entrantes:", insertErr?.message);
      }
    } catch (e) {
      console.error("❌ Error crítico en INSERT:", e);
    }

    return NextResponse.json({
      received: true,
      channel: source,
      lead: {
        name: nombre,
        source,
        contact: source === "whatsapp" ? `+${identificador}` : (nombre.startsWith('@') ? nombre : identificador),
        interest: texto.substring(0, 100),
        status: "new",
        date: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error crítico en webhook POST:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE — Elimina un mensaje procesado de mensajes_entrantes
// ---------------------------------------------------------------------------
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from('mensajes_entrantes').delete().eq('id', id);
    if (error) {
      console.error(`❌ Error eliminando mensaje ${id}:`, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`🗑️ Mensaje ${id} eliminado de mensajes_entrantes.`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en DELETE webhook:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
