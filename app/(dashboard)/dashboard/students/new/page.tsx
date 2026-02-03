"use client";

import { api, getToken } from "@/lib/api";
import type {
  AdminClassListItem,
  AdminProvinceItem,
  AdminCityItem,
  AdminStudentGroupListItem,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** Extrait la liste des provinces depuis la réponse API (plusieurs formats possibles). */
function normalizeProvinces(raw: unknown): AdminProvinceItem[] {
  if (Array.isArray(raw)) return raw as AdminProvinceItem[];
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.provinces)) return o.provinces as AdminProvinceItem[];
    if (Array.isArray(o.data)) return o.data as AdminProvinceItem[];
  }
  return [];
}

/** Vérifie qu'un tableau ressemble à une liste de villes (objets avec id et name). */
function isCityLikeList(arr: unknown): arr is AdminCityItem[] {
  return (
    Array.isArray(arr) &&
    (arr.length === 0 || (typeof arr[0] === "object" && arr[0] !== null && "id" in arr[0] && "name" in arr[0]))
  );
}

/** Extrait un tableau de villes depuis une valeur (liste directe ou objet paginé type Laravel { data: [...] }). */
function extractCityList(val: unknown): AdminCityItem[] {
  if (isCityLikeList(val)) return val;
  if (val && typeof val === "object" && "data" in val && Array.isArray((val as { data: unknown }).data)) {
    const arr = (val as { data: unknown[] }).data;
    if (isCityLikeList(arr)) return arr;
  }
  return [];
}

/** Extrait la liste des villes depuis la réponse API (plusieurs formats possibles). */
function normalizeCities(raw: unknown): AdminCityItem[] {
  if (isCityLikeList(raw)) return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const keys = ["cities", "data", "city", "items", "results"] as const;
    for (const k of keys) {
      const list = extractCityList(o[k]);
      if (list.length > 0) return list;
    }
    if (o.data && typeof o.data === "object" && !Array.isArray(o.data)) {
      const inner = normalizeCities(o.data);
      if (inner.length > 0) return inner;
    }
    for (const val of Object.values(o)) {
      const list = extractCityList(val);
      if (list.length > 0) return list;
    }
  }
  return [];
}

/** Extrait le code étudiant depuis la réponse generate-code (plusieurs formats possibles). */
function normalizeStudentCode(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (typeof o.code === "string") return o.code;
    if (typeof o.student_code === "string") return o.student_code;
  }
  return "";
}

