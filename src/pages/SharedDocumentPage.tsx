import React, { useState, useEffect } from 'react';
import { FileText, Building, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SharedDocument {
  type: 'quote' | 'invoice' | 'credit';
  document: any;
  company: any;
  client: any;
  items: any[];
  shareInfo: any;
}

export default function SharedDocumentPage() {
  const [data, setData] = useState<SharedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(true);
  const [viewerEmail, setViewerEmail] = useState('');
  const [viewerName, setViewerName] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const name = urlParams.get('name');

    if (email) {
      setViewerEmail(email);
      setViewerName(name || '');
      setShowEmailPrompt(false);
      loadSharedDocument(email, name || '');
    }
  }, []);

  const handleEmailSubmit = () => {
    if (viewerEmail) {
      setShowEmailPrompt(false);
      loadSharedDocument(viewerEmail, viewerName);
    }
  };

  const loadSharedDocument = async (email: string, name: string) => {
    try {
      const token = window.location.pathname.split('/share/')[1];
      if (!token) {
        setError('Lien invalide');
        setLoading(false);
        return;
      }

      const { data: shareData, error: shareError } = await supabase
        .from('document_shares')
        .select('*')
        .eq('share_token', token)
        .single();

      if (shareError || !shareData) {
        setError('Document non trouvé');
        setLoading(false);
        return;
      }

      const isFirstView = !shareData.first_viewed_at;

      await supabase
        .from('document_shares')
        .update({
          first_viewed_at: isFirstView ? new Date().toISOString() : shareData.first_viewed_at,
          last_viewed_at: new Date().toISOString(),
          view_count: shareData.view_count + 1,
        })
        .eq('id', shareData.id);

      await supabase
        .from('document_share_views')
        .insert([{
          share_id: shareData.id,
          recipient_email: email,
          recipient_name: name,
          viewed_at: new Date().toISOString(),
        }]);

      const tableName = shareData.document_type === 'quote' ? 'quotes' :
                        shareData.document_type === 'invoice' ? 'invoices' : 'credits';

      const { data: docData, error: docError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', shareData.document_id)
        .single();

      if (docError || !docData) {
        setError('Document non trouvé');
        setLoading(false);
        return;
      }

      const [companyData, clientData, itemsData] = await Promise.all([
        supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', shareData.user_id)
          .single(),
        supabase
          .from('clients')
          .select('*')
          .eq('id', docData.client_id)
          .single(),
        supabase
          .from(`${tableName.slice(0, -1)}_items`)
          .select('*')
          .eq(`${shareData.document_type}_id`, docData.id),
      ]);

      setData({
        type: shareData.document_type,
        document: docData,
        company: companyData.data || {},
        client: clientData.data || {},
        items: itemsData.data || [],
        shareInfo: shareData,
      });
    } catch (error) {
      console.error('Error loading shared document:', error);
      setError('Erreur lors du chargement du document');
    } finally {
      setLoading(false);
    }
  };

  if (showEmailPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Accès au document</h2>
          <p className="text-gray-600 text-center mb-6">
            Pour consulter ce document, veuillez entrer votre email
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={viewerName}
                onChange={(e) => setViewerName(e.target.value)}
                placeholder="Votre nom"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={viewerEmail}
                onChange={(e) => setViewerEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
              />
            </div>
            <button
              onClick={handleEmailSubmit}
              disabled={!viewerEmail}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Accéder au document
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document introuvable</h1>
          <p className="text-gray-600">{error || 'Le lien que vous avez suivi est invalide ou a expiré.'}</p>
        </div>
      </div>
    );
  }

  const getDocumentTitle = () => {
    switch (data.type) {
      case 'quote': return 'Devis';
      case 'invoice': return 'Facture';
      case 'credit': return 'Avoir';
    }
  };

  const getDocumentNumber = () => {
    return data.document.quote_number || data.document.invoice_number || data.document.credit_number;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{getDocumentTitle()}</h1>
                <p className="text-blue-100 mt-1">N° {getDocumentNumber()}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Émetteur</h2>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{data.company.name}</p>
                      <p className="text-sm text-gray-600">{data.company.address}</p>
                      <p className="text-sm text-gray-600">{data.company.city} {data.company.postal_code}</p>
                    </div>
                  </div>
                  {data.company.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{data.company.phone}</span>
                    </div>
                  )}
                  {data.company.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{data.company.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Client</h2>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{data.client.name}</p>
                      <p className="text-sm text-gray-600">{data.client.address}</p>
                      <p className="text-sm text-gray-600">{data.client.city} {data.client.postal_code}</p>
                    </div>
                  </div>
                  {data.client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{data.client.phone}</span>
                    </div>
                  )}
                  {data.client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{data.client.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar className="w-4 h-4" />
                <span>Date: {new Date(data.document.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Quantité
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Prix unitaire
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{item.description}</div>
                          {item.details && (
                            <div className="text-sm text-gray-500">{item.details}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {parseFloat(item.unit_price).toFixed(2)} €
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          {parseFloat(item.total).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total:</span>
                    <span className="font-medium text-gray-900">
                      {parseFloat(data.document.subtotal).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA:</span>
                    <span className="font-medium text-gray-900">
                      {parseFloat(data.document.tax_amount).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-blue-600">
                      {parseFloat(data.document.total).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {data.document.notes && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.document.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Ce document a été généré électroniquement et ne nécessite pas de signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
