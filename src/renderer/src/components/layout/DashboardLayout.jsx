import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  UploadCloud, 
  Settings, 
  LogOut, 
  Menu,
  Filter,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Importamos el logo real y el nuevo componente de fechas
import logoPolicia from '../../assets/logo-policia.png';
import MonthPicker from '../MonthPicker';

export default function DashboardLayout() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Estados para el filtro de rango de meses
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [startDate, setStartDate] = useState('2024-11');
  const [endDate, setEndDate] = useState(currentMonth);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: <MapIcon size={20} />, label: 'Mapa Delictual', roles: ['user', 'operador', 'admin'] },
    { path: '/dashboard/upload', icon: <UploadCloud size={20} />, label: 'Cargar Datos (Excel)', roles: ['operador', 'admin'] },
    { path: '/dashboard/admin', icon: <Settings size={20} />, label: 'Configuración', roles: ['admin'] },
  ];

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-slate-200">
      
      {/* HEADER SUPERIOR */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
        
        {/* Logo Institucional Real */}
        <div className="flex items-center gap-3">
          <img 
            src={logoPolicia} 
            alt="Logo Policía de Tucumán" 
            className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" 
          />
          <div>
            <h1 className="text-sm font-medium tracking-widest uppercase text-slate-100">Policía de Tucumán</h1>
            <p className="text-[10px] text-blue-400/80 tracking-wider">Sistema Geoespacial</p>
          </div>
        </div>

        {/* NUEVO FILTRO DE RANGO DE FECHAS PERSONALIZADO */}
        <MonthPicker 
          startDate={startDate} 
          endDate={endDate} 
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }} 
        />

        {/* Info de Usuario y Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-400">Sesión iniciada</p>
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest">{role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-900/50 transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR IZQUIERDO */}
        <aside className="w-16 hover:w-56 group bg-slate-900 border-r border-slate-800 flex flex-col py-4 transition-all duration-300 ease-in-out shrink-0 z-10 absolute md:relative h-full overflow-hidden">
          <div className="flex flex-col gap-2 px-2">
            {navItems.filter(item => item.roles.includes(role)).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all whitespace-nowrap
                    ${isActive 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[inset_0_0_10px_rgba(37,99,235,0.1)]' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span className="text-sm font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ÁREA CENTRAL */}
        <main className="flex-1 relative bg-slate-950 overflow-hidden">
          <Outlet /> 
        </main>

        {/* PANEL DERECHO (Filtros y Capas) */}
        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-10"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
                <div className="flex items-center gap-2 text-slate-200">
                  <Filter size={16} />
                  <span className="text-sm font-medium tracking-wide">Filtros Activos</span>
                </div>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-6">
                
                <div>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <Layers size={14} />
                    <h3 className="text-xs uppercase tracking-widest font-semibold">Capas Base</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-800">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600/50 focus:ring-offset-slate-900" />
                      <span className="text-sm text-slate-300">Comisarías (Escudos)</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-800">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600/50 focus:ring-offset-slate-900" />
                      <span className="text-sm text-slate-300">Zonas Jurisdiccionales</span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <Filter size={14} />
                    <h3 className="text-xs uppercase tracking-widest font-semibold">Tipos de Delito</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-800">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600/50 focus:ring-offset-slate-900" />
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                      <span className="text-sm text-slate-300">Contra la Propiedad</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-800">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600/50 focus:ring-offset-slate-900" />
                      <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                      <span className="text-sm text-slate-300">Contra la Persona</span>
                    </label>
                  </div>
                </div>

              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-800 text-slate-300 p-1.5 rounded-l-lg border-y border-l border-slate-700 hover:bg-slate-700 hover:text-white transition-colors z-20 shadow-lg"
        >
          <Menu size={16} />
        </button>

      </div>
    </div>
  );
}