# Guide de Test - Facturation Électronique

## ✅ Build réussi
Le projet compile correctement avec toutes les fonctionnalités de facturation électronique.

---

## 📋 Plan de Test Complet

### 1. Test de Configuration (Paramètres)

#### Étapes :
1. **Lancer l'application** en mode développement
2. **Se connecter** (ou créer un compte si nécessaire)
3. **Aller dans "Paramètres"** (icône d'engrenage dans le menu)
4. **Cliquer sur l'onglet "Facturation électronique"**

#### Points à vérifier :
- ✅ L'onglet "Facturation électronique" est visible
- ✅ Vous voyez 3 cartes : Factur-X, Chorus Pro, Conformité
- ✅ La case à cocher "Activer la facturation électronique" fonctionne
- ✅ Quand activé, tous les champs de configuration apparaissent

#### Configuration à tester :

**a) Format par défaut :**
- Tester les 3 options du menu déroulant :
  - Factur-X (PDF/A-3 + XML)
  - UBL 2.1 (XML uniquement)
  - XML CII (Cross Industry Invoice)

**b) Documents électroniques :**
- Cocher/décocher "Factures électroniques"
- Cocher/décocher "Avoirs électroniques"

**c) Configuration Factur-X :**
- Tester tous les niveaux de conformité (menu déroulant) :
  - MINIMUM
  - BASIC WL
  - BASIC
  - EN16931 (recommandé)
  - EXTENDED
- Cocher "Inclure les pièces jointes"
- Cocher "Signature électronique du PDF"

**d) Configuration Chorus Pro :**
- Basculer entre "Mode sandbox" et "Mode production"
- Entrer un Client ID de test : `TEST_CLIENT_ID`
- Entrer un Client Secret de test : `TEST_SECRET_123`
- Cocher "Envoi automatique à Chorus Pro"
- Vérifier le lien vers la documentation API (doit s'ouvrir)

**e) Notifications :**
- Cocher "Notifications par email"
- Entrer une adresse email : `test@example.com`
- Entrer une URL webhook : `https://example.com/webhook`

**f) Sauvegarde :**
- Cliquer sur "Sauvegarder la configuration"
- Vérifier l'alerte de confirmation
- Rafraîchir la page (F5)
- Vérifier que les paramètres sont conservés (localStorage)

---

### 2. Test sur les Formulaires de Facture

#### Étapes :
1. **Aller dans "Factures"**
2. **Cliquer sur "Nouvelle facture"**
3. **Scroller vers le bas** jusqu'à la section "Facturation électronique"

#### Points à vérifier :
- ✅ La section "Facturation électronique" est visible
- ✅ Les 3 options radio sont présentes :
  - Standard (PDF classique)
  - Factur-X (PDF/A-3 + XML)
  - Chorus Pro (Secteur public)
- ✅ Quand on sélectionne "Factur-X", un badge bleu apparaît
- ✅ Quand on sélectionne "Chorus Pro", un badge vert apparaît
- ✅ Les badges indiquent "(démonstration)"

---

### 3. Test dans le Visualiseur PDF

#### Étapes :
1. **Créer une facture** (ou ouvrir une existante)
2. **Cliquer sur "Aperçu"** ou sur l'icône d'œil
3. **Vérifier les boutons en haut à droite**

#### Points à vérifier :
- ✅ Le bouton "⚡ Factur-X" est visible (uniquement pour les factures)
- ✅ Le bouton "🏛️ Chorus Pro" est visible (uniquement pour les factures)
- ✅ Cliquer sur "Factur-X" ouvre une confirmation
- ✅ Cliquer sur "Chorus Pro" ouvre une confirmation
- ✅ Les alertes montrent des informations de démonstration

---

### 4. Test dans le Gestionnaire de Statut

