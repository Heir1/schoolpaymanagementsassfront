"use client";

import { api, getToken } from "@/lib/api";
import type { AdminFeeTypeListItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Banknote, Pencil, Trash2, RotateCcw, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCreatedBy(item: AdminFeeTypeListItem): string {
  const c = item.created_by;
  return typeof c === "string" ? c : c?.full_name ?? "—";
}

export default function FeeTypeDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [feeType, setFeeType] = useState<AdminFeeTypeListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFeeType = () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getFeeType(token, id)
      .then((res) => setFeeType(res.data))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Type de frais non trouvé.");
        setFeeType(null);
      })
      .finally(() => setLoading(false));
  };

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
    fetchFeeType();
  }, [user?.role.name, router, id]);

  function handleDelete() {
    if (!confirm("Supprimer ce type de frais ?")) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("delete");
    api.admin
      .deleteFeeType(token, id)
      .then(() => router.push("/dashboard/fee-types"))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setActionLoading(null);
      });
  }

  function handleRestore() {
    const token = getToken();
    if (!token) return;
    setActionLoading("restore");
    api.admin
      .restoreFeeType(token, id)
      .then(() => fetchFeeType())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setActionLoading(null));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
      </div>
    );
  }

  if (error && !feeType) {
    return (
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/fee-types" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!feeType) return null;

  const isDeleted = !!feeType.deleted_at;

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/fee-types" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      {error && (
        <div role="alert" className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {feeType.name}
          </h1>
          <p className="text-slate-600">
            {feeType.school?.name ?? "—"} · Payable par {feeType.payable_by}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDeleted && (
            <>
              <Link href={`/dashboard/fee-types/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover">
                <Pencil className="w-4 h-4" />
                Modifier
              </Link>
              <button type="button" onClick={handleDelete} disabled={!!actionLoading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50">
                {actionLoading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </>
          )}
          {isDeleted && (
            <button type="button" onClick={handleRestore} disabled={!!actionLoading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-green text-white text-sm font-semibold hover:bg-schoolpay-green/90 disabled:opacity-50">
              {actionLoading === "restore" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Restaurer
            </button>
          )}
        </div>
      </div>

      <div className={`rounded-xl bg-white border shadow-card overflow-hidden ${isDeleted ? "border-slate-200/80 opacity-90" : "border-slate-200/80"}`}>
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-schoolpay-accent" />
          <h2 className="font-display text-lg font-semibold text-slate-900">Détail du type de frais</h2>
        </div>
        <dl className="divide-y divide-slate-100">
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Nom</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{feeType.name}</dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Description</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{feeType.description || "—"}</dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Payable par</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{feeType.payable_by}</dd>
          </div>
          {feeType.school && (
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-slate-500">École</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{feeType.school.name}</dd>
            </div>
          )}
          {isDeleted && feeType.deleted_at && (
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-slate-500">Supprimé le</dt>
              <dd className="mt-1 text-sm text-red-600 sm:col-span-2">{formatDate(feeType.deleted_at)}</dd>
            </div>
          )}
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Créé par</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{getCreatedBy(feeType)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
