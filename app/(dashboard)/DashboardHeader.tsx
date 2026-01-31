"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getAvatarUrl } from "@/lib/api";
import { School, User, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";

const roleLabels: Record<string, string> = {
  superadmin: "Super administrateur",
  school_admin: "Administrateur école",
  parent: "Parent",
};

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  async function handleLogout() {
    setDropdownOpen(false);
    await logout();
    router.replace("/login");
  }

  if (!user) {
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

  const roleLabel = roleLabels[user.role.name] ?? user.role.name;

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200/80 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 text-slate-900 font-display font-bold text-lg tracking-tight shrink-0"
      >
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-schoolpay-accent/10 text-schoolpay-accent">
          <School className="w-5 h-5" />
        </span>
        SchoolPay
      </Link>

      <div className="relative ml-auto shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((open) => !open)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors text-right min-w-0"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="w-9 h-9 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 shrink-0 overflow-hidden">
            {getAvatarUrl(user.avatar_url ?? null) ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar URL from API (dynamic)
              <img
                src={getAvatarUrl(user.avatar_url ?? null)!}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="text-right min-w-0 max-w-[10rem] sm:max-w-[14rem]">
            <p className="text-sm font-medium text-slate-900 truncate" title={user.full_name}>
              {user.full_name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {roleLabel}
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-1 py-1 w-48 rounded-lg bg-white border border-slate-200 shadow-lg z-50"
            role="menu"
          >
            <Link
              href="/dashboard/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-t-lg transition-colors"
              role="menuitem"
            >
              <User className="w-4 h-4 shrink-0" />
              Mon profil
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-b-lg transition-colors text-left"
              role="menuitem"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
