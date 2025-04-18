"use client";
import { useState, useEffect } from "react";
import { useApi } from "./useApi";
import { StockHoldingDTO, PlayerStateDTO } from "@/types/player";


// ——— DTOs ——————————————————————————————————————————————————————————————————

export interface StockHoldingDTO {
    symbol: string;
    quantity: number;
    category: string;
    currentPrice: number;
}

export interface TransactionDTO {
    stockId: string;
    quantity: number;
    price: number;
    type: "BUY" | "SELL";
}

export interface PlayerStateDTO {
    userId: string;
    cashBalance: number;
    stocks: StockHoldingDTO[];
    transactionHistory: TransactionDTO[];
}

// ——— usePlayerState Hook ——————————————————————————————————————————————————

export default function usePlayerState(gameId: string) {
    const api = useApi();
    const userId =
        typeof window !== "undefined" ? localStorage.getItem("id") || "" : "";

    // three independent pieces of state
    const [player, setPlayer] = useState<PlayerStateDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!gameId || !userId) return;

        (async () => {
            setIsLoading(true);
            try {
                // 1) fetch the core player state
                const playerState = await api.get<PlayerStateDTO>(
                    `/game/${gameId}/players/${userId}/state`
                );

                // 2) fetch holdings
                const holdings = await api.get<StockHoldingDTO[]>(
                    `/api/stocks/player-holdings/${userId}?gameId=${gameId}`
                );

                // 3) merge and set
                setPlayer({
                    ...playerState,
                    stocks: holdings,
                });
                setError(null);
            } catch (e: any) {
                setPlayer(null);
                setError(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [api, gameId, userId]);

    return { player, isLoading, error };
}

