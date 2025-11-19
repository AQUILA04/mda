# Guide Utilisateur - MDA Platform v0

## 📋 Vue d'ensemble

**MDA (Monde des Affaires)** est une plateforme de commerce avec système de paiement échelonné (Tontine individuelle). Les clients peuvent acquérir des produits en cotisant progressivement selon leur rythme.

## 🎯 Fonctionnalités principales

### Pour les Clients
- Parcourir le catalogue de produits
- Créer des plans de cotisation personnalisés
- Effectuer des versements progressifs
- Suivre la progression en temps réel
- Demander la liquidation d'un contrat (récupération de 2/3 en avoir client)
- Consulter son solde d'avoir client

### Pour l'Administration
- Gérer les utilisateurs et leurs rôles
- Accéder au coffre-fort numérique (traçabilité financière)

### Pour la Finance
- Valider les liquidations de contrats
- Consulter les rapports de revenus (ventes, revenus exceptionnels)
- Classifier automatiquement les flux comptables

### Pour la Logistique
- Valider les livraisons déclenchées automatiquement
- Gérer le statut des livraisons
- Suivre toutes les livraisons

## 🔐 Identifiants de test

### Comment tester l'application

1. **Créer des comptes de test** :
   - Connectez-vous avec différents comptes Manus OAuth
   - Le premier utilisateur (défini par `OWNER_OPEN_ID`) sera automatiquement Admin

2. **Changer les rôles** :
   - Connectez-vous en tant qu'Admin
   - Allez dans "Gestion des utilisateurs"
   - Modifiez le rôle de chaque utilisateur selon vos besoins

### Rôles disponibles

| Rôle | Description | Accès |
|------|-------------|-------|
| **client** | Utilisateur standard | Catalogue, plans de cotisation, paiements |
| **admin** | Administrateur système | Tous les accès + gestion des utilisateurs + coffre-fort |
| **finance** | Responsable financier | Liquidations, rapports financiers, flux comptables |
| **logistique** | Gestionnaire logistique | Validation des livraisons, gestion des stocks |
| **ambassadeur** | Commercial/Parrain | Même accès que client + suivi des commissions |

## 📱 Guide d'utilisation par rôle

### 👤 Client

#### 1. Créer un plan de cotisation
1. Parcourez le catalogue de produits
2. Cliquez sur "Créer un plan" pour le produit souhaité
3. Choisissez votre fréquence de cotisation :
   - **Quotidien** : versements chaque jour
   - **Hebdomadaire** : versements chaque semaine
   - **Mensuel** : versements chaque mois
4. Définissez le montant par mise (minimum 600 FCFA)
5. Validez la création

#### 2. Effectuer un versement
1. Accédez à votre tableau de bord
2. Cliquez sur un plan actif
3. Cliquez sur "Effectuer un versement"
4. Entrez le montant (minimum 600 FCFA)
5. Choisissez le moyen de paiement (simulé) :
   - Mobile Money (MoMo)
   - T-money
   - PayPal
   - Carte bancaire
6. Confirmez le paiement

#### 3. Suivre la progression
- La barre de progression affiche le pourcentage complété
- Vous voyez le montant cotisé vs le montant total
- La prochaine échéance est affichée

#### 4. Livraison automatique
- Lorsque vous atteignez 100% du montant, la livraison est **automatiquement déclenchée**
- Le statut passe à "complete"
- Une livraison est créée et envoyée à la logistique

#### 5. Liquidation de contrat
Si vous souhaitez arrêter un plan avant la fin :
1. Ouvrez le plan actif
2. Cliquez sur "Demander la liquidation"
3. Consultez le calcul :
   - **1/3 du montant cotisé** = Pénalité pour l'entreprise
   - **2/3 du montant cotisé** = Crédit dans votre avoir client
4. Confirmez la demande
5. Attendez la validation par la Finance

### 👨‍💼 Admin

#### 1. Gérer les utilisateurs
1. Accédez au tableau de bord Admin
2. Section "Gestion des utilisateurs"
3. Changez le rôle d'un utilisateur via le menu déroulant
4. Les changements sont immédiats

#### 2. Accéder au Coffre-fort Numérique
1. Section "Coffre-fort Numérique"
2. Cliquez sur "Afficher" (accès sécurisé Admin uniquement)
3. Consultez :
   - Les flux comptables classifiés
   - Les transactions enregistrées
   - La traçabilité complète

### 💰 Finance

#### 1. Consulter les rapports de revenus
- **Ventes physiques** : revenus des produits physiques
- **Ventes digitales** : revenus des produits digitaux
- **Revenus exceptionnels** : pénalités des liquidations (1/3)
- **Total net** : somme globale

