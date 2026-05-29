// utils/mockLeads.ts
export interface Lead {
  id: string;
  name: string;
  contact: string;
  source: 'whatsapp' | 'instagram' | 'facebook';
  // Additional fields for CRM
  interest?: string;
  status?: 'new' | 'contacted' | 'negotiating' | 'won' | 'lost';
  phone?: string;
  date?: string;
}

const STORAGE_KEY = 'andara_leads_v2';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial seed data (used if storage empty)
const SAMPLE_LEADS: Lead[] = [
  { id: generateId(), name: 'Carlos Mendoza', contact: '+51999999999', source: 'whatsapp', interest: 'Tour Huacachina (2 pax)', status: 'new', phone: '+51999999999', date: 'Hoy, 10:30 AM' },
  { id: generateId(), name: 'Ana Silva', contact: '@ana.lopez', source: 'instagram', interest: 'Líneas de Nazca', status: 'new', phone: '+51987654321', date: 'Hoy, 09:15 AM' },
  { id: generateId(), name: 'Mario Rossi', contact: 'mario.rossi12', source: 'facebook', interest: 'City Tour Lima', status: 'contacted', date: 'Ayer' },
  { id: generateId(), name: 'Familia Gómez', contact: '+51988888888', source: 'whatsapp', interest: 'Islas Ballestas', status: 'contacted', phone: '+51988888888', date: 'Ayer' },
  { id: generateId(), name: 'John Doe', contact: '+15551234567', source: 'whatsapp', interest: 'Tour Huacachina VIP', status: 'negotiating', phone: '+15551234567', date: 'Ayer' },
  { id: generateId(), name: 'Elena Rojas', contact: 'elena.rojas', source: 'facebook', interest: 'Paracas Full Day', status: 'new', date: 'Ayer' },
];

export function seedLeads() {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return; // already seeded
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_LEADS));
}

export function getLeads(): Lead[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addLead(lead: Omit<Lead, 'id'>): Lead {
  if (typeof window === 'undefined') throw new Error('Cannot add lead on server');
  const leads = getLeads();
  const newLead: Lead = { id: generateId(), ...lead };
  const updated = [...leads, newLead];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newLead;
}

export function updateLeadStatus(id: string, newStatus: Lead['status']) {
  if (typeof window === 'undefined') return;
  const leads = getLeads();
  const updated = leads.map(l => (l.id === id ? { ...l, status: newStatus } : l));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getLeadsBySource(source: 'whatsapp' | 'instagram' | 'facebook'): Lead[] {
  return getLeads().filter(l => l.source === source);
}

export function exportLeadsCSV(): string {
  const leads = getLeads();
  const header = ['id','name','contact','source','interest','status','phone','date'];
  const rows = leads.map(l => header.map(h => (l as any)[h] ?? '').join(','));
  return [header.join(','), ...rows].join('\n');
}
