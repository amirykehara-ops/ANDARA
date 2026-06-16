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
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  text: string;
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

// ─── LEADS ───────────────────────────────────────────────────────────────────

export async function getLeads(guideEmail: string): Promise<Lead[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('guide_email', guideEmail)
    .order('created_at', { ascending: false });
  if (error) { console.error('Error fetching leads:', error); return []; }
  return (data || []).map(l => ({
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
}

export async function saveLead(lead: Lead, guideEmail: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('leads').upsert({
    id: lead.id,
    guide_email: guideEmail,
    name: lead.name,
    source: lead.source,
    phone: lead.phone,
    interest: lead.interest,
    status: lead.status,
    destination: lead.destination,
    travel_date: lead.travelDate,
    people_count: lead.peopleCount,
    notes: lead.notes,
  });
}

export async function updateLeadStatus(leadId: string, status: Lead['status']): Promise<void> {
  const supabase = createClient();
  await supabase.from('leads').update({ status }).eq('id', leadId);
}

export async function deleteLead(leadId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('leads').delete().eq('id', leadId);
}

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export async function getMessages(leadId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mensajes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true });
  if (error) { console.error('Error fetching messages:', error); return []; }
  return (data || []).map(m => ({
    id: m.id,
    lead_id: m.lead_id,
    sender: m.sender,
    text: m.text,
    createdAt: m.created_at,
  }));
}

export async function saveMessage(message: Omit<Message, 'createdAt'>): Promise<void> {
  const supabase = createClient();
  await supabase.from('mensajes').insert({
    id: message.id,
    lead_id: message.lead_id,
    sender: message.sender,
    text: message.text,
  });
}

// ─── CALENDAR EVENTS ─────────────────────────────────────────────────────────

export async function getCalendarEvents(guideEmail: string): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('eventos_calendario')
    .select('*')
    .eq('guide_email', guideEmail);
  if (error) { console.error('Error fetching calendar events:', error); return []; }
  return (data || []).map(e => ({
    id: e.id,
    leadId: e.lead_id,
    clientName: e.client_name,
    destination: e.destination,
    date: e.date,
    peopleCount: e.people_count,
  }));
}

export async function saveCalendarEvent(event: CalendarEvent, guideEmail: string): Promise<void> {
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
}

// ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────

export async function getActivityLogs(guideEmail: string): Promise<ActivityLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('registros_actividad')
    .select('*')
    .eq('guide_email', guideEmail)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) { console.error('Error fetching activity logs:', error); return []; }
  return (data || []).map(l => ({
    id: l.id,
    timestamp: l.timestamp,
    text: l.text,
  }));
}

export async function saveActivityLog(log: ActivityLog, guideEmail: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('registros_actividad').insert({
    id: log.id,
    guide_email: guideEmail,
    timestamp: log.timestamp,
    text: log.text,
  });
}

// ─── GUIDE SETTINGS ──────────────────────────────────────────────────────────

export async function getGuideSettings(guideEmail: string): Promise<GuideSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('configuracion_guia')
    .select('*')
    .eq('id', guideEmail)
    .single();
  if (error) { return null; }
  return data;
}

export async function saveGuideSettings(settings: GuideSettings): Promise<void> {
  const supabase = createClient();
  await supabase.from('configuracion_guia').upsert({
    id: settings.email,
    ...settings,
    updated_at: new Date().toISOString(),
  });
}

// ─── INCOMING WEBHOOKS ───────────────────────────────────────────────────────

export async function getIncomingWebhooks(guideEmail: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mensajes_entrantes')
    .select('*')
    .eq('guide_email', guideEmail)
    .order('created_at', { ascending: false });
  if (error) { console.error('Error fetching webhooks:', error); return []; }
  return data || [];
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
        lastMessageTime: last.createdAt,
        messages,
      });
    }
  }
  return conversations;
}

export async function updateLeadDetails(leadId: string, updates: Partial<Lead>): Promise<void> {
  const supabase = createClient();
  await supabase.from('leads').update({
    name: updates.name,
    phone: updates.phone,
    interest: updates.interest,
    destination: updates.destination,
    travel_date: updates.travelDate,
    people_count: updates.peopleCount,
    notes: updates.notes,
  }).eq('id', leadId);
}

export async function sendGuideReply(leadId: string, text: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('mensajes').insert({
    id: Date.now().toString(),
    lead_id: leadId,
    sender: 'guide',
    text,
  });
}

export function convertToYYYYMMDD(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toISOString().split('T')[0];
}

// ─── PROCESS INCOMING MESSAGE ─────────────────────────────────────────────────

export async function processIncomingMessage(guideEmail: string): Promise<void> {
  const supabase = createClient();
  const { data: webhooks } = await supabase
    .from('mensajes_entrantes')
    .select('*')
    .eq('guide_email', guideEmail)
    .order('created_at', { ascending: true });

  if (!webhooks || webhooks.length === 0) return;

  for (const webhook of webhooks) {
    const leadId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    await supabase.from('leads').upsert({
      id: leadId,
      guide_email: guideEmail,
      name: webhook.name,
      source: 'facebook',
      phone: webhook.phone,
      interest: webhook.text,
      status: 'new',
    });

    await supabase.from('mensajes').insert({
      id: Date.now().toString(),
      lead_id: leadId,
      sender: 'client',
      text: webhook.text,
    });

    await supabase.from('mensajes_entrantes').delete().eq('id', webhook.id);
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
  const supabase = createClient();
  const leadId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

  await supabase.from('leads').upsert({
    id: leadId,
    guide_email: guideEmail,
    name,
    source,
    phone,
    interest: text,
    status: 'new',
  });

  await supabase.from('mensajes').insert({
    id: Date.now().toString(),
    lead_id: leadId,
    sender: 'client',
    text,
  });
}
