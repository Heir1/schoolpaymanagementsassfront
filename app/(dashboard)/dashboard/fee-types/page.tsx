"use client";

import { api, getToken } from "@/lib/api";
import type {
  AdminFeeTypeListItem,
  FeeTypePagination,
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
  Banknote,
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

export default function FeeTypesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<AdminFeeTypeListItem[]>([]);
  const [pagination, setPagination] = useState<FeeTypePagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFeeTypes = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getFeeTypes(token, page)
      .then((res) => {
        setList(res.data.fee_types);
        setPagination(res.data.pagination);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [page]);

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
    fetchFeeTypes();
  }, [user?.role.name, router, fetchFeeTypes]);

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
      .restoreFeeType(token, id)
      .then(() => fetchFeeTypes())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setRestoringId(null));
  }

  function handleDelete(id: number) {
    if (!confirm("Supprimer ce type de frais ?")) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(id);
    api.admin
      .deleteFeeType(token, id)
      .then(() => fetchFeeTypes())
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
            Types de frais
          </h1>
          <p className="text-slate-600">
            Gestion des types de frais (ex. frais de scolarité). payable_by = parent par défaut.
          </p>
        </div>
        <Link
          href="/dashboard/fee-types/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover shadow-cta shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un type
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
                      Nom
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell max-w-[14rem]">
                      Description
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      École
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
                        colSpan={5}
                        className="px-4 py-12 text-center text-slate-500 text-sm"
                      >
                        {filter === "active"
                          ? "Aucun type actif."
                          : filter === "trash"
                            ? "Aucun type dans la corbeille."
                            : "Aucun type de frais."}
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
                          <td className="px-4 py-3 text-sm text-slate-500 hidden lg:table-cell truncate max-w-[14rem]" title={item.description ?? undefined}>
                            {item.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.school?.name ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-sm hidden sm:table-cell">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/dashboard/fee-types/${item.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10"
                              >
                                <Eye className="w-4 h-4" />
                                Voir
                              </Link>
                              {!isDeleted && (
                                <>
                                  <Link
                                    href={`/dashboard/fee-types/${item.id}/edit`}
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

            {pagination && pagination.last_page > 0 && (
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page {pagination.current_page} sur {pagination.last_page} ({pagination.total}{" "}
                  type{pagination.total > 1 ? "s" : ""})
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.current_page <= 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-slate-700 min-w-[1.5rem] text-center">
                    {pagination.current_page}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={pagination.current_page >= pagination.last_page}
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
