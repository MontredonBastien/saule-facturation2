# Clients de Test - Facturation Électronique

## ✅ Données Créées

Les clients de test suivants ont été ajoutés à la base de données Supabase :

---

## 1. 🏢 Client Professionnel (B2B)

**Type:** Professional
**Utilisation:** Tests de facturation électronique Chorus Pro

### Informations :
- **Nom:** TechCorp Solutions SAS
- **SIRET:** 98765432109876
- **N° TVA:** FR98765432109
- **Contact:** Jean Dupont
- **Email:** j.dupont@techcorp.fr
- **Téléphone:** 01 98 76 54 32
- **Adresse:** 456 Avenue des Champs-Élysées, 75008 Paris, France

### Notes :
Client professionnel régulier - Facturation électronique activée pour Chorus Pro

### Tests recommandés avec ce client :
- ✅ Créer une facture avec format **Factur-X**
- ✅ Générer un document PDF/A-3 avec XML intégré
- ✅ Tester l'envoi vers **Chorus Pro** (mode démonstration)
- ✅ Vérifier l'affichage du SIRET et TVA sur le PDF
- ✅ Tester les niveaux de conformité EN16931

---

## 2. 👤 Client Particulier (B2C)

**Type:** Individual
**Utilisation:** Tests de facturation standard

### Informations :
- **Nom:** Marie Martin
- **Contact:** Marie Martin
- **Email:** marie.martin@email.fr
- **Téléphone:** 06 12 34 56 78
- **Adresse:** 789 Boulevard Saint-Germain, 75006 Paris, France

### Notes :
Cliente particulière - Facturation standard

### Tests recommandés avec ce client :
- ✅ Créer une facture en format **Standard** (PDF classique)
- ✅ Vérifier que les champs SIRET/TVA ne s'affichent pas
- ✅ Comparer avec la facture professionnelle
- ✅ Tester les mentions légales adaptées aux particuliers

---

## 🧪 Comment Utiliser ces Clients pour Tester

### Étape 1 : Se connecter à l'application
1. Lancer l'application en mode développement
2. Se connecter ou créer un compte

### Étape 2 : Créer une facture pour le client professionnel
1. Aller dans **Factures** → **Nouvelle facture**
2. Chercher et sélectionner **"TechCorp Solutions SAS"**
3. Ajouter des lignes de facturation
4. Scroller jusqu'à **"Facturation électronique"**
5. Sélectionner **"Factur-X"** ou **"Chorus Pro"**
6. Enregistrer la facture
7. Cliquer sur **Aperçu** pour voir le PDF
8. Tester les boutons **"⚡ Factur-X"** et **"🏛️ Chorus Pro"**

### Étape 3 : Créer une facture pour le client particulier
1. Aller dans **Factures** → **Nouvelle facture**
2. Chercher et sélectionner **"Marie Martin"**
3. Ajouter des lignes de facturation
4. Laisser le format sur **"Standard"**
5. Enregistrer et visualiser
6. Comparer avec la facture professionnelle

### Étape 4 : Comparer les deux factures
- **Facture Pro (TechCorp):**
  - Affiche SIRET et TVA
  - Options Factur-X et Chorus Pro disponibles
  - Mentions B2B

- **Facture Particulier (Marie):**
  - Pas de SIRET/TVA
  - Format standard uniquement
  - Mentions B2C

---

## 📊 Structure de la Base de Données

### Table `companies`
```
id: 00000000-0000-0000-0000-000000000001
name: Ma Super Entreprise SARL
siret: 12345678901234
vat_number: FR12345678901
```

### Table `clients`
```
Client Pro (id: ...11)
- type: professional
- name: TechCorp Solutions SAS
- siret: 98765432109876
- vat_number: FR98765432109

Client Particulier (id: ...12)
- type: individual
- name: Marie Martin
- siret: null
- vat_number: null
```

---

## 🔍 Vérification des Données

Pour vérifier que les clients sont bien présents, vous pouvez :

### Option 1 : Via l'application
- Aller dans la section **Clients** (si disponible)
- Ou lors de la création d'une facture, chercher "TechCorp" ou "Marie"

### Option 2 : Via Supabase Dashboard
1. Ouvrir le dashboard Supabase
2. Aller dans **Table Editor**
3. Sélectionner la table **`clients`**
4. Voir les 2 clients créés

