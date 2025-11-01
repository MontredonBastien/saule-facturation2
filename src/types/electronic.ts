export interface FacturXMetadata {
  conformanceLevel: 'MINIMUM' | 'BASIC_WL' | 'BASIC' | 'EN16931' | 'EXTENDED';
  businessProcess?: string;
  invoiceTypeCode: '380' | '381' | '384'; // 380=facture, 381=avoir, 384=facture corrective
  documentCurrencyCode: string;
  buyerReference?: string;
  orderReference?: string;
  contractReference?: string;
}

export interface ElectronicInvoiceStatus {
  id: string;
  invoiceId: string;
  status: 'pending' | 'sent' | 'received' | 'validated' | 'rejected' | 'paid';
  platform: 'factur-x' | 'peppol' | 'manual';
  lastUpdate: Date;
  messages: ElectronicStatusMessage[];
}

export interface ElectronicStatusMessage {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  technicalDetails?: string;
}

export interface FacturXGenerationOptions {
  includeAttachments?: boolean;
  conformanceLevel?: FacturXMetadata['conformanceLevel'];
  additionalDocuments?: {
    name: string;
    content: string;
    mimeType: string;
  }[];
}

export interface ElectronicInvoicingSettings {
  enabled: boolean;
  defaultFormat: 'factur-x' | 'ubl' | 'xml-cii';
  facturXOptions: {
    defaultConformanceLevel: FacturXMetadata['conformanceLevel'];
    includeAttachments: boolean;
    signPDF: boolean;
  };
  notifications: {
    email: boolean;
    emailAddress?: string;
    webhookUrl?: string;
  };
}