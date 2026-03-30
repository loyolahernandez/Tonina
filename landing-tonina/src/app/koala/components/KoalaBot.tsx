"use client";
import { useState, useEffect, useRef } from "react";

// Supabase credentials (public anon key — safe for frontend)
const SUPABASE_URL = "https://qzwsgodolcvzldbgaggq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3Nnb2RvbGN2emxkYmdhZ2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTk4MTcsImV4cCI6MjA4OTE3NTgxN30.GIg_c9jIf5jG4Qrr1kVPWy7nt6ONbNEgu3-Wem6QLLA";

type FormState = "idle" | "submitting" | "success" | "error";

interface FormData {
  nombre_apoderado: string;
  telefono: string;
  nombre_nino: string;
  nivel_interes: string;
}

export default function KoalaBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserHiding, setTeaserHiding] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm] = useState<FormData>({
    nombre_apoderado: "",
    telefono: "",
    nombre_nino: "",
    nivel_interes: "",
  });
  const [primerNombre, setPrimerNombre] = useState("");
  const autoOpenRef = useRef(false);

  // Teaser after 2s, auto-open after 5s
  useEffect(() => {
    const teaserTimer = setTimeout(() => {
      if (!autoOpenRef.current) setShowTeaser(true);
    }, 2000);

    const autoTimer = setTimeout(() => {
      autoOpenRef.current = true;
      setShowTeaser(false);
      setIsOpen(true);
    }, 5000);

    return () => {
      clearTimeout(teaserTimer);
      clearTimeout(autoTimer);
    };
  }, []);

  // Hide teaser after 3.8s
  useEffect(() => {
    if (!showTeaser) return;
    const timer = setTimeout(() => {
      setTeaserHiding(true);
      setTimeout(() => {
        setShowTeaser(false);
        setTeaserHiding(false);
      }, 300);
    }, 3800);
    return () => clearTimeout(timer);
  }, [showTeaser]);

  const openBot = () => {
    autoOpenRef.current = true;
    setShowTeaser(false);
    setIsOpen(true);
  };

  const closeBot = () => setIsOpen(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState === "submitting") return;
    setFormState("submitting");

    const firstName = form.nombre_apoderado.trim().split(" ")[0];
    setPrimerNombre(firstName);

    const data = {
      nombre_apoderado: form.nombre_apoderado.trim(),
      telefono: form.telefono.trim(),
      nombre_nino: form.nombre_nino.trim(),
      nivel_interes: form.nivel_interes || "No especificado",
      estado: "NUEVO",
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`API ${res.status}`);
      }

      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  const waMsg = encodeURIComponent(
    `Hola Tía Paz, soy ${form.nombre_apoderado}. Acabo de dejar mis datos en la página del jardín y me gustaría saber más sobre el nivel ${form.nivel_interes || "que ofrecen"}.`
  );

  return (
    <div className="fixed bottom-6 right-6 z-[1100]" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Chat window */}
      <div
        className={`absolute bottom-20 right-0 w-[345px] max-w-[calc(100vw-36px)] bg-white rounded-[22px] shadow-2xl border border-black/5 overflow-hidden flex flex-col transition-all duration-250 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-3 pointer-events-none"
        }`}
        style={{ maxHeight: "520px" }}
      >
        {/* Header */}
        <div
          className="px-4 py-3.5 flex items-center justify-between gap-2"
          style={{
            background: "linear-gradient(135deg, #ff9a1a 0%, #ff6a00 100%)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/35 flex items-center justify-center text-xl flex-shrink-0">
              🐨
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white leading-tight">
                Tía Paz · Directora
              </h3>
              <p className="text-[11px] text-white/85 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] inline-block" />
                Jardín Infantil Koala
              </p>
            </div>
          </div>
          <button
            onClick={closeBot}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors text-base leading-none flex-shrink-0"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 bg-[#fafafa] overflow-y-auto flex-1">
          {formState === "success" ? (
            <div className="text-center py-2">
              <span className="text-5xl block mb-3">🎉</span>
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">
                ¡Listo, {primerNombre}!
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                Tus datos quedaron guardados. La Tía Paz te escribirá hoy para
                mostrarte el jardín y confirmar tu cupo.
              </p>
              <a
                href={`https://wa.me/56982091551?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20b858] text-white font-extrabold px-5 py-3 rounded-xl text-sm transition-all shadow-md"
              >
                <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 448 512">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
                Escribir ahora por WhatsApp
              </a>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 text-sm text-gray-700 leading-relaxed mb-3.5 border border-gray-100 shadow-sm">
                ¡Hola! Estoy con los niños en este momento 🌟 Deja tus datos y
                te escribo en el día para mostrarte el jardín y revisar si hay
                cupos disponibles.
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                <input
                  type="text"
                  name="nombre_apoderado"
                  placeholder="Tu nombre"
                  required
                  autoComplete="name"
                  value={form.nombre_apoderado}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-white text-gray-900 placeholder-gray-400 focus:border-[#ff8a00] focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Tu celular (+569...)"
                  required
                  autoComplete="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-white text-gray-900 placeholder-gray-400 focus:border-[#ff8a00] focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <input
                  type="text"
                  name="nombre_nino"
                  placeholder="Nombre de tu hijo/a"
                  required
                  value={form.nombre_nino}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-white text-gray-900 placeholder-gray-400 focus:border-[#ff8a00] focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <select
                  name="nivel_interes"
                  required
                  value={form.nivel_interes}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-gray-200 text-sm outline-none bg-white text-gray-900 focus:border-[#ff8a00] focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
                >
                  <option value="" disabled>
                    ¿Qué nivel te interesa?
                  </option>
                  <option value="Sala Cuna">Sala Cuna (0–2 años)</option>
                  <option value="Jardín Infantil">
                    Jardín Infantil (2–4 años)
                  </option>
                  <option value="After School">After School</option>
                </select>

                {formState === "error" && (
                  <p className="text-xs text-red-500 text-center">
                    Hubo un problema. Por favor intenta de nuevo.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="py-3.5 rounded-xl font-extrabold text-[14.5px] text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background:
                      formState === "submitting"
                        ? "#d1d5db"
                        : "linear-gradient(135deg, #4bb5a2 0%, #379483 100%)",
                    boxShadow:
                      formState === "submitting"
                        ? "none"
                        : "0 4px 14px rgba(75, 181, 162, 0.32)",
                  }}
                >
                  {formState === "submitting"
                    ? "Guardando..."
                    : "Guardar mi lugar →"}
                </button>
                <p className="text-[11.5px] text-gray-400 text-center">
                  🔒 Tus datos son privados. Solo te contactamos nosotros.
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Teaser tooltip */}
      {showTeaser && (
        <div
          className={`absolute bottom-[76px] right-0 bg-white rounded-[14px] rounded-br-none px-4 py-2.5 text-[13.5px] font-bold text-gray-800 shadow-lg border border-black/5 whitespace-nowrap transition-all duration-300 ${
            teaserHiding ? "opacity-0 translate-y-1.5" : "opacity-100 translate-y-0"
          }`}
        >
          ¿Hay cupos disponibles? 🐨
          {/* Arrow */}
          <span
            className="absolute -bottom-[5px] right-5 w-2.5 h-2.5 bg-white border-r border-b border-black/5 rotate-45"
            style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
          />
        </div>
      )}

      {/* Bubble button */}
      <button
        onClick={isOpen ? closeBot : openBot}
        aria-label="Abrir chat"
        className={`relative w-[62px] h-[62px] rounded-full text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${
          isOpen ? "" : "animate-[koala-pulse_2.4s_ease-in-out_infinite]"
        }`}
        style={{
          background: "linear-gradient(140deg, #ff9a1a 0%, #ff6a00 100%)",
          boxShadow: "0 6px 20px rgba(255, 106, 0, 0.35)",
        }}
      >
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white text-[10px] font-extrabold text-white flex items-center justify-center leading-none">
            1
          </span>
        )}
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            <path d="M15.8 9.2a2.5 2.5 0 0 0-3.5 0l-.3.4-.3-.4a2.5 2.5 0 1 0-3.6 3.5l3.9 3.9 3.9-3.9a2.5 2.5 0 0 0 0-3.5Z" />
          </svg>
        )}
      </button>

      <style jsx global>{`
        @keyframes koala-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(255, 138, 0, 0.55), 0 6px 20px rgba(255, 106, 0, 0.35); }
          70%  { box-shadow: 0 0 0 18px rgba(255, 138, 0, 0), 0 6px 20px rgba(255, 106, 0, 0.35); }
          100% { box-shadow: 0 0 0 0 rgba(255, 138, 0, 0), 0 6px 20px rgba(255, 106, 0, 0.35); }
        }
      `}</style>
    </div>
  );
}
