import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, User, ChevronRight, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom' // NUEVO
import { useAuth } from '../context/AuthContext' // NUEVO

export default function Login() {
  const navigate = useNavigate() // Hook para cambiar de pantalla
  const { login } = useAuth() // Hook para guardar la sesión global

  const [formData, setFormData] = useState({ username: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [globalError, setGlobalError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' })
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const savedUsername = localStorage.getItem('policia_tucuman_user')
    if (savedUsername) {
      setFormData((prev) => ({ ...prev, username: savedUsername }))
      setRememberMe(true)
    }
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = { username: '', password: '' }

    const userToValidate = formData.username.trim()
    const passToValidate = formData.password.trim()

    const usernameRegex = /^[a-zA-Z0-9_.-]+$/

    if (userToValidate.length < 4) {
      newErrors.username = 'El usuario debe tener al menos 4 caracteres.'
      isValid = false
    } else if (!usernameRegex.test(userToValidate)) {
      newErrors.username = 'Caracteres inválidos. Use letras, números o guiones.'
      isValid = false
    }

    if (passToValidate.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
      isValid = false
    }

    setFieldErrors(newErrors)

    if (!isValid) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }

    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setGlobalError('')

    if (!validateForm()) return

    setIsSubmitting(true)

    const inputUser = formData.username.trim()
    const inputPass = formData.password.trim()

    if (rememberMe) {
      localStorage.setItem('policia_tucuman_user', inputUser)
    } else {
      localStorage.removeItem('policia_tucuman_user')
    }

    // Simulamos un pequeño delay de carga para la UX
    setTimeout(() => {
      setIsSubmitting(false)

      // Verificamos contra las variables de entorno de VITE
      if (
        inputUser === import.meta.env.VITE_ADMIN_USERNAME &&
        inputPass === import.meta.env.VITE_ADMIN_PASSWORD
      ) {
        login('admin')
        navigate('/dashboard')
      } else if (
        inputUser === import.meta.env.VITE_OPERADOR_USERNAME &&
        inputPass === import.meta.env.VITE_OPERADOR_PASSWORD
      ) {
        login('operador')
        navigate('/dashboard')
      } else if (
        inputUser === import.meta.env.VITE_USER_USERNAME &&
        inputPass === import.meta.env.VITE_USER_PASSWORD
      ) {
        login('user')
        navigate('/dashboard')
      } else {
        // Credenciales incorrectas
        setGlobalError('Usuario o contraseña incorrectos. Verifique sus credenciales.')
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    }, 1200)
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600"></div>

        <div className="p-8 pt-10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-light text-slate-200 tracking-wide mb-2">
              Acceso al Sistema
            </h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Ingrese su usuario asignado
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Input Usuario */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User size={18} className={fieldErrors.username ? 'text-red-400' : ''} />
                </div>
                <input
                  type="text"
                  placeholder="Ej: operador_norte"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-950/50 border rounded-lg text-slate-200 text-sm focus:outline-none transition-all placeholder:text-slate-600
                    ${
                      fieldErrors.username
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                        : 'border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50'
                    }`}
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value })
                    if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: '' })
                  }}
                  autoComplete="off"
                />
              </div>
              <AnimatePresence>
                {fieldErrors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs mt-1.5 ml-1"
                  >
                    {fieldErrors.username}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Input Contraseña */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} className={fieldErrors.password ? 'text-red-400' : ''} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-slate-950/50 border rounded-lg text-slate-200 text-sm focus:outline-none transition-all placeholder:text-slate-600
                    ${
                      fieldErrors.password
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                        : 'border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50'
                    }`}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                {fieldErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs mt-1.5 ml-1"
                  >
                    {fieldErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Checkbox Recordarme Animado */}
            <div
              className="flex items-center gap-2 mt-1 cursor-pointer w-max group"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center transition-colors border 
                ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-slate-950/50 border-slate-700 group-hover:border-slate-500'}`}
              >
                <AnimatePresence>
                  {rememberMe && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-3 h-3 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </motion.svg>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs text-slate-400 select-none group-hover:text-slate-300 transition-colors">
                Recordar mi usuario en este equipo
              </span>
            </div>

            {/* Error Global */}
            <AnimatePresence>
              {globalError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50 mt-2">
                    <ShieldAlert size={16} className="shrink-0" />
                    <span>{globalError}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg text-sm font-medium tracking-wide transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Verificando acceso...</span>
              ) : (
                <>
                  Iniciar Sesión
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">
              Sistema de uso exclusivo policial. Todo acceso es auditado.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
