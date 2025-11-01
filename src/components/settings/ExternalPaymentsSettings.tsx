import React, { useState } from 'react';
import { Save, Plus, Trash2, CreditCard, Calendar, Import, Download, Euro, FileText, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface ExternalPayment {
  id: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  clientName?: string;
  reference?: string;
  description?: string;
  createdAt: Date;
}

export default function ExternalPaymentsSettings() {
  const { settings, updateSettings } = useApp();
  const [loading, setSaving] = useState(false);
  const [externalPayments, setExternalPayments] = useState<ExternalPayment[]>(
    settings.externalPayments || []
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    invoiceNumber: '',
    amount: 0,
    amountHT: 0,
    vatRate: 20,
    isAmountTTC: true, // Par défaut, montant TTC
    invoiceYear: new Date().getFullYear(),
    invoiceMonth: new Date().getMonth() + 1,
    invoiceDay: new Date().getDate(),
    paymentYear: new Date().getFullYear(),
    paymentMonth: new Date().getMonth() + 1,
    paymentDay: new Date().getDate(),
    useExactDates: true, // true = dates précises, false = mois/année seulement
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'virement',
    clientName: '',
    reference: '',
    description: ''
  });
  const [displayMode, setDisplayMode] = useState<'HT' | 'TTC'>('TTC');

  const paymentMethods = [
    { value: 'virement', label: 'Virement bancaire' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'carte_bancaire', label: 'Carte bancaire' },
    { value: 'especes', label: 'Espèces' },
    { value: 'compensation', label: 'Compensation' }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const newSettings = {
        ...settings,
        externalPayments: externalPayments.sort((a, b) => 
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        )
      };
      
      await updateSettings(newSettings);
      alert('Encaissements externes sauvegardés !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPayment = () => {
    if (!newPayment.invoiceNumber.trim()) {
      alert('Le numéro de facture est obligatoire');
      return;
    }

    if (newPayment.amount <= 0) {
      alert('Le montant doit être supérieur à 0');
      return;
    }

    // Calculer HT et TTC selon la saisie
    let finalAmountTTC: number;
    let finalAmountHT: number;
    
    if (newPayment.isAmountTTC) {
      finalAmountTTC = newPayment.amount;
      finalAmountHT = Math.round(newPayment.amount / (1 + newPayment.vatRate / 100) * 100) / 100;
    } else {
      finalAmountHT = newPayment.amount;
      finalAmountTTC = Math.round(newPayment.amount * (1 + newPayment.vatRate / 100) * 100) / 100;
    }

    // Construire les dates selon le mode choisi
    let invoiceDate: Date;
    let paymentDate: Date;
    let isMonthlyGlobal = !newPayment.useExactDates;
    
    if (newPayment.useExactDates) {
      // Mode dates précises
      invoiceDate = new Date(newPayment.invoiceYear, newPayment.invoiceMonth - 1, newPayment.invoiceDay);
      paymentDate = new Date(newPayment.paymentYear, newPayment.paymentMonth - 1, newPayment.paymentDay);
    } else {
      // Mode mois/année (mettre au 15 du mois par convention)
      invoiceDate = new Date(newPayment.invoiceYear, newPayment.invoiceMonth - 1, 15);
      paymentDate = new Date(newPayment.paymentYear, newPayment.paymentMonth - 1, 15);
    }
    
    if (isNaN(invoiceDate.getTime()) || isNaN(paymentDate.getTime())) {
      alert('Dates invalides');
      return;
    }
    // Vérifier si une entrée existe déjà pour cette facture
    const existingPayment = externalPayments.find(
      payment => payment.invoiceNumber.toLowerCase() === newPayment.invoiceNumber.toLowerCase()
    );

    if (existingPayment) {
      if (window.confirm(`Un paiement existe déjà pour la facture ${newPayment.invoiceNumber}. Remplacer ?`)) {
        setExternalPayments(prev => prev.map(payment => 
          payment.invoiceNumber.toLowerCase() === newPayment.invoiceNumber.toLowerCase()
            ? { 
                ...payment, 
                amount: finalAmountTTC,
                amountHT: finalAmountHT,
                vatRate: newPayment.vatRate,
                invoiceDate: new Date(newPayment.invoiceDate),
                paymentDate: new Date(newPayment.paymentDate),
                paymentMethod: newPayment.paymentMethod,
                clientName: newPayment.clientName,
                reference: newPayment.reference,
                description: newPayment.description
              }
            : payment
        ));
      }
    } else {
      const payment: ExternalPayment = {
        id: `ext-${Date.now()}`,
        invoiceNumber: newPayment.invoiceNumber.trim(),
        amount: finalAmountTTC,
        amountHT: finalAmountHT,
        vatRate: newPayment.vatRate,
        invoiceDate,
        paymentDate,
        invoiceMonth: newPayment.invoiceMonth,
        invoiceYear: newPayment.invoiceYear,
        paymentMonth: newPayment.paymentMonth,
        paymentYear: newPayment.paymentYear,
        isMonthlyGlobal,
        paymentMethod: newPayment.paymentMethod,
        clientName: newPayment.clientName.trim(),
        reference: newPayment.reference.trim(),
        description: newPayment.description.trim(),
        createdAt: new Date()
      };

      setExternalPayments(prev => [...prev, payment]);
    }

    // Reset form
    setNewPayment({
      invoiceNumber: '',
      amount: 0,
      amountHT: 0,
      vatRate: 20,
      isAmountTTC: true,
      invoiceYear: new Date().getFullYear(),
      invoiceMonth: new Date().getMonth() + 1,
      invoiceDay: new Date().getDate(),
      paymentYear: new Date().getFullYear(),
      paymentMonth: new Date().getMonth() + 1,
      paymentDay: new Date().getDate(),
      useExactDates: true,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'virement',
      clientName: '',
      reference: '',
      description: ''
    });
    setShowAddForm(false);
  };

  const handleRemovePayment = (paymentId: string) => {
    if (window.confirm('Supprimer cet encaissement externe ?')) {
      setExternalPayments(prev => prev.filter(payment => payment.id !== paymentId));
    }
  };

  const importCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          const data: ExternalPayment[] = [];

          // Ignorer la première ligne (en-têtes)
          lines.slice(1).forEach(line => {
            const [invoiceNumber, amount, invoiceDate, paymentDate, paymentMethod, clientName, reference, description] = line.split(';');
            
            if (invoiceNumber && amount && invoiceDate && paymentDate) {
              data.push({
                id: `ext-${Date.now()}-${Math.random()}`,
                invoiceNumber: invoiceNumber.trim(),
                amount: parseFloat(amount.replace(',', '.')) || 0,
                invoiceDate: new Date(invoiceDate || paymentDate),
                paymentDate: new Date(paymentDate),
                paymentMethod: paymentMethod || 'virement',
                clientName: clientName || '',
                reference: reference || '',
                description: description || '',
                createdAt: new Date()
              });
            }
          });

          if (data.length > 0) {
            setExternalPayments(prev => {
              const merged = [...prev];
              data.forEach(newPayment => {
                const existingIndex = merged.findIndex(
                  payment => payment.invoiceNumber.toLowerCase() === newPayment.invoiceNumber.toLowerCase()
                );
                if (existingIndex >= 0) {
                  merged[existingIndex] = newPayment;
                } else {
                  merged.push(newPayment);
                }
              });
              return merged;
            });
            alert(`${data.length} encaissements importés avec succès !`);
          } else {
            alert('Aucune donnée valide trouvée dans le fichier');
          }
        } catch (error) {
          alert('Erreur lors de l\'importation du fichier CSV');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const exportCSV = () => {
    if (externalPayments.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const headers = ['Numéro facture', 'Montant', 'Date paiement', 'Mode paiement', 'Client', 'Référence', 'Description'];
    const csvContent = [
      headers.join(';'),
      ...externalPayments.map(payment => [
        payment.invoiceNumber,
        payment.amount.toFixed(2).replace('.', ','),
        payment.invoiceDate.toISOString().split('T')[0],
        payment.invoiceDate.toISOString().split('T')[0],
        payment.paymentDate.toISOString().split('T')[0],
        payment.paymentMethod,
        payment.clientName || '',
        payment.reference || '',
        payment.description || ''
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `encaissements_externes_${new Date().getFullYear()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const totalExternalPayments = externalPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">💰 Encaissements externes</h3>
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Enregistrez les paiements reçus pour des factures créées dans d'autres logiciels
          </p>
          
          {/* Sélecteur d'affichage HT/TTC */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Affichage :</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode('HT')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  displayMode === 'HT' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                HT
              </button>
              <button
                onClick={() => setDisplayMode('TTC')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  displayMode === 'TTC' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                TTC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions d'import/export */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-blue-800">💾 Import/Export</h4>
            <div className="font-bold text-green-900">
              {displayMode === 'TTC' 
                ? formatCurrency(totalExternalPayments)
                : formatCurrency(externalPayments.reduce((sum, payment) => sum + (payment.amountHT || payment.amount), 0))
              } {displayMode}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={importCSV}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Import className="h-4 w-4 mr-1" />
              Importer CSV
            </button>
            <button
              onClick={exportCSV}
              disabled={externalPayments.length === 0}
              className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              <Download className="h-4 w-4 mr-1" />
              Exporter CSV
            </button>
          </div>
        </div>
        
        <div className="text-sm text-blue-700">
          <p>📋 Format CSV attendu : N°Facture;Montant;AnnéeFacture;MoisFacture;AnnéePaiement;MoisPaiement;ModePaiement;Client;Référence;Description</p>
          <p>📋 Exemple facture précise : FAC-202;1500,50;2024;8;2024;9;virement;Client ABC;VIR123;Facture précise</p>
          <p>📋 Exemple montant global : Total-Sep2023;15000,00;2023;9;2023;9;global;Divers;GLOB123;Encaissements septembre</p>
        </div>
      </div>

      {/* Résumé */}
      {externalPayments.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-3">📊 Résumé des encaissements externes</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-green-700">Factures externes payées :</span>
              <div className="font-bold text-green-900">{externalPayments.length}</div>
            </div>
            <div>
              <span className="text-green-700">Montant total encaissé :</span>
              <div className="font-bold text-green-900">{formatCurrency(totalExternalPayments)}</div>
            </div>
            <div>
              <span className="text-green-700">Période :</span>
              <div className="font-bold text-green-900">
                {externalPayments.length > 0 
                  ? `${formatDate(externalPayments.sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())[0].paymentDate)} - ${formatDate(externalPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0].paymentDate)}`
                  : '-'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">💳 Encaissements par facture externe</h4>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel encaissement
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <h5 className="font-medium text-blue-900 mb-3">Enregistrer un nouvel encaissement</h5>
            
            {/* Mode de saisie */}
            <div className="mb-4 p-3 bg-white border border-blue-300 rounded-lg">
              <h6 className="text-sm font-medium text-blue-800 mb-3">📅 Mode de saisie</h6>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={newPayment.useExactDates}
                    onChange={() => setNewPayment(prev => ({ ...prev, useExactDates: true }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-blue-900">📋 Facture précise</div>
                    <div className="text-sm text-blue-700">Une facture spécifique avec dates exactes</div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!newPayment.useExactDates}
                    onChange={() => setNewPayment(prev => ({ ...prev, useExactDates: false }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-blue-900">📊 Montant mensuel global</div>
                    <div className="text-sm text-blue-700">Total encaissé sur un mois complet (plusieurs factures)</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newPayment.useExactDates ? 'N° Facture externe *' : 'Référence/Description *'}
                </label>
                <input
                  type="text"
                  value={newPayment.invoiceNumber}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  placeholder={newPayment.useExactDates ? "Ex: FAC-202, INV-156..." : "Ex: Encaissements septembre 2023"}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newPayment.useExactDates 
                    ? 'Numéro de la facture de votre ancien logiciel'
                    : 'Description du montant global (ex: "Total septembre 2023")'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant encaissé (€) *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={newPayment.amount || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setNewPayment(prev => ({ ...prev, amount: value }));
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm text-sm"
                      min="0"
                      step="0.01"
                      placeholder={newPayment.useExactDates ? "1500.50" : "15000.00"}
                    />
                    
                    <div className="flex bg-gray-100 rounded p-1">
                      <button
                        type="button"
                        onClick={() => setNewPayment(prev => ({ ...prev, isAmountTTC: false }))}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          !newPayment.isAmountTTC 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-600'
                        }`}
                      >
                        HT
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPayment(prev => ({ ...prev, isAmountTTC: true }))}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          newPayment.isAmountTTC 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-600'
                        }`}
                      >
                        TTC
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600">TVA :</label>
                    <select
                      value={newPayment.vatRate}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, vatRate: parseFloat(e.target.value) }))}
                      className="text-xs rounded border-gray-300 shadow-sm"
                    >
                      <option value={0}>0%</option>
                      <option value={5.5}>5,5%</option>
                      <option value={10}>10%</option>
                      <option value={20}>20%</option>
                    </select>
                    
                    {/* Calcul automatique de l'autre montant */}
                    <span className="text-xs text-gray-500">
                      = {newPayment.isAmountTTC 
                        ? `${(newPayment.amount / (1 + newPayment.vatRate / 100)).toFixed(2)}€ HT`
                        : `${(newPayment.amount * (1 + newPayment.vatRate / 100)).toFixed(2)}€ TTC`
                      }
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {newPayment.useExactDates 
                      ? 'Montant de la facture spécifique'
                      : 'Total encaissé sur le mois complet'
                    }
                  </p>
                </div>
              </div>

              {/* Dates de facturation */}
              {newPayment.useExactDates ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de facturation précise *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <select
                        value={newPayment.invoiceDay}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceDay: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Jour</p>
                    </div>
                    <div>
                      <select
                        value={newPayment.invoiceMonth}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceMonth: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {new Date(2024, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Mois</p>
                    </div>
                    <div>
                      <select
                        value={newPayment.invoiceYear}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceYear: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Année</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Date d'émission de la facture externe</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Période de facturation *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select
                        value={newPayment.invoiceMonth}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceMonth: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {new Date(2024, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Mois</p>
                    </div>
                    <div>
                      <select
                        value={newPayment.invoiceYear}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, invoiceYear: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Année</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mois de facturation global</p>
                </div>
              )}

              {/* Dates d'encaissement */}
              {newPayment.useExactDates ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'encaissement précise *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <select
                        value={newPayment.paymentDay}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, paymentDay: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Jour</p>
                    </div>
                    <div>
                      <select
                        value={newPayment.paymentMonth}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMonth: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {new Date(2024, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Mois</p>
                    </div>
                    <div>
                      <select
                        value={newPayment.paymentYear}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, paymentYear: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Année</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Date de réception du paiement</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Période d'encaissement *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select
                        value={newPayment.paymentMonth}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMonth: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {new Date(2024, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Mois</p>
                    </div>
                    <div>
                      <select
                        value={newPayment.paymentYear}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, paymentYear: parseInt(e.target.value) }))}
                        className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                      >
                        {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Année</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mois d'encaissement global</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
                <select
                  value={newPayment.paymentMethod}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input
                  type="text"
                  value={newPayment.clientName}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  placeholder="Nom du client"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence paiement</label>
                <input
                  type="text"
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  placeholder="N° chèque, ref. virement..."
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  placeholder="Ex: Paiement reçu pour facture de l'ancien logiciel"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex space-x-2">
                <button
                  onClick={handleAddPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2 inline" />
                  Enregistrer l'encaissement
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des encaissements */}
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {externalPayments.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucun encaissement externe enregistré</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Enregistrer votre premier encaissement
              </button>
            </div>
          ) : (
            externalPayments
              .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
              .map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full">
                        <Euro className="h-5 w-5" />
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          Facture {payment.invoiceNumber}
                        </div>
                        {payment.clientName && (
                          <div className="text-sm text-gray-600">{payment.clientName}</div>
                        )}
                        {payment.description && (
                          <div className="text-sm text-gray-500">{payment.description}</div>
                        )}
                        
                        <div className="text-sm text-gray-600 space-x-4 mt-1">
                          <span>
                            📋 {payment.isMonthlyGlobal 
                              ? `Facturé en ${new Date(payment.invoiceDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                              : `Facturé le ${formatDate(payment.invoiceDate)}`
                            }
                          </span>
                          <span>
                            📅 {payment.isMonthlyGlobal 
                              ? `Encaissé en ${new Date(payment.paymentDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                              : `Encaissé le ${formatDate(payment.paymentDate)}`
                            }
                          </span>
                          <span>💳 {paymentMethods.find(m => m.value === payment.paymentMethod)?.label}</span>
                          {payment.reference && (
                            <span>🔗 {payment.reference}</span>
                          )}
                          {payment.isMonthlyGlobal && (
                            <span className="text-purple-600 font-medium">📊 Global</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Ajouté le {formatDate(payment.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setNewPayment({
                              invoiceNumber: payment.invoiceNumber,
                              amount: payment.amount,
                              amountHT: payment.amountHT || payment.amount,
                              vatRate: payment.vatRate || 20,
                              isAmountTTC: true,
                              invoiceYear: payment.invoiceYear || payment.invoiceDate.getFullYear(),
                              invoiceMonth: payment.invoiceMonth || payment.invoiceDate.getMonth() + 1,
                              invoiceDay: payment.invoiceDate.getDate(),
                              paymentYear: payment.paymentYear || payment.paymentDate.getFullYear(),
                              paymentMonth: payment.paymentMonth || payment.paymentDate.getMonth() + 1,
                              paymentDay: payment.paymentDate.getDate(),
                              useExactDates: !payment.isMonthlyGlobal,
                              paymentMethod: payment.paymentMethod,
                              clientName: payment.clientName || '',
                              reference: payment.reference || '',
                              description: payment.description || ''
                            });
                            setShowAddForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleRemovePayment(payment.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Guide d'utilisation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-3">💡 Comment utiliser cette fonctionnalité ?</h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>
            <strong>1. Factures individuelles :</strong> Vous commencez Saule Facturation avec FAC-233, mais vous recevez le paiement de FAC-202 (ancien logiciel)
          </p>
          <p>
            <strong>2. Solution :</strong> Enregistrez ici cette facture externe avec sa date d'émission ET sa date d'encaissement
          </p>
          <p>
            <strong>3. Résultat :</strong> Le tableau de bord intégrera cette facture dans "Facturé" ET ce paiement dans "Encaissé"
          </p>
          <p>
            <strong>4. Encaissements globaux :</strong> Utilisez "Données historiques" pour saisir des montants globaux par mois
          </p>
        </div>
        
        <div className="mt-4 p-3 bg-white border border-yellow-300 rounded text-xs text-yellow-800">
          <p><strong>Exemple concret :</strong></p>
          <p>• Facture "FAC-202" émise le <strong>15/08/2024</strong> • Montant 1 500,50€ • Payée le <strong>15/09/2024</strong></p>
          <p>→ Comptée dans "Facturé" d'<strong>août 2024</strong> ET "Encaissé" de <strong>septembre 2024</strong></p>
          <p>💡 Pour des montants globaux, utilisez l'onglet "Données historiques"</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}