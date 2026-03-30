"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const WHATSAPP_URL =
  "https://wa.me/56982091551?text=Hola,%20me%20gustaría%20saber%20más%20sobre%20los%20programas%20del%20jardín.";

const PROGRAMS = [
  {
    image: "/koala/card_salacuna.jpg",
    age: "0 – 2 años",
    title: "Sala Cuna",
    desc: "Espacio cálido y seguro para los más pequeños. Atención cercana, estimulación temprana y rutinas que acompañan el desarrollo de tu bebé.",
    benefits: [
      "Estimulación temprana personalizada",
      "Rutinas estables y contenedoras",
      "Atención afectiva prioritaria",
      "Comunicación diaria con los papás",
    ],
    color: "from-orange-400 to-amber-500",
    badge: "🍼",
  },
  {
    image: "/koala/card_jardin.JPG",
    age: "2 – 4 años",
    title: "Jardín Infantil",
    desc: "Propuesta pedagógica basada en el juego, el descubrimiento y el desarrollo socioemocional. Un espacio para aprender siendo niño.",
    benefits: [
      "Aprendizaje a través del juego",
      "Desarrollo del lenguaje y socialización",
      "Actividades creativas y artísticas",
      "Preparación para la escuela",
    ],
    color: "from-[#3d9e8c] to-teal-500",
    badge: "🌱",
  },
  {
    image: "/koala/card_after.JPG",
    age: "Edad escolar",
    title: "After School",
    desc: "Acompañamiento después de clases con apoyo en tareas, colación y actividades recreativas en un ambiente de confianza familiar.",
    benefits: [
      "Apoyo en tareas escolares",
      "Colación incluida",
      "Actividades recreativas",
      "Horario extendido hasta las 19:00",
    ],
    color: "from-blue-400 to-indigo-500",
    badge: "📚",
  },
];

export default function Programs() {
  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[#3d9e8c] text-sm font-semibold uppercase tracking-wider mb-3">
            Niveles y servicios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Acompañamos cada etapa de tu hijo
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Tres modalidades pensadas para las necesidades de cada familia, con
            un enfoque pedagógico lúdico y respetuoso.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {PROGRAMS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Age badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="bg-white/95 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    {p.badge} {p.age}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {p.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {p.desc}
                </p>

                {/* Benefits */}
                <ul className="space-y-2 mb-6 flex-1">
                  {p.benefits.map((b, bi) => (
                    <li
                      key={bi}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#f0faf8] flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-2.5 h-2.5 text-[#3d9e8c]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full text-center py-2.5 px-4 rounded-xl border-2 border-[#3d9e8c] text-[#3d9e8c] font-semibold text-sm hover:bg-[#3d9e8c] hover:text-white transition-all duration-200"
                >
                  Consultar cupos
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
