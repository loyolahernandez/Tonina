"use client";
import { motion } from "framer-motion";

const WHATSAPP_URL =
  "https://wa.me/56982091551?text=Hola%20Directora%2C%20quisiera%20más%20información%20y%20agendar%20una%20visita%20al%20Jardín%20Koala.";

export default function ContactSection() {
  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-[#3d9e8c] text-sm font-semibold uppercase tracking-wider mb-3">
              Contacto
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-snug">
              Estamos cerca tuyo
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Ubicados en el centro de Concepción, con fácil acceso en
              transporte público y en vehículo particular.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                {
                  icon: "📍",
                  label: "Dirección",
                  val: "Janequeo 647, Concepción",
                },
                { icon: "📞", label: "Teléfono", val: "41 2244831" },
                { icon: "✉️", label: "Correo", val: "jardinkoala@yahoo.es" },
                {
                  icon: "🕐",
                  label: "Horario",
                  val: "Lunes a viernes, 07:30 a 19:00 hrs.",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">
                    {item.icon}
                  </span>
                  <div>
                    <span className="text-xs text-[#3d9e8c] font-semibold uppercase tracking-wider block mb-0.5">
                      {item.label}
                    </span>
                    <span className="text-gray-800 font-medium">{item.val}</span>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20b858] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 448 512">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
              Escribir por WhatsApp
            </a>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-80 lg:h-full min-h-[320px]"
          >
            <iframe
              title="Mapa Jardín Infantil Koala"
              src="https://www.google.com/maps?q=Janequeo+647,+Concepci%C3%B3n,+Chile&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "320px" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
