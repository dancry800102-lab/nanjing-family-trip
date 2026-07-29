CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`amount` real NOT NULL,
	`payer` text NOT NULL,
	`split_mode` text NOT NULL,
	`beneficiary` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
