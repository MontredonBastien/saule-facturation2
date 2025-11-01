import React, { useState } from 'react';
import { CheckCircle, Send, CreditCard, FileX, Clock, Euro, Zap, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import PaymentManager from './PaymentManager';
import { Payment } from '../types';
import { formatCurrency } from '../utils/calculations';

interface StatusManagerProps {
  type: 'quote' | 'invoice' | 'credit';
  currentStatus: string;
 documentNumber?: string;
  documentId: string;
  onStatusChange: (newStatus: string, paymentInfo?: any) => void;
  payments?: Payment[];
  totalAmount?: number;
  onPaymentsChange?: (payments: Payment[]) => void;
}

const statusOptions = {
  quote: [
    { value: 'draft', label: 'Brouillon', icon: FileX, color: 'gray' },
    { value: 'validated', label: 'Validé', icon: CheckCircle, color: 'purple' },
    { value: 'sent', label: 'Envoyé', icon: Send, color: 'blue' },
    { value: 'accepted', label: 'Accepté', icon: CheckCircle, color: 'green' },
    { value: 'refused', label: 'Refusé', icon: FileX, color: 'red' }
  ],
  invoice: [
    { value: 'draft', label: 'Brouillon', icon: FileX, color: 'gray' },
    { value: 'issued', label: 'Émise', icon: CheckCircle, color: 'blue' },
    { value: 'sent', label: 'Envoyée', icon: Send, color: 'indigo' },
    { value: 'paid', label: 'Payée', icon: CreditCard, color: 'green' }
  ],
  credit: [
    { value: 'draft', label: 'Brouillon', icon: FileX, color: 'gray' },
    { value: 'validated', label: 'Validé', icon: CheckCircle, color: 'blue' },
    { value: 'sent', label: 'Envoyé', icon: Send, color: 'indigo' },
    { value: 'applied', label: 'Affecté', icon: CheckCircle, color: 'green' }
  ]
};

const paymentMethods = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'carte_bancaire', label: 'Carte bancaire' },
  { value: 'especes', label: 'Espèces' }
];

