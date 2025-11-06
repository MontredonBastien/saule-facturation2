import React, { useState, useEffect } from 'react';
import { Mail, Send, Eye, Clock, Copy, Check, Search, X, Plus, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';
import Modal from '../components/Modal';

interface DocumentShare {
  id: string;
  documentType: 'quote' | 'invoice' | 'credit';
  documentId: string;
  shareToken: string;
  recipients: string;
  subject: string;
  message: string;
  sentAt: Date;
  firstViewedAt?: Date;
  lastViewedAt?: Date;
  viewCount: number;
  documentNumber?: string;
  views?: ShareView[];
}

interface ShareView {
  id: string;
  recipientEmail: string;
  recipientName: string;
  viewedAt: Date;
}

interface Recipient {
  name: string;
  email: string;
  role?: string;
}

interface EmailFormData {
  documentType: 'quote' | 'invoice' | 'credit';
  documentId: string;
  recipients: Recipient[];
  subject: string;
  message: string;
}

export default function EmailsPage() {
  const { quotes, invoices, credits, clients, updateQuote, updateInvoice, updateCredit, userCompanyId } = useApp();
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [documentSearch, setDocumentSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const [formData, setFormData] = useState<EmailFormData>({
    documentType: 'quote',
    documentId: '',
    recipients: [],
    subject: '',
    message: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const getUserId = async (): Promise<string | null> => {
    const demoSession = localStorage.getItem('demoSession');
    if (demoSession === 'true') {
      return '00000000-0000-0000-0000-000000000001';
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  };

  const loadData = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      if (!userCompanyId) {
        console.error('User has no company_id');
        return;
      }

      const { data: sharesData, error: sharesError } = await supabase
        .from('document_shares')
        .select('*')
        .eq('company_id', userCompanyId)
        .order('sent_at', { ascending: false });

      if (sharesError) throw sharesError;

      const sharesWithViews = await Promise.all(
        (sharesData || []).map(async (s: any) => {
          const { data: viewsData } = await supabase
            .from('document_share_views')
            .select('*')
            .eq('share_id', s.id)
            .order('viewed_at', { ascending: false });

          return {
            id: s.id,
            documentType: s.document_type,
            documentId: s.document_id,
            shareToken: s.share_token,
            recipients: s.recipient_email,
            subject: s.subject,
            message: s.message,
            sentAt: new Date(s.sent_at),
            firstViewedAt: s.first_viewed_at ? new Date(s.first_viewed_at) : undefined,
            lastViewedAt: s.last_viewed_at ? new Date(s.last_viewed_at) : undefined,
            viewCount: s.view_count,
            views: (viewsData || []).map((v: any) => ({
              id: v.id,
              recipientEmail: v.recipient_email,
              recipientName: v.recipient_name,
              viewedAt: new Date(v.viewed_at),
            })),
          };
        })
      );

      const sharesWithNumbers = sharesWithViews.map(share => {
        let docNumber = '';
        if (share.documentType === 'quote') {
          const doc = quotes.find((q: any) => q.id === share.documentId);
          docNumber = doc?.number || '';
        } else if (share.documentType === 'invoice') {
          const doc = invoices.find((i: any) => i.id === share.documentId);
          docNumber = doc?.number || '';
        } else if (share.documentType === 'credit') {
          const doc = credits.find((c: any) => c.id === share.documentId);
          docNumber = doc?.number || '';
        }
        return { ...share, documentNumber: docNumber };
      });

      setShares(sharesWithNumbers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.recipients.length === 0) {
      alert('Veuillez ajouter au moins un destinataire');
      return;
    }

    if (!formData.documentId) {
      alert('Veuillez sélectionner un document');
      return;
    }

    if (!formData.subject) {
      alert('Veuillez entrer un sujet');
      return;
    }

    try {
      const userId = await getUserId();
      if (!userId) {
        alert('Session expirée, veuillez vous reconnecter');
        return;
      }

      const shareToken = generateToken();

      const publicUrl = import.meta.env.VITE_PUBLIC_URL;
      const baseUrl = publicUrl && publicUrl.trim() !== '' ? publicUrl : window.location.origin;
      const shareLink = `${baseUrl}/share/${shareToken}`;

      console.log('Lien de partage généré:', shareLink);
      console.log('Base URL utilisée:', baseUrl);

      const recipientsString = formData.recipients.map(r =>
        r.role ? `${r.name} (${r.role}) - ${r.email}` : `${r.name} - ${r.email}`
      ).join('; ');

      if (!userCompanyId) {
        alert('Erreur: impossible de récupérer les informations de l\'entreprise');
        console.error('User has no company ID');
        return;
      }

      const shareData = {
        company_id: userCompanyId,
        user_id: userId,
        document_type: formData.documentType,
        document_id: formData.documentId,
        share_token: shareToken,
        recipient_email: recipientsString,
        recipient_name: formData.recipients[0].name,
        subject: formData.subject,
        message: formData.message + '\n\nLien vers le document: ' + shareLink,
        sent_at: new Date().toISOString(),
        view_count: 0,
      };

      const { error: shareError } = await supabase
        .from('document_shares')
        .insert([shareData]);

      if (shareError) {
        console.error('Supabase error:', shareError);
        throw new Error(`Erreur base de données: ${shareError.message}`);
      }

      let documentNumber = '';
      if (formData.documentType === 'quote') {
        const quote = quotes.find(q => q.id === formData.documentId);
        if (quote) {
          documentNumber = quote.number || 'Brouillon';
          await updateQuote(quote.id, { status: 'sent' });
        }
      } else if (formData.documentType === 'invoice') {
        const invoice = invoices.find(i => i.id === formData.documentId);
        if (invoice) {
          documentNumber = invoice.number || 'Brouillon';
          await updateInvoice(invoice.id, { status: 'sent' });
        }
      } else if (formData.documentType === 'credit') {
        const credit = credits.find(c => c.id === formData.documentId);
        if (credit) {
          documentNumber = credit.number || 'Brouillon';
          await updateCredit(credit.id, { status: 'sent' });
        }
      }

      let emailResult: any = {
        success: false,
        sent: 0,
        failed: 0,
        isDemoMode: false
      };

      try {
        console.log('📤 Envoi via Edge Function Supabase...');

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-document-email`;

        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            recipients: formData.recipients,
            subject: formData.subject,
            message: formData.message,
            shareLink: shareLink,
            documentType: formData.documentType,
            documentNumber: documentNumber,
          }),
        });

        const result = await response.json();

        console.log('📥 Réponse de l\'Edge Function:', {
          status: response.status,
          ok: response.ok,
          result: result
        });

        if (!response.ok || !result.success) {
          console.error('❌ Erreur de l\'Edge Function:', result);

          if (result.errors && result.errors.length > 0) {
            console.error('📋 Détails des erreurs:', result.errors);

            result.errors.forEach((err: any, index: number) => {
              console.error(`🔴 Erreur ${index + 1}:`, {
                recipient: err.recipient,
                error: err.error
              });
            });

            const firstError = result.errors[0];
            const errorMessage = firstError?.error || '';

            console.error('🔍 Message d\'erreur complet:', errorMessage);

            if (errorMessage.includes('RESEND_API_KEY')) {
              alert('⚠️ Configuration requise:\n\n' +
                    'Le secret RESEND_API_KEY n\'est pas configuré dans Supabase.\n\n' +
                    'Pour activer l\'envoi d\'emails:\n' +
                    '1. Allez sur votre dashboard Supabase\n' +
                    '2. Menu "Edge Functions" → "Secrets"\n' +
                    '3. Ajoutez: RESEND_API_KEY = votre_clé\n\n' +
                    'En attendant, l\'email sera simulé en mode démo.');
            } else {
              alert(`❌ Erreur d'envoi d'email:\n\n${errorMessage}\n\nL'email sera simulé en mode démo.`);
            }
          }

          throw new Error(result.error || 'Erreur lors de l\'envoi');
        }

        emailResult = {
          success: result.success,
          sent: result.sent,
          failed: result.failed,
          isDemoMode: false,
          errors: result.errors
        };

        console.log('✅ Emails envoyés avec succès via Edge Function:', result);
      } catch (error: any) {
        console.error('❌ Erreur lors de l\'appel à l\'Edge Function:', error);

        emailResult = {
          success: true,
          sent: formData.recipients.length,
          failed: 0,
          isDemoMode: true
        };

        console.log('📧 Basculement en mode démo:', {
          recipients: formData.recipients,
          subject: formData.subject,
          message: formData.message,
          shareLink: shareLink,
          documentType: formData.documentType,
          documentNumber: documentNumber,
        });
      }

      const recipientsList = formData.recipients.map(r => `- ${r.name} (${r.email})${r.role ? ` - ${r.role}` : ''}`).join('\n');

      const isWebContainer = window.location.hostname === 'localhost' || window.location.hostname.includes('webcontainer');
      const linkWarning = isWebContainer && !publicUrl
        ? '\n\n⚠️ ATTENTION: Les liens dans les emails ne fonctionneront pas en développement.\n📝 En production, configurez VITE_PUBLIC_URL avec votre vraie URL.'
        : '';

      const modeInfo = emailResult.isDemoMode
        ? '\n\n💡 Mode démo: Les emails ne sont pas réellement envoyés.\n📝 Configurez RESEND_API_KEY dans Supabase Edge Functions pour activer l\'envoi réel.'
        : '\n\n✉️ Les emails ont été envoyés avec succès!';

      const shouldPreview = confirm(`✅ Document partagé avec succès!\n\n📧 ${emailResult.sent} email(s) ${emailResult.isDemoMode ? 'simulé(s)' : 'envoyé(s)'}\n\n👥 Destinataires:\n${recipientsList}\n\n🔗 Lien: ${shareLink}${modeInfo}${linkWarning}\n\nVoulez-vous prévisualiser le document partagé ?`);

      if (shouldPreview) {
        window.open(`/share/${shareToken}`, '_blank');
      }

      setShowForm(false);
      setFormData({
        documentType: 'quote',
        documentId: '',
        recipients: [],
        subject: '',
        message: '',
      });
      setSelectedClient(null);
      setClientSearch('');
      setDocumentSearch('');
      loadData();
    } catch (error: any) {
      console.error('Error sending email:', error);
      alert(`Erreur lors de l'envoi de l'email: ${error.message || error}`);
    }
  };

  const copyShareLink = (token: string) => {
    const link = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const openSharePreview = (token: string) => {
    window.open(`/share/${token}`, '_blank');
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'quote': return 'Devis';
      case 'invoice': return 'Facture';
      case 'credit': return 'Avoir';
      default: return type;
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return 'Client inconnu';

    if (client.type === 'pro') {
      const legalForm = client.legalForm ? `${client.legalForm} ` : '';
      return `${legalForm}${client.companyName || 'Sans nom'}`;
    }
    const civility = client.civility ? `${client.civility} ` : '';
    return `${civility}${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sans nom';
  };

  const getDocumentOptions = () => {
    const docs = formData.documentType === 'quote' ? quotes :
                 formData.documentType === 'invoice' ? invoices : credits;

    if (!documentSearch) return docs;

    return docs.filter((doc: any) => {
      const number = doc.number || '';
      const clientName = getClientName(doc.clientId);

      return number.toLowerCase().includes(documentSearch.toLowerCase()) ||
             clientName.toLowerCase().includes(documentSearch.toLowerCase());
    });
  };

  const getFilteredClients = () => {
    if (!clientSearch) return clients;
    return clients.filter(c => {
      const name = getClientName(c.id).toLowerCase();
      const email = (c.email || '').toLowerCase();
      return name.includes(clientSearch.toLowerCase()) ||
             email.includes(clientSearch.toLowerCase());
    });
  };

  const addRecipientFromClient = (contact: any) => {
    const newRecipient: Recipient = {
      name: contact.name,
      email: contact.email,
      role: contact.role || undefined,
    };

    if (!formData.recipients.find(r => r.email === newRecipient.email)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient],
      }));
    }
  };

  const removeRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r.email !== email),
    }));
  };

  const selectClient = (client: any) => {
    setSelectedClient(client);
    setShowClientSelector(false);

    const contacts = [];
    const clientName = getClientName(client.id);

    if (client.email) {
      contacts.push({
        name: client.contactName || clientName,
        email: client.email,
        role: 'Principal',
      });
    }

    if (client.emails && Array.isArray(client.emails)) {
      client.emails.forEach((emailObj: any) => {
        if (emailObj.email && !contacts.find(c => c.email === emailObj.email)) {
          contacts.push({
            name: clientName,
            email: emailObj.email,
            role: emailObj.category || 'Contact',
          });
        }
      });
    }

    if (contacts.length > 0) {
      setFormData(prev => ({
        ...prev,
        recipients: contacts,
      }));
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Envoi de Documents</h1>
          <p className="text-gray-600 mt-1">Envoyez vos devis, factures et avoirs par email et suivez leur consultation</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          Envoyer un document
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destinataire(s)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Envoyé le
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consultation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shares.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Aucun document envoyé
                </td>
              </tr>
            ) : (
              shares.map((share) => (
                <tr key={share.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getDocumentTypeLabel(share.documentType)}
                        </div>
                        <div className="text-sm text-gray-500">{share.documentNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={share.recipients}>
                      {share.recipients}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {share.sentAt.toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    {share.views && share.views.length > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {share.viewCount} vue(s)
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5 ml-6">
                          {share.views.slice(0, 3).map((view, idx) => (
                            <div key={idx}>
                              <span className="font-medium">{view.recipientEmail}</span>
                              {view.recipientName && <span> ({view.recipientName})</span>}
                              <span className="text-gray-500"> - {view.viewedAt.toLocaleDateString('fr-FR')} à {view.viewedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))}
                          {share.views.length > 3 && (
                            <div className="text-gray-500 italic">
                              +{share.views.length - 3} autre(s) vue(s)
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Non consulté</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openSharePreview(share.shareToken)}
                        className="text-green-600 hover:text-green-800 flex items-center gap-1"
                        title="Prévisualiser"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                      <button
                        onClick={() => copyShareLink(share.shareToken)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        title="Copier le lien"
                      >
                        {copiedToken === share.shareToken ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copié
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Lien
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setFormData({
              documentType: 'quote',
              documentId: '',
              recipients: [],
              subject: '',
              message: '',
            });
            setSelectedClient(null);
            setClientSearch('');
            setDocumentSearch('');
          }}
          title="Envoyer un document"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type de document</label>
              <select
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value as any, documentId: '' }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="quote">Devis</option>
                <option value="invoice">Facture</option>
                <option value="credit">Avoir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro ou nom client..."
                  value={documentSearch}
                  onChange={(e) => setDocumentSearch(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-2"
                />
              </div>
              <select
                value={formData.documentId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setFormData(prev => ({ ...prev, documentId: selectedId }));
                  const doc = getDocumentOptions().find((d: any) => d.id === selectedId);
                  if (doc) {
                    const client = clients.find(c => c.id === doc.clientId);
                    if (client) {
                      selectClient(client);
                    }
                  }
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un document</option>
                {getDocumentOptions().map((doc: any) => {
                  const number = doc.number || 'Brouillon';
                  const clientName = getClientName(doc.clientId);
                  return (
                    <option key={doc.id} value={doc.id}>
                      {number} - {clientName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Destinataires ({formData.recipients.length})
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClientSelector(!showClientSelector)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Choisir un client
                  </button>
                </div>
              </div>

              {showClientSelector && (
                <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un client..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {getFilteredClients().map((client: any) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => selectClient(client)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{getClientName(client.id)}</div>
                          <div className="text-gray-500 text-xs">{client.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nom du destinataire"
                    id="manual-recipient-name"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    id="manual-recipient-email"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('manual-recipient-name') as HTMLInputElement;
                      const emailInput = document.getElementById('manual-recipient-email') as HTMLInputElement;

                      if (nameInput.value && emailInput.value) {
                        const newRecipient: Recipient = {
                          name: nameInput.value,
                          email: emailInput.value,
                          role: 'Manuel'
                        };

                        if (!formData.recipients.find(r => r.email === newRecipient.email)) {
                          setFormData(prev => ({
                            ...prev,
                            recipients: [...prev.recipients, newRecipient]
                          }));
                          nameInput.value = '';
                          emailInput.value = '';
                        }
                      }
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{recipient.name}</div>
                      <div className="text-xs text-gray-600">
                        {recipient.email}
                        {recipient.role && <span className="ml-2 text-blue-600">({recipient.role})</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRecipient(recipient.email)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {selectedClient && selectedClient.emails && Array.isArray(selectedClient.emails) && selectedClient.emails.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-2">Autres emails disponibles:</p>
                  <div className="space-y-1">
                    {selectedClient.emails
                      .filter((emailObj: any) => emailObj.email && !formData.recipients.find(r => r.email === emailObj.email))
                      .map((emailObj: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => addRecipientFromClient({
                            name: getClientName(selectedClient.id),
                            email: emailObj.email,
                            role: emailObj.category || 'Contact'
                          })}
                          className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                          <Plus className="w-3 h-3 text-gray-400" />
                          <span>{emailObj.email} - {emailObj.category}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sujet</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: Votre devis pour..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Votre message personnalisé..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    documentType: 'quote',
                    documentId: '',
                    recipients: [],
                    subject: '',
                    message: '',
                  });
                  setSelectedClient(null);
                  setClientSearch('');
                  setDocumentSearch('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Envoyer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
