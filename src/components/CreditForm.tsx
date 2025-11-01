import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../contexts/AppContext';
import ClientSearchInput from './ClientSearchInput';
import BaseDocumentForm from './forms/BaseDocumentForm';
import { Credit } from '../types';
import { calculateTotalHT, calculateTotalVAT, calculateTotalTTC, formatCurrency, formatDate } from '../utils/calculations';

interface CreditFormProps {
  credit?: Credit | null;
  onClose: () => void;
}

export default function CreditForm({ credit, onClose }: CreditFormProps) {
  const { clients, invoices, credits, addCredit, updateCredit, settings } = useApp();
  const [formData, setFormData] = useState<Partial<Credit>>({
    clientId: '',
    status: 'draft',
    createdAt: new Date(),
    invoiceId: '',
    reason: '',
    lines: [],
    totalHT: 0,
    totalVAT: 0,
    totalTTC: 0,
    comments: '',
    showComments: true,
    globalDiscount: 0,
    globalDiscountType: 'percentage',
    showCgv: false,
    showCgl: false,
    showLegalConditions: false
  });
  const [dateError, setDateError] = useState<string>('');

  useEffect(() => {
    if (credit) {
      setFormData(credit);
    }
  }, [credit]);

  useEffect(() => {
    if (formData.lines) {
      const totalHT = calculateTotalHT(formData.lines);
      const totalVAT = calculateTotalVAT(formData.lines);
      const totalTTC = calculateTotalTTC(formData.lines);
      setFormData(prev => ({ ...prev, totalHT, totalVAT, totalTTC }));
    }
  }, [formData.lines]);

  useEffect(() => {
    if (formData.createdAt) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (formData.createdAt > today) {
        setDateError(`Date dans le futur non autorisée`);
        return;
      }
      
      const otherCredits = credits.filter(c => 
        c.id !== credit?.id && c.status === 'validated'
      );
      
      if (otherCredits.length > 0) {
        const lastCredit = otherCredits
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (formData.createdAt < new Date(lastCredit.createdAt)) {
          setDateError(`Date antérieure au dernier avoir (${formatDate(lastCredit.createdAt)})`);
          return;
        }
      }
      setDateError('');
    }
  }, [formData.createdAt, credits, credit?.id]);

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        reason: `Avoir sur facture ${invoice.number || invoice.id}`,
        lines: invoice.lines.map(line => ({
          ...line,
          id: uuidv4()
        }))
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dateError) {
      alert(dateError);
      return;
    }
    
    if (!formData.clientId) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (!formData.reason?.trim()) {
      alert('Veuillez indiquer le motif');
      return;
    }

    if (!formData.lines?.length) {
      alert('Veuillez ajouter au moins une ligne');
      return;
    }

    try {
      if (credit?.id) {
        await updateCredit(credit.id, formData);
      } else {
        await addCredit(formData as Omit<Credit, 'id'>);
      }
      onClose();
    } catch (error) {
      alert('Erreur : ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
        
        {formData.invoiceId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">🧾 Avoir issu de la facture N°{formData.invoiceId}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
            <ClientSearchInput
              selectedClientId={formData.clientId || ''}
              onClientSelect={(clientId) => setFormData(prev => ({ ...prev, clientId }))}
              placeholder="Rechercher un client..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facture d'origine</label>
            <select
              value={formData.invoiceId || ''}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Aucune facture liée</option>
              {invoices
                .filter(i => i.status !== 'draft' && (!formData.clientId || i.clientId === formData.clientId))
                .map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.number || invoice.id} - {formatCurrency(invoice.totalTTC)}
                  </option>
                ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Motif *</label>
            <input
              type="text"
              value={formData.reason || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Motif de l'avoir"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de création</label>
            <input
              type="date"
              value={formData.createdAt?.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, createdAt: new Date(e.target.value) }))}
              className={`w-full rounded-md shadow-sm ${
                dateError ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {dateError && <p className="mt-1 text-sm text-red-600">{dateError}</p>}
          </div>
        </div>
      </div>

      <BaseDocumentForm
        lines={formData.lines || []}
        onLinesChange={(lines) => setFormData(prev => ({ ...prev, lines }))}
        totalHT={formData.totalHT || 0}
        totalVAT={formData.totalVAT || 0}
        totalTTC={formData.totalTTC || 0}
        globalDiscount={formData.globalDiscount}
        globalDiscountType={formData.globalDiscountType}
        onGlobalDiscountChange={(discount, discountType) => 
          setFormData(prev => ({ ...prev, globalDiscount: discount, globalDiscountType: discountType }))
        }
      />

      <div className="space-y-4">
        {/* Options d'affichage */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Options d'affichage</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showCgv !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, showCgv: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Afficher les CGV</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showCgl !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, showCgl: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Afficher les CGL</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showComments !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, showComments: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Afficher les commentaires</span>
            </label>
          </div>
        </div>
        
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Commentaires</label>
        <textarea
          value={formData.comments || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
          className="w-full rounded-md border-gray-300 shadow-sm"
          rows={4}
          placeholder="Commentaires"
        />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
          {credit?.id ? 'Modifier' : 'Créer'} l'avoir
        </button>
      </div>
    </form>
  );
}