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
} from "chart.js";

// Register necessary chart components
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

interface AnimatedLineChartProps {
  datasets: {
    label: string;
    data: number[];
  }[];
}

const AnimatedLineChart: React.FC<AnimatedLineChartProps> = ({ datasets }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Dynamically generate colors for each dataset
    const generateColor = (index: number) => {
      const colors = [
        "#11e098",
        "#ff3d67",
        "#9966ff",
        "#4bc0c0",
        "#ff8c42",
        "#ffce56",
        "#cc65fe",
        "#ff6384",
        "#36a2eb",
      ];
      return colors[index % colors.length]; // Cycles through the colors
    };

    // Prepare the chart data
    const chartData = {
      labels: Array.from({ length: 10 }, (_, i) => `${i + 1}`), // Use labels dynamically
      datasets: datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data.map((y, i) => ({ x: i + 1, y })), // Mapping dataset to points
        borderColor: generateColor(index),
        backgroundColor: generateColor(index),
        borderWidth: 2,
        fill: false,
        tension: 0.3,
      })),
    };

    const chartInstance = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Round", // X-axis label
            },
            grid: {
              display: false, // Remove grid
            },
          },
          y: {
            title: {
              display: true,
              // text: "Stock Price (in $)",
              text: "Price",
            },
            min: 0, // Ensure the y-axis always starts from 0
            grid: {
              display: false, // Remove grid
            },
            ticks: {
              callback: (value) => {
                // Only apply toFixed if value is a number and remove decimals
                if (typeof value === "number") {
                  return `$${Math.round(value)}`; // No decimals
                }
                return value;
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                // Handle both object and number value types
                const value = context.parsed.y;
                return `${label}: $${value}`;
              },
              title: (context) => {
                // Show "Round X" in the tooltip title
                return `Round ${context[0].label}`;
              },
            },
          },
          legend: {
            display: true, // Disable the legend
          },
        },
      },
    });

    // Cleanup on component unmount
    return () => {
      chartInstance.destroy();
    };
  }, [datasets]);

  return (
    <div style={{ maxWidth: "400px", height: "300px", margin: "auto" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default AnimatedLineChart;
