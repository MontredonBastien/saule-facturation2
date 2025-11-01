interface SyncResponse {
  success: boolean;
  data: {
    clients: any[];
    quotes: any[];
    invoices: any[];
    payments: any[];
    articles: any[];
    companies: any[];
  };
  message?: string;
  lastModified?: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  stats: {
    clients: number;
    quotes: number;
    invoices: number;
    payments: number;
    articles: number;
    companies: number;
  };
  data?: any;
  lastModified?: string;
}

export class SyncService {
  private baseUrl: string;
  private sourceUrl: string;
  private tables: string;
  private syncInterval: number | null = null;
  private isAutoSyncActive = false;
  private enabled: boolean;

  constructor() {
    // Configuration depuis les variables d'environnement
    this.enabled = import.meta.env.VITE_SYNC_ENABLED === 'true';
    this.baseUrl = import.meta.env.VITE_SYNC_BASE_URL || '';
    this.sourceUrl = import.meta.env.VITE_SYNC_SOURCE_URL || '';
    this.tables = import.meta.env.VITE_SYNC_TABLES || 'clients,quotes,invoices,payments,articles,companies';
  }

  async syncData(token: string, since?: string): Promise<SyncResult> {
    // Vérifier si la synchronisation est activée
    if (!this.enabled) {
      return {
        success: false,
        message: 'Synchronisation désactivée - Configurer VITE_SYNC_ENABLED=true dans .env',
        stats: {
          clients: 0,
          quotes: 0,
          invoices: 0,
          payments: 0,
          articles: 0,
          companies: 0,
        }
      };
    }

    if (!this.baseUrl || !this.sourceUrl) {
      return {
        success: false,
        message: 'Configuration de synchronisation manquante - Vérifier VITE_SYNC_BASE_URL et VITE_SYNC_SOURCE_URL',
        stats: {
          clients: 0,
          quotes: 0,
          invoices: 0,
          payments: 0,
          articles: 0,
          companies: 0,
        }
      };
    }

    try {
      let url = `${this.baseUrl}/sync-data?token=${encodeURIComponent(token)}&source=${encodeURIComponent(this.sourceUrl)}&tables=${this.tables}`;
      if (since) {
        url += `&since=${encodeURIComponent(since)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Réponse vide');
        const statusText = response.statusText || 'Erreur inconnue';
        throw new Error(`Erreur HTTP: ${response.status} - ${statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      let syncData: SyncResponse;
      try {
        syncData = await response.json();
      } catch (parseError) {
        throw new Error('Réponse invalide du serveur - Format JSON incorrect');
      }
      
      if (!syncData.success) {
        throw new Error(syncData.message || 'Échec de la synchronisation - Aucun détail fourni');
      }

      const stats = {
        clients: syncData.data.clients?.length || 0,
        quotes: syncData.data.quotes?.length || 0,
        invoices: syncData.data.invoices?.length || 0,
        payments: syncData.data.payments?.length || 0,
        articles: syncData.data.articles?.length || 0,
        companies: syncData.data.companies?.length || 0,
      };

      return {
        success: true,
        message: 'Synchronisation réussie',
        stats,
        data: syncData.data,
        lastModified: syncData.lastModified
      } as SyncResult & { data: any };

    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      
      let errorMessage = 'Erreur inconnue lors de la synchronisation';
      
      // Gestion spécifique pour les erreurs undefined/null
      if (error === undefined || error === null) {
        errorMessage = 'Erreur de la fonction Edge Supabase - Vérifiez le déploiement de la fonction sync-data';
      } else
      if (error instanceof Error) {
        const message = error.message || '';
        errorMessage = (message && message !== 'undefined') ? message : 'Erreur sans message détaillé';
      } else if (typeof error === 'string') {
        errorMessage = (error && error !== 'undefined') ? error : 'Erreur de type chaîne sans contenu';
      } else if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message) || '';
        errorMessage = (message && message !== 'undefined') ? message : 'Erreur avec message vide';
      }
      
      return {
        success: false,
        message: errorMessage,
        stats: {
          clients: 0,
          quotes: 0,
          invoices: 0,
          payments: 0,
          articles: 0,
          companies: 0,
        }
      };
    }
  }

