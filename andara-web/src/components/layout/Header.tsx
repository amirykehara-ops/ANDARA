// src/components/layout/Header.tsx
"use client"

import { Bell, Search, Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('andara_theme')
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const activeTheme = stored === 'dark' || (!stored && systemDark) ? 'dark' : 'light'
      
      setTheme(activeTheme)
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('andara_theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
    // Dispatch event to make sure any listening components can re-render if needed
    window.dispatchEvent(new Event('andara_theme_change'))
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 glass-panel px-6 z-10 sticky top-0">
      <div className="flex flex-1 items-center">
        <div className="flex w-full max-w-md items-center rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:bg-background transition-all duration-200">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar reservas, tours o clientes..."
            className="ml-3 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {/* Toggle Theme Button */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors cursor-pointer"
          title={theme === 'light' ? "Activar tema oscuro" : "Activar tema claro"}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5 text-amber-400" />
          )}
        </button>

        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors cursor-pointer">
          <span className="absolute right-2 top-2 block h-2 w-2 rounded-full bg-secondary ring-2 ring-background" />
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
