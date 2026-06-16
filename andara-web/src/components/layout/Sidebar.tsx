// src/components/layout/Sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, Calendar as CalendarIcon, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { logout } from "@/app/login/actions"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox Social", href: "/inbox", icon: MessageSquare },
  { name: "Leads CRM", href: "/crm", icon: Users },
  { name: "Calendario", href: "/calendar", icon: CalendarIcon },
  { name: "Configuración", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [guideProfile, setGuideProfile] = useState<{name: string, email: string}>({
    name: 'Guía Demo',
    email: 'guia@andara.pe'
  })

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setGuideProfile({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guía Demo',
        email: user.email || 'guia@andara.pe'
      })
    }
  }

  useEffect(() => {
    loadProfile()
    window.addEventListener('andara_db_update', loadProfile)
    return () => {
      window.removeEventListener('andara_db_update', loadProfile)
    }
  }, [])

  return (
    <div className="flex h-screen w-64 flex-col glass-panel border-r border-border/50 z-10">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Andara
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto py-6">
        <nav className="flex-1 space-y-1.5 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out",
                  isActive
                    ? "text-primary dark:text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 relative z-10 transition-colors",
                    isActive ? "text-primary dark:text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                />
                <span className="relative z-10">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t border-border/50 p-4 pb-8 space-y-4">
        <div className="flex items-center p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md border border-white/20">
            {guideProfile.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">{guideProfile.name}</p>
            <p className="text-xs text-muted-foreground truncate">{guideProfile.email}</p>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="w-full text-left px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer">
            Cerrar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}
