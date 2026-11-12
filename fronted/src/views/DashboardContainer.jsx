import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import AdminDashboard from './admin/AdminDashboard';
import ReceptionDashboard from './reception/ReceptionDashboard';
import HousekeepingDashboard from './housekeeping/HousekeepingDashboard';
import SoportePanel from './housekeeping/SoportePanel';
import UsuariosManagement from './admin/UsuariosManagement';
import { INITIAL_ROOMS, INITIAL_RESERVATIONS } from '../services/api';
import { useEstadosEnVivo } from '../hooks/useEstadosEnVivo';
import { useIncidenciasAdmin } from '../hooks/useIncidenciasAdmin';
import CheckInValidationModal from '../components/modals/CheckInValidationModal';
import BookingModal from '../components/modals/BookingModal';
import ReceiptModal from '../components/modals/ReceiptModal';

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

  // Estado reactivo de notificaciones (Campanita)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      tipo: 'checkin',
      titulo: 'Huésped en Habitación',
      mensaje: 'Luis Pérez validó ingreso a la Hab. 203 (En Habitación).',
      tiempo: 'Hace 5 min',
      leida: false
    },
    {
      id: 2,
      tipo: 'reserva',
      titulo: 'Nueva Reserva Registrada',
      mensaje: 'Patricia Castillo reservó Suite Pacific Dreams (Hab. 108).',
      tiempo: 'Hace 18 min',
      leida: false
    },
    {
      id: 3,
      tipo: 'limpieza',
      titulo: 'Aseo Requerido',
      mensaje: 'Habitación 202 requiere protocolo de desinfección.',
      tiempo: 'Hace 45 min',
      leida: false
    }
  ]);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [
      {
        id: Date.now(),
        tiempo: 'Ahora',
        leida: false,
        ...notif
      },
      ...prev
    ]);
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Modales compartidos
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [latestCreatedRes, setLatestCreatedRes] = useState(null);

  // useEstadosEnVivo con soporte reactivo optimista local
  const { error: errorSync, ultimaSync, acciones } = useEstadosEnVivo({
    onDatos: (hab, res) => { setRooms(hab); setReservations(res); },
    setRooms,
    setReservations
  });

  // Incidencias reportadas por clientes: llegan a administración (campanita + contador en el menú)
  const { pendientes: incidenciasPendientes, recargar: recargarIncidencias } = useIncidenciasAdmin({
    activo: currentRole === 'ADMIN',
    onNueva: addNotification
  });

  // Manejador de check-in sin contacto
  const handleValidateCheckInFromModal = (resId, details) => {
    acciones.cambiarEstadoReserva(resId, 'En Habitación');
    addNotification({
      tipo: 'checkin',
      titulo: 'Ingreso Validado',
      mensaje: `Ingreso confirmado a Hab. ${details.habitacion || ''} (En Habitación).`
    });
  };

  // Manejador de nueva reserva creada desde recepción / dashboard
  const handleConfirmNewBooking = (formData) => {
    const randomCode = '#R-' + Math.floor(1035 + Math.random() * 400);
    const newRes = {
      id: Date.now(),
      codigo: randomCode,
      idDisplay: `#00${Math.floor(9 + Math.random() * 50)}`,
      huesped: formData.huesped,
      documento: formData.documento,
      habitacion: formData.habitacion,
      habitacionId: formData.habitacionId,
      tipo: formData.tipo,
      capacidad: formData.capacidad,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      checkInDisplay: formData.checkIn,
      checkOutDisplay: formData.checkOut,
      fechaCheckInISO: formData.fechaCheckInISO,
      fechaCheckOutISO: formData.fechaCheckOutISO,
      estado: 'Confirmada',
      total: formData.total,
      tarifaBase: formData.tarifaBase,
      bloque: formData.bloque,
      metodoPago: formData.metodoPago,
      numeroOperacion: formData.numeroOperacion,
      email: 'huesped@wimbledon.com',
      telefono: formData.telefono,
      tokenQr: `WIM-CHK-${randomCode.replace('#', '')}-${formData.habitacion}`
    };

    setReservations(prev => [newRes, ...prev]);
    setRooms(prev => prev.map(r => String(r.numero) === String(formData.habitacion) ? { ...r, estado: 'RESERVADA' } : r));

    addNotification({
      tipo: 'reserva',
      titulo: 'Nueva Reserva Creada',
      mensaje: `Reserva ${newRes.codigo} de ${newRes.huesped} en Hab. ${newRes.habitacion}.`
    });

    setIsBookingModalOpen(false);
    setLatestCreatedRes({
      ...newRes,
      boletaNum: `B001-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      paqueteFestividad: formData.paqueteFestividad,
      itemsCarta: formData.itemsCarta
    });
    setIsReceiptModalOpen(true);
  };

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
        badges={{ incidencias: incidenciasPendientes }}
      />

      {/* Main Panel */}
      <div className="dashboard-main">
        {/* Top Header con Notificaciones Reactivas */}
        <TopHeader
          currentRole={currentRole}
          user={getUserProfile()}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onGoToLanding={onGoToLanding}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          notifications={notifications}
          onMarkAllRead={markAllNotificationsAsRead}
          onClearNotifications={clearNotifications}
          onOpenCheckInValidation={() => setIsValidationModalOpen(true)}
          onOpenIncidencias={() => setCurrentTab('incidencias')}
        />

        {/* Status Bar */}
        <div role="status" style={{ padding: '4px 20px', fontSize: '11.5px', color: errorSync ? '#b91c1c' : '#64748b' }}>
          {errorSync
            ? `Modo local activo · ${errorSync}. Sincronización en memoria.`
            : (ultimaSync ? `En vivo · Actualizado ${ultimaSync.toLocaleTimeString('es-PE')}` : 'Conectando…')}
        </div>

        <main className="dash-content">
          {currentRole === 'ADMIN' && (
            <AdminDashboard
              acciones={acciones}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              rooms={rooms}
              setRooms={setRooms}
              reservations={reservations}
              setReservations={setReservations}
              searchTerm={searchTerm}
              onAddNotification={addNotification}
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
              onAddNotification={addNotification}
              onOpenNewBooking={() => setIsBookingModalOpen(true)}
            />
          )}

          {currentRole === 'LIMPIEZA' && (
            <HousekeepingDashboard
              acciones={acciones}
              rooms={rooms}
              setRooms={setRooms}
              searchTerm={searchTerm}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              onAddNotification={addNotification}
            />
          )}

          {currentRole === 'ADMIN' && currentTab === 'incidencias' && (
            <SoportePanel modo="admin" rooms={rooms} onRevisado={recargarIncidencias} />
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

      {/* Validador de Ingreso sin contacto */}
      <CheckInValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        reservations={reservations}
        rooms={rooms}
        onValidateCheckIn={handleValidateCheckInFromModal}
      />

      {/* Modal de Reserva desde el Dashboard */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        rooms={rooms}
        onConfirmBooking={handleConfirmNewBooking}
      />

      {/* Modal de Boleta */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        reservation={latestCreatedRes}
        onOpenCheckInValidation={() => setIsValidationModalOpen(true)}
      />
    </div>
  );
}
