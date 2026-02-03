"use client";

import { api, getToken } from "@/lib/api";
import type {
  AdminFeeTypeListItem,
  AdminClassListItem,
  CreateFeeInstallmentItem,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const defaultInstallment = (): CreateFeeInstallmentItem => ({
  amount: 0,
  due_date: "",
});

export default function NewFeePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [feeTypes, setFeeTypes] = useState<AdminFeeTypeListItem[]>([]);
  const [classes, setClasses] = useState<AdminClassListItem[]>([]);
  const [feeTypeId, setFeeTypeId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [installments, setInstallments] = useState<CreateFeeInstallmentItem[]>([]);
  const [classIds, setClassIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    Promise.all([
      api.admin.getFeeTypes(token, 1),
      api.admin.getClasses(token, 1),
    ])
      .then(([feeRes, classRes]) => {
        const types = (feeRes.data.fee_types ?? []).filter((t) => !t.deleted_at);
        setFeeTypes(types);
        if (types.length > 0 && !feeTypeId) setFeeTypeId(String(types[0].id));
        setClasses(classRes.data.data ?? []);
      })
      .catch(() => setError("Impossible de charger les données."))
      .finally(() => setLoading(false));
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
    fetchData();
  }, [user?.role.name, router, fetchData]);

  const addTranches = () => {
    const amt = Number(amount) || 0;
    if (installments.length === 0) {
      setInstallments([
        { amount: Math.floor(amt / 2), due_date: dueDate || "" },
        { amount: amt - Math.floor(amt / 2), due_date: dueDate || "" },
      ]);
    } else {
      setInstallments((prev) => [
        ...prev,
        { amount: 0, due_date: dueDate || "" },
      ]);
    }
  };

  const removeTranche = (index: number) => {
    setInstallments((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 2) return [];
      return next;
    });
  };

  const updateInstallment = (index: number, field: "amount" | "due_date", value: number | string) => {
    setInstallments((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, [field]: value } : t
      )
    );
  };

  const toggleClass = (id: number) => {
    setClassIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const installmentsSum = installments.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalAmount = Number(amount) || 0;
  const installmentsValid = installments.length === 0 || installmentsSum === totalAmount;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!feeTypeId.trim()) {
      setError("Le type de frais est requis.");
      return;
    }
    if (!amount.trim() || Number(amount) <= 0) {
      setError("Le montant est requis et doit être > 0.");
      return;
    }
    if (!dueDate) {
      setError("La date d'échéance est requise.");
      return;
    }
    if (installments.length > 0 && !installmentsValid) {
      setError(`La somme des tranches (${installmentsSum}) doit être égale au montant (${totalAmount}).`);
      return;
    }
    if (installments.length > 0) {
      const invalid = installments.some((t) => !t.due_date || (Number(t.amount) || 0) <= 0);
      if (invalid) {
        setError("Chaque tranche doit avoir un montant > 0 et une date.");
        return;
      }
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    const body: {
      fee_type_id: number;
      amount: number;
      due_date: string;
      installments?: CreateFeeInstallmentItem[];
      class_ids?: number[];
    } = {
      fee_type_id: Number(feeTypeId),
      amount: totalAmount,
      due_date: dueDate,
    };
    if (installments.length > 0) {
      body.installments = installments.map((t) => ({
        amount: Number(t.amount) || 0,
        due_date: t.due_date,
      }));
    }
    if (classIds.length > 0) body.class_ids = classIds;
    api.admin
      .createFee(token, body)
      .then(() => router.push("/dashboard/fees"))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur lors de la création.");
      })
      .finally(() => setSubmitting(false));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/fees"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Ajouter un frais
      </h1>
      <p className="text-slate-600 mb-8">
        Type, montant, échéance. Optionnel : tranches (somme = montant) et classes associées.
      </p>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl rounded-xl bg-white border border-slate-200/80 shadow-card p-6 lg:p-8 space-y-6"
      >
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="fee_type_id" className="block text-sm font-medium text-slate-700 mb-1.5">
            Type de frais <span className="text-red-500">*</span>
          </label>
          <select
            id="fee_type_id"
            value={feeTypeId}
            onChange={(e) => setFeeTypeId(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent disabled:bg-slate-50"
          >
            <option value="">Sélectionner un type</option>
            {feeTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1.5">
            Montant <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
          />
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-slate-700 mb-1.5">
            Date d&apos;échéance <span className="text-red-500">*</span>
          </label>
          <input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Tranches</span>
            <button
              type="button"
              onClick={addTranches}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10"
            >
              <Plus className="w-4 h-4" />
              Ajout tranche
            </button>
          </div>
          {installments.length > 0 && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
              {installments.map((t, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 w-20">
                    Tranche {i + 1}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={t.amount || ""}
                    onChange={(e) => updateInstallment(i, "amount", e.target.value ? Number(e.target.value) : 0)}
                    className="w-28 px-2 py-1.5 border border-slate-300 rounded text-sm"
                    placeholder="Montant"
                  />
                  <input
                    type="date"
                    value={t.due_date || ""}
                    onChange={(e) => updateInstallment(i, "due_date", e.target.value)}
                    className="w-36 px-2 py-1.5 border border-slate-300 rounded text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeTranche(i)}
                    className="p-1.5 rounded text-red-600 hover:bg-red-50"
                    title="Supprimer tranche"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <p className="text-xs text-slate-500">
                Somme tranches = {installmentsSum} {!installmentsValid && totalAmount > 0 && `(doit être ${totalAmount})`}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Classes associées (optionnel)
          </label>
          <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1.5">
            {classes.length === 0 && !loading && (
              <p className="text-sm text-slate-500">Aucune classe disponible.</p>
            )}
            {classes.map((c) => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={classIds.includes(c.id)}
                  onChange={() => toggleClass(c.id)}
                  className="rounded border-slate-300 text-schoolpay-accent focus:ring-schoolpay-accent"
                />
                <span className="text-sm text-slate-700">{c.name}</span>
                <span className="text-xs text-slate-400">({c.school?.name})</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || loading || !installmentsValid}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Créer le frais
          </button>
          <Link
            href="/dashboard/fees"
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
