# Guide de test complet - Système multi-utilisateurs

## Étape 1 : Accéder au module Utilisateurs

1. Lancez l'application
2. Dans le menu latéral, cliquez sur **"Utilisateurs"** (icône avec plusieurs personnes)
3. Vous devriez voir la page de gestion des utilisateurs

## Étape 2 : Créer votre premier utilisateur

1. Cliquez sur le bouton **"Nouvel utilisateur"** (en haut à droite)
2. Remplissez le formulaire :
   - **Nom complet** : Jean Dupont
   - **Email** : jean.dupont@example.com
   - **Rôle** : Sélectionnez "Administrateur"
   - **Utilisateur actif** : Cochez la case
3. Cliquez sur **"Créer"**

L'utilisateur apparaît maintenant dans la liste !

## Étape 3 : Créer un utilisateur avec un rôle limité

1. Cliquez à nouveau sur **"Nouvel utilisateur"**
2. Remplissez :
   - **Nom complet** : Marie Martin
   - **Email** : marie.martin@example.com
   - **Rôle** : Sélectionnez "Salarié"
   - **Utilisateur actif** : Cochez la case
3. Cliquez sur **"Créer"**

## Étape 4 : Personnaliser les permissions d'un utilisateur

1. Dans la liste des utilisateurs, trouvez "Marie Martin"
2. Cliquez sur l'icône **bouclier** à côté de son nom
3. Une fenêtre s'ouvre avec toutes les permissions disponibles
4. Pour chaque module (Devis, Factures, etc.), vous pouvez modifier les permissions :

### Exemple : Donner accès complet aux devis

Dans la section **"Devis"** :
- **Voir les devis** : Cliquez sur **"Tous"** (au lieu de "Propres")
- **Créer des devis** : Cliquez sur **"Tous"**
- **Modifier les devis** : Cliquez sur **"Tous"**

### Exemple : Retirer l'accès aux factures

Dans la section **"Factures"** :
- Pour toutes les actions : Cliquez sur **"Aucun"**

5. Cliquez sur **"Enregistrer"** en bas

## Étape 5 : Tester les différents rôles

### Administrateur
- Voit **tous les modules** dans le menu
- Peut accéder au module **"Utilisateurs"**
- Voit **tous les documents** de tous les utilisateurs

### Associé
- Voit la plupart des modules (devis, factures, clients, articles)
- **Ne voit PAS** le module "Utilisateurs"
- Voit **tous les documents**

### Comptable
- Voit uniquement : Dashboard, Factures, Avoirs, Clients
- **Ne voit PAS** : Devis, Articles, Utilisateurs
- Voit **tous les documents financiers**

### Salarié (par défaut)
- Voit : Dashboard, Devis, Factures, Avoirs
- Peut **créer** des documents
- Voit **uniquement ses propres documents créés**

## Étape 6 : Comprendre les niveaux d'accès

### Tous (pastille verte)
L'utilisateur voit tous les documents de tous les utilisateurs
- Exemple : Un comptable avec "Tous" sur les factures voit toutes les factures

### Propres (pastille jaune)
L'utilisateur voit uniquement les documents qu'il a créés
- Exemple : Un salarié avec "Propres" sur les devis ne voit que ses devis

### Aucun (pastille grise)
L'utilisateur n'a pas accès à ce module/action
- Le module n'apparaît pas dans le menu

## Cas d'usage pratiques

### Cas 1 : Commercial qui ne voit que ses devis

**Configuration** :
- Rôle : Salarié
- Permissions personnalisées :
  - Devis / Voir : **Propres**
  - Devis / Créer : **Propres**
  - Clients / Voir : **Tous** (pour pouvoir sélectionner des clients)

**Résultat** : Il peut créer des devis et ne voit que les siens.

### Cas 2 : Comptable externe limité

**Configuration** :
- Rôle : Comptable
- Permissions personnalisées :
  - Factures / Voir : **Tous**
  - Factures / Gérer les paiements : **Tous**
  - Factures / Créer/Modifier/Supprimer : **Aucun**

**Résultat** : Il peut consulter les factures et gérer les paiements, mais pas créer ou modifier de documents.

## Points importants

### Hiérarchie des permissions
Les permissions personnalisées **surchargent** les permissions du rôle

### Sécurité
- Seuls les **Administrateurs** peuvent gérer les utilisateurs
- Les autres utilisateurs ne voient même pas le module "Utilisateurs"
- Chaque document garde la trace de son créateur

Votre système multi-utilisateurs est maintenant opérationnel !
