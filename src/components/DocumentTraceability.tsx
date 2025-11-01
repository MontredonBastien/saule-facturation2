import React from 'react';
import { ArrowRight, FileText, Receipt, CreditCard } from 'lucide-react';

interface DocumentTraceabilityProps {
  document: any;
  type: 'quote' | 'invoice' | 'credit';
  allQuotes: any[];
  allInvoices: any[];
  allCredits: any[];
}

export default function DocumentTraceability({ 
  document, 
  type, 
  allQuotes, 
  allInvoices, 
  allCredits 
}: DocumentTraceabilityProps) {
  const getTraceabilityInfo = () => {
    const traces: Array<{ type: 'from' | 'to', text: string, icon: any, color: string }> = [];

    if (type === 'quote') {
      // Devis transformé en facture
      if (document.transformedToInvoiceId) {
        const relatedInvoice = allInvoices.find(i => i.id === document.transformedToInvoiceId);
        if (relatedInvoice) {
          traces.push({
            type: 'to',
            text: `Transformé en facture ${relatedInvoice.number || 'brouillon'}`,
            icon: Receipt,
            color: 'text-blue-600'
          });
        }
      }
    }

    if (type === 'invoice') {
      // Facture issue d'un devis
      if (document.quoteId) {
        const relatedQuote = allQuotes.find(q => q.id === document.quoteId);
        if (relatedQuote) {
          traces.push({
            type: 'from',
            text: `Issue du devis ${relatedQuote.number || 'brouillon'}`,
            icon: FileText,
            color: 'text-purple-600'
          });
        }
      }

      // Facture transformée en avoir
      if (document.transformedToCreditId) {
        const relatedCredit = allCredits.find(c => c.id === document.transformedToCreditId);
        if (relatedCredit) {
          traces.push({
            type: 'to',
            text: `Transformée en avoir ${relatedCredit.number || 'brouillon'}`,
            icon: CreditCard,
            color: 'text-red-600'
          });
        }
      }
    }

    if (type === 'credit') {
      // Avoir issu d'une facture
      if (document.invoiceId) {
        const relatedInvoice = allInvoices.find(i => i.id === document.invoiceId);
        if (relatedInvoice) {
          traces.push({
            type: 'from',
            text: `Issu de la facture ${relatedInvoice.number || 'brouillon'}`,
            icon: Receipt,
            color: 'text-blue-600'
          });
        }
      }
    }

    return traces;
  };

  const traces = getTraceabilityInfo();

  if (traces.length === 0) return null;

  return (
    <div className="space-y-1">
      {traces.map((trace, index) => {
        const Icon = trace.icon;
        return (
          <div key={index} className="flex items-center text-xs">
            {trace.type === 'from' ? (
              <>
                <Icon className={`h-3 w-3 ${trace.color} mr-1`} />
                <ArrowRight className="h-3 w-3 text-gray-400 mr-1" />
                <span className={trace.color}>{trace.text}</span>
              </>
            ) : (
              <>
                <ArrowRight className="h-3 w-3 text-gray-400 mr-1" />
                <Icon className={`h-3 w-3 ${trace.color} mr-1`} />
                <span className={trace.color}>{trace.text}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}