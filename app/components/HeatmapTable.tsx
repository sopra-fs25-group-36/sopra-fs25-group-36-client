"use client";
import React, { useEffect, useState } from "react";

interface Holding {
  symbol: string;
  quantity: number;
  category: string;
  currentPrice: number;
}

type HoldingsByRound = Record<string, Holding[]>;

interface CellInfo {
  value: number;
  pctChange: number | null;
}

interface HeatmapTableProps {
  playerId: number;
  gameId: number;
}

const HeatmapTable: React.FC<HeatmapTableProps> = ({ playerId, gameId }) => {
  const [rounds, setRounds] = useState<string[]>([]);
  const [cells, setCells] = useState<Record<string, Record<string, CellInfo>>>(
    {}
  );
  const [minPct, setMinPct] = useState(0);
  const [maxPct, setMaxPct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/stocks/player-holdings/${playerId}/all-rounds?gameId=${gameId}`
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: HoldingsByRound = await res.json();

        // 1) Derive display rounds from backend keys, sorted numerically
        const displayRounds = Object.keys(data).sort(
          (a, b) => Number(a) - Number(b)
        );
        // 2) Remove extra cols if needed
        if (displayRounds.length > 1) displayRounds.pop();
        setRounds(displayRounds);

        // 2) Gather all symbols ever present
        const allSyms = new Set<string>();
        displayRounds.forEach((r) =>
          data[r].forEach((h) => allSyms.add(h.symbol))
        );

        // 3) Build cell map
        const map: Record<string, Record<string, CellInfo>> = {};
        const pctList: number[] = [];

        allSyms.forEach((sym) => {
          map[sym] = {};
          let prevValue: number | null = null;

          displayRounds.forEach((r) => {
            const qty =
              prevValue === null
                ? 0
                : (data[r].find((h) => h.symbol === sym)?.quantity ?? 0);

            // Use the current round’s price
            const price =
              data[r].find((h) => h.symbol === sym)?.currentPrice ?? 0;
            const value = qty * price;

            // Compute % change vs previous cell
            let pct: number | null = null;
            if (prevValue !== null && prevValue > 0) {
              pct = ((value - prevValue) / prevValue) * 100;
              pctList.push(pct);
            }

            map[sym][r] = { value, pctChange: pct };
            prevValue = value;
          });
        });

        // 5) Commit data
        setCells(map);
        if (pctList.length) {
          setMinPct(Math.min(...pctList));
          setMaxPct(Math.max(...pctList));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
          setError(err.message);
        } else {
          console.error(err);
          setError("Unknown error");
        }
      }
    })();
  }, [playerId, gameId]);

  // derive symbol list from your filled-in map
  const symbols = Object.keys(cells).sort();

  if (loading) {
    return <div>Loading holdings…</div>;
  }
  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  // your heat‐map coloring & arrow logic
  const heatColor = (pct: number | null) => {
    if (pct == null) return "#fff";
    const norm = (pct - minPct) / (maxPct - minPct);
    const hue = Math.round(Math.max(0, Math.min(1, norm)) * 120);
    return `hsl(${hue},60%,75%)`;
  };
  const arrow = (pct: number | null) =>
    pct == null ? "" : pct > 0 ? "▲" : pct < 0 ? "▼" : "•";

  return (
    <div
      style={{
        maxHeight: 300,
        overflowY: "auto",
        overflowX: "auto",
        marginTop: 16,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Round</th>
            {rounds.map((r) => (
              <th key={r} style={{ border: "1px solid #ddd", padding: 8 }}>
                #{r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {symbols.map((sym) => (
            <tr key={sym}>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  fontWeight: "bold",
                }}
              >
                {sym}
              </td>
              {rounds.map((r) => {
                const cell = cells[sym]?.[r];
                const isZero = !cell || cell.value === 0;
                return (
                  <td
                    key={r}
                    style={{
                      border: "1px solid #ddd",
                      padding: 8,
                      textAlign: "center",
                      background: isZero ? "#fff" : heatColor(cell!.pctChange),
                    }}
                  >
                    {isZero ? (
                      "-"
                    ) : (
                      <>
                        <div>${cell!.value.toFixed(2)}</div>
                        {cell!.pctChange != null && (
                          <div>
                            {arrow(cell!.pctChange)}{" "}
                            {Math.abs(cell!.pctChange).toFixed(2)}%
                          </div>
                        )}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HeatmapTable;
