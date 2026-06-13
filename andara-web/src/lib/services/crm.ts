// src/lib/services/crm.ts

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
}

export interface Message {
  id: string;
  sender: 'client' | 'guide';
  text: string;
  createdAt: string;
}

export interface Conversation {
  leadId: string;
  clientName: string;
  source: 'whatsapp' | 'instagram' | 'facebook';
  lastMessageText: string;
  lastMessageTime: string;
  messages: Message[];
}

export interface CalendarEvent {
  id: string;
  leadId: string;
  clientName: string;
  destination: string;
  date: string;
  peopleCount: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  text: string;
}

export interface GuideSettings {
  name: string;
  email: string;
  phone: string;
  agencyName: string;
  bio?: string;
  location?: string;
  whatsappLink?: string;
}

const LEADS_KEY = 'andara_leads_v3';
const CONVS_KEY = 'andara_conversations_v3';
const EVENTS_KEY = 'andara_events_v3';
const LOGS_KEY = 'andara_logs_v3';
const SETTINGS_KEY = 'andara_settings_v3';
const WEBHOOK_PROCESSED_KEY = 'andara_webhook_processed_v3';

const generateId = (prefix: string = '') => `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Dictionary of destinations
const DESTINATIONS = ["huacachina", "paracas", "nazca", "ica", "cusco", "machu picchu", "lima", "ballestas", "arequipa", "puno"];

export function parseMessage(text: string): {
  destination?: string;
  peopleCount?: number;
  travelDate?: string;
} {
  const t = text.toLowerCase();
  let destination: string | undefined;
  
  // 1. Destination
  for (const dest of DESTINATIONS) {
    if (t.includes(dest)) {
      destination = dest.charAt(0).toUpperCase() + dest.slice(1);
      break;
    }
  }

  // 2. People count
  let peopleCount: number | undefined;
  const numberWords: Record<string, number> = {
    "un": 1, "uno": 1, "una": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10
  };

  const wordMatch = t.match(/\b(?:somos|para|pax|grupo de|grupo)\s+(un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/i) ||
                    t.match(/\b(un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(?:personas|pax|adultos|turistas)/i);
  if (wordMatch) {
    const word = wordMatch[1];
    if (word && numberWords[word]) {
      peopleCount = numberWords[word];
    }
  }

  if (peopleCount === undefined) {
    const digitMatch = t.match(/\b(?:somos|para|pax|grupo de|grupo)\s+(\d+)\b/i) ||
                       t.match(/\b(\d+)\s*(?:personas|pax|adultos|turistas)/i);
    if (digitMatch) {
      peopleCount = parseInt(digitMatch[1], 10);
    }
  }

  // Fallback check
  if (peopleCount === undefined) {
    const fallbackMatch = t.match(/\b([1-9]|1\d|20)\b/);
    if (fallbackMatch) {
      peopleCount = parseInt(fallbackMatch[1], 10);
    }
  }

  // 3. Travel Date
  let travelDate: string | undefined;
  const datesDict = ["mañana", "hoy", "lunes", "martes", "miércoles", "miercoles", "jueves", "viernes", "sábado", "sabado", "domingo", "fin de semana", "este sábado", "este sabado"];
  for (const day of datesDict) {
    if (t.includes(day)) {
      travelDate = day.charAt(0).toUpperCase() + day.slice(1);
      break;
    }
  }

  if (!travelDate) {
    const datePattern = t.match(/\b(\d{1,2}\s+de\s+[a-z]+|\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4})\b/i);
    if (datePattern) {
      travelDate = datePattern[0];
    }
  }

  return { destination, peopleCount, travelDate };
}

// Initial seed function
function seedData() {
  if (typeof window === 'undefined') return;

  const leadsExist = localStorage.getItem(LEADS_KEY);
  if (leadsExist) return;

  const initialLeads: Lead[] = [
    {
      id: 'lead_1',
      name: 'Carlos Mendoza',
      source: 'whatsapp',
      phone: '+51999999999',
      interest: 'Hola, quiero reservar para este sábado.',
      status: 'new',
      destination: 'Huacachina',
      travelDate: 'Sábado',
      peopleCount: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 'lead_2',
      name: 'Ana Silva',
      source: 'instagram',
      phone: 'ana.silva_ig',
      interest: 'Quiero tour a Paracas mañana',
      status: 'contacted',
      destination: 'Paracas',
      travelDate: 'Mañana',
      peopleCount: 1,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'lead_3',
      name: 'Juan Pérez',
      source: 'facebook',
      phone: 'juan.perez_fb',
      interest: 'Somos 4 para Huacachina el sábado',
      status: 'reserved',
      destination: 'Huacachina',
      travelDate: 'Sábado',
      peopleCount: 4,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'lead_4',
      name: 'María López',
      source: 'whatsapp',
      phone: '+51988888888',
      interest: 'Quiero tour a Nazca el domingo para 3 personas',
      status: 'reserved',
      destination: 'Nazca',
      travelDate: 'Domingo',
      peopleCount: 3,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'lead_5',
      name: 'Carlos Ruiz',
      source: 'whatsapp',
      phone: '+51977777777',
      interest: 'Tour a Paracas hoy temprano',
      status: 'completed',
      destination: 'Paracas',
      travelDate: 'Hoy',
      peopleCount: 2,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const initialConversations: Conversation[] = initialLeads.map(lead => ({
    leadId: lead.id,
    clientName: lead.name,
    source: lead.source,
    lastMessageText: lead.interest,
    lastMessageTime: new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    messages: [
      {
        id: generateId('msg_'),
        sender: 'client',
        text: lead.interest,
        createdAt: lead.createdAt
      }
    ]
  }));

  // Create initial events for reserved leads
  const initialEvents: CalendarEvent[] = [
    {
      id: 'event_1',
      leadId: 'lead_3',
      clientName: 'Juan Pérez',
      destination: 'Huacachina',
      date: 'Sábado',
      peopleCount: 4
    },
    {
      id: 'event_2',
      leadId: 'lead_4',
      clientName: 'María López',
      destination: 'Nazca',
      date: 'Domingo',
      peopleCount: 3
    }
  ];

  const initialLogs: ActivityLog[] = [
    { id: generateId('log_'), timestamp: '10:30', text: 'Carlos Mendoza creó un lead.' },
    { id: generateId('log_'), timestamp: '09:15', text: 'Ana Silva escribió por Instagram.' },
    { id: generateId('log_'), timestamp: '08:45', text: 'Juan Pérez pasó a Reservado.' },
    { id: generateId('log_'), timestamp: '08:46', text: 'Juan Pérez fue agregado al calendario.' },
    { id: generateId('log_'), timestamp: 'Ayer', text: 'María López pasó a Reservado.' }
  ];

  const initialSettings: GuideSettings = {
    name: 'Guía Demo',
    email: 'guia@andara.pe',
    phone: '+51999999999',
    agencyName: 'Andara Tours',
    bio: 'Guía turístico independiente en Ica y Paracas. Más de 10 años de experiencia mostrando las maravillas del Perú.',
    location: 'Ica, Perú',
    whatsappLink: 'wa.me/51999999999'
  };

  localStorage.setItem(LEADS_KEY, JSON.stringify(initialLeads));
  localStorage.setItem(CONVS_KEY, JSON.stringify(initialConversations));
  localStorage.setItem(EVENTS_KEY, JSON.stringify(initialEvents));
  localStorage.setItem(LOGS_KEY, JSON.stringify(initialLogs));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(initialSettings));
  localStorage.setItem(WEBHOOK_PROCESSED_KEY, JSON.stringify([]));
}

// Service Methods
export function getLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  seedData();
  const data = localStorage.getItem(LEADS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLeads(leads: Lead[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }
}

export function getConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  seedData();
  const data = localStorage.getItem(CONVS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveConversations(convs: Conversation[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONVS_KEY, JSON.stringify(convs));
  }
}

export function getCalendarEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  seedData();
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCalendarEvents(events: CalendarEvent[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }
}

export function getActivityLogs(): ActivityLog[] {
  if (typeof window === 'undefined') return [];
  seedData();
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveActivityLogs(logs: ActivityLog[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }
}

export function getGuideSettings(): GuideSettings {
  if (typeof window === 'undefined') {
    return { name: 'Guía Demo', email: 'guia@andara.pe', phone: '+51999999999', agencyName: 'Andara Tours' };
  }
  seedData();
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : { name: 'Guía Demo', email: 'guia@andara.pe', phone: '+51999999999', agencyName: 'Andara Tours' };
}

export function saveGuideSettings(settings: GuideSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

export function addActivityLog(text: string) {
  const logs = getActivityLogs();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newLog: ActivityLog = {
    id: generateId('log_'),
    timestamp: timeStr,
    text
  };
  saveActivityLogs([newLog, ...logs].slice(0, 50)); // Keep last 50 logs
}

// Process an incoming webhook message
export function processIncomingMessage(name: string, source: Lead['source'], phone: string, text: string) {
  if (typeof window === 'undefined') return;

  const leads = getLeads();
  const conversations = getConversations();
  
  // Check if lead already exists by phone
  let lead = leads.find(l => l.phone === phone);
  let isNew = false;
  
  const parsed = parseMessage(text);
  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!lead) {
    isNew = true;
    lead = {
      id: generateId('lead_'),
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
    leads.unshift(lead);
    
    // Add activity log
    const channelName = source === 'whatsapp' ? 'WhatsApp' : source === 'instagram' ? 'Instagram' : 'Messenger';
    addActivityLog(`${name} escribió por ${channelName}.`);
  } else {
    // Lead exists, append information
    lead.interest = text;
    // Only update parsed info if the fields were empty
    if (parsed.destination && !lead.destination) lead.destination = parsed.destination;
    if (parsed.travelDate && !lead.travelDate) lead.travelDate = parsed.travelDate;
    if (parsed.peopleCount && !lead.peopleCount) lead.peopleCount = parsed.peopleCount;
    
    addActivityLog(`${name} envió un mensaje: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
  }

  saveLeads(leads);

  // Update conversations
  let conv = conversations.find(c => c.leadId === lead!.id);
  const newMessage: Message = {
    id: generateId('msg_'),
    sender: 'client',
    text,
    createdAt: new Date().toISOString()
  };

  if (!conv) {
    conv = {
      leadId: lead.id,
      clientName: lead.name,
      source: lead.source,
      lastMessageText: text,
      lastMessageTime: formattedTime,
      messages: [newMessage]
    };
    conversations.unshift(conv);
  } else {
    conv.lastMessageText = text;
    conv.lastMessageTime = formattedTime;
    conv.messages.push(newMessage);
    // move to top
    const idx = conversations.indexOf(conv);
    if (idx > -1) {
      conversations.splice(idx, 1);
      conversations.unshift(conv);
    }
  }

  saveConversations(conversations);
  
  // Dispatch a custom event to notify components in real-time
  window.dispatchEvent(new Event('andara_db_update'));
  
  return lead;
}

