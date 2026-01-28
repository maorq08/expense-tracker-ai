"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  Calendar,
  DollarSign,
  Tag,
  FileText,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Zap,
  MoreHorizontal,
  Heart,
  Shield,
  ThumbsDown,
  FastForward,
  MapPin,
} from "lucide-react";
import { Expense, ExpenseLocation, Category, Sentiment, CATEGORIES, SENTIMENTS } from "@/types";
import { todayISO } from "@/lib/formatters";
import LocationPicker from "./LocationPicker";

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, "id" | "createdAt">) => void;
  initialData?: Expense;
  onCancel: () => void;
}

interface FormErrors {
  amount?: string;
  description?: string;
  date?: string;
}

const CATEGORY_ICONS: Record<Category, typeof Utensils> = {
  Food: Utensils,
  Transportation: Car,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Bills: Zap,
  Other: MoreHorizontal,
};

const CATEGORY_COLORS: Record<Category, string> = {
  Food: "bg-indigo-100 text-indigo-600 border-indigo-200",
  Transportation: "bg-cyan-100 text-cyan-600 border-cyan-200",
  Entertainment: "bg-violet-100 text-violet-600 border-violet-200",
  Shopping: "bg-pink-100 text-pink-600 border-pink-200",
  Bills: "bg-orange-100 text-orange-600 border-orange-200",
  Other: "bg-slate-100 text-slate-600 border-slate-200",
};

const CATEGORY_ACTIVE: Record<Category, string> = {
  Food: "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200",
  Transportation: "bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-200",
  Entertainment: "bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-200",
  Shopping: "bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200",
  Bills: "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200",
  Other: "bg-slate-500 text-white border-slate-500 shadow-md shadow-slate-200",
};

const SENTIMENT_CONFIG: Record<Sentiment, { icon: typeof Heart; color: string; active: string }> = {
  Essential: {
    icon: Shield,
    color: "bg-slate-100 text-slate-600 border-slate-200",
    active: "bg-slate-600 text-white border-slate-600 shadow-md shadow-slate-200",
  },
  "Worth it": {
    icon: Heart,
    color: "bg-emerald-100 text-emerald-600 border-emerald-200",
    active: "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200",
  },
  Regret: {
    icon: ThumbsDown,
    color: "bg-red-100 text-red-500 border-red-200",
    active: "bg-red-500 text-white border-red-500 shadow-md shadow-red-200",
  },
  "Skip next time": {
    icon: FastForward,
    color: "bg-amber-100 text-amber-600 border-amber-200",
    active: "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200",
  },
};

export default function ExpenseForm({
  onSubmit,
  initialData,
  onCancel,
}: ExpenseFormProps) {
  const [date, setDate] = useState(initialData?.date ?? todayISO());
  const [amount, setAmount] = useState(initialData?.amount.toString() ?? "");
  const [category, setCategory] = useState<Category>(
    initialData?.category ?? "Food"
  );
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [sentiment, setSentiment] = useState<Sentiment | undefined>(
    initialData?.sentiment
  );
  const [location, setLocation] = useState<ExpenseLocation | undefined>(
    initialData?.location
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDescription(initialData.description);
      setSentiment(initialData.sentiment);
      setLocation(initialData.location);
    }
  }, [initialData]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = "Enter a valid amount greater than 0";
    }
    if (numAmount > 999999.99) {
      errs.amount = "Amount cannot exceed $999,999.99";
    }
    if (!description.trim()) {
      errs.description = "Description is required";
    }
    if (description.trim().length > 200) {
      errs.description = "Description must be 200 characters or less";
    }
    if (!date) {
      errs.date = "Date is required";
    }
    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched({ amount: true, description: true, date: true });
      return;
    }
    onSubmit({
      date,
      amount: Math.round(parseFloat(amount) * 100) / 100,
      category,
      description: description.trim(),
      sentiment,
      location,
    });
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={() => handleBlur("date")}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50
            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white
            transition-all duration-200"
        />
        {touched.date && errors.date && (
          <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.date}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => handleBlur("amount")}
            className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white
              transition-all duration-200 text-lg font-semibold"
          />
        </div>
        {touched.amount && errors.amount && (
          <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.amount}</p>
        )}
      </div>

      {/* Category - pill selector */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border
                  transition-all duration-200 ${isActive ? CATEGORY_ACTIVE[cat] : CATEGORY_COLORS[cat] + " hover:scale-105"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Description
        </label>
        <input
          type="text"
          placeholder="e.g., Lunch at cafe"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => handleBlur("description")}
          maxLength={200}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50
            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white
            transition-all duration-200"
        />
        {touched.description && errors.description && (
          <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.description}</p>
        )}
      </div>

      {/* Sentiment */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
          <Heart className="w-3.5 h-3.5 text-slate-400" />
          How do you feel about this?
          <span className="text-slate-300 font-normal text-xs ml-1">Optional</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SENTIMENTS.map((s) => {
            const config = SENTIMENT_CONFIG[s];
            const Icon = config.icon;
            const isActive = sentiment === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSentiment(isActive ? undefined : s)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border
                  transition-all duration-200 ${isActive ? config.active : config.color + " hover:scale-105"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          Location
          <span className="text-slate-300 font-normal text-xs ml-1">Optional</span>
        </label>
        <LocationPicker value={location} onChange={setLocation} />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 btn-gradient text-white py-3 px-4 rounded-xl font-semibold text-sm"
        >
          {initialData ? "Update Expense" : "Add Expense"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-600 py-3 px-4 rounded-xl font-semibold text-sm
            hover:bg-slate-200 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
