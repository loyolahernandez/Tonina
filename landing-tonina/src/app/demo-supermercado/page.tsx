"use client";

import { useState } from "react";
import { Store, ShoppingBag, TrendingUp, Users, CheckCircle2, Clock, Truck, MessageCircle, ArrowRight, ArrowLeft, X, Receipt } from "lucide-react";

type Pedido = {
  id: string;
  name: string;
  items: string;
  detail: { qty: number; desc: string; price: string }[];
  total: string;
  time: string;
  source: string;
  status: 'nuevo' | 'preparando' | 'listo';
};

export default function SupermarketDemo() {
  const [activeTab, setActiveTab] = useState<'pedidos' | 'reportes'>('pedidos');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [selectedHour, setSelectedHour] = useState<any | null>(null);

  const [pedidos, setPedidos] = useState<Pedido[]>([
    { 
      id: '#1042', name: 'Sra. Carmen', items: 'Leche, Pan, Huevos...', total: '$8.500', time: 'Hace 5 min', source: 'WhatsApp Bot', status: 'nuevo',
      detail: [
        { qty: 2, desc: 'Leche Sur (1L)', price: '$2.400' },
        { qty: 1, desc: 'Pan Marraqueta (1kg)', price: '$2.100' },
        { qty: 1, desc: 'Bandeja Huevos (12u)', price: '$4.000' }
      ]
    },
    { 
      id: '#1041', name: 'Don Pedro', items: 'Asado Carnicero, Bebida...', total: '$24.900', time: 'Hace 15 min', source: 'WhatsApp Bot', status: 'preparando',
      detail: [
        { qty: 1, desc: 'Asado Carnicero (1.5kg)', price: '$18.900' },
        { qty: 1, desc: 'Coca Cola Zero (3L)', price: '$3.000' },
        { qty: 1, desc: 'Carbón Vegetal (2.5kg)', price: '$3.000' }
      ]
    },
    { 
      id: '#1040', name: 'Familia Rojas', items: 'Abarrotes del mes (15 items)', total: '$85.000', time: 'Hace 1 hora', source: 'App Web', status: 'listo',
      detail: [
        { qty: 5, desc: 'Fideos Carozzi (400g)', price: '$5.000' },
        { qty: 3, desc: 'Salsa de Tomate', price: '$2.400' },
        { qty: 1, desc: 'Aceite Maravilla (1L)', price: '$3.500' },
        { qty: 1, desc: 'Pack Aseo Completo', price: '$74.100' }
      ]
    },
  ]);

  const hourlyData = [
    { hour: '08:00', h: 40, label: '$600k', details: [{cat: 'Panadería', val: '$350.000'}, {cat: 'Lácteos', val: '$250.000'}] },
    { hour: '10:00', h: 60, label: '$900k', details: [{cat: 'Abarrotes', val: '$500.000'}, {cat: 'Bebidas', val: '$400.000'}] },
    { hour: '12:00', h: 30, label: '$450k', details: [{cat: 'Carnicería', val: '$250.000'}, {cat: 'Verduras', val: '$200.000'}] },
    { hour: '14:00', h: 80, label: '$1.2M', details: [{cat: 'Carnicería', val: '$800.000'}, {cat: 'Bebidas', val: '$400.000'}] },
    { hour: '16:00', h: 100, label: '$1.5M', details: [{cat: 'Abarrotes', val: '$900.000'}, {cat: 'Limpieza', val: '$600.000'}] },
    { hour: '18:00', h: 70, label: '$1.05M', details: [{cat: 'Panadería', val: '$600.000'}, {cat: 'Lácteos', val: '$450.000'}] },
    { hour: '20:00', h: 90, label: '$1.35M', details: [{cat: 'Bebidas', val: '$800.000'}, {cat: 'Snacks', val: '$550.000'}] },
    { hour: '22:00', h: 50, label: '$750k', details: [{cat: 'Licores', val: '$500.000'}, {cat: 'Snacks', val: '$250.000'}] },
  ];

  const movePedido = (e: React.MouseEvent, id: string, newStatus: Pedido['status']) => {
    e.stopPropagation(); // Evitar que abra el modal
    setPedidos(pedidos.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col relative">
      
      {/* Modals Superpuestos */}
      {selectedPedido && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Receipt size={24} className="text-emerald-600"/> Pedido {selectedPedido.id}</h3>
                <p className="text-sm text-slate-500 font-medium">{selectedPedido.name} • {selectedPedido.source}</p>
              </div>
              <button onClick={() => setSelectedPedido(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalle de Productos</h4>
              <div className="space-y-3">
                {selectedPedido.detail.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <span className="bg-white border border-slate-200 w-6 h-6 flex items-center justify-center rounded text-xs font-black text-slate-700">{item.qty}</span>
                      <span className="text-slate-700">{item.desc}</span>
                    </div>
                    <span className="text-slate-900 font-bold">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-500">Total a Pagar</span>
                <span className="text-xl font-black text-emerald-600">{selectedPedido.total}</span>
              </div>
            </div>

            <button onClick={() => setSelectedPedido(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors">
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}

      {selectedHour && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><TrendingUp size={24} className="text-blue-600"/> Detalle de Ventas</h3>
                <p className="text-sm text-slate-500 font-medium">Corte de las {selectedHour.hour} horas</p>
              </div>
              <button onClick={() => setSelectedHour(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-sm font-bold text-slate-400 uppercase">Total facturado</div>
              <div className="text-4xl font-black text-slate-900">{selectedHour.label}</div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Desglose por Categoría</h4>
              {selectedHour.details.map((d: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700">{d.cat}</span>
                  <span className="font-black text-blue-600">{d.val}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedHour(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors">
              Cerrar Reporte
            </button>
          </div>
        </div>
      )}

      {/* Header Corporativo (Marca Blanca) */}
      <header className="bg-emerald-700 text-white p-4 shadow-md flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-emerald-700 rounded-lg flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black leading-tight">Supermercado Mario</h1>
            <p className="text-emerald-200 text-xs font-medium">Sistema de Operaciones v1.0</p>
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
              <p className="text-slate-500">Toca cualquier tarjeta para ver el detalle de los productos comprados por WhatsApp.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Columna 1 */}
              <div className="bg-slate-200/50 rounded-2xl flex flex-col h-[600px]">
                <div className="p-4 border-t-4 border-blue-500 bg-white rounded-t-2xl shadow-sm flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageCircle size={18} className="text-blue-500"/> Nuevos (Entrando)</h3>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold">{pedidos.filter(p => p.status === 'nuevo').length}</span>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto">
                  {pedidos.filter(p => p.status === 'nuevo').map(p => (
                    <div key={p.id} onClick={() => setSelectedPedido(p)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-black text-slate-800">{p.id}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium flex items-center gap-1"><Clock size={12}/> {p.time}</span>
                      </div>
                      <p className="font-bold text-slate-700">{p.name}</p>
                      <div className="bg-slate-50 p-2 rounded text-sm text-slate-500 my-2 truncate" title="Haz clic para ver el detalle">{p.items}</div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                        <span className="font-black text-slate-800">{p.total}</span>
                        <button onClick={(e) => movePedido(e, p.id, 'preparando')} className="bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                          A Bodega <ArrowRight size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna 2 */}
              <div className="bg-slate-200/50 rounded-2xl flex flex-col h-[600px]">
                <div className="p-4 border-t-4 border-yellow-500 bg-white rounded-t-2xl shadow-sm flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingBag size={18} className="text-yellow-500"/> Armando Caja</h3>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold">{pedidos.filter(p => p.status === 'preparando').length}</span>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto">
                  {pedidos.filter(p => p.status === 'preparando').map(p => (
                    <div key={p.id} onClick={() => setSelectedPedido(p)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-black text-slate-800">{p.id}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium flex items-center gap-1"><Clock size={12}/> {p.time}</span>
                      </div>
                      <p className="font-bold text-slate-700">{p.name}</p>
                      <div className="bg-slate-50 p-2 rounded text-sm text-slate-500 my-2 truncate">{p.items}</div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                        <button onClick={(e) => movePedido(e, p.id, 'nuevo')} className="text-slate-400 hover:text-slate-700 p-1 transition-colors"><ArrowLeft size={16}/></button>
                        <button onClick={(e) => movePedido(e, p.id, 'listo')} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                          Terminar <ArrowRight size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna 3 */}
              <div className="bg-slate-200/50 rounded-2xl flex flex-col h-[600px]">
                <div className="p-4 border-t-4 border-emerald-500 bg-white rounded-t-2xl shadow-sm flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><Truck size={18} className="text-emerald-500"/> Listo para Retiro</h3>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold">{pedidos.filter(p => p.status === 'listo').length}</span>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto">
                  {pedidos.filter(p => p.status === 'listo').map(p => (
                    <div key={p.id} onClick={() => setSelectedPedido(p)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-md transition-shadow opacity-90">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-black text-slate-800">{p.id}</span>
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Pagado</span>
                      </div>
                      <p className="font-bold text-slate-700">{p.name}</p>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                        <button onClick={(e) => movePedido(e, p.id, 'preparando')} className="text-slate-400 hover:text-slate-700 p-1 transition-colors"><ArrowLeft size={16}/></button>
                      </div>
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
                <p className="text-slate-500">Haz clic en las barras del gráfico para ver el detalle de ventas por hora.</p>
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

            {/* Gráfico Interactivo y Top Productos */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6">Tendencia de Ventas (Horas)</h3>
                <div className="h-48 flex items-end gap-2">
                  {hourlyData.map((data, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedHour(data)}
                      className="flex-1 bg-emerald-100 hover:bg-emerald-500 cursor-pointer rounded-t-md transition-colors relative group" 
                      style={{ height: `${data.h}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                        Ver {data.hour}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 border-t border-slate-100 pt-2 px-1">
                  <span>08:00</span>
                  <span>14:00</span>
                  <span>22:00</span>
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
    </div>
  );
}
