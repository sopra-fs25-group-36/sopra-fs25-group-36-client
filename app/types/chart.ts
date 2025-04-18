// src/types/chart.ts

export interface StockDataPointDTO {
    symbol: string;
    date: string; // Expecting 'YYYY-MM-DD' string from backend for Plotly
    open?: number | null; // Use optional or null if backend might not send it
    high?: number | null;
    low?: number | null;
    close?: number | null;
    volume?: number | null;
  }