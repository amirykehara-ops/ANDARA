// src/app/inbox/page.tsx
"use client"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { 
  getLeads, 
  getConversations, 
  updateLeadDetails, 
  updateLeadStatus, 
  sendGuideReply, 
  convertToYYYYMMDD,
  type Lead, 
  type Conversation 
} from "@/lib/services/crm"
import { 
  MessageCircle, 
  Camera, 
  Users, 
  Search, 
  Send, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle, 
  Save, 
  MessageSquare,
  Sparkles,
  ExternalLink
} from "lucide-react"

function InboxContent() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const searchParams = useSearchParams()
  const leadIdParam = searchParams.get('leadId')

  // Form states for the Right Lead Profile
  const [profileName, setProfileName] = useState("")
  const [profilePhone, setProfilePhone] = useState("")
  const [profileStatus, setProfileStatus] = useState<Lead['status']>("new")
  const [profileDestination, setProfileDestination] = useState("")
  const [profileTravelDate, setProfileTravelDate] = useState("")
  const [profilePeopleCount, setProfilePeopleCount] = useState(1)
  const [profileNotes, setProfileNotes] = useState("")
  const [saveStatus, setSaveStatus] = useState("")

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email || ""
    const allConvs = await getConversations(email)
    const allLeads = await getLeads(email)
    setConversations(allConvs)
    setLeads(allLeads)
    
    // Prioritize the leadId from URL params if present
    if (leadIdParam) {
      setSelectedLeadId(leadIdParam)
    } else if (allConvs.length > 0 && !selectedLeadId) {
      setSelectedLeadId(allConvs[0].leadId)
    }
  }

  useEffect(() => {
    loadData()
    window.addEventListener('andara_db_update', loadData)
    return () => {
      window.removeEventListener('andara_db_update', loadData)
    }
  }, [selectedLeadId, leadIdParam])

  // Populate Right Panel form when selected lead changes
  const activeLead = leads.find(l => l.id === selectedLeadId)
  const activeConv = conversations.find(c => c.leadId === selectedLeadId)

  useEffect(() => {
    if (activeLead) {
      setProfileName(activeLead.name || "")
      setProfilePhone(activeLead.phone || "")
      setProfileStatus(activeLead.status || "new")
      setProfileDestination(activeLead.destination || "")
      setProfileTravelDate(activeLead.travelDate ? convertToYYYYMMDD(activeLead.travelDate) : "")
      setProfilePeopleCount(activeLead.peopleCount || 1)
      setProfileNotes(activeLead.notes || "")
      setSaveStatus("")
    }
  }, [selectedLeadId, activeLead])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeLead) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email || ""

    // 1. Si el estado cambia, procesar la transición primero para registrar logs y calendario
    if (profileStatus !== activeLead.status) {
      updateLeadStatus(activeLead.id, profileStatus)
    }

    // 2. Refrescar el lead desde el localStorage para tener el estado actualizado, luego guardar detalles
    const refreshedLeads = await getLeads(email)
    const freshLead = refreshedLeads.find(l => l.id === activeLead.id) || activeLead

    const updated: Lead = {
      ...freshLead,
      name: profileName,
      phone: profilePhone,
      destination: profileDestination,
      travelDate: profileTravelDate,
      peopleCount: Number(profilePeopleCount),
      notes: profileNotes
    }

    updateLeadDetails(updated.id, updated)

    setSaveStatus("✅ Guardado")
    setTimeout(() => setSaveStatus(""), 2000)
  }

  const handleSendReply = () => {
    if (!selectedLeadId || !replyText.trim()) return
    
    // Add visual reply to chat history
    sendGuideReply(selectedLeadId, replyText)
    
    // Simular redirección al canal oficial
    let url = "https://web.whatsapp.com/"
    if (activeLead?.source === "whatsapp") {
      url = `https://wa.me/${activeLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(replyText)}`
    } else if (activeLead?.source === "instagram") {
      url = `https://www.instagram.com/direct/inbox/`
    } else if (activeLead?.source === "facebook") {
      url = `https://www.messenger.com/`
    }
    
    window.open(url, "_blank")
    setReplyText("")
  }

  // Filter conversations
  const filteredConvs = conversations.filter(c => {
    const lead = leads.find(l => l.id === c.leadId)
    const matchesSearch = c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (lead?.destination || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Format channel name and colors
  const getChannelDetails = (source: Lead['source']) => {
    switch(source) {
      case 'whatsapp':
        return { 
          icon: <MessageCircle className="w-4 h-4 text-emerald-500" />, 
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', 
          border: 'border-emerald-500/20',
          label: 'WhatsApp',
          actionLabel: 'Responder desde WhatsApp'
        }
      case 'instagram':
        return { 
          icon: <Camera className="w-4 h-4 text-pink-500" />, 
          bg: 'bg-pink-500/10 dark:bg-pink-500/20', 
          border: 'border-pink-500/20',
          label: 'Instagram',
          actionLabel: 'Responder desde Instagram'
        }
      case 'facebook':
        return { 
          icon: <span className="text-xs font-black text-blue-500">M</span>, 
          bg: 'bg-blue-500/10 dark:bg-blue-500/20', 
          border: 'border-blue-500/20',
          label: 'Messenger',
          actionLabel: 'Responder desde Messenger'
        }
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[600px] border border-border/50 rounded-3xl overflow-hidden glass-panel shadow-2xl">
      {/* 1. PANEL IZQUIERDO: Lista de Conversaciones */}
      <div className="w-80 flex flex-col border-r border-border/40 bg-background/25">
        <div className="p-4 border-b border-border/40 space-y-3">
          <h2 className="text-lg font-bold text-foreground">Inbox Social</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar conversación..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 dark:bg-slate-900/60 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/20 no-scrollbar">
          {filteredConvs.length > 0 ? (
            filteredConvs.map(conv => {
              const isActive = conv.leadId === selectedLeadId
              const details = getChannelDetails(conv.source)
              const lead = leads.find(l => l.id === conv.leadId)
              return (
                <div
                  key={conv.leadId}
                  onClick={() => setSelectedLeadId(conv.leadId)}
                  className={`p-4 flex gap-3 cursor-pointer transition-all hover:bg-muted/30 ${
                    isActive ? "bg-primary/5 border-l-4 border-primary dark:bg-primary/10" : ""
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${details.bg} ${details.border}`}>
                    {details.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-semibold text-sm text-foreground truncate">{conv.clientName}</h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {conv.lastMessageText}
                    </p>
                    {lead?.destination && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        📍 {lead.destination}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No se encontraron conversaciones.
            </div>
          )}
        </div>
      </div>

      {/* 2. PANEL CENTRAL: Chat simulado */}
      <div className="flex-1 flex flex-col bg-background/10">
        {activeLead && activeConv ? (
          <>
            {/* Header del Chat */}
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-background/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${getChannelDetails(activeLead.source).bg} ${getChannelDetails(activeLead.source).border}`}>
                  {getChannelDetails(activeLead.source).icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">{activeConv.clientName}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <span>Vía {getChannelDetails(activeLead.source).label}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">{activeLead.phone}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Historial de Mensajes */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
              {activeConv.messages.map(msg => {
                const isGuide = msg.sender === 'guide'
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isGuide ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                        isGuide
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-white dark:bg-slate-900 border border-border/50 text-foreground rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="block text-[9px] text-right mt-1 opacity-70 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input y Botón de Acción Principal */}
            <div className="p-4 border-t border-border/40 bg-background/20 backdrop-blur-sm space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe tu mensaje a enviar..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 rounded-xl flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Botón visual requerido */}
              <button
                onClick={handleSendReply}
                className="w-full py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{getChannelDetails(activeLead.source).actionLabel}</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <MessageSquare className="w-12 h-12 mb-3 opacity-40 text-primary" />
            <p className="text-lg font-medium">Selecciona una conversación</p>
            <p className="text-sm opacity-80 mt-1">Los mensajes entrantes de tus redes sociales aparecerán aquí.</p>
          </div>
        )}
      </div>

      {/* 3. PANEL DERECHO: Ficha del Lead (Editable) */}
      <div className="w-80 border-l border-border/40 bg-background/25 flex flex-col overflow-y-auto no-scrollbar">
        {activeLead ? (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>Perfil del Lead</span>
              </h3>
              {saveStatus && <span className="text-xs font-semibold text-emerald-500">{saveStatus}</span>}
            </div>

            {/* Info de Inteligencia Extraída */}
            {(activeLead.destination || activeLead.travelDate || activeLead.peopleCount) && (
              <div className="p-3.5 bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DATOS EXTRAÍDOS</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Destino:</span>
                    <span className="font-semibold text-foreground">{activeLead.destination || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Personas:</span>
                    <span className="font-semibold text-foreground">{activeLead.peopleCount ? `${activeLead.peopleCount} pax` : "-"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Fecha de viaje:</span>
                    <span className="font-semibold text-foreground">{activeLead.travelDate || "-"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Inputs del Perfil */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre del Turista</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Teléfono / Identificador</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Canal</label>
                <input
                  type="text"
                  value={getChannelDetails(activeLead.source).label}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-muted/40 dark:bg-slate-800/40 border border-border/30 rounded-xl text-muted-foreground cursor-not-allowed font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado CRM</label>
                <select
                  value={profileStatus}
                  onChange={e => setProfileStatus(e.target.value as Lead['status'])}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="new">Nuevo</option>
                  <option value="contacted">Contactado</option>
                  <option value="proposal">Cotización enviada</option>
                  <option value="reserved">Reservado</option>
                  <option value="completed">Finalizado</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Destino de Interés</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={profileDestination}
                    onChange={e => setProfileDestination(e.target.value)}
                    placeholder="Ej. Huacachina"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha de Viaje</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="date"
                    value={profileTravelDate}
                    onChange={e => setProfileTravelDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cantidad de Personas</label>
                <input
                  type="number"
                  min="1"
                  value={profilePeopleCount}
                  onChange={e => setProfilePeopleCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notas Internas</label>
                <textarea
                  value={profileNotes}
                  onChange={e => setProfileNotes(e.target.value)}
                  placeholder="Agregar anotaciones sobre el cliente..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-md hover:bg-primary/95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Perfil</span>
            </button>
          </form>
        ) : (
          <div className="p-6 text-center text-muted-foreground text-sm mt-12">
            No hay ficha activa.
          </div>
        )}
      </div>
    </div>
  )
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando bandeja de entrada...</div>}>
      <InboxContent />
    </Suspense>
  )
}
