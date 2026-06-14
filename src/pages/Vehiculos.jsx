import React, { useState, useEffect } from 'react';
import { vehiculoService } from '../services/api';

const INICIAL = {
  placa: '',
  marca: '',
  modelo: '',
  color: '',
  tipo: 'carro',
  anio: '',
  idUsuario: '',
};

const TIPOS = ['carro', 'moto', 'camioneta', 'bus', 'bicicleta'];

const colorTipo = {
  carro: 'badge--azul',
  moto: 'badge--ambar',
  camioneta: 'badge--verde',
  bus: 'badge--rojo',
  bicicleta: 'badge--azul',
};

const iconoTipo = {
  carro: '🚗', moto: '🏍️', camioneta: '🚙', bus: '🚌', bicicleta: '🚲',
};

export default function Vehiculos() {
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
      const r = await vehiculoService.listar();
      setLista(r.data);
    } catch {
      // Si el endpoint no existe aún, mostramos lista vacía
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
    if (!form.placa.trim()) e.placa = 'Campo obligatorio';
    if (form.placa && !/^[A-Za-z0-9\-]{3,8}$/.test(form.placa))
      e.placa = 'Placa inválida (3-8 caracteres alfanuméricos)';
    if (!form.marca.trim()) e.marca = 'Campo obligatorio';
    if (form.marca.length > 50) e.marca = 'Máximo 50 caracteres';
    if (!form.tipo) e.tipo = 'Selecciona un tipo';
    if (form.anio) {
      const anio = Number(form.anio);
      const anioActual = new Date().getFullYear();
      if (isNaN(anio) || anio < 1900 || anio > anioActual + 1)
        e.anio = `Año entre 1900 y ${anioActual + 1}`;
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validar();
    if (Object.keys(ev).length) { setErrores(ev); return; }
    setErrores({});
    setGuardando(true);
    try {
      await vehiculoService.crear({
        ...form,
        placa: form.placa.toUpperCase(),
        anio: form.anio ? Number(form.anio) : null,
        idUsuario: form.idUsuario || null,
      });
      mostrarToast('Vehículo registrado correctamente ✓');
      setModal(false);
      setForm(INICIAL);
      cargar();
    } catch (err) {
      const msg = err.response?.status === 500
        ? 'La placa ya está registrada en el sistema'
        : 'Error al guardar el vehículo';
      mostrarToast(msg, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Deseas eliminar este vehículo?')) return;
    try {
      await vehiculoService.eliminar(id);
      mostrarToast('Vehículo eliminado');
      cargar();
    } catch {
      mostrarToast('No se pudo eliminar', 'error');
    }
  };

  const listaFiltrada = lista.filter(v => {
    const coincideBusqueda =
      v.placa?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo === 'todos' || v.tipo === filtroTipo;
    return coincideBusqueda && coincideTipo;
  });

  return (
    <div className="pagina">
      {/* Encabezado */}
      <div className="pagina__encabezado">
        <div>
          <h1 className="pagina__titulo">🚗 Vehículos</h1>
          <p className="pagina__sub">Registro de vehículos del sistema AutoSlot</p>
        </div>
        <button
          className="btn btn--primario"
          style={{ background: '#EC4899', boxShadow: '0 4px 12px rgba(236,72,153,.3)' }}
          onClick={() => { setForm(INICIAL); setErrores({}); setModal(true); }}
        >
          ＋ Nuevo Vehículo
        </button>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 20, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <input
          className="form-input"
          placeholder="🔍  Buscar por placa, marca o modelo..."
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
          {TIPOS.map(t => <option key={t} value={t}>{iconoTipo[t]} {t}</option>)}
        </select>
        <span style={{ color:'var(--gris-500)', fontSize:'.85rem' }}>
          {listaFiltrada.length} vehículo(s)
        </span>
      </div>

      {/* Tabla */}
      <div className="card">
        {cargando ? (
          <div className="cargando">Cargando vehículos...</div>
        ) : listaFiltrada.length === 0 ? (
          <div className="vacio">
            <div className="vacio__icono">🚗</div>
            <p className="vacio__texto">
              {busqueda || filtroTipo !== 'todos'
                ? 'Sin resultados con ese filtro'
                : 'No hay vehículos registrados'}
            </p>
            <button
              className="btn btn--primario"
              style={{ marginTop: 16, background:'#EC4899' }}
              onClick={() => { setForm(INICIAL); setErrores({}); setModal(true); }}
            >
              ➕ Registrar primer vehículo
            </button>
          </div>
        ) : (
          <div className="tabla-wrapper">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Placa</th>
                  <th>Tipo</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Color</th>
                  <th>Año</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((v, i) => (
                  <tr key={v.idVehiculo}>
                    <td>{i + 1}</td>
                    <td>
                      <strong style={{ fontFamily:'monospace', letterSpacing:1, fontSize:'1rem' }}>
                        {v.placa}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${colorTipo[v.tipo] || 'badge--azul'}`}>
                        {iconoTipo[v.tipo]} {v.tipo}
                      </span>
                    </td>
                    <td>{v.marca}</td>
                    <td>{v.modelo || '—'}</td>
                    <td>
                      {v.color ? (
                        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{
                            width:14, height:14, borderRadius:'50%',
                            background: v.color.toLowerCase(),
                            border:'1px solid #ddd', display:'inline-block'
                          }} />
                          {v.color}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{v.anio || '—'}</td>
                    <td>
                      <button
                        className="btn btn--peligro"
                        style={{ padding:'5px 12px', fontSize:'.8rem' }}
                        onClick={() => handleEliminar(v.idVehiculo)}
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
              <h3 className="modal__titulo">🚗 Nuevo Vehículo</h3>
              <button className="modal__cerrar" onClick={() => setModal(false)}>✕</button>
            </div>
            <form className="modal__cuerpo" onSubmit={handleSubmit} noValidate>

              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Placa *</label>
                  <input
                    className={`form-input ${errores.placa ? 'error' : ''}`}
                    maxLength={8}
                    value={form.placa}
                    onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g,'') })}
                    placeholder="ABC123"
                    style={{ fontFamily:'monospace', letterSpacing:2, fontSize:'1.1rem' }}
                  />
                  {errores.placa && <span className="form-error">{errores.placa}</span>}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Tipo de vehículo *</label>
                  <select
                    className={`form-input ${errores.tipo ? 'error' : ''}`}
                    value={form.tipo}
                    onChange={e => setForm({ ...form, tipo: e.target.value })}
                  >
                    {TIPOS.map(t => <option key={t} value={t}>{iconoTipo[t]} {t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Marca *</label>
                  <input
                    className={`form-input ${errores.marca ? 'error' : ''}`}
                    maxLength={50}
                    value={form.marca}
                    onChange={e => setForm({ ...form, marca: e.target.value })}
                    placeholder="ej: Toyota"
                  />
                  {errores.marca && <span className="form-error">{errores.marca}</span>}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Modelo</label>
                  <input
                    className="form-input"
                    maxLength={50}
                    value={form.modelo}
                    onChange={e => setForm({ ...form, modelo: e.target.value })}
                    placeholder="ej: Corolla"
                  />
                </div>
              </div>

              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Color</label>
                  <input
                    className="form-input"
                    maxLength={30}
                    value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })}
                    placeholder="ej: Blanco"
                  />
                </div>
                <div className="form-grupo">
                  <label className="form-label">Año</label>
                  <input
                    className={`form-input ${errores.anio ? 'error' : ''}`}
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={form.anio}
                    onChange={e => setForm({ ...form, anio: e.target.value })}
                    placeholder={String(new Date().getFullYear())}
                  />
                  {errores.anio && <span className="form-error">{errores.anio}</span>}
                </div>
              </div>

              <div className="form-grupo">
                <label className="form-label">ID Usuario propietario</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={form.idUsuario}
                  onChange={e => setForm({ ...form, idUsuario: e.target.value })}
                  placeholder="Dejar vacío si no aplica"
                />
              </div>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
                <button type="button" className="btn btn--ghost" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn--primario"
                  style={{ background:'#EC4899' }}
                  disabled={guardando}
                >
                  {guardando ? '⏳ Guardando...' : '💾 Guardar Vehículo'}
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
