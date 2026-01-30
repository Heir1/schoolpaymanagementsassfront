"use client";

import { motion } from "framer-motion";
import { Eye, History, Download, Handshake, BadgeCheck } from "lucide-react";

const features = [
  { icon: Eye, text: "Voir les frais scolaires" },
  { icon: History, text: "Consulter l'historique des paiements" },
  { icon: Download, text: "Télécharger les reçus" },
  { icon: Handshake, text: "Moins de conflits avec l'école" },
];

export default function TransparencyParents() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-section mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-label">Pour les familles</p>
          <h2 className="section-title mb-4">Transparence pour les parents</h2>
          <p className="section-desc">
            Les familles ont accès à toutes les informations dont elles ont
            besoin, en toute sérénité.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {features.map(({ icon: Icon, text }) => (
            <motion.div
              key={text}
              className="flex items-center gap-4 p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 shadow-card hover:shadow-card transition-shadow duration-300"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-11 h-11 rounded-lg bg-schoolpay-accent/10 flex items-center justify-center text-schoolpay-accent">
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700 text-sm">{text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-stretch max-w-3xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1 p-6 rounded-xl bg-slate-50/80 border border-slate-200/80 shadow-card">
            <div className="text-xs font-semibold text-schoolpay-accent mb-2 uppercase tracking-section">
              Carte parent
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Accès aux frais, historique et reçus de vos enfants.
            </p>
          </div>
          <div className="flex-1 p-6 rounded-xl bg-slate-50/80 border border-slate-200/80 shadow-card">
            <div className="text-xs font-semibold text-schoolpay-accent mb-2 uppercase tracking-section">
              Carte élève
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Suivi des paiements par élève, visible par l'école et le parent.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-schoolpay-accent/10 text-schoolpay-accent font-semibold text-sm border border-schoolpay-accent/20 shadow-card">
            <BadgeCheck className="w-4 h-4" />
            Paiement validé
          </span>
        </motion.div>
      </div>
    </section>
  );
}
