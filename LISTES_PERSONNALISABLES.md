# Listes Personnalisables - Guide Utilisateur

## Vue d'ensemble

L'application permet de personnaliser toutes les listes déroulantes utilisées dans les formulaires. Cela vous permet d'adapter l'application à vos besoins spécifiques.

---

## Comment Accéder aux Listes

1. Aller dans **Paramètres** (icône engrenage dans le menu)
2. Cliquer sur l'onglet **"Listes"**
3. Vous verrez 6 sections personnalisables

---

## Listes Disponibles

### 1. **Civilités**
**Utilisation :** Formulaire client (type Particulier)

**Valeurs par défaut :**
- M.
- Mme

**Comment ajouter :**
1. Taper une nouvelle civilité (ex: "Dr", "Mlle")
2. Appuyer sur Entrée ou cliquer sur le bouton +

**Exemples :**
- Dr
- Mlle
- Me (Maître)
- Pr (Professeur)

---

### 2. **Formes Juridiques** ⭐ NOUVEAU
**Utilisation :** Formulaire client (type Professionnel)

**Valeurs par défaut :**
- SARL
- SAS

**Comment ajouter :**
1. Taper une forme juridique (ex: "EURL", "SA")
2. Appuyer sur Entrée ou cliquer sur le bouton +

**Exemples courants :**
- SARL (Société à Responsabilité Limitée)
- SAS (Société par Actions Simplifiée)
- EURL (Entreprise Unipersonnelle à Responsabilité Limitée)
- SA (Société Anonyme)
- SCI (Société Civile Immobilière)
- Auto-entrepreneur
- Micro-entreprise
- EI (Entreprise Individuelle)
- SASU (Société par Actions Simplifiée Unipersonnelle)

---

### 3. **Unités**
**Utilisation :** Formulaire article, lignes de devis/factures

**Valeurs par défaut :**
- unité
- heure
- jour

**Exemples supplémentaires :**
- m² (mètre carré)
- m³ (mètre cube)
- kg (kilogramme)
- litre
- forfait
- mois
- semaine

---

### 4. **Catégories d'Articles**
**Utilisation :** Formulaire article

**Valeurs par défaut :**
- Services

**Exemples :**
- Matériaux
- Main d'œuvre
- Déplacement
- Fournitures
- Consultation
- Formation

---

### 5. **Modes de Paiement**
**Utilisation :** Formulaire client, devis, factures

**Valeurs par défaut :**
- virement
- chèque

**Exemples :**
- Espèces
- Carte bancaire
- Prélèvement
- PayPal
- Traite
- Lettre de change

---

### 6. **Conditions de Règlement**
**Utilisation :** Devis, factures (sélection rapide)

**Valeurs par défaut :**
- Règlement comptant
- Règlement fin de travaux
- 30% à la commande - 70% à livraison
- 50% à la commande - 50% fin de travaux
- Règlement en 3 fois sans frais
- Règlement sous 30 jours net
- Règlement sous 15 jours net

**Exemples supplémentaires :**
- Règlement sous 45 jours fin de mois
- Règlement sous 60 jours
- Acompte 40% à la commande, solde à livraison
- Paiement en 4 fois sans frais

---

## Utilisation dans les Formulaires

### Formulaire Client - Type Particulier
Lorsque vous créez un client particulier :

1. **Civilité** : Liste déroulante avec vos civilités personnalisées
   - Obligatoire : Non
   - Exemple : "M.", "Mme", "Dr"

2. **Prénom** et **Nom** : Champs texte libres (obligatoires)

### Formulaire Client - Type Professionnel ⭐ NOUVEAU
Lorsque vous créez un client professionnel :

1. **Raison sociale** : Champ texte libre (obligatoire)
   - Exemple : "ABC Services SARL"

2. **Forme juridique** : Liste déroulante avec vos formes juridiques personnalisées
   - Obligatoire : Non
   - Exemple : "SARL", "SAS", "EURL"
   - Cette information sera affichée dans les documents si renseignée

---

## Comment Personnaliser

### Ajouter un élément

