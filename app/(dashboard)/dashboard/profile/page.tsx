"use client";

import { api, getToken, getAvatarUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  KeyRound,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRef, useState } from "react";

const roleLabels: Record<string, string> = {
  superadmin: "Super administrateur",
  school_admin: "Administrateur école",
  parent: "Parent",
};

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
const MAX_AVATAR_SIZE_MB = 5;

export default function ProfilePage() {
  const { user, fetchMe } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);

  if (!user) return null;

  const roleLabel = roleLabels[user.role.name] ?? user.role.name;
  const token = getToken();

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation) {
      setPasswordError("Tous les champs sont requis.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setPasswordError("Le nouveau mot de passe et la confirmation ne correspondent pas.");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!token) return;
    setPasswordLoading(true);
    api.admin
      .changePassword(token, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation,
      })
      .then(() => {
        setPasswordSuccess("Mot de passe modifié avec succès.");
        setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" });
      })
      .catch((e) => setPasswordError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setPasswordLoading(false));
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token || !user) return;
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Format accepté : JPEG, PNG, JPG, GIF ou WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setAvatarError(`Taille max. ${MAX_AVATAR_SIZE_MB} Mo.`);
      return;
    }
    setAvatarError(null);
    setAvatarSuccess(null);
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    api.admin
      .uploadAvatar(token, user.id, formData)
      .then(() => {
        setAvatarSuccess("Photo mise à jour.");
        fetchMe();
      })
      .catch((err) => setAvatarError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => {
        setAvatarLoading(false);
        e.target.value = "";
      });
  }

  function handleAvatarDelete() {
    if (!token || !user || !confirm("Supprimer votre photo de profil ?")) return;
    setAvatarError(null);
    setAvatarSuccess(null);
    setAvatarLoading(true);
    api.admin
      .deleteAvatar(token, user.id)
      .then(() => {
        setAvatarSuccess("Photo supprimée.");
        fetchMe();
      })
      .catch((err) => setAvatarError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setAvatarLoading(false));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-8">
        Mon profil
      </h1>

      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden mb-8">
        <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent shrink-0 overflow-hidden">
                {getAvatarUrl(user.avatar_url) ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar URL from API (dynamic)
                  <img
                    src={getAvatarUrl(user.avatar_url)!}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              {avatarLoading && (
                <div className="absolute inset-0 rounded-xl bg-slate-900/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
                {user.full_name}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">{roleLabel}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpeg,.png,.jpg,.gif,.webp,image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={avatarLoading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-schoolpay-accent hover:bg-schoolpay-accent-hover disabled:opacity-50 shrink-0"
                >
                  {avatarLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Changer la photo
                </button>
                {user.avatar_url && (
                  <button
                    type="button"
                    onClick={handleAvatarDelete}
                    disabled={avatarLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 disabled:opacity-50 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer la photo
                  </button>
                )}
              </div>
              {avatarError && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {avatarError}
                </p>
              )}
              {avatarSuccess && (
                <p className="mt-2 text-sm text-green-600" role="status">
                  {avatarSuccess}
                </p>
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
            <dd className="text-slate-900 font-medium">{user.full_name}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              {user.is_email ? (
                <Mail className="w-4 h-4" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              {user.is_email ? "Email" : "Téléphone"}
            </dt>
            <dd className="text-slate-900">{user.phone_or_email}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Shield className="w-4 h-4" />
              Rôle
            </dt>
            <dd className="text-slate-900">{roleLabel}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Shield className="w-4 h-4 opacity-0" aria-hidden />
              Description du rôle
            </dt>
            <dd className="text-slate-600 text-sm">{user.role.description}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Calendar className="w-4 h-4" />
              Membre depuis
            </dt>
            <dd className="text-slate-600 text-sm">
              {new Date(user.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
        <div className="px-6 lg:px-8 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-display text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-schoolpay-accent" />
            Changer le mot de passe
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Saisissez votre mot de passe actuel puis le nouveau (avec confirmation).
          </p>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-6 lg:p-8 space-y-4">
          {passwordError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm" role="status">
              {passwordSuccess}
            </div>
          )}
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, current_password: e.target.value }))
              }
              className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
              placeholder="••••••••"
              disabled={passwordLoading}
            />
          </div>
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-slate-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              id="new_password"
              type="password"
              autoComplete="new-password"
              value={passwordForm.new_password}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, new_password: e.target.value }))
              }
              className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
              placeholder="••••••••"
              disabled={passwordLoading}
            />
          </div>
          <div>
            <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-slate-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="new_password_confirmation"
              type="password"
              autoComplete="new-password"
              value={passwordForm.new_password_confirmation}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, new_password_confirmation: e.target.value }))
              }
              className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
              placeholder="••••••••"
              disabled={passwordLoading}
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
          >
            {passwordLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            Enregistrer le nouveau mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
