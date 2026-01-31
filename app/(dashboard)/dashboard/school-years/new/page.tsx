"use client";

import { api, getToken } from "@/lib/api";
import type { AdminSchoolListItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function NewSchoolYearPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<AdminSchoolListItem[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolId, setSchoolId] = useState("");
  const [yearLabel, setYearLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setSchoolsLoading(true);
    api.admin
      .getSchools(token, 1)
      .then((res) => {
        setSchools(res.data.data.filter((s) => !s.deleted_at));
        if (res.data.data.length > 0 && !schoolId) {
          const first = res.data.data.find((s) => !s.deleted_at);
          if (first) setSchoolId(String(first.id));
        }
      })
      .catch(() => setError("Impossible de charger les écoles."))
      .finally(() => setSchoolsLoading(false));
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
    fetchSchools();
  }, [user?.role.name, router, fetchSchools]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!schoolId.trim()) {
      setError("L'école est requise.");
      return;
    }
    if (!yearLabel.trim()) {
      setError("Le libellé de l'année est requis (ex. 2024-2025).");
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
      .createSchoolYear(token, {
        school_id: Number(schoolId),
        year_label: yearLabel.trim(),
        start_date: startDate,
        end_date: endDate,
        is_active: isActive,
      })
      .then(() => router.push("/dashboard/school-years"))
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
        href="/dashboard/school-years"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Ajouter une année scolaire
      </h1>
      <p className="text-slate-600 mb-8">
        Renseignez le libellé et les dates de l&apos;année scolaire.
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
            htmlFor="school_id"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            École <span className="text-red-500">*</span>
          </label>
          <select
            id="school_id"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            disabled={schoolsLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent disabled:bg-slate-50"
          >
            <option value="">Sélectionner une école</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {schoolsLoading && (
            <p className="mt-1 text-xs text-slate-500">Chargement des écoles…</p>
          )}
        </div>

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
            disabled={submitting || schoolsLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            Créer l&apos;année
          </button>
          <Link
            href="/dashboard/school-years"
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
