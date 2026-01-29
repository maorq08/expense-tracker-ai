import { Expense, Category, CATEGORIES } from "@/types";

export interface ExportOptions {
  format: "csv" | "json";
  fields: ExportField[];
  startDate?: string;
  endDate?: string;
  includeSummary?: boolean;
}

export type ExportField = "date" | "amount" | "category" | "sentiment" | "location" | "description";

export const ALL_EXPORT_FIELDS: ExportField[] = [
  "date",
  "amount",
  "category",
  "sentiment",
  "location",
  "description",
];

export const FIELD_LABELS: Record<ExportField, string> = {
  date: "Date",
  amount: "Amount",
  category: "Category",
  sentiment: "Sentiment",
  location: "Location",
  description: "Description",
};

function filterByDateRange(expenses: Expense[], startDate?: string, endDate?: string): Expense[] {
  let result = expenses;
  if (startDate) {
    result = result.filter((e) => e.date >= startDate);
  }
  if (endDate) {
    result = result.filter((e) => e.date <= endDate);
  }
  return result;
}

function getFieldValue(expense: Expense, field: ExportField): string {
  switch (field) {
    case "date":
      return expense.date;
    case "amount":
      return expense.amount.toFixed(2);
    case "category":
      return expense.category;
    case "sentiment":
      return expense.sentiment ?? "";
    case "location":
      return expense.location?.name ?? "";
    case "description":
      return expense.description;
  }
}

function computeSummary(expenses: Expense[]) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const average = expenses.length > 0 ? total / expenses.length : 0;
  const byCategory: Record<string, { count: number; amount: number }> = {};

  for (const cat of CATEGORIES) {
    byCategory[cat] = { count: 0, amount: 0 };
  }

  for (const e of expenses) {
    byCategory[e.category].count += 1;
    byCategory[e.category].amount += e.amount;
  }

  return {
    totalExpenses: expenses.length,
    totalAmount: total,
    averageAmount: average,
    byCategory,
  };
}

export function generateCSV(expenses: Expense[], options: ExportOptions): string {
  const filtered = filterByDateRange(expenses, options.startDate, options.endDate);
  const headers = options.fields.map((f) => FIELD_LABELS[f]);

  const rows = filtered.map((e) =>
    options.fields.map((f) => {
      const val = getFieldValue(e, f);
      // Escape description with quotes
      if (f === "description") {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    })
  );

  const lines = [headers.join(","), ...rows.map((r) => r.join(","))];

  if (options.includeSummary) {
    const summary = computeSummary(filtered);
    lines.push("");
    lines.push("# Summary");
    lines.push(`Total Expenses,${summary.totalExpenses}`);
    lines.push(`Total Amount,$${summary.totalAmount.toFixed(2)}`);
    lines.push(`Average Amount,$${summary.averageAmount.toFixed(2)}`);
    lines.push("");
    lines.push("# By Category");
    for (const [cat, data] of Object.entries(summary.byCategory)) {
      if (data.count > 0) {
        lines.push(`${cat},${data.count} expenses,$${data.amount.toFixed(2)}`);
      }
    }
  }

  return lines.join("\n");
}

export function generateJSON(expenses: Expense[], options: ExportOptions): string {
  const filtered = filterByDateRange(expenses, options.startDate, options.endDate);

  const data = filtered.map((e) => {
    const obj: Record<string, string | number> = {};
    for (const f of options.fields) {
      if (f === "amount") {
        obj[f] = e.amount;
      } else {
        obj[f] = getFieldValue(e, f);
      }
    }
    return obj;
  });

  if (options.includeSummary) {
    const summary = computeSummary(filtered);
    return JSON.stringify({ expenses: data, summary }, null, 2);
  }

  return JSON.stringify(data, null, 2);
}

export function exportExpenses(expenses: Expense[], options: ExportOptions): void {
  const content = options.format === "csv"
    ? generateCSV(expenses, options)
    : generateJSON(expenses, options);

  const mimeType = options.format === "csv"
    ? "text/csv;charset=utf-8;"
    : "application/json;charset=utf-8;";

  const extension = options.format;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `expenses-${new Date().toISOString().split("T")[0]}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Legacy function for backwards compatibility
export function exportToCSV(expenses: Expense[]): void {
  exportExpenses(expenses, {
    format: "csv",
    fields: ALL_EXPORT_FIELDS,
  });
}
