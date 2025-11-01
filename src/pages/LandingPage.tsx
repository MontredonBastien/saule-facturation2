import React, { useState } from 'react';
import {
  Check, Zap, Shield, Users, TrendingUp, FileText,
  Mail, Cloud, Lock, BarChart, ArrowRight, Menu, X
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const features = [
    {
      icon: FileText,
      title: 'Facturation Complète',
      description: 'Devis, factures, avoirs et acomptes. Tout ce dont vous avez besoin pour gérer votre facturation.'
    },
    {
      icon: Shield,
      title: 'Conforme Légalement',
      description: 'Respecte la réglementation française : Factur-X, hash SHA-256, traçabilité complète.'
    },
    {
      icon: Users,
      title: 'Multi-utilisateurs',
      description: 'Collaborez avec votre équipe. Permissions granulaires par utilisateur.'
    },
    {
      icon: Cloud,
      title: 'Cloud & Sécurisé',
      description: 'Vos données sont sauvegardées automatiquement et protégées.'
    },
    {
      icon: Mail,
      title: 'Envoi Automatique',
      description: 'Envoyez vos documents par email avec suivi des ouvertures.'
    },
    {
      icon: BarChart,
      title: 'Tableaux de Bord',
      description: 'Analysez votre activité avec des statistiques détaillées et en temps réel.'
    }
  ];

  const plans = [
    {
      name: 'Gratuit',
      code: 'free',
      monthly: 0,
      yearly: 0,
      description: 'Parfait pour démarrer',
      features: [
        'Devis et factures illimités',
        '1 utilisateur',
        '10 factures/mois',
        'Support email',
        'Stockage 100 MB'
      ],
      cta: 'Commencer gratuitement',
      highlighted: false
    },
    {
      name: 'Pro',
      code: 'pro',
      monthly: 10,
      yearly: 100,
      description: 'Pour les professionnels',
      features: [
        'Tout du plan Gratuit',
        '3 utilisateurs',
        'Factures illimitées',
        'Facturation électronique',
        'Multi-contacts',
        'Stockage 500 MB',
        'Support prioritaire'
      ],
      cta: 'Essayer 14 jours gratuits',
      highlighted: true
    },
    {
      name: 'Business',
      code: 'business',
      monthly: 15,
      yearly: 150,
      description: 'Pour les équipes',
      features: [
        'Tout du plan Pro',
        '10 utilisateurs',
        'Factures illimitées',
        'Stockage 2 GB',
        'API accès',
        'Support dédié',
        'Onboarding personnalisé',
        'SLA garanti'
      ],
      cta: 'Essayer 14 jours gratuits',
      highlighted: false
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Consultante indépendante',
      content: 'Cette application a transformé ma gestion administrative. Je gagne 5 heures par semaine !',
      avatar: 'M'
    },
    {
      name: 'Thomas Laurent',
      role: 'CEO, StartupTech',
      content: 'Enfin une solution française qui respecte les normes légales. Interface intuitive et rapide.',
      avatar: 'T'
    },
    {
      name: 'Sophie Martin',
      role: 'Comptable',
      content: 'La conformité Factur-X et le système de hash nous ont fait gagner un temps précieux lors de l\'audit.',
      avatar: 'S'
    }
  ];

  const faqs = [
    {
      question: 'Comment fonctionne la période d\'essai ?',
      answer: 'Tous les plans payants incluent 14 jours d\'essai gratuit, sans carte bancaire requise. Vous pouvez annuler à tout moment.'
    },
    {
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Oui, absolument. Nous utilisons un chiffrement de niveau bancaire, des backups quotidiens automatiques et sommes conformes RGPD.'
    },
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements sont proratisés automatiquement.'
    },
    {
      question: 'Est-ce conforme à la loi française ?',
      answer: 'Oui, notre solution respecte toutes les exigences légales : Factur-X, hash SHA-256 anti-fraude TVA, traçabilité complète des documents.'
    },
    {
      question: 'Quelle est votre politique de remboursement ?',
      answer: 'Nous offrons une garantie satisfait ou remboursé de 30 jours sur tous les plans payants, sans question posée.'
    },
    {
      question: 'Proposez-vous du support ?',
      answer: 'Oui ! Support email pour tous, support prioritaire pour les plans Pro, et support dédié avec SLA pour les plans Entreprise.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Saule Facturation</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition">Tarifs</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition">Témoignages</a>
              <a href="#faq" className="text-gray-700 hover:text-blue-600 transition">FAQ</a>
              <a href="/app" className="text-blue-600 hover:text-blue-700 transition">Connexion</a>
              <a href="/app" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Commencer gratuitement
              </a>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-blue-600">Fonctionnalités</a>
              <a href="#pricing" className="block text-gray-700 hover:text-blue-600">Tarifs</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-blue-600">Témoignages</a>
              <a href="#faq" className="block text-gray-700 hover:text-blue-600">FAQ</a>
              <a href="/app" className="block text-blue-600 hover:text-blue-700">Connexion</a>
              <a href="/app" className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
                Commencer gratuitement
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Facturez en toute
            <span className="text-blue-600"> simplicité</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La solution de facturation française conforme, intuitive et puissante.
            Gérez vos devis, factures et avoirs en quelques clics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/app"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition inline-flex items-center justify-center"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="#pricing"
              className="bg-white border-2 border-gray-300 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-600 transition"
            >
              Voir les tarifs
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Essai gratuit de 14 jours • Sans carte bancaire • Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              Une solution complète pour gérer votre facturation professionnelle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choisissez le plan qui correspond à vos besoins
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
                <span className="ml-2 text-xs text-green-600 font-semibold">-17%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4 scale-105'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.highlighted ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${
                  plan.highlighted ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold">
                    {billingCycle === 'monthly' ? plan.monthly : Math.round(plan.yearly / 12)}€
                  </span>
                  <span className={`text-lg ${
                    plan.highlighted ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    /mois
                  </span>
                  {billingCycle === 'yearly' && plan.yearly > 0 && (
                    <p className={`text-sm mt-2 ${
                      plan.highlighted ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      Facturé {plan.yearly}€/an
                    </p>
                  )}
                </div>

                <a
                  href="/app"
                  className={`block w-full py-3 px-6 rounded-lg font-semibold text-center mb-6 transition ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </a>

                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${
                        plan.highlighted ? 'text-blue-200' : 'text-green-500'
                      }`} />
                      <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez ce que nos clients disent de nous
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur Saule Facturation
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à simplifier votre facturation ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des centaines d'entreprises qui facturent en toute sérénité
          </p>
          <a
            href="/app"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
          >
            Commencer gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
          <p className="mt-4 text-sm text-blue-100">
            14 jours d'essai gratuit • Sans engagement
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-white">Saule Facturation</span>
              </div>
              <p className="text-sm">
                La solution de facturation française pour les professionnels.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Tarifs</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Témoignages</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/legal/terms" className="hover:text-white transition">CGU</a></li>
                <li><a href="/legal/privacy" className="hover:text-white transition">Confidentialité</a></li>
                <li><a href="/legal/cookies" className="hover:text-white transition">Cookies</a></li>
                <li><a href="/legal/mentions" className="hover:text-white transition">Mentions légales</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/docs" className="hover:text-white transition">Documentation</a></li>
                <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="/status" className="hover:text-white transition">Statut</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Saule Facturation. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
