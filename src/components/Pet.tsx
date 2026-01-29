"use client";

import { useState } from "react";
import { usePet } from "@/context/PetContext";
import PetPlayPanel from "./PetPlayPanel";

export default function Pet() {
  const { pet, isLoaded, isExcited } = usePet();
  const [panelOpen, setPanelOpen] = useState(false);

  if (!isLoaded) return null;

  const mood = pet.happiness > 70 ? "happy" : pet.happiness > 40 ? "content" : "sad";

  return (
    <>
      {/* Floating pet container */}
      <div
        className={`fixed bottom-6 right-6 z-50 cursor-pointer transition-transform duration-300 hover:scale-110 ${
          isExcited ? "animate-pet-excited" : "animate-pet-idle"
        }`}
        onClick={() => setPanelOpen(true)}
      >
        {/* Treat badge */}
        {pet.treats > 0 && (
          <div
            className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500
              rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg
              ${isExcited ? "animate-treat-pop" : ""}`}
          >
            {pet.treats > 99 ? "99+" : pet.treats}
          </div>
        )}

        {/* Shiba Inu */}
        <div className="relative w-20 h-20">
          {/* Body */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-10 bg-gradient-to-b from-amber-200 to-amber-300 rounded-[50%] shadow-md" />

          {/* Tail */}
          <div
            className={`absolute bottom-2 -right-1 w-4 h-8 bg-gradient-to-t from-amber-300 to-amber-200 rounded-full origin-bottom
              ${mood === "happy" ? "animate-tail-wag-fast" : mood === "content" ? "animate-tail-wag" : ""}`}
            style={{ transform: "rotate(-30deg)" }}
          />

          {/* Head */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-14 bg-gradient-to-b from-amber-100 to-amber-200 rounded-[50%] shadow-md">
            {/* Left ear */}
            <div
              className={`absolute -top-3 left-1 w-5 h-7 bg-gradient-to-t from-amber-200 to-amber-300 rounded-t-full
                ${mood === "sad" ? "rotate-[-20deg] translate-y-1" : "rotate-[-10deg]"} transition-transform duration-500`}
            />
            {/* Right ear */}
            <div
              className={`absolute -top-3 right-1 w-5 h-7 bg-gradient-to-t from-amber-200 to-amber-300 rounded-t-full
                ${mood === "sad" ? "rotate-[20deg] translate-y-1" : "rotate-[10deg]"} transition-transform duration-500`}
            />

            {/* Face mask (cream area) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-9 bg-gradient-to-b from-amber-50 to-amber-100 rounded-[50%]" />

            {/* Eyes */}
            <div className="absolute top-5 left-3 flex gap-4">
              {/* Left eye */}
              <div className="relative">
                <div
                  className={`w-2.5 h-2.5 bg-slate-800 rounded-full transition-all duration-300
                    ${mood === "happy" ? "h-1 translate-y-1" : mood === "sad" ? "h-3" : ""}`}
                />
                {mood === "happy" && (
                  <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full animate-sparkle" />
                )}
              </div>
              {/* Right eye */}
              <div className="relative">
                <div
                  className={`w-2.5 h-2.5 bg-slate-800 rounded-full transition-all duration-300
                    ${mood === "happy" ? "h-1 translate-y-1" : mood === "sad" ? "h-3" : ""}`}
                />
                {mood === "happy" && (
                  <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: "0.2s" }} />
                )}
              </div>
            </div>

            {/* Nose */}
            <div className="absolute top-9 left-1/2 -translate-x-1/2 w-2 h-1.5 bg-slate-800 rounded-full" />

            {/* Mouth */}
            <div className="absolute top-[42px] left-1/2 -translate-x-1/2 flex gap-0.5">
              <div
                className={`w-2 h-1 border-b-2 border-slate-700 rounded-bl-full
                  ${mood === "happy" ? "border-b-[3px]" : mood === "sad" ? "border-t-2 border-b-0 rounded-bl-none rounded-tl-full" : ""}`}
              />
              <div
                className={`w-2 h-1 border-b-2 border-slate-700 rounded-br-full
                  ${mood === "happy" ? "border-b-[3px]" : mood === "sad" ? "border-t-2 border-b-0 rounded-br-none rounded-tr-full" : ""}`}
              />
            </div>

            {/* Blush (only when happy) */}
            {mood === "happy" && (
              <>
                <div className="absolute top-7 left-1 w-2 h-1 bg-pink-300/50 rounded-full" />
                <div className="absolute top-7 right-1 w-2 h-1 bg-pink-300/50 rounded-full" />
              </>
            )}
          </div>

          {/* Front legs */}
          <div className="absolute bottom-0 left-4 w-3 h-4 bg-amber-200 rounded-b-lg" />
          <div className="absolute bottom-0 right-4 w-3 h-4 bg-amber-200 rounded-b-lg" />
        </div>

        {/* Speech bubble on excited */}
        {isExcited && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-md text-xs font-bold text-amber-600 whitespace-nowrap animate-fade-in">
            Woof! 🦴
          </div>
        )}
      </div>

      {/* Play panel */}
      <PetPlayPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
