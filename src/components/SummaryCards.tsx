"use client";

import { DollarSign, CalendarDays, TrendingUp, Tag } from "lucide-react";
import { useExpenses } from "@/context/ExpenseContext";
import { formatCurrency } from "@/lib/formatters";

const cards = [
  {
    key: "total",
    label: "Total Spent",
    icon: DollarSign,
    gradient: "from-indigo-500 to-indigo-600",
    shadow: "shadow-indigo-200/50",
    bg: "bg-indigo-50",
    accent: "text-indigo-600",
  },
  {
    key: "monthly",
    label: "This Month",
    icon: CalendarDays,
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-200/50",
    bg: "bg-emerald-50",
    accent: "text-emerald-600",
  },
  {
    key: "daily",
    label: "Daily Average",
    icon: TrendingUp,
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-200/50",
    bg: "bg-amber-50",
    accent: "text-amber-600",
  },
  {
    key: "topCat",
    label: "Top Category",
    icon: Tag,
    gradient: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-200/50",
    bg: "bg-rose-50",
    accent: "text-rose-600",
  },
] as const;

export default function SummaryCards() {
  const { totalSpent, monthlySpent, dailyAverage, topCategory, isLoaded } =
    useExpenses();

  function getValue(key: string) {
    switch (key) {
      case "total":
        return formatCurrency(totalSpent);
      case "monthly":
        return formatCurrency(monthlySpent);
      case "daily":
        return formatCurrency(dailyAverage);
      case "topCat":
        return topCategory ?? "N/A";
      default:
        return "";
    }
  }

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.key}
            className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"
          >
            <div className="h-4 bg-slate-200 rounded w-24 mb-4" />
            <div className="h-8 bg-slate-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      {cards.map(({ key, label, icon: Icon, gradient, shadow, bg, accent }) => (
        <div
          key={key}
          className={`animate-fade-in bg-white rounded-2xl border border-slate-100 p-6
            hover:-translate-y-1 hover:shadow-lg hover:${shadow}
            transition-all duration-300 cursor-default group`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400 tracking-wide uppercase">
              {label}
            </span>
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center
                shadow-md group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {getValue(key)}
          </p>
        </div>
      ))}
    </div>
  );
}
