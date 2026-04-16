import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// The 7 Wonders wonders list
export const WONDERS = [
  "Alexandria",
  "Babylon",
  "Ephesus",
  "Gizah",
  "Halikarnassos",
  "Olympia",
  "Rhodos",
] as const;

export type Wonder = (typeof WONDERS)[number];

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playedAt: integer("played_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const gameParticipants = sqliteTable("game_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id),
  wonder: text("wonder").notNull(),
  score: integer("score").notNull(),
  rank: integer("rank").notNull(), // 1 = winner
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GameParticipant = typeof gameParticipants.$inferSelect;
export type NewGameParticipant = typeof gameParticipants.$inferInsert;

// Computed stats types (not stored in DB, calculated on the fly)
export type PlayerStats = {
  player: Player;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  avgScore: number;
  bestScore: number;
  wonderStats: WonderPlayerStats[];
};

export type WonderPlayerStats = {
  wonder: Wonder;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  avgScore: number;
};

export type WonderStats = {
  wonder: Wonder;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  avgScore: number;
};

export type GameWithParticipants = Game & {
  participants: (GameParticipant & { player: Player })[];
};
