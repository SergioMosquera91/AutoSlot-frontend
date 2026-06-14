import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RutaProtegida: Componente que protege rutas privadas.
 * Si el usuario no está autenticado, redirige al Login.
 */
export default function RutaProtegida({ children }) {
  const { estaAutenticado, cargando } = useAuth();

  // Mientras verifica la sesión guardada, muestra pantalla de carga
  if (cargando) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gris-100)',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 48, height: 48,
          border: '4px solid var(--azul-200)',
          borderTopColor: 'var(--azul-600)',
          borderRadius: '50%',
          animation: 'spin .7s linear infinite',
        }} />
        <p style={{ color: 'var(--azul-600)', fontFamily: 'var(--fuente-titulo)', fontWeight: 600 }}>
          Cargando AutoSlot...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Si no está autenticado, redirige al login
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, muestra el contenido protegido
  return children;
}
