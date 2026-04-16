import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { games, gameParticipants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = parseInt(id, 10);

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId));

    if (existing.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Cascade delete will handle game_participants due to FK constraint
    await db.delete(games).where(eq(games.id, gameId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/games/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 });
  }
}
