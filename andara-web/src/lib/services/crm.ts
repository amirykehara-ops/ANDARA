// src/lib/services/crm.ts
import { createClient } from '@/utils/supabase/client';

export interface Lead {
  id: string;
  name: string;
  source: 'whatsapp' | 'instagram' | 'facebook';
  phone: string;
  interest: string;
  status: 'new' | 'contacted' | 'proposal' | 'reserved' | 'completed';
  destination?: string;
  travelDate?: string;
  peopleCount?: number;
  notes?: string;
  createdAt: string;
  guide_email?: string;
}

export interface Message {
  id: string;
  lead_id: string;
  sender: 'client' | 'guide';
  text: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  leadId: string;
  clientName: string;
  destination: string;
  date: string;
  peopleCount: number;
  guide_email?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  text: string;
  guide_email?: string;
}

export interface GuideSettings {
  name: string;
  email: string;
  phone?: string;
  agency_name?: string;
  bio?: string;
  location?: string;
  whatsapp_link?: string;
  languages?: string;
  license?: string;
}

// ─── LOCAL STORAGE HELPERS ───────────────────────────────────────────────────

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocal(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// ─── LEADS ───────────────────────────────────────────────────────────────────

export async function getLeads(guideEmail: string): Promise<Lead[]> {
  const localLeads = getLocal<Lead[]>('andara_leads', []);
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('guide_email', guideEmail)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      const parsed: Lead[] = data.map(l => ({
        id: l.id,
        name: l.name,
        source: l.source,
        phone: l.phone,
        interest: l.interest || '',
        status: l.status,
        destination: l.destination,
        travelDate: l.travel_date,
        peopleCount: l.people_count,
        notes: l.notes,
        createdAt: l.created_at,
        guide_email: l.guide_email,
      }));
      
      // Combinar con locales (leads creados en simulador locales que falten)
      const merged = [...parsed];
      const dbIds = new Set(parsed.map(l => l.id));
      for (const local of localLeads) {
        if (!dbIds.has(local.id) && local.guide_email === guideEmail) {
          merged.push(local);
        }
      }
      
      setLocal('andara_leads', merged);
      return merged;
    }
  } catch (e) {
    console.warn("Supabase getLeads error, using local storage:", e);
  }
  
  return localLeads.filter(l => l.guide_email === guideEmail);
}

export async function saveLead(lead: Lead, guideEmail: string): Promise<void> {
  // 1. Guardar localmente
  const local = getLocal<Lead[]>('andara_leads', []);
  const exists = local.findIndex(l => l.id === lead.id);
  const updatedLead = { ...lead, guide_email: guideEmail };
  if (exists >= 0) {
    local[exists] = updatedLead;
  } else {
    local.unshift(updatedLead);
  }
  setLocal('andara_leads', local);

  // 2. Intentar Supabase
  try {
    const supabase = createClient();
    await supabase.from('leads').upsert({
      id: lead.id,
      guide_email: guideEmail,
      name: lead.name,
      source: lead.source,
      phone: lead.phone,
      interest: lead.interest,
      status: lead.status,
      destination: lead.destination || null,
      travel_date: lead.travelDate || null,
      people_count: lead.peopleCount || null,
      notes: lead.notes || null,
    });
  } catch (e) {
    console.warn("Supabase saveLead error, saved locally:", e);
  }
}

