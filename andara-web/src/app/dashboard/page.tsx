"use client"

import { StatCard } from "@/components/dashboard/StatCard"
import { RecentBookings } from "@/components/dashboard/RecentBookings"
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"
import { DollarSign, CalendarDays, Users } from "lucide-react"
import { motion } from "framer-motion"

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
  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Bienvenido de vuelta. Aquí tienes un resumen de tu negocio.
        </p>
      </motion.div>

      <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <StatCard
            title="Ingresos Totales (Mes)"
            value="$4,250.00"
            description="vs mes anterior"
            icon={DollarSign}
            trend="up"
            trendValue="12.5%"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Reservas Confirmadas"
            value="34"
            description="vs mes anterior"
            icon={CalendarDays}
            trend="up"
            trendValue="4"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Leads por Cerrar"
            value="12"
            description="en WhatsApp e Instagram"
            icon={Users}
            trend="neutral"
            trendValue="0"
          />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="w-full">
        <RecentBookings />
      </motion.div>

      <motion.div variants={itemVariants} className="w-full">
        <DashboardCharts />
      </motion.div>
    </motion.div>
  )
}
