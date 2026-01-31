"use client";

import { api, getToken } from "@/lib/api";
import type { AdminSchoolTypeItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MAX_LOGO_SIZE_MB = 2;

export default function NewSchoolPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [types, setTypes] = useState<AdminSchoolTypeItem[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role.name !== "superadmin") {
      router.replace("/dashboard");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setTypesLoading(true);
    api.admin
      .getSchoolTypes(token)
      .then((res) => setTypes(res.data))
      .catch(() => setError("Impossible de charger les types d'écoles."))
      .finally(() => setTypesLoading(false));
  }, [user?.role.name, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Le nom de l'école est requis.");
      return;
    }
    if (!typeId.trim()) {
      setError("Le type d'école est requis.");
      return;
    }
    if (logoFile && logoFile.size > MAX_LOGO_SIZE_MB * 1024 * 1024) {
      setError(`Le logo ne doit pas dépasser ${MAX_LOGO_SIZE_MB} Mo.`);
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("type_id", typeId);
    if (address.trim()) formData.append("address", address.trim());
    if (phone.trim()) formData.append("phone", phone.trim());
    if (logoFile) formData.append("logo", logoFile);
    api.admin
      .createSchool(token, formData)
      .then(() => router.push("/dashboard/schools"))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur lors de la création.");
      })
      .finally(() => setSubmitting(false));
  }

  if (!user) return null;
  if (user.role.name !== "superadmin") return null;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/schools"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Ajouter une école
      </h1>
      <p className="text-slate-600 mb-8">
        Renseignez les informations de l&apos;établissement.
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
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nom de l&apos;école <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="ex: Lycée Prince de Liège"
          />
        </div>

        <div>
          <label
            htmlFor="type_id"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Type d&apos;école <span className="text-red-500">*</span>
          </label>
          <select
            id="type_id"
            required
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            disabled={typesLoading}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent disabled:bg-slate-50"
          >
            <option value="">
              {typesLoading ? "Chargement…" : "Sélectionner un type"}
            </option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Adresse (optionnel)
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="ex: Avenue de la Justice, Gombe, Kinshasa"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Téléphone (optionnel)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="ex: +243 81 700 0001"
          />
          <p className="mt-1 text-xs text-slate-500">
            Format international : + suivi de chiffres (ex. +243…).
          </p>
        </div>

        <div>
          <label
            htmlFor="logo"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Logo (optionnel)
          </label>
          <input
            id="logo"
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-schoolpay-accent/10 file:text-schoolpay-accent"
          />
          <p className="mt-1 text-xs text-slate-500">
            Image, max. {MAX_LOGO_SIZE_MB} Mo.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || typesLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-schoolpay-accent text-white font-semibold shadow-cta hover:bg-schoolpay-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            {submitting ? "Création…" : "Créer l\u2019école"}
          </button>
          <Link
            href="/dashboard/schools"
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
