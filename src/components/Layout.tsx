import React, { useState, useEffect } from 'react';
import { FileText, Receipt, SendToBack as RefundBack, Users, Package, Settings, UserCheck, Download, Calculator, Menu, X, Building, RefreshCw, ChevronDown, LogOut, User, Mail, Shield, Briefcase } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useSuperAdmin } from '../hooks/useSuperAdmin';
import { useCompanyModules } from '../hooks/useCompanyModules';
import { useAccountant } from '../hooks/useAccountant';
import AccountantCompanySelector from './AccountantCompanySelector';

interface LayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (module: string) => void;
}

const allMenuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: Calculator },
  { id: 'quotes', label: 'Devis', icon: FileText },
  { id: 'invoices', label: 'Factures', icon: Receipt },
  { id: 'credits', label: 'Avoirs', icon: RefundBack },
  { id: 'articles', label: 'Articles', icon: Package },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'emails', label: 'Envoi de documents', icon: Mail },
  { id: 'users', label: 'Utilisateurs', icon: UserCheck },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

const superAdminMenuItem = { id: 'superadmin', label: 'Super-Admin', icon: Shield };
const accountantMenuItem = { id: 'accountant-clients', label: 'Mes Clients', icon: Briefcase };

export default function Layout({ children, currentModule, onModuleChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [selectedAccountantCompany, setSelectedAccountantCompany] = useState<string | undefined>(undefined);
  const { performAutoSync, isAutoSyncRunning, startAutoSync, stopAutoSync } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const { isAccountant, loading: accountantLoading } = useAccountant();
  const { enabledModules, loading: modulesLoading } = useCompanyModules(companyId);

  // Récupérer le company_id de l'utilisateur (mode démo pour l'instant)
  useEffect(() => {
    const loadCompanyId = () => {
      // En mode démo, pas de company_id (tous les modules activés)
      // TODO: En production, récupérer depuis l'utilisateur Supabase Auth
      setCompanyId(undefined);
    };
    loadCompanyId();
  }, []);

  // Filtrer les items du menu selon les modules activés
  const filteredMenuItems = allMenuItems.filter((item) =>
    enabledModules.includes(item.id as any)
  );

  // Construire le menu final
  let menuItems = filteredMenuItems;
  if (isSuperAdmin) {
    menuItems = [...menuItems, superAdminMenuItem];
  }
  if (isAccountant) {
    menuItems = [...menuItems, accountantMenuItem];
  }

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      await performAutoSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleAutoSync = () => {
    if (isAutoSyncRunning) {
      stopAutoSync();
    } else {
      startAutoSync();
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        // Arrêter la synchronisation automatique
        stopAutoSync();

        // Supprimer la session démo
        localStorage.removeItem('demoSession');

        // Supprimer les autres données
        localStorage.removeItem('factApp_settings');
        localStorage.removeItem('syncToken');
        localStorage.removeItem('audit_logs');
        localStorage.removeItem('lastSyncTimestamp');

        // Déconnexion Supabase si connecté
        try {
          await import('../lib/supabase').then(({ supabase }) => supabase.auth.signOut());
        } catch (err) {
          console.warn('Supabase signOut failed:', err);
        }

        window.location.reload();
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        alert('Erreur lors de la déconnexion');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Saule Facturation</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sélecteur d'entreprise pour les comptables */}
        {isAccountant && !accountantLoading && (
          <div className="px-3 py-4 border-b border-gray-200 bg-blue-50">
            <div className="text-xs font-medium text-blue-700 mb-2 px-1">
              Entreprise cliente
            </div>
            <AccountantCompanySelector
              currentCompanyId={selectedAccountantCompany}
              onCompanyChange={setSelectedAccountantCompany}
            />
          </div>
        )}

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onModuleChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Statut de synchronisation */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isAutoSyncRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-600">
                Sync {isAutoSyncRunning ? 'activée' : 'arrêtée'}
              </span>
            </div>
            <button
              onClick={toggleAutoSync}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isAutoSyncRunning 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isAutoSyncRunning ? 'Arrêter' : 'Démarrer'}
            </button>
          </div>
        </div>
        
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleQuickSync}
              disabled={isSyncing}
              className={`flex items-center px-3 py-1.5 text-xs rounded-md transition-colors duration-200 ${
                isSyncing 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              title="Synchroniser les clients depuis l'application de gestion"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sync clients...' : 'Sync Clients'}
            </button>
            
            {/* Indicateur de sync automatique */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                isAutoSyncRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-600">
                Auto-sync {isAutoSyncRunning ? 'ON' : 'OFF'}
              </span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Connecté en tant que</span>
                <span className="font-medium text-gray-900">Admin User</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                      Admin User
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
              
              {/* Overlay pour fermer le menu */}
              {userMenuOpen && (
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}