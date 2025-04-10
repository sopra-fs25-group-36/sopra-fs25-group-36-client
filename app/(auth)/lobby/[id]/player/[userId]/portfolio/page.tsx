"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PortfolioPage from "@/components/PortfolioPage";

interface StockHolding {
    symbol: string;
    quantity: number;
    category: string;
    currentPrice: number;
}

interface Transaction {
    stockId: string;
    quantity: number;
    price: number;
    type: string;
}

interface PlayerState {
    userId: number;
    cashBalance: number;
    stocks: StockHolding[];
    transactionHistory: Transaction[];
}
// ONLY USE WHEN GAME LOGIC IS READY
// export default function PlayerPortfolio() {
//     const { lobbyId, userId } = useParams();
//     const [player, setPlayer] = useState<PlayerState | null>(null);
//     const [loading, setLoading] = useState(true);
//
//     useEffect(() => {
//         if (!lobbyId || !userId) return;
//
//         const fetchData = async () => {
//             try {
//                 const res = await fetch(
//                     `/api/lobby/${lobbyId}/players/${userId}/state`
//                 );
//                 if (!res.ok) throw new Error("Failed to load player data");
//
//                 const data = await res.json();
//                 setPlayer(data);
//             } catch (err) {
//                 console.error("Error fetching player state:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchData();
//     }, [lobbyId, userId]);
//
//     if (loading) return <div className="p-6">Loading portfolio...</div>;
//     if (!player) return <div className="p-6 text-red-600">Player not found.</div>;
//
//     return <PortfolioPage player={player} />;
// }

const dummyPlayer = {
    userId: 42,
    cashBalance: 3200,
    stocks: [
        { symbol: "AAPL", quantity: 10, category: "Tech", currentPrice: 160 },
        { symbol: "XOM", quantity: 8, category: "Energy", currentPrice: 110 },
        { symbol: "JPM", quantity: 5, category: "Finance", currentPrice: 130 },
        { symbol: "PFE", quantity: 12, category: "Healthcare", currentPrice: 45 },
        { symbol: "PG", quantity: 3, category: "Consumer", currentPrice: 150 },
    ],
    transactionHistory: [
        { stockId: "AAPL", quantity: 5, price: 155, type: "BUY" },
        { stockId: "XOM", quantity: 3, price: 108, type: "BUY" },
        { stockId: "AAPL", quantity: 2, price: 162, type: "SELL" },
    ],
};

export default function PlayerPortfolio() {
    const [player, setPlayer] = useState(dummyPlayer); // just inject the dummy
    const [loading, setLoading] = useState(false); // no need to load

    return <PortfolioPage player={player} />;
}