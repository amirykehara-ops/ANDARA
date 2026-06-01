import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse("Forbidden", { status: 403 })
}

export async function POST(request: Request) {
  try {
    let body: any;

    // 1. LECTURA HÍBRIDA ULTRA-RESISTENTE PARA EVITAR VALORES VACÍOS EN NEXT.JS
    try {
      const rawBody = await request.text()
      
      if (!rawBody || rawBody.trim() === "") {
        console.log("⚠️ El webhook recibió una petición con cuerpo físico vacío.")
        return NextResponse.json({ received: true }, { status: 200 })
      }

      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.log("❌ Error crítico parseando el JSON entrante.")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // LOG DE CONTROL TOTAL (Imprime el JSON limpio para tu revisión en consola)
    console.log("📦 PAYLOAD ENTERO ENTRANTE:", JSON.stringify(body, null, 2))
    
    let source: "whatsapp" | "instagram" | "facebook" = "whatsapp"
    let nombre = "Cliente Nuevo"
    let identificador = "Sin datos"
    let texto = "[Mensaje sin texto]"

   // ========================================================
    // 2. DETECTAR EL CANAL SEGÚN LA ESTRUCTURA DE META
    // ========================================================
    
    // CASO A: PANEL DE META O TU BOTÓN DE PRUEBAS (Formato "sample" o JSON plano de pruebas)
    if (body.sample || (body.field === "messages" && !body.entry && body.value?.messaging_product !== "whatsapp")) {
      source = "facebook"
      const sampleData = body.sample || body
      const value = sampleData?.value
      
      identificador = value?.sender?.id || "FB-Tester"
      texto = value?.message?.text || "[Mensaje de prueba]"
      nombre = body._mockName || sampleData?._mockName || "Meta Tester (Panel)"
    }
    // CASO B: INSTAGRAM DIRECT (Panel "changes" o botón "messaging")
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
    
    // CASO C: FACEBOOK MESSENGER (Producción real Y botón de prueba en la sección Webhooks)
    else if (body.object === "page" && body.entry?.[0]) {
      source = "facebook"
      const entry = body.entry[0]

      // Si viene por "changes" (Típico del botón de prueba de Webhooks del panel)
      if (entry.changes?.[0]?.value) {
        const changeValue = entry.changes[0].value
        identificador = changeValue.sender?.id || changeValue.from?.id || "FB-Test-ID"
        // Meta a veces manda el texto en 'message.text' o directo en 'value.text' en pruebas
        texto = changeValue.message?.text || changeValue.text || "[Mensaje de prueba Meta]"
        nombre = body._mockName || "Meta Tester (Panel Changes)"
      }
      // Si viene por "messaging" (Producción real de Messenger, como tu CURL)
      else if (entry.messaging?.[0]) {
        const messaging = entry.messaging[0]
        identificador = messaging.sender?.id || "FB-User"
        texto = messaging.message?.text || ""
        nombre = body._mockName || `Usuario FB (${identificador})`
      }
    } 
    
    // CASO D: WHATSAPP REAL (whatsapp_business_account)
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
    
    // CASO E: PAYLOAD PLANO (WhatsApp simulado)
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
      // MODIFICACIÓN CLAVE: Deja un log para ver exactamente qué te mandó Meta si vuelve a fallar
      console.log("⚠️ Estructura desconocida de Meta. Clon del Body recibido:", JSON.stringify(body))
      return NextResponse.json({ received: true }, { status: 200 })
    }
    // ========================================================
    // 3. IMPRIMIR EL LOG EN CONSOLA CON DISEÑO PERSONALIZADO
    // ========================================================
    const badges = {
      whatsapp: "🟢 [WHATSAPP WEBHOOK]",
      instagram: "📸 [INSTAGRAM WEBHOOK]",
      facebook: "🔵 [FACEBOOK WEBHOOK]"
    }

    console.log("\n========================================================")
    console.log(`${badges[source]} ¡LEAD PROCESADO EN VIVO!`)
    console.log(`👤 Nombre: ${nombre}`)
    console.log(`🆔 ID/Tel: ${source === "whatsapp" ? "+" : ""}${identificador}`)
    console.log(`💬 Mensaje: "${texto}"`)
    console.log("========================================================\n")

    return NextResponse.json({ received: true, channel: source }, { status: 200 })

  } catch (error) {
    console.error("❌ Error crítico general en el Webhook:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}