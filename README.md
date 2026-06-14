# 🅿️ AutoSlot — Frontend React

Sistema de gestión de parqueadero desarrollado con React JS.

---

## 📋 Requisitos previos

- Node.js v18 o superior → https://nodejs.org
- Backend Spring Boot corriendo en `localhost:8080`
- VS Code (recomendado)

---

## 🚀 Pasos para ejecutar el proyecto

### 1. Abrir la carpeta en VS Code
```
Archivo → Abrir carpeta → selecciona "autoslot-frontend"
```

### 2. Abrir la terminal de VS Code
```
Ctrl + Ñ  (o View → Terminal)
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Iniciar el proyecto
```bash
npm start
```

La aplicación abre automáticamente en:
```
http://localhost:3000
```

---

## 🔐 Credenciales de acceso

| Campo    | Valor |
|----------|-------|
| Usuario  | admin |
| Contraseña | 1234 |

---

## 📁 Estructura del proyecto

```
src/
  ├── components/
  │     ├── Layout.jsx          ← Estructura principal con sidebar
  │     ├── Layout.css
  │     ├── Navbar.jsx          ← Barra de navegación lateral
  │     ├── Navbar.css
  │     └── RutaProtegida.jsx   ← Control de acceso a rutas privadas
  ├── context/
  │     └── AuthContext.js      ← Gestión de sesión del usuario
  ├── pages/
  │     ├── Login.jsx           ← Página de inicio de sesión
  │     ├── Login.css
  │     ├── Dashboard.jsx       ← Panel principal con estadísticas
  │     ├── Dashboard.css
  │     ├── Usuarios.jsx        ← CRUD de usuarios
  │     ├── Descuentos.jsx      ← CRUD de descuentos
  │     ├── Convenios.jsx       ← CRUD de convenios
  │     ├── Camaras.jsx         ← CRUD de cámaras
  │     ├── Vehiculos.jsx       ← CRUD de vehículos
  │     └── Parqueadero.jsx     ← CRUD de parqueadero
  ├── services/
  │     └── api.js              ← Conexión con backend Spring Boot
  ├── App.js                    ← Enrutador principal
  ├── index.js                  ← Punto de entrada
  └── index.css                 ← Variables y estilos globales
```

---

## 🔗 Conexión con el Backend

El frontend se conecta automáticamente al backend en:
```
http://localhost:8080
```

Para cambiar la URL, edita `src/services/api.js`:
```js
const API_BASE = 'http://localhost:8080';
```

---

## 📦 Módulos disponibles

| Módulo       | Ruta           | Endpoint backend     |
|--------------|----------------|----------------------|
| Login        | /login         | /usuario/login       |
| Dashboard    | /dashboard     | Todos los módulos    |
| Usuarios     | /usuarios      | /usuario/*           |
| Descuentos   | /descuentos    | /descuento/*         |
| Convenios    | /convenios     | /convenio/*          |
| Cámaras      | /camaras       | /camara/*            |
| Vehículos    | /vehiculos     | /vehiculo/*          |
| Parqueadero  | /parqueadero   | /parqueadero/*       |

---

## 🛠️ Tecnologías utilizadas

- **React 18** — Framework frontend
- **React Router DOM 6** — Navegación entre páginas
- **Axios** — Cliente HTTP para llamadas al backend
- **CSS Variables** — Sistema de diseño consistente
- **Google Fonts** (Syne + DM Sans) — Tipografía profesional

---

Proyecto AutoSlot — SENA 2026
