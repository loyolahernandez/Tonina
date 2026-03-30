"use client";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "Mis hijos fueron felices en Koala. Siempre encontramos cariño, contención y una comunicación muy cercana con el equipo.",
    author: "Marcela R.",
    role: "Mamá de ex alumnos",
    avatar: "👩",
    stars: 5,
  },
  {
    quote:
      "Destaco la estabilidad del equipo y el ambiente familiar. Siento que realmente conocen a cada niño y niña. La Tía Paz siempre disponible.",
    author: "Rodrigo M.",
    role: "Papá de sala cuna",
    avatar: "👨",
    stars: 5,
  },
  {
    quote:
      "Para nosotros fue fundamental el enfoque en el desarrollo emocional y el respeto por los ritmos individuales. Son un jardín muy diferente.",
    author: "Camila V.",
    role: "Mamá de jardín infantil",
    avatar: "👩‍👧",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonios" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[#3d9e8c] text-sm font-semibold uppercase tracking-wider mb-3">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestras familias
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            La confianza de nuestras familias es el corazón del proyecto
            educativo Koala.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-[#f8fdfc] rounded-2xl p-6 border border-[#e0f5f0] hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <svg
                    key={si}
                    className="w-4 h-4 text-amber-400 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-gray-700 leading-relaxed text-sm mb-5">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e0f5f0] flex items-center justify-center text-xl">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {t.author}
                  </div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Social proof bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100">
            🏡 Más de 20 familias nuevas se sumaron al Jardín Koala este año
          </p>
        </motion.div>
      </div>
    </section>
  );
}
