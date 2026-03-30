import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jardín Infantil Koala · Más de 30 años educando con amor en Concepción",
  description:
    "Sala Cuna, Jardín Infantil y After School en Concepción. Más de 30 años acompañando a las familias con un equipo profesional estable. Contáctanos y asegura el cupo de tu hijo.",
  keywords: "jardín infantil Concepción, sala cuna Concepción, after school, jardín koala",
  openGraph: {
    title: "Jardín Infantil Koala",
    description: "Más de 30 años educando con amor en Concepción",
    type: "website",
  },
};

export default function KoalaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      {children}
    </div>
  );
}
