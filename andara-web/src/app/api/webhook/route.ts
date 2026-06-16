import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// 🚨 COMPORTAMIENTO ULTRA-DINÁMICO PARA EVITAR CACHÉ AJENA EN EL ROUTING
export const dynamic = 'force-dynamic'

const TOKEN_PRODUCCION_META = "AndaraMeta2026" 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dhmrtidehbmnyabwveds.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Aseguramos el contenedor en la memoria global de Node independientemente de las recargas en desarrollo
if (!(global as any).listaLeadsCompartida) {
  (global as any).listaLeadsCompartida = [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Si Meta está intentando validar el Webhook (Modo suscripción)
  if (mode === "subscribe" && token === TOKEN_PRODUCCION_META) {
    return new NextResponse(challenge, { status: 200 })
  }

  // Jalar los leads en tiempo de ejecución de la memoria global
  let listaLeads = (global as any).listaLeadsCompartida || [];

  // Obtener el email del guía logueado desde la cookie de sesión
  let guideEmail = "guia@andara.pe"; // Fallback por defecto
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('andara_session')
    if (sessionCookie) {
      let val = sessionCookie.value.trim()
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1)
      }
      val = decodeURIComponent(val)
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1)
      }
      const session = JSON.parse(Buffer.from(val, 'base64').toString('utf-8'))
      if (session && session.email) {
        guideEmail = session.email;
      }
    }
  } catch (e) {
    console.error("Error al decodificar la cookie de sesión en Webhook GET:", e);
  }

  // Intentar también jalar de Supabase (incoming_webhooks) filtrando por el email del guía
  try {
    const { data, error } = await supabase
      .from('mensajes_entrantes')
      .select('name, phone, text, created_at')
      .eq('guide_email', guideEmail)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (!error && data && data.length > 0) {
      // Mapear al formato que espera el frontend (con campo time)
      const dbLeads = data.map(item => ({
        name: item.name,
        phone: item.phone,
        text: item.text,
        time: new Date(item.created_at).toLocaleTimeString()
      }));
      // Combinar con los locales de memoria, evitando duplicados
      const combined = [...dbLeads, ...listaLeads];
      const seen = new Set();
      listaLeads = combined.filter(el => {
        const key = `${el.name}_${el.phone}_${el.text}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
  } catch (e) {
    console.log("Supabase fetch failed or not configured, using memory only:", e);
  }

  // Retornamos una respuesta JSON cruda forzando al navegador a omitir cualquier caché interna
  return new NextResponse(JSON.stringify(listaLeads), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}

export async function POST(request: Request) {
  try {
    let body: any;

    try {
      const rawBody = await request.text()
      if (!rawBody || rawBody.trim() === "") {
        return NextResponse.json({ received: true }, { status: 200 })
      }
      body = JSON.parse(rawBody)
    } catch (parseError) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // 1. CASO COMPRA DE FLUJO: DETECTAR CUANDO UN GUÍA VINCULA SU CUENTA DESDE EL FRONTEND
    if (body.setup_event === "USER_CONNECTED") {
      console.log("==================================================")
      console.log("🚀 ¡UN NUEVO GUÍA HA VINCULADO SU WHATSAPP EN VIVO!");
      console.log(`🔑 Token de Acceso Otorgado: ${body.accessToken.substring(0, 15)}...`);
      console.log(`🆔 WhatsApp Business Account ID (WABA): ${body.whatsapp_business_account_id}`);
      console.log("==================================================")
      return NextResponse.json({ success: true, message: "Guía vinculado" }, { status: 200 })
    }

    // LOG DE CONTROL PARA MENSAJES ENTRANTES
    console.log("📦 PAYLOAD ENTERO ENTRANTE:", JSON.stringify(body, null, 2))
    
    let source: "whatsapp" | "instagram" | "facebook" = "whatsapp"
    let nombre = "Cliente Nuevo"
    let identificador = "Sin datos"
    let texto = "[Mensaje sin texto]"

    // 2. DETECTAR EL CANAL SEGÚN LA ESTRUCTURA DE META
    if (body.sample || (body.field === "messages" && !body.entry && body.value?.messaging_product !== "whatsapp")) {
      source = "facebook"
      const sampleData = body.sample || body
      const value = sampleData?.value
      identificador = value?.sender?.id || "FB-Tester"
      texto = value?.message?.text || "[Mensaje de prueba]"
      nombre = body._mockName || sampleData?._mockName || "Meta Tester (Panel)"
    }
    else if (body.object === "instagram" && body.entry?.[0]) {
      source = "instagram"
      const entry = body.entry[0]
      if (entry.changes?.[0]?.value) {
        const changeValue = entry.changes[0].value
        identificador = changeValue.sender?.id || changeValue.from?.id || "IG-User"
        texto = changeValue.message?.text || changeValue.text || ""
        nombre = body._mockName || `Usuario IG (${identificador})`
      } 
      else if (entry.messaging?.[0]) {
        const messaging = entry.messaging[0]
        identificador = messaging.sender?.id || "IG-User"
        texto = messaging.message?.text || ""
        nombre = body._mockName || `Usuario IG (${identificador})`
      }
    } 
    else if (body.object === "page" && body.entry?.[0]) {
      source = "facebook"
      const entry = body.entry[0]
      if (entry.changes?.[0]?.value) {
        const changeValue = entry.changes[0].value
        identificador = changeValue.sender?.id || changeValue.from?.id || "FB-Test-ID"
        texto = changeValue.message?.text || changeValue.text || "[Mensaje de prueba Meta]"
        nombre = body._mockName || "Meta Tester (Panel Changes)"
      }
      else if (entry.messaging?.[0]) {
        const messaging = entry.messaging[0]
        identificador = messaging.sender?.id || "FB-User"
        texto = messaging.message?.text || ""
        nombre = body._mockName || `Usuario FB (${identificador})`
      }
    } 
    else if (body.object === "whatsapp_business_account" && body.entry?.[0]?.changes?.[0]) {
      source = "whatsapp"
      const change = body.entry[0].changes[0]
      const value = change.value
      const message = value?.messages?.[0]
      const contact = value?.contacts?.[0]
      nombre = contact?.profile?.name || "Cliente WhatsApp"
      identificador = message?.from || "Sin número"
      texto = message?.text?.body || ""
    }
    else if (body.field === "messages" && body.value?.messaging_product === "whatsapp") {
      source = "whatsapp"
      const value = body.value
      const message = value.messages?.[0]
      const contact = value.contacts?.[0]
      nombre = contact?.profile?.name || "Cliente WhatsApp"
      identificador = message?.from || "Sin número"
      texto = message?.text?.body || ""
    } 
    else {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    console.log(`✨ Lead procesado listo para el CRM: ${nombre} - Msn: ${texto}`);
    
    // Identificar el Page ID para ruteo SaaS
    let targetPageId: string | null = null;
    if (body.object === "page" && body.entry?.[0]) {
      targetPageId = body.entry[0].id?.toString() || null;
    } else if (body.object === "instagram" && body.entry?.[0]) {
      targetPageId = body.entry[0].id?.toString() || null;
    }

    let guideEmail = "guia@andara.pe"; // Fallback por defecto
    if (targetPageId) {
      try {
        const { data, error } = await supabase
          .from('paginas_vinculadas')
          .select('guide_email')
          .eq('page_id', targetPageId)
          .single();
        
        if (!error && data?.guide_email) {
          guideEmail = data.guide_email;
          console.log(`🎯 Mensaje ruteado al guía: ${guideEmail} para la página ID: ${targetPageId}`);
        } else {
          console.log(`⚠️ No se encontró guía vinculado para la página ID: ${targetPageId}. Se usará fallback.`);
        }
      } catch (dbErr) {
        console.error("Error buscando el dueño de la página en Supabase:", dbErr);
      }
    }

    // Construimos el objeto con la estructura que tu frontend KanbanBoard espera leer
    const nuevoLead = {
      name: nombre,
      phone: source === "whatsapp" ? `+${identificador}` : identificador,
      text: texto,
      time: new Date().toLocaleTimeString()
    };

    // Lo guardamos en el arreglo global al principio
    if ((global as any).listaLeadsCompartida) {
      (global as any).listaLeadsCompartida.unshift(nuevoLead);
    }

    // Intentar también guardar en Supabase (incoming_webhooks) para producción en Vercel
    try {
      await supabase
        .from('mensajes_entrantes')
        .insert([{
          guide_email: guideEmail,
          name: nuevoLead.name,
          phone: nuevoLead.phone,
          text: nuevoLead.text
        }]);
    } catch (e) {
      console.log("Supabase insert failed or not configured, using memory only:", e);
    }

    // 3. RETORNO DIRECTO DEL LEAD PARA SIMULACIÓN EN TIEMPO REAL
    return NextResponse.json({ 
      received: true, 
      channel: source,
      lead: {
        name: nombre,
        source: source,
        contact: source === "whatsapp" ? `+${identificador}` : `@${nombre.toLowerCase().replace(/\s+/g, '')}`,
        interest: texto.substring(0, 100),
        status: "new",
        date: new Date().toISOString()
      }
    }, { status: 200 })

  } catch (error) {
    console.error("❌ Error crítico:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
