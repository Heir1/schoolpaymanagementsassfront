"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-schoolpay-dark border-t border-slate-700/50 relative"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-schoolpay-accent/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          <div>
            <h3 className="font-display font-bold text-white text-lg mb-4 tracking-tight">
              SchoolPay
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Solution dédiée aux écoles primaires et secondaires.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4 uppercase tracking-section">
              Contact
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-3 text-slate-400 hover:text-slate-300 transition-colors">
                <Mail className="w-4 h-4 shrink-0 text-schoolpay-accent/80" />
                contact@schoolpay.example.com
              </li>
              <li className="flex items-center gap-3 text-slate-400 hover:text-slate-300 transition-colors">
                <Phone className="w-4 h-4 shrink-0 text-schoolpay-accent/80" />
                +XXX XX XX XX XX
              </li>
              <li className="flex items-center gap-3 text-slate-400 hover:text-slate-300 transition-colors">
                <MapPin className="w-4 h-4 shrink-0 text-schoolpay-accent/80" />
                Adresse (placeholder)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4 uppercase tracking-section">
              Liens utiles
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#demo"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Demander une démo
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4 uppercase tracking-section">
              Mentions légales
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Mentions légales (placeholder)</li>
              <li>Politique de confidentialité (placeholder)</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-slate-700/60 text-center text-sm text-slate-500">
          <p>
            Solution dédiée aux écoles primaires et secondaires. © SchoolPay.
          </p>
        </div>
      </div>
    </footer>
  );
}
