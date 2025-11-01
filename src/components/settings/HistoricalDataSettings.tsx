import React, { useState } from 'react';
import { Save, Plus, Trash2, BarChart3, Calendar, Import, Download } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/calculations';

interface HistoricalEntry {
  id: string;
  year: number;
  month: number;
  revenue: number;
  collections?: number;
  quotes?: number;
  description?: string;
}

export default function HistoricalDataSettings() {
  const { settings, updateSettings } = useApp();
  const [loading, setSaving] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalEntry[]>(
    settings.historicalData || []
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    revenue: 0,
    collections: 0,
    quotes: 0,
    description: ''
  });

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 10; year--) {
      years.push(year);
    }
    return years;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newSettings = {
        ...settings,
        historicalData: historicalData.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        })
      };
      
      await updateSettings(newSettings);
      alert('Données historiques sauvegardées !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEntry = () => {
    if (newEntry.revenue < 0) {
      alert('Le chiffre d\'affaires ne peut pas être négatif');
      return;
    }

    // Vérifier si une entrée existe déjà pour ce mois/année
    const existingEntry = historicalData.find(
      entry => entry.year === newEntry.year && entry.month === newEntry.month
    );

    if (existingEntry) {
      if (window.confirm(`Une entrée existe déjà pour ${months[newEntry.month - 1]} ${newEntry.year}. Remplacer ?`)) {
        setHistoricalData(prev => prev.map(entry => 
          entry.year === newEntry.year && entry.month === newEntry.month
            ? { ...entry, ...newEntry, id: entry.id }
            : entry
        ));
      }
    } else {
      const entry: HistoricalEntry = {
        id: `${newEntry.year}-${newEntry.month}`,
        year: newEntry.year,
        month: newEntry.month,
        revenue: newEntry.revenue,
        collections: newEntry.collections,
        quotes: newEntry.quotes,
        description: newEntry.description
      };

      setHistoricalData(prev => [...prev, entry]);
    }

    // Reset form
    setNewEntry({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      revenue: 0,
      collections: 0,
      quotes: 0,
      description: ''
    });
    setShowAddForm(false);
  };

  const handleRemoveEntry = (entryId: string) => {
    if (window.confirm('Supprimer cette entrée historique ?')) {
      setHistoricalData(prev => prev.filter(entry => entry.id !== entryId));
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
          const data: HistoricalEntry[] = [];

          // Ignorer la première ligne (en-têtes)
          lines.slice(1).forEach(line => {
            const [year, month, revenue, collections, quotes, description] = line.split(';');
            
            if (year && month && revenue) {
              data.push({
                id: `${year}-${month}`,
                year: parseInt(year),
                month: parseInt(month),
                revenue: parseFloat(revenue.replace(',', '.')) || 0,
                collections: parseFloat(collections?.replace(',', '.')) || 0,
                quotes: parseFloat(quotes?.replace(',', '.')) || 0,
                description: description || ''
              });
            }
          });

          if (data.length > 0) {
            setHistoricalData(prev => {
              const merged = [...prev];
              data.forEach(newEntry => {
                const existingIndex = merged.findIndex(
                  entry => entry.year === newEntry.year && entry.month === newEntry.month
                );
                if (existingIndex >= 0) {
                  merged[existingIndex] = newEntry;
                } else {
                  merged.push(newEntry);
                }
              });
              return merged;
            });
            alert(`${data.length} entrées importées avec succès !`);
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
    if (historicalData.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const headers = ['Année', 'Mois', 'Chiffre d\'affaires', 'Encaissements', 'Devis', 'Description'];
    const csvContent = [
      headers.join(';'),
      ...historicalData.map(entry => [
        entry.year,
        entry.month,
        entry.revenue.toFixed(2).replace('.', ','),
        (entry.collections || 0).toFixed(2).replace('.', ','),
        (entry.quotes || 0).toFixed(2).replace('.', ','),
        entry.description || ''
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `donnees_historiques_${new Date().getFullYear()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const totalHistoricalRevenue = historicalData.reduce((sum, entry) => sum + entry.revenue, 0);
  const totalHistoricalCollections = historicalData.reduce((sum, entry) => sum + (entry.collections || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Données historiques</h3>
        <p className="text-gray-600 mb-6">
          Intégrez vos chiffres d'affaires antérieurs pour enrichir les analyses du tableau de bord
        </p>
      </div>

      {/* Actions d'import/export */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-blue-800">💾 Import/Export</h4>
            <p className="text-sm text-blue-700">Gérez vos données en lot</p>
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
              disabled={historicalData.length === 0}
              className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              <Download className="h-4 w-4 mr-1" />
              Exporter CSV
            </button>
          </div>
        </div>
        
        <div className="text-sm text-blue-700">
          <p>📋 Format CSV attendu : Année;Mois;CA;Encaissements;Devis;Description</p>
          <p>📋 Exemple : 2023;12;15000,50;14500,00;18000,00;Décembre 2023</p>
        </div>
      </div>

      {/* Résumé des données */}
      {historicalData.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-3">📊 Résumé des données historiques</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-green-700">Périodes renseignées :</span>
              <div className="font-bold text-green-900">{historicalData.length} mois</div>
            </div>
            <div>
              <span className="text-green-700">CA historique total :</span>
              <div className="font-bold text-green-900">{formatCurrency(totalHistoricalRevenue)}</div>
            </div>
            <div>
              <span className="text-green-700">Encaissements historiques :</span>
              <div className="font-bold text-green-900">{formatCurrency(totalHistoricalCollections)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des entrées existantes */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">📈 Données par période</h4>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une période
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <h5 className="font-medium text-blue-900 mb-3">Nouvelle entrée historique</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année *</label>
                <select
                  value={newEntry.year}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                >
                  {getAvailableYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mois *</label>
                <select
                  value={newEntry.month}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                >
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CA facturé (€) *</label>
                <input
                  type="number"
                  value={newEntry.revenue || ''}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, revenue: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  min="0"
                  step="0.01"
                  placeholder="15000.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Encaissé (€)</label>
                <input
                  type="number"
                  value={newEntry.collections || ''}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, collections: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  min="0"
                  step="0.01"
                  placeholder="14500.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devis émis (€)</label>
                <input
                  type="number"
                  value={newEntry.quotes || ''}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, quotes: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  min="0"
                  step="0.01"
                  placeholder="18000.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                  placeholder="Ex: Ancien logiciel de facturation"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleAddEntry}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des entrées */}
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {historicalData.length === 0 ? (
            <div className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucune donnée historique</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ajouter votre première entrée
              </button>
            </div>
          ) : (
            historicalData
              .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
              })
              .map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full">
                        <Calendar className="h-5 w-5" />
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          {months[entry.month - 1]} {entry.year}
                        </div>
                        {entry.description && (
                          <div className="text-sm text-gray-600">{entry.description}</div>
                        )}
                        
                        <div className="text-sm text-gray-600 space-x-4 mt-1">
                          <span>CA: <strong>{formatCurrency(entry.revenue)}</strong></span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">TVA {entry.vatRate || 20}%</span>
                          {entry.collections && entry.collections > 0 && (
                            <span>
                              Encaissé: <strong className="text-green-600">
                                {displayMode === 'TTC' 
                                  ? formatCurrency(entry.collections)
                                  : formatCurrency(entry.collectionsHT || entry.collections)
                                } {displayMode}
                              </strong>
                            </span>
                          )}
                          {entry.quotes && entry.quotes > 0 && (
                            <span>
                              Devis: <strong className="text-blue-600">
                                {displayMode === 'TTC' 
                                  ? formatCurrency(entry.quotes)
                                  : formatCurrency(entry.quotesHT || entry.quotes)
                                } {displayMode}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setNewEntry({
                            year: entry.year,
                            month: entry.month,
                            revenue: entry.revenue,
                            collections: entry.collections || 0,
                            quotes: entry.quotes || 0,
                            description: entry.description || ''
                          });
                          setShowAddForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleRemoveEntry(entry.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Guide d'utilisation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-3">💡 Comment utiliser ces données ?</h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>
            <strong>🎯 Usage principal :</strong> CA global encaissé sur des périodes entières (ex: "Décembre 2023 = 15 000€ encaissés")
          </p>
          <p>
            <strong>1. Données mensuelles globales :</strong> CA facturé, montants encaissés, devis émis
          </p>
          <p>
            <strong>2. Différence avec "Encaissements externes" :</strong> Ici = montants globaux par mois, là-bas = factures individuelles
          </p>
          <p>
            <strong>3. Intégration automatique :</strong> dans tous les graphiques et analyses du tableau de bord
          </p>
          <p>
            <strong>4. Cas d'usage :</strong> "En décembre 2023, j'ai encaissé 15 000€ au total" (sans détail facture par facture)
          </p>
        </div>
        
        <div className="mt-4 p-3 bg-white border border-yellow-300 rounded text-xs text-yellow-800">
          <p><strong>💡 Deux approches complémentaires :</strong></p>
          <p>• <strong>Ici (Données historiques)</strong> : "Décembre 2023 = 15 000€ encaissés au total"</p>
          <p>• <strong>Encaissements externes</strong> : "Facture FAC-202 émise le 15/08 payée le 15/09"</p>
          <p>→ <strong>Utilisez les deux selon vos besoins !</strong></p>
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