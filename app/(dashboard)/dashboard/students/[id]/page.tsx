"use client";

import { api, getToken } from "@/lib/api";
import type { AdminStudentDetailResponse } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  BookUser,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
  CheckCircle,
  XCircle,
  MapPin,
  GraduationCap,
  Building2,
  FileWarning,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(s: string) {
  return new Intl.NumberFormat("fr-FR").format(Number(s));
}

export default function StudentDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [data, setData] = useState<AdminStudentDetailResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStudent = useCallback(() => {
    if (!id) return;
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getStudent(token, id)
      .then((res) => setData(res.data))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Étudiant non trouvé.");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

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
    if (!id) return;
    fetchStudent();
  }, [user?.role.name, router, id, fetchStudent]);

  function handleDelete() {
    if (!confirm("Supprimer cet étudiant ?")) return;
    const token = getToken();
    if (!token || !id) return;
    setActionLoading("delete");
    api.admin
      .deleteStudent(token, id)
      .then(() => router.push("/dashboard/students"))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setActionLoading(null);
      });
  }

  function handleRestore() {
    const token = getToken();
    if (!token || !id) return;
    setActionLoading("restore");
    api.admin
      .restoreStudent(token, id)
      .then(() => fetchStudent())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setActionLoading(null));
  }

  function handleApprove() {
    const token = getToken();
    if (!token || !id) return;
    setActionLoading("approve");
    api.admin
      .approveStudent(token, id)
      .then(() => fetchStudent())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setActionLoading(null));
  }

  function handleDisapprove() {
    const token = getToken();
    if (!token || !id) return;
    setActionLoading("disapprove");
    api.admin
      .disapproveStudent(token, id)
      .then(() => fetchStudent())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setActionLoading(null));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;
  if (!id) return null;

  if (loading && !data) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 lg:p-8">
        <Link
          href="/dashboard/students"
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

  if (!data) return null;

  const s = data.student;
  const isDeleted = !!s.deleted_at;
  const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ") || s.student_code;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/students"
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
            {fullName}
          </h1>
          <p className="text-slate-600 font-mono text-sm">{s.student_code}</p>
          <div className="mt-2 flex items-center gap-2">
            {s.is_approved ? (
              <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Approuvé
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium">
                <XCircle className="w-4 h-4" /> En attente d&apos;approbation
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDeleted && (
            <>
              <Link
                href={`/dashboard/students/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Link>
              <button
                type="button"
                onClick={s.is_approved ? handleDisapprove : handleApprove}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                {actionLoading === "approve" || actionLoading === "disapprove" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : s.is_approved ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Désapprouver
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                {actionLoading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </>
          )}
          {isDeleted && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={!!actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
            >
              {actionLoading === "restore" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Restaurer
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl bg-white border border-slate-200/80 shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BookUser className="w-5 h-5 text-schoolpay-accent" />
            Informations personnelles
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500 font-medium">Genre</dt>
              <dd className="text-slate-900">{s.gender === "male" ? "Homme" : s.gender === "female" ? "Femme" : s.gender}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Date de naissance</dt>
              <dd className="text-slate-900">{formatDate(s.birth_date)}</dd>
            </div>
            {s.created_by && (
              <div>
                <dt className="text-slate-500 font-medium">Créé par</dt>
                <dd className="text-slate-900">{s.created_by.full_name}</dd>
              </div>
            )}
            {s.updated_by && (
              <div>
                <dt className="text-slate-500 font-medium">Modifié par</dt>
                <dd className="text-slate-900">{s.updated_by.full_name}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-xl bg-white border border-slate-200/80 shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-schoolpay-accent" />
            Adresse
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500 font-medium">Province</dt>
              <dd className="text-slate-900">{s.province?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Ville</dt>
              <dd className="text-slate-900">{s.city?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Rue</dt>
              <dd className="text-slate-900">{s.street || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl bg-white border border-slate-200/80 shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-schoolpay-accent" />
            Classe
          </h2>
          <p className="text-slate-900 font-medium">{s.class?.name ?? "—"}</p>
          <Link
            href={`/dashboard/classes/${s.class_id}`}
            className="mt-2 inline-flex items-center gap-1 text-sm text-schoolpay-accent hover:underline"
          >
            Voir la classe
          </Link>
        </section>

        <section className="rounded-xl bg-white border border-slate-200/80 shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-schoolpay-accent" />
            École
          </h2>
          <p className="text-slate-900 font-medium">{s.school?.name ?? "—"}</p>
          {s.student_group && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <dt className="text-slate-500 font-medium text-sm">Groupe d&apos;élèves</dt>
              <dd className="text-slate-900 font-medium">{s.student_group.name}</dd>
            </div>
          )}
        </section>
      </div>

      {data.has_missing_documents && data.missing_required_documents?.length > 0 && (
        <section className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <FileWarning className="w-5 h-5" />
            Documents requis manquants
          </h2>
          <p className="text-sm text-amber-800">
            {data.missing_required_documents.length} document(s) obligatoire(s) non fourni(s) pour cette classe.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-white border border-slate-200/80 shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-schoolpay-accent" />
            Frais associés
          </h2>
          <Link
            href={`/dashboard/students/${id}/fees`}
            className="text-sm font-medium text-schoolpay-accent hover:underline"
          >
            Gérer les frais
          </Link>
        </div>
        {s.student_fees && s.student_fees.length > 0 ? (
          <ul className="space-y-2">
            {s.student_fees.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <Link
                  href={`/dashboard/students/${id}/fees/${f.id}`}
                  className="text-slate-700 hover:text-schoolpay-accent hover:underline"
                >
                  Frais #{f.fee_type_id}
                </Link>
                <span className="font-medium text-slate-900">{formatAmount(f.amount)}</span>
                <span className="text-sm text-slate-500">{formatDate(f.due_date)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Aucun frais assigné. Cliquez sur &quot;Gérer les frais&quot; pour en ajouter.</p>
        )}
      </section>
    </div>
  );
}
