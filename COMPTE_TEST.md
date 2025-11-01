# Compte de Test - FacturApp

## 🔐 Identifiants de Connexion

Pour tester l'application avec les clients de test déjà intégrés :

### Compte Utilisateur
- **Email :** `test@masuperentreprise.fr`
- **Mot de passe :** `Test123456!`

### Entreprise Associée
- **Nom :** Ma Super Entreprise SARL
- **SIRET :** 12345678901234
- **N° TVA :** FR12345678901

---

## 👥 Clients Disponibles

Ce compte a accès à **2 clients de test** :

### 1. 🏢 TechCorp Solutions SAS (Client Professionnel)
- **Type :** B2B / Professional
- **SIRET :** 98765432109876
- **N° TVA :** FR98765432109
- **Contact :** Jean Dupont
- **Email :** j.dupont@techcorp.fr
- **Téléphone :** 01 98 76 54 32
- **Adresse :** 456 Avenue des Champs-Élysées, 75008 Paris

### 2. 👤 Marie Martin (Cliente Particulière)
- **Type :** B2C / Individual
- **Contact :** Marie Martin
- **Email :** marie.martin@email.fr
- **Téléphone :** 06 12 34 56 78
- **Adresse :** 789 Boulevard Saint-Germain, 75006 Paris

---

## 🚀 Comment Utiliser

### Étape 1 : Se connecter
1. Ouvrir l'application dans le navigateur
2. Cliquer sur "Se connecter" (ou aller à la page de login)
3. Entrer l'email : `test@masuperentreprise.fr`
4. Entrer le mot de passe : `Test123456!`
5. Cliquer sur "Connexion"

### Étape 2 : Créer une facture de test
1. Une fois connecté, aller dans **"Factures"**
2. Cliquer sur **"Nouvelle facture"**
3. Dans le champ "Client", rechercher :
   - **"TechCorp"** pour le client professionnel
   - **"Marie"** pour la cliente particulière
4. Sélectionner le client souhaité
5. Ajouter des lignes de facturation
6. Enregistrer

### Étape 3 : Tester la facturation électronique
Pour le client professionnel (TechCorp) :
1. Créer une nouvelle facture
2. Sélectionner "TechCorp Solutions SAS"
3. Descendre jusqu'à la section **"Facturation électronique"**
4. Choisir le format :
   - **Factur-X** (PDF/A-3 avec XML embarqué)
   - **Chorus Pro** (Portail public français)
5. Enregistrer et visualiser
6. Tester les boutons d'action dans l'aperçu PDF

---

## ✅ Ce qui Fonctionne

### Authentification
- ✅ Connexion avec email/mot de passe
- ✅ Session maintenue
- ✅ Accès sécurisé aux données de l'entreprise

### Gestion des Clients
- ✅ Liste des clients filtrée par entreprise
- ✅ Recherche de clients (par nom, email, etc.)
- ✅ Distinction B2B / B2C
- ✅ Affichage des informations complètes

### Création de Documents
- ✅ Devis avec les clients
- ✅ Factures avec les clients
- ✅ Avoirs avec les clients
- ✅ Calculs automatiques (HT, TVA, TTC)

### Facturation Électronique (Mode Démonstration)
- ✅ Sélection du format (Standard, Factur-X, Chorus Pro)
- ✅ Badges d'information
- ✅ Boutons d'action dans l'aperçu
- ✅ Alertes de confirmation

---

## 🔒 Sécurité

### Row Level Security (RLS)
Toutes les tables sont protégées par RLS :
- ✅ L'utilisateur ne voit que les données de son entreprise
- ✅ Impossible d'accéder aux données d'autres entreprises
- ✅ Politiques strictes sur toutes les opérations (SELECT, INSERT, UPDATE, DELETE)

### Isolation des Données
- Chaque entreprise a ses propres données
- Les clients, factures, devis sont isolés par `company_id`
- Multi-tenant sécurisé

---

## 🧪 Scénarios de Test Recommandés

### Test 1 : Connexion et Navigation
```
1. Se connecter avec test@masuperentreprise.fr
2. Vérifier que le dashboard s'affiche
3. Naviguer dans les différentes sections :
   - Tableau de bord
   - Devis
   - Factures
   - Avoirs
   - Articles
   - Paramètres
```

### Test 2 : Facture B2B avec Factur-X
```
1. Aller dans "Factures" → "Nouvelle facture"
2. Sélectionner "TechCorp Solutions SAS"
3. Ajouter une ligne : "Développement web" - 1000€ HT
4. Sélectionner format "Factur-X"
5. Enregistrer
6. Cliquer sur "Aperçu"
7. Cliquer sur le bouton "⚡ Factur-X"
8. Vérifier le message de confirmation
```

