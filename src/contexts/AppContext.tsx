import React, { createContext, useContext } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useAutoSync } from '../hooks/useAutoSync';
import { Quote, Invoice, Client, Article, Settings, Credit, User, AuditLog } from '../types';
import { syncService } from '../services/syncService';

interface AppContextType {
  // Data
  quotes: Quote[];
  invoices: Invoice[];
  clients: Client[];
  articles: Article[];
  credits: Credit[];
  users: User[];
  auditLogs: AuditLog[];
  settings: Settings;
  loading: boolean;
  error: string | null;
  isAutoSyncRunning: boolean;

  // Core actions
  loadData: () => Promise<void>;
  logAction: (action: Omit<AuditLog, 'id' | 'timestamp'>) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
  
  // Document actions
  addQuote: (quote: Omit<Quote, 'id'>) => Promise<void>;
  updateQuote: (id: string, data: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  validateQuote: (id: string) => Promise<void>;
  
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  validateInvoice: (id: string) => Promise<void>;
  
  addCredit: (credit: Omit<Credit, 'id'>) => Promise<Credit>;
  updateCredit: (id: string, data: Partial<Credit>) => Promise<void>;
  deleteCredit: (id: string) => Promise<void>;
  validateCredit: (id: string) => Promise<void>;
  
  addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => Promise<Article>;
  updateArticle: (id: string, data: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;

  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Sync actions
  importSyncedData: (data: any) => void;
  performAutoSync: () => Promise<void>;
  startAutoSync: () => void;
  stopAutoSync: () => void;
  performManualSync: (token: string) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const appData = useAppData();
  const autoSync = useAutoSync();
  
  const importSyncedData = (data: any) => {
    if (data.clients?.length > 0) {
      // Merge with existing clients
      const existingClients = appData.clients || [];
      const newClients = data.clients.filter((newClient: any) => 
        !existingClients.some(existing => existing.id === newClient.id)
      );
      // Update would happen in loadData refresh
    }
    appData.loadData();
  };

  const mockUsers: User[] = [{
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Admin User',
    email: 'admin@test.fr',
    role: 'admin',
    status: 'active',
    permissions: ['all'],
    createdAt: new Date()
  }];

  const value: AppContextType = {
    // Data
    quotes: appData.quotes,
    invoices: appData.invoices,
    clients: appData.clients,
    articles: appData.articles,
    credits: appData.credits,
    users: mockUsers,
    auditLogs: appData.auditLogs,
    settings: appData.settings,
    loading: appData.loading,
    error: appData.error,
    isAutoSyncRunning: autoSync.isRunning,

    // Core actions
    loadData: appData.loadData,
    logAction: appData.logAction,
    updateSettings: appData.saveSettings,

    // Document actions - simplified
    addQuote: appData.saveQuote,
    updateQuote: (id: string, data: Partial<Quote>) => {
      const quote = appData.quotes.find(q => q.id === id);
      return appData.saveQuote(quote ? { ...quote, ...data } : { id, ...data });
    },
    deleteQuote: appData.deleteQuote,
    validateQuote: appData.validateQuote,
    
    addInvoice: appData.saveInvoice,
    updateInvoice: (id: string, data: Partial<Invoice>) => {
      const invoice = appData.invoices.find(i => i.id === id);
      return appData.saveInvoice(invoice ? { ...invoice, ...data } : { id, ...data });
    },
    deleteInvoice: appData.deleteInvoice,
    validateInvoice: appData.validateInvoice,
    
    addCredit: appData.saveCredit,
    updateCredit: (id: string, data: Partial<Credit>) => {
      const credit = appData.credits.find(c => c.id === id);
      return appData.saveCredit(credit ? { ...credit, ...data } : { id, ...data });
    },
    deleteCredit: appData.deleteCredit,
    validateCredit: appData.validateCredit,
    
    addArticle: appData.saveArticle,
    updateArticle: appData.saveArticle,
    deleteArticle: appData.deleteArticle,

    addClient: appData.saveClient,
    updateClient: (id: string, data: Partial<Client>) => {
      const client = appData.clients.find(c => c.id === id);
      return appData.saveClient(client ? { ...client, ...data } : { id, ...data });
    },
    deleteClient: appData.deleteClient,

    // Sync actions
    importSyncedData,
    performAutoSync: () => autoSync.performOnce(),
    startAutoSync: () => {
      const token = localStorage.getItem('syncToken');
      if (token) autoSync.start(token, importSyncedData);
    },
    stopAutoSync: autoSync.stop,
    performManualSync: (token: string) => syncService.syncData(token)
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}