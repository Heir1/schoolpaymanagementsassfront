"use client";

import { api, getToken } from "@/lib/api";
import type { AdminStudentFeeDetailResponse } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Receipt, Pencil, Trash2, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export default function StudentFeeDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id as string | undefined;
  const feeId = params?.feeId as string | undefined;

  const [data, setData] = useState<AdminStudentFeeDetailResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFee = useCallback(() => {
    if (!studentId || !feeId) return;
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getStudentFee(token, studentId, feeId)
      .then((res) => setData(res.data))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Frais non trouvé.");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [studentId, feeId]);

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
    if (!studentId || !feeId) return;
    fetchFee();
  }, [user?.role.name, router, studentId, feeId, fetchFee]);

  function handleDelete() {
    if (!confirm("Supprimer ce frais ?")) return;
    const token = getToken();
    if (!token || !studentId || !feeId) return;
    setActionLoading("delete");
    api.admin
      .deleteStudentFee(token, studentId, feeId)
      .then(() => router.push(`/dashboard/students/${studentId}/fees`))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setActionLoading(null);
      });
  }

  function handleRestore() {
    const token = getToken();
    if (!token || !studentId || !feeId) return;
    setActionLoading("restore");
    api.admin
      .restoreStudentFee(token, studentId, feeId)
      .then(() => fetchFee())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setActionLoading(null));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;
  if (!studentId || !feeId) return null;

  if (loading && !data) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href={`/dashboard/students/${studentId}/fees`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux frais
        </Link>
        <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const fee = data as AdminStudentFeeDetailResponse["data"];
  const amount = typeof fee.amount === "number" ? fee.amount : Number(fee.amount);
  const isDeleted = !!fee.deleted_at;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href={`/dashboard/students/${studentId}/fees`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux frais de l&apos;étudiant
      </Link>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {fee.fee_type?.name ?? "Frais"}
          </h1>
          <p className="text-slate-600">
            {formatAmount(amount)} · Échéance {formatDate(fee.due_date)}
          </p>
          {fee.student && (
            <p className="text-sm text-slate-500 mt-1">
              {fee.student.full_name} — {fee.student.code}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDeleted && (
            <>
              <Link
                href={`/dashboard/students/${studentId}/fees/${feeId}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                {actionLoading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </>
          )}
          {isDeleted && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
            >
              {actionLoading === "restore" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Restaurer
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-schoolpay-accent" />
          Détail
        </h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-slate-500 font-medium">Type de frais</dt>
            <dd className="text-slate-900">{fee.fee_type?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500 font-medium">Montant</dt>
            <dd className="text-slate-900">{formatAmount(amount)}</dd>
          </div>
          <div>
            <dt className="text-slate-500 font-medium">Date d&apos;échéance</dt>
            <dd className="text-slate-900">{formatDate(fee.due_date)}</dd>
          </div>
          {fee.created_by && typeof fee.created_by === "object" && (
            <div>
              <dt className="text-slate-500 font-medium">Créé par</dt>
              <dd className="text-slate-900">{fee.created_by.full_name}</dd>
            </div>
          )}
          {fee.updated_by && typeof fee.updated_by === "object" && (
            <div>
              <dt className="text-slate-500 font-medium">Modifié par</dt>
              <dd className="text-slate-900">{fee.updated_by.full_name}</dd>
            </div>
          )}
        </dl>

        {fee.installments && fee.installments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tranches</h3>
            <ul className="space-y-2">
              {fee.installments.map((inst) => (
                <li
                  key={inst.id ?? inst.installment_no}
                  className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                >
                  <span className="text-slate-600">Tranche {inst.installment_no}</span>
                  <span className="font-medium text-slate-900">{formatAmount(inst.amount)}</span>
                  <span className="text-slate-500 text-sm">{formatDate(inst.due_date)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
