# 🚀 Déploiement sur Netlify - Guide Ultra Simple

## Prérequis : Avoir votre code

Tous vos fichiers de projet sont prêts dans ce dossier.

---

## Méthode 1 : Upload direct GitHub + Netlify (LA PLUS SIMPLE)

### Étape 1 : GitHub (2 minutes)

1. **Allez sur https://github.com/signup**
   - Créez un compte gratuit (si vous n'en avez pas)
   - Validez votre email

2. **Créez un nouveau repository**
   - Cliquez sur le **"+"** en haut à droite
   - Choisissez **"New repository"**
   - Nom : `facturation-saas`
   - Laissez **Public** (ou Private si vous voulez)
   - ✅ Cochez **"Add a README file"**
   - Cliquez **"Create repository"**

3. **Uploadez vos fichiers**
   - Sur la page du repository, cliquez **"Add file"** → **"Upload files"**
   - **GLISSEZ-DÉPOSEZ** tous les fichiers de votre projet
     (Sauf les dossiers `node_modules` et `dist` si présents)
   - En bas, écrivez "Premier commit"
   - Cliquez **"Commit changes"**

### Étape 2 : Netlify (3 minutes)

1. **Allez sur https://www.netlify.com/**
   - Cliquez **"Sign up"**
   - Choisissez **"Sign up with GitHub"** ← Ça connecte automatiquement !
   - Autorisez Netlify

2. **Déployez votre site**
   - Sur le dashboard Netlify, cliquez **"Add new site"**
   - Choisissez **"Import an existing project"**
   - Cliquez **"Deploy with GitHub"**
   - Sélectionnez votre repository **"facturation-saas"**

3. **Configuration du build**
   - Build command : `npm run build` (normalement déjà rempli)
   - Publish directory : `dist` (normalement déjà rempli)

4. **IMPORTANT : Variables d'environnement**
   - Cliquez **"Show advanced"** ou **"Add environment variables"**
   - Cliquez **"New variable"**

   **Variable 1 :**
   - Key : `VITE_SUPABASE_URL`
   - Value : `https://0ec90b57d6e95fcbda19832f.supabase.co`

   **Variable 2 :**
   - Key : `VITE_SUPABASE_ANON_KEY`
   - Value : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw`

5. **Déployer**
   - Cliquez **"Deploy [nom-du-site]"**
   - Attendez 2-3 minutes ⏳
   - **Votre site est en ligne !** 🎉

6. **Testez votre site**
   - Cliquez sur l'URL générée (ex: `https://quelquechose.netlify.app`)
   - Inscrivez-vous pour tester

---

## Méthode 2 : Avec Git en ligne de commande (pour les développeurs)

Si vous êtes à l'aise avec le terminal :

```bash
# Dans le dossier de votre projet
git init
git add .
git commit -m "Premier commit"
git branch -M main
git remote add origin https://github.com/VOTRE-NOM/facturation-saas.git
git push -u origin main
```

Puis suivez la même procédure Netlify (Étape 2 ci-dessus).

---

## Méthode 3 : Drag & Drop direct sur Netlify (ultra rapide mais pas recommandé)

1. **Construisez le projet localement**
   ```bash
   npm install
   npm run build
   ```

2. **Allez sur https://app.netlify.com/drop**
   - Glissez-déposez le dossier `dist` dans la zone
   - C'est déployé instantanément !

⚠️ **Attention** : Cette méthode ne gère pas les mises à jour automatiques.

---

## 🎨 Personnaliser l'URL Netlify (optionnel)

Par défaut : `https://random-name-123.netlify.app`

Pour changer :
1. Dans Netlify : **"Site settings"** → **"Site details"**
2. Cliquez **"Change site name"**
3. Entrez votre nom : `mafacturation`
4. URL devient : `https://mafacturation.netlify.app`

---

## 🌐 Ajouter votre propre domaine (optionnel)

Si vous avez un domaine (ex: `facturation.monsite.fr`) :

1. Dans Netlify : **"Domain settings"** → **"Add custom domain"**
2. Entrez votre domaine : `facturation.monsite.fr`
3. Netlify vous donne des instructions DNS
4. Chez votre registrar (OVH, Gandi, etc.) :
   - Ajoutez un **CNAME** :
     - Nom : `facturation`
     - Valeur : `votre-site.netlify.app`
5. Attendez 5-30 minutes pour la propagation DNS
6. HTTPS activé automatiquement par Netlify (Let's Encrypt)

---

## ✅ Checklist de déploiement

- [ ] Compte GitHub créé
- [ ] Code uploadé sur GitHub
- [ ] Compte Netlify créé et connecté à GitHub
- [ ] Repository importé dans Netlify
- [ ] Variables d'environnement configurées :
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
- [ ] Build command = `npm run build`
- [ ] Publish directory = `dist`
- [ ] Site déployé avec succès
- [ ] URL Netlify accessible
- [ ] Test inscription/connexion fonctionne

---

## ❌ Problèmes courants

### "Build failed" sur Netlify
**Causes possibles :**
- Variables d'environnement manquantes
- Node version incompatible

**Solution :**
1. Vérifiez les variables d'environnement
2. Ajoutez un fichier `.nvmrc` à la racine du projet :
   ```
   18
   ```
3. Redéployez

### "Page blanche après déploiement"
**Cause :** Les variables d'environnement ne sont pas configurées

**Solution :**
1. Netlify → "Site settings" → "Environment variables"
2. Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont présentes
3. **Important** : Les variables doivent commencer par `VITE_`
4. Redéployez le site

### "Cannot connect to database"
**Cause :** URL ou clé Supabase incorrecte

**Solution :**
1. Vérifiez les valeurs des variables d'environnement
2. Les valeurs doivent être EXACTEMENT :
   - URL : `https://0ec90b57d6e95fcbda19832f.supabase.co`
   - Key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw`

---

## 🔄 Mises à jour automatiques

**Gros avantage de GitHub + Netlify :**

Chaque fois que vous modifiez du code et que vous le poussez sur GitHub :
```bash
git add .
git commit -m "Nouvelle fonctionnalité"
git push
```

→ Netlify détecte le changement et redéploie automatiquement en 2-3 minutes !

---

## 🎉 Félicitations !

Une fois déployé, vous avez :
- ✅ Une application en ligne 24h/24
- ✅ HTTPS automatique (sécurisé)
- ✅ Mises à jour automatiques
- ✅ Gratuit pour toujours (plan Netlify free)

**Prochaine étape :** Devenez Super Admin (voir GUIDE_SUPER_ADMIN_SAAS.md)
