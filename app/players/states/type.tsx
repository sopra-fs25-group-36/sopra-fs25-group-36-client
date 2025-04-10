export interface StockHolding {
    symbol: string;
    quantity: number;
    category: string;
    currentPrice: number;
}

export interface PlayerState {
    userId: number;
    cashBalance: number;
    stocks: StockHolding[];
}