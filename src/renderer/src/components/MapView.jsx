/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { APIProvider, Map, Marker, useApiIsLoaded } from '@vis.gl/react-google-maps'

import logoPolicia from '../assets/logo-policia.png' 

const comisariasRegionalEste = [
  { id: 1, nombre: 'DESTACAMENTO FRONTERIZO 7 DE ABRIL', lat: -26.2882, lng: -64.5005 },
  { id: 2, nombre: 'COMISARIA 7 DE ABRIL', lat: -26.2885, lng: -64.5008 },
  { id: 3, nombre: 'DESTACAMENTO FRONTERIZO LAGUNA DE ROBLES', lat: -26.2555, lng: -64.6498 },
  { id: 4, nombre: 'COMISARIA DE CHILCAS', lat: -26.3806, lng: -64.6843 },
  { id: 5, nombre: 'COMISARIA LOS PUESTITO', lat: -26.3501, lng: -64.6502 },
  { id: 6, nombre: 'COMISARIA DE BURRUYACU', lat: -26.5012, lng: -64.7410 },
  { id: 7, nombre: 'COMISARIA GOBERNADOR GARMENDIA', lat: -26.5702, lng: -64.5593 },
  { id: 8, nombre: 'COMISARIA VILLA PADRE MONTI', lat: -26.5100, lng: -64.9944 },
  { id: 9, nombre: 'COMISARIA EL CAJON', lat: -26.4705, lng: -64.8502 },
  { id: 10, nombre: 'COMISARIA BENJAMIN ARAOZ', lat: -26.5563, lng: -64.8018 },
  { id: 11, nombre: 'COMISARIA EL NARANJO', lat: -26.6460, lng: -65.0490 },
  { id: 12, nombre: 'COMISARIA DE LA RAMADA', lat: -26.6884, lng: -64.9465 },
  { id: 13, nombre: 'COMISARIA GOBERNADOR PIEDRABUENA', lat: -26.7384, lng: -64.6477 },
  { id: 14, nombre: 'COMISARIA EL TIMBO', lat: -26.6790, lng: -65.1358 },
  { id: 15, nombre: 'COMISARIA EL CHAÑAR', lat: -26.7578, lng: -65.0686 },
  { id: 16, nombre: 'DESTACAMENTO FRONTERIZO LAS CEJAS', lat: -26.8891, lng: -64.7415 },
  { id: 17, nombre: 'COMISARIA LOS RALOS', lat: -26.8885, lng: -65.0064 },
  { id: 18, nombre: 'COMISARIA LA FLORIDA', lat: -26.8195, lng: -65.0946 },
  { id: 19, nombre: 'COMISARIA ALDERETES', lat: -26.8194, lng: -65.1435 },
  { id: 20, nombre: 'COMISARIA DELFIN GALLO', lat: -26.8442, lng: -65.0940 },
  { id: 21, nombre: 'COMISARIA MARTIN M. DE GUEMES', lat: -26.8310, lng: -65.1678 },
  { id: 22, nombre: 'COMISARIA BANDA DEL RIO SALI', lat: -26.8443, lng: -65.1592 },
  { id: 23, nombre: 'DESTACAMENTO SOLDADO TUCUMANO', lat: -26.8491, lng: -65.1749 },
  { id: 24, nombre: 'UNIDAD REGIONAL ESTE (Sede)', lat: -26.8401, lng: -65.1658 },
  { id: 25, nombre: 'COMISARIA DE COLOMBRES', lat: -26.8965, lng: -65.1028 },
  { id: 26, nombre: 'COMISARIA POZO DEL ALTO', lat: -26.8992, lng: -65.1469 },
  { id: 27, nombre: 'COMISARIA DE RANCHILLOS', lat: -26.9528, lng: -65.0486 },
  { id: 28, nombre: 'DESTACAMENTO EL NARANJITO', lat: -26.9829, lng: -65.0373 },
  { id: 29, nombre: 'COMISARIA EL BRACHO', lat: -26.9905, lng: -65.1821 },
  { id: 30, nombre: 'COMISARIA LOS BULACIOS', lat: -26.9825, lng: -65.2179 },
  { id: 31, nombre: 'COMISARIA DE ESQUINA', lat: -27.0273, lng: -65.1943 },
  { id: 32, nombre: 'COMISARIA MANCOPA', lat: -27.0297, lng: -65.1509 },
  { id: 33, nombre: 'COMISARIA AGUA DULCE', lat: -27.0745, lng: -65.0361 },
  { id: 34, nombre: 'COMISARIA ESTACION ARAOZ', lat: -27.0557, lng: -64.9199 },
  { id: 35, nombre: 'DESTACAMENTO FRONTERIZO TACANAS', lat: -27.1403, lng: -64.8070 },
  { id: 36, nombre: 'COMISARIA DE QUILMES', lat: -27.0592, lng: -65.2180 },
  { id: 37, nombre: 'COMISARIA INGENIO LEALES', lat: -27.0688, lng: -65.2295 },
  { id: 38, nombre: 'COMISARIA LOS SUELDOS', lat: -27.0912, lng: -65.2604 },
  { id: 39, nombre: 'COMISARIA SANTA ROSA DE LEALES', lat: -27.1383, lng: -65.2614 },
  { id: 40, nombre: 'COMISARIA ROMERA POZO', lat: -27.1087, lng: -65.1849 },
  { id: 41, nombre: 'COMISARIA RIO COLORADO', lat: -27.1500, lng: -65.3569 },
  { id: 42, nombre: 'COMISARIA VILLA DE LEALES', lat: -27.1943, lng: -65.3095 },
  { id: 43, nombre: 'COMISARIA EL MOJON', lat: -27.2094, lng: -64.9304 },
  { id: 44, nombre: 'COMISARIA CAMPO QUIMIL', lat: -27.2571, lng: -64.8542 },
  { id: 45, nombre: 'COMISARIA LOS PUESTOS', lat: -27.2812, lng: -65.0183 },
  { id: 46, nombre: 'COMISARIA LOS GOMEZ', lat: -27.3240, lng: -65.2104 },
  { id: 47, nombre: 'DESTACAMENTO FRONTERIZO VALENTIN JIMENEZ', lat: -27.3709, lng: -64.9532 },
  { id: 48, nombre: 'COMISARIA LOS HERRERA', lat: -27.4133, lng: -65.0805 }
]

