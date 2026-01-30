"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  AlertCircle,
  Clock,
  FileQuestion,
  CheckCircle2,
  UserCheck,
  Bell,
  ShieldCheck,
} from "lucide-react";

const before = [
  { icon: BookOpen, text: "Cahiers et carnets papier" },
  { icon: AlertCircle, text: "Litiges sur les paiements" },
  { icon: Clock, text: "Retards de paiement" },
  { icon: FileQuestion, text: "Dossiers élèves incomplets" },
];

const after = [
  { icon: CheckCircle2, text: "Paiements clairs et traçables" },
  { icon: UserCheck, text: "Historique par élève" },
  { icon: Bell, text: "Parents informés" },
  { icon: ShieldCheck, text: "Administration en contrôle" },
];

export default function BeforeAfter() {
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
          <p className="section-label">Comparaison</p>
          <h2 className="section-title mb-4">Avant / Après SchoolPay</h2>
          <p className="section-desc">
            Passez d'une gestion papier à une gestion claire et fiable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto">
          <motion.div
            className="p-8 lg:p-9 rounded-xl bg-white border border-slate-200 shadow-card"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="font-display text-base font-semibold text-slate-700 mb-6 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              Avant SchoolPay
            </h3>
            <ul className="space-y-4">
              {before.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3.5 text-slate-600 text-sm leading-relaxed"
                >
                  <Icon className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="p-8 lg:p-9 rounded-xl bg-white border border-schoolpay-accent/25 shadow-card"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="font-display text-base font-semibold text-schoolpay-accent mb-6 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-schoolpay-accent" />
              Avec SchoolPay
            </h3>
            <ul className="space-y-4">
              {after.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3.5 text-slate-600 text-sm leading-relaxed"
                >
                  <Icon className="w-5 h-5 text-schoolpay-accent shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
