"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { motion } from 'framer-motion'

const revenueData = [
  { name: 'Ene', total: 1200 },
  { name: 'Feb', total: 2100 },
  { name: 'Mar', total: 1800 },
  { name: 'Abr', total: 2400 },
  { name: 'May', total: 2800 },
  { name: 'Jun', total: 3200 },
  { name: 'Jul', total: 4250 },
]

const leadsData = [
  { name: 'Lun', whatsapp: 12, instagram: 5, facebook: 3 },
  { name: 'Mar', whatsapp: 18, instagram: 8, facebook: 4 },
  { name: 'Mie', whatsapp: 15, instagram: 12, facebook: 6 },
  { name: 'Jue', whatsapp: 20, instagram: 15, facebook: 8 },
  { name: 'Vie', whatsapp: 25, instagram: 20, facebook: 12 },
  { name: 'Sab', whatsapp: 30, instagram: 25, facebook: 15 },
  { name: 'Dom', whatsapp: 22, instagram: 18, facebook: 10 },
]

export function DashboardCharts() {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div 
        className="glass-panel border border-border/50 rounded-xl p-6 bg-slate-900/50 shadow-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground">Ingresos (2026)</h3>
          <p className="text-sm text-muted-foreground">Evolución mensual de ventas en USD</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        className="glass-panel border border-border/50 rounded-xl p-6 bg-slate-900/50 shadow-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground">Captación de Leads</h3>
          <p className="text-sm text-muted-foreground">Prospectos por canal en los últimos 7 días</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                cursor={{ fill: '#ffffff05' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="whatsapp" name="WhatsApp" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="instagram" name="Instagram" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="facebook" name="Facebook" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
