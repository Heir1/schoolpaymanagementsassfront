"use client";

import { api, getToken } from "@/lib/api";
import type { ParentLinkedChildItem } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookUser,
  Loader2,
  MoreVertical,
  Star,
  Trash2,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type FilterTab = "all" | "primary" | "secondary";

function formatRelativeDate(isoOrLabel: string) {
  const d = new Date(isoOrLabel);
  if (Number.isNaN(d.getTime())) return isoOrLabel;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(name: string | null | undefined) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ParentChildrenPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [childrenData, setChildrenData] = useState<{ all: ParentLinkedChildItem[]; counts: { total: number; primary: number; secondary: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<number | null>(null);

  const fetchChildren = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    api.parent
      .getChildren(token)
      .then((res) => {
        const rawAll = res.data.children.all as Array<
          | ParentLinkedChildItem
          | { student: ParentLinkedChildItem; is_primary?: boolean; linked_since?: string }
        >;
        const all: ParentLinkedChildItem[] = rawAll.map((item) => {
          if ("student" in item && item.student) {
            return {
              ...item.student,
              is_primary: item.is_primary,
              linked_at: item.linked_since ?? item.student.linked_at,
            };
          }
          return item as ParentLinkedChildItem;
        });
        setChildrenData({
          all,
          counts: res.data.counts,
        });
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur");
        setChildrenData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role.name !== "parent") {
      router.replace("/dashboard");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchChildren();
  }, [user?.role.name, router, fetchChildren]);

  function handleUnlink(studentId: number) {
    if (!confirm("Délier cet enfant de votre compte ? Vous pourrez le relier plus tard.")) return;
    const token = getToken();
    if (!token) return;
    setUnlinkingId(studentId);
    setMenuOpenId(null);
    api.parent
      .unlinkChild(token, studentId)
      .then(() => fetchChildren())
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setUnlinkingId(null));
  }

  if (!user) return null;
  if (user.role.name !== "parent") return null;

  const filteredList = childrenData?.all ?? [];
  const list =
    filter === "primary"
      ? filteredList.filter((c) => c.is_primary)
      : filter === "secondary"
        ? filteredList.filter((c) => !c.is_primary)
        : filteredList;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Mes enfants
          </h1>
          <p className="text-slate-600">
            Enfants liés à votre compte. Vous pouvez suivre leurs frais et activités.
          </p>
        </div>
        <Link
          href="/dashboard/children/link"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover shadow-cta shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Lier un enfant
        </Link>
      </div>

      {error && (
        <div role="alert" className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
        </div>
      ) : (
        <>
          {childrenData && childrenData.counts.total > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent">
                    <BookUser className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{childrenData.counts.total}</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{childrenData.counts.primary}</p>
                    <p className="text-xs text-slate-500">Parent principal</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <BookUser className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{childrenData.counts.secondary}</p>
                    <p className="text-xs text-slate-500">Secondaires</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {childrenData && childrenData.counts.total > 0 && (
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-schoolpay-accent text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setFilter("primary")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "primary" ? "bg-schoolpay-accent text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Principaux
              </button>
              <button
                type="button"
                onClick={() => setFilter("secondary")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "secondary" ? "bg-schoolpay-accent text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Secondaires
              </button>
            </div>
          )}

          <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-visible">
            {!childrenData || childrenData.all.length === 0 ? (
              <div className="p-12 text-center">
                <BookUser className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Aucun enfant lié</p>
                <p className="text-slate-500 text-sm mt-1">Liez un enfant pour suivre sa scolarité et ses frais.</p>
                <Link
                  href="/dashboard/children/link"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover"
                >
                  <UserPlus className="w-4 h-4" />
                  Lier un enfant
                </Link>
              </div>
            ) : list.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Aucun enfant dans cette catégorie.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {list.map((child) => (
                  <li key={child.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent font-semibold text-lg shrink-0">
                      {getInitials(child.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{child.full_name || "—"}</p>
                      <p className="text-sm text-slate-500 truncate">
                        {child.class?.name ?? "—"} · {child.school?.name ?? "—"}
                      </p>
                      {child.linked_at && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          Lié {formatRelativeDate(child.linked_at)}
                        </p>
                      )}
                    </div>
                    {child.is_primary && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 shrink-0">
                        <Star className="w-3.5 h-3.5" />
                        Parent principal
                      </span>
                    )}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setMenuOpenId(menuOpenId === child.id ? null : child.id)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label="Actions"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {menuOpenId === child.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            aria-hidden
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                            <button
                              type="button"
                              onClick={() => handleUnlink(child.id)}
                              disabled={unlinkingId === child.id}
                              className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {unlinkingId === child.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Délier
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
