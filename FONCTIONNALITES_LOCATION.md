# Fonctionnalités de Location

Ce document décrit les nouvelles fonctionnalités de gestion de location ajoutées à l'application, inspirées de Lokki.

## Vue d'ensemble

L'application intègre désormais un système complet de gestion de location d'équipements, permettant de :
- Gérer un inventaire d'équipements
- Créer et suivre des contrats de location
- Gérer les disponibilités et les retours
- Suivre la maintenance des équipements
- Appliquer des tarifs flexibles (jour/semaine/mois)

## Structure de la base de données

### Table `equipment`
Stocke tous les équipements disponibles à la location :
- Informations de base (nom, description, référence, catégorie)
- Informations d'achat (prix, date)
- Statut (disponible, loué, en maintenance, retiré)
- Gestion des quantités (total et disponible)
- Tarification (journalier, hebdomadaire, mensuel)
- Montant de caution
- Image de l'équipement

### Table `rentals`
Gère les contrats de location :
- Numéro de location unique (LOC-YYYY-NNNN)
- Lien avec le client
- Dates de début et fin
- Date de retour effective
- Statut (brouillon, confirmé, en cours, terminé, annulé, en retard)
- Montants (sous-total, TVA, total)
- Gestion des cautions (versée, restituée)
- Statut de paiement

### Table `rental_items`
Détaille les équipements loués dans chaque contrat :
- Lien avec la location et l'équipement
- Quantité louée
- Tarifs au moment de la location
- Type de tarif appliqué (jour/semaine/mois/personnalisé)
- Nombre de jours
- Sous-total

### Table `equipment_maintenance`
Suit l'historique de maintenance des équipements :
- Type de maintenance (réparation, inspection, nettoyage)
- Description et coût
- Date de maintenance et prochaine maintenance planifiée
- Statut (planifié, terminé, annulé)
- Personne ayant effectué la maintenance

## Fonctionnalités principales

### 1. Gestion des équipements

**Page : Équipements**
- Vue en grille avec images
- Filtres par statut et catégorie
- Recherche par nom, référence ou catégorie
- Affichage des disponibilités en temps réel
- Gestion des images d'équipement

**Formulaire d'équipement :**
- Informations générales (nom, description, référence, catégorie)
- Informations d'achat (prix, date)
- Gestion des stocks (quantité totale, disponible)
- Tarification flexible :
  - Tarif journalier (obligatoire)
  - Tarif hebdomadaire (optionnel)
  - Tarif mensuel (optionnel)
  - Calcul automatique des tarifs hebdo/mensuels
- Montant de caution
- Upload d'image

### 2. Système de réservation/location

**Page : Locations**
- Liste des locations avec filtres
- Tri par date, client, statut, montant
- Affichage des équipements loués
- Suivi du statut de paiement
- Actions rapides (modifier, supprimer, marquer comme terminé)

**Formulaire de location :**
- Sélection du client avec recherche
- Dates de début et fin
- Calcul automatique de la durée
- Ajout d'équipements multiples :
  - Sélection de l'équipement
  - Quantité (limitée à la disponibilité)
  - Choix du type de tarif (jour/semaine/mois/personnalisé)
  - Calcul automatique des sous-totaux
- Gestion des cautions (versée/restituée)
- Calcul automatique des totaux (HT, TVA, TTC)
- Numérotation automatique (LOC-YYYY-NNNN)

### 3. Tarification flexible

Le système supporte plusieurs types de tarification :

**Tarif journalier :**
- Calculé : tarif_jour × quantité × nombre_de_jours
- Utilisé par défaut

**Tarif hebdomadaire :**
- Tarif fixe pour une semaine
- Calculé : tarif_semaine × quantité

**Tarif mensuel :**
- Tarif fixe pour un mois
- Calculé : tarif_mois × quantité

**Tarif personnalisé :**
- Permet de saisir un tarif spécifique
- Utile pour les cas particuliers ou promotions

### 4. Gestion des disponibilités

**Mise à jour automatique :**
- Lors de la création d'une location : quantité disponible -= quantité louée
- Lors du retour : quantité disponible += quantité louée
- Lors de la suppression : quantité disponible += quantité louée

**Vérifications :**
- Impossibilité de louer plus que la quantité disponible
- Affichage en temps réel des disponibilités
- Filtrage des équipements disponibles dans le formulaire

### 5. Maintenance des équipements

**Formulaire de maintenance :**
- Type de maintenance (réparation, inspection, nettoyage, autre)
- Description détaillée
- Coût de la maintenance
- Personne ayant effectué l'intervention
- Date de prochaine maintenance
- Statut (planifié, terminé, annulé)

**Suivi :**
- Historique complet des maintenances par équipement
- Planification des maintenances futures
- Suivi des coûts

### 6. Statuts de location

**Brouillon :** Location en cours de création
**Confirmé :** Location validée, en attente de début
**En cours :** Location active
**Terminé :** Équipements retournés
**Annulé :** Location annulée
**En retard :** Date de fin dépassée sans retour

### 7. Gestion des cautions

- Montant de caution défini par équipement
- Suivi du montant versé
- Suivi du montant restitué
- Calcul automatique du solde

## Sécurité (RLS)

Toutes les tables sont protégées par Row Level Security :
- Les utilisateurs ne peuvent voir que leurs propres données
- Restrictions strictes sur les opérations CRUD
- Vérification de l'authentification sur toutes les politiques

## Intégration avec l'existant

Les fonctionnalités de location s'intègrent parfaitement avec :
- **Clients :** Réutilisation de la base clients existante
- **Navigation :** Ajout dans le menu principal
- **Paramètres :** Catégories d'équipements dans les listes personnalisables
- **Recherche et tri :** Utilisation des composants existants

## Évolutions futures possibles

1. **Calendrier de disponibilité :** Vue calendrier pour visualiser les locations
2. **Contrats PDF :** Génération de contrats de location en PDF
3. **Notifications :** Alertes pour les retours en retard
4. **Statistiques de location :** Taux d'utilisation par équipement
5. **Marketplace :** Catalogue en ligne pour réservations clients
6. **Paiements en ligne :** Intégration Stripe pour les cautions
7. **États des lieux :** Photos avant/après location
8. **Planification intelligente :** Suggestions de tarifs basées sur la demande

## Points clés à retenir

- **Tarification flexible :** Jour/Semaine/Mois/Personnalisé
- **Gestion de stock en temps réel :** Disponibilités automatiques
- **Suivi complet :** Locations + Maintenance
- **Multi-quantité :** Location de plusieurs unités du même équipement
- **Cautions :** Gestion complète versement/restitution
- **Sécurité :** RLS strict sur toutes les données

## Comment tester

1. **Créer des équipements :**
   - Aller dans "Équipements"
   - Ajouter quelques équipements avec tarifs et quantités
   - Uploader des images (optionnel)

2. **Créer une location :**
   - Aller dans "Locations"
   - Créer une nouvelle location
   - Sélectionner un client
   - Définir les dates
   - Ajouter des équipements
   - Observer le calcul automatique des totaux

3. **Suivre les disponibilités :**
   - Noter la quantité disponible avant location
   - Créer une location
   - Vérifier que la quantité disponible a diminué
   - Marquer comme terminé
   - Vérifier que la quantité disponible a augmenté

4. **Maintenance :**
   - Créer une maintenance pour un équipement
   - Planifier la prochaine maintenance
   - Suivre l'historique

## Support

Pour toute question ou problème, vérifier :
- Les logs de la console navigateur
- Les erreurs Supabase
- Les politiques RLS
- Les quantités disponibles
