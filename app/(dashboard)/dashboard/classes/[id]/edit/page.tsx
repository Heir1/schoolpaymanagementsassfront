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
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditClassPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [options, setOptions] = useState<AdminClassesOptionsData | null>(null);
  const [schoolId, setSchoolId] = useState("");
  const [schoolYearId, setSchoolYearId] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
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
    Promise.all([
      api.admin.getClass(token, id),
      api.admin.getClassesOptions(token),
    ])
      .then(([classRes, optionsRes]) => {
        const cls = classRes.data;
        const opts = optionsRes.data;
        setOptions(opts);
        setSchoolId(String(cls.school.id));
        setSchoolYearId(String(cls.school_year.id));
        setName(cls.name);
        setLevel(cls.level ?? "");
        if (isClassesOptionsSchoolAdmin(opts)) {
          setSchoolId(String(opts.school.id));
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Classe ou options non trouvés."))
      .finally(() => setLoading(false));
  }, [user?.role.name, router, id]);

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
      setError("Le niveau est requis.");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    api.admin
      .updateClass(token, id, {
        school_year_id: Number(schoolYearId),
        name: name.trim(),
        level: level.trim(),
      })
      .then(() => router.push(`/dashboard/classes/${id}`))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement.");
      })
      .finally(() => setSubmitting(false));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  const optionsAsSchoolAdmin = options && isClassesOptionsSchoolAdmin(options);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href="/dashboard/classes"
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
        href={`/dashboard/classes/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au détail
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Modifier la classe
      </h1>
      <p className="text-slate-600 mb-8">
        Modifiez le nom, le niveau et éventuellement l&apos;année scolaire. L&apos;école ne peut pas être modifiée (school_admin).
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
            <input
              id="school_id"
              type="text"
              value={options.schools.find((s) => String(s.id) === schoolId)?.name ?? schoolId}
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
            />
          </div>
        )}

        {/* Année scolaire : modifiable */}
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
            disabled={schoolYearsForSelect.length === 0}
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
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Enregistrer
          </button>
          <Link
            href={`/dashboard/classes/${id}`}
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
