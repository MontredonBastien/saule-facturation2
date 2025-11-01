# Guide : Espace Comptable Multi-Entreprises

## 📋 Vue d'ensemble

Le système permet aux **comptables professionnels** de gérer plusieurs entreprises clientes depuis un seul compte.

### Ce qui a été ajouté :

✅ **Tables de base de données** : `accountants`, `accountant_company_access`
✅ **Vues optimisées** : `accountant_companies`, `company_accountants_list`
✅ **Interface complète** : Sélecteur d'entreprise + Page de gestion
✅ **4 niveaux d'accès** : readonly, editor, admin, full_admin
✅ **Sécurité RLS** : Isolation complète entre entreprises

---

## 🎯 Fonctionnalités

### Pour les Entreprises (Administrateurs)

#### 1. Gérer les accès comptables

**Accéder à la page :**
- Menu → **"Utilisateurs"** (si vous êtes admin)
- Ou bientôt un menu dédié "Mes Comptables"

**Ajouter un comptable :**
1. Cliquer sur **"Ajouter un comptable"**
2. Renseigner :
   - Email du comptable
   - Nom complet
   - Nom du cabinet (optionnel)
   - Téléphone (optionnel)
3. Choisir le **niveau d'accès** :
   - 📖 **Lecture seule** : Consultation uniquement
   - ✏️ **Édition** : Création et modification de documents
   - 👔 **Administrateur** : Accès complet sauf finances
   - 🔐 **Admin complet** : Accès total incluant comptabilité
4. Ajouter des notes internes (optionnel)
5. Cliquer sur **"Ajouter"**

**Modifier un accès :**
- Cliquer sur l'icône ✏️ à côté du comptable
- Modifier le niveau d'accès
- Enregistrer

**Activer/Désactiver un accès :**
- Cliquer sur le badge "Actif" / "Inactif"
- L'accès est immédiatement activé ou révoqué

**Supprimer un accès :**
- Cliquer sur l'icône 🗑️
- Confirmer la suppression

---

### Pour les Comptables

#### 1. Connexion

**Se connecter avec votre compte comptable :**
```
Email : votreemail@cabinet.fr
Mot de passe : votre_mot_de_passe
```

**Lors de la première connexion :**
- Vous voyez automatiquement le **sélecteur d'entreprise** en haut de la sidebar
- Un nouveau menu **"Mes Clients"** apparaît

#### 2. Basculer entre entreprises

**Dans la sidebar, en haut :**
1. Cliquer sur le **sélecteur d'entreprise**
2. Une liste déroulante s'ouvre avec toutes vos entreprises clientes
3. Utiliser la barre de **recherche** pour filtrer
4. Cliquer sur l'entreprise souhaitée

**Informations affichées pour chaque entreprise :**
- 🏢 Nom de l'entreprise
- 🔢 Numéro SIRET
- 🔐 Votre niveau d'accès (badge coloré)

#### 3. Gérer vos clients

**Menu "Mes Clients" :**
- Liste de toutes les entreprises auxquelles vous avez accès
- Rechercher une entreprise
- Voir votre niveau d'accès
- Voir la date du dernier accès

---

## 🔐 Niveaux d'accès détaillés

### 📖 Lecture seule (readonly)

**Ce que le comptable peut faire :**
- ✅ Consulter le tableau de bord
- ✅ Voir les devis, factures, avoirs
- ✅ Voir les clients
- ✅ Télécharger les documents PDF
- ✅ Exporter les données

**Ce qu'il NE peut PAS faire :**
- ❌ Créer ou modifier des documents
- ❌ Supprimer des données
- ❌ Accéder aux paramètres
- ❌ Gérer les utilisateurs

### ✏️ Édition (editor)

**En plus de "Lecture seule" :**
- ✅ Créer des devis, factures, avoirs
- ✅ Modifier les documents (non validés)
- ✅ Ajouter/modifier des clients
- ✅ Ajouter/modifier des articles
- ✅ Envoyer des documents par email

**Ce qu'il NE peut PAS faire :**
- ❌ Supprimer des documents validés
- ❌ Modifier les paramètres de l'entreprise
- ❌ Gérer les utilisateurs
- ❌ Accéder aux données financières sensibles

### 👔 Administrateur (admin)

**En plus de "Édition" :**
- ✅ Accéder aux paramètres de l'entreprise
- ✅ Modifier les informations de l'entreprise
- ✅ Configurer les numérotations
- ✅ Gérer les modèles de documents
- ✅ Supprimer des documents
- ✅ Voir les utilisateurs

**Ce qu'il NE peut PAS faire :**
- ❌ Gérer les abonnements/paiements
- ❌ Accéder aux données bancaires

### 🔐 Admin complet (full_admin)

**Accès TOTAL :**
- ✅ Tout ce que "Administrateur" peut faire
- ✅ Gérer les abonnements
- ✅ Voir les données financières complètes
- ✅ Gérer les utilisateurs
- ✅ Accéder aux logs d'audit
- ✅ Exporter toutes les données comptables

---

## 🧪 Comment tester

### Étape 1 : Créer un compte comptable de test

**Depuis l'interface de connexion :**
1. Créer un nouveau compte avec un email différent (ex: `comptable@test.fr`)
2. Se connecter avec ce compte

