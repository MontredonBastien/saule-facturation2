# Contacts Multiples pour les Clients

## Vue d'ensemble

Les clients peuvent maintenant avoir plusieurs emails et téléphones avec des catégories personnalisables. Cela permet d'avoir des contacts différents pour différents services (Comptabilité, Direction, Commercial, etc.).

## Fonctionnalités

### 📧 Emails Multiples
- Ajoutez autant d'emails que nécessaire pour chaque client
- Assignez une catégorie à chaque email (ex: Comptabilité, Direction, Commercial)
- Marquez un email comme principal avec l'icône ⭐

### ☎️ Téléphones Multiples
- Ajoutez autant de numéros de téléphone que nécessaire
- Assignez une catégorie à chaque numéro (ex: Bureau, Mobile, Fax, Standard)
- Marquez un numéro comme principal avec l'icône ⭐

### Catégories Personnalisables
Gérez les catégories d'emails et téléphones dans **Paramètres > Listes**

#### Catégories d'emails par défaut
- Principal
- Comptabilité
- Direction
- Commercial
- Technique
- Support

#### Catégories de téléphones par défaut
- Bureau
- Mobile
- Fax
- Standard
- Direct

## Utilisation

### Créer/Modifier un Client

1. Aller dans **Clients** > **Nouveau client** (ou cliquer sur éditer un client existant)

2. Remplir les informations de base :
   - Email principal (obligatoire)
   - Téléphone principal (obligatoire)

3. Dans la section **Contacts supplémentaires** :

   **Pour ajouter un email :**
   - Taper l'adresse email dans le champ
   - Sélectionner la catégorie dans la liste déroulante
   - Cliquer sur "Ajouter" (ou appuyer sur Entrée)
   - L'email apparaît dans la liste avec possibilité de :
     - Modifier la catégorie
     - Marquer comme principal (⭐)
     - Supprimer (🗑️)

   **Pour ajouter un téléphone :**
   - Taper le numéro dans le champ
   - Sélectionner la catégorie
   - Cliquer sur "Ajouter"
   - Le numéro apparaît avec les mêmes options que les emails

4. Sauvegarder le client

### Exemple Pratique

**Client : SARL du Saule à l'Arbre**

**Email principal :** contact@saulearbre.fr

**Emails supplémentaires :**
- compta@saulearbre.fr (Comptabilité) ⭐
- direction@saulearbre.fr (Direction)
- commercial@saulearbre.fr (Commercial)

**Téléphone principal :** 01 23 45 67 89

**Téléphones supplémentaires :**
- 01 23 45 67 90 (Standard) ⭐
- 06 12 34 56 78 (Mobile Direction)
- 01 23 45 67 99 (Fax)

### Contact Principal

- Le premier contact ajouté est automatiquement marqué comme principal
- Vous pouvez changer le contact principal en cliquant sur l'étoile ⭐ d'un autre contact
- Un seul contact peut être principal à la fois

### Modifier les Catégories

1. Aller dans **Paramètres** > **Listes**
2. Trouver la section **Catégories d'emails** ou **Catégories de téléphones**
3. Ajouter de nouvelles catégories :
   - Taper le nom (ex: "Juridique", "RH", "SAV")
   - Cliquer sur "Ajouter"
4. Supprimer une catégorie existante avec l'icône 🗑️
5. Cliquer sur **Sauvegarder**

Les nouvelles catégories apparaissent immédiatement dans les formulaires clients.

## Affichage

### Page Clients

La colonne **Contact** affiche toujours l'email et le téléphone principaux :

```
contact@saulearbre.fr
01 23 45 67 89
```

Si des contacts supplémentaires existent, un indicateur peut être affiché (à implémenter si souhaité).

### Formulaires Devis/Factures

Lors de la sélection d'un client dans un devis ou une facture, les informations de contact principal sont utilisées automatiquement.

### PDF Générés

Les documents PDF (devis, factures, avoirs) affichent les contacts principaux du client dans la section CLIENT.

## Base de Données

### Tables Créées

#### `client_emails`
Stocke les emails supplémentaires pour chaque client

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| client_id | uuid | Référence au client |
| email | text | Adresse email |
| category | text | Catégorie (ex: Comptabilité) |
| is_primary | boolean | Email principal ? |
| created_at | timestamptz | Date de création |

#### `client_phones`
Stocke les téléphones supplémentaires pour chaque client

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| client_id | uuid | Référence au client |
| phone | text | Numéro de téléphone |
| category | text | Catégorie (ex: Bureau) |
| is_primary | boolean | Téléphone principal ? |
| created_at | timestamptz | Date de création |

### Sécurité RLS

Les politiques Row Level Security (RLS) garantissent que :
- ✅ Les utilisateurs ne voient que les contacts de leurs propres clients
- ✅ Les utilisateurs peuvent créer/modifier/supprimer uniquement les contacts de leurs clients
- ✅ Les contacts sont automatiquement supprimés si le client est supprimé (CASCADE)

### Requêtes SQL

**Récupérer un client avec tous ses contacts :**
```sql
SELECT
  c.*,
  json_agg(DISTINCT jsonb_build_object(
    'id', e.id,
    'email', e.email,
    'category', e.category,
    'isPrimary', e.is_primary
  )) FILTER (WHERE e.id IS NOT NULL) AS emails,
  json_agg(DISTINCT jsonb_build_object(
    'id', p.id,
    'phone', p.phone,
    'category', p.category,
    'isPrimary', p.is_primary
  )) FILTER (WHERE p.id IS NOT NULL) AS phones
FROM clients c
LEFT JOIN client_emails e ON e.client_id = c.id
LEFT JOIN client_phones p ON p.client_id = c.id
WHERE c.id = 'client-uuid'
GROUP BY c.id;
```

