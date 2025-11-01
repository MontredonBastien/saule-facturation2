export interface Company {
  id: string;
  name: string;
  address: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone: string;
  email: string;
  siret?: string;
  siren?: string;
  rcs?: string;
  tvaIntracommunautaire?: string;
  formeJuridique?: string;
  capitalSocial?: string;
  capitalCurrency?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  logo?: string;
  logoSize?: number;
}

export interface ClientEmail {
  id: string;
  clientId: string;
  email: string;
  category: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface ClientPhone {
  id: string;
  clientId: string;
  phone: string;
  category: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface Client {
  id: string;
  type: 'pro' | 'individual';
  civility?: string;
  companyName?: string;
  legalForm?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  emails?: ClientEmail[];
  phones?: ClientPhone[];
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  siret?: string;
  tvaIntracommunautaire?: string;
  vatNumber?: string;
  contactName?: string;
  clientCode: string;
  paymentDelay: number;
  paymentMethod: string;
  status: 'active' | 'archived';
  notes?: string;
  createdAt: Date;
}

export interface Article {
  id: string;
  name: string;
  description?: string;
  unit: string;
  priceHT: number;
  vatRate: number;
  active: boolean;
  createdAt: Date;
}

export interface QuoteLine {
  id: string;
  type?: 'item' | 'subtotal' | 'comment';
  designation: string;
  description?: string;
  quantity: number;
  unit: string;
  priceHT: number;
  vatRate: number;
  totalHT: number;
  // Propriétés pour la remise
  discount?: number;
  discountType?: 'percentage' | 'amount';
  // Propriétés pour les commentaires formatés
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  fontFamily?: string;
  isMultiline?: boolean;
  // Propriété pour les sous-totaux
  subtotalAmount?: number;
}

export interface Quote {
  id: string;
  companyId?: string;
  number?: string;
  clientId: string;
  status: 'draft' | 'validated';
  createdAt: Date;
  validUntil?: Date;
  reference?: string;
  lines: QuoteLine[];
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  comments?: string;
  showComments?: boolean;
  paymentConditions?: string; // Conditions de règlement personnalisables
  transformedToInvoiceId?: string;
  attachments?: Attachment[];
  depositPercentage?: number;
  depositAmount?: number;
  globalDiscount?: number;
  globalDiscountType?: 'percentage' | 'amount';
  showCgv?: boolean;
  showCgl?: boolean;
  showLegalConditions?: boolean;
  hash?: string; // Hash SHA-256 du document pour garantir l'inaltérabilité
  previousHash?: string; // Hash du document précédent (chaînage)
}

export interface Invoice {
  id: string;
  companyId?: string;
  number?: string;
  clientId: string;
  status: 'draft' | 'issued' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  issuedAt: Date;
  dueDate: Date;
  createdAt?: Date;
  reference?: string;
  paymentMethod: string;
  type?: 'facture' | 'avoir';
  lines: QuoteLine[];
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  paidAmount: number;
  remainingAmount: number;
  comments?: string;
  showComments?: boolean;
  payments: Payment[];
  quoteId?: string;
  transformedToCreditId?: string;
  attachments?: Attachment[];
  paymentDate?: Date;
  actualPaymentMethod?: string;
  globalDiscount?: number;
  globalDiscountType?: 'percentage' | 'amount';
  showCgv?: boolean;
  showCgl?: boolean;
  showLegalConditions?: boolean;
  depositReceived?: boolean;
  depositAmount?: number;
  notes?: string;
  hash?: string; // Hash SHA-256 du document pour garantir l'inaltérabilité
  previousHash?: string; // Hash du document précédent (chaînage)
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: Date;
  method: string;
  reference?: string;
  attachments?: Attachment[];
}

export interface Credit {
  id: string;
  companyId?: string;
  number?: string;
  clientId: string;
  status: 'draft' | 'validated';
  createdAt: Date;
  lines: QuoteLine[];
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  reason: string;
  invoiceId?: string;
  comments?: string;
  showComments?: boolean;
  attachments?: Attachment[];
  globalDiscount?: number;
  globalDiscountType?: 'percentage' | 'amount';
  showCgv?: boolean;
  showCgl?: boolean;
  showLegalConditions?: boolean;
  hash?: string; // Hash SHA-256 du document pour garantir l'inaltérabilité
  previousHash?: string; // Hash du document précédent (chaînage)
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: Date;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  permissions: string[];
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  companyId?: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityId?: string;
  entityType?: string;
  details: string;
  timestamp: Date;
}

export interface Settings {
  company: Company;
  defaults: {
    vatRate: number;
    paymentDelay: number;
    quoteValidity: number;
    currency: string;
    legalMentions: string;
    quoteComment: string;
    invoiceComment: string;
    creditComment: string;
    recouvrementIndemnity: number; // Indemnité de recouvrement en euros (défaut 40€)
    penaltyRate: number; // Taux de pénalités de retard (multiple du taux légal, défaut 3)
  };
  numbering: {
    quotePrefix: string;
    invoicePrefix: string;
    creditPrefix: string;
    quoteCounter: number;
    invoiceCounter: number;
    creditCounter: number;
    yearInNumber: boolean;
    monthInNumber: boolean;
    resetYearly: boolean;
  };
  lists: {
    units: string[];
    paymentMethods: string[];
    categories: string[];
    civilities: string[];
    legalForms: string[];
    paymentConditions: string[];
    emailCategories: string[];
    phoneCategories: string[];
  };
  historicalData?: HistoricalEntry[];
  externalPayments?: ExternalPayment[];
  documentTemplate: {
    colors: {
      primary: string;
    };
    textSizes: {
      title: number;
      subtitle: number;
      normal: number;
      small: number;
    };
    textColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    blockStyles: {
      sectionHeaders: {
        fontSize: number;
        color: string;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        textDecoration: 'none' | 'underline';
      };
      companyInfo: {
        fontSize: number;
        color: string;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        textDecoration: 'none' | 'underline';
      };
      clientInfo: {
        fontSize: number;
        color: string;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        textDecoration: 'none' | 'underline';
      };
      tableHeader: {
        fontSize: number;
        color: string;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        textDecoration: 'none' | 'underline';
      };
      tableContent: {
        fontSize: number;
        color: string;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        textDecoration: 'none' | 'underline';
      };
      totalsLabels: {
        fontSize: number;
        color: string;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        textDecoration: 'none' | 'underline';
      };
      totalsValues: {
        fontSize: number;
        color: string;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        textDecoration: 'none' | 'underline';
      };
    };
    showLogo: boolean;
    footerTexts: {
      quote: string;
      invoice: string;
      credit: string;
    };
    primaryColor: string;
    secondaryColor?: string;
    fontFamily?: string;
    conditions: {
      cgv: string; // Conditions Générales de Vente
      cgl: string; // Conditions Générales de Location
      legalConditions: string; // Conditions légales personnalisées pour factures
      showCgvOnQuotes: boolean;
      showCgvOnInvoices: boolean;
      showCglOnQuotes: boolean;
      showCglOnInvoices: boolean;
      showLegalConditionsOnInvoices: boolean;
    };
  };
  electronicInvoicing?: {
    enabled: boolean;
    defaultFormat?: 'factur-x' | 'ubl' | 'xml-cii';
    autoSendToChorusPro?: boolean;
    chorusProConfig?: {
      sandbox: boolean;
      clientId: string;
      clientSecret: string;
      baseUrl?: string;
    };
    facturXOptions?: {
      defaultConformanceLevel: 'MINIMUM' | 'BASIC_WL' | 'BASIC' | 'EN16931' | 'EXTENDED';
      includeAttachments: boolean;
      signPDF: boolean;
    };
    notifications?: {
      email: boolean;
      emailAddress?: string;
      webhookUrl?: string;
    };
  };
}

export interface HistoricalEntry {
  id: string;
  year: number;
  month: number;
  revenue: number;
  revenueHT?: number;
  vatRate?: number;
  collections?: number;
  collectionsHT?: number;
  collectionsVatRate?: number;
  quotes?: number;
  quotesHT?: number;
  quotesVatRate?: number;
  description?: string;
}

export interface ExternalPayment {
  id: string;
  invoiceNumber: string;
  amount: number;
  amountHT?: number;
  vatRate?: number;
  invoiceDate: Date;
  paymentDate: Date;
  paymentMonth?: number; // Pour les saisies par mois complet
  paymentYear?: number;
  invoiceMonth?: number; // Pour les saisies par mois complet
  invoiceYear?: number;
  isMonthlyGlobal?: boolean; // Indique si c'est un montant global mensuel
  paymentMethod: string;
  clientName?: string;
  reference?: string;
  description?: string;
  createdAt: Date;
}

export interface Equipment {
  id: string;
  userId: string;
  name: string;
  description?: string;
  reference: string;
  category: string;
  purchasePrice: number;
  purchaseDate?: Date;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  quantityTotal: number;
  quantityAvailable: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  depositAmount: number;
  imageUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rental {
  id: string;
  userId: string;
  clientId: string;
  rentalNumber: string;
  startDate: Date;
  endDate: Date;
  actualReturnDate?: Date;
  status: 'draft' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'overdue';
  subtotal: number;
  taxAmount: number;
  total: number;
  depositPaid: number;
  depositReturned: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RentalItem {
  id: string;
  rentalId: string;
  equipmentId: string;
  quantity: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  appliedRate: number;
  rateType: 'daily' | 'weekly' | 'monthly' | 'custom';
  daysCount: number;
  subtotal: number;
  notes?: string;
  createdAt: Date;
}

export interface EquipmentMaintenance {
  id: string;
  userId: string;
  equipmentId: string;
  maintenanceDate: Date;
  maintenanceType: 'repair' | 'inspection' | 'cleaning' | 'other';
  description: string;
  cost: number;
  performedBy: string;
  nextMaintenanceDate?: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Super-Admin Multi-Tenant Types
export interface SuperAdmin {
  id: string;
  authUserId?: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  maxUsers: number;
  maxDocumentsPerMonth?: number;
  maxStorageMb?: number;
  priceMonthly?: number;
  priceYearly?: number;
  isCustom: boolean;
  features: string[];
  createdAt: Date;
}

export interface CompanySubscription {
  id: string;
  companyId: string;
  planId: string;
  customMaxUsers?: number;
  customMaxDocuments?: number;
  customMaxStorageMb?: number;
  isActive: boolean;
  trialEndsAt?: Date;
  subscriptionStartsAt: Date;
  subscriptionEndsAt?: Date;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  plan?: SubscriptionPlan;
  company?: Company;
}

export type ModuleName =
  | 'dashboard'
  | 'quotes'
  | 'invoices'
  | 'credits'
  | 'articles'
  | 'clients'
  | 'settings'
  | 'emails'
  | 'users';

export interface CompanyModule {
  id: string;
  companyId: string;
  moduleName: ModuleName;
  isEnabled: boolean;
  enabledAt: Date;
  enabledBy?: string;
}

export interface CompanyUsage {
  id: string;
  companyId: string;
  currentUsersCount: number;
  currentDocumentsCount: number;
  currentStorageMb: number;
  documentsThisMonth: number;
  lastResetAt: Date;
  updatedAt: Date;
}</parameter>