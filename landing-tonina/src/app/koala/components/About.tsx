"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-[#3d9e8c] text-sm font-semibold uppercase tracking-wider mb-3">
              Nuestra historia
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-snug mb-5">
              Más de tres décadas acompañando a las familias
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Jardín Infantil y Sala Cuna Koala es un proyecto familiar que por
              más de 30 años ha acompañado a niños y niñas de Concepción en sus
              primeros pasos, con un equipo profesional estable y cercano.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Nuestros valores son el cariño, el respeto, la educación integral
              y el desarrollo emocional, en estrecha alianza con cada familia.
              Creemos que los primeros años son el cimiento de toda una vida.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#f0faf8] flex items-center justify-center text-2xl flex-shrink-0">
                🐨
              </div>
              <div>
                <div className="font-semibold text-gray-900">Tía Paz</div>
                <div className="text-sm text-gray-500">Directora del jardín</div>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
              <Image
                src="/koala/nuestra_historia-1628d914-91ae-4ad2-bd27-21ed9d5c5386.png"
                alt="Niños del Jardín Koala compartiendo"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-100">
              <div className="text-2xl">🏆</div>
              <div>
                <div className="text-sm font-bold text-gray-900">30+ años</div>
                <div className="text-xs text-gray-500">de trayectoria</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
