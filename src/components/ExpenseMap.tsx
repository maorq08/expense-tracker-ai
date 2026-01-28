"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useExpenses } from "@/context/ExpenseContext";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Category } from "@/types";

const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#6366f1",
  Transportation: "#06b6d4",
  Entertainment: "#8b5cf6",
  Shopping: "#ec4899",
  Bills: "#f97316",
  Other: "#64748b",
};

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      const L = require("leaflet");
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, bounds]);
  return null;
}

export default function ExpenseMap() {
  const { expenses, isLoaded } = useExpenses();

  const located = expenses.filter((e) => e.location);

  const bounds: [number, number][] = located.map((e) => [
    e.location!.lat,
    e.location!.lng,
  ]);

  const center: [number, number] =
    bounds.length > 0
      ? [
          bounds.reduce((s, b) => s + b[0], 0) / bounds.length,
          bounds.reduce((s, b) => s + b[1], 0) / bounds.length,
        ]
      : [39.8283, -98.5795];

  const maxAmount = Math.max(...located.map((e) => e.amount), 1);
  const totalLocated = located.reduce((s, e) => s + e.amount, 0);

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <MapContainer
        center={center}
        zoom={4}
        className="h-full w-full"
        scrollWheelZoom={true}
        style={{ borderRadius: "1rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bounds.length > 0 && <FitBounds bounds={bounds} />}
        {located.map((expense) => {
          const radius = Math.max(
            8,
            Math.min(30, (expense.amount / maxAmount) * 30)
          );
          const color = CATEGORY_COLORS[expense.category];
          return (
            <CircleMarker
              key={expense.id}
              center={[expense.location!.lat, expense.location!.lng]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.5,
                weight: 2,
                opacity: 0.8,
              }}
            >
              <Popup>
                <div className="text-sm space-y-1 min-w-[180px]">
                  <p className="font-bold text-slate-900">
                    {expense.description}
                  </p>
                  <p className="text-lg font-bold" style={{ color }}>
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="text-slate-500">
                    {formatDate(expense.date)} &middot; {expense.category}
                  </p>
                  {expense.sentiment && (
                    <p className="text-slate-400 text-xs">
                      {expense.sentiment}
                    </p>
                  )}
                  <p className="text-slate-400 text-xs">
                    {expense.location!.name}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Summary overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-4">
        <p className="text-xs text-slate-400 font-medium">Located Spending</p>
        <p className="text-xl font-bold text-slate-900">
          {formatCurrency(totalLocated)}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {located.length} expense{located.length !== 1 ? "s" : ""} on map
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-3">
        <p className="text-xs font-semibold text-slate-600 mb-2">Categories</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {(Object.entries(CATEGORY_COLORS) as [Category, string][]).map(
            ([cat, color]) => {
              const count = located.filter(
                (e) => e.category === cat
              ).length;
              if (count === 0) return null;
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-slate-500">
                    {cat}{" "}
                    <span className="text-slate-400">({count})</span>
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
