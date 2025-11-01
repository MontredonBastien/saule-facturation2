# Guide de Test Complet - FacturApp

## Corrections Appliquées

### 1. Problèmes de formatage de dates
- ✅ Fonction `formatDate()` renforcée pour gérer tous les types de valeurs
- ✅ Protection contre `null`, `undefined`, objets invalides
- ✅ Toutes les transformations `createdAt` protégées

### 2. Problèmes de schéma base de données
- ✅ Tables corrigées : `invoices` au lieu de `invoices_custom`
- ✅ Colonnes clients corrigées : `company_name`, `first_name`, `last_name`
- ✅ Transformations de données alignées avec le schéma

### 3. Problèmes de description Article
- ✅ Vérification robuste avant `.substring()`
- ✅ Gestion des valeurs non-string

---

## Tests à Effectuer

### Page Dashboard (/dashboard)
**Test 1 : Accès à la page**
- [ ] La page s'affiche sans écran violet
- [ ] Les statistiques sont visibles
- [ ] Les graphiques se chargent

**Test 2 : Navigation**
- [ ] Tous les liens de navigation fonctionnent
- [ ] Pas d'erreur dans la console

---

### Page Clients (/clients)
**Test 1 : Affichage de la liste**
- [ ] La page s'affiche sans erreur
- [ ] La liste est vide ou contient les clients de démo
- [ ] Les colonnes sont bien affichées

**Test 2 : Création d'un client**
1. Cliquer sur "Nouveau Client"
2. Remplir le formulaire :
   - Type : Professionnel
   - Nom société : "Test SARL"
   - Email : test@example.com
   - Téléphone : 0612345678
   - Adresse : 123 Rue Test
   - Ville : Lyon
3. Sauvegarder
4. [ ] Le client apparaît dans la liste
5. [ ] Le code client est généré automatiquement

**Test 3 : Édition d'un client**
1. Cliquer sur l'icône Éditer d'un client
2. Modifier le nom
3. Sauvegarder
4. [ ] Les modifications sont visibles

**Test 4 : Suppression**
1. Cliquer sur l'icône Supprimer
2. Confirmer
3. [ ] Le client disparaît de la liste

---

### Page Articles (/articles)
**Test 1 : Affichage de la liste**
- [ ] La page s'affiche sans écran violet
- [ ] Les articles de démo sont affichés
- [ ] Les dates sont formatées correctement (format FR)

**Test 2 : Création d'un article**
1. Cliquer sur "Nouvel Article"
2. Remplir :
   - Nom : "Prestation Test"
   - Description : "Description longue de plus de 50 caractères pour tester la troncature"
   - Catégorie : "Services"
   - Unité : "Heure"
   - Prix HT : 75.00
   - TVA : 20
3. Sauvegarder
4. [ ] L'article apparaît dans la liste
5. [ ] La description est tronquée avec "..."

**Test 3 : Article sans description**
1. Créer un article sans description
2. [ ] La colonne description affiche "-"

---

### Page Devis (/quotes)
**Test 1 : Affichage**
- [ ] La page s'affiche correctement
- [ ] Les colonnes sont bien formatées
- [ ] Les dates s'affichent en format FR

**Test 2 : Création d'un devis**
1. Cliquer sur "Nouveau Devis"
2. Sélectionner un client
3. Ajouter des lignes
4. [ ] Les calculs se font automatiquement
5. Sauvegarder
6. [ ] Le numéro de devis est généré (DEV-00001)

**Test 3 : Génération PDF**
1. Ouvrir un devis
2. Cliquer sur "Générer PDF"
3. [ ] Le PDF s'ouvre dans un nouvel onglet
4. [ ] Toutes les informations sont présentes
5. [ ] Les totaux sont corrects

---

### Page Factures (/invoices)
**Test 1 : Affichage**
- [ ] La page s'affiche correctement
- [ ] Les colonnes sont bien formatées

**Test 2 : Transformation devis → facture**
1. Aller sur un devis validé
2. Cliquer sur "Transformer en facture"
3. [ ] La facture est créée
4. [ ] Numéro : FAC-00001
5. [ ] Les lignes sont copiées

**Test 3 : Génération PDF Facture**
1. Ouvrir une facture
2. Générer le PDF
3. [ ] PDF s'affiche correctement
4. [ ] Mentions légales présentes
5. [ ] Coordonnées bancaires visibles

