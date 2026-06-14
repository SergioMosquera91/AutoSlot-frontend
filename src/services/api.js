import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autoslot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('autoslot_token');
      localStorage.removeItem('autoslot_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const usuarioService = {
  listar:  ()      => api.get('/usuario/listar'),
  crear:   (data)  => api.post('/usuario/nuevo', data),
  buscar:  (id)    => api.get(`/usuario/${id}`),
  editar:  (id, d) => api.put(`/usuario/${id}`, d),
  eliminar:(id)    => api.delete(`/usuario/${id}`),
  login:   (data)  => api.post('/usuario/login', data),
};

export const descuentoService = {
  listar:  ()      => api.get('/descuento/listar'),
  crear:   (data)  => api.post('/descuento/nuevo', data),
  buscar:  (id)    => api.get(`/descuento/${id}`),
  editar:  (id, d) => api.put(`/descuento/${id}`, d),
  eliminar:(id)    => api.delete(`/descuento/${id}`),
};

export const convenioService = {
  listar:  ()      => api.get('/convenio/listar'),
  crear:   (data)  => api.post('/convenio/nuevo', data),
  buscar:  (id)    => api.get(`/convenio/${id}`),
  editar:  (id, d) => api.put(`/convenio/${id}`, d),
  eliminar:(id)    => api.delete(`/convenio/${id}`),
};

export const camaraService = {
  listar:  ()      => api.get('/camara/listar'),
  crear:   (data)  => api.post('/camara/nuevo', data),
  buscar:  (id)    => api.get(`/camara/${id}`),
  editar:  (id, d) => api.put(`/camara/${id}`, d),
  eliminar:(id)    => api.delete(`/camara/${id}`),
};

export const vehiculoService = {
  listar:  ()      => api.get('/vehiculo/listar'),
  crear:   (data)  => api.post('/vehiculo/nuevo', data),
  buscar:  (id)    => api.get(`/vehiculo/${id}`),
  editar:  (id, d) => api.put(`/vehiculo/${id}`, d),
  eliminar:(id)    => api.delete(`/vehiculo/${id}`),
};

export const parqueaderoService = {
  listar:  ()      => api.get('/parqueadero/listar'),
  crear:   (data)  => api.post('/parqueadero/nuevo', data),
  buscar:  (id)    => api.get(`/parqueadero/${id}`),
  editar:  (id, d) => api.put(`/parqueadero/${id}`, d),
  eliminar:(id)    => api.delete(`/parqueadero/${id}`),
};

export default api;