import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import Login from './components/Login';

// Componente Provisorio del Dashboard
function DashboardPlaceholder() {
  const { role, logout } = useAuth();
  
  // Si alguien intenta entrar acá sin loguearse por URL, lo pateamos al login
  if (!role) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl text-white mb-4">Bienvenido al Sistema</h1>
      <p className="text-blue-400 mb-8 text-xl">Tu nivel de acceso actual es: <strong className="uppercase">{role}</strong></p>
      
      <button 
        onClick={logout}
        className="px-6 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded hover:bg-red-600/40 transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

// Componente Principal de Enrutamiento
function AppRoutes() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
              {/* Redirección inicial */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<DashboardPlaceholder />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Raíz de la Aplicación (Envuelve con Contexto y Router)
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}