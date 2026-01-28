"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Expense, Category } from "@/types";
import { getExpenses, saveExpenses } from "@/lib/storage";

interface ExpenseContextType {
  expenses: Expense[];
  isLoaded: boolean;
  addExpense: (data: Omit<Expense, "id" | "createdAt">) => void;
  updateExpense: (id: string, data: Omit<Expense, "id" | "createdAt">) => void;
  deleteExpense: (id: string) => void;
  getExpenseById: (id: string) => Expense | undefined;
  totalSpent: number;
  monthlySpent: number;
  topCategory: Category | null;
  dailyAverage: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setExpenses(getExpenses());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveExpenses(expenses);
    }
  }, [expenses, isLoaded]);

  const addExpense = useCallback(
    (data: Omit<Expense, "id" | "createdAt">) => {
      const newExpense: Expense = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
    },
    []
  );

  const updateExpense = useCallback(
    (id: string, data: Omit<Expense, "id" | "createdAt">) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...data } : e))
      );
    },
    []
  );

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getExpenseById = useCallback(
    (id: string) => expenses.find((e) => e.id === id),
    [expenses]
  );

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const monthlySpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const topCategory =
    Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] as
      | Category
      | undefined ?? null;

  const uniqueDays = new Set(expenses.map((e) => e.date)).size;
  const dailyAverage = uniqueDays > 0 ? totalSpent / uniqueDays : 0;

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoaded,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpenseById,
        totalSpent,
        monthlySpent,
        topCategory,
        dailyAverage,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
}
