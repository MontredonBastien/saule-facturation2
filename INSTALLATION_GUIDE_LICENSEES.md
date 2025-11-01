# 🚀 Guide d'Installation - FacturePro White Label

## Bienvenue !

Vous venez d'acquérir une licence FacturePro White Label. Ce guide vous permettra de déployer votre propre instance en **moins d'1 heure**.

---

## ✅ Prérequis

- [ ] Node.js 18+ installé
- [ ] Compte GitHub (accès au repo privé sera fourni)
- [ ] Compte Supabase (gratuit)
- [ ] Compte Stripe (optionnel mais recommandé)
- [ ] Nom de domaine (ex: monappfacturation.fr)

---

## 📦 Étape 1 : Récupération du Code (5 min)

### 1.1 Accès au Repository

Une fois votre paiement validé, vous recevrez :
- Un email avec votre **license key**
- Une invitation GitHub au repository privé

### 1.2 Cloner le projet

```bash
git clone https://github.com/facturepro-whitelabel/facturepro-source.git
cd facturepro-source
npm install
```

---

## 🗄️ Étape 2 : Configuration Supabase (15 min)

### 2.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **URL** et **anon key**

### 2.2 Exécuter les migrations

```bash
# Option A : Via Supabase Dashboard
1. Allez dans SQL Editor
2. Copiez le contenu de chaque fichier dans supabase/migrations/
3. Exécutez dans l'ordre chronologique

# Option B : Via CLI (recommandé)
npm install -g supabase
supabase link --project-ref votre-projet-ref
supabase db push
```

### 2.3 Configuration des variables

Créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key

# Branding (personnalisation)
VITE_APP_NAME=MonAppFacturation
VITE_APP_LOGO_URL=/logo.png
VITE_PRIMARY_COLOR=#4F46E5
VITE_SECONDARY_COLOR=#7C3AED

# Contact
VITE_SUPPORT_EMAIL=support@monapp.fr
VITE_COMPANY_ADDRESS=123 Rue Exemple, 75001 Paris

# License (fournie par FacturePro)
VITE_LICENSE_KEY=votre-license-key-unique
```

---

## 🎨 Étape 3 : Personnalisation Branding (10 min)

### 3.1 Logo

Remplacez `public/logo.png` par votre propre logo (format PNG, 200x50px recommandé).

### 3.2 Couleurs

Les couleurs sont définies dans `.env` et appliquées automatiquement.

### 3.3 Nom de l'application

Changez `VITE_APP_NAME` dans `.env` - il apparaîtra partout dans l'interface.

### 3.4 Mentions légales

Éditez `src/pages/legal/TermsPage.tsx` et `PrivacyPage.tsx` :
- Remplacez `[Votre Nom/Société]` par votre raison sociale
- Mettez à jour l'adresse et les contacts

---

## 💳 Étape 4 : Configuration Stripe (15 min) - Optionnel

Si vous voulez proposer des abonnements payants :

### 4.1 Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte et activez-le

### 4.2 Créer les produits

Suivez le guide détaillé : `GUIDE_STRIPE_CONFIGURATION.md`

En résumé :
1. Créez vos produits dans Stripe Dashboard
2. Copiez les Price IDs
3. Mettez à jour la table `subscription_plans` dans Supabase

### 4.3 Configurer les webhooks

Créez une edge function pour les webhooks Stripe (guide fourni).

---

## 🚀 Étape 5 : Test Local (5 min)

```bash
# Lancer en mode développement
npm run dev

# Ouvrir http://localhost:5173
```

### Checklist de test :
- [ ] Page d'accueil s'affiche
- [ ] Inscription fonctionne
- [ ] Création d'un devis
- [ ] Génération PDF
- [ ] Votre logo apparaît
- [ ] Couleurs personnalisées appliquées

---

## 🌐 Étape 6 : Déploiement Production (10 min)

### Option A : Vercel (Recommandé - Gratuit)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Suivre les instructions
# Configurer les variables d'env dans le dashboard
```

### Option B : Netlify

```bash
# Build
npm run build

# Upload le dossier dist/ sur Netlify
# Configurer les variables d'env
```

### Option C : VPS (Avancé)

```bash
# Build
npm run build

# Copier dist/ sur votre serveur
# Configurer nginx/apache
```

Exemple nginx :

```nginx
server {
    listen 80;
    server_name votre-domaine.fr;
    root /var/www/facturepro/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔐 Étape 7 : Sécurité et Production

### 7.1 Variables d'environnement

⚠️ **Ne commitez JAMAIS vos clés API**

Sur Vercel/Netlify :
1. Allez dans Settings > Environment Variables
2. Ajoutez toutes les variables du `.env`

### 7.2 Nom de domaine

1. Achetez un domaine (ex: namecheap.com, OVH)
2. Pointez-le vers Vercel/Netlify (DNS A/CNAME records)
3. SSL sera automatique

### 7.3 Premier utilisateur admin

Après inscription, exécutez dans Supabase SQL Editor :

```sql
UPDATE users
SET is_super_admin = true
WHERE email = 'votre-email@exemple.fr';
```

---

## 📧 Étape 8 : Configuration Email (10 min)

Pour envoyer des documents par email :

### Option : Resend (Recommandé)

```bash
# 1. Créer compte sur resend.com (gratuit jusqu'à 3K emails/mois)
# 2. Vérifier votre domaine
# 3. Récupérer votre API key

