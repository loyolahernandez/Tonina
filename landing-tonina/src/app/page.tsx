"use client";

import { CheckCircle2, Code2, Database, Rocket, TrendingUp, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-\[#0E1330\]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-\[#4976FF\] rounded-lg flex items-center justify-center text-white">
              <img src="/logo-white.svg" alt="Tonina Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-2xl font-black text-\[#0E1330\] tracking-tight">Tonina</span>
          </div>
          <nav className="hidden md:flex gap-8 font-semibold text-slate-600">
            <a href="#soluciones" className="hover:text-\[#4976FF\] transition-colors">Soluciones</a>
            <a href="#caso-koala" className="hover:text-\[#4976FF\] transition-colors">Casos Reales</a>
            <a href="#metodo" className="hover:text-\[#4976FF\] transition-colors">El Método</a>
          </nav>
          <a
            href="https://wa.me/569XXXXXXXX?text=Hola,%20quisiera%20evaluar%20un%20proyecto%20de%20software%20con%20Tonina."
            target="_blank"
            rel="noreferrer"
            className="bg-\[#4976FF\] hover:bg-\[#3a5edb\] text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-\[#4976FF\]/30"
          >
            Diagnóstico Gratuito
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black text-\[#0E1330\] mb-8 leading-tight tracking-tight text-balance">
          Construimos <span className="text-\[#4976FF\]">Software a Medida</span> para empresas que quieren crecer.
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          No vendemos líneas de código. Entendemos tu negocio tradicional, eliminamos los cuellos de botella y automatizamos tu operación para multiplicar tus ventas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/569XXXXXXXX?text=Hola,%20quisiera%20evaluar%20un%20proyecto%20de%20software%20con%20Tonina."
            target="_blank"
            rel="noreferrer"
            className="bg-\[#0E1330\] hover:bg-\[#27314D\] text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-\[#0E1330\]/20 flex items-center justify-center gap-2"
          >
            Hablar con un Experto
          </a>
          <a
            href="#caso-koala"
            className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 text-lg px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            Ver Casos Reales <TrendingUp size={20} />
          </a>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-8">
            Diseñado para resultados de negocio
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {['Ventas B2B', 'Operaciones', 'Educación', 'Retail Offline', 'Logística'].map((ind) => (
              <span key={ind} className="text-2xl font-black text-slate-300">
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study: Koala */}
      <section id="caso-koala" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-\[#0E1330\] rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-2">
            <div className="p-12 md:p-16 lg:p-20 text-white flex flex-col justify-center">
              <span className="text-indigo-300 font-bold tracking-widest uppercase mb-4 block">
                Caso de Éxito Destacado
              </span>
              <h2 className="text-4xl font-black mb-6 leading-tight">
                Jardín Infantil Koala
              </h2>
              <p className="text-lg text-indigo-200 mb-8 leading-relaxed">
                Reemplazamos un botón genérico de WhatsApp que perdía contactos, por un CRM Kanban hecho a medida y conectado a un Chatbot Inteligente. 
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Captura de Leads 24/7 sin intervención manual.",
                  "Enrutamiento directo a Base de Datos Segura.",
                  "Tablero de gestión (Kanban) para la Directora.",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-indigo-100">
                    <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
                    <span className="font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://jardinkoala.cl"
                target="_blank"
                rel="noreferrer"
                className="bg-white text-\[#0E1330\] px-6 py-3 rounded-xl font-bold w-fit hover:bg-indigo-50 transition-colors"
              >
                Ver Landing en Vivo →
              </a>
            </div>
            <div className="bg-\[#0E1330\] p-8 lg:p-12 relative flex items-center justify-center border-l border-indigo-800">
              {/* Fake UI mockup for the CRM */}
              <div className="w-full max-w-md bg-slate-100 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded flex items-center justify-center">K</div>
                  <div className="font-bold text-\[#27314D\]">Koala CRM</div>
                </div>
                <div className="p-4 flex gap-4 overflow-x-auto">
                  <div className="w-64 bg-slate-200/50 rounded-xl p-3 shrink-0">
                    <div className="font-bold text-slate-700 mb-3 text-sm">Nuevos (Recibidos)</div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-2">
                      <div className="font-bold text-sm text-\[#27314D\]">Ignacio Loyola</div>
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
      <section id="soluciones" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-\[#0E1330\] mb-4">¿Por qué Tonina?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
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
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 bg-indigo-50 text-\[#4976FF\] rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-\[#0E1330\] mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="bg-\[#0E1330\] text-white py-20 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-6">¿Listo para digitalizar tu negocio?</h2>
        <p className="text-slate-400 mb-10 text-lg max-w-2xl mx-auto">
          Agenda una videollamada de 30 minutos. Te diremos con total honestidad si podemos ayudarte y cuánto costaría.
        </p>
        <a
          href="https://wa.me/569XXXXXXXX?text=Hola,%20quisiera%20evaluar%20un%20proyecto%20de%20software%20con%20Tonina."
          target="_blank"
          rel="noreferrer"
          className="bg-\[#4976FF\] hover:bg-\[#5a83ff\] text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 w-fit mx-auto"
        >
          Conversar por WhatsApp
        </a>
      </footer>
    </div>
  );
}
