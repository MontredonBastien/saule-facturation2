import { v4 as uuidv4 } from 'uuid';
import { Quote, Invoice, Credit } from '../types';

// Helpers pour transformations de documents
export const transformQuoteToInvoice = (quote: Quote) => ({
  id: uuidv4(),
  clientId: quote.clientId,
  status: 'draft' as const,
  issuedAt: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
  reference: quote.reference,
  paymentMethod: 'virement',
  lines: quote.lines,
  totalHT: quote.totalHT,
  totalVAT: quote.totalVAT,
  totalTTC: quote.totalTTC,
  paidAmount: 0,
  remainingAmount: quote.totalTTC,
  comments: quote.comments,
  payments: [],
  quoteId: quote.id,
  depositAmount: quote.depositAmount,
  depositReceived: quote.depositAmount && quote.depositAmount > 0 ? undefined : false // undefined si acompte à gérer
});

export const transformInvoiceToCredit = (invoice: Invoice) => ({
  id: uuidv4(),
  clientId: invoice.clientId,
  status: 'draft' as const,
  createdAt: new Date(),
  reason: `Avoir sur facture ${invoice.number || invoice.id}`,
  lines: invoice.lines.map(line => ({
    ...line,
    id: uuidv4(),
    quantity: -(line.quantity || 0),
    totalHT: -(line.totalHT || 0)
  })),
  totalHT: -invoice.totalHT,
  totalVAT: -invoice.totalVAT,
  totalTTC: -invoice.totalTTC,
  invoiceId: invoice.id,
  comments: `Avoir émis sur facture ${invoice.number || invoice.id}`
});

export const duplicateDocument = (doc: Quote | Invoice, type: 'quote' | 'invoice') => ({
  ...doc,
  id: uuidv4(),
  status: 'draft' as const,
  number: undefined,
  createdAt: new Date(),
  ...(type === 'quote' && { validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }),
  ...(type === 'invoice' && { 
    issuedAt: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paidAmount: 0,
    remainingAmount: doc.totalTTC,
    payments: []
  }),
  reference: doc.reference ? `${doc.reference} (copie)` : undefined,
  lines: doc.lines.map(line => ({ ...line, id: uuidv4() })),
  attachments: doc.attachments || [],
  showComments: doc.showComments,
  showCgv: doc.showCgv,
  showCgl: doc.showCgl,
  showLegalConditions: doc.showLegalConditions,
  globalDiscount: doc.globalDiscount,
  globalDiscountType: doc.globalDiscountType
});