### Option 3 : Via SQL
```sql
SELECT
  name,
  type,
  siret,
  vat_number,
  email,
  city
FROM clients
WHERE company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY type DESC;
```

---

## 🎯 Scénarios de Test Complets

### Scénario 1 : Facture B2B avec Factur-X
1. Créer facture pour **TechCorp Solutions**
2. Sélectionner format **Factur-X**
3. Ajouter articles (ex: "Prestation de développement", 1000€ HT)
4. Enregistrer
5. Ouvrir l'aperçu PDF
6. Cliquer sur **"⚡ Factur-X"**
7. Vérifier le message de confirmation avec détails techniques

### Scénario 2 : Envoi Chorus Pro
1. Même facture que Scénario 1
2. Cliquer sur **"🏛️ Chorus Pro"**
3. Vérifier la confirmation d'envoi
4. Noter le numéro de dépôt simulé

### Scénario 3 : Facture B2C Standard
1. Créer facture pour **Marie Martin**
2. Laisser format **Standard**
3. Ajouter articles (ex: "Prestation de consulting", 500€ HT)
4. Enregistrer et visualiser
5. Vérifier l'absence de boutons électroniques

### Scénario 4 : Comparaison des formats
1. Créer 3 factures identiques pour TechCorp :
   - Une en format **Standard**
   - Une en format **Factur-X**
   - Une en format **Chorus Pro**
2. Comparer les badges et options disponibles
3. Noter les différences dans les aperçus

---

## ⚠️ Important

### Mode Démonstration
Les fonctionnalités de génération Factur-X et d'envoi Chorus Pro sont en **mode démonstration**. Elles affichent des alertes de confirmation mais ne génèrent pas réellement de fichiers Factur-X ni n'envoient vers l'API Chorus Pro.

### Pour Passer en Production
Pour utiliser ces fonctionnalités en production avec de vrais clients, il faudra :

1. **Intégrer une librairie Factur-X**
   - Exemple : `factur-x-js` ou équivalent
   - Générer de vrais PDF/A-3 avec XML embarqué

2. **Configurer l'API Chorus Pro**
   - Obtenir des identifiants réels (Client ID/Secret)
   - S'inscrire sur [chorus-pro.gouv.fr](https://chorus-pro.gouv.fr)
   - Implémenter l'authentification OAuth2
   - Implémenter l'envoi de factures

3. **Activer les paramètres**
   - Aller dans **Paramètres** → **Facturation électronique**
   - Activer la facturation électronique
   - Configurer Chorus Pro avec les vrais identifiants
   - Sauvegarder

---

## ✅ Checklist de Test

### Tests Basiques
- [ ] Les 2 clients apparaissent dans la recherche
- [ ] Le client pro affiche SIRET et TVA
- [ ] Le client particulier n'affiche pas SIRET/TVA
- [ ] Les adresses sont correctes

### Tests Facturation Électronique
- [ ] Options électroniques visibles pour client pro
- [ ] Sélection format Factur-X fonctionne
- [ ] Sélection format Chorus Pro fonctionne
- [ ] Badges d'information s'affichent
- [ ] Boutons dans l'aperçu PDF fonctionnent
- [ ] Confirmations affichent les bons détails

### Tests de Configuration
- [ ] Paramètres électroniques sauvegardés
- [ ] Format par défaut appliqué
- [ ] Niveaux de conformité accessibles
- [ ] Mode sandbox/production basculable

---

## 💡 Prochaines Étapes

Après avoir testé avec ces clients :

1. **Ajouter plus de clients de test** si nécessaire
2. **Créer des factures réelles** avec différents formats
3. **Tester les devis et avoirs** avec les mêmes clients
4. **Configurer Chorus Pro** avec de vrais identifiants
5. **Intégrer la génération Factur-X** pour production

---

## 📞 Support

Si vous rencontrez des problèmes lors des tests :

1. Vérifier que la base de données est bien connectée
2. Vérifier que les migrations ont été appliquées
3. Consulter le fichier `GUIDE_TEST_FACTURATION_ELECTRONIQUE.md`
4. Vérifier les logs dans la console navigateur (F12)
