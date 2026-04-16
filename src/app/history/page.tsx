import { db } from "@/db";
import { games, gameParticipants } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import HistoryClient from "./HistoryClient";

export type GameRow = {
  id: number;
  playedAt: Date | null;
  createdAt: Date | null;
  participants: {
    id: number;
    gameId: number;
    playerId: number | null;
    playerName: string;
    wonder: string;
    score: number;
    rank: number;
  }[];
};

async function getGamesWithParticipants(): Promise<GameRow[]> {
  const allGames = await db.select().from(games).orderBy(desc(games.playedAt));

  const result = await Promise.all(
    allGames.map(async (game) => {
      const participants = await db
        .select()
        .from(gameParticipants)
        .where(eq(gameParticipants.gameId, game.id))
        .orderBy(gameParticipants.rank);

      return { ...game, participants };
    })
  );

  return result;
}

export default async function HistoryPage() {
  const gamesData = await getGamesWithParticipants();
  return <HistoryClient initialGames={gamesData} />;
}
