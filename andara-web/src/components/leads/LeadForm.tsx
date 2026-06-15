import React, { useState } from 'react';
import { type Lead } from "@/lib/services/crm";

interface LeadFormProps {
  onSubmit: (lead: { name: string; contact: string; source: Lead['source'] }) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [source, setSource] = useState<Lead['source']>('whatsapp');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    onSubmit({ name, contact, source });
    setName('');
    setContact('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full p-2 rounded-lg border border-border bg-background text-foreground"
      />
      <input
        type="text"
        placeholder="Contacto"
        value={contact}
        onChange={e => setContact(e.target.value)}
        className="w-full p-2 rounded-lg border border-border bg-background text-foreground"
      />
      <select
        value={source}
        onChange={e => setSource(e.target.value as Lead['source'])}
        className="w-full p-2 rounded-lg border border-border bg-background text-foreground"
      >
        <option value="whatsapp">WhatsApp</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
      </select>
      <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg">
        Agregar Lead
      </button>
    </form>
  );
};

export default LeadForm;
