"use client";

import React, { useEffect, useRef } from "react";
import { Pie, PieOptions } from "@antv/g2plot";

interface PieChartProps {
  data: { type: string; value: number }[];
  colorMap?: Record<string, string>;
}

const PieChart: React.FC<PieChartProps> = ({ data, colorMap = {} }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const config: PieOptions = {
      data,
      angleField: "value",
      colorField: "type",
      radius: 1,
      label: false,
      legend: {
        position: "top",
        itemName: {
          formatter: (text: string) => text,
        },
      },
      tooltip: {
        formatter: (datum) => ({
          name: datum.type,
          value: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(datum.value),
        }),
      },
    };

    const plot = new Pie(el, config);
    plot.render();

    return () => {
      plot.destroy();
    };
  }, [data, colorMap]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default PieChart;
