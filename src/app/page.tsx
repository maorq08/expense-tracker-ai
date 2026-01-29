"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Zap,
  MoreHorizontal,
  Sparkles,
  MapPin,
} from "lucide-react";
import { useExpenses } from "@/context/ExpenseContext";
import { usePet } from "@/context/PetContext";
import { useToast } from "@/components/Toast";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Category } from "@/types";
import SummaryCards from "@/components/SummaryCards";
import SpendingChart from "@/components/SpendingChart";
import CategoryChart from "@/components/CategoryChart";
import SentimentInsights from "@/components/SentimentInsights";
import Modal from "@/components/Modal";
import ExpenseForm from "@/components/ExpenseForm";
import type { Expense } from "@/types";

const CATEGORY_ICONS: Record<Category, typeof Utensils> = {
  Food: Utensils,
  Transportation: Car,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Bills: Zap,
  Other: MoreHorizontal,
};

const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#6366f1",
  Transportation: "#06b6d4",
  Entertainment: "#8b5cf6",
  Shopping: "#ec4899",
  Bills: "#f97316",
  Other: "#64748b",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { expenses, isLoaded, addExpense, monthlySpent } = useExpenses();
  const { addTreat } = usePet();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const recentExpenses = [...expenses]
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
    )
    .slice(0, 5);

  function handleAdd(data: Omit<Expense, "id" | "createdAt">) {
    addExpense(data);
    addTreat();
    setModalOpen(false);
    toast("Expense added successfully");
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">
                  Financial Overview
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                {getGreeting()}
              </h1>
              <p className="text-slate-400 text-base">
                {isLoaded && expenses.length > 0 ? (
                  <>
                    You&apos;ve spent{" "}
                    <span className="text-indigo-300 font-semibold">
                      {formatCurrency(monthlySpent)}
                    </span>{" "}
                    this month across{" "}
                    <span className="text-indigo-300 font-semibold">
                      {expenses.filter(
                        (e) =>
                          e.date.startsWith(
                            `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
                          )
                      ).length}
                    </span>{" "}
                    transactions
                  </>
                ) : (
                  "Start tracking your expenses to see insights here"
                )}
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-gradient flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-semibold
                shadow-lg shadow-indigo-500/25 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {/* Summary Cards */}
        <div className="-mt-8 relative z-10">
          <SummaryCards />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart />
          <CategoryChart />
        </div>

        {/* Sentiment Insights */}
        <SentimentInsights />

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Recent Expenses
            </h3>
            <Link
              href="/expenses"
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors group"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {isLoaded && recentExpenses.length > 0 ? (
            <div className="divide-y divide-slate-50 stagger-children">
              {recentExpenses.map((expense) => {
                const Icon = CATEGORY_ICONS[expense.category];
                const color = CATEGORY_COLORS[expense.category];
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors animate-fade-in"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color + "14" }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(expense.date)} &middot; {expense.category}
                        {expense.location && (
                          <span className="inline-flex items-center gap-0.5 ml-1.5">
                            <MapPin className="w-3 h-3" />
                            {expense.location.name.split(",")[0]}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : isLoaded ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">
                No expenses yet
              </p>
              <p className="text-slate-300 text-xs">
                Add your first expense to see it here
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-100 rounded w-40" />
                    <div className="h-3 bg-slate-50 rounded w-24" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-16" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Expense"
      >
        <ExpenseForm
          onSubmit={handleAdd}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
