"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Home, X, Search, Loader2 } from "lucide-react";
import { ExpenseLocation } from "@/types";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const HOME_STORAGE_KEY = "expense-tracker-home-location";

function getHomeLocation(): ExpenseLocation | null {
  try {
    const raw = localStorage.getItem(HOME_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveHomeLocation(loc: ExpenseLocation) {
  localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(loc));
}

interface LocationPickerProps {
  value?: ExpenseLocation;
  onChange: (location?: ExpenseLocation) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [homeLocation, setHomeLocationState] = useState<ExpenseLocation | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHomeLocationState(getHomeLocation());
  }, []);

  const doSearch = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(search), 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, doSearch]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectResult(result: NominatimResult) {
    const loc: ExpenseLocation = {
      name: result.display_name.split(",").slice(0, 3).join(",").trim(),
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    onChange(loc);
    setSearch("");
    setShowResults(false);
  }

  function handleUseHome() {
    if (homeLocation) {
      onChange(homeLocation);
    }
  }

  function handleSaveAsHome() {
    if (value) {
      saveHomeLocation(value);
      setHomeLocationState(value);
    }
  }

  return (
    <div ref={wrapperRef} className="space-y-2">
      {!value ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search for a location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white
                transition-all duration-200 text-sm"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
            )}
          </div>

          {showResults && results.length > 0 && (
            <div className="border border-slate-200 rounded-xl bg-white shadow-lg overflow-hidden animate-fade-in">
              {results.map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50
                    hover:text-indigo-700 transition-colors border-b border-slate-50 last:border-0
                    flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {homeLocation && (
            <button
              type="button"
              onClick={handleUseHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Home className="w-3 h-3" />
              Use Home
            </button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="text-sm font-medium text-indigo-700 flex-1 truncate">
            {value.name}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSaveAsHome}
              className="p-1 rounded-lg hover:bg-indigo-100 transition-colors"
              title="Save as home location"
            >
              <Home className="w-3.5 h-3.5 text-indigo-400" />
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="p-1 rounded-lg hover:bg-indigo-100 transition-colors"
              title="Remove location"
            >
              <X className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
