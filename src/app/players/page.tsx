import { db } from "@/db";
import { players, gameParticipants } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import PlayersClient from "./PlayersClient";

async function getPlayersWithGameCount() {
  const allPlayers = await db.select().from(players).orderBy(players.name);
  const playersWithCount = await Promise.all(
    allPlayers.map(async (player) => {
      const participations = await db
        .select()
        .from(gameParticipants)
        .where(eq(gameParticipants.playerId, player.id));
      const wins = participations.filter((p) => p.rank === 1).length;
      return {
        ...player,
        gamesPlayed: participations.length,
        wins,
      };
    })
  );
  return playersWithCount;
}

export default async function PlayersPage() {
  const players = await getPlayersWithGameCount();
  return <PlayersClient initialPlayers={players} />;
}
