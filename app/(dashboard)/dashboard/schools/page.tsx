"use client";

import { api, getToken, getAvatarUrl } from "@/lib/api";
import type {
  AdminSchoolListItem,
  PaginatedMeta,
  AdminSchoolsStatisticsResponse,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  RotateCcw,
  Trash2,
  Building2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type FilterTab = "all" | "active" | "trash";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SchoolsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<AdminSchoolListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [stats, setStats] = useState<AdminSchoolsStatisticsResponse["data"] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("active");
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const fetchSchools = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getSchools(token, page)
      .then((res) => {
        setList(res.data.data);
        setMeta({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total,
          from: res.data.from,
          to: res.data.to,
          first_page_url: res.data.first_page_url,
          last_page_url: res.data.last_page_url,
          next_page_url: res.data.next_page_url,
          prev_page_url: res.data.prev_page_url,
          path: res.data.path,
          links: res.data.links,
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [page]);

  const fetchStats = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setStatsLoading(true);
    api.admin
      .getSchoolsStatistics(token)
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role.name !== "superadmin") {
      router.replace("/dashboard");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchSchools();
    fetchStats();
  }, [user?.role.name, router, fetchSchools, fetchStats]);

  const filteredList = list.filter((s) => {
    const deleted = !!s.deleted_at;
    if (filter === "active") return !deleted;
    if (filter === "trash") return deleted;
    return true;
  });

  function handleRestore(schoolId: number) {
    const token = getToken();
    if (!token) return;
    setRestoringId(schoolId);
    api.admin
      .restoreSchool(token, schoolId)
      .then(() => {
        fetchSchools();
        fetchStats();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setRestoringId(null));
  }

  if (!user) return null;
  if (user.role.name !== "superadmin") return null;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Écoles
          </h1>
          <p className="text-slate-600">
            Liste des établissements. Création et édition des écoles.
          </p>
        </div>
        <Link
          href="/dashboard/schools/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover shadow-cta shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter une école
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      {/* Statistiques */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total_schools}</p>
                <p className="text-xs text-slate-500">Total écoles</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.active_schools}</p>
                <p className="text-xs text-slate-500">Actives</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.deleted_schools}</p>
                <p className="text-xs text-slate-500">Supprimées</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.recent_schools_last_30_days}
                </p>
                <p className="text-xs text-slate-500">Créées (30 j)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "active"
              ? "bg-schoolpay-accent text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Actives
        </button>
        <button
          type="button"
          onClick={() => setFilter("trash")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "trash"
              ? "bg-slate-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Trash2 className="w-4 h-4 inline-block mr-1.5 align-middle" />
          Corbeille
        </button>
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-schoolpay-accent text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Toutes
        </button>
      </div>

      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-2 border-schoolpay-accent border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-slate-600 text-sm">Chargement…</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      École
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      Téléphone
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Créée le
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-slate-500 text-sm"
                      >
                        {filter === "active"
                          ? "Aucune école active."
                          : filter === "trash"
                            ? "Aucune école dans la corbeille."
                            : "Aucune école."}
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((s) => {
                      const isDeleted = !!s.deleted_at;
                      const logoUrl = s.logo_url ? getAvatarUrl(s.logo_url) : null;
                      return (
                        <tr
                          key={s.id}
                          className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                            isDeleted ? "bg-slate-50/80 opacity-90" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600 shrink-0 overflow-hidden">
                                {logoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element -- logo URL from API (dynamic)
                                  <img
                                    src={logoUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div>
                                    {logoUrl}
                                    <Building2 className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span
                                  className={`font-medium ${
                                    isDeleted ? "text-slate-500" : "text-slate-900"
                                  }`}
                                >
                                  {s.name}
                                </span>
                                {isDeleted && s.deleted_at && (
                                  <span className="text-xs font-medium text-red-600">
                                    Supprimée · {formatDate(s.deleted_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                isDeleted
                                  ? "bg-slate-200 text-slate-500"
                                  : "bg-schoolpay-accent/10 text-schoolpay-accent"
                              }`}
                            >
                              {s.type.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">
                            {s.phone || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-sm hidden sm:table-cell">
                            {formatDate(s.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/schools/${s.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10"
                              >
                                <Eye className="w-4 h-4" />
                                Voir
                              </Link>
                              {isDeleted && (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(s.id)}
                                  disabled={restoringId === s.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-green hover:bg-schoolpay-green/10 disabled:opacity-50"
                                >
                                  <RotateCcw
                                    className={`w-4 h-4 ${restoringId === s.id ? "animate-spin" : ""}`}
                                  />
                                  Restaurer
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page {meta.current_page} sur {meta.last_page} ({meta.total}{" "}
                  école{meta.total > 1 ? "s" : ""})
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!meta.prev_page_url}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-slate-700 min-w-[1.5rem] text-center">
                    {meta.current_page}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.next_page_url}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
