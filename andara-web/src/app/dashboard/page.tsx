// src/app/dashboard/page.tsx
"use client"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"
import { getLeads, getCalendarEvents, getActivityLogs, type Lead, type ActivityLog } from "@/lib/services/crm"
import { StatCard } from "@/components/dashboard/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, Phone, CalendarDays, Map, Clock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
} as const

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email || ""
    const [leads, events, logs] = await Promise.all([
      getLeads(email),
      getCalendarEvents(email),
      getActivityLogs(email),
    ])
    setLeads(leads)
    setEvents(events)
    setLogs(logs)
  }

  useEffect(() => {
    loadData()
    
    // Escuchar actualizaciones en localStorage/DB
    window.addEventListener('andara_db_update', loadData)
    return () => {
      window.removeEventListener('andara_db_update', loadData)
    }
  }, [])

  // Cálculos de métricas operacionales
  const leadsNuevos = leads.filter(l => l.status === 'new').length
  const conversacionActivas = leads.filter(l => ['new', 'contacted', 'proposal'].includes(l.status)).length
  const leadsContactados = leads.filter(l => l.status === 'contacted').length
  const reservasConfirmadas = leads.filter(l => l.status === 'reserved').length
  const toursSemana = events.length // Eventos del calendario semanal

  return (
    <motion.div 
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
            Centro de Operaciones
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Monitorea el flujo de tus leads y reservas en tiempo real.
          </p>
        </div>
        <Link href="/crm">
          <button className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition shadow-md hover:shadow-lg cursor-pointer">
            <span>Ir al CRM Kanban</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>

      {/* Grid de 5 métricas simples y operacionales */}
      <motion.div variants={containerVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <motion.div variants={itemVariants}>
          <StatCard
            title="Leads Nuevos"
            value={leadsNuevos.toString()}
            description="Sin responder aún"
            icon={Users}
            trend="neutral"
            trendValue=""
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Conversaciones Activas"
            value={conversacionActivas.toString()}
            description="WhatsApp / IG / Messenger"
            icon={MessageSquare}
            trend="neutral"
            trendValue=""
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Leads Contactados"
            value={leadsContactados.toString()}
            description="En conversación"
            icon={Phone}
            trend="neutral"
            trendValue=""
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Reservas Confirmadas"
            value={reservasConfirmadas.toString()}
            description="Cerrados con éxito"
            icon={CalendarDays}
            trend="neutral"
            trendValue=""
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Tours esta Semana"
            value={toursSemana.toString()}
            description="En calendario semanal"
            icon={Map}
            trend="neutral"
            trendValue=""
          />
        </motion.div>
      </motion.div>

      {/* Panel de Actividad Reciente */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-3 glass-panel border border-white/20 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-lg">
          <CardHeader className="border-b border-border/40 bg-background/20 backdrop-blur-sm py-5 px-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-primary" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative border-l border-border/70 ml-3.5 space-y-6">
              {logs.length > 0 ? (
                logs.map((log) => {
                  let indicatorColor = "bg-primary/20 text-primary border-primary/30"
                  if (log.text.includes("escribió") || log.text.includes("creó")) {
                    indicatorColor = "bg-blue-500/20 text-blue-500 border-blue-500/30"
                  } else if (log.text.includes("Reservado") || log.text.includes("calendario")) {
                    indicatorColor = "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                  } else if (log.text.includes("actualizada") || log.text.includes("removida")) {
                    indicatorColor = "bg-amber-500/20 text-amber-500 border-amber-500/30"
                  }

                  return (
                    <div key={log.id} className="relative pl-8 group transition-all duration-200">
                      {/* Indicador de Línea de Tiempo */}
                      <span className={`absolute -left-[13px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-[10px] font-bold shadow-sm ${indicatorColor}`}>
                        •
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <p className="text-sm font-medium text-foreground leading-relaxed">
                          {log.text}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted/60 dark:bg-slate-800/60 px-2 py-0.5 rounded-md self-start sm:self-auto font-mono">
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No hay actividad registrada en el sistema.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
