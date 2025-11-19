# MDA Platform - Monde des Affaires

Plateforme de commerce échelonné avec système de paiement progressif (Tontine digitale).

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Identifiants de test](#identifiants-de-test)
- [Structure du projet](#structure-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 18.0.0 ([télécharger](https://nodejs.org/))
- **pnpm** >= 8.0.0 (installer avec `npm install -g pnpm`)
- **MySQL** >= 8.0 ou **TiDB** (base de données compatible MySQL)
- **Git**

## 📦 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/AQUILA04/mda.git
cd mda
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer la base de données

Créez une base de données MySQL :

```sql
CREATE DATABASE mda_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/mda_platform

# JWT Secret (générez une clé aléatoire sécurisée)
JWT_SECRET=votre_secret_jwt_tres_securise_ici

# OAuth Manus (optionnel - pour l'authentification Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=your_owner_openid
OWNER_NAME=Admin Name

# Application
VITE_APP_TITLE=Monde des Affaires
VITE_APP_LOGO=/logo.svg
```

### Migration de la base de données

Créez les tables dans la base de données :

```bash
pnpm db:push
```

### Données de test

Chargez les produits et utilisateurs de test :

```bash
pnpm tsx seed-data.mjs
pnpm tsx create-test-users.mjs
```

## 🚀 Démarrage

### Mode développement

```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

### Mode production

```bash
# Build
pnpm build

# Démarrer
pnpm start
```

### Tests

```bash
# Lancer tous les tests
pnpm test

# Tests en mode watch
pnpm test:watch
```

## 🔐 Identifiants de test

### Authentification Email/Password

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Client** | marie.dupont@test.mda.com | password123 |
| **Client** | jean.kouassi@test.mda.com | password123 |
| **Finance** | fatou.diallo@test.mda.com | password123 |
| **Logistique** | kofi.mensah@test.mda.com | password123 |
| **Ambassadeur** | aminata.traore@test.mda.com | password123 |

### Authentification OAuth Manus

Connectez-vous avec votre compte Manus. Le premier utilisateur sera automatiquement Admin.

## 📁 Structure du projet

```
mda-platform/
├── client/                 # Frontend React
│   ├── public/            # Assets statiques
│   └── src/
│       ├── components/    # Composants réutilisables
│       ├── pages/         # Pages de l'application
│       ├── lib/           # Configuration tRPC
│       └── _core/         # Hooks et utilitaires
├── server/                # Backend Node.js + tRPC
│   ├── routers.ts         # Définition des procédures tRPC
│   ├── db.ts              # Fonctions d'accès à la base de données
│   ├── auth.ts            # Logique d'authentification
│   └── _core/             # Configuration serveur
├── drizzle/               # Schéma de base de données
│   └── schema.ts          # Définition des tables
├── shared/                # Code partagé client/serveur
└── docs/                  # Documentation du projet
```

## ✨ Fonctionnalités

### Pour les Clients

- ✅ Parcourir le catalogue de produits
- ✅ Créer un plan de cotisation (paiement échelonné)
- ✅ Effectuer des versements progressifs
- ✅ Suivre la progression de ses cotisations
- ✅ Demander la liquidation d'un contrat (règle 1/3 - 2/3)
- ✅ Consulter son avoir client
- ✅ Voir l'historique des paiements

### Pour l'Administration

- ✅ Gérer les utilisateurs et leurs rôles
- ✅ Voir les statistiques globales
- ✅ Accéder au coffre-fort numérique (données financières)
- ✅ Accès complet aux interfaces Finance et Logistique

### Pour Finance

- ✅ Voir les revenus en temps réel
- ✅ Classifier les flux comptables
- ✅ Valider les demandes de liquidation
- ✅ Consulter les rapports financiers
- ✅ Gérer les commissions d'ambassadeurs

### Pour Logistique

- ✅ Gérer le catalogue de produits
- ✅ Valider les livraisons
- ✅ Marquer les livraisons comme livrées
- ✅ Suivre les stocks

### Pour Ambassadeurs

- ✅ Voir les filleuls (clients parrainés)
- ✅ Consulter les commissions gagnées
- ✅ Demander le paiement des commissions

## 🛠️ Technologies utilisées

### Frontend

- **React 19** - Framework UI
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Composants UI
- **tRPC** - Communication type-safe avec le backend
- **Wouter** - Routing
- **Tanstack Query** - Gestion d'état serveur

### Backend

- **Node.js** - Runtime JavaScript
- **Express** - Serveur HTTP
- **tRPC** - API type-safe
- **Drizzle ORM** - ORM pour MySQL
- **bcryptjs** - Hashage de mots de passe
- **jsonwebtoken** - Authentification JWT

### Base de données

- **MySQL 8.0+** ou **TiDB** - Base de données relationnelle

### Outils de développement

- **Vite** - Build tool
- **Vitest** - Framework de tests
- **TypeScript** - Langage
- **ESLint** - Linting
- **pnpm** - Gestionnaire de paquets

## 📖 Documentation complémentaire

- [Guide utilisateur](./GUIDE_UTILISATEUR.md) - Guide complet pour les utilisateurs finaux
- [Identifiants de test](./CREDENTIALS.md) - Liste complète des comptes de test
- [Spécifications](./docs/) - Documentation technique du projet

## 🔄 Workflow de développement

### Ajouter une nouvelle fonctionnalité

1. **Définir le schéma** dans `drizzle/schema.ts`
2. **Migrer la base de données** : `pnpm db:push`
3. **Créer les fonctions DB** dans `server/db.ts`
4. **Créer les procédures tRPC** dans `server/routers.ts`
5. **Créer l'interface** dans `client/src/pages/`
6. **Écrire les tests** dans `server/*.test.ts`
7. **Tester** : `pnpm test`

### Commandes utiles

```bash
# Développement
pnpm dev                    # Démarrer en mode dev
pnpm db:push                # Migrer le schéma DB
pnpm test                   # Lancer les tests

# Production
pnpm build                  # Build pour production
pnpm start                  # Démarrer en production

# Base de données
pnpm tsx seed-data.mjs      # Charger les données de test
pnpm tsx create-test-users.mjs  # Créer les utilisateurs de test

# Utilitaires
pnpm lint                   # Vérifier le code
pnpm typecheck              # Vérifier les types TypeScript
```

## 🤝 Contribution

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📧 Support

Pour toute question ou problème, ouvrez une issue sur GitHub ou contactez l'équipe de développement.

---

**Développé avec ❤️ par l'équipe MDA**
