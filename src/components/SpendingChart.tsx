"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useExpenses } from "@/context/ExpenseContext";
import { getMonthKey, formatCurrency } from "@/lib/formatters";

export default function SpendingChart() {
  const { expenses, isLoaded } = useExpenses();

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="h-5 bg-slate-200 rounded w-40 mb-6 animate-pulse" />
        <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
    }).format(d);
    months.push({ key, label });
  }

  const monthTotals = expenses.reduce(
    (acc, e) => {
      const mk = getMonthKey(e.date);
      acc[mk] = (acc[mk] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const currentMonthKey = months[months.length - 1].key;
  const data = months.map((m) => ({
    name: m.label,
    amount: Math.round((monthTotals[m.key] || 0) * 100) / 100,
    isCurrent: m.key === currentMonthKey,
  }));

  const hasData = data.some((d) => d.amount > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-900">Monthly Spending</h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
          Last 6 months
        </span>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="barGradientMuted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c7d2fe" />
                <stop offset="100%" stopColor="#ddd6fe" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Spent"]}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                padding: "10px 14px",
                fontSize: "13px",
                fontWeight: 600,
              }}
              cursor={{ fill: "rgba(99, 102, 241, 0.06)", radius: 8 }}
            />
            <Bar dataKey="amount" radius={[8, 8, 4, 4]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isCurrent ? "url(#barGradient)" : "url(#barGradientMuted)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-300">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h4l3-8 4 16 3-8h4" />
            </svg>
          </div>
          <p className="text-sm font-medium">No spending data yet</p>
        </div>
      )}
    </div>
  );
}
