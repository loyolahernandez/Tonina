"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, LogOut, Users, Loader2 } from "lucide-react";

type Lead = {
  id: string;
  nombre_apoderado: string;
  telefono: string;
  nombre_nino: string;
  nivel_interes: string;
  estado: "NUEVO" | "VISITA_AGENDADA" | "VISITA_REALIZADA" | "MATRICULADO" | "PERDIDO";
  created_at: string;
};

const COLUMNAS = [
  { id: "NUEVO", label: "Nuevos (Recibidos)" },
  { id: "VISITA_AGENDADA", label: "Visita Agendada" },
  { id: "VISITA_REALIZADA", label: "Visita Realizada" },
  { id: "MATRICULADO", label: "Matriculado" },
  { id: "PERDIDO", label: "Perdido / No contesta" },
];

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchLeads();
      else setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchLeads();
    });
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setLeads(data as Lead[]);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  const updateLeadStatus = async (id: string, nuevoEstado: string) => {
    // Optimistic UI update
    setLeads(leads.map((l) => (l.id === id ? { ...l, estado: nuevoEstado as any } : l)));

    const { error } = await supabase
      .from("leads")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      alert("Error actualizando estado");
      fetchLeads(); // revert on error
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
              <Users size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Koala CRM - Tía Paz</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors flex justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Koala CRM</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{session.user.email}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-screen-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center mt-20">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            {COLUMNAS.map((columna) => {
              const columnLeads = leads.filter((l) => l.estado === columna.id);
              
              return (
                <div
                  key={columna.id}
                  className="bg-gray-100/50 rounded-xl p-4 min-w-[320px] max-w-[320px] flex-shrink-0 border border-gray-200/60 flex flex-col snap-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const leadId = e.dataTransfer.getData("leadId");
                    if (leadId) updateLeadStatus(leadId, columna.id);
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-700">{columna.label}</h2>
                    <span className="bg-white text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-gray-200">
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[500px]">
                    {columnLeads.length === 0 ? (
                      <div className="h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                        Arrastra un prospecto aquí
                      </div>
                    ) : (
                      columnLeads.map((lead) => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("leadId", lead.id)}
                          className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            {new Date(lead.created_at).toLocaleDateString("es-CL", { day: 'numeric', month: 'short' })}
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1">{lead.nombre_apoderado}</h3>
                          
                          {lead.nombre_nino && (
                            <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-2">
                              <span className="text-xl">👶</span> {lead.nombre_nino} 
                              {lead.nivel_interes && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 rounded">{lead.nivel_interes}</span>}
                            </p>
                          )}

                          <a
                            href={`https://wa.me/${lead.telefono.replace(/\+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-lg text-sm font-semibold transition-colors border border-green-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                            {lead.telefono}
                          </a>
                        </div>
                      ))
                    )}
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
