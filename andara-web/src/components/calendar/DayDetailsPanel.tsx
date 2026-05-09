"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"
import { X, Users, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type DayOverride = {
  isBlocked?: boolean
  customTotalSlots?: number
}

interface DayDetailsPanelProps {
  date: Date | null
  onClose: () => void
  override?: DayOverride
  onOverrideChange?: (override: DayOverride) => void
}

export function DayDetailsPanel({ date, onClose, override, onOverrideChange }: DayDetailsPanelProps) {
  if (!date) return null

  // Mocks dinámicos
  const seed = date.getDate()
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  
  // Capacidad base y overrides
  const baseTotalSlots = isWeekend ? 30 : 15
  const totalSlots = override?.customTotalSlots ?? baseTotalSlots
  
  const pseudoRandom = (seed * 13) % (baseTotalSlots + 5)
  // Las reservas actuales simuladas
  const bookedSlots = override?.isBlocked ? 0 : Math.min(pseudoRandom, totalSlots)
  
  const isBlocked = override?.isBlocked ?? false
  const status = isBlocked ? "bloqueado" : (bookedSlots >= totalSlots ? "agotado" : "abierto")

  const mockBookings = (bookedSlots > 0 && !isBlocked) ? [
    { id: `B-${seed}01`, name: "Familia Gómez", pax: Math.max(1, Math.floor(bookedSlots / 2)), tour: "Huacachina VIP" },
    { id: `B-${seed}02`, name: "Sarah Connor", pax: Math.ceil(bookedSlots / 2), tour: "Líneas de Nazca" },
  ] : []

  const toggleBlock = () => {
    if (onOverrideChange) {
      onOverrideChange({ ...override, isBlocked: !isBlocked })
    }
  }

  const adjustSlots = () => {
    const newSlotsStr = window.prompt("Ingresa la nueva capacidad de cupos para este día:", totalSlots.toString())
    if (newSlotsStr !== null && !isNaN(parseInt(newSlotsStr))) {
      if (onOverrideChange) {
        onOverrideChange({ ...override, customTotalSlots: parseInt(newSlotsStr) })
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="h-full glass-panel border border-border/50 rounded-3xl p-5 shadow-xl flex flex-col overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
            Detalles del Día
          </h3>
          <h2 className="text-xl font-bold text-foreground capitalize">
            {format(date, "EEEE, d 'de' MMMM", { locale: es })}
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full -mr-2 h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
        <div className="bg-background/50 border border-border/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Estado</p>
          <Badge variant={status === "abierto" ? "success" : (status === "bloqueado" ? "secondary" : "destructive")}>
            {status === "abierto" ? "Abierto" : (status === "bloqueado" ? "Bloqueado" : "Agotado")}
          </Badge>
        </div>
        <div className="bg-background/50 border border-border/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">Ocupación</p>
          <p className="text-lg font-bold text-foreground">
            {isBlocked ? "-" : bookedSlots} <span className="text-xs text-muted-foreground font-normal">/ {totalSlots}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[120px]">
        <h4 className="font-semibold text-foreground mb-2 flex items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-1">
          <Clock className="w-4 h-4 mr-2 text-primary" /> Reservas Confirmadas
        </h4>
        
        {isBlocked ? (
          <div className="text-center py-6 bg-muted/20 rounded-xl border border-dashed border-border/50">
            <p className="text-sm text-muted-foreground">Este día ha sido bloqueado.</p>
          </div>
        ) : mockBookings.length > 0 ? (
          <div className="space-y-2">
            {mockBookings.map((booking) => (
              <div key={booking.id} className="bg-background hover:bg-muted/50 transition-colors border border-border/80 rounded-xl p-3 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-foreground text-sm">{booking.name}</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{booking.id}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Badge variant="outline" className="mr-2 border-primary/20 text-primary bg-primary/5 text-[10px] px-1">{booking.tour}</Badge>
                  <span className="flex items-center ml-auto font-medium text-foreground">
                    <Users className="w-3 h-3 mr-1 text-primary" /> {booking.pax} pax
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-muted/20 rounded-xl border border-dashed border-border/50">
            <p className="text-sm text-muted-foreground">Día libre. No hay reservas.</p>
          </div>
        )}
      </div>

      <div className="pt-4 mt-2 border-t border-border/50 shrink-0">
        <Button 
          variant={isBlocked ? "outline" : "default"}
          className="w-full mb-2 h-10" 
          onClick={toggleBlock}
        >
          <CheckCircle className="w-4 h-4 mr-2" /> {isBlocked ? "Desbloquear Día" : "Bloquear Disponibilidad"}
        </Button>
        <Button 
          variant="outline" 
          className="w-full h-10"
          onClick={adjustSlots}
          disabled={isBlocked}
        >
          Ajustar Cupos
        </Button>
      </div>
    </motion.div>
  )
}
