"use client";
import { motion } from "framer-motion";

const PILLARS = [
  {
    icon: "👩‍🏫",
    title: "Equipo profesional",
    desc: "Educadoras y técnicos titulados con años de experiencia. Un equipo estable que conoce a cada niño por su nombre.",
  },
  {
    icon: "🏡",
    title: "Infraestructura para niños",
    desc: "Instalaciones construidas desde cero para la educación infantil. No es una casa adaptada: es un espacio diseñado para crecer.",
  },
  {
    icon: "❤️",
    title: "Formación integral",
    desc: "Desarrollo cognitivo, emocional y social en equilibrio. Pedagogía lúdica que respeta los ritmos de cada niño.",
  },
  {
    icon: "📍",
    title: "Cercanía y confianza",
    desc: "Ubicado en el centro de Concepción. Comunicación permanente con las familias y puertas abiertas siempre.",
  },
];

export default function ValueProps() {
  return (
    <section className="py-20 bg-[#f8fdfc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[#3d9e8c] text-sm font-semibold uppercase tracking-wider mb-3">
            Por qué elegirnos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Lo que nos hace diferentes
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Cada detalle está pensado para que tu hijo crezca seguro, feliz y
            aprendiendo en un ambiente de confianza.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="text-4xl mb-4">{p.icon}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
