"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Rocket, Mail, CheckCircle2, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const BRAND = {
  bg: "#0E1330",
  bgCard: "#141b3d",
  bgCardBorder: "#1e2d5a",
  blue: "#4976FF",
  blueHover: "#3a5edb",
  navy: "#0E1330",
};

export default function LinksPage() {
  const [path, setPath] = useState<"none" | "tonina" | "swell">("none");
  const [toninaData, setToninaData] = useState({ name: "", email: "", phone: "", business: "", bottleneck: "", budget: "" });
  const [swellEmail, setSwellEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isToninaSubmitting, setIsToninaSubmitting] = useState(false);
  const [isToninaSuccess, setIsToninaSuccess] = useState(false);

  const WHATSAPP_NUMBER = "56982091549";

  const handleToninaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsToninaSubmitting(true);
    
    try {
      await supabase.from('tonina_leads').insert([
        { 
          name: toninaData.name,
          email: toninaData.email,
          phone: toninaData.phone,
          business: toninaData.business, 
          bottleneck: toninaData.bottleneck, 
          budget: toninaData.budget 
        }
      ]);
      
      setIsToninaSuccess(true);
      
      setTimeout(() => {
        setPath("none");
        setIsToninaSuccess(false);
        setToninaData({ name: "", email: "", phone: "", business: "", bottleneck: "", budget: "" });
      }, 4000);
      
    } catch (error) {
      console.error("Error guardando lead:", error);
    } finally {
      setIsToninaSubmitting(false);
    }
  };

  const handleSwellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => {
      setPath("none");
      setIsSubscribed(false);
      setSwellEmail("");
    }, 3000);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center py-12 px-4 font-sans"
      style={{ background: BRAND.bg }}
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 w-full max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center shadow-lg"
          style={{ background: BRAND.blue, boxShadow: `0 8px 24px ${BRAND.blue}40` }}
        >
          <img src="/logo-white.svg" alt="Tonina Logo" className="w-10 h-10 object-contain" />
        </div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "#ffffff" }}>
          Tonina
        </h1>
        <p
          className="font-bold uppercase tracking-widest text-xs mt-1"
          style={{ color: BRAND.blue }}
        >
          Software Boutique
        </p>
        <p className="mt-3 leading-relaxed text-sm" style={{ color: "#94a3b8" }}>
          Eliminamos cuellos de botella operativos con automatización y software a medida.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">

        {/* Vista Inicial */}
        {path === "none" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Tarjeta Principal — B2B */}
            <button
              onClick={() => setPath("tonina")}
              className="w-full text-left rounded-2xl p-6 flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 hover:opacity-95 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue} 0%, #2d52c4 100%)`,
                boxShadow: `0 12px 32px ${BRAND.blue}40`,
              }}
            >
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
                style={{ background: "#ffffff", transform: "translate(30%, -30%)" }}
              />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <Building2 size={24} color="#ffffff" />
              </div>
              <h2 className="text-lg font-black tracking-tight" style={{ color: "#ffffff" }}>
                Escalar mi empresa
              </h2>
              <p className="text-sm mt-1" style={{ color: "#bfcfff" }}>
                Diagnóstico gratuito — respondemos en 24 h
              </p>
              <div className="flex items-center gap-1 mt-5 text-sm font-bold" style={{ color: "#ffffff" }}>
                Solicitar diagnóstico <ArrowRight size={16} />
              </div>
            </button>

            {/* Tarjeta Secundaria — Lab */}
            <button
              onClick={() => setPath("swell")}
              className="w-full text-left rounded-2xl p-4 flex items-center cursor-pointer transition-all hover:opacity-80 gap-4"
              style={{
                background: BRAND.bgCard,
                border: `1px solid ${BRAND.bgCardBorder}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: BRAND.bgCardBorder }}
              >
                <Rocket size={18} color={BRAND.blue} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold" style={{ color: "#e2e8f0" }}>
                  Laboratorio &amp; Comunidad
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                  Nuevos productos — Lista de espera
                </p>
              </div>
              <ArrowRight size={16} color="#475569" className="flex-shrink-0" />
            </button>
          </div>
        )}

        {/* Formulario B2B */}
        {path === "tonina" && (
          <form
            onSubmit={handleToninaSubmit}
            className="rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
            style={{ background: "#ffffff" }}
          >
            <button
              type="button"
              onClick={() => setPath("none")}
              className="flex items-center text-sm font-semibold transition-colors mb-5"
              style={{ color: "#94a3b8" }}
            >
              <ArrowLeft size={16} className="mr-1" /> Volver
            </button>

            <h2 className="text-xl font-black mb-1" style={{ color: BRAND.navy }}>
              Hablemos de tu negocio
            </h2>
            
            {isToninaSuccess ? (
              <div className="rounded-xl p-6 flex flex-col items-center text-center gap-4 animate-in fade-in" style={{ background: `${BRAND.blue}10`, border: `1px solid ${BRAND.blue}20` }}>
                <CheckCircle2 size={48} color={BRAND.blue} />
                <div>
                  <h3 className="font-black text-lg mb-1" style={{ color: BRAND.navy }}>Solicitud Recibida</h3>
                  <p className="text-sm font-medium" style={{ color: "#64748b" }}>Nuestro equipo analizará tu caso y te contactaremos en breve.</p>
                </div>
              </div>
            ) : (
            <>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              Cuéntanos lo básico y te enviamos un diagnóstico.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                  Tu nombre
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                  style={{ borderColor: "#e2e8f0", color: BRAND.navy }}
                  placeholder="Ej. Juan Pérez"
                  value={toninaData.name}
                  onChange={(e) => setToninaData({ ...toninaData, name: e.target.value })}
                  onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}33`)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                    Correo
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                    style={{ borderColor: "#e2e8f0", color: BRAND.navy }}
                    placeholder="juan@empresa.com"
                    value={toninaData.email}
                    onChange={(e) => setToninaData({ ...toninaData, email: e.target.value })}
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}33`)}
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                    Teléfono (WhatsApp)
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                    style={{ borderColor: "#e2e8f0", color: BRAND.navy }}
                    placeholder="+569..."
                    value={toninaData.phone}
                    onChange={(e) => setToninaData({ ...toninaData, phone: e.target.value })}
                    onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}33`)}
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                  ¿A qué se dedica tu empresa?
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                  style={{ borderColor: "#e2e8f0", color: BRAND.navy }}
                  placeholder="Ej. Clínica Dental, Constructora..."
                  value={toninaData.business}
                  onChange={(e) => setToninaData({ ...toninaData, business: e.target.value })}
                  onFocus={(e) => (e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}33`)}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                  Mayor cuello de botella
                </label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all bg-white"
                  style={{ borderColor: "#e2e8f0", color: toninaData.bottleneck ? BRAND.navy : "#94a3b8" }}
                  value={toninaData.bottleneck}
                  onChange={(e) => setToninaData({ ...toninaData, bottleneck: e.target.value })}
                >
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="Desorden en ventas por WhatsApp">Desorden en ventas por WhatsApp</option>
                  <option value="Uso excesivo de planillas Excel">Uso excesivo de planillas Excel</option>
                  <option value="Procesos manuales muy lentos">Procesos manuales muy lentos</option>
                  <option value="Otro (Te cuento por chat)">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "#374151" }}>
                  Presupuesto estimado (CLP)
                </label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all bg-white"
                  style={{ borderColor: "#e2e8f0", color: toninaData.budget ? BRAND.navy : "#94a3b8" }}
                  value={toninaData.budget}
                  onChange={(e) => setToninaData({ ...toninaData, budget: e.target.value })}
                >
                  <option value="" disabled>Selecciona un rango</option>
                  <option value="$500k - $1M CLP (MVP rápido)">$500k – $1M (MVP rápido)</option>
                  <option value="$1M - $3M CLP (Sistema Operativo a Medida)">$1M – $3M (Sistema a medida)</option>
                  <option value="+$3M CLP (Infraestructura Completa)">+$3M (Infraestructura)</option>
                  <option value="No lo tengo claro aún">Aún no lo tengo claro</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isToninaSubmitting}
              className="w-full text-white font-black py-4 rounded-xl mt-6 flex items-center justify-center gap-2 transition-opacity hover:opacity-90 shadow-lg disabled:opacity-70"
              style={{
                background: BRAND.blue,
                boxShadow: `0 8px 20px ${BRAND.blue}40`,
              }}
            >
              <MessageCircle size={18} /> {isToninaSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </button>
            <p className="text-center text-xs mt-3" style={{ color: "#94a3b8" }}>
              Te respondemos en menos de 24 horas
            </p>
            </>
            )}
          </form>
        )}

        {/* Formulario Lab / Comunidad */}
        {path === "swell" && (
          <form
            onSubmit={handleSwellSubmit}
            className="rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-300"
            style={{ background: BRAND.bgCard, border: `1px solid ${BRAND.bgCardBorder}` }}
          >
            <button
              type="button"
              onClick={() => setPath("none")}
              className="flex items-center text-sm font-semibold transition-colors mb-6"
              style={{ color: "#64748b" }}
            >
              <ArrowLeft size={16} className="mr-1" /> Volver
            </button>

            <h2 className="text-xl font-black mb-2" style={{ color: "#ffffff" }}>
              Laboratorio (Lista de Espera)
            </h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              Únete para recibir actualizaciones de los nuevos productos.
            </p>

            {isSubscribed ? (
              <div
                className="rounded-xl p-4 flex items-center gap-3 animate-in fade-in"
                style={{ background: "#064e3b20", border: "1px solid #065f4620" }}
              >
                <CheckCircle2 size={24} color="#34d399" />
                <span className="font-bold" style={{ color: "#34d399" }}>
                  ¡Estás dentro! Te avisaremos pronto.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: "#cbd5e1" }}>
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      size={18}
                      color="#475569"
                    />
                    <input
                      required
                      type="email"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all"
                      style={{
                        background: BRAND.bgCardBorder,
                        borderColor: "#1e3a5f",
                        color: "#ffffff",
                      }}
                      placeholder="tu@correo.com"
                      value={swellEmail}
                      onChange={(e) => setSwellEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full font-black py-4 rounded-xl mt-2 flex items-center justify-center gap-2 transition-colors shadow-lg hover:opacity-90"
                  style={{ background: "#10b981", color: BRAND.navy }}
                >
                  Unirme a la lista <ArrowRight size={18} />
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs font-medium" style={{ color: "#334155" }}>
        © {new Date().getFullYear()} Tonina. Todos los derechos reservados.
      </div>
    </div>
  );
}