export async function updateLeadStatus(leadId: string, status: Lead['status']): Promise<void> {
  // 1. Guardar localmente
  const local = getLocal<Lead[]>('andara_leads', []);
  const idx = local.findIndex(l => l.id === leadId);
  let lead = idx >= 0 ? local[idx] : null;
  let oldStatus = 'new';
  
  if (idx >= 0 && lead) {
    oldStatus = lead.status;
    lead.status = status;
    setLocal('andara_leads', local);
  }

  // 2. Intentar Supabase
  let dbLead = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.from('leads').select('name, guide_email, status, destination, travel_date, people_count').eq('id', leadId).single();
    dbLead = data;
    await supabase.from('leads').update({ status }).eq('id', leadId);
  } catch (e) {
    console.warn("Supabase updateLeadStatus error, updated locally:", e);
  }

  const finalLead = dbLead ? {
    name: dbLead.name,
    guide_email: dbLead.guide_email,
    status: dbLead.status,
    destination: dbLead.destination,
    travelDate: dbLead.travel_date,
    peopleCount: dbLead.people_count
  } : lead;

  if (finalLead && finalLead.guide_email) {
    const statusNames: Record<string, string> = {
      new: "Nuevo",
      contacted: "Contactado",
      proposal: "Cotización enviada",
      reserved: "Reservado",
      completed: "Finalizado"
    };
    const oldStatusName = statusNames[dbLead ? dbLead.status : oldStatus] || oldStatus;
    const newStatusName = statusNames[status] || status;
    
    await saveActivityLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Prospecto ${finalLead.name} movido de "${oldStatusName}" a "${newStatusName}".`
    }, finalLead.guide_email);

    // Si el estado cambia a reservado, guardar evento en el calendario automáticamente si no existe ya
    if (status === 'reserved') {
      const localEvents = getLocal<CalendarEvent[]>('andara_calendar', []);
      const eventExists = localEvents.some(e => e.leadId === leadId);
      if (!eventExists) {
        await saveCalendarEvent({
          id: Date.now().toString(),
          leadId: leadId,
          clientName: finalLead.name,
          destination: finalLead.destination || 'Sin destino',
          date: finalLead.travelDate || new Date().toISOString().split('T')[0],
          peopleCount: finalLead.peopleCount || 1,
        }, finalLead.guide_email);
      }
    }
  }
}

export async function deleteLead(leadId: string): Promise<void> {
  // 1. Eliminar localmente
  const local = getLocal<Lead[]>('andara_leads', []);
  const idx = local.findIndex(l => l.id === leadId);
  let lead = idx >= 0 ? local[idx] : null;
  if (idx >= 0) {
    local.splice(idx, 1);
    setLocal('andara_leads', local);
  }

  // Limpiar mensajes y calendario locales asociados
  const localMsgs = getLocal<Message[]>('andara_messages', []);
  setLocal('andara_messages', localMsgs.filter(m => m.lead_id !== leadId));

  const localEvts = getLocal<CalendarEvent[]>('andara_calendar', []);
  setLocal('andara_calendar', localEvts.filter(e => e.leadId !== leadId));

  // 2. Intentar Supabase
  let dbLead = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.from('leads').select('name, guide_email').eq('id', leadId).single();
    dbLead = data;
    await supabase.from('leads').delete().eq('id', leadId);
  } catch (e) {
    console.warn("Supabase deleteLead error, deleted locally:", e);
  }

  const finalLead = dbLead || lead;
  if (finalLead && finalLead.guide_email) {
    await saveActivityLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Prospecto ${finalLead.name} eliminado.`
    }, finalLead.guide_email);
  }
}

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export async function getMessages(leadId: string): Promise<Message[]> {
  const localMsgs = getLocal<Message[]>('andara_messages', []);
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      const parsed: Message[] = data.map(m => ({
        id: m.id,
        lead_id: m.lead_id,
        sender: m.sender,
        text: m.text,
        createdAt: m.created_at,
      }));
      
      const dbIds = new Set(parsed.map(m => m.id));
      const merged = [...parsed];
      for (const lm of localMsgs) {
        if (!dbIds.has(lm.id) && lm.lead_id === leadId) {
          merged.push(lm);
        }
      }
      
      const allLocal = getLocal<Message[]>('andara_messages', []);
      const nonLeadMsgs = allLocal.filter(lm => lm.lead_id !== leadId);
      setLocal('andara_messages', [...nonLeadMsgs, ...merged]);
      return merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  } catch (e) {
    console.warn("Supabase getMessages error, using local storage:", e);
  }
  
  return localMsgs.filter(m => m.lead_id === leadId);
}

export async function saveMessage(message: Omit<Message, 'createdAt'>): Promise<void> {
  const newMessage: Message = {
    ...message,
    createdAt: new Date().toISOString()
  };
  
  const local = getLocal<Message[]>('andara_messages', []);
  local.push(newMessage);
  setLocal('andara_messages', local);

  try {
    const supabase = createClient();
    await supabase.from('mensajes').insert({
      id: message.id,
      lead_id: message.lead_id,
      sender: message.sender,
      text: message.text,
    });
  } catch (e) {
    console.warn("Supabase saveMessage error, saved locally:", e);
  }
}

// ─── CALENDAR EVENTS ─────────────────────────────────────────────────────────

export async function getCalendarEvents(guideEmail: string): Promise<CalendarEvent[]> {
  const local = getLocal<CalendarEvent[]>('andara_calendar', []);
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('eventos_calendario')
      .select('*')
      .eq('guide_email', guideEmail);
      
    if (!error && data) {
      const parsed: CalendarEvent[] = data.map(e => ({
        id: e.id,
        leadId: e.lead_id,
        clientName: e.client_name,
        destination: e.destination,
        date: e.date,
        peopleCount: e.people_count,
        guide_email: e.guide_email
      }));
      
      const dbIds = new Set(parsed.map(e => e.id));
      const merged = [...parsed];
      for (const le of local) {
        if (!dbIds.has(le.id) && le.guide_email === guideEmail) {
          merged.push(le);
        }
      }
      setLocal('andara_calendar', merged);
      return merged;
    }
  } catch (e) {
    console.warn("Supabase getCalendarEvents error, using local storage:", e);
  }
  
  return local.filter(e => e.guide_email === guideEmail);
}

