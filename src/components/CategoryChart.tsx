"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useExpenses } from "@/context/ExpenseContext";
import { formatCurrency } from "@/lib/formatters";
import { Category } from "@/types";
import {
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Zap,
  MoreHorizontal,
} from "lucide-react";

const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#6366f1",
  Transportation: "#06b6d4",
  Entertainment: "#8b5cf6",
  Shopping: "#ec4899",
  Bills: "#f97316",
  Other: "#64748b",
};

const CATEGORY_ICONS: Record<Category, typeof Utensils> = {
  Food: Utensils,
  Transportation: Car,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Bills: Zap,
  Other: MoreHorizontal,
};

export default function CategoryChart() {
  const { expenses, isLoaded } = useExpenses();

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="h-5 bg-slate-200 rounded w-40 mb-6 animate-pulse" />
        <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const categoryTotals = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalAll = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      pct: totalAll > 0 ? Math.round((value / totalAll) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const hasData = data.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-900">By Category</h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
          All time
        </span>
      </div>
      {hasData ? (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name as Category] || "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 w-full space-y-2.5">
            {data.map((entry) => {
              const Icon =
                CATEGORY_ICONS[entry.name as Category] || MoreHorizontal;
              const color =
                CATEGORY_COLORS[entry.name as Category] || "#64748b";
              return (
                <div key={entry.name} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color + "18" }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700">
                        {entry.name}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(entry.value)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${entry.pct}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-300">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-sm font-medium">No category data yet</p>
        </div>
      )}
    </div>
  );
}
