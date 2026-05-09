"use client"

import { useState } from "react"
import { CalendarGrid } from "@/components/calendar/CalendarGrid"
import { DayDetailsPanel, type DayOverride } from "@/components/calendar/DayDetailsPanel"
import { motion, AnimatePresence } from "framer-motion"

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  
  // Estado global para guardar las modificaciones locales
  const [dayOverrides, setDayOverrides] = useState<Record<string, DayOverride>>({})

  const handleOverrideChange = (dateStr: string, override: DayOverride) => {
    setDayOverrides(prev => ({
      ...prev,
      [dateStr]: override
    }))
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[650px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendario de Disponibilidad</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Gestiona las fechas de operación, bloquea días y revisa tus reservas diarias.
        </p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 relative">
        <div className={`transition-all duration-300 ease-in-out h-full ${selectedDate ? 'w-full lg:w-2/3' : 'w-full'}`}>
          <CalendarGrid 
            onSelectDate={setSelectedDate} 
            selectedDate={selectedDate} 
          />
        </div>

        <AnimatePresence>
          {selectedDate && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 0 }}
              className="hidden lg:block lg:w-1/3 h-full overflow-hidden"
            >
              <div className="w-full h-full min-w-[320px]">
                <DayDetailsPanel 
                  date={selectedDate} 
                  onClose={() => setSelectedDate(null)} 
                  override={dayOverrides[selectedDate.toISOString()]}
                  onOverrideChange={(override) => handleOverrideChange(selectedDate.toISOString(), override)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Móvil: Modal/Overlay para detalles del día */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col justify-end"
            >
              <div className="h-[80vh] w-full bg-background rounded-t-[2.5rem] shadow-2xl border-t border-border/50 overflow-hidden">
                <DayDetailsPanel 
                  date={selectedDate} 
                  onClose={() => setSelectedDate(null)}
                  override={dayOverrides[selectedDate.toISOString()]}
                  onOverrideChange={(override) => handleOverrideChange(selectedDate.toISOString(), override)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
