import { Invoice, Client, Settings } from '../types';
import { formatDate, calculateLineTotal, getVATBreakdown } from './calculations';

/**
 * Génère le XML Factur-X (format CII - Cross Industry Invoice) conforme à la norme EN 16931
 * Ce XML sera embarqué dans le PDF pour créer une facture électronique valide
 */
export function generateFacturXXML(invoice: Invoice, client: Client, settings: Settings): string {
  const company = settings.company;

  // Calculer les totaux
  const totalHT = invoice.totalHT || 0;
  const totalTVA = invoice.totalTVA || 0;
  const totalTTC = invoice.totalTTC || 0;

  // Déterminer le type de document
  const invoiceTypeCode = invoice.type === 'facture' ? '380' : '381'; // 380=facture, 381=avoir

  // Format de date ISO pour Factur-X
  const formatDateISO = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };

  // Calculer la répartition par taux de TVA
  const vatBreakdown = getVATBreakdown(invoice.lines);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">

  <!-- Contexte du document -->
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:en16931</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>

  <!-- En-tête du document -->
  <rsm:ExchangedDocument>
    <ram:ID>${escapeXML(invoice.number)}</ram:ID>
    <ram:TypeCode>${invoiceTypeCode}</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${formatDateISO(invoice.issuedAt)}</udt:DateTimeString>
    </ram:IssueDateTime>
    ${invoice.notes ? `<ram:IncludedNote>
      <ram:Content>${escapeXML(invoice.notes)}</ram:Content>
    </ram:IncludedNote>` : ''}
  </rsm:ExchangedDocument>

  <!-- Transaction commerciale -->
  <rsm:SupplyChainTradeTransaction>

    <!-- Lignes de facture -->
${invoice.lines.filter(line => !line.type || line.type === 'item').map((line, index) => {
  const lineTotalAfterDiscount = calculateLineTotal(line);
  const lineVAT = lineTotalAfterDiscount * ((line.vatRate || 0) / 100);

  return `    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${index + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${escapeXML(line.description)}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${line.priceHT.toFixed(2)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="${getUnitCode(line.unit || 'unité')}">${line.quantity}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>${getVATCategory(line.vatRate || 0)}</ram:CategoryCode>
          <ram:RateApplicablePercent>${line.vatRate || 0}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${lineTotalAfterDiscount.toFixed(2)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`
}).join('\n')}

    <!-- Accord commercial -->
    <ram:ApplicableHeaderTradeAgreement>
      <!-- Vendeur (Fournisseur) -->
      <ram:SellerTradeParty>
        <ram:Name>${escapeXML(company.name)}</ram:Name>
        ${company.siret ? `<ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${company.siret}</ram:ID>
          ${company.rcs ? `<ram:TradingBusinessName>${escapeXML(company.rcs)}</ram:TradingBusinessName>` : ''}
        </ram:SpecifiedLegalOrganization>` : ''}
        <ram:PostalTradeAddress>
          ${company.address ? `<ram:LineOne>${escapeXML(company.address.split('\n')[0] || '')}</ram:LineOne>` : ''}
          ${company.address.split('\n')[1] ? `<ram:LineTwo>${escapeXML(company.address.split('\n')[1])}</ram:LineTwo>` : ''}
          ${company.postalCode ? `<ram:PostcodeCode>${escapeXML(company.postalCode)}</ram:PostcodeCode>` : ''}
          ${company.city ? `<ram:CityName>${escapeXML(company.city)}</ram:CityName>` : ''}
          <ram:CountryID>${company.country || 'FR'}</ram:CountryID>
        </ram:PostalTradeAddress>
        ${company.email ? `<ram:URIUniversalCommunication>
          <ram:URIID schemeID="EM">${escapeXML(company.email)}</ram:URIID>
        </ram:URIUniversalCommunication>` : ''}
        ${company.tvaIntracommunautaire ? `<ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escapeXML(company.tvaIntracommunautaire)}</ram:ID>
        </ram:SpecifiedTaxRegistration>` : ''}
      </ram:SellerTradeParty>

      <!-- Acheteur (Client) -->
      <ram:BuyerTradeParty>
        <ram:Name>${escapeXML(getClientName(client))}</ram:Name>
        ${client.siret ? `<ram:SpecifiedLegalOrganization>
          <ram:ID schemeID="0002">${client.siret}</ram:ID>
        </ram:SpecifiedLegalOrganization>` : ''}
        <ram:PostalTradeAddress>
          ${client.address ? `<ram:LineOne>${escapeXML(client.address.split('\n')[0] || '')}</ram:LineOne>` : ''}
          ${client.address && client.address.split('\n')[1] ? `<ram:LineTwo>${escapeXML(client.address.split('\n')[1])}</ram:LineTwo>` : ''}
          ${client.postalCode ? `<ram:PostcodeCode>${escapeXML(client.postalCode)}</ram:PostcodeCode>` : ''}
          ${client.city ? `<ram:CityName>${escapeXML(client.city)}</ram:CityName>` : ''}
          <ram:CountryID>${client.country || 'FR'}</ram:CountryID>
        </ram:PostalTradeAddress>
        ${client.email ? `<ram:URIUniversalCommunication>
          <ram:URIID schemeID="EM">${escapeXML(client.email)}</ram:URIID>
        </ram:URIUniversalCommunication>` : ''}
        ${client.tvaIntracommunautaire ? `<ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escapeXML(client.tvaIntracommunautaire)}</ram:ID>
        </ram:SpecifiedTaxRegistration>` : ''}
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>

    <!-- Livraison -->
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${formatDateISO(invoice.issuedAt)}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>

    <!-- Règlement -->
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>

      ${invoice.dueDate ? `<ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${formatDateISO(invoice.dueDate)}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>` : ''}

      ${company.iban ? `<ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>${getPaymentMeansCode(invoice.paymentMethod)}</ram:TypeCode>
        ${invoice.paymentMethod ? `<ram:Information>${escapeXML(invoice.paymentMethod)}</ram:Information>` : ''}
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${escapeXML(company.iban)}</ram:IBANID>
          ${company.bankName ? `<ram:AccountName>${escapeXML(company.bankName)}</ram:AccountName>` : ''}
        </ram:PayeePartyCreditorFinancialAccount>
        ${company.bic ? `<ram:PayeeSpecifiedCreditorFinancialInstitution>
          <ram:BICID>${escapeXML(company.bic)}</ram:BICID>
        </ram:PayeeSpecifiedCreditorFinancialInstitution>` : ''}
      </ram:SpecifiedTradeSettlementPaymentMeans>` : ''}

      <!-- Répartition TVA par taux -->
