"use client";

import { api } from "@/lib/api";
import { School } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    try {
      await api.registerParent({
        full_name: fullName.trim(),
        phone_or_email: phoneOrEmail.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'inscription.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-schoolpay-accent/10 flex items-center justify-center mx-auto mb-4 text-schoolpay-accent">
          <School className="w-6 h-6" />
        </div>
        <h1 className="font-display text-lg font-bold text-slate-900 mb-2">
          Inscription réussie
        </h1>
        <p className="text-slate-600 text-sm mb-4">
          Vous pouvez maintenant vous connecter avec vos identifiants.
        </p>
        <p className="text-slate-500 text-sm">Redirection vers la connexion…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200/80 shadow-card p-8">
      <div className="flex items-center gap-2.5 mb-8">
        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-schoolpay-accent/10 text-schoolpay-accent">
          <School className="w-5 h-5" />
        </span>
        <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
          SchoolPay
        </span>
      </div>

      <h1 className="font-display text-xl font-bold text-slate-900 mb-2 tracking-tight">
        Inscription parent
      </h1>
      <p className="text-slate-600 text-sm mb-6">
        Créez un compte pour suivre les frais scolaires de vos enfants.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Nom complet
          </label>
          <input
            id="full_name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="ex: Jean Dupont"
          />
        </div>

        <div>
          <label htmlFor="phone_or_email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email ou téléphone
          </label>
          <input
            id="phone_or_email"
            type="text"
            autoComplete="username"
            value={phoneOrEmail}
            onChange={(e) => setPhoneOrEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="ex: contact@exemple.fr"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirmer le mot de passe
          </label>
          <input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-lg bg-schoolpay-accent text-white font-semibold shadow-cta hover:bg-schoolpay-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {submitting ? "Inscription…" : "S'inscrire"}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600 text-sm">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-schoolpay-accent hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
