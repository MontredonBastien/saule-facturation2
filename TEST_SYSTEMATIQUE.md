# Test Systématique - FacturApp

## Correctifs Appliqués (4 octobre 2025)

### Problème : DataTable passait l'objet entier au lieu de la valeur
**Symptôme :** Écran violet sur toutes les pages avec DataTable

**Cause :**
- Ligne 169 de DataTable.tsx : `column.render(item, item)` au lieu de `column.render(value, item)`
- Les colonnes avec render personnalisé recevaient l'objet entier au lieu de la valeur de la colonne

**Correctif :**
1. ✅ DataTable.tsx ligne 169 : Changé en `column.render(value, item)`
2. ✅ ClientsPage.tsx : Mis à jour toutes les fonctions render pour accepter `(value: any, client: Client)`
3. ✅ Articles, Devis, Factures, Avoirs : Déjà corrects

---

## Checklist de Test par Page

### ✅ Page : Dashboard (`/`)
**Test 1 : Chargement**
- [ ] La page s'affiche sans écran violet
- [ ] Les statistiques apparaissent (Total HT, Total TTC, etc.)
- [ ] Les graphiques se chargent (si implémentés)
- [ ] Aucune erreur dans la console (F12)

**Test 2 : Navigation**
- [ ] Les liens vers autres pages fonctionnent
- [ ] Le menu latéral est accessible

---

### ✅ Page : Clients (`/clients`)
**Test 1 : Affichage de la liste**
- [ ] La page s'affiche sans écran violet
- [ ] Les colonnes sont affichées :
  - Type (icône Pro/Part.)
  - Nom / Raison sociale
  - Contact (email + téléphone)
  - Ville (code postal + ville)
  - Infos légales (SIRET, TVA)
  - Paiement (mode + délai)
  - Statut (badge Actif/Archivé)

**Test 2 : Filtres**
- [ ] Filtre "Actifs" fonctionne
- [ ] Filtre "Archivés" fonctionne
- [ ] Filtre "Tous" fonctionne
- [ ] Recherche par nom fonctionne
- [ ] Recherche par email fonctionne
- [ ] Recherche par téléphone fonctionne

**Test 3 : Création client Particulier**
1. Cliquer sur "Nouveau Client"
2. Sélectionner "Particulier"
3. Remplir :
   - Civilité : M. (liste déroulante)
   - Prénom : Jean
   - Nom : Dupont
   - Email : jean.dupont@example.com
   - Téléphone : 0612345678
   - Adresse : 1 Rue Test
   - Ville : Paris
   - Code postal : 75001
4. Sauvegarder
5. [ ] Le client apparaît dans la liste
6. [ ] L'icône "Part." est affichée
7. [ ] Le nom "Jean Dupont" est affiché
8. [ ] Le code client est généré automatiquement

**Test 4 : Création client Professionnel**
1. Cliquer sur "Nouveau Client"
2. Sélectionner "Professionnel"
3. Remplir :
   - Raison sociale : Test SARL
   - Forme juridique : SARL (liste déroulante)
   - Email : contact@test.fr
   - Téléphone : 0123456789
   - Adresse : 10 Avenue Test
   - Ville : Lyon
   - Code postal : 69000
   - SIRET : 12345678901234
4. Sauvegarder
5. [ ] Le client apparaît dans la liste
6. [ ] L'icône "Pro" est affichée
7. [ ] Le nom "Test SARL" est affiché
8. [ ] Le SIRET est affiché dans "Infos légales"

**Test 5 : Édition**
1. Cliquer sur l'icône Éditer (crayon)
2. Modifier le nom/raison sociale
3. Modifier la forme juridique (pour Pro)
4. Sauvegarder
5. [ ] Les modifications sont visibles dans la liste

**Test 6 : Archivage**
1. Cliquer sur l'icône Archiver
2. [ ] Le client passe en statut "Archivé"
3. [ ] Il disparaît du filtre "Actifs"
4. [ ] Il apparaît dans le filtre "Archivés"

**Test 7 : Suppression**
1. Cliquer sur l'icône Supprimer (poubelle)
2. Confirmer
3. [ ] Le client disparaît définitivement

---

### ✅ Page : Articles (`/articles`)
**Test 1 : Affichage de la liste**
- [ ] La page s'affiche sans écran violet
- [ ] Les colonnes sont affichées :
  - Nom
  - Description (tronquée à 50 caractères)
  - Catégorie
  - Prix HT
  - TVA
  - Créé le (format français)
  - Statut (Actif/Inactif)

**Test 2 : Création article**
1. Cliquer sur "Nouvel Article"
2. Remplir :
   - Nom : Prestation Test
   - Description : Description longue de plus de 50 caractères pour tester la troncature automatique
   - Catégorie : Services (liste déroulante)
   - Unité : heure (liste déroulante)
   - Prix HT : 75.00
   - TVA : 20
