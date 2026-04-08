"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Product } from "@/types/inventory";

interface TopValueChartProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
}

const TOP_VALUE_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
];

/**
 * TopValueChart Component
 * Displays top 5 products by total inventory value
 * Value = price × quantity
 * Uses recharts pie chart with interactive tooltips
 */
export function TopValueChart({
  products,
  isLoading = false,
  className,
}: TopValueChartProps) {
  const chartData = useMemo(() => {
    const withValue = products.map((product) => ({
      product,
      totalValue: product.price * product.quantity,
    }));

    return withValue
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5)
      .map((item) => ({
        name: item.product.name,
        value: Math.round(item.totalValue * 100) / 100,
        productId: item.product.id,
      }));
  }, [products]);

  const totalValue = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData],
  );

  if (isLoading) {
    return (
      <div
        className={`glass rounded-lg p-6 flex items-center justify-center h-80 ${className}`}
      >
        <p className="text-muted-foreground">Loading chart...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div
        className={`glass rounded-lg p-6 flex items-center justify-center h-80 ${className}`}
      >
        <p className="text-muted-foreground">No inventory data available</p>
      </div>
    );
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: readonly {
      payload?: {
        name: string;
        value: number;
        productId: string;
      };
    }[];
  }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalValue) * 100).toFixed(1);
      return (
        <div className="glass rounded p-2 border border-white/20">
          <p className="text-sm font-semibold text-foreground">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            ${data.value.toFixed(2)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`glass rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Top 5 Value Products
        </h3>
        <p className="text-sm text-muted-foreground">
          Total inventory value: ${totalValue.toFixed(2)}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent = 0 }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationDuration={500}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${entry.productId}`}
                fill={TOP_VALUE_COLORS[index % TOP_VALUE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={CustomTooltip} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              color: "var(--foreground)",
            }}
            formatter={(value: string) => (
              <span style={{ color: "var(--muted-foreground)" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
