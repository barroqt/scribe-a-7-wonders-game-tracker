PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_game_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`player_id` integer,
	`player_name` text NOT NULL,
	`wonder` text NOT NULL,
	`score` integer NOT NULL,
	`rank` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_game_participants`("id", "game_id", "player_id", "player_name", "wonder", "score", "rank") SELECT "id", "game_id", "player_id", "player_name", "wonder", "score", "rank" FROM `game_participants`;--> statement-breakpoint
DROP TABLE `game_participants`;--> statement-breakpoint
ALTER TABLE `__new_game_participants` RENAME TO `game_participants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;