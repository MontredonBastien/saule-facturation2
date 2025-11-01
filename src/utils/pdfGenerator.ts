import jsPDF from 'jspdf';
import { Quote, Invoice, Credit, Client, Settings } from '../types';
import { formatCurrency, formatDate, getVATBreakdown, applyGlobalDiscount } from './calculations';
import { getPDFConditions } from './pdfConditionsHelper';
import { embedFacturXInPDF } from './facturXPDFGenerator';
import { supabase } from '../lib/supabase';

// Helper pour convertir hexadécimal en RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function addConditionsWithBanner(doc: jsPDF, conditions: string, settings: Settings, startY: number) {
  const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  const sectionHeaderStyle = settings.documentTemplate?.blockStyles?.sectionHeaders || { 
    fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
  };
  const tableContentStyle = settings.documentTemplate?.blockStyles?.tableContent || { 
    fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' 
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const tableContentRgb = hexToRgb(tableContentStyle.color);
  
  let currentY = startY;
  
  // Diviser les conditions par sections (CGV et CGL)
  const sections = conditions.split('\n\n---\n\n');
  
  sections.forEach((section, sectionIndex) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    const lines = section.trim().split('\n');
    if (lines.length === 0) return;
    
    const firstLine = lines[0];
    let titleText = '';
    let contentStartIndex = 0;
    
    // Détecter si la première ligne est un titre de section
    if (firstLine.includes('CONDITIONS GÉNÉRALES DE VENTE')) {
      titleText = 'CONDITIONS GÉNÉRALES DE VENTE';
      contentStartIndex = 2; // Skip title and empty line
    } else if (firstLine.includes('CONDITIONS GÉNÉRALES DE LOCATION')) {
      titleText = 'CONDITIONS GÉNÉRALES DE LOCATION';
      contentStartIndex = 2; // Skip title and empty line
    }
    
    // Ajouter la bannière colorée pour le titre
    if (titleText) {
      // Bannière colorée comme les autres sections
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(20, currentY, 170, 8, 'F');
      
      doc.setFont(fontFamily, sectionHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
      doc.setFontSize(sectionHeaderStyle.fontSize);
      doc.setTextColor(255, 255, 255);
      doc.text(titleText, 22, currentY + 5.5);
      
      currentY += 12;
    }
    
    // Ajouter le contenu des conditions
    doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(tableContentStyle.fontSize);
    doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
    
    const contentLines = titleText ? lines.slice(contentStartIndex) : lines;
    const contentText = contentLines.join('\n');
    const wrappedLines = doc.splitTextToSize(contentText, 170);
    
    const contentLineHeight = tableContentStyle.fontSize * 0.6;
    wrappedLines.forEach((line: string, index: number) => {
      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(line, 22, currentY);
      currentY += contentLineHeight;
    });
    
    currentY += 15; // Espace entre les sections
  });
  
  return currentY;
}

function addCompanyInfo(doc: jsPDF, settings: Settings, startY: number) {
  const company = settings.company;
  const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  
  // UTILISER UNIQUEMENT textSizes (modifiables par l'utilisateur)
  const companyFontSize = settings.documentTemplate?.textSizes?.normal || 9;
  const sectionFontSize = settings.documentTemplate?.textSizes?.title || 10;
  
  const primaryRgb = hexToRgb(primaryColor);
  const companyInfoRgb = hexToRgb('#000000'); // Noir pour l'adresse
  
  // Bannière colorée pour le nom de l'entreprise
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(20, startY, 85, 12, 'F');
  
  // Nom de l'entreprise en blanc sur la bannière
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(sectionFontSize);
  doc.setTextColor(255, 255, 255);
  doc.text(company.name?.toUpperCase() || '', 22, startY + 8);
  
  // Informations de l'entreprise - UTILISER textSizes.normal
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(companyFontSize); // TAILLE MODIFIABLE DANS L'INTERFACE
  doc.setTextColor(companyInfoRgb.r, companyInfoRgb.g, companyInfoRgb.b);
  
  let yPos = startY + 18;
  const lineHeight = 5; // Hauteur optimisée pour éviter chevauchements
  
  // UNIQUEMENT adresse, téléphone, email
  if (company.address) {
    const addressLines = company.address.split('\n');
    addressLines.forEach(line => {
      if (line.trim()) {
        doc.text(line.trim(), 22, yPos);
        yPos += lineHeight;
      }
    });
  }
  
  if (company.phone) {
    doc.text(`Tél. : ${company.phone}`, 22, yPos);
    yPos += lineHeight;
  }
  
  if (company.email) {
    doc.text(`Email : ${company.email}`, 22, yPos);
    yPos += lineHeight;
  }
  
  return yPos + 8; // Plus d'espace pour éviter chevauchements
}

