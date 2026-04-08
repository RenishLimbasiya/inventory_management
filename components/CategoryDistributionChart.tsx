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
import { Product, ProductCategory } from "@/types/inventory";

interface CategoryDistributionChartProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Category distribution colors
 * Each category gets a unique color for visual distinction
 */
const CATEGORY_COLORS: Record<ProductCategory, string> = {
  electronics: "#3b82f6",
  clothing: "#ec4899",
  food: "#f59e0b",
  furniture: "#8b5cf6",
  tools: "#14b8a6",
  stationery: "#6366f1",
  other: "#6b7280",
};

/**
 * CategoryDistributionChart Component
 * Displays product distribution by category
 * Uses recharts pie chart with interactive tooltips
 * Shows quantity distribution, not count
 */
export function CategoryDistributionChart({
  products,
  isLoading = false,
  className,
}: CategoryDistributionChartProps) {
  const chartData = useMemo(() => {
    const distribution: Record<ProductCategory, number> = {
      electronics: 0,
      clothing: 0,
      food: 0,
      furniture: 0,
      tools: 0,
      stationery: 0,
      other: 0,
    };

    products.forEach((product) => {
      distribution[product.category] += product.quantity;
    });

    return Object.entries(distribution)
      .filter(([, quantity]) => quantity > 0)
      .map(([category, quantity]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: quantity,
        category: category as ProductCategory,
      }));
  }, [products]);

  const totalQuantity = useMemo(
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
      payload?: { name: string; value: number; category: ProductCategory };
    }[];
  }) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalQuantity) * 100).toFixed(1);
      return (
        <div className="glass rounded p-2 border border-white/20">
          <p className="text-sm font-semibold text-foreground">{data.name}</p>
          <p className="text-xs text-muted-foreground">
            {data.value} units ({percentage}%)
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
          Inventory by Category
        </h3>
        <p className="text-sm text-muted-foreground">
          Distribution of {totalQuantity} total items across categories
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
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.category}`}
                fill={CATEGORY_COLORS[entry.category]}
              />
            ))}
          </Pie>
          <Tooltip content={CustomTooltip} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              color: "hsl(var(--muted-foreground))",
            }}
            formatter={(value) =>
              `${value} (${chartData.find((d) => d.name === value)?.value || 0} units)`
            }
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => {
          const data = chartData.find(
            (d) => d.category === (category as ProductCategory),
          );
          return (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="text-xs">
                <p className="font-medium text-foreground capitalize">
                  {category}
                </p>
                {data && (
                  <p className="text-muted-foreground">{data.value} units</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