#### Étapes :
1. **Ouvrir une facture** (liste des factures)
2. **Cliquer sur les 3 points** (menu d'actions)
3. **Regarder les boutons disponibles**

#### Points à vérifier :
- ✅ Le bouton "Générer Factur-X" est visible
- ✅ Le bouton "Envoyer Chorus Pro" est visible
- ✅ Cliquer sur "Générer Factur-X" ouvre une confirmation
- ✅ Cliquer sur "Envoyer Chorus Pro" ouvre une confirmation
- ✅ Les confirmations montrent les détails techniques

---

### 5. Test des Types TypeScript

#### Vérification automatique :
Le build réussit sans erreurs TypeScript, ce qui confirme que tous les types sont corrects :

**Types disponibles :**
- `FacturXMetadata` - Métadonnées Factur-X
- `ChorusProConfig` - Configuration Chorus Pro
- `ChorusProInvoice` - Structure de facture Chorus Pro
- `ElectronicInvoiceStatus` - Statuts électroniques
- `ElectronicInvoicingSettings` - Paramètres globaux

---

## 🎯 Tests de Fonctionnalités Avancées

### Test de Persistance (localStorage)
1. Configurer tous les paramètres électroniques
2. Sauvegarder
3. Fermer complètement l'onglet/navigateur
4. Rouvrir l'application
5. Aller dans Paramètres > Facturation électronique
6. ✅ Tous les paramètres doivent être conservés

### Test de Réinitialisation
1. Configurer des paramètres
2. Cliquer sur "Réinitialiser"
3. ✅ Tous les champs reviennent aux valeurs par défaut
4. ✅ Le mode est bien en "sandbox"
5. ✅ Les champs sont vides

---

## 🔍 Ce qui est Implémenté (Mode Démo)

### ✅ Complètement fonctionnel :
- Interface utilisateur complète
- Configuration complète (Factur-X + Chorus Pro)
- Sauvegarde des paramètres (localStorage)
- Intégration dans les formulaires
- Boutons d'action dans les vues
- Types TypeScript complets
- Documentation intégrée

### ⚠️ Mode démonstration (alertes) :
- Génération Factur-X (nécessite librairie tierce)
- Envoi API Chorus Pro (nécessite identifiants réels)

---

## 🚀 Pour passer en Production

### Étapes nécessaires :

1. **Migrer les paramètres vers Supabase**
   - Créer une table `electronic_settings`
   - Remplacer localStorage par des appels API

2. **Intégrer la génération Factur-X**
   - Installer `factur-x-js` ou équivalent
   - Implémenter la génération PDF/A-3 + XML
   - Ajouter la signature électronique

3. **Intégrer l'API Chorus Pro**
   - Obtenir les vrais identifiants API (AIFE)
   - Implémenter l'authentification OAuth2
   - Implémenter l'envoi de factures
   - Implémenter la récupération de statuts

4. **Ajouter les notifications**
   - Configurer l'envoi d'emails
   - Implémenter les webhooks

---

## 📊 Checklist de Test Final

### Configuration
- [ ] Activer/désactiver la facturation électronique
- [ ] Changer le format par défaut
- [ ] Configurer Factur-X (5 niveaux de conformité)
- [ ] Configurer Chorus Pro (sandbox/production)
- [ ] Configurer les notifications
- [ ] Sauvegarder et vérifier la persistance
- [ ] Tester la réinitialisation

### Formulaires
- [ ] Sélectionner format Standard
- [ ] Sélectionner format Factur-X
- [ ] Sélectionner format Chorus Pro
- [ ] Vérifier les badges d'information

### Actions sur Documents
- [ ] Bouton Factur-X dans le visualiseur
- [ ] Bouton Chorus Pro dans le visualiseur
- [ ] Bouton Générer Factur-X dans le menu
- [ ] Bouton Envoyer Chorus Pro dans le menu

### Liens et Documentation
- [ ] Lien vers documentation API Chorus Pro
- [ ] Lien vers chorus-pro.gouv.fr
- [ ] Section informations (Factur-X, Chorus Pro, Obligations)

---

## 💡 Notes Importantes

1. **Les paramètres sont sauvegardés dans localStorage** pour le moment
   - Clé : `electronic_invoicing_settings`
   - Pour voir : Ouvrir DevTools > Application > Local Storage

2. **Les boutons électroniques sont visibles uniquement pour les factures**
   - Pas pour les devis ou avoirs (pour l'instant)

3. **Les confirmations sont en mode démo**
   - Elles simulent le comportement attendu
   - À remplacer par les vraies implémentations

4. **La conformité EN16931 est le niveau recommandé**
   - C'est la norme européenne standard
   - Compatible avec l'obligation B2B 2026

---

## ❓ FAQ de Test

**Q: Les boutons Factur-X/Chorus Pro n'apparaissent pas**
- Vérifier que vous êtes bien sur une FACTURE (pas un devis/avoir)
- Vérifier dans Paramètres que la facturation électronique est activée

**Q: Les paramètres ne sont pas sauvegardés après rafraîchissement**
- Ouvrir DevTools > Console
- Vérifier les erreurs JavaScript
- Vérifier que localStorage n'est pas désactivé

**Q: Comment voir les données dans localStorage ?**
- Ouvrir DevTools (F12)
- Aller dans l'onglet "Application" (Chrome) ou "Stockage" (Firefox)
- Cliquer sur "Local Storage"
- Chercher la clé `electronic_invoicing_settings`

---

## ✅ Résultat Attendu

Après tous ces tests, vous devriez pouvoir :
1. Configurer tous les paramètres de facturation électronique
2. Voir les options dans les formulaires de facture
3. Accéder aux actions Factur-X et Chorus Pro
4. Comprendre que c'est en mode démo et ce qu'il faut pour la production

L'interface est **production-ready**, seules les intégrations API sont en attente.
