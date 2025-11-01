import React, { useState } from 'react';
import { Users, Star, TrendingUp, Eye } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/calculations';

interface ClientAnalysisProps {
  displayMode: 'HT' | 'TTC';
}

export default function ClientAnalysis({ displayMode }: ClientAnalysisProps) {
  const { clients, invoices, quotes } = useApp();
  const [showDetails, setShowDetails] = useState(false);
  
  const useHT = displayMode === 'HT';

  // Analyser les clients par chiffre d'affaires
  const clientAnalysis = clients.map(client => {
    const clientInvoices = invoices.filter(i => i.clientId === client.id && i.status !== 'draft');
    const clientQuotes = quotes.filter(q => q.clientId === client.id);
    
    const totalInvoiced = clientInvoices.reduce((sum, i) => sum + (useHT ? i.totalHT : i.totalTTC), 0);
    const totalPaid = clientInvoices.reduce((sum, i) => {
      const paid = i.paidAmount || 0;
      const ratio = useHT ? (i.totalHT / i.totalTTC) : 1;
      return sum + (paid * ratio);
    }, 0);
    const totalQuoted = clientQuotes.reduce((sum, q) => sum + (useHT ? q.totalHT : q.totalTTC), 0);
    const totalOutstanding = clientInvoices.reduce((sum, i) => {
      const remaining = i.remainingAmount || 0;
      const ratio = useHT ? (i.totalHT / i.totalTTC) : 1;
      return sum + (remaining * ratio);
    }, 0);
    
    return {
      client,
      totalInvoiced,
      totalPaid,
      totalQuoted,
      totalOutstanding,
      invoiceCount: clientInvoices.length,
      quoteCount: clientQuotes.length,
      conversionRate: totalQuoted > 0 ? (totalInvoiced / totalQuoted) * 100 : 0
    };
  }).filter(analysis => analysis.totalInvoiced > 0 || analysis.totalQuoted > 0)
    .sort((a, b) => b.totalInvoiced - a.totalInvoiced);

  const topClients = clientAnalysis.slice(0, 5);
  const totalRevenue = clientAnalysis.reduce((sum, c) => sum + c.totalInvoiced, 0);

  if (clientAnalysis.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucune donnée client pour l'analyse</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">Analyse par client</h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Mode {displayMode}
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Eye className="h-4 w-4 mr-1" />
          {showDetails ? 'Masquer' : 'Voir'} détails
        </button>
      </div>

      {/* Top 5 clients */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-700 mb-4">🏆 Top 5 clients</h3>
        
        {topClients.map((analysis, index) => {
          let clientName = 'Client inconnu';
          if (analysis.client.type === 'pro') {
            const legalForm = analysis.client.legalForm ? `${analysis.client.legalForm} ` : '';
            clientName = `${legalForm}${analysis.client.companyName || 'Sans nom'}`;
          } else {
            const civility = analysis.client.civility ? `${analysis.client.civility} ` : '';
            clientName = `${civility}${analysis.client.firstName || ''} ${analysis.client.lastName || ''}`.trim() || 'Sans nom';
          }
          
          const percentage = totalRevenue > 0 ? (analysis.totalInvoiced / totalRevenue) * 100 : 0;
          
          return (
            <div key={analysis.client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">{clientName}</p>
                  {showDetails && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📊 {analysis.invoiceCount} factures • {analysis.quoteCount} devis</div>
                      <div>🔄 Taux conversion: {analysis.conversionRate.toFixed(1)}%</div>
                      {analysis.totalOutstanding > 0 && (
                        <div className="text-orange-600">⚠️ Impayé: {formatCurrency(analysis.totalOutstanding)}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {formatCurrency(analysis.totalInvoiced)}
                </div>
                <div className="text-xs text-gray-500">
                  {percentage.toFixed(1)}% du CA
                </div>
                {showDetails && (
                  <div className="text-xs text-green-600 mt-1">
                    Encaissé: {formatCurrency(analysis.totalPaid)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé global */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">📈 Résumé global</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Clients actifs:</span>
            <div className="font-bold text-blue-900">{clientAnalysis.length}</div>
          </div>
          <div>
            <span className="text-blue-700">CA total:</span>
            <div className="font-bold text-blue-900">{formatCurrency(totalRevenue)}</div>
          </div>
          <div>
            <span className="text-blue-700">CA moyen/client:</span>
            <div className="font-bold text-blue-900">
              {formatCurrency(clientAnalysis.length > 0 ? totalRevenue / clientAnalysis.length : 0)}
            </div>
          </div>
          <div>
            <span className="text-blue-700">Total impayés:</span>
            <div className="font-bold text-red-600">
              {formatCurrency(clientAnalysis.reduce((sum, c) => sum + c.totalOutstanding, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}