import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Dashboard from './pages/Menu';
import Usuarios from './pages/Usuarios';
import Descuentos from './pages/Descuentos';
import Convenios from './pages/Convenios';
import Camaras from './pages/Camaras';
import Vehiculos from './pages/Vehiculos';
import Parqueadero from './pages/Parqueadero';
import './components/Layout.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RutaProtegida>
                <Layout />
              </RutaProtegida>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="usuarios"    element={<Usuarios />} />
            <Route path="descuentos"  element={<Descuentos />} />
            <Route path="convenios"   element={<Convenios />} />
            <Route path="camaras"     element={<Camaras />} />
            <Route path="vehiculos"   element={<Vehiculos />} />
            <Route path="parqueadero" element={<Parqueadero />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}