"use client";

import { api, getToken } from "@/lib/api";
import type {
  AdminClassesOptionsData,
  AdminClassesOptionsSchoolAdmin,
} from "@/lib/types";
import { isClassesOptionsSchoolAdmin } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function NewClassPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [options, setOptions] = useState<AdminClassesOptionsData | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [schoolId, setSchoolId] = useState("");
  const [schoolYearId, setSchoolYearId] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setOptionsLoading(true);
    setError(null);
    api.admin
      .getClassesOptions(token)
      .then((res) => {
        setOptions(res.data);
        const data = res.data;
        if (isClassesOptionsSchoolAdmin(data)) {
          setSchoolId(String(data.school.id));
          setSchoolYearId(String(data.default_school_year.id));
        } else {
          if (data.schools.length > 0) {
            const firstSchoolId = data.schools[0].id;
            setSchoolId(String(firstSchoolId));
            const yearForSchool = data.school_years.find(
              (y) => !("school_id" in y) || y.school_id === firstSchoolId
            );
            if (yearForSchool) setSchoolYearId(String(yearForSchool.id));
          }
        }
      })
      .catch(() => setError("Impossible de charger les options."))
      .finally(() => setOptionsLoading(false));
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
    fetchOptions();
  }, [user?.role.name, router, fetchOptions]);

  // Pour super_admin : filtrer les années par école sélectionnée
  const schoolYearsForSelect = options
    ? isClassesOptionsSchoolAdmin(options)
      ? (options as AdminClassesOptionsSchoolAdmin).school_years
      : "school_years" in options
        ? options.school_years.filter(
            (y) => !("school_id" in y) || y.school_id === Number(schoolId)
          )
        : []
    : [];

  useEffect(() => {
    if (!options || isClassesOptionsSchoolAdmin(options)) return;
    const years = options.school_years.filter(
      (y) => !("school_id" in y) || y.school_id === Number(schoolId)
    );
    if (years.length > 0 && !years.some((y) => String(y.id) === schoolYearId)) {
      setSchoolYearId(String(years[0].id));
    }
  }, [options, schoolId, schoolYearId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!schoolId.trim() || !schoolYearId.trim()) {
      setError("L'école et l'année scolaire sont requises.");
      return;
    }
    if (!name.trim()) {
      setError("Le nom de la classe est requis.");
      return;
    }
    if (!level.trim()) {
      setError("Le niveau est requis (ex. Primaire, Secondaire).");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    api.admin
      .createClass(token, {
        school_id: Number(schoolId),
        school_year_id: Number(schoolYearId),
        name: name.trim(),
        level: level.trim(),
      })
      .then(() => router.push("/dashboard/classes"))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur lors de la création.");
      })
      .finally(() => setSubmitting(false));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  const optionsAsSchoolAdmin = options && isClassesOptionsSchoolAdmin(options);

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/classes"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Ajouter une classe
      </h1>
      <p className="text-slate-600 mb-8">
        Renseignez le nom et le niveau de la classe. École et année scolaire sont pré-remplies selon votre profil.
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

        {/* École : visible uniquement pour super_admin ; school_admin a son école en auto (champ caché) */}
        {options && "schools" in options && (
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
              disabled={optionsLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent disabled:bg-slate-50"
            >
              <option value="">Sélectionner une école</option>
              {options.schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {optionsLoading && (
              <p className="mt-1 text-xs text-slate-500">Chargement des options…</p>
            )}
          </div>
        )}

        {/* Année scolaire : pré-remplie (année active) pour school_admin, modifiable ; sélection pour super_admin */}
        <div>
          <label
            htmlFor="school_year_id"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Année scolaire <span className="text-red-500">*</span>
          </label>
          <select
            id="school_year_id"
            value={schoolYearId}
            onChange={(e) => setSchoolYearId(e.target.value)}
            disabled={optionsLoading || schoolYearsForSelect.length === 0}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent disabled:bg-slate-50"
          >
            <option value="">Sélectionner une année</option>
            {schoolYearsForSelect.map((y) => (
              <option key={y.id} value={y.id}>
                {y.year_label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nom de la classe <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Test 2024"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
          />
        </div>

        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Niveau <span className="text-red-500">*</span>
          </label>
          <input
            id="level"
            type="text"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="Ex. Primaire, Secondaire"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || optionsLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Créer la classe
          </button>
          <Link
            href="/dashboard/classes"
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
