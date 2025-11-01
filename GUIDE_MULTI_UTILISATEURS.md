# Guide de gestion multi-utilisateurs

## Vue d'ensemble

Le système multi-utilisateurs de FacturApp permet de gérer plusieurs utilisateurs avec des rôles et des permissions personnalisables. Chaque utilisateur peut avoir un accès différent aux modules et aux données de l'application.

## Rôles par défaut

### 1. Administrateur
- **Accès complet** à toute l'application
- Peut gérer les utilisateurs et leurs permissions
- Voit tous les documents de tous les utilisateurs
- Peut modifier tous les paramètres

### 2. Associé
- Accès complet aux documents commerciaux :
  - Devis, Factures, Avoirs
  - Clients, Articles
- Peut voir tous les documents
- Peut gérer tous les paramètres métier

### 3. Comptable
- Accès aux documents financiers :
  - Factures et Avoirs
  - Gestion des paiements
- Accès aux clients
- Voit tous les documents financiers

### 4. Salarié
- Accès limité aux devis
- Ne voit **que ses propres documents créés**
- Peut créer des devis et factures
- Accès en lecture seule aux clients

## Niveaux d'accès aux données

Pour chaque permission, vous pouvez définir le niveau d'accès :

### Tous (all)
L'utilisateur voit **tous les documents** de tous les utilisateurs.

**Exemple** : Un comptable avec accès "Tous" aux factures voit toutes les factures de l'entreprise.

### Équipe (team)
L'utilisateur voit les documents de son équipe (fonctionnalité future).

### Propres (own)
L'utilisateur voit **uniquement les documents qu'il a créés lui-même**.

**Exemple** : Un salarié avec accès "Propres" aux devis ne voit que les devis qu'il a créés.

### Aucun (none)
Aucun accès à ce module ou cette action.

## Modules disponibles

- **Tableau de bord** : Statistiques et analytics
- **Devis** : Gestion des devis
- **Factures** : Gestion des factures
- **Avoirs** : Gestion des avoirs
- **Articles** : Catalogue de produits/services
- **Clients** : Gestion des clients
- **Équipements** : Gestion du parc matériel
- **Locations** : Gestion des locations
- **Paramètres** : Configuration de l'application
- **Emails** : Envoi de documents par email
- **Utilisateurs** : Gestion des utilisateurs (réservé aux admins)

## Actions disponibles par module

- **view** : Consulter/Voir
- **create** : Créer de nouveaux éléments
- **edit** : Modifier les éléments existants
- **delete** : Supprimer des éléments
- **validate** : Valider/Émettre les documents
- **manage_payments** : Gérer les paiements (factures uniquement)
- **send** : Envoyer par email (emails uniquement)

## Comment gérer les utilisateurs

### Créer un nouvel utilisateur

1. Allez dans le module **Utilisateurs**
2. Cliquez sur **"Nouvel utilisateur"**
3. Remplissez les informations :
   - Nom complet
   - Email (unique, utilisé pour la connexion)
   - Rôle
   - Statut (actif/inactif)
4. Cliquez sur **"Créer"**

### Personnaliser les permissions d'un utilisateur

1. Dans la liste des utilisateurs, cliquez sur l'icône **bouclier** (🛡️)
2. Vous voyez toutes les permissions du rôle de l'utilisateur
3. Pour chaque permission, choisissez le niveau d'accès :
   - **Tous** : Voir tout
   - **Équipe** : Voir l'équipe
   - **Propres** : Voir uniquement ses créations
   - **Aucun** : Pas d'accès
4. Cliquez sur **"Enregistrer"**

### Désactiver un utilisateur

- Cliquez sur le badge **"Actif"** pour passer l'utilisateur en **"Inactif"**
- Un utilisateur inactif ne peut plus se connecter

## Exemples de configuration

### Exemple 1 : Commercial terrain
**Besoin** : Créer des devis, voir ses propres devis

**Configuration** :
- Rôle : Salarié
- Permissions personnalisées :
  - Devis / Voir : **Propres**
  - Devis / Créer : **Propres**
  - Clients / Voir : **Tous**
  - Autres modules : **Aucun**

### Exemple 2 : Responsable commercial
**Besoin** : Voir tous les devis et factures, gérer l'équipe commerciale

**Configuration** :
- Rôle : Associé
- Permissions par défaut (accès à tout)

### Exemple 3 : Comptable externe
**Besoin** : Accès uniquement aux factures et avoirs, gestion des paiements

**Configuration** :
- Rôle : Comptable
- Permissions par défaut :
  - Factures : **Tous**
  - Avoirs : **Tous**
  - Clients : **Tous** (lecture uniquement)
  - Autres modules : **Aucun**

### Exemple 4 : Stagiaire
**Besoin** : Voir les documents mais ne rien modifier

**Configuration** :
- Rôle : Salarié
- Permissions personnalisées :
  - Devis / Voir : **Tous**
  - Factures / Voir : **Tous**
  - Clients / Voir : **Tous**
  - Toutes les actions Créer/Modifier/Supprimer : **Aucun**

## Sécurité et bonnes pratiques

### Principe du moindre privilège
Donnez **uniquement les accès nécessaires** à chaque utilisateur pour accomplir son travail.

### Revue régulière
- Vérifiez régulièrement les permissions des utilisateurs
- Désactivez les comptes des utilisateurs qui ne font plus partie de l'entreprise
- Ajustez les permissions en fonction de l'évolution des responsabilités

### Protection des données
- Les utilisateurs avec accès "Propres" ne peuvent pas voir les documents des autres
- Les données sensibles (paiements) sont réservées aux rôles avec permissions explicites

### Audit
- Tous les documents conservent la trace de leur créateur
- Les modifications sont traçables

## Migration depuis le mode démo

Si vous utilisez actuellement l'application sans utilisateurs configurés (mode démo), vous êtes automatiquement en mode **Administrateur complet**.

Pour commencer à utiliser le système multi-utilisateurs :

1. Allez dans **Utilisateurs**
2. Créez votre propre compte utilisateur avec le rôle **Administrateur**
3. Créez les comptes de vos collaborateurs
4. Une fois tous les utilisateurs créés, vous pourrez gérer finement les permissions

## Support

Pour toute question sur la gestion des utilisateurs ou des permissions, consultez ce guide ou contactez le support technique.
