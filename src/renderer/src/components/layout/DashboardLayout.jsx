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
  Search,
  Loader2,
  ShieldAlert,
  Info // <-- Nuevo icono para la advertencia
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Importamos los logos reales
import logoPolicia from '../../assets/logo-policia.png'
import logoUre from '../../assets/logo-ure.png'
import logoCop from '../../assets/logo-cop.png'

import MonthPicker from '../MonthPicker'

// Importamos los datos centralizados
import { 
  comisariasRegionalEste, 
  zonasJurisdiccionales, 
  delitosPropiedad, 
  delitosPersonas 
} from '../../data/policiaData'

export default function DashboardLayout() {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // 1. Estados de Interfaz
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [openComisarias, setOpenComisarias] = useState(false)
  const [openDelitosPropiedad, setOpenDelitosPropiedad] = useState(false)
  const [openDelitosPersonas, setOpenDelitosPersonas] = useState(false)

  // ESTADOS DE VALIDACIÓN Y CARGA
  const [validationError, setValidationError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // 2. Estados de Filtros de Fecha
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [startDate, setStartDate] = useState('2024-11')
  const [endDate, setEndDate] = useState(currentMonth)

  // 3. ESTADOS DE FILTROS (Checkboxes)
  const [selectedZonas, setSelectedZonas] = useState(zonasJurisdiccionales.map(z => z.id))
  const [selectedComisarias, setSelectedComisarias] = useState(comisariasRegionalEste.map(c => c.id))
  const [selectedPropiedad, setSelectedPropiedad] = useState(delitosPropiedad.map(d => d.id))
  const [selectedPersonas, setSelectedPersonas] = useState(delitosPersonas.map(d => d.id))

  // Lógica General para marcar/desmarcar items individuales
  const toggleItem = (id, currentList, setList) => {
    if (currentList.includes(id)) {
      setList(currentList.filter(item => item !== id))
    } else {
      setList([...currentList, id])
    }
  }

  const isAllComisarias = selectedComisarias.length === comisariasRegionalEste.length
  const toggleAllComisarias = () => isAllComisarias ? setSelectedComisarias([]) : setSelectedComisarias(comisariasRegionalEste.map(c => c.id))

  const isAllPropiedad = selectedPropiedad.length === delitosPropiedad.length
  const toggleAllPropiedad = () => isAllPropiedad ? setSelectedPropiedad([]) : setSelectedPropiedad(delitosPropiedad.map(d => d.id))

  const isAllPersonas = selectedPersonas.length === delitosPersonas.length
  const toggleAllPersonas = () => isAllPersonas ? setSelectedPersonas([]) : setSelectedPersonas(delitosPersonas.map(d => d.id))

  // ==========================================
  // MOTOR DE VALIDACIÓN ESTRICTA
  // ==========================================
  const handleEjecutarConsulta = () => {
    setValidationError('')
    setIsSuccess(false)

    // 1. Validar Fechas
    if (!startDate || !endDate) {
      setValidationError('Debe seleccionar el rango temporal (Desde / Hasta).')
      return
    }
    if (startDate > endDate) {
      setValidationError('Error: La fecha "Desde" no puede ser mayor que "Hasta".')
      return
    }

    // 2. Validar Comisarías (Mínimo 1, Máximo 3)
    if (selectedComisarias.length === 0) {
      setValidationError('Operación denegada: Seleccione al menos una comisaría.')
      return
    }
    if (selectedComisarias.length > 3) {
      setValidationError(`Límite excedido: Seleccionó ${selectedComisarias.length} comisarías. El máximo permitido para procesar consultas es de 3 en simultáneo.`)
      return
    }

    // 3. Validar Delitos (Mínimo 1 de cualquier tipo)
    if (selectedPropiedad.length === 0 && selectedPersonas.length === 0) {
      setValidationError('Operación denegada: Seleccione al menos un tipo de delito.')
      return
    }

    // Si todo está OK, iniciamos la búsqueda
    setIsSearching(true)

    const consulta = {
      fechas: { desde: startDate, hasta: endDate },
      zonas: selectedZonas,
      comisarias_ids: selectedComisarias,
      delitos: { propiedad: selectedPropiedad, personas: selectedPersonas }
    }
    
    console.log("JSON listo para la Base de Datos:", consulta)

    // Simulación de respuesta de API
    setTimeout(() => {
      setIsSearching(false)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    }, 1500)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', icon: <MapIcon size={20} />, label: 'Mapa Delictual', roles: ['user', 'operador', 'admin'] },
    { path: '/dashboard/upload', icon: <UploadCloud size={20} />, label: 'Cargar Datos (Excel)', roles: ['operador', 'admin'] },
    { path: '/dashboard/admin', icon: <Settings size={20} />, label: 'Configuración', roles: ['admin'] }
  ]

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-slate-200">
      
      {/* HEADER SUPERIOR */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <img src={logoPolicia} alt="Policía" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">Policía de Tucumán</h1>
              <p className="text-[10px] text-blue-400/90 tracking-widest font-medium mt-0.5">Sistema Geo-Táctico</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <img src={logoUre} alt="U.R.E." className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">Unidad Regional Este</h1>
              <p className="text-[10px] text-blue-400/90 tracking-widest font-medium mt-0.5">Policía de Tucumán</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <img src={logoCop} alt="C.O.P." className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">CENTRO DE OPERACIONES POLICIALES</h1>
              <p className="text-[10px] text-blue-400/90 tracking-widest font-medium mt-0.5">Unidad Regional Este</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a href="https://github.com/tu-usuario" target="_blank" rel="noreferrer" className="hidden md:flex items-center text-slate-500 hover:text-slate-300 transition-colors">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 transition-all">DEV</span>
          </a>
          <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Sesión</p>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">{role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR IZQUIERDO */}
        <aside className="w-16 hover:w-56 group bg-slate-900 border-r border-slate-800 flex flex-col py-4 transition-all duration-300 ease-in-out shrink-0 z-10 absolute md:relative h-full overflow-hidden">
          <div className="flex flex-col gap-2 px-2">
            {navItems.filter((item) => item.roles.includes(role)).map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <button key={item.path} onClick={() => navigate(item.path)} className={`flex items-center gap-4 p-3 rounded-xl transition-all whitespace-nowrap ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}>
                    <div className="shrink-0">{item.icon}</div>
                    <span className="text-sm font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
                  </button>
                )
              })}
          </div>
        </aside>

        {/* MAPA */}
        <main className="flex-1 relative bg-slate-950 overflow-hidden">
          <Outlet context={{ selectedComisarias, selectedZonas, selectedPropiedad, selectedPersonas }} />
        </main>

        {/* PANEL DERECHO DE FILTROS */}
        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-10 shadow-2xl relative overflow-hidden"
            >
              {/* FONDO MARCA DE AGUA */}
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-evenly py-10 pointer-events-none opacity-[0.03]">
                <img src={logoPolicia} alt="" className="w-56 h-56 object-contain grayscale" />
                <img src={logoUre} alt="" className="w-56 h-56 object-contain grayscale" />
                <img src={logoCop} alt="" className="w-56 h-56 object-contain grayscale" />
              </div>
              
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0 relative z-10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-200">
                  <Filter size={16} className="text-blue-500" />
                  <span className="text-sm font-medium tracking-wide">Motor de Consultas</span>
                </div>
              </div>

              {/* El padding bottom gigante (pb-56) evita que el menú de abajo pise las opciones de delitos */}
              <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-56 relative z-10">
                
                <section>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <h3 className="text-xs uppercase tracking-widest font-semibold">Rango Temporal</h3>
                  </div>
                  <MonthPicker startDate={startDate} endDate={endDate} onDateChange={(start, end) => { setStartDate(start); setEndDate(end) }} />
                </section>

                <hr className="border-slate-800/50" />

                <section>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <Layers size={14} />
                    <h3 className="text-xs uppercase tracking-widest font-semibold">Capas Base</h3>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-slate-500 mb-2">Zonas Jurisdiccionales</h4>
                    <div className="flex gap-2">
                      {zonasJurisdiccionales.map(zona => (
                        <label key={zona.id} className="flex-1 flex items-center justify-center gap-1.5 bg-slate-950/80 backdrop-blur-sm border border-slate-800 py-2 rounded text-xs cursor-pointer hover:bg-slate-800 transition-colors">
                          <input type="checkbox" className="accent-blue-600" checked={selectedZonas.includes(zona.id)} onChange={() => toggleItem(zona.id, selectedZonas, setSelectedZonas)} /> 
                          {zona.nombre}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-3 shrink-0">
                      <label className="flex items-center gap-3 font-medium cursor-pointer text-sm text-slate-300 flex-1">
                        <input type="checkbox" className="accent-blue-600 w-4 h-4" checked={isAllComisarias} onChange={toggleAllComisarias} />
                        Todas las Comisarías
                      </label>
                      <button onClick={() => setOpenComisarias(!openComisarias)} className="text-slate-500 hover:text-white p-1 ml-2">
                        <ChevronDown size={16} className={`transition-transform ${openComisarias ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {openComisarias && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '200px', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 border-t border-slate-800 flex flex-col gap-2 pt-2 overflow-y-auto custom-scrollbar">
                          {comisariasRegionalEste.map(comisaria => (
                            <label key={comisaria.id} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                              <input type="checkbox" className="accent-blue-600" checked={selectedComisarias.includes(comisaria.id)} onChange={() => toggleItem(comisaria.id, selectedComisarias, setSelectedComisarias)} /> 
                              {comisaria.nombre}
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>

                <hr className="border-slate-800/50" />

                <section>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <Filter size={14} />
                    <h3 className="text-xs uppercase tracking-widest font-semibold">Tipos de Delito</h3>
                  </div>

                  <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-lg overflow-hidden mb-3">
                    <div className="flex items-center justify-between p-3 shrink-0">
                      <label className="flex items-center gap-3 font-medium cursor-pointer text-sm text-slate-300 flex-1">
                        <input type="checkbox" className="accent-red-500 w-4 h-4" checked={isAllPropiedad} onChange={toggleAllPropiedad} />
                        Contra la Propiedad
                      </label>
                      <button onClick={() => setOpenDelitosPropiedad(!openDelitosPropiedad)} className="text-slate-500 hover:text-white p-1 ml-2">
                        <ChevronDown size={16} className={`transition-transform ${openDelitosPropiedad ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {openDelitosPropiedad && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 border-t border-slate-800 flex flex-col gap-2 pt-2">
                          {delitosPropiedad.map(delito => (
                            <label key={delito.id} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                              <input type="checkbox" className="accent-red-500" checked={selectedPropiedad.includes(delito.id)} onChange={() => toggleItem(delito.id, selectedPropiedad, setSelectedPropiedad)} /> 
                              {delito.nombre}
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 shrink-0">
                      <label className="flex items-center gap-3 font-medium cursor-pointer text-sm text-slate-300 flex-1">
                        <input type="checkbox" className="accent-orange-500 w-4 h-4" checked={isAllPersonas} onChange={toggleAllPersonas} />
                        Contra las Personas
                      </label>
                      <button onClick={() => setOpenDelitosPersonas(!openDelitosPersonas)} className="text-slate-500 hover:text-white p-1 ml-2">
                        <ChevronDown size={16} className={`transition-transform ${openDelitosPersonas ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {openDelitosPersonas && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 border-t border-slate-800 flex flex-col gap-2 pt-2">
                          {delitosPersonas.map(delito => (
                            <label key={delito.id} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                              <input type="checkbox" className="accent-orange-500" checked={selectedPersonas.includes(delito.id)} onChange={() => toggleItem(delito.id, selectedPersonas, setSelectedPersonas)} /> 
                              {delito.nombre}
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>
              </div>

              {/* CONTENEDOR INFERIOR: AVISOS Y BOTÓN */}
              <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                
                {/* 1. ADVERTENCIA OPERATIVA (SIEMPRE VISIBLE) */}
                <div className="flex gap-2 text-[10px] text-slate-400 mb-4 bg-slate-800/40 p-2.5 rounded-md border border-slate-700/50 leading-relaxed">
                  <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-slate-200">Aviso Operativo: </strong> 
                    Antes de ejecutar una consulta debés marcar el rango de la fecha, en qué comisaría querés hacer la consulta <strong className="text-blue-400">(hasta un máximo de 3 en simultáneo)</strong> y qué tipos de delitos querés consultar (sin límite de delitos).
                  </p>
                </div>

                {/* 2. PANEL DE ERRORES ANIMADO */}
                <AnimatePresence>
                  {validationError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: 10, height: 0 }}
                      className="mb-3"
                    >
                      <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/40 p-2.5 rounded border border-red-900/50">
                        <ShieldAlert size={16} className="shrink-0" />
                        <span className="leading-tight">{validationError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. BOTÓN DE EJECUCIÓN */}
                <button 
                  onClick={handleEjecutarConsulta}
                  disabled={isSearching}
                  className={`w-full font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-80 disabled:cursor-not-allowed
                    ${isSuccess 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white'
                    }
                  `}
                >
                  {isSearching ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Procesando Consulta...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Search size={18} />
                      ¡Base de Datos Actualizada!
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Ejecutar Consulta
                    </>
                  )}
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
