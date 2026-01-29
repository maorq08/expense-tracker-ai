"use client";

import { useState, useEffect } from "react";
import { X, Heart, Cookie, Sparkles, Trophy } from "lucide-react";
import { usePet } from "@/context/PetContext";

interface PetPlayPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function PetPlayPanel({ open, onClose }: PetPlayPanelProps) {
  const { pet, playFetch, setName } = usePet();
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(pet.name);
  const [showBall, setShowBall] = useState(false);
  const [showDogRun, setShowDogRun] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  useEffect(() => {
    setNameInput(pet.name);
  }, [pet.name]);

  // Close on escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open, onClose]);

  function handleThrowBall() {
    if (isPlaying || pet.treats < 1) return;

    const success = playFetch();
    if (!success) return;

    setIsPlaying(true);

    // Animation sequence
    setShowBall(true);
    setTimeout(() => {
      setShowBall(false);
      setShowDogRun(true);
    }, 600);
    setTimeout(() => {
      setShowDogRun(false);
      setShowReturn(true);
    }, 1200);
    setTimeout(() => {
      setShowReturn(false);
      setIsPlaying(false);
    }, 2000);
  }

  function handleSaveName() {
    setName(nameInput);
    setEditingName(false);
  }

  if (!open) return null;

  const happinessColor =
    pet.happiness > 70
      ? "bg-emerald-500"
      : pet.happiness > 40
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 right-0 left-0 sm:bottom-6 sm:right-6 sm:left-auto z-50 sm:w-80">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-4 relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Pet name */}
            <div className="flex items-center gap-2">
              {editingName ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                  maxLength={20}
                  className="bg-white/20 text-white placeholder-white/50 px-2 py-1 rounded-lg text-lg font-bold
                    focus:outline-none focus:ring-2 focus:ring-white/50 w-32"
                />
              ) : (
                <h3
                  className="text-xl font-bold text-white cursor-pointer hover:underline"
                  onClick={() => setEditingName(true)}
                >
                  {pet.name}
                </h3>
              )}
              <span className="text-white/80 text-sm">
                (click to rename)
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 space-y-4">
            {/* Happiness bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Heart className="w-4 h-4 text-pink-500" />
                  Happiness
                </span>
                <span className="text-sm font-bold text-slate-900">{pet.happiness}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${happinessColor}`}
                  style={{ width: `${pet.happiness}%` }}
                />
              </div>
            </div>

            {/* Treats */}
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <span className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Cookie className="w-5 h-5 text-amber-600" />
                Treats available
              </span>
              <span className="text-lg font-bold text-amber-600">{pet.treats}</span>
            </div>

            {/* Total plays */}
            <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
              <span className="flex items-center gap-2 text-sm font-semibold text-violet-800">
                <Trophy className="w-5 h-5 text-violet-600" />
                Games played
              </span>
              <span className="text-lg font-bold text-violet-600">{pet.totalPlays}</span>
            </div>

            {/* Play area */}
            <div className="relative h-24 bg-gradient-to-b from-sky-100 to-emerald-100 rounded-xl overflow-hidden">
              {/* Grass */}
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-emerald-400 to-emerald-300" />

              {/* Ball animation */}
              {showBall && (
                <div className="absolute top-4 animate-ball-throw">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-md" />
                </div>
              )}

              {/* Dog running */}
              {showDogRun && (
                <div className="absolute bottom-6 animate-dog-run text-2xl">
                  🐕
                </div>
              )}

              {/* Dog returning */}
              {showReturn && (
                <div className="absolute bottom-6 right-4 animate-dog-return text-2xl">
                  🐕
                </div>
              )}

              {/* Idle state */}
              {!isPlaying && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-2xl animate-pet-idle">
                  🐕
                </div>
              )}

              {/* Sparkles when completing fetch */}
              {showReturn && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-sparkle" />
                </div>
              )}
            </div>

            {/* Throw ball button */}
            <button
              onClick={handleThrowBall}
              disabled={isPlaying || pet.treats < 1}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200
                ${
                  isPlaying
                    ? "bg-slate-300 cursor-wait"
                    : pet.treats < 1
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-200 hover:shadow-orange-300"
                }`}
            >
              {isPlaying ? (
                "Playing..."
              ) : pet.treats < 1 ? (
                "No treats! Add expenses to earn more"
              ) : (
                <>🎾 Throw Ball (1 treat)</>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center">
              Add expenses to earn treats for your pet!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
