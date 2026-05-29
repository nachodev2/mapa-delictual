import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos el tiempo de inicialización de la app (3 segundos)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* AnimatePresence permite animar componentes cuando se desmontan (exit) */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          // Acá va a ir nuestro Login posteriormente
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center min-h-screen"
          >
            <h2 className="text-xl font-light text-slate-400 tracking-wider border border-slate-800 p-8 rounded-lg bg-slate-900/50 backdrop-blur-sm">
              Pantalla de Login en construcción...
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}