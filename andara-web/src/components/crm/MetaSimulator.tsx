// src/components/crm/MetaSimulator.tsx
"use client"

import { useState } from "react"
import { MessageCircle, Camera, Play, Send, CheckCircle2 } from "lucide-react"

const MOCK_NAMES = ["Juan Pérez", "María López", "Carlos Ruiz", "Ana Silva", "Sofia Torres", "Miguel Mendoza", "Gabriela Soto", "Luis Rojas"];

const MOCK_MESSAGES = [
  "Somos 4 para Huacachina el sábado",
  "Quiero tour a Paracas mañana",
  "Hola quiero información para Huacachina.",
  "Somos dos personas para Paracas.",
  "Quiero reservar para este sábado.",
  "Quiero tour a Nazca el domingo para 3 personas",
  "Hola, tienen disponibilidad para Cusco mañana?",
  "Hola! Escribo para averiguar del City Tour en Lima para el lunes"
];

export function MetaSimulator() {
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  const simulateWebhook = async (channel: 'whatsapp' | 'instagram' | 'facebook') => {
    setLoading(true)
    setStatusMessage("")

    const randomName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]
    const randomMessage = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)]
    const randomId = Math.floor(900000000 + Math.random() * 100000000).toString()

    let payload: any = {}

    if (channel === 'whatsapp') {
      // WhatsApp Meta payload format
      payload = {
        object: "whatsapp_business_account",
        entry: [{
          id: "waba_id_12345",
          changes: [{
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "51999999999",
                phone_number_id: "123456789"
              },
              contacts: [{
                profile: {
                  name: randomName
                },
                wa_id: `51${randomId}`
              }],
              messages: [{
                from: `51${randomId}`,
                id: `wamid.HBGGFlA_${Date.now()}`,
                timestamp: Math.floor(Date.now() / 1000).toString(),
                text: {
                  body: randomMessage
                },
                type: "text"
              }]
            },
            field: "messages"
          }]
        }]
      }
    } else if (channel === 'instagram') {
      // Instagram Meta messaging format
      payload = {
        object: "instagram",
        entry: [{
          id: "ig_page_id_123",
          time: Date.now(),
          messaging: [{
            sender: { id: `ig_user_${randomId}` },
            recipient: { id: "ig_page_id_123" },
            timestamp: Date.now(),
            message: {
              mid: `mid.ig_message_${Date.now()}`,
              text: randomMessage
            }
          }]
        }],
        _mockName: randomName
      }
    } else {
      // Facebook Messenger Meta format
      payload = {
        object: "page",
        entry: [{
          id: "fb_page_id_123",
          time: Date.now(),
          messaging: [{
            sender: { id: `fb_user_${randomId}` },
            recipient: { id: "fb_page_id_123" },
            timestamp: Date.now(),
            message: {
              mid: `mid.fb_message_${Date.now()}`,
              text: randomMessage
            }
          }]
        }],
        _mockName: randomName
      }
    }

    try {
      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setStatusMessage(`✅ ${randomName} simulado (${channel})`)
        setTimeout(() => setStatusMessage(""), 3000)
      } else {
        setStatusMessage("❌ Error en simulador")
      }
    } catch (err) {
      console.error(err)
      setStatusMessage("❌ Error de red")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel border border-white/30 dark:border-slate-800/60 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary border border-primary/20 shrink-0">
          <Play className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-foreground">Simulador de Leads Meta</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Envía payloads reales de simulación al webhook.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <button
          onClick={() => simulateWebhook('whatsapp')}
          disabled={loading}
          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Simular WhatsApp</span>
        </button>
        <button
          onClick={() => simulateWebhook('instagram')}
          disabled={loading}
          className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Simular Instagram</span>
        </button>
        <button
          onClick={() => simulateWebhook('facebook')}
          disabled={loading}
          className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className="text-xs font-black">f</span>
          <span>Simular Messenger</span>
        </button>
      </div>

      {statusMessage && (
        <div className="absolute top-2 right-4 bg-background border border-border/80 text-xs px-3 py-1.5 rounded-full shadow-md z-50 animate-bounce flex items-center gap-1">
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  )
}
