// src/app/crm/page.tsx
"use client"

import { KanbanBoard } from "@/components/crm/KanbanBoard"
import { MetaSimulator } from "@/components/crm/MetaSimulator"

export default function CRMPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px] gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
            Tablero CRM Kanban
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus prospectos por etapas y clasifícalos para cerrar sus reservas.
          </p>
        </div>
      </div>

      {/* Simulador Meta en la parte superior */}
      <MetaSimulator />

      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>
    </div>
  )
}
