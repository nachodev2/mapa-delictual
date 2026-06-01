/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Map as MapIcon, 
  UploadCloud, 
  Settings, 
  LogOut, 
  Menu, 
  Filter, 
  Layers, 
  ChevronDown, 
  Search 
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Importamos los logos reales
import logoPolicia from '../../assets/logo-policia.png'
import logoUre from '../../assets/logo-ure.png'
import logoCop from '../../assets/logo-cop.png'

import MonthPicker from '../MonthPicker'

export default function DashboardLayout() {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const [startDate, setStartDate] = useState('2024-11')
  const [endDate, setEndDate] = useState(currentMonth)

  const [openComisarias, setOpenComisarias] = useState(false)
  const [openDelitosPropiedad, setOpenDelitosPropiedad] = useState(false)
  const [openDelitosPersonas, setOpenDelitosPersonas] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      path: '/dashboard',
      icon: <MapIcon size={20} />,
      label: 'Mapa Delictual',
      roles: ['user', 'operador', 'admin']
    },
    {
      path: '/dashboard/upload',
      icon: <UploadCloud size={20} />,
      label: 'Cargar Datos (Excel)',
      roles: ['operador', 'admin']
    },
    {
      path: '/dashboard/admin',
      icon: <Settings size={20} />,
      label: 'Configuración',
      roles: ['admin']
    }
  ]

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-slate-200">
      
      {/* HEADER SUPERIOR */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
        
        {/* IZQUIERDA: Los 3 Bloques Institucionales en Fila */}
        <div className="flex items-center gap-8">
          
          {/* Bloque 1: Policía de Tucumán */}
          <div className="flex items-center gap-3">
            <img
              src={logoPolicia}
              alt="Policía de Tucumán"
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            />
            <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">
                Policía de Tucumán
              </h1>
              <p className="text-[10px] text-blue-400/90 tracking-widest font-medium mt-0.5">
                Sistema Geo-Táctico
              </p>
            </div>
          </div>

          {/* Bloque 2: U.R.E. */}
          <div className="flex items-center gap-3">
            <img
              src={logoUre}
              alt="Unidad Regional Este"
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            />
            <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">
                Unidad Regional Este
              </h1>
              <p className="text-[10px] text-blue-400/90 tracking-widest font-medium mt-0.5">
                Policía de Tucumán
              </p>
            </div>
          </div>

          {/* Bloque 3: C.O.P. */}
          <div className="flex items-center gap-3">
            <img
              src={logoCop}
              alt="Centro de Operaciones Policiales"
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
            />
            <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">
                CENTRO DE OPERACIONES POLICIALES
              </h1>
              <p className="text-[10px] text-blue-400/90 tracking-widest font-medium mt-0.5">
                Unidad Regional Este
              </p>
            </div>
          </div>

        </div>

        {/* DERECHA: Firma y Sesión */}
        <div className="flex items-center gap-6">
          <a 
            href="https://github.com/tu-usuario" 
            target="_blank" 
            rel="noreferrer"
            className="hidden md:flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            title="Desarrollado por Tomás Ruiz"
          >
            <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 transition-all">
              DEV
            </span>
          </a>

          <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Sesión</p>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                {role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-900/50 transition-all"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR IZQUIERDO */}
        <aside className="w-16 hover:w-56 group bg-slate-900 border-r border-slate-800 flex flex-col py-4 transition-all duration-300 ease-in-out shrink-0 z-10 absolute md:relative h-full overflow-hidden">
          <div className="flex flex-col gap-2 px-2">
            {navItems
              .filter((item) => item.roles.includes(role))
              .map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[inset_0_0_10px_rgba(37,99,235,0.1)]'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="shrink-0">{item.icon}</div>
                    <span className="text-sm font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.label}
                    </span>
                  </button>
                )
              })}
          </div>
        </aside>

        {/* MAPA */}
        <main className="flex-1 relative bg-slate-950 overflow-hidden">
          <Outlet />
        </main>

        {/* PANEL DERECHO DE FILTROS */}
        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-10 shadow-2xl relative"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
                <div className="flex items-center gap-2 text-slate-200">
                  <Filter size={16} className="text-blue-500" />
                  <span className="text-sm font-medium tracking-wide">Motor de Consultas</span>
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-24">
                
                <section>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <h3 className="text-xs uppercase tracking-widest font-semibold">Rango Temporal</h3>
                  </div>
                  <MonthPicker
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={(start, end) => {
                      setStartDate(start)
                      setEndDate(end)
                    }}
                  />
                </section>

                <hr className="border-slate-800" />

                <section>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <Layers size={14} />
                    <h3 className="text-xs uppercase tracking-widest font-semibold">Capas Base</h3>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-slate-500 mb-2">Zonas Jurisdiccionales</h4>
                    <div className="flex gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 bg-slate-950 border border-slate-800 py-2 rounded text-xs cursor-pointer hover:bg-slate-800 transition-colors">
                        <input type="checkbox" className="accent-blue-600" defaultChecked /> Z1
                      </label>
                      <label className="flex-1 flex items-center justify-center gap-1.5 bg-slate-950 border border-slate-800 py-2 rounded text-xs cursor-pointer hover:bg-slate-800 transition-colors">
                        <input type="checkbox" className="accent-blue-600" defaultChecked /> Z2
                      </label>
                      <label className="flex-1 flex items-center justify-center gap-1.5 bg-slate-950 border border-slate-800 py-2 rounded text-xs cursor-pointer hover:bg-slate-800 transition-colors">
                        <input type="checkbox" className="accent-blue-600" defaultChecked /> Z3
                      </label>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3">
                      <label className="flex items-center gap-3 font-medium cursor-pointer text-sm text-slate-300">
                        <input type="checkbox" className="accent-blue-600 w-4 h-4" defaultChecked />
                        Todas las Comisarías
                      </label>
                      <button onClick={() => setOpenComisarias(!openComisarias)} className="text-slate-500 hover:text-white p-1">
                        <ChevronDown size={16} className={`transition-transform ${openComisarias ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {openComisarias && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-3 pb-3 border-t border-slate-800 flex flex-col gap-2 pt-2 max-h-40 overflow-y-auto"
                        >
                          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                            <input type="checkbox" className="accent-blue-600" defaultChecked /> BANDA DEL RIO SALI
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                            <input type="checkbox" className="accent-blue-600" defaultChecked /> ALDERETES
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                            <input type="checkbox" className="accent-blue-600" defaultChecked /> LOS RALOS
                          </label>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>

                <hr className="border-slate-800" />

                <section>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <Filter size={14} />
                    <h3 className="text-xs uppercase tracking-widest font-semibold">Tipos de Delito</h3>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg overflow-hidden mb-3">
                    <div className="flex items-center justify-between p-3">
                      <label className="flex items-center gap-3 font-medium cursor-pointer text-sm text-slate-300">
                        <input type="checkbox" className="accent-red-500 w-4 h-4" defaultChecked />
                        Contra la Propiedad
                      </label>
                      <button onClick={() => setOpenDelitosPropiedad(!openDelitosPropiedad)} className="text-slate-500 hover:text-white p-1">
                        <ChevronDown size={16} className={`transition-transform ${openDelitosPropiedad ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {openDelitosPropiedad && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-3 pb-3 border-t border-slate-800 flex flex-col gap-2 pt-2"
                        >
                          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                            <input type="checkbox" className="accent-red-500" defaultChecked /> Robo de Motovehículo
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                            <input type="checkbox" className="accent-red-500" defaultChecked /> Robo a Mano Armada
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                            <input type="checkbox" className="accent-red-500" defaultChecked /> Hurto Simple
                          </label>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3">
                      <label className="flex items-center gap-3 font-medium cursor-pointer text-sm text-slate-300">
                        <input type="checkbox" className="accent-orange-500 w-4 h-4" defaultChecked />
                        Contra las Personas
                      </label>
                      <button onClick={() => setOpenDelitosPersonas(!openDelitosPersonas)} className="text-slate-500 hover:text-white p-1">
                        <ChevronDown size={16} className={`transition-transform ${openDelitosPersonas ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {openDelitosPersonas && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-3 pb-3 border-t border-slate-800 flex flex-col gap-2 pt-2"
                        >
                          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                            <input type="checkbox" className="accent-orange-500" defaultChecked /> Lesiones
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                            <input type="checkbox" className="accent-orange-500" defaultChecked /> Homicidio
                          </label>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800 bg-slate-900 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
                  <Search size={18} />
                  Ejecutar Consulta
                </button>
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
  )
}