export default function NewStudentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState<AdminClassListItem[]>([]);
  const [provinces, setProvinces] = useState<AdminProvinceItem[]>([]);
  const [cities, setCities] = useState<AdminCityItem[]>([]);
  const [studentGroups, setStudentGroups] = useState<AdminStudentGroupListItem[]>([]);
  const [studentCode, setStudentCode] = useState("");
  const [classId, setClassId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [gender, setGender] = useState("male");
  const [birthDate, setBirthDate] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [cityId, setCityId] = useState("");
  const [street, setStreet] = useState("");
  const [studentGroupId, setStudentGroupId] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.admin.getClasses(token, 1),
      api.admin.getProvinces(token),
      api.admin.getStudentGroups(token, 1),
      api.admin.generateStudentCode(token),
    ])
      .then(([classRes, provRes, groupRes, codeRes]) => {
        const classList = (classRes.data.data ?? []).filter((c) => !c.deleted_at);
        setClasses(classList);
        if (classList.length > 0 && !classId) setClassId(String(classList[0].id));
        // API peut renvoyer data directement (array), ou data.provinces / data.data
        const provPayload = (provRes as { data?: unknown }).data ?? provRes;
        setProvinces(normalizeProvinces(provPayload));
        const groups = (groupRes.data.data ?? []).filter((g) => !g.deleted_at);
        setStudentGroups(groups);
        // API peut renvoyer data.code, data (string), ou data.student_code
        const codePayload = (codeRes as { data?: unknown }).data;
        setStudentCode(normalizeStudentCode(codePayload));
      })
      .catch(() => setError("Impossible de charger les options."))
      .finally(() => setLoading(false));
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
    fetchOptions();
  }, [user?.role.name, router, fetchOptions]);

  useEffect(() => {
    if (!provinceId) {
      setCities([]);
      setCityId("");
      return;
    }
    const token = getToken();
    if (!token) return;
    api.admin
      .getProvinceCities(token, provinceId)
      .then((res) => {
        const payload = (res as { data?: unknown }).data ?? res;
        const list = normalizeCities(payload).length > 0 ? normalizeCities(payload) : normalizeCities(res);
        setCities(list);
        setCityId(list.length > 0 ? String(list[0].id) : "");
      })
      .catch(() => setCities([]));
  }, [provinceId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!classId.trim()) {
      setError("La classe est requise.");
      return;
    }
    if (!studentCode.trim()) {
      setError("Le code étudiant est requis.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError("Le prénom et le nom sont requis.");
      return;
    }
    if (!birthDate) {
      setError("La date de naissance est requise.");
      return;
    }
    if (!provinceId || !cityId) {
      setError("La province et la ville sont requises.");
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setSubmitting(true);
    api.admin
      .createStudent(token, {
        class_id: Number(classId),
        student_code: studentCode.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        middle_name: middleName.trim() || null,
        gender,
        birth_date: birthDate,
        province_id: Number(provinceId),
        city_id: Number(cityId),
        street: street.trim() || null,
        student_group_id: studentGroupId ? Number(studentGroupId) : null,
        is_approved: isApproved,
      })
      .then(() => router.push("/dashboard/students"))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Erreur lors de la création.");
      })
      .finally(() => setSubmitting(false));
  }

  if (!user) return null;
  if (user.role.name !== "school_admin" && user.role.name !== "superadmin") return null;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux étudiants
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Nouvel étudiant
      </h1>
      <p className="text-slate-600 mb-6">
        Renseignez les informations de l&apos;étudiant. Le code est généré automatiquement.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Chargement des options…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="class_id" className="block text-sm font-medium text-slate-700 mb-1">
                Classe *
              </label>
              <select
                id="class_id"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
                required
              >
                <option value="">Choisir une classe</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.school?.name ?? ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="student_code" className="block text-sm font-medium text-slate-700 mb-1">
                Code étudiant *
              </label>
              <input
                id="student_code"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 font-mono"
              />
              <p className="mt-1 text-xs text-slate-500">Généré automatiquement, non modifiable.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-1">
                Prénom *
              </label>
              <input
                id="first_name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
                required
              />
            </div>
            <div>
              <label htmlFor="middle_name" className="block text-sm font-medium text-slate-700 mb-1">
                Autre prénom
              </label>
              <input
                id="middle_name"
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-1">
                Nom *
              </label>
              <input
                id="last_name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
                Genre *
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
              >
                <option value="male">Homme</option>
                <option value="female">Femme</option>
              </select>
            </div>
            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-slate-700 mb-1">
                Date de naissance *
              </label>
              <input
                id="birth_date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="province_id" className="block text-sm font-medium text-slate-700 mb-1">
                Province *
              </label>
              <select
                id="province_id"
                value={provinceId}
                onChange={(e) => setProvinceId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
                required
              >
                <option value="">Choisir une province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city_id" className="block text-sm font-medium text-slate-700 mb-1">
                Ville *
              </label>
              <select
                id="city_id"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                disabled={!provinceId}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent disabled:bg-slate-50 disabled:text-slate-500"
                required
              >
                <option value="">{provinceId ? "Choisir une ville" : "Sélectionnez d'abord une province"}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="street" className="block text-sm font-medium text-slate-700 mb-1">
              Adresse (rue)
            </label>
            <input
              id="street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Ex. 123 Rue Principale"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            />
          </div>

          <div>
            <label htmlFor="student_group_id" className="block text-sm font-medium text-slate-700 mb-1">
              Groupe d&apos;élèves (optionnel)
            </label>
            <select
              id="student_group_id"
              value={studentGroupId}
              onChange={(e) => setStudentGroupId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            >
              <option value="">Aucun</option>
              {studentGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_approved"
              type="checkbox"
              checked={isApproved}
              onChange={(e) => setIsApproved(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-schoolpay-accent focus:ring-schoolpay-accent"
            />
            <label htmlFor="is_approved" className="text-sm font-medium text-slate-700">
              Approuvé (visible / actif)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer l&apos;étudiant
            </button>
            <Link
              href="/dashboard/students"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              Annuler
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
