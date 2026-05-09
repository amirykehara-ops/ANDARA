"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarGridProps {
  onSelectDate: (date: Date) => void
  selectedDate: Date | null
}

export function CalendarGrid({ onSelectDate, selectedDate }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [direction, setDirection] = useState(0)

  const nextMonth = () => {
    setDirection(1)
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setDirection(-1)
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  const renderDays = () => {
    const days = []
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }) // Lunes como primer día

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-muted-foreground text-sm py-2 uppercase">
          {format(addDays(startDate, i), "EEE", { locale: es })}
        </div>
      )
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d")
        const cloneDay = day
        const isSelected = selectedDate && isSameDay(day, selectedDate)
        const isCurrentMonth = isSameMonth(day, monthStart)

        // Simular datos de tours (puntos verdes/naranjas)
        const hasTours = isCurrentMonth && parseInt(formattedDate) % 3 === 0
        const hasLowAvailability = isCurrentMonth && parseInt(formattedDate) % 7 === 0

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "p-2 min-h-[100px] border border-border/50 relative cursor-pointer transition-all duration-200",
              !isCurrentMonth ? "bg-muted/20 text-muted-foreground/50" : "bg-background/40 hover:bg-muted/50 text-foreground",
              isSelected ? "ring-2 ring-primary bg-primary/5 z-10 shadow-md" : ""
            )}
            onClick={() => onSelectDate(cloneDay)}
          >
            <span className={cn(
              "flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium",
              isSelected ? "bg-primary text-primary-foreground shadow-sm" : ""
            )}>
              {formattedDate}
            </span>
            
            {/* Indicadores visuales */}
            {isCurrentMonth && (
              <div className="absolute bottom-2 left-2 flex space-x-1">
                {hasTours && <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />}
                {hasLowAvailability && <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm" />}
              </div>
            )}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      )
      days = []
    }
    return rows
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      z: 0,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  return (
    <div className="glass-panel p-6 rounded-3xl w-full h-full shadow-lg border-white/20 dark:border-slate-800/50">
      {renderHeader()}
      {renderDays()}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-md">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentMonth.toString()}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="w-full"
          >
            {renderCells()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
