"use client";

import { api, getToken } from "@/lib/api";
import type { AdminSchoolYearListItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditSchoolYearPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [yearLabel, setYearLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);
    api.admin
      .getSchoolYear(token, id)
      .then((res) => {
        const d = res.data;
        setYearLabel(d.year_label);
        setStartDate(d.start_date.slice(0, 10));
        setEndDate(d.end_date.slice(0, 10));
        setIsActive(d.is_active);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Année non trouvée."))
      .finally(() => setLoading(false));
  }, [user?.role.name, router, id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!yearLabel.trim()) {
      setError("Le libellé de l'année est requis.");
      return;
    }
    if (!startDate) {
      setError("La date de début est requise.");
      return;
    }
    if (!endDate) {
      setError("La date de fin est requise.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("La date de fin doit être après la date de début.");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    api.admin
      .updateSchoolYear(token, id, {
        year_label: yearLabel.trim(),
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
      })
      .then(() => router.push(`/dashboard/school-years/${id}`))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement.");
      })
      .finally(() => setSubmitting(false));
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

  if (error && !yearLabel) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href="/dashboard/school-years"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <div
          role="alert"
          className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <Link
        href={`/dashboard/school-years/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au détail
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Modifier l&apos;année scolaire
      </h1>
      <p className="text-slate-600 mb-8">
        Modifiez le libellé et les dates de l&apos;année scolaire.
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
          <label
            htmlFor="year_label"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Libellé de l&apos;année <span className="text-red-500">*</span>
          </label>
          <input
            id="year_label"
            type="text"
            value={yearLabel}
            onChange={(e) => setYearLabel(e.target.value)}
            placeholder="2024-2025"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Date de début <span className="text-red-500">*</span>
            </label>
            <input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            />
          </div>
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Date de fin <span className="text-red-500">*</span>
            </label>
            <input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-schoolpay-accent focus:ring-schoolpay-accent"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
            Année active (courante)
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Enregistrer
          </button>
          <Link
            href={`/dashboard/school-years/${id}`}
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
