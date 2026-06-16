// src/app/calendar/page.tsx
"use client"

import { useState, useEffect } from "react"
import { getCalendarEvents, type CalendarEvent } from "@/lib/services/crm"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Users, Info } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0) // 0 is this week, -1 last week, +1 next week

  const loadEvents = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const evts = await getCalendarEvents(user?.email || "")
    setEvents(evts)
  }

  useEffect(() => {
    loadEvents()
    window.addEventListener('andara_db_update', loadEvents)
    return () => {
      window.removeEventListener('andara_db_update', loadEvents)
    }
  }, [])

  // Calculate actual dates for the selected week offset
  const getWeekDays = () => {
    const today = new Date()
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    
    // Start of week (Monday)
    const currentDay = today.getDay()
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
    
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() + distanceToMonday + (currentWeekOffset * 7))

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      
      const dayName = WEEKDAYS[i]
      const formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      
      return {
        dayName,
        dateString: formattedDate,
        fullDate: date,
        isToday: date.toDateString() === new Date().toDateString()
      }
    })
  }

  const weekDays = getWeekDays()
  
  // Week range header string
  const startRange = weekDays[0].fullDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  const endRange = weekDays[6].fullDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

  // Filter events that fall on a specific day (supporting relative and absolute formats)
  const getEventsForDay = (day: { dayName: string; dateString: string; fullDate: Date; isToday: boolean }) => {
    return events.filter(event => {
      if (!event.date) return false
      const normalized = event.date.toLowerCase().trim()
      const today = new Date()
      
      // 1. Días relativos y nombres de días directos (sólo válidos para la semana actual offset 0)
      if (currentWeekOffset === 0) {
        if (normalized === "hoy") {
          return day.isToday
        }
        if (normalized === "mañana" || normalized === "manana") {
          const tomorrow = new Date(today)
          tomorrow.setDate(today.getDate() + 1)
          return day.fullDate.toDateString() === tomorrow.toDateString()
        }
        if (normalized === "sábado" || normalized === "sabado") {
          return day.dayName === "Sábado"
        }
        if (normalized === "domingo") {
          return day.dayName === "Domingo"
        }
        
        // Coincidencias de prefijo de día de la semana
        if (normalized.includes("lun") && day.dayName === "Lunes") return true
        if (normalized.includes("mar") && day.dayName === "Martes") return true
        if (normalized.includes("mie") && day.dayName === "Miércoles") return true
        if (normalized.includes("jue") && day.dayName === "Jueves") return true
        if (normalized.includes("vie") && day.dayName === "Viernes") return true
        if (normalized.includes("sab") && day.dayName === "Sábado") return true
        if (normalized.includes("dom") && day.dayName === "Domingo") return true
      }

      // 2. Fechas absolutas (ej. "2026-06-13", "13/06/2026", "13/06", "13 de Jun")
      try {
        let parsedDate: Date | null = null
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
          const parts = event.date.split("-")
          parsedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
        } else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(event.date) || /^\d{1,2}\/\d{1,2}$/.test(event.date)) {
          const parts = event.date.split("/")
          const d = parseInt(parts[0], 10)
          const m = parseInt(parts[1], 10) - 1
          const y = parts.length === 3 ? parseInt(parts[2], 10) : today.getFullYear()
          parsedDate = new Date(y, m, d)
        } else {
          // Intentar parsear de forma estándar (ej: "Jun 13, 2026")
          parsedDate = new Date(event.date)
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          return parsedDate.toDateString() === day.fullDate.toDateString()
        }
      } catch (e) {
        // Ignorar errores de parsing
      }

      return false
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px] gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
            Calendario Operativo Semanal
          </h1>
          <p className="text-muted-foreground mt-1">
            Revisa la programación de tours confirmada a través de tus reservas en el CRM.
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-1 shadow-sm select-none">
          <button 
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
            className="p-2 hover:bg-muted dark:hover:bg-slate-800 rounded-xl transition text-foreground cursor-pointer"
            title="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 text-sm font-bold text-foreground font-mono">
            {startRange} - {endRange}
          </span>
          <button 
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className="p-2 hover:bg-muted dark:hover:bg-slate-800 rounded-xl transition text-foreground cursor-pointer"
            title="Semana siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2.5 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Regla operativa:</strong> El calendario se alimenta automáticamente desde el CRM. Cuando pasas un lead a la columna <strong>Reservado</strong>, el tour se programará aquí automáticamente.
        </p>
      </div>

      {/* Weekly columns board */}
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 no-scrollbar">
        {weekDays.map(day => {
          const dayEvents = getEventsForDay(day)
          return (
            <div 
              key={day.dayName} 
              className={`flex-shrink-0 w-72 flex flex-col rounded-3xl border transition-all ${
                day.isToday 
                  ? "bg-primary/5 border-primary/40 shadow-md shadow-primary/5 dark:bg-primary/10" 
                  : "glass-panel border-border/50 shadow-sm"
              }`}
            >
              {/* Day title */}
              <div className={`px-4 py-4 border-b border-border/30 flex justify-between items-center rounded-t-3xl ${
                day.isToday ? "bg-primary/10 dark:bg-primary/20" : "bg-background/25"
              }`}>
                <div>
                  <h3 className="font-bold text-foreground text-sm leading-none">{day.dayName}</h3>
                  <span className="text-[10px] text-muted-foreground font-mono mt-1 block">{day.dateString}</span>
                </div>
                {day.isToday && (
                  <span className="text-[9px] font-black uppercase text-primary bg-primary-foreground px-2 py-0.5 rounded-md border border-primary/20">
                    Hoy
                  </span>
                )}
              </div>

              {/* Day events list */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/10 dark:bg-slate-950/10 no-scrollbar">
                <AnimatePresence>
                  {dayEvents.length > 0 ? (
                    dayEvents.map(event => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5 relative group overflow-hidden"
                      >
                        {/* Decorative bar */}
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-l-2xl" />

                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-emerald-400 block mb-1">
                            Reserva Confirmada
                          </span>
                          <h4 className="font-bold text-sm text-foreground leading-snug truncate">
                            {event.destination}
                          </h4>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-foreground">
                            <span className="text-muted-foreground">Cliente:</span>
                            <span className="font-semibold">{event.clientName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-foreground">
                            <span className="text-muted-foreground">Grupo:</span>
                            <span className="font-bold">{event.peopleCount} personas</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-border/30 rounded-2xl text-center p-4">
                      <p className="text-[11px] text-muted-foreground font-medium">Sin tours programados</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
