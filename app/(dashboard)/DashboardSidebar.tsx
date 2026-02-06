"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  CalendarDays,
  UsersRound,
  Banknote,
  Receipt,
  BookUser,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isSuperadmin = user.role.name === "superadmin";
  const isSchoolAdmin = user.role.name === "school_admin";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    ...(isSuperadmin
      ? [
          { href: "/dashboard/users", label: "Utilisateurs", icon: Users },
          { href: "/dashboard/schools", label: "Écoles", icon: Building2 },
          { href: "/dashboard/classes", label: "Classes", icon: GraduationCap },
          { href: "/dashboard/students", label: "Étudiants", icon: BookUser },
          { href: "/dashboard/fee-types", label: "Types de frais", icon: Banknote },
          { href: "/dashboard/fees", label: "Frais", icon: Receipt },
          { href: "/dashboard/inscription-documents", label: "Documents d'inscription", icon: FileText },
        ]
      : []),
    ...(isSchoolAdmin
      ? [
          { href: "/dashboard/school-years", label: "Années scolaires", icon: CalendarDays },
          { href: "/dashboard/student-groups", label: "Groupes d'élèves", icon: UsersRound },
          { href: "/dashboard/classes", label: "Classes", icon: GraduationCap },
          { href: "/dashboard/students", label: "Étudiants", icon: BookUser },
          { href: "/dashboard/fee-types", label: "Types de frais", icon: Banknote },
          { href: "/dashboard/fees", label: "Frais", icon: Receipt },
        ]
      : []),
  ];

  return (
    <aside className="fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200/80 flex flex-col overflow-y-auto">
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

      </nav>
    </aside>
  );
}