// Update lead status and sync calendar
export function updateLeadStatus(leadId: string, newStatus: Lead['status']) {
  const leads = getLeads();
  const leadIndex = leads.findIndex(l => l.id === leadId);
  if (leadIndex === -1) return;

  const lead = leads[leadIndex];
  const oldStatus = lead.status;
  if (oldStatus === newStatus) return;

  lead.status = newStatus;
  saveLeads(leads);

  // Status mapping to Spanish labels
  const statusLabels: Record<Lead['status'], string> = {
    new: 'Nuevo',
    contacted: 'Contactado',
    proposal: 'Cotización enviada',
    reserved: 'Reservado',
    completed: 'Finalizado'
  };

  addActivityLog(`${lead.name} pasó a ${statusLabels[newStatus]}.`);

  // Sincronización con calendario
  const events = getCalendarEvents();
  const existingEventIndex = events.findIndex(e => e.leadId === leadId);

  if (newStatus === 'reserved') {
    if (existingEventIndex === -1) {
      const newEvent: CalendarEvent = {
        id: generateId('event_'),
        leadId: lead.id,
        clientName: lead.name,
        destination: lead.destination || lead.interest || 'Tour General',
        date: lead.travelDate || 'Sábado',
        peopleCount: lead.peopleCount || 2
      };
      events.push(newEvent);
      saveCalendarEvents(events);
      addActivityLog(`${lead.name} fue agregado al calendario.`);
    }
  } else {
    // If it was moved away from reserved, remove event
    if (existingEventIndex !== -1) {
      events.splice(existingEventIndex, 1);
      saveCalendarEvents(events);
      addActivityLog(`Reserva de ${lead.name} removida del calendario.`);
    }
  }

  window.dispatchEvent(new Event('andara_db_update'));
}

