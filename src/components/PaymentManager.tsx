import React, { useState } from 'react';
import { Plus, Trash2, CreditCard, Calendar, Euro, FileText, Paperclip } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Payment, Attachment } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';
import AttachmentManager from './AttachmentManager';

interface PaymentManagerProps {
  payments: Payment[];
  totalAmount: number;
  onPaymentsChange: (payments: Payment[]) => void;
  invoiceId: string;
}

const paymentMethods = [
  { value: 'virement', label: 'Virement bancaire' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'carte_bancaire', label: 'Carte bancaire' },
  { value: 'especes', label: 'Espèces' },
  { value: 'compensation', label: 'Compensation' }
];

export default function PaymentManager({ payments, totalAmount, onPaymentsChange, invoiceId }: PaymentManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'virement',
    reference: '',
    attachments: [] as Attachment[]
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalAmount - totalPaid;
  const isFullyPaid = remainingAmount <= 0.01; // Tolérance pour les arrondis

  const handleAddPayment = () => {
    if (newPayment.amount <= 0) {
      alert('Le montant doit être supérieur à 0');
      return;
    }

    // Permettre les paiements partiels sans restriction
    // if (newPayment.amount > remainingAmount + 0.01) {
    //   alert(`Le montant ne peut pas dépasser le reste à payer (${formatCurrency(remainingAmount)})`);
    //   return;
    // }

    const payment: Payment = {
      id: uuidv4(),
      invoiceId,
      amount: newPayment.amount,
      date: new Date(newPayment.date),
      method: newPayment.method,
      reference: newPayment.reference,
      attachments: newPayment.attachments
    };

    const updatedPayments = [...payments, payment];
    
    onPaymentsChange(updatedPayments);

    // Reset form
    setNewPayment({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'virement',
      reference: '',
      attachments: []
    });
    setShowAddForm(false);
  };

  const handleRemovePayment = (paymentId: string) => {
    if (window.confirm('Supprimer ce paiement ?')) {
      onPaymentsChange(payments.filter(p => p.id !== paymentId));
    }
  };

  const getMethodLabel = (method: string) => {
    return paymentMethods.find(m => m.value === method)?.label || method;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Gestion des paiements</h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter paiement
        </button>
      </div>

      {/* Résumé des paiements */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total facture:</span>
            <div className="font-medium text-lg">{formatCurrency(totalAmount)}</div>
          </div>
          <div>
            <span className="text-gray-600">Total payé:</span>
            <div className={`font-medium text-lg ${totalPaid > 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {formatCurrency(totalPaid)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Reste à payer:</span>
            <div className={`font-medium text-lg ${isFullyPaid ? 'text-green-600' : remainingAmount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
              {formatCurrency(remainingAmount)}
            </div>
          </div>
        </div>
        
        {isFullyPaid && (
          <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-sm text-green-800">
            ✅ Facture entièrement réglée
          </div>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h5 className="font-medium text-blue-900 mb-3">Nouveau paiement</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant
              </label>
              <input
                type="number"
                value={newPayment.amount || ''}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                min="0"
                step="0.01"
                placeholder="Montant du paiement"
              />
              <div className="mt-1 text-xs text-gray-500">
                Reste à payer: {formatCurrency(remainingAmount)}
              </div>
            </div>
            
            {/* Boutons de montant rapide */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montants rapides
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNewPayment(prev => ({ ...prev, amount: remainingAmount }))}
                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                >
                  Solde complet ({formatCurrency(remainingAmount)})
                </button>
                <button
                  type="button"
                  onClick={() => setNewPayment(prev => ({ ...prev, amount: Math.round(remainingAmount / 2 * 100) / 100 }))}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                >
                  50% ({formatCurrency(Math.round(remainingAmount / 2 * 100) / 100)})
                </button>
                <button
                  type="button"
                  onClick={() => setNewPayment(prev => ({ ...prev, amount: Math.round(remainingAmount / 3 * 100) / 100 }))}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                >
                  33% ({formatCurrency(Math.round(remainingAmount / 3 * 100) / 100)})
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de règlement
              </label>
              <input
                type="date"
                value={newPayment.date}
                onChange={(e) => setNewPayment(prev => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode de règlement
              </label>
              <select
                value={newPayment.method}
                onChange={(e) => setNewPayment(prev => ({ ...prev, method: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence (optionnel)
              </label>
              <input
                type="text"
                value={newPayment.reference}
                onChange={(e) => setNewPayment(prev => ({ ...prev, reference: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="N° chèque, ref. virement..."
              />
            </div>
          </div>

          {/* Gestionnaire de pièces jointes pour le paiement */}
          <div className="mt-4">
            <AttachmentManager
              attachments={newPayment.attachments}
              onAttachmentsChange={(attachments) => setNewPayment(prev => ({ ...prev, attachments }))}
              documentType="payment"
              documentId={`new-payment-${Date.now()}`}
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAddPayment}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              Ajouter le paiement
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des paiements */}
      {payments.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">Historique des paiements</h5>
          
          {payments.map((payment, index) => (
            <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-700">
                      {getMethodLabel(payment.method)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(payment.date)}</span>
                    {payment.reference && (
                      <>
                        <span>•</span>
                        <span>Réf: {payment.reference}</span>
                      </>
                    )}
                  </div>
                  {payment.attachments && payment.attachments.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center">
                        <Paperclip className="h-3 w-3" />
                        <span>{payment.attachments.length} pièce{payment.attachments.length > 1 ? 's' : ''} jointe{payment.attachments.length > 1 ? 's' : ''}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Affichage des pièces jointes du paiement */}
              {payment.attachments && payment.attachments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {payment.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center bg-white border border-gray-200 rounded px-2 py-1">
                        <FileText className="h-3 w-3 text-blue-600 mr-1" />
                        <span className="text-xs text-gray-700 truncate max-w-20">
                          {attachment.name}
                        </span>
                        <button
                          onClick={() => window.open(attachment.url, '_blank')}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                          title="Voir la pièce jointe"
                        >
                          👁️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => handleRemovePayment(payment.id)}
                className="text-red-600 hover:text-red-800"
                title="Supprimer ce paiement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {payments.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm">Aucun paiement enregistré</p>
        </div>
      )}
    </div>
  );
}