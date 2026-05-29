import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Simulación de error para la demo (luego vendrá de Supabase)
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Simulamos la petición a Supabase
    setTimeout(() => {
      setIsSubmitting(false);
      console.log('Enviando credenciales unificadas:', formData);
      // Acá Supabase nos devolverá un JWT que contiene el 'role' del usuario.
      // Dependiendo de ese 'role', la app decidirá qué rutas o botones mostrar.
    }, 1500);
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Tarjeta de Login Unificada */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Detalle visual superior */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>

        {/* Formulario */}
        <div className="p-8 pt-10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-light text-slate-200 tracking-wide mb-2">
              Acceso al Sistema
            </h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Ingrese sus credenciales institucionales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                placeholder="correo@policia.tucuman.gov.ar"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Input Contraseña */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* Mensaje de Error Animado (Para cuando falle el login real) */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50"
              >
                <ShieldAlert size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg text-sm font-medium tracking-wide transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Autenticando...</span>
              ) : (
                <>
                  Ingresar
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
             <p className="text-[10px] text-slate-600 uppercase tracking-wider">
               El acceso no autorizado será reportado
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}