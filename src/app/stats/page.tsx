import { db } from "@/db";
import { games, gameParticipants, players, WONDERS } from "@/db/schema";
import { eq } from "drizzle-orm";
import StatsClient from "./StatsClient";
import type { PlayerStats, WonderStats, WonderPlayerStats } from "@/db/schema";

async function computeStats() {
  const allPlayers = await db.select().from(players).orderBy(players.name);
  const allGames = await db.select().from(games);
  const allParticipants = await db.select().from(gameParticipants);

  // Player stats
  const playerStats: PlayerStats[] = allPlayers.map((player) => {
    const pp = allParticipants.filter((p) => p.playerId === player.id);
    const gamesPlayed = pp.length;
    const wins = pp.filter((p) => p.rank === 1).length;
    const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;
    const avgScore =
      gamesPlayed > 0
        ? pp.reduce((sum, p) => sum + p.score, 0) / gamesPlayed
        : 0;
    const bestScore = gamesPlayed > 0 ? Math.max(...pp.map((p) => p.score)) : 0;

    const wonderStats: WonderPlayerStats[] = WONDERS.map((wonder) => {
      const wp = pp.filter((p) => p.wonder === wonder);
      const wg = wp.length;
      const ww = wp.filter((p) => p.rank === 1).length;
      return {
        wonder,
        gamesPlayed: wg,
        wins: ww,
        winRate: wg > 0 ? (ww / wg) * 100 : 0,
        avgScore: wg > 0 ? wp.reduce((s, p) => s + p.score, 0) / wg : 0,
      };
    }).filter((ws) => ws.gamesPlayed > 0);

    return { player, gamesPlayed, wins, winRate, avgScore, bestScore, wonderStats };
  });

  // Wonder stats (global)
  const wonderStats: WonderStats[] = WONDERS.map((wonder) => {
    const wp = allParticipants.filter((p) => p.wonder === wonder);
    const gamesPlayed = wp.length;
    const wins = wp.filter((p) => p.rank === 1).length;
    return {
      wonder,
      gamesPlayed,
      wins,
      winRate: gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0,
      avgScore:
        gamesPlayed > 0 ? wp.reduce((s, p) => s + p.score, 0) / gamesPlayed : 0,
    };
  });

  return { playerStats, wonderStats, totalGames: allGames.length };
}

export default async function StatsPage() {
  const data = await computeStats();
  return <StatsClient {...data} />;
}
