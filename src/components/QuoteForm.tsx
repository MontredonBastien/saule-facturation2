import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import ClientSearchInput from './ClientSearchInput';
import BaseDocumentForm from './forms/BaseDocumentForm';
import { Quote } from '../types';
import { calculateTotalHT, calculateTotalVAT, calculateTotalTTC, addDays } from '../utils/calculations';

interface QuoteFormProps {
  quote?: Quote | null;
  onClose: () => void;
}

export default function QuoteForm({ quote, onClose }: QuoteFormProps) {
  const { addQuote, updateQuote, settings } = useApp();
  const [formData, setFormData] = useState<Partial<Quote>>({
    clientId: '',
    status: 'draft',
    createdAt: new Date(),
    validUntil: addDays(new Date(), 30),
    reference: '',
    lines: [],
    totalHT: 0,
    totalVAT: 0,
    totalTTC: 0,
    depositPercentage: 0,
    depositAmount: 0,
    comments: '',
    showComments: true,
    globalDiscount: 0,
    globalDiscountType: 'percentage',
    showCgv: false,
    showCgl: false
  });

  useEffect(() => {
    if (quote) {
      setFormData(quote);
    } else if (settings?.defaults) {
      setFormData(prev => ({
        ...prev,
        validUntil: addDays(new Date(), settings.defaults.quoteValidity),
        comments: settings.defaults.quoteComment || '',
        showCgv: settings.documentTemplate?.defaults?.showCgvOnNewQuotes || false,
        showCgl: settings.documentTemplate?.defaults?.showCglOnNewQuotes || false,
        showComments: settings.documentTemplate?.defaults?.showCommentsOnNewQuotes !== false
      }));
    }
  }, [quote, settings]);

  useEffect(() => {
    if (formData.lines) {
      const totalHT = calculateTotalHT(formData.lines);
      const totalVAT = calculateTotalVAT(formData.lines);
      const totalTTC = calculateTotalTTC(formData.lines);
      const depositAmount = (formData.depositPercentage || 0) > 0 ? 
        Math.round(totalTTC * (formData.depositPercentage || 0) / 100 * 100) / 100 : 0;
      
      setFormData(prev => ({ ...prev, totalHT, totalVAT, totalTTC, depositAmount }));
    }
  }, [formData.lines, formData.depositPercentage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.clientId) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (!formData.lines?.length) {
      alert('Veuillez ajouter au moins une ligne');
      return;
    }

    try {
      const quoteData = {
        ...formData,
        createdAt: formData.createdAt || new Date(),
        validUntil: formData.validUntil || addDays(new Date(), 30),
        showComments: formData.showComments !== false
      };
      
      if (quote?.id) {
        await updateQuote(quote.id, quoteData);
      } else {
        await addQuote(quoteData as Omit<Quote, 'id'>);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du devis:', error);
      alert('Erreur : ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
        
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de création</label>
            <input
              type="date"
              value={formData.createdAt?.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, createdAt: new Date(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date d'échéance</label>
            <input
              type="date"
              value={formData.validUntil?.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, validUntil: new Date(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Référence chantier</label>
            <input
              type="text"
              value={formData.reference || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Référence interne"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conditions de règlement
              <span className="text-xs text-gray-500 ml-2">(affiché sur le PDF du devis)</span>
            </label>
            <select
              value={formData.paymentConditions || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentConditions: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Sélectionner une condition...</option>
              {(settings?.lists?.paymentConditions || []).map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Gérez les conditions prédéfinies dans Paramètres → Listes
            </p>
          </div>
        </div>
      </div>

      <BaseDocumentForm
        lines={formData.lines || []}
        onLinesChange={(lines) => setFormData(prev => ({ ...prev, lines }))}
        showDeposit={true}
        depositPercentage={formData.depositPercentage}
        onDepositChange={(percentage) => setFormData(prev => ({ ...prev, depositPercentage: percentage }))}
        totalHT={formData.totalHT || 0}
        totalVAT={formData.totalVAT || 0}
        totalTTC={formData.totalTTC || 0}
        depositAmount={formData.depositAmount || 0}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commentaires
          </label>
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
          {quote?.id ? 'Modifier' : 'Créer'} le devis
        </button>
      </div>
    </form>
  );
}