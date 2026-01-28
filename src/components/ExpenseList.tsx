"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Download,
  Plus,
  ChevronUp,
  ChevronDown,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Zap,
  MoreHorizontal,
  SlidersHorizontal,
  X,
  MapPin,
  Shield,
  Heart,
  ThumbsDown,
  FastForward,
} from "lucide-react";
import { useExpenses } from "@/context/ExpenseContext";
import { useToast } from "@/components/Toast";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { exportToCSV } from "@/lib/export";
import {
  CATEGORIES,
  SENTIMENTS,
  Category,
  Sentiment,
  Expense,
  ExpenseFilters,
} from "@/types";
import Modal from "./Modal";
import ExpenseForm from "./ExpenseForm";

type SortField = "date" | "amount" | "category";
type SortDir = "asc" | "desc";

const CATEGORY_ICONS: Record<Category, typeof Utensils> = {
  Food: Utensils,
  Transportation: Car,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Bills: Zap,
  Other: MoreHorizontal,
};

const CATEGORY_STYLES: Record<Category, { bg: string; text: string; icon: string }> = {
  Food: { bg: "bg-indigo-50", text: "text-indigo-700", icon: "#6366f1" },
  Transportation: { bg: "bg-cyan-50", text: "text-cyan-700", icon: "#06b6d4" },
  Entertainment: { bg: "bg-violet-50", text: "text-violet-700", icon: "#8b5cf6" },
  Shopping: { bg: "bg-pink-50", text: "text-pink-700", icon: "#ec4899" },
  Bills: { bg: "bg-orange-50", text: "text-orange-700", icon: "#f97316" },
  Other: { bg: "bg-slate-50", text: "text-slate-700", icon: "#64748b" },
};

const SENTIMENT_STYLES: Record<Sentiment, { bg: string; text: string; icon: typeof Heart }> = {
  Essential: { bg: "bg-slate-100", text: "text-slate-600", icon: Shield },
  "Worth it": { bg: "bg-emerald-50", text: "text-emerald-600", icon: Heart },
  Regret: { bg: "bg-red-50", text: "text-red-500", icon: ThumbsDown },
  "Skip next time": { bg: "bg-amber-50", text: "text-amber-600", icon: FastForward },
};

