"use client"

import { KanbanBoard } from "@/components/crm/KanbanBoard"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function CRMPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leads CRM</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus prospectos de WhatsApp e Instagram para maximizar tus ventas.
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>

        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard />
      </div>
    </div>
  )
}
