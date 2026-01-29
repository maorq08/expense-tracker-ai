"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Share2,
  Download,
  ArrowLeft,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Zap,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";
import { decodeExpenses } from "@/lib/share";
import { useExpenses } from "@/context/ExpenseContext";
import { useToast } from "@/components/Toast";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Expense, Category } from "@/types";

const CATEGORY_ICONS: Record<Category, typeof Utensils> = {
  Food: Utensils,
  Transportation: Car,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Bills: Zap,
  Other: MoreHorizontal,
};

const CATEGORY_STYLES: Record<Category, { bg: string; text: string }> = {
  Food: { bg: "bg-indigo-50", text: "text-indigo-700" },
  Transportation: { bg: "bg-cyan-50", text: "text-cyan-700" },
  Entertainment: { bg: "bg-violet-50", text: "text-violet-700" },
  Shopping: { bg: "bg-pink-50", text: "text-pink-700" },
  Bills: { bg: "bg-orange-50", text: "text-orange-700" },
  Other: { bg: "bg-slate-50", text: "text-slate-700" },
};

export default function SharedPage() {
  const router = useRouter();
  const { addExpense } = useExpenses();
  const { toast } = useToast();
  const [sharedExpenses, setSharedExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadSharedExpenses() {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const expenses = await decodeExpenses(hash);
        if (expenses.length === 0) {
          setError(true);
        } else {
          setSharedExpenses(expenses);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    }

    loadSharedExpenses();
  }, []);

  function handleImportAll() {
    let imported = 0;
    for (const expense of sharedExpenses) {
      // Create a new expense without the old ID
      const { id, createdAt, ...data } = expense;
      addExpense(data);
      imported++;
    }
    toast(`Imported ${imported} expense${imported !== 1 ? "s" : ""}`);
    router.push("/expenses");
  }

  const total = sharedExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading shared expenses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Share Link</h1>
        <p className="text-slate-500 text-sm mb-6 text-center">
          This link doesn&apos;t contain valid expense data or has expired.
        </p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">
                Shared Expenses
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Someone shared expenses with you
            </h1>
            <p className="text-slate-400 text-base">
              {sharedExpenses.length} expense{sharedExpenses.length !== 1 ? "s" : ""} totaling{" "}
              <span className="text-indigo-300 font-semibold">{formatCurrency(total)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-8 relative z-10">
        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleImportAll}
            className="btn-gradient flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Import All to My Tracker
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>

        {/* Expense table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sharedExpenses.map((expense, index) => {
                  const style = CATEGORY_STYLES[expense.category];
                  const Icon = CATEGORY_ICONS[expense.category];
                  return (
                    <tr
                      key={expense.id || index}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap font-medium">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-900 font-semibold">
                          {expense.description}
                        </span>
                        {expense.location && (
                          <span className="block text-xs text-slate-400 mt-0.5">
                            {expense.location.name.split(",")[0]}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${style.bg} ${style.text}`}
                        >
                          <Icon className="w-3 h-3" />
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3.5 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm text-slate-400 font-medium">
              {sharedExpenses.length} expense{sharedExpenses.length !== 1 ? "s" : ""}
            </span>
            <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Total: {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
