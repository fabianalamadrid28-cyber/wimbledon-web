import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import AdminDashboard from './admin/AdminDashboard';
import ReceptionDashboard from './reception/ReceptionDashboard';
import HousekeepingDashboard from './housekeeping/HousekeepingDashboard';
import { INITIAL_ROOMS, INITIAL_RESERVATIONS, api } from '../services/api';

export default function DashboardContainer({ 
  initialRole = 'ADMIN', 
  onGoToLanding,
  rooms: propRooms,
  setRooms: propSetRooms,
  reservations: propReservations,
  setReservations: propSetReservations
}) {
  const [currentRole, setCurrentRole] = useState(initialRole);
  const [currentTab, setCurrentTab] = useState('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Keep currentRole in sync if initialRole changes
  useEffect(() => {
    if (initialRole) {
      setCurrentRole(initialRole);
    }
  }, [initialRole]);

  // Sync with browser URL hash
  useEffect(() => {
    const hash = window.location.hash.toLowerCase().replace('#', '');
    if (hash === 'admin') setCurrentRole('ADMIN');
    else if (hash === 'recepcion' || hash === 'reception') setCurrentRole('RECEPCION');
    else if (hash === 'limpieza' || hash === 'housekeeping') setCurrentRole('LIMPIEZA');
  }, []);

  // Update hash when role changes
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setCurrentTab('inicio');
    setSearchTerm('');
    if (newRole === 'ADMIN') window.location.hash = '#admin';
    else if (newRole === 'RECEPCION') window.location.hash = '#recepcion';
    else if (newRole === 'LIMPIEZA') window.location.hash = '#limpieza';
  };

  // Central state for Rooms & Reservations synced with API / mock
  const [internalRooms, setInternalRooms] = useState(INITIAL_ROOMS);
  const [internalReservations, setInternalReservations] = useState(INITIAL_RESERVATIONS);

  const rooms = propRooms || internalRooms;
  const setRooms = propSetRooms || setInternalRooms;
  const reservations = propReservations || internalReservations;
  const setReservations = propSetReservations || setInternalReservations;

  // Fetch from backend API if available and not supplied by parent
  useEffect(() => {
    if (propRooms && propReservations) return;
    let isMounted = true;
    async function loadData() {
      const dbRooms = await api.getHabitaciones();
      if (isMounted && dbRooms && dbRooms.length > 0) setRooms(dbRooms);

      const dbReservas = await api.getReservas();
      if (isMounted && dbReservas && dbReservas.length > 0) setReservations(dbReservas);
    }
    loadData();
    return () => { isMounted = false; };
  }, [propRooms, propReservations, setRooms, setReservations]);

  // User meta by role
  const getUserProfile = () => {
    if (currentRole === 'ADMIN') {
      return {
        nombre: 'Administrador',
        email: 'admin@hotel.com',
        rol: 'Administrador General'
      };
    }
    if (currentRole === 'RECEPCION') {
      return {
        nombre: 'Ana Torres',
        email: 'ana.torres@hotel.com',
        rol: 'Recepción'
      };
    }
    return {
      nombre: 'Rosa Flores',
      email: 'rosa.limpieza@hotel.com',
      rol: 'Personal de Limpieza'
    };
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar 
        currentRole={currentRole}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={onGoToLanding}
        user={getUserProfile()}
      />

      {/* Main Panel */}
      <div className="dashboard-main">
        {/* Top Header */}
        <TopHeader
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          user={getUserProfile()}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onGoToLanding={onGoToLanding}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Dashboard Views */}
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
              rooms={rooms}
              setRooms={setRooms}
              searchTerm={searchTerm}
            />
          )}

          {currentTab === 'configuracion' && (
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
