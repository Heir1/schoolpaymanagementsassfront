"use client";

import { getAvatarUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, Shield, Calendar } from "lucide-react";

const roleLabels: Record<string, string> = {
  superadmin: "Super administrateur",
  school_admin: "Administrateur école",
  parent: "Parent",
};

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const roleLabel = roleLabels[user.role.name] ?? user.role.name;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-8">
        Mon profil
      </h1>

      <div className="rounded-xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent shrink-0 overflow-hidden">
              {getAvatarUrl(user.avatar_url) ? (
                <img
                  src={getAvatarUrl(user.avatar_url)!}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900 tracking-tight">
                {user.full_name}
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">{roleLabel}</p>
            </div>
          </div>
        </div>

        <dl className="divide-y divide-slate-100">
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <User className="w-4 h-4" />
              Nom complet
            </dt>
            <dd className="text-slate-900 font-medium">{user.full_name}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              {user.is_email ? (
                <Mail className="w-4 h-4" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              {user.is_email ? "Email" : "Téléphone"}
            </dt>
            <dd className="text-slate-900">{user.phone_or_email}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Shield className="w-4 h-4" />
              Rôle
            </dt>
            <dd className="text-slate-900">{roleLabel}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Shield className="w-4 h-4 opacity-0" aria-hidden />
              Description du rôle
            </dt>
            <dd className="text-slate-600 text-sm">{user.role.description}</dd>
          </div>
          <div className="px-6 lg:px-8 py-4 flex items-center gap-4">
            <dt className="flex items-center gap-2 text-slate-500 text-sm w-40 shrink-0">
              <Calendar className="w-4 h-4" />
              Membre depuis
            </dt>
            <dd className="text-slate-600 text-sm">
              {new Date(user.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
