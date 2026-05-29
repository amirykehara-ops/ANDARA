"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Rutas públicas que no deben llevar la barra lateral de administración ni el header
  const isPublicPath = pathname === "/" || pathname === "/login" || pathname === "/register"
  
  if (isPublicPath) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    )
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 z-0">
          {children}
        </main>
      </div>
    </div>
  )
}
