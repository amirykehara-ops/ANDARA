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

  // Helper to add a random lead (simulating incoming leads from socials)
  const handleAddRandomLead = () => {
    const sources: Lead["source"][] = ["whatsapp", "instagram", "facebook"]
    const randomSource = sources[Math.floor(Math.random() * sources.length)]
    const randomName = ["Pedro", "Luisa", "Miguel", "Sofia", "Carlos"][Math.floor(Math.random() * 5)]
    const newLead = addLead({
      name: randomName,
      source: randomSource,
      contact: randomSource === "whatsapp" ? `+51${Math.floor(900000000 + Math.random() * 100000000)}` : `@${randomName.toLowerCase()}`,
      interest: "Tour Generico",
      status: "new",
      date: "Hoy",
    })
    setLeads(prev => [...prev, newLead])
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
        <div className="flex space-x-2">
          <button
            onClick={handleAddRandomLead}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition shadow-sm"
          >
            Simular Lead Entrante
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition shadow-sm"
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
