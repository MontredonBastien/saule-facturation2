import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import ClientSearchInput from './ClientSearchInput';
import BaseDocumentForm from './forms/BaseDocumentForm';
import { Invoice } from '../types';
import { calculateTotalHT, calculateTotalVAT, calculateTotalTTC, addDays, formatDate, formatCurrency } from '../utils/calculations';
import { Zap } from 'lucide-react';

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onClose: () => void;
}

export default function InvoiceForm({ invoice, onClose }: InvoiceFormProps) {
  const { invoices, addInvoice, updateInvoice, settings } = useApp();
  const [formData, setFormData] = useState<Partial<Invoice>>({
    clientId: '',
    status: 'draft',
    issuedAt: new Date(),
    dueDate: addDays(new Date(), (settings?.defaults?.paymentDelay || 30)),
    reference: '',
    paymentMethod: (settings?.lists?.paymentMethods?.[0] || 'virement'),
    lines: [],
    totalHT: 0,
    totalVAT: 0,
    totalTTC: 0,
    paidAmount: 0,
    remainingAmount: 0,
    comments: '',
    showComments: true,
    globalDiscount: 0,
    globalDiscountType: 'percentage',
    showCgv: false,
    showCgl: false,
    showLegalConditions: true,
    depositReceived: undefined, // undefined = pas encore défini
    depositAmount: 0
  });
  const [dateError, setDateError] = useState<string>('');
  const [electronicFormat, setElectronicFormat] = useState<'standard' | 'factur-x'>('standard');

  // Vérifier si la facturation électronique est activée
  const isElectronicEnabled = () => {
    try {
      const electronicSettings = JSON.parse(localStorage.getItem('electronic_invoicing_settings') || '{}');
      return electronicSettings.enabled === true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    } else if (settings?.defaults) {
      setFormData(prev => ({
        ...prev,
        dueDate: addDays(prev.issuedAt || new Date(), settings.defaults.paymentDelay),
        comments: prev.comments || settings.defaults.invoiceComment,
        showCgv: settings.documentTemplate?.defaults?.showCgvOnNewInvoices || false,
        showCgl: settings.documentTemplate?.defaults?.showCglOnNewInvoices || false,
        showLegalConditions: settings.documentTemplate?.defaults?.showLegalConditionsOnNewInvoices !== false,
        showComments: settings.documentTemplate?.defaults?.showCommentsOnNewInvoices !== false
      }));
    }
  }, [invoice, settings]);

  useEffect(() => {
    if (formData.lines) {
      const totalHT = calculateTotalHT(formData.lines);
      const totalVAT = calculateTotalVAT(formData.lines);
      const totalTTC = calculateTotalTTC(formData.lines);
      
      setFormData(prev => ({
        ...prev,
        totalHT,
        totalVAT,
        totalTTC,
        remainingAmount: Math.max(0, totalTTC - (prev.paidAmount || 0))
      }));
    }
  }, [formData.lines, formData.paidAmount]);

  useEffect(() => {
    if (formData.issuedAt) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      const otherInvoices = invoices.filter(i => 
        i.id !== invoice?.id && 
        (i.status === 'issued' || i.status === 'sent' || i.status === 'paid')
      );
      
      if (formData.issuedAt > today) {
        setDateError(`Date dans le futur non autorisée`);
        return;
      }
      
      if (otherInvoices.length > 0) {
        const lastInvoice = otherInvoices
          .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())[0];
        
        if (formData.issuedAt < new Date(lastInvoice.issuedAt)) {
          setDateError(`Date antérieure à la dernière facture (${formatDate(lastInvoice.issuedAt)})`);
          return;
        }
      }
      setDateError('');
    }
  }, [formData.issuedAt, invoices, invoice?.id]);

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

    if (!formData.lines?.length) {
      alert('Veuillez ajouter au moins une ligne');
      return;
    }

    // Vérifier si l'acompte est géré quand il y en a un
    if (formData.depositAmount && formData.depositAmount > 0 && formData.depositReceived === undefined) {
      alert('Veuillez indiquer si vous avez reçu l\'acompte avant de sauvegarder la facture');
      return;
    }
    try {
      if (invoice?.id) {
        await updateInvoice(invoice.id, formData);
      } else {
        const invoiceData = {
          ...formData,
          depositReceived: formData.depositReceived || false,
          electronicFormat: isElectronicEnabled() ? electronicFormat : undefined
        };
        await addInvoice(invoiceData as Omit<Invoice, 'id'>);
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
        
        {formData.quoteId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">📋 Facture issue du devis N°{formData.quoteId}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Date d'émission</label>
            <input
              type="date"
              value={formData.issuedAt?.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, issuedAt: new Date(e.target.value) }))}
              className={`w-full rounded-md shadow-sm ${
                dateError ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {dateError && <p className="mt-1 text-sm text-red-600">{dateError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date d'échéance</label>
            <input
              type="date"
              value={formData.dueDate?.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            >
              {settings.lists.paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Référence chantier</label>
            <input
              type="text"
              value={formData.reference || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Référence interne"
            />
          </div>
        </div>
      </div>

      {/* Options de facturation électronique */}
      {isElectronicEnabled() && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <Zap className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-blue-900">Facturation électronique</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format de la facture</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer">
                  <input
                    type="radio"
                    value="standard"
                    checked={electronicFormat === 'standard'}
                    onChange={(e) => setElectronicFormat(e.target.value as any)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">PDF Standard</div>
                    <div className="text-xs text-gray-600">Format classique</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                  <input
                    type="radio"
                    value="factur-x"
                    checked={electronicFormat === 'factur-x'}
                    onChange={(e) => setElectronicFormat(e.target.value as any)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-blue-900">Factur-X</div>
                    <div className="text-xs text-blue-700">PDF + XML intégré</div>
                  </div>
                </label>
              </div>
            </div>
            
            {electronicFormat === 'factur-x' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  ⚡ Factur-X activé : PDF/A-3 + XML EN16931 (démonstration)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gestion de l'acompte si le devis en avait un */}
      {formData.quoteId && formData.depositAmount && formData.depositAmount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">🔶 Acompte du devis</h3>
          <p className="text-sm text-gray-700 mb-3">
            Le devis prévoyait un acompte de <strong>{formatCurrency(formData.depositAmount)}</strong>.
          </p>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.depositReceived === true}
                onChange={() => setFormData(prev => ({ ...prev, depositReceived: true }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">✅ Acompte reçu - déduire du total de la facture</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.depositReceived === false}
                onChange={() => setFormData(prev => ({ ...prev, depositReceived: false }))}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">⏳ Acompte non encore reçu - inclure dans le total</span>
            </label>
          </div>
          
          {formData.depositReceived === undefined && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              ⚠️ Vous devez indiquer le statut de l'acompte avant de pouvoir émettre la facture
            </div>
          )}
          
          {formData.depositReceived === true && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                💰 Le montant de la facture sera réduit de {formatCurrency(formData.depositAmount)}
              </p>
              <p className="text-sm text-green-800 font-medium">
                Solde à payer : {formatCurrency(Math.max(0, (formData.totalTTC || 0) - formData.depositAmount))}
              </p>
            </div>
          )}
          
          {formData.depositReceived === false && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-800">
                ⏳ L'acompte sera inclus dans le montant total à facturer
              </p>
              <p className="text-sm text-orange-800 font-medium">
                Montant total à payer : {formatCurrency(formData.totalTTC || 0)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Gestion de l'acompte pour les nouvelles factures */}
      {formData.depositAmount && formData.depositAmount > 0 && !formData.quoteId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">🔶 Gestion de l'acompte</h3>
          <p className="text-sm text-gray-700 mb-3">
            {formData.quoteId ? 'Le devis prévoyait' : 'Cette facture comprend'} un acompte de <strong>{formatCurrency(formData.depositAmount)}</strong>.
          </p>
        </div>
      )}

      <BaseDocumentForm
        lines={formData.lines || []}
        onLinesChange={(lines) => setFormData(prev => ({ ...prev, lines }))}
        totalHT={formData.totalHT || 0}
        totalVAT={formData.totalVAT || 0}
        totalTTC={formData.totalTTC || 0}
        depositReceived={formData.depositReceived}
        depositAmount={formData.depositAmount}
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
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              ⚖️ <strong>Les conditions légales sont automatiquement intégrées</strong> à toutes les factures (obligations légales)
            </p>
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
          {invoice?.id ? 'Modifier' : 'Créer'} la facture
        </button>
      </div>
    </form>
  );
}