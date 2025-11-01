import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { Calendar, ChevronDown, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/calculations';

interface QuickStatsProps {
  displayMode: 'HT' | 'TTC';
}

export default function QuickStats({ displayMode }: QuickStatsProps) {
  const { invoices, quotes, clients, settings } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [showCustomPeriodForm, setShowCustomPeriodForm] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [usingCustomPeriod, setUsingCustomPeriod] = useState(false);
  
  // Fonctions pour récupérer les données historiques
  const getHistoricalDataForPeriod = (type: 'revenue' | 'collections' | 'quotes', startDate: Date, endDate: Date, useHT: boolean = false): number => {
    if (!settings.historicalData) return 0;
    
    return settings.historicalData
      .filter(entry => {
        const entryDate = new Date(entry.year, entry.month - 1, 1);
        const entryEndDate = new Date(entry.year, entry.month, 0);
        
        // Vérifier si cette entrée historique chevauche avec la période demandée
        return entryDate <= endDate && entryEndDate >= startDate;
      })
      .reduce((sum, entry) => {
        switch (type) {
          case 'revenue':
            return sum + (useHT ? (entry.revenueHT || entry.revenue) : entry.revenue);
          case 'collections':
            return sum + (useHT ? (entry.collectionsHT || (entry.collections || 0)) : (entry.collections || 0));
          case 'quotes':
            return sum + (useHT ? (entry.quotesHT || (entry.quotes || 0)) : (entry.quotes || 0));
          default:
            return sum;
        }
      }, 0);
  };
  
  const getHistoricalCountForPeriod = (type: 'revenue' | 'collections' | 'quotes', startDate: Date, endDate: Date): number => {
    if (!settings.historicalData) return 0;
    
    return settings.historicalData
      .filter(entry => {
        const entryDate = new Date(entry.year, entry.month - 1, 1);
        const entryEndDate = new Date(entry.year, entry.month, 0);
        
        return entryDate <= endDate && entryEndDate >= startDate;
      }).length;
  };
  
  // Générer les périodes disponibles
  const generatePeriods = () => {
    const periods = [];
    const now = new Date();
    
    // Périodes prédéfinies
    periods.push({
      value: 'current-month',
      label: 'Ce mois',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    });
    
    periods.push({
      value: 'previous-month',
      label: 'Mois précédent',
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth(), 0)
    });
    
    periods.push({
      value: 'current-year',
      label: 'Cette année',
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: new Date(now.getFullYear(), 11, 31)
    });
    
    periods.push({
      value: 'previous-year',
      label: 'Année précédente',
      startDate: new Date(now.getFullYear() - 1, 0, 1),
      endDate: new Date(now.getFullYear() - 1, 11, 31)
    });
    
    // Ajouter l'option période personnalisée
    periods.push({
      value: 'custom',
      label: 'Période personnalisée...',
      startDate: new Date(),
      endDate: new Date()
    });
    
    // Ajouter quelques mois récents
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      periods.push({
        value: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        startDate: date,
        endDate
      });
    }
    
    // Supprimer les doublons
    const uniquePeriods = periods.filter((period, index, self) => 
      index === self.findIndex(p => p.value === period.value)
    );
    
    return uniquePeriods;
  };
  
  const periods = generatePeriods();
  
  // Gérer la période personnalisée
  const getCurrentPeriod = () => {
    if (usingCustomPeriod && customStartDate && customEndDate) {
      return {
        value: 'custom',
        label: `Du ${new Date(customStartDate).toLocaleDateString('fr-FR')} au ${new Date(customEndDate).toLocaleDateString('fr-FR')}`,
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate + 'T23:59:59')
      };
    }
    return periods.find(p => p.value === selectedPeriod) || periods[0];
  };
  
  const currentPeriod = getCurrentPeriod();
  
  const startOfPeriod = currentPeriod.startDate;
  const endOfPeriod = currentPeriod.endDate;
  
  // Calculer les montants HT/TTC pour les factures internes
  const getInternalInvoicesAmount = (invoicesList: any[], useHT: boolean = false) => {
    return invoicesList.reduce((sum, i) => sum + (useHT ? (i.totalHT || 0) : (i.totalTTC || 0)), 0);
  };
  
  const getInternalQuotesAmount = (quotesList: any[], useHT: boolean = false) => {
    return quotesList.reduce((sum, q) => sum + (useHT ? (q.totalHT || 0) : (q.totalTTC || 0)), 0);
  };
  
  // Calculer les montants externes HT/TTC
  const getExternalAmount = (paymentsList: any[], useHT: boolean = false) => {
    return paymentsList.reduce((sum, payment) => {
      return sum + (useHT ? (payment.amountHT || payment.amount) : payment.amount);
    }, 0);
  };
  
  const useHT = displayMode === 'HT';
  
  const thisPeriodInvoices = invoices.filter(i => {
    const invoiceDate = new Date(i.issuedAt);
    return invoiceDate >= startOfPeriod && invoiceDate <= endOfPeriod;
  });
  
  const thisPeriodQuotes = quotes.filter(q => {
    const quoteDate = new Date(q.createdAt);
    return quoteDate >= startOfPeriod && quoteDate <= endOfPeriod;
  });

  // Calculer les encaissements réels de la période (par date de paiement)
  const thisPeriodCollections = invoices.reduce((sum, invoice) => {
    if (!invoice.payments || invoice.payments.length === 0) return sum;
    
    const paymentsThisPeriod = invoice.payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= startOfPeriod && paymentDate <= endOfPeriod;
    });
    
    return sum + paymentsThisPeriod.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
  }, 0);

  // Calculer les factures externes pour la période (par date de facturation)
  const externalInvoicesFiltered = (settings.externalPayments || [])
    .filter(payment => {
      if (payment.isMonthlyGlobal) {
        // Pour les montants globaux, vérifier mois/année de facturation
        const facturationMonth = payment.invoiceMonth || payment.invoiceDate.getMonth() + 1;
        const facturationYear = payment.invoiceYear || payment.invoiceDate.getFullYear();
        
        const periodStartMonth = startOfPeriod.getMonth() + 1;
        const periodStartYear = startOfPeriod.getFullYear();
        const periodEndMonth = endOfPeriod.getMonth() + 1;
        const periodEndYear = endOfPeriod.getFullYear();
        
        return (facturationYear > periodStartYear || (facturationYear === periodStartYear && facturationMonth >= periodStartMonth)) &&
               (facturationYear < periodEndYear || (facturationYear === periodEndYear && facturationMonth <= periodEndMonth));
      } else {
        // Pour les dates précises
        const invoiceDate = new Date(payment.invoiceDate);
        return invoiceDate >= startOfPeriod && invoiceDate <= endOfPeriod;
      }
    });
  
  const externalInvoices = getExternalAmount(externalInvoicesFiltered, useHT);

  // Ajouter les encaissements externes
  const externalCollectionsFiltered = (settings.externalPayments || [])
    .filter(payment => {
      if (payment.isMonthlyGlobal) {
        // Pour les montants globaux, vérifier mois/année d'encaissement
        const encaissementMonth = payment.paymentMonth || payment.paymentDate.getMonth() + 1;
        const encaissementYear = payment.paymentYear || payment.paymentDate.getFullYear();
        
        const periodStartMonth = startOfPeriod.getMonth() + 1;
        const periodStartYear = startOfPeriod.getFullYear();
        const periodEndMonth = endOfPeriod.getMonth() + 1;
        const periodEndYear = endOfPeriod.getFullYear();
        
        return (encaissementYear > periodStartYear || (encaissementYear === periodStartYear && encaissementMonth >= periodStartMonth)) &&
               (encaissementYear < periodEndYear || (encaissementYear === periodEndYear && encaissementMonth <= periodEndMonth));
      } else {
        // Pour les dates précises
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= startOfPeriod && paymentDate <= endOfPeriod;
      }
    });
  
  const externalCollections = getExternalAmount(externalCollectionsFiltered, useHT);

  // Calculer les impayés globaux (incluant les externes)
  const calculateGlobalOutstanding = () => {
    // Total facturé interne actuel
    const internalInvoiced = invoices.filter(i => i.status !== 'draft').reduce((sum, i) => sum + i.totalTTC, 0);
    const internalPaid = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    
    // Total facturé externe
    const totalExternalInvoiced = (settings.externalPayments || []).reduce((sum, payment) => sum + payment.amount, 0);
    
    // Total encaissé externe  
    const totalExternalPaid = (settings.externalPayments || []).reduce((sum, payment) => sum + payment.amount, 0);
    
    // Données historiques globales
    const historicalInvoiced = (settings.historicalData || []).reduce((sum, entry) => sum + entry.revenue, 0);
    const historicalPaid = (settings.historicalData || []).reduce((sum, entry) => sum + (entry.collections || 0), 0);
    
    // Total global
    const totalInvoiced = internalInvoiced + totalExternalInvoiced + historicalInvoiced;
    const totalPaid = internalPaid + totalExternalPaid + historicalPaid;
    
    return Math.max(0, totalInvoiced - totalPaid);
  };
  // Handler pour sélectionner une période
  const handlePeriodSelect = (periodValue: string) => {
    if (periodValue === 'custom') {
      setShowCustomPeriodForm(true);
      setShowPeriodSelector(false);
    } else {
      setUsingCustomPeriod(false);
      setSelectedPeriod(periodValue);
      setShowPeriodSelector(false);
      setShowCustomPeriodForm(false);
    }
  };

  // Handler pour appliquer la période personnalisée
  const handleApplyCustomPeriod = () => {
    if (!customStartDate || !customEndDate) {
      alert('Veuillez saisir les deux dates');
      return;
    }
    
    if (new Date(customEndDate) < new Date(customStartDate)) {
      alert('La date de fin doit être postérieure à la date de début');
      return;
    }
    
    setUsingCustomPeriod(true);
    setShowCustomPeriodForm(false);
  };

  const stats = [
    {
      title: currentPeriod.label,
      subtitle: 'Devis émis',
      value: formatCurrency(
        getInternalQuotesAmount(thisPeriodQuotes, useHT) +
        getHistoricalDataForPeriod('quotes', startOfPeriod, endOfPeriod, useHT)
      ),
      count: thisPeriodQuotes.length + getHistoricalCountForPeriod('quotes', startOfPeriod, endOfPeriod),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: currentPeriod.label,
      subtitle: 'Facturé',
      value: formatCurrency(
        getInternalInvoicesAmount(thisPeriodInvoices.filter(i => i.status !== 'draft'), useHT) +
        externalInvoices +
        getHistoricalDataForPeriod('revenue', startOfPeriod, endOfPeriod, useHT)
      ),
      count: thisPeriodInvoices.filter(i => i.status !== 'draft').length + 
             externalInvoicesFiltered.length +
             getHistoricalCountForPeriod('revenue', startOfPeriod, endOfPeriod),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: currentPeriod.label,
      subtitle: 'Encaissé',
      value: formatCurrency(
        thisPeriodCollections + externalCollections +
        getHistoricalDataForPeriod('collections', startOfPeriod, endOfPeriod, useHT)
      ),
      count: invoices.filter(i => 
        i.payments && i.payments.some(p => {
          const paymentDate = new Date(p.date);
          return paymentDate >= startOfPeriod && paymentDate <= endOfPeriod;
        })
      ).length +
      externalCollectionsFiltered.length +
      getHistoricalCountForPeriod('collections', startOfPeriod, endOfPeriod),
      icon: TrendingDown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Global',
      subtitle: 'Impayés',
      value: formatCurrency(calculateGlobalOutstanding()),
      count: invoices.filter(i => (i.remainingAmount || 0) > 0).length + 
             Math.max(0, Math.floor(calculateGlobalOutstanding() / 1000)), // Estimation du nombre de factures impayées externes
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="mb-8">
      {/* Sélecteur de période */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">📊 Vue d'ensemble</h2>
          
          {/* Indicateur du mode d'affichage */}
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Mode {displayMode}
          </div>
        </div>
        
        {/* BOUTON CALENDRIER TOUJOURS VISIBLE */}
        <div className="relative z-50">
          {usingCustomPeriod ? (
            /* Affichage période personnalisée active */
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 border border-green-300 px-3 py-2 rounded-lg">
                <div className="text-sm font-medium text-green-800">
                  📅 {new Date(customStartDate).toLocaleDateString('fr-FR')} → {new Date(customEndDate).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-xs text-green-600">
                  {(() => {
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    return `${diffDays} jours`;
                  })()}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPeriodSelector(!showPeriodSelector);
                  setShowCustomPeriodForm(false);
                }}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                title="Changer de période"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Bouton période normale */
            <button
              onClick={() => {
                setShowPeriodSelector(!showPeriodSelector);
                setShowCustomPeriodForm(false);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {currentPeriod.label}
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showPeriodSelector ? 'rotate-180' : ''}`} />
            </button>
          )}
          
          {showPeriodSelector && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black bg-opacity-25"
                onClick={() => {
                  setShowPeriodSelector(false);
                  setShowCustomPeriodForm(false);
                }}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium text-gray-900">Choisir une période d'analyse</h3>
                </div>
                <div className="p-2">
                  {periods.map(period => (
                    <button
                      key={period.value}
                      onClick={() => handlePeriodSelect(period.value)}
                      className={`w-full text-left px-3 py-3 text-sm rounded-md transition-colors ${
                        (!usingCustomPeriod && period.value === selectedPeriod) || (usingCustomPeriod && period.value === 'custom')
                          ? 'bg-blue-100 text-blue-900 border border-blue-300 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{period.label}</span>
                        {period.value === 'custom' && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            Dates libres
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Formulaire de période personnalisée */}
      {showCustomPeriodForm && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-4">📅 Sélectionnez votre période d'analyse</h3>
          <p className="text-sm text-blue-700 mb-4">Cette période s'appliquera aux 4 blocs statistiques ci-dessus</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleApplyCustomPeriod}
                disabled={!customStartDate || !customEndDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors shadow-md"
              >
                ✓ Appliquer aux 4 blocs
              </button>
              <button
                onClick={() => {
                  setShowCustomPeriodForm(false);
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setSelectedPeriod('current-month');
                  setShowPeriodSelector(false);
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
          
          {/* Exemple d'utilisation */}
          <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Exemple concret</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Pour analyser du <strong>22 septembre 2024</strong> au <strong>31 décembre 2024</strong> :</p>
              <p>• Date début : <code className="bg-blue-100 px-1 rounded">2024-09-22</code></p>
              <p>• Date fin : <code className="bg-blue-100 px-1 rounded">2024-12-31</code></p>
              <p>• Puis cliquez <strong>"Appliquer"</strong></p>
            </div>
          </div>
          
          {/* Affichage de la période active */}
          {customStartDate && customEndDate && (
            <div className="mt-4 p-4 bg-white border-2 border-blue-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-blue-900">
                    📅 {new Date(customStartDate).toLocaleDateString('fr-FR')} → {new Date(customEndDate).toLocaleDateString('fr-FR')}
                  </span>
                  <div className="text-sm text-blue-700 mt-1">
                    Cette période sera appliquée aux statistiques •{' '}
                    {(() => {
                      const start = new Date(customStartDate);
                      const end = new Date(customEndDate);
                      const diffTime = Math.abs(end.getTime() - start.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      return `${diffDays} jours d'analyse`;
                    })()}
                  </div>
                </div>
                <span className="text-green-600 text-sm font-medium">✓ Période active</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Affichage de la période personnalisée active */}
      {usingCustomPeriod && customStartDate && customEndDate && !showCustomPeriodForm && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-green-800 font-bold">✅ Période personnalisée active</span>
              <div className="text-sm text-green-700 mt-1">
                Du {new Date(customStartDate).toLocaleDateString('fr-FR')} au {new Date(customEndDate).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <button 
              onClick={() => setShowCustomPeriodForm(true)} 
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium"
            >
              Modifier
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-right flex-1 ml-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {stat.title}
                </p>
                <p className="text-sm text-gray-600 mb-1">{stat.subtitle}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.count} élément{stat.count > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}