**Ou en SQL dans Supabase :**
```sql
-- Créer un comptable de test
INSERT INTO accountants (email, full_name, company_name, phone, is_active)
VALUES ('comptable.test@cabinet.fr', 'Jean Dupont', 'Cabinet Dupont & Associés', '01 23 45 67 89', true);
```

### Étape 2 : Lier le comptable à une entreprise

**Option A : Via l'interface (recommandé)**
1. Se connecter avec un compte **admin d'entreprise**
2. Aller dans "Mes Clients" (nouveau menu)
3. Cliquer sur "Ajouter un comptable"
4. Remplir le formulaire avec l'email du comptable
5. Choisir le niveau d'accès
6. Valider

**Option B : En SQL dans Supabase**
```sql
-- Récupérer l'ID du comptable
SELECT id, email FROM accountants WHERE email = 'comptable.test@cabinet.fr';

-- Récupérer l'ID d'une entreprise
SELECT id, name FROM companies LIMIT 1;

-- Créer l'accès (remplacer les UUID par les vrais IDs)
INSERT INTO accountant_company_access (accountant_id, company_id, access_level, is_active)
VALUES
  ('UUID_DU_COMPTABLE', 'UUID_DE_L_ENTREPRISE', 'full_admin', true);
```

### Étape 3 : Tester en tant que comptable

1. **Se déconnecter** de votre compte admin
2. **Se reconnecter** avec le compte comptable (`comptable@test.fr`)
3. Vous devriez voir :
   - ✅ Le **sélecteur d'entreprise** en haut de la sidebar
   - ✅ Le menu **"Mes Clients"**
   - ✅ Pouvoir choisir l'entreprise dans le sélecteur
4. Sélectionner l'entreprise et vérifier l'accès aux données

---

## 📊 Structure de la base de données

### Table `accountants`
```
id                uuid (PK)
auth_user_id      uuid (FK → auth.users)
email             text (unique)
full_name         text
company_name      text
phone             text
siret             text
is_active         boolean
created_at        timestamptz
updated_at        timestamptz
last_login        timestamptz
notes             text
```

### Table `accountant_company_access`
```
id                uuid (PK)
accountant_id     uuid (FK → accountants)
company_id        uuid (FK → companies)
access_level      text (readonly|editor|admin|full_admin)
is_active         boolean
granted_at        timestamptz
granted_by        uuid (FK → app_users)
revoked_at        timestamptz
revoked_by        uuid (FK → app_users)
last_access       timestamptz
notes             text
```

### Vue `accountant_companies`
Retourne la liste des entreprises accessibles par un comptable avec :
- Informations du comptable
- Informations de l'entreprise
- Niveau d'accès
- Date du dernier accès

### Vue `company_accountants_list`
Retourne la liste des comptables ayant accès à une entreprise avec :
- Informations du comptable et son cabinet
- Niveau d'accès
- Dates d'accès

---

## 🔧 Dépannage

### Problème : Le menu "Mes Clients" n'apparaît pas

**Solutions :**
1. Vérifier que vous êtes bien connecté avec un compte comptable
2. Vérifier dans Supabase :
```sql
-- Vérifier si votre email est dans la table accountants
SELECT * FROM accountants WHERE email = 'votre@email.fr';
```
3. Si aucun résultat, vous n'êtes pas enregistré comme comptable

### Problème : Aucune entreprise dans le sélecteur

**Solutions :**
1. Vérifier que des accès vous ont été donnés :
```sql
-- Remplacer par votre email
SELECT * FROM accountant_companies
WHERE accountant_email = 'votre@email.fr';
```
2. Si vide, aucune entreprise ne vous a donné accès
3. Demander à un admin d'entreprise de vous ajouter

### Problème : Erreur "Permission denied"

**Solutions :**
1. Vérifier votre niveau d'accès :
```sql
SELECT access_level, is_active
FROM accountant_company_access
WHERE accountant_id = (SELECT id FROM accountants WHERE email = 'votre@email.fr')
  AND company_id = 'UUID_ENTREPRISE';
```
2. Si `is_active = false`, votre accès a été révoqué
3. Contacter l'admin de l'entreprise

---

## 🚀 Prochaines améliorations suggérées

### 1. Notifications
- ✉️ Email de bienvenue au comptable
- 🔔 Notification quand un comptable accède aux données
- 📧 Rapport mensuel d'activité

### 2. Audit et logs
- 📝 Historique détaillé des actions du comptable
- 📊 Rapport d'activité par comptable
- 🕐 Temps passé par entreprise

### 3. Invitations
- 📨 Système d'invitation par email
- 🔗 Lien d'inscription automatique
- ⏰ Expiration des invitations

### 4. Permissions avancées
- 📁 Accès restreint à certains modules seulement
- 📅 Accès temporaire avec date d'expiration
- 🏷️ Étiquettes et catégories de comptables

### 5. Interface améliorée
- 📱 Mode comptable dédié avec interface simplifiée
- 🎨 Personnalisation par comptable
- 💼 Tableau de bord comptable multi-entreprises

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier ce guide
2. Consulter les logs dans Supabase
3. Tester avec un compte de démonstration
4. Contacter le support technique

---

**Version du guide :** 1.0
**Dernière mise à jour :** 01/11/2025
**Système :** Saule Facturation
