"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  User,
  LogOut,
  Building2,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const roleLabels: Record<string, string> = {
  superadmin: "Super administrateur",
  school_admin: "Administrateur école",
  parent: "Parent",
};

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (!user) return null;

  const roleLabel = roleLabels[user.role.name] ?? user.role.name;
  const isSuperadmin = user.role.name === "superadmin";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    ...(isSuperadmin
      ? [{ href: "/dashboard/users", label: "Utilisateurs", icon: Users }]
      : []),
    { href: "/dashboard/profile", label: "Mon profil", icon: User },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 flex flex-col min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href)
                ? "bg-schoolpay-accent/10 text-schoolpay-accent"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </Link>
        ))}

        {/* Liens à venir (placeholder) */}
        {isSuperadmin && (
          <>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                À venir
              </p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <Building2 className="w-5 h-5 shrink-0" />
              Écoles
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <GraduationCap className="w-5 h-5 shrink-0" />
              Classes / Élèves
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200/80">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-slate-900 truncate">
            {user.full_name}
          </p>
          <p className="text-xs text-slate-500 truncate">{roleLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
