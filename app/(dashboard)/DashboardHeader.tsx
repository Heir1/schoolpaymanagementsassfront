"use client";

import { School } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200/80 shadow-sm flex items-center px-4 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 text-slate-900 font-display font-bold text-lg tracking-tight"
      >
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-schoolpay-accent/10 text-schoolpay-accent">
          <School className="w-5 h-5" />
        </span>
        SchoolPay
      </Link>
    </header>
  );
}
