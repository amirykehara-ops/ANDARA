"use client"

import { useState } from "react"
import { LeadCard, type Lead } from "./LeadCard"
import { motion, AnimatePresence } from "framer-motion"

const initialLeads: Lead[] = [
  { id: "1", name: "Carlos Mendoza", source: "whatsapp", interest: "Tour Huacachina (2 pax)", status: "new", phone: "+51999999999", date: "Hoy, 10:30 AM" },
  { id: "2", name: "Ana Silva", source: "instagram", interest: "Líneas de Nazca", status: "new", date: "Hoy, 09:15 AM" },
  { id: "3", name: "Familia Gómez", source: "whatsapp", interest: "Islas Ballestas", status: "contacted", phone: "+51988888888", date: "Ayer" },
  { id: "4", name: "John Doe", source: "whatsapp", interest: "Tour Huacachina VIP", status: "negotiating", phone: "+15551234567", date: "Ayer" },
]

const COLUMNS = [
  { id: "new", title: "Nuevos", color: "bg-blue-500" },
  { id: "contacted", title: "Contactados", color: "bg-amber-500" },
  { id: "negotiating", title: "Negociando", color: "bg-purple-500" },
  { id: "won", title: "Cerrados", color: "bg-emerald-500" },
] as const

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

  const handleMoveLead = (id: string, direction: 1 | -1) => {
    setLeads(currentLeads => {
      const leadIndex = currentLeads.findIndex(l => l.id === id)
      if (leadIndex === -1) return currentLeads

      const lead = currentLeads[leadIndex]
      const currentStatusIndex = COLUMNS.findIndex(c => c.id === lead.status)
      const nextStatusIndex = currentStatusIndex + direction

      // Prevenir salir de los límites
      if (nextStatusIndex < 0 || nextStatusIndex >= COLUMNS.length) return currentLeads

      const newLeads = [...currentLeads]
      newLeads[leadIndex] = { ...lead, status: COLUMNS[nextStatusIndex].id }
      return newLeads
    })
  }

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4 no-scrollbar">
      {COLUMNS.map(column => {
        const columnLeads = leads.filter(l => l.status === column.id)
        
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
            
            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
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
  )
}
