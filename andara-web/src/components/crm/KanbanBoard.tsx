// src/components/crm/KanbanBoard.tsx
"use client"

import { useState, useEffect } from "react"
import { getLeads, updateLeadStatus, saveCalendarEvent, type Lead } from "@/lib/services/crm"
import { createClient } from "@/utils/supabase/client"
import { LeadCard } from "./LeadCard"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

const COLUMNS = [
  { id: "new", title: "Nuevo", color: "bg-blue-500", border: "border-blue-500/20", glow: "shadow-blue-500/5" },
  { id: "contacted", title: "Contactado", color: "bg-amber-500", border: "border-amber-500/20", glow: "shadow-amber-500/5" },
  { id: "proposal", title: "Cotización enviada", color: "bg-purple-500", border: "border-purple-500/20", glow: "shadow-purple-500/5" },
  { id: "reserved", title: "Reservado", color: "bg-emerald-500", border: "border-emerald-500/20", glow: "shadow-emerald-500/5" },
  { id: "completed", title: "Finalizado", color: "bg-slate-500", border: "border-slate-500/20", glow: "shadow-slate-500/5" },
] as const

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState<'All' | 'WhatsApp' | 'Instagram' | 'Facebook'>('All')
  const router = useRouter()

  const loadLeads = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const data = await getLeads(user?.email || "")
    setLeads(data)
  }

  useEffect(() => {
    loadLeads()
    window.addEventListener('andara_db_update', loadLeads)
    return () => {
      window.removeEventListener('andara_db_update', loadLeads)
    }
  }, [])

  const handleMoveLead = async (id: string, direction: 1 | -1) => {
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    const currentStatusIndex = COLUMNS.findIndex(c => c.id === lead.status)
    const nextStatusIndex = currentStatusIndex + direction
    if (nextStatusIndex < 0 || nextStatusIndex >= COLUMNS.length) return
    const newStatus = COLUMNS[nextStatusIndex].id

    await updateLeadStatus(id, newStatus)

    if (newStatus === 'reserved') {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      await saveCalendarEvent({
        id: Date.now().toString(),
        leadId: id,
        clientName: lead.name,
        destination: lead.destination || 'Sin destino',
        date: lead.travelDate || new Date().toISOString().split('T')[0],
        peopleCount: lead.peopleCount || 1,
      }, user?.email || '')
    }

    await loadLeads()
    window.dispatchEvent(new Event('andara_db_update'))
  }

  const handleSelectLead = (lead: Lead) => {
    router.push(`/inbox?leadId=${lead.id}`)
  }

  const filteredLeads = filter === 'All'
    ? leads
    : leads.filter(l => l.source.toLowerCase() === filter.toLowerCase())

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden relative">
      <div className="flex justify-end items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filtrar:</span>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm p-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="All">Todos los canales</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Messenger</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 no-scrollbar">
        {COLUMNS.map(column => {
          const columnLeads = filteredLeads.filter(l => l.status === column.id)
          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 flex flex-col glass-panel rounded-3xl border ${column.border} overflow-hidden shadow-lg ${column.glow}`}
            >
              <div className="px-4 py-4 border-b border-border/40 flex justify-between items-center bg-background/30 backdrop-blur-md">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${column.color} mr-2.5 animate-pulse`} />
                  <h3 className="font-bold text-foreground text-sm tracking-wide">{column.title}</h3>
                </div>
                <span className="bg-muted text-muted-foreground text-xs font-bold px-2.5 py-1 rounded-full border border-border/40">
                  {columnLeads.length}
                </span>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-4 bg-slate-50/20 dark:bg-slate-950/20 no-scrollbar">
                <AnimatePresence mode="popLayout">
                  {columnLeads.map(lead => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="origin-center"
                    >
                      <LeadCard
                        lead={lead}
                        onMoveLead={handleMoveLead}
                        onSelectLead={handleSelectLead}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {columnLeads.length === 0 && (
                  <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-2xl p-4 text-center">
                    <p className="text-xs text-muted-foreground font-medium">Sin prospectos</p>
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