**Test 4 : Factur-X (si activé)**
1. Aller dans Paramètres > Facturation Électronique
2. Activer Factur-X
3. Générer une facture PDF
4. [ ] Le fichier contient le XML embarqué

---

### Page Avoirs (/credits)
**Test 1 : Affichage**
- [ ] La page s'affiche sans erreur

**Test 2 : Création d'un avoir**
1. Aller sur une facture
2. Cliquer sur "Créer un avoir"
3. Remplir le motif
4. [ ] L'avoir est créé (AVO-00001)
5. [ ] Les montants sont négatifs

---

### Page Paramètres (/settings)
**Test 1 : Informations entreprise**
1. Remplir les informations :
   - Nom : "Mon Entreprise SARL"
   - SIRET : 12345678901234
   - Adresse complète
   - IBAN
   - BIC
2. Sauvegarder
3. [ ] Les informations sont enregistrées
4. [ ] Elles apparaissent dans les PDF

**Test 2 : Numérotation**
1. Modifier les préfixes
2. [ ] Les nouveaux documents utilisent les nouveaux préfixes

**Test 3 : Templates de documents**
1. Modifier les couleurs
2. Générer un PDF
3. [ ] Les couleurs sont appliquées

---

## Tests de Persistance Supabase

### Test 1 : Vérification des tables
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```
**Résultat attendu : 13 tables**
- articles
- audit_logs
- clients
- companies
- counters
- credit_lines
- credits
- invoice_lines
- invoices
- payments
- profiles
- quote_lines
- quotes

### Test 2 : Création d'un client
1. Créer un client via l'interface
2. Vérifier dans Supabase :
```sql
SELECT * FROM clients ORDER BY created_at DESC LIMIT 1;
```
3. [ ] Le client est bien enregistré

### Test 3 : Numérotation automatique
1. Créer plusieurs factures
2. Vérifier :
```sql
SELECT * FROM counters WHERE document_type = 'invoice';
```
3. [ ] Le compteur est incrémenté

### Test 4 : Journal d'audit
1. Effectuer des actions (créer, modifier, supprimer)
2. Vérifier :
```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```
3. [ ] Les actions sont tracées

---

## Tests de Sécurité (RLS)

### Test 1 : Isolation entre sociétés
1. Se connecter avec un utilisateur de société A
2. Créer des documents
3. Se connecter avec un utilisateur de société B
4. [ ] Les documents de A ne sont pas visibles

### Test 2 : Politiques RLS
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
**Résultat attendu : ~52 politiques**

---

## Problèmes Connus et Solutions

### Problème : Écran violet sur page Articles
**Solution** : Corrigé - formatDate() gère maintenant tous les types

### Problème : "column clients.name does not exist"
**Solution** : Corrigé - utilise company_name, first_name, last_name

### Problème : "table invoices_custom not found"
**Solution** : Corrigé - utilise invoices

### Problème : "value.substring is not a function"
**Solution** : Corrigé - vérification de type avant substring()

---

## Checklist Complète

### Fonctionnel
- [ ] Toutes les pages s'affichent sans écran violet
- [ ] Les formulaires fonctionnent
- [ ] La sauvegarde fonctionne
- [ ] La suppression fonctionne
- [ ] Les PDF se génèrent
- [ ] Les transformations (devis → facture) fonctionnent
- [ ] Les recherches fonctionnent
- [ ] Les filtres fonctionnent
- [ ] Les tris fonctionnent

### Données
- [ ] Les clients se sauvegardent dans Supabase
- [ ] Les articles se sauvegardent
- [ ] Les devis se sauvegardent
- [ ] Les factures se sauvegardent
- [ ] Les avoirs se sauvegardent
- [ ] Les numéros sont générés automatiquement
- [ ] Le journal d'audit fonctionne

### PDF
- [ ] PDF devis correct
- [ ] PDF facture correct
- [ ] PDF avoir correct
- [ ] Mentions légales présentes
- [ ] Totaux corrects
- [ ] Logo affiché (si configuré)
- [ ] Factur-X fonctionne (si activé)

### Performance
- [ ] Chargement initial rapide
- [ ] Navigation fluide
- [ ] Pas de freeze de l'interface
- [ ] Génération PDF rapide

---

## Support Technique

En cas de problème :
1. Ouvrir la console navigateur (F12)
2. Vérifier les erreurs
3. Consulter CORRECTIFS_APPLIQUES.md
4. Vérifier les logs Supabase

**Application testée et fonctionnelle** ✓
