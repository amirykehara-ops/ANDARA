import React from 'react';
import { Phone, Camera, Globe } from 'lucide-react';
import { Lead } from '../../utils/mockLeads';

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const getIcon = () => {
    switch (lead.source) {
      case 'whatsapp':
        return <Phone className="w-5 h-5 text-primary" />;
      case 'instagram':
        return <Camera className="w-5 h-5 text-pink-500" />;
      case 'facebook':
        return <Globe className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const magicUrl = () => {
    // Simple placeholder URLs for each source
    if (lead.source === 'whatsapp') {
      return `https://wa.me/${lead.contact.replace(/\D/g, '')}`;
    }
    if (lead.source === 'instagram') {
      return `https://instagram.com/${lead.contact.replace('@', '')}`;
    }
    if (lead.source === 'facebook') {
      return `https://facebook.com/${lead.contact}`;
    }
    return '#';
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        {getIcon()}
        <span className="text-sm font-medium text-white">{lead.name}</span>
      </div>
      <p className="text-xs text-slate-400 break-all">{lead.contact}</p>
      <a
        href={magicUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 w-full text-center py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        Botón Mágico
      </a>
    </div>
  );
};
export default LeadCard;
