"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Phone, Building2, Wallet, AlertCircle, Clock, CheckCircle2, XCircle, ArrowRight, ArrowLeft } from "lucide-react";

type Lead = {
  id: string;
  created_dt: string;
  name: string;
  email: string;
  phone: string;
  business: string;
  bottleneck: string;
  budget: string;
  status: 'nuevo' | 'contactado' | 'negociacion' | 'cerrado';
};

const COLUMNS = [
  { id: 'nuevo', title: 'Nuevos Leads', color: 'border-blue-500', bg: 'bg-blue-50' },
  { id: 'contactado', title: 'Contactados', color: 'border-yellow-500', bg: 'bg-yellow-50' },
  { id: 'negociacion', title: 'En Negociación', color: 'border-purple-500', bg: 'bg-purple-50' },
  { id: 'cerrado', title: 'Cerrados', color: 'border-emerald-500', bg: 'bg-emerald-50' }
] as const;

export default function CRM() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded simple protection (Change in production)
  const ADMIN_PIN = "2026"; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PIN) {
      setIsAuthenticated(true);
      fetchLeads();
    } else {
      alert("PIN incorrecto");
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tonina_leads")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
    } else {
      // Normalize legacy leads without status
      const normalizedLeads = (data || []).map(lead => ({
        ...lead,
        status: lead.status || 'nuevo'
      }));
      setLeads(normalizedLeads);
    }
    setLoading(false);
  };

  const moveLead = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus as Lead['status'] } : lead));
    
    // Update DB
    const { error } = await supabase
      .from("tonina_leads")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (error) {
      console.error("Error updating lead status:", error);
      fetchLeads(); // Revert on error
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    // Limpiar el número (quitar +, espacios, etc)
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hola ${name}, soy Nacho de Tonina. Recibí tu solicitud para evaluar software a medida en tu negocio. ¿Tienes disponibilidad para una videollamada corta esta semana?`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E1330] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#141b3d] p-8 rounded-2xl border border-[#1e2d5a] max-w-sm w-full shadow-2xl">
          <div className="w-16 h-16 bg-[#4976FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <img src="/logo-white.svg" alt="Tonina" className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white text-center mb-6">Acceso CRM</h1>
          <input
            type="password"
            placeholder="PIN de acceso"
            className="w-full px-4 py-3 rounded-xl bg-[#0E1330] border border-[#27314D] text-white focus:ring-2 focus:ring-[#4976FF] outline-none mb-4 text-center text-xl tracking-widest"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-[#4976FF] hover:bg-[#3a5edb] text-white font-bold py-3 rounded-xl transition-colors">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Navbar CRM */}
      <header className="bg-[#0E1330] text-white h-16 flex items-center justify-between px-6 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4976FF] rounded-lg flex items-center justify-center">
            <img src="/logo-white.svg" alt="Tonina" className="w-5 h-5" />
          </div>
          <span className="font-black text-lg tracking-tight">Tonina <span className="text-slate-400 font-medium">| Pipeline de Ventas</span></span>
        </div>
        <button onClick={fetchLeads} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors bg-white/10 px-4 py-2 rounded-lg">
          Actualizar Tablero
        </button>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 font-bold animate-pulse">
            Cargando base de datos...
          </div>
        ) : (
          <div className="flex gap-6 h-full items-start min-w-max">
            {COLUMNS.map((column, colIndex) => {
              const columnLeads = leads.filter(l => l.status === column.id);
              return (
                <div key={column.id} className="w-80 bg-slate-200/50 rounded-2xl flex flex-col shrink-0 max-h-full">
                  {/* Column Header */}
                  <div className={`p-4 border-t-4 ${column.color} bg-white rounded-t-2xl shadow-sm flex items-center justify-between shrink-0`}>
                    <h3 className="font-black text-slate-800">{column.title}</h3>
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold">
                      {columnLeads.length}
                    </span>
                  </div>

                  {/* Column Body (Cards) */}
                  <div className="p-3 overflow-y-auto flex-1 space-y-3">
                    {columnLeads.length === 0 && (
                      <div className="text-center p-4 text-sm text-slate-400 font-medium border-2 border-dashed border-slate-300 rounded-xl">
                        Sin leads
                      </div>
                    )}
                    {columnLeads.map((lead) => (
                      <div key={lead.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group flex flex-col gap-3">
                        {/* Header Tarjeta */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 leading-tight">{lead.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{lead.created_dt ? new Date(lead.created_dt).toLocaleDateString() : 'Nuevo'}</p>
                          </div>
                          <button 
                            onClick={() => openWhatsApp(lead.phone, lead.name)}
                            className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                            title="Hablar por WhatsApp"
                          >
                            <Phone size={16} />
                          </button>
                        </div>

                        {/* Info Negocio */}
                        <div className="space-y-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="flex items-start gap-2 text-slate-700">
                            <Building2 size={16} className="shrink-0 mt-0.5 text-[#4976FF]" />
                            <span className="font-semibold line-clamp-1" title={lead.business}>{lead.business}</span>
                          </div>
                          <div className="flex items-start gap-2 text-slate-600">
                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-orange-500" />
                            <span className="line-clamp-2 text-xs" title={lead.bottleneck}>{lead.bottleneck}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 font-bold mt-1">
                            <Wallet size={16} className="text-emerald-500" />
                            <span className="text-xs">{lead.budget || 'Sin definir'}</span>
                          </div>
                        </div>

                        {/* Botones de Acción (Mover Tarjeta) */}
                        <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          {colIndex > 0 ? (
                            <button 
                              onClick={() => moveLead(lead.id, COLUMNS[colIndex - 1].id)}
                              className="text-slate-400 hover:text-[#4976FF] text-xs font-semibold flex items-center gap-1"
                            >
                              <ArrowLeft size={14} /> Atrás
                            </button>
                          ) : <div />}
                          
                          {colIndex < COLUMNS.length - 1 ? (
                            <button 
                              onClick={() => moveLead(lead.id, COLUMNS[colIndex + 1].id)}
                              className="text-slate-400 hover:text-[#4976FF] text-xs font-semibold flex items-center gap-1"
                            >
                              Avanzar <ArrowRight size={14} />
                            </button>
                          ) : <div />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}