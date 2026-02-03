"use client";

import { api, getToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditFeeTypePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    api.admin
      .getFeeType(token, id)
      .then((res) => {
        setName(res.data.name);
        setDescription(res.data.description ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Type non trouvé."))
      .finally(() => setLoading(false));
  }, [user?.role.name, router, id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Le nom du type de frais est requis.");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    api.admin
      .updateFeeType(token, id, {
        name: name.trim(),
        description: description.trim() || undefined,
      })
      .then(() => router.push(`/dashboard/fee-types/${id}`))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement.");
      })
      .finally(() => setSubmitting(false));
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

  if (error && !name) {
    return (
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/fee-types" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <Link href={`/dashboard/fee-types/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au détail
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Modifier le type de frais
      </h1>
      <p className="text-slate-600 mb-8">
        Modifiez le nom et la description. PUT n&apos;envoie que name et description.
      </p>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl rounded-xl bg-white border border-slate-200/80 shadow-card p-6 lg:p-8 space-y-6"
      >
        {error && (
          <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
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
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ex. Frais annuels de scolarité"
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
            href={`/dashboard/fee-types/${id}`}
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
