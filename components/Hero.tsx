"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] flex items-center bg-schoolpay-dark overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-schoolpay-dark via-schoolpay-dark-light to-schoolpay-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(13,148,136,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_50%,rgba(13,148,136,0.06),transparent)]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-schoolpay-accent/10 border border-schoolpay-accent/20 text-schoolpay-accent text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ShieldCheck className="w-4 h-4" />
            Plateforme dédiée aux écoles primaires et secondaires
          </motion.div>

          <motion.h1
            className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-[2.75rem] font-bold text-white mb-6 leading-[1.15] tracking-tight"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Gestion sécurisée des frais scolaires pour les écoles
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            SchoolPay est une plateforme sécurisée de gestion et de paiement des
            frais scolaires conçue exclusivement pour les écoles primaires et
            secondaires.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          >
            <Link
              href="#demo"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-lg bg-schoolpay-accent text-white font-semibold shadow-cta hover:bg-schoolpay-accent-hover hover:shadow-cta/90 transition-all duration-200"
            >
              Demander une démo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-lg bg-white/5 text-white font-medium border border-slate-500/60 hover:border-slate-400 hover:bg-white/8 transition-all duration-200"
            >
              Nous contacter pour votre école
              <Mail className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
