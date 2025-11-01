# Guide Super Admin - Mode SaaS

## 🎯 Votre rôle de Super Admin

En tant que **Super Admin**, vous :
- ❌ N'avez PAS d'entreprise propre dans l'application
- ✅ Gérez toutes les entreprises clientes qui utilisent votre application
- ✅ Créez et configurez les entreprises
- ✅ Assignez les plans d'abonnement (Gratuit, Pro 10€, Business 15€)
- ✅ Activez/désactivez les modules pour chaque entreprise
- ✅ Surveillez les quotas et l'usage
- ✅ Facturez VOS clients (les entreprises) pour leur abonnement

---

## 📋 Comment devenir Super Admin

### Méthode : Ajout manuel en base de données

1. **Déployez votre application** (voir GUIDE_MISE_EN_PRODUCTION.md)

2. **Inscrivez-vous normalement** sur votre site
   - Email : votre@email.fr
   - Mot de passe sécurisé

3. **Ajoutez-vous en tant que Super Admin dans Supabase**

   Connectez-vous à votre Supabase Dashboard :
   - Ouvrez https://supabase.com/dashboard
   - Sélectionnez votre projet
   - Allez dans "SQL Editor"
   - Exécutez cette requête :

   ```sql
   -- Récupérer votre ID utilisateur
   SELECT id, email FROM auth.users WHERE email = 'votre@email.fr';

   -- Copier l'ID obtenu et l'utiliser ci-dessous
   INSERT INTO super_admins (
     auth_user_id,
     email,
     full_name,
     is_active
   ) VALUES (
     'VOTRE-ID-COPIE-ICI',  -- Remplacer par l'ID copié ci-dessus
     'votre@email.fr',
     'Votre Nom',
     true
   );
   ```

4. **Reconnectez-vous**
   - Déconnectez-vous de l'application
   - Reconnectez-vous
   - Vous devriez maintenant voir le menu "Super Admin" ⭐

---

## 🏢 Accès à l'interface Super-Admin

1. Dans le menu de gauche, cliquez sur **"Super Admin"** (icône bouclier ⭐)
2. Vous accédez au tableau de bord de gestion des entreprises

## Tableau de bord Super-Admin

### Vue d'ensemble

Le tableau de bord affiche :
- **Entreprises actives** : Nombre total d'entreprises clientes
- **Utilisateurs total** : Somme de tous les utilisateurs de toutes les entreprises
- **Documents ce mois** : Total des documents créés ce mois

### Liste des entreprises

Pour chaque entreprise, vous voyez :
- **Nom et email** de l'entreprise
- **Plan d'abonnement** actuel (Free, Starter, Business, Enterprise)
- **Utilisateurs** : Nombre actuel / Maximum autorisé
- **Modules actifs** : Nombre de modules activés
- **Documents/mois** : Nombre de documents créés ce mois

## Configurer une entreprise

### Étape 1 : Ouvrir la configuration

1. Dans la liste des entreprises, cliquez sur **"Configurer"** pour l'entreprise souhaitée
2. Une fenêtre de configuration s'ouvre

### Étape 2 : Choisir le plan d'abonnement

**Plans disponibles** :

#### 1. Gratuit
- 1 utilisateur
- 50 documents/mois
- 100 MB de stockage
- Support par email

#### 2. Starter (29.99€/mois)
- 3 utilisateurs
- 200 documents/mois
- 500 MB de stockage
- Support prioritaire
- Tous les modules sauf équipements

#### 3. Business (79.99€/mois)
- 10 utilisateurs
- 1000 documents/mois
- 2 GB de stockage
- Support prioritaire
- Tous les modules
- Accès API

#### 4. Enterprise (sur devis)
- Utilisateurs illimités
- Documents illimités
- Stockage illimité
- Support dédié 24/7
- Tous les modules
- Formation personnalisée

#### 5. Personnalisé
- Configuration 100% sur mesure
- Vous définissez tous les paramètres

### Étape 3 : Définir le quota d'utilisateurs personnalisé

**Option** : Vous pouvez définir un nombre d'utilisateurs différent du plan

**Exemple** :
- Plan "Starter" = 3 utilisateurs par défaut
- Vous pouvez forcer à **5 utilisateurs** pour cette entreprise spécifique
- Laissez vide pour utiliser le quota du plan

### Étape 4 : Sélectionner les modules activés

**Modules disponibles** :

1. **Tableau de bord** - Vue d'ensemble et statistiques
2. **Devis** - Création et gestion des devis
3. **Factures** - Gestion de la facturation
4. **Avoirs** - Création d'avoirs et remboursements
5. **Articles** - Catalogue de produits/services
6. **Clients** - Gestion des clients
7. **Équipements** - Gestion du matériel
8. **Locations** - Gestion des locations
9. **Paramètres** - Configuration de l'entreprise
10. **Emails** - Envoi de documents par email
11. **Utilisateurs** - Gestion multi-utilisateurs (module premium)
12. **Maintenance** - Suivi de maintenance des équipements

