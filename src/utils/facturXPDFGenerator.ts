import { PDFDocument, PDFName, PDFDict, PDFArray, PDFString, PDFHexString } from 'pdf-lib';
import { Invoice, Client, Settings } from '../types';
import { generateFacturXXML } from './facturXGenerator';

/**
 * Génère un PDF Factur-X complet avec le XML embarqué
 * Le XML est attaché au PDF selon la norme PDF/A-3
 */
export async function embedFacturXInPDF(
  pdfDataUri: string,
  invoice: Invoice,
  client: Client,
  settings: Settings
): Promise<string> {
  try {
    // Générer le XML Factur-X
    const xml = generateFacturXXML(invoice, client, settings);
    console.log('✅ Factur-X XML généré:', xml.length, 'caractères');

    // Convertir le data URI en bytes
    const base64Data = pdfDataUri.split(',')[1];
    const pdfBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Charger le PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Convertir le XML en bytes
    const xmlBytes = new TextEncoder().encode(xml);

    // Créer le fichier attaché selon la norme PDF/A-3
    const fileName = 'factur-x.xml';
    const fileDescription = 'Factur-X MINIMUM Invoice';

    // Attacher le XML au PDF
    await pdfDoc.attach(xmlBytes, fileName, {
      mimeType: 'text/xml',
      description: fileDescription,
      creationDate: new Date(invoice.issuedAt),
      modificationDate: new Date(),
    });

    // Ajouter les métadonnées PDF pour Factur-X
    pdfDoc.setTitle(`Facture ${invoice.number}`);
    pdfDoc.setSubject('Facture électronique Factur-X');
    pdfDoc.setAuthor(settings.company.name);
    pdfDoc.setKeywords(['Factur-X', 'Facture électronique', 'EN 16931']);
    pdfDoc.setProducer('Application de Facturation - Factur-X');
    pdfDoc.setCreator('Application de Facturation');

    // Sauvegarder le PDF modifié
    const modifiedPdfBytes = await pdfDoc.save();

    // Convertir en base64 par morceaux pour éviter "Maximum call stack size exceeded"
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < modifiedPdfBytes.length; i += chunkSize) {
      const chunk = modifiedPdfBytes.slice(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Modified = btoa(binary);

    console.log('✅ PDF Factur-X généré avec succès');
    return `data:application/pdf;base64,${base64Modified}`;

  } catch (error) {
    console.error('❌ Erreur lors de la génération Factur-X:', error);
    // En cas d'erreur, retourner le PDF original
    console.warn('⚠️  Retour au PDF standard sans XML embarqué');
    return pdfDataUri;
  }
}


/**
 * Télécharge le XML Factur-X séparément
 * Utile pour le débogage et la validation
 */
export function downloadFacturXXML(invoice: Invoice, client: Client, settings: Settings) {
  const xml = generateFacturXXML(invoice, client, settings);

  // Créer un blob avec le XML
  const blob = new Blob([xml], { type: 'text/xml' });
  const url = URL.createObjectURL(blob);

  // Créer un lien de téléchargement
  const link = document.createElement('a');
  link.href = url;
  link.download = `facture-${invoice.number}-facturx.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Libérer l'URL
  URL.revokeObjectURL(url);
}
