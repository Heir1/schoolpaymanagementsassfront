"use client";

import { api, getToken, getAvatarUrl } from "@/lib/api";
import type { AdminUserListItem, PaginatedMeta } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, User, Plus, Eye, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type FilterTab = "all" | "active" | "trash";

const roleLabels: Record<string, string> = {
  superadmin: "Super admin",
  school_admin: "Admin école",
  parent: "Parent",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<AdminUserListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("active");
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getUsers(token, page)
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
    fetchUsers();
  }, [user?.role.name, router, fetchUsers]);

  const filteredList = list.filter((u) => {
    const deleted = u.is_deleted === true || !!u.deleted_at;
    if (filter === "active") return !deleted;
    if (filter === "trash") return deleted;
    return true;
  });

  function handleRestore(userId: string) {
    const token = getToken();
    if (!token) return;
    setRestoringId(userId);
    api.admin
      .restoreUser(token, userId)
      .then(() => fetchUsers())
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
            Utilisateurs
          </h1>
          <p className="text-slate-600">
            Liste des comptes. Création et édition des comptes school_admin.
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover shadow-cta shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un utilisateur
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
          Tous
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
                      Utilisateur
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Rôle(s)
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Inscrit le
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-sm">
                        {filter === "active"
                          ? "Aucun utilisateur actif."
                          : filter === "trash"
                          ? "Aucun utilisateur dans la corbeille."
                          : "Aucun utilisateur."}
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((u) => {
                      const isDeleted = u.is_deleted === true || !!u.deleted_at;
                      return (
                        <tr
                          key={u.id}
                          className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                            isDeleted ? "bg-slate-50/80 opacity-90" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600 shrink-0 overflow-hidden">
                                {getAvatarUrl(u.avatar_url) ? (
                                  <img
                                    src={getAvatarUrl(u.avatar_url)!}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className={`font-medium ${
                                    isDeleted ? "text-slate-500" : "text-slate-900"
                                  }`}
                                >
                                  {u.full_name}
                                </span>
                                {isDeleted && (
                                  <span className="text-xs font-medium text-red-600">
                                    Supprimé
                                    {u.deleted_at && (
                                      <> · {formatDate(u.deleted_at)}</>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            className={`px-4 py-3 text-sm ${
                              isDeleted ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {u.phone_or_email}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {u.roles.map((r) => (
                                <span
                                  key={r.id}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    isDeleted
                                      ? "bg-slate-200 text-slate-500"
                                      : "bg-schoolpay-accent/10 text-schoolpay-accent"
                                  }`}
                                >
                                  {roleLabels[r.role_name] ?? r.role_name}
                                  {r.school_name ? ` · ${r.school_name}` : ""}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {u.is_parent ? (
                              <span className="text-xs font-medium text-slate-600">
                                Oui
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-sm">
                            {formatDate(u.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/users/${u.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10"
                              >
                                <Eye className="w-4 h-4" />
                                Voir
                              </Link>
                              {isDeleted && (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(u.id)}
                                  disabled={restoringId === u.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-green hover:bg-schoolpay-green/10 disabled:opacity-50"
                                >
                                  <RotateCcw
                                    className={`w-4 h-4 ${restoringId === u.id ? "animate-spin" : ""}`}
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
                  utilisateur{meta.total > 1 ? "s" : ""})
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
