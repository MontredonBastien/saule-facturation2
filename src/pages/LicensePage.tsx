import React, { useState } from 'react';
import { Check, Code, Zap, Shield, DollarSign, Users, TrendingUp, ArrowRight, FileText, Download, BookOpen, Headphones } from 'lucide-react';

export default function LicensePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Solo',
      price: { monthly: 97, yearly: 970 },
      description: 'Pour développeurs et freelances',
      features: [
        'Code source complet',
        '1 instance de déploiement',
        'Branding personnalisable',
        'Updates & bugfixes',
        'Support email 48h',
        'Documentation complète'
      ],
      restrictions: [
        'Usage personnel uniquement',
        'Pas de revente autorisée',
        'Mono-tenant'
      ],
      cta: 'Commencer',
      popular: false
    },
    {
      name: 'Business',
      price: { monthly: 297, yearly: 2970 },
      description: 'Pour agences et consultants',
      features: [
        'Tout du plan Solo',
        'Instances illimitées',
        'White label complet',
        'Revente autorisée',
        'Multi-tenant (50 clients max)',
        'Support prioritaire 24h',
        'Assistance déploiement 2h/mois',
        'Updates de features'
      ],
      restrictions: [
        'Max 50 entreprises par instance',
        'Logo "Powered by" requis'
      ],
      cta: 'Essayer 14 jours',
      popular: true
    },
    {
      name: 'Agency',
      price: { monthly: 697, yearly: 6970 },
      description: 'Pour grandes agences et SaaS builders',
      features: [
        'Tout du plan Business',
        '100% White label',
        'Clients illimités',
        'Support premium 12h',
        'Assistance technique illimitée',
        'Features en preview',
        'Onboarding personnalisé 4h',
        'Modifications custom code'
      ],
      restrictions: [
        'Pas de redistribution du code'
      ],
      cta: 'Contacter',
      popular: false
    },
    {
      name: 'Unlimited',
      price: { monthly: 1497, yearly: 14970 },
      description: 'Pour entreprises et fonds',
      features: [
        'Tout du plan Agency',
        'Licence perpétuelle',
        'Instances illimitées',
        'Support dédié (Slack)',
        'SLA 99.9%',
        'Code reviews',
        'Consulting 2h/mois',
        'Option achat définitif'
      ],
      restrictions: [],
      cta: 'Démo personnalisée',
      popular: false
    }
  ];

  const stats = [
    { value: '40K€', label: 'Économisés en dev' },
    { value: '1 heure', label: 'Pour démarrer' },
    { value: '100%', label: 'Conforme RGPD' },
    { value: '6-9 mois', label: 'De dev évités' }
  ];

  const roiExample = {
    licenseCost: 97,
    hosting: 25,
    domain: 1,
    total: 123,
    clientPrice: 29,
    breakEven: 5,
    profit10: 167,
    profit20: 457
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FacturePro</span>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full">
                White Label
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/#features" className="text-gray-700 hover:text-blue-600">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Tarifs</a>
              <a href="#documentation" className="text-gray-700 hover:text-blue-600">Docs</a>
              <a href="/contact" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Démo
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full mb-6">
            <Zap className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-blue-600">
              Lancez votre SaaS de facturation en 1 heure
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Le SaaS de facturation<br />
            <span className="text-blue-600">clé-en-main</span> pour développeurs
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Code source complet, documentation professionnelle, architecture scalable.
            Économisez 6 mois de développement et 40K€. Lancez votre business dès aujourd'hui.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="#pricing"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition inline-flex items-center justify-center"
            >
              Voir les licences
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="#demo"
              className="bg-white border-2 border-gray-300 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-600 transition"
            >
              Voir la démo
            </a>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir FacturePro White Label ?
            </h2>
            <p className="text-xl text-gray-600">
              La solution complète pour lancer votre SaaS sans développement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Code Production-Ready</h3>
              <p className="text-gray-600">
                Architecture moderne (React, TypeScript, Supabase). Tests, documentation, best practices.
                40K€ de développement déjà fait.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">100% Conforme</h3>
              <p className="text-gray-600">
                Factur-X, hash anti-fraude TVA, RGPD. Toute la conformité légale française incluse.
                Évitez les risques juridiques.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">ROI Immédiat</h3>
              <p className="text-gray-600">
                Rentable dès 5 clients. Lancez en 1 heure vs 6 mois. Revenue recurring dès le 1er mois.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Tenant Natif</h3>
              <p className="text-gray-600">
                Architecture SaaS complète. Gérez des centaines de clients. Isolation des données garantie.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Updates Incluses</h3>
              <p className="text-gray-600">
                Nouvelles features, bugfixes, améliorations. Vous bénéficiez de toutes les mises à jour.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Headphones className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Support Expert</h3>
              <p className="text-gray-600">
                Support technique réactif. Documentation complète. Communauté de licensees actifs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Calcul de Rentabilité
            </h2>
            <p className="text-xl text-gray-600">
              Exemple avec la License Solo (97€/mois)
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Vos Coûts Mensuels</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">License FacturePro</span>
                    <span className="font-semibold">{roiExample.licenseCost}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hébergement Supabase</span>
                    <span className="font-semibold">{roiExample.hosting}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom de domaine</span>
                    <span className="font-semibold">{roiExample.domain}€</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-xl">{roiExample.total}€/mois</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Vos Revenus Potentiels</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-2">
                    Si vous facturez {roiExample.clientPrice}€/mois par client :
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">5 clients</span>
                    <span className="font-semibold text-green-600">
                      {5 * roiExample.clientPrice}€ (✅ Rentable)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">10 clients</span>
                    <span className="font-semibold text-green-600">
                      {10 * roiExample.clientPrice}€ (Profit {roiExample.profit10}€)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">20 clients</span>
                    <span className="font-semibold text-green-600">
                      {20 * roiExample.clientPrice}€ (Profit {roiExample.profit20}€)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <p className="text-lg font-semibold text-blue-900 mb-2">
                🎯 Rentable dès {roiExample.breakEven} clients !
              </p>
              <p className="text-blue-700">
                Avec 20 clients, vous générez {roiExample.profit20}€/mois de profit net
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choisissez votre License
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Du solo developer à l'agence, trouvez le plan adapté
            </p>

            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md transition ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md transition ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Annuel
                <span className="ml-2 text-xs text-green-600 font-semibold">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-6 ${
                  plan.popular
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4 transform scale-105'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                      ⭐ POPULAIRE
                    </span>
                  </div>
                )}

                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {billingCycle === 'monthly' ? plan.price.monthly : Math.round(plan.price.yearly / 12)}€
                  </span>
                  <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>/mois</span>
                </div>

                <a
                  href="/contact"
                  className={`block w-full py-3 px-6 rounded-lg font-semibold text-center mb-6 transition ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </a>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start text-sm">
                      <Check className={`h-5 w-5 mr-2 flex-shrink-0 ${
                        plan.popular ? 'text-blue-200' : 'text-green-500'
                      }`} />
                      <span className={plan.popular ? 'text-blue-50' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.restrictions.length > 0 && (
                  <div className={`text-xs pt-4 border-t ${
                    plan.popular ? 'border-blue-400 text-blue-100' : 'border-gray-200 text-gray-500'
                  }`}>
                    <div className="font-semibold mb-2">Restrictions :</div>
                    {plan.restrictions.map((restriction, rIndex) => (
                      <div key={rIndex}>• {restriction}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à lancer votre SaaS ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez les développeurs qui économisent 6 mois de développement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              <Download className="mr-2 h-5 w-5" />
              Obtenir une démo
            </a>
            <a
              href="#documentation"
              className="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Voir la documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4">
            &copy; 2025 FacturePro White Label. Tous droits réservés.
          </p>
          <div className="space-x-6">
            <a href="/legal/terms" className="hover:text-white">CGU</a>
            <a href="/legal/privacy" className="hover:text-white">Confidentialité</a>
            <a href="/contact" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