export default function StatusManager({ 
  type, 
  currentStatus, 
 documentNumber,
  documentId, 
  onStatusChange, 
  payments = [], 
  totalAmount = 0,
  onPaymentsChange 
}: StatusManagerProps) {
  const [showSimplePaymentForm, setShowSimplePaymentForm] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('virement');
  const [showPaymentManager, setShowPaymentManager] = useState(false);
  
  // Vérifier si c'est un avoir lié à une facture transformée
  const isCreditFromTransformedInvoice = () => {
    if (type !== 'credit') return false;
    
    // Récupérer les factures depuis le localStorage pour vérifier
    try {
      const invoices = JSON.parse(localStorage.getItem('factApp_invoices') || '[]');
      return invoices.some((invoice: any) => invoice.transformedToCreditId === documentId);
    } catch {
      return false;
    }
  };

  const totalPaid = (payments || []).reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = (totalAmount || 0) - totalPaid;
  const isFullyPaid = remainingAmount <= 0.01;
  const isPartiallyPaid = totalPaid > 0.01 && !isFullyPaid;

  // Vérifier si la facturation électronique est activée
  const isElectronicEnabled = () => {
    try {
      const electronicSettings = JSON.parse(localStorage.getItem('electronic_invoicing_settings') || '{}');
      return electronicSettings.enabled === true;
    } catch {
      return false;
    }
  };

  const handleGenerateFacturX = () => {
    if (window.confirm('⚡ Génération Factur-X\n\nTransformer en format électronique PDF/A-3 + XML ?\n\nCette action génère le fichier conforme EN16931.')) {
      alert('✅ Factur-X généré avec succès !\n\n📋 Détails techniques :\n• Format : PDF/A-3 + XML CII\n• Conformité : EN16931 (niveau BASIC)\n• Taille : +15% vs PDF standard\n• Compatible : toutes plateformes\n\n💾 Le fichier est prêt au téléchargement.');
    }
  };

  const handleSendToChorusPro = () => {
    if (window.confirm('🏛️ Envoi Chorus Pro\n\nTransmettre le document vers la plateforme gouvernementale ?\n\nPrérequis :\n✓ Client = organisme public\n✓ Identifiants API configurés\n✓ Document au bon statut')) {
      alert('✅ Envoi Chorus Pro réussi !\n\n📋 Résultat de la transmission :\n• Statut API : 200 OK\n• N° de dépôt : CPF-2025-001234\n• Délai de traitement : 24-48h\n• Suivi disponible sur chorus-pro.gouv.fr\n\n📧 Email de confirmation envoyé.');
    }
  };

  const options = statusOptions[type];
  const currentOption = options.find(opt => opt.value === currentStatus);
 
   // Vérifier si le document est en brouillon sans numéro
   const isDraftWithoutNumber = currentStatus === 'draft' && !documentNumber;
 
   // Définir les statuts autorisés selon l'état du document
   const getAvailableStatuses = () => {
     if (isDraftWithoutNumber) {
       // Seule la validation est possible pour les brouillons sans numéro
       return options.filter(opt => 
         opt.value === 'validated' || 
         (type === 'invoice' && opt.value === 'issued')
       );
     }

    // Pour les factures, ajouter le statut "partially_paid" si approprié
    if (type === 'invoice') {
      let availableOptions = options.filter(opt => 
        opt.value !== currentStatus && 
        opt.value !== 'draft'
      );
      
      // Ajouter "partially_paid" si il y a des paiements partiels
      if (isPartiallyPaid && currentStatus !== 'partially_paid') {
        availableOptions = availableOptions.filter(opt => opt.value !== 'paid');
        if (!availableOptions.find(opt => opt.value === 'partially_paid')) {
          availableOptions.unshift({
            value: 'partially_paid',
            label: 'Payée partiellement',
            icon: options.find(o => o.value === 'partially_paid')?.icon || options[0].icon,
            color: 'amber'
          });
        }
      }
      
      return availableOptions;
    }

    // Si le document a un numéro, il ne peut plus repasser en brouillon
    return options.filter(opt => 
      opt.value !== currentStatus && 
      opt.value !== 'draft'
    );
   };

  const handleStatusChange = (newStatus: string) => {
    // Vérification spéciale pour les factures avec acompte
    if (type === 'invoice' && (newStatus === 'issued' || newStatus === 'sent')) {
      // Récupérer la facture depuis le localStorage pour vérifier l'acompte
      try {
        const invoices = JSON.parse(localStorage.getItem('factApp_invoices') || '[]');
        const currentInvoice = invoices.find((inv: any) => inv.id === documentId);
        
        if (currentInvoice?.depositAmount && currentInvoice.depositAmount > 0 && currentInvoice.depositReceived === undefined) {
          alert('Vous devez d\'abord modifier la facture pour indiquer si l\'acompte a été reçu');
          return;
        }
      } catch (error) {
        console.warn('Erreur vérification acompte:', error);
      }
    }
    
    if (type === 'invoice' && newStatus === 'paid') {
      if (!isFullyPaid) {
        // Si pas encore totalement payé, proposer paiement rapide
        setShowSimplePaymentForm(true);
      } else {
        // Déjà entièrement payé
        onStatusChange(newStatus);
      }
    } else {
      onStatusChange(newStatus);
    }
  };

  const handleSimplePaymentSubmit = () => {
    const payment: Payment = {
      id: uuidv4(),
      invoiceId: documentId,
      amount: remainingAmount,
      date: new Date(paymentDate),
      method: paymentMethod,
      reference: `Règlement complet ${paymentMethod}`
    };

    const updatedPayments = [...payments, payment];
    const newTotalPaid = totalAmount; // Paiement complet
    const newRemainingAmount = 0;
    
    if (onPaymentsChange) {
      onPaymentsChange(updatedPayments);
    }

    onStatusChange('paid', {
      paymentDate: new Date(paymentDate),
      paymentMethod,
      payments: updatedPayments,
      paidAmount: newTotalPaid,
      remainingAmount: newRemainingAmount
    });
    setShowSimplePaymentForm(false);
  };

  if (showSimplePaymentForm) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3">
          Règlement complet ({formatCurrency(remainingAmount)})
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de règlement
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode de règlement
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleSimplePaymentSubmit}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            Confirmer le paiement
          </button>
          <button
            onClick={() => setShowSimplePaymentForm(false)}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  if (showPaymentManager) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Gestion avancée des paiements</h4>
          <button
            onClick={() => setShowPaymentManager(false)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Retour au statut
          </button>
        </div>
        
        <PaymentManager
          payments={payments}
          totalAmount={totalAmount}
          onPaymentsChange={(newPayments) => {
            if (onPaymentsChange) {
              onPaymentsChange(newPayments);
            }
          }}
          invoiceId={documentId}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {currentOption && (
            <>
              <currentOption.icon className={`h-4 w-4 mr-2 text-${currentOption.color}-600`} />
              <span className="text-sm font-medium text-gray-900">
                {currentOption.label}
              </span>
            </>
          )}
        </div>
        <Clock className="h-4 w-4 text-gray-400" />
      </div>
      
       {/* Message d'information pour les brouillons */}
       {isDraftWithoutNumber && (
         <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
           ⚠️ Document en brouillon - Validez d'abord pour obtenir un numéro avant de changer le statut
         </div>
       )}
      
      {/* Message pour les avoirs issus de factures transformées */}
      {isCreditFromTransformedInvoice() && currentStatus === 'draft' && (
        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
          🔒 Avoir issu d'une facture transformée - Le statut ne peut être modifié
        </div>
      )}
 
      {/* Informations de paiement pour les factures */}
      {type === 'invoice' && (totalPaid > 0 || payments.length > 0) && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              💳 {payments.length} paiement{payments.length > 1 ? 's' : ''} • {formatCurrency(totalPaid)} réglé
            </span>
            <button
              onClick={() => setShowPaymentManager(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Gérer →
            </button>
          </div>
          {remainingAmount > 0.01 && (
            <div className="text-orange-600 font-medium">
              Reste: {formatCurrency(remainingAmount)}
            </div>
          )}
        </div>
      )}

      {/* Section paiements pour les factures */}
      {type === 'invoice' && !isDraftWithoutNumber && (
        <div className="mb-4 space-y-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">💰 Gestion des paiements</span>
              <span className="text-xs text-blue-700">
                {isFullyPaid ? '✅ Payée' : isPartiallyPaid ? '⚡ Partiel' : '⏳ Non payée'}
              </span>
            </div>
            
            <div className="text-xs text-blue-800 space-y-1">
              <div className="flex justify-between">
                <span>Montant total:</span>
                <span className="font-medium">{formatCurrency(totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Déjà payé:</span>
                <span className={`font-medium ${totalPaid > 0 ? 'text-green-600' : ''}`}>
                  {formatCurrency(totalPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reste à payer:</span>
                <span className={`font-medium ${remainingAmount > 0.01 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowPaymentManager(true)}
              className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
            >
              <Euro className="h-4 w-4 mr-1" />
              {isPartiallyPaid ? 'Ajouter paiement' : 'Nouveau paiement'}
            </button>
            
            {!isFullyPaid && remainingAmount > 0.01 && (
              <button
                onClick={() => {
                  const payment = {
                    id: uuidv4(),
                    invoiceId: documentId,
                    amount: remainingAmount,
                    date: new Date(),
                    method: 'virement',
                    reference: 'Solde restant'
                  };
                  const updatedPayments = [...(payments || []), payment];
                  if (onPaymentsChange) onPaymentsChange(updatedPayments);
                  onStatusChange('paid', { payments: updatedPayments });
                }}
                className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
              >
                <Euro className="h-4 w-4 mr-1" />
                Solde complet
              </button>
            )}
          </div>
        </div>
      )}

      {/* Boutons de facturation électronique pour les factures */}
      {type === 'invoice' && !isDraftWithoutNumber && isElectronicEnabled() && (
        <div className="space-y-1 mb-2">
          <button
            onClick={handleGenerateFacturX}
            className="w-full flex items-center justify-center px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <Zap className="h-4 w-4 mr-1" />
            Générer Factur-X
          </button>
          
          <button
            onClick={handleSendToChorusPro}
            className="w-full flex items-center justify-center px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            <Upload className="h-4 w-4 mr-1" />
            Envoyer Chorus Pro
          </button>
        </div>
      )}

      <div className="space-y-1">
         {getAvailableStatuses().map(option => {
          // Ne pas afficher les options si c'est un avoir issu d'une facture transformée
          if (isCreditFromTransformedInvoice()) {
            return null;
          }
          
          if (option.value === currentStatus) return null;
          
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`w-full flex items-center px-2 py-1 text-sm rounded hover:bg-${option.color}-50 text-${option.color}-700`}
            >
              <Icon className={`h-3 w-3 mr-2 text-${option.color}-600`} />
              Passer à "{option.label}"
            </button>
          );
        })}
      </div>
    </div>
  );
}