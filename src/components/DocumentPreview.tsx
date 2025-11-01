import React from 'react';
import { Settings } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DocumentPreviewProps {
  settings: Settings;
  type: 'quote' | 'invoice' | 'credit';
}

export default function DocumentPreview({ settings, type }: DocumentPreviewProps) {
  const primaryColor = settings.documentTemplate.primaryColor || '#8bc34a';
  const sectionHeaderStyle = settings.documentTemplate.blockStyles?.sectionHeaders || { fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' };
  const companyInfoStyle = settings.documentTemplate.blockStyles?.companyInfo || { fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' };
  const clientInfoStyle = settings.documentTemplate.blockStyles?.clientInfo || { fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' };
  const tableHeaderStyle = settings.documentTemplate.blockStyles?.tableHeader || { fontSize: 9, color: '#ffffff', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' };
  const tableContentStyle = settings.documentTemplate.blockStyles?.tableContent || { fontSize: 9, color: '#000000', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none' };
  const totalsLabelStyle = settings.documentTemplate.blockStyles?.totalsLabels || { fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' };
  const totalsValueStyle = settings.documentTemplate.blockStyles?.totalsValues || { fontSize: 10, color: '#000000', fontWeight: 'bold', fontStyle: 'normal', textDecoration: 'none' };

  const getStyleCSS = (style: any) => ({
    fontSize: `${style.fontSize}px`,
    color: style.color,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration
  });

  const documentTitle = type === 'quote' ? 'DEVIS' : type === 'invoice' ? 'FACTURE' : 'AVOIR';
  const documentNumber = type === 'quote' ? 'DEV-2025-00001' : type === 'invoice' ? 'FAC-2025-00001' : 'AV-2025-00001';

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm" style={{ width: '420px', height: '594px', transform: 'scale(0.7)', transformOrigin: 'top left' }}>
      {/* En-tête avec bannière */}
      <div 
        className="h-16 flex items-center justify-between px-4 relative"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Logo */}
        {settings.company?.logo && settings.documentTemplate?.showLogo && (
          <div className="flex-shrink-0">
            <img
              src={settings.company.logo}
              alt="Logo"
              className="object-contain"
              style={{ 
                width: `${settings.company?.logoSize || 24}px`, 
                height: `${settings.company?.logoSize || 24}px`,
                maxHeight: '38px'
              }}
            />
          </div>
        )}
        
        {/* Titre centré */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 
            style={getStyleCSS(sectionHeaderStyle)}
            className="text-white font-bold text-lg"
          >
            {documentTitle}
          </h1>
        </div>
        
        {/* Informations document */}
        <div className="text-right text-white text-xs">
          <div>{documentNumber}</div>
          <div>Date : 31/01/2025</div>
          <div>Échéance : 02/03/2025</div>
        </div>
      </div>

      {/* Sections entreprise et client */}
      <div className="flex p-3 space-x-3">
        <div className="flex-1">
          <div 
            className="p-2 rounded mb-2"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <h3 style={getStyleCSS(sectionHeaderStyle)} className="font-bold">
              {settings.company.name.toUpperCase()}
            </h3>
          </div>
          <div style={getStyleCSS(companyInfoStyle)} className="text-xs space-y-1">
            <div>{settings.company?.address?.split('\n')[0] || '123 Rue Test'}</div>
            <div>{settings.company?.address?.split('\n')[1] || '69000 Lyon'}</div>
            <div>Tél. : {settings.company?.phone || '04 78 12 34 56'}</div>
            <div>Email : {settings.company?.email || 'contact@test.fr'}</div>
          </div>
        </div>
        
        <div className="flex-1">
          <div 
            className="p-2 rounded mb-2"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <h3 style={getStyleCSS(sectionHeaderStyle)} className="font-bold">
              CLIENT EXEMPLE SARL
            </h3>
          </div>
          <div style={getStyleCSS(clientInfoStyle)} className="text-xs space-y-1">
            <div>456 Avenue Test</div>
            <div>75000 Paris</div>
          </div>
        </div>
      </div>

      {/* En-tête tableau */}
      <div className="mx-3 mt-4">
        <div 
          className="flex justify-between p-2 text-white text-xs"
          style={{ backgroundColor: primaryColor }}
        >
          <span style={getStyleCSS(tableHeaderStyle)}>Libellé</span>
          <span style={getStyleCSS(tableHeaderStyle)}>Qté</span>
          <span style={getStyleCSS(tableHeaderStyle)}>PU HT</span>
          <span style={getStyleCSS(tableHeaderStyle)}>Montant HT</span>
        </div>
        
        {/* Lignes d'exemple */}
        <div className="bg-gray-50 p-2 text-xs border-b">
          <div style={getStyleCSS(tableContentStyle)}>
            Service d'exemple
          </div>
          <div style={getStyleCSS(tableContentStyle)} className="text-gray-600 text-xs mt-1">
            Description détaillée du service
          </div>
        </div>
        <div className="bg-white p-2 text-xs border-b">
          <div style={getStyleCSS(tableContentStyle)}>
            Autre service
          </div>
        </div>
      </div>

      {/* Section totaux avec détail TVA */}
      <div className="flex mx-3 mt-4 space-x-3">
        {/* Détail TVA */}
        <div className="flex-1">
          <div 
            className="p-2 rounded mb-2"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <h4 style={getStyleCSS(sectionHeaderStyle)} className="font-bold text-xs">
              DÉTAIL TVA
            </h4>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span style={getStyleCSS(totalsLabelStyle)}>Base 20%</span>
              <span style={getStyleCSS(totalsValueStyle)}>1 000,00 €</span>
            </div>
            <div className="flex justify-between">
              <span style={getStyleCSS(totalsLabelStyle)}>TVA 20%</span>
              <span style={getStyleCSS(totalsValueStyle)}>200,00 €</span>
            </div>
          </div>
        </div>
        
        {/* Totaux */}
        <div className="flex-1">
          <div 
            className="p-2 rounded mb-2"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <h4 style={getStyleCSS(sectionHeaderStyle)} className="font-bold text-xs">
              TOTAUX
            </h4>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span style={getStyleCSS(totalsLabelStyle)}>Total HT</span>
              <span style={getStyleCSS(totalsValueStyle)}>1 000,00 €</span>
            </div>
            <div className="flex justify-between">
              <span style={getStyleCSS(totalsLabelStyle)}>TVA</span>
              <span style={getStyleCSS(totalsValueStyle)}>200,00 €</span>
            </div>
            <div 
              className="flex justify-between p-1 text-white rounded"
              style={{ backgroundColor: primaryColor }}
            >
              <span style={getStyleCSS(totalsLabelStyle)}>Total TTC</span>
              <span style={getStyleCSS(totalsValueStyle)}>1 200,00 €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coordonnées bancaires */}
      <div className="mx-3 mt-4">
        <div 
          className="p-2 rounded mb-2"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <h4 style={getStyleCSS(sectionHeaderStyle)} className="font-bold text-xs">
            Coordonnées bancaires
          </h4>
        </div>
        <div style={getStyleCSS(companyInfoStyle)} className="text-xs space-y-1 pl-1">
          {settings.company?.bankName && (
            <div className="flex">
              <span className="w-12">Nom</span>
              <span className="ml-2">{settings.company?.bankName}</span>
            </div>
          )}
          {settings.company?.bic && (
            <div className="flex">
              <span className="w-12">BIC</span>
              <span className="ml-2">{settings.company?.bic}</span>
            </div>
          )}
          {settings.company?.iban && (
            <div className="flex">
              <span className="w-12">IBAN</span>
              <span className="ml-2">{settings.company?.iban}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}