# 4. Configurer dans Supabase Secrets
supabase secrets set RESEND_API_KEY=re_xxxxx
```

L'edge function `send-document-email` est déjà configurée.

---

## ✅ Checklist Finale

Avant de lancer :

### Technique
- [ ] Build production sans erreurs
- [ ] Toutes les variables d'env configurées
- [ ] Tests manuels complets
- [ ] Domaine pointé et SSL actif
- [ ] Backups Supabase activés

### Branding
- [ ] Logo personnalisé
- [ ] Couleurs changées
- [ ] Nom de l'application partout
- [ ] Mentions légales mises à jour
- [ ] Email support configuré

### Business
- [ ] Stripe configuré (si applicable)
- [ ] Prix définis
- [ ] Page de tarification customisée

---

## 🆘 Support

Vous avez un problème ? Plusieurs ressources :

### Documentation
- `README.md` - Documentation technique complète
- `GUIDE_STRIPE_CONFIGURATION.md` - Configuration paiements
- `GUIDE_MULTI_UTILISATEURS.md` - Multi-tenant

### Support Direct

Selon votre plan :
- **Solo** : support@facturepro.fr (48h)
- **Business** : support@facturepro.fr (24h)
- **Agency** : support@facturepro.fr (12h)
- **Unlimited** : Slack privé (immédiat)

### Communauté

Rejoignez la communauté Slack des licensees :
- Entraide entre développeurs
- Annonces de nouvelles features
- Partage de customisations

---

## 🎓 Ressources Complémentaires

### Vidéos Tutoriels

1. **Installation complète** (30 min) : [Lien YouTube]
2. **Personnalisation avancée** (20 min) : [Lien YouTube]
3. **Configuration Stripe** (15 min) : [Lien YouTube]
4. **Déploiement Vercel** (10 min) : [Lien YouTube]

### Articles

- Comment personnaliser les templates PDF
- Ajouter des champs custom
- Intégrer avec d'autres outils (Zapier, Make)
- Optimiser les performances

---

## 📊 Suivre vos Métriques

### Dashboard Supabase

Utilisez le dashboard pour :
- Voir vos utilisateurs actifs
- Monitorer les erreurs
- Analyser l'usage de la DB

### Google Analytics (Optionnel)

Ajoutez votre code GA dans `index.html` pour :
- Tracking des inscriptions
- Conversions
- Comportement utilisateurs

---

## 🚀 Prochaines Étapes

### Acquisition Clients

1. **SEO** : Optimisez pour "logiciel facturation [votre ville]"
2. **Contenu** : Créez un blog avec des guides
3. **Réseaux** : LinkedIn, forums entrepreneurs
4. **Partenariats** : Experts-comptables locaux

### Évolution Produit

Vous pouvez :
- Ajouter des features custom (dans les limites de votre licence)
- Proposer des add-ons payants
- Créer des intégrations tierces

### Recevoir les Updates

En tant que licensee actif :
- Vous recevez toutes les mises à jour via GitHub
- Pull requests automatiques mensuelles
- Changelog détaillé
- Migration guides si breaking changes

---

## 💡 Conseils pour Réussir

### Pricing

Nos licensees facturent généralement :
- **Freelances/TPE** : 19-29€/mois
- **PME** : 49-79€/mois
- **Grandes entreprises** : 99-199€/mois

### Différenciation

Ajoutez votre touche :
- Support local/personnalisé
- Intégrations spécifiques à votre marché
- Formation incluse
- Services de comptable en plus

### Support Client

Template d'onboarding recommandé :
1. Email de bienvenue avec liens
2. Appel découverte (15 min)
3. Formation vidéo personnalisée
4. Check-in à J+7, J+30

---

## 📋 Checklist des 7 Premiers Jours

### Jour 1 : Setup
- [ ] Cloner le repo
- [ ] Configurer Supabase
- [ ] Test local

### Jour 2 : Branding
- [ ] Logo et couleurs
- [ ] Mentions légales
- [ ] Test complet

### Jour 3 : Déploiement
- [ ] Build production
- [ ] Deploy Vercel
- [ ] Configurer domaine

### Jour 4 : Stripe (si applicable)
- [ ] Créer compte
- [ ] Configurer produits
- [ ] Tester paiement

### Jour 5 : Email
- [ ] Resend setup
- [ ] Test envoi documents
- [ ] Templates personnalisés

### Jour 6 : Tests
- [ ] Créer comptes test
- [ ] Parcours complet
- [ ] Mobile responsive

### Jour 7 : Lancement
- [ ] Annoncer sur LinkedIn
- [ ] Premiers prospects
- [ ] Feedback utilisateurs

---

## 🎯 Objectifs Premier Mois

- 🎯 **3 clients** payants minimum
- 🎯 **500€** MRR
- 🎯 **0 bugs** critiques
- 🎯 **10 prospects** qualifiés

Avec FacturePro White Label, c'est atteignable dès le premier mois ! 🚀

---

## 📞 Derniers Conseils

1. **Ne réinventez pas la roue** : Le code est production-ready
2. **Focalisez sur l'acquisition** : Pas sur le développement
3. **Support = différenciation** : Votre valeur ajoutée
4. **Itérez avec vos clients** : Écoutez leurs besoins
5. **Communauté** : Partagez vos succès dans le Slack

---

**Bienvenue dans la famille FacturePro !** 🎉

Si vous avez des questions, n'hésitez pas à contacter le support.

Bon lancement ! 🚀

---

*Guide créé le : 5 octobre 2025*
*Version : 1.0*
*Support : support@facturepro.fr*
