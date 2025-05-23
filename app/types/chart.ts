export interface StockDataPointDTO {
    symbol: string;
    date: string;
    open?: number | null;
    high?: number | null;
    low?: number | null;
    close?: number | null;
    volume?: number | null;
  }