"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export interface PetState {
  name: string;
  treats: number;
  happiness: number;
  totalPlays: number;
  lastPlayed: string;
}

interface PetContextType {
  pet: PetState;
  isLoaded: boolean;
  addTreat: () => void;
  playFetch: () => boolean;
  setName: (name: string) => void;
  isExcited: boolean;
}

const PET_STORAGE_KEY = "expense-tracker-pet";

const DEFAULT_PET: PetState = {
  name: "Shiba",
  treats: 3,
  happiness: 70,
  totalPlays: 0,
  lastPlayed: new Date().toISOString(),
};

function loadPet(): PetState {
  if (typeof window === "undefined") return DEFAULT_PET;
  try {
    const raw = localStorage.getItem(PET_STORAGE_KEY);
    if (!raw) return DEFAULT_PET;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PET;
  }
}

function savePet(pet: PetState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pet));
}

function calculateDecay(lastPlayed: string): number {
  const now = Date.now();
  const last = new Date(lastPlayed).getTime();
  const hoursPassed = (now - last) / (1000 * 60 * 60);
  return Math.floor(hoursPassed * 5); // -5 happiness per hour
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: ReactNode }) {
  const [pet, setPet] = useState<PetState>(DEFAULT_PET);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExcited, setIsExcited] = useState(false);

  // Load pet from localStorage and apply decay
  useEffect(() => {
    const savedPet = loadPet();
    const decay = calculateDecay(savedPet.lastPlayed);
    const newHappiness = Math.max(0, savedPet.happiness - decay);

    setPet({
      ...savedPet,
      happiness: newHappiness,
    });
    setIsLoaded(true);
  }, []);

  // Save pet whenever it changes
  useEffect(() => {
    if (isLoaded) {
      savePet(pet);
    }
  }, [pet, isLoaded]);

  const addTreat = useCallback(() => {
    setPet((prev) => ({
      ...prev,
      treats: prev.treats + 1,
    }));
    // Trigger excited animation
    setIsExcited(true);
    setTimeout(() => setIsExcited(false), 1500);
  }, []);

  const playFetch = useCallback((): boolean => {
    if (pet.treats < 1) return false;

    setPet((prev) => ({
      ...prev,
      treats: prev.treats - 1,
      happiness: Math.min(100, prev.happiness + 15),
      totalPlays: prev.totalPlays + 1,
      lastPlayed: new Date().toISOString(),
    }));
    return true;
  }, [pet.treats]);

  const setName = useCallback((name: string) => {
    setPet((prev) => ({
      ...prev,
      name: name.trim() || "Shiba",
    }));
  }, []);

  return (
    <PetContext.Provider
      value={{
        pet,
        isLoaded,
        addTreat,
        playFetch,
        setName,
        isExcited,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePet must be used within a PetProvider");
  }
  return context;
}
