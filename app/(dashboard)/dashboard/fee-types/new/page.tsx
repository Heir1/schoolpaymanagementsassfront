"use client";

import { api, getToken } from "@/lib/api";
import type { AdminSchoolListItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** payable_by = "parent" par défaut, caché de l'utilisateur (school_admin). super_admin envoie aussi school_id. */

export default function NewFeeTypePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<AdminSchoolListItem[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolId, setSchoolId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperadmin = user?.role.name === "superadmin";

  const fetchSchools = useCallback(() => {
    if (!isSuperadmin) return;
    const token = getToken();
    if (!token) return;
    setSchoolsLoading(true);
    api.admin
      .getSchools(token, 1)
      .then((res) => {
        setSchools(res.data.data.filter((s) => !s.deleted_at));
        if (res.data.data.length > 0) {
          const first = res.data.data.find((s) => !s.deleted_at);
          if (first) setSchoolId(String(first.id));
        }
      })
      .catch(() => setError("Impossible de charger les écoles."))
      .finally(() => setSchoolsLoading(false));
  }, [isSuperadmin]);

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
    if (!name.trim()) {
      setError("Le nom du type de frais est requis.");
      return;
    }
    if (isSuperadmin && !schoolId.trim()) {
      setError("L'école est requise.");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    const body: { name: string; description?: string; payable_by: string; school_id?: number } = {
      name: name.trim(),
      description: description.trim() || undefined,
      payable_by: "parent",
    };
    if (isSuperadmin) body.school_id = Number(schoolId);
    api.admin
      .createFeeType(token, body)
      .then(() => router.push("/dashboard/fee-types"))
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
        href="/dashboard/fee-types"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Ajouter un type de frais
      </h1>
      <p className="text-slate-600 mb-8">
        Ex. Frais de scolarité. Le champ &quot;Payable par&quot; est fixé à parent (caché).
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

        {isSuperadmin && (
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
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Frais de scolarité"
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
            placeholder="Ex. Frais annuels de scolarité pour l'année 2024-2025"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || (isSuperadmin && schoolsLoading)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Créer le type
          </button>
          <Link
            href="/dashboard/fee-types"
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
