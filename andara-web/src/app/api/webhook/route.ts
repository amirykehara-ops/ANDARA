import { NextResponse } from "next/server"
export const dynamic = "force-dynamic"
// ========================================================
// CONFIGURACIÓN DE PRODUCCIÓN DIRECTA (HARDCODED)
// ========================================================
// Definimos el token directo aquí para no depender del panel de Vercel
const TOKEN_PRODUCCION_META = "AndaraMeta2026" 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  console.log("🔍 Intentando validar Webhook desde Meta...")
  console.log(`Token recibido: ${token} | Esperado: ${TOKEN_PRODUCCION_META}`)

  if (mode === "subscribe" && token === TOKEN_PRODUCCION_META) {
    console.log("✅ ¡Validación exitosa! Enviando challenge a Meta.")
    return new NextResponse(challenge, { status: 200 })
  }
  
  console.log("❌ Validación fallida. Token incorrecto.")
  return new NextResponse("Forbidden", { status: 403 })
}

export async function POST(request: Request) {
  try {
    let body: any;

    // 1. LECTURA HÍBRIDA ULTRA-RESISTENTE PARA EVITAR VALORES VACÍOS
    try {
      const rawBody = await request.text()
      if (!rawBody || rawBody.trim() === "") {
        return NextResponse.json({ received: true }, { status: 200 })
      }
      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.log("❌ Error crítico parseando el JSON entrante.")
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // LOG DE CONTROL EN PRODUCCIÓN
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

    // ========================================================
    // 3. ENVIAR EL LEAD EN VIVO A SUPABASE (PRODUCCIÓN REAL)
    // ========================================================
    try {
      // Importación dinámica para evitar que Next.js falle si no hay variables cargadas en build-time
      const { createClient } = await import("@/utils/supabase/server")
      const supabase = await createClient()

      await supabase
        .from('leads') // Reemplaza 'leads' por el nombre exacto de tu tabla si es diferente
        .insert([
          {
            name: nombre,
            source: source,
            contact: source === "whatsapp" ? `+${identificador}` : `@${nombre.toLowerCase().replace(/\s+/g, '')}`,
            interest: texto.substring(0, 100),
            status: "new",
            date: new Date().toISOString()
          }
        ])
      console.log("💾 ¡Lead inyectado con éxito en Supabase desde Producción Meta!")
    } catch (supabaseError) {
      console.error("❌ Falló la inserción en Supabase en el POST:", supabaseError)
    }

    return NextResponse.json({ received: true, channel: source }, { status: 200 })

  } catch (error) {
    console.error("❌ Error crítico general en el Webhook:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
