export interface StockHoldingDTO {
    symbol: string;
    quantity: number;
    category: string;      // e.g. “TECH”, “ENERGY”
    currentPrice: number;  // last known price
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
