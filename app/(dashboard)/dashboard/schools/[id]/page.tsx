"use client";

import { api, getToken, getAvatarUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Calendar,
  Pencil,
  Trash2,
  RotateCcw,
  Upload,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AdminSchoolDetail } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SchoolDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [school, setSchool] = useState<AdminSchoolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoSuccess, setLogoSuccess] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
      .getSchool(token, id)
      .then((res) => setSchool(res.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [user?.role.name, router, id]);

  function handleDelete() {
    if (!confirm("Supprimer cette école ? Cette action peut être annulée (restauration).")) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("delete");
    api.admin
      .deleteSchool(token, id)
      .then(() => router.push("/dashboard/schools"))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setActionLoading(null);
      });
  }

  function handleRestore() {
    if (!confirm("Restaurer cette école ?")) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("restore");
    api.admin
      .restoreSchool(token, id)
      .then(() => {
        setSuccessMessage("École restaurée.");
        setActionLoading(null);
        api.admin.getSchool(token, id).then((res) => setSchool(res.data));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setActionLoading(null);
      });
  }

  function refreshSchool() {
    const token = getToken();
    if (!token) return;
    api.admin.getSchool(token, id).then((res) => setSchool(res.data));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !school) return;
    const token = getToken();
    if (!token) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Veuillez choisir une image (JPG, PNG, etc.).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("L\u2019image ne doit pas dépasser 2 Mo.");
      return;
    }
    setLogoError(null);
    setLogoSuccess(null);
    setLogoLoading(true);
    const formData = new FormData();
    formData.append("logo", file);
    api.admin
      .uploadSchoolLogo(token, id, formData)
      .then(() => {
        setLogoSuccess("Logo mis à jour.");
        refreshSchool();
      })
      .catch((err) => setLogoError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => {
        setLogoLoading(false);
        e.target.value = "";
      });
  }

  function handleLogoDelete() {
    if (!school || !confirm("Supprimer le logo de cette école ?")) return;
    const token = getToken();
    if (!token) return;
    setLogoError(null);
    setLogoSuccess(null);
    setLogoLoading(true);
    api.admin
      .deleteSchoolLogo(token, id)
      .then(() => {
        setLogoSuccess("Logo supprimé.");
        refreshSchool();
      })
      .catch((err) => setLogoError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLogoLoading(false));
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

  if (error && !school) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href="/dashboard/schools"
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

  if (!school) return null;

  const isDeleted = !!school.deleted_at;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/schools"
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
          Détail de l&apos;école
        </h1>
        <div className="flex flex-wrap gap-2">
          {!isDeleted && (
            <>
              <Link
                href={`/dashboard/schools/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-schoolpay-accent text-white text-sm font-medium hover:bg-schoolpay-accent-hover"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Link>
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
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative">
              {school.logo_url ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- logo URL from API (dynamic) */}
                  <img
                    src={getAvatarUrl(school.logo_url)!}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
              )}
              {logoLoading && (
                <div className="absolute inset-0 rounded-xl bg-slate-900/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
                {school.name}
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">{school.type.name}</p>
              {isDeleted && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                  École supprimée
                </span>
              )}
              {!isDeleted && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={logoLoading}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoLoading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-accent hover:bg-schoolpay-accent/10 border border-schoolpay-accent/30 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    Changer le logo
                  </button>
                  {school.logo_url && (
                    <button
                      type="button"
                      onClick={handleLogoDelete}
                      disabled={logoLoading}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer le logo
                    </button>
                  )}
                </div>
              )}
              {logoError && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {logoError}
                </p>
              )}
              {logoSuccess && (
                <p className="mt-2 text-sm text-green-600" role="status">
                  {logoSuccess}
                </p>
              )}
            </div>
          </div>
        </div>

        <dl className="divide-y divide-slate-100">
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Building2 className="w-4 h-4" />
              Nom
            </dt>
            <dd className="text-slate-900 font-medium">{school.name}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              Type
            </dt>
            <dd className="text-slate-900">{school.type.name}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <MapPin className="w-4 h-4" />
              Adresse
            </dt>
            <dd className="text-slate-600">{school.address || "—"}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Phone className="w-4 h-4" />
              Téléphone
            </dt>
            <dd className="text-slate-600">{school.phone || "—"}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Calendar className="w-4 h-4" />
              Créée le
            </dt>
            <dd className="text-slate-600 text-sm">{formatDate(school.created_at)}</dd>
          </div>
          {school.updated_at && (
            <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
              <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
                Mis à jour le
              </dt>
              <dd className="text-slate-600 text-sm">{formatDate(school.updated_at)}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
