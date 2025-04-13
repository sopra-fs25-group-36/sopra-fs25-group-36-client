import React, { useEffect, useRef } from "react";
import { Bar } from "@antv/g2plot";

interface BarChartProps {
  data: { name: string; value: number; category: string }[];
  colorMap: Record<string, string>;
}

const BarChartComponent: React.FC<BarChartProps> = ({ data, colorMap }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const config = {
      data,
      xField: "value",
      yField: "name",
      isHorizontal: true,
      seriesField: "category",
      color: ({ category }: { category: string }) =>
        colorMap[category] || "#000",
      label: {
        position: "right",
        content: (datum: any) => `$${datum.value}`,
      },
      tooltip: {
        showTitle: false,
        formatter: (datum: any) => ({
          name: datum.name,
          value: `$${datum.value}`,
        }),
      },
      legend: { position: "top" },
    };

    const plot = new Bar(containerRef.current, config);
    plot.render();

    return () => plot.destroy();
  }, [data, colorMap]);

  return <div ref={containerRef} className="bar-chart-container" />;
};

export default BarChartComponent;
