import { db } from "@/db";
import { players } from "@/db/schema";
import AddGameClient from "./AddGameClient";

export default async function AddGamePage() {
  const allPlayers = await db.select().from(players).orderBy(players.name);
  return <AddGameClient players={allPlayers} />;
}
