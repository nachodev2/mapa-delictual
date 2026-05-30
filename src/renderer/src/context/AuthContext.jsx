import { createContext, useContext, useState } from 'react'

// Creamos el contexto
const AuthContext = createContext()

// Proveedor del contexto que envolverá nuestra app
export function AuthProvider({ children }) {
  // 'role' puede ser: null (no logueado), 'user', 'operador', o 'admin'
  const [role, setRole] = useState(null)

  const login = (userRole) => {
    setRole(userRole)
  }

  const logout = () => {
    setRole(null)
  }

  return <AuthContext.Provider value={{ role, login, logout }}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext)
