CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ambassadeurId` int NOT NULL,
	`clientId` int NOT NULL,
	`planId` int NOT NULL,
	`montant` int NOT NULL,
	`statut` enum('pending','paid') NOT NULL DEFAULT 'pending',
	`datePaiement` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cotisationPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`montant` int NOT NULL,
	`paymentMethod` varchar(50) NOT NULL,
	`transactionRef` varchar(255),
	`statut` enum('pending','completed','failed') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cotisationPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cotisationPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`montantTotal` int NOT NULL,
	`montantCotise` int NOT NULL DEFAULT 0,
	`frequence` varchar(50) NOT NULL,
	`montantParMise` int NOT NULL,
	`statut` enum('actif','complete','liquide','livre') NOT NULL DEFAULT 'actif',
	`dateDebut` timestamp NOT NULL DEFAULT (now()),
	`dateFin` timestamp,
	`prochaineEcheance` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cotisationPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`adresseLivraison` text NOT NULL,
	`statut` enum('en_attente','en_cours','livree','annulee') NOT NULL DEFAULT 'en_attente',
	`dateValidation` timestamp,
	`dateLivraison` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fluxComptable` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`typeFlux` enum('vente_physique','vente_digitale','cotisation','revenu_exceptionnel','avoir_client','commission','salaire') NOT NULL,
	`montantNet` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fluxComptable_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nom` varchar(255) NOT NULL,
	`description` text,
	`prixClient` int NOT NULL,
	`prixFournisseur` int NOT NULL,
	`stockActuel` int NOT NULL DEFAULT 0,
	`category` varchar(100),
	`imageUrl` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`montant` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`reference` varchar(255),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('client','admin','finance','logistique','ambassadeur') NOT NULL DEFAULT 'client';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `referredBy` int;--> statement-breakpoint
ALTER TABLE `users` ADD `avoirBalance` int DEFAULT 0 NOT NULL;