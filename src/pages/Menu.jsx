import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usuarioService, descuentoService, convenioService, camaraService } from '../services/api';
import './Menu.css';

const TARJETAS = [
  { key: 'usuarios',   label: 'Usuarios',   icono: '👤', color: '#2E75B6', ruta: '/usuarios',   },
  { key: 'descuentos', label: 'Descuentos', icono: '🏷️', color: '#F59E0B', ruta: '/descuentos', },
  { key: 'convenios',  label: 'Convenios',  icono: '🤝', color: '#10B981', ruta: '/convenios',  },
  { key: 'camaras',    label: 'Cámaras',    icono: '📷', color: '#8B5CF6', ruta: '/camaras',    },
];

export default function Dashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [totales, setTotales] = useState({ usuarios: 0, descuentos: 0, convenios: 0, camaras: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [u, d, c, cam] = await Promise.allSettled([
          usuarioService.listar(),
          descuentoService.listar(),
          convenioService.listar(),
          camaraService.listar(),
        ]);
        setTotales({
          usuarios:   u.status   === 'fulfilled' ? u.value.data.length   : 0,
          descuentos: d.status   === 'fulfilled' ? d.value.data.length   : 0,
          convenios:  c.status   === 'fulfilled' ? c.value.data.length   : 0,
          camaras:    cam.status === 'fulfilled' ? cam.value.data.length : 0,
        });
      } catch (e) { console.warn('Error cargando dashboard', e); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="pagina dashboard">
      {/* Encabezado */}
      <div className="dashboard__bienvenida">
        <div>
          <h1 className="dashboard__saludo">
            {saludo}, {usuario?.nombreCompleto?.split(' ')[0] || 'Administrador'} 👋
          </h1>
          <p className="dashboard__fecha">
            {new Date().toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <div className="dashboard__logo-badge">
          <span>🅿</span> AutoSlot
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="dashboard__grid">
        {TARJETAS.map(({ key, label, icono, color, ruta }, i) => (
          <div
            key={key}
            className="dashboard__tarjeta"
            style={{ animationDelay: `${i * 0.08}s`, '--color': color }}
            onClick={() => navigate(ruta)}
          >
            <div className="dashboard__tarjeta-icono" style={{ background: color + '22', color }}>
              {icono}
            </div>
            <div className="dashboard__tarjeta-info">
              <span className="dashboard__tarjeta-numero">
                {cargando ? '—' : totales[key]}
              </span>
              <span className="dashboard__tarjeta-label">{label} registrados</span>
            </div>
            <div className="dashboard__tarjeta-flecha">›</div>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="dashboard__secciones">
        <div className="card dashboard__accesos">
          <h3 className="dashboard__seccion-titulo">⚡ Accesos Rápidos</h3>
          <div className="dashboard__accesos-grid">
            {[
              { icono: '➕', label: 'Nuevo Usuario',   ruta: '/usuarios',   color: '#2E75B6' },
              { icono: '🏷️', label: 'Nuevo Descuento', ruta: '/descuentos', color: '#F59E0B' },
              { icono: '🤝', label: 'Nuevo Convenio',  ruta: '/convenios',  color: '#10B981' },
              { icono: '📷', label: 'Nueva Cámara',    ruta: '/camaras',    color: '#8B5CF6' },
              { icono: '🚗', label: 'Vehículos',       ruta: '/vehiculos',  color: '#EC4899' },
              { icono: '🅿️', label: 'Parqueadero',     ruta: '/parqueadero',color: '#0EA5E9' },
            ].map(({ icono, label, ruta, color }) => (
              <button
                key={label}
                className="dashboard__acceso-btn"
                style={{ '--acc-color': color }}
                onClick={() => navigate(ruta)}
              >
                <span className="dashboard__acceso-icono" style={{ background: color + '18', color }}>
                  {icono}
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card dashboard__info">
          <h3 className="dashboard__seccion-titulo">ℹ️ Estado del Sistema</h3>
          <div className="dashboard__estado-lista">
            {[
              { label: 'Backend Spring Boot', estado: 'Activo', ok: true },
              { label: 'Base de datos MySQL', estado: 'Conectada', ok: true },
              { label: 'API REST', estado: 'Funcionando', ok: true },
              { label: 'Puerto', estado: 'localhost:8080', ok: true },
            ].map(({ label, estado, ok }) => (
              <div key={label} className="dashboard__estado-item">
                <span className="dashboard__estado-punto" style={{ background: ok ? '#10B981' : '#EF4444' }} />
                <span className="dashboard__estado-label">{label}</span>
                <span className="dashboard__estado-valor">{estado}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
