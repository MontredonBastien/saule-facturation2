import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Quote, Invoice, Credit, Client, Article, Settings, User, AuditLog } from '../types';

const defaultSettings: Settings = {
  company: { 
    id: '1', 
    name: 'Mon Entreprise SARL', 
    address: '123 Rue Test\n69000 Lyon', 
    phone: '04 78 12 34 56', 
    email: 'contact@test.fr', 
    siret: '12345678901234', 
    iban: 'FR76 1009 6181 7100 0243 8360 267',
    bic: 'CMCIFRPP',
    logoSize: 24
  },
  defaults: { 
    vatRate: 20, 
    paymentDelay: 30, 
    quoteValidity: 30, 
    currency: '€', 
    legalMentions: 'Conditions générales de vente.', 
    quoteComment: 'Devis valable 30 jours.', 
    invoiceComment: 'Merci de votre confiance.', 
    creditComment: 'Avoir émis suite à votre demande.',
    recouvrementIndemnity: 40
  },
  numbering: { 
    quotePrefix: 'DEV', 
    invoicePrefix: 'FAC', 
    creditPrefix: 'AV', 
    quoteCounter: 1, 
    invoiceCounter: 1, 
    creditCounter: 1, 
    yearInNumber: true, 
    monthInNumber: false,
    resetYearly: true 
  },
  documentTemplate: { 
    colors: { primary: '#8bc34a' }, 
    textSizes: {
      title: 18,
      subtitle: 12,
      normal: 10,
      small: 8
    },
    textColors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#8bc34a'
    },
    blockStyles: {
      sectionHeaders: {
        fontSize: 10,
        color: '#000000',
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none'
      },
      companyInfo: {
        fontSize: 9,
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none'
      },
      clientInfo: {
        fontSize: 9,
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none'
      },
      tableHeader: {
        fontSize: 9,
        color: '#ffffff',
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none'
      },
      tableContent: {
        fontSize: 9,
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none'
      },
      totalsLabels: {
        fontSize: 10,
        color: '#000000',
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none'
      },
      totalsValues: {
        fontSize: 10,
        color: '#000000',
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none'
      }
    },
    showLogo: true, 
    footerTexts: { 
      quote: 'Conditions de vente.', 
      invoice: 'Paiement net 30 jours.', 
      credit: 'Avoir valable 6 mois.' 
    },
    primaryColor: '#8bc34a',
    secondaryColor: '#6B7280',
    fontFamily: 'helvetica',
    conditions: {
      cgv: '',
      cgl: '',
      legalConditions: '',
      showCgvOnQuotes: false,
      showCgvOnInvoices: false,
      showCglOnQuotes: false,
      showCglOnInvoices: false,
      showLegalConditionsOnInvoices: false
    },
    defaults: {
      showCgvOnNewQuotes: false,
      showCglOnNewQuotes: false,
      showCgvOnNewInvoices: false,
      showCglOnNewInvoices: false,
      showLegalConditionsOnNewInvoices: true,
      showCommentsOnNewQuotes: true,
      showCommentsOnNewInvoices: true,
      showCommentsOnNewCredits: true
    }
  },
  lists: {
    units: ['unité', 'heure', 'jour'],
    paymentMethods: ['virement', 'cheque'],
    categories: ['Services'],
    civilities: ['M.', 'Mme'],
    legalForms: ['SARL', 'SAS'],
    paymentConditions: [
      'Règlement comptant',
      'Règlement fin de travaux',
      '30% à la commande - 70% à livraison',
      '50% à la commande - 50% fin de travaux',
      'Règlement en 3 fois sans frais',
      'Règlement sous 30 jours net',
      'Règlement sous 15 jours net'
    ],
    emailCategories: ['Principal', 'Comptabilité', 'Direction', 'Commercial', 'Technique', 'Support'],
    phoneCategories: ['Bureau', 'Mobile', 'Fax', 'Standard', 'Direct']
  }
};

const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