// Update full lead details
export function updateLeadDetails(updatedLead: Lead) {
  const leads = getLeads();
  const idx = leads.findIndex(l => l.id === updatedLead.id);
  if (idx === -1) return;

  leads[idx] = updatedLead;
  saveLeads(leads);

  // Sync calendar event details if it exists
  const events = getCalendarEvents();
  const eventIdx = events.findIndex(e => e.leadId === updatedLead.id);
  if (eventIdx !== -1) {
    events[eventIdx] = {
      ...events[eventIdx],
      clientName: updatedLead.name,
      destination: updatedLead.destination || updatedLead.interest || 'Tour General',
      date: updatedLead.travelDate || 'Sábado',
      peopleCount: updatedLead.peopleCount || 2
    };
    saveCalendarEvents(events);
  }

  // Sync conversations
  const conversations = getConversations();
  const convIdx = conversations.findIndex(c => c.leadId === updatedLead.id);
  if (convIdx !== -1) {
    conversations[convIdx].clientName = updatedLead.name;
    saveConversations(conversations);
  }

  addActivityLog(`Ficha de ${updatedLead.name} actualizada.`);
  window.dispatchEvent(new Event('andara_db_update'));
}

// Send a simulated guide reply in the conversation
export function sendGuideReply(leadId: string, text: string) {
  const conversations = getConversations();
  const conv = conversations.find(c => c.leadId === leadId);
  if (!conv) return;

  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMessage: Message = {
    id: generateId('msg_'),
    sender: 'guide',
    text,
    createdAt: new Date().toISOString()
  };

  conv.lastMessageText = text;
  conv.lastMessageTime = formattedTime;
  conv.messages.push(newMessage);

  saveConversations(conversations);
  window.dispatchEvent(new Event('andara_db_update'));
}

