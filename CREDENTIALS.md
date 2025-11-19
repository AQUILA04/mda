# 🔐 Identifiants de Test - MDA Platform

## Authentification Email/Mot de passe

L'application utilise maintenant un système d'authentification par **email et mot de passe**. Manus OAuth reste disponible comme alternative.

---

## 📧 Comptes de Test Disponibles

Tous les comptes de test utilisent le même mot de passe : **`password123`**

### 👤 Clients

| Email | Mot de passe | Rôle | Avoir Client |
|-------|--------------|------|--------------|
| `marie.dupont@test.mda.com` | `password123` | Client | 0 FCFA |
| `jean.kouassi@test.mda.com` | `password123` | Client | 15,000 FCFA |

**Fonctionnalités Client :**
- Parcourir le catalogue de produits
- Créer des plans de cotisation (Tontine)
- Effectuer des versements progressifs
- Consulter l'historique des paiements
- Demander la liquidation d'un contrat
- Voir le solde d'avoir client

---

### 💰 Finance

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `fatou.diallo@test.mda.com` | `password123` | Finance |

**Fonctionnalités Finance :**
- Valider les demandes de liquidation de contrats
- Consulter les rapports financiers
- Voir la classification des flux comptables
- Gérer les transactions

---

### 📦 Logistique

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `kofi.mensah@test.mda.com` | `password123` | Logistique |

**Fonctionnalités Logistique :**
- Valider les livraisons
- Marquer les produits comme livrés
- Gérer les stocks (à venir)
- Suivre les livraisons en cours

---

### 🎯 Ambassadeur

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `aminata.traore@test.mda.com` | `password123` | Ambassadeur |

**Fonctionnalités Ambassadeur :**
- Parrainer de nouveaux clients
- Consulter les commissions de parrainage
- Suivre les filleuls

---

### 👑 Administrateur

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `francis.ahonsou@gmail.com` | (Manus OAuth) | Admin |

**Fonctionnalités Admin :**
- Accès complet à toutes les interfaces
- Gestion des utilisateurs et des rôles
- Accès au coffre-fort numérique
- Accès aux interfaces Finance et Logistique
- Vue d'ensemble de la plateforme

---

## 🚀 Comment tester

### 1. Connexion avec un compte existant

1. Allez sur la page de connexion : `/login`
2. Entrez l'email et le mot de passe d'un compte de test
3. Cliquez sur "Se connecter"
4. Vous serez redirigé vers le tableau de bord correspondant à votre rôle

### 2. Créer un nouveau compte

1. Allez sur la page d'inscription : `/register`
2. Remplissez le formulaire (nom, email, téléphone, mot de passe)
3. Cliquez sur "Créer mon compte"
4. Connectez-vous avec vos identifiants
5. Votre compte sera créé avec le rôle "Client" par défaut

### 3. Changer le rôle d'un utilisateur (Admin uniquement)

1. Connectez-vous en tant qu'Admin
2. Allez dans "Gestion des utilisateurs"
3. Sélectionnez le nouveau rôle dans le menu déroulant
4. Le changement est appliqué immédiatement

---

## 🔄 Flux de test complets

### Flux Client : Achat avec cotisation

1. **Connexion** : `marie.dupont@test.mda.com` / `password123`
2. **Parcourir le catalogue** : Cliquez sur "Catalogue"
3. **Créer un plan** : Sélectionnez un produit → "Créer un plan de cotisation"
4. **Effectuer des versements** : Allez dans "Mes Plans" → Sélectionnez un plan → "Effectuer un versement"
5. **Voir la livraison** : Quand le plan est complété, la livraison est automatiquement déclenchée

### Flux Finance : Validation de liquidation

1. **Connexion** : `fatou.diallo@test.mda.com` / `password123`
2. **Voir les demandes** : Tableau de bord Finance → Section "Liquidations en attente"
3. **Valider** : Cliquez sur "Valider" pour une demande
4. **Résultat** : 1/3 du montant va à l'entreprise, 2/3 vont en avoir client

### Flux Logistique : Validation de livraison

1. **Connexion** : `kofi.mensah@test.mda.com` / `password123`
2. **Voir les livraisons** : Tableau de bord Logistique → Section "Livraisons en attente"
3. **Valider** : Cliquez sur "Valider la livraison"
4. **Marquer comme livré** : Cliquez sur "Marquer comme livré" après validation

---

## 🔒 Sécurité

- Les mots de passe sont hashés avec **bcrypt** (10 rounds)
- Les tokens JWT sont valides pendant **30 jours**
- Les tokens sont stockés dans le localStorage du navigateur
- Pas de chiffrement AES (comme demandé pour la v0)

---

## 📱 Compatible Mobile

L'application est **responsive** et fonctionne sur :
- Desktop (Chrome, Firefox, Safari, Edge)
- Mobile iOS (Safari)
- Mobile Android (Chrome)

Pour packager en applications natives (iOS/Android), utiliser **Capacitor** ou **Ionic** (à faire ultérieurement).

---

## 🆘 Problèmes courants

### "Email already registered"
→ Cet email est déjà utilisé. Utilisez un autre email ou connectez-vous.

### "Invalid email or password"
→ Vérifiez que vous utilisez le bon email et mot de passe (`password123` pour les comptes de test).

### "This account uses OAuth login"
→ Ce compte utilise Manus OAuth. Utilisez le bouton de connexion OAuth au lieu du formulaire email/password.

---

## 📞 Support

Pour toute question ou problème, consultez le fichier `GUIDE_UTILISATEUR.md` pour plus de détails sur les fonctionnalités.
