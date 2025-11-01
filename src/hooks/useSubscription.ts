import { useState, useEffect } from 'react';
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

interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_status: string;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  current_users_count: number;
  current_invoices_count: number;
  current_storage_mb: number;
  plan?: Plan;
}

export function useSubscription(companyId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotaWarnings, setQuotaWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (companyId) {
      loadSubscription();
    }
  }, [companyId]);

  const loadSubscription = async () => {
    if (!companyId) return;

    try {
      const { data: subData, error: subError } = await supabase
        .from('company_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('company_id', companyId)
        .maybeSingle();

      if (subError) throw subError;

      if (subData) {
        setSubscription(subData as any);
        if (subData.plan) {
          setPlan(subData.plan as any);
          checkQuotas(subData as any, subData.plan as any);
        }
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkQuotas = (sub: Subscription, planData: Plan) => {
    const warnings: string[] = [];

    if (planData.max_users > 0) {
      const usersPercent = (sub.current_users_count / planData.max_users) * 100;
      if (usersPercent >= 80) {
        warnings.push(`Vous avez utilisé ${sub.current_users_count}/${planData.max_users} utilisateurs`);
      }
    }

    if (planData.max_invoices > 0) {
      const invoicesPercent = (sub.current_invoices_count / planData.max_invoices) * 100;
      if (invoicesPercent >= 80) {
        warnings.push(`Vous avez utilisé ${sub.current_invoices_count}/${planData.max_invoices} factures`);
      }
    }

    if (planData.max_storage_mb > 0) {
      const storagePercent = (sub.current_storage_mb / planData.max_storage_mb) * 100;
      if (storagePercent >= 80) {
        warnings.push(`Vous avez utilisé ${Math.round(sub.current_storage_mb)}/${planData.max_storage_mb} MB de stockage`);
      }
    }

    setQuotaWarnings(warnings);
  };

  const canAddUser = (): boolean => {
    if (!subscription || !plan) return false;
    if (plan.max_users === -1) return true;
    return subscription.current_users_count < plan.max_users;
  };

  const canCreateInvoice = (): boolean => {
    if (!subscription || !plan) return false;
    if (plan.max_invoices === -1) return true;
    return subscription.current_invoices_count < plan.max_invoices;
  };

  const hasFeature = (featureName: string): boolean => {
    if (!plan) return false;
    return plan.features.some(f =>
      f.toLowerCase().includes(featureName.toLowerCase())
    );
  };

  const isOnTrial = (): boolean => {
    if (!subscription || !subscription.trial_end) return false;
    return new Date(subscription.trial_end) > new Date();
  };

  const isActive = (): boolean => {
    if (!subscription) return false;
    return ['active', 'trialing'].includes(subscription.stripe_status);
  };

  const daysUntilRenewal = (): number | null => {
    if (!subscription || !subscription.current_period_end) return null;
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return {
    subscription,
    plan,
    loading,
    quotaWarnings,
    canAddUser,
    canCreateInvoice,
    hasFeature,
    isOnTrial,
    isActive,
    daysUntilRenewal,
    reload: loadSubscription
  };
}
