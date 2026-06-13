// src/components/crm/LeadCard.tsx
"use client"

import { MessageCircle, Camera, Phone, User, Calendar, MapPin, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { type Lead } from "@/lib/services/crm"

interface LeadCardProps {
  lead: Lead
  onMoveLead: (id: string, direction: 1 | -1) => void
  onSelectLead: (lead: Lead) => void
}

export function LeadCard({ lead, onMoveLead, onSelectLead }: LeadCardProps) {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = lead.phone.startsWith("+") || lead.phone.match(/^\d+$/)
      ? `https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`
      : "https://web.whatsapp.com/"
    window.open(url, "_blank")
  }

  // Format channel name and icon
  const getChannelBadge = (source: Lead['source']) => {
    switch(source) {
      case 'whatsapp':
        return (
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <MessageCircle className="w-3 h-3" />
            <span>WhatsApp</span>
          </div>
        )
      case 'instagram':
        return (
          <div className="flex items-center gap-1 text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 border border-pink-500/20 px-2 py-0.5 rounded-full">
            <Camera className="w-3 h-3" />
            <span>Instagram</span>
          </div>
        )
      case 'facebook':
        return (
          <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border border-blue-500/20 px-2 py-0.5 rounded-full">
            <span className="text-[10px] font-black leading-none">f</span>
            <span>Messenger</span>
          </div>
        )
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={() => onSelectLead(lead)}
      className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/35 transition-all cursor-pointer group space-y-3.5 relative overflow-hidden"
    >
      {/* Glow effect on hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent blur-md rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-300" />

      {/* Header: Name and Channel */}
      <div className="flex justify-between items-center relative z-10">
        <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{lead.name}</span>
        </h4>
        {getChannelBadge(lead.source)}
      </div>

      {/* Message / Interest */}
      <div className="space-y-1 relative z-10">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Mensaje</p>
        <p className="text-sm text-foreground line-clamp-2 italic leading-relaxed">
          "{lead.interest}"
        </p>
      </div>

      {/* Extracted Details */}
      {(lead.destination || lead.travelDate || lead.peopleCount) && (
        <div className="p-2.5 bg-muted/40 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-border/30 relative z-10">
          <div className="flex items-center gap-1 text-[10px] font-bold text-primary dark:text-emerald-400">
            <Sparkles className="w-3 h-3" />
            <span>DATOS EXTRACTOS</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {lead.destination && (
              <div className="flex items-center gap-1 text-muted-foreground truncate">
                <MapPin className="w-3 h-3 text-primary shrink-0" />
                <span className="text-foreground font-medium truncate">{lead.destination}</span>
              </div>
            )}
            {lead.peopleCount && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-primary font-bold shrink-0">👥</span>
                <span className="text-foreground font-medium">{lead.peopleCount} pax</span>
              </div>
            )}
            {lead.travelDate && (
              <div className="flex items-center gap-1 text-muted-foreground col-span-2 truncate">
                <Calendar className="w-3 h-3 text-primary shrink-0" />
                <span className="text-foreground font-medium truncate">{lead.travelDate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer: Date and Action Buttons */}
      <div className="flex justify-between items-center pt-3 border-t border-border/40 relative z-10">
        <span className="text-[10px] font-mono text-muted-foreground">
          {new Date(lead.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
        </span>
        
        <div className="flex items-center gap-2">
          {/* Move Back Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveLead(lead.id, -1) }}
            className="h-7 w-7 rounded-lg border border-border/60 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background font-bold cursor-pointer"
            title="Mover anterior"
          >
            ←
          </button>
          
          {/* Quick Chat Link */}
          <button 
            onClick={handleWhatsAppClick}
            className="h-7 w-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            title="Responder"
          >
            <Phone className="w-3 h-3" />
          </button>
          
          {/* Move Forward Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveLead(lead.id, 1) }}
            className="h-7 w-7 rounded-lg border border-border/60 hover:border-primary hover:text-primary flex items-center justify-center text-xs transition-colors bg-background font-bold cursor-pointer"
            title="Mover siguiente"
          >
            →
          </button>
        </div>
      </div>
    </motion.div>
  )
}
