"use client";

import React from "react";
import { Pie, PieConfig } from "@ant-design/plots";

interface PieChartProps {
  data: { type: string; value: number }[];
  colorMap: Record<string, string>;
}

const PieChart: React.FC<PieChartProps> = ({ data, colorMap }) => {
  // ① No explicit `: PieConfig` here
  const config = {
    data,
    angleField: "value",
    colorField: "type",
    radius: 1,
    color: (datum: { type: string }) => colorMap[datum.type] || "#ccc",
    label: {
      type: "inner" as const,
      offset: -30,
      content: ({ percent }: { percent: number }) =>
          `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: "center" as const,
      },
    },
  };

  // ② Cast to PieConfig only at the spread site
  return <Pie {...config} />;};

export default PieChart;
