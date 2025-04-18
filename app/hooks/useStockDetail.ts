// hooks/useStockDetail.ts
import { useState, useEffect } from "react";
import { useApi } from "./useApi";
import { StockPriceGetDTO } from "@/types/stock";  // ← import your existing DTO

export default function useStockDetail(symbol: string, gameId: string) {
    const api = useApi();

    // use the DTO you already have
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
            } catch (e: any) {
                setStock(null);
                setError(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [api, symbol, gameId]);

    return { stock, isLoading, error };
}