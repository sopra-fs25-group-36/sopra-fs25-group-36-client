export interface StockPriceGetDTO {
  symbol: string;
  round: number;
  price: number;
  category: string; // Make sure this is present if your backend sends it
  date: string;     // Crucial for chart filtering: e.g., "2024-05-15"
}
