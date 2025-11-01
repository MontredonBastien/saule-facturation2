import React from 'react';
import { Calculator, TrendingUp, TrendingDown, FileText, BarChart3, BarChart2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/calculations';
import QuickStats from '../components/charts/QuickStats';
import AdvancedCharts from '../components/charts/AdvancedCharts';
import ClientAnalysis from '../components/charts/ClientAnalysis';
import RevenueReport from '../components/charts/RevenueReport';

export default function DashboardPage() {
  const { quotes, invoices } = useApp();
  const [displayMode, setDisplayMode] = React.useState<'HT' | 'TTC'>('TTC');

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart2 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Analytics</h1>
              <p className="text-gray-600 mt-1">Analysez votre activité par période et métrique de votre choix</p>
            </div>
          </div>
          
          {/* Sélecteur HT/TTC global */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Affichage global :</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDisplayMode('HT')}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  displayMode === 'HT' 
                    ? 'bg-white text-gray-900 shadow-sm ring-2 ring-blue-500' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                HT
              </button>
              <button
                onClick={() => setDisplayMode('TTC')}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  displayMode === 'TTC' 
                    ? 'bg-white text-gray-900 shadow-sm ring-2 ring-blue-500' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                TTC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <QuickStats displayMode={displayMode} />

      {/* Analytics avancées */}
      <div className="mb-8">
        <AdvancedCharts displayMode={displayMode} />
      </div>
      
      {/* Extraction chiffre d'affaires */}
      <div className="mb-8">
        <RevenueReport displayMode={displayMode} />
      </div>
      
      {/* Analyse par client */}
      <div className="mb-8">
        <ClientAnalysis displayMode={displayMode} />
      </div>

      {/* Message d'accueil si pas de données */}
      {quotes.length === 0 && invoices.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
          <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-blue-900 mb-3">Bienvenue dans Saule Facturation Analytics !</h3>
          <p className="text-blue-700 mb-4">
            Créez vos premiers devis et factures pour découvrir des analyses détaillées :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">📈 Analytics disponibles</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Chiffre d'affaires par période</li>
                <li>• Encaissements réels vs facturé</li>
                <li>• Analyse des créances impayées</li>
                <li>• Taux de transformation devis/factures</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">🗓️ Périodes flexibles</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Analyse par jour, semaine, mois</li>
                <li>• Comparaison entre périodes</li>
                <li>• Périodes personnalisées</li>
                <li>• Évolution temporelle</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}