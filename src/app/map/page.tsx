"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useExpenses } from "@/context/ExpenseContext";

const ExpenseMap = dynamic(() => import("@/components/ExpenseMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl">
      <div className="animate-pulse text-slate-400 text-sm">Loading map...</div>
    </div>
  ),
});

export default function MapPage() {
  const { expenses, isLoaded } = useExpenses();
  const locatedCount = expenses.filter((e) => e.location).length;

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
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">
                Spending Map
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Where You Spend
            </h1>
            <p className="text-slate-400 text-base">
              {isLoaded && locatedCount > 0
                ? `${locatedCount} expense${locatedCount !== 1 ? "s" : ""} pinned on the map`
                : "Add locations to your expenses to see them here"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-8 relative z-10">
        {isLoaded && locatedCount === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              No locations yet
            </p>
            <p className="text-slate-300 text-xs">
              Add locations when creating expenses to visualize spending
              geographically
            </p>
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in"
            style={{ height: "calc(100vh - 300px)", minHeight: "400px" }}
          >
            <ExpenseMap />
          </div>
        )}
      </div>
    </div>
  );
}