  // Démarrer la synchronisation automatique périodique
  startAutoSync(token: string, callback: (data: any) => void, intervalMinutes = 2) {
    if (!this.enabled) {
      console.warn('Synchronisation automatique désactivée');
      return;
    }

    if (this.isAutoSyncActive) {
      this.stopAutoSync();
    }

    this.isAutoSyncActive = true;

    const performSync = async () => {
      if (!this.isAutoSyncActive) return;

      try {
        const lastSync = localStorage.getItem('lastSyncTimestamp');
        const result = await this.syncData(token, lastSync || undefined);
        
        if (result.success && result.data) {
          const hasNewData = Object.values(result.stats).some(count => count > 0);
          
          if (hasNewData) {
            const transformedData = {
              clients: this.transformClients(result.data.clients || []),
              articles: this.transformArticles(result.data.articles || []),
              quotes: this.transformQuotes(result.data.quotes || []),
              invoices: this.transformInvoices(result.data.invoices || []),
              credits: this.transformCredits(result.data.credits || [])
            };
            
            callback(transformedData);
            
            // Sauvegarder le timestamp de la dernière sync
            if (result.lastModified) {
              localStorage.setItem('lastSyncTimestamp', result.lastModified);
            } else {
              localStorage.setItem('lastSyncTimestamp', new Date().toISOString());
            }
          }
        }
      } catch (error) {
      }
    };

    // Première synchronisation immédiate
    performSync();

    // Programmer les synchronisations périodiques
    this.syncInterval = window.setInterval(performSync, intervalMinutes * 60 * 1000);
  }

  // Arrêter la synchronisation automatique
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isAutoSyncActive = false;
  }

  // Vérifier si la sync automatique est active
  isAutoSyncRunning() {
    return this.isAutoSyncActive;
  }

  // Vérifier si la synchronisation est activée
  isEnabled() {
    return this.enabled;
  }

  // Transformer les données reçues vers le format de l'application
  transformClients(rawClients: any[]) {
    return rawClients.map(client => ({
      id: client.id,
      type: 'pro' as const,
      companyName: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.billing_address || '',
      city: '',
      clientCode: client.code_client,
      paymentDelay: 30,
      paymentMethod: 'virement',
      status: 'active' as const,
      createdAt: new Date(client.created_at)
    }));
  }

  transformArticles(rawArticles: any[]) {
    return rawArticles.map(article => ({
      id: article.id,
      name: article.name,
      description: article.description || '',
      category: article.category || '',
      unit: article.unit || 'unité',
      priceHT: Number(article.price_ht || 0),
      vatRate: Number(article.vat_rate || 20),
      active: article.active !== false,
      createdAt: new Date(article.created_at)
    }));
  }

  transformQuotes(rawQuotes: any[]) {
    return rawQuotes.map(quote => ({
      id: quote.id,
      number: quote.number,
      clientId: quote.client_id,
      status: quote.status || 'draft',
      createdAt: new Date(quote.created_at),
      validUntil: quote.valid_until ? new Date(quote.valid_until) : undefined,
      reference: quote.reference,
      lines: quote.quote_lines || [],
      totalHT: Number(quote.total_ht || 0),
      totalVAT: Number(quote.total_vat || 0),
      totalTTC: Number(quote.total_ttc || 0),
      comments: quote.comments || '',
      showComments: quote.show_comments !== false
    }));
  }

  transformInvoices(rawInvoices: any[]) {
    return rawInvoices.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      clientId: invoice.client_id,
      status: invoice.status || 'draft',
      issuedAt: new Date(invoice.issued_at || invoice.created_at),
      dueDate: new Date(invoice.due_date || invoice.created_at),
      reference: invoice.reference,
      paymentMethod: invoice.payment_method || 'virement',
      lines: invoice.invoice_lines || [],
      totalHT: Number(invoice.total_ht || 0),
      totalVAT: Number(invoice.total_vat || 0),
      totalTTC: Number(invoice.total_ttc || 0),
      paidAmount: Number(invoice.paid_amount || 0),
      remainingAmount: Number(invoice.remaining_amount || 0),
      comments: invoice.comments || '',
      payments: invoice.payments || []
    }));
  }

  transformCredits(rawCredits: any[]) {
    return rawCredits.map(credit => ({
      id: credit.id,
      number: credit.number,
      clientId: credit.client_id,
      status: credit.status || 'draft',
      createdAt: new Date(credit.created_at),
      reason: credit.reason || '',
      lines: credit.credit_lines || [],
      totalHT: Number(credit.total_ht || 0),
      totalVAT: Number(credit.total_vat || 0),
      totalTTC: Number(credit.total_ttc || 0)
    }));
  }

  // Valider le token
  validateToken(token: string): boolean {
    if (!token || token.trim().length === 0) {
      return false;
    }
    
    try {
      // Vérifier si c'est du Base64 valide
      atob(token);
      return token.length >= 10; // Minimum de sécurité
    } catch {
      // Si ce n'est pas du Base64, vérifier la longueur minimale
      return token.length >= 10;
    }
  }
}

export const syncService = new SyncService();