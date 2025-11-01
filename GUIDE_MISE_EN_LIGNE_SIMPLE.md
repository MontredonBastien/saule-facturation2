# 🚀 Guide Simple : Mettre Saule Facturation en Ligne

## Ce dont vous avez besoin (GRATUIT)

1. Un compte GitHub (pour stocker votre code)
2. Un compte Netlify (pour héberger votre site)
3. Votre compte Supabase (déjà configuré ✅)

---

## 📋 ÉTAPE 1 : Créer un compte GitHub

### Si vous n'avez pas de compte :

1. Allez sur : **https://github.com/signup**
2. Entrez votre email
3. Créez un mot de passe
4. Choisissez un nom d'utilisateur
5. Vérifiez votre email
6. ✅ Compte créé !

---

## 📤 ÉTAPE 2 : Mettre votre code sur GitHub

### A. Créer un nouveau dépôt (repository)

1. Connectez-vous sur GitHub
2. Cliquez sur le **+** en haut à droite
3. Cliquez sur **"New repository"**
4. Donnez-lui un nom : `saule-facturation`
5. Laissez-le **Public** (ou Private si vous préférez)
6. **NE COCHEZ RIEN D'AUTRE**
7. Cliquez sur **"Create repository"**

### B. Envoyer votre code sur GitHub

Ouvrez un terminal dans le dossier de votre projet et tapez ces commandes une par une :

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Premier déploiement de Saule Facturation"

# Ajouter votre dépôt GitHub (REMPLACEZ "votre-nom-utilisateur")
git remote add origin https://github.com/votre-nom-utilisateur/saule-facturation.git

# Envoyer le code
git branch -M main
git push -u origin main
```

⚠️ **IMPORTANT** : Remplacez `votre-nom-utilisateur` par votre nom d'utilisateur GitHub !

GitHub vous demandera vos identifiants la première fois.

✅ **Votre code est maintenant sur GitHub !**

---

## 🌐 ÉTAPE 3 : Créer un compte Netlify

1. Allez sur : **https://www.netlify.com**
2. Cliquez sur **"Sign up"**
3. Choisissez **"Sign up with GitHub"** (plus simple !)
4. Autorisez Netlify à accéder à GitHub
5. ✅ Compte créé !

---

## 🚀 ÉTAPE 4 : Déployer votre site sur Netlify

### A. Connecter votre projet

1. Sur Netlify, cliquez sur **"Add new site"**
2. Choisissez **"Import an existing project"**
3. Cliquez sur **"Deploy with GitHub"**
4. Autorisez Netlify si demandé
5. Cherchez et sélectionnez **"saule-facturation"**

### B. Configuration du déploiement

Netlify va détecter automatiquement les paramètres. Vérifiez :

- **Build command** : `npm run build`
- **Publish directory** : `dist`

### C. Ajouter vos variables d'environnement Supabase

**TRÈS IMPORTANT** - Sans ça, l'application ne fonctionnera pas !

1. Avant de déployer, cliquez sur **"Add environment variables"** ou **"Show advanced"**
2. Cliquez sur **"New variable"**
3. Ajoutez ces deux variables :

**Variable 1 :**
- Key : `VITE_SUPABASE_URL`
- Value : Copiez depuis votre fichier `.env` local

**Variable 2 :**
- Key : `VITE_SUPABASE_ANON_KEY`
- Value : Copiez depuis votre fichier `.env` local

### D. Déployer !

1. Cliquez sur **"Deploy site"** ou **"Deploy saule-facturation"**
2. Attendez 2-3 minutes (Netlify construit votre site)
3. ✅ **Votre site est en ligne !**

---

## 🔗 ÉTAPE 5 : Configurer Supabase pour votre site en ligne

### A. Trouver l'URL de votre site

Sur Netlify, vous verrez une URL comme :
`https://random-name-123.netlify.app`

Vous pourrez la personnaliser plus tard !

### B. Autoriser votre site dans Supabase

1. Allez sur **https://supabase.com** et connectez-vous
2. Sélectionnez votre projet
3. Allez dans **"Authentication"** (menu de gauche)
4. Cliquez sur **"URL Configuration"**
5. Dans **"Site URL"**, mettez votre URL Netlify
6. Dans **"Redirect URLs"**, ajoutez :
   - `https://votre-site.netlify.app`
   - `https://votre-site.netlify.app/**`
7. Cliquez sur **"Save"**

✅ **C'est terminé !**

---

## 🎉 Votre application est en ligne !

### Testez votre site :

1. Ouvrez l'URL Netlify dans votre navigateur
2. Essayez de vous connecter
3. Tout devrait fonctionner !

---

## 📝 Pour les prochaines mises à jour

Quand vous modifiez votre code :

```bash
# Ajouter les modifications
git add .

# Créer un commit
git commit -m "Description de vos modifications"

# Envoyer sur GitHub
git push
```

**Netlify redéploiera automatiquement votre site !** (2-3 minutes)

---

## 🎨 BONUS : Personnaliser votre nom de domaine

### Sur Netlify (gratuit) :

1. Sur votre site Netlify, allez dans **"Site settings"**
2. Cliquez sur **"Change site name"**
3. Choisissez un nom : `saule-facturation.netlify.app`
4. ✅ Votre URL est personnalisée !

### Avec votre propre domaine (payant) :

Si vous achetez un nom de domaine (ex: `saule-facturation.com`) :

1. Dans Netlify, allez dans **"Domain settings"**
2. Cliquez sur **"Add custom domain"**
3. Suivez les instructions pour connecter votre domaine
4. Netlify gère le HTTPS automatiquement !

---

## ❓ En cas de problème

### Le site ne s'affiche pas :
- Vérifiez que les variables d'environnement sont bien configurées dans Netlify
- Vérifiez que l'URL est autorisée dans Supabase

### Erreur de connexion :
- Vérifiez les URLs autorisées dans Supabase Authentication

### Le build échoue :
- Regardez les logs dans Netlify (onglet "Deploys")
- Vérifiez que `npm run build` fonctionne en local

---

## 📞 Besoin d'aide ?

Si vous bloquez, dites-moi à quelle étape et je vous aide !

**🎊 Félicitations, vous êtes maintenant en production ! 🎊**
