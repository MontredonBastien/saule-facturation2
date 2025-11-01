# Comment devenir Super-Admin

## Problème résolu

Maintenant, **seuls les super-admins autorisés** peuvent voir et accéder au module "Super-Admin". Les autres utilisateurs ne le verront même pas dans le menu.

## Sécurité mise en place

### 1. Menu masqué
- Le menu "Super-Admin" n'apparaît **que si vous êtes super-admin**
- Les utilisateurs normaux ne voient même pas qu'il existe

### 2. Page protégée
- Si quelqu'un essaie d'accéder directement à la page (en hackant l'URL)
- Il voit un **message "Accès refusé"** avec une alerte rouge
- Impossible d'accéder aux données

### 3. Vérification dans la base de données
- Chaque accès vérifie que votre email est dans la table `super_admins`
- Et que votre compte est actif (`is_active = true`)

## Comment vous ajouter comme super-admin

### Méthode 1 : Via la console Supabase (Recommandé)

1. **Allez sur votre projet Supabase** : https://supabase.com/dashboard
2. Cliquez sur votre projet
3. Dans le menu de gauche, cliquez sur **"Table Editor"**
4. Sélectionnez la table **`super_admins`**
5. Cliquez sur **"Insert" → "Insert row"**
6. Remplissez :
   - **email** : Votre adresse email (celle que vous utilisez pour vous connecter)
   - **full_name** : Votre nom complet
   - **is_active** : `true` (coché)
7. Cliquez sur **"Save"**

### Méthode 2 : Via SQL

1. **Allez sur votre projet Supabase**
2. Cliquez sur **"SQL Editor"** dans le menu de gauche
3. **Copiez et exécutez cette commande** (en remplaçant par votre email) :

```sql
INSERT INTO super_admins (email, full_name, is_active)
VALUES ('votre@email.com', 'Votre Nom', true);
```

4. Cliquez sur **"Run"**

### Méthode 3 : En mode démo (test local)

Si vous utilisez le mode démo (sans authentification Supabase réelle) :

1. Ouvrez la console du navigateur (F12)
2. Dans l'onglet "Application" → "Local Storage"
3. Trouvez `demoSession`
4. Notez l'email qui y est stocké
5. Ajoutez cet email dans `super_admins` avec l'une des méthodes ci-dessus

**Ou changez l'email de votre session démo** :

```javascript
// Dans la console du navigateur
localStorage.setItem('demoSession', JSON.stringify({
  email: 'admin@example.com',
  name: 'Admin Principal'
}));
// Puis rechargez la page
window.location.reload();
```

Ensuite, ajoutez `admin@example.com` dans la table `super_admins`.

## Vérifier que ça fonctionne

### Test 1 : Le menu apparaît

1. Rechargez la page (F5)
2. Dans le menu de gauche, vous devez maintenant voir **"Super-Admin"** avec une icône bouclier
3. Si vous ne le voyez pas, vérifiez que votre email est bien dans la table `super_admins`

### Test 2 : Accès à la page

1. Cliquez sur **"Super-Admin"**
2. Vous devez voir le tableau de bord avec les entreprises
3. Si vous voyez "Accès refusé", votre email n'est pas reconnu

### Test 3 : Vérification SQL

Pour vérifier que vous êtes bien enregistré :

```sql
SELECT * FROM super_admins WHERE email = 'votre@email.com';
```

Vous devez voir une ligne avec `is_active = true`.

## Ajouter d'autres super-admins

Pour donner l'accès à un collègue :

```sql
INSERT INTO super_admins (email, full_name, is_active)
VALUES ('collegue@example.com', 'Nom du Collègue', true);
```

## Retirer un super-admin

### Désactiver temporairement

```sql
UPDATE super_admins
SET is_active = false
WHERE email = 'collegue@example.com';
```

L'utilisateur perd immédiatement l'accès mais reste dans la base.

### Supprimer définitivement

```sql
DELETE FROM super_admins
WHERE email = 'collegue@example.com';
```

L'utilisateur est complètement retiré.

## Réactiver un super-admin

```sql
UPDATE super_admins
SET is_active = true
WHERE email = 'collegue@example.com';
```

## Voir tous les super-admins

```sql
SELECT
  email,
  full_name,
  is_active,
  created_at,
  last_login
FROM super_admins
ORDER BY created_at DESC;
```

## En cas de problème

### "Je ne vois toujours pas le menu Super-Admin"

**Solutions** :

1. **Vérifiez votre email** dans la table `super_admins` :
   ```sql
   SELECT * FROM super_admins WHERE email = 'votre@email.com';
   ```
   - Doit retourner une ligne avec `is_active = true`

2. **Vérifiez l'email de votre session** :
   - Mode démo : Regardez dans `localStorage` → `demoSession`
   - Mode Supabase Auth : Exécutez dans la console :
     ```javascript
     supabase.auth.getUser().then(({data}) => console.log(data.user.email))
     ```

3. **Les deux emails doivent correspondre !**

4. **Rechargez complètement la page** (Ctrl+Shift+R ou Cmd+Shift+R sur Mac)

5. **Videz le cache du navigateur** si nécessaire

### "J'ai ajouté mon email mais je vois 'Accès refusé'"

**Vérifications** :

1. L'email est-il exactement le même (majuscules/minuscules) ?
2. Le compte est-il actif (`is_active = true`) ?
3. Avez-vous rechargé la page après l'ajout ?

**Commande de debug** :

```sql
-- Voir si l'email existe
SELECT * FROM super_admins WHERE LOWER(email) = LOWER('votre@email.com');

-- Forcer l'activation
UPDATE super_admins
SET is_active = true
WHERE LOWER(email) = LOWER('votre@email.com');
```

### "La page charge mais ne montre rien"

C'est normal si vous n'avez pas encore d'entreprises clientes. La page fonctionne, elle est juste vide.

Pour tester, créez une entreprise test :

```sql
INSERT INTO companies (name, email, phone, address)
VALUES ('Entreprise Test', 'test@example.com', '0123456789', '123 Rue Test');
```

## Bonnes pratiques de sécurité

### ✅ À faire

- Utilisez votre **vraie adresse email professionnelle**
- Limitez le nombre de super-admins (1 à 3 maximum)
- Notez qui a accès et pourquoi
- Désactivez plutôt que de supprimer (traçabilité)
- Mettez `last_login` à jour régulièrement

### ❌ À éviter

- Ne partagez pas votre accès super-admin
- N'ajoutez pas d'emails génériques (contact@, info@)
- Ne laissez pas de super-admins inactifs avec `is_active = true`
- N'utilisez pas d'emails de test en production

## Structure de la table super_admins

```sql
CREATE TABLE super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id),  -- Pour Supabase Auth
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);
```

## Exemple complet

### Scénario : Vous êtes le fondateur

```sql
-- 1. Vous ajoutez vous-même
INSERT INTO super_admins (email, full_name, is_active)
VALUES ('fondateur@maboite.com', 'Jean Dupont', true);

-- 2. Vous ajoutez votre CTO
INSERT INTO super_admins (email, full_name, is_active)
VALUES ('cto@maboite.com', 'Marie Martin', true);

-- 3. Vous ajoutez un stagiaire pour aider temporairement
INSERT INTO super_admins (email, full_name, is_active)
VALUES ('stagiaire@maboite.com', 'Pierre Bernard', true);

-- 4. Le stage se termine, vous le désactivez
UPDATE super_admins
SET is_active = false
WHERE email = 'stagiaire@maboite.com';

-- 5. Vérification finale
SELECT email, full_name, is_active FROM super_admins;
```

**Résultat** :
- Fondateur : Actif ✅
- CTO : Actif ✅
- Stagiaire : Inactif ❌

## Conclusion

Maintenant, **vous seul** (et les personnes que vous autorisez) pouvez :
- ✅ Voir le menu "Super-Admin"
- ✅ Accéder à la page de gestion des entreprises
- ✅ Configurer les plans et modules par entreprise

Les utilisateurs normaux des entreprises clientes :
- ❌ Ne voient même pas que le module existe
- ❌ Ne peuvent pas accéder à la page même en hackant l'URL
- ✅ Restent isolés dans leur propre espace

**Votre plateforme SaaS est maintenant sécurisée !** 🔒
