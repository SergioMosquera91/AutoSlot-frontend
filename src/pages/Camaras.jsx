import React, { useState, useEffect } from 'react';
import { camaraService } from '../services/api';

const INICIAL = {
  idParqueadero: 1,
  nombre: '',
  ipCamara: '',
  marca: '',
  modelo: '',
  ubicacion: '',
  tipo: 'entrada',
  estado: 'activa',
  fechaInstalacion: '',
  ultimaRevision: '',
};

const TIPOS   = ['entrada', 'salida', 'zona_general'];
const ESTADOS = ['activa', 'inactiva', 'en_mantenimiento'];

const colorTipo = { entrada: 'badge--verde', salida: 'badge--rojo', zona_general: 'badge--azul' };
const colorEstado = { activa: 'badge--verde', inactiva: 'badge--rojo', en_mantenimiento: 'badge--ambar' };

export default function Camaras() {
  const [lista, setLista]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(INICIAL);
  const [errores, setErrores]     = useState({});
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast]         = useState(null);
  const [busqueda, setBusqueda]   = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await camaraService.listar();
      setLista(r.data);
    } catch {
      mostrarToast('Error al cargar cámaras', 'error');
    } finally {
      setCargando(false);
    }
  };

  const mostrarToast = (msg, tipo = 'exito') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Campo obligatorio';
    if (form.nombre.length > 80) e.nombre = 'Máximo 80 caracteres';
    if (!form.tipo) e.tipo = 'Selecciona un tipo';
    if (!form.estado) e.estado = 'Selecciona un estado';
    if (form.ipCamara && !/^(\d{1,3}\.){3}\d{1,3}$/.test(form.ipCamara))
      e.ipCamara = 'Formato IP inválido (ej: 192.168.1.100)';
    if (form.ubicacion.length > 150)
      e.ubicacion = 'Máximo 150 caracteres';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validar();
    if (Object.keys(ev).length) { setErrores(ev); return; }
    setErrores({});
    setGuardando(true);
    try {
      await camaraService.crear(form);
      mostrarToast('Cámara registrada correctamente ✓');
      setModal(false);
      setForm(INICIAL);
      cargar();
    } catch {
      mostrarToast('Error al guardar la cámara', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta cámara?')) return;
    try {
      await camaraService.eliminar(id);
      mostrarToast('Cámara eliminada');
      cargar();
    } catch {
      mostrarToast('No se pudo eliminar', 'error');
    }
  };

  const listaFiltrada = lista.filter(c => {
    const coincideBusqueda =
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.ubicacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.marca?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo === 'todos' || c.tipo === filtroTipo;
    return coincideBusqueda && coincideTipo;
  });

  return (
    <div className="pagina">
      {/* Encabezado */}
      <div className="pagina__encabezado">
        <div>
          <h1 className="pagina__titulo">📷 Cámaras</h1>
          <p className="pagina__sub">Inventario de cámaras de vigilancia del parqueadero</p>
        </div>
        <button
          className="btn btn--primario"
          style={{ background: '#8B5CF6', boxShadow: '0 4px 12px rgba(139,92,246,.3)' }}
          onClick={() => { setForm(INICIAL); setErrores({}); setModal(true); }}
        >
          ＋ Nueva Cámara
        </button>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          placeholder="🔍  Buscar por nombre, marca o ubicación..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select
          className="form-input"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="todos">Todos los tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{ color: 'var(--gris-500)', fontSize: '.85rem' }}>
          {listaFiltrada.length} cámara(s) encontrada(s)
        </span>
      </div>

      {/* Tabla */}
      <div className="card">
        {cargando ? (
          <div className="cargando">Cargando cámaras...</div>
        ) : listaFiltrada.length === 0 ? (
          <div className="vacio">
            <div className="vacio__icono">📷</div>
            <p className="vacio__texto">
              {busqueda || filtroTipo !== 'todos'
                ? 'Sin resultados con ese filtro'
                : 'No hay cámaras registradas'}
            </p>
          </div>
        ) : (
          <div className="tabla-wrapper">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>IP</th>
                  <th>Marca / Modelo</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Instalación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((c, i) => (
                  <tr key={c.idCamara}>
                    <td>{i + 1}</td>
                    <td><strong>{c.nombre}</strong></td>
                    <td>
                      <span className={`badge ${colorTipo[c.tipo] || 'badge--azul'}`}>
                        {c.tipo}
                      </span>
                    </td>
                    <td>
                      {c.ipCamara
                        ? <code style={{ background:'#f3f4f6', padding:'2px 8px', borderRadius:6, fontSize:'.8rem' }}>{c.ipCamara}</code>
                        : '—'}
                    </td>
                    <td>{[c.marca, c.modelo].filter(Boolean).join(' / ') || '—'}</td>
                    <td style={{ maxWidth: 160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.ubicacion || '—'}
                    </td>
                    <td>
                      <span className={`badge ${colorEstado[c.estado] || 'badge--azul'}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td>{c.fechaInstalacion || '—'}</td>
                    <td>
                      <button
                        className="btn btn--peligro"
                        style={{ padding:'5px 12px', fontSize:'.8rem' }}
                        onClick={() => handleEliminar(c.idCamara)}
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
              <h3 className="modal__titulo">📷 Nueva Cámara</h3>
              <button className="modal__cerrar" onClick={() => setModal(false)}>✕</button>
            </div>
            <form className="modal__cuerpo" onSubmit={handleSubmit} noValidate>

              <div className="form-grupo">
                <label className="form-label">Nombre de la cámara *</label>
                <input
                  className={`form-input ${errores.nombre ? 'error' : ''}`}
                  maxLength={80}
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej: Cámara Entrada Principal"
                />
                {errores.nombre && <span className="form-error">{errores.nombre}</span>}
              </div>

              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Tipo *</label>
                  <select
                    className={`form-input ${errores.tipo ? 'error' : ''}`}
                    value={form.tipo}
                    onChange={e => setForm({ ...form, tipo: e.target.value })}
                  >
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errores.tipo && <span className="form-error">{errores.tipo}</span>}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Estado *</label>
                  <select
                    className={`form-input ${errores.estado ? 'error' : ''}`}
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}
                  >
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Dirección IP</label>
                  <input
                    className={`form-input ${errores.ipCamara ? 'error' : ''}`}
                    value={form.ipCamara}
                    onChange={e => setForm({ ...form, ipCamara: e.target.value })}
                    placeholder="192.168.1.100"
                  />
                  {errores.ipCamara && <span className="form-error">{errores.ipCamara}</span>}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Marca</label>
                  <input
                    className="form-input"
                    maxLength={50}
                    value={form.marca}
                    onChange={e => setForm({ ...form, marca: e.target.value })}
                    placeholder="ej: Hikvision"
                  />
                </div>
              </div>

              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Modelo</label>
                  <input
                    className="form-input"
                    maxLength={50}
                    value={form.modelo}
                    onChange={e => setForm({ ...form, modelo: e.target.value })}
                    placeholder="ej: DS-2CD2143G2"
                  />
                </div>
                <div className="form-grupo">
                  <label className="form-label">Fecha de instalación</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.fechaInstalacion}
                    onChange={e => setForm({ ...form, fechaInstalacion: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label className="form-label">Ubicación</label>
                <input
                  className={`form-input ${errores.ubicacion ? 'error' : ''}`}
                  maxLength={150}
                  value={form.ubicacion}
                  onChange={e => setForm({ ...form, ubicacion: e.target.value })}
                  placeholder="ej: Entrada principal norte — Nivel 1"
                />
                {errores.ubicacion && <span className="form-error">{errores.ubicacion}</span>}
              </div>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn--primario"
                  style={{ background:'#8B5CF6' }}
                  disabled={guardando}
                >
                  {guardando ? '⏳ Guardando...' : '💾 Guardar Cámara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast--${toast.tipo}`}>
          {toast.tipo === 'exito' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  );
}