1. Aller dans **Paramètres > Listes**
2. Trouver la section de la liste à modifier
3. Taper le nouvel élément dans le champ de saisie
4. Appuyer sur **Entrée** ou cliquer sur le bouton **+**
5. Cliquer sur **Sauvegarder** en bas de page

### Supprimer un élément

1. Aller dans **Paramètres > Listes**
2. Trouver l'élément à supprimer
3. Cliquer sur l'icône **poubelle** (🗑️) à droite
4. Cliquer sur **Sauvegarder** en bas de page

⚠️ **Attention :** La suppression d'un élément n'affecte pas les documents existants qui l'utilisent.

---

## Persistance des Données

- ✅ Toutes les modifications sont sauvegardées dans Supabase
- ✅ Les listes sont partagées au niveau de l'entreprise
- ✅ Tous les utilisateurs de la même entreprise voient les mêmes listes
- ✅ Les listes sont chargées automatiquement au démarrage

---

## Exemples d'Usage

### Scénario 1 : Entreprise de BTP

**Formes juridiques ajoutées :**
- SARL
- SAS
- EURL
- Auto-entrepreneur

**Unités ajoutées :**
- m² (mètre carré)
- m³ (mètre cube)
- tonne
- forfait

**Catégories ajoutées :**
- Gros œuvre
- Second œuvre
- Électricité
- Plomberie
- Peinture

### Scénario 2 : Consultant Freelance

**Formes juridiques ajoutées :**
- Micro-entreprise
- EURL
- SASU

**Unités ajoutées :**
- heure
- jour
- demi-journée
- forfait
- projet

**Catégories ajoutées :**
- Consultation
- Développement
- Formation
- Audit

### Scénario 3 : Commerce de Détail

**Formes juridiques ajoutées :**
- SARL
- SAS
- EURL

**Unités ajoutées :**
- unité
- lot
- carton
- palette

**Catégories ajoutées :**
- Alimentaire
- Non-alimentaire
- Produits frais
- Surgelés

---

## Fonctionnalités Avancées

### Tri Automatique
Les listes ne sont pas triées automatiquement - elles apparaissent dans l'ordre d'ajout. Pour réorganiser :
1. Supprimer les éléments
2. Les ajouter dans l'ordre souhaité

### Valeurs par Défaut
Certaines valeurs par défaut ne peuvent pas être supprimées si elles sont utilisées dans le code :
- Pour les modes de paiement : "virement" est utilisé par défaut
- Pour les unités : "unité" est utilisé par défaut

### Synchronisation
- Les modifications sont synchronisées en temps réel dans Supabase
- Si la connexion échoue, les modifications sont sauvegardées localement
- Elles seront synchronisées à la prochaine connexion

---

## Conseils d'Utilisation

### ✅ Bonnes Pratiques

1. **Soyez concis** : Utilisez des abréviations standard (SARL, SAS)
2. **Uniformisez** : Choisissez une convention (tout en majuscules ou avec majuscule initiale)
3. **Limitez le nombre** : N'ajoutez que ce dont vous avez réellement besoin
4. **Testez** : Créez un client de test pour vérifier l'affichage

### ❌ À Éviter

1. ❌ Ne pas créer de doublons (ex: "SARL" et "sarl")
2. ❌ Ne pas utiliser de caractères spéciaux non standard
3. ❌ Ne pas créer de listes trop longues (préférez 5-10 éléments max)

---

## Résumé des Améliorations

### Avant
- Civilités : ✅ Déjà présent
- Formes juridiques : ❌ Non disponible

### Après ⭐
- Civilités : ✅ Personnalisable dans Paramètres
- Formes juridiques : ✅ Personnalisable dans Paramètres
- Formulaire client : ✅ Utilise automatiquement les listes
- Sauvegarde Supabase : ✅ Persistance complète

---

## Support

En cas de question :
1. Vérifier que vous avez sauvegardé vos modifications
2. Actualiser la page (F5)
3. Vérifier la console du navigateur (F12) pour les erreurs
4. Consulter ETAT_FINAL_APPLICATION.md pour le diagnostic

**Fonctionnalité testée et opérationnelle** ✓
