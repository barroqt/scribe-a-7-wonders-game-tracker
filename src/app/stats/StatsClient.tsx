"use client";

import { useState } from "react";
import type { PlayerStats, WonderStats } from "@/db/schema";

type Props = {
  playerStats: PlayerStats[];
  wonderStats: WonderStats[];
  totalGames: number;
};

function WinRateBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="stat-bar-container" style={{ flex: 1 }}>
        <div className="stat-bar-fill" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span
        style={{
          color: value >= 50 ? "#dfbc5e" : "#aaa8a0",
          fontFamily: "Georgia, serif",
          fontSize: "0.8rem",
          minWidth: "3rem",
          textAlign: "right",
        }}
      >
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

export default function StatsClient({ playerStats, wonderStats, totalGames }: Props) {
  const [activeTab, setActiveTab] = useState<"players" | "wonders">("players");
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  const sortedPlayers = [...playerStats].sort((a, b) => {
    if (b.gamesPlayed === 0 && a.gamesPlayed === 0) return a.player.name.localeCompare(b.player.name);
    if (b.gamesPlayed === 0) return -1;
    if (a.gamesPlayed === 0) return 1;
    return b.winRate - a.winRate || b.avgScore - a.avgScore;
  });

  const sortedWonders = [...wonderStats].sort((a, b) => {
    if (b.gamesPlayed === 0 && a.gamesPlayed === 0) return a.wonder.localeCompare(b.wonder);
    if (b.gamesPlayed === 0) return -1;
    if (a.gamesPlayed === 0) return 1;
    return b.winRate - a.winRate || b.avgScore - a.avgScore;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="page-title">Statistics</h1>
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(90deg, #dfbc5e, transparent)",
            marginTop: "0.5rem",
          }}
        />
        <p style={{ color: "#6a6860", fontSize: "0.85rem", marginTop: "0.5rem", fontStyle: "italic" }}>
          Based on {totalGames} game{totalGames !== 1 ? "s" : ""} recorded
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          className={`nav-link ${activeTab === "players" ? "active" : ""}`}
          onClick={() => setActiveTab("players")}
          style={{ cursor: "pointer", background: "none", border: "1px solid" }}
        >
          Player Stats
        </button>
        <button
          className={`nav-link ${activeTab === "wonders" ? "active" : ""}`}
          onClick={() => setActiveTab("wonders")}
          style={{ cursor: "pointer", background: "none", border: "1px solid" }}
        >
          Wonder Stats
        </button>
      </div>

      {/* Player Stats Tab */}
      {activeTab === "players" && (
        <div className="flex flex-col gap-4">
          {sortedPlayers.length === 0 ? (
            <div className="scribe-card">
              <div className="empty-state">No player data yet.</div>
            </div>
          ) : (
            sortedPlayers.map((ps, index) => (
              <div key={ps.player.id} className="scribe-card">
                {/* Player header row */}
                <div
                  className="flex items-center gap-4"
                  style={{ cursor: ps.gamesPlayed > 0 ? "pointer" : "default" }}
                  onClick={() => {
                    if (ps.gamesPlayed > 0) {
                      setExpandedPlayer(expandedPlayer === ps.player.id ? null : ps.player.id);
                    }
                  }}
                >
                  {/* Rank */}
                  {ps.gamesPlayed > 0 && (
                    <div
                      style={{
                        width: "1.75rem",
                        height: "1.75rem",
                        borderRadius: "50%",
                        background:
                          index === 0
                            ? "linear-gradient(135deg, #dfbc5e, #b8963e)"
                            : index === 1
                            ? "#4a4840"
                            : index === 2
                            ? "#3a2810"
                            : "#2a2820",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: index === 0 ? "#1a1916" : "#aaa8a0",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        fontFamily: "Georgia, serif",
                        flexShrink: 0,
                        border: index >= 3 ? "1px solid #3a3830" : "none",
                      }}
                    >
                      {index + 1}
                    </div>
                  )}

                  {/* Avatar */}
                  <div
                    style={{
                      width: "2.25rem",
                      height: "2.25rem",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #dfbc5e33, #3a3830)",
                      border: "1px solid #3a3830",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#dfbc5e",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      fontFamily: "Georgia, serif",
                      flexShrink: 0,
                    }}
                  >
                    {ps.player.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name & summary */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: "#e6e0ae",
                        fontFamily: "Georgia, serif",
                        fontWeight: "bold",
                        fontSize: "0.95rem",
                      }}
                    >
                      {ps.player.name}
                    </div>
                    {ps.gamesPlayed > 0 ? (
                      <div style={{ color: "#6a6860", fontSize: "0.75rem" }}>
                        {ps.gamesPlayed} game{ps.gamesPlayed !== 1 ? "s" : ""} &middot; {ps.wins} win{ps.wins !== 1 ? "s" : ""} &middot; Avg {ps.avgScore.toFixed(1)} pts &middot; Best {ps.bestScore} pts
                      </div>
                    ) : (
                      <div style={{ color: "#4a4840", fontSize: "0.75rem", fontStyle: "italic" }}>No games played</div>
                    )}
                  </div>

                  {/* Win rate */}
                  {ps.gamesPlayed > 0 && (
                    <div style={{ minWidth: "120px" }}>
                      <div style={{ color: "#aaa8a0", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Win Rate</div>
                      <WinRateBar value={ps.winRate} />
                    </div>
                  )}

                  {/* Expand indicator */}
                  {ps.gamesPlayed > 0 && (
                    <div style={{ color: "#4a4840", fontSize: "0.75rem", flexShrink: 0 }}>
                      {expandedPlayer === ps.player.id ? "▲" : "▼"}
                    </div>
                  )}
                </div>

                {/* Expanded: per-wonder breakdown */}
                {expandedPlayer === ps.player.id && ps.wonderStats.length > 0 && (
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #3a3830",
                    }}
                  >
                    <div
                      style={{
                        color: "#aaa8a0",
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Performance by Wonder
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {ps.wonderStats
                        .sort((a, b) => b.gamesPlayed - a.gamesPlayed || b.winRate - a.winRate)
                        .map((ws) => (
                          <div
                            key={ws.wonder}
                            style={{
                              background: "#1a1916",
                              borderRadius: "3px",
                              padding: "0.5rem 0.75rem",
                              border: "1px solid #2a2820",
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span style={{ color: "#e6e0ae", fontFamily: "Georgia, serif", fontSize: "0.85rem", fontStyle: "italic" }}>
                                {ws.wonder}
                              </span>
                              <span style={{ color: "#6a6860", fontSize: "0.75rem" }}>
                                {ws.gamesPlayed}× &middot; avg {ws.avgScore.toFixed(0)}
                              </span>
                            </div>
                            <WinRateBar value={ws.winRate} />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Wonders Stats Tab */}
      {activeTab === "wonders" && (
        <div className="flex flex-col gap-4">
          <p style={{ color: "#6a6860", fontSize: "0.8rem", fontStyle: "italic" }}>
            Win rates across all players who have used each wonder.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sortedWonders.map((ws, index) => (
              <div key={ws.wonder} className="scribe-card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div
                      style={{
                        color: "#e6e0ae",
                        fontFamily: "Georgia, serif",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        fontStyle: "italic",
                      }}
                    >
                      {ws.wonder}
                    </div>
                    <div style={{ color: "#6a6860", fontSize: "0.75rem", marginTop: "0.125rem" }}>
                      {ws.gamesPlayed > 0
                        ? `${ws.gamesPlayed} game${ws.gamesPlayed !== 1 ? "s" : ""} · ${ws.wins} win${ws.wins !== 1 ? "s" : ""} · avg ${ws.avgScore.toFixed(1)} pts`
                        : "Never played"}
                    </div>
                  </div>
                  {ws.gamesPlayed > 0 && (
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "50%",
                        background:
                          index === 0
                            ? "linear-gradient(135deg, #dfbc5e, #b8963e)"
                            : "#2a2820",
                        border: index > 0 ? "1px solid #3a3830" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: index === 0 ? "#1a1916" : "#6a6860",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        fontFamily: "Georgia, serif",
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </div>
                  )}
                </div>
                {ws.gamesPlayed > 0 ? (
                  <>
                    <div style={{ color: "#aaa8a0", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Win Rate</div>
                    <WinRateBar value={ws.winRate} />
                  </>
                ) : (
                  <div style={{ color: "#4a4840", fontSize: "0.8rem", fontStyle: "italic" }}>
                    No data yet
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
