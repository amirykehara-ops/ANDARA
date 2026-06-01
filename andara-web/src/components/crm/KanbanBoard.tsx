"use client"

import { useState, useEffect } from "react"
import { addLead, getLeads, updateLeadStatus, exportLeadsCSV } from "@/utils/mockLeads"
import { LeadCard, type Lead } from "./LeadCard"
import { motion, AnimatePresence } from "framer-motion"

// Column definitions for the CRM Kanban board
const COLUMNS = [
  { id: "new", title: "Nuevos", color: "bg-blue-500" },
  { id: "contacted", title: "Contactados", color: "bg-amber-500" },
  { id: "negotiating", title: "Negociando", color: "bg-purple-500" },
  { id: "won", title: "Cerrados", color: "bg-emerald-500" },
] as const

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState<'All' | 'WhatsApp' | 'Instagram' | 'Facebook'>('All')

  // Load persisted leads from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = getLeads()
      setLeads(stored)
    }
  }, [])

  // Helper principal para simular la inyección del Lead por canal específico
  const handleAddSpecificLead = async (e: React.MouseEvent<HTMLButtonElement>, chosenSource: Lead["source"]) => {
    // Evitamos cualquier comportamiento extraño de recarga de la UI
    e.preventDefault()
    e.stopPropagation()

    console.log(`🔥 [BOTÓN] ¡Clic detectado con éxito para simular ${chosenSource}!`);

    const names = ["Pedro", "Luisa", "Miguel", "Sofia", "Carlos"]
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomPhone = `51${Math.floor(900000000 + Math.random() * 100000000)}`
    
    // 1. Insertar en el estado local visual respetando tus reglas de negocio
    const newLead = addLead({
      name: randomName,
      source: chosenSource,
      contact: chosenSource === "whatsapp" ? `+${randomPhone}` : `@${randomName.toLowerCase()}`,
      interest: "Tour VIP Huacachina",
      status: "new",
      date: "Hoy",
    })
    setLeads(prev => [...prev, newLead])

    // 2. CONSTRUIR EL JSON IDÉNTICO QUE META ENVÍA A TU BACKEND SEGÚN EL CANAL
    let mockMetaPayload = {}

    if (chosenSource === "whatsapp") {
      mockMetaPayload = {
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "16505551111",
            "phone_number_id": "123456123"
          },
          "contacts": [
            {
              "profile": { "name": randomName },
              "wa_id": randomPhone,
              "user_id": "US.13491208655302741918"
            }
          ],
          "messages": [
            {
              "id": `ABGGFlA${Date.now()}`,
              "timestamp": Math.floor(Date.now() / 1000).toString(),
              "from": randomPhone,
              "from_user_id": "US.13491208655302741918",
              "type": "text",
              "text": { "body": "Hola, estoy interesado en separar una cita para el Tour VIP." }
            }
          ]
        }
      }
   } else if (chosenSource === "facebook") {
      // Estructura idéntica al botón "Probar" del panel de Meta con el truco del nombre
      mockMetaPayload = {
        "_mockName": `${randomName} Messenger`, // Para asegurar compatibilidad externa
        "sample": {
          "_mockName": `${randomName} Messenger`, // Inyectado dentro del sample
          "field": "messages",
          "value": {
            "sender": { 
              "id": randomPhone 
            },
            "recipient": { 
              "id": "123456789" 
            },
            "timestamp": Math.floor(Date.now() / 1000).toString(),
            "message": {
              "mid": `mid.messenger.test.${Date.now()}`,
              "text": "Buenas, vi la página de Facebook. ¿Tienen disponibilidad del Tour para este fin de semana?"
            }
          }
        }
      }
    
    } else if (chosenSource === "instagram") {
      // Formato unificado a través de la API Graph (Facebook Login para Instagram)
      mockMetaPayload = {
        "object": "instagram",
        "entry": [{
          "id": "INSTAGRAM_BUSINESS_ACCOUNT_ID",
          "time": Math.floor(Date.now() / 1000),
          "messaging": [{
            "sender": { 
              "id": randomPhone 
            },
            "recipient": { 
              "id": "23245" 
            },
            "timestamp": Math.floor(Date.now() / 1000),
            "message": {
              "mid": `mid.instagram.test.${Date.now()}`,
              "text": "Hola, te vi en Instagram Reels y quiero cotizar el paquete completo a Huacachina porfa!"
            }
          }]
        }]
      }
    }

    // 3. Petición directa al endpoint relativo
    try {
      console.log(`🚀 [CLIENTE] Despachando JSON de ${chosenSource} hacia /api/webhook...`);
      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mockMetaPayload)
      })
      console.log(`📡 [CLIENTE] Webhook respondió con estatus: ${response.status}`);
    } catch (err) {
      console.error("❌ [CLIENTE] Error al enviar la petición fetch:", err)
    }
  }

  // Move lead between columns and persist the change
  const handleMoveLead = (id: string, direction: 1 | -1) => {
    setLeads(currentLeads => {
      const leadIndex = currentLeads.findIndex(l => l.id === id)
      if (leadIndex === -1) return currentLeads
      const lead = currentLeads[leadIndex]
      const currentStatusIndex = COLUMNS.findIndex(c => c.id === lead.status)
      const nextStatusIndex = currentStatusIndex + direction
      if (nextStatusIndex < 0 || nextStatusIndex >= COLUMNS.length) return currentLeads
      const newStatus = COLUMNS[nextStatusIndex].id as Lead['status']
      updateLeadStatus(id, newStatus)
      const newLeads = [...currentLeads]
      newLeads[leadIndex] = { ...lead, status: newStatus }
      return newLeads
    })
  }

  // Export leads as CSV file
  const handleExportCSV = () => {
    const csv = exportLeadsCSV()
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "leads.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Apply filter before rendering columns
  const filteredLeads = filter === 'All' ? leads : leads.filter(l => l.source.toLowerCase() === filter.toLowerCase())

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between space-x-4 mb-2">
        {/* BOTONERA MULTICANAL INTEGRADA */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={(e) => handleAddSpecificLead(e, "whatsapp")}
            className="px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 transition shadow-sm cursor-pointer z-50 flex items-center gap-1"
          >
            <span>🟢</span> WhatsApp
          </button>

          <button
            type="button"
            onClick={(e) => handleAddSpecificLead(e, "facebook")}
            className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 transition shadow-sm cursor-pointer z-50 flex items-center gap-1"
          >
            <span>🔵</span> Messenger
          </button>

          <button
            type="button"
            onClick={(e) => handleAddSpecificLead(e, "instagram")}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-lg hover:from-purple-500 hover:to-pink-500 transition shadow-sm cursor-pointer z-50 flex items-center gap-1"
          >
            <span>📸</span> Instagram
          </button>
          
          <span className="text-slate-400 dark:text-slate-600 mx-1">|</span>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-600 text-white text-xs font-medium rounded-lg hover:bg-slate-500 transition shadow-sm"
          >
            Exportar CSV
          </button>
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm p-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="All">Todas las fuentes</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Instagram">Instagram</option>
          <option value="Facebook">Facebook</option>
        </select>
      </div>

      <div className="flex flex-1 gap-6 overflow-x-auto pb-4 no-scrollbar">
        {COLUMNS.map(column => {
          const columnLeads = filteredLeads.filter(l => l.status === column.id)
          return (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col glass-panel rounded-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center bg-background/30 backdrop-blur-sm">
                <div className="flex items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${column.color} mr-2`} />
                  <h3 className="font-semibold text-foreground">{column.title}</h3>
                </div>
                <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full">
                  {columnLeads.length}
                </span>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20 no-scrollbar">
                <AnimatePresence>
                  {columnLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onMoveLead={handleMoveLead} />
                  ))}
                </AnimatePresence>
                {columnLeads.length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">Sin prospectos</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}