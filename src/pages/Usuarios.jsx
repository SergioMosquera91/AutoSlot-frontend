import React, { useState, useEffect } from 'react';
import { usuarioService } from '../services/api';

const ESTADO_INICIAL = {
  nombreUsuario: '', contrasena: '', nombreCompleto: '',
  correo: '', telefono: '', estado: 'activo', aceptaNotificaciones: true,
};

const ESTADOS = ['activo', 'inactivo', 'bloqueado'];

export default function Usuarios() {
  const [lista, setLista]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(ESTADO_INICIAL);
  const [errores, setErrores]     = useState({});
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast]         = useState(null);
  const [busqueda, setBusqueda]   = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await usuarioService.listar();
      setLista(res.data);
    } catch { mostrarToast('Error al cargar usuarios', 'error'); }
    finally { setCargando(false); }
  };

  const mostrarToast = (msg, tipo = 'exito') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const validar = () => {
    const e = {};
    if (!form.nombreUsuario.trim())  e.nombreUsuario  = 'Campo obligatorio';
    if (!form.nombreCompleto.trim()) e.nombreCompleto = 'Campo obligatorio';
    if (!form.correo.trim())         e.correo         = 'Campo obligatorio';
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = 'Correo inválido';
    if (!form.contrasena && !form.idUsuario) e.contrasena = 'Campo obligatorio';
    if (form.contrasena && form.contrasena.length < 4)
      e.contrasena = 'Mínimo 4 caracteres';
    if (form.nombreUsuario.length > 50)
      e.nombreUsuario = 'Máximo 50 caracteres';
    if (form.nombreCompleto.length > 150)
      e.nombreCompleto = 'Máximo 150 caracteres';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e_ = validar();
    if (Object.keys(e_).length) { setErrores(e_); return; }
    setErrores({}); setGuardando(true);
    try {
      await usuarioService.crear(form);
      mostrarToast('Usuario registrado correctamente ✓');
      setModal(false);
      setForm(ESTADO_INICIAL);
      cargar();
    } catch (err) {
      const msg = err.response?.status === 500
        ? 'El correo o usuario ya existe en el sistema'
        : 'Error al guardar el usuario';
      mostrarToast(msg, 'error');
    } finally { setGuardando(false); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar este usuario?')) return;
    try {
      await usuarioService.eliminar(id);
      mostrarToast('Usuario eliminado');
      cargar();
    } catch { mostrarToast('No se pudo eliminar', 'error'); }
  };

  const listaFiltrada = lista.filter(u =>
    u.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.nombreUsuario?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="pagina">
      {/* Encabezado */}
      <div className="pagina__encabezado">
        <div>
          <h1 className="pagina__titulo">👤 Usuarios</h1>
          <p className="pagina__sub">Gestión de usuarios del sistema AutoSlot</p>
        </div>
        <button className="btn btn--primario" onClick={() => { setForm(ESTADO_INICIAL); setErrores({}); setModal(true); }}>
          ＋ Nuevo Usuario
        </button>
      </div>

      {/* Búsqueda */}
      <div className="card" style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="🔍  Buscar por nombre, correo o usuario..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Tabla */}
      <div className="card">
        {cargando ? (
          <div className="cargando">Cargando usuarios...</div>
        ) : listaFiltrada.length === 0 ? (
          <div className="vacio">
            <div className="vacio__icono">👤</div>
            <p className="vacio__texto">{busqueda ? 'Sin resultados' : 'No hay usuarios registrados'}</p>
          </div>
        ) : (
          <div className="tabla-wrapper">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Usuario</th>
                  <th>Nombre completo</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Notif.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((u, i) => (
                  <tr key={u.idUsuario}>
                    <td>{i + 1}</td>
                    <td><strong>{u.nombreUsuario}</strong></td>
                    <td>{u.nombreCompleto}</td>
                    <td>{u.correo}</td>
                    <td>{u.telefono || '—'}</td>
                    <td>
                      <span className={`badge ${u.estado === 'activo' ? 'badge--verde' : u.estado === 'bloqueado' ? 'badge--rojo' : 'badge--ambar'}`}>
                        {u.estado}
                      </span>
                    </td>
                    <td>{u.aceptaNotificaciones ? '✅' : '❌'}</td>
                    <td>
                      <button
                        className="btn btn--peligro"
                        style={{ padding: '5px 12px', fontSize: '.8rem' }}
                        onClick={() => handleEliminar(u.idUsuario)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__titulo">➕ Nuevo Usuario</h3>
              <button className="modal__cerrar" onClick={() => setModal(false)}>✕</button>
            </div>
            <form className="modal__cuerpo" onSubmit={handleSubmit} noValidate>
              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Usuario *</label>
                  <input className={`form-input ${errores.nombreUsuario ? 'error' : ''}`}
                    value={form.nombreUsuario} maxLength={50}
                    onChange={e => setForm({ ...form, nombreUsuario: e.target.value })}
                    placeholder="ej: jperez" />
                  {errores.nombreUsuario && <span className="form-error">{errores.nombreUsuario}</span>}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Contraseña *</label>
                  <input className={`form-input ${errores.contrasena ? 'error' : ''}`}
                    type="password" value={form.contrasena}
                    onChange={e => setForm({ ...form, contrasena: e.target.value })}
                    placeholder="••••••••" />
                  {errores.contrasena && <span className="form-error">{errores.contrasena}</span>}
                </div>
              </div>
              <div className="form-grupo">
                <label className="form-label">Nombre completo *</label>
                <input className={`form-input ${errores.nombreCompleto ? 'error' : ''}`}
                  value={form.nombreCompleto} maxLength={150}
                  onChange={e => setForm({ ...form, nombreCompleto: e.target.value })}
                  placeholder="ej: Juan Pérez López" />
                {errores.nombreCompleto && <span className="form-error">{errores.nombreCompleto}</span>}
              </div>
              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Correo electrónico *</label>
                  <input className={`form-input ${errores.correo ? 'error' : ''}`}
                    type="email" value={form.correo}
                    onChange={e => setForm({ ...form, correo: e.target.value })}
                    placeholder="juan@ejemplo.com" />
                  {errores.correo && <span className="form-error">{errores.correo}</span>}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" value={form.telefono} maxLength={20}
                    onChange={e => setForm({ ...form, telefono: e.target.value.replace(/[^0-9+\-\s]/g, '') })}
                    placeholder="3001234567" />
                </div>
              </div>
              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Estado</label>
                  <select className="form-input" value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}>
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-grupo">
                  <label className="form-label">Notificaciones</label>
                  <select className="form-input" value={form.aceptaNotificaciones}
                    onChange={e => setForm({ ...form, aceptaNotificaciones: e.target.value === 'true' })}>
                    <option value="true">Activadas</option>
                    <option value="false">Desactivadas</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn--primario" disabled={guardando}>
                  {guardando ? '⏳ Guardando...' : '💾 Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast toast--${toast.tipo}`}>{toast.tipo === 'exito' ? '✅' : '❌'} {toast.msg}</div>}
    </div>
  );
}
