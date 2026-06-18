/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useOutletContext } from 'react-router-dom' 

import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid 
} from 'recharts'

import logoPolicia from '../assets/logo-policia.png' 
import logoUre from '../assets/logo-ure.png' 

import { comisariasRegionalEste } from '../data/policiaData' 
import MonthPicker from './MonthPicker' 

// --- LIBRERÍAS MODERNAS PARA PDF Y TABLAS NATIVAS ---
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toPng } from 'html-to-image' // Agregamos toPng para fotografiar solo los gráficos

const policiaIcon = new L.Icon({
  iconUrl: logoPolicia,
  iconSize: [30, 30], 
  iconAnchor: [15, 30], 
})

function MapUpdater() {
  const map = useMap()
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    
    const container = map.getContainer()
    if (container) {
      resizeObserver.observe(container)
    }
    
    return () => {
      if (container) resizeObserver.unobserve(container)
      resizeObserver.disconnect()
    }
  }, [map])
  
  return null
}

const IconList = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconDatabase = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IconPieChart = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const IconCalendar = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconSearch = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconExport = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const IconClose = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const PinesPoliciales = ({ abrirConsola }) => {
  const { selectedComisarias, isMapPristine } = useOutletContext() || { selectedComisarias: [], isMapPristine: true }

  const comisariasAMostrar = isMapPristine 
    ? comisariasRegionalEste 
    : comisariasRegionalEste.filter((comisaria) => selectedComisarias.includes(comisaria.id))

  return (
    <>
      {comisariasAMostrar.map((comisaria) => (
        <Marker
          key={comisaria.id}
          position={[comisaria.lat, comisaria.lng]}
          title={comisaria.nombre}
          eventHandlers={{
            click: () => abrirConsola(comisaria),
          }}
          icon={policiaIcon}
        />
      ))}
    </>
  )
}

