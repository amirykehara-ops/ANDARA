// src/app/settings/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import Script from 'next/script'
import { useState, useEffect } from 'react'
import { getGuideSettings, saveGuideSettings, saveActivityLog } from "@/lib/services/crm"
import { createClient } from "@/utils/supabase/client"

export default function SettingsPage() {
  const [name, setName] = useState("Guía Demo")
  const [email, setEmail] = useState("guia@andara.pe")
  const [phone, setPhone] = useState("")
  const [agencyName, setAgencyName] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  const [whatsappLink, setWhatsappLink] = useState("")
  const [languages, setLanguages] = useState("")
  const [license, setLicense] = useState("")
  const [saveStatus, setSaveStatus] = useState("")
  const [status, setStatus] = useState("Desconectado")
  const [wabaId, setWabaId] = useState("")
  const [fbReady, setFbReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const userEmail = user?.email || "guia@andara.pe"
      const userName = user?.user_metadata?.full_name || "Guía Demo"

      setName(userName)
      setEmail(userEmail)

      const settings = await getGuideSettings(userEmail)
      if (settings) {
        setPhone(settings.phone || "+51999999999")
        setAgencyName((settings as any).agency_name || "Andara Tours")
        setLocation(settings.location || "Ica, Perú")
        setBio(settings.bio || "Guía turístico independiente en Ica y Paracas. Más de 10 años de experiencia mostrando las maravillas del Perú.")
        setWhatsappLink((settings as any).whatsapp_link || "wa.me/51999999999")
        setLanguages((settings as any).languages || "Español, Inglés")
        setLicense((settings as any).license || "DIRTUR-ICA-00123")
      }
    }
    init()
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const updated = {
      name,
      email,
      phone,
      agency_name: agencyName,
      location,
      bio,
      whatsapp_link: whatsappLink,
      languages,
      license
    }
    await saveGuideSettings(updated)
    await saveActivityLog({ id: Date.now().toString(), timestamp: new Date().toISOString(), text: `Configuración de perfil de ${name} actualizada.` }, email)
    window.dispatchEvent(new Event('andara_db_update'))
    setSaveStatus("✅ Configuración guardada exitosamente")
    setTimeout(() => setSaveStatus(""), 3000)
  }

  const handleFBLogin = () => {
    if (!fbReady || !(window as any).FB) {
      alert("El entorno de Facebook se está inicializando. Espera un segundo y reintenta.")
      return;
    }

    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const token = response.authResponse.accessToken
        setStatus("⌛ Conectando páginas...")
        fetch('/api/facebook/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: token, guideEmail: email })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStatus("✅ Páginas vinculadas con éxito")
            if (data.pages && data.pages.length > 0) {
              const names = data.pages.map((p: any) => p.name).join(", ")
              setWabaId(names)
            } else {
              setWabaId("Ninguna página encontrada")
            }
          } else {
            setStatus("❌ Error al conectar")
            alert("Error al conectar páginas: " + (data.error || "Error desconocido"))
          }
          window.dispatchEvent(new Event('andara_db_update'))
        })
        .catch(err => {
          setStatus("❌ Error al conectar")
          console.error("Error al conectar con backend:", err)
        })
      } else {
        console.log('El usuario canceló el inicio de sesión.');
      }
    }, {
      config_id: '1791723998759589'
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <Script
        src="https://connect.facebook.net/es_LA/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          try {
            (window as any).FB.init({
              appId: '3135295740013195',
              cookie: true,
              xfbml: true,
              version: 'v25.0'
            });
            setFbReady(true)
          } catch (err) {
            console.error("Error inicializando el SDK de Meta:", err)
          }
        }}
      />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
          Configuración del Guía
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Gestiona tus datos de contacto profesionales e integraciones comerciales.
        </p>
      </div>

      <motion.div
        className="glass-panel p-8 rounded-3xl border border-white/20 dark:border-slate-800/60 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-border/30">
            <h3 className="text-lg font-bold text-foreground">Información del Perfil</h3>
            {saveStatus && (
              <span className="text-sm font-semibold text-emerald-500 animate-pulse">{saveStatus}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">Nombre de Usuario</Label>
              <Input id="name" value={name} disabled className="bg-muted/50 border-border/30 text-muted-foreground cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">Correo de Usuario</Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted/50 border-border/30 text-muted-foreground cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono / WhatsApp</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej. +51999999999" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agencyName">Nombre de tu Agencia</Label>
              <Input id="agencyName" value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Ej. Andara Tours" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación Base</Label>
              <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej. Cusco, Perú" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Licencia de Guía (DIRTUR ID)</Label>
              <Input id="license" value={license} onChange={e => setLicense(e.target.value)} placeholder="Ej. DIRTUR-ICA-00123" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="languages">Idiomas</Label>
              <Input id="languages" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="Ej. Español, Inglés" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_link">Enlace de WhatsApp</Label>
              <Input id="whatsapp_link" value={whatsappLink} onChange={e => setWhatsappLink(e.target.value)} placeholder="wa.me/51999999999" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía Profesional</Label>
            <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Cuéntales a tus clientes sobre tu experiencia..." className="min-h-[100px] leading-relaxed" />
          </div>

          <div className="pt-4 border-t border-border/40 flex justify-end">
            <Button type="submit" size="lg" className="px-8 cursor-pointer rounded-xl font-bold">
              Guardar Perfil
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-border/40 space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${wabaId ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
            <h3 className="text-lg font-bold text-foreground">Conectar Páginas de Facebook</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vincula tus páginas comerciales de Facebook para recibir chats de Messenger e Instagram en Andara CRM.
          </p>
          <div className="p-4 bg-muted/40 border border-border/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">Estado del canal</p>
              <p className="text-sm font-semibold mt-0.5">{status}</p>
            </div>
            {wabaId && (
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">Páginas Vinculadas</p>
                <p className="text-xs font-mono text-emerald-500 mt-0.5 max-w-[180px] truncate" title={wabaId}>{wabaId}</p>
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={handleFBLogin}
            disabled={!fbReady}
            className={`w-full text-white rounded-xl py-6 font-semibold shadow-lg transition-all cursor-pointer ${fbReady ? 'bg-[#1877f2] hover:bg-[#166fe5]' : 'bg-gray-600 cursor-not-allowed'}`}
          >
            {fbReady ? "Conectar con Facebook Business" : "Cargando entorno seguro de Meta..."}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}