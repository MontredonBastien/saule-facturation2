import React, { useState, useEffect } from 'react';
import { Check, CreditCard, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_quotes: number;
  max_invoices: number;
  max_credits: number;
  max_documents_per_month: number;
  max_storage_mb: number;
  has_email_support: boolean;
  has_electronic_invoicing: boolean;
  features: string[];
}

interface PricingPageProps {
  companyId?: string;
  currentPlanCode?: string;
  onSelectPlan?: (planCode: string, billingCycle: 'monthly' | 'yearly') => void;
}

export default function PricingPage({ companyId, currentPlanCode, onSelectPlan }: PricingPageProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly');

      if (error) throw error;

      const filteredPlans = (data || []).filter(p =>
        p.name === 'free' || p.name === 'starter' || p.name === 'business'
      );

      setPlans(filteredPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (plan: Plan) => {
    const price = billingCycle === 'monthly' ? plan.price_monthly : Math.round(plan.price_yearly / 12);
    return price;
  };

  const handleSelectPlan = (planName: string) => {
    if (onSelectPlan) {
      onSelectPlan(planName, billingCycle);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choisissez votre plan
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sélectionnez le plan qui correspond à vos besoins
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

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const isCurrentPlan = plan.name === currentPlanCode;
          const isPro = plan.name === 'starter';

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 ${
                isPro
                  ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4 scale-105'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {isPro && (
                <div className="text-center mb-4">
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                    ⭐ POPULAIRE
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${
                  isPro ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.display_name}
                </h3>
                {isCurrentPlan && (
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    isPro ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    Plan actuel
                  </span>
                )}
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold">
                  {formatPrice(plan)}€
                </span>
                <span className={`text-lg ${
                  isPro ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  /mois
                </span>
                {billingCycle === 'yearly' && plan.price_yearly > 0 && (
                  <p className={`text-sm mt-2 ${
                    isPro ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    Facturé {plan.price_yearly}€/an
                  </p>
                )}
              </div>

              <button
                onClick={() => handleSelectPlan(plan.name)}
                disabled={isCurrentPlan}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-center mb-6 transition ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isPro
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <CreditCard className="inline h-5 w-5 mr-2" />
                {isCurrentPlan ? 'Plan actuel' : plan.price_monthly === 0 ? 'Commencer gratuitement' : 'Souscrire'}
              </button>

              <div className="space-y-2 mb-6">
                <p className={`text-sm font-semibold ${
                  isPro ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  Limites :
                </p>
                <ul className={`text-sm space-y-2 ${
                  isPro ? 'text-blue-50' : 'text-gray-600'
                }`}>
                  <li>
                    {plan.max_users === -1 ? 'Utilisateurs illimités' : `${plan.max_users} utilisateur${plan.max_users > 1 ? 's' : ''}`}
                  </li>
                  <li>
                    {plan.max_quotes === -1 ? 'Devis illimités' : `${plan.max_quotes} devis max`}
                  </li>
                  <li>
                    {plan.max_invoices === -1 ? 'Factures illimitées' : `${plan.max_invoices} factures max`}
                  </li>
                  <li>
                    {plan.max_credits === -1 ? 'Avoirs illimités' : `${plan.max_credits} avoirs max`}
                  </li>
                </ul>
              </div>

              <div className={`pt-6 border-t ${
                isPro ? 'border-blue-500' : 'border-gray-200'
              }`}>
                <p className={`text-sm font-semibold mb-3 ${
                  isPro ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  Fonctionnalités :
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${
                        isPro ? 'text-blue-200' : 'text-green-500'
                      }`} />
                      <span className={isPro ? 'text-blue-50' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Besoin d'un plan sur mesure ?
        </h2>
        <p className="text-gray-600 mb-6">
          Contactez notre équipe commerciale pour obtenir une offre personnalisée adaptée à vos besoins spécifiques.
        </p>
        <a
          href="mailto:sales@facturepro.fr"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Contacter les ventes
        </a>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-3xl font-bold text-blue-600 mb-2">14 jours</div>
          <p className="text-gray-600">Essai gratuit sans engagement</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
          <p className="text-gray-600">Support disponible</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
          <p className="text-gray-600">Disponibilité garantie</p>
        </div>
      </div>
    </div>
  );
}