export default function MapView() {
  const centroRegionalEste = [-26.8500, -65.1200]
  const tucumanBounds = [
    [-28.0200, -66.1800], 
    [-26.0500, -64.4800]  
  ]

  const [comisariaSeleccionada, setComisariaSeleccionada] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const [activeTab, setActiveTab] = useState('resumen')

  const [isExporting, setIsExporting] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const [modalStartDate, setModalStartDate] = useState('2026-05')
  const [modalEndDate, setModalEndDate] = useState(currentMonth)

  const [searchExpediente, setSearchExpediente] = useState('')
  const [filterDelito, setFilterDelito] = useState('TODOS')

  const abrirConsola = (comisaria) => {
    setIsClosing(false)
    setActiveTab('resumen')
    setSearchExpediente('')
    setFilterDelito('TODOS')
    setComisariaSeleccionada(comisaria)
  }

  const cerrarConsola = () => {
    setIsClosing(true) 
    setTimeout(() => {
      setComisariaSeleccionada(null) 
      setIsClosing(false)
    }, 300) 
  }

  const CHART_COLORS = ['#3b82f6', '#10b981', '#eab308', '#ef4444', '#8b5cf6', '#f97316'];
  const dataHistoricaLineas = [
    { name: 'Ene', causas: 24 }, { name: 'Feb', causas: 45 }, { name: 'Mar', causas: 31 },
    { name: 'Abr', causas: 56 }, { name: 'May', causas: 48 }, { name: 'Jun', causas: 62 }
  ];
  const dataBienesJuridicosPie = [
    { name: 'Contra la Propiedad', value: 91 }, { name: 'Contra las Personas', value: 46 }
  ];

  const mockResumen = [
    { id: 'dp10', tipo: 'Robo con Arma de Fuego', cantidad: 45, tendencia: 'alta' },
    { id: 'dp8', tipo: 'Hurtos', cantidad: 28, tendencia: 'media' },
    { id: 'dpn12', tipo: 'Lesiones', cantidad: 12, tendencia: 'baja' },
    { id: 'dpn8', tipo: 'Amenazas', cantidad: 31, tendencia: 'alta' },
    { id: 'dp9', tipo: 'Robo Simple/Agravado', cantidad: 18, tendencia: 'media' },
    { id: 'dpn4', tipo: 'Abuso Sexual con Acceso Carnal', cantidad: 3, tendencia: 'alta' },
  ]

  // =========================================================================
  // NUEVA LÓGICA DE EXPORTACIÓN NATIVA (Membrete + Tabla + Gráficos Fotografiados)
  // =========================================================================
  const exportarConsolaPDF = async () => {
    if (!comisariaSeleccionada) return;
    setIsExporting(true);
    
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // --- 1. MEMBRETE OFICIAL ---
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

      // --- 2. TÍTULO DEL REPORTE ---
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`REPORTE OPERATIVO: ${comisariaSeleccionada.nombre.toUpperCase()}`, 105, 52, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Período analizado: ${modalStartDate} al ${modalEndDate}`, 105, 58, { align: "center" });

      // --- 3. TABLA DE RESUMEN MENSUAL NATIVA ---
      autoTable(doc, {
        startY: 68,
        head: [['Tipificación del Delito', 'Total Registrado', 'Nivel de Alerta']],
        body: mockResumen.map(item => [item.tipo, item.cantidad, item.tendencia.toUpperCase()]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] }, 
        margin: { left: 15, right: 15 }
      });

      let finalY = doc.lastAutoTable.finalY + 15;

      // --- 4. CAPTURAR EL CONTENEDOR OCULTO DE GRÁFICOS ---
      const chartsElement = document.getElementById('export-charts-container-hidden');
      if (chartsElement) {
        const imgData = await toPng(chartsElement, { 
          quality: 1, 
          pixelRatio: 2, 
          backgroundColor: '#0f172a' 
        });
        
        // Dimensiones en el PDF (La hoja A4 tiene 210mm de ancho. 180mm nos deja márgenes perfectos)
        const pdfWidth = 180;
        const imgProps = doc.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // Si los gráficos no entran en la primera hoja, creamos una segunda hoja nueva
        if (finalY + pdfHeight > 280) {
          doc.addPage();
          finalY = 20;
        }

        // Título de la sección de gráficos
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("ANÁLISIS GRÁFICO JURISDICCIONAL", 105, finalY, { align: "center" });
        finalY += 8;

        // Pegamos la foto perfecta de los gráficos en el PDF
        doc.addImage(imgData, 'PNG', 15, finalY, pdfWidth, pdfHeight);
      }

      doc.save(`Reporte_COP_${comisariaSeleccionada.nombre.replace(/ /g, '_')}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF: " + (error.message || error));
    } finally {
      setIsExporting(false);
    }
  }


  const mockExpedientes = [
    { id: 'EXP-2026-0412', fecha: '2026-05-12', tipo: 'Robo con Arma de Fuego', modalidad: 'Motochorros', estado: 'En Investigación' },
    { id: 'EXP-2026-0514', fecha: '2026-05-14', tipo: 'Hurtos', modalidad: 'Escalamiento', estado: 'Cerrada / Sin efecto' },
    { id: 'EXP-2026-0518', fecha: '2026-05-18', tipo: 'Lesiones', modalidad: 'Riña en vía pública', estado: 'Aprehendido' },
    { id: 'EXP-2026-0522', fecha: '2026-05-22', tipo: 'Amenazas', modalidad: 'Vandalismo', estado: 'En Investigación' },
    { id: 'EXP-2026-0529', fecha: '2026-05-29', tipo: 'Robo Simple/Agravado', modalidad: 'Levantamiento en vía pública', estado: 'En Investigación' },
    { id: 'EXP-2026-0531', fecha: '2026-05-31', tipo: 'Abuso Sexual con Acceso Carnal', modalidad: 'Violencia de Género', estado: 'Medida Perimetral' },
  ]

  const expedientesFiltrados = useMemo(() => {
    return mockExpedientes.filter(exp => {
      const cumpleQuery = exp.id.toLowerCase().includes(searchExpediente.toLowerCase()) || 
                          exp.modalidad.toLowerCase().includes(searchExpediente.toLowerCase());
      const cumpleTipo = filterDelito === 'TODOS' || exp.tipo === filterDelito;
      return cumpleQuery && cumpleTipo;
    })
  }, [searchExpediente, filterDelito]);

  return (
    <div className="absolute inset-0 overflow-hidden z-0 flex flex-col">
      <MapContainer 
        center={centroRegionalEste} 
        zoom={10} 
        minZoom={9}
        maxBounds={tucumanBounds}
        maxBoundsViscosity={1.0} 
        zoomControl={false} 
        className="w-full h-full z-0"
        style={{ backgroundColor: '#0f172a' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapUpdater />
        <PinesPoliciales abrirConsola={abrirConsola} />
      </MapContainer>

      {comisariaSeleccionada && (
        <>
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-md z-[4000] cursor-pointer transition-opacity duration-300 ease-in-out ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={cerrarConsola}
          ></div>

          <div className={`absolute bottom-0 left-0 w-full h-[80vh] md:h-[55vh] bg-slate-950 border-t border-blue-500/30 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] flex flex-col z-[5000] transition-transform duration-300 ease-in-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}>
            
            <div className="flex flex-col flex-1 h-full w-full bg-slate-950 relative">

              <div className="absolute inset-y-0 right-10 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <img src={logoUre} alt="Marca de agua" className="w-[400px] h-[400px] object-contain grayscale" />
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-end px-4 md:px-8 pt-4 md:pt-5 pb-0 border-b border-slate-800/80 bg-slate-900/60 shrink-0 relative z-10 gap-4 md:gap-0">
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex items-center gap-4">
                    <img src={logoPolicia} alt="Escudo" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg md:text-xl font-bold text-slate-100 tracking-wide truncate">
                        {comisariaSeleccionada.nombre}
                      </h2>
                      <p className="text-[10px] md:text-[11px] text-blue-400 mt-0.5 font-medium tracking-widest uppercase opacity-80">
                        Unidad Regional Este | Tucumán
                      </p>
                    </div>
                    <button onClick={cerrarConsola} className="md:hidden p-2 text-slate-500 hover:text-white bg-slate-900 border border-slate-800 rounded-lg shrink-0">
                      <IconClose size={18} />
                    </button>
                  </div>

                  <div className="flex gap-4 md:gap-8 overflow-x-auto custom-scrollbar pb-1 -mb-1">
                    <button onClick={() => setActiveTab('resumen')} className={`flex items-center gap-2 pb-3 text-xs md:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'resumen' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                      <IconList size={14} className="md:w-4 md:h-4" /> Resumen Mensual
                    </button>
                    <button onClick={() => setActiveTab('expedientes')} className={`flex items-center gap-2 pb-3 text-xs md:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'expedientes' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                      <IconDatabase size={14} className="md:w-4 md:h-4" /> Expedientes (Excel)
                    </button>
                    <button onClick={() => setActiveTab('graficos')} className={`flex items-center gap-2 pb-3 text-xs md:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'graficos' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                      <IconPieChart size={14} className="md:w-4 md:h-4" /> Panel Gráfico
                    </button>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-4 pb-3 shrink-0">
                  <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 shadow-inner">
                    <IconCalendar size={14} className="text-slate-400" />
                    <div className="relative [&_.absolute]:!bottom-full [&_.absolute]:!top-auto [&_.absolute]:!mb-4 [&_.absolute]:!origin-bottom z-50">
                      <MonthPicker startDate={modalStartDate} endDate={modalEndDate} onDateChange={(s, e) => { setModalStartDate(s); setModalEndDate(e); }} />
                    </div>
                  </div>
                  <button 
                    onClick={exportarConsolaPDF}
                    disabled={isExporting}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <IconExport size={14} /> {isExporting ? 'Generando...' : 'Exportar a PDF'}
                  </button>
                  <div className="h-6 w-px bg-slate-800 mx-1"></div>
                  <button onClick={cerrarConsola} className="p-2 text-slate-500 hover:text-white bg-slate-900 hover:bg-red-500/20 hover:border-red-500/50 border border-slate-800 rounded-lg transition-all">
                    <IconClose size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-4 md:p-6 relative z-10 flex flex-col min-h-0">
                
                {activeTab === 'resumen' && (
                  <div className="animate-in fade-in duration-300 h-full flex flex-col min-h-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 shrink-0">
                      <h3 className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest">Consolidado de Causas (Último mes)</h3>
                      <button 
                        onClick={exportarConsolaPDF}
                        disabled={isExporting}
                        className="md:hidden self-start px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold rounded flex items-center gap-2 disabled:opacity-50"
                      >
                        <IconExport size={12} /> {isExporting ? '...' : 'PDF'}
                      </button>
                    </div>

                    <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl shadow-xl max-w-4xl w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                      <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[500px]">
                          <thead className="bg-[#0b1120] uppercase text-[9px] md:text-[10px] tracking-widest text-slate-500 border-b border-slate-800/60 sticky top-0 z-20">
                            <tr>
                              <th className="px-4 md:px-6 py-3 font-semibold w-1/2">Tipificación del Delito</th>
                              <th className="px-4 md:px-6 py-3 font-semibold text-center">Total Registrado</th>
                              <th className="px-4 md:px-6 py-3 font-semibold text-center">Nivel de Alerta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40">
                            {mockResumen.map((item, index) => (
                              <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-slate-200">{item.tipo}</td>
                                <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                                  <span className="text-lg md:text-xl font-bold text-slate-100">{item.cantidad}</span>
                                </td>
                                <td className="px-4 md:px-6 py-3 md:py-4 flex justify-center">
                                  <span className={`px-2 md:px-3 py-1 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                    item.tendencia === 'alta' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                    item.tendencia === 'media' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                  }`}>
                                    {item.tendencia}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'expedientes' && (
                  <div className="animate-in fade-in duration-300 h-full flex flex-col min-h-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-3 shrink-0">
                      <h3 className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest">Base Operativa Completa</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <select 
                          value={filterDelito}
                          onChange={(e) => setFilterDelito(e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-md px-3 py-1.5 md:py-2 focus:outline-none focus:border-blue-500"
                        >
                          <option value="TODOS">Todas las Tipificaciones</option>
                          {mockResumen.map(d => <option key={d.tipo} value={d.tipo}>{d.tipo}</option>)}
                        </select>
                        <div className="relative flex-1 sm:w-64">
                          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            type="text" 
                            placeholder="Buscar Expediente o Modalidad..." 
                            value={searchExpediente}
                            onChange={(e) => setSearchExpediente(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 text-xs md:text-sm text-slate-200 rounded-md pl-9 pr-4 py-1.5 md:py-2 focus:outline-none focus:border-blue-500 transition-colors shadow-inner" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl shadow-xl w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                      <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[700px]">
                          <thead className="bg-[#0b1120] uppercase text-[9px] md:text-[10px] tracking-widest text-slate-500 border-b border-slate-800/60 sticky top-0 z-20">
                            <tr>
                              <th className="px-4 md:px-6 py-3 font-semibold">N° Expediente</th>
                              <th className="px-4 md:px-6 py-3 font-semibold">Fecha</th>
                              <th className="px-4 md:px-6 py-3 font-semibold">Tipificación del Delito</th>
                              <th className="px-4 md:px-6 py-3 font-semibold">Modalidad de Ejecución</th>
                              <th className="px-4 md:px-6 py-3 font-semibold whitespace-nowrap">Estado Procesal Actual</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40">
                            {expedientesFiltrados.map((delito) => (
                              <tr key={delito.id} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-4 md:px-6 py-3 md:py-3.5 text-blue-400 font-medium whitespace-nowrap">{delito.id}</td>
                                <td className="px-4 md:px-6 py-3 md:py-3.5 text-slate-400 whitespace-nowrap">{delito.fecha}</td>
                                <td className="px-4 md:px-6 py-3 md:py-3.5">
                                  <span className={`px-2 py-1 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${delito.tipo.includes('Arma') || delito.tipo.includes('Homicidio') || delito.tipo.includes('Abuso') ? 'text-red-400 bg-red-500/5' : 'text-orange-400 bg-orange-500/5'}`}>
                                    {delito.tipo}
                                  </span>
                                </td>
                                <td className="px-4 md:px-6 py-3 md:py-3.5 text-slate-300 group-hover:text-slate-200 transition-colors">{delito.modalidad}</td>
                                <td className="px-4 md:px-6 py-3 md:py-3.5 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor] ${delito.estado === 'Aprehendido' ? 'bg-emerald-500 text-emerald-500' : delito.estado.includes('Investigación') ? 'bg-blue-500 text-blue-500' : 'bg-slate-500 text-slate-500'}`}></div>
                                    <span className="text-slate-300 font-medium text-[10px] md:text-xs tracking-wide">{delito.estado}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {expedientesFiltrados.length === 0 && (
                          <div className="text-center py-8 text-slate-500 text-xs">No se encontraron expedientes que coincidan con la búsqueda.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'graficos' && (
                  <div className="animate-in fade-in duration-300 h-full flex flex-col min-h-0">
                    <h3 className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 shrink-0">Resumen Analítico Jurisdiccional</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-4">
                        
                        <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4 flex flex-col h-64 lg:h-72">
                          <h4 className="text-[9px] md:text-[10px] uppercase text-slate-500 font-bold mb-3 tracking-widest text-center">Top Delitos Mensuales</h4>
                          <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={mockResumen.slice(0, 4)} layout="vertical" margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="tipo" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={130} />
                                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11 }} />
                                <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                                  {mockResumen.slice(0, 4).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4 flex flex-col h-64 lg:h-72 lg:col-span-1">
                          <h4 className="text-[9px] md:text-[10px] uppercase text-slate-500 font-bold mb-3 tracking-widest text-center">Evolución del Delito (6 meses)</h4>
                          <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={dataHistoricaLineas} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11 }} />
                                <Line type="monotone" dataKey="causas" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} activeDot={{ r: 5 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4 flex flex-col h-64 lg:h-72">
                          <h4 className="text-[9px] md:text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest text-center">Bienes Jurídicos Afectados</h4>
                          <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie 
                                  data={dataBienesJuridicosPie} 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={50} 
                                  outerRadius={65} 
                                  paddingAngle={4} 
                                  dataKey="value"
                                  label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                                >
                                  {dataBienesJuridicosPie.map((entry, index) => (
                                    <Cell key={`pie-cell-${index}`} fill={index === 0 ? "#ef4444" : "#f97316"} />
                                  ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11 }} />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute bottom-0 flex gap-4 text-[9px] text-slate-400 font-medium">
                              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Propiedad</div>
                              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Personas</div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* CONTENEDOR OCULTO PARA EXPORTACIÓN PERFECTA DE GRÁFICOS AL PDF */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', pointerEvents: 'none', opacity: 0 }}>
              <div id="export-charts-container-hidden" className="w-[1100px] h-[350px] bg-[#0f172a] p-6 flex gap-6">
                
                <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4 flex-1 flex flex-col items-center">
                  <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-3 tracking-widest text-center">Top Delitos Mensuales</h4>
                  <BarChart width={300} height={250} data={mockResumen.slice(0, 4)} layout="vertical" margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="tipo" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={130} />
                    <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                      {mockResumen.slice(0, 4).map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                    </Bar>
                  </BarChart>
                </div>

                <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4 flex-1 flex flex-col items-center">
                  <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-3 tracking-widest text-center">Evolución del Delito (6 meses)</h4>
                  <LineChart width={300} height={250} data={dataHistoricaLineas} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Line type="monotone" dataKey="causas" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} />
                  </LineChart>
                </div>

                <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-4 flex-1 flex flex-col items-center relative">
                  <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-widest text-center">Bienes Jurídicos Afectados</h4>
                  <PieChart width={300} height={250}>
                    <Pie data={dataBienesJuridicosPie} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={4} dataKey="value" label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}>
                      {dataBienesJuridicosPie.map((entry, index) => (<Cell key={`pie-cell-${index}`} fill={index === 0 ? "#ef4444" : "#f97316"} />))}
                    </Pie>
                  </PieChart>
                  <div className="absolute bottom-4 flex gap-4 text-[9px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Propiedad</div>
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Personas</div>
                  </div>
                </div>

              </div>
            </div>
            {/* --- FIN DEL CONTENEDOR OCULTO --- */}

          </div>
        </>
      )}
    </div>
  )
}