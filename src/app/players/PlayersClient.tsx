"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PlayerWithStats = {
  id: number;
  name: string;
  createdAt: Date | null;
  gamesPlayed: number;
  wins: number;
};

type Props = {
  initialPlayers: PlayerWithStats[];
};

export default function PlayersClient({ initialPlayers }: Props) {
  const router = useRouter();
  const [players, setPlayers] = useState(initialPlayers);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add player");
      } else {
        setSuccess(`${data.name} has been enrolled in the chronicles.`);
        setNewName("");
        router.refresh();
        // Optimistically add to list
        setPlayers((prev) =>
          [...prev, { ...data, gamesPlayed: 0, wins: 0 }].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );
      }
    } catch {
      setError("Failed to add player");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Remove ${name} from the chronicles? This will not delete their game history.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPlayers((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete player");
      }
    } catch {
      alert("Failed to delete player");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Players</h1>
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(90deg, #dfbc5e, transparent)",
            marginTop: "0.5rem",
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Add player form */}
        <div className="scribe-card" style={{ height: "fit-content" }}>
          <div className="section-title">Enroll a New Player</div>
          <form onSubmit={handleAddPlayer} className="flex flex-col gap-4">
            <div>
              <label className="scribe-label">Player Name</label>
              <input
                type="text"
                className="scribe-input"
                placeholder="Enter name..."
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                maxLength={50}
                disabled={loading}
              />
              {error && <div className="error-msg">{error}</div>}
              {success && <div className="success-msg">{success}</div>}
            </div>
            <button
              type="submit"
              className="scribe-btn-primary"
              disabled={loading || !newName.trim()}
            >
              {loading ? "Enrolling..." : "Enroll Player"}
            </button>
          </form>
        </div>

        {/* Players list */}
        <div className="lg:col-span-2">
          <div className="section-title">
            Enrolled Players ({players.length})
          </div>
          {players.length === 0 ? (
            <div className="empty-state">
              No players enrolled yet. Add your first player to begin.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="scribe-card"
                  style={{ padding: "0.875rem 1rem" }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #dfbc5e, #b8963e)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1a1916",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          fontFamily: "Georgia, serif",
                          flexShrink: 0,
                        }}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div
                          style={{
                            color: "#e6e0ae",
                            fontFamily: "Georgia, serif",
                            fontWeight: "bold",
                            fontSize: "0.95rem",
                          }}
                        >
                          {player.name}
                        </div>
                        <div style={{ color: "#6a6860", fontSize: "0.75rem" }}>
                          {player.gamesPlayed} game{player.gamesPlayed !== 1 ? "s" : ""} &middot;{" "}
                          {player.wins} win{player.wins !== 1 ? "s" : ""}
                          {player.gamesPlayed > 0 && (
                            <span style={{ color: "#dfbc5e" }}>
                              {" "}
                              ({Math.round((player.wins / player.gamesPlayed) * 100)}% WR)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      className="scribe-btn-danger"
                      onClick={() => handleDelete(player.id, player.name)}
                      disabled={deletingId === player.id}
                      style={{ flexShrink: 0 }}
                    >
                      {deletingId === player.id ? "..." : "Remove"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
