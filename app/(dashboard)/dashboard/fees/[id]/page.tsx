"use client";

import { api, getToken } from "@/lib/api";
import type {
  AdminFeeListItem,
  AdminFeeInstallmentItem,
  AdminClassListItem,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Receipt,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  X,
} from "lucide-react";
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

export default function FeeDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [fee, setFee] = useState<AdminFeeListItem | null>(null);
  const [installmentsDetail, setInstallmentsDetail] = useState<{
    total_amount: number;
    installments_count: number;
    installments: AdminFeeInstallmentItem[];
  } | null>(null);
  const [classes, setClasses] = useState<AdminClassListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [associateOpen, setAssociateOpen] = useState(false);
  const [associateSelected, setAssociateSelected] = useState<number[]>([]);
  const [associateSubmitting, setAssociateSubmitting] = useState(false);

  const fetchFee = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.admin.getFee(token, id).catch(() => null),
      api.admin.getFeeInstallments(token, id).catch(() => null),
      api.admin.getClasses(token, 1),
    ])
      .then(([feeRes, instRes, classRes]) => {
        if (feeRes) setFee(feeRes.data);
        else if (instRes) {
          setFee({
            id: instRes.data.fee.id,
            amount: instRes.data.fee.amount,
            due_date: instRes.data.fee.due_date,
            fee_type: { id: 0, name: "—" },
            installments: instRes.data.installments,
            created_by: "—",
            updated_by: "—",
            created_at: "",
            updated_at: "",
          });
        } else {
          setError("Frais non trouvé.");
        }
        if (instRes) {
          setInstallmentsDetail({
            total_amount: instRes.data.total_amount,
            installments_count: instRes.data.installments_count,
            installments: instRes.data.installments,
          });
        } else if (feeRes?.data.installments?.length) {
          setInstallmentsDetail({
            total_amount: feeRes.data.amount,
            installments_count: feeRes.data.installments.length,
            installments: feeRes.data.installments,
          });
        }
        setClasses(classRes.data.data ?? []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Frais non trouvé.");
        setFee(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

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
    fetchFee();
  }, [user?.role.name, router, fetchFee]);

  function handleDelete() {
    if (!confirm("Supprimer ce frais ?")) return;
    const token = getToken();
    if (!token) return;
    setDeleting(true);
    api.admin
      .deleteFee(token, id)
      .then(() => router.push("/dashboard/fees"))
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setDeleting(false));
  }

  function handleAssociate() {
    if (associateSelected.length === 0) return;
    const token = getToken();
    if (!token) return;
    setAssociateSubmitting(true);
    api.admin
      .associateFeeClasses(token, id, { class_ids: associateSelected })
      .then(() => {
        setAssociateOpen(false);
        setAssociateSelected([]);
        fetchFee();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setAssociateSubmitting(false));
  }

  function handleDissociate(classIds: number[]) {
    if (classIds.length === 0) return;
    const token = getToken();
    if (!token) return;
    api.admin
      .dissociateFeeClasses(token, id, { class_ids: classIds })
      .then(() => fetchFee())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  if (loading && !fee) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
      </div>
    );
  }

  if (error && !fee) {
    return (
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/fees" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!fee) return null;

  const associatedClasses = fee.associated_classes ?? [];
  const hasInstallments = (installmentsDetail?.installments?.length ?? fee.installments?.length ?? 0) > 0;

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/fees" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
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
            {fee.fee_type?.name ?? "Frais"}
          </h1>
          <p className="text-slate-600">
            {formatAmount(fee.amount)} · Échéance {formatDate(fee.due_date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/fees/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover"
          >
            <Pencil className="w-4 h-4" />
            Modifier
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Supprimer
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-schoolpay-accent" />
          <h2 className="font-display text-lg font-semibold text-slate-900">Détail du frais</h2>
        </div>
        <dl className="divide-y divide-slate-100">
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Type</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{fee.fee_type?.name ?? "—"}</dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Montant</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{formatAmount(fee.amount)}</dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Échéance</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{formatDate(fee.due_date)}</dd>
          </div>
        </dl>
      </div>

      {hasInstallments && (
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
            <h2 className="font-display text-lg font-semibold text-slate-900">Tranches</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold text-slate-600">N°</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600">Montant</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {(installmentsDetail?.installments ?? fee.installments ?? []).map((t, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-2.5">{t.installment_no ?? i + 1}</td>
                    <td className="px-4 py-2.5">{formatAmount(t.amount)}</td>
                    <td className="px-4 py-2.5">{formatDate(t.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-display text-lg font-semibold text-slate-900">Classes associées</h2>
          <button
            type="button"
            onClick={() => setAssociateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10"
          >
            <Plus className="w-4 h-4" />
            Associer des classes
          </button>
        </div>
        <div className="px-6 py-4">
          {associatedClasses.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune classe associée.</p>
          ) : (
            <ul className="space-y-2">
              {associatedClasses.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <span className="text-sm text-slate-900">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDissociate([c.id])}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Dissocier"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {associateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-display text-lg font-semibold text-slate-900 mb-4">
              Associer des classes
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {classes.filter((c) => !associatedClasses.some((a) => a.id === c.id)).map((c) => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={associateSelected.includes(c.id)}
                    onChange={() =>
                      setAssociateSelected((prev) =>
                        prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                      )
                    }
                    className="rounded border-slate-300 text-schoolpay-accent"
                  />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setAssociateOpen(false);
                  setAssociateSelected([]);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAssociate}
                disabled={associateSubmitting || associateSelected.length === 0}
                className="px-4 py-2 rounded-lg bg-schoolpay-accent text-white text-sm font-medium disabled:opacity-50"
              >
                {associateSubmitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null}
                Associer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