export default function ExpenseList() {
  const { expenses, isLoaded, addExpense, updateExpense, deleteExpense } =
    useExpenses();
  const { toast } = useToast();

  const [filters, setFilters] = useState<ExpenseFilters>({
    search: "",
    category: "All",
    sentiment: "All",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "All" ||
    filters.sentiment !== "All" ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  const filtered = useMemo(() => {
    let result = [...expenses];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    if (filters.category !== "All") {
      result = result.filter((e) => e.category === filters.category);
    }
    if (filters.sentiment !== "All") {
      result = result.filter((e) => e.sentiment === filters.sentiment);
    }
    if (filters.startDate) {
      result = result.filter((e) => e.date >= filters.startDate);
    }
    if (filters.endDate) {
      result = result.filter((e) => e.date <= filters.endDate);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date":
          cmp = a.date.localeCompare(b.date);
          break;
        case "amount":
          cmp = a.amount - b.amount;
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [expenses, filters, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
    );
  }

  function handleAdd(data: Omit<Expense, "id" | "createdAt">) {
    addExpense(data);
    setModalOpen(false);
    toast("Expense added successfully");
  }

  function handleEdit(data: Omit<Expense, "id" | "createdAt">) {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
      setEditingExpense(undefined);
      setModalOpen(false);
      toast("Expense updated");
    }
  }

  function openAdd() {
    setEditingExpense(undefined);
    setModalOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setModalOpen(true);
  }

  function confirmDelete(id: string) {
    deleteExpense(id);
    setDeleteConfirm(null);
    toast("Expense deleted", "info");
  }

  function handleExport() {
    exportToCSV(filtered);
    toast("CSV exported");
  }

  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in">
        {/* Toolbar */}
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white
                  transition-all duration-200 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                  border transition-all duration-200 ${
                    hasActiveFilters
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
              <button
                onClick={openAdd}
                className="btn-gradient flex items-center gap-1.5 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              <button
                onClick={handleExport}
                disabled={filtered.length === 0}
                className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium
                  hover:bg-slate-200 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-fade-in">
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    category: e.target.value as Category | "All",
                  }))
                }
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={filters.sentiment}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    sentiment: e.target.value as Sentiment | "All",
                  }))
                }
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Sentiments</option>
                {SENTIMENTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <span className="text-slate-400 text-xs font-medium">to</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() =>
                    setFilters({
                      search: "",
                      category: "All",
                      sentiment: "All",
                      startDate: "",
                      endDate: "",
                    })
                  }
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/50">
                    <th
                      className="group px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors"
                      onClick={() => toggleSort("date")}
                    >
                      <span className="flex items-center gap-1">
                        Date <SortIcon field="date" />
                      </span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th
                      className="group px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors"
                      onClick={() => toggleSort("category")}
                    >
                      <span className="flex items-center gap-1">
                        Category <SortIcon field="category" />
                      </span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                      Feeling
                    </th>
                    <th
                      className="group px-5 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600 transition-colors"
                      onClick={() => toggleSort("amount")}
                    >
                      <span className="flex items-center justify-end gap-1">
                        Amount <SortIcon field="amount" />
                      </span>
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 stagger-children">
                  {filtered.map((expense) => {
                    const style = CATEGORY_STYLES[expense.category];
                    const Icon = CATEGORY_ICONS[expense.category];
                    return (
                      <tr
                        key={expense.id}
                        className="animate-fade-in hover:bg-slate-50/80 transition-colors group/row"
                      >
                        <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap font-medium">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-slate-900 font-semibold">
                            {expense.description}
                          </span>
                          {expense.location && (
                            <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                              <MapPin className="w-3 h-3" />
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
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          {expense.sentiment ? (
                            (() => {
                              const ss = SENTIMENT_STYLES[expense.sentiment];
                              const SIcon = ss.icon;
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${ss.bg} ${ss.text}`}
                                >
                                  <SIcon className="w-3 h-3" />
                                  {expense.sentiment}
                                </span>
                              );
                            })()
                          ) : (
                            <span className="text-xs text-slate-300">&mdash;</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrency(expense.amount)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => openEdit(expense)}
                              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(expense.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm text-slate-400 font-medium">
                {filtered.length} expense{filtered.length !== 1 ? "s" : ""}
              </span>
              <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Total: {formatCurrency(filteredTotal)}
              </span>
            </div>
          </>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              {expenses.length === 0
                ? "No expenses yet"
                : "No matching expenses"}
            </p>
            <p className="text-slate-300 text-xs mb-5">
              {expenses.length === 0
                ? "Start tracking your spending by adding your first expense"
                : "Try adjusting your filters"}
            </p>
            {expenses.length === 0 && (
              <button
                onClick={openAdd}
                className="btn-gradient inline-flex items-center gap-1.5 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(undefined);
        }}
        title={editingExpense ? "Edit Expense" : "Add Expense"}
      >
        <ExpenseForm
          onSubmit={editingExpense ? handleEdit : handleAdd}
          initialData={editingExpense}
          onCancel={() => {
            setModalOpen(false);
            setEditingExpense(undefined);
          }}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Expense"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to delete this expense?<br />
            <span className="text-slate-400">This action cannot be undone.</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => deleteConfirm && confirmDelete(deleteConfirm)}
              className="flex-1 bg-red-500 text-white py-2.5 px-4 rounded-xl font-semibold text-sm
                hover:bg-red-600 transition-all duration-200 hover:shadow-lg hover:shadow-red-200/50"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 bg-slate-100 text-slate-600 py-2.5 px-4 rounded-xl font-semibold text-sm
                hover:bg-slate-200 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
