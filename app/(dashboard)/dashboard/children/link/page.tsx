"use client";

import { api, getToken } from "@/lib/api";
import type {
  ParentSchoolSearchItem,
  ParentSchoolClassesClassItem,
  ParentClassStudentItem,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Building2,
  Check,
  GraduationCap,
  Loader2,
  Search,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const STEPS = [
  { id: 1, label: "Recherche école" },
  { id: 2, label: "Sélection classe" },
  { id: 3, label: "Sélection élève" },
  { id: 4, label: "Confirmation" },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatBirthDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ParentLinkChildPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ParentSchoolSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [selectedSchool, setSelectedSchool] = useState<ParentSchoolSearchItem | null>(null);
  const [classesByLevel, setClassesByLevel] = useState<{ level: string; classes: ParentSchoolClassesClassItem[] }[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);

  const [selectedClass, setSelectedClass] = useState<ParentSchoolClassesClassItem | null>(null);
  const [students, setStudents] = useState<ParentClassStudentItem[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<ParentClassStudentItem | null>(null);
  const [linkStatusMessage, setLinkStatusMessage] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);

  const fetchSchools = useCallback((term: string) => {
    const token = getToken();
    if (!token || !term.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    api.parent
      .searchSchools(token, term)
      .then((res) => setSearchResults(res.data.schools))
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  }, []);

  useEffect(() => {
    if (searchDebounce) clearTimeout(searchDebounce);
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => fetchSchools(searchTerm), 300);
    setSearchDebounce(t);
    return () => clearTimeout(t);
  }, [searchTerm, fetchSchools]);

  const fetchClasses = useCallback((schoolId: number) => {
    const token = getToken();
    if (!token) return;
    setClassesLoading(true);
    api.parent
      .getSchoolClasses(token, schoolId)
      .then((res) => setClassesByLevel(res.data.classes_by_level))
      .catch(() => setClassesByLevel([]))
      .finally(() => setClassesLoading(false));
  }, []);

  const fetchStudents = useCallback((classId: number) => {
    const token = getToken();
    if (!token) return;
    setStudentsLoading(true);
    api.parent
      .getClassStudents(token, classId)
      .then((res) => setStudents(res.data.students))
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
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
  }, [user?.role.name, router]);

  useEffect(() => {
    if (selectedSchool && step >= 2) {
      fetchClasses(selectedSchool.id);
    }
  }, [selectedSchool, step, fetchClasses]);

  useEffect(() => {
    if (selectedClass && step >= 3) {
      fetchStudents(selectedClass.id);
    }
  }, [selectedClass, step, fetchStudents]);

  function handleSelectSchool(school: ParentSchoolSearchItem) {
    setSelectedSchool(school);
    setSelectedClass(null);
    setSelectedStudent(null);
    setStep(2);
  }

  function handleSelectClass(cls: ParentSchoolClassesClassItem) {
    setSelectedClass(cls);
    setSelectedStudent(null);
    setStep(3);
  }

  function handleSelectStudent(student: ParentClassStudentItem) {
    if (!student.can_be_linked) return;
    setSelectedStudent(student);
    setLinkStatusMessage(null);
    setStep(4);
    const token = getToken();
    if (!token) return;
    api.parent
      .checkChildLink(token, student.id)
      .then((res) => setLinkStatusMessage(res.data.link_status.message))
      .catch(() => setLinkStatusMessage(null));
  }

  function handleLink() {
    if (!selectedStudent) return;
    const token = getToken();
    if (!token) return;
    setLinking(true);
    api.parent
      .linkChild(token, selectedStudent.id)
      .then(() => setLinkSuccess(true))
      .catch(() => setLinking(false))
      .finally(() => setLinking(false));
  }

  function resetWizard() {
    setStep(1);
    setSelectedSchool(null);
    setSelectedClass(null);
    setSelectedStudent(null);
    setSearchTerm("");
    setSearchResults([]);
    setClassesByLevel([]);
    setStudents([]);
    setLinkSuccess(false);
    setLinkStatusMessage(null);
  }

  if (!user) return null;
  if (user.role.name !== "parent") return null;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {step === 1 ? (
        <Link
          href="/dashboard/children"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à Mes enfants
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (step === 2) {
              setStep(1);
              setSelectedSchool(null);
            } else if (step === 3) {
              setStep(2);
              setSelectedClass(null);
            } else if (step === 4) {
              setStep(3);
              setSelectedStudent(null);
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      )}

      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
        Lier un enfant à mon compte
      </h1>
      <p className="text-slate-600 mb-8">
        Recherchez l&apos;école, la classe puis l&apos;élève à lier.
      </p>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                step === s.id
                  ? "bg-schoolpay-accent text-white"
                  : step > s.id
                    ? "bg-schoolpay-accent/20 text-schoolpay-accent"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 mx-1 ${step > s.id ? "bg-schoolpay-accent/50" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Search school */}
      {step === 1 && (
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-6">
          <label htmlFor="school-search" className="block text-sm font-medium text-slate-700 mb-2">
            Rechercher une école
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="school-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom ou adresse de l'école..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
              autoFocus
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {searchResults.length === 0 && !searchLoading
              ? searchTerm.trim()
                ? "Aucune école trouvée"
                : "Saisissez au moins 2 caractères"
              : `${searchResults.length} école(s) trouvée(s)`}
          </p>
          <ul className="mt-4 space-y-3 max-h-80 overflow-y-auto">
            {searchResults.map((school) => (
              <li
                key={school.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-schoolpay-accent/50 hover:bg-schoolpay-accent/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{school.name}</p>
                  <p className="text-sm text-slate-500">{school.type}</p>
                  {school.address && (
                    <p className="text-xs text-slate-400 truncate">{school.address}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectSchool(school)}
                  className="shrink-0 px-4 py-2 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover"
                >
                  Sélectionner
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 2: Select class */}
      {step === 2 && selectedSchool && (
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <p className="text-sm font-medium text-slate-500">École sélectionnée</p>
            <p className="font-semibold text-slate-900">{selectedSchool.name}</p>
          </div>
          <div className="p-6">
            {classesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
              </div>
            ) : classesByLevel.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucune classe trouvée.</p>
            ) : (
              <div className="space-y-6">
                {classesByLevel.map((group) => (
                  <div key={group.level}>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">{group.level}</h3>
                    <ul className="space-y-2">
                      {group.classes.map((cls) => (
                        <li
                          key={cls.id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-schoolpay-accent/50 hover:bg-schoolpay-accent/5"
                        >
                          <GraduationCap className="w-5 h-5 text-slate-400 shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{cls.name}</p>
                            <p className="text-sm text-slate-500">{cls.school_year.year_label}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectClass(cls)}
                            className="shrink-0 px-4 py-2 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover"
                          >
                            Voir les élèves
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Select student */}
      {step === 3 && selectedSchool && selectedClass && (
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <p className="text-sm text-slate-500">
              {selectedSchool.name} &gt; {selectedClass.name}
            </p>
          </div>
          <div className="p-6">
            {studentsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-schoolpay-accent animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucun élève dans cette classe.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Élève</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Âge / Naissance</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent font-semibold text-sm">
                              {getInitials(student.full_name)}
                            </div>
                            <span className="font-medium text-slate-900">{student.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-slate-600">{student.student_code}</td>
                        <td className="py-3 text-sm text-slate-500 hidden sm:table-cell">
                          {student.age} ans · {formatBirthDate(student.birth_date)}
                        </td>
                        <td className="py-3">
                          {student.is_linked ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                              Déjà lié
                            </span>
                          ) : student.can_be_linked ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              Disponible
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            disabled={!student.can_be_linked}
                            onClick={() => handleSelectStudent(student)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-schoolpay-accent text-white hover:bg-schoolpay-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <UserPlus className="w-4 h-4" />
                            Sélectionner
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Confirm & link */}
      {step === 4 && selectedStudent && (
        <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-6">
          {linkSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Enfant lié avec succès</h2>
              <p className="text-slate-600 mb-6">
                {selectedStudent.full_name} est maintenant lié à votre compte.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/dashboard/children"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover"
                >
                  Voir mes enfants
                </Link>
                <button
                  type="button"
                  onClick={resetWizard}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Lier un autre enfant
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 mb-4">
                <div className="w-14 h-14 rounded-full bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent font-semibold text-xl shrink-0">
                  {getInitials(selectedStudent.full_name)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{selectedStudent.full_name}</p>
                  <p className="text-sm text-slate-500">{selectedStudent.student_code}</p>
                  <p className="text-sm text-slate-500">
                    {selectedClass?.name} · {selectedSchool?.name}
                  </p>
                </div>
              </div>
              {linkStatusMessage && (
                <p className="text-sm text-slate-600 mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  {linkStatusMessage}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleLink}
                  disabled={linking}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-schoolpay-accent text-white text-sm font-semibold hover:bg-schoolpay-accent-hover disabled:opacity-50"
                >
                  {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Lier cet enfant
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(3); setSelectedStudent(null); }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  Changer d&apos;élève
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