// Webhook Processed tracking to avoid duplicate parsing
export function getProcessedWebhookIds(): string[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(WEBHOOK_PROCESSED_KEY);
  return data ? JSON.parse(data) : [];
}

export function addProcessedWebhookId(id: string) {
  if (typeof window === 'undefined') return;
  const processed = getProcessedWebhookIds();
  processed.push(id);
  localStorage.setItem(WEBHOOK_PROCESSED_KEY, JSON.stringify(processed));
}

export function convertToYYYYMMDD(dateStr: string): string {
  if (!dateStr) return "";
  const normalized = dateStr.toLowerCase().trim();
  const today = new Date();
  
  let targetDate = new Date();
  
  if (normalized === "hoy") {
    targetDate = today;
  } else if (normalized === "mañana" || normalized === "manana") {
    targetDate.setDate(today.getDate() + 1);
  } else {
    const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    // Check if weekday matches
    let targetDayIndex = -1;
    if (normalized.includes("lun")) targetDayIndex = 1;
    else if (normalized.includes("mar")) targetDayIndex = 2;
    else if (normalized.includes("mie") || normalized.includes("mié")) targetDayIndex = 3;
    else if (normalized.includes("jue")) targetDayIndex = 4;
    else if (normalized.includes("vie")) targetDayIndex = 5;
    else if (normalized.includes("sab") || normalized.includes("sáb")) targetDayIndex = 6;
    else if (normalized.includes("dom")) targetDayIndex = 0;
    
    if (targetDayIndex !== -1) {
      const todayDayIndex = today.getDay();
      let diff = targetDayIndex - todayDayIndex;
      if (diff < 0) diff += 7;
      targetDate.setDate(today.getDate() + diff);
    } else {
      // Check for YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) {
        targetDate = new Date(parsed);
      } else {
        return "";
      }
    }
  }

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
