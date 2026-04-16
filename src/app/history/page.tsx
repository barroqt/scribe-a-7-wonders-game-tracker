import { db } from "@/db";
import { games, gameParticipants, players } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import HistoryClient from "./HistoryClient";

async function getGamesWithParticipants() {
  const allGames = await db.select().from(games).orderBy(desc(games.playedAt));

  const result = await Promise.all(
    allGames.map(async (game) => {
      const participants = await db
        .select({
          id: gameParticipants.id,
          gameId: gameParticipants.gameId,
          playerId: gameParticipants.playerId,
          wonder: gameParticipants.wonder,
          score: gameParticipants.score,
          rank: gameParticipants.rank,
          player: {
            id: players.id,
            name: players.name,
            createdAt: players.createdAt,
          },
        })
        .from(gameParticipants)
        .innerJoin(players, eq(gameParticipants.playerId, players.id))
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
