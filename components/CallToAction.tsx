"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, School } from "lucide-react";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section id="demo" className="py-20 sm:py-28 bg-schoolpay-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(13,148,136,0.08),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-section mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
            Prêt à simplifier la gestion des frais de votre école ?
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Des CTA orientés école, sans jargon startup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-lg bg-schoolpay-accent text-white font-semibold shadow-cta hover:bg-schoolpay-accent-hover hover:shadow-cta/90 transition-all duration-200"
            >
              Demander une démonstration
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-lg bg-white/5 text-white font-medium border border-slate-500/60 hover:border-slate-400 hover:bg-white/8 transition-all duration-200"
            >
              Contacter notre équipe
              <Mail className="w-4 h-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-lg bg-transparent text-white font-medium border border-slate-500/60 hover:border-slate-400 hover:bg-white/5 transition-all duration-200"
            >
              Déployer SchoolPay dans mon école
              <School className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
