"use client";

import {
  Shield,
  Heart,
  ThumbsDown,
  FastForward,
  TrendingDown,
  Lightbulb,
} from "lucide-react";
import { useExpenses } from "@/context/ExpenseContext";
import { formatCurrency } from "@/lib/formatters";
import { Sentiment, SENTIMENTS } from "@/types";

const SENTIMENT_CONFIG: Record<
  Sentiment,
  { icon: typeof Heart; color: string; barColor: string; bgColor: string }
> = {
  Essential: {
    icon: Shield,
    color: "text-slate-600",
    barColor: "#64748b",
    bgColor: "bg-slate-100",
  },
  "Worth it": {
    icon: Heart,
    color: "text-emerald-600",
    barColor: "#10b981",
    bgColor: "bg-emerald-50",
  },
  Regret: {
    icon: ThumbsDown,
    color: "text-red-500",
    barColor: "#ef4444",
    bgColor: "bg-red-50",
  },
  "Skip next time": {
    icon: FastForward,
    color: "text-amber-600",
    barColor: "#f59e0b",
    bgColor: "bg-amber-50",
  },
};

export default function SentimentInsights() {
  const { expenses, isLoaded } = useExpenses();

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="h-5 bg-slate-200 rounded w-48 mb-6 animate-pulse" />
        <div className="h-40 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const labeled = expenses.filter((e) => e.sentiment);
  if (labeled.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900">
            Spending Insights
          </h3>
          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
            Sentiment
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-slate-300">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
            <Lightbulb className="w-7 h-7" />
          </div>
          <p className="text-sm font-medium text-slate-400">
            No labeled expenses yet
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Tag expenses with how you feel to unlock insights
          </p>
        </div>
      </div>
    );
  }

  const totals: Record<string, { count: number; amount: number }> = {};
  for (const s of SENTIMENTS) {
    totals[s] = { count: 0, amount: 0 };
  }
  for (const e of labeled) {
    if (e.sentiment) {
      totals[e.sentiment].count += 1;
      totals[e.sentiment].amount += e.amount;
    }
  }

  const totalLabeled = labeled.reduce((s, e) => s + e.amount, 0);

  const regretAmount = totals["Regret"].amount;
  const skipAmount = totals["Skip next time"].amount;
  const savingsOpportunity = regretAmount + skipAmount;

  // Monthly average of regret + skip
  const uniqueMonths = new Set(labeled.map((e) => e.date.slice(0, 7))).size;
  const monthlySavings =
    uniqueMonths > 0 ? savingsOpportunity / uniqueMonths : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-900">
          Spending Insights
        </h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
          Sentiment
        </span>
      </div>

      {/* Savings opportunity card */}
      {savingsOpportunity > 0 && (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-red-100/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                You could save{" "}
                <span className="text-red-600">
                  {formatCurrency(savingsOpportunity)}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                From expenses you regret or want to skip next time
                {monthlySavings > 0 && (
                  <> &middot; ~{formatCurrency(monthlySavings)}/month</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment breakdown */}
      <div className="space-y-3">
        {SENTIMENTS.map((s) => {
          const config = SENTIMENT_CONFIG[s];
          const Icon = config.icon;
          const data = totals[s];
          const pct =
            totalLabeled > 0
              ? Math.round((data.amount / totalLabeled) * 100)
              : 0;

          if (data.count === 0) return null;

          return (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bgColor}`}
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">
                    {s}
                    <span className="text-slate-400 font-normal ml-1.5 text-xs">
                      {data.count} expense{data.count !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(data.amount)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: config.barColor,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>
          {labeled.length} of {expenses.length} expenses labeled
        </span>
        <span className="font-semibold text-slate-500">
          {Math.round((labeled.length / expenses.length) * 100)}% tagged
        </span>
      </div>
    </div>
  );
}
