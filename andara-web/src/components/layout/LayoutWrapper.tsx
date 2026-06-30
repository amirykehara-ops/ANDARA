"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { useEffect } from "react"
import { processIncomingMessageDirect } from "@/lib/services/crm"
import { createClient } from "@/utils/supabase/client"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Poller global para capturar webhooks de Meta en tiempo real
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let active = true;
    let timerId: NodeJS.Timeout;

    const pollWebhooks = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) return;

        const res = await fetch(`/api/webhook?guide_email=${encodeURIComponent(user.email)}&t=${Date.now()}`)
        if (!res.ok) return;

        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) return;

        let updatedCrm = false;

        // Procesar del más antiguo al más reciente
        for (let i = data.length - 1; i >= 0; i--) {
          const msg = data[i]
          if (!msg?.phone || !msg?.text) continue;

          // Decodificar el canal desde el prefijo del campo phone
          let source: 'whatsapp' | 'instagram' | 'facebook' = 'whatsapp'
          let phone = msg.phone.trim()

          if (phone.startsWith('instagram:')) {
            source = 'instagram'
            phone = phone.replace('instagram:', '')
          } else if (phone.startsWith('facebook:')) {
            source = 'facebook'
            phone = phone.replace('facebook:', '')
          } else if (phone.startsWith('whatsapp:')) {
            source = 'whatsapp'
            phone = phone.replace('whatsapp:', '')
          } else {
            // Fallback legado: intentar detectar por nombre
            const lowerName = (msg.name || '').toLowerCase()
            if (lowerName.includes('ig') || lowerName.includes('instagram')) source = 'instagram'
            else if (lowerName.includes('fb') || lowerName.includes('messenger') || lowerName.includes('facebook')) source = 'facebook'
          }

          // processIncomingMessageDirect tiene deduplicación interna a nivel de DB.
          // Si el mensaje ya fue procesado, simplemente lo ignorará sin crear duplicados.
          await processIncomingMessageDirect(
            msg.name || (source === 'instagram' ? 'Usuario IG' : source === 'facebook' ? 'Usuario FB' : 'Cliente WA'),
            source,
            phone,
            msg.text,
            user.email
          )

          // Eliminar el mensaje de mensajes_entrantes una vez procesado
          if (msg.id) {
            try {
              await fetch(`/api/webhook?id=${encodeURIComponent(msg.id)}`, { method: 'DELETE' })
            } catch (delErr) {
              console.warn("Error eliminando mensaje webhook procesado:", delErr)
            }
          }

          updatedCrm = true;
        }

        if (updatedCrm) {
          window.dispatchEvent(new Event('andara_db_update'))
        }
      } catch (e) {
        console.error("❌ Error en poller de webhooks:", e)
      } finally {
        if (active) {
          timerId = setTimeout(pollWebhooks, 3000)
        }
      }
    }

    pollWebhooks()

    return () => {
      active = false;
      clearTimeout(timerId);
    }
  }, [])

  // Rutas públicas sin sidebar/header
  const isPublicPath = pathname === "/" || pathname === "/login" || pathname === "/register"

  if (isPublicPath) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 z-0 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
