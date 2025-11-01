import React, { useState, useEffect } from 'react';
import { Zap, Shield, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function ElectronicInvoicingSettings() {
  const { settings, updateSettings } = useApp();

  const [electronicSettings, setElectronicSettings] = useState({
    enabled: false,
    defaultFormat: 'factur-x' as 'factur-x' | 'ubl' | 'xml-cii',
    facturXOptions: {
      defaultConformanceLevel: 'EN16931' as 'MINIMUM' | 'BASIC_WL' | 'BASIC' | 'EN16931' | 'EXTENDED',
      includeAttachments: false,
      signPDF: false
    },
    notifications: {
      email: false,
      emailAddress: '',
      webhookUrl: ''
    }
  });

  // Charger les paramètres depuis le contexte
  useEffect(() => {
    if (settings?.electronicInvoicing) {
      setElectronicSettings(prev => ({
        ...prev,
        ...settings.electronicInvoicing
      }));
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        electronicInvoicing: electronicSettings
      });
      alert('Paramètres de facturation électronique sauvegardés !');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    }
  };

  return (
    <div className="space-y-8">
      {/* Vue d'ensemble */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center mb-4">
          <Zap className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-xl font-bold text-blue-900">Facturation Électronique</h3>
            <p className="text-blue-700">Format Factur-X pour la conformité européenne</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <FileText className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Factur-X</h4>
            <p className="text-sm text-gray-600">PDF/A-3 + XML intégré</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <Shield className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Conformité</h4>
            <p className="text-sm text-gray-600">EN16931 & B2B 2026</p>
          </div>
        </div>
      </div>

      {/* Activation générale */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Activation</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={electronicSettings.enabled}
              onChange={(e) => setElectronicSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Activer la facturation électronique</span>
          </label>
        </div>

        {electronicSettings.enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format par défaut
              </label>
              <select
                value={electronicSettings.defaultFormat}
                onChange={(e) => setElectronicSettings(prev => ({ 
                  ...prev, 
                  defaultFormat: e.target.value as 'factur-x' | 'ubl' | 'xml-cii' 
                }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="factur-x">Factur-X (PDF/A-3 + XML)</option>
                <option value="ubl">UBL 2.1 (XML uniquement)</option>
                <option value="xml-cii">XML CII (Cross Industry Invoice)</option>
              </select>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Documents électroniques activés</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={electronicSettings.enabledForInvoices !== false}
                      onChange={(e) => setElectronicSettings(prev => ({ ...prev, enabledForInvoices: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Factures électroniques</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={electronicSettings.enabledForCredits || false}
                      onChange={(e) => setElectronicSettings(prev => ({ ...prev, enabledForCredits: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Avoirs électroniques</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">📋 Status de l'implémentation</h4>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>✅ Interface utilisateur :</strong> Complète et fonctionnelle</li>
                      <li><strong>✅ Configuration :</strong> Paramètres Factur-X</li>
                      <li><strong>⚠️ Génération Factur-X :</strong> Démonstration (nécessite librairie tierce)</li>
                      <li><strong>💡 Production :</strong> Intégrer factur-x-js pour PDF/A-3 complet</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Factur-X */}
      {electronicSettings.enabled && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Factur-X</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de conformité
              </label>
              <select
                value={electronicSettings.facturXOptions.defaultConformanceLevel}
                onChange={(e) => setElectronicSettings(prev => ({ 
                  ...prev, 
                  facturXOptions: { 
                    ...prev.facturXOptions, 
                    defaultConformanceLevel: e.target.value as any 
                  } 
                }))}
                className="w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="MINIMUM">MINIMUM - Factures simples</option>
                <option value="BASIC_WL">BASIC WL - Avec liste blanche</option>
                <option value="BASIC">BASIC - Informations de base</option>
                <option value="EN16931">EN16931 - Standard européen (recommandé)</option>
                <option value="EXTENDED">EXTENDED - Informations étendues</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={electronicSettings.facturXOptions.includeAttachments}
                  onChange={(e) => setElectronicSettings(prev => ({ 
                    ...prev, 
                    facturXOptions: { ...prev.facturXOptions, includeAttachments: e.target.checked } 
                  }))}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Inclure les pièces jointes</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={electronicSettings.facturXOptions.signPDF}
                  onChange={(e) => setElectronicSettings(prev => ({ 
                    ...prev, 
                    facturXOptions: { ...prev.facturXOptions, signPDF: e.target.checked } 
                  }))}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Signature électronique du PDF</span>
              </label>
            </div>
          </div>
        </div>
      )}


      {/* Notifications */}
      {electronicSettings.enabled && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={electronicSettings.notifications.email}
                onChange={(e) => setElectronicSettings(prev => ({ 
                  ...prev, 
                  notifications: { ...prev.notifications, email: e.target.checked } 
                }))}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Notifications par email</span>
            </label>

            {electronicSettings.notifications.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email pour les notifications
                </label>
                <input
                  type="email"
                  value={electronicSettings.notifications.emailAddress}
                  onChange={(e) => setElectronicSettings(prev => ({ 
                    ...prev, 
                    notifications: { ...prev.notifications, emailAddress: e.target.value } 
                  }))}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="notifications@votre-entreprise.fr"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL (optionnel)
              </label>
              <input
                type="url"
                value={electronicSettings.notifications.webhookUrl}
                onChange={(e) => setElectronicSettings(prev => ({ 
                  ...prev, 
                  notifications: { ...prev.notifications, webhookUrl: e.target.value } 
                }))}
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholder="https://votre-app.com/webhook/electronic-invoicing"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL appelée lors des changements de statut sur Chorus Pro
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informations et aide */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">🔍 Qu'est-ce que Factur-X ?</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              Factur-X est un format de facture électronique qui combine un PDF lisible par l'humain 
              avec des données XML structurées intégrées. Ce format respecte la norme européenne EN16931 
              et permet une facturation 100% dématérialisée tout en restant lisible visuellement. 
              Il s'applique aussi bien aux factures qu'aux avoirs.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-blue-800 mb-2">⚡ Prochaines obligations</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              À partir de 2026, toutes les entreprises françaises devront utiliser la facturation 
              électronique pour leurs échanges B2B (business-to-business), y compris pour les avoirs. 
              Préparez-vous dès maintenant !
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setElectronicSettings({
            enabled: false,
            defaultFormat: 'factur-x',
            facturXOptions: { defaultConformanceLevel: 'EN16931', includeAttachments: false, signPDF: false },
            notifications: { email: false, emailAddress: '', webhookUrl: '' }
          })}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Réinitialiser
        </button>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Sauvegarder la configuration
        </button>
      </div>
    </div>
  );
}