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

    const pollWebhooks = async () => {
      try {
        const res = await fetch(`/api/webhook?t=${Date.now()}`)
        if (!res.ok) return;
        const data = await res.json()
        
        if (Array.isArray(data) && data.length > 0) {
          const processedSigs: string[] = JSON.parse(localStorage.getItem('andara_processed_sigs') || '[]')
          const newSigs = [...processedSigs]
          let updated = false

          // Procesar desde el más antiguo al más reciente
          for (let i = data.length - 1; i >= 0; i--) {
            const msg = data[i]
            if (!msg || !msg.phone || !msg.text) continue;
            
            const sig = `${msg.name}_${msg.phone}_${msg.text}`.trim()
            
            if (!processedSigs.includes(sig)) {
              let source: 'whatsapp' | 'instagram' | 'facebook' = 'whatsapp'
              const lowerName = (msg.name || '').toLowerCase()
              const lowerText = (msg.text || '').toLowerCase()
              
              if (lowerName.includes('messenger') || lowerName.includes('fb') || lowerText.includes('messenger') || lowerText.includes('facebook')) {
                source = 'facebook'
              } else if (lowerName.includes('ig') || lowerName.includes('instagram') || lowerText.includes('instagram') || lowerText.includes('ig')) {
                source = 'instagram'
              }
              
              const phone = msg.phone.trim()
              const supabase = createClient()
              const { data: { user } } = await supabase.auth.getUser()
              await processIncomingMessageDirect(msg.name || "Cliente Nuevo", source, phone, msg.text, user?.email || "")
              newSigs.push(sig)
              updated = true
            }
          }

          if (updated) {
            localStorage.setItem('andara_processed_sigs', JSON.stringify(newSigs))
          }
        }
      } catch (e) {
        console.error("❌ Error polling webhooks globalmente:", e)
      }
    }

    const interval = setInterval(pollWebhooks, 2000)
    pollWebhooks()
    return () => clearInterval(interval)
  }, [])
  
  // Rutas públicas que no deben llevar la barra lateral de administración ni el header
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

