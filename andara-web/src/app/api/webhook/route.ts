import { NextResponse } from "next/server"

// 🚨 COMPORTAMIENTO ULTRA-DINÁMICO PARA EVITAR CACHÉ AJENA EN EL ROUTING
export const dynamic = 'force-dynamic'
export const revalidate = 0

const TOKEN_PRODUCCION_META = "AndaraMeta2026" 

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
  const listaLeads = (global as any).listaLeadsCompartida || [];

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