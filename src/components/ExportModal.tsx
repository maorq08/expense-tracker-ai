"use client";

import { useState, useMemo } from "react";
import {
  Download,
  FileText,
  FileJson,
  Calendar,
  CheckSquare,
  Square,
  BarChart3,
} from "lucide-react";
import Modal from "./Modal";
import { Expense } from "@/types";
import {
  ExportOptions,
  ExportField,
  ALL_EXPORT_FIELDS,
  FIELD_LABELS,
  exportExpenses,
} from "@/lib/export";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export default function ExportModal({ open, onClose, expenses }: ExportModalProps) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [fields, setFields] = useState<ExportField[]>([...ALL_EXPORT_FIELDS]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeSummary, setIncludeSummary] = useState(false);

  const filteredCount = useMemo(() => {
    let result = expenses;
    if (startDate) {
      result = result.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      result = result.filter((e) => e.date <= endDate);
    }
    return result.length;
  }, [expenses, startDate, endDate]);

  function toggleField(field: ExportField) {
    setFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  }

  function selectAllFields() {
    setFields([...ALL_EXPORT_FIELDS]);
  }

  function deselectAllFields() {
    setFields([]);
  }

  function handleExport() {
    if (fields.length === 0) return;

    const options: ExportOptions = {
      format,
      fields,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      includeSummary,
    };

    exportExpenses(expenses, options);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Export Expenses">
      <div className="space-y-5">
        {/* Format selector */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Format
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormat("csv")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                format === "csv"
                  ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-200"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => setFormat("json")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                format === "json"
                  ? "bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-200"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

        {/* Field picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">
              Fields to include
            </label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={selectAllFields}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={deselectAllFields}
                className="text-slate-500 hover:text-slate-700 font-medium"
              >
                None
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ALL_EXPORT_FIELDS.map((field) => {
              const checked = fields.includes(field);
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleField(field)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    checked
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="w-4 h-4 text-indigo-500" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  {FIELD_LABELS[field]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date range */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Date range
            <span className="text-slate-300 font-normal text-xs ml-1">Optional</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white"
            />
            <span className="text-slate-400 text-xs font-medium">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Include summary */}
        <button
          type="button"
          onClick={() => setIncludeSummary(!includeSummary)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
            includeSummary
              ? "bg-emerald-50 border-emerald-200"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
          }`}
        >
          {includeSummary ? (
            <CheckSquare className="w-5 h-5 text-emerald-500" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
          <div className="text-left">
            <p className={`text-sm font-semibold ${includeSummary ? "text-emerald-700" : "text-slate-700"}`}>
              Include summary statistics
            </p>
            <p className="text-xs text-slate-400">
              Total, average, and breakdown by category
            </p>
          </div>
          <BarChart3 className={`w-5 h-5 ml-auto ${includeSummary ? "text-emerald-400" : "text-slate-300"}`} />
        </button>

        {/* Preview count */}
        <div className="text-center py-2">
          <span className="text-sm text-slate-500">
            Exporting{" "}
            <span className="font-bold text-slate-900">{filteredCount}</span>{" "}
            expense{filteredCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={fields.length === 0 || filteredCount === 0}
          className="w-full btn-gradient flex items-center justify-center gap-2 text-white py-3 px-4 rounded-xl font-semibold text-sm
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export {format.toUpperCase()}
        </button>
      </div>
    </Modal>
  );
}