### Test 3 : Facture B2C Standard
```
1. Aller dans "Factures" → "Nouvelle facture"
2. Sélectionner "Marie Martin"
3. Ajouter une ligne : "Consultation" - 500€ HT
4. Laisser format "Standard"
5. Enregistrer
6. Cliquer sur "Aperçu"
7. Vérifier qu'il n'y a pas de boutons électroniques
8. Comparer avec la facture B2B
```

### Test 4 : Devis et Transformation
```
1. Créer un devis pour "TechCorp Solutions SAS"
2. Ajouter des lignes de prestation
3. Enregistrer le devis
4. Depuis la liste des devis, transformer en facture
5. Vérifier que les données sont reprises
```

### Test 5 : Gestion des Paiements
```
1. Créer une facture pour un client
2. Enregistrer la facture
3. Ouvrir la facture
4. Ajouter un paiement partiel
5. Vérifier que le solde est mis à jour
6. Ajouter un second paiement pour solder
```

---

## 📊 Données Présentes

### Base de données actuelle
- **1 Entreprise** : Ma Super Entreprise SARL
- **1 Utilisateur** : test@masuperentreprise.fr
- **2 Clients** : TechCorp (B2B) + Marie (B2C)
- **0 Devis** : À créer
- **0 Factures** : À créer
- **0 Avoirs** : À créer
- **0 Articles** : À créer

---

## 🔧 Dépannage

### Je ne vois pas les clients
**Problème :** Après connexion, la liste des clients est vide

**Solutions :**
1. Vérifier que vous êtes bien connecté (vérifier en haut à droite)
2. Rafraîchir la page (F5)
3. Vérifier la console navigateur (F12) pour les erreurs
4. Vérifier que RLS est bien configuré dans Supabase

### Erreur "Invalid JWT"
**Problème :** Message d'erreur concernant le token JWT

**Solutions :**
1. Se déconnecter complètement
2. Vider le cache du navigateur
3. Se reconnecter avec les identifiants ci-dessus

### Les boutons électroniques ne fonctionnent pas
**Problème :** Les boutons Factur-X ou Chorus Pro ne font rien

**Solutions :**
1. C'est normal ! Les boutons sont en **mode démonstration**
2. Ils affichent une alerte de confirmation simulée
3. Pour la production, il faut intégrer les vraies API

---

## 📝 Notes Importantes

### Mode Démonstration
Les fonctionnalités suivantes sont en **mode démonstration** :
- ✅ **Factur-X** : Affiche une confirmation mais ne génère pas de vrai PDF/A-3
- ✅ **Chorus Pro** : Affiche une confirmation mais n'envoie pas à l'API réelle
- ✅ **Signature électronique** : Affiche une confirmation mais ne signe pas vraiment

### Pour Passer en Production
Pour activer les vraies fonctionnalités :
1. Intégrer une librairie Factur-X (ex: `factur-x-js`)
2. S'inscrire sur Chorus Pro et obtenir les credentials API
3. Intégrer l'API Chorus Pro avec OAuth2
4. Configurer les paramètres dans l'onglet "Paramètres → Facturation électronique"

---

## 🎯 Objectifs des Tests

### Tests Fonctionnels
- [ ] Connexion réussie
- [ ] Clients visibles dans les listes
- [ ] Création de devis
- [ ] Création de factures
- [ ] Création d'avoirs
- [ ] Ajout de paiements
- [ ] Transformation devis → facture
- [ ] Transformation facture → avoir

### Tests Facturation Électronique
- [ ] Sélection format Factur-X
- [ ] Sélection format Chorus Pro
- [ ] Badges informatifs affichés
- [ ] Boutons d'action dans PDF
- [ ] Alertes de confirmation
- [ ] Distinction B2B vs B2C

### Tests de Sécurité
- [ ] RLS empêche l'accès à d'autres entreprises
- [ ] Déconnexion fonctionne
- [ ] Session expire après inactivité
- [ ] Tokens valides

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier ce guide en premier
2. Consulter `CLIENTS_TEST.md` pour plus de détails sur les clients
3. Consulter `GUIDE_TEST_FACTURATION_ELECTRONIQUE.md` pour les tests avancés
4. Vérifier les logs dans la console navigateur (F12)
5. Vérifier les logs Supabase dans le dashboard

---

## 🎉 Bon Test !

Vous êtes maintenant prêt à tester l'application avec :
- ✅ Un compte utilisateur fonctionnel
- ✅ Une entreprise configurée
- ✅ Deux clients de test (B2B et B2C)
- ✅ Toutes les fonctionnalités disponibles

**Amusez-vous bien avec les tests !** 🚀
