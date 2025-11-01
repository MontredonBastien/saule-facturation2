import JSZip from 'jszip';
import { Quote, Invoice, Credit, Client, Settings } from '../types';
import { generateQuotePDF, generateInvoicePDF, generateCreditPDF } from './pdfGenerator';

export async function downloadMultipleDocuments(
  documents: (Quote | Invoice | Credit)[],
  clients: Client[],
  settings: Settings,
  type: 'quote' | 'invoice' | 'credit'
) {
  if (documents.length === 0) {
    alert('Aucun document sélectionné');
    return;
  }

  try {
    const zip = new JSZip();
    const documentNames = {
      quote: 'devis',
      invoice: 'factures',
      credit: 'avoirs'
    };

    // Créer un dossier dans le ZIP
    const folder = zip.folder(documentNames[type]);
    
    // Compteur pour suivre le progrès
    let processed = 0;
    const total = documents.length;

    // Traiter chaque document
    for (const document of documents) {
      try {
        const client = clients.find(c => c.id === document.clientId);
        if (!client) {
          console.warn(`Client introuvable pour le document ${document.id}`);
          continue;
        }

        // Générer le PDF selon le type
        let pdfDataUri: string;
        let filename: string;
        
        let clientName = 'Client_inconnu';
        if (client.type === 'pro') {
          const legalForm = client.legalForm ? `${client.legalForm} ` : '';
          clientName = `${legalForm}${client.companyName || 'Sans nom'}`;
        } else {
          const civility = client.civility ? `${client.civility} ` : '';
          clientName = `${civility}${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sans nom';
        }
        const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9\-_]/g, '_');
        const docNumber = document.number || 'brouillon';

        switch (type) {
          case 'quote':
            pdfDataUri = await generateQuotePDF(document as Quote, client, settings);
            filename = `${sanitizedClientName}_devis_${docNumber}.pdf`;
            break;
          case 'invoice':
            pdfDataUri = await generateInvoicePDF(document as Invoice, client, settings);
            filename = `${sanitizedClientName}_facture_${docNumber}.pdf`;
            break;
          case 'credit':
            pdfDataUri = await generateCreditPDF(document as Credit, client, settings);
            filename = `${sanitizedClientName}_avoir_${docNumber}.pdf`;
            break;
          default:
            throw new Error('Type de document non supporté');
        }

        // Convertir le data URI en blob
        const base64Data = pdfDataUri.split(',')[1];
        const binaryData = atob(base64Data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }

        // Ajouter au ZIP
        folder?.file(filename, bytes);
        
        processed++;
        
        // Mettre à jour visuellement le progrès (optionnel)
        if (processed % 5 === 0 || processed === total) {
          console.log(`Traitement PDF: ${processed}/${total} documents`);
        }

      } catch (error) {
        console.error(`Erreur génération PDF pour document ${document.id}:`, error);
        // Continuer avec les autres documents même en cas d'erreur
      }
    }

    if (processed === 0) {
      alert('Aucun PDF n\'a pu être généré');
      return;
    }

    // Générer le fichier ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Créer le nom du fichier ZIP
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const zipFilename = `${documentNames[type]}_${dateStr}_${processed}documents.zip`;

    // Télécharger le ZIP
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = zipFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Nettoyer l'URL
    setTimeout(() => URL.revokeObjectURL(link.href), 100);

    alert(`${processed} PDF${processed > 1 ? 's' : ''} téléchargé${processed > 1 ? 's' : ''} dans ${zipFilename}`);

  } catch (error) {
    console.error('Erreur lors du téléchargement groupé:', error);
    alert('Erreur lors du téléchargement groupé: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
  }
}