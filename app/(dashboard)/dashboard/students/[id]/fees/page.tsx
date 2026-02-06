"use client";

import { api, getToken } from "@/lib/api";
import type {
  AdminStudentFeeListItem,
  FeeTypePagination,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type FilterTab = "all" | "active" | "trash";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export default function StudentFeesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id as string | undefined;

  const [studentRef, setStudentRef] = useState<{ code: string; full_name: string } | null>(null);
  const [list, setList] = useState<AdminStudentFeeListItem[]>([]);
  const [pagination, setPagination] = useState<FeeTypePagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("active");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const filteredList = list.filter((item) => {
    const deleted = !!item.deleted_at;
    if (filter === "active") return !deleted;
    if (filter === "trash") return deleted;
    return true;
  });

  const fetchFees = useCallback(() => {
    if (!studentId) return;
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getStudentFees(token, studentId, page)
      .then((res) => {
        setStudentRef(res.data.student);
        setList(res.data.fees);
        setPagination(res.data.pagination);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [studentId, page]);

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
    if (!studentId) return;
    fetchFees();
  }, [user?.role.name, router, studentId, fetchFees]);

  function handleDelete(feeId: number) {
    if (!confirm("Supprimer ce frais ?")) return;
    const token = getToken();
    if (!token || !studentId) return;
    setDeletingId(feeId);
    api.admin
      .deleteStudentFee(token, studentId, feeId)
      .then(() => fetchFees())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setDeletingId(null));
  }

  function handleRestore(feeId: number) {
    const token = getToken();
    if (!token || !studentId) return;
    setRestoringId(feeId);
    api.admin
      .restoreStudentFee(token, studentId, feeId)
      .then(() => fetchFees())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setRestoringId(null));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;
  if (!studentId) return null;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href={`/dashboard/students/${studentId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour à l&apos;étudiant
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Frais de l&apos;étudiant
          </h1>
          <p className="text-slate-600">
            {studentRef ? (
              <>
                {studentRef.full_name} — {studentRef.code}
              </>
            ) : (
              "Chargement…"
            )}
          </p>
        </div>
        <Link
          href={`/dashboard/students/${studentId}/fees/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover shadow-cta shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un frais
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
                      Type / Montant
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Échéance
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24 text-center">
                      Tranches
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-slate-500 text-sm">
                        {filter === "active"
                          ? "Aucun frais actif pour cet étudiant."
                          : filter === "trash"
                            ? "Aucun frais dans la corbeille."
                            : "Aucun frais."}
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
                                {item.fee_type?.name ?? "—"}
                              </span>
                              <span className="text-sm text-slate-600">
                                {formatAmount(typeof item.amount === "number" ? item.amount : Number(item.amount))}
                              </span>
                              {isDeleted && item.deleted_at && (
                                <span className="text-xs font-medium text-red-600">
                                  Supprimé · {formatDate(item.deleted_at)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {formatDate(item.due_date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-slate-600">
                            {item.installments?.length ?? 0}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/dashboard/students/${studentId}/fees/${item.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10"
                              >
                                <Eye className="w-4 h-4" />
                                Voir
                              </Link>
                              {!isDeleted && (
                                <>
                                  <Link
                                    href={`/dashboard/students/${studentId}/fees/${item.id}/edit`}
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
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10 disabled:opacity-50"
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
                  frais)
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
