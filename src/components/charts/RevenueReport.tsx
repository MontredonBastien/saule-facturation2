import React, { useState, useMemo } from 'react';
import { Download, FileSpreadsheet, Calendar, Filter, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface ReportPeriod {
  year: number;
  month?: number;
  startDate?: Date;
  endDate?: Date;
}

interface RevenueReportLine {
  invoiceNumber: string;
  invoiceDate: Date;
  paymentDate?: Date;
  clientName: string;
  invoiceAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  hasCredit: boolean;
  creditNumbers: string[];
  paymentMethod?: string;
}

interface RevenueReportProps {
  displayMode: 'HT' | 'TTC';
}

export default function RevenueReport({ displayMode }: RevenueReportProps) {
  const { invoices, clients, credits } = useApp();
  const [reportType, setReportType] = useState<'payment_period' | 'invoice_period'>('payment_period');
  const [periodType, setPeriodType] = useState<'month' | 'custom'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [includeDrafts, setIncludeDrafts] = useState(false);
  
  const useHT = displayMode === 'HT';

  // Générer les données du rapport
  const reportData = useMemo(() => {
    let filteredInvoices = invoices.filter(invoice => {
      // Exclure les brouillons si demandé
      if (!includeDrafts && invoice.status === 'draft') return false;
      return true;
    });

    // Filtrer selon le type de rapport et la période
    if (reportType === 'payment_period') {
      // Filtrer par date de paiement
      filteredInvoices = filteredInvoices.filter(invoice => {
        // Seulement les factures qui ont des paiements
        if (!invoice.payments || invoice.payments.length === 0) return false;

        return invoice.payments.some(payment => {
          const paymentDate = new Date(payment.date);
          
          if (periodType === 'month') {
            return paymentDate.getFullYear() === selectedYear && 
                   paymentDate.getMonth() + 1 === selectedMonth;
          } else {
            const startDate = new Date(customStartDate);
            const endDate = new Date(customEndDate);
            endDate.setHours(23, 59, 59, 999);
            return paymentDate >= startDate && paymentDate <= endDate;
          }
        });
      });
    } else {
      // Filtrer par date d'émission de facture
      filteredInvoices = filteredInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.issuedAt);
        
        if (periodType === 'month') {
          return invoiceDate.getFullYear() === selectedYear && 
                 invoiceDate.getMonth() + 1 === selectedMonth;
        } else {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
          return invoiceDate >= startDate && invoiceDate <= endDate;
        }
      });
    }

    // Transformer en lignes de rapport
    const reportLines: RevenueReportLine[] = filteredInvoices.map(invoice => {
      const client = clients.find(c => c.id === invoice.clientId);
      const clientName = client?.companyName || 
        `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 
        'Client inconnu';

      // Trouver les avoirs liés à cette facture
      const relatedCredits = credits.filter(credit => credit.invoiceId === invoice.id);
      
      // Trouver la date de paiement principale
      const mainPayment = invoice.payments && invoice.payments.length > 0 
        ? invoice.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

      return {
        invoiceNumber: invoice.number || 'BROUILLON',
        invoiceDate: new Date(invoice.issuedAt),
        paymentDate: mainPayment ? new Date(mainPayment.date) : undefined,
        clientName,
        invoiceAmount: useHT ? (invoice.totalHT || 0) : (invoice.totalTTC || 0),
        paidAmount: useHT ? ((invoice.paidAmount || 0) * (invoice.totalHT / invoice.totalTTC)) : (invoice.paidAmount || 0),
        remainingAmount: useHT ? ((invoice.remainingAmount || 0) * (invoice.totalHT / invoice.totalTTC)) : (invoice.remainingAmount || 0),
        status: invoice.status,
        hasCredit: relatedCredits.length > 0,
        creditNumbers: relatedCredits.map(c => c.number || c.id),
        paymentMethod: mainPayment?.method || invoice.paymentMethod
      };
    });

    return reportLines.sort((a, b) => {
      if (reportType === 'payment_period' && a.paymentDate && b.paymentDate) {
        return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
      }
      return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
    });
  }, [invoices, clients, credits, reportType, periodType, selectedYear, selectedMonth, customStartDate, customEndDate, includeDrafts]);

  // Calculer les totaux du rapport
  const reportTotals = useMemo(() => {
    return {
      totalInvoiced: reportData.reduce((sum, line) => sum + line.invoiceAmount, 0),
      totalPaid: reportData.reduce((sum, line) => sum + line.paidAmount, 0),
      totalOutstanding: reportData.reduce((sum, line) => sum + line.remainingAmount, 0),
      totalWithCredits: reportData.filter(line => line.hasCredit).length,
      totalFullyPaid: reportData.filter(line => line.status === 'paid').length
    };
  }, [reportData]);

  // Générer le nom du fichier
  const getFileName = () => {
    const typeLabel = reportType === 'payment_period' ? 'encaissements' : 'factures';
    const periodLabel = periodType === 'month' 
      ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
      : `${customStartDate}_${customEndDate}`;
    
    return `rapport_${typeLabel}_${periodLabel}.csv`;
  };

  // Générer et télécharger le CSV
  const downloadCSV = () => {
    if (reportData.length === 0) {
      alert('Aucune donnée à exporter pour cette période');
      return;
    }

    // En-têtes CSV
    const headers = [
      'Numéro facture',
      'Date émission',
      'Date paiement',
      'Client',
      'Montant facturé',
      'Montant payé',
      'Reste à payer',
      'Statut',
      'Mode paiement',
      'A un avoir',
      'Numéros avoirs'
    ];

    // Données CSV
    const csvRows = [
      headers.join(';'), // Utiliser ; pour Excel français
      ...reportData.map(line => [
        line.invoiceNumber,
        formatDate(line.invoiceDate),
        line.paymentDate ? formatDate(line.paymentDate) : '',
        `"${line.clientName}"`, // Guillemets pour les noms avec virgules
        line.invoiceAmount.toFixed(2).replace('.', ','), // Format français
        line.paidAmount.toFixed(2).replace('.', ','),
        line.remainingAmount.toFixed(2).replace('.', ','),
        line.status,
        line.paymentMethod || '',
        line.hasCredit ? 'Oui' : 'Non',
        `"${line.creditNumbers.join(', ')}"`
      ].join(';'))
    ];

    // Ajouter une ligne de totaux
    csvRows.push(''); // Ligne vide
    csvRows.push([
      'TOTAUX',
      '',
      '',
      `${reportData.length} factures`,
      reportTotals.totalInvoiced.toFixed(2).replace('.', ','),
      reportTotals.totalPaid.toFixed(2).replace('.', ','),
      reportTotals.totalOutstanding.toFixed(2).replace('.', ','),
      '',
      '',
      `${reportTotals.totalWithCredits} avec avoir`,
      ''
    ].join(';'));

    // Créer et télécharger le fichier
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM pour Excel
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = getFileName();
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Générer les années disponibles
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">📊 Extraction chiffre d'affaires</h2>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Mode {displayMode}
          </div>
        </div>
        <div>
          <p className="text-gray-600">Générez un tableau Excel de vos factures et encaissements</p>
        </div>
        
        <button
          onClick={downloadCSV}
          disabled={reportData.length === 0}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="h-5 w-5 mr-2" />
          Télécharger Excel
        </button>
      </div>

      {/* Configuration du rapport */}
      <div className="space-y-6">
        {/* Type de rapport */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-3">🎯 Type d'extraction</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                checked={reportType === 'payment_period'}
                onChange={() => setReportType('payment_period')}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-blue-900">Chiffre d'affaires ENCAISSÉ</div>
                <div className="text-sm text-blue-700">Factures filtrées par DATE DE PAIEMENT</div>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                checked={reportType === 'invoice_period'}
                onChange={() => setReportType('invoice_period')}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-blue-900">Chiffre d'affaires FACTURÉ</div>
                <div className="text-sm text-blue-700">Factures filtrées par DATE D'ÉMISSION</div>
              </div>
            </label>
          </div>
        </div>

        {/* Période */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">📅 Période d'analyse</h3>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={periodType === 'month'}
                  onChange={() => setPeriodType('month')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Mois précis</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={periodType === 'custom'}
                  onChange={() => setPeriodType('custom')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Période personnalisée</span>
              </label>
            </div>

            {periodType === 'month' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    {getAvailableYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mois</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">⚙️ Options</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeDrafts}
                onChange={(e) => setIncludeDrafts(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Inclure les brouillons</span>
            </label>
          </div>
        </div>
      </div>

      {/* Aperçu des résultats */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-green-800 mb-4">📈 Aperçu du rapport</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3 rounded border border-green-200">
            <div className="text-2xl font-bold text-green-900">{reportData.length}</div>
            <div className="text-sm text-green-700">Factures</div>
          </div>
          
          <div className="bg-white p-3 rounded border border-green-200">
            <div className="text-2xl font-bold text-green-900">{formatCurrency(reportTotals.totalInvoiced)}</div>
            <div className="text-sm text-green-700">Total facturé</div>
          </div>
          
          <div className="bg-white p-3 rounded border border-green-200">
            <div className="text-2xl font-bold text-green-900">{formatCurrency(reportTotals.totalPaid)}</div>
            <div className="text-sm text-green-700">Total encaissé</div>
          </div>
          
          <div className="bg-white p-3 rounded border border-green-200">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(reportTotals.totalOutstanding)}</div>
            <div className="text-sm text-orange-700">Reste à payer</div>
          </div>
        </div>

        <div className="text-sm text-green-700 space-y-1">
          <div>• {reportTotals.totalFullyPaid} factures entièrement payées</div>
          <div>• {reportTotals.totalWithCredits} factures avec avoirs</div>
          <div>• Fichier CSV compatible Excel français (séparateur ;)</div>
          <div>• {reportType === 'payment_period' ? 'Filtrage par date de paiement' : 'Filtrage par date d\'émission'}</div>
        </div>
      </div>

      {/* Exemple des données si on a des résultats */}
      {reportData.length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">👁️ Aperçu des données (5 premiers)</h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date émission</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date paiement</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avoir</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.slice(0, 5).map((line, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{line.invoiceNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{line.clientName}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{formatDate(line.invoiceDate)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {line.paymentDate ? formatDate(line.paymentDate) : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatCurrency(line.invoiceAmount)}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        line.status === 'paid' ? 'bg-green-100 text-green-800' :
                        line.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                        line.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {line.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {line.hasCredit ? (
                        <span className="text-red-600 font-medium">
                          {line.creditNumbers.join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {reportData.length > 5 && (
              <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-600">
                ... et {reportData.length - 5} autres factures
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message si pas de données */}
      {reportData.length === 0 && (
        <div className="mt-6 text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <FileSpreadsheet className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700 font-medium">Aucune facture trouvée pour cette période</p>
          <p className="text-yellow-600 text-sm mt-1">
            {reportType === 'payment_period' 
              ? 'Vérifiez que des factures ont été payées sur cette période'
              : 'Vérifiez que des factures ont été émises sur cette période'
            }
          </p>
        </div>
      )}
    </div>
  );
}