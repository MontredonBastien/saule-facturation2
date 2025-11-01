# Guide de Mise en Production

## Étape 1 : Déploiement de l'application (5 minutes)

Votre application peut être déployée gratuitement sur **Netlify** ou **Vercel**. Je recommande Netlify pour sa simplicité.

### Option A : Déploiement sur Netlify (RECOMMANDÉ)

1. **Créer un compte Netlify**
   - Allez sur https://www.netlify.com/
   - Inscrivez-vous gratuitement avec votre email

2. **Déployer depuis GitHub**
   - Connectez votre compte GitHub à Netlify
   - Cliquez sur "Add new site" > "Import an existing project"
   - Sélectionnez votre repository
   - Configuration automatique détectée :
     ```
     Build command: npm run build
     Publish directory: dist
     ```

3. **Configurer les variables d'environnement**
   - Dans Netlify : Site settings > Environment variables
   - Ajoutez ces 2 variables :
     ```
     VITE_SUPABASE_URL = https://0ec90b57d6e95fcbda19832f.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

4. **Déployer**
   - Cliquez sur "Deploy site"
   - Attendez 2-3 minutes
   - Votre site sera disponible sur `https://votre-app.netlify.app`

### Option B : Déploiement sur Vercel

1. **Créer un compte Vercel**
   - Allez sur https://vercel.com/
   - Inscrivez-vous avec GitHub

2. **Importer le projet**
   - Cliquez sur "Add New Project"
   - Sélectionnez votre repository
   - Configuration détectée automatiquement

3. **Variables d'environnement**
   - Même chose que pour Netlify
   - Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

4. **Déployer**
   - Cliquez sur "Deploy"
   - Votre site sera sur `https://votre-app.vercel.app`

---

## Étape 2 : Configurer votre domaine personnalisé (Optionnel)

### Si vous avez un nom de domaine (ex: facturation.votreentreprise.fr)

**Sur Netlify :**
1. Allez dans "Domain settings"
2. Cliquez sur "Add custom domain"
3. Entrez votre domaine
4. Suivez les instructions pour configurer les DNS

**Sur Vercel :**
1. Allez dans "Settings" > "Domains"
2. Ajoutez votre domaine
3. Configurez les DNS selon les instructions

**Chez votre registrar de domaine :**
- Ajoutez un enregistrement CNAME pointant vers Netlify/Vercel
- Ou modifiez les nameservers

---

## Étape 3 : Créer votre compte administrateur

1. **Accédez à votre application en ligne**
   - Ouvrez l'URL de votre site (Netlify ou Vercel)

2. **Créez votre premier compte**
   - Cliquez sur "S'inscrire"
   - Entrez les informations de votre entreprise
   - Email : votre@email.fr
   - Mot de passe sécurisé

3. **Premier utilisateur = Super Admin automatique**
   - Le premier compte créé a automatiquement les droits super admin
   - Vous pouvez tout gérer

---

## Étape 4 : Configurer votre entreprise

1. **Allez dans Paramètres**
   - Remplissez les informations de votre entreprise
   - Logo
   - SIRET
   - Adresse
   - Coordonnées bancaires

2. **Configurez la numérotation**
   - Format des devis : DEV-2025-001
   - Format des factures : FA-2025-001
   - Personnalisez selon vos besoins

3. **Personnalisez les templates**
   - Conditions générales de vente
   - Mentions légales
   - Footer des documents

---

## Étape 5 : Utilisation quotidienne

### Vous êtes maintenant en PRODUCTION !

**Votre application est accessible 24/7 depuis :**
- Ordinateur : https://votre-app.netlify.app
- Tablette : même URL
- Smartphone : même URL (responsive)

**Ce que vous pouvez faire :**
- ✅ Créer des clients réels
- ✅ Générer des devis et factures valides
- ✅ Envoyer par email à vos clients
- ✅ Suivre vos paiements
- ✅ Exporter en PDF
- ✅ Facturation électronique (Factur-X)
- ✅ Tout est sauvegardé dans Supabase

**Sauvegardes :**
- Supabase sauvegarde automatiquement vos données
- Vos fichiers sont stockés de manière sécurisée
- Aucune perte de données

---

## Coûts mensuels

### Gratuit jusqu'à un certain volume :

**Netlify/Vercel :**
- Plan gratuit : 100 GB de bande passante/mois
- Largement suffisant pour une PME
- 0€/mois

**Supabase :**
- Plan gratuit : 500 MB de stockage
- 50,000 utilisateurs actifs mensuels
- Pour votre usage personnel : 0€/mois
- Si vous dépassez : ~25€/mois pour le plan Pro

**Total estimé : 0-25€/mois maximum**

---

## Support et maintenance

### Mises à jour automatiques

Avec Netlify/Vercel connecté à GitHub :
- Chaque modification dans GitHub = déploiement automatique
- Vous pouvez améliorer l'app et elle se met à jour automatiquement

### Surveillance

- Netlify/Vercel vous alertent en cas de problème
- Supabase monitore la base de données
- Logs disponibles dans les dashboards

---

## Checklist avant de commencer

- [ ] Application déployée sur Netlify ou Vercel
- [ ] Variables d'environnement configurées
- [ ] Site accessible en ligne
- [ ] Premier compte créé (vous = super admin)
- [ ] Informations entreprise remplies
- [ ] Premier devis créé en test
- [ ] Premier client ajouté

**Vous êtes prêt à facturer !** 🚀

---

## Besoin d'aide ?

Si vous rencontrez un problème :
1. Vérifiez les logs dans Netlify/Vercel
2. Vérifiez les logs dans Supabase Dashboard
3. Vérifiez que les variables d'environnement sont correctes
