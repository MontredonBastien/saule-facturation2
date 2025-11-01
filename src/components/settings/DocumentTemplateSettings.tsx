import React, { useState } from 'react';
import { Save, Palette } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import DocumentPreview from '../DocumentPreview';

export default function DocumentTemplateSettings() {
  const { settings, updateSettings } = useApp();
  const [templateData, setTemplateData] = useState(settings.documentTemplate);
  const [loading, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ documentTemplate: templateData });
      alert('Paramètres de modèle sauvegardés !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (newColor: string) => {
    // Mettre à jour la couleur principale partout
    setTemplateData(prev => ({
      ...prev,
      primaryColor: newColor,
      colors: { ...prev.colors, primary: newColor }
    }));
  };

  const handleFontSizeChange = (sizeType: string, newSize: number) => {
    setTemplateData(prev => ({
      ...prev,
      textSizes: {
        ...prev.textSizes,
        [sizeType]: newSize
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Couleur principale */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🎨 Couleur du thème</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Couleur principale (bannière, boutons, tableaux)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={templateData.primaryColor || '#8bc34a'}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-16 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {templateData.primaryColor || '#8bc34a'}
                    </div>
                    <div className="text-xs text-gray-600">
                      Cette couleur sera utilisée pour tous les éléments colorés
                    </div>
                  </div>
                </div>
              </div>

              {/* Couleurs prédéfinies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Couleurs prédéfinies (primaire)
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    '#8bc34a', // Vert par défaut
                    '#2563eb', // Bleu
                    '#dc2626', // Rouge
                    '#7c3aed', // Violet
                    '#ea580c', // Orange
                    '#059669', // Vert émeraude
                    '#0891b2', // Cyan
                    '#be123c', // Rose
                    '#1f2937', // Gris foncé
                    '#92400e', // Brun
                    '#4338ca', // Indigo
                    '#166534'  // Vert foncé
                  ].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        templateData.primaryColor === color 
                          ? 'border-gray-800 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Couleur secondaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Couleur secondaire (arrière-plans)
                </label>
                <div className="flex items-center space-x-4 mb-3">
                  <input
                    type="color"
                    value={templateData.secondaryColor || '#f3f4f6'}
                    onChange={(e) => setTemplateData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-16 h-16 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {templateData.secondaryColor || '#f3f4f6'}
                    </div>
                    <div className="text-xs text-gray-600">
                      Couleur des arrière-plans et lignes alternées
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleurs prédéfinies (secondaire)
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      '#f3f4f6', // Gris clair par défaut
                      '#eff6ff', // Bleu très clair
                      '#fef2f2', // Rouge très clair
                      '#f5f3ff', // Violet très clair
                      '#fff7ed', // Orange très clair
                      '#ecfdf5', // Vert très clair
                      '#f0fdfa', // Cyan très clair
                      '#fdf2f8', // Rose très clair
                      '#f9fafb', // Gris très clair
                      '#fefce8', // Jaune très clair
                      '#eef2ff', // Indigo très clair
                      '#f0fdf4'  // Vert très clair
                    ].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setTemplateData(prev => ({ ...prev, secondaryColor: color }))}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          templateData.secondaryColor === color 
                            ? 'border-gray-800 scale-110' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tailles de police */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📏 Tailles de police</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titres (sections)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="8"
                      max="16"
                      value={templateData.textSizes?.title || 12}
                      onChange={(e) => handleFontSizeChange('title', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">
                      {templateData.textSizes?.title || 12}px
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte normal
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="7"
                      max="14"
                      value={templateData.textSizes?.normal || 9}
                      onChange={(e) => handleFontSizeChange('normal', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">
                      {templateData.textSizes?.normal || 9}px
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Petits textes
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="6"
                      max="12"
                      value={templateData.textSizes?.small || 8}
                      onChange={(e) => handleFontSizeChange('small', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">
                      {templateData.textSizes?.small || 8}px
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Totaux
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="8"
                      max="16"
                      value={templateData.textSizes?.subtitle || 10}
                      onChange={(e) => handleFontSizeChange('subtitle', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">
                      {templateData.textSizes?.subtitle || 10}px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Police de caractères */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🔤 Police de caractères</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Police principale
                </label>
                <select
                  value={templateData.fontFamily || 'helvetica'}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="helvetica">Helvetica (moderne et lisible)</option>
                  <option value="times">Times (classique et élégant)</option>
                  <option value="courier">Courier (style machine à écrire)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Options d'affichage */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">⚙️ Options d'affichage</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={templateData.showLogo !== false}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, showLogo: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="ml-3 text-sm text-gray-700">Afficher le logo sur les documents</span>
              </label>
            </div>
          </div>

          {/* Paramètres par défaut */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">⚙️ Paramètres par défaut pour nouveaux documents</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Conditions légales personnalisées (factures)</h4>
                <textarea
                  value={templateData.conditions?.legalConditions || ''}
                  onChange={(e) => setTemplateData(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, legalConditions: e.target.value }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  rows={4}
                  placeholder="Conditions spécifiques (pénalités, escompte, recouvrement...)&#10;Ex: Pas d'escompte pour règlement anticipé. En cas de retard de paiement..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ces conditions apparaîtront automatiquement sur toutes les factures
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Devis - Affichage par défaut</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.defaults?.showCgvOnNewQuotes || false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        defaults: { ...prev.defaults, showCgvOnNewQuotes: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">CGV cochées par défaut</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.defaults?.showCglOnNewQuotes || false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        defaults: { ...prev.defaults, showCglOnNewQuotes: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">CGL cochées par défaut</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.defaults?.showCommentsOnNewQuotes !== false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        defaults: { ...prev.defaults, showCommentsOnNewQuotes: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Commentaires cochés par défaut</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Factures - Affichage par défaut</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.defaults?.showCgvOnNewInvoices || false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        defaults: { ...prev.defaults, showCgvOnNewInvoices: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">CGV cochées par défaut</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.defaults?.showCglOnNewInvoices || false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        defaults: { ...prev.defaults, showCglOnNewInvoices: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">CGL cochées par défaut</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.defaults?.showCommentsOnNewInvoices !== false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        defaults: { ...prev.defaults, showCommentsOnNewInvoices: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Commentaires cochés par défaut</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Avoirs - Affichage par défaut</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.defaults?.showCommentsOnNewCredits !== false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        defaults: { ...prev.defaults, showCommentsOnNewCredits: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Commentaires cochés par défaut</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions Générales de Vente (CGV)
                </label>
                <textarea
                  value={templateData.conditions?.cgv || ''}
                  onChange={(e) => setTemplateData(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, cgv: e.target.value }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  rows={3}
                  placeholder="Conditions générales de vente..."
                />
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.conditions?.showCgvOnQuotes || false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, showCgvOnQuotes: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Afficher sur les devis</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.conditions?.showCgvOnInvoices || false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, showCgvOnInvoices: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Afficher sur les factures</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions Générales de Location (CGL)
                </label>
                <textarea
                  value={templateData.conditions?.cgl || ''}
                  onChange={(e) => setTemplateData(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, cgl: e.target.value }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  rows={3}
                  placeholder="Conditions générales de location..."
                />
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.conditions?.showCglOnQuotes || false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, showCglOnQuotes: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Afficher sur les devis</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={templateData.conditions?.showCglOnInvoices || false}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, showCglOnInvoices: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Afficher sur les factures</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires de pied de page */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">💬 Textes de pied de page</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devis
                </label>
                <input
                  type="text"
                  value={templateData.footerTexts?.quote || ''}
                  onChange={(e) => setTemplateData(prev => ({
                    ...prev,
                    footerTexts: { ...prev.footerTexts, quote: e.target.value }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Texte affiché en bas des devis"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factures
                </label>
                <input
                  type="text"
                  value={templateData.footerTexts?.invoice || ''}
                  onChange={(e) => setTemplateData(prev => ({
                    ...prev,
                    footerTexts: { ...prev.footerTexts, invoice: e.target.value }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Texte affiché en bas des factures"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avoirs
                </label>
                <input
                  type="text"
                  value={templateData.footerTexts?.credit || ''}
                  onChange={(e) => setTemplateData(prev => ({
                    ...prev,
                    footerTexts: { ...prev.footerTexts, credit: e.target.value }
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Texte affiché en bas des avoirs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">⚖️ Paramètres juridiques</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indemnité de recouvrement (factures)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={settings.defaults?.recouvrementIndemnity || 40}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 40;
                      const newSettings = {
                        ...settings,
                        defaults: {
                          ...settings.defaults,
                          recouvrementIndemnity: value
                        }
                      };
                      updateSettings(newSettings);
                    }}
                    className="w-20 rounded-md border-gray-300 shadow-sm"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-600">€</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Montant légal affiché sur les factures (article L441-6 du Code de commerce)
                </p>
              </div>
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

        {/* Aperçu en temps réel */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">👁️ Aperçu en temps réel</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <DocumentPreview 
              settings={{ ...settings, documentTemplate: templateData }} 
              type="quote" 
            />
          </div>
          
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="font-medium text-blue-800 mb-2">💡 Conseils</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• La couleur principale s'applique automatiquement à tous les éléments</li>
              <li>• Les tailles de police s'adaptent au contenu du document</li>
              <li>• L'aperçu se met à jour automatiquement lors des modifications</li>
              <li>• Les conditions générales apparaissent sur une page séparée si activées</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}