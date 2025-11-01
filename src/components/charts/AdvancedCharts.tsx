import React, { useState, useMemo } from 'react';
import { Calendar, BarChart3, TrendingUp, Euro, Clock, Users, ChevronDown, Filter, Eye } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface PeriodSelection {
  year: number;
  month?: number;
  day?: number;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
}

interface ChartMetric {
  id: string;
  label: string;
  description: string;
  icon: any;
  color: string;
}

interface AdvancedChartsProps {
  displayMode: 'HT' | 'TTC';
}

export default function AdvancedCharts({ displayMode }: AdvancedChartsProps) {
  const { invoices, quotes, clients, settings } = useApp();
  
  // États pour la configuration des graphiques
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [enableComparison, setEnableComparison] = useState(true);
  const [periodType, setPeriodType] = useState<'day' | 'month' | 'year' | 'range'>('month');
  const [useCustomPeriod, setUseCustomPeriod] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // États pour la période principale
  const [mainPeriod, setMainPeriod] = useState<PeriodSelection>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  
  // États pour la période de comparaison
  const [compPeriod, setCompPeriod] = useState<PeriodSelection>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() // mois précédent
  });

  // Générer le label de période
  const getPeriodLabel = (period: PeriodSelection): string => {
    // Si on utilise une période personnalisée
    if (useCustomPeriod && customStartDate && customEndDate) {
      return `Du ${new Date(customStartDate).toLocaleDateString('fr-FR')} au ${new Date(customEndDate).toLocaleDateString('fr-FR')}`;
    }
    
    if (periodType === 'day') {
      return `${period.day}/${period.month}/${period.year}`;
    } else if (periodType === 'month') {
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                         'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      return `${monthNames[(period.month || 1) - 1]} ${period.year}`;
    } else if (periodType === 'year') {
      return period.year.toString();
    } else if (periodType === 'range') {
      return `Du ${period.day || 1}/${period.month || 1}/${period.year} au ${period.endDay || 31}/${period.endMonth || 12}/${period.endYear || period.year}`;
    }
    return '';
  };

  // Convertir PeriodSelection en dates
  const periodToDateRange = (period: PeriodSelection) => {
    let startDate: Date;
    let endDate: Date;

    // Si on utilise une période personnalisée
    if (useCustomPeriod && customStartDate && customEndDate) {
      startDate = new Date(customStartDate + 'T00:00:00');
      endDate = new Date(customEndDate + 'T23:59:59');
      return { startDate, endDate };
    }

    if (periodType === 'day') {
      startDate = new Date(period.year, (period.month || 1) - 1, period.day || 1);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (periodType === 'month') {
      startDate = new Date(period.year, (period.month || 1) - 1, 1);
      endDate = new Date(period.year, period.month || 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (periodType === 'year') {
      startDate = new Date(period.year, 0, 1);
      endDate = new Date(period.year, 11, 31, 23, 59, 59, 999);
    } else if (periodType === 'range') {
      startDate = new Date(period.year, (period.month || 1) - 1, period.day || 1, 0, 0, 0, 0);
      endDate = new Date(
        period.endYear || period.year, 
        (period.endMonth || period.month || 12) - 1, 
        period.endDay || new Date(period.endYear || period.year, period.endMonth || period.month || 12, 0).getDate(),
        23, 59, 59, 999
      );
    } else {
      // Fallback - mois actuel
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  // Filtrer les données par période
  const filterDataByPeriod = (data: any[], dateField: string, startDate: Date, endDate: Date) => {
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Calculer une métrique pour une période donnée
  const calculateMetric = (metric: string, startDate: Date, endDate: Date) => {
    const useHT = displayMode === 'HT';
    const filteredQuotes = filterDataByPeriod(quotes, 'createdAt', startDate, endDate);
    
    // Ajouter les données historiques si disponibles
    const getHistoricalData = (type: 'revenue' | 'collections' | 'quotes'): number => {
      if (!settings.historicalData) return 0;
      
      return settings.historicalData
        .filter(entry => {
          const entryDate = new Date(entry.year, entry.month - 1, 1);
          const entryEndDate = new Date(entry.year, entry.month, 0);
          
          return entryDate <= endDate && entryEndDate >= startDate;
        })
        .reduce((sum, entry) => {
          switch (type) {
            case 'revenue': return sum + (useHT ? (entry.revenueHT || entry.revenue) : entry.revenue);
            case 'collections': return sum + (useHT ? (entry.collectionsHT || (entry.collections || 0)) : (entry.collections || 0));
            case 'quotes': return sum + (useHT ? (entry.quotesHT || (entry.quotes || 0)) : (entry.quotes || 0));
            default: return sum;
          }
        }, 0);
    };

    switch (metric) {
      case 'revenue':
        const filteredInvoices = filterDataByPeriod(invoices, 'issuedAt', startDate, endDate);
        const externalInvoiced = (settings.externalPayments || [])
          .filter(payment => {
            const invoiceDate = new Date(payment.invoiceDate);
            return invoiceDate >= startDate && invoiceDate <= endDate;
          })
          .reduce((sum, payment) => sum + (useHT ? (payment.amountHT || payment.amount) : payment.amount), 0);
        
        return filteredInvoices.filter(i => i.status !== 'draft').reduce((sum, i) => sum + (useHT ? i.totalHT : i.totalTTC), 0) +
               externalInvoiced +
               getHistoricalData('revenue');
      
      case 'collections':
        // Calculer les encaissements réels sur la période (par date de paiement)
        const currentCollections = invoices.reduce((sum, invoice) => {
          if (!invoice.payments || invoice.payments.length === 0) return sum;
          
          const paymentsInPeriod = invoice.payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= startDate && paymentDate <= endDate;
          });
          
          // Calculer HT ou TTC selon les données de la facture
          return sum + paymentsInPeriod.reduce((paymentSum, payment) => {
            const ratio = useHT ? (invoice.totalHT / invoice.totalTTC) : 1;
            return paymentSum + (payment.amount * ratio);
          }, 0);
        }, 0);
        
        // Ajouter les encaissements externes
        const externalCollections = (settings.externalPayments || [])
          .filter(payment => {
            const paymentDate = new Date(payment.paymentDate);
            return paymentDate >= startDate && paymentDate <= endDate;
          })
          .reduce((sum, payment) => sum + (useHT ? (payment.amountHT || payment.amount) : payment.amount), 0);
        
        return currentCollections + externalCollections + getHistoricalData('collections');
      
      case 'quotes_value':
        return filteredQuotes.reduce((sum, q) => sum + (useHT ? q.totalHT : q.totalTTC), 0) +
               getHistoricalData('quotes');
      
      case 'outstanding':
        const outstandingInvoices = filterDataByPeriod(invoices, 'issuedAt', startDate, endDate);
        return outstandingInvoices.reduce((sum, i) => {
          const remaining = i.remainingAmount || 0;
          const ratio = useHT ? (i.totalHT / i.totalTTC) : 1;
          return sum + (remaining * ratio);
        }, 0);
      
      case 'conversion_rate':
        const quotesInPeriod = filteredQuotes.length;
        const historicalQuotesCount = settings.historicalData?.filter(entry => {
          const entryDate = new Date(entry.year, entry.month - 1, 1);
          const entryEndDate = new Date(entry.year, entry.month, 0);
          return entryDate <= endDate && entryEndDate >= startDate;
        }).length || 0;
        
        const transformedQuotes = filteredQuotes.filter(q => q.transformedToInvoiceId).length;
        const totalQuotes = quotesInPeriod + historicalQuotesCount;
        return totalQuotes > 0 ? (transformedQuotes / totalQuotes) * 100 : 0;
      
      default:
        return 0;
    }
  };

  // Métriques disponibles
  const metrics: ChartMetric[] = useMemo(() => [
    {
      id: 'revenue',
      label: 'Chiffre d\'affaires facturé',
      description: `Montant total des factures émises (${displayMode})`,
      icon: TrendingUp,
      color: '#3b82f6'
    },
    {
      id: 'collections',
      label: 'Chiffre d\'affaires encaissé',
      description: `Montant réellement encaissé des factures (${displayMode})`,
      icon: Euro,
      color: '#10b981'
    },
    {
      id: 'quotes_value',
      label: 'Valeur des devis émis',
      description: `Montant total des devis proposés (${displayMode})`,
      icon: BarChart3,
      color: '#8b5cf6'
    }
  ], [displayMode]);

  // Données du graphique principal
  const chartData = useMemo(() => {
    const mainRange = periodToDateRange(mainPeriod);
    const mainValue = calculateMetric(selectedMetric, mainRange.startDate, mainRange.endDate);
    
    let compValue = 0;
    let evolution = 0;
    
    if (enableComparison) {
      const compRange = periodToDateRange(compPeriod);
      compValue = calculateMetric(selectedMetric, compRange.startDate, compRange.endDate);
      evolution = compValue > 0 ? ((mainValue - compValue) / compValue) * 100 : 0;
    }

    return {
      main: {
        value: mainValue,
        label: getPeriodLabel(mainPeriod),
        range: mainRange
      },
      comparison: enableComparison ? {
        value: compValue,
        label: getPeriodLabel(compPeriod),
        evolution,
        range: periodToDateRange(compPeriod)
      } : null
    };
  }, [selectedMetric, mainPeriod, compPeriod, enableComparison, periodType, invoices, quotes]);

  // Générer les années disponibles
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 10; year--) {
      years.push(year);
    }
    return years;
  };

  // Générer les mois
  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  // Générer les jours du mois
  const getDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  // Analyse détaillée par sous-périodes
  const getDetailedBreakdown = () => {
    const mainRange = periodToDateRange(mainPeriod);
    const breakdown = [];
    const isPercentageMetric = selectedMetric === 'conversion_rate';

    if (periodType === 'month') {
      // Analyse par jour du mois
      const daysInMonth = new Date(mainPeriod.year, mainPeriod.month || 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStart = new Date(mainPeriod.year, (mainPeriod.month || 1) - 1, day);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
        
        const value = calculateMetric(selectedMetric, dayStart, dayEnd);
        
        breakdown.push({
          label: day.toString(),
          value,
          date: dayStart
        });
      }
    } else if (periodType === 'year') {
      // Analyse par mois de l'année
      for (let month = 1; month <= 12; month++) {
        const monthStart = new Date(mainPeriod.year, month - 1, 1);
        const monthEnd = new Date(mainPeriod.year, month, 0, 23, 59, 59, 999);
        
        const value = calculateMetric(selectedMetric, monthStart, monthEnd);
        
        breakdown.push({
          label: months[month - 1].label.substring(0, 3),
          value,
          date: monthStart
        });
      }
    } else if (periodType === 'range') {
      // Analyse par mois dans la plage
      const startDate = mainRange.startDate;
      const endDate = mainRange.endDate;
      
      let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      
      while (currentDate <= endDate) {
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const actualStart = currentDate > startDate ? currentDate : startDate;
        const actualEnd = monthEnd < endDate ? monthEnd : endDate;
        
        const value = calculateMetric(selectedMetric, actualStart, actualEnd);
        
        breakdown.push({
          label: currentDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
          value,
          date: new Date(currentDate)
        });
        
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return breakdown;
  };

  const selectedMetricData = metrics.find(m => m.id === selectedMetric);
  const detailedData = getDetailedBreakdown();
  const maxDetailValue = Math.max(...detailedData.map(d => d.value));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics personnalisées</h2>
        <p className="text-gray-600">Choisissez vos métriques et périodes d'analyse</p>
      </div>

      {/* Configuration simplifiée */}
      <div className="space-y-6 mb-8">
        {/* Sélection de la métrique */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">📊 Que voulez-vous analyser ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.map(metric => {
              const Icon = metric.icon;
              return (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                    selectedMetric === metric.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" style={{ color: metric.color }} />
                  <div className="text-left">
                    <div className={`text-sm font-medium ${
                      selectedMetric === metric.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {metric.label}
                    </div>
                    <div className={`text-xs ${
                      selectedMetric === metric.id ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {metric.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sélection du type de période */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">🗓️ Type d'analyse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { value: 'day', label: 'Un jour précis', desc: 'Analyser une journée' },
              { value: 'month', label: 'Un mois entier', desc: 'Analyser mois par mois' },
              { value: 'year', label: 'Une année entière', desc: 'Analyser année par année' },
              { value: 'custom', label: 'Période personnalisée', desc: 'Dates libres' }
            ].map(type => (
              <button
                key={type.value}
                onClick={() => {
                  if (type.value === 'custom') {
                    setUseCustomPeriod(true);
                    setPeriodType('range');
                  } else {
                    setUseCustomPeriod(false);
                    setPeriodType(type.value as any);
                  }
                }}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  (type.value === 'custom' && useCustomPeriod) || (type.value !== 'custom' && periodType === type.value && !useCustomPeriod)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`text-sm font-medium ${
                  ((type.value === 'custom' && useCustomPeriod) || (type.value !== 'custom' && periodType === type.value && !useCustomPeriod)) ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {type.label}
                </div>
                <div className={`text-xs ${
                  ((type.value === 'custom' && useCustomPeriod) || (type.value !== 'custom' && periodType === type.value && !useCustomPeriod)) ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {type.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Période personnalisée */}
        {useCustomPeriod && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-blue-800 mb-4">📅 Sélectionnez votre période</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="2024-09-22"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="2024-12-31"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (!customStartDate || !customEndDate) {
                      alert('Veuillez saisir les deux dates');
                      return;
                    }
                    if (new Date(customEndDate) < new Date(customStartDate)) {
                      alert('La date de fin doit être postérieure à la date de début');
                      return;
                    }
                    // Les dates sont appliquées automatiquement via les états
                  }}
                  disabled={!customStartDate || !customEndDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  ✓ Appliquer
                </button>
                <button
                  onClick={() => {
                    setUseCustomPeriod(false);
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setPeriodType('month');
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
            
            {/* Exemple d'utilisation */}
            <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Exemple d'utilisation</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Pour analyser du <strong>22 septembre 2024</strong> au <strong>31 décembre 2024</strong> :</p>
                <p>• Date début : <code className="bg-blue-100 px-1 rounded">2024-09-22</code></p>
                <p>• Date fin : <code className="bg-blue-100 px-1 rounded">2024-12-31</code></p>
              </div>
            </div>
            
            {/* Affichage de la période sélectionnée */}
            {customStartDate && customEndDate && (
              <div className="mt-4 p-4 bg-white border-2 border-blue-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-blue-900">
                      📅 {new Date(customStartDate).toLocaleDateString('fr-FR')} → {new Date(customEndDate).toLocaleDateString('fr-FR')}
                    </span>
                    <div className="text-sm text-blue-700 mt-1">
                      {(() => {
                        const start = new Date(customStartDate);
                        const end = new Date(customEndDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        return `${diffDays} jours d'analyse`;
                      })()}
                    </div>
                  </div>
                  <span className="text-blue-600 text-sm font-medium">✓ Période active</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sélection de la période principale */}
        {!useCustomPeriod && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-3">📅 Période à analyser</h3>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {/* Année */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Année</label>
              <select
                value={mainPeriod.year}
                onChange={(e) => setMainPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full text-sm rounded-md border-gray-300"
              >
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Mois */}
            {(periodType === 'day' || periodType === 'month' || periodType === 'range') && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mois</label>
                <select
                  value={mainPeriod.month || 1}
                  onChange={(e) => setMainPeriod(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="w-full text-sm rounded-md border-gray-300"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Jour */}
            {(periodType === 'day' || periodType === 'range') && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Jour</label>
                <select
                  value={mainPeriod.day || 1}
                  onChange={(e) => setMainPeriod(prev => ({ ...prev, day: parseInt(e.target.value) }))}
                  className="w-full text-sm rounded-md border-gray-300"
                >
                  {getDaysInMonth(mainPeriod.year, mainPeriod.month || 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Période de fin pour les plages */}
            {periodType === 'range' && (
              <>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Année fin</label>
                  <select
                    value={mainPeriod.endYear || mainPeriod.year}
                    onChange={(e) => setMainPeriod(prev => ({ ...prev, endYear: parseInt(e.target.value) }))}
                    className="w-full text-sm rounded-md border-gray-300"
                  >
                    {getAvailableYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Mois fin</label>
                  <select
                    value={mainPeriod.endMonth || mainPeriod.month || 12}
                    onChange={(e) => setMainPeriod(prev => ({ ...prev, endMonth: parseInt(e.target.value) }))}
                    className="w-full text-sm rounded-md border-gray-300"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Jour fin</label>
                  <select
                    value={mainPeriod.endDay || new Date(mainPeriod.endYear || mainPeriod.year, mainPeriod.endMonth || mainPeriod.month || 12, 0).getDate()}
                    onChange={(e) => setMainPeriod(prev => ({ ...prev, endDay: parseInt(e.target.value) }))}
                    className="w-full text-sm rounded-md border-gray-300"
                  >
                    {getDaysInMonth(mainPeriod.endYear || mainPeriod.year, mainPeriod.endMonth || mainPeriod.month || 12).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
        )}

        {/* Sélection de la période de comparaison */}
        {enableComparison && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-green-800">📈 Période de comparaison</h3>
              <button
                onClick={() => setEnableComparison(false)}
                className="text-xs text-green-600 hover:text-green-800"
              >
                Désactiver comparaison
              </button>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {/* Année comparaison */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Année</label>
                <select
                  value={compPeriod.year}
                  onChange={(e) => setCompPeriod(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full text-sm rounded-md border-gray-300"
                >
                  {getAvailableYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Mois comparaison */}
              {(periodType === 'day' || periodType === 'month' || periodType === 'range') && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Mois</label>
                  <select
                    value={compPeriod.month || 1}
                    onChange={(e) => setCompPeriod(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                    className="w-full text-sm rounded-md border-gray-300"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Jour comparaison */}
              {(periodType === 'day' || periodType === 'range') && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Jour</label>
                  <select
                    value={compPeriod.day || 1}
                    onChange={(e) => setCompPeriod(prev => ({ ...prev, day: parseInt(e.target.value) }))}
                    className="w-full text-sm rounded-md border-gray-300"
                  >
                    {getDaysInMonth(compPeriod.year, compPeriod.month || 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Période de fin pour les plages de comparaison */}
              {periodType === 'range' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Année fin</label>
                    <select
                      value={compPeriod.endYear || compPeriod.year}
                      onChange={(e) => setCompPeriod(prev => ({ ...prev, endYear: parseInt(e.target.value) }))}
                      className="w-full text-sm rounded-md border-gray-300"
                    >
                      {getAvailableYears().map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Mois fin</label>
                    <select
                      value={compPeriod.endMonth || compPeriod.month || 12}
                      onChange={(e) => setCompPeriod(prev => ({ ...prev, endMonth: parseInt(e.target.value) }))}
                      className="w-full text-sm rounded-md border-gray-300"
                    >
                      {months.map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Jour fin</label>
                    <select
                      value={compPeriod.endDay || new Date(compPeriod.endYear || compPeriod.year, compPeriod.endMonth || compPeriod.month || 12, 0).getDate()}
                      onChange={(e) => setCompPeriod(prev => ({ ...prev, endDay: parseInt(e.target.value) }))}
                      className="w-full text-sm rounded-md border-gray-300"
                    >
                      {getDaysInMonth(compPeriod.endYear || compPeriod.year, compPeriod.endMonth || compPeriod.month || 12).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Option de comparaison */}
        {!enableComparison && (
          <div className="text-center">
            <button
              onClick={() => setEnableComparison(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Activer la comparaison
            </button>
          </div>
        )}
      </div>

      {/* Résultats principaux */}
      {selectedMetricData && chartData.main && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <selectedMetricData.icon className="h-8 w-8 mr-3" style={{ color: selectedMetricData.color }} />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedMetricData.label}</h3>
                  <p className="text-sm text-gray-600">{selectedMetricData.description}</p>
                  <p className="text-xs text-blue-600 mt-1">📅 {chartData.main.label}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {selectedMetric === 'conversion_rate' 
                    ? `${chartData.main.value.toFixed(1)}%`
                    : formatCurrency(chartData.main.value)
                  }
                </div>
                
                {chartData.comparison && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600">
                      vs {chartData.comparison.label}
                    </div>
                    <div className={`text-lg font-bold ${
                      chartData.comparison.evolution > 0 ? 'text-green-600' :
                      chartData.comparison.evolution < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {chartData.comparison.evolution > 0 ? '+' : ''}{chartData.comparison.evolution.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedMetric === 'conversion_rate' 
                        ? `${chartData.comparison.value.toFixed(1)}%`
                        : formatCurrency(chartData.comparison.value)
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphique détaillé */}
      {detailedData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            📊 Détail par {periodType === 'month' ? 'jour' : periodType === 'year' ? 'mois' : 'période'}
          </h4>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detailedData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 w-16">
                      {item.label}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 min-w-[200px]">
                      <div
                        className="h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                        style={{
                          width: `${Math.max((item.value / maxDetailValue) * 100, 3)}%`,
                          backgroundColor: selectedMetricData?.color || '#3b82f6'
                        }}
                      >
                        {item.value > 0 && (
                          <span className="text-white text-xs font-medium px-1">
                            {selectedMetric === 'conversion_rate' 
                              ? `${item.value.toFixed(0)}%`
                              : item.value > 1000 ? `${(item.value/1000).toFixed(0)}k` : item.value.toFixed(0)
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 w-32 text-right">
                    {selectedMetric === 'conversion_rate' 
                      ? `${item.value.toFixed(1)}%`
                      : formatCurrency(item.value)
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistiques supplémentaires selon la période sélectionnée */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3">📊 Activité sur la période</h4>
          <div className="space-y-2 text-sm">
            {(() => {
              const range = periodToDateRange(mainPeriod);
              const periodQuotes = filterDataByPeriod(quotes, 'createdAt', range.startDate, range.endDate);
              const periodInvoices = filterDataByPeriod(invoices, 'issuedAt', range.startDate, range.endDate);
              
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Devis émis:</span>
                    <span className="font-medium text-blue-900">{periodQuotes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Factures émises:</span>
                    <span className="font-medium text-blue-900">
                      {periodInvoices.filter(i => i.status !== 'draft').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Brouillons:</span>
                    <span className="font-medium text-gray-600">
                      {periodInvoices.filter(i => i.status === 'draft').length}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-3">💰 Finances sur la période</h4>
          <div className="space-y-2 text-sm">
            {(() => {
              const range = periodToDateRange(mainPeriod);
              
              // Calculer facturé sur la période
              const facturingInvoices = filterDataByPeriod(invoices, 'issuedAt', range.startDate, range.endDate);
              const totalInvoiced = facturingInvoices.reduce((sum, i) => sum + i.totalTTC, 0);
              
              // Calculer encaissé sur la période (par date de paiement)
              const totalPaid = invoices.reduce((sum, invoice) => {
                if (!invoice.payments || invoice.payments.length === 0) return sum;
                
                const paymentsInPeriod = invoice.payments.filter(payment => {
                  const paymentDate = new Date(payment.date);
                  return paymentDate >= range.startDate && paymentDate <= range.endDate;
                });
                
                return sum + paymentsInPeriod.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
              }, 0);
              
              // Calculer les impayés (factures émises sur la période)
              const totalOutstanding = facturingInvoices.reduce((sum, i) => sum + (i.remainingAmount || 0), 0);
              
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-green-700">Facturé:</span>
                    <span className="font-medium text-green-900">{formatCurrency(totalInvoiced)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Encaissé (par date paiement):</span>
                    <span className="font-medium text-green-900">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">En attente:</span>
                    <span className="font-medium text-orange-600">{formatCurrency(totalOutstanding)}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3">🎯 Performance sur la période</h4>
          <div className="space-y-2 text-sm">
            {(() => {
              const range = periodToDateRange(mainPeriod);
              const facturingInvoices = filterDataByPeriod(invoices, 'issuedAt', range.startDate, range.endDate);
              const periodQuotes = filterDataByPeriod(quotes, 'createdAt', range.startDate, range.endDate);
              const totalInvoiced = facturingInvoices.reduce((sum, i) => sum + i.totalTTC, 0);
              
              // Encaissements sur la période (par date de paiement)
              const totalPaid = invoices.reduce((sum, invoice) => {
                if (!invoice.payments || invoice.payments.length === 0) return sum;
                
                const paymentsInPeriod = invoice.payments.filter(payment => {
                  const paymentDate = new Date(payment.date);
                  return paymentDate >= range.startDate && paymentDate <= range.endDate;
                });
                
                return sum + paymentsInPeriod.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
              }, 0);
              
              const quotesValue = periodQuotes.reduce((sum, q) => sum + q.totalTTC, 0);
              
              return (
                <>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Taux encaissement:</span>
                    <span className="font-medium text-blue-900">
                      {totalInvoiced > 0 ? `${((totalPaid / totalInvoiced) * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Taux transformation:</span>
                    <span className="font-medium text-blue-900">
                      {periodQuotes.length > 0 
                        ? `${((periodQuotes.filter(q => q.transformedToInvoiceId).length / periodQuotes.length) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Ticket moyen:</span>
                    <span className="font-medium text-blue-900">
                      {facturingInvoices.length > 0 
                        ? formatCurrency(totalInvoiced / facturingInvoices.length)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Message si pas de données */}
      {chartData.main?.value === 0 && (
        <div className="mt-6 text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Calendar className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700 font-medium">Aucune donnée pour cette période</p>
          <p className="text-yellow-600 text-sm mt-1">
            Essayez une autre période ou vérifiez que vous avez des {
              selectedMetric.includes('quote') ? 'devis' : 'factures'
            } sur cette période
          </p>
        </div>
      )}
    </div>
  );
}