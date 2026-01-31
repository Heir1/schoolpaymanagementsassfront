"use client";

import { api, getToken } from "@/lib/api";
import type { AdminUsersStatisticsResponse } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  Users,
  GraduationCap,
  UserCircle,
  Calendar,
  TrendingUp,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const roleLabels: Record<string, string> = {
  superadmin: "Super administrateur",
  school_admin: "Administrateur école",
  school_staff: "Personnel école",
  teacher: "Enseignant",
  accountant: "Comptable",
  parent: "Parent",
  student: "Élève",
};

const dashboardCards = [
  {
    title: "Écoles",
    description: "Gestion des établissements (schools). Nom, type, adresse, téléphone.",
    icon: Building2,
    href: "/dashboard/schools",
    color: "schoolpay-accent",
  },
  {
    title: "Classes",
    description: "Classes par école et année scolaire. Nom, niveau.",
    icon: GraduationCap,
    href: "/dashboard",
    color: "schoolpay-blue",
  },
  {
    title: "Élèves",
    description: "Inscription des élèves. Code, identité, classe, adresse, approbation.",
    icon: Users,
    href: "/dashboard",
    color: "schoolpay-green",
  },
  {
    title: "Parents",
    description: "Liaison parents–élèves. Parent principal par élève.",
    icon: UserCircle,
    href: "/dashboard",
    color: "slate-600",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminUsersStatisticsResponse["data"] | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStats = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setStatsLoading(true);
    api.admin
      .getUsersStatistics(token)
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role.name === "superadmin") {
      fetchStats();
    }
  }, [user?.role.name, fetchStats]);

  if (!user) return null;

  const roleLabel = roleLabels[user.role.name] ?? user.role.name;
  const isSuperadmin = user.role.name === "superadmin";

  const usersByRole = stats?.users_by_role ? Object.values(stats.users_by_role) : [];
  const usersBySchool = stats?.users_by_school ? Object.values(stats.users_by_school) : [];
  const topSchools = stats?.top_schools_by_user_count ?? [];

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

      {/* Stats superadmin */}
      {isSuperadmin && (
        <>
          {statsLoading ? (
            <div className="mb-8 flex items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
            </div>
          ) : stats ? (
            <>
              {/* Nouveaux utilisateurs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats.new_users_today ?? 0}
                      </p>
                      <p className="text-xs text-slate-500">Nouveaux aujourd\u2019hui</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats.new_users_this_week ?? 0}
                      </p>
                      <p className="text-xs text-slate-500">Nouveaux (7 jours)</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats.new_users_this_month ?? 0}
                      </p>
                      <p className="text-xs text-slate-500">Nouveaux (30 jours)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* users_by_role + users_by_school + top_schools */}
              <div className="grid lg:grid-cols-2 gap-8 mb-10">
                {/* Par rôle */}
                <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-schoolpay-accent" />
                    <h2 className="font-display text-lg font-semibold text-slate-900">
                      Utilisateurs par rôle
                    </h2>
                  </div>
                  <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">Rôle</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600 text-right w-16">Total</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600 text-right w-16">Actifs</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600 text-right w-16">Suppr.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersByRole.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                              Aucune donnée
                            </td>
                          </tr>
                        ) : (
                          usersByRole.map((r) => (
                            <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 font-medium text-slate-900">
                                {roleLabels[r.name] ?? r.name}
                              </td>
                              <td className="px-4 py-2.5 text-slate-600 text-right">{r.total}</td>
                              <td className="px-4 py-2.5 text-green-600 text-right">{r.active}</td>
                              <td className="px-4 py-2.5 text-red-600 text-right">{r.deleted}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Par école */}
                <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-schoolpay-accent" />
                    <h2 className="font-display text-lg font-semibold text-slate-900">
                      Utilisateurs par école
                    </h2>
                  </div>
                  <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold text-slate-600">École</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600 text-right w-16">Total</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600 text-right w-16">Actifs</th>
                          <th className="px-4 py-2.5 font-semibold text-slate-600 text-right w-16">Suppr.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersBySchool.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                              Aucune donnée
                            </td>
                          </tr>
                        ) : (
                          usersBySchool.map((s) => (
                            <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 font-medium text-slate-900 truncate max-w-[12rem]" title={s.name}>
                                {s.name}
                              </td>
                              <td className="px-4 py-2.5 text-slate-600 text-right">{s.total}</td>
                              <td className="px-4 py-2.5 text-green-600 text-right">{s.active}</td>
                              <td className="px-4 py-2.5 text-red-600 text-right">{s.deleted}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Top écoles par nombre d'utilisateurs */}
              <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden mb-10">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-schoolpay-accent" />
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    Top écoles par nombre d\u2019utilisateurs
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold text-slate-600">École</th>
                        <th className="px-4 py-2.5 font-semibold text-slate-600 text-right w-24">Utilisateurs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSchools.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                            Aucune donnée
                          </td>
                        </tr>
                      ) : (
                        topSchools.map((s) => (
                          <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-medium text-slate-900">{s.name}</td>
                            <td className="px-4 py-2.5 text-slate-600 text-right font-medium">{s.user_count}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </>
      )}

      {!isSuperadmin && (
        <div className="mt-10 rounded-xl bg-slate-50/80 border border-slate-200/80 p-6">
          <p className="text-slate-600 text-sm">
            Les pages de gestion (écoles, classes, élèves, parents) seront
            connectées aux API au fur et à mesure.
          </p>
        </div>
      )}
    </div>
  );
}
