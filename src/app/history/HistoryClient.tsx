"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ParticipantWithPlayer = {
  id: number;
  gameId: number;
  playerId: number;
  wonder: string;
  score: number;
  rank: number;
  player: {
    id: number;
    name: string;
    createdAt: Date | null;
  };
};

type GameWithParticipants = {
  id: number;
  playedAt: Date | null;
  createdAt: Date | null;
  participants: ParticipantWithPlayer[];
};

type Props = {
  initialGames: GameWithParticipants[];
};

function RankBadge({ rank }: { rank: number }) {
  const cls =
    rank === 1
      ? "rank-badge rank-1"
      : rank === 2
      ? "rank-badge rank-2"
      : rank === 3
      ? "rank-badge rank-3"
      : "rank-badge rank-other";
  return <span className={cls}>{rank}</span>;
}

function formatDate(date: Date | null) {
  if (!date) return "Unknown date";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HistoryClient({ initialGames }: Props) {
  const router = useRouter();
  const [games, setGames] = useState(initialGames);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(gameId: number) {
    if (!confirm("Delete this game from the chronicles? All stats will be recalculated.")) return;
    setDeletingId(gameId);
    try {
      const res = await fetch(`/api/games/${gameId}`, { method: "DELETE" });
      if (res.ok) {
        setGames((prev) => prev.filter((g) => g.id !== gameId));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete game");
      }
    } catch {
      alert("Failed to delete game");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Game History</h1>
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(90deg, #dfbc5e, transparent)",
            marginTop: "0.5rem",
          }}
        />
        <p style={{ color: "#6a6860", fontSize: "0.85rem", marginTop: "0.5rem", fontStyle: "italic" }}>
          {games.length} game{games.length !== 1 ? "s" : ""} in the chronicles
        </p>
      </div>

      {games.length === 0 ? (
        <div className="scribe-card">
          <div className="empty-state">
            No games recorded yet.{" "}
            <a href="/games/new" style={{ color: "#dfbc5e" }}>
              Record your first game
            </a>
            .
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {games.map((game) => {
            const winner = game.participants.find((p) => p.rank === 1);
            return (
              <div key={game.id} className="scribe-card">
                {/* Game header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div
                      style={{
                        color: "#dfbc5e",
                        fontFamily: "Georgia, serif",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {formatDate(game.playedAt)}
                    </div>
                    {winner && (
                      <div style={{ color: "#aaa8a0", fontSize: "0.8rem", marginTop: "0.125rem" }}>
                        <span style={{ color: "#dfbc5e" }}>✦</span> Winner:{" "}
                        <span style={{ color: "#e6e0ae", fontWeight: "bold" }}>
                          {winner.player.name}
                        </span>{" "}
                        <span style={{ color: "#6a6860" }}>({winner.wonder})</span>
                        {" "}— {winner.score} pts
                      </div>
                    )}
                  </div>
                  <button
                    className="scribe-btn-danger"
                    onClick={() => handleDelete(game.id)}
                    disabled={deletingId === game.id}
                    style={{ flexShrink: 0 }}
                    title="Delete game"
                  >
                    {deletingId === game.id ? "..." : "✕"}
                  </button>
                </div>

                <hr className="scribe-divider" style={{ margin: "0.75rem 0" }} />

                {/* Participants table */}
                <div className="flex flex-col gap-2">
                  {game.participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3"
                      style={{
                        padding: "0.375rem 0.5rem",
                        borderRadius: "3px",
                        background: p.rank === 1 ? "rgba(223,188,94,0.05)" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <RankBadge rank={p.rank} />
                        <span
                          style={{
                            color: p.rank === 1 ? "#e6e0ae" : "#aaa8a0",
                            fontFamily: "Georgia, serif",
                            fontWeight: p.rank === 1 ? "bold" : "normal",
                            fontSize: "0.9rem",
                          }}
                        >
                          {p.player.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          style={{
                            color: "#6a6860",
                            fontSize: "0.8rem",
                            fontStyle: "italic",
                          }}
                        >
                          {p.wonder}
                        </span>
                        <span
                          style={{
                            color: p.rank === 1 ? "#dfbc5e" : "#aaa8a0",
                            fontFamily: "Georgia, serif",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            minWidth: "3rem",
                            textAlign: "right",
                          }}
                        >
                          {p.score} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