${vatBreakdown.map(vat => `      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${vat.vatAmount.toFixed(2)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${vat.baseHT.toFixed(2)}</ram:BasisAmount>
        <ram:CategoryCode>${getVATCategory(vat.rate)}</ram:CategoryCode>
        <ram:RateApplicablePercent>${vat.rate}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>`).join('\n')}

      <!-- Totaux -->
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${totalHT.toFixed(2)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${totalHT.toFixed(2)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="EUR">${totalTVA.toFixed(2)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${totalTTC.toFixed(2)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${totalTTC.toFixed(2)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;

  return xml;
}

// Helpers

function escapeXML(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getClientName(client: Client): string {
  if (client.type === 'pro') {
    const legalForm = client.legalForm ? `${client.legalForm} ` : '';
    return `${legalForm}${client.companyName || ''}`;
  }
  const civility = client.civility ? `${client.civility} ` : '';
  return `${civility}${client.firstName || ''} ${client.lastName || ''}`.trim();
}

function getUnitCode(unit: string): string {
  const unitMap: { [key: string]: string } = {
    'unité': 'C62',
    'heure': 'HUR',
    'jour': 'DAY',
    'kg': 'KGM',
    'm': 'MTR',
    'm²': 'MTK',
    'm³': 'MTQ',
    'litre': 'LTR',
    'pièce': 'C62'
  };

  return unitMap[unit.toLowerCase()] || 'C62'; // C62 = pièce/unité par défaut
}

function getVATCategory(rate: number): string {
  if (rate === 0) return 'Z';
  if (rate === 2.1) return 'AA';
  if (rate === 5.5) return 'K';
  if (rate === 10) return 'G';
  if (rate === 20) return 'S';
  return 'S';
}

function getPaymentMeansCode(paymentMethod: string): string {
  const methodMap: { [key: string]: string } = {
    'virement': '30',
    'virement bancaire': '30',
    'chèque': '20',
    'cheque': '20',
    'carte bancaire': '48',
    'carte': '48',
    'espèces': '10',
    'especes': '10',
    'prélèvement': '49',
    'prelevement': '49'
  };
  return methodMap[paymentMethod?.toLowerCase()] || '30';
}
