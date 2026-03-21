"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Rocket, Mail, CheckCircle2, Code2 } from "lucide-react";

export default function LinksPage() {
  const [path, setPath] = useState<'none' | 'tonina' | 'swell'>('none');
  const [toninaData, setToninaData] = useState({ name: "", business: "", bottleneck: "" });
  const [swellEmail, setSwellEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Número actualizado
  const WHATSAPP_NUMBER = "56982091549";

  const handleToninaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola equipo de Tonina, soy ${toninaData.name}. Mi negocio es sobre ${toninaData.business} y mi mayor cuello de botella actual es: ${toninaData.bottleneck}. Me gustaría evaluar cómo el software a medida puede ayudarme.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, "_blank");
  };

  const handleSwellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => {
      setPath('none');
      setIsSubscribed(false);
      setSwellEmail("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      
      {/* Perfil Header Corporativo */}
      <div className="flex flex-col items-center text-center mb-10 w-full max-w-md">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl mb-5 shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white">
          <Code2 size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tonina</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-2">Software Boutique</p>
        <p className="mt-4 text-slate-600 leading-relaxed font-medium">
          Eliminamos cuellos de botella y escalamos operaciones tradicionales con automatización y software a medida.
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        
        {/* Vista Inicial (Botones) */}
        {path === 'none' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tarjeta Tonina (B2B) - Diseño Premium */}
            <button
              onClick={() => setPath('tonina')}
              className="w-full bg-gradient-to-br from-indigo-900 to-slate-900 hover:from-indigo-800 hover:to-slate-800 text-white transition-all rounded-2xl p-6 flex flex-col items-center text-center group cursor-pointer shadow-xl shadow-indigo-900/20 border border-indigo-700/50 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="w-14 h-14 bg-white/10 text-indigo-300 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-white/20 group-hover:text-white backdrop-blur-sm">
                <Building2 size={28} />
              </div>
              <h2 className="text-xl font-black mb-1 tracking-tight">Escalar mi empresa</h2>
              <p className="text-sm text-indigo-200 font-medium">Diagnóstico para software B2B y automatización</p>
            </button>

            {/* Tarjeta Swell / Lab - Diseño Secundario y limpio */}
            <button
              onClick={() => setPath('swell')}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-2xl p-6 flex flex-col items-center text-center group cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 text-slate-800"
            >
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Rocket size={24} />
              </div>
              <h2 className="text-lg font-bold mb-1 text-slate-900">Laboratorio & Comunidad</h2>
              <p className="text-sm text-slate-500">Nuevos productos en público (Lista de espera)</p>
            </button>
          </div>
        )}

        {/* Formulario Tonina (B2B) */}
        {path === 'tonina' && (
          <form onSubmit={handleToninaSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-300">
            <button type="button" onClick={() => setPath('none')} className="text-slate-400 hover:text-slate-600 mb-6 flex items-center text-sm font-semibold transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Volver
            </button>
            <h2 className="text-xl font-black mb-6 text-slate-900">Hablemos de tu negocio</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tu Nombre</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="Ej. Juan Pérez" value={toninaData.name} onChange={e => setToninaData({...toninaData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">¿De qué trata tu empresa?</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="Ej. Clínica Dental, Constructora..." value={toninaData.business} onChange={e => setToninaData({...toninaData, business: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">¿Cuál es tu mayor cuello de botella?</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none bg-white transition-all text-slate-700" value={toninaData.bottleneck} onChange={e => setToninaData({...toninaData, bottleneck: e.target.value})}>
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="Desorden en ventas por WhatsApp">Desorden en ventas por WhatsApp</option>
                  <option value="Uso excesivo de planillas Excel">Uso excesivo de planillas Excel</option>
                  <option value="Procesos manuales muy lentos">Procesos manuales muy lentos</option>
                  <option value="Otro (Te cuento por chat)">Otro (Te cuento por chat)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl mt-8 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/30">
              Ir a WhatsApp <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Formulario Swell / Comunidad */}
        {path === 'swell' && (
          <form onSubmit={handleSwellSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-300">
            <button type="button" onClick={() => setPath('none')} className="text-slate-400 hover:text-white mb-6 flex items-center text-sm font-semibold transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Volver
            </button>
            <h2 className="text-xl font-black mb-2 text-white">Laboratorio (Lista de Espera)</h2>
            <p className="text-sm text-slate-400 mb-6">Únete a la lista para recibir actualizaciones de los nuevos productos que estamos construyendo.</p>
            
            {isSubscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-400 animate-in fade-in">
                <CheckCircle2 size={24} />
                <span className="font-bold">¡Estás dentro! Te avisaremos pronto.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input required type="email" className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="tu@correo.com" value={swellEmail} onChange={e => setSwellEmail(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-black py-4 rounded-xl mt-6 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                  Unirme a la lista <ArrowRight size={18} />
                </button>
              </div>
            )}
          </form>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} Tonina. Todos los derechos reservados.
      </div>
    </div>
  );
}