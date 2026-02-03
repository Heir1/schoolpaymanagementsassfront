"use client";

import { api, getToken } from "@/lib/api";
import type {
  AdminStudentListItem,
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
  BookUser,
  RotateCcw,
  CheckCircle,
  XCircle,
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

function fullName(item: AdminStudentListItem) {
  const parts = [item.first_name, item.middle_name, item.last_name].filter(Boolean);
  return parts.join(" ") || item.student_code;
}

export default function StudentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<AdminStudentListItem[]>([]);
  const [pagination, setPagination] = useState<FeeTypePagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("active");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const filteredList = list.filter((item) => {
    const deleted = !!(item as AdminStudentListItem & { deleted_at?: string | null }).deleted_at;
    if (filter === "active") return !deleted;
    if (filter === "trash") return deleted;
    return true;
  });

  const fetchStudents = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getStudents(token, page)
      .then((res) => {
        setList(res.data.students);
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
    fetchStudents();
  }, [user?.role.name, router, fetchStudents]);

  function handleDelete(id: number) {
    if (!confirm("Supprimer cet étudiant ?")) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(id);
    api.admin
      .deleteStudent(token, id)
      .then(() => fetchStudents())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setDeletingId(null));
  }

  function handleRestore(id: number) {
    const token = getToken();
    if (!token) return;
    setRestoringId(id);
    api.admin
      .restoreStudent(token, id)
      .then(() => fetchStudents())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setRestoringId(null));
  }

  function handleApprove(id: number) {
    const token = getToken();
    if (!token) return;
    setActionId(id);
    api.admin
      .approveStudent(token, id)
      .then(() => fetchStudents())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setActionId(null));
  }

  function handleDisapprove(id: number) {
    const token = getToken();
    if (!token) return;
    setActionId(id);
    api.admin
      .disapproveStudent(token, id)
      .then(() => fetchStudents())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setActionId(null));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Étudiants
          </h1>
          <p className="text-slate-600">
            Gestion des étudiants (inscription, classe, approbation).
          </p>
        </div>
        <Link
          href="/dashboard/students/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover shadow-cta shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ajouter un étudiant
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
                      Code / Nom
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Classe / École
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24 text-center">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500 text-sm">
                        {filter === "active"
                          ? "Aucun étudiant actif."
                          : filter === "trash"
                            ? "Aucun étudiant dans la corbeille."
                            : "Aucun étudiant."}
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item) => {
                      const isDeleted = !!(item as AdminStudentListItem & { deleted_at?: string | null }).deleted_at;
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                            isDeleted ? "bg-slate-50/80 opacity-90" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono text-sm text-slate-600">
                                {item.student_code}
                              </span>
                              <span className={`font-medium ${isDeleted ? "text-slate-500" : "text-slate-900"}`}>
                                {fullName(item)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            <div>{item.class.name}</div>
                            <div className="text-slate-500">{item.school.name}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {[item.province, item.city].filter(Boolean).join(" · ") || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.is_approved ? (
                              <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" /> Approuvé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium">
                                <XCircle className="w-4 h-4" /> En attente
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/dashboard/students/${item.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10"
                              >
                                <Eye className="w-4 h-4" />
                                Voir
                              </Link>
                              {!isDeleted && (
                                <>
                                  <Link
                                    href={`/dashboard/students/${item.id}/edit`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                                  >
                                    <Pencil className="w-4 h-4" />
                                    Modifier
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => (item.is_approved ? handleDisapprove(item.id) : handleApprove(item.id))}
                                    disabled={actionId === item.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                  >
                                    {actionId === item.id ? (
                                      <span className="animate-spin">⟳</span>
                                    ) : item.is_approved ? (
                                      <>
                                        <XCircle className="w-4 h-4" />
                                        Désapprouver
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4" />
                                        Approuver
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    <Trash2 className={`w-4 h-4 ${deletingId === item.id ? "animate-spin" : ""}`} />
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
                                  <RotateCcw className={`w-4 h-4 ${restoringId === item.id ? "animate-spin" : ""}`} />
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
                  étudiant{pagination.total !== 1 ? "s" : ""})
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
