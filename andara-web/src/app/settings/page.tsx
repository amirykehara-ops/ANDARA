"use client"

import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración de Perfil</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Gestiona tu marca personal e información de contacto.
        </p>
      </div>

      <motion.div 
        className="glass-panel p-8 rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <form action={updateProfile} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre / Nombre de la Agencia</Label>
            <Input id="name" name="name" placeholder="Ej. Guía Demo" defaultValue="Guía Demo" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía Profesional</Label>
            <Textarea 
              id="bio" 
              name="bio" 
              placeholder="Cuéntales a tus clientes sobre tu experiencia..." 
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación Base</Label>
              <Input id="location" name="location" placeholder="Ej. Ica, Perú" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp_link">Enlace de WhatsApp</Label>
              <Input id="whatsapp_link" name="whatsapp_link" placeholder="wa.me/51999999999" />
              <p className="text-xs text-muted-foreground">Usado para el CRM y contacto directo.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50 flex justify-end">
            <Button type="submit" size="lg">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
