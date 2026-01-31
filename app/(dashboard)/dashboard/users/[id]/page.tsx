"use client";

import { api, getToken, getAvatarUrl } from "@/lib/api";
import type { AdminUserProfile } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Building2,
  Pencil,
  Trash2,
  RotateCcw,
  KeyRound,
  Copy,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

const roleLabels: Record<string, string> = {
  superadmin: "Super administrateur",
  school_admin: "Administrateur école",
  parent: "Parent",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function UserDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<AdminUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{
    new_password: string;
    instructions: string;
    security_note: string;
    user_name: string;
  } | null>(null);

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
    api.admin
      .getAdminUser(token, id)
      .then((res) => setProfile(res.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [user?.role.name, router, id]);

  function handleDelete() {
    if (!confirm("Supprimer cet utilisateur ? Cette action peut être annulée (restauration).")) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("delete");
    api.admin
      .deleteUser(token, id)
      .then(() => router.push("/dashboard/users"))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setActionLoading(null);
      });
  }

  function handleRestore() {
    if (!confirm("Restaurer cet utilisateur ?")) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("restore");
    api.admin
      .restoreUser(token, id)
      .then(() => {
        setSuccessMessage("Utilisateur restauré.");
        setActionLoading(null);
        api.admin.getAdminUser(token, id).then((res) => setProfile(res.data));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setActionLoading(null);
      });
  }

  function handleResetPassword() {
    if (!confirm("Réinitialiser le mot de passe de cet utilisateur ? Un nouveau mot de passe sera généré. Vous devrez le communiquer à l'utilisateur.")) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("reset");
    setResetResult(null);
    api.admin
      .resetPassword(token, id)
      .then((res) => {
        setActionLoading(null);
        if (res.data?.new_password) {
          setResetResult({
            new_password: res.data.new_password,
            instructions: res.data.instructions ?? "Communiquez ce nouveau mot de passe à l'utilisateur.",
            security_note: res.data.security_note ?? "L'utilisateur a été déconnecté de toutes ses sessions.",
            user_name: res.data.user?.full_name ?? profile?.full_name ?? "",
          });
        } else {
          setSuccessMessage("Mot de passe réinitialisé.");
        }
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setActionLoading(null);
      });
  }

  function copyPasswordToClipboard(password: string) {
    navigator.clipboard.writeText(password).then(() => {
      setSuccessMessage("Mot de passe copié dans le presse-papiers.");
      setTimeout(() => setSuccessMessage(null), 3000);
    });
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
          href="/dashboard/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isDeleted = profile.is_deleted === true || !!profile.deleted_at;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}
      {successMessage && (
        <div
          role="status"
          className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm"
        >
          {successMessage}
        </div>
      )}

      {resetResult && (
        <div className="mb-6 rounded-xl bg-amber-50 border-2 border-amber-200 p-6 relative">
          <button
            type="button"
            onClick={() => setResetResult(null)}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 hover:bg-amber-100"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-display font-semibold text-amber-900 mb-3">
            Nouveau mot de passe — à communiquer à l&apos;utilisateur
          </h3>
          {resetResult.user_name && (
            <p className="text-amber-800 text-sm mb-2">
              Utilisateur : <strong>{resetResult.user_name}</strong>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <code className="px-4 py-2 rounded-lg bg-white border border-amber-200 text-amber-900 font-mono text-lg">
              {resetResult.new_password}
            </code>
            <button
              type="button"
              onClick={() => copyPasswordToClipboard(resetResult.new_password)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
            >
              <Copy className="w-4 h-4" />
              Copier
            </button>
          </div>
          <p className="text-amber-800 text-sm mb-1">{resetResult.instructions}</p>
          <p className="text-amber-700 text-sm">{resetResult.security_note}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
          Profil utilisateur
        </h1>
        <div className="flex flex-wrap gap-2">
          {!isDeleted && (
            <>
              <Link
                href={`/dashboard/users/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-schoolpay-accent text-white text-sm font-medium hover:bg-schoolpay-accent-hover"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Link>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                Réinitialiser le mot de passe
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </>
          )}
          {isDeleted && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-schoolpay-green text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurer
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent shrink-0 overflow-hidden">
              {getAvatarUrl(profile.avatar_url) ? (
                // eslint-disable-next-line @next/next/no-img-element -- avatar URL from API (dynamic)
                <img
                  src={getAvatarUrl(profile.avatar_url)!}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
                {profile.full_name}
              </h2>
              <p className="text-slate-600 text-sm mt-0.5">{profile.phone_or_email}</p>
              {isDeleted && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                  Compte supprimé
                </span>
              )}
            </div>
          </div>
        </div>

        <dl className="divide-y divide-slate-100">
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <User className="w-4 h-4" />
              Nom complet
            </dt>
            <dd className="text-slate-900 font-medium">{profile.full_name}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Mail className="w-4 h-4" />
              Email / Téléphone
            </dt>
            <dd className="text-slate-900">{profile.phone_or_email}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Shield className="w-4 h-4" />
              Rôle(s)
            </dt>
            <dd className="text-slate-900">
              <div className="flex flex-wrap gap-2">
                {profile.roles.map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-schoolpay-accent/10 text-schoolpay-accent text-sm"
                  >
                    {roleLabels[r.role.name] ?? r.role.name}
                    {r.school && (
                      <>
                        <Building2 className="w-3.5 h-3.5" />
                        {r.school.name} ({r.school.type})
                      </>
                    )}
                  </span>
                ))}
              </div>
            </dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              Mot de passe initial
            </dt>
            <dd className="text-slate-600 text-sm">
              {profile.initial_password_set ? "Défini" : "Non défini"}
            </dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Calendar className="w-4 h-4" />
              Créé le
            </dt>
            <dd className="text-slate-600 text-sm">{formatDate(profile.created_at)}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              Mis à jour le
            </dt>
            <dd className="text-slate-600 text-sm">{formatDate(profile.updated_at)}</dd>
          </div>
          {isDeleted && profile.deleted_at && (
            <div className="px-6 lg:px-8 py-4 flex items-center gap-4 bg-red-50/50">
              <dt className="flex items-center gap-2 text-red-600 text-sm w-40 shrink-0">
                Supprimé le
              </dt>
              <dd className="text-red-700 text-sm font-medium">{formatDate(profile.deleted_at)}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
