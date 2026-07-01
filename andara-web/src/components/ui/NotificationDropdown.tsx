// src/components/ui/NotificationDropdown.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, CheckCircle2, Info, AlertCircle, AlertTriangle } from "lucide-react"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, type AppNotification } from "@/lib/services/notifications"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [guideEmail, setGuideEmail] = useState("")

  const loadNotifications = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      setGuideEmail(user.email)
      const notifs = await getNotifications(user.email)
      setNotifications(notifs)
    }
  }

  useEffect(() => {
    loadNotifications()
    window.addEventListener('andara_notifications_update', loadNotifications)
    return () => {
      window.removeEventListener('andara_notifications_update', loadNotifications)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const getIconForType = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'alert': return <AlertCircle className="w-5 h-5 text-rose-500" />
      case 'info':
      default: return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await markNotificationAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    if (guideEmail) {
      await markAllNotificationsAsRead(guideEmail)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel border border-border/50 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[85vh]"
          >
            <div className="p-4 border-b border-border/30 flex justify-between items-center bg-background/50 backdrop-blur-md">
              <h3 className="font-bold text-foreground">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 font-semibold transition"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[400px] flex-1 no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <Bell className="w-8 h-8 opacity-20" />
                  <p className="text-sm">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {notifications.map((notification) => {
                    const content = (
                      <div className={`p-4 hover:bg-muted/50 transition-colors flex gap-3 ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                        <div className="mt-0.5 shrink-0">
                          {getIconForType(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${!notification.read ? 'text-foreground' : 'text-foreground/80'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-mono">
                            {new Date(notification.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="shrink-0 flex items-center">
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="p-1.5 text-muted-foreground hover:bg-background rounded-full transition-colors"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )

                    return notification.link ? (
                      <Link key={notification.id} href={notification.link} onClick={() => setIsOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      <div key={notification.id}>
                        {content}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