**Cochez les modules** que vous voulez activer pour cette entreprise.

### Étape 5 : Enregistrer

Cliquez sur **"Enregistrer"** pour appliquer la configuration.

## Cas d'usage pratiques

### Cas 1 : Petite entreprise qui débute

**Besoin** : Facturation simple uniquement

**Configuration** :
- Plan : **Gratuit**
- Utilisateurs : 1
- Modules activés :
  - Tableau de bord
  - Factures
  - Clients
  - Paramètres

**Résultat** : L'entreprise ne voit que les modules essentiels à la facturation.

---

### Cas 2 : PME en croissance

**Besoin** : Devis + Factures + Gestion d'équipe

**Configuration** :
- Plan : **Starter**
- Utilisateurs personnalisés : **5** (au lieu de 3)
- Modules activés :
  - Tableau de bord
  - Devis
  - Factures
  - Avoirs
  - Articles
  - Clients
  - Emails
  - Utilisateurs (pour gérer leur équipe)
  - Paramètres

**Résultat** : L'entreprise peut créer une équipe de 5 personnes et gérer devis/factures.

---

### Cas 3 : Entreprise de location d'équipements

**Besoin** : Gestion complète avec locations et maintenance

**Configuration** :
- Plan : **Business**
- Utilisateurs : 10 (défaut du plan)
- Modules activés : **TOUS**
  - Incluant Équipements, Locations, Maintenance

**Résultat** : Accès complet à toutes les fonctionnalités.

---

### Cas 4 : Grande entreprise avec besoins spécifiques

**Besoin** : Tout sauf la gestion d'équipements

**Configuration** :
- Plan : **Enterprise**
- Utilisateurs personnalisés : **50**
- Modules activés :
  - Tableau de bord
  - Devis
  - Factures
  - Avoirs
  - Articles
  - Clients
  - Emails
  - Utilisateurs
  - Paramètres
  - ❌ Pas Équipements
  - ❌ Pas Locations
  - ❌ Pas Maintenance

**Résultat** : Entreprise avec 50 utilisateurs, sans les modules de location.

---

### Cas 5 : Client VIP avec configuration unique

**Besoin** : Configuration totalement personnalisée

**Configuration** :
- Plan : **Personnalisé**
- Utilisateurs personnalisés : **20**
- Modules : Sélection précise selon ses besoins
- Notes : "Client VIP - Support prioritaire - Facturation annuelle 1500€"

**Résultat** : Configuration 100% sur mesure.

## Gestion des quotas

### Dépassement du quota d'utilisateurs

**Alerte visuelle** :
- Si une entreprise dépasse son quota, le nombre d'utilisateurs s'affiche **en rouge** dans la liste
- Exemple : 12 / 10 (dépassement de 2 utilisateurs)

**Action recommandée** :
1. Contacter l'entreprise
2. Soit augmenter son quota personnalisé
3. Soit faire évoluer vers un plan supérieur

### Suivi de l'utilisation

La colonne **"Documents/mois"** vous indique l'activité de chaque entreprise.

**Utilisez ces données pour** :
- Identifier les clients actifs
- Détecter les clients qui pourraient avoir besoin d'un plan supérieur
- Surveiller les clients en période d'essai

## Plans d'abonnement

### Créer un nouveau plan

Les plans par défaut sont configurés dans la base de données. Pour créer un plan personnalisé :

1. Allez dans la base de données Supabase
2. Table `subscription_plans`
3. Ajoutez une nouvelle ligne avec :
   - `name` : identifiant unique (ex: "premium")
   - `display_name` : nom affiché (ex: "Premium")
   - `description` : description du plan
   - `max_users` : nombre d'utilisateurs
   - `max_documents_per_month` : limite mensuelle (NULL = illimité)
   - `max_storage_mb` : stockage (NULL = illimité)
   - `price_monthly` : prix mensuel
   - `price_yearly` : prix annuel
   - `features` : JSON array des fonctionnalités

### Modifier un plan existant

**Important** : Modifier un plan affecte toutes les entreprises qui l'utilisent (sauf si elles ont des quotas personnalisés).

## Gestion des modules

### Désactiver un module pour une entreprise

Si une entreprise a un module activé et que vous le désactivez :
- **Le module disparaît immédiatement** de son menu
- Les données restent intactes
- L'entreprise ne peut plus y accéder

### Réactiver un module

Cochez simplement le module dans la configuration, les données sont toujours là.

