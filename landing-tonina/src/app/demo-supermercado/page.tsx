"use client";

import { useState } from "react";
import { Store, ShoppingBag, TrendingUp, Users, CheckCircle2, Clock, Truck, MessageCircle } from "lucide-react";

export default function SupermarketDemo() {
  const [activeTab, setActiveTab] = useState<'pedidos' | 'reportes'>('pedidos');

  const pedidos = [
    { id: '#1042', name: 'Sra. Carmen', items: '2x Leche Sur, 1kg Pan, Huevos', total: '$8.500', time: 'Hace 5 min', source: 'WhatsApp Bot', status: 'nuevo' },
    { id: '#1041', name: 'Don Pedro', items: 'Asado Carnicero, Bebida 3L, Carbón', total: '$24.900', time: 'Hace 15 min', source: 'WhatsApp Bot', status: 'preparando' },
    { id: '#1040', name: 'Familia Rojas', items: 'Abarrotes del mes (15 items)', total: '$85.000', time: 'Hace 1 hora', source: 'App Web', status: 'listo' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Header Corporativo (Marca Blanca) */}
      <header className="bg-emerald-700 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-emerald-700 rounded-lg flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black leading-tight">Supermercado Mario</h1>
            <p className="text-emerald-200 text-xs font-medium">Sistema de Operaciones v1.0 (Demo Tonina)</p>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="hidden md:flex bg-emerald-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('pedidos')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'pedidos' ? 'bg-white text-emerald-800 shadow' : 'text-emerald-100 hover:text-white'}`}
          >
            Pedidos Online
          </button>
          <button 
            onClick={() => setActiveTab('reportes')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'reportes' ? 'bg-white text-emerald-800 shadow' : 'text-emerald-100 hover:text-white'}`}
          >
            Reporte Diario
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Pestaña: Pedidos (El MVP del Bot) */}
        {activeTab === 'pedidos' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-800">Canal de Ventas Automatizado</h2>
              <p className="text-slate-500">Los clientes piden por WhatsApp a la IA, y los pedidos caen aquí ordenados para tu equipo de bodega.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Columna 1 */}
              <div className="bg-slate-200/50 rounded-2xl flex flex-col h-[600px]">
                <div className="p-4 border-t-4 border-blue-500 bg-white rounded-t-2xl shadow-sm flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageCircle size={18} className="text-blue-500"/> Nuevos (Entrando)</h3>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">1</span>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto">
                  {pedidos.filter(p => p.status === 'nuevo').map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-black text-slate-800">{p.id}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium flex items-center gap-1"><Clock size={12}/> {p.time}</span>
                      </div>
                      <p className="font-bold text-slate-700">{p.name}</p>
                      <div className="bg-slate-50 p-2 rounded text-sm text-slate-600 my-2">{p.items}</div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Origen: {p.source}</span>
                        <span className="font-black text-slate-800">{p.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna 2 */}
              <div className="bg-slate-200/50 rounded-2xl flex flex-col h-[600px]">
                <div className="p-4 border-t-4 border-yellow-500 bg-white rounded-t-2xl shadow-sm flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingBag size={18} className="text-yellow-500"/> Armando Caja</h3>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold">1</span>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto">
                  {pedidos.filter(p => p.status === 'preparando').map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-black text-slate-800">{p.id}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium flex items-center gap-1"><Clock size={12}/> {p.time}</span>
                      </div>
                      <p className="font-bold text-slate-700">{p.name}</p>
                      <div className="bg-slate-50 p-2 rounded text-sm text-slate-600 my-2">{p.items}</div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Origen: {p.source}</span>
                        <span className="font-black text-slate-800">{p.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna 3 */}
              <div className="bg-slate-200/50 rounded-2xl flex flex-col h-[600px]">
                <div className="p-4 border-t-4 border-emerald-500 bg-white rounded-t-2xl shadow-sm flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><Truck size={18} className="text-emerald-500"/> Listo para Retiro</h3>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold">1</span>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto">
                  {pedidos.filter(p => p.status === 'listo').map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500 opacity-70">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-black text-slate-800">{p.id}</span>
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Pagado</span>
                      </div>
                      <p className="font-bold text-slate-700">{p.name}</p>
                      <p className="text-sm text-slate-500 truncate">{p.items}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: Reportes (El Dashboard del Dueño) */}
        {activeTab === 'reportes' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Reporte del Dueño (Tiempo Real)</h2>
                <p className="text-slate-500">Conectado a tu sistema de cajas para darte visibilidad total en tu celular.</p>
              </div>
              <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 font-bold text-slate-700 outline-none">
                <option>Hoy</option>
                <option>Esta Semana</option>
                <option>Este Mes</option>
              </select>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 text-slate-500 font-bold mb-2">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={20}/></div>
                  Ventas Totales
                </div>
                <div className="text-3xl font-black text-slate-900">$1.450.900</div>
                <div className="text-sm text-emerald-600 font-bold mt-2">+12% vs ayer</div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 text-slate-500 font-bold mb-2">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShoppingBag size={20}/></div>
                  Tickets Emitidos
                </div>
                <div className="text-3xl font-black text-slate-900">342</div>
                <div className="text-sm text-blue-600 font-bold mt-2">Ticket prom: $4.240</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 text-slate-500 font-bold mb-2">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users size={20}/></div>
                  Canal Online (Bot)
                </div>
                <div className="text-3xl font-black text-slate-900">$245.000</div>
                <div className="text-sm text-purple-600 font-bold mt-2">18 Pedidos procesados por IA</div>
              </div>
            </div>

            {/* Falso Gráfico y Top Productos */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6">Tendencia de Ventas (Horas)</h3>
                <div className="h-48 flex items-end gap-2">
                  {[40, 60, 30, 80, 100, 70, 90, 50].map((h, i) => (
                    <div key={i} className="flex-1 bg-emerald-100 hover:bg-emerald-500 rounded-t-md transition-colors relative group" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${h * 15}k
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 border-t border-slate-100 pt-2">
                  <span>08:00</span>
                  <span>14:00</span>
                  <span>20:00</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Top Productos que más rotan (IA)</h3>
                <div className="space-y-4">
                  {[
                    {name: 'Pan Hallulla', uds: '145 kg', stock: 'Bajo (Alerta)'},
                    {name: 'Coca Cola 3L', uds: '84 uds', stock: 'Normal'},
                    {name: 'Leche Colún Entera', uds: '56 uds', stock: 'Normal'},
                    {name: 'Huevos Bandeja x30', uds: '32 uds', stock: 'Crítico (Reponer)'},
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">{i+1}</div>
                        <span className="font-bold text-slate-700">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">{p.uds}</div>
                        <div className={`text-xs font-bold ${p.stock.includes('Alerta') || p.stock.includes('Crítico') ? 'text-red-500' : 'text-emerald-500'}`}>
                          {p.stock}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navegación Móvil */}
      <div className="md:hidden bg-white border-t border-slate-200 p-4 flex gap-2">
        <button 
          onClick={() => setActiveTab('pedidos')}
          className={`flex-1 py-3 rounded-xl font-bold transition-colors ${activeTab === 'pedidos' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}
        >
          Pedidos
        </button>
        <button 
          onClick={() => setActiveTab('reportes')}
          className={`flex-1 py-3 rounded-xl font-bold transition-colors ${activeTab === 'reportes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}
        >
          Reportes
        </button>
      </div>
    </div>
  );
}