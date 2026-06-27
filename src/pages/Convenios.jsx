// ─── Convenios.jsx ────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { convenioService } from "../services/api";

const INICIAL_C = {
  nombreEmpresa: "",
  nitEmpresa: "",
  contacto: "",
  telefono: "",
  correo: "",
  descuentoPct: "",
  cupoMaximo: "",
  fechaInicio: "",
  fechaFin: "",
  estado: "activo",
};

export function Convenios() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(INICIAL_C);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    cargar();
  }, []);
  const cargar = async () => {
    setCargando(true);
    try {
      const r = await convenioService.listar();
      setLista(r.data);
    } catch {
      toast_("Error al cargar convenios", "error");
    } finally {
      setCargando(false);
    }
  };
  const toast_ = (msg, tipo = "exito") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const validar = () => {
    const e = {};
    if (!form.nombreEmpresa.trim()) e.nombreEmpresa = "Campo obligatorio";
    if (form.nombreEmpresa.length > 150)
      e.nombreEmpresa = "Máximo 150 caracteres";
    if (!form.nitEmpresa.trim()) e.nitEmpresa = "Campo obligatorio";
    if (form.nitEmpresa && !/^[0-9\-]+$/.test(form.nitEmpresa))
      e.nitEmpresa = "Solo números y guiones";
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = "Correo inválido";
    if (
      form.descuentoPct &&
      (isNaN(Number(form.descuentoPct)) ||
        Number(form.descuentoPct) < 0 ||
        Number(form.descuentoPct) > 100)
    )
      e.descuentoPct = "Valor entre 0 y 100";
    if (!form.fechaInicio) e.fechaInicio = "Campo obligatorio";
    return e;
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Deseas eliminar este convenio?")) return;
    try {
      await convenioService.eliminar(id);
      toast_("Convenio eliminado");
      cargar();
    } catch {
      toast_("No se pudo eliminar", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validar();
    if (Object.keys(ev).length) {
      setErrores(ev);
      return;
    }
    setErrores({});
    setGuardando(true);
    try {
      await convenioService.crear({
        ...form,
        descuentoPct: Number(form.descuentoPct) || 0,
        cupoMaximo: form.cupoMaximo || null,
      });
      toast_("Convenio registrado correctamente ✓");
      setModal(false);
      setForm(INICIAL_C);
      cargar();
    } catch (err) {
      toast_(
        err.response?.status === 500
          ? "El NIT ya existe en el sistema"
          : "Error al guardar",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pagina">
      <div className="pagina__encabezado">
        <div>
          <h1 className="pagina__titulo">🤝 Convenios</h1>
          <p className="pagina__sub">Gestión de convenios corporativos</p>
        </div>
        <button
          className="btn btn--primario"
          style={{
            background: "#10B981",
            boxShadow: "0 4px 12px rgba(16,185,129,.3)",
          }}
          onClick={() => {
            setForm(INICIAL_C);
            setErrores({});
            setModal(true);
          }}
        >
          ＋ Nuevo Convenio
        </button>
      </div>
      <div className="card">
        {cargando ? (
          <div className="cargando">Cargando convenios...</div>
        ) : lista.length === 0 ? (
          <div className="vacio">
            <div className="vacio__icono">🤝</div>
            <p className="vacio__texto">No hay convenios registrados</p>
          </div>
        ) : (
          <div className="tabla-wrapper">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Empresa</th>
                  <th>NIT</th>
                  <th>Contacto</th>
                  <th>Correo</th>
                  <th>Descuento</th>
                  <th>Cupo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((c, i) => (
                  <tr key={c.idConvenio}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{c.nombreEmpresa}</strong>
                    </td>
                    <td>
                      <code
                        style={{
                          background: "#f3f4f6",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {c.nitEmpresa}
                      </code>
                    </td>
                    <td>{c.contacto || "—"}</td>
                    <td>{c.correo || "—"}</td>
                    <td>
                      <strong style={{ color: "#10B981" }}>
                        {c.descuentoPct}%
                      </strong>
                    </td>
                    <td>{c.cupoMaximo || "Sin límite"}</td>
                    <td>
                      <span
                        className={`badge ${c.estado === "activo" ? "badge--verde" : "badge--rojo"}`}
                      >
                        {c.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn--peligro"
                        style={{ padding: "5px 12px", fontSize: ".8rem" }}
                        onClick={() => handleEliminar(c.idConvenio)}
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
              <h3 className="modal__titulo">🤝 Nuevo Convenio</h3>
              <button className="modal__cerrar" onClick={() => setModal(false)}>
                ✕
              </button>
            </div>
            <form className="modal__cuerpo" onSubmit={handleSubmit} noValidate>
              <div className="form-grupo">
                <label className="form-label">Nombre empresa *</label>
                <input
                  className={`form-input ${errores.nombreEmpresa ? "error" : ""}`}
                  maxLength={150}
                  value={form.nombreEmpresa}
                  onChange={(e) =>
                    setForm({ ...form, nombreEmpresa: e.target.value })
                  }
                  placeholder="Empresa Ejemplo SAS"
                />
                {errores.nombreEmpresa && (
                  <span className="form-error">{errores.nombreEmpresa}</span>
                )}
              </div>
              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">NIT *</label>
                  <input
                    className={`form-input ${errores.nitEmpresa ? "error" : ""}`}
                    maxLength={30}
                    value={form.nitEmpresa}
                    onChange={(e) =>
                      setForm({ ...form, nitEmpresa: e.target.value })
                    }
                    placeholder="900123456-1"
                  />
                  {errores.nitEmpresa && (
                    <span className="form-error">{errores.nitEmpresa}</span>
                  )}
                </div>
                <div className="form-grupo">
                  <label className="form-label">Descuento (%)</label>
                  <input
                    className={`form-input ${errores.descuentoPct ? "error" : ""}`}
                    type="number"
                    min="0"
                    max="100"
                    value={form.descuentoPct}
                    onChange={(e) =>
                      setForm({ ...form, descuentoPct: e.target.value })
                    }
                    placeholder="20"
                  />
                  {errores.descuentoPct && (
                    <span className="form-error">{errores.descuentoPct}</span>
                  )}
                </div>
              </div>
              <div className="form-fila">
                <div className="form-grupo">
                  <label className="form-label">Contacto</label>
                  <input
                    className="form-input"
                    value={form.contacto}
                    onChange={(e) =>
                      setForm({ ...form, contacto: e.target.value })
                    }
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div className="form-grupo">
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-input"
                    value={form.telefono}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        telefono: e.target.value.replace(/[^0-9+\-\s]/g, ""),
                      })
                    }
                    placeholder="3001234567"
                  />
                </div>
              </div>
              <div className="form-grupo">
                <label className="form-label">Correo</label>
                <input
                  className={`form-input ${errores.correo ? "error" : ""}`}
                  type="email"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  placeholder="empresa@ejemplo.com"
                />
                {errores.correo && (
                  <span className="form-error">{errores.correo}</span>
                )}
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
                  <label className="form-label">Cupo máximo</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={form.cupoMaximo}
                    onChange={(e) =>
                      setForm({ ...form, cupoMaximo: e.target.value })
                    }
                    placeholder="Sin límite"
                  />
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
                  className="btn btn--primario"
                  style={{ background: "#10B981" }}
                  disabled={guardando}
                >
                  {guardando ? "⏳ Guardando..." : "💾 Guardar Convenio"}
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

export default Convenios;
