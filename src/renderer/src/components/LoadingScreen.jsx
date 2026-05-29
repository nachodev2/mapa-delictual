import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function LoadingScreen() {
  return (
    // Contenedor principal que ocupa toda la pantalla con fondo oscuro
    <motion.div 
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <motion.div 
        className="flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Ícono institucional */}
        <Shield className="w-20 h-20 text-blue-500 mb-6" strokeWidth={1} />
        
        {/* Tipografía limpia y espaciada */}
        <h1 className="text-2xl font-light text-slate-200 tracking-[0.3em] mb-8 uppercase text-center">
          Policía de Tucumán
          <span className="block text-xs text-blue-400/70 tracking-widest mt-2 font-medium">
            Sistema de Inteligencia Geoespacial
          </span>
        </h1>

        {/* Barra de progreso animada */}
        <div className="w-64 h-[2px] bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </div>

        {/* Texto de estado parpadeante sutil */}
        <motion.p 
          className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          Inicializando módulos...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}