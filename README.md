# SchoolPay — Landing Page

Landing page professionnelle pour **SchoolPay**, plateforme sécurisée de gestion et de paiement des frais scolaires pour les écoles primaires et secondaires.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide Icons**

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Configuration (authentification)

Copier `.env.local.example` en `.env.local` et définir l’URL de l’API backend :

```bash
cp .env.local.example .env.local
# Éditer .env.local : NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Authentification

- **Connexion** : `/login` — email/téléphone + mot de passe, token stocké (localStorage), redirection vers `/dashboard`.
- **Inscription parent** : `/register` — formulaire public, puis redirection vers `/login`.
- **Routes protégées** : `/dashboard` et sous-routes — accès réservé aux utilisateurs connectés, sinon redirection vers `/login`.
- **Rôles** : superadmin, school_admin, parent — affichage conditionnel (header landing : « Tableau de bord » si connecté, « Connexion » / « S’inscrire » sinon).
- **Déconnexion** : bouton dans le header du dashboard, appel API logout puis redirection vers `/login`.

## Build

```bash
npm run build
npm start
```

## Structure des sections (landing)

1. Hero — titre, phrase stratégique, CTA
2. Ce que fait SchoolPay — fonctionnalités avec icônes
3. Avant / Après SchoolPay — comparaison visuelle
4. Transparence pour les parents — cartes parent/élève, badge « Paiement validé »
5. Vue d’ensemble simple — indicateurs (frais attendus, collectés, etc.)
6. Sécurité et responsabilité — traçabilité, rôles, données
7. Connexions limitées — message offline / faible connectivité
8. Comment ça marche en 3 étapes (bonus)
9. CTA — démonstration, contact, déploiement
10. Footer — contact, mentions légales, texte dédié écoles primaires/secondaires

Solution dédiée aux écoles primaires et secondaires.
