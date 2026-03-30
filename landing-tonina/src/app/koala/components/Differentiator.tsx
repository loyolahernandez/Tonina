"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const FEATURES = [
  {
    icon: "🏗️",
    title: "Construido para educar",
    desc: "No adaptamos una casa: construimos pensando en niños. Cada rincón tiene un propósito pedagógico.",
  },
  {
    icon: "🛡️",
    title: "Seguridad de principio a fin",
    desc: "Salidas de emergencia, pisos antideslizantes, mobiliario a escala y espacios supervisados en todo momento.",
  },
  {
    icon: "🎨",
    title: "Espacios que invitan a aprender",
    desc: "Salas luminosas, patios exteriores, rincones de juego y áreas de descanso pensados para cada etapa.",
  },
  {
    icon: "🌿",
    title: "Ambiente sano y acogedor",
    desc: "Materiales naturales, iluminación natural y un diseño que promueve el bienestar y la calma.",
  },
];

export default function Differentiator() {
  return (
    <section className="py-20 bg-[#1a2e2b] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-[#4bb5a2] text-sm font-semibold uppercase tracking-wider mb-4">
              Nuestro diferenciador
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-snug mb-5">
              Infraestructura diseñada{" "}
              <span className="text-[#4bb5a2]">exclusivamente</span> para la
              educación infantil
            </h2>
            <p className="text-white/70 leading-relaxed mb-8">
              Mientras muchos jardines funcionan en casas adaptadas, en Koala
              construimos desde los cimientos pensando en tus hijos. Cada metro
              cuadrado fue diseñado para garantizar seguridad, estimulación y
              bienestar.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="bg-white/8 rounded-xl p-4 border border-white/10"
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    {f.title}
                  </h3>
                  <p className="text-white/55 text-xs leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Images grid */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              "/koala/nuestro_espacio2-ea504cf3-502f-405f-8b3a-a5db6693fb85.png",
              "/koala/nuestro_espacio3-8e35e3e4-07c9-4547-b1a5-02f2f903d91a.png",
              "/koala/nuestro_espacio4-089c9712-496e-4485-9275-df34efc83e08.png",
              "/koala/nuestro_espacio5-7d07ed53-9c75-468c-b459-67d03e4bcbf5.png",
            ].map((src, i) => (
              <div
                key={i}
                className={`relative rounded-xl overflow-hidden ${
                  i === 0 ? "aspect-[4/3]" : "aspect-square"
                }`}
              >
                <Image
                  src={src}
                  alt={`Espacio Koala ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
