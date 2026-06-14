import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    try {
      const u = localStorage.getItem('autoslot_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const login = (datos) => {
    setUsuario(datos);
    localStorage.setItem('autoslot_user', JSON.stringify(datos));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('autoslot_user');
    localStorage.removeItem('autoslot_token');
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      login,
      logout,
      estaAutenticado: !!usuario,
      cargando: false,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};