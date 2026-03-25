"use client";

import { CheckCircle2, Database, Rocket, TrendingUp, Users } from "lucide-react";

const BRAND = {
  bg: "#0E1330",
  bgCard: "#141b3d",
  bgCardBorder: "#1e2d5a",
  blue: "#4976FF",
  blueLight: "#EBF0FF",
  blueMid: "#7A9DFF",
  blueText: "#AABCFF",
  navy: "#0E1330",
};

export default function Home() {
  return (
    <div className="min-h-screen font-sans" style={{ background: BRAND.bg, color: "#ffffff" }}>

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: `${BRAND.bg}ee`, borderColor: BRAND.bgCardBorder, backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: BRAND.blue, boxShadow: `0 4px 14px ${BRAND.blue}50` }}
            >
              <img src="/logo-white.svg" alt="Tonina Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tight" style={{ color: "#ffffff" }}>Tonina</span>
          </div>
          <nav className="hidden md:flex gap-8 font-semibold" style={{ color: "#94a3b8" }}>
            <a href="#soluciones" className="transition-colors hover:opacity-80">Soluciones</a>
            <a href="#caso-koala" className="transition-colors hover:opacity-80">Casos Reales</a>
            <a href="#metodo" className="transition-colors hover:opacity-80">El Método</a>
          </nav>
          <a
            href="https://wa.me/56982091549?text=Hola,%20quisiera%20evaluar%20un%20proyecto%20de%20software%20con%20Tonina."
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 rounded-full font-bold transition-all hover:opacity-90"
            style={{
              background: BRAND.blue,
              color: "#ffffff",
              boxShadow: `0 4px 14px ${BRAND.blue}40`,
            }}
          >
            Diagnóstico Gratuito
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <p
          className="font-bold uppercase tracking-widest text-xs mb-6"
          style={{ color: BRAND.blue }}
        >
          Software Boutique
        </p>
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight" style={{ color: "#ffffff" }}>
          Construimos{" "}
          <span style={{ color: BRAND.blue }}>Software a Medida</span>{" "}
          para empresas que quieren crecer.
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: "#94a3b8" }}>
          No vendemos líneas de código. Entendemos tu negocio tradicional, eliminamos los cuellos de botella y automatizamos tu operación para multiplicar tus ventas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/56982091549?text=Hola,%20quisiera%20evaluar%20un%20proyecto%20de%20software%20con%20Tonina."
            target="_blank"
            rel="noreferrer"
            className="text-lg px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            style={{
              background: BRAND.blue,
              color: "#ffffff",
              boxShadow: `0 8px 24px ${BRAND.blue}40`,
            }}
          >
            Hablar con un Experto
          </a>
          <a
            href="#caso-koala"
            className="text-lg px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:opacity-80"
            style={{
              background: BRAND.bgCard,
              color: "#e2e8f0",
              border: `1px solid ${BRAND.bgCardBorder}`,
            }}
          >
            Ver Casos Reales <TrendingUp size={20} />
          </a>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y py-12" style={{ borderColor: BRAND.bgCardBorder, background: BRAND.bgCard }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold tracking-widest uppercase mb-8" style={{ color: "#475569" }}>
            Diseñado para resultados de negocio
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {['Ventas B2B', 'Operaciones', 'Educación', 'Retail Offline', 'Logística'].map((ind) => (
              <span key={ind} className="text-2xl font-black" style={{ color: "#334155" }}>
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study: Koala */}
      <section id="caso-koala" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          className="rounded-[2.5rem] overflow-hidden shadow-2xl"
          style={{ background: BRAND.bgCard, border: `1px solid ${BRAND.bgCardBorder}` }}
        >
          <div className="grid lg:grid-cols-2">
            <div className="p-12 md:p-16 lg:p-20 flex flex-col justify-center">
              <span
                className="font-bold tracking-widest uppercase mb-4 block text-sm"
                style={{ color: BRAND.blueMid }}
              >
                Caso de Éxito Destacado
              </span>
              <h2 className="text-4xl font-black mb-6 leading-tight" style={{ color: "#ffffff" }}>
                Jardín Infantil Koala
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: BRAND.blueText }}>
                Reemplazamos un botón genérico de WhatsApp que perdía contactos, por un CRM Kanban hecho a medida y conectado a un Chatbot Inteligente.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Captura de Leads 24/7 sin intervención manual.",
                  "Enrutamiento directo a Base de Datos Segura.",
                  "Tablero de gestión (Kanban) para la Directora.",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium text-lg" style={{ color: "#C9D6FF" }}>
                    <CheckCircle2 size={24} color="#34d399" className="shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://jardinkoala.cl"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl font-bold w-fit transition-opacity hover:opacity-90"
                style={{ background: BRAND.blue, color: "#ffffff" }}
              >
                Ver Landing en Vivo →
              </a>
            </div>
            <div
              className="p-8 lg:p-12 relative flex items-center justify-center border-l"
              style={{ borderColor: BRAND.bgCardBorder }}
            >
              {/* CRM Mockup */}
              <div className="w-full max-w-md bg-slate-100 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold">K</div>
                  <div className="font-bold" style={{ color: "#27314D" }}>Koala CRM</div>
                </div>
                <div className="p-4 flex gap-4 overflow-x-auto">
                  <div className="w-64 bg-slate-200/50 rounded-xl p-3 shrink-0">
                    <div className="font-bold text-slate-700 mb-3 text-sm">Nuevos (Recibidos)</div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-2">
                      <div className="font-bold text-sm" style={{ color: "#27314D" }}>Ignacio Loyola</div>
                      <div className="text-xs text-slate-500 mt-1">Sala Cuna • +56 9 82...</div>
                    </div>
                  </div>
                  <div className="w-64 bg-slate-200/50 rounded-xl p-3 shrink-0">
                    <div className="font-bold text-slate-700 mb-3 text-sm">Visita Agendada</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section id="soluciones" className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: BRAND.bgCard }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4" style={{ color: "#ffffff" }}>¿Por qué Tonina?</h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
              La tecnología debe quitarte dolores de cabeza, no sumar complejidad.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Rocket size={32} />,
                title: "Despliegue Rápido (MVPs)",
                desc: "Lanzamos la primera versión funcional en días, no en meses. Validamos tu idea de negocio en el mercado real inmediatamente."
              },
              {
                icon: <Database size={32} />,
                title: "Infraestructura Segura",
                desc: "Usamos el stack de las empresas más grandes (Next.js, PostgreSQL) pero lo adaptamos al presupuesto de tu negocio."
              },
              {
                icon: <Users size={32} />,
                title: "Orientado al ROI",
                desc: "No sobre-ingenierizamos. Construimos exactamente lo que necesitas para automatizar procesos y cerrar más ventas."
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl hover:-translate-y-1 transition-transform"
                style={{
                  background: BRAND.bg,
                  border: `1px solid ${BRAND.bgCardBorder}`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: `${BRAND.blue}20`, color: BRAND.blue }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#ffffff" }}>{feature.title}</h3>
                <p className="leading-relaxed" style={{ color: "#94a3b8" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="py-20 px-4 text-center" style={{ background: BRAND.bg, borderTop: `1px solid ${BRAND.bgCardBorder}` }}>
        <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ color: "#ffffff" }}>
          ¿Listo para digitalizar tu negocio?
        </h2>
        <p className="mb-10 text-lg max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
          Agenda una videollamada de 30 minutos. Te diremos con total honestidad si podemos ayudarte y cuánto costaría.
        </p>
        <a
          href="https://wa.me/56982091549?text=Hola,%20quisiera%20evaluar%20un%20proyecto%20de%20software%20con%20Tonina."
          target="_blank"
          rel="noreferrer"
          className="text-lg px-8 py-4 rounded-xl font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2 w-fit mx-auto"
          style={{
            background: BRAND.blue,
            color: "#ffffff",
            boxShadow: `0 8px 24px ${BRAND.blue}40`,
          }}
        >
          Conversar por WhatsApp
        </a>
        <p className="mt-12 text-xs font-medium" style={{ color: "#334155" }}>
          © {new Date().getFullYear()} Tonina. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
