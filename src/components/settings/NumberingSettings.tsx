import React, { useState } from 'react';
import { Save, Hash } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function NumberingSettings() {
  const { settings, updateSettings } = useApp();
  const [numberingData, setNumberingData] = useState(settings.numbering);
  const [loading, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ numbering: numberingData });
      alert('Paramètres de numérotation sauvegardés !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Préfixes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Devis</label>
            <input
              type="text"
              value={numberingData.quotePrefix || ''}
              onChange={(e) => setNumberingData(prev => ({ ...prev, quotePrefix: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Factures</label>
            <input
              type="text"
              value={numberingData.invoicePrefix || ''}
              onChange={(e) => setNumberingData(prev => ({ ...prev, invoicePrefix: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avoirs</label>
            <input
              type="text"
              value={numberingData.creditPrefix || ''}
              onChange={(e) => setNumberingData(prev => ({ ...prev, creditPrefix: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compteurs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prochain numéro de devis</label>
            <input
              type="number"
              value={numberingData.quoteCounter || 1}
              onChange={(e) => setNumberingData(prev => ({ ...prev, quoteCounter: parseInt(e.target.value) || 1 }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prochain numéro de facture</label>
            <input
              type="number"
              value={numberingData.invoiceCounter || 1}
              onChange={(e) => setNumberingData(prev => ({ ...prev, invoiceCounter: parseInt(e.target.value) || 1 }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prochain numéro d'avoir</label>
            <input
              type="number"
              value={numberingData.creditCounter || 1}
              onChange={(e) => setNumberingData(prev => ({ ...prev, creditCounter: parseInt(e.target.value) || 1 }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              min="1"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Format de numérotation</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={numberingData.yearInNumber !== false}
              onChange={(e) => setNumberingData(prev => ({ ...prev, yearInNumber: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Inclure l'année dans le numéro</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={numberingData.monthInNumber === true}
              onChange={(e) => setNumberingData(prev => ({ ...prev, monthInNumber: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Inclure le mois dans le numéro</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={numberingData.resetYearly !== false}
              onChange={(e) => setNumberingData(prev => ({ ...prev, resetYearly: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Remettre à zéro chaque année</span>
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-800 mb-2">Aperçu de la numérotation</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div>Devis : {numberingData.quotePrefix}-{numberingData.yearInNumber ? '2025-' : ''}{numberingData.monthInNumber ? '01-' : ''}00001</div>
          <div>Facture : {numberingData.invoicePrefix}-{numberingData.yearInNumber ? '2025-' : ''}{numberingData.monthInNumber ? '01-' : ''}00001</div>
          <div>Avoir : {numberingData.creditPrefix}-{numberingData.yearInNumber ? '2025-' : ''}{numberingData.monthInNumber ? '01-' : ''}00001</div>
        </div>
      </div>

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