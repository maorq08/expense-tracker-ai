export const CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SENTIMENTS = [
  "Essential",
  "Worth it",
  "Regret",
  "Skip next time",
] as const;

export type Sentiment = (typeof SENTIMENTS)[number];

export interface ExpenseLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface Expense {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  category: Category;
  description: string;
  sentiment?: Sentiment;
  location?: ExpenseLocation;
  createdAt: string; // ISO datetime
}

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  sentiment: Sentiment | "All";
  startDate: string;
  endDate: string;
}
