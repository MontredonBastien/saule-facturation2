import React, { useState } from 'react';
import { RefreshCw, Download, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { syncService } from '../services/syncService';
import { useApp } from '../contexts/AppContext';

interface SyncManagerProps {
  onSyncComplete?: () => void;
}

export default function SyncManager({ onSyncComplete }: SyncManagerProps) {
  const { importSyncedData, logAction, isAutoSyncRunning, startAutoSync, stopAutoSync, performManualSync } = useApp();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  const [showToken, setShowToken] = useState(false);

  const handleSync = async () => {
    if (!token.trim()) {
      alert('Veuillez saisir le token de synchronisation');
      return;
    }

    if (!syncService.validateToken(token)) {
      alert('Token invalide. Veuillez vérifier le format.');
      return;
    }

    setIsLoading(true);
    setLastSyncResult(null);

    try {
      const result = await performManualSync(token);
      
      setLastSyncResult(result);

      if (result.success && result.data) {
        // Transformer et importer les données
        const transformedData = {
          clients: syncService.transformClients(result.data.clients || []),
          articles: syncService.transformArticles(result.data.articles || []),
          quotes: syncService.transformQuotes(result.data.quotes || []),
          invoices: syncService.transformInvoices(result.data.invoices || []),
          credits: syncService.transformCredits(result.data.credits || [])
        };

        // Importer dans l'application
        importSyncedData(transformedData);

        // Log de l'action
        logAction({
          userId: '00000000-0000-0000-0000-000000000001',
          userName: 'Admin User',
          action: 'import',
          module: 'system',
          details: `Synchronisation réussie: ${result.stats.clients} clients, ${result.stats.articles} articles, ${result.stats.quotes} devis, ${result.stats.invoices} factures`
        });

        // Sauvegarder le token pour les prochaines sync
        localStorage.setItem('syncToken', token);

        if (onSyncComplete) {
          onSyncComplete();
        }
      }

    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setLastSyncResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stats: { clients: 0, quotes: 0, invoices: 0, payments: 0, articles: 0, companies: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoSync = () => {
    if (isAutoSyncRunning) {
      stopAutoSync();
    } else {
      // Sauvegarder le token avant de démarrer
      if (token.trim()) {
        localStorage.setItem('syncToken', token);
      }
      startAutoSync();
    }
  };

  // Charger le token sauvegardé au montage
  React.useEffect(() => {
    const savedToken = localStorage.getItem('syncToken') || 'eyJ1c2VySWQiOiI2ODVmODA0OC01ZjkzLTRhMzctYjJmZC0yNzNhNGI2MmQ1NDciLCJlbWFpbCI6ImNvbnRhY3RAZHVzYXVsZS1hLWxhcmJyZS5mciIsInRpbWVzdGFtcCI6MTc1NjUzOTA0NjYxOSwiZXhwaXJlc0F0IjpudWxsLCJkdXJhdGlvbiI6InBlcm1hbmVudCIsInZlcnNpb24iOiIxLjAiLCJzb3VyY2UiOiJhZG1pbi1zeW5jIn0=';
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Synchronisation des données</h3>
          <p className="text-sm text-gray-600 mt-1">
            Importez vos données depuis l'application de gestion des clients
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastSyncResult?.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : lastSyncResult && !lastSyncResult.success ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {/* Configuration du token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token de synchronisation *
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Token Base64 fourni par l'application maître"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showToken ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Token fourni par l'application maître de gestion des clients
          </p>
        </div>

        {/* Bouton de synchronisation */}
        <div className="flex justify-between items-center space-x-4">
          <div className="text-sm text-gray-600">
            {lastSyncResult && (
              <span className={lastSyncResult.success ? 'text-green-600' : 'text-red-600'}>
                Dernière sync: {lastSyncResult.message}
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {/* Synchronisation automatique */}
            <button
              onClick={toggleAutoSync}
              disabled={!token.trim()}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                !token.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isAutoSyncRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title={isAutoSyncRunning ? 'Arrêter la synchronisation automatique' : 'Démarrer la synchronisation automatique'}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAutoSyncRunning ? 'animate-spin' : ''}`} />
              {isAutoSyncRunning ? 'Arrêter Auto' : 'Auto Sync'}
            </button>
            
            {/* Synchronisation manuelle */}
            <button
              onClick={handleSync}
              disabled={isLoading || !token.trim()}
              className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                isLoading || !token.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Download className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Sync...' : 'Sync Now'}
            </button>
          </div>
        </div>

        {/* Résultats de la dernière synchronisation */}
        {lastSyncResult && (
          <div className={`p-4 rounded-lg border ${
            lastSyncResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              {lastSyncResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={`font-medium ${
                lastSyncResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {lastSyncResult.success ? 'Synchronisation réussie' : 'Échec de la synchronisation'}
              </span>
            </div>

            <p className={`text-sm ${
              lastSyncResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {lastSyncResult.message}
            </p>

            {lastSyncResult.success && lastSyncResult.stats && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Clients:</span>
                  <span className="font-medium text-green-800">{lastSyncResult.stats.clients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Articles:</span>
                  <span className="font-medium text-green-800">{lastSyncResult.stats.articles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Devis:</span>
                  <span className="font-medium text-green-800">{lastSyncResult.stats.quotes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Factures:</span>
                  <span className="font-medium text-green-800">{lastSyncResult.stats.invoices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Entreprises:</span>
                  <span className="font-medium text-green-800">{lastSyncResult.stats.companies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Paiements:</span>
                  <span className="font-medium text-green-800">{lastSyncResult.stats.payments}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informations sur la synchronisation */}
        <div className={`border rounded-md p-4 ${
          isAutoSyncRunning 
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <h4 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Informations</h4>
          <ul className={`text-sm space-y-1 ${
            isAutoSyncRunning ? 'text-green-700' : 'text-blue-700'
          }`}>
            <li>• Synchronisation avec : module-saule-locatio-ijsb.bolt.host</li>
            <li>• Tables importées : clients, devis, factures, paiements, articles, entreprises</li>
            <li>• Les données locales existantes seront fusionnées</li>
            <li>• Importation one-way depuis l'application maître uniquement</li>
            <li className="font-medium">
              • Synchronisation automatique : {isAutoSyncRunning ? '🟢 ACTIVE (toutes les 2 min)' : '🔴 INACTIVE'}
            </li>
          </ul>
          
          {isAutoSyncRunning && (
            <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
              ✨ Les nouveaux clients créés dans l'app maître apparaîtront automatiquement ici !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}