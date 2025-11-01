import { Quote, Invoice, Credit, Client, Settings } from '../types';
import { generateQuotePDF, generateInvoicePDF, generateCreditPDF } from '../utils/pdfGenerator';
import { getPDFConditions } from '../utils/pdfConditionsHelper';
import { downloadFacturXXML } from '../utils/facturXPDFGenerator';

export const handleView = (document: Quote | Invoice | Credit, setViewingDocument: (doc: any) => void) => {
  setViewingDocument(document);
};

export const handleDownload = async (
  docToDownload: Quote | Invoice | Credit, 
  client: Client | undefined, 
  settings: Settings | undefined,
  type: 'quote' | 'invoice' | 'credit'
) => {
  try {
    if (!client || !settings) {
      alert('Données manquantes pour générer le PDF');
      return;
    }
    
    // Générer le nom du client
    let clientName = 'Client';
    if (client.type === 'pro') {
      const legalForm = client.legalForm ? `${client.legalForm} ` : '';
      clientName = `${legalForm}${client.companyName || 'Sans nom'}`;
    } else {
      const civility = client.civility ? `${client.civility} ` : '';
      clientName = `${civility}${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sans nom';
    }
    const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9\-_]/g, '_');
    
    let pdfUrl: string;
    let filename: string;
    
    switch (type) {
      case 'quote':
        pdfUrl = await generateQuotePDF(docToDownload as Quote, client, settings);
        filename = `${sanitizedClientName}_devis_${(docToDownload as Quote).number || 'brouillon'}.pdf`;
        break;
      case 'invoice':
        pdfUrl = await generateInvoicePDF(docToDownload as Invoice, client, settings);
        filename = `${sanitizedClientName}_facture_${(docToDownload as Invoice).number || 'brouillon'}.pdf`;
        break;
      case 'credit':
        pdfUrl = await generateCreditPDF(docToDownload as Credit, client, settings);
        filename = `${sanitizedClientName}_avoir_${(docToDownload as Credit).number || 'brouillon'}.pdf`;
        break;
      default:
        throw new Error('Type de document non supporté');
    }
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    alert('Erreur lors du téléchargement du PDF');
  }
};

export const handleDownloadFacturXXML = async (
  invoice: Invoice,
  client: Client | undefined,
  settings: Settings | undefined
) => {
  try {
    if (!client || !settings) {
      alert('Données manquantes pour générer le XML Factur-X');
      return;
    }

    downloadFacturXXML(invoice, client, settings);
  } catch (error) {
    console.error('Erreur téléchargement XML Factur-X:', error);
    alert('Erreur lors du téléchargement du XML Factur-X');
  }
};