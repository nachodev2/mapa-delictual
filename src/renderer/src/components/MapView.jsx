/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { useState } from 'react'
import { APIProvider, Map, Marker, useApiIsLoaded } from '@vis.gl/react-google-maps'
import { useOutletContext } from 'react-router-dom' 

// Importamos los logos 
import logoPolicia from '../assets/logo-policia.png' 
import logoUre from '../assets/logo-ure.png' 

import { comisariasRegionalEste } from '../data/policiaData' 
import MonthPicker from './MonthPicker' 

// ==========================================
// ÍCONOS NATIVOS EN SVG
// ==========================================
const IconList = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconDatabase = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IconPieChart = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const IconCalendar = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconSearch = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconExport = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const IconClose = ({ size = 16, className = "" }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const PinesPoliciales = () => {
  const apiIsLoaded = useApiIsLoaded()
  const { selectedComisarias } = useOutletContext() || { selectedComisarias: [] }
  
  const [comisariaSeleccionada, setComisariaSeleccionada] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const [activeTab, setActiveTab] = useState('resumen')

  const currentMonth = new Date().toISOString().slice(0, 7)
  const [modalStartDate, setModalStartDate] = useState('2026-05')
  const [modalEndDate, setModalEndDate] = useState(currentMonth)

  const abrirConsola = (comisaria) => {
    setIsClosing(false)
    setActiveTab('resumen')
    setComisariaSeleccionada(comisaria)
  }

  const cerrarConsola = () => {
    setIsClosing(true) 
    setTimeout(() => {
      setComisariaSeleccionada(null) 
      setIsClosing(false)
    }, 300) 
  }

  // =========================================================================
  // DATA MOCK 1: Resumen Agrupado (Adaptado a tus arrays reales)
  // =========================================================================
  const mockResumen = [
    { id: 'dp10', tipo: 'Robo con Arma de Fuego', cantidad: 45, tendencia: 'alta' },
    { id: 'dp8', tipo: 'Hurtos', cantidad: 28, tendencia: 'media' },
    { id: 'dpn12', tipo: 'Lesiones', cantidad: 12, tendencia: 'baja' },
    { id: 'dpn8', tipo: 'Amenazas', cantidad: 31, tendencia: 'alta' },
    { id: 'dp9', tipo: 'Robo Simple/Agravado', cantidad: 18, tendencia: 'media' },
    { id: 'dpn4', tipo: 'Abuso Sexual con Acceso Carnal', cantidad: 3, tendencia: 'alta' },
  ]

  // =========================================================================
  // DATA MOCK 2: Base Cruda tipo Excel (Adaptada a tus arrays reales)
  // =========================================================================
  const mockExpedientes = [
    { id: 1, fecha: '2026-05-12', tipo: 'Robo con Arma de Fuego', modalidad: 'Motochorros', estado: 'En Investigación' },
    { id: 2, fecha: '2026-05-14', tipo: 'Hurtos', modalidad: 'Escalamiento', estado: 'Cerrada / Sin efecto' },
    { id: 3, fecha: '2026-05-18', tipo: 'Lesiones', modalidad: 'Riña en vía pública', estado: 'Aprehendido' },
    { id: 4, fecha: '2026-05-22', tipo: 'Daños', modalidad: 'Vandalismo', estado: 'En Investigación' },
    { id: 5, fecha: '2026-05-29', tipo: 'Robo Simple/Agravado', modalidad: 'Levantamiento en vía pública', estado: 'En Investigación' },
    { id: 6, fecha: '2026-05-31', tipo: 'Amenazas', modalidad: 'Violencia de Género', estado: 'Medida Perimetral' },
  ]

  if (!apiIsLoaded) return null

  return (
    <>
      {comisariasRegionalEste
        .filter((comisaria) => selectedComisarias.includes(comisaria.id))
        .map((comisaria) => (
        <Marker
          key={comisaria.id}
          position={{ lat: comisaria.lat, lng: comisaria.lng }}
          title={comisaria.nombre}
          onClick={() => abrirConsola(comisaria)}
          icon={{
            url: logoPolicia,
            scaledSize: new window.google.maps.Size(30, 30) 
          }}
        />
      ))}

      {comisariaSeleccionada && (
        <>
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-md z-40 cursor-pointer transition-opacity duration-300 ease-in-out ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={cerrarConsola}
            title="Hacé clic aquí para volver al mapa"
          ></div>

          <div className={`absolute bottom-0 left-0 w-full h-[55vh] bg-slate-950 border-t border-blue-500/30 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] flex flex-col z-50 transition-transform duration-300 ease-in-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}>
            
            <div className="absolute inset-y-0 right-10 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <img src={logoUre} alt="Marca de agua" className="w-[400px] h-[400px] object-contain grayscale" />
            </div>

            <div className="flex justify-between items-end px-8 pt-5 pb-0 border-b border-slate-800/80 bg-slate-900/60 shrink-0 relative z-10">
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img src={logoPolicia} alt="Escudo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 tracking-wide">
                      {comisariaSeleccionada.nombre}
                    </h2>
                    <p className="text-[11px] text-blue-400 mt-0.5 font-medium tracking-widest uppercase opacity-80">
                      Unidad Regional Este | Tucumán
                    </p>
                  </div>
                </div>

                <div className="flex gap-8">
                  <button 
                    onClick={() => setActiveTab('resumen')} 
                    className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'resumen' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <IconList size={16} /> Resumen Mensual
                  </button>
                  <button 
                    onClick={() => setActiveTab('expedientes')} 
                    className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'expedientes' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <IconDatabase size={16} /> Expedientes (Excel)
                  </button>
                  <button 
                    onClick={() => setActiveTab('graficos')} 
                    className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'graficos' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <IconPieChart size={16} /> Panel Gráfico
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pb-3">
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 shadow-inner">
                  <IconCalendar size={14} className="text-slate-400" />
                  <div className="relative [&_.absolute]:!bottom-full [&_.absolute]:!top-auto [&_.absolute]:!mb-4 [&_.absolute]:!origin-bottom z-50">
                    <MonthPicker startDate={modalStartDate} endDate={modalEndDate} onDateChange={(s, e) => { setModalStartDate(s); setModalEndDate(e); }} />
                  </div>
                </div>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all">
                  <IconExport size={14} /> Exportar
                </button>
                <div className="h-6 w-px bg-slate-800 mx-1"></div>
                <button onClick={cerrarConsola} className="p-2 text-slate-500 hover:text-white bg-slate-900 hover:bg-red-500/20 hover:border-red-500/50 border border-slate-800 rounded-lg transition-all" title="Cerrar Consola">
                  <IconClose size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
              
              {activeTab === 'resumen' && (
                <div className="animate-in fade-in duration-300 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                      Consolidado de Causas
                    </h3>
                  </div>

                  <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl max-w-4xl">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-900/80 uppercase text-[10px] tracking-widest text-slate-500 border-b border-slate-800/60">
                        <tr>
                          <th className="px-6 py-3 font-semibold w-1/2">Tipificación del Delito</th>
                          <th className="px-6 py-3 font-semibold text-center">Total Registrado</th>
                          <th className="px-6 py-3 font-semibold text-center">Nivel de Alerta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {mockResumen.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4 font-medium text-slate-200">{item.tipo}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-xl font-bold text-slate-100">{item.cantidad}</span>
                            </td>
                            <td className="px-6 py-4 flex justify-center">
                              <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
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
              )}

              {activeTab === 'expedientes' && (
                <div className="animate-in fade-in duration-300 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                      Base Operativa Completa
                    </h3>
                    <div className="relative">
                      <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" placeholder="Buscar DNI, Fecha o Expediente..." className="w-72 bg-slate-900/50 border border-slate-800 text-sm text-slate-200 rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-blue-500 transition-colors shadow-inner" />
                    </div>
                  </div>

                  <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-900/80 uppercase text-[10px] tracking-widest text-slate-500 border-b border-slate-800/60">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Fecha</th>
                          <th className="px-6 py-3 font-semibold">Tipificación del Delito</th>
                          <th className="px-6 py-3 font-semibold">Modalidad de Ejecución</th>
                          <th className="px-6 py-3 font-semibold">Estado Procesal Actual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {mockExpedientes.map((delito) => (
                          <tr key={delito.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-3.5 text-slate-200 font-medium whitespace-nowrap">{delito.fecha}</td>
                            <td className="px-6 py-3.5">
                              {/* Lógica de colores adaptada a las tipificaciones */}
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${delito.tipo.includes('Arma') || delito.tipo.includes('Homicidio') || delito.tipo.includes('Abuso') ? 'text-red-400' : 'text-orange-400'}`}>
                                {delito.tipo}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-slate-400 group-hover:text-slate-300 transition-colors">{delito.modalidad}</td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor] ${delito.estado === 'Aprehendido' ? 'bg-emerald-500 text-emerald-500' : delito.estado.includes('Investigación') ? 'bg-blue-500 text-blue-500' : 'bg-slate-500 text-slate-500'}`}></div>
                                <span className="text-slate-300 font-medium text-xs tracking-wide">{delito.estado}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'graficos' && (
                <div className="animate-in fade-in duration-300 h-full flex flex-col">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Resumen Analítico Jurisdiccional
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-6 shadow-lg">
                      <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-5 tracking-widest text-center">Concentración por Tipología</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-300">Robo con Arma de Fuego</span><span className="text-slate-100 font-bold">35%</span></div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800"><div className="bg-red-500 h-full rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" style={{width: '35%'}}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-300">Hurtos</span><span className="text-slate-100 font-bold">25%</span></div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800"><div className="bg-orange-500 h-full rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" style={{width: '25%'}}></div></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-300">Lesiones</span><span className="text-slate-100 font-bold">20%</span></div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800"><div className="bg-yellow-500 h-full rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]" style={{width: '20%'}}></div></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-6 flex items-center justify-center gap-12 shadow-lg">
                      <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]" style={{ background: 'conic-gradient(#3b82f6 0% 45%, #10b981 45% 75%, #334155 75% 100%)' }}>
                        <div className="absolute w-24 h-24 bg-[#0b1120] rounded-full flex items-center justify-center flex-col border border-slate-800/50">
                          <span className="text-2xl font-black text-slate-100">137</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Expedientes</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4 text-xs text-slate-300 font-medium">
                        <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div> En Proceso de Inv.</div>
                        <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div> Causa Resuelta</div>
                        <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-slate-600"></div> Archivo / Desestimada</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </>
  )
}

export default function MapView() {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const centroRegionalEste = { lat: -26.8500, lng: -65.1200 }
  const tucumanBounds = { north: -26.0500, south: -28.0200, west: -66.1800, east: -64.4800 }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <APIProvider apiKey={API_KEY}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={centroRegionalEste}
          defaultZoom={10} 
          minZoom={9}
          restriction={{ latLngBounds: tucumanBounds, strictBounds: false }}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          colorScheme={'DARK'}
        >
          <PinesPoliciales />
        </Map>
      </APIProvider>
    </div>
  )
}