// Transformations simplifiées
const transforms = {
  client: (data: any): Client => ({
    id: data.id,
    clientCode: data.code_client || (typeof data.id === 'string' ? data.id.substring(0, 8) : String(data.id).substring(0, 8)),
    type: data.type || 'pro',
    civility: data.civility || '',
    companyName: data.company_name || '',
    legalForm: data.legal_form || '',
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    siret: data.siret || '',
    vatNumber: data.tva_intracommunautaire || '',
    tvaIntracommunautaire: data.tva_intracommunautaire || '',
    contactName: '',
    email: data.email || '',
    phone: data.phone || '',
    emails: (data.client_emails || []).map((e: any) => ({
      id: e.id,
      clientId: e.client_id,
      email: e.email,
      category: e.category,
      isPrimary: e.is_primary || false,
      createdAt: e.created_at ? new Date(e.created_at) : new Date()
    })),
    phones: (data.client_phones || []).map((p: any) => ({
      id: p.id,
      clientId: p.client_id,
      phone: p.phone,
      category: p.category,
      isPrimary: p.is_primary || false,
      createdAt: p.created_at ? new Date(p.created_at) : new Date()
    })),
    address: data.address || '',
    city: data.city || '',
    postalCode: data.postal_code || '',
    country: data.country || 'France',
    paymentDelay: data.payment_delay || 30,
    paymentMethod: data.payment_method || 'virement',
    status: data.status || 'active',
    notes: data.notes || '',
    createdAt: data.created_at ? new Date(data.created_at) : new Date()
  }),
  article: (data: any): Article => ({
    id: data.id,
    name: data.name,
    description: data.description,
    category: data.category,
    unit: data.unit,
    priceHT: Number(data.price_ht || 0),
    vatRate: Number(data.vat_rate || 20),
    active: data.active !== false,
    createdAt: data.created_at ? new Date(data.created_at) : new Date()
  }),
  quote: (data: any): Quote => ({
    id: data.id,
    companyId: data.company_id,
    clientId: data.client_id,
    number: data.number,
    status: data.status,
    reference: data.reference,
    validUntil: data.valid_until ? new Date(data.valid_until) : undefined,
    totalHT: Number(data.total_ht || 0),
    totalVAT: Number(data.total_vat || 0),
    totalTTC: Number(data.total_ttc || 0),
    depositPercentage: Number(data.deposit_percentage || 0),
    depositAmount: Number(data.deposit_amount || 0),
    comments: data.comments,
    showComments: data.show_comments !== false,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    transformedToInvoiceId: data.transformed_to_invoice_id,
    attachments: data.attachments || [],
    lines: (data.quote_lines || []).map(line => ({
      id: line.id,
      designation: line.designation,
      description: line.description,
      quantity: Number(line.quantity || 0),
      unit: line.unit,
      priceHT: Number(line.price_ht || 0),
      vatRate: Number(line.vat_rate || 0),
      totalHT: Number(line.total_ht || 0)
    }))
  }),
  invoice: (data: any): Invoice => ({
    id: data.id,
    companyId: data.company_id,
    clientId: data.client_id,
    number: data.number,
    status: data.status,
    reference: data.reference,
    issuedAt: data.issued_at ? new Date(data.issued_at) : new Date(),
    dueDate: data.due_date ? new Date(data.due_date) : new Date(),
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    paymentMethod: data.payment_method,
    paymentDate: data.payment_date ? new Date(data.payment_date) : undefined,
    actualPaymentMethod: data.actual_payment_method,
    totalHT: Number(data.total_ht || 0),
    totalVAT: Number(data.total_vat || 0),
    totalTTC: Number(data.total_ttc || 0),
    paidAmount: Number(data.paid_amount || 0),
    remainingAmount: Number(data.remaining_amount || 0),
    comments: data.comments,
    quoteId: data.quote_id,
    transformedToCreditId: data.transformed_to_credit_id,
    attachments: data.attachments || [],
    payments: [],
    lines: (data.invoice_lines || []).map(line => ({
      id: line.id,
      designation: line.designation,
      description: line.description,
      quantity: Number(line.quantity || 0),
      unit: line.unit,
      priceHT: Number(line.price_ht || 0),
      vatRate: Number(line.vat_rate || 0),
      totalHT: Number(line.total_ht || 0)
    }))
  }),
  credit: (data: any): Credit => ({
    id: data.id,
    companyId: data.company_id,
    clientId: data.client_id,
    invoiceId: data.invoice_id,
    number: data.number,
    status: data.status,
    reason: data.reason,
    totalHT: Number(data.total_ht || 0),
    totalVAT: Number(data.total_vat || 0),
    totalTTC: Number(data.total_ttc || 0),
    comments: data.comments,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    attachments: data.attachments || [],
    lines: (data.credit_lines || []).map(line => ({
      id: line.id,
      designation: line.designation,
      description: line.description,
      quantity: Number(line.quantity || 0),
      unit: line.unit,
      priceHT: Number(line.price_ht || 0),
      vatRate: Number(line.vat_rate || 0),
      totalHT: Number(line.total_ht || 0)
    }))
  })
};

