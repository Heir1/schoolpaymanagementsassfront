"use client";

import { api, getToken } from "@/lib/api";
import type {
  AdminStudentGroupListItem,
  PaginatedMeta,
  AdminStudentGroupStatisticsResponse,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Pencil,
  RotateCcw,
  Trash2,
  UsersRound,
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

export default function StudentGroupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<AdminStudentGroupListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [stats, setStats] = useState<AdminStudentGroupStatisticsResponse["data"] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("active");
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchGroups = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getStudentGroups(token, page)
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
      .getStudentGroupsStatistics(token)
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role.name !== "school_admin" && user?.role.name !== "superadmin") {
      router.replace("/dashboard");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchGroups();
    fetchStats();
  }, [user?.role.name, router, fetchGroups, fetchStats]);

  const filteredList = list.filter((item) => {
    const deleted = !!item.deleted_at;
    if (filter === "active") return !deleted;
    if (filter === "trash") return deleted;
    return true;
  });

  function handleRestore(id: number) {
    const token = getToken();
    if (!token) return;
    setRestoringId(id);
    api.admin
      .restoreStudentGroup(token, id)
      .then(() => {
        fetchGroups();
        fetchStats();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setRestoringId(null));
  }

  function handleDelete(id: number) {
    if (!confirm("Supprimer ce groupe d'élèves ?")) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(id);
    api.admin
      .deleteStudentGroup(token, id)
      .then(() => {
        fetchGroups();
        fetchStats();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setDeletingId(null));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Groupes d&apos;élèves
          </h1>
          <p className="text-slate-600">
            Gestion des groupes (handicapés, enfants des enseignants, etc.).
          </p>
        </div>
        <Link
          href="/dashboard/student-groups/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover shadow-cta shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un groupe
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
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent">
                <UsersRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total_groups}</p>
                <p className="text-xs text-slate-500">Total groupes</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.active_groups}</p>
                <p className="text-xs text-slate-500">Actifs</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.deleted_groups}</p>
                <p className="text-xs text-slate-500">Supprimés</p>
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
                  {stats.recent_groups_last_30_days}
                </p>
                <p className="text-xs text-slate-500">Créés (30 j)</p>
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
          Actifs
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
                      Groupe
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      École
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell max-w-[12rem]">
                      Description
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20 text-right">
                      Frais
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Créé le
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-slate-500 text-sm"
                      >
                        {filter === "active"
                          ? "Aucun groupe actif."
                          : filter === "trash"
                            ? "Aucun groupe dans la corbeille."
                            : "Aucun groupe."}
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item) => {
                      const isDeleted = !!item.deleted_at;
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                            isDeleted ? "bg-slate-50/80 opacity-90" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`font-medium ${
                                  isDeleted ? "text-slate-500" : "text-slate-900"
                                }`}
                              >
                                {item.name}
                              </span>
                              {isDeleted && item.deleted_at && (
                                <span className="text-xs font-medium text-red-600">
                                  Supprimé · {formatDate(item.deleted_at)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.school.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell truncate max-w-[12rem]" title={item.description ?? undefined}>
                            {item.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 text-right">
                            {item.group_fees_count}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-sm hidden sm:table-cell">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/dashboard/student-groups/${item.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10"
                              >
                                <Eye className="w-4 h-4" />
                                Voir
                              </Link>
                              {!isDeleted && (
                                <>
                                  <Link
                                    href={`/dashboard/student-groups/${item.id}/edit`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                                  >
                                    <Pencil className="w-4 h-4" />
                                    Modifier
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    <Trash2
                                      className={`w-4 h-4 ${deletingId === item.id ? "animate-spin" : ""}`}
                                    />
                                    Supprimer
                                  </button>
                                </>
                              )}
                              {isDeleted && (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(item.id)}
                                  disabled={restoringId === item.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-green hover:bg-schoolpay-green/10 disabled:opacity-50"
                                >
                                  <RotateCcw
                                    className={`w-4 h-4 ${restoringId === item.id ? "animate-spin" : ""}`}
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

            {meta && meta.last_page > 0 && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page {meta.current_page} sur {meta.last_page} ({meta.total}{" "}
                  groupe{meta.total > 1 ? "s" : ""})
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
