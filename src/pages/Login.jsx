import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ nombreUsuario: '', contrasena: '' });
  const [errores, setErrores]   = useState({});
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validar = () => {
    const e = {};
    if (!form.nombreUsuario.trim()) e.nombreUsuario = 'El usuario es obligatorio';
    if (!form.contrasena)           e.contrasena    = 'La contraseña es obligatoria';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validar();
    if (Object.keys(ev).length) { setErrores(ev); return; }
    setErrores({});
    setErrorMsg('');
    setCargando(true);

    try {
      // Acepta cualquier usuario y contraseña para pruebas del frontend
      await new Promise(r => setTimeout(r, 600));

      login({
        idUsuario: 1,
        nombreUsuario: form.nombreUsuario,
        nombreCompleto: form.nombreUsuario,
        estado: 'activo',
      });

      navigate('/dashboard');

    } catch (err) {
      setErrorMsg('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login">
      {/* Panel izquierdo decorativo */}
      <div className="login__panel">
        <div className="login__panel-contenido">
          <div className="login__marca">
            <div className="login__marca-icono">🅿</div>
            <span>AutoSlot</span>
          </div>
          <h1 className="login__panel-titulo">
            Gestión inteligente de parqueadero
          </h1>
          <p className="login__panel-sub">
            Controla usuarios, vehículos, convenios y más desde un solo lugar.
          </p>
          <div className="login__stats">
            {[
              ['📋', 'Módulos', '6+'],
              ['🔒', 'Seguro',  '100%'],
              ['⚡', 'Rápido',  'REST API'],
            ].map(([ic, lb, vl]) => (
              <div key={lb} className="login__stat">
                <span className="login__stat-icono">{ic}</span>
                <div>
                  <span className="login__stat-valor">{vl}</span>
                  <span className="login__stat-label">{lb}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="login__deco login__deco--1" />
        <div className="login__deco login__deco--2" />
        <div className="login__deco login__deco--3" />
      </div>

      {/* Panel derecho — formulario */}
      <div className="login__formulario-panel">
        <form className="login__formulario" onSubmit={handleSubmit} noValidate>
          <div className="login__formulario-header">
            <h2>Iniciar Sesión</h2>
            <p>Ingresa tus credenciales de acceso</p>
          </div>

          {errorMsg && (
            <div className="login__alerta">⚠️ {errorMsg}</div>
          )}

          <div className="form-grupo">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className={`form-input ${errores.nombreUsuario ? 'error' : ''}`}
              placeholder="Escribe tu usuario"
              value={form.nombreUsuario}
              onChange={e => setForm({ ...form, nombreUsuario: e.target.value })}
              autoComplete="username"
              autoFocus
            />
            {errores.nombreUsuario && (
              <span className="form-error">{errores.nombreUsuario}</span>
            )}
          </div>

          <div className="form-grupo">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className={`form-input ${errores.contrasena ? 'error' : ''}`}
              placeholder="••••••••"
              value={form.contrasena}
              onChange={e => setForm({ ...form, contrasena: e.target.value })}
              autoComplete="current-password"
            />
            {errores.contrasena && (
              <span className="form-error">{errores.contrasena}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--primario login__btn"
            disabled={cargando}
          >
            {cargando
              ? <><span className="login__spinner" /> Verificando...</>
              : <><span>🔐</span> Ingresar al sistema</>
            }
          </button>

          <p className="login__ayuda">
            Ingresa cualquier usuario y contraseña para continuar
          </p>
        </form>
      </div>
    </div>
  );
}