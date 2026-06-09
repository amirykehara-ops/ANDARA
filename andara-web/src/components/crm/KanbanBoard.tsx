"use client"

import { useState, useEffect } from "react"
import { addLead, getLeads, updateLeadStatus, exportLeadsCSV } from "@/utils/mockLeads"
import { LeadCard, type Lead } from "./LeadCard"
import { motion, AnimatePresence } from "framer-motion"

const COLUMNS = [
  { id: "new", title: "Nuevos", color: "bg-blue-500" },
  { id: "contacted", title: "Contactados", color: "bg-amber-500" },
  { id: "negotiating", title: "Negociando", color: "bg-purple-500" },
  { id: "won", title: "Cerrados", color: "bg-emerald-500" },
] as const

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState<'All' | 'WhatsApp' | 'Instagram' | 'Facebook'>('All')

  // 1. Cargar leads iniciales guardados en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = getLeads()
      setLeads(stored as Lead[])
    }
  }, [])

  // 🚨 2. LECTOR ULTRA-REACTIVO MEJORADO: Genera IDs únicos para forzar el renderizado en pantalla
  useEffect(() => {
    console.log("🔌 [KANBAN] Buscando actualizaciones del servidor cada 2s...");

    const revisarWebhooksEnVivo = async () => {
      try {
        const res = await fetch(`/api/webhook?t=${Date.now()}`)
        const nuevosMensajesAPI = await res.json()

        if (Array.isArray(nuevosMensajesAPI) && nuevosMensajesAPI.length > 0) {

          setLeads((currentLeads) => {
            let copiaLeads = [...currentLeads]
            let huboCambios = false

            nuevosMensajesAPI.forEach((msg: any) => {
              if (!msg) return;

              let nombreFinal = msg.name || "Cliente Nuevo"
              let telefonoFinal = msg.phone || ""
              let textoFinal = msg.text || ""
              let fuenteFinal: Lead["source"] = "whatsapp"

              // Extracción desde la estructura real de Meta enviada en tu curl
              if (msg.entry?.[0]?.changes?.[0]?.value) {
                const value = msg.entry[0].changes[0].value
                const messageObj = value.messages?.[0]
                const contactObj = value.contacts?.[0]

                telefonoFinal = messageObj?.from || contactObj?.wa_id || telefonoFinal
                nombreFinal = contactObj?.profile?.name || nombreFinal
                textoFinal = messageObj?.text?.body || textoFinal
              } else {
                telefonoFinal = msg.phone || ""
                nombreFinal = msg.name || "Cliente Nuevo"
                textoFinal = msg.text || ""
                if (msg.name?.toLowerCase().includes("messenger")) fuenteFinal = "facebook"
                if (msg.name?.toLowerCase().includes("ig") || msg.name?.toLowerCase().includes("instagram")) fuenteFinal = "instagram"
              }

              if (!telefonoFinal) return;
              const telefonoLimpio = telefonoFinal.startsWith("+") ? telefonoFinal : `+${telefonoFinal}`;

              // Para evitar bucles infinitos visuales, validamos si este texto exacto YA está en el estado local actual
              const yaExisteEnPantalla = copiaLeads.some(
                l => l.interest === textoFinal && ((l as any).phone === telefonoLimpio)
              )

              if (!yaExisteEnPantalla) {
                // 🔥 SOLUCIÓN CLAVE: Forzamos un ID totalmente dinámico combinando random + timestamp
                // Esto rompe el bloqueo de duplicados de React provocado por el ID fijo del curl
                const idUnicoFormateado = `webhook-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

                const nuevoLeadHibrido: any = {
                  id: idUnicoFormateado,
                  name: nombreFinal,
                  source: fuenteFinal,
                  phone: telefonoLimpio,
                  contact: telefonoLimpio,
                  interest: textoFinal || "Consulta vía Webhook",
                  status: "new",
                  date: "Hoy"
                }

                try {
                  addLead(nuevoLeadHibrido as any)
                } catch (storageErr) {
                  console.warn("Nota de almacenamiento local:", storageErr)
                }

                console.log("✨ [FRONTEND REDRAW] Tarjeta inyectada al flujo visual:", nuevoLeadHibrido.interest)
                copiaLeads = [nuevoLeadHibrido as Lead, ...copiaLeads]
                huboCambios = true
              }
            })

            return huboCambios ? copiaLeads : currentLeads
          })
        }
      } catch (err) {
        console.error("❌ [KANBAN] Error crítico haciendo GET a /api/webhook:", err)
      }
    }

    const interval = setInterval(revisarWebhooksEnVivo, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleAddSpecificLead = async (e: React.MouseEvent<HTMLButtonElement>, chosenSource: Lead["source"]) => {
    e.preventDefault()
    e.stopPropagation()

    const names = ["Pedro", "Luisa", "Miguel", "Sofia", "Carlos"]
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomPhone = `51${Math.floor(900000000 + Math.random() * 100000000)}`

    const payloadMockUtils: any = {
      name: randomName,
      source: chosenSource,
      contact: chosenSource === "whatsapp" ? `+${randomPhone}` : `@${randomName.toLowerCase()}`,
      phone: chosenSource === "whatsapp" ? `+${randomPhone}` : `@${randomName.toLowerCase()}`,
      interest: chosenSource === "whatsapp" ? "Tour VIP Huacachina" : `Consulta desde ${chosenSource}`,
      status: "new",
      date: "Hoy",
    }

    const newLead = addLead(payloadMockUtils)
    const newLeadVisual = { ...newLead, phone: payloadMockUtils.phone, contact: payloadMockUtils.contact } as Lead
    setLeads(prev => [...prev, newLeadVisual])

    let mockMetaPayload = {}
    if (chosenSource === "whatsapp") {
      mockMetaPayload = {
        "field": "messages",
        "value": {
          "messaging_product": "whatsapp",
          "metadata": { "display_phone_number": "16505551111", "phone_number_id": "123456123" },
          "contacts": [{ "profile": { "name": randomName }, "wa_id": randomPhone }],
          "messages": [{
            "id": `ABGGFlA${Date.now()}`,
            "timestamp": Math.floor(Date.now() / 1000).toString(),
            "from": randomPhone,
            "type": "text",
            "text": { "body": "Hola, estoy interesado en separar una cita para el Tour VIP." }
          }]
        }
      }
    }

    try {
      await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockMetaPayload)
      })
    } catch (err) {
      console.error("❌ Error fetch:", err)
    }
  }

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

  const filteredLeads = filter === 'All' ? leads : leads.filter(l => l.source.toLowerCase() === filter.toLowerCase())

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center justify-between space-x-4 mb-2">
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
                <AnimatePresence mode="popLayout">
                  {columnLeads.map(lead => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="origin-center"
                    >
                      <LeadCard lead={lead} onMoveLead={handleMoveLead} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {columnLeads.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-24 flex items-center justify-center border-2 border-dashed border-border/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">Sin prospectos</p>
                  </motion.div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}