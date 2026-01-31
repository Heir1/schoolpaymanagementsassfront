"use client";

import { api, getToken } from "@/lib/api";
import type { AdminSchoolYearListItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  Trash2,
  RotateCcw,
  Power,
  PowerOff,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SchoolYearDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [year, setYear] = useState<AdminSchoolYearListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchYear = () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getSchoolYear(token, id)
      .then((res) => setYear(res.data))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Année non trouvée.");
        setYear(null);
      })
      .finally(() => setLoading(false));
  };

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
    fetchYear();
  }, [user?.role.name, router, id]);

  function handleDelete() {
    if (!confirm("Supprimer cette année scolaire ?")) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("delete");
    api.admin
      .deleteSchoolYear(token, id)
      .then(() => router.push("/dashboard/school-years"))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setActionLoading(null);
      });
  }

  function handleRestore() {
    const token = getToken();
    if (!token) return;
    setActionLoading("restore");
    api.admin
      .restoreSchoolYear(token, id)
      .then(() => fetchYear())
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
      })
      .finally(() => setActionLoading(null));
  }

  function handleToggleActive() {
    const token = getToken();
    if (!token) return;
    setActionLoading("toggle");
    api.admin
      .toggleSchoolYearActive(token, id)
      .then(() => fetchYear())
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
      })
      .finally(() => setActionLoading(null));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
      </div>
    );
  }

  if (error && !year) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href="/dashboard/school-years"
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

  if (!year) return null;

  const isDeleted = !!year.deleted_at;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/school-years"
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {year.year_label}
          </h1>
          <p className="text-slate-600">
            {year.school.name} · {formatDate(year.start_date)} – {formatDate(year.end_date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDeleted && (
            <>
              <Link
                href={`/dashboard/school-years/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Link>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-amber-300 text-amber-700 text-sm font-medium hover:bg-amber-50 disabled:opacity-50"
              >
                {actionLoading === "toggle" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : year.is_active ? (
                  <PowerOff className="w-4 h-4" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
                {year.is_active ? "Désactiver" : "Activer"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                {actionLoading === "delete" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </button>
            </>
          )}
          {isDeleted && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-green text-white text-sm font-semibold hover:bg-schoolpay-green/90 disabled:opacity-50"
            >
              {actionLoading === "restore" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Restaurer
            </button>
          )}
        </div>
      </div>

      <div
        className={`rounded-xl bg-white border shadow-card overflow-hidden ${
          isDeleted ? "border-slate-200/80 opacity-90" : "border-slate-200/80"
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-schoolpay-accent" />
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Détail de l&apos;année scolaire
          </h2>
        </div>
        <dl className="divide-y divide-slate-100">
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Libellé</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{year.year_label}</dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">École</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{year.school.name}</dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Date de début</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">
              {formatDate(year.start_date)}
            </dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Date de fin</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">
              {formatDate(year.end_date)}
            </dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Statut</dt>
            <dd className="mt-1 sm:col-span-2">
              <span
                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  year.is_active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {year.is_active ? "Active" : "Inactive"}
              </span>
              {isDeleted && year.deleted_at && (
                <span className="ml-2 inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                  Supprimée le {formatDate(year.deleted_at)}
                </span>
              )}
            </dd>
          </div>
          {year.created_by && (
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-slate-500">Créée par</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">
                {year.created_by.name}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
