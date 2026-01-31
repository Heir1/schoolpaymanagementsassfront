"use client";

import { api, getToken } from "@/lib/api";
import type { AdminSchoolListItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function NewStudentGroupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<AdminSchoolListItem[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolId, setSchoolId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    if (!name.trim()) {
      setError("Le nom du groupe est requis.");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    api.admin
      .createStudentGroup(token, {
        school_id: Number(schoolId),
        name: name.trim(),
        description: description.trim() || undefined,
      })
      .then(() => router.push("/dashboard/student-groups"))
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
        href="/dashboard/student-groups"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Ajouter un groupe d&apos;élèves
      </h1>
      <p className="text-slate-600 mb-8">
        Renseignez le nom et la description du groupe (ex. handicapés, enfants des enseignants).
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
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nom du groupe <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Handicapés, Enfants des enseignants"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Description du groupe (optionnel)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || schoolsLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Créer le groupe
          </button>
          <Link
            href="/dashboard/student-groups"
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
