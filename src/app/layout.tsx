import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "WALLBOX — Faites travailler votre argent | Jusqu'à 15% / jour",
  description:
    "WALLBOX : plateforme d'investissement énergie. Plans de 8% à 15% par jour, parrainage 3 niveaux 10% / 5% / 2%, retraits Mobile Money en 15 minutes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#060b08] text-white antialiased">{children}</body>
    </html>
  );
}
