import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tonina | Software a Medida para Empresas",
  description:
    "Tonina es una fábrica de software boutique. Automatizamos operaciones y construimos soluciones digitales a medida para que tu empresa crezca.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
