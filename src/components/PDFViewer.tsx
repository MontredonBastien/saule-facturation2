import React, { useEffect, useState } from 'react';
import { Download, Zap, Upload } from 'lucide-react';
import { generateQuotePDF, generateInvoicePDF, generateCreditPDF } from '../utils/pdfGenerator';  

interface PDFViewerProps {
  document: any;
  client: any;
  settings: any;
  type: 'quote' | 'invoice' | 'credit';
  onClose?: () => void;
}

export default function PDFViewer({ document, client, settings, type, onClose }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Vérifier si la facturation électronique est activée
  const isElectronicEnabled = () => {
    try {
      const electronicSettings = JSON.parse(localStorage.getItem('electronic_invoicing_settings') || '{}');
      return electronicSettings.enabled === true;
    } catch {
      return false;
    }
  };

  const handleGenerateFacturX = () => {
    if (window.confirm('⚡ Génération Factur-X\n\nCette fonctionnalité génère un PDF/A-3 avec XML intégré (norme EN16931).\n\nContinuer avec la génération de démonstration ?')) {
      // Dans une vraie implémentation, ici on utiliserait une librairie comme factur-x-generator
      alert('✅ Factur-X généré avec succès !\n\n📄 Le PDF contient maintenant :\n• Structure PDF/A-3 conforme\n• Métadonnées XML EN16931 intégrées\n• Données de facturation structurées\n\n💡 Version démo : consultez la documentation Factur-X pour l\'implémentation complète.');
    }
  };

  const handleSendToChorusPro = () => {
    if (window.confirm('📤 Envoi vers Chorus Pro\n\nCette fonctionnalité transmet automatiquement le document vers la plateforme Chorus Pro.\n\nContinuer avec l\'envoi de démonstration ?')) {
      alert('✅ Document envoyé vers Chorus Pro !\n\n📋 Statut de transmission :\n• Document accepté par Chorus Pro\n• Numéro de dépôt : CPF-2025-001234\n• Statut : En cours de traitement\n\n💡 Version démo : configurez vos vrais identifiants API pour l\'envoi réel.');
    }
  };

  useEffect(() => {
    const generatePDF = async () => {
      try {
        setLoading(true);
        setError('');

        if (!document || !client || !settings) {
          throw new Error('Données manquantes pour générer le PDF');
        }

        let generatedPdfUrl: string;
        
        if (type === 'quote') {
          generatedPdfUrl = await generateQuotePDF(document, client, settings);
        } else if (type === 'invoice') {
          generatedPdfUrl = await generateInvoicePDF(document, client, settings);
        } else if (type === 'credit') {
          generatedPdfUrl = await generateCreditPDF(document, client, settings);
        } else {
          throw new Error('Type de document non supporté');
        }
        
        setPdfUrl(generatedPdfUrl);
        
      } catch (err) {
        console.error('Erreur lors de la génération du PDF:', err);
        setError('Erreur lors de la génération du PDF: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
      } finally {
        setLoading(false);
      }
    };

    generatePDF();
  }, [document, client, settings, type]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      
      // Générer le nom du client
      const clientName = client?.companyName || `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 'Client_inconnu';
      const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9\-_]/g, '_');
      
      let filename;
      switch (type) {
        case 'quote':
          filename = `${sanitizedClientName}_devis_${document.number || 'brouillon'}.pdf`;
          break;
        case 'invoice':
          filename = `${sanitizedClientName}_facture_${document.number || 'brouillon'}.pdf`;
          break;
        case 'credit':
          filename = `${sanitizedClientName}_avoir_${document.number || 'brouillon'}.pdf`;
          break;
        default:
          filename = 'document.pdf';
      }
      
      link.download = filename;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Génération du PDF en cours...</p>
          <p className="text-sm text-gray-500 mt-2">Type: {type} | Document: {document?.number || 'BROUILLON'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center text-red-600">
          <p className="font-medium mb-2">Erreur de génération</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {type === 'quote' ? 'Aperçu du devis' : 
             type === 'invoice' ? 'Aperçu de la facture' : 
             'Aperçu de l\'avoir'}
          </h3>
          <p className="text-sm text-gray-600">{document?.number || 'BROUILLON'}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            disabled={!pdfUrl}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </button>
          
          {/* Boutons de facturation électronique pour les factures */}
          {type === 'invoice' && isElectronicEnabled() && (
            <>
              <button
                onClick={handleGenerateFacturX}
                disabled={!pdfUrl}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Zap className="h-4 w-4 mr-2" />
                Factur-X
              </button>
              
              <button
                onClick={handleSendToChorusPro}
                disabled={!pdfUrl}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                <Upload className="h-4 w-4 mr-2" />
                Chorus Pro
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-100 p-4">
        {pdfUrl ? (
          <div className="w-full h-full min-h-[500px] bg-white border border-gray-300 rounded shadow-lg">
            <iframe
              src={pdfUrl}
              className="w-full h-full min-h-[500px]"
              title={`Aperçu ${type === 'quote' ? 'du devis' : type === 'invoice' ? 'de la facture' : 'de l\'avoir'}`}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[500px] bg-white border border-gray-300 rounded">
            <div className="text-center">
              <p className="text-gray-500">PDF en cours de préparation...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}