export async function saveCalendarEvent(event: CalendarEvent, guideEmail: string): Promise<void> {
  const local = getLocal<CalendarEvent[]>('andara_calendar', []);
  const idx = local.findIndex(e => e.id === event.id);
  const updated = { ...event, guide_email: guideEmail };
  if (idx >= 0) {
    local[idx] = updated;
  } else {
    local.push(updated);
  }
  setLocal('andara_calendar', local);

  try {
    const supabase = createClient();
    await supabase.from('eventos_calendario').upsert({
      id: event.id,
      lead_id: event.leadId,
      guide_email: guideEmail,
      client_name: event.clientName,
      destination: event.destination,
      date: event.date,
      people_count: event.peopleCount,
    });
  } catch (e) {
    console.warn("Supabase saveCalendarEvent error, saved locally:", e);
  }
}

// ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────

export async function getActivityLogs(guideEmail: string): Promise<ActivityLog[]> {
  const local = getLocal<ActivityLog[]>('andara_activity_logs', []);
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('registros_actividad')
      .select('*')
      .eq('guide_email', guideEmail)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (!error && data) {
      const parsed: ActivityLog[] = data.map(l => ({
        id: l.id,
        timestamp: l.timestamp,
        text: l.text,
        guide_email: l.guide_email
      }));
      
      const dbIds = new Set(parsed.map(l => l.id));
      const merged = [...parsed];
      for (const log of local) {
        if (!dbIds.has(log.id) && log.guide_email === guideEmail) {
          merged.push(log);
        }
      }
      merged.sort((a, b) => b.id.localeCompare(a.id));
      setLocal('andara_activity_logs', merged.slice(0, 50));
      return merged.slice(0, 20);
    }
  } catch (e) {
    console.warn("Supabase getActivityLogs error, using local storage:", e);
  }
  
  return local.filter(l => l.guide_email === guideEmail).slice(0, 20);
}

export async function saveActivityLog(log: ActivityLog, guideEmail: string): Promise<void> {
  const local = getLocal<ActivityLog[]>('andara_activity_logs', []);
  const newLog = { ...log, guide_email: guideEmail };
  local.unshift(newLog);
  setLocal('andara_activity_logs', local.slice(0, 50));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('andara_db_update'));
  }

  try {
    const supabase = createClient();
    await supabase.from('registros_actividad').insert({
      id: log.id,
      guide_email: guideEmail,
      timestamp: log.timestamp,
      text: log.text,
    });
  } catch (e) {
    console.warn("Supabase saveActivityLog error, saved locally:", e);
  }
}

// ─── GUIDE SETTINGS ──────────────────────────────────────────────────────────

export async function getGuideSettings(guideEmail: string): Promise<GuideSettings | null> {
  const local = getLocal<Record<string, GuideSettings>>('andara_guide_settings', {});
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('configuracion_guia')
      .select('*')
      .eq('id', guideEmail)
      .single();
      
    if (!error && data) {
      local[guideEmail] = data;
      setLocal('andara_guide_settings', local);
      return data;
    }
  } catch (e) {
    console.warn("Supabase getGuideSettings error, using local storage:", e);
  }
  
  return local[guideEmail] || null;
}

