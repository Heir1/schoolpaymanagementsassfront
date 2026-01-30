"use client";

import { motion } from "framer-motion";
import { Wifi, CheckCircle } from "lucide-react";

export default function OfflineFriendly() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-section mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-schoolpay-accent/10 text-schoolpay-accent mb-8 shadow-card">
            <Wifi className="w-8 h-8" />
          </div>
          <p className="section-label">Connectivité</p>
          <h2 className="section-title mb-4">
            Conçu pour les connexions limitées
          </h2>
          <p className="section-desc mb-8">
            Conçu pour fonctionner même avec une connexion Internet limitée.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-white border border-slate-200/80 text-slate-600 text-sm font-medium shadow-card">
              <Wifi className="w-4 h-4 text-schoolpay-accent" />
              Icône faible réseau
            </span>
            <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-white border border-slate-200/80 text-slate-600 text-sm font-medium shadow-card">
              <CheckCircle className="w-4 h-4 text-schoolpay-accent" />
              Validation locale
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
