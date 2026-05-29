"use client"

import { MessageCircle, Camera, Phone, MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"

export type Lead = {
  id: string
  name: string
  source: "whatsapp" | "instagram" | "facebook"
  interest?: string
  status?: "new" | "contacted" | "negotiating" | "won" | "lost"
  phone?: string
  date?: string
}

interface LeadCardProps {
  lead: Lead
  onMoveLead: (id: string, direction: 1 | -1) => void
}

export function LeadCard({ lead, onMoveLead }: LeadCardProps) {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Si hay teléfono lo formatea, sino abre wa.me genérico
    const url = lead.phone 
      ? `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`
      : "https://web.whatsapp.com/"
    window.open(url, "_blank")
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="bg-white dark:bg-slate-900 border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          {lead.source === "whatsapp" ? (
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
              <MessageCircle className="w-4 h-4" />
            </div>
          ) : lead.source === "instagram" ? (
            <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full">
              <Camera className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">F</span>
            </div>
          )}
          <span className="font-semibold text-foreground text-sm">{lead.name}</span>
        </div>
        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Interés</p>
        <p className="text-sm text-foreground truncate">{lead.interest}</p>
      </div>

      <div className="flex justify-between items-center mt-auto border-t border-border/50 pt-3">
        <span className="text-xs text-muted-foreground">{lead.date}</span>
        
        <div className="flex space-x-2">
          {/* Botones invisibles de acción rápida para mover el lead en desarrollo */}
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveLead(lead.id, -1) }}
            className="text-xs text-muted-foreground hover:text-primary px-1"
            title="Mover atrás"
          >
            ←
          </button>
          
          <button 
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-1.5 shadow-sm transition-colors"
            title="Abrir WhatsApp"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveLead(lead.id, 1) }}
            className="text-xs text-muted-foreground hover:text-primary px-1"
            title="Mover adelante"
          >
            →
          </button>
        </div>
      </div>
    </motion.div>
  )
}
