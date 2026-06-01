import React, { useState } from 'react';
import { Lead } from '@/utils/mockLeads';

interface LeadFormProps {
  onSubmit: (lead: { name: string; contact: string; source: Lead['source'] }) => void;
  onCancel: () => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [source, setSource] = useState<Lead['source']>('whatsapp');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    onSubmit({ name, contact, source });
    setName('');
    setContact('');
    setSource('whatsapp');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 p-6 rounded-xl glass-panel border border-white/5 w-96"
    >
      <h2 className="text-xl font-bold mb-4 text-white">Nuevo Lead</h2>
      <div className="mb-3">
        <label className="block text-sm text-slate-300 mb-1" htmlFor="lead-name">
          Nombre
        </label>
        <input
          id="lead-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm text-slate-300 mb-1" htmlFor="lead-contact">
          Contacto (teléfono o @user)
        </label>
        <input
          id="lead-contact"
          type="text"
          value={contact}
          onChange={e => setContact(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-slate-300 mb-1" htmlFor="lead-source">
          Fuente
        </label>
        <select
          id="lead-source"
          value={source}
          onChange={e => setSource(e.target.value as Lead['source'])}
          className="w-full px-3 py-2 bg-slate-800 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-300 hover:text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default LeadForm;
