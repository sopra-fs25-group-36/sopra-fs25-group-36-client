"use client";

import React, { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";

// Register necessary chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

// Function to generate random colors in hex format
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

interface Dataset {
  label: string;
  data: number[];
}

interface ChartProps {
  datasets: Dataset[];
}

const AnimatedLineChart: React.FC<ChartProps> = ({ datasets }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Generate chart data dynamically based on the input datasets
    const chartData = {
      labels: Array.from({ length: datasets[0].data.length }, (_, i) => i + 1),
      datasets: datasets.map((dataset, index) => {
        const lineColor = index === 0 ? "#ff6384" : getRandomColor(); // First dataset gets a fixed color

        return {
          label: dataset.label,
          data: dataset.data,
          borderColor: lineColor, // Line color
          pointBackgroundColor: lineColor, // Point color matches the line
          pointBorderColor: lineColor, // Point border color matches the line
          backgroundColor: lineColor, // Fill area color (if fill is enabled)
          fill: true,
          tension: 0.3,
        };
      }),
    };

    const chartInstance = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // Hide legend
          },
          tooltip: {
            enabled: true, // Enable tooltips
            callbacks: {
              title: function (tooltipItems: TooltipItem<"line">[]) {
                const xLabel = tooltipItems[0]?.label;
                return `Round ${xLabel}`; // Display the x-axis label (round number)
              },
              label: function (tooltipItem: TooltipItem<"line">) {
                const value = tooltipItem.raw as number;
                const datasetLabel = tooltipItem.dataset.label;
                const borderColor = tooltipItem.dataset.borderColor;
                return `${datasetLabel}: $${value.toFixed(2)} (Color: ${borderColor})`; // Format value as dollars
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Round",
              font: {
                size: 14,
                weight: "bold",
              },
            },
            grid: {
              display: false, // Hide grid on x-axis
            },
            ticks: {
              font: {
                size: 12,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: "Stock Price",
              font: {
                size: 14,
                weight: "bold",
              },
            },
            grid: {
              display: false, // Hide grid on y-axis
            },
            ticks: {
              font: {
                size: 12,
              },
              callback: function (value) {
                if (typeof value === "number") {
                  return "$" + value.toFixed(2); // Format y-axis ticks as dollars
                }
                return value; // If it's not a number, return it as is
              },
            },
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [datasets]);

  return (
    <div style={{ maxWidth: "600px", height: "400px", margin: "auto" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default AnimatedLineChart;
