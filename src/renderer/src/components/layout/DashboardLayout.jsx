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
  AlertTriangle,
  Info,
  History,
  FileText,
  Clock,
  X,
  Download,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

import logoPolicia from '../../assets/logo-policia.png'
import logoUre from '../../assets/logo-ure.png'
import logoCop from '../../assets/logo-cop.png'
import MonthPicker from '../MonthPicker'

import { 
  comisariasRegionalEste, 
  zonasJurisdiccionales, 
  delitosPropiedad, 
  delitosPersonas 
} from '../../data/policiaData'

// --- LIBRERÍAS NATIVAS PARA PDF (CORREGIDO) ---
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable' // Importación directa de la función

export default function DashboardLayout() {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)
  const [openComisarias, setOpenComisarias] = useState(false)
  const [openDelitosPropiedad, setOpenDelitosPropiedad] = useState(false)
  const [openDelitosPersonas, setOpenDelitosPersonas] = useState(false)

  const [validationError, setValidationError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const [showComparativeModal, setShowComparativeModal] = useState(false)
  const [consultaData, setConsultaData] = useState(null)

  const [isExporting, setIsExporting] = useState(false)

  const [hideModalWarning, setHideModalWarning] = useState(() => {
    return localStorage.getItem('hideReportWarning') === 'true'
  })

  const currentMonth = new Date().toISOString().slice(0, 7)
  const [startDate, setStartDate] = useState('2026-04')
  const [endDate, setEndDate] = useState(currentMonth)

  const [selectedZonas, setSelectedZonas] = useState([])
  const [selectedComisarias, setSelectedComisarias] = useState([])
  const [selectedPropiedad, setSelectedPropiedad] = useState([])
  const [selectedPersonas, setSelectedPersonas] = useState([])

  const [isMapPristine, setIsMapPristine] = useState(true)

  const toggleItem = (id, currentList, setList, isComisaria = false) => {
    if (isComisaria) setIsMapPristine(false)
    if (currentList.includes(id)) {
      setList(currentList.filter(item => item !== id))
    } else {
      setList([...currentList, id])
    }
  }

  const isAllComisarias = selectedComisarias.length === comisariasRegionalEste.length && comisariasRegionalEste.length > 0
  const toggleAllComisarias = () => {
    setIsMapPristine(false)
    isAllComisarias ? setSelectedComisarias([]) : setSelectedComisarias(comisariasRegionalEste.map(c => c.id))
  }

  const isAllPropiedad = selectedPropiedad.length === delitosPropiedad.length && delitosPropiedad.length > 0
  const toggleAllPropiedad = () => isAllPropiedad ? setSelectedPropiedad([]) : setSelectedPropiedad(delitosPropiedad.map(d => d.id))

  const isAllPersonas = selectedPersonas.length === delitosPersonas.length && delitosPersonas.length > 0
  const toggleAllPersonas = () => isAllPersonas ? setSelectedPersonas([]) : setSelectedPersonas(delitosPersonas.map(d => d.id))

  const handleEjecutarConsulta = () => {
    setValidationError('')

    if (!startDate || !endDate) {
      setValidationError('Debe seleccionar el rango temporal (Desde / Hasta).')
      return
    }
    if (startDate > endDate) {
      setValidationError('Error: La fecha "Desde" no puede ser mayor que "Hasta".')
      return
    }
    if (selectedComisarias.length === 0) {
      setValidationError('Operación denegada: Seleccione de 1 a 3 comisarías para generar la comparativa.')
      return
    }
    if (selectedComisarias.length > 3) {
      setValidationError(`Límite excedido: Seleccionó ${selectedComisarias.length} comisarías. El máximo permitido para procesar consultas es de 3 en simultáneo.`)
      return
    }
    if (selectedPropiedad.length === 0 && selectedPersonas.length === 0) {
      setValidationError('Operación denegada: Seleccione al menos un tipo de delito.')
      return
    }

    setIsSearching(true)

    const consulta = {
      fechas: { desde: startDate, hasta: endDate },
      zonas: selectedZonas,
      comisarias_ids: selectedComisarias,
      delitos: { propiedad: selectedPropiedad, personas: selectedPersonas }
    }
    
    setConsultaData(consulta)

    setTimeout(() => {
      setIsSearching(false)
      setShowComparativeModal(true)
      if (window.innerWidth < 768) setIsRightPanelOpen(false)
    }, 1500)
  }

  // --- FUNCIÓN PARA GENERAR DOCUMENTO PDF NATIVO ---
  const exportarComparativaPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // --- MEMBRETE OFICIAL ---
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("POLICÍA DE TUCUMÁN", 105, 15, { align: "center" });
      doc.text("UNIDAD REGIONAL ESTE", 105, 21, { align: "center" });
      doc.text("CENTRO OPERACIONES POLICIALES URE", 105, 27, { align: "center" });
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Calle República y Tornquinst - Lastenia - Tel.: 0381-4260528", 105, 33, { align: "center" });
      doc.text("centrooperacionespolicialesure@gmail.com", 105, 38, { align: "center" });
      
      doc.setLineWidth(0.5);
      doc.line(15, 42, 195, 42);

      // --- TÍTULO DEL REPORTE ---
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE COMPARATIVO JURISDICCIONAL", 105, 52, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Período analizado: ${consultaData.fechas.desde} al ${consultaData.fechas.hasta}`, 105, 58, { align: "center" });

      let currentY = 70;

      // --- TABLAS DINÁMICAS POR COMISARÍA ---
      consultaData.comisarias_ids.forEach((idComisaria, index) => {
        const comisariaInfo = comisariasRegionalEste.find(c => c.id === idComisaria);
        const nombreComisaria = comisariaInfo ? comisariaInfo.nombre : `Comisaría ${idComisaria}`;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`UNIDAD: ${nombreComisaria}`, 15, currentY);
        currentY += 6;

        if (consultaData.delitos.propiedad.length > 0) {
          const bodyPropiedad = consultaData.delitos.propiedad.map(id => {
            const dInfo = delitosPropiedad.find(d => d.id === id);
            return [dInfo ? dInfo.nombre : id, Math.floor(Math.random() * 20) + 1];
          });
          
          // SINTAXIS CORREGIDA
          autoTable(doc, {
            startY: currentY,
            head: [['Delitos vs. Propiedad', 'Casos Registrados']],
            body: bodyPropiedad,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] }, 
            margin: { left: 15, right: 15 }
          });
          currentY = doc.lastAutoTable.finalY + 10;
        }

        if (consultaData.delitos.personas.length > 0) {
          const bodyPersonas = consultaData.delitos.personas.map(id => {
            const dInfo = delitosPersonas.find(d => d.id === id);
            return [dInfo ? dInfo.nombre : id, Math.floor(Math.random() * 15) + 1];
          });

          // SINTAXIS CORREGIDA
          autoTable(doc, {
            startY: currentY,
            head: [['Delitos vs. Personas', 'Casos Registrados']],
            body: bodyPersonas,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            margin: { left: 15, right: 15 }
          });
          currentY = doc.lastAutoTable.finalY + 15;
        }

        if (currentY > 250 && index < consultaData.comisarias_ids.length - 1) {
          doc.addPage();
          currentY = 20;
        }
      });

      doc.save(`Reporte_Comparativo_${consultaData.fechas.desde}_al_${consultaData.fechas.hasta}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF: " + (error.message || error));
    } finally {
      setIsExporting(false);
    }
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

  const mockHistorial = [
    { id: 1, archivo: 'DELITO CONTRA LA PROPIEDAD - MAYO.xls', fecha: 'Hoy, 08:30 AM', registros: 145 },
    { id: 2, archivo: 'DELITO CONTRA LA PERSONA - ABRIL.xls', fecha: 'Ayer, 19:15 PM', registros: 89 },
    { id: 3, archivo: 'DELITOS_COMISARIA_RANCHILLOS.xlsx', fecha: '12/06/2026', registros: 34 },
    { id: 4, archivo: 'REPORTE_MENSUAL_URE.xlsx', fecha: '01/06/2026', registros: 512 }
  ]

  const gridColsClass = selectedComisarias.length === 1 
    ? 'grid-cols-1' 
    : selectedComisarias.length === 2 
      ? 'grid-cols-1 md:grid-cols-2' 
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden text-slate-200">
      
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 shadow-md">
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3">
            <img src={logoPolicia} alt="Policía" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">Policía de Tucumán</h1>
              <p className="text-[10px] text-blue-400/90 tracking-widest font-medium mt-0.5">Sistema Geo-Táctico</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <img src={logoUre} alt="U.R.E." className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">Unidad Regional Este</h1>
              <p className="text-[10px] text-blue-400/90 tracking-widest font-medium mt-0.5">Policía de Tucumán</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <img src={logoCop} alt="C.O.P." className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-100">CENTRO DE OPERACIONES POLICIALES</h1>
              <p className="text-[10px] text-blue-400/90 tracking-widest font-medium mt-0.5">Unidad Regional Este</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <a href="https://github.com/tu-usuario" target="_blank" rel="noreferrer" className="hidden lg:flex items-center text-slate-500 hover:text-slate-300 transition-colors">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 transition-all">DEV</span>
          </a>
          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Sesión</p>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">{role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-all">
              <LogOut size={18} />
            </button>
            <button 
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} 
              className="md:hidden p-2 bg-blue-600/20 border border-blue-500/50 rounded-lg text-blue-400"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        
        <aside className="w-14 sm:w-16 hover:w-56 group bg-slate-900 border-r border-slate-800 flex flex-col py-4 transition-all duration-300 ease-in-out shrink-0 z-30 absolute md:relative h-full overflow-hidden shadow-2xl md:shadow-none">
          <div className="flex flex-col gap-2 px-2">
            {navItems.filter((item) => item.roles.includes(role)).map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard/')
                return (
                  <button key={item.path} onClick={() => navigate(item.path)} className={`flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl transition-all whitespace-nowrap ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}>
                    <div className="shrink-0">{item.icon}</div>
                    <span className="text-xs sm:text-sm font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.label}</span>
                  </button>
                )
              })}
          </div>
        </aside>

        <main className="flex-1 relative bg-slate-950 overflow-hidden w-full h-full">
          <Outlet context={{ selectedComisarias, selectedZonas, selectedPropiedad, selectedPersonas, isMapPristine, isRightPanelOpen }} />
        </main>

        <AnimatePresence>
          {showComparativeModal && consultaData && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[6000] flex items-center justify-center p-2 sm:p-6 lg:p-12"
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowComparativeModal(false)}></div>
              
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative bg-slate-950 border border-slate-700 w-full max-w-7xl h-[95vh] sm:h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              >
                <div className="flex flex-col flex-1 h-full w-full bg-slate-950">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-4 sm:py-5 bg-slate-900 border-b border-slate-800 shrink-0 gap-4 sm:gap-0">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2 sm:gap-3">
                        <Filter className="text-blue-500" size={20} />
                        Reporte Operativo
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Período: <strong className="text-slate-200">{consultaData.fechas.desde}</strong> al <strong className="text-slate-200">{consultaData.fechas.hasta}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
                      <button 
                        onClick={exportarComparativaPDF} 
                        disabled={isExporting}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-lg transition-all flex-1 sm:flex-none disabled:opacity-50"
                      >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                        {isExporting ? 'Generando PDF...' : 'Exportar PDF'}
                      </button>
                      <div className="w-px h-8 bg-slate-700 hidden sm:block"></div>
                      <button 
                        onClick={() => setShowComparativeModal(false)}
                        className="p-2 sm:p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-red-500/20 hover:border-red-500/50 border border-slate-700 rounded-lg transition-all shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {!hideModalWarning && (
                    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                      <div className="flex items-start sm:items-center gap-3">
                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                        <p className="text-xs text-amber-200/90 leading-relaxed">
                          <strong className="text-amber-400">Aviso Visual:</strong> No todos los delitos encontrados se muestran en pantalla para mantener la estructura y legibilidad. Para ver el detalle exhaustivo de la comparativa, descárguese el reporte en formato Excel.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-medium text-amber-500/80 hover:text-amber-400 cursor-pointer transition-colors shrink-0 self-end sm:self-auto select-none">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 accent-amber-500 rounded border-amber-500/30 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.checked) {
                              localStorage.setItem('hideReportWarning', 'true')
                              setHideModalWarning(true)
                            }
                          }}
                        />
                        No volver a mostrar
                      </label>
                    </div>
                  )}

                  <div className={`flex-1 min-h-0 overflow-y-auto sm:overflow-hidden grid ${gridColsClass} sm:divide-x divide-y sm:divide-y-0 divide-slate-800/80`}>
                    {consultaData.comisarias_ids.map(idComisaria => {
                      const comisariaInfo = comisariasRegionalEste.find(c => c.id === idComisaria)
                      const totalCasos = Math.floor(Math.random() * (120 - 40 + 1) + 40);
                      
                      return (
                        <div key={idComisaria} className="flex flex-col h-auto sm:h-full min-h-0 bg-slate-900/30">
                          <div className="p-4 sm:p-6 border-b border-slate-800/50 bg-slate-900/60 shrink-0">
                            <h3 className="text-base sm:text-lg font-bold text-blue-400 truncate">{comisariaInfo?.nombre || `Comisaría ${idComisaria}`}</h3>
                            <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                              <div className="bg-[#0b1120] border border-slate-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex-1">
                                <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Exp.</span>
                                <p className="text-2xl sm:text-3xl font-black text-slate-100 mt-0.5 sm:mt-1">{totalCasos}</p>
                              </div>
                              <div className="bg-[#0b1120] border border-red-900/30 rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex-1">
                                <span className="text-[9px] sm:text-[10px] text-red-500 uppercase tracking-widest font-bold">Variación</span>
                                <p className="text-base sm:text-lg font-bold text-red-400 mt-0.5 sm:mt-1 flex items-center gap-1">
                                  <TrendingUp size={14} /> +12%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6 sm:space-y-8 min-h-0">
                            {consultaData.delitos.propiedad.length > 0 && (
                              <div>
                                <h4 className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 sm:mb-4 border-b border-slate-800 pb-2">
                                  Delitos vs. Propiedad Consultados
                                </h4>
                                <div className="space-y-2.5 sm:space-y-3">
                                  {consultaData.delitos.propiedad.slice(0, 4).map((idDelito) => {
                                    const dInfo = delitosPropiedad.find(d => d.id === idDelito)
                                    const count = Math.floor(Math.random() * 20) + 1
                                    return (
                                      <div key={idDelito} className="flex justify-between items-center text-xs sm:text-sm">
                                        <span className="text-slate-300 truncate pr-2 sm:pr-4">{dInfo?.nombre || idDelito}</span>
                                        <span className="font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{count}</span>
                                      </div>
                                    )
                                  })}
                                  {consultaData.delitos.propiedad.length > 4 && (
                                    <p className="text-[10px] sm:text-xs text-slate-500 italic mt-2">+ {consultaData.delitos.propiedad.length - 4} modalidades analizadas.</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {consultaData.delitos.personas.length > 0 && (
                              <div>
                                <h4 className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 sm:mb-4 border-b border-slate-800 pb-2">
                                  Delitos vs. Personas Consultados
                                </h4>
                                <div className="space-y-2.5 sm:space-y-3">
                                  {consultaData.delitos.personas.slice(0, 4).map((idDelito) => {
                                    const dInfo = delitosPersonas.find(d => d.id === idDelito)
                                    const count = Math.floor(Math.random() * 15) + 1
                                    return (
                                      <div key={idDelito} className="flex justify-between items-center text-xs sm:text-sm">
                                        <span className="text-slate-300 truncate pr-2 sm:pr-4">{dInfo?.nombre || idDelito}</span>
                                        <span className="font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">{count}</span>
                                      </div>
                                    )
                                  })}
                                  {consultaData.delitos.personas.length > 4 && (
                                    <p className="text-[10px] sm:text-xs text-slate-500 italic mt-2">+ {consultaData.delitos.personas.length - 4} modalidades analizadas.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: window.innerWidth < 640 ? '100%' : 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute md:relative right-0 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-40 shadow-[0_0_30px_rgba(0,0,0,0.5)] md:shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-evenly py-10 pointer-events-none opacity-[0.03]">
                <img src={logoPolicia} alt="" className="w-56 h-56 object-contain grayscale" />
                <img src={logoUre} alt="" className="w-56 h-56 object-contain grayscale" />
              </div>
              
              {location.pathname.includes('/upload') ? (
                <>
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0 relative z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-slate-200">
                      <History size={16} className="text-blue-500" />
                      <span className="text-sm font-medium tracking-wide">Historial de Cargas</span>
                    </div>
                    <button onClick={() => setIsRightPanelOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
                      <X size={20}/>
                    </button>
                  </div>

                  <div className="p-4 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                    <p className="text-xs text-slate-500 mb-4 px-1">Archivos procesados e integrados a la base de datos geo-táctica.</p>
                    <div className="space-y-3">
                      {mockHistorial.map((item) => (
                        <div key={item.id} className="bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 bg-emerald-500/10 p-1.5 rounded text-emerald-500 shrink-0 border border-emerald-500/20"><FileText size={16} /></div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-slate-200 truncate" title={item.archivo}>{item.archivo}</h4>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10} /> {item.fecha}</span>
                                <span className="text-[10px] font-medium bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded border border-slate-700">{item.registros} reg.</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0 relative z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Filter size={16} className="text-blue-500" />
                      <span className="text-sm font-medium tracking-wide">Motor de Consultas</span>
                    </div>
                    <button onClick={() => setIsRightPanelOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
                      <X size={20}/>
                    </button>
                  </div>

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
                          <div 
                            className="flex-1 flex items-center cursor-pointer group"
                            onClick={() => setOpenComisarias(!openComisarias)}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors">Filtro de Comisarías</span>
                              <span className="text-[10px] text-slate-500">
                                {isMapPristine ? 'Mapa inicial (Viendo Todas)' : selectedComisarias.length === 0 ? 'Sin selección (Mapa Vacío)' : `${selectedComisarias.length} seleccionada(s)`}
                              </span>
                            </div>
                            <ChevronDown size={16} className={`text-slate-500 ml-2 transition-transform duration-300 ${openComisarias ? 'rotate-180' : ''}`} />
                          </div>
                          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest w-12 text-center text-nowrap">
                              {isAllComisarias ? 'TODAS' : 'NINGUNA'}
                            </span>
                            <button 
                              onClick={toggleAllComisarias}
                              className={`w-10 h-5 rounded-full relative flex items-center px-0.5 transition-colors duration-300 shrink-0 ${isAllComisarias ? 'bg-blue-600' : 'bg-slate-700'}`}
                            >
                              <motion.div 
                                layout
                                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                className="w-4 h-4 bg-white rounded-full shadow-md"
                                animate={{ x: isAllComisarias ? 20 : 0 }}
                              />
                            </button>
                          </div>
                        </div>
                        <AnimatePresence>
                          {openComisarias && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '200px', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 border-t border-slate-800 flex flex-col gap-2 pt-2 overflow-y-auto custom-scrollbar">
                              {comisariasRegionalEste.map(comisaria => (
                                <label key={comisaria.id} className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200">
                                  <input type="checkbox" className="accent-blue-600" checked={selectedComisarias.includes(comisaria.id)} onChange={() => toggleItem(comisaria.id, selectedComisarias, setSelectedComisarias, true)} /> 
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
                          <div 
                            className="flex-1 flex items-center cursor-pointer group"
                            onClick={() => setOpenDelitosPropiedad(!openDelitosPropiedad)}
                          >
                            <span className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors">Contra la Propiedad</span>
                            <ChevronDown size={16} className={`text-slate-500 ml-2 transition-transform duration-300 ${openDelitosPropiedad ? 'rotate-180' : ''}`} />
                          </div>
                          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest w-12 text-center text-nowrap">{isAllPropiedad ? 'TODOS' : 'FILTRAR'}</span>
                            <button 
                              onClick={toggleAllPropiedad}
                              className={`w-10 h-5 rounded-full relative flex items-center px-0.5 transition-colors duration-300 shrink-0 ${isAllPropiedad ? 'bg-red-500' : 'bg-slate-700'}`}
                            >
                              <motion.div 
                                layout
                                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                className="w-4 h-4 bg-white rounded-full shadow-md"
                                animate={{ x: isAllPropiedad ? 20 : 0 }}
                              />
                            </button>
                          </div>
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
                          <div 
                            className="flex-1 flex items-center cursor-pointer group"
                            onClick={() => setOpenDelitosPersonas(!openDelitosPersonas)}
                          >
                            <span className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors">Contra las Personas</span>
                            <ChevronDown size={16} className={`text-slate-500 ml-2 transition-transform duration-300 ${openDelitosPersonas ? 'rotate-180' : ''}`} />
                          </div>
                          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest w-12 text-center text-nowrap">{isAllPersonas ? 'TODOS' : 'FILTRAR'}</span>
                            <button 
                              onClick={toggleAllPersonas}
                              className={`w-10 h-5 rounded-full relative flex items-center px-0.5 transition-colors duration-300 shrink-0 ${isAllPersonas ? 'bg-orange-500' : 'bg-slate-700'}`}
                            >
                              <motion.div 
                                layout
                                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                className="w-4 h-4 bg-white rounded-full shadow-md"
                                animate={{ x: isAllPersonas ? 20 : 0 }}
                              />
                            </button>
                          </div>
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

                  <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                    <div className="flex gap-2 text-[10px] text-slate-400 mb-4 bg-slate-800/40 p-2.5 rounded-md border border-slate-700/50 leading-relaxed">
                      <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <p><strong className="text-slate-200">Aviso Operativo: </strong> Antes de ejecutar una consulta debés marcar el rango de la fecha, seleccionar de <strong className="text-blue-400">1 a 3 comisarías</strong> y qué tipos de delitos querés consultar.</p>
                    </div>

                    <AnimatePresence>
                      {validationError && (
                        <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 10, height: 0 }} className="mb-3">
                          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/40 p-2.5 rounded border border-red-900/50">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span className="leading-tight">{validationError}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      onClick={handleEjecutarConsulta}
                      disabled={isSearching}
                      className={`w-full font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-80 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white`}
                    >
                      {isSearching ? <><Loader2 size={18} className="animate-spin" /> Analizando Data...</> : <><Search size={18} /> Ejecutar Consulta</>}
                    </button>
                  </div>
                </>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {!isRightPanelOpen && !showComparativeModal && (
          <button
            onClick={() => setIsRightPanelOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-800 text-slate-300 p-2 sm:p-1.5 rounded-l-lg border-y border-l border-slate-700 hover:bg-slate-700 hover:text-white transition-colors z-30 shadow-lg"
          >
            <Menu size={20} className="sm:w-4 sm:h-4" />
          </button>
        )}

      </div>
    </div>
  )
}