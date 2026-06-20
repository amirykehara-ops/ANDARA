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

    // 1. Obtener el nombre del usuario de Facebook
    let fbUserName = "Cuenta de Facebook"
    try {
      const meUrl = `https://graph.facebook.com/v25.0/me?fields=name&access_token=${accessToken}`
      const meRes = await fetch(meUrl)
      if (meRes.ok) {
        const meData = await meRes.json()
        fbUserName = meData.name || "Cuenta de Facebook"
      }
    } catch (errMe) {
      console.warn("⚠️ Error obteniendo nombre de usuario de Facebook:", errMe)
    }

    // 2. Obtener las páginas de Facebook administradas por el usuario
    const accountsUrl = `https://graph.facebook.com/v25.0/me/accounts?access_token=${accessToken}`
    const accountsRes = await fetch(accountsUrl)
    
    if (!accountsRes.ok) {
      const errData = await accountsRes.json()
      console.error("❌ Error de Meta Graph API:", errData)
      return NextResponse.json({ error: "Failed to fetch accounts from Meta" }, { status: 500 })
    }

    const accountsData = await accountsRes.json()
    console.log("🔍 raw accountsData from Meta:", JSON.stringify(accountsData))
    const pages = accountsData.data || []

    if (pages.length === 0) {
      return NextResponse.json({ 
        success: true, 
        pages: [], 
        fbUserName, 
        message: "No Pages found for this user account",
        debugData: accountsData
      })
    }

    const connectedPages = []

    // 3. Para cada página, suscribirla al Webhook de ANDARA e insertarla en Supabase
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

      // Borrar cualquier vinculación previa de esta página para evitar violación de políticas RLS de UPDATE
      try {
        await supabase
          .from('paginas_vinculadas')
          .delete()
          .eq('page_id', pageId)
      } catch (delErr) {
        console.warn("⚠️ Error borrando vinculación previa:", delErr)
      }

      // Insertar la nueva vinculación con RLS de INSERT que está permitido
      const { error: dbError } = await supabase
        .from('paginas_vinculadas')
        .insert({
          guide_email: guideEmail,
          page_id: pageId,
          page_name: pageName,
          page_access_token: pageAccessToken,
          platform: 'facebook'
        })

      if (dbError) {
        console.error(`❌ Error guardando página ${pageName} en la Base de Datos:`, dbError.message)
      }
      connectedPages.push({ id: pageId, name: pageName, platform: 'facebook' })

      // 🔍 Intentar detectar automáticamente si hay una cuenta de Instagram Business vinculada a esta página
      try {
        const igUrl = `https://graph.facebook.com/v25.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
        const igRes = await fetch(igUrl)
        if (igRes.ok) {
          const igData = await igRes.json()
          console.log(`🔍 Respuesta de Instagram para la página ${pageName}:`, JSON.stringify(igData))
          
          if (igData.instagram_business_account && igData.instagram_business_account.id) {
            const instagramId = igData.instagram_business_account.id
            console.log(`📸 Instagram Business Account detectada: ${instagramId} para la página ${pageName}`);
            
            // Obtener el nombre/username real de la cuenta de Instagram
            let instagramName = `${pageName} (Instagram)`
            try {
              const igDetailsUrl = `https://graph.facebook.com/v25.0/${instagramId}?fields=username,name&access_token=${pageAccessToken}`
              const igDetailsRes = await fetch(igDetailsUrl)
              if (igDetailsRes.ok) {
                const igDetails = await igDetailsRes.json()
                console.log(`🔍 Detalles de Instagram obtenidos:`, JSON.stringify(igDetails))
                instagramName = igDetails.username ? `@${igDetails.username}` : (igDetails.name || instagramName)
              } else {
                const igDetailsErr = await igDetailsRes.json()
                console.warn(`⚠️ No se pudo obtener detalles de la cuenta de Instagram:`, JSON.stringify(igDetailsErr))
              }
            } catch (errIgDetails) {
              console.warn("⚠️ Error obteniendo detalles de Instagram:", errIgDetails)
            }

            // Suscribir la app también a los webhooks de la cuenta de Instagram
            const subscribeIgUrl = `https://graph.facebook.com/v25.0/${instagramId}/subscribed_apps`
            await fetch(subscribeIgUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscribed_fields: "messages,comments",
                access_token: pageAccessToken
              })
            })

            // Borrar cualquier vinculación previa de Instagram para evitar violación de políticas RLS de UPDATE
            try {
              await supabase
                .from('paginas_vinculadas')
                .delete()
                .eq('page_id', instagramId)
            } catch (delErrIg) {
              console.warn("⚠️ Error borrando vinculación previa de Instagram:", delErrIg)
            }

            // Insertar la nueva vinculación de Instagram
            const { error: dbErrorIg } = await supabase
              .from('paginas_vinculadas')
              .insert({
                guide_email: guideEmail,
                page_id: instagramId,
                page_name: instagramName,
                page_access_token: pageAccessToken,
                platform: 'instagram'
              })

            if (dbErrorIg) {
              console.error(`❌ Error guardando Instagram ${pageName} en la Base de Datos:`, dbErrorIg.message)
            } else {
              console.log(`✅ Instagram "${instagramName}" conectado con éxito.`);
              connectedPages.push({ id: instagramId, name: instagramName, platform: 'instagram' })
            }
          } else {
            console.log(`⚠️ La página ${pageName} no tiene una cuenta de Instagram Business vinculada en la API de Meta.`);
          }
        } else {
          const igErr = await igRes.json()
          console.error(`❌ Error de Graph API consultando Instagram para ${pageName}:`, JSON.stringify(igErr))
        }
      } catch (errIg) {
        console.warn(`⚠️ Error buscando cuenta de Instagram vinculada para ${pageName}:`, errIg)
      }
    }

    // 4. 🔍 Detectar automáticamente si hay cuentas de WhatsApp Business vinculadas al perfil de Meta
    let debugWaData: any = null
    try {
      const waUrl = `https://graph.facebook.com/v25.0/me/whatsapp_business_accounts?fields=id,name,phone_numbers{id,display_phone_number,verified_name}&access_token=${accessToken}`
      console.log(`📞 Consultando cuentas de WhatsApp Business con URL: ${waUrl.substring(0, 60)}...`)
      const waRes = await fetch(waUrl)
      
      if (waRes.ok) {
        const waData = await waRes.json()
        debugWaData = waData
        console.log("🔍 raw whatsapp_business_accounts from Meta:", JSON.stringify(waData))
        const wabas = waData.data || []
        
        for (const waba of wabas) {
          let phoneNumbersList = waba.phone_numbers?.data || []
          
          if (phoneNumbersList.length === 0) {
            try {
              const phoneUrl = `https://graph.facebook.com/v25.0/${waba.id}/phone_numbers?fields=id,display_phone_number,verified_name&access_token=${accessToken}`
              console.log(`📞 Consultando números de teléfono para la WABA ${waba.id} en la URL: ${phoneUrl.substring(0, 60)}...`)
              const phoneRes = await fetch(phoneUrl)
              if (phoneRes.ok) {
                const phoneData = await phoneRes.json()
                phoneNumbersList = phoneData.data || []
                // Complementar debugWaData con los números obtenidos
                waba.phone_numbers = { data: phoneNumbersList }
              } else {
                const phoneErr = await phoneRes.json()
                console.warn(`⚠️ Error de Graph API consultando números de la WABA ${waba.id}:`, JSON.stringify(phoneErr))
                if (!waba._debugPhoneErrors) waba._debugPhoneErrors = []
                waba._debugPhoneErrors.push(phoneErr)
              }
            } catch (errPhones: any) {
              console.warn(`⚠️ Error de red consultando números de la WABA ${waba.id}:`, errPhones)
              if (!waba._debugPhoneErrors) waba._debugPhoneErrors = []
              waba._debugPhoneErrors.push({ exception: errPhones.message || errPhones })
            }
          }
          
          for (const phone of phoneNumbersList) {
            const phoneId = phone.id
            const phoneDisplay = phone.display_phone_number || phone.verified_name || `${waba.name} (${phoneId})`
            const dbPageId = `wa_${phoneId}`
            
            console.log(`📞 WhatsApp Phone Number detectado: ${phoneDisplay} (ID: ${phoneId})`)
            
            // Borrar cualquier vinculación previa del mismo ID para evitar fallos de RLS UPDATE
            try {
              await supabase
                .from('paginas_vinculadas')
                .delete()
                .eq('page_id', dbPageId)
            } catch (delErrWa) {
              console.warn("⚠️ Error borrando vinculación previa de WhatsApp:", delErrWa)
            }

            // Insertar la vinculación de WhatsApp (usamos platform: 'facebook' debido al check constraint de la BD)
            const { error: dbErrorWa } = await supabase
              .from('paginas_vinculadas')
              .insert({
                guide_email: guideEmail,
                page_id: dbPageId,
                page_name: phoneDisplay,
                page_access_token: accessToken,
                platform: 'facebook'
              })

            if (dbErrorWa) {
              console.error(`❌ Error guardando WhatsApp ${phoneDisplay} en la Base de Datos:`, dbErrorWa.message)
            } else {
              console.log(`✅ WhatsApp "${phoneDisplay}" conectado con éxito.`);
              connectedPages.push({ id: dbPageId, name: phoneDisplay, platform: 'whatsapp' })
            }
          }
        }
      } else {
        const waErr = await waRes.json()
        debugWaData = { error: waErr }
        console.warn(`⚠️ No se pudo consultar WhatsApp Business Accounts:`, JSON.stringify(waErr))
      }
    } catch (errWa: any) {
      debugWaData = { exception: errWa.message || errWa }
      console.warn(`⚠️ Error buscando cuentas de WhatsApp Business vinculadas:`, errWa)
    }


    return NextResponse.json({
      success: true,
      message: `Vinculación completada. Se conectaron ${connectedPages.length} página(s).`,
      pages: connectedPages,
      fbUserName,
      debugWaData
    })

  } catch (e: any) {
    console.error("❌ Error en /api/facebook/connect:", e)
    return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 })
  }
}
