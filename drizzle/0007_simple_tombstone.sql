PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tictactoe` (
	`0` text DEFAULT 'void',
	`1` text DEFAULT 'void',
	`2` text DEFAULT 'void',
	`3` text DEFAULT 'void',
	`4` text DEFAULT 'void',
	`5` text DEFAULT 'void',
	`6` text DEFAULT 'void',
	`7` text DEFAULT 'void',
	`8` text DEFAULT 'void',
	`gameId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first` text,
	`second` text,
	`turn` text
);
--> statement-breakpoint
INSERT INTO `__new_tictactoe`("0", "1", "2", "3", "4", "5", "6", "7", "8", "gameId", "first", "second", "turn") SELECT "0", "1", "2", "3", "4", "5", "6", "7", "8", "gameId", "first", "second", "turn" FROM `tictactoe`;--> statement-breakpoint
DROP TABLE `tictactoe`;--> statement-breakpoint
ALTER TABLE `__new_tictactoe` RENAME TO `tictactoe`;--> statement-breakpoint
PRAGMA foreign_keys=ON;