"use client";

import { motion } from "framer-motion";
import { FileCheck, Users, CreditCard } from "lucide-react";

const steps = [
  {
    icon: FileCheck,
    title: "Configuration",
    description: "L'école définit les frais et les élèves. Simple et rapide.",
  },
  {
    icon: Users,
    title: "Accès parents",
    description: "Les familles voient les frais et paient en toute transparence.",
  },
  {
    icon: CreditCard,
    title: "Suivi et reçus",
    description: "Paiements tracés, reçus téléchargeables, administration sereine.",
  },
];

export default function HowItWorks() {
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
          <p className="section-label">Mise en place</p>
          <h2 className="section-title mb-4">
            Comment ça marche en 3 étapes
          </h2>
          <p className="section-desc">
            Mise en place simple pour les écoles et les familles.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-4xl mx-auto">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              className="relative text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[55%] w-[90%] h-px bg-slate-200" />
              )}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-schoolpay-accent/10 text-schoolpay-accent mb-5 shadow-card">
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="font-display font-semibold text-slate-900 mb-2 tracking-tight">
                {title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
