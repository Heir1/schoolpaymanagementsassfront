"use client";

import { motion } from "framer-motion";
import { TrendingUp, Wallet, Scale, UserCheck } from "lucide-react";

const indicators = [
  {
    icon: Wallet,
    label: "Frais attendus",
    value: "100 %",
    sub: "visibilité",
    iconBg: "bg-schoolpay-accent/10",
    iconColor: "text-schoolpay-accent",
  },
  {
    icon: TrendingUp,
    label: "Montant collecté",
    value: "Suivi",
    sub: "en temps réel",
    iconBg: "bg-schoolpay-accent/10",
    iconColor: "text-schoolpay-accent",
  },
  {
    icon: Scale,
    label: "Reste à payer",
    value: "Clair",
    sub: "par élève",
    iconBg: "bg-slate-200/80",
    iconColor: "text-slate-700",
  },
  {
    icon: UserCheck,
    label: "Élèves à jour",
    value: "Liste",
    sub: "à jour",
    iconBg: "bg-schoolpay-accent/10",
    iconColor: "text-schoolpay-accent",
  },
];

export default function SimpleDataViz() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-section mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-label">Indicateurs</p>
          <h2 className="section-title mb-4">Vue d&apos;ensemble simple</h2>
          <p className="section-desc">
            Pas de tableau de bord complexe : des chiffres lisibles et des
            indicateurs calmes.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          {indicators.map(({ icon: Icon, label, value, sub, iconBg, iconColor }) => (
            <motion.div
              key={label}
              className="group p-6 rounded-xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300/80 transition-all duration-300"
              whileHover={{ y: -3 }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="font-display text-2xl font-bold text-slate-900 mb-1 tracking-tight">
                {value}
              </div>
              <div className="text-sm font-medium text-slate-600">{label}</div>
              <div className="text-xs text-slate-500 mt-1">{sub}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className="text-center text-slate-500 text-sm mt-12 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Graphiques simples, grands chiffres lisibles, couleurs apaisantes.
          L&apos;essentiel sans le superflu.
        </motion.p>
      </div>
    </section>
  );
}
