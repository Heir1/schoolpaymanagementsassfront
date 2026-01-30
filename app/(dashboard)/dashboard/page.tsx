"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Users,
  GraduationCap,
  UserCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const roleLabels: Record<string, string> = {
  superadmin: "Super administrateur",
  school_admin: "Administrateur école",
  parent: "Parent",
};

const dashboardCards = [
  {
    title: "Écoles",
    description: "Gestion des établissements (schools). Nom, type, adresse, téléphone.",
    icon: Building2,
    href: "#",
    color: "schoolpay-accent",
  },
  {
    title: "Classes",
    description: "Classes par école et année scolaire. Nom, niveau.",
    icon: GraduationCap,
    href: "#",
    color: "schoolpay-blue",
  },
  {
    title: "Élèves",
    description: "Inscription des élèves. Code, identité, classe, adresse, approbation.",
    icon: Users,
    href: "#",
    color: "schoolpay-green",
  },
  {
    title: "Parents",
    description: "Liaison parents–élèves. Parent principal par élève.",
    icon: UserCircle,
    href: "#",
    color: "slate-600",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const roleLabel = roleLabels[user.role.name] ?? user.role.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-slate-600 mt-1">
          Bienvenue, {user.full_name}. Vous êtes connecté en tant que{" "}
          <span className="font-medium text-slate-800">{roleLabel}</span>.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map(({ title, description, icon: Icon, href, color }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-xl bg-white border border-slate-200/80 shadow-card p-6 hover:shadow-card-hover hover:border-slate-300/80 transition-all duration-300"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white ${
                color === "schoolpay-accent"
                  ? "bg-schoolpay-accent"
                  : color === "schoolpay-blue"
                  ? "bg-schoolpay-blue"
                  : color === "schoolpay-green"
                  ? "bg-schoolpay-green"
                  : "bg-slate-600"
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight mb-2">
              {title}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {description}
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-schoolpay-accent group-hover:gap-2 transition-all">
              Accéder
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-slate-50/80 border border-slate-200/80 p-6">
        <p className="text-slate-600 text-sm">
          Les pages de gestion (écoles, classes, élèves, parents) seront
          connectées aux API au fur et à mesure. La structure des données
          (schools, classes, students, parents, student_parent) est prête côté
          schéma.
        </p>
      </div>
    </div>
  );
}
