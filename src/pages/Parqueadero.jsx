import React, { useState, useEffect } from 'react';
import { parqueaderoService } from '../services/api';

const INICIAL = {
  nombre: '',
  direccion: '',
  ciudad: '',
  telefono: '',
  emailContacto: '',
  nit: '',
  capacidadCarros: '',
  capacidadMotos: '',
  estado: 'activo',
};

export default function Parqueadero() {
  const [lista, setLista]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(INICIAL);
  const [errores, setErrores]     = useState({});
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast]         = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await parqueaderoService.listar();
      setLista(r.data);
    } catch {
      setLista([]);
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
    if (!form.nombre.trim())    e.nombre    = 'Campo obligatorio';
    if (!form.direccion.trim()) e.direccion = 'Campo obligatorio';
    if (!form.ciudad.trim())    e.ciudad    = 'Campo obligatorio';
    if (form.emailContacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailContacto))
      e.emailContacto = 'Correo inválido';
    if (form.nit && !/^[0-9\-]+$/.test(form.nit))
      e.nit = 'Solo números y guiones';
    if (form.capacidadCarros && (isNaN(Number(form.capacidadCarros)) || Number(form.capacidadCarros) < 0))
      e.capacidadCarros = 'Número positivo';
    if (form.capacidadMotos && (isNaN(Number(form.capacidadMotos)) || Number(form.capacidadMotos) < 0))
      e.capacidadMotos = 'Número positivo';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validar();
    if (Object.keys(ev).length) { setErrores(ev); return; }
    setErrores({});
    setGuardando(true);
    try {
      await parqueaderoService.crear({
        ...form,
        capacidadCarros: form.capacidadCarros ? Number(form.capacidadCarros) : null,
        capacidadMotos:  form.capacidadMotos  ? Number(form.capacidadMotos)  : null,
      });
      mostrarToast('Parqueadero registrado correctamente ✓');
      setModal(false);
      setForm(INICIAL);
      cargar();
    } catch {
      mostrarToast('Error al guardar el parqueadero', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const capacidadTotal = (c) =>
    (Number(c.capacidadCarros) || 0) + (Number(c.capacidadMotos) || 0);

  return (
    <div className="pagina">
      {/* Encabezado */}
      <div className="pagina__encabezado">
        <div>
          <h1 className="pagina__titulo">🅿️ Parqueadero</h1>
          <p className="pagina__sub">Gestión de parqueaderos del sistema AutoSlot</p>
        </div>
        <button
          className="btn btn--primario"
          style={{ background:'#0EA5E9', boxShadow:'0 4px 12px rgba(14,165,233,.3)' }}
          onClick={() => { setForm(INICIAL); setErrores({}); setModal(true); }}
        >
          ＋ Nuevo Parqueadero
        </button>
      </div>

      {/* Tarjetas de parqueaderos */}
      {cargando ? (
        <div className="cargando">Cargando parqueaderos...</div>
      ) : lista.length === 0 ? (
        <div className="card">
          <div className="vacio">
            <div className="vacio__icono">🅿️</div>
            <p className="vacio__texto">No hay parqueaderos registrados</p>
            <button
              className="btn btn--primario"
              style={{ marginTop:16, background:'#0EA5E9' }}
              onClick={() => { setForm(INICIAL); setErrores({}); setModal(true); }}
            >
              ➕ Registrar primer parqueadero
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:20 }}>
          {lista.map((p) => (
            <div key={p.idParqueadero} className="card" style={{ borderTop:`4px solid #0EA5E9` }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                <div>
                  <h3 style={{ fontFamily:'var(--fuente-titulo)', fontSize:'1.1rem', color:'var(--azul-800)', marginBottom:4 }}>
                    🅿️ {p.nombre}
                  </h3>
                  <span className={`badge ${p.estado === 'activo' ? 'badge--verde' : 'badge--rojo'}`}>
                    {p.estado}
                  </span>
                </div>
                <div style={{ background:'#EFF6FF', borderRadius:12, padding:'8px 14px', textAlign:'center' }}>
                  <span style={{ display:'block', fontFamily:'var(--fuente-titulo)', fontSize:'1.4rem', fontWeight:800, color:'#0EA5E9' }}>
                    {capacidadTotal(p)}
                  </span>
                  <span style={{ fontSize:'.72rem', color:'var(--gris-500)' }}>puestos totales</span>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  ['📍', 'Dirección', p.direccion],
                  ['🏙️', 'Ciudad', p.ciudad],
                  ['📞', 'Teléfono', p.telefono],
                  ['📧', 'Email', p.emailContacto],
                  ['🪪', 'NIT', p.nit],
                ].map(([ic, lb, vl]) => vl ? (
                  <div key={lb} style={{ display:'flex', gap:8, alignItems:'center', fontSize:'.87rem' }}>
                    <span>{ic}</span>
                    <span style={{ color:'var(--gris-500)' }}>{lb}:</span>
                    <span style={{ color:'var(--gris-900)', fontWeight:500 }}>{vl}</span>
                  </div>
                ) : null)}
              </div>

              <div style={{
                display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:14,
                background:'var(--gris-100)', borderRadius:10, padding:'10px 14px'
              }}>
                <div style={{ textAlign:'center' }}>
                  <span style={{ display:'block', fontFamily:'var(--fuente-titulo)', fontSize:'1.2rem', fontWeight:700, color:'var(--azul-600)' }}>
                    {p.capacidadCarros || 0}
                  </span>
                  <span style={{ fontSize:'.72rem', color:'var(--gris-500)' }}>🚗 puestos carros</span>
                </div>
                <div style={{ textAlign:'center' }}>
                  <span style={{ display:'block', fontFamily:'var(--fuente-titulo)', fontSize:'1.2rem', fontWeight:700, color:'#F59E0B' }}>
                    {p.capacidadMotos || 0}
                  </span>
                  <span style={{ fontSize:'.72rem', color:'var(--gris-500)' }}>🏍️ puestos motos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__titulo">🅿️ Nuevo Parqueadero</h3>
              <button className="modal__cerrar" onClick={() => setModal(false)}>✕</button>
            </div>
            <form className="modal__cuerpo" onSubmit={handleSubmit} noValidate>

              <div className="form-grupo">
                <label className="form-label">Nombre del parqueadero *</label>
                <input
                  className={`form-input ${errores.nombre ? 'error' : ''}`}
                  maxLength={100}
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej: Parqueadero Central AutoSlot"
                />
                {errores.nombre && <span className="form-error">{errores.nombre}</span>}
              </div>

              <div className="form-grupo">
                <label className="form-label">Dirección *</label>
                <input
                  className={`form-input ${errores.direccion ? 'error' : ''}`}
                  maxLength={200}
                  value={form.direccion}
                  onChange={e => setForm({ ...form, direccion: e.target.value })}
                  placeholder="ej: Calle 5 # 10-20, Centro"
                />
                {errores.direccion && <span className="form-error">{errores.direccion}</span>}
              </div>

              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Ciudad *</label>
                  <input
                    className={`form-input ${errores.ciudad ? 'error' : ''}`}
                    maxLength={80}
                    value={form.ciudad}
                    onChange={e => setForm({ ...form, ciudad: e.target.value })}
                    placeholder="ej: Neiva"
                  />
                  {errores.ciudad && <span className="form-error">{errores.ciudad}</span>}
                </div>
                <div className="form-grupo">
                  <label className="form-label">NIT</label>
                  <input
                    className={`form-input ${errores.nit ? 'error' : ''}`}
                    maxLength={30}
                    value={form.nit}
                    onChange={e => setForm({ ...form, nit: e.target.value })}
                    placeholder="900123456-1"
                  />
                  {errores.nit && <span className="form-error">{errores.nit}</span>}
                </div>
              </div>

              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-input"
                    maxLength={20}
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value.replace(/[^0-9+\-\s]/g,'') })}
                    placeholder="3001234567"
                  />
                </div>
                <div className="form-grupo">
                  <label className="form-label">Email de contacto</label>
                  <input
                    className={`form-input ${errores.emailContacto ? 'error' : ''}`}
                    type="email"
                    value={form.emailContacto}
                    onChange={e => setForm({ ...form, emailContacto: e.target.value })}
                    placeholder="parqueadero@ejemplo.com"
                  />
                  {errores.emailContacto && <span className="form-error">{errores.emailContacto}</span>}
                </div>
              </div>

              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Capacidad carros</label>
                  <input
                    className={`form-input ${errores.capacidadCarros ? 'error' : ''}`}
                    type="number" min="0"
                    value={form.capacidadCarros}
                    onChange={e => setForm({ ...form, capacidadCarros: e.target.value })}
                    placeholder="ej: 50"
                  />
                  {errores.capacidadCarros && <span className="form-error">{errores.capacidadCarros}</span>}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Capacidad motos</label>
                  <input
                    className={`form-input ${errores.capacidadMotos ? 'error' : ''}`}
                    type="number" min="0"
                    value={form.capacidadMotos}
                    onChange={e => setForm({ ...form, capacidadMotos: e.target.value })}
                    placeholder="ej: 20"
                  />
                  {errores.capacidadMotos && <span className="form-error">{errores.capacidadMotos}</span>}
                </div>
              </div>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn--primario"
                  style={{ background:'#0EA5E9' }}
                  disabled={guardando}
                >
                  {guardando ? '⏳ Guardando...' : '💾 Guardar Parqueadero'}
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
