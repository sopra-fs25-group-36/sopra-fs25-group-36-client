import { useState, useEffect } from "react";
import { useApi } from "./useApi";
import { StockPriceGetDTO } from "@/types/stock";

export default function useStockDetail(symbol: string, gameId: string) {
    const api = useApi();

    const [stock, setStock] = useState<StockPriceGetDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!symbol || !gameId) return;

        (async () => {
            setIsLoading(true);
            try {
                const data = await api.get<StockPriceGetDTO>(
                    `/api/stocks/${symbol}?gameId=${gameId}`
                );
                setStock(data);
                setError(null);
            } catch (e: unknown) {
                setStock(null);

                if (e instanceof Error) {
                    setError(e);
                } else {
                    setError(new Error("An unexpected error occurred"));
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [api, symbol, gameId]);

    return { stock, isLoading, error };
}
