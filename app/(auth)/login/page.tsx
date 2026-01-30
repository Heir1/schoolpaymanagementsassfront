"use client";

import { useAuth } from "@/contexts/AuthContext";
import { School } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { user, loading, error, login, clearError } = useAuth();
  const router = useRouter();
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    clearError();
  }, [phoneOrEmail, password, clearError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(phoneOrEmail.trim(), password);
      router.replace("/dashboard");
    } catch {
      // Error is set in context
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-schoolpay-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-600 text-sm">Chargement…</p>
      </div>
    );
  }

  if (user) {
    return null;
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
        Connexion
      </h1>
      <p className="text-slate-600 text-sm mb-6">
        Connectez-vous pour accéder à votre espace.
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
            placeholder="ex: contact@ecole.fr"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-schoolpay-accent focus:border-schoolpay-accent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-lg bg-schoolpay-accent text-white font-semibold shadow-cta hover:bg-schoolpay-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {submitting ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600 text-sm">
        Vous êtes parent ?{" "}
        <Link href="/register" className="font-medium text-schoolpay-accent hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
