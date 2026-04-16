import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allPlayers = await db.select().from(players).orderBy(players.name);
    return NextResponse.json(allPlayers);
  } catch (error) {
    console.error("GET /api/players error:", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Player name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Check for duplicate
    const existing = await db
      .select()
      .from(players)
      .where(eq(players.name, trimmedName));

    if (existing.length > 0) {
      return NextResponse.json({ error: "A player with this name already exists" }, { status: 409 });
    }

    const [newPlayer] = await db
      .insert(players)
      .values({ name: trimmedName })
      .returning();

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error("POST /api/players error:", error);
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
