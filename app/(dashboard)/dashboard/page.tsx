"use client";

import { api, getToken } from "@/lib/api";
import type { AdminUsersStatisticsResponse, ParentStatisticsResponse } from "@/lib/types";
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
  BarChart3,
  UserPlus,
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
  const [parentStats, setParentStats] = useState<ParentStatisticsResponse["data"] | null>(null);
  const [parentStatsLoading, setParentStatsLoading] = useState(false);

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

  const fetchParentStats = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setParentStatsLoading(true);
    api.parent
      .getStatistics(token)
      .then((res) => setParentStats(res.data))
      .catch(() => setParentStats(null))
      .finally(() => setParentStatsLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role.name === "superadmin") {
      fetchStats();
    }
  }, [user?.role.name, fetchStats]);

  useEffect(() => {
    if (user?.role.name === "parent") {
      fetchParentStats();
    }
  }, [user?.role.name, fetchParentStats]);

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

      {user.role.name === "parent" && (
        <div className="mt-10 space-y-8">
          {/* Statistiques parent */}
          {(parentStatsLoading || parentStats) && (
            <section>
              <h2 className="font-display text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-schoolpay-accent" />
                Statistiques
              </h2>
              {parentStatsLoading ? (
                <div className="flex items-center justify-center py-12 rounded-xl bg-white border border-slate-200/80">
                  <Loader2 className="w-8 h-8 text-schoolpay-accent animate-spin" />
                </div>
              ) : parentStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                      <p className="text-2xl font-bold text-slate-900">{parentStats.summary.total_children}</p>
                      <p className="text-xs text-slate-500">Enfants au total</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                      <p className="text-2xl font-bold text-slate-900">{parentStats.summary.primary_children}</p>
                      <p className="text-xs text-slate-500">Parent principal</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                      <p className="text-2xl font-bold text-slate-900">{parentStats.summary.secondary_children}</p>
                      <p className="text-xs text-slate-500">Secondaires</p>
                    </div>
                    {parentStats.summary.average_children_per_parent != null && (
                      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                        <p className="text-2xl font-bold text-slate-900">{parentStats.summary.average_children_per_parent}</p>
                        <p className="text-xs text-slate-500">Moy. par parent</p>
                      </div>
                    )}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-schoolpay-accent" />
                        <h3 className="font-semibold text-slate-900">Répartition par école</h3>
                      </div>
                      <div className="p-4">
                        {parentStats.school_distribution.length === 0 ? (
                          <p className="text-sm text-slate-500">Aucune donnée</p>
                        ) : (
                          <ul className="space-y-3">
                            {parentStats.school_distribution.map((s) => (
                              <li key={s.school_id} className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium text-slate-900 truncate flex-1">{s.school_name}</span>
                                <span className="text-sm text-slate-600 shrink-0">
                                  {s.student_count} élève{s.student_count > 1 ? "s" : ""} · {s.percentage} %
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-schoolpay-accent" />
                        <h3 className="font-semibold text-slate-900">Répartition par niveau</h3>
                      </div>
                      <div className="p-4">
                        {parentStats.level_distribution.length === 0 ? (
                          <p className="text-sm text-slate-500">Aucune donnée</p>
                        ) : (
                          <ul className="space-y-3">
                            {parentStats.level_distribution.map((l) => (
                              <li key={l.level} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900">{l.level}</p>
                                  {l.classes && <p className="text-xs text-slate-500 truncate">{l.classes}</p>}
                                </div>
                                <span className="text-sm text-slate-600 shrink-0">{l.student_count}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {parentStats.class_distribution.length > 0 && (
                    <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-schoolpay-accent" />
                        <h3 className="font-semibold text-slate-900">Par classe</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-2 font-semibold text-slate-600">Classe</th>
                              <th className="px-4 py-2 font-semibold text-slate-600">Niveau</th>
                              <th className="px-4 py-2 font-semibold text-slate-600 text-right">Élèves</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parentStats.class_distribution.map((c) => (
                              <tr key={c.class_id} className="border-b border-slate-100">
                                <td className="px-4 py-2 text-slate-900">{c.class_name}</td>
                                <td className="px-4 py-2 text-slate-600">{c.level}</td>
                                <td className="px-4 py-2 text-right text-slate-600">{c.student_count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-schoolpay-accent" />
                        <h3 className="font-semibold text-slate-900">Âges</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-600">
                          Moyenne <strong className="text-slate-900">{parentStats.age_statistics.average_age}</strong> ans
                          {" · "}
                          Min <strong>{parentStats.age_statistics.min_age}</strong> · Max <strong>{parentStats.age_statistics.max_age}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-schoolpay-accent" />
                        <h3 className="font-semibold text-slate-900">Activité récente</h3>
                      </div>
                      <div className="p-4">
                        {parentStats.recent_activity.recently_added.length === 0 ? (
                          <p className="text-sm text-slate-500">Aucune liaison récente</p>
                        ) : (
                          <ul className="space-y-2">
                            {parentStats.recent_activity.recently_added.slice(0, 5).map((a, i) => (
                              <li key={i} className="text-sm">
                                <span className="font-medium text-slate-900">{a.student_name}</span>
                                {" · "}
                                <span className="text-slate-600">{a.class_name}</span>
                                {" · "}
                                <span className="text-slate-500">{a.linked_at}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {parentStats.recent_activity.last_update && (
                          <p className="text-xs text-slate-400 mt-2">Dernière MAJ : {parentStats.recent_activity.last_update}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          )}
        </div>
      )}

      {!isSuperadmin && user.role.name !== "parent" && (
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