#### 2. Valider une liquidation
1. Section "Liquidations en attente"
2. Consultez les demandes des clients
3. Vérifiez le calcul :
   - Pénalité (1/3) → Revenu exceptionnel entreprise
   - Avoir client (2/3) → Crédit au compte client
4. Cliquez sur "Valider"
5. Confirmez l'opération

**Effet de la validation** :
- Création automatique des flux comptables
- Crédit du compte avoir du client
- Mise à jour du statut du plan

### 📦 Logistique

#### 1. Valider une livraison
1. Section "Livraisons en attente de validation"
2. Consultez les informations :
   - Client (nom, email, téléphone)
   - Produit
   - Adresse de livraison
3. Ajoutez des notes (optionnel)
4. Cliquez sur "Valider"
5. Le statut passe à "en_cours"

#### 2. Marquer une livraison comme terminée
1. Section "Toutes les livraisons"
2. Trouvez les livraisons "en_cours"
3. Cliquez sur "Marquer livrée"
4. Le statut passe à "livree"

## 🔄 Flux complets

### Flux 1 : Achat avec cotisation complète

```
1. Client crée un plan de cotisation
   ↓
2. Client effectue des versements progressifs
   ↓
3. Progression affichée en temps réel
   ↓
4. Atteinte de 100% → Livraison automatiquement déclenchée
   ↓
5. Logistique valide la livraison
   ↓
6. Logistique marque la livraison comme terminée
   ↓
7. Client reçoit son produit
```

### Flux 2 : Liquidation de contrat

```
1. Client demande la liquidation d'un plan actif
   ↓
2. Demande envoyée à la Finance
   ↓
3. Finance valide la liquidation
   ↓
4. Système calcule automatiquement :
   - 1/3 → Revenu exceptionnel (pénalité)
   - 2/3 → Avoir client
   ↓
5. Flux comptables créés automatiquement
   ↓
6. Avoir client crédité
   ↓
7. Client peut utiliser son avoir pour un nouvel achat
```

## 💡 Règles métier importantes

### Cotisation
- **Montant minimal par mise** : 600 FCFA
- **Fréquences disponibles** : Quotidien, Hebdomadaire, Mensuel
- **Livraison automatique** : Déclenchée à 100% du montant

### Liquidation
- **Pénalité entreprise** : 1/3 du montant cotisé
- **Avoir client** : 2/3 du montant cotisé
- **Utilisation de l'avoir** : Uniquement pour de nouveaux achats
- **Validation requise** : Par le responsable Finance

### Comptabilité
Les flux sont automatiquement classifiés :
- `vente_physique` : Vente de produits physiques
- `vente_digitale` : Vente de produits digitaux
- `cotisation` : Versements des clients
- `revenu_exceptionnel` : Pénalités de liquidation (1/3)
- `avoir_client` : Crédits clients (2/3 des liquidations)
- `commission` : Commissions des ambassadeurs
- `salaire` : Paiements de salaires

## 🎨 Catalogue de produits (Exemples pré-chargés)

1. **iPhone 15 Pro** - 850,000 FCFA
2. **Samsung Galaxy S24** - 650,000 FCFA
3. **MacBook Air M3** - 1,200,000 FCFA
4. **PlayStation 5** - 450,000 FCFA
5. **AirPods Pro 2** - 180,000 FCFA
6. **Samsung 55" QLED TV** - 550,000 FCFA
7. **Canon EOS R6** - 2,200,000 FCFA
8. **iPad Pro 12.9"** - 950,000 FCFA

## ⚠️ Notes importantes

### Simulations (pas d'intégration réelle)
- **Paiements** : Les moyens de paiement sont simulés (pas de vraie transaction)
- **Chiffrement AES** : Non implémenté (données stockées en clair)
- **OTP/2FA** : Non implémenté (pas de double authentification)

### Limitations de la v0
- Pas de gestion des commissions d'ambassadeurs (structure en place)
- Pas de gestion avancée des stocks
- Pas d'interface de parrainage
- Pas de suivi des livraisons côté client

## 🚀 Déploiement mobile (futur)

L'application web actuelle est **responsive** et fonctionne sur :
- ✅ Navigateurs desktop (Chrome, Firefox, Safari, Edge)
- ✅ Navigateurs mobiles (iOS Safari, Chrome Android)

Pour créer des applications natives iOS/Android :
- Utiliser **Capacitor** ou **Ionic** pour packager l'application web
- Publier sur App Store et Google Play Store

## 📞 Support

Pour toute question ou problème :
- Vérifiez que vous êtes connecté avec le bon rôle
- Consultez les logs dans la console développeur
- Contactez l'administrateur système

---

**Version** : v0  
**Date** : Novembre 2024  
**Plateforme** : Manus
