import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dhmrtidehbmnyabwveds.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
  try {
    const { accessToken, guideEmail } = await request.json()

    if (!accessToken || !guideEmail) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    console.log(`🔗 Iniciando vinculación de Facebook para el guía: ${guideEmail}`);

    // 1. Obtener las páginas de Facebook administradas por el usuario
    const accountsUrl = `https://graph.facebook.com/v25.0/me/accounts?access_token=${accessToken}`
    const accountsRes = await fetch(accountsUrl)
    
    if (!accountsRes.ok) {
      const errData = await accountsRes.json()
      console.error("❌ Error de Meta Graph API:", errData)
      return NextResponse.json({ error: "Failed to fetch accounts from Meta" }, { status: 500 })
    }

    const accountsData = await accountsRes.json()
    const pages = accountsData.data || []

    if (pages.length === 0) {
      return NextResponse.json({ success: true, pages: [], message: "No Pages found for this user account" })
    }

    const connectedPages = []

    // 2. Para cada página, suscribirla al Webhook de ANDARA e insertarla en Supabase
    for (const page of pages) {
      const pageId = page.id
      const pageName = page.name
      const pageAccessToken = page.access_token

      console.log(`📡 Suscribiendo Página: ${pageName} (ID: ${pageId})`);

      // Llamada a Meta para suscribir la aplicación a los webhooks de mensajería de la página
      const subscribeUrl = `https://graph.facebook.com/v25.0/${pageId}/subscribed_apps`
      const subscribeRes = await fetch(subscribeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscribed_fields: "messages,messaging_postbacks",
          access_token: pageAccessToken
        })
      })

      if (!subscribeRes.ok) {
        const subscribeErr = await subscribeRes.json()
        console.warn(`⚠️ Error al suscribir la página ${pageName}:`, subscribeErr)
      } else {
        console.log(`✅ Página ${pageName} suscrita con éxito en Meta.`);
      }

      // Guardar en la tabla linked_pages de Supabase
      const { error: dbError } = await supabase
        .from('paginas_vinculadas')
        .upsert({
          guide_email: guideEmail,
          page_id: pageId,
          page_name: pageName,
          page_access_token: pageAccessToken,
          platform: 'facebook'
        }, { onConflict: 'page_id' })

      if (dbError) {
        console.error(`❌ Error guardando página ${pageName} en la Base de Datos:`, dbError.message)
      } else {
        connectedPages.push({ id: pageId, name: pageName })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Vinculación completada. Se conectaron ${connectedPages.length} página(s).`,
      pages: connectedPages
    })

  } catch (e: any) {
    console.error("❌ Error en /api/facebook/connect:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}
