import React, { useState } from 'react';
import { ArrowLeft, FileText, Search, Book, HelpCircle, Video, Download, Mail, Users, Settings, BarChart, CreditCard } from 'lucide-react';

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('getting-started');

  const categories = [
    { id: 'getting-started', name: 'Démarrage', icon: Book },
    { id: 'invoicing', name: 'Facturation', icon: FileText },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'settings', name: 'Paramètres', icon: Settings },
    { id: 'analytics', name: 'Statistiques', icon: BarChart },
    { id: 'billing', name: 'Abonnement', icon: CreditCard }
  ];

  const documentation = {
    'getting-started': [
      {
        title: 'Créer votre premier devis',
        content: `
          <h3>Étape 1 : Accéder aux devis</h3>
          <p>Cliquez sur "Devis" dans le menu de gauche.</p>

          <h3>Étape 2 : Nouveau devis</h3>
          <p>Cliquez sur le bouton "Nouveau devis" en haut à droite.</p>

          <h3>Étape 3 : Remplir les informations</h3>
          <ul>
            <li><strong>Client</strong> : Sélectionnez un client existant ou créez-en un nouveau</li>
            <li><strong>Date</strong> : La date du jour est pré-remplie</li>
            <li><strong>Validité</strong> : Indiquez la durée de validité du devis (30 jours par défaut)</li>
          </ul>

          <h3>Étape 4 : Ajouter des articles</h3>
          <p>Cliquez sur "Ajouter une ligne" et sélectionnez vos articles. Vous pouvez modifier les quantités et prix.</p>

          <h3>Étape 5 : Personnaliser</h3>
          <p>Ajoutez des notes, conditions de paiement et autres informations personnalisées.</p>

          <h3>Étape 6 : Enregistrer et envoyer</h3>
          <p>Cliquez sur "Enregistrer" puis "Envoyer par email" pour transmettre le devis à votre client.</p>
        `
      },
      {
        title: 'Configurer votre entreprise',
        content: `
          <h3>Informations obligatoires</h3>
          <p>Allez dans Paramètres > Entreprise et remplissez :</p>
          <ul>
            <li>Raison sociale</li>
            <li>SIRET / SIREN</li>
            <li>Adresse complète</li>
            <li>Email et téléphone</li>
            <li>Logo (optionnel mais recommandé)</li>
          </ul>

          <h3>Informations bancaires</h3>
          <p>Pour faciliter les paiements, ajoutez :</p>
          <ul>
            <li>IBAN</li>
            <li>BIC</li>
            <li>Nom de la banque</li>
          </ul>

          <h3>Numérotation automatique</h3>
          <p>Configurez les préfixes et compteurs pour vos devis, factures et avoirs dans Paramètres > Numérotation.</p>
        `
      },
      {
        title: 'Inviter des utilisateurs',
        content: `
          <h3>Plans multi-utilisateurs</h3>
          <p>La collaboration est disponible sur les plans Pro (5 utilisateurs) et Entreprise (illimité).</p>

          <h3>Inviter un utilisateur</h3>
          <ol>
            <li>Allez dans Paramètres > Utilisateurs</li>
            <li>Cliquez sur "Inviter un utilisateur"</li>
            <li>Entrez l'email de la personne</li>
            <li>Définissez ses permissions</li>
            <li>Envoyez l'invitation</li>
          </ol>

          <h3>Permissions disponibles</h3>
          <ul>
            <li><strong>Administrateur</strong> : Accès complet</li>
            <li><strong>Gestion</strong> : Création et modification de documents</li>
            <li><strong>Lecture seule</strong> : Consultation uniquement</li>
            <li><strong>Comptabilité</strong> : Accès aux factures et paiements</li>
          </ul>
        `
      }
    ],
    'invoicing': [
      {
        title: 'Transformer un devis en facture',
        content: `
          <h3>Méthode rapide</h3>
          <ol>
            <li>Ouvrez le devis accepté</li>
            <li>Cliquez sur "Transformer en facture"</li>
            <li>Vérifiez les informations</li>
            <li>Enregistrez</li>
          </ol>

          <p>La facture reprend automatiquement toutes les lignes du devis.</p>

          <h3>Numérotation automatique</h3>
          <p>Le numéro de facture est généré automatiquement selon votre configuration.</p>
        `
      },
      {
        title: 'Gérer les acomptes',
        content: `
          <h3>Créer un acompte</h3>
          <ol>
            <li>Ouvrez la facture concernée</li>
            <li>Cliquez sur "Ajouter un acompte"</li>
            <li>Indiquez le montant ou pourcentage</li>
            <li>Validez</li>
          </ol>

          <h3>Facture d'acompte</h3>
          <p>Une facture d'acompte est générée automatiquement avec le préfixe configuré.</p>

          <h3>Facture de solde</h3>
          <p>Lors de la facture finale, les acomptes sont automatiquement déduits du total.</p>
        `
      },
      {
        title: 'Créer un avoir',
        content: `
          <h3>Depuis une facture</h3>
          <ol>
            <li>Ouvrez la facture à créditer</li>
            <li>Cliquez sur "Créer un avoir"</li>
            <li>Sélectionnez les lignes à créditer</li>
            <li>Modifiez les quantités si besoin</li>
            <li>Enregistrez</li>
          </ol>

          <h3>Avoir partiel ou total</h3>
          <p>Vous pouvez créer un avoir pour la totalité de la facture ou seulement certains articles.</p>

          <h3>Conformité</h3>
          <p>L'avoir fait référence à la facture d'origine et est conforme aux exigences légales françaises.</p>
        `
      }
    ],
    'clients': [
      {
        title: 'Gérer les contacts multiples',
        content: `
          <h3>Ajouter plusieurs contacts</h3>
          <p>Chaque client peut avoir plusieurs contacts (comptable, acheteur, décideur...).</p>

          <ol>
            <li>Ouvrez la fiche client</li>
            <li>Section "Contacts"</li>
            <li>Cliquez sur "Ajouter un contact"</li>
            <li>Remplissez les informations</li>
            <li>Définissez le rôle</li>
          </ol>

          <h3>Contact principal</h3>
          <p>Marquez un contact comme principal pour l'utiliser par défaut dans les documents.</p>
        `
      },
      {
        title: 'Importer des clients',
        content: `
          <h3>Format CSV</h3>
          <p>Préparez un fichier CSV avec les colonnes :</p>
          <ul>
            <li>Nom ou Raison sociale</li>
            <li>Email</li>
            <li>Téléphone</li>
            <li>Adresse</li>
            <li>SIRET (pour les entreprises)</li>
          </ul>

          <h3>Import</h3>
          <ol>
            <li>Allez dans Clients</li>
            <li>Cliquez sur "Importer"</li>
            <li>Sélectionnez votre fichier CSV</li>
            <li>Vérifiez la correspondance des colonnes</li>
            <li>Lancez l'import</li>
          </ol>
        `
      }
    ],
    'settings': [
      {
        title: 'Personnaliser vos documents',
        content: `
          <h3>Logo et couleurs</h3>
          <p>Dans Paramètres > Apparence :</p>
          <ul>
            <li>Uploadez votre logo (format PNG recommandé)</li>
            <li>Choisissez votre couleur principale</li>
            <li>Configurez les polices</li>
          </ul>

          <h3>Conditions de paiement</h3>
          <p>Définissez vos conditions par défaut qui apparaîtront sur tous les documents.</p>

          <h3>Mentions légales</h3>
          <p>Ajoutez vos mentions légales personnalisées (CGV, RCS, etc.).</p>
        `
      },
      {
        title: 'Configurer les emails',
        content: `
          <h3>Expéditeur</h3>
          <p>Dans Paramètres > Emails, configurez :</p>
          <ul>
            <li>Nom de l'expéditeur</li>
            <li>Email de réponse</li>
            <li>Signature automatique</li>
          </ul>

          <h3>Modèles d'emails</h3>
          <p>Personnalisez les emails pour :</p>
          <ul>
            <li>Envoi de devis</li>
            <li>Envoi de facture</li>
            <li>Relances de paiement</li>
            <li>Envoi d'avoir</li>
          </ul>

          <h3>Variables disponibles</h3>
          <p>Utilisez des variables dynamiques : {'{nom_client}'}, {'{numero_document}'}, {'{montant_total}'}</p>
        `
      }
    ],
    'analytics': [
      {
        title: 'Comprendre vos statistiques',
        content: `
          <h3>Tableau de bord</h3>
          <p>Le tableau de bord affiche :</p>
          <ul>
            <li>Chiffre d'affaires du mois</li>
            <li>Factures en attente de paiement</li>
            <li>Devis en attente</li>
            <li>Évolution mensuelle</li>
          </ul>

          <h3>Graphiques</h3>
          <ul>
            <li><strong>CA mensuel</strong> : Évolution sur 12 mois</li>
            <li><strong>Top clients</strong> : Classement par CA</li>
            <li><strong>Taux de conversion</strong> : Devis → Factures</li>
            <li><strong>Délais de paiement</strong> : Analyse des retards</li>
          </ul>
        `
      }
    ],
    'billing': [
      {
        title: 'Gérer votre abonnement',
        content: `
          <h3>Changer de plan</h3>
          <ol>
            <li>Allez dans Paramètres > Abonnement</li>
            <li>Cliquez sur "Changer de plan"</li>
            <li>Sélectionnez le nouveau plan</li>
            <li>Confirmez</li>
          </ol>

          <h3>Upgrade</h3>
          <p>En cas d'upgrade, vous êtes facturé au prorata. Les nouvelles limites sont actives immédiatement.</p>

          <h3>Downgrade</h3>
          <p>En cas de downgrade, le changement prend effet à la fin de la période en cours.</p>

          <h3>Annulation</h3>
          <p>Vous pouvez annuler à tout moment. Votre accès reste actif jusqu'à la fin de la période payée.</p>
        `
      },
      {
        title: 'Facturation et paiements',
        content: `
          <h3>Factures d'abonnement</h3>
          <p>Vos factures d'abonnement sont disponibles dans Paramètres > Facturation.</p>

          <h3>Modifier le moyen de paiement</h3>
          <ol>
            <li>Paramètres > Paiement</li>
            <li>Cliquez sur "Modifier"</li>
            <li>Ajoutez la nouvelle carte</li>
            <li>Définissez-la par défaut</li>
          </ol>

          <h3>Paiement échoué</h3>
          <p>En cas d'échec de paiement :</p>
          <ul>
            <li>Vous recevez un email</li>
            <li>Vous avez 7 jours pour régulariser</li>
            <li>Après 7 jours, le compte est suspendu</li>
            <li>Après 30 jours, le compte peut être supprimé</li>
          </ul>
        `
      }
    ]
  };

  const filteredDocs = documentation[selectedCategory as keyof typeof documentation].filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FacturePro</span>
            </div>
            <a href="/" className="text-gray-600 hover:text-gray-900">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Tout ce que vous devez savoir pour utiliser FacturePro
          </p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher dans la documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Catégories</h3>
              <nav className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {category.name}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Besoin d'aide ?</h3>
                <div className="space-y-3">
                  <a
                    href="/contact"
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contacter le support
                  </a>
                  <a
                    href="#videos"
                    className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Tutoriels vidéo
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredDocs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-gray-600">
                    Essayez avec d'autres mots-clés ou explorez les catégories
                  </p>
                </div>
              ) : (
                filteredDocs.map((doc, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {doc.title}
                    </h2>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: doc.content }}
                      style={{
                        lineHeight: '1.75'
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 bg-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Vous ne trouvez pas ce que vous cherchez ?
          </h2>
          <p className="text-blue-100 mb-6">
            Notre équipe support est là pour vous aider
          </p>
          <a
            href="/contact"
            className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <Mail className="h-5 w-5 mr-2" />
            Contacter le support
          </a>
        </div>
      </div>
    </div>
  );
}
