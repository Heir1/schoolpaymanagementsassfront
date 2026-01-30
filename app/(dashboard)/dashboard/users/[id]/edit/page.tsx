"use client";

import { api, getToken } from "@/lib/api";
import type { AdminSchoolListItem, AdminUserProfile } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const ROLE_ID_SCHOOL_ADMIN = 2;

export default function EditUserPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<AdminUserProfile | null>(null);
  const [schools, setSchools] = useState<AdminSchoolListItem[]>([]);
  const [fullName, setFullName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    setError(null);
    Promise.all([
      api.admin.getAdminUser(token, id),
      api.admin.getSchools(token, 1),
    ])
      .then(([userRes, schoolsRes]) => {
        setProfile(userRes.data);
        setFullName(userRes.data.full_name);
        setPhoneOrEmail(userRes.data.phone_or_email);
        const firstSchoolRole = userRes.data.roles.find((r) => r.school?.id);
        setSchoolId(firstSchoolRole?.school?.id ? String(firstSchoolRole.school.id) : "");
        setSchools(schoolsRes.data.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [user?.role.name, router, id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!schoolId.trim()) {
      setError("Veuillez sélectionner une école.");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("full_name", fullName.trim());
    formData.append("phone_or_email", phoneOrEmail.trim());
    formData.append("role_id", String(ROLE_ID_SCHOOL_ADMIN));
    formData.append("school_id", schoolId);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    api.admin
      .updateUser(token, id, formData)
      .then(() => router.push(`/dashboard/users/${id}`))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur lors de la mise à jour.");
      })
      .finally(() => setSubmitting(false));
  }

  if (!user) return null;
  if (user.role.name !== "superadmin") return null;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-10 h-10 border-2 border-schoolpay-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-600 text-sm">Chargement…</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href={`/dashboard/users/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au profil
        </Link>
        <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href={`/dashboard/users/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au profil
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Modifier l&apos;utilisateur
      </h1>
      <p className="text-slate-600 mb-8">
        Mise à jour des informations du compte <strong>Administrateur école</strong>.
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
            htmlFor="full_name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            id="full_name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="ex: Jean Dupont"
          />
        </div>

        <div>
          <label
            htmlFor="phone_or_email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email ou téléphone <span className="text-red-500">*</span>
          </label>
          <input
            id="phone_or_email"
            type="text"
            required
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="ex: contact@ecole.fr"
          />
        </div>

        <div>
          <label
            htmlFor="school_id"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            École <span className="text-red-500">*</span>
          </label>
          <select
            id="school_id"
            required
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
          >
            <option value="">Sélectionner une école</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.type.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="avatar"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nouvel avatar (optionnel)
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-schoolpay-accent/10 file:text-schoolpay-accent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg bg-schoolpay-accent text-white font-semibold shadow-cta hover:bg-schoolpay-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Link
            href={`/dashboard/users/${id}`}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
