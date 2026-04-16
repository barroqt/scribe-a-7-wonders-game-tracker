"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WONDERS } from "@/db/schema";

type Player = {
  id: number;
  name: string;
  createdAt: Date | null;
};

type Participant = {
  playerId: number | "";
  wonder: string;
  score: string;
};

const DEFAULT_PARTICIPANT: Participant = {
  playerId: "",
  wonder: "",
  score: "",
};

type Props = {
  players: Player[];
};

export default function AddGameClient({ players }: Props) {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([
    { ...DEFAULT_PARTICIPANT },
    { ...DEFAULT_PARTICIPANT },
    { ...DEFAULT_PARTICIPANT },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playedAt, setPlayedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );

  function addParticipant() {
    if (participants.length < 7) {
      setParticipants((prev) => [...prev, { ...DEFAULT_PARTICIPANT }]);
    }
  }

  function removeParticipant(index: number) {
    if (participants.length > 3) {
      setParticipants((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function updateParticipant(
    index: number,
    field: keyof Participant,
    value: string | number
  ) {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
    setError("");
  }

  // Get wonders already selected (excluding current row)
  function usedWonders(excludeIndex: number) {
    return participants
      .filter((_, i) => i !== excludeIndex)
      .map((p) => p.wonder)
      .filter(Boolean);
  }

  // Get players already selected (excluding current row)
  function usedPlayers(excludeIndex: number) {
    return participants
      .filter((_, i) => i !== excludeIndex)
      .map((p) => p.playerId)
      .filter((id): id is number => id !== "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate all fields filled
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.playerId) {
        setError(`Player ${i + 1}: select a player`);
        return;
      }
      if (!p.wonder) {
        setError(`Player ${i + 1}: select a wonder`);
        return;
      }
      if (!p.score || isNaN(parseInt(p.score))) {
        setError(`Player ${i + 1}: enter a valid score`);
        return;
      }
    }

    // Validate unique players
    const playerIds = participants.map((p) => p.playerId);
    if (new Set(playerIds).size !== playerIds.length) {
      setError("Each player can only appear once per game");
      return;
    }

    // Validate unique wonders
    const wonderNames = participants.map((p) => p.wonder);
    if (new Set(wonderNames).size !== wonderNames.length) {
      setError("Each wonder can only be used once per game");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: participants.map((p) => ({
            playerId: Number(p.playerId),
            wonder: p.wonder,
            score: parseInt(p.score),
          })),
          playedAt: new Date(playedAt).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to record game");
      } else {
        router.push("/history");
        router.refresh();
      }
    } catch {
      setError("Failed to record game");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="page-title">Record a Game</h1>
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(90deg, #dfbc5e, transparent)",
            marginTop: "0.5rem",
          }}
        />
        <p style={{ color: "#6a6860", fontSize: "0.85rem", marginTop: "0.5rem", fontStyle: "italic" }}>
          Enter the results of your 7 Wonders session (3–7 players)
        </p>
      </div>

      {players.length === 0 ? (
        <div className="scribe-card">
          <div className="empty-state">
            No players enrolled yet.{" "}
            <a href="/players" style={{ color: "#dfbc5e" }}>
              Add players first
            </a>{" "}
            before recording a game.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Date */}
          <div className="scribe-card">
            <div className="section-title">Game Date</div>
            <div>
              <label className="scribe-label">Date Played</label>
              <input
                type="date"
                className="scribe-input"
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                style={{ maxWidth: "200px" }}
              />
            </div>
          </div>

          {/* Participants */}
          <div className="scribe-card">
            <div className="section-title">
              Participants ({participants.length} / 7)
            </div>

            <div className="flex flex-col gap-3">
              {/* Column headers */}
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "1fr 1fr 80px 36px" }}
              >
                <div className="scribe-label" style={{ marginBottom: 0 }}>Player</div>
                <div className="scribe-label" style={{ marginBottom: 0 }}>Wonder</div>
                <div className="scribe-label" style={{ marginBottom: 0 }}>Score</div>
                <div />
              </div>

              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="grid gap-2 items-center"
                  style={{ gridTemplateColumns: "1fr 1fr 80px 36px" }}
                >
                  {/* Player select */}
                  <select
                    className="scribe-select"
                    value={participant.playerId}
                    onChange={(e) =>
                      updateParticipant(index, "playerId", e.target.value ? Number(e.target.value) : "")
                    }
                  >
                    <option value="">— Select —</option>
                    {players.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={usedPlayers(index).includes(p.id)}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>

                  {/* Wonder select */}
                  <select
                    className="scribe-select"
                    value={participant.wonder}
                    onChange={(e) =>
                      updateParticipant(index, "wonder", e.target.value)
                    }
                  >
                    <option value="">— Select —</option>
                    {WONDERS.map((w) => (
                      <option
                        key={w}
                        value={w}
                        disabled={usedWonders(index).includes(w)}
                      >
                        {w}
                      </option>
                    ))}
                  </select>

                  {/* Score input */}
                  <input
                    type="number"
                    className="scribe-input"
                    placeholder="0"
                    value={participant.score}
                    onChange={(e) =>
                      updateParticipant(index, "score", e.target.value)
                    }
                    min="0"
                    max="999"
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    disabled={participants.length <= 3}
                    style={{
                      background: "transparent",
                      border: "1px solid #3a3830",
                      borderRadius: "3px",
                      color: participants.length <= 3 ? "#3a3830" : "#d73c37",
                      cursor: participants.length <= 3 ? "not-allowed" : "pointer",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                    title="Remove participant"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {participants.length < 7 && (
              <button
                type="button"
                onClick={addParticipant}
                className="scribe-btn-ghost"
                style={{ marginTop: "1rem", width: "100%" }}
              >
                + Add Player
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "rgba(215,60,55,0.1)",
                border: "1px solid #d73c37",
                borderRadius: "3px",
                padding: "0.75rem 1rem",
                color: "#d73c37",
                fontSize: "0.85rem",
                fontFamily: "Georgia, serif",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="scribe-btn-ghost"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="scribe-btn-primary"
              disabled={loading}
            >
              {loading ? "Recording..." : "Record Game"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
