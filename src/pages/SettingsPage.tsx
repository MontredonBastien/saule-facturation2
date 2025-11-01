import React, { useState } from 'react';
import { Building, Palette, FileText, Bell, Users, Database, CreditCard } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import CompanySettings from '../components/settings/CompanySettings';
import DocumentTemplateSettings from '../components/settings/DocumentTemplateSettings';
import NumberingSettings from '../components/settings/NumberingSettings';
import ListsSettings from '../components/settings/ListsSettings';
import ElectronicInvoicingSettings from '../components/ElectronicInvoicingSettings';
import SyncManager from '../components/SyncManager';
import HistoricalDataSettings from '../components/settings/HistoricalDataSettings';
import ExternalPaymentsSettings from '../components/settings/ExternalPaymentsSettings';

const settingsTabs = [
  { id: 'company', label: 'Entreprise', icon: Building },
  { id: 'template', label: 'Modèles PDF', icon: Palette },
  { id: 'numbering', label: 'Numérotation', icon: FileText },
  { id: 'lists', label: 'Listes', icon: Users },
  { id: 'historical', label: 'Données historiques', icon: Bell },
  { id: 'external-payments', label: 'Encaissements externes', icon: CreditCard },
  { id: 'electronic', label: 'Facturation électronique', icon: Bell },
  { id: 'sync', label: 'Synchronisation', icon: Database }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return <CompanySettings />;
      case 'template':
        return <DocumentTemplateSettings />;
      case 'numbering':
        return <NumberingSettings />;
      case 'lists':
        return <ListsSettings />;
      case 'historical':
        return <HistoricalDataSettings />;
      case 'external-payments':
        return <ExternalPaymentsSettings />;
      case 'electronic':
        return <ElectronicInvoicingSettings />;
      case 'sync':
        return <SyncManager />;
      default:
        return <CompanySettings />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Configuration de votre application</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation des onglets */}
        <div className="lg:w-64 bg-white rounded-lg border border-gray-200 p-4">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}