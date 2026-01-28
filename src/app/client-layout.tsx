"use client";

import { ReactNode } from "react";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ExpenseProvider>
      <ToastProvider>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </ToastProvider>
    </ExpenseProvider>
  );
}
