import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const MENU = [
  { path: '/dashboard',  icon: '⊞', label: 'Inicio' },
  { path: '/usuarios',   icon: '👤', label: 'Usuarios' },
  { path: '/descuentos', icon: '🏷️', label: 'Descuentos' },
  { path: '/convenios',  icon: '🤝', label: 'Convenios' },
  { path: '/camaras',    icon: '📷', label: 'Cámaras' },
  { path: '/vehiculos',  icon: '🚗', label: 'Vehículos' },
  { path: '/parqueadero',icon: '🅿️', label: 'Parqueadero' },
];

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [colapsado, setColapsado] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`navbar ${colapsado ? 'navbar--colapsado' : ''}`}>
      {/* Logo */}
      <div className="navbar__logo">
        <div className="navbar__logo-icono">
          <span>🅿</span>
        </div>
        {!colapsado && (
          <div className="navbar__logo-texto">
            <span className="navbar__logo-titulo">AutoSlot</span>
            <span className="navbar__logo-sub">Parqueadero</span>
          </div>
        )}
        <button className="navbar__colapsar" onClick={() => setColapsado(!colapsado)}>
          {colapsado ? '›' : '‹'}
        </button>
      </div>

      {/* Menú */}
      <nav className="navbar__menu">
        {!colapsado && <span className="navbar__seccion">MENÚ PRINCIPAL</span>}
        {MENU.map(({ path, icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `navbar__item ${isActive ? 'navbar__item--activo' : ''}`
            }
            title={colapsado ? label : ''}
          >
            <span className="navbar__item-icono">{icon}</span>
            {!colapsado && <span className="navbar__item-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Usuario */}
      <div className="navbar__footer">
        {!colapsado && (
          <div className="navbar__usuario">
            <div className="navbar__usuario-avatar">
              {usuario?.nombreUsuario?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="navbar__usuario-info">
              <span className="navbar__usuario-nombre">
                {usuario?.nombreCompleto || usuario?.nombreUsuario || 'Administrador'}
              </span>
              <span className="navbar__usuario-rol">Admin</span>
            </div>
          </div>
        )}
        <button className="navbar__logout" onClick={handleLogout} title="Cerrar sesión">
          <span>⬚</span>
          {!colapsado && <span>Salir</span>}
        </button>
      </div>
    </aside>
  );
}
