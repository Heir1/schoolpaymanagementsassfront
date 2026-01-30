"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { School } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-schoolpay-dark/95 backdrop-blur-md border-b border-slate-700/40 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white font-display font-bold text-xl tracking-tight"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-schoolpay-accent/20 text-schoolpay-accent">
              <School className="w-5 h-5" />
            </span>
            SchoolPay
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="#demo"
              className="px-4 py-2.5 text-slate-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors duration-200"
            >
              Démo
            </Link>
            <Link
              href="#contact"
              className="px-4 py-2.5 text-slate-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors duration-200"
            >
              Contact
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="ml-2 px-5 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover shadow-cta hover:shadow-cta/80 transition-all duration-200"
              >
                Tableau de bord
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-slate-300 hover:text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors duration-200"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="ml-2 px-5 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover shadow-cta hover:shadow-cta/80 transition-all duration-200"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
