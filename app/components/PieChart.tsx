import React, { useEffect, useRef, useMemo } from "react";
import { Pie } from "@antv/g2plot";

interface PieChartProps {
  data: { type: string; value: number }[];
  colorMap?: Record<string, string>;
}

const PieChart: React.FC<PieChartProps> = ({ data, colorMap = {} }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const defaultColorMap = useMemo(
    () => ({
      Tech: "#1890ff",
      Finance: "#52c41a",
      Healthcare: "#faad14",
      Energy: "#f5222d",
      Consumer: "#722ed1",
    }),
    []
  );

  const usdFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const mergedColorMap = { ...defaultColorMap, ...colorMap };
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const piePlot = new Pie(containerRef.current, {
      data,
      angleField: "value",
      colorField: "type",
      radius: 0.8,
      innerRadius: 0.6,
      color: (datum) => mergedColorMap[datum.type] || "#999",

      label: {
        type: "outer",
        content: ({ type, value }) => `${type}: ${usdFormatter.format(value)}`,
      },
      tooltip: {
        showTitle: false,
        formatter: ({ type, value }: { type: string; value: number }) => {
          const percent = ((value / total) * 100).toFixed(2);
          return {
            name: type,
            value: `${usdFormatter.format(value)} (${percent}%)`,
          };
        },
      },

      statistic: {
        title: {
          content: "Total",
          style: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue("--foreground")
              .trim(),
          },
        },
        content: {
          content: usdFormatter.format(total),
          style: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue("--foreground")
              .trim(),
          },
        },
      },

      legend: {
        position: "top",
      },
    });

    piePlot.render();

    return () => piePlot.destroy();
  }, [data, colorMap, defaultColorMap, usdFormatter]);

  return <div ref={containerRef} className="pie-chart-container" />;
};

export default PieChart;