const PinesPoliciales = () => {
  const apiIsLoaded = useApiIsLoaded()
  
  const [comisariaSeleccionada, setComisariaSeleccionada] = useState(null)
  const [isClosing, setIsClosing] = useState(false)

  const abrirModal = (comisaria) => {
    setIsClosing(false)
    setComisariaSeleccionada(comisaria)
  }

  const cerrarModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setComisariaSeleccionada(null)
      setIsClosing(false)
    }, 200) 
  }

  if (!apiIsLoaded) return null

  return (
    <>
      {comisariasRegionalEste.map((comisaria) => (
        <Marker
          key={comisaria.id}
          position={{ lat: comisaria.lat, lng: comisaria.lng }}
          title={comisaria.nombre}
          onClick={() => abrirModal(comisaria)}
          icon={{
            url: logoPolicia,
            scaledSize: new window.google.maps.Size(30, 30) 
          }}
        />
      ))}

      {comisariaSeleccionada && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ease-in-out ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            onClick={cerrarModal}
            title="Hacé clic afuera para cerrar"
          ></div>
          
          <div className={`relative bg-[#0f172a] border border-slate-700 w-full max-w-4xl min-h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ease-in-out ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-in fade-in zoom-in-95'}`}>
            <div className="flex justify-between items-center bg-[#1e293b] px-6 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-blue-400">{comisariaSeleccionada.nombre}</h2>
                <p className="text-xs text-slate-400 mt-1">Gestión de causas y reportes de la dependencia</p>
              </div>
              <button 
                onClick={cerrarModal}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg p-2 transition-colors"
                title="Cerrar panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="p-6 flex-1 text-slate-300 flex flex-col gap-4">
              <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg mb-4 flex justify-between items-center">
                <p className="text-sm">
                  <span className="text-slate-500 font-medium">Ubicación GPS: </span> 
                  {comisariaSeleccionada.lat.toFixed(4)}, {comisariaSeleccionada.lng.toFixed(4)}
                </p>
                <p className="text-sm">
                  <span className="text-slate-500 font-medium">Jurisdicción: </span> 
                  Unidad Regional Este
                </p>
              </div>

              <div className="flex-1 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500 flex-col gap-2 p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <p>Área en construcción: Buscador de causas mensuales, mapa de calor local y tabla de delitos operativos.</p>
              </div>
            </div>

            <div className="bg-[#1e293b] px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button 
                onClick={cerrarModal}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cerrar
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg flex items-center gap-2 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Descargar Informe
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function MapView() {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  
  const centroRegionalEste = { lat: -26.8500, lng: -65.1200 }
  const tucumanBounds = { north: -26.0500, south: -28.0200, west: -66.1800, east: -64.4800 }

  return (
    <div className="absolute inset-0">
      <APIProvider apiKey={API_KEY}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={centroRegionalEste}
          defaultZoom={10} 
          minZoom={9}
          restriction={{
            latLngBounds: tucumanBounds,
            strictBounds: false
          }}
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
