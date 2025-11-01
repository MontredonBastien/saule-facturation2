import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Euro, Users, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface Period {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

interface ChartData {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

export default function DashboardCharts() {
  const { invoices, quotes, clients } = useApp();
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'collections' | 'outstanding' | 'comparison'>('revenue');
  const [primaryPeriod, setPrimaryPeriod] = useState<string>('current-month');
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('previous-month');

  // Générer les périodes disponibles
  const generatePeriods = (): Period[] => {
    const periods: Period[] = [];
    const now = new Date();
    
    // Mois et années basés sur les données existantes
    const allDates = [
      ...invoices.map(i => new Date(i.issuedAt)),
      ...quotes.map(q => new Date(q.createdAt))
    ].sort((a, b) => b.getTime() - a.getTime());

    if (allDates.length === 0) {
      // Période par défaut si pas de données
      periods.push({
        label: 'Ce mois',
        value: 'current-month',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      });
      return periods;
    }

    // Générer les périodes mensuelles
    const monthsSet = new Set<string>();
    allDates.forEach(date => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthsSet.has(monthKey)) {
        monthsSet.add(monthKey);
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        periods.push({
          label: `${date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          value: `${date.getFullYear()}-${date.getMonth()}`,
          startDate,
          endDate
        });
      }
    });

    // Ajouter les périodes spéciales
    periods.unshift({
      label: 'Ce mois',
      value: 'current-month',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    });

    periods.unshift({
      label: 'Mois précédent',
      value: 'previous-month',
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth(), 0)
    });

    periods.unshift({
      label: 'Cette année',
      value: 'current-year',
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: new Date(now.getFullYear(), 11, 31)
    });

    return periods.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  };

  const periods = generatePeriods();

  // Obtenir une période par sa valeur
  const getPeriod = (value: string): Period | undefined => {
    return periods.find(p => p.value === value);
  };

  // Filtrer les données par période
  const filterDataByPeriod = (data: any[], dateField: string, period: Period) => {
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= period.startDate && itemDate <= period.endDate;
    });
  };

  // Calculer les données de chiffre d'affaires
  const getRevenueData = (period: Period): ChartData[] => {
    const filteredInvoices = filterDataByPeriod(invoices, 'issuedAt', period);
    const filteredQuotes = filterDataByPeriod(quotes, 'createdAt', period);

    return [
      {
        label: 'Devis émis',
        value: filteredQuotes.reduce((sum, q) => sum + q.totalTTC, 0),
        color: '#3b82f6'
      },
      {
        label: 'Factures émises',
        value: filteredInvoices.filter(i => i.status !== 'draft').reduce((sum, i) => sum + i.totalTTC, 0),
        color: '#10b981'
      },
      {
        label: 'Brouillons',
        value: filteredInvoices.filter(i => i.status === 'draft').reduce((sum, i) => sum + i.totalTTC, 0),
        color: '#6b7280'
      }
    ];
  };

  // Calculer les encaissements
  const getCollectionsData = (period: Period): ChartData[] => {
    const facturingInvoices = filterDataByPeriod(invoices, 'issuedAt', period);
    
    // Calculer les encaissements réels sur la période (par date de paiement)
    const totalPaid = invoices.reduce((sum, invoice) => {
      if (!invoice.payments || invoice.payments.length === 0) return sum;
      
      const paymentsInPeriod = invoice.payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= period.startDate && paymentDate <= period.endDate;
      });
      
      return sum + paymentsInPeriod.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
    }, 0);
    
    const totalInvoiced = facturingInvoices.reduce((sum, i) => sum + i.totalTTC, 0);
    const totalOutstanding = totalInvoiced - totalPaid;

    return [
      {
        label: 'Facturé',
        value: totalInvoiced,
        color: '#3b82f6'
      },
      {
        label: 'Encaissé (par date paiement)',
        value: totalPaid,
        color: '#10b981',
        percentage: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0
      },
      {
        label: 'En attente',
        value: totalOutstanding,
        color: '#f59e0b',
        percentage: totalInvoiced > 0 ? (totalOutstanding / totalInvoiced) * 100 : 0
      }
    ];
  };

  // Calculer les créances en cours
  const getOutstandingData = (period: Period): ChartData[] => {
    const currentDate = new Date();
    const filteredInvoices = filterDataByPeriod(invoices, 'issuedAt', period)
      .filter(i => i.remainingAmount > 0);

    const notDue = filteredInvoices.filter(i => new Date(i.dueDate) >= currentDate);
    const overdue = filteredInvoices.filter(i => new Date(i.dueDate) < currentDate);

    return [
      {
        label: 'Non échu',
        value: notDue.reduce((sum, i) => sum + i.remainingAmount, 0),
        color: '#10b981'
      },
      {
        label: 'En retard',
        value: overdue.reduce((sum, i) => sum + i.remainingAmount, 0),
        color: '#ef4444'
      }
    ];
  };

  // Comparaison entre deux périodes
  const getComparisonData = () => {
    const primary = getPeriod(primaryPeriod);
    const comparison = getPeriod(comparisonPeriod);
    
    if (!primary || !comparison) return [];

    const primaryData = getRevenueData(primary);
    const comparisonData = getRevenueData(comparison);

    return primaryData.map((item, index) => {
      const comparisonValue = comparisonData[index]?.value || 0;
      const evolution = comparisonValue > 0 ? ((item.value - comparisonValue) / comparisonValue) * 100 : 0;
      
      return {
        ...item,
        comparisonValue,
        evolution
      };
    });
  };

  // Données à afficher selon le graphique sélectionné
  const chartData = useMemo(() => {
    const period = getPeriod(primaryPeriod);
    if (!period) return [];

    switch (selectedChart) {
      case 'revenue':
        return getRevenueData(period);
      case 'collections':
        return getCollectionsData(period);
      case 'outstanding':
        return getOutstandingData(period);
      case 'comparison':
        return getComparisonData();
      default:
        return [];
    }
  }, [selectedChart, primaryPeriod, comparisonPeriod, invoices, quotes]);

  // Calculer la valeur maximale pour les barres
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  const chartTypes = [
    { id: 'revenue', label: 'Chiffre d\'affaires', icon: TrendingUp },
    { id: 'collections', label: 'Encaissements', icon: Euro },
    { id: 'outstanding', label: 'Créances', icon: AlertCircle },
    { id: 'comparison', label: 'Comparaison', icon: BarChart3 }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Analyse financière</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {getPeriod(primaryPeriod)?.label}
          </span>
        </div>
      </div>

      {/* Sélecteur de type de graphique */}
      <div className="flex flex-wrap gap-2 mb-6">
        {chartTypes.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedChart(type.id as any)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedChart === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Filtres de période */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {selectedChart === 'comparison' ? 'Période principale' : 'Période d\'analyse'}
          </label>
          <select
            value={primaryPeriod}
            onChange={(e) => setPrimaryPeriod(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {selectedChart === 'comparison' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période de comparaison
            </label>
            <select
              value={comparisonPeriod}
              onChange={(e) => setComparisonPeriod(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              {periods.filter(p => p.value !== primaryPeriod).map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Graphique */}
      <div className="space-y-4">
        {chartData.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune donnée pour cette période</p>
          </div>
        ) : (
          <>
            {/* Graphique en barres */}
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.value)}
                      </span>
                      {item.percentage !== undefined && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({item.percentage.toFixed(1)}%)
                        </span>
                      )}
                      {selectedChart === 'comparison' && (item as any).evolution !== undefined && (
                        <div className={`text-sm font-medium ${
                          (item as any).evolution > 0 ? 'text-green-600' : 
                          (item as any).evolution < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {(item as any).evolution > 0 ? '+' : ''}{(item as any).evolution.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="h-4 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color || '#3b82f6'
                      }}
                    />
                    
                    {/* Barre de comparaison pour le mode comparaison */}
                    {selectedChart === 'comparison' && (item as any).comparisonValue > 0 && (
                      <div
                        className="absolute top-0 h-4 rounded-full opacity-50"
                        style={{
                          width: `${((item as any).comparisonValue / maxValue) * 100}%`,
                          backgroundColor: '#6b7280'
                        }}
                      />
                    )}
                  </div>
                  
                  {selectedChart === 'comparison' && (
                    <div className="text-xs text-gray-500">
                      Comparaison: {formatCurrency((item as any).comparisonValue || 0)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Résumé selon le type de graphique */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              {selectedChart === 'revenue' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📊 Résumé de l'activité</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total devis:</span>
                      <div className="font-medium">{formatCurrency(chartData[0]?.value || 0)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total facturé:</span>
                      <div className="font-medium">{formatCurrency(chartData[1]?.value || 0)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Taux de transformation:</span>
                      <div className="font-medium">
                        {chartData[0]?.value > 0 
                          ? ((chartData[1]?.value || 0) / chartData[0].value * 100).toFixed(1)
                          : '0'}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedChart === 'collections' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">💰 Résumé des encaissements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Taux d'encaissement:</span>
                      <div className="font-medium">
                        {chartData[1]?.percentage?.toFixed(1) || '0'}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Reste à encaisser:</span>
                      <div className="font-medium text-orange-600">
                        {formatCurrency(chartData[2]?.value || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Factures impayées:</span>
                      <div className="font-medium">
                        {filterDataByPeriod(invoices, 'issuedAt', getPeriod(primaryPeriod)!)
                          .filter(i => i.remainingAmount > 0).length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedChart === 'outstanding' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">⏰ Résumé des créances</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total créances:</span>
                      <div className="font-medium">
                        {formatCurrency((chartData[0]?.value || 0) + (chartData[1]?.value || 0))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Factures en retard:</span>
                      <div className="font-medium text-red-600">
                        {filterDataByPeriod(invoices, 'issuedAt', getPeriod(primaryPeriod)!)
                          .filter(i => i.remainingAmount > 0 && new Date(i.dueDate) < new Date()).length}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Délai moyen:</span>
                      <div className="font-medium">
                        {(() => {
                          const overdueInvoices = filterDataByPeriod(invoices, 'issuedAt', getPeriod(primaryPeriod)!)
                            .filter(i => i.remainingAmount > 0 && new Date(i.dueDate) < new Date());
                          
                          if (overdueInvoices.length === 0) return '0 jours';
                          
                          const avgDays = overdueInvoices.reduce((sum, i) => {
                            const daysDiff = Math.floor((new Date().getTime() - new Date(i.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                            return sum + daysDiff;
                          }, 0) / overdueInvoices.length;
                          
                          return `${Math.round(avgDays)} jours`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedChart === 'comparison' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📈 Évolution</h4>
                  <div className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {getPeriod(primaryPeriod)?.label} vs {getPeriod(comparisonPeriod)?.label}
                      </span>
                      <div className="font-medium">
                        {(() => {
                          const totalPrimary = chartData.reduce((sum, d) => sum + d.value, 0);
                          const totalComparison = chartData.reduce((sum, d) => sum + ((d as any).comparisonValue || 0), 0);
                          const evolution = totalComparison > 0 ? ((totalPrimary - totalComparison) / totalComparison) * 100 : 0;
                          
                          return (
                            <span className={`${
                              evolution > 0 ? 'text-green-600' : 
                              evolution < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {evolution > 0 ? '+' : ''}{evolution.toFixed(1)}%
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Liste détaillée pour les créances */}
      {selectedChart === 'outstanding' && chartData.some(d => d.value > 0) && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-3">🚨 Factures impayées</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filterDataByPeriod(invoices, 'issuedAt', getPeriod(primaryPeriod)!)
              .filter(i => i.remainingAmount > 0)
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map(invoice => {
                const client = clients.find(c => c.id === invoice.clientId);
                const isOverdue = new Date(invoice.dueDate) < new Date();
                const clientName = client?.companyName || `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Client inconnu';
                
                return (
                  <div key={invoice.id} className={`flex items-center justify-between p-2 rounded ${
                    isOverdue ? 'bg-red-100' : 'bg-white'
                  }`}>
                    <div>
                      <span className="font-medium">{invoice.number || 'Brouillon'}</span>
                      <span className="text-sm text-gray-600 ml-2">{clientName}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(invoice.remainingAmount)}</div>
                      <div className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        Échéance: {formatDate(invoice.dueDate)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}