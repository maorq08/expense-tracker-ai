"use client";

import { ReactNode } from "react";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { PetProvider } from "@/context/PetContext";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import Pet from "@/components/Pet";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ExpenseProvider>
      <PetProvider>
        <ToastProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Pet />
        </ToastProvider>
      </PetProvider>
    </ExpenseProvider>
  );
}
