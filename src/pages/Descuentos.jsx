import React, { useState, useEffect } from "react";
import { descuentoService } from "../services/api";

const INICIAL = {
  idParqueadero: 1,
  nombre: "",
  tipo: "porcentaje",
  valor: "",
  codigoCupon: "",
  aplicaA: "todos",
  fechaInicio: "",
  fechaFin: "",
  usosMaximos: "",
  usosActuales: 0,
  estado: "activo",
};

export default function Descuentos() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(INICIAL);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await descuentoService.listar();
      setLista(r.data);
    } catch {
      mostrarToast("Error al cargar descuentos", "error");
    } finally {
      setCargando(false);
    }
  };

  const mostrarToast = (msg, tipo = "exito") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Campo obligatorio";
    if (form.nombre.length > 100) e.nombre = "Máximo 100 caracteres";
    if (!form.tipo) e.tipo = "Selecciona un tipo";
    if (!form.valor) e.valor = "Campo obligatorio";
    if (isNaN(Number(form.valor)) || Number(form.valor) < 0)
      e.valor = "Debe ser un número positivo";
    if (form.tipo === "porcentaje" && Number(form.valor) > 100)
      e.valor = "El porcentaje no puede superar 100";
    if (!form.fechaInicio) e.fechaInicio = "Campo obligatorio";
    if (form.codigoCupon && form.codigoCupon.length > 50)
      e.codigoCupon = "Máximo 50 caracteres";
    if (form.codigoCupon && /[^a-zA-Z0-9_\-]/.test(form.codigoCupon))
      e.codigoCupon = "Solo letras, números, guion y guion bajo";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e_ = validar();
    if (Object.keys(e_).length) {
      setErrores(e_);
      return;
    }
    setErrores({});
    setGuardando(true);
    try {
      await descuentoService.crear({
        ...form,
        valor: Number(form.valor),
        usosMaximos: form.usosMaximos || null,
      });
      mostrarToast("Descuento registrado correctamente ✓");
      setModal(false);
      setForm(INICIAL);
      cargar();
    } catch (err) {
      const msg =
        err.response?.status === 500
          ? "El código de cupón ya existe"
          : "Error al guardar";
      mostrarToast(msg, "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Deseas eliminar este descuento?")) return;
    try {
      await descuentoService.eliminar(id);
      mostrarToast("Descuento eliminado");
      cargar();
    } catch {
      mostrarToast("No se pudo eliminar", "error");
    }
  };

  const listaFiltrada = lista.filter(
    (d) =>
      d.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.codigoCupon?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="pagina">
      <div className="pagina__encabezado">
        <div>
          <h1 className="pagina__titulo">🏷️ Descuentos</h1>
          <p className="pagina__sub">
            Gestión de descuentos y cupones del parqueadero
          </p>
        </div>
        <button
          className="btn btn--acento"
          onClick={() => {
            setForm(INICIAL);
            setErrores({});
            setModal(true);
          }}
        >
          ＋ Nuevo Descuento
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="🔍  Buscar por nombre o cupón..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: 380 }}
        />
      </div>

      <div className="card">
        {cargando ? (
          <div className="cargando">Cargando descuentos...</div>
        ) : listaFiltrada.length === 0 ? (
          <div className="vacio">
            <div className="vacio__icono">🏷️</div>
            <p className="vacio__texto">
              {busqueda ? "Sin resultados" : "No hay descuentos registrados"}
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
                  <th>Valor</th>
                  <th>Cupón</th>
                  <th>Aplica a</th>
                  <th>Inicio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((d, i) => (
                  <tr key={d.idDescuento}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{d.nombre}</strong>
                    </td>
                    <td>
                      <span className="badge badge--azul">{d.tipo}</span>
                    </td>
                    <td>
                      <strong>
                        {d.tipo === "porcentaje"
                          ? `${d.valor}%`
                          : `$${d.valor}`}
                      </strong>
                    </td>
                    <td>
                      {d.codigoCupon ? (
                        <code
                          style={{
                            background: "#f3f4f6",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {d.codigoCupon}
                        </code>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{d.aplicaA}</td>
                    <td>{d.fechaInicio}</td>
                    <td>
                      <span
                        className={`badge ${d.estado === "activo" ? "badge--verde" : "badge--rojo"}`}
                      >
                        {d.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn--peligro"
                        style={{ padding: "5px 12px", fontSize: ".8rem" }}
                        onClick={() => handleEliminar(d.idDescuento)}
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

      {modal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__titulo">🏷️ Nuevo Descuento</h3>
              <button className="modal__cerrar" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>
            <form className="modal__cuerpo" onSubmit={handleSubmit} noValidate>
              <div className="form-grupo">
                <label className="form-label">Nombre del descuento *</label>
                <input
                  className={`form-input ${errores.nombre ? "error" : ""}`}
                  maxLength={100}
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej: Descuento Estudiantes SENA"
                />
                {errores.nombre && (
                  <span className="form-error">{errores.nombre}</span>
                )}
              </div>
              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Tipo *</label>
                  <select
                    className={`form-input ${errores.tipo ? "error" : ""}`}
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="valor_fijo">Valor fijo ($)</option>
                  </select>
                </div>
                <div className="form-grupo">
                  <label className="form-label">Valor *</label>
                  <input
                    className={`form-input ${errores.valor ? "error" : ""}`}
                    type="number"
                    min="0"
                    max={form.tipo === "porcentaje" ? 100 : undefined}
                    value={form.valor}
                    onChange={(e) =>
                      setForm({ ...form, valor: e.target.value })
                    }
                    placeholder={form.tipo === "porcentaje" ? "15" : "5000"}
                  />
                  {errores.valor && (
                    <span className="form-error">{errores.valor}</span>
                  )}
                </div>
              </div>
              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Código cupón</label>
                  <input
                    className={`form-input ${errores.codigoCupon ? "error" : ""}`}
                    maxLength={50}
                    value={form.codigoCupon}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        codigoCupon: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SENA2026"
                  />
                  {errores.codigoCupon && (
                    <span className="form-error">{errores.codigoCupon}</span>
                  )}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Aplica a</label>
                  <select
                    className="form-input"
                    value={form.aplicaA}
                    onChange={(e) =>
                      setForm({ ...form, aplicaA: e.target.value })
                    }
                  >
                    <option value="todos">Todos</option>
                    <option value="usuario_frecuente">Usuario frecuente</option>
                    <option value="convenio">Convenio</option>
                  </select>
                </div>
              </div>
              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Fecha inicio *</label>
                  <input
                    className={`form-input ${errores.fechaInicio ? "error" : ""}`}
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) =>
                      setForm({ ...form, fechaInicio: e.target.value })
                    }
                  />
                  {errores.fechaInicio && (
                    <span className="form-error">{errores.fechaInicio}</span>
                  )}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Fecha fin</label>
                  <input
                    className="form-input"
                    type="date"
                    min={form.fechaInicio}
                    value={form.fechaFin}
                    onChange={(e) =>
                      setForm({ ...form, fechaFin: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Usos máximos</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={form.usosMaximos}
                    onChange={(e) =>
                      setForm({ ...form, usosMaximos: e.target.value })
                    }
                    placeholder="Ilimitado"
                  />
                </div>
                <div className="form-grupo">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-input"
                    value={form.estado}
                    onChange={(e) =>
                      setForm({ ...form, estado: e.target.value })
                    }
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn--acento"
                  disabled={guardando}
                >
                  {guardando ? "⏳ Guardando..." : "💾 Guardar Descuento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && (
        <div className={`toast toast--${toast.tipo}`}>
          {toast.tipo === "exito" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </div>
  );
}