export async function saveGuideSettings(settings: GuideSettings): Promise<void> {
  const local = getLocal<Record<string, GuideSettings>>('andara_guide_settings', {});
  local[settings.email] = settings;
  setLocal('andara_guide_settings', local);

  try {
    const supabase = createClient();
    await supabase.from('configuracion_guia').upsert({
      id: settings.email,
      ...settings,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Supabase saveGuideSettings error, saved locally:", e);
  }
}

// ─── CONVERSATIONS (compatibilidad con inbox) ─────────────────────────────────

export interface Conversation {
  leadId: string;
  clientName: string;
  source: 'whatsapp' | 'instagram' | 'facebook';
  lastMessageText: string;
  lastMessageTime: string;
  messages: Message[];
}

export async function getConversations(guideEmail: string): Promise<Conversation[]> {
  const leads = await getLeads(guideEmail);
  const conversations: Conversation[] = [];
  for (const lead of leads) {
    const messages = await getMessages(lead.id);
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      conversations.push({
        leadId: lead.id,
        clientName: lead.name,
        source: lead.source,
        lastMessageText: last.text,
        lastMessageTime: new Date(last.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages,
      });
    }
  }
  return conversations;
}

export async function updateLeadDetails(leadId: string, updates: Partial<Lead>): Promise<void> {
  // 1. Guardar localmente
  const local = getLocal<Lead[]>('andara_leads', []);
  const idx = local.findIndex(l => l.id === leadId);
  let lead = idx >= 0 ? local[idx] : null;
  if (idx >= 0 && lead) {
    local[idx] = {
      ...lead,
      name: updates.name ?? lead.name,
      phone: updates.phone ?? lead.phone,
      interest: updates.interest ?? lead.interest,
      destination: updates.destination ?? lead.destination,
      travelDate: updates.travelDate ?? lead.travelDate,
      peopleCount: updates.peopleCount ?? lead.peopleCount,
      notes: updates.notes ?? lead.notes,
    };
    setLocal('andara_leads', local);
  }

  // 2. Intentar Supabase
  let dbLead = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.from('leads').select('name, guide_email').eq('id', leadId).single();
    dbLead = data;
    await supabase.from('leads').update({
      name: updates.name,
      phone: updates.phone,
      interest: updates.interest,
      destination: updates.destination,
      travel_date: updates.travelDate,
      people_count: updates.peopleCount,
      notes: updates.notes,
    }).eq('id', leadId);
  } catch (e) {
    console.warn("Supabase updateLeadDetails error, updated locally:", e);
  }

  const finalLead = dbLead || lead;
  if (finalLead && finalLead.guide_email) {
    await saveActivityLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Perfil de ${updates.name || finalLead.name} actualizado.`
    }, finalLead.guide_email);
  }
}

export async function sendGuideReply(leadId: string, text: string): Promise<void> {
  await saveMessage({
    id: Date.now().toString(),
    lead_id: leadId,
    sender: 'guide',
    text,
  });

  const localLeads = getLocal<Lead[]>('andara_leads', []);
  const lead = localLeads.find(l => l.id === leadId);
  const guideEmail = lead?.guide_email || "guia@andara.pe";
  const clientName = lead?.name || "Cliente";

  const textSnippet = text.length > 25 ? `${text.substring(0, 25)}...` : text;
  await saveActivityLog({
    id: Date.now().toString(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Respuesta enviada a ${clientName}: "${textSnippet}"`
  }, guideEmail);
}

export function convertToYYYYMMDD(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toISOString().split('T')[0];
}

// ─── PROCESS INCOMING MESSAGE ─────────────────────────────────────────────────

