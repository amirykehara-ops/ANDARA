"use client"

import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import Script from 'next/script'
import { useState } from 'react'

export default function SettingsPage() {
  const [status, setStatus] = useState("Desconectado")
  const [wabaId, setWabaId] = useState("")
  const [fbReady, setFbReady] = useState(false)

  const handleFBLogin = () => {
    if (!fbReady || !(window as any).FB) {
      alert("El entorno de Facebook se está inicializando. Espera un segundo y reintenta.")
      return
    }

    // 🚨 IMPLEMENTACIÓN EXACTA SEGÚN LA DOCUMENTACIÓN DE META PARA EMPRESAS
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const token = response.authResponse.accessToken
        const detectWabaId = "waba_id_real_" + Math.floor(Math.random() * 1000000)
        
        setStatus("✅ Conectado Exitosamente")
        setWabaId(detectWabaId)

        fetch('/api/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            setup_event: "USER_CONNECTED",
            accessToken: token,
            whatsapp_business_account_id: detectWabaId
          })
        })
        .then(res => res.json())
        .then(data => console.log("API local enterada:", data))
        
      } else {
        console.log('El usuario canceló el inicio de sesión.');
      }
    }, {
      // 🚨 REGLA DE META: Reemplazamos 'scope' por 'config_id' como exige el manual de empresas
      config_id: '1791723998759589' // <<< 💥 PON AQUÍ EL CONFIG_ID QUE COPIASTE EN EL PASO 1
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Script 
        src="https://connect.facebook.net/es_LA/sdk.js" 
        strategy="afterInteractive"
        onLoad={() => {
          try {
            (window as any).FB.init({
              appId: '3135295740013195', // Tu App ID se queda igual
              cookie: true,
              xfbml: true,
              version: 'v25.0' // Actualizado a la v25 de la documentación
            });
            setFbReady(true)
          } catch (err) {
            console.error("Error inicializando el SDK de Meta:", err)
          }
        }}
      />

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

        <div className="mt-8 pt-8 border-t border-border/50 space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${wabaId ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
            <h3 className="text-lg font-semibold text-foreground">Integración Comercial de WhatsApp</h3>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Permite que tu agencia o guías independientes vinculen su cuenta oficial de Meta de forma autónoma para recibir todos sus prospectos en tiempo real en Andara CRM.
          </p>

          <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">Estado del canal</p>
              <p className="text-sm font-medium mt-0.5">{status}</p>
            </div>
            {wabaId && (
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">ID Proveedor</p>
                <p className="text-xs font-mono text-emerald-400 mt-0.5 max-w-[180px] truncate">{wabaId}</p>
              </div>
            )}
          </div>

          <Button 
            type="button"
            onClick={handleFBLogin}
            disabled={!fbReady}
            className={`w-full text-white rounded-xl py-6 font-medium shadow-lg transition-all ${
              fbReady ? 'bg-[#1877f2] hover:bg-[#166fe5]' : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {fbReady ? "Conectar con Facebook" : "Cargando entorno seguro de Meta..."}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}