## Architecture technique

### Tables de la base de données

1. **super_admins** : Liste des super-administrateurs
2. **subscription_plans** : Plans d'abonnement disponibles
3. **company_subscriptions** : Configuration de chaque entreprise
4. **company_modules** : Modules activés par entreprise
5. **company_usage** : Suivi automatique de l'utilisation

### Sécurité

- **RLS activé** : Seuls les super-admins peuvent accéder aux données
- **Isolation des entreprises** : Chaque entreprise ne voit que ses données
- **Quotas automatiques** : Fonction PostgreSQL pour vérifier les limites

### Fonction de vérification des quotas

Une fonction SQL `check_company_quota()` est disponible pour vérifier si une entreprise a dépassé ses limites :

```sql
SELECT check_company_quota('company_id', 'users'); -- Vérifie le quota d'utilisateurs
SELECT check_company_quota('company_id', 'documents'); -- Vérifie le quota de documents
```

## Workflow recommandé

### 1. Nouvelle entreprise cliente

1. L'entreprise s'inscrit et crée son compte
2. Par défaut, elle n'a **aucun plan** assigné
3. **Vous** allez dans Super-Admin
4. Vous configurez son plan et ses modules
5. L'entreprise peut maintenant utiliser l'application

### 2. Évolution d'un client

1. Un client souhaite plus d'utilisateurs
2. Allez dans Super-Admin → Configurer l'entreprise
3. Augmentez le quota personnalisé d'utilisateurs
4. Ou changez vers un plan supérieur

### 3. Fin de période d'essai

1. Utilisez le champ `trial_ends_at` dans `company_subscriptions`
2. Surveillez les dates d'expiration
3. Contactez les clients pour renouvellement

### 4. Surveillance mensuelle

1. Consultez le tableau de bord Super-Admin
2. Vérifiez les dépassements de quotas (nombres en rouge)
3. Identifiez les clients inactifs (0 documents ce mois)
4. Contactez les clients pour optimiser leurs plans

## Exemples de tarification

### Stratégie freemium

1. **Gratuit** : 1 utilisateur, modules basiques
2. **Starter** : 29.99€/mois, 3 utilisateurs
3. **Business** : 79.99€/mois, 10 utilisateurs
4. **Enterprise** : Sur devis, illimité

### Stratégie par module

1. **Base** : 19.99€/mois (Devis + Factures + Clients)
2. **+ Équipements** : +10€/mois
3. **+ Multi-utilisateurs** : +5€/utilisateur
4. **+ Locations** : +15€/mois

### Stratégie par utilisateur

1. **1-3 utilisateurs** : 15€/utilisateur/mois
2. **4-10 utilisateurs** : 12€/utilisateur/mois
3. **11-50 utilisateurs** : 10€/utilisateur/mois
4. **50+ utilisateurs** : 8€/utilisateur/mois

## Prochaines évolutions possibles

### Fonctionnalités à ajouter

1. **Facturation automatique** : Générer les factures mensuelles par entreprise
2. **Alertes de quota** : Email automatique quand une limite est atteinte
3. **Rapports d'utilisation** : Graphiques par entreprise, par mois
4. **API publique** : Permettre aux entreprises Enterprise d'accéder à leurs données via API
5. **White-label** : Personnaliser le logo et couleurs par entreprise
6. **Intégrations** : Stripe, PayPal pour les paiements automatiques

## Support

### Pour ajouter un super-admin

```sql
INSERT INTO super_admins (email, full_name, is_active)
VALUES ('admin@votreentreprise.com', 'Votre Nom', true);
```

### Pour voir toutes les entreprises sans plan

```sql
SELECT c.name, c.email
FROM companies c
LEFT JOIN company_subscriptions cs ON c.id = cs.company_id
WHERE cs.id IS NULL;
```

### Pour voir les entreprises qui dépassent leur quota

```sql
SELECT
  c.name,
  cu.current_users_count,
  COALESCE(cs.custom_max_users, sp.max_users) as max_users
FROM companies c
JOIN company_usage cu ON c.id = cu.company_id
JOIN company_subscriptions cs ON c.id = cs.company_id
JOIN subscription_plans sp ON cs.plan_id = sp.id
WHERE cu.current_users_count > COALESCE(cs.custom_max_users, sp.max_users);
```

## Conclusion

Vous disposez maintenant d'un système SaaS complet vous permettant de :

✅ Gérer plusieurs entreprises clientes
✅ Contrôler précisément les modules accessibles par entreprise
✅ Définir des quotas d'utilisateurs personnalisés
✅ Suivre l'utilisation en temps réel
✅ Faire évoluer facilement les plans

Le système est **évolutif** et peut être adapté à votre modèle économique spécifique !
