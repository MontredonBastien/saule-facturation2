# Guide de Configuration Stripe pour FacturePro

Ce guide explique comment configurer Stripe pour activer les abonnements payants dans votre application FacturePro.

## 📋 Prérequis

- Un compte Stripe (créez-en un sur [stripe.com](https://stripe.com))
- Accès administrateur à votre base de données Supabase
- Application FacturePro déjà déployée

## 🔧 Étape 1 : Configuration Stripe

### 1.1 Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Cliquez sur "Commencer"
3. Remplissez les informations de votre entreprise
4. Activez votre compte (vérification d'identité)

### 1.2 Récupérer vos clés API

1. Connectez-vous à votre Dashboard Stripe
2. Allez dans **Developers** > **API keys**
3. Notez vos clés :
   - **Publishable key** (commence par `pk_test_...` ou `pk_live_...`)
   - **Secret key** (commence par `sk_test_...` ou `sk_live_...`)

⚠️ **Important** : Ne partagez JAMAIS votre Secret key publiquement

## 📦 Étape 2 : Créer les produits Stripe

### 2.1 Plan Gratuit (Free)

Le plan gratuit n'a pas besoin de configuration Stripe car il est à 0€.

### 2.2 Plan Pro

1. Dans Stripe Dashboard, allez dans **Products** > **Add product**
2. Remplissez :
   - **Name** : FacturePro Pro
   - **Description** : Plan Pro avec 5 utilisateurs et 100 factures/mois
   - **Pricing** : Recurring

3. Créez deux prix (prices) :

**Prix mensuel** :
- **Price** : 29 EUR
- **Billing period** : Monthly
- Copiez le **Price ID** (commence par `price_...`)

**Prix annuel** :
- **Price** : 290 EUR
- **Billing period** : Yearly
- Copiez le **Price ID** (commence par `price_...`)

4. Notez aussi le **Product ID** (commence par `prod_...`)

### 2.3 Plan Enterprise

Répétez les mêmes étapes pour le plan Entreprise :

1. **Products** > **Add product**
2. Remplissez :
   - **Name** : FacturePro Entreprise
   - **Description** : Plan Entreprise avec utilisateurs et factures illimités

3. Créez deux prix :

**Prix mensuel** :
- **Price** : 99 EUR
- **Billing period** : Monthly

**Prix annuel** :
- **Price** : 990 EUR
- **Billing period** : Yearly

## 💾 Étape 3 : Mettre à jour la base de données

### 3.1 Ouvrir Supabase SQL Editor

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Créez une nouvelle query

### 3.2 Mettre à jour les plans avec les IDs Stripe

Copiez et adaptez cette requête SQL avec vos propres IDs :

```sql
-- Mettre à jour le plan Pro
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_XXXXXXXXXXXXX',
  stripe_price_id_monthly = 'price_XXXXXXXXXXXXX',
  stripe_price_id_yearly = 'price_XXXXXXXXXXXXX'
WHERE code = 'pro';

-- Mettre à jour le plan Enterprise
UPDATE subscription_plans
SET
  stripe_product_id = 'prod_YYYYYYYYYYY',
  stripe_price_id_monthly = 'price_YYYYYYYYYYY',
  stripe_price_id_yearly = 'price_YYYYYYYYYYY'
WHERE code = 'enterprise';
```

Remplacez les `XXX` et `YYY` par vos vrais IDs Stripe.

### 3.3 Vérifier la mise à jour

```sql
SELECT code, name, stripe_product_id, stripe_price_id_monthly, stripe_price_id_yearly
FROM subscription_plans
WHERE code IN ('pro', 'enterprise');
```

Vous devriez voir vos IDs Stripe correctement enregistrés.

## 🔌 Étape 4 : Configurer les Webhooks Stripe

Les webhooks permettent à Stripe de notifier votre application des événements (paiement réussi, échec, annulation, etc.).

### 4.1 Créer une Edge Function pour les webhooks

Créez le fichier `supabase/functions/stripe-webhook/index.ts` :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      webhookSecret!
    );

    console.log(`Received event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Mettre à jour le statut de l'abonnement
        break;

      case 'customer.subscription.deleted':
        // Annuler l'abonnement
        break;

      case 'invoice.payment_succeeded':
        // Enregistrer le paiement réussi
        break;

      case 'invoice.payment_failed':
        // Gérer l'échec de paiement
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400 }
    );
  }
});
```

### 4.2 Déployer la fonction

```bash
supabase functions deploy stripe-webhook

# Configurer les secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4.3 Configurer le webhook dans Stripe

1. Dans Stripe Dashboard, allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-projet.supabase.co/functions/v1/stripe-webhook`
4. Sélectionnez les événements :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Cliquez sur **Add endpoint**
6. Copiez le **Signing secret** (commence par `whsec_...`)

## 🎨 Étape 5 : Ajouter le composant de paiement

### 5.1 Installer Stripe.js

```bash
npm install @stripe/stripe-js
```

### 5.2 Créer le composant de checkout

Créez `src/components/StripeCheckout.tsx` :

```typescript
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeCheckoutProps {
  planCode: string;
  billingCycle: 'monthly' | 'yearly';
  companyId: string;
}

export default function StripeCheckout({
  planCode,
  billingCycle,
  companyId
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // Créer une session de checkout via votre Edge Function
      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            planCode,
            billingCycle,
            companyId
          }
        }
      );

      if (error) throw error;

      // Rediriger vers Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe!.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) throw stripeError;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
    >
      {loading ? 'Chargement...' : 'Souscrire maintenant'}
    </button>
  );
}
```

### 5.3 Ajouter l'Edge Function de création de session

Créez `supabase/functions/create-checkout-session/index.ts` :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  try {
    const { planCode, billingCycle, companyId } = await req.json();

    // Récupérer le plan depuis la DB
    // ...

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [{
        price: billingCycle === 'monthly'
          ? plan.stripe_price_id_monthly
          : plan.stripe_price_id_yearly,
        quantity: 1,
      }],
      success_url: `${req.headers.get('origin')}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      client_reference_id: companyId,
      subscription_data: {
        trial_period_days: 14,
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});
```

## 🔐 Étape 6 : Variables d'environnement

Ajoutez à votre fichier `.env` :

```env
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Dans Supabase Secrets (pour les Edge Functions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## ✅ Étape 7 : Tester en mode test

### 7.1 Utiliser les cartes de test Stripe

Pour tester les paiements, utilisez ces numéros de carte :

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0027 6000 3184`

Date d'expiration : N'importe quelle date future
CVC : N'importe quel 3 chiffres

### 7.2 Surveiller les webhooks

Dans Stripe Dashboard > **Developers** > **Webhooks**, vous pouvez :
- Voir tous les événements envoyés
- Tester manuellement les événements
- Voir les erreurs éventuelles

## 🚀 Étape 8 : Passer en production

### 8.1 Activer votre compte Stripe

1. Complétez toutes les informations dans Stripe Dashboard
2. Vérifiez votre identité et coordonnées bancaires
3. Activez votre compte

### 8.2 Utiliser les clés de production

1. Récupérez vos clés de production (`pk_live_...` et `sk_live_...`)
2. Mettez à jour vos variables d'environnement
3. Mettez à jour le webhook avec l'URL de production
4. Redéployez vos Edge Functions avec les secrets de prod

### 8.3 Tester avec de vrais paiements

Faites quelques transactions de test réelles (vous pouvez les rembourser ensuite).

## 📊 Monitoring

### Dans Stripe Dashboard

- **Payments** : Voir tous les paiements
- **Subscriptions** : Gérer les abonnements
- **Customers** : Liste des clients
- **Reports** : Rapports financiers

### Dans votre application

Créez un dashboard admin pour :
- Voir les abonnements actifs
- Gérer les annulations
- Voir l'historique des paiements
- Gérer les remboursements

## 🆘 Dépannage

### Webhook ne fonctionne pas

1. Vérifiez que le webhook est correctement configuré dans Stripe
2. Vérifiez les logs de votre Edge Function
3. Testez manuellement depuis Stripe Dashboard

### Paiement échoue

1. Vérifiez que les IDs de prix sont corrects
2. Vérifiez les logs Stripe
3. Assurez-vous que la carte de test est valide

### Session expire

Les sessions Checkout expirent après 24h. Créez-en une nouvelle si besoin.

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Guide Stripe avec Supabase](https://supabase.com/docs/guides/integrations/stripe)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)

## 💡 Conseils de sécurité

1. ✅ Utilisez toujours les webhooks pour valider les paiements
2. ✅ Ne faites jamais confiance au client pour le statut de paiement
3. ✅ Vérifiez la signature des webhooks
4. ✅ Stockez les clés secrètes dans Supabase Secrets, jamais dans le code
5. ✅ Utilisez les clés de test pendant le développement
6. ✅ Activez 3D Secure pour la production

---

Votre système de paiement est maintenant configuré ! Les utilisateurs peuvent souscrire aux plans Pro et Entreprise directement depuis votre application.