function addClientInfo(doc: jsPDF, client: Client, settings: Settings, startY: number) {
  const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  
  // PRIORITÉ AUX textSizes modifiables par l'utilisateur
  const clientFontSize = settings.documentTemplate?.textSizes?.normal || 9;
  const sectionFontSize = settings.documentTemplate?.textSizes?.title || 12;
  const clientColor = settings.documentTemplate?.textColors?.primary || '#000000';
  
  const primaryRgb = hexToRgb(primaryColor);
  const clientInfoRgb = hexToRgb(clientColor);
  
  // Bannière pour le client
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(110, startY, 85, 12, 'F');
  
  // Nom du client
  let clientName = 'CLIENT';
  if (client.type === 'pro') {
    const legalForm = client.legalForm ? `${client.legalForm} ` : '';
    clientName = `${legalForm}${client.companyName || 'Sans nom'}`;
  } else {
    const civility = client.civility ? `${client.civility} ` : '';
    clientName = `${civility}${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sans nom';
  }
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(sectionFontSize);
  doc.setTextColor(255, 255, 255);
  doc.text(clientName.toUpperCase(), 112, startY + 8);
  
  // Informations du client - UTILISER LA VRAIE TAILLE
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(clientFontSize); // RESPECTER LA TAILLE CONFIGURÉE
  doc.setTextColor(clientInfoRgb.r, clientInfoRgb.g, clientInfoRgb.b);
  
  let yPos = startY + 18;
  const lineHeight = 4.5; // Hauteur augmentée pour éviter chevauchements
  
  if (client.address) {
    const addressLines = client.address.split('\n');
    addressLines.forEach(line => {
      if (line.trim()) {
        doc.text(line.trim(), 112, yPos);
        yPos += lineHeight;
      }
    });
  }
  
  if (client.city) {
    doc.text(client.city, 112, yPos);
    yPos += lineHeight;
  }
  
  if (client.email) {
    doc.text(client.email, 112, yPos);
    yPos += lineHeight;
  }
  
  if (client.phone) {
    doc.text(client.phone, 112, yPos);
    yPos += lineHeight;
  }
  
  return yPos + 10; // Plus d'espace après
}

function addDocumentHeader(doc: jsPDF, type: 'quote' | 'invoice' | 'credit', document: any, settings: Settings, showPaid = false) {
  const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  
  const primaryRgb = hexToRgb(primaryColor);
  
  // Bannière principale
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Logo - TAILLE CORRIGÉE
  if (settings.company?.logo && settings.documentTemplate?.showLogo) {
    try {
      const logoSize = settings.company.logoSize || 24;
      
      // Calculer la hauteur du logo (max 35px pour la bannière de 40px)
      const logoHeight = Math.min(logoSize, 35);
      
      // Calculer la largeur proportionnelle (ratio 4:3 par défaut)
      const logoWidth = logoHeight * 1.3;
      
      // Centrer verticalement dans la bannière (40px de hauteur)
      const logoY = (40 - logoHeight) / 2;
      
      doc.addImage(settings.company.logo, 'JPEG', 15, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Erreur logo:', error);
    }
  }
  
  // Titre du document
  const titles = { quote: 'DEVIS', invoice: 'FACTURE', credit: 'AVOIR' };
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(titles[type], 105, 25, { align: 'center' });
  
  // Mention PAYÉ pour les factures payées
  if (showPaid && type === 'invoice') {
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('PAYÉ', 105, 33, { align: 'center' });
  }
  
  // Informations du document
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  
  const docNumber = document.number || 'BROUILLON';
  doc.text(`N° : ${docNumber}`, 150, 15);
  
  const dateField = type === 'invoice' ? 'issuedAt' : 'createdAt';
  const dateLabel = type === 'invoice' ? 'Date d\'émission' : type === 'credit' ? 'Date d\'émission' : 'Date';
  doc.text(`${dateLabel} : ${formatDate(document[dateField])}`, 150, 22);
  
  if (type === 'quote' && document.validUntil) {
    doc.text(`Échéance : ${formatDate(document.validUntil)}`, 150, 29);
  } else if (type === 'invoice' && document.dueDate) {
    doc.text(`Échéance : ${formatDate(document.dueDate)}`, 150, 29);
  }
  
  if (document.reference) {
    doc.text(`Réf : ${document.reference}`, 150, 36);
  }
  
  return 50; // Y position après l'en-tête
}

function addBankInfo(doc: jsPDF, settings: Settings, startY: number) {
  const company = settings.company;
  const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  
  // PRIORITÉ AUX textSizes modifiables par l'utilisateur
  const bankFontSize = settings.documentTemplate?.textSizes?.normal || 9;
  const sectionFontSize = settings.documentTemplate?.textSizes?.title || 12;
  const bankColor = settings.documentTemplate?.textColors?.primary || '#000000';
  
  const primaryRgb = hexToRgb(primaryColor);
  const bankInfoRgb = hexToRgb(bankColor);
  
  if (!company.iban && !company.bic && !company.bankName) {
    return startY;
  }
  
  // Bannière section
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(20, startY, 170, 8, 'F');
  
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(sectionFontSize);
  doc.setTextColor(255, 255, 255);
  doc.text('COORDONNÉES BANCAIRES', 22, startY + 5.5);
  
  // Coordonnées bancaires - VRAIE TAILLE depuis les paramètres
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(bankFontSize); // UTILISE LA VRAIE TAILLE
  doc.setTextColor(bankInfoRgb.r, bankInfoRgb.g, bankInfoRgb.b);
  
  let yPos = startY + 12;
  const lineHeight = 4.5; // Hauteur augmentée pour éviter chevauchements
  
  if (company.bankName) {
    doc.text(`Nom : ${company.bankName}`, 22, yPos);
    yPos += lineHeight;
  }
  
  if (company.bic) {
    doc.text(`BIC : ${company.bic}`, 22, yPos);
    yPos += lineHeight;
  }
  
  if (company.iban) {
    doc.text(`IBAN : ${company.iban}`, 22, yPos);
    yPos += lineHeight;
  }
  
  return yPos + 10; // Plus d'espace après
}

function addLegalFooter(doc: jsPDF, settings: Settings) {
  const company = settings.company;
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  // UTILISER la taille "Petits textes" modifiable par l'utilisateur
  const legalFontSize = settings.documentTemplate?.textSizes?.small || 8;
  
  // Position du pied de page très bas pour éviter les chevauchements
  const footerY = 275;
  
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(legalFontSize); // TAILLE MODIFIABLE dans les paramètres
  doc.setTextColor(100, 100, 100);
  
  // Construire UNIQUEMENT les mentions légales
  const legalMentions = [];
  
  if (company.siret) {
    legalMentions.push(`SIRET : ${company.siret}`);
  }
  
  if (company.siren) {
    legalMentions.push(`SIREN : ${company.siren}`);
  }
  
  if (company.tvaIntracommunautaire) {
    legalMentions.push(`N° TVA : ${company.tvaIntracommunautaire}`);
  }
  
  if (company.rcs) {
    legalMentions.push(company.rcs);
  }
  
  // Forme juridique et capital
  if (company.formeJuridique) {
    let legalText = company.formeJuridique;
    if (company.capitalSocial) {
      const currency = company.capitalCurrency || 'euros';
      legalText += ` au capital de ${company.capitalSocial} ${currency}`;
    }
    legalMentions.push(legalText);
  }
  
  // Afficher sur une seule ligne si possible, sinon couper intelligemment
  if (legalMentions.length > 0) {
    const allMentions = legalMentions.join(' - ');
    const maxWidth = 180;
    const mentionLines = doc.splitTextToSize(allMentions, maxWidth);
    
    mentionLines.forEach((line: string, index: number) => {
      doc.text(line, 105, footerY + (index * (legalFontSize + 1)), { align: 'center' }); // Espacement basé sur taille
    });
  }
}

function addLinesTable(doc: jsPDF, lines: any[], settings: Settings, startY: number) {
  const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  
  // UTILISER VRAIMENT les styles définis
  const tableHeaderStyle = settings.documentTemplate?.blockStyles?.tableHeader || { 
    fontSize: 9, color: '#ffffff', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
  };
  const tableContentStyle = settings.documentTemplate?.blockStyles?.tableContent || { 
    fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' 
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const tableContentRgb = hexToRgb(tableContentStyle.color);
  
  // En-tête du tableau
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(20, startY, 170, 8, 'F');
  
  doc.setFont(fontFamily, tableHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
  doc.setFontSize(tableHeaderStyle.fontSize);
  doc.setTextColor(255, 255, 255);
  doc.text('Libellé', 22, startY + 5.5);
  doc.text('Qté', 130, startY + 5.5);
  doc.text('PU HT', 145, startY + 5.5);
  doc.text('Total HT', 170, startY + 5.5);
  
  // UTILISER LA VRAIE TAILLE pour le contenu du tableau
  doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
  doc.setFontSize(tableContentStyle.fontSize); // RESPECTER LA TAILLE CONFIGURÉE
  doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
  
  let yPos = startY + 12;
  const lineHeight = Math.max(6, tableContentStyle.fontSize * 0.7); // Hauteur minimale avec vraie taille
  
  lines.forEach((line, index) => {
    if (line.type === 'subtotal') {
      // Sous-total avec bannière colorée
      doc.setFillColor(primaryRgb.r + 30, primaryRgb.g + 30, primaryRgb.b + 30);
      doc.rect(20, yPos - 2, 170, lineHeight + 2, 'F');
      
      doc.setFont(fontFamily, 'bold');
      doc.setFontSize(tableContentStyle.fontSize + 1);
      doc.setTextColor(255, 255, 255);
      doc.text(line.designation || 'Sous-total', 22, yPos + 3);
      doc.text(formatCurrency(line.subtotalAmount || 0), 170, yPos + 3, { align: 'right' });
      
      yPos += lineHeight + 3;
    } else if (line.type === 'comment') {
      // Commentaire formaté
      doc.setFont(
        line.fontFamily || fontFamily, 
        line.fontWeight === 'bold' ? 'bold' : 'normal'
      );
      doc.setFontSize(line.fontSize || tableContentStyle.fontSize);
      
      const commentRgb = hexToRgb(line.textColor || tableContentStyle.color);
      doc.setTextColor(commentRgb.r, commentRgb.g, commentRgb.b);
      
      if (line.isMultiline && line.designation) {
        const commentLines = line.designation.split('\n');
        commentLines.forEach(commentLine => {
          doc.text(commentLine, 22, yPos + 3);
          yPos += lineHeight;
        });
      } else {
        doc.text(line.designation || '', 22, yPos + 3);
        yPos += lineHeight;
      }
      
      // Reset style
      doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
      doc.setFontSize(tableContentStyle.fontSize);
      doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
    } else {
      // Ligne normale
      const bgColor = index % 2 === 0 ? 'white' : settings.documentTemplate?.secondaryColor || '#f9fafb';
      
      if (bgColor !== 'white') {
        const bgRgb = hexToRgb(bgColor);
        doc.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
        doc.rect(20, yPos - 1, 170, lineHeight + 2, 'F');
      }
      
      // Désignation
      doc.text(line.designation || '', 22, yPos + 3);
      
      // Description sur la ligne suivante si elle existe
      if (line.description?.trim()) {
        yPos += lineHeight * 0.7;
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(Math.max(6, tableContentStyle.fontSize - 2)); // Plus petit pour description
        doc.setTextColor(120, 120, 120);
        
        const maxWidth = 100;
        const descLines = doc.splitTextToSize(line.description, maxWidth);
        descLines.slice(0, 2).forEach((descLine: string) => {
          doc.text(descLine, 22, yPos + 3);
          yPos += lineHeight * 0.6;
        });
        
        // Reset style
        doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
        doc.setFontSize(tableContentStyle.fontSize);
        doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
        yPos += lineHeight * 0.3;
      } else {
        yPos += lineHeight;
      }
      
      // Quantité, prix unitaire, total
      doc.text((line.quantity || 0).toString(), 135, yPos - (line.description?.trim() ? lineHeight : 0) + 3, { align: 'right' });
      doc.text(formatCurrency(line.priceHT || 0), 160, yPos - (line.description?.trim() ? lineHeight : 0) + 3, { align: 'right' });
      
      let total = (line.quantity || 0) * (line.priceHT || 0);
      if (line.discount && line.discount > 0) {
        if (line.discountType === 'percentage') {
          total = total * (1 - line.discount / 100);
        } else {
          total = Math.max(0, total - line.discount);
        }
      }
      
      doc.text(formatCurrency(total), 185, yPos - (line.description?.trim() ? lineHeight : 0) + 3, { align: 'right' });
    }
    
    yPos += 2; // Espacement entre les lignes
  });
  
  return yPos + 10; // Plus d'espace après
}

function addTotalsSection(doc: jsPDF, document: any, settings: Settings, startY: number, type: 'quote' | 'invoice' | 'credit') {
  const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  
  // UTILISER VRAIMENT les styles définis
  const sectionHeaderStyle = settings.documentTemplate?.blockStyles?.sectionHeaders || { 
    fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
  };
  const totalsLabelStyle = settings.documentTemplate?.blockStyles?.totalsLabels || { 
    fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
  };
  const totalsValueStyle = settings.documentTemplate?.blockStyles?.totalsValues || { 
    fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const totalsLabelRgb = hexToRgb(totalsLabelStyle.color);
  const totalsValueRgb = hexToRgb(totalsValueStyle.color);
  
  // Détail TVA (partie gauche)
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(20, startY, 80, 8, 'F');
  
  doc.setFont(fontFamily, sectionHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
  doc.setFontSize(sectionHeaderStyle.fontSize);
  doc.setTextColor(255, 255, 255);
  doc.text('DÉTAIL TVA', 22, startY + 5.5);
  
  let vatYPos = startY + 12;
  const vatBreakdown = getVATBreakdown(document.lines || []);
  
  // UTILISER LA VRAIE TAILLE pour les totaux
  doc.setFont(fontFamily, totalsLabelStyle.fontWeight === 'bold' ? 'bold' : 'normal');
  doc.setFontSize(totalsLabelStyle.fontSize); // RESPECTER LA TAILLE CONFIGURÉE
  doc.setTextColor(totalsLabelRgb.r, totalsLabelRgb.g, totalsLabelRgb.b);
  
  const totalsLineHeight = totalsLabelStyle.fontSize * 0.5; // Hauteur basée sur vraie taille
  
  vatBreakdown.forEach(vat => {
    doc.text(`Base ${vat.rate}%`, 22, vatYPos);
    doc.setTextColor(totalsValueRgb.r, totalsValueRgb.g, totalsValueRgb.b);
    doc.text(formatCurrency(vat.baseHT), 95, vatYPos, { align: 'right' });
    
    vatYPos += totalsLineHeight;
    doc.setTextColor(totalsLabelRgb.r, totalsLabelRgb.g, totalsLabelRgb.b);
    doc.text(`TVA ${vat.rate}%`, 22, vatYPos);
    doc.setTextColor(totalsValueRgb.r, totalsValueRgb.g, totalsValueRgb.b);
    doc.text(formatCurrency(vat.vatAmount), 95, vatYPos, { align: 'right' });
    
    vatYPos += totalsLineHeight + 1; // Espace entre les groupes de TVA
  });
  
  // Totaux (partie droite)
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(110, startY, 80, 8, 'F');
  
  doc.setFont(fontFamily, sectionHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
  doc.setFontSize(sectionHeaderStyle.fontSize);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAUX', 112, startY + 5.5);
  
  let totalsYPos = startY + 12;
  
  doc.setFont(fontFamily, totalsLabelStyle.fontWeight === 'bold' ? 'bold' : 'normal');
  doc.setFontSize(totalsLabelStyle.fontSize);
  doc.setTextColor(totalsLabelRgb.r, totalsLabelRgb.g, totalsLabelRgb.b);
  
  // Total HT
  doc.text('Total HT', 112, totalsYPos);
  doc.setTextColor(totalsValueRgb.r, totalsValueRgb.g, totalsValueRgb.b);
  doc.text(formatCurrency(document.totalHT || 0), 185, totalsYPos, { align: 'right' });
  totalsYPos += totalsLineHeight;
  
  // TVA
  doc.setTextColor(totalsLabelRgb.r, totalsLabelRgb.g, totalsLabelRgb.b);
  doc.text('TVA', 112, totalsYPos);
  doc.setTextColor(totalsValueRgb.r, totalsValueRgb.g, totalsValueRgb.b);
  doc.text(formatCurrency(document.totalVAT || 0), 185, totalsYPos, { align: 'right' });
  totalsYPos += totalsLineHeight + 2;
  
  // Remise globale si applicable
  if (document.globalDiscount && document.globalDiscount > 0) {
    const discountAmount = document.globalDiscountType === 'percentage' 
      ? (document.totalTTC || 0) * document.globalDiscount / 100
      : Math.min(document.totalTTC || 0, document.globalDiscount);
    
    doc.setTextColor(255, 100, 100);
    doc.text(`Remise (${document.globalDiscount}${document.globalDiscountType === 'percentage' ? '%' : '€'})`, 112, totalsYPos);
    doc.text(`-${formatCurrency(discountAmount)}`, 185, totalsYPos, { align: 'right' });
    totalsYPos += totalsLineHeight + 2;
  }
  
  // Total TTC avec bannière
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(110, totalsYPos - 1, 80, totalsLabelStyle.fontSize, 'F'); // Bannière encore plus fine
  
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(totalsLabelStyle.fontSize + 1);
  doc.setTextColor(255, 255, 255);
  
  // Calculer le total TTC (avec remise globale mais SANS déduire l'acompte ici)
  let totalTTC = document.totalTTC || 0;
  if (document.globalDiscount && document.globalDiscount > 0) {
    totalTTC = applyGlobalDiscount(totalTTC, document.globalDiscount, document.globalDiscountType);
  }
  
  doc.text('Total TTC', 112, totalsYPos + 3);
  doc.text(formatCurrency(totalTTC), 185, totalsYPos + 3, { align: 'right' });
  
  // Affichage de l'acompte reçu pour les factures
  if (type === 'invoice' && document.depositReceived && document.depositAmount && document.depositAmount > 0) {
    totalsYPos += totalsLabelStyle.fontSize + 8;
    
    doc.setFont(fontFamily, totalsLabelStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(totalsLabelStyle.fontSize);
    doc.setTextColor(totalsLabelRgb.r, totalsLabelRgb.g, totalsLabelRgb.b);
    doc.text('Acompte reçu', 112, totalsYPos);
    doc.setTextColor(0, 150, 0); // Vert pour l'acompte reçu
    doc.text(`-${formatCurrency(document.depositAmount)}`, 185, totalsYPos, { align: 'right' });
    
    totalsYPos += totalsLineHeight;
    
    // Solde à payer avec bannière colorée
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b); // Même couleur que le total TTC
    doc.rect(110, totalsYPos - 1, 80, totalsLabelStyle.fontSize + 2, 'F');
    
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(totalsLabelStyle.fontSize + 1);
    doc.setTextColor(255, 255, 255);
    doc.text('Solde à payer', 112, totalsYPos + 3);
    doc.text(formatCurrency(Math.max(0, totalTTC - document.depositAmount)), 185, totalsYPos + 3, { align: 'right' });
  } else if (type === 'invoice' && document.depositAmount && document.depositAmount > 0 && !document.depositReceived) {
    // Si l'acompte n'est pas encore reçu, on affiche le montant total (qui inclut déjà l'acompte)
    totalsYPos += totalsLabelStyle.fontSize + 8;
    
    doc.setFont(fontFamily, totalsLabelStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(totalsLabelStyle.fontSize);
    doc.setTextColor(255, 140, 0); // Orange pour l'acompte non reçu
    doc.text(`Acompte prévu (${formatCurrency(document.depositAmount)}) - non encore reçu`, 112, totalsYPos);
  }
  
  // Acompte pour les devis
  if (type === 'quote' && document.depositPercentage && document.depositPercentage > 0) {
    const depositAmount = finalTotal * document.depositPercentage / 100;
    totalsYPos += totalsLabelStyle.fontSize + 8;
    
    doc.setFont(fontFamily, totalsLabelStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(totalsLabelStyle.fontSize);
    doc.setTextColor(0, 100, 200);
    doc.text(`Acompte (${document.depositPercentage}%)`, 112, totalsYPos);
    doc.text(formatCurrency(depositAmount), 185, totalsYPos, { align: 'right' });
    
    totalsYPos += totalsLineHeight;
    doc.text('Reste à payer', 112, totalsYPos);
    doc.text(formatCurrency(finalTotal - depositAmount), 185, totalsYPos, { align: 'right' });
  }
  
  return Math.max(vatYPos, totalsYPos) + 15; // PLUS D'ESPACE après les totaux
}

function addLegalConditions(doc: jsPDF, document: any, settings: Settings, startY: number) {
  // Les conditions légales sont maintenant obligatoires pour les factures
  const penaltyRate = settings.defaults?.penaltyRate || 3;
  const indemnity = settings.defaults?.recouvrementIndemnity || 40;
  const legalConditions = settings.documentTemplate?.conditions?.legalConditions?.trim() ||
    `Pas d'escompte pour règlement anticipé. En cas de retard de paiement, pénalités de retard au taux de ${penaltyRate} fois le taux d'intérêt légal et indemnité forfaitaire de ${indemnity}€ due (article L441-6 du Code de commerce).`;
  
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  const legalFontSize = settings.documentTemplate?.blockStyles?.tableContent?.fontSize || 9;
  
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(legalFontSize);
  doc.setTextColor(0, 0, 0);
  
  // S'assurer qu'on a assez de place
  if (startY > 230) {
    doc.addPage();
    startY = 20;
  }
  
  // Titre des conditions légales
  const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
  const primaryRgb = hexToRgb(primaryColor);
  
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(20, startY, 170, 8, 'F');
  
  doc.setFont(fontFamily, 'bold');
  doc.setFontSize(settings.documentTemplate?.blockStyles?.sectionHeaders?.fontSize || 10);
  doc.setTextColor(255, 255, 255);
  doc.text('CONDITIONS LÉGALES', 22, startY + 5.5);
  
  startY += 12;
  doc.setFont(fontFamily, 'normal');
  doc.setFontSize(legalFontSize);
  doc.setTextColor(0, 0, 0);
  
  const legalLines = doc.splitTextToSize(legalConditions, 160); // Encore plus petit pour éviter les coupures
  
  const legalLineHeight = legalFontSize * 0.8; // Interligne plus grand pour la lisibilité
  legalLines.forEach((line: string, index: number) => {
    if (startY + (index * legalLineHeight) > 265) {
      doc.addPage();
      startY = 20;
    }
    doc.text(line, 22, startY + (index * legalLineHeight));
  });
  
  return startY + (legalLines.length * legalLineHeight) + 10;
}

function addPaymentConditions(doc: jsPDF, quote: Quote, settings: Settings, startY: number) {
  if (!quote.paymentConditions?.trim()) {
    return startY;
  }
  
  const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
  const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
  
  // UTILISER VRAIMENT les styles définis
  const sectionHeaderStyle = settings.documentTemplate?.blockStyles?.sectionHeaders || { 
    fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
  };
  const tableContentStyle = settings.documentTemplate?.blockStyles?.tableContent || { 
    fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' 
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const tableContentRgb = hexToRgb(tableContentStyle.color);
  
  // Bannière section
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(20, startY, 170, 8, 'F');
  
  doc.setFont(fontFamily, sectionHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
  doc.setFontSize(sectionHeaderStyle.fontSize);
  doc.setTextColor(255, 255, 255);
  doc.text('CONDITIONS DE RÈGLEMENT', 22, startY + 5.5);
  
  // UTILISER LA VRAIE TAILLE pour les conditions
  doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
  doc.setFontSize(tableContentStyle.fontSize); // RESPECTER LA TAILLE CONFIGURÉE
  doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
  
  const yPos = startY + 12;
  const maxWidth = 170;
  const conditionLines = doc.splitTextToSize(quote.paymentConditions, maxWidth);
  
  const conditionLineHeight = tableContentStyle.fontSize * 0.5; // Hauteur basée sur vraie taille
  conditionLines.forEach((line: string, index: number) => {
    doc.text(line, 22, yPos + (index * conditionLineHeight));
  });
  
  return yPos + (conditionLines.length * conditionLineHeight) + 15; // PLUS D'ESPACE après
}

export async function generateQuotePDF(quote: Quote, client: Client, settings: Settings): Promise<string> {
  const doc = new jsPDF();
  
  // En-tête
  let currentY = addDocumentHeader(doc, 'quote', quote, settings);
  
  // Informations entreprise et client
  const companyEndY = addCompanyInfo(doc, settings, currentY);
  const clientEndY = addClientInfo(doc, client, settings, currentY);
  currentY = Math.max(companyEndY, clientEndY) + 15; // PLUS D'ESPACE
  
  // Conditions de règlement (spécifique aux devis)
  currentY = addPaymentConditions(doc, quote, settings, currentY);
  
  // Tableau des lignes
  currentY = addLinesTable(doc, quote.lines || [], settings, currentY);
  
  // Totaux
  currentY = addTotalsSection(doc, quote, settings, currentY, 'quote');
  
  // Coordonnées bancaires
  currentY = addBankInfo(doc, settings, currentY);
  
  // Commentaires
  if (quote.showComments !== false && quote.comments?.trim()) {
    const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
    const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
    const sectionHeaderStyle = settings.documentTemplate?.blockStyles?.sectionHeaders || { 
      fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
    };
    const tableContentStyle = settings.documentTemplate?.blockStyles?.tableContent || { 
      fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' 
    };
    
    const primaryRgb = hexToRgb(primaryColor);
    const tableContentRgb = hexToRgb(tableContentStyle.color);
    
    // S'assurer qu'on a assez de place
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(20, currentY, 170, 8, 'F');
    
    doc.setFont(fontFamily, sectionHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(sectionHeaderStyle.fontSize);
    doc.setTextColor(255, 255, 255);
    doc.text('COMMENTAIRES', 22, currentY + 5.5);
    
    currentY += 12;
    doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(tableContentStyle.fontSize);
    doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
    
    const commentLines = doc.splitTextToSize(quote.comments, 170);
    const commentLineHeight = tableContentStyle.fontSize * 0.5;
    commentLines.forEach((line: string, index: number) => {
      doc.text(line, 22, currentY + (index * commentLineHeight));
    });
    currentY += commentLines.length * commentLineHeight + 15;
  }
  
  // AJOUTER le pied de page légal
  addLegalFooter(doc, settings);
  
  // Conditions générales
  const conditions = getPDFConditions(settings, quote, 'quote');
  if (conditions) {
    doc.addPage();
    addConditionsWithBanner(doc, conditions, settings, 20);
  }
  
  return doc.output('datauristring');
}

export async function generateInvoicePDF(invoice: Invoice, client: Client, settings: Settings, showPaid = false): Promise<string> {
  const doc = new jsPDF();
  
  // En-tête
  let currentY = addDocumentHeader(doc, 'invoice', invoice, settings, showPaid);
  
  // Informations entreprise et client
  const companyEndY = addCompanyInfo(doc, settings, currentY);
  const clientEndY = addClientInfo(doc, client, settings, currentY);
  currentY = Math.max(companyEndY, clientEndY) + 15; // PLUS D'ESPACE
  
  // Tableau des lignes
  currentY = addLinesTable(doc, invoice.lines || [], settings, currentY);
  
  // Totaux
  currentY = addTotalsSection(doc, invoice, settings, currentY, 'invoice');
  
  // Coordonnées bancaires
  currentY = addBankInfo(doc, settings, currentY);
  
  // Commentaires
  if (invoice.showComments !== false && invoice.comments?.trim()) {
    const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
    const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
    const sectionHeaderStyle = settings.documentTemplate?.blockStyles?.sectionHeaders || { 
      fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
    };
    const tableContentStyle = settings.documentTemplate?.blockStyles?.tableContent || { 
      fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' 
    };
    
    const primaryRgb = hexToRgb(primaryColor);
    const tableContentRgb = hexToRgb(tableContentStyle.color);
    
    // S'assurer qu'on a assez de place
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(20, currentY, 170, 8, 'F');
    
    doc.setFont(fontFamily, sectionHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(sectionHeaderStyle.fontSize);
    doc.setTextColor(255, 255, 255);
    doc.text('COMMENTAIRES', 22, currentY + 5.5);
    
    currentY += 12;
    doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(tableContentStyle.fontSize);
    doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
    
    const commentLines = doc.splitTextToSize(invoice.comments, 170);
    const commentLineHeight = tableContentStyle.fontSize * 0.5;
    commentLines.forEach((line: string, index: number) => {
      doc.text(line, 22, currentY + (index * commentLineHeight));
    });
    currentY += commentLines.length * commentLineHeight + 15;
  }
  
  // Conditions légales personnalisées (après les commentaires, avant les mentions légales)
  currentY = addLegalConditions(doc, invoice, settings, currentY);
  
  // AJOUTER le pied de page légal
  addLegalFooter(doc, settings);
  
  // Conditions générales
  const conditions = getPDFConditions(settings, invoice, 'invoice');
  if (conditions) {
    doc.addPage();
    addConditionsWithBanner(doc, conditions, settings, 20);
  }

  const pdfDataUri = doc.output('datauristring');

  // Si la facturation électronique est activée, embarquer le XML Factur-X
  console.log('📋 Settings complets:', JSON.stringify(settings, null, 2));
  console.log('📋 Settings électroniques:', settings.electronicInvoicing);
  console.log('📋 Enabled:', settings.electronicInvoicing?.enabled);

  if (settings.electronicInvoicing?.enabled) {
    console.log('🔌 Facturation électronique activée - Génération Factur-X');
    const facturXPdf = await embedFacturXInPDF(pdfDataUri, invoice, client, settings);
    console.log('✅ Factur-X PDF retourné');
    return facturXPdf;
  } else {
    console.log('⚠️ Facturation électronique désactivée ou non configurée');
    console.log('⚠️ Valeur enabled:', settings.electronicInvoicing?.enabled);
  }

  return pdfDataUri;
}

export async function generateCreditPDF(credit: Credit, client: Client, settings: Settings): Promise<string> {
  const doc = new jsPDF();

  // En-tête
  let currentY = addDocumentHeader(doc, 'credit', credit, settings);

  // Informations entreprise et client
  const companyEndY = addCompanyInfo(doc, settings, currentY);
  const clientEndY = addClientInfo(doc, client, settings, currentY);
  currentY = Math.max(companyEndY, clientEndY) + 15; // PLUS D'ESPACE

  // Référence à la facture d'origine (OBLIGATOIRE légalement)
  if (credit.invoiceId) {
    const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
    const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
    const sectionHeaderStyle = settings.documentTemplate?.blockStyles?.sectionHeaders || {
      fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none'
    };
    const tableContentStyle = settings.documentTemplate?.blockStyles?.tableContent || {
      fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none'
    };

    const primaryRgb = hexToRgb(primaryColor);
    const tableContentRgb = hexToRgb(tableContentStyle.color);

    // Récupérer le numéro de la facture depuis la base
    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('number')
        .eq('id', credit.invoiceId)
        .maybeSingle();

      if (invoice?.number) {
        doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.rect(20, currentY, 170, 8, 'F');

        doc.setFont(fontFamily, sectionHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
        doc.setFontSize(sectionHeaderStyle.fontSize);
        doc.setTextColor(255, 255, 255);
        doc.text('FACTURE D\'ORIGINE', 22, currentY + 5.5);

        currentY += 12;
        doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
        doc.setFontSize(tableContentStyle.fontSize);
        doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
        doc.text(`Cet avoir fait référence à la facture N° ${invoice.number}`, 22, currentY);

        currentY += 15;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la facture d\'origine:', error);
    }
  }

  // Motif de l'avoir
  if (credit.reason?.trim()) {
    const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
    const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
    const sectionHeaderStyle = settings.documentTemplate?.blockStyles?.sectionHeaders || { 
      fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
    };
    const tableContentStyle = settings.documentTemplate?.blockStyles?.tableContent || { 
      fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' 
    };
    
    const primaryRgb = hexToRgb(primaryColor);
    const tableContentRgb = hexToRgb(tableContentStyle.color);
    
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(20, currentY, 170, 8, 'F');
    
    doc.setFont(fontFamily, sectionHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(sectionHeaderStyle.fontSize);
    doc.setTextColor(255, 255, 255);
    doc.text('MOTIF DE L\'AVOIR', 22, currentY + 5.5);
    
    currentY += 12;
    doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(tableContentStyle.fontSize);
    doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
    
    const reasonLines = doc.splitTextToSize(credit.reason, 170);
    const reasonLineHeight = tableContentStyle.fontSize * 0.5;
    reasonLines.forEach((line: string, index: number) => {
      doc.text(line, 22, currentY + (index * reasonLineHeight));
    });
    currentY += reasonLines.length * reasonLineHeight + 15;
  }
  
  // Tableau des lignes
  currentY = addLinesTable(doc, credit.lines || [], settings, currentY);
  
  // Totaux
  currentY = addTotalsSection(doc, credit, settings, currentY, 'credit');
  
  // Coordonnées bancaires
  currentY = addBankInfo(doc, settings, currentY);
  
  // Commentaires
  if (credit.showComments !== false && credit.comments?.trim()) {
    const primaryColor = settings.documentTemplate?.primaryColor || '#8bc34a';
    const fontFamily = settings.documentTemplate?.fontFamily || 'helvetica';
    const sectionHeaderStyle = settings.documentTemplate?.blockStyles?.sectionHeaders || { 
      fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' 
    };
    const tableContentStyle = settings.documentTemplate?.blockStyles?.tableContent || { 
      fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' 
    };
    
    const primaryRgb = hexToRgb(primaryColor);
    const tableContentRgb = hexToRgb(tableContentStyle.color);
    
    // S'assurer qu'on a assez de place
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(20, currentY, 170, 8, 'F');
    
    doc.setFont(fontFamily, sectionHeaderStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(sectionHeaderStyle.fontSize);
    doc.setTextColor(255, 255, 255);
    doc.text('COMMENTAIRES', 22, currentY + 5.5);
    
    currentY += 12;
    doc.setFont(fontFamily, tableContentStyle.fontWeight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(tableContentStyle.fontSize);
    doc.setTextColor(tableContentRgb.r, tableContentRgb.g, tableContentRgb.b);
    
    const commentLines = doc.splitTextToSize(credit.comments, 170);
    const commentLineHeight = tableContentStyle.fontSize * 0.5;
    commentLines.forEach((line: string, index: number) => {
      doc.text(line, 22, currentY + (index * commentLineHeight));
    });
    currentY += commentLines.length * commentLineHeight + 15;
  }
  
  // AJOUTER le pied de page légal
  addLegalFooter(doc, settings);
  
  // Conditions générales
  const conditions = getPDFConditions(settings, credit, 'credit');
  if (conditions) {
    doc.addPage();
    addConditionsWithBanner(doc, conditions, settings, 20);
  }
  
  return doc.output('datauristring');
}