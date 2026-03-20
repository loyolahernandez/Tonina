"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Rocket, Mail, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function LinksPage() {
  const [path, setPath] = useState<'none' | 'tonina' | 'swell'>('none');
  const [toninaData, setToninaData] = useState({ name: "", business: "", bottleneck: "" });
  const [swellEmail, setSwellEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Reemplazar con el número real
  const WHATSAPP_NUMBER = "569XXXXXXXX";

  const handleToninaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hola Nacho, soy ${toninaData.name}. Mi negocio es sobre ${toninaData.business} y mi mayor cuello de botella actual es: ${toninaData.bottleneck}. Me gustaría evaluar cómo el software a medida puede ayudarme.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, "_blank");
  };

  const handleSwellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí luego conectaremos Supabase. Por ahora, simulamos el éxito.
    setIsSubscribed(true);
    setTimeout(() => {
      setPath('none');
      setIsSubscribed(false);
      setSwellEmail("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      
      {/* Perfil Header */}
      <div className="flex flex-col items-center text-center mb-10 w-full max-w-md">
        <div className="w-24 h-24 bg-slate-200 rounded-full mb-4 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center text-slate-400 text-3xl font-black">
          {/* Si tienes una foto, puedes usar <Image src="/foto.jpg" ... /> aquí */}
          NL
        </div>
        <h1 className="text-2xl font-black text-slate-900">Nacho Loyola</h1>
        <p className="text-slate-500 font-medium">@nacho.puravida</p>
        <p className="mt-4 text-slate-700 leading-relaxed text-sm">
          Construyo software a medida para escalar negocios. <br/>
          Documentando el proceso en público.
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        
        {/* Vista Inicial (Botones) */}
        {path === 'none' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setPath('tonina')}
              className="w-full bg-white border border-slate-200 hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all rounded-2xl p-6 flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Escalar mi empresa</h2>
              <p className="text-sm text-slate-500">Diagnóstico para software B2B y automatización</p>
            </button>

            <button
              onClick={() => setPath('swell')}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-transparent transition-all rounded-2xl p-6 flex flex-col items-center text-center group cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 text-white"
            >
              <div className="w-12 h-12 bg-slate-800 text-emerald-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Rocket size={24} />
              </div>
              <h2 className="text-lg font-bold mb-1">Comunidad & Swell</h2>
              <p className="text-sm text-slate-400">Únete a la lista de espera (Build in Public)</p>
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
            <h2 className="text-xl font-black mb-2 text-white">Swell (Lista de Espera)</h2>
            <p className="text-sm text-slate-400 mb-6">Únete a la lista para recibir actualizaciones de mis proyectos de software y negocios.</p>
            
            {isSubscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-400 animate-in fade-in">
                <CheckCircle2 size={24} />
                <span className="font-bold">¡Estás dentro! Te avisaré pronto.</span>
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
      
      {/* Footer minimalista */}
      <div className="mt-12 text-center text-xs text-slate-400 font-medium">
        Construido por Tonina Software © {new Date().getFullYear()}
      </div>
    </div>
  );
}