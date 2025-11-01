import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">FacturePro</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </a>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600 mb-8">Dernière mise à jour : 5 octobre 2025</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              La protection de vos données personnelles est une priorité pour FacturePro. Cette politique
              de confidentialité explique comment nous collectons, utilisons, protégeons et partageons vos
              informations conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Responsable du traitement</h2>
            <p className="text-gray-700 mb-4">
              Le responsable du traitement des données est :<br />
              <strong>FacturePro</strong><br />
              [Votre adresse complète]<br />
              Email : <a href="mailto:privacy@facturepro.fr" className="text-blue-600 hover:underline">privacy@facturepro.fr</a>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Données collectées</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Données d'identification</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Raison sociale de l'entreprise</li>
              <li>Numéro SIRET/SIREN</li>
              <li>Adresse professionnelle</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Données de connexion</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Adresse IP</li>
              <li>Type de navigateur</li>
              <li>Système d'exploitation</li>
              <li>Pages visitées</li>
              <li>Date et heure de connexion</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.3 Données de facturation</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Informations de paiement (via Stripe, non stockées sur nos serveurs)</li>
              <li>Historique des transactions</li>
              <li>Adresse de facturation</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.4 Données d'utilisation</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Devis, factures et avoirs créés</li>
              <li>Base de données clients et articles</li>
              <li>Documents et fichiers uploadés</li>
              <li>Paramètres et préférences</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Finalités du traitement</h2>
            <p className="text-gray-700 mb-4">
              Nous collectons et traitons vos données pour :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Fourniture du service</strong> : Permettre l'accès et l'utilisation de la plateforme</li>
              <li><strong>Gestion des comptes</strong> : Créer et gérer votre compte utilisateur</li>
              <li><strong>Facturation</strong> : Traiter les paiements et générer les factures</li>
              <li><strong>Support client</strong> : Répondre à vos demandes d'assistance</li>
              <li><strong>Amélioration du service</strong> : Analyser l'utilisation pour améliorer notre plateforme</li>
              <li><strong>Communication</strong> : Vous envoyer des notifications importantes et des newsletters (avec consentement)</li>
              <li><strong>Sécurité</strong> : Détecter et prévenir les fraudes et abus</li>
              <li><strong>Conformité légale</strong> : Respecter nos obligations légales et fiscales</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Base légale du traitement</h2>
            <p className="text-gray-700 mb-4">
              Nos traitements de données reposent sur :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Exécution du contrat</strong> : Fourniture du service conformément aux CGU</li>
              <li><strong>Obligation légale</strong> : Conservation des factures, déclarations fiscales</li>
              <li><strong>Intérêt légitime</strong> : Amélioration du service, sécurité, prévention de la fraude</li>
              <li><strong>Consentement</strong> : Communications marketing (révocable à tout moment)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Durée de conservation</h2>
            <p className="text-gray-700 mb-4">
              Nous conservons vos données pour les durées suivantes :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Données de compte actif</strong> : Pendant toute la durée de votre abonnement</li>
              <li><strong>Données de facturation</strong> : 10 ans (obligation légale comptable)</li>
              <li><strong>Données de connexion</strong> : 12 mois</li>
              <li><strong>Compte fermé</strong> : 30 jours pour permettre l'export, puis suppression définitive</li>
              <li><strong>Marketing</strong> : 3 ans à compter du dernier contact ou jusqu'au retrait du consentement</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Partage des données</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.1 Sous-traitants</h3>
            <p className="text-gray-700 mb-4">
              Nous partageons vos données avec des prestataires de confiance :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Supabase</strong> : Hébergement de la base de données (UE)</li>
              <li><strong>Stripe</strong> : Traitement des paiements (conforme PCI-DSS)</li>
              <li><strong>Services d'emailing</strong> : Envoi de documents et notifications</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.2 Obligations légales</h3>
            <p className="text-gray-700 mb-4">
              Nous pouvons divulguer vos données si requis par la loi, une décision judiciaire ou
              une autorité administrative compétente.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.3 Pas de vente</h3>
            <p className="text-gray-700 mb-4">
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Transferts internationaux</h2>
            <p className="text-gray-700 mb-4">
              Vos données sont hébergées au sein de l'Union Européenne. Certains sous-traitants
              peuvent être situés hors UE (ex: Stripe aux États-Unis) mais sont conformes aux
              clauses contractuelles types de la Commission Européenne ou au Privacy Shield.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Sécurité des données</h2>
            <p className="text-gray-700 mb-4">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Chiffrement des données sensibles en base de données</li>
              <li>Authentification sécurisée avec hashage des mots de passe</li>
              <li>Sauvegardes quotidiennes automatiques chiffrées</li>
              <li>Contrôle d'accès strict et journalisation</li>
              <li>Surveillance continue et détection des intrusions</li>
              <li>Tests de sécurité réguliers</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Vos droits RGPD</h2>
            <p className="text-gray-700 mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.1 Droit d'accès</h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez obtenir une copie de toutes vos données personnelles que nous détenons.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.2 Droit de rectification</h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez corriger vos données inexactes ou incomplètes directement depuis votre compte
              ou en nous contactant.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.3 Droit à l'effacement</h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez demander la suppression de vos données, sauf si nous avons une obligation
              légale de les conserver (ex: factures).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.4 Droit à la limitation</h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez demander la limitation du traitement de vos données dans certaines circonstances.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.5 Droit à la portabilité</h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez recevoir vos données dans un format structuré et lisible par machine, ou
              demander leur transfert direct à un autre responsable de traitement.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.6 Droit d'opposition</h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez vous opposer au traitement de vos données à des fins de marketing direct
              ou basé sur notre intérêt légitime.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.7 Exercice de vos droits</h3>
            <p className="text-gray-700 mb-4">
              Pour exercer vos droits, contactez-nous à :
              <a href="mailto:privacy@facturepro.fr" className="text-blue-600 hover:underline ml-1">privacy@facturepro.fr</a>
              <br />
              Nous répondrons dans un délai maximum d'1 mois. Une pièce d'identité peut être demandée
              pour vérifier votre identité.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.8 Réclamation</h3>
            <p className="text-gray-700 mb-4">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation
              auprès de la CNIL :<br />
              Commission Nationale de l'Informatique et des Libertés<br />
              3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07<br />
              Tél : 01 53 73 22 22<br />
              <a href="https://www.cnil.fr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Cookies</h2>
            <p className="text-gray-700 mb-4">
              Nous utilisons des cookies essentiels pour le fonctionnement du service (session,
              authentification). Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.
              Consultez notre politique de cookies pour plus de détails.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Mineurs</h2>
            <p className="text-gray-700 mb-4">
              Notre service n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons
              pas sciemment de données concernant des mineurs.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Modifications</h2>
            <p className="text-gray-700 mb-4">
              Nous pouvons modifier cette politique de confidentialité. Les changements significatifs
              vous seront notifiés par email ou via une notification dans l'application. La date de
              dernière mise à jour est indiquée en haut de ce document.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Contact</h2>
            <p className="text-gray-700 mb-4">
              Pour toute question sur cette politique de confidentialité ou vos données personnelles :
            </p>
            <p className="text-gray-700 mb-4">
              Email : <a href="mailto:privacy@facturepro.fr" className="text-blue-600 hover:underline">privacy@facturepro.fr</a><br />
              Courrier : FacturePro, [Votre adresse complète]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