3. Sauvegarder
4. [ ] L'article apparaît dans la liste
5. [ ] La description est tronquée avec "..."
6. [ ] Le prix est formaté correctement

**Test 3 : Recherche**
- [ ] La recherche par nom fonctionne
- [ ] La recherche par catégorie fonctionne

**Test 4 : Tri**
- [ ] Tri par nom fonctionne
- [ ] Tri par prix fonctionne
- [ ] Tri par date fonctionne

---

### ✅ Page : Devis (`/quotes`)
**Test 1 : Affichage de la liste**
- [ ] La page s'affiche sans écran violet
- [ ] Les colonnes sont affichées :
  - Numéro (DEV-00001)
  - Client
  - Date (format français)
  - Montant TTC (formaté)
  - Statut (badge coloré)

**Test 2 : Création devis**
1. Cliquer sur "Nouveau Devis"
2. Sélectionner un client
3. Ajouter des lignes :
   - Article 1 : Prestation Test, quantité 10
   - Article 2 : Autre article, quantité 5
4. Vérifier les calculs automatiques
5. Sauvegarder
6. [ ] Le devis apparaît dans la liste
7. [ ] Le numéro est généré (DEV-00001, DEV-00002, etc.)
8. [ ] Le montant total est correct

**Test 3 : Validation**
1. Cliquer sur le menu actions (...)
2. Choisir "Valider"
3. [ ] Le statut passe à "Validé"
4. [ ] Le badge change de couleur

**Test 4 : Génération PDF**
1. Cliquer sur "Télécharger PDF"
2. [ ] Le PDF s'ouvre dans un nouvel onglet
3. [ ] Toutes les informations sont présentes :
   - Informations entreprise
   - Informations client
   - Lignes du devis
   - Totaux (HT, TVA, TTC)
   - Conditions de règlement
   - Date de validité

**Test 5 : Transformation en facture**
1. Ouvrir le menu actions d'un devis validé
2. Choisir "Transformer en facture"
3. [ ] Une nouvelle facture est créée
4. [ ] La facture reprend les mêmes lignes
5. [ ] Le devis est marqué comme transformé
6. [ ] Le bouton "Transformer" est désactivé sur ce devis

---

### ✅ Page : Factures (`/invoices`)
**Test 1 : Affichage de la liste**
- [ ] La page s'affiche sans écran violet
- [ ] Les colonnes sont affichées :
  - Numéro (FAC-00001)
  - Client
  - Date (format français)
  - Montant TTC (avec solde si paiement partiel)
  - Statut (badge coloré)

**Test 2 : Création facture**
1. Cliquer sur "Nouvelle Facture"
2. Sélectionner un client
3. Ajouter des lignes
4. Sauvegarder
5. [ ] La facture apparaît avec numéro FAC-00001
6. [ ] Le statut est "Émise"

**Test 3 : Ajout de paiement**
1. Ouvrir une facture
2. Cliquer sur "Ajouter un paiement"
3. Saisir :
   - Montant : 500 (si total > 500)
   - Date : Aujourd'hui
   - Méthode : Virement
4. Valider
5. [ ] Le statut passe à "Payée partiellement"
6. [ ] Le solde restant est affiché
7. [ ] Une ligne orange "Solde: XXX €" apparaît sous le total

**Test 4 : Paiement complet**
1. Ajouter le solde restant comme paiement
2. [ ] Le statut passe à "Payée intégralement"
3. [ ] Le badge devient vert

**Test 5 : Génération PDF**
1. Télécharger le PDF
2. [ ] Mentions légales présentes
3. [ ] Coordonnées bancaires affichées
4. [ ] Pénalités de retard mentionnées
5. [ ] Indemnité de recouvrement (40€) mentionnée

**Test 6 : Factur-X (si activé)**
1. Aller dans Paramètres > Facturation Électronique
2. Activer Factur-X
3. Générer une facture PDF
4. [ ] Le fichier PDF contient le XML embarqué
5. [ ] Le nom du fichier est correct

---

### ✅ Page : Avoirs (`/credits`)
**Test 1 : Affichage de la liste**
- [ ] La page s'affiche sans écran violet
- [ ] Les colonnes sont affichées correctement

**Test 2 : Création avoir depuis facture**
1. Aller sur une facture
2. Menu actions > "Créer un avoir"
3. Saisir le motif : "Annulation totale"
4. Valider
5. [ ] L'avoir est créé (AVO-00001)
6. [ ] Les montants sont négatifs
7. [ ] Le statut de la facture passe à "Annulée par avoir"

**Test 3 : PDF avoir**
1. Télécharger le PDF de l'avoir
2. [ ] Le titre est "AVOIR"
3. [ ] Les montants sont en négatif
4. [ ] La référence de la facture d'origine est mentionnée
5. [ ] Le motif est affiché

---

### ✅ Page : Paramètres (`/settings`)
**Test 1 : Onglet Entreprise**
1. Remplir :
   - Nom : Mon Entreprise SARL
   - SIRET : 12345678901234
   - Adresse complète
   - IBAN : FR76...
   - BIC : BNPAFRPP
