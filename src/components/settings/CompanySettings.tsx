import React, { useState } from 'react';
import { Save, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import ImageUpload from '../ImageUpload';

export default function CompanySettings() {
  const { settings, updateSettings } = useApp();
  const [companyData, setCompanyData] = useState(settings.company);
  const [loading, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ company: companyData });
      alert('Paramètres entreprise sauvegardés !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de l'entreprise</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'entreprise *
            </label>
            <input
              type="text"
              value={companyData.name || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse *
            </label>
            <textarea
              value={companyData.address || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code postal *
            </label>
            <input
              type="text"
              value={companyData.postalCode || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, postalCode: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="69000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ville *
            </label>
            <input
              type="text"
              value={companyData.city || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Lyon"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays
            </label>
            <input
              type="text"
              value={companyData.country || 'FR'}
              onChange={(e) => setCompanyData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="FR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone *
            </label>
            <input
              type="tel"
              value={companyData.phone || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={companyData.email || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SIRET
            </label>
            <input
              type="text"
              value={companyData.siret || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, siret: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SIREN
            </label>
            <input
              type="text"
              value={companyData.siren || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, siren: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              N° TVA intracommunautaire
            </label>
            <input
              type="text"
              value={companyData.tvaIntracommunautaire || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, tvaIntracommunautaire: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="FR12345678901"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              N° RCS
            </label>
            <input
              type="text"
              value={companyData.rcs || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, rcs: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="RCS Lyon 123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forme juridique
            </label>
            <select
              value={companyData.formeJuridique || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, formeJuridique: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Sélectionner...</option>
              <option value="SARL">SARL</option>
              <option value="SAS">SAS</option>
              <option value="SASU">SASU</option>
              <option value="EURL">EURL</option>
              <option value="SA">SA</option>
              <option value="SNC">SNC</option>
              <option value="Auto-entrepreneur">Auto-entrepreneur</option>
              <option value="EI">Entreprise Individuelle</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capital social
            </label>
            <input
              type="text"
              value={companyData.capitalSocial || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, capitalSocial: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
              placeholder="10 000 euros ou Capital variable"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devise du capital
            </label>
            <select
              value={companyData.capitalCurrency || 'euros'}
              onChange={(e) => setCompanyData(prev => ({ ...prev, capitalCurrency: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="euros">euros</option>
              <option value="€">€</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Coordonnées bancaires</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la banque
            </label>
            <input
              type="text"
              value={companyData.bankName || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, bankName: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IBAN
            </label>
            <input
              type="text"
              value={companyData.iban || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, iban: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BIC
            </label>
            <input
              type="text"
              value={companyData.bic || ''}
              onChange={(e) => setCompanyData(prev => ({ ...prev, bic: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logo de l'entreprise</h3>
        <ImageUpload
          value={companyData.logo}
          onChange={(logo) => setCompanyData(prev => ({ ...prev, logo }))}
          logoSize={companyData.logoSize || 24}
          onLogoSizeChange={(size) => setCompanyData(prev => ({ ...prev, logoSize: size }))}
          label="Logo pour les documents PDF"
          maxSize={2}
        />
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