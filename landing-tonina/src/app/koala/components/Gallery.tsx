"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const IMAGES = [
  {
    src: "/koala/header5.jpg",
    alt: "Actividades en el jardín Koala",
    span: "col-span-1 row-span-2",
  },
  {
    src: "/koala/nuestro_espacio2-ea504cf3-502f-405f-8b3a-a5db6693fb85.png",
    alt: "Niños jugando en el patio",
    span: "col-span-1",
  },
  {
    src: "/koala/nuestro_espacio3-8e35e3e4-07c9-4547-b1a5-02f2f903d91a.png",
    alt: "Sala para bebés",
    span: "col-span-1",
  },
  {
    src: "/koala/header3.jpg",
    alt: "Instalaciones del jardín",
    span: "col-span-2",
  },
  {
    src: "/koala/nuestro_espacio4-089c9712-496e-4485-9275-df34efc83e08.png",
    alt: "Presentación de niños",
    span: "col-span-1",
  },
  {
    src: "/koala/nuestro_espacio5-7d07ed53-9c75-468c-b459-67d03e4bcbf5.png",
    alt: "Celebraciones en el jardín",
    span: "col-span-1",
  },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section id="espacio" className="py-20 bg-[#f8fdfc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[#3d9e8c] text-sm font-semibold uppercase tracking-wider mb-3">
            Nuestro espacio
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Un lugar pensado para aprender jugando
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Salas amplias, patios interiores y exteriores, materiales
            didácticos y rincones preparados para cada etapa.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[200px]">
          {IMAGES.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`relative rounded-xl overflow-hidden cursor-pointer group ${img.span}`}
              onClick={() => setLightbox(img.src)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="relative max-w-4xl w-full max-h-[80vh] aspect-video">
            <Image
              src={lightbox}
              alt="Vista ampliada"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </section>
  );
}
