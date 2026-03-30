"use client";
import { motion } from "framer-motion";

const STATS = [
  { num: "30+", label: "años de experiencia" },
  { num: "150+", label: "familias acompañadas" },
  { num: "3", label: "niveles de enseñanza" },
  { num: "07:30", label: "a 19:00 · Concepción" },
];

export default function StatsBar() {
  return (
    <div className="bg-[#3d9e8c] text-white py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/20">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center px-4"
            >
              <div className="text-3xl font-bold">{s.num}</div>
              <div className="text-sm text-white/80 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
