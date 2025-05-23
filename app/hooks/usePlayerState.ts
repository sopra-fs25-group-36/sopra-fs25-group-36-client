"use client";
import { useState, useEffect } from "react";
import { useApi } from "./useApi";
import { StockHoldingDTO, PlayerStateDTO } from "@/types/player";

export default function usePlayerState(gameId: string) {
    const api = useApi();
    const userId =
        typeof window !== "undefined" ? localStorage.getItem("id") || "" : "";
    const [player, setPlayer] = useState<PlayerStateDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!gameId || !userId) return;

        (async () => {
            setIsLoading(true);
            try {
                const playerState = await api.get<PlayerStateDTO>(
                    `/game/${gameId}/players/${userId}/state`
                );

                const holdings = await api.get<StockHoldingDTO[]>(
                    `/api/stocks/player-holdings/${userId}?gameId=${gameId}`
                );

                setPlayer({
                    ...playerState,
                    stocks: holdings,
                });
                setError(null);
            } catch (e: unknown) {
                setPlayer(null);
                if (e instanceof Error) {
                  setError(e);
                } else {
                  setError(new Error("An unexpected error occurred"));
                }
              } finally {
                setIsLoading(false);
              }
        })();
    }, [api, gameId, userId]);

    return { player, isLoading, error };
}

