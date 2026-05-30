import { APIProvider, Map } from '@vis.gl/react-google-maps'

export default function MapView() {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  // Coordenadas centrales de San Miguel de Tucumán
  const tucumanCenter = { lat: -26.808285, lng: -65.21759 }

  return (
    <div className="absolute inset-0">
      <APIProvider apiKey={API_KEY}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={tucumanCenter}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          colorScheme={'DARK'} // <-- LA SOLUCIÓN: Llama al dark mode nativo de Google
        />
      </APIProvider>
    </div>
  )
}
