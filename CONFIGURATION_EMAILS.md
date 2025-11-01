# Configuration de l'envoi d'emails

Ce guide explique comment configurer l'envoi d'emails réels dans l'application.

## Mode actuel : Démo

Par défaut, l'application fonctionne en **mode démo** :
- ✅ Les documents sont bien enregistrés
- ✅ Les liens de partage fonctionnent
- ✅ Le tracking des vues fonctionne
- ⚠️ Les emails ne sont PAS réellement envoyés

## Activer l'envoi d'emails réels

### Étape 1 : Créer un compte Resend

1. Allez sur **https://resend.com**
2. Cliquez sur "Sign Up" (Inscription)
3. Créez votre compte (gratuit pour 100 emails/jour)
4. Vérifiez votre adresse email

### Étape 2 : Obtenir votre clé API

1. Connectez-vous à **https://resend.com/api-keys**
2. Cliquez sur "Create API Key"
3. Donnez-lui un nom descriptif (exemple: "Mon Application Facturation")
4. Sélectionnez les permissions "Sending access"
5. Cliquez sur "Create"
6. **Copiez immédiatement la clé** (elle commence par `re_...`)
   - ⚠️ Vous ne pourrez plus la voir après !
   - Exemple : `re_123abc456def789ghi012jkl345mno678`

### Étape 3 : Configurer dans Supabase

#### Option A : Via le Dashboard Supabase (Recommandé)

1. Allez sur votre **Dashboard Supabase** : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"Edge Functions"**
4. Cliquez sur l'onglet **"Secrets"** ou **"Configuration"**
5. Ajoutez une nouvelle variable d'environnement :
   - **Nom** : `RESEND_API_KEY`
   - **Valeur** : Votre clé API Resend (celle copiée à l'étape 2)
6. Cliquez sur **"Save"** ou **"Add secret"**

#### Option B : Via la CLI Supabase (Avancé)

```bash
# Si vous avez la CLI Supabase installée
supabase secrets set RESEND_API_KEY=votre_cle_api_resend
```

### Étape 4 : Vérifier la configuration

1. Dans l'application, allez sur **"Emails"**
2. Créez un nouveau partage de document
3. Envoyez-le à une adresse email de test
4. Vérifiez dans la console :
   - ✅ Si vous voyez : "Emails envoyés avec succès via Resend" → C'est configuré !
   - ⚠️ Si vous voyez : "Mode démo" → Vérifiez votre configuration

### Étape 5 : Configurer votre domaine (Optionnel mais recommandé)

Par défaut, Resend utilise `onboarding@resend.dev` comme expéditeur. Pour utiliser votre propre domaine :

1. Dans Resend, allez sur **"Domains"**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine (exemple: `monentreprise.com`)
4. Suivez les instructions pour ajouter les enregistrements DNS
5. Une fois vérifié, modifiez le fichier `supabase/functions/send-document-email/index.ts` :

```typescript
// Remplacez cette ligne (ligne 140)
from: "onboarding@resend.dev",

// Par votre adresse
from: "noreply@monentreprise.com",
// ou
from: "facturation@monentreprise.com",
```

## Limites du plan gratuit Resend

- ✅ **100 emails par jour**
- ✅ **API illimitée**
- ✅ Support de plusieurs destinataires
- ⚠️ Domaine `resend.dev` uniquement (sans domaine personnalisé)

Pour plus d'emails ou un domaine personnalisé, consultez les plans payants sur https://resend.com/pricing

## Fonctionnalités disponibles

### Avec ou sans configuration :
- ✅ Génération de liens de partage sécurisés
- ✅ Suivi des vues de documents (qui a vu, quand, combien de fois)
- ✅ Interface de prévisualisation pour les clients
- ✅ Historique complet des partages

### Uniquement avec configuration :
- ✉️ Envoi automatique d'emails aux clients
- ✉️ Design professionnel des emails
- ✉️ Notifications de partage de documents

## Dépannage

### Problème : "RESEND_API_KEY n'est pas configurée"
**Solution** : Vérifiez que vous avez bien ajouté la clé dans les secrets Supabase (Étape 3)

### Problème : "Invalid API key"
**Solution** : Vérifiez que la clé copiée est complète et commence par `re_`

### Problème : Les emails n'arrivent pas
**Solutions possibles** :
1. Vérifiez les dossiers spam/courrier indésirable
2. Vérifiez que l'adresse email du destinataire est correcte
3. Consultez les logs dans le Dashboard Resend : https://resend.com/emails
4. Vérifiez que vous n'avez pas dépassé la limite de 100 emails/jour

### Problème : "Domain not verified"
**Solution** : Si vous utilisez un domaine personnalisé, vérifiez qu'il est bien vérifié dans Resend

## Support

- **Documentation Resend** : https://resend.com/docs
- **Documentation Supabase Edge Functions** : https://supabase.com/docs/guides/functions
- **Logs Resend** : https://resend.com/emails (pour voir l'historique d'envoi)

## Note importante sur les liens de partage

⚠️ **Limitation WebContainer** : Les liens générés fonctionnent uniquement dans l'environnement de développement actuel. En production (sur un vrai serveur), les liens fonctionneront normalement dans les emails.

💡 **Solution actuelle** : Utilisez le bouton "Voir" dans l'interface pour prévisualiser les documents partagés.
