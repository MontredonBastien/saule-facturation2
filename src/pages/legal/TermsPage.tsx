import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-gray-600 mb-8">Dernière mise à jour : 5 octobre 2025</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Objet</h2>
            <p className="text-gray-700 mb-4">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme
              FacturePro, solution SaaS de gestion de facturation et de devis (ci-après "le Service").
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Acceptation des conditions</h2>
            <p className="text-gray-700 mb-4">
              L'accès et l'utilisation du Service impliquent l'acceptation pleine et entière des présentes CGU.
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Description du service</h2>
            <p className="text-gray-700 mb-4">
              FacturePro est une application web permettant de :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Créer et gérer des devis, factures et avoirs</li>
              <li>Gérer une base de données clients et articles</li>
              <li>Générer des documents conformes à la législation française</li>
              <li>Envoyer des documents par email avec suivi</li>
              <li>Collaborer avec plusieurs utilisateurs</li>
              <li>Accéder à des statistiques et tableaux de bord</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Inscription et compte utilisateur</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Création de compte</h3>
            <p className="text-gray-700 mb-4">
              Pour utiliser le Service, vous devez créer un compte en fournissant des informations exactes,
              complètes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Éligibilité</h3>
            <p className="text-gray-700 mb-4">
              Le Service est réservé aux personnes majeures ayant la capacité juridique de contracter.
              Les entreprises doivent être dûment enregistrées.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Plans et paiements</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Plans tarifaires</h3>
            <p className="text-gray-700 mb-4">
              Plusieurs plans sont proposés (Gratuit, Pro, Entreprise). Les caractéristiques et tarifs
              sont détaillés sur notre page de tarification.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Période d'essai</h3>
            <p className="text-gray-700 mb-4">
              Un essai gratuit de 14 jours est offert pour les plans payants. Aucune carte bancaire n'est
              requise pendant l'essai. À l'expiration, le compte bascule automatiquement en plan gratuit
              sauf souscription d'un plan payant.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Facturation</h3>
            <p className="text-gray-700 mb-4">
              Les paiements sont traités par Stripe de manière sécurisée. La facturation est automatique
              et récurrente (mensuelle ou annuelle selon le choix). Les prix sont en euros TTC.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.4 Remboursement</h3>
            <p className="text-gray-700 mb-4">
              Une garantie satisfait ou remboursé de 30 jours est applicable sur tous les plans payants.
              Au-delà de 30 jours, aucun remboursement ne sera effectué.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Utilisation du service</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 Usage autorisé</h3>
            <p className="text-gray-700 mb-4">
              Vous vous engagez à utiliser le Service uniquement à des fins légales et conformes aux
              présentes CGU. Vous ne devez pas :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Violer des lois ou réglementations applicables</li>
              <li>Porter atteinte aux droits de tiers</li>
              <li>Tenter de contourner les mesures de sécurité</li>
              <li>Utiliser le Service pour des activités frauduleuses</li>
              <li>Transmettre des virus ou codes malveillants</li>
              <li>Surcharger ou perturber les serveurs</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.2 Quotas et limites</h3>
            <p className="text-gray-700 mb-4">
              Chaque plan inclut des limites d'utilisation (nombre d'utilisateurs, de factures, stockage).
              Ces limites sont indiquées sur la page de tarification. Le dépassement peut entraîner une
              suspension temporaire ou un changement de plan obligatoire.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Données et confidentialité</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.1 Vos données</h3>
            <p className="text-gray-700 mb-4">
              Vous conservez tous les droits sur les données que vous saisissez dans le Service.
              Nous ne revendiquons aucun droit de propriété sur vos données.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.2 Protection des données</h3>
            <p className="text-gray-700 mb-4">
              Nous nous engageons à protéger vos données conformément au RGPD. Consultez notre
              Politique de Confidentialité pour plus de détails.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.3 Sauvegardes</h3>
            <p className="text-gray-700 mb-4">
              Des sauvegardes automatiques quotidiennes sont effectuées. Nous ne garantissons pas
              la récupération de données en cas de perte due à une utilisation inappropriée.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Propriété intellectuelle</h2>
            <p className="text-gray-700 mb-4">
              Le Service, son code source, son interface, ses logos et tous les éléments qui le composent
              sont protégés par les droits de propriété intellectuelle. Toute reproduction, représentation,
              modification ou exploitation non autorisée est interdite.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Disponibilité et support</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.1 Disponibilité</h3>
            <p className="text-gray-700 mb-4">
              Nous nous efforçons de maintenir le Service disponible 24h/24 et 7j/7. Toutefois, des
              interruptions peuvent survenir pour maintenance ou raisons techniques. Un SLA de 99,9%
              est garanti pour les plans Entreprise uniquement.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.2 Support</h3>
            <p className="text-gray-700 mb-4">
              Le support est fourni selon le plan souscrit : email pour le plan Gratuit, support
              prioritaire pour le plan Pro, et support dédié pour le plan Entreprise.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Résiliation</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.1 Par l'utilisateur</h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez résilier votre abonnement à tout moment depuis votre compte. La résiliation
              prend effet à la fin de la période de facturation en cours.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.2 Par FacturePro</h3>
            <p className="text-gray-700 mb-4">
              Nous nous réservons le droit de suspendre ou résilier votre compte en cas de violation
              des CGU, de non-paiement, ou d'utilisation frauduleuse.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.3 Export des données</h3>
            <p className="text-gray-700 mb-4">
              Vous disposez de 30 jours après résiliation pour exporter vos données. Passé ce délai,
              vos données seront supprimées définitivement.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Limitation de responsabilité</h2>
            <p className="text-gray-700 mb-4">
              Le Service est fourni "en l'état". Nous ne garantissons pas qu'il sera exempt d'erreurs
              ou ininterrompu. Notre responsabilité est limitée au montant des sommes payées au cours
              des 12 derniers mois.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Modifications des CGU</h2>
            <p className="text-gray-700 mb-4">
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications
              prennent effet dès leur publication. L'utilisation continue du Service vaut acceptation
              des nouvelles CGU.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Droit applicable et juridiction</h2>
            <p className="text-gray-700 mb-4">
              Les présentes CGU sont régies par le droit français. Tout litige relève de la compétence
              exclusive des tribunaux français.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. Contact</h2>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant ces CGU, vous pouvez nous contacter à :
            </p>
            <p className="text-gray-700 mb-4">
              Email : <a href="mailto:legal@facturepro.fr" className="text-blue-600 hover:underline">legal@facturepro.fr</a><br />
              Adresse : [Votre adresse complète]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
