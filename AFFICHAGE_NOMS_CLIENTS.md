# Affichage des Noms de Clients avec Civilité et Forme Juridique

## Vue d'ensemble

Le système affiche maintenant automatiquement la civilité (M., Mme, Dr, etc.) ou la forme juridique (SARL, SAS, EURL, etc.) devant le nom des clients dans toute l'application.

## Exemples d'affichage

### Clients Particuliers
- **M. Jean Dupont** (au lieu de "Jean Dupont")
- **Mme Marie Martin** (au lieu de "Marie Martin")
- **Dr Pierre Leroy** (au lieu de "Pierre Leroy")

### Clients Professionnels
- **SARL du Saule à l'Arbre** (au lieu de "du Saule à l'Arbre")
- **SAS TechCorp** (au lieu de "TechCorp")
- **EURL Consulting Plus** (au lieu de "Consulting Plus")

## Zones concernées

Cette fonctionnalité s'applique partout dans l'application :

### 📋 Pages principales
- **Page Clients** : Liste complète avec colonnes Type, Nom, Contact, etc.
- **Page Devis** : Colonne "Client" dans la liste
- **Page Factures** : Colonne "Client" dans la liste
- **Page Avoirs** : Colonne "Client" dans la liste
- **Dashboard** : Analyse des clients (Top 5)

### 🔍 Composants de recherche
- **ClientSearchInput** : Recherche de client avec autocomplétion
  - Affichage dans la liste déroulante
  - Affichage du client sélectionné

### 📊 Graphiques et analyses
- **ClientAnalysis** : Top 5 des clients avec forme juridique/civilité

### 📄 Génération de documents
- **PDF Devis** : Nom du client dans l'en-tête
- **PDF Factures** : Nom du client dans l'en-tête
- **PDF Avoirs** : Nom du client dans l'en-tête
- **Factur-X (XML)** : Nom complet dans les métadonnées XML
- **Téléchargement en masse** : Noms de fichiers avec forme juridique/civilité

## Implémentation technique

### Fonction standardisée

Toutes les pages utilisent maintenant une fonction standardisée :

```typescript
const getClientName = (clientId: string) => {
  const client = clients.find(c => c.id === clientId);
  if (!client) return 'Client inconnu';

  if (client.type === 'pro') {
    const legalForm = client.legalForm ? `${client.legalForm} ` : '';
    return `${legalForm}${client.companyName || 'Sans nom'}`;
  }
  const civility = client.civility ? `${client.civility} ` : '';
  return `${civility}${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Sans nom';
};
```

### Fichiers modifiés

#### Pages
- ✅ `src/pages/ClientsPage.tsx` - getClientDisplayName()
- ✅ `src/pages/InvoicesPage.tsx` - getClientName()
- ✅ `src/pages/QuotesPage.tsx` - getClientName()
- ✅ `src/pages/CreditsPage.tsx` - getClientName()

#### Composants
- ✅ `src/components/ClientSearchInput.tsx` - getClientDisplayName()
- ✅ `src/components/charts/ClientAnalysis.tsx` - Inline dans topClients.map()

#### Utilitaires
- ✅ `src/utils/pdfGenerator.ts` - Génération PDF avec nom complet
- ✅ `src/utils/facturXGenerator.ts` - getClientName() pour XML
- ✅ `src/utils/bulkDownload.ts` - Noms de fichiers

#### Services
- ✅ `src/services/documentActions.ts` - Téléchargement de documents

## Gestion des listes personnalisables

Les civilités et formes juridiques sont configurables via **Paramètres > Listes**.

### Civilités par défaut
- M.
- Mme
- Mlle
- Dr
- Me (Maître)
- Pr (Professeur)

### Formes juridiques par défaut
- SARL
- SAS
- SASU
- EURL
- SA
- SCI
- Auto-entrepreneur
- Association
- Autre

### Ajouter de nouvelles entrées

1. Aller dans **Paramètres** > **Listes**
2. Section "Civilités" :
   - Ajouter par exemple : "Mgr" (Monseigneur)
   - Cliquer sur le bouton "Ajouter"
3. Section "Formes juridiques" :
   - Ajouter par exemple : "GIE" (Groupement d'Intérêt Économique)
   - Cliquer sur le bouton "Ajouter"
4. Sauvegarder

Les nouvelles entrées apparaissent immédiatement dans tous les formulaires de création/édition de clients.

## Cas particuliers

### Client sans civilité/forme juridique

Si un client n'a pas de civilité (particulier) ou de forme juridique (professionnel) :
- **Particulier** : Affiche uniquement "Prénom Nom" (ex: "Jean Dupont")
- **Professionnel** : Affiche uniquement la raison sociale (ex: "TechCorp")

### Client sans nom

Si les champs nom sont vides :
- Affiche "Sans nom" au lieu de laisser vide

### Recherche et tri

La recherche fonctionne sur :
- La forme juridique/civilité
- Le nom complet
- L'email
- Le code client
- La ville

**Exemple :** Rechercher "SARL" retournera tous les clients de type SARL.

## Tests à effectuer

### Test 1 : Création client particulier avec civilité
1. Créer un nouveau client particulier
2. Sélectionner civilité : "M."
3. Prénom : Jean
4. Nom : Dupont
5. Sauvegarder
6. ✅ Vérifier que la liste affiche "M. Jean Dupont"

### Test 2 : Création client pro avec forme juridique
1. Créer un nouveau client professionnel
2. Sélectionner forme juridique : "SARL"
3. Raison sociale : du Saule à l'Arbre
4. Sauvegarder
5. ✅ Vérifier que la liste affiche "SARL du Saule à l'Arbre"

### Test 3 : Recherche par forme juridique
1. Dans la page Clients
2. Taper "SARL" dans la recherche
3. ✅ Tous les clients SARL apparaissent

### Test 4 : PDF avec forme juridique
1. Créer une facture pour "SARL du Saule à l'Arbre"
2. Télécharger le PDF
3. ✅ Vérifier que l'en-tête CLIENT affiche "SARL DU SAULE À L'ARBRE"

### Test 5 : Recherche client dans formulaire
1. Créer un nouveau devis
2. Utiliser le champ de recherche client
3. ✅ La liste déroulante affiche les civilités/formes juridiques
4. ✅ Le client sélectionné affiche la civilité/forme juridique

### Test 6 : Analyse clients (Dashboard)
1. Aller au Dashboard
2. Consulter le Top 5 des clients
3. ✅ Les noms affichent les civilités/formes juridiques

### Test 7 : Téléchargement en masse
1. Page Factures
2. Cocher plusieurs factures
3. Télécharger le ZIP
4. ✅ Les noms de fichiers contiennent les formes juridiques/civilités

## Base de données

Les champs utilisés dans la table `clients` :

### Pour les particuliers
- `type` = 'particulier'
- `civility` : Civilité (M., Mme, etc.)
- `first_name` : Prénom
- `last_name` : Nom

### Pour les professionnels
- `type` = 'pro'
- `legal_form` : Forme juridique (SARL, SAS, etc.)
- `company_name` : Raison sociale

## Personnalisation

Pour modifier les listes par défaut, éditer le fichier de migration :
`supabase/migrations/20251004210323_create_complete_database_schema.sql`

Ou utiliser l'interface **Paramètres > Listes** pour ajouter/supprimer des entrées dynamiquement.

---

**Date de mise en œuvre :** 4 octobre 2025
**Statut :** ✅ Opérationnel sur toute l'application
