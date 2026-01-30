"use client";

import { motion } from "framer-motion";
import { FileCheck, ClipboardList, UserCog, Lock } from "lucide-react";

const points = [
  {
    icon: FileCheck,
    title: "Historique et traçabilité des paiements",
    description: "Chaque paiement est enregistré et consultable.",
  },
  {
    icon: ClipboardList,
    title: "Journaux d'audit",
    description: "Les actions importantes sont tracées pour la transparence.",
  },
  {
    icon: UserCog,
    title: "Accès par rôle (directeur, comptable)",
    description: "Chacun accède uniquement à ce dont il a besoin.",
  },
  {
    icon: Lock,
    title: "Gestion sécurisée des données",
    description: "Vos données et celles des familles sont protégées.",
  },
];

export default function SecurityResponsibility() {
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
          <p className="section-label">Confiance</p>
          <h2 className="section-title mb-4">Sécurité et responsabilité</h2>
          <p className="section-desc">
            Nous prenons la confiance des écoles et des familles au sérieux.
            Langage simple et rassurant.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          {points.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              className="group p-6 rounded-xl bg-slate-50/80 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300/80 transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="w-11 h-11 rounded-xl bg-schoolpay-accent/10 flex items-center justify-center mb-4 text-schoolpay-accent group-hover:bg-schoolpay-accent/15 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-slate-900 mb-2 text-sm leading-snug">
                {title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
