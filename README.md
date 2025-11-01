# FacturePro - Solution SaaS de Facturation

Une application web complète de gestion de facturation conforme à la législation française, développée avec React, TypeScript, Supabase et Stripe.

## 🚀 Fonctionnalités

### Gestion de documents
- ✅ Devis, factures, avoirs et acomptes
- ✅ Transformation automatique devis → facture
- ✅ Génération PDF avec personnalisation
- ✅ Facturation électronique Factur-X
- ✅ Hash SHA-256 pour inaltérabilité (loi anti-fraude TVA)
- ✅ Numérotation automatique garantie sans trous

### Clients et contacts
- ✅ Gestion multi-contacts par client
- ✅ Import/export CSV
- ✅ Historique complet des transactions

### Multi-utilisateurs
- ✅ Système de permissions granulaires
- ✅ Administrateur, Gestion, Lecture seule, Comptabilité
- ✅ Isolation des données par entreprise (multi-tenant)

### Facturation et abonnements (Stripe)
- ✅ 3 plans : Gratuit, Pro, Entreprise
- ✅ Période d'essai de 14 jours
- ✅ Paiement mensuel ou annuel
- ✅ Gestion des quotas automatique

### Conformité légale
- ✅ Conforme RGPD
- ✅ Mentions légales obligatoires
- ✅ Traçabilité complète (audit log)
- ✅ Sauvegarde des documents avec hash

### Communication
- ✅ Envoi d'emails automatique
- ✅ Tracking des ouvertures
- ✅ Partage de documents sécurisé
- ✅ Notifications automatiques

### Analytics
- ✅ Tableau de bord en temps réel
- ✅ Statistiques de CA
- ✅ Analyse des clients
- ✅ Taux de conversion devis/factures

## 🛠️ Stack Technique

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Paiements** : Stripe
- **PDF** : jsPDF, pdf-lib
- **Build** : Vite
- **Icons** : Lucide React

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte Stripe (optionnel pour les paiements)

## 🔧 Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd facturepro
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Copiez le fichier `.env.example` en `.env`
3. Remplissez les variables d'environnement :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

### 3. Exécuter les migrations

Les migrations sont dans le dossier `supabase/migrations/`. Exécutez-les dans l'ordre chronologique via le dashboard Supabase ou la CLI :

```bash
supabase db push
```

### 4. Configurer Stripe (optionnel)

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez vos clés API (Dashboard > Developers > API keys)
3. Créez vos produits et prix dans Stripe
4. Mettez à jour la table `subscription_plans` avec vos `stripe_price_id`

### 5. Configurer l'Edge Function (emails)

```bash
# Déployer la fonction d'envoi d'emails
supabase functions deploy send-document-email

# Configurer les secrets
supabase secrets set RESEND_API_KEY=votre-cle-resend
```

### 6. Lancer en développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🚢 Déploiement en production

### Option 1 : Vercel (recommandé)

1. Installez la CLI Vercel :
```bash
npm i -g vercel
```

2. Déployez :
```bash
vercel
```

3. Configurez les variables d'environnement dans le dashboard Vercel

### Option 2 : Netlify

1. Build :
```bash
npm run build
```

2. Déployez le dossier `dist/` sur Netlify

3. Configurez les variables d'environnement

### Option 3 : Serveur VPS

1. Build :
```bash
npm run build
```

2. Servez le dossier `dist/` avec nginx ou Apache

Configuration nginx exemple :

```nginx
server {
    listen 80;
    server_name facturepro.fr;
    root /var/www/facturepro/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔐 Configuration de sécurité

### Supabase RLS (Row Level Security)

Toutes les tables sont protégées par RLS. Les policies garantissent :
- Isolation des données par entreprise
- Vérification des permissions utilisateur
- Accès super-admin pour la gestion multi-tenant

### Variables d'environnement sensibles

⚠️ **Ne commitez JAMAIS vos clés API dans le code**

Utilisez toujours des variables d'environnement :
- Supabase : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Stripe : Configurez via Supabase Edge Functions

## 📊 Monitoring et Backups

### Backups Supabase

Supabase effectue des backups automatiques quotidiens. Pour les plans payants, vous pouvez :
- Configurer des backups sur mesure
- Activer Point-in-Time Recovery (PITR)

### Monitoring recommandé

1. **Sentry** pour le tracking des erreurs
2. **Plausible/Umami** pour l'analytics (respectueux RGPD)
3. **Better Uptime** pour la surveillance de disponibilité

## 👥 Créer le premier super-admin

1. Inscrivez-vous via l'application
2. Récupérez votre `user_id` dans la table `users`
3. Exécutez dans Supabase SQL Editor :

```sql
UPDATE users
SET is_super_admin = true
WHERE id = 'votre-user-id';
```

## 📚 Documentation

- **Documentation utilisateur** : `/docs`
- **Guide multi-utilisateurs** : `GUIDE_MULTI_UTILISATEURS.md`
- **Guide super-admin** : `GUIDE_SUPER_ADMIN_SAAS.md`
- **CGU** : `/legal/terms`
- **Confidentialité** : `/legal/privacy`

## 🧪 Tests

```bash
# Lancer les tests (à configurer)
npm run test

# Build de production
npm run build

# Preview du build
npm run preview
```

## 📝 Structure du projet

```
facturepro/
├── src/
│   ├── components/       # Composants réutilisables
│   │   ├── charts/      # Graphiques et stats
│   │   ├── forms/       # Formulaires
│   │   └── settings/    # Paramètres
│   ├── contexts/        # Contextes React
│   ├── hooks/           # Hooks personnalisés
│   ├── lib/             # Librairies (Supabase)
│   ├── pages/           # Pages de l'application
│   │   └── legal/       # Pages légales
│   ├── services/        # Services métier
│   ├── types/           # Types TypeScript
│   └── utils/           # Utilitaires
├── supabase/
│   ├── functions/       # Edge Functions
│   └── migrations/      # Migrations SQL
└── public/              # Assets statiques
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 💬 Support

- Email : support@facturepro.fr
- Documentation : https://facturepro.fr/docs
- Issues GitHub : [Ouvrir un ticket]

## 🎯 Roadmap

- [ ] Application mobile (React Native)
- [ ] API REST publique
- [ ] Intégrations tierces (Zapier, Make)
- [ ] Module de location/abonnements récurrents
- [ ] Export comptable FEC
- [ ] Signature électronique
- [ ] OCR pour numérisation de factures

## 🙏 Remerciements

- [Supabase](https://supabase.com) - Backend as a Service
- [Stripe](https://stripe.com) - Paiements
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Lucide](https://lucide.dev) - Icons
- [jsPDF](https://github.com/parallax/jsPDF) - Génération PDF

---

Développé avec ❤️ pour simplifier la facturation des entrepreneurs français.
