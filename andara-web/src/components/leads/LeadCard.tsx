import React from 'react';
import { Phone, Camera, Globe } from 'lucide-react';
import { type Lead } from "@/lib/services/crm";

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const getIcon = () => {
    switch (lead.source) {
      case 'whatsapp': return React.createElement(Phone, {className: "w-5 h-5 text-primary"});
      case 'instagram': return React.createElement(Camera, {className: "w-5 h-5 text-pink-500"});
      case 'facebook': return React.createElement(Globe, {className: "w-5 h-5 text-blue-600"});
      default: return null;
    }
  };

  const magicUrl = () => {
    if (lead.source === 'whatsapp') return 'https://wa.me/' + (lead.phone || '').replace(/\D/g, '');
    if (lead.source === 'instagram') return 'https://instagram.com/' + (lead.phone || '').replace('@', '');
    if (lead.source === 'facebook') return 'https://facebook.com/' + (lead.phone || '');
    return '#';
  };

  return React.createElement('div', {className: "glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 flex flex-col space-y-3"},
    React.createElement('div', {className: "flex items-center space-x-2"},
      getIcon(),
      React.createElement('span', {className: "text-sm font-medium text-white"}, lead.name)
    ),
    React.createElement('p', {className: "text-xs text-slate-400 break-all"}, lead.phone),
    React.createElement('a', {
      href: magicUrl(),
      target: "_blank",
      rel: "noopener noreferrer",
      className: "mt-2 w-full text-center py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    }, 'Boton Magico')
  );
};

export default LeadCard;
