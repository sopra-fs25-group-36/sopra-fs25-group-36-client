// import React, { useEffect, useRef } from "react";
// import { Pie } from "@antv/g2plot";

// interface PieChartProps {
//   data: { type: string; value: number }[];
//   colorMap?: Record<string, string>;
// }

// const PieChart: React.FC<PieChartProps> = ({ data, colorMap = {} }) => {
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   // Default colors if none provided
//   const defaultColorMap: Record<string, string> = {
//     Tech: "#1890ff",
//     Finance: "#52c41a",
//     Healthcare: "#faad14",
//     Energy: "#f5222d",
//     Consumer: "#722ed1",
//   };

//   const mergedColorMap = { ...defaultColorMap, ...colorMap };

//   useEffect(() => {
//     if (!containerRef.current || !data.length) return;

//     const total = data.reduce((sum, item) => sum + item.value, 0);

//     const piePlot = new Pie(containerRef.current, {
//       data,
//       angleField: "value",
//       colorField: "type",
//       radius: 0.8,
//       innerRadius: 0.6,
//       color: ({ type }: { type: string }) => mergedColorMap[type] || "#999",

//       label: {
//         type: "outer",
//         content: ({ type, value }) => `${type}: $${value}`,
//       },

//       tooltip: {
//         showTitle: false,
//         formatter: ({ type, value }: any) => ({
//           name: type,
//           value: `$${value}`,
//         }),
//       },

//       statistic: {
//         title: {
//           content: "Total",
//           style: {
//             color: getComputedStyle(document.documentElement)
//               .getPropertyValue("--foreground")
//               .trim(),
//           },
//         },
//         content: {
//           content: `$${total}`,
//           style: {
//             fontWeight: "bold",
//             color: getComputedStyle(document.documentElement)
//               .getPropertyValue("--foreground")
//               .trim(),
//           },
//         },
//       },

//       legend: {
//         position: "top",
//       },
//     });

//     piePlot.render();

//     return () => piePlot.destroy();
//   }, [data, colorMap]);

//   return <div ref={containerRef} className="pie-chart-container" />;
// };

// export default PieChart;
import React, { useEffect, useRef } from "react";
import { Pie } from "@antv/g2plot";

interface PieChartProps {
  data: { type: string; value: number }[];
  colorMap?: Record<string, string>;
}

const PieChart: React.FC<PieChartProps> = ({ data, colorMap = {} }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const defaultColorMap: Record<string, string> = {
    Tech: "#1890ff",
    Finance: "#52c41a",
    Healthcare: "#faad14",
    Energy: "#f5222d",
    Consumer: "#722ed1",
  };

  const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

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
      color: ({ type }: { type: string }) => mergedColorMap[type] || "#999",

      label: {
        type: "outer",
        content: ({ type, value }) => `${type}: ${usdFormatter.format(value)}`,
      },

      tooltip: {
        showTitle: false,
        formatter: ({ type, value }: any) => ({
          name: type,
          value: usdFormatter.format(value),
        }),
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
  }, [data, colorMap]);

  return <div ref={containerRef} className="pie-chart-container" />;
};

export default PieChart;
