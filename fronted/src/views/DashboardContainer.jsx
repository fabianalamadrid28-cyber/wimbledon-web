import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import AdminDashboard from './admin/AdminDashboard';
import ReceptionDashboard from './reception/ReceptionDashboard';
import HousekeepingDashboard from './housekeeping/HousekeepingDashboard';
import UsuariosManagement from './admin/UsuariosManagement';
import { INITIAL_ROOMS, INITIAL_RESERVATIONS } from '../services/api';
import { useEstadosEnVivo } from '../hooks/useEstadosEnVivo';

export default function DashboardContainer({ 
  initialRole = 'ADMIN', 
  user: sessionUser,
  onLogout,
  onGoToLanding,
  rooms: propRooms,
  setRooms: propSetRooms,
  reservations: propReservations,
  setReservations: propSetReservations
}) {
  // El rol viene de la sesión autenticada y no se puede cambiar desde la interfaz
  const currentRole = initialRole;
  const [currentTab, setCurrentTab] = useState('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Central state for Rooms & Reservations synced with API / mock
  const [internalRooms, setInternalRooms] = useState(INITIAL_ROOMS);
  const [internalReservations, setInternalReservations] = useState(INITIAL_RESERVATIONS);

  const rooms = propRooms || internalRooms;
  const setRooms = propSetRooms || setInternalRooms;
  const reservations = propReservations || internalReservations;
  const setReservations = propSetReservations || setInternalReservations;

  // Los paneles muestran siempre lo que dice el servidor y se actualizan solos cada 5 s
  const { error: errorSync, ultimaSync, acciones } = useEstadosEnVivo({
    onDatos: (hab, res) => { setRooms(hab); setReservations(res); }
  });

  // Datos del usuario autenticado
  const ROL_LABEL = { ADMIN: 'Administrador General', RECEPCION: 'Recepción', LIMPIEZA: 'Personal de Limpieza' };
  const getUserProfile = () => ({
    nombre: sessionUser?.nombre || 'Usuario',
    email: sessionUser?.email || '',
    rol: ROL_LABEL[currentRole]
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar 
        currentRole={currentRole}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={onLogout}
        onGoToLanding={onGoToLanding}
        user={getUserProfile()}
      />

      {/* Main Panel */}
      <div className="dashboard-main">
        {/* Top Header */}
        <TopHeader
          currentRole={currentRole}
          user={getUserProfile()}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onGoToLanding={onGoToLanding}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Dashboard Views */}
        <div role="status" style={{ padding: '4px 16px', fontSize: '12px', color: errorSync ? '#b91c1c' : '#64748b' }}>
          {errorSync
            ? `Sin conexión con el servidor: ${errorSync}. Mostrando el último dato recibido.`
            : (ultimaSync ? `En vivo · actualizado ${ultimaSync.toLocaleTimeString('es-PE')}` : 'Conectando…')}
        </div>
        <main className="dash-content">
          {currentRole === 'ADMIN' && (
            <AdminDashboard
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              rooms={rooms}
              setRooms={setRooms}
              reservations={reservations}
              setReservations={setReservations}
              searchTerm={searchTerm}
            />
          )}

          {currentRole === 'RECEPCION' && (
            <ReceptionDashboard
              acciones={acciones}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              reservations={reservations}
              setReservations={setReservations}
              rooms={rooms}
              setRooms={setRooms}
              searchTerm={searchTerm}
            />
          )}

          {currentRole === 'LIMPIEZA' && (
            <HousekeepingDashboard
              acciones={acciones}
              rooms={rooms}
              setRooms={setRooms}
              searchTerm={searchTerm}
            />
          )}

          {currentRole === 'ADMIN' && currentTab === 'usuarios' && <UsuariosManagement />}

          {currentRole === 'ADMIN' && currentTab === 'configuracion' && (
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Configuración del Sistema</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Ajustes de tarifas, pasarela de pago, notificaciones por WhatsApp e impresoras de tickets para el Hotel Wimbledon.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button className="btn-primary" onClick={() => alert("Configuraciones guardadas.")}>
                  Guardar Preferencias
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