export function parseLeadDetails(text: string): { destination?: string; travelDate?: string; peopleCount?: number } {
  const normalized = text.toLowerCase();
  let destination: string | undefined = undefined;
  let travelDate: string | undefined = undefined;
  let peopleCount: number | undefined = undefined;

  // 1. Extraer Destino buscando palabras clave comunes
  const destinations = ["huacachina", "paracas", "nazca", "cusco", "lima", "arequipa", "puno", "ica"];
  for (const dest of destinations) {
    if (normalized.includes(dest)) {
      destination = dest.charAt(0).toUpperCase() + dest.slice(1);
      break;
    }
  }

  if (!destination) {
    const destRegexes = [
      /tour\s+(?:a|en|para)\s+([a-zñáéíóú]+)/i,
      /viaje\s+(?:a|en|para)\s+([a-zñáéíóú]+)/i,
      /ir\s+a\s+([a-zñáéíóú]+)/i
    ];
    for (const rx of destRegexes) {
      const match = text.match(rx);
      if (match && match[1]) {
        const candidate = match[1].trim().toLowerCase();
        const excludes = ["el", "la", "los", "las", "un", "una", "este", "esta", "mañana", "hoy", "mi", "mis", "persona", "personas", "pax"];
        if (!excludes.includes(candidate)) {
          destination = candidate.charAt(0).toUpperCase() + candidate.slice(1);
          break;
        }
      }
    }
  }

  // 2. Extraer número de personas (Pax)
  const paxRegexes = [
    /(\d+)\s*(?:personas|pax|viajeros|integrantes|adultos)/i,
    /somos\s+(\d+)/i,
    /para\s+(\d+)\s*(?:personas|pax)?/i
  ];
  for (const rx of paxRegexes) {
    const match = text.match(rx);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (!isNaN(val) && val > 0 && val < 100) {
        peopleCount = val;
        break;
      }
    }
  }
  
  const wordNumbers: Record<string, number> = {
    "un": 1, "una": 1, "uno": 1, "dos": 2, "tres": 3, "cuatro": 4, 
    "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10
  };
  if (!peopleCount) {
    for (const [word, num] of Object.entries(wordNumbers)) {
      const rx = new RegExp(`(?:somos|para)\\s+${word}\\b|\\b${word}\\s+(?:personas|pax|viajeros)\\b`, 'i');
      if (rx.test(normalized)) {
        peopleCount = num;
        break;
      }
    }
  }

  // 3. Extraer Fecha del Viaje (Hoy, Mañana, Días de la semana)
  const today = new Date();
  if (normalized.includes("hoy")) {
    travelDate = today.toISOString().split('T')[0];
  } else if (normalized.includes("mañana") || normalized.includes("manana")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    travelDate = tomorrow.toISOString().split('T')[0];
  } else {
    const daysOfWeek = ["domingo", "lunes", "martes", "miércoles", "miercoles", "jueves", "viernes", "sábado", "sabado"];
    for (let i = 0; i < daysOfWeek.length; i++) {
      const dayName = daysOfWeek[i];
      if (normalized.includes(dayName)) {
        const currentDayIndex = today.getDay();
        const targetDayIndex = i === 4 ? 3 : i === 7 ? 6 : i;
        let daysToAdd = targetDayIndex - currentDayIndex;
        if (daysToAdd <= 0) {
          daysToAdd += 7;
        }
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysToAdd);
        travelDate = targetDate.toISOString().split('T')[0];
        break;
      }
    }
  }

  // Fechas absolutas (DD/MM o DD/MM/AAAA)
  if (!travelDate) {
    const dateRegex = /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/;
    const match = text.match(dateRegex);
    if (match) {
      const d = parseInt(match[1], 10);
      const m = parseInt(match[2], 10) - 1;
      const y = match[3] ? (match[3].length === 2 ? 2000 + parseInt(match[3], 10) : parseInt(match[3], 10)) : today.getFullYear();
      const parsed = new Date(y, m, d);
      if (!isNaN(parsed.getTime())) {
        travelDate = parsed.toISOString().split('T')[0];
      }
    }
  }

  return { destination, travelDate, peopleCount };
}

export async function processIncomingMessage(guideEmail: string): Promise<void> {
  const supabase = createClient();
  let webhooks: any[] = [];
  try {
    const { data } = await supabase
      .from('mensajes_entrantes')
      .select('*')
      .eq('guide_email', guideEmail)
      .order('created_at', { ascending: true });
    webhooks = data || [];
  } catch (e) {
    console.warn("Supabase fetch incoming webhooks failed:", e);
  }

  if (webhooks.length === 0) return;

  for (const webhook of webhooks) {
    const leadId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const parsed = parseLeadDetails(webhook.text);
    
    const leadObj: Lead = {
      id: leadId,
      name: webhook.name,
      source: 'facebook',
      phone: webhook.phone,
      interest: webhook.text,
      status: 'new',
      destination: parsed.destination,
      travelDate: parsed.travelDate,
      peopleCount: parsed.peopleCount,
      createdAt: new Date().toISOString()
    };

    await saveLead(leadObj, guideEmail);

    await saveMessage({
      id: Date.now().toString(),
      lead_id: leadId,
      sender: 'client',
      text: webhook.text,
    });

    await saveActivityLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Nuevo prospecto ${webhook.name} recibido vía Messenger.`
    }, guideEmail);

    try {
      await supabase.from('mensajes_entrantes').delete().eq('id', webhook.id);
    } catch (e) {
      console.warn("Supabase delete incoming webhook failed:", e);
    }
  }
}

// ─── PROCESS SINGLE MESSAGE (compatibilidad con LayoutWrapper) ────────────────

export async function processIncomingMessageDirect(
  name: string,
  source: 'whatsapp' | 'instagram' | 'facebook',
  phone: string,
  text: string,
  guideEmail: string
): Promise<void> {
  const leadId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const parsed = parseLeadDetails(text);

  const leadObj: Lead = {
    id: leadId,
    name,
    source,
    phone,
    interest: text,
    status: 'new',
    destination: parsed.destination,
    travelDate: parsed.travelDate,
    peopleCount: parsed.peopleCount,
    createdAt: new Date().toISOString()
  };

  await saveLead(leadObj, guideEmail);

  await saveMessage({
    id: Date.now().toString(),
    lead_id: leadId,
    sender: 'client',
    text,
  });

  const sourceName = source === 'facebook' ? 'Messenger' : source === 'instagram' ? 'Instagram' : 'WhatsApp';
  await saveActivityLog({
    id: Date.now().toString(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Nuevo prospecto ${name} recibido vía ${sourceName}.`
  }, guideEmail);
}
