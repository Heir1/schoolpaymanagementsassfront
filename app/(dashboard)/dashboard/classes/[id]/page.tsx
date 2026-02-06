"use client";

import { api, getToken } from "@/lib/api";
import type {
  AdminClassListItem,
  AdminClassRequiredDocumentsResponse,
  AdminClassRequiredDocumentItem,
  AdminInscriptionDocumentListItem,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, GraduationCap, Pencil, Trash2, RotateCcw, Loader2, FileText, Plus } from "lucide-react";
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

export default function ClassDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [cls, setCls] = useState<AdminClassListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [requiredData, setRequiredData] = useState<AdminClassRequiredDocumentsResponse["data"] | null>(null);
  const [availableData, setAvailableData] = useState<AdminClassRequiredDocumentsResponse["data"] | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docActionId, setDocActionId] = useState<number | string | null>(null);
  const [catalogueDocuments, setCatalogueDocuments] = useState<AdminInscriptionDocumentListItem[]>([]);
  const [addDocumentId, setAddDocumentId] = useState("");
  const [addMandatory, setAddMandatory] = useState(true);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [bulkSelectedDocIds, setBulkSelectedDocIds] = useState<number[]>([]);
  const [bulkMandatoryByDocId, setBulkMandatoryByDocId] = useState<Record<number, boolean>>({});
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const fetchClass = () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.admin
      .getClass(token, id)
      .then((res) => setCls(res.data))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Classe non trouvée.");
        setCls(null);
      })
      .finally(() => setLoading(false));
  };

  const fetchRequiredDocuments = useCallback((silent = false) => {
    const token = getToken();
    if (!token) return;
    if (!silent) setDocsLoading(true);
    api.admin
      .getClassRequiredDocuments(token, id)
      .then((res) => setRequiredData(res.data))
      .catch(() => setRequiredData(null))
      .finally(() => { if (!silent) setDocsLoading(false); });
  }, [id]);

  const fetchAvailableDocuments = useCallback(() => {
    const token = getToken();
    if (!token) return;
    api.admin
      .getClassAvailableDocuments(token, id)
      .then((res) => setAvailableData(res.data))
      .catch(() => setAvailableData(null));
  }, [id]);

  const fetchCatalogueDocuments = useCallback(() => {
    const token = getToken();
    if (!token) return;
    api.admin
      .getInscriptionDocuments(token, 1, { status: "active", per_page: 100 })
      .then((res) => setCatalogueDocuments(res.data.data))
      .catch(() => setCatalogueDocuments([]));
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
    fetchClass();
  }, [user?.role.name, router, id]);

  useEffect(() => {
    if (!cls || !!cls.deleted_at) return;
    const token = getToken();
    if (!token) return;
    fetchRequiredDocuments();
    fetchAvailableDocuments();
    fetchCatalogueDocuments();
  }, [cls?.id, cls?.deleted_at, fetchRequiredDocuments, fetchAvailableDocuments, fetchCatalogueDocuments]);

  function handleDelete() {
    if (!confirm("Supprimer cette classe ?")) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("delete");
    api.admin
      .deleteClass(token, id)
      .then(() => router.push("/dashboard/classes"))
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
      .restoreClass(token, id)
      .then(() => fetchClass())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setActionLoading(null));
  }

  function handleDeleteRequiredDoc(requiredDocId: number) {
    if (!confirm("Retirer ce document des requis pour cette classe ?")) return;
    const token = getToken();
    if (!token) return;
    setDocActionId(requiredDocId);
    api.admin
      .deleteClassRequiredDocument(token, id, requiredDocId)
      .then(() => {
        fetchRequiredDocuments(true);
        fetchAvailableDocuments();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setDocActionId(null));
  }

  function handleRestoreRequiredDoc(requiredDocId: number) {
    const token = getToken();
    if (!token) return;
    setDocActionId(requiredDocId);
    api.admin
      .restoreClassRequiredDocument(token, id, requiredDocId)
      .then(() => {
        fetchRequiredDocuments(true);
        fetchAvailableDocuments();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setDocActionId(null));
  }

  function handleToggleMandatory(item: AdminClassRequiredDocumentItem) {
    const token = getToken();
    if (!token) return;
    const activeDocs = (availableData?.required_documents ?? requiredData?.required_documents ?? []).filter((d) => !d.is_deleted);
    const updated = activeDocs.map((d) => ({
      document_id: d.document.id,
      is_mandatory: d.id === item.id ? !item.is_mandatory : d.is_mandatory,
    }));
    setDocActionId(item.id);
    api.admin
      .updateClassRequiredDocumentsBulk(token, id, { documents: updated })
      .then(() => {
        fetchRequiredDocuments(true);
        fetchAvailableDocuments();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setDocActionId(null));
  }

  function handleAddDocument(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !addDocumentId.trim()) return;
    setAddSubmitting(true);
    api.admin
      .addClassRequiredDocument(token, id, {
        document_id: Number(addDocumentId),
        is_mandatory: addMandatory,
      })
      .then(() => {
        setAddDocumentId("");
        setAddMandatory(true);
        fetchRequiredDocuments(true);
        fetchAvailableDocuments();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setAddSubmitting(false));
  }

  function toggleBulkDoc(docId: number, selected: boolean) {
    if (selected) {
      setBulkSelectedDocIds((prev) => (prev.includes(docId) ? prev : [...prev, docId]));
      setBulkMandatoryByDocId((prev) => ({ ...prev, [docId]: true }));
    } else {
      setBulkSelectedDocIds((prev) => prev.filter((id) => id !== docId));
      setBulkMandatoryByDocId((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
    }
  }

  function handleAddDocumentsBulk(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || bulkSelectedDocIds.length === 0) return;
    setBulkSubmitting(true);
    const documents = bulkSelectedDocIds.map((document_id) => ({
      document_id,
      is_mandatory: bulkMandatoryByDocId[document_id] ?? true,
    }));
    api.admin
      .addClassRequiredDocumentsBulk(token, id, { documents })
      .then(() => {
        setBulkSelectedDocIds([]);
        setBulkMandatoryByDocId({});
        fetchRequiredDocuments(true);
        fetchAvailableDocuments();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setBulkSubmitting(false));
  }

  const availableForBulk = catalogueDocuments.filter(
    (d) => !(availableData?.required_documents ?? requiredData?.required_documents)?.some((r) => r.document.id === d.id && !r.is_deleted)
  );

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
      </div>
    );
  }

  if (error && !cls) {
    return (
      <div className="p-6 lg:p-8">
        <Link href="/dashboard/classes" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </Link>
        <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!cls) return null;

  const isDeleted = !!cls.deleted_at;

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/classes" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      {error && (
        <div role="alert" className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {cls.name}
          </h1>
          <p className="text-slate-600">
            {cls.school.name} · {cls.school_year.year_label} · {cls.level || "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDeleted && (
            <>
              <Link href={`/dashboard/classes/${id}/edit`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover">
                <Pencil className="w-4 h-4" />
                Modifier
              </Link>
              <button type="button" onClick={handleDelete} disabled={!!actionLoading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50">
                {actionLoading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </>
          )}
          {isDeleted && (
            <button type="button" onClick={handleRestore} disabled={!!actionLoading} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-green text-white text-sm font-semibold hover:bg-schoolpay-green/90 disabled:opacity-50">
              {actionLoading === "restore" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Restaurer
            </button>
          )}
        </div>
      </div>

      <div className={`rounded-xl bg-white border shadow-card overflow-hidden ${isDeleted ? "border-slate-200/80 opacity-90" : "border-slate-200/80"}`}>
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-schoolpay-accent" />
          <h2 className="font-display text-lg font-semibold text-slate-900">Détail de la classe</h2>
        </div>
        <dl className="divide-y divide-slate-100">
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Nom</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{cls.name}</dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Niveau</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{cls.level || "—"}</dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">École</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{cls.school.name}</dd>
          </div>
          <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-slate-500">Année scolaire</dt>
            <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{cls.school_year.year_label}</dd>
          </div>
          {isDeleted && cls.deleted_at && (
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-slate-500">Supprimée le</dt>
              <dd className="mt-1 text-sm text-red-600 sm:col-span-2">{formatDate(cls.deleted_at)}</dd>
            </div>
          )}
          {cls.created_by && (
            <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-slate-500">Créée par</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:col-span-2">{cls.created_by.name}</dd>
            </div>
          )}
        </dl>
      </div>

      {!isDeleted && (
        <div className="mt-8 rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2">
            <FileText className="w-5 h-5 text-schoolpay-accent" />
            <h2 className="font-display text-lg font-semibold text-slate-900">Documents requis pour l&apos;inscription</h2>
          </div>
          <div className="p-6">
            {docsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-schoolpay-accent animate-spin" />
              </div>
            ) : (
              <>
                {requiredData && requiredData.counts && (
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
                    <span><strong className="text-slate-900">{requiredData.counts.total}</strong> document{requiredData.counts.total !== 1 ? "s" : ""} au total</span>
                    {typeof requiredData.counts.mandatory === "number" && (
                      <span><strong className="text-slate-900">{requiredData.counts.mandatory}</strong> obligatoire{requiredData.counts.mandatory !== 1 ? "s" : ""}</span>
                    )}
                    {typeof requiredData.counts.optional === "number" && (
                      <span><strong className="text-slate-900">{requiredData.counts.optional}</strong> optionnel{requiredData.counts.optional !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                )}

                {catalogueDocuments.length > 0 && (
                  <form onSubmit={handleAddDocument} className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-end gap-3">
                    <div className="min-w-[200px] flex-1">
                      <label htmlFor="add-doc" className="block text-sm font-medium text-slate-700 mb-1">Ajouter un document</label>
                      <select
                        id="add-doc"
                        value={addDocumentId}
                        onChange={(e) => setAddDocumentId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
                      >
                        <option value="">Choisir un document</option>
                        {catalogueDocuments
                          .filter((d) => !(availableData?.required_documents ?? requiredData?.required_documents)?.some((r) => r.document.id === d.id && !r.is_deleted))
                          .map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addMandatory}
                        onChange={(e) => setAddMandatory(e.target.checked)}
                        className="rounded border-slate-300 text-schoolpay-accent focus:ring-schoolpay-accent"
                      />
                      <span className="text-sm text-slate-700">Obligatoire</span>
                    </label>
                    <button
                      type="submit"
                      disabled={addSubmitting || !addDocumentId.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
                    >
                      {addSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Ajouter
                    </button>
                  </form>
                )}

                {availableForBulk.length > 0 && (
                  <form onSubmit={handleAddDocumentsBulk} className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Ajouter plusieurs documents à la fois</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto mb-4">
                      {availableForBulk.map((d) => (
                        <li key={d.id} className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={bulkSelectedDocIds.includes(d.id)}
                              onChange={(e) => toggleBulkDoc(d.id, e.target.checked)}
                              className="rounded border-slate-300 text-schoolpay-accent focus:ring-schoolpay-accent"
                            />
                            <span className="text-sm text-slate-900 truncate">{d.name}</span>
                          </label>
                          {bulkSelectedDocIds.includes(d.id) && (
                            <label className="flex items-center gap-1.5 cursor-pointer shrink-0 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                checked={bulkMandatoryByDocId[d.id] ?? true}
                                onChange={(e) => setBulkMandatoryByDocId((prev) => ({ ...prev, [d.id]: e.target.checked }))}
                                className="rounded border-slate-300 text-schoolpay-accent focus:ring-schoolpay-accent"
                              />
                              Obligatoire
                            </label>
                          )}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="submit"
                      disabled={bulkSubmitting || bulkSelectedDocIds.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
                    >
                      {bulkSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Ajouter la sélection ({bulkSelectedDocIds.length})
                    </button>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const listDocuments = (availableData?.required_documents ?? requiredData?.required_documents) ?? [];
                        if (!listDocuments.length) {
                          return (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-slate-500 text-sm">
                                Aucun document requis. Ajoutez-en depuis le sélecteur ci-dessus.
                              </td>
                            </tr>
                          );
                        }
                        return listDocuments.map((item) => {
                          const deleted = !!item.is_deleted || !!item.deleted_at;
                          return (
                            <tr
                              key={item.id}
                              className={`border-b border-slate-100 ${deleted ? "bg-slate-50/80 opacity-90" : ""}`}
                            >
                              <td className="px-4 py-3">
                                <span className={deleted ? "text-slate-500" : "font-medium text-slate-900"}>{item.document.name}</span>
                              </td>
                              <td className="px-4 py-3">
                                {deleted ? (
                                  <span className="text-xs font-medium text-red-600">Supprimé</span>
                                ) : (
                                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${item.is_mandatory ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                                    {item.is_mandatory ? "Obligatoire" : "Optionnel"}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {deleted ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRestoreRequiredDoc(item.id)}
                                    disabled={docActionId === item.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-schoolpay-green hover:bg-schoolpay-green/10 disabled:opacity-50"
                                  >
                                    {docActionId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                    Restaurer
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleMandatory(item)}
                                      disabled={docActionId === item.id}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                    >
                                      {docActionId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                                      {item.is_mandatory ? "Rendre optionnel" : "Rendre obligatoire"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteRequiredDoc(item.id)}
                                      disabled={docActionId === item.id}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                      {docActionId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                      Retirer
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
