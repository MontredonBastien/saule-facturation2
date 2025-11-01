import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'quote' | 'invoice' | 'credit' | 'client' | 'user';
}

const statusConfig = {
  quote: {
    draft: { label: 'Brouillon', className: 'bg-gray-200 text-gray-700 border border-gray-300' },
    validated: { label: 'Validé', className: 'bg-teal-200 text-teal-800 border border-teal-300' },
    sent: { label: 'Envoyé', className: 'bg-blue-200 text-blue-800 border border-blue-300' },
    accepted: { label: 'Accepté', className: 'bg-green-200 text-green-800 border border-green-300' },
    refused: { label: 'Refusé', className: 'bg-red-200 text-red-800 border border-red-300' },
    validated_sent: { label: 'Validé et envoyé', className: 'bg-blue-200 text-blue-800 border border-blue-300' },
    validated_accepted: { label: 'Validé et accepté', className: 'bg-emerald-200 text-emerald-800 border border-emerald-300' },
    sent_refused: { label: 'Envoyé et refusé', className: 'bg-orange-200 text-orange-800 border border-orange-300' },
  },
  invoice: {
    draft: { label: 'Brouillon', className: 'bg-gray-200 text-gray-700 border border-gray-300' },
    issued: { label: 'Émise', className: 'bg-blue-200 text-blue-800 border border-blue-300' },
    sent: { label: 'Envoyée', className: 'bg-blue-200 text-blue-800 border border-blue-300' },
    partially_paid: { label: 'Payée partiellement', className: 'bg-amber-200 text-amber-800 border border-amber-300' },
    paid: { label: 'Payée intégralement', className: 'bg-green-200 text-green-800 border border-green-300' },
    overdue: { label: 'En retard', className: 'bg-red-200 text-red-800 border border-red-300' },
    cancelled: { label: 'Annulée par avoir', className: 'bg-rose-200 text-rose-800 border border-rose-300' },
  },
  credit: {
    draft: { label: 'Brouillon', className: 'bg-gray-200 text-gray-700 border border-gray-300' },
    validated: { label: 'Validé', className: 'bg-teal-200 text-teal-800 border border-teal-300' },
    sent: { label: 'Envoyé', className: 'bg-blue-200 text-blue-800 border border-blue-300' },
    applied: { label: 'Affecté', className: 'bg-green-200 text-green-800 border border-green-300' },
  },
  client: {
    active: { label: 'Actif', className: 'bg-green-200 text-green-800 border border-green-300' },
    inactive: { label: 'Inactif', className: 'bg-gray-200 text-gray-600 border border-gray-300' },
    archived: { label: 'Archivé', className: 'bg-slate-200 text-slate-600 border border-slate-300' },
  },
  user: {
    active: { label: 'Actif', className: 'bg-green-200 text-green-800 border border-green-300' },
    pending: { label: 'En attente', className: 'bg-orange-200 text-orange-800 border border-orange-300' },
    inactive: { label: 'Inactif', className: 'bg-gray-200 text-gray-600 border border-gray-300' },
  }
};

export default function StatusBadge({ status, type = 'quote' }: StatusBadgeProps) {
  const config = statusConfig[type]?.[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}