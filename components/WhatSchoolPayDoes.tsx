"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  Settings,
  Receipt,
  History,
  Users,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: UserPlus,
    title: "Inscription des élèves",
    description: "Gérez les dossiers élèves de façon simple et centralisée.",
  },
  {
    icon: Settings,
    title: "Configuration des frais",
    description: "Définissez les frais scolaires par niveau ou par type.",
  },
  {
    icon: Receipt,
    title: "Suivi des paiements",
    description: "Paiements clairs et traçables pour l'école et les parents.",
  },
  {
    icon: History,
    title: "Reçus et historique",
    description: "Consultez et téléchargez les reçus et l'historique des paiements.",
  },
  {
    icon: Users,
    title: "Accès par rôle",
    description: "Directeur, comptable, enseignant et parents : chacun voit ce qui le concerne.",
  },
  {
    icon: Shield,
    title: "Sécurité des données",
    description: "Vos données et celles des familles sont protégées.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function WhatSchoolPayDoes() {
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
          <p className="section-label">Fonctionnalités</p>
          <h2 className="section-title mb-4">Ce que fait SchoolPay</h2>
          <p className="section-desc">
            Une solution simple pour gérer les frais scolaires et rassurer les
            familles.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={item}
              className="group p-6 lg:p-7 rounded-xl bg-slate-50/80 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300/80 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-schoolpay-accent/10 flex items-center justify-center mb-5 text-schoolpay-accent group-hover:bg-schoolpay-accent/15 transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-2 tracking-tight">
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
