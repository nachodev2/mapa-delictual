/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoadingScreen from './components/LoadingScreen'
import Login from './components/Login'
import DashboardLayout from './components/layout/DashboardLayout'
import MapView from './components/MapView'

// 1. IMPORTAMOS TU NUEVO COMPONENTE DE CARGA DE EXCEL AQUÍ:
import UploadView from './components/layout/UploadView'

// 2. (Borramos la función UploadView falsa que estaba acá)

function AdminView() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl text-slate-200 mb-4">Panel de Administración</h2>
      <p className="text-slate-500">Ajustes y resolución de conflictos geográficos...</p>
    </div>
  )
}

// Enrutador de Rutas Protegidas
function ProtectedRoute({ children, allowedRoles }) {
  const { role } = useAuth()

  if (!role) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />

  return children
}

function AppRoutes() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full min-h-screen"
          >
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* RUTAS DEL DASHBOARD (Envueltas en el Layout) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* El "index" es lo que carga por defecto en /dashboard (El Mapa) */}
                <Route index element={<MapView />} />

                {/* Rutas protegidas por Rol */}
                <Route
                  path="upload"
                  element={
                    <ProtectedRoute allowedRoles={['operador', 'admin']}>
                      <UploadView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminView />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}