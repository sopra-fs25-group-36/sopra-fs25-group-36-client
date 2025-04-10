"use client";

import React, { useEffect, useRef } from "react";
import { Bar } from "@antv/g2plot";
import type { BarOptions } from "@antv/g2plot";

interface BarChartProps {
    data: { name: string; value: number; category: string }[];
    colorMap: Record<string, string>;
}

const HorizontalBarChart: React.FC<BarChartProps> = ({ data, colorMap }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const config: BarOptions = {
            data,
            xField: "value",
            yField: "name",
            isHorizontal: true,
            seriesField: "category",
            // color: ({ category }) => colorMap[category] || "#999",
            label: {
                position: "right",
                style: { fill: "#000" },
                content: (datum) => `$${datum.value.toLocaleString()}`,
            },
            tooltip: {
                showTitle: false,
                formatter: (datum) => ({
                    name: datum.name,
                    value: `$${datum.value.toLocaleString()}`,
                }),
            },
            legend: { position: "top" },
        };

        const plot = new Bar(containerRef.current, config);
        plot.render();

        return () => plot.destroy();
    }, [data, colorMap]);

    return <div ref={containerRef} style={{ width: "100%", height: 400 }} />;
};

export default HorizontalBarChart;