export function useAppData() {
  const [data, setData] = useState({
    quotes: [] as Quote[],
    invoices: [] as Invoice[],
    credits: [] as Credit[],
    clients: [] as Client[],
    articles: [] as Article[],
    users: [] as User[],
    auditLogs: [] as AuditLog[],
    settings: defaultSettings,
    userCompanyId: null as string | null,
    loading: true,
    error: null as string | null
  });

  // Clients de démonstration
  const demoClients: Client[] = [
    {
      id: 'demo-client-1',
      clientCode: 'CLI001',
      type: 'pro',
      companyName: 'TechCorp Solutions SAS',
      email: 'j.dupont@techcorp.fr',
      phone: '01 98 76 54 32',
      address: '456 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'FR',
      siret: '98765432109876',
      tvaIntracommunautaire: 'FR98765432109',
      paymentDelay: 30,
      paymentMethod: 'Virement',
      status: 'active',
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'demo-client-2',
      clientCode: 'CLI002',
      type: 'individual',
      civility: 'Mme',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@email.fr',
      phone: '06 12 34 56 78',
      address: '789 Boulevard Saint-Germain',
      city: 'Paris',
      postalCode: '75006',
      country: 'FR',
      paymentDelay: 30,
      paymentMethod: 'Virement',
      status: 'active',
      createdAt: new Date('2024-01-12')
    },
    {
      id: 'demo-client-3',
      clientCode: 'CLI003',
      type: 'pro',
      companyName: 'Jardins & Paysages SARL',
      email: 'contact@jardins-paysages.fr',
      phone: '04 78 90 12 34',
      address: '45 Rue de la République',
      city: 'Lyon',
      postalCode: '69001',
      country: 'FR',
      siret: '12345678901234',
      tvaIntracommunautaire: 'FR12345678901',
      paymentDelay: 45,
      paymentMethod: 'Chèque',
      status: 'active',
      createdAt: new Date('2024-02-05')
    },
    {
      id: 'demo-client-4',
      clientCode: 'CLI004',
      type: 'individual',
      civility: 'Mme',
      firstName: 'Sophie',
      lastName: 'Bernard',
      email: 'sophie.b@email.fr',
      phone: '06 98 76 54 32',
      address: '12 Place de la Mairie',
      city: 'Lyon',
      postalCode: '69002',
      country: 'FR',
      paymentDelay: 30,
      paymentMethod: 'Virement',
      status: 'active',
      createdAt: new Date('2024-02-20')
    }
  ];

  // Articles de démonstration
  const demoArticles: Article[] = [
    {
      id: 'demo-article-1',
      name: 'Abattage d\'arbre - Chêne centenaire',
      description: 'Abattage sécurisé d\'un chêne centenaire\nDémontage par sections successives\nÉvacuation complète des débris\nNettoyage du site',
      category: 'Services',
      unit: 'unité',
      priceHT: 850.00,
      vatRate: 20,
      active: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'demo-article-2',
      name: 'Élagage d\'ornement - Arbre fruitier',
      description: 'Taille de formation pour arbres fruitiers\nÉclaircissage des branches mortes\nFormation de la charpente\nRamassage et évacuation des déchets verts',
      category: 'Services',
      unit: 'heure',
      priceHT: 45.00,
      vatRate: 20,
      active: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'demo-article-3',
      name: 'Plantation d\'arbres d\'alignement',
      description: 'Préparation du terrain et des fosses\nPlantation d\'arbres avec tuteurage\nPaillage et protection hivernale\nGarantie reprise 2 ans',
      category: 'Services',
      unit: 'unité',
      priceHT: 125.00,
      vatRate: 10,
      active: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'demo-article-4',
      name: 'Dessouchage mécanique',
      description: 'Dessouchage par rognage mécanique\nÉvacuation de la souche et des copeaux\nNivellement du terrain\nApport de terre végétale si nécessaire',
      category: 'Services',
      unit: 'unité',
      priceHT: 180.00,
      vatRate: 20,
      active: true,
      createdAt: new Date('2024-01-15')
    }
  ];
  const loadData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Load settings
      let loadedSettings = defaultSettings;
      try {
        const savedSettings = localStorage.getItem('factApp_settings');
        if (savedSettings) {
          loadedSettings = deepMerge(defaultSettings, JSON.parse(savedSettings));
        }
      } catch (e) {
        console.warn('Settings parse error:', e);
      }

      // Load audit logs
      const localLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');

      // Try Supabase, fallback to localStorage
      try {
        // Check if Supabase is properly configured before making requests
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
          throw new Error('Supabase not configured');
        }

        // Test basic connectivity before attempting full data load
        try {
          const { data: { user } } = await supabase.auth.getUser();
        } catch (authError) {
          console.warn('Supabase auth check failed:', authError);
          throw new Error('Supabase connectivity issue');
        }

        let companyId = null;
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();
          companyId = profile?.company_id || null;
        }

        // Load all data in parallel
        const [clientsRes, articlesRes, quotesRes, invoicesRes, creditsRes] = await Promise.all([
          supabase.from('clients').select('*, client_emails (*), client_phones (*)').order('created_at', { ascending: false }),
          supabase.from('articles').select('*').order('name'),
          supabase.from('quotes').select('*, quote_lines (*)').order('created_at', { ascending: false }),
          supabase.from('invoices').select('*, invoice_lines (*)').order('created_at', { ascending: false }),
          supabase.from('credits').select('*, credit_lines (*)').order('created_at', { ascending: false })
        ]);

        console.log('📊 Clients loaded from Supabase:', clientsRes.data?.length || 0, 'clients');
        console.log('📊 Raw clients data:', clientsRes.data);
        if (clientsRes.error) console.error('❌ Clients error:', clientsRes.error);

        const hasErrors = [clientsRes, articlesRes, quotesRes, invoicesRes, creditsRes].some(res => res.error);
        if (hasErrors) throw new Error('Supabase load failed');

        // Fusionner articles Supabase + articles de démo
        const supabaseArticles = articlesRes.data?.map(transforms.article) || [];
        const allArticles = [...demoArticles, ...supabaseArticles];

        const transformedClients = clientsRes.data?.map(transforms.client) || [];
        console.log('✅ Clients après transformation:', transformedClients.length, 'clients');
        console.log('✅ Transformed clients:', transformedClients);

        // Fusionner clients Supabase + clients de démo
        const allClients = [...demoClients, ...transformedClients];

        setData(prev => ({
          ...prev,
          clients: allClients,
          articles: allArticles,
          quotes: quotesRes.data?.map(transforms.quote) || [],
          invoices: invoicesRes.data?.map(transforms.invoice) || [],
          credits: creditsRes.data?.map(transforms.credit) || [],
          settings: loadedSettings,
          auditLogs: localLogs.slice(0, 100),
          userCompanyId: companyId
        }));

      } catch (supabaseError) {
        console.warn('Supabase unavailable, using localStorage fallback. This is normal in demo mode:', supabaseError);
        
        // Fallback to localStorage with date parsing
        const loadFromStorage = (key: string, transform: (item: any) => any) => {
          try {
            const items = JSON.parse(localStorage.getItem(key) || '[]');
            return items.map(transform);
          } catch {
            return [];
          }
        };

        // Articles localStorage + articles de démo
        const localArticles = loadFromStorage('factApp_articles', (a) => ({
          ...a,
          createdAt: new Date(a.createdAt)
        }));
        const allArticles = [...demoArticles, ...localArticles];

        // Clients localStorage + clients de démo
        const localClients = loadFromStorage('factApp_clients', (c) => ({
          ...c,
          createdAt: new Date(c.createdAt)
        }));
        const allClients = [...demoClients, ...localClients];

        setData(prev => ({
          ...prev,
          quotes: loadFromStorage('factApp_quotes', (q) => ({
            ...q,
            createdAt: new Date(q.createdAt),
            validUntil: q.validUntil ? new Date(q.validUntil) : undefined
          })),
          invoices: loadFromStorage('factApp_invoices', (i) => ({
            ...i,
            createdAt: new Date(i.createdAt),
            issuedAt: new Date(i.issuedAt),
            dueDate: i.dueDate ? new Date(i.dueDate) : undefined,
            paymentDate: i.paymentDate ? new Date(i.paymentDate) : undefined,
            payments: i.payments || []
          })),
          credits: loadFromStorage('factApp_credits', (c) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })),
          articles: allArticles,
          clients: allClients,
          settings: loadedSettings,
          auditLogs: localLogs.slice(0, 100)
        }));
      }

    } catch (error) {
      console.error('Load error:', error);
      setData(prev => ({ ...prev, error: 'Erreur de chargement' }));
    } finally {
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const logAction = async (action: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const log: AuditLog = {
      id: uuidv4(),
      companyId: data.userCompanyId || undefined,
      ...action,
      timestamp: new Date()
    };
    
    try {
      const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      const updatedLogs = [log, ...existingLogs.slice(0, 99)];
      localStorage.setItem('audit_logs', JSON.stringify(updatedLogs));
      setData(prev => ({ ...prev, auditLogs: [log, ...prev.auditLogs.slice(0, 99)] }));
    } catch (error) {
      console.error('Log error:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    const mergedSettings = deepMerge(data.settings, newSettings);
    setData(prev => ({ ...prev, settings: mergedSettings }));
    localStorage.setItem('factApp_settings', JSON.stringify(mergedSettings));
    return mergedSettings;
  };

  // Generic save function for all document types
  const saveDocument = async (docType: 'quotes' | 'invoices' | 'credits', doc: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let companyId = data.userCompanyId;

      if (user && !companyId) {
        const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
        companyId = profile?.company_id;
      }

      // Ensure doc has required fields
      const docToSave = {
        ...doc,
        id: doc.id || uuidv4(),
        createdAt: doc.createdAt || new Date()
      };

      // Update local state first
      const isUpdate = docToSave.id && data[docType].find((d: any) => d.id === docToSave.id);
      if (isUpdate) {
        setData(prev => ({
          ...prev,
          [docType]: prev[docType].map((d: any) => d.id === docToSave.id ? { ...d, ...docToSave } : d)
        }));
      } else {
        setData(prev => ({ ...prev, [docType]: [...prev[docType], docToSave] }));
      }

      // Try Supabase save (optional)
      if (companyId) {
        try {
          const tableMap = { quotes: 'quotes', invoices: 'invoices', credits: 'credits' };
          const table = tableMap[docType];
          
          // Pour les factures, calculer automatiquement le statut basé sur les paiements
          if (docType === 'invoices' && docToSave.payments) {
            const totalPaid = docToSave.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
            const remainingAmount = (docToSave.totalTTC || 0) - totalPaid;
            
            if (totalPaid <= 0.01) {
              // Pas de paiement
              if (docToSave.status === 'partially_paid' || docToSave.status === 'paid') {
                docToSave.status = 'issued';
              }
            } else if (remainingAmount <= 0.01) {
              // Entièrement payé
              docToSave.status = 'paid';
            } else {
              // Partiellement payé
              docToSave.status = 'partially_paid';
            }
            
            docToSave.paidAmount = totalPaid;
            docToSave.remainingAmount = Math.max(0, remainingAmount);
          }
          
          if (isUpdate) {
            await supabase.from(table).update(docToSave).eq('id', docToSave.id);
          } else {
            await supabase.from(table).insert({ ...docToSave, company_id: companyId });
          }
        } catch (supabaseError) {
          console.warn('Supabase save failed:', supabaseError);
        }
      }

      // Save to localStorage
      const currentDocs = data[docType].map((d: any) => d.id === docToSave.id ? { ...d, ...docToSave } : d);
      if (!isUpdate) currentDocs.push(docToSave);
      localStorage.setItem(`factApp_${docType}`, JSON.stringify(currentDocs));
      
      return docToSave;
    } catch (error) {
      console.error(`Save ${docType} error:`, error);
      throw error;
    }
  };

  // Simplified validation with auto-numbering
  const validateDocument = async (docType: 'quotes' | 'invoices' | 'credits', id: string) => {
    const doc = data[docType].find((d: any) => d.id === id);
    if (!doc) return;

    // Vérification spéciale pour les factures avec acompte
    if (docType === 'invoices' && doc.depositAmount && doc.depositAmount > 0 && doc.depositReceived === undefined) {
      throw new Error('Vous devez indiquer si l\'acompte a été reçu avant d\'émettre la facture');
    }
    const typeMap = { quotes: 'quote', invoices: 'invoice', credits: 'credit' };
    const prefixMap = { quotes: 'quotePrefix', invoices: 'invoicePrefix', credits: 'creditPrefix' };
    const counterMap = { quotes: 'quoteCounter', invoices: 'invoiceCounter', credits: 'creditCounter' };
    
    const prefix = data.settings.numbering[prefixMap[docType]];
    const now = new Date();
    const year = data.settings.numbering.yearInNumber ? `${now.getFullYear()}-` : '';
    const month = data.settings.numbering.monthInNumber ? `${String(now.getMonth() + 1).padStart(2, '0')}-` : '';
    const counter = String(data.settings.numbering[counterMap[docType]]).padStart(5, '0');
    const number = `${prefix}-${year}${month}${counter}`;

    // Gérer la remise à zéro si resetYearly est activé
    let newCounter = data.settings.numbering[counterMap[docType]] + 1;
    
    if (data.settings.numbering.resetYearly) {
      // Vérifier si on est dans une nouvelle année
      const lastResetYear = localStorage.getItem(`lastResetYear_${docType}`);
      const currentYear = now.getFullYear().toString();
      
      if (lastResetYear !== currentYear) {
        newCounter = 1;
        localStorage.setItem(`lastResetYear_${docType}`, currentYear);
      }
    }
    // Update settings counter
    const newSettings = {
      ...data.settings,
      numbering: {
        ...data.settings.numbering,
        [counterMap[docType]]: newCounter
      }
    };

    await saveSettings(newSettings);
    const status = docType === 'invoices' ? 'issued' : 'validated';
    await saveDocument(docType, { ...doc, status, number });
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    ...data,
    loadData,
    logAction,
    saveSettings,
    saveDocument,
    validateDocument,
    // Convenience methods
    saveQuote: (quote: any) => saveDocument('quotes', quote),
    saveInvoice: (invoice: any) => saveDocument('invoices', invoice),
    saveCredit: (credit: any) => saveDocument('credits', credit),
    validateQuote: (id: string) => validateDocument('quotes', id),
    validateInvoice: (id: string) => validateDocument('invoices', id),
    validateCredit: (id: string) => validateDocument('credits', id),
    deleteQuote: (id: string) => setData(prev => ({ ...prev, quotes: prev.quotes.filter(q => q.id !== id) })),
    deleteInvoice: (id: string) => setData(prev => ({ ...prev, invoices: prev.invoices.filter(i => i.id !== id) })),
    deleteCredit: (id: string) => setData(prev => ({ ...prev, credits: prev.credits.filter(c => c.id !== id) })),
    saveArticle: async (article: any) => {
      if (article.id) {
        setData(prev => ({ ...prev, articles: prev.articles.map(a => a.id === article.id ? article : a) }));
      } else {
        const newArticle = { ...article, id: uuidv4(), createdAt: new Date() };
        setData(prev => ({ ...prev, articles: [...prev.articles, newArticle] }));
        return newArticle;
      }
    },
    deleteArticle: (id: string) => setData(prev => ({ ...prev, articles: prev.articles.filter(a => a.id !== id) })),
    saveClient: async (client: any) => {
      const clientToSave = {
        ...client,
        id: client.id || uuidv4(),
        createdAt: client.createdAt || new Date(),
        clientCode: client.clientCode || `CLI${String(data.clients.length + 1).padStart(3, '0')}`
      };

      // Update local state first
      const isUpdate = client.id && data.clients.find(c => c.id === client.id);
      if (isUpdate) {
        setData(prev => ({ ...prev, clients: prev.clients.map(c => c.id === clientToSave.id ? clientToSave : c) }));
      } else {
        setData(prev => ({ ...prev, clients: [...prev.clients, clientToSave] }));
      }

      // Try Supabase save
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).maybeSingle();
          const companyId = profile?.company_id || data.userCompanyId;

          if (companyId) {
            const dbClient = {
              id: clientToSave.id,
              company_id: companyId,
              code_client: clientToSave.clientCode,
              type: clientToSave.type,
              civility: clientToSave.civility || null,
              company_name: clientToSave.companyName || null,
              legal_form: clientToSave.legalForm || null,
              first_name: clientToSave.firstName || null,
              last_name: clientToSave.lastName || null,
              email: clientToSave.email,
              phone: clientToSave.phone,
              address: clientToSave.address,
              city: clientToSave.city,
              postal_code: clientToSave.postalCode || null,
              country: clientToSave.country || 'France',
              siret: clientToSave.siret || null,
              tva_intracommunautaire: clientToSave.tvaIntracommunautaire || null,
              payment_delay: clientToSave.paymentDelay || 30,
              payment_method: clientToSave.paymentMethod || 'virement',
              status: clientToSave.status || 'active',
              notes: clientToSave.notes || null,
              created_at: clientToSave.createdAt
            };

            await supabase.from('clients').upsert(dbClient);

            if (isUpdate) {
              await supabase.from('client_emails').delete().eq('client_id', clientToSave.id);
              await supabase.from('client_phones').delete().eq('client_id', clientToSave.id);
            }

            if (clientToSave.emails && clientToSave.emails.length > 0) {
              const dbEmails = clientToSave.emails.map((email: any) => ({
                id: email.id && !email.id.startsWith('temp-') ? email.id : undefined,
                client_id: clientToSave.id,
                email: email.email,
                category: email.category,
                is_primary: email.isPrimary || false
              }));
              await supabase.from('client_emails').insert(dbEmails);
            }

            if (clientToSave.phones && clientToSave.phones.length > 0) {
              const dbPhones = clientToSave.phones.map((phone: any) => ({
                id: phone.id && !phone.id.startsWith('temp-') ? phone.id : undefined,
                client_id: clientToSave.id,
                phone: phone.phone,
                category: phone.category,
                is_primary: phone.isPrimary || false
              }));
              await supabase.from('client_phones').insert(dbPhones);
            }
          }
        }
      } catch (error) {
        console.warn('Supabase save failed, using local state only:', error);
      }

      return clientToSave;
    },
    deleteClient: (id: string) => setData(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }))
  };
}