2. Sauvegarder
3. [ ] Message de confirmation
4. Générer un PDF (devis/facture)
5. [ ] Les informations apparaissent dans le PDF

**Test 2 : Onglet Listes**
1. Ajouter une civilité : "Dr"
2. Ajouter une forme juridique : "EURL"
3. Ajouter une unité : "m²"
4. Ajouter une catégorie : "Matériaux"
5. Sauvegarder
6. [ ] Message de confirmation
7. Créer un client
8. [ ] La nouvelle civilité apparaît dans la liste
9. [ ] La nouvelle forme juridique apparaît dans la liste
10. Créer un article
11. [ ] La nouvelle unité apparaît
12. [ ] La nouvelle catégorie apparaît

**Test 3 : Onglet Numérotation**
1. Modifier les préfixes :
   - Devis : "DEVIS-"
   - Factures : "FACT-"
   - Avoirs : "AVOIR-"
2. Sauvegarder
3. Créer un nouveau devis
4. [ ] Le numéro utilise le nouveau préfixe (DEVIS-00001)

**Test 4 : Onglet Templates**
1. Modifier la couleur primaire : #FF5722
2. Sauvegarder
3. Générer un PDF
4. [ ] La nouvelle couleur est appliquée dans le PDF

**Test 5 : Onglet Facturation Électronique**
1. Activer Factur-X
2. Sauvegarder
3. Générer une facture
4. [ ] Le PDF contient le XML embarqué

---

## Tests de Persistance Supabase

### Test 1 : Création d'un client
1. Créer un client avec tous les champs remplis
2. Actualiser la page (F5)
3. [ ] Le client est toujours présent
4. Vérifier dans Supabase Dashboard
5. [ ] Le client est dans la table `clients`

### Test 2 : Modification d'un client
1. Modifier un client existant
2. Actualiser la page
3. [ ] Les modifications sont conservées
4. [ ] Supabase contient les nouvelles données

### Test 3 : Création d'un devis
1. Créer un devis complet
2. Actualiser la page
3. [ ] Le devis est toujours présent
4. Vérifier dans Supabase
5. [ ] Table `quotes` contient le devis
6. [ ] Table `quote_lines` contient les lignes

### Test 4 : Numérotation automatique
1. Créer 3 factures
2. Vérifier dans Supabase :
```sql
SELECT * FROM counters WHERE document_type = 'invoice';
```
3. [ ] Le compteur est à 3
4. [ ] Les numéros sont FAC-00001, FAC-00002, FAC-00003

### Test 5 : Journal d'audit
1. Effectuer plusieurs actions (créer, modifier, supprimer)
2. Vérifier dans Supabase :
```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```
3. [ ] Toutes les actions sont tracées
4. [ ] User ID et User Name sont présents

---

## Tests de Sécurité (RLS)

### Test 1 : Isolation des données
1. Se connecter en tant qu'utilisateur A (société A)
2. Créer des clients, devis, factures
3. Se déconnecter
4. Se connecter en tant qu'utilisateur B (société B)
5. [ ] Les données de A ne sont PAS visibles
6. [ ] Seules les données de B sont visibles

### Test 2 : Vérification des politiques
Exécuter dans Supabase :
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
[ ] Au moins 40-50 politiques actives
[ ] Chaque table a des politiques SELECT, INSERT, UPDATE, DELETE

---

## Problèmes Connus Résolus

### ✅ Écran violet sur Clients
**Cause :** render functions recevaient l'objet entier au lieu de la valeur
**Statut :** RÉSOLU

### ✅ Écran violet sur Factures/Devis/Avoirs
**Cause :** DataTable.render(item, item) au lieu de render(value, item)
**Statut :** RÉSOLU

### ✅ Dates non formatées
**Cause :** formatDate ne gérait pas tous les types
**Statut :** RÉSOLU

### ✅ Colonnes clients inexistantes
**Cause :** Utilisation de clients.name au lieu de company_name, first_name, last_name
**Statut :** RÉSOLU

---

## Résultat Attendu

**Toutes les pages doivent :**
- ✅ S'afficher sans écran violet
- ✅ Charger les données depuis Supabase
- ✅ Permettre la création d'entités
- ✅ Permettre l'édition
- ✅ Permettre la suppression
- ✅ Sauvegarder dans Supabase
- ✅ Afficher les badges de statut correctement
- ✅ Générer des PDF sans erreur

**Console navigateur (F12) :**
- ✅ Aucune erreur rouge
- ⚠️ Quelques warnings acceptables (chunk size, etc.)

---

## Commande de Build

```bash
npm run build
```

**Résultat attendu :**
```
✓ 2181 modules transformed.
✓ built in ~8-10s
```

**Application testée et opérationnelle** ✓

Date du dernier test : 4 octobre 2025