**Récupérer le contact principal d'un client :**
```sql
-- Email principal
SELECT email, category
FROM client_emails
WHERE client_id = 'client-uuid' AND is_primary = true
LIMIT 1;

-- Téléphone principal
SELECT phone, category
FROM client_phones
WHERE client_id = 'client-uuid' AND is_primary = true
LIMIT 1;
```

## Tests

### Test 1 : Créer un client avec contacts multiples

1. Créer un nouveau client professionnel
2. Renseigner :
   - Email principal : contact@test.fr
   - Téléphone principal : 0123456789
3. Ajouter des emails supplémentaires :
   - compta@test.fr (Comptabilité)
   - direction@test.fr (Direction)
4. Ajouter des téléphones supplémentaires :
   - 0123456790 (Standard)
   - 0612345678 (Mobile)
5. Sauvegarder
6. ✅ Vérifier que tous les contacts sont sauvegardés
7. ✅ Vérifier que le premier email/téléphone supplémentaire est marqué comme principal

### Test 2 : Modifier le contact principal

1. Ouvrir un client avec plusieurs contacts
2. Cliquer sur l'étoile ⭐ d'un email non-principal
3. ✅ Vérifier que l'ancien principal perd l'étoile
4. ✅ Vérifier que le nouveau contact devient principal
5. Sauvegarder
6. Recharger la page
7. ✅ Vérifier que le changement est persistant

### Test 3 : Supprimer un contact

1. Ouvrir un client avec plusieurs contacts
2. Cliquer sur l'icône 🗑️ d'un contact
3. ✅ Vérifier que le contact disparaît de la liste
4. Si c'était le contact principal, vérifier qu'un autre devient principal automatiquement
5. Sauvegarder
6. ✅ Vérifier que la suppression est persistante

### Test 4 : Ajouter une nouvelle catégorie

1. Aller dans Paramètres > Listes
2. Section "Catégories d'emails"
3. Ajouter "Juridique"
4. Sauvegarder
5. Ouvrir un formulaire client
6. ✅ Vérifier que "Juridique" apparaît dans la liste déroulante des catégories d'emails

### Test 5 : Persistance Supabase

1. Créer un client avec 3 emails et 2 téléphones
2. Sauvegarder
3. Ouvrir Supabase Dashboard
4. Vérifier les tables :
   ```sql
   SELECT * FROM client_emails WHERE client_id = 'le-client-uuid';
   SELECT * FROM client_phones WHERE client_id = 'le-client-uuid';
   ```
5. ✅ Vérifier que tous les contacts sont présents
6. ✅ Vérifier que les catégories et le flag is_primary sont corrects

### Test 6 : Suppression en cascade

1. Créer un client avec plusieurs contacts
2. Supprimer le client
3. Vérifier dans Supabase :
   ```sql
   SELECT * FROM client_emails WHERE client_id = 'client-supprimé-uuid';
   SELECT * FROM client_phones WHERE client_id = 'client-supprimé-uuid';
   ```
4. ✅ Vérifier que tous les contacts ont été automatiquement supprimés (0 résultats)

## Évolutions Futures

### Suggestions d'améliorations

1. **Affichage amélioré dans la liste clients**
   - Afficher un badge avec le nombre de contacts supplémentaires
   - Ex: "📧 +3" pour indiquer 3 emails supplémentaires

2. **Recherche avancée**
   - Permettre de rechercher par catégorie de contact
   - Ex: Rechercher tous les clients ayant un email "Comptabilité"

3. **Export**
   - Inclure tous les contacts dans les exports CSV
   - Une ligne par contact ou colonnes séparées

4. **Notifications**
   - Envoyer des emails à des catégories spécifiques
   - Ex: Envoyer la facture à "Comptabilité" et une copie à "Direction"

5. **Intégration PDF**
   - Option pour afficher tous les contacts dans le PDF
   - Ou uniquement les contacts d'une catégorie spécifique

6. **Import**
   - Permettre l'import de contacts multiples via CSV
   - Format : `email1;catégorie1|email2;catégorie2`

## Fichiers Modifiés

### Migrations
- ✅ `supabase/migrations/add_client_multiple_contacts.sql` - Tables client_emails et client_phones

### Types
- ✅ `src/types/index.ts` - Interfaces ClientEmail, ClientPhone, mise à jour de Client

### Composants
- ✅ `src/components/MultiContactManager.tsx` - Nouveau composant de gestion des contacts
- ✅ `src/components/ClientForm.tsx` - Intégration du MultiContactManager
- ✅ `src/components/settings/ListsSettings.tsx` - Ajout des catégories email/phone

### Hooks
- ✅ `src/hooks/useAppData.ts` - Chargement et sauvegarde des contacts multiples

### Contexte
- ✅ `src/contexts/AppContext.tsx` - Mise à jour si nécessaire

## Résumé

✅ Base de données : Tables créées avec RLS
✅ Interface : Composant MultiContactManager opérationnel
✅ Formulaire : Intégré dans ClientForm
✅ Paramètres : Catégories personnalisables
✅ Persistance : Sauvegarde et chargement depuis Supabase
✅ Sécurité : RLS actif sur toutes les tables

**La fonctionnalité est complète et opérationnelle !**

---

**Date de mise en œuvre :** 4 octobre 2025
**Version :** 1.0
**Statut :** ✅ Production Ready
