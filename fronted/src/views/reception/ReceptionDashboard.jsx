import React, { useState } from 'react';
import { 
  Bed, 
  CalendarCheck, 
  UserCheck, 
  LogOut, 
  Calendar, 
  UserPlus, 
  PlusCircle, 
  CheckSquare, 
  Eye, 
  Printer, 
  FileEdit, 
  Users,
  ChevronRight,
  TrendingUp,
  Clock,
  DoorClosed,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Layers,
  Sparkles,
  Search,
  Filter,
  DollarSign,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react';
import { DonutChartSvg } from '../../components/common/Charts';
import { api, aplicarEstadoReservaLocal, getStockPorTematica } from '../../services/api';
import GuestDetailModal from '../../components/modals/GuestDetailModal';
import EditReservationModal from '../../components/modals/EditReservationModal';
import ExtendReservationModal from '../../components/modals/ExtendReservationModal';
import CheckInValidationModal from '../../components/modals/CheckInValidationModal';

export default function ReceptionDashboard({
  currentTab = 'inicio',
  setCurrentTab,
  reservations = [],
  setReservations,
  acciones,
  rooms = [],
  setRooms,
  searchTerm = '',
  onAddNotification,
  onOpenNewBooking
}) {
  const [activeTab, setActiveTab] = useState('reservas-dia');
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  // Filtros internos
  const [reservasStatusFilter, setReservasStatusFilter] = useState('ALL');
  const [habitacionesPisoFilter, setHabitacionesPisoFilter] = useState('ALL');
  const [habitacionesStatusFilter, setHabitacionesStatusFilter] = useState('ALL');
  const [huespedesSearch, setHuespedesSearch] = useState('');

  // Se guarda solo el id: así la ficha siempre muestra los datos actuales de la lista
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const selectedGuestReservation =
    safeReservations.find((r) => r.id === selectedGuestId) || safeReservations[0] || null;
  const setSelectedGuestReservation = (res) => setSelectedGuestId(res ? res.id : null);
  
  // Modales
  const [isGuestDetailOpen, setIsGuestDetailOpen] = useState(false);
  const [reservaEnEdicion, setReservaEnEdicion] = useState(null);
  const [reservaAExtender, setReservaAExtender] = useState(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [reservaAValidar, setReservaAValidar] = useState(null);

  // Cálculos de KPIs reactivos en tiempo real (150 habitaciones)
  const totalHabitaciones = safeRooms.length;
  const ocupadasCount = safeRooms.filter(r => r.estado === 'OCUPADA').length;
  const disponiblesCount = safeRooms.filter(r => r.estado === 'DISPONIBLE' || r.estado === 'LISTA').length;
  const mantenimientoCount = safeRooms.filter(r => r.estado === 'MANTENIMIENTO').length;
  const limpiezaCount = safeRooms.filter(r => r.estado === 'LIMPIEZA_PENDIENTE' || r.estado === 'EN_PROCESO').length;
  const reservadasCount = safeRooms.filter(r => r.estado === 'RESERVADA').length;
  const porcentajeOcupacion = totalHabitaciones > 0 ? Math.round((ocupadasCount / totalHabitaciones) * 100) : 0;

  const reservasHoyCount = safeReservations.length;
  const checkinsHoyCount = safeReservations.filter(r => r.estado === 'Check-in' || r.estado === 'En Habitación').length;
  const checkoutsHoyCount = safeReservations.filter(r => r.estado === 'Finalizada').length;

  // Stock reactivo por cada tipo y temática
  const stockPorTematica = getStockPorTematica(safeRooms);

  // Handle Check-in action tradicional
  const handlePerformCheckin = (resId) => {
    acciones.cambiarEstadoReserva(resId, 'CHECKIN');
    const target = safeReservations.find(r => r.id === resId);
    if (onAddNotification && target) {
      onAddNotification({
        tipo: 'checkin',
        titulo: 'Check-in Realizado',
        mensaje: `${target.huesped} registró check-in para Habitación ${target.habitacion}.`
      });
    }
  };

  // Abrir validador de ingreso sin contacto (QR / GPS)
  const handleOpenValidatorForReservation = (res) => {
    setReservaAValidar(res);
    setIsValidationModalOpen(true);
  };

  // Callback al validar ingreso sin contacto
  const handleCompleteCheckInValidation = (resId, details) => {
    acciones.cambiarEstadoReserva(resId, 'En Habitación');
    const target = safeReservations.find(r => r.id === resId);
    if (onAddNotification) {
      onAddNotification({
        tipo: 'checkin',
        titulo: 'Ingreso Validado (En Habitación)',
        mensaje: `Huésped ${target ? target.huesped : 'Cliente'} ingresó físicamente a la Hab. ${details.habitacion || (target ? target.habitacion : '')}.`
      });
    }
  };

  // Handle Confirm action
  const handleConfirmReservation = (resId) => {
    acciones.cambiarEstadoReserva(resId, 'CONFIRMADA');
    const target = safeReservations.find(r => r.id === resId);
    if (onAddNotification && target) {
      onAddNotification({
        tipo: 'reserva',
        titulo: 'Reserva Confirmada',
        mensaje: `Reserva ${target.codigo} de ${target.huesped} ha sido confirmada.`
      });
    }
  };

  // Handle Check-out action (la habitación pasa sola a limpieza pendiente)
  const handlePerformCheckout = (resId) => {
    acciones.cambiarEstadoReserva(resId, 'FINALIZADA');
    const target = safeReservations.find(r => r.id === resId);
    if (onAddNotification && target) {
      onAddNotification({
        tipo: 'limpieza',
        titulo: 'Habitación por Limpiar',
        mensaje: `Check-out en Habitación ${target.habitacion}. Pase a Limpieza Pendiente.`
      });
    }
  };

  // Cancelar
  const handleCancelReservation = (resId) => {
    if (window.confirm("¿Cancelar esta reserva? La habitación quedará libre.")) {
      acciones.cambiarEstadoReserva(resId, 'CANCELADA');
      if (onAddNotification) {
        onAddNotification({
          tipo: 'reserva',
          titulo: 'Reserva Cancelada',
          mensaje: `Una reserva fue cancelada y su habitación quedó liberada.`
        });
      }
    }
  };

  // Filter reservations based on active tab on Inicio
  const getTabFilteredReservations = () => {
    if (activeTab === 'checkins-pendientes') {
      return safeReservations.filter(r => String(r.estado || '').toLowerCase() === 'confirmada' || String(r.estado || '').toLowerCase() === 'pendiente');
    }
    if (activeTab === 'checkouts-pendientes') {
      return safeReservations.filter(r => 
        String(r.estado || '').toLowerCase().includes('check') || 
        String(r.estado || '').toLowerCase().includes('habitación') ||
        String(r.estado || '').toLowerCase().includes('habitacion')
      );
    }
    return safeReservations; // reservas-dia
  };

  const displayedReservations = getTabFilteredReservations().filter(r => {
    if (!r) return false;
    const term = (searchTerm || '').toLowerCase();
    if (!term) return true;
    const huespedStr = String(r.huesped || '').toLowerCase();
    const habStr = String(r.habitacion || '');
    const codStr = String(r.codigo || r.idDisplay || '').toLowerCase();
    return huespedStr.includes(term) || habStr.includes(term) || codStr.includes(term);
  });

  // Próximos check-ins dinámicos
  const upcomingCheckinsList = safeReservations
    .filter(r => r.estado === 'Confirmada' || r.estado === 'Pendiente')
    .slice(0, 5);

  // Lista de todas las reservas filtradas para la pestaña 'reservas'
  const allFilteredReservations = safeReservations.filter(r => {
    if (!r) return false;
    const matchesStatus = reservasStatusFilter === 'ALL' || String(r.estado || '').toLowerCase() === reservasStatusFilter.toLowerCase();
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = !term || 
      String(r.huesped || '').toLowerCase().includes(term) ||
      String(r.habitacion || '').includes(term) ||
      String(r.codigo || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  // Lista de habitaciones filtradas para la pestaña 'habitaciones'
  const filteredRoomsReception = safeRooms.filter(room => {
    const matchesFloor = habitacionesPisoFilter === 'ALL' || room.piso === parseInt(habitacionesPisoFilter);
    const matchesStatus = habitacionesStatusFilter === 'ALL' || room.estado.toUpperCase() === habitacionesStatusFilter.toUpperCase();
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = !term ||
      room.numero.includes(term) ||
      room.tipo.toLowerCase().includes(term) ||
      (room.nombreTema && room.nombreTema.toLowerCase().includes(term));
    return matchesFloor && matchesStatus && matchesSearch;
  });

  // Huéspedes únicos registrados
  const guestDirectoryList = safeReservations.filter(r => {
    const term = (huespedesSearch || searchTerm || '').toLowerCase();
    if (!term) return true;
    return (
      String(r.huesped || '').toLowerCase().includes(term) ||
      String(r.documento || '').toLowerCase().includes(term) ||
      String(r.telefono || '').includes(term) ||
      String(r.habitacion || '').includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Welcome Header */}
      <div className="dash-page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px' }}>
            {currentTab === 'inicio' && 'Panel de Recepción · Vista General'}
            {currentTab === 'reservas' && 'Gestión Integral de Reservas'}
            {currentTab === 'checkin-checkout' && 'Control de Check-In y Check-Out'}
            {currentTab === 'habitaciones' && 'Mapa de Habitaciones e Inventario (150 Suites)'}
            {currentTab === 'huespedes' && 'Directorio de Huéspedes Registrados'}
            {currentTab === 'reportes' && 'Reportes Diarios de Ocupación y Caja'}
          </h1>
          <p>
            {currentTab === 'inicio' && 'Disponibilidad de suites en tiempo real y control de check-in sin contacto.'}
            {currentTab === 'reservas' && 'Supervisa, confirma, edita y cancela reservas del hotel.'}
            {currentTab === 'checkin-checkout' && 'Validación sin contacto por QR o Totem y salidas en curso.'}
            {currentTab === 'habitaciones' && 'Estado en tiempo real de los 3 pisos (50 habitaciones por piso).'}
            {currentTab === 'huespedes' && 'Historial, contacto y fichas completas de clientes del Hotel Wimbledon.'}
            {currentTab === 'reportes' && 'Balance de ingresos, demanda por bloques y porcentajes de ocupación.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary"
            onClick={() => { setReservaAValidar(null); setIsValidationModalOpen(true); }}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              gap: '6px'
            }}
          >
            <QrCode size={16} /> Validar Ingreso / QR
          </button>

          {onOpenNewBooking && (
            <button 
              className="btn-solid-gold"
              onClick={onOpenNewBooking}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <PlusCircle size={16} /> Nueva Reserva
            </button>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            fontSize: '13px',
            fontWeight: '500',
            color: '#334155'
          }}>
            <Calendar size={16} color="#2563eb" />
            <span>Hoy, {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          VISTA 1: INICIO (currentTab === 'inicio')
      ======================================================== */}
      {currentTab === 'inicio' && (
        <>
          {/* 4 Metric Cards Dinámicas */}
          <div className="kpi-grid" style={{ marginBottom: '20px', gap: '16px' }}>
            {/* 1. Habitaciones ocupadas */}
            <div className="kpi-card" style={{ padding: '16px' }}>
              <div className="kpi-card-top">
                <div className="kpi-icon-box blue" style={{ width: '38px', height: '38px' }}>
                  <Bed size={19} />
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total: {totalHabitaciones}</span>
              </div>
              <span className="kpi-title">Habitaciones ocupadas</span>
              <div className="kpi-value" style={{ fontSize: '24px' }}>{ocupadasCount} / {totalHabitaciones}</div>
              <div className="kpi-progress-bar-wrap" style={{ height: '5px' }}>
                <div className="kpi-progress-bar-fill blue" style={{ width: `${porcentajeOcupacion}%` }}></div>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>{porcentajeOcupacion}% ocupación</span>
            </div>

            {/* 2. Reservas de hoy */}
            <div className="kpi-card" style={{ padding: '16px' }}>
              <div className="kpi-card-top">
                <div className="kpi-icon-box green" style={{ width: '38px', height: '38px' }}>
                  <CalendarCheck size={19} />
                </div>
              </div>
              <span className="kpi-title">Reservas registradas</span>
              <div className="kpi-value" style={{ fontSize: '24px' }}>{reservasHoyCount}</div>
              <span className="kpi-badge up" style={{ fontSize: '11px' }}>En sistema hoy</span>
            </div>

            {/* 3. Check-in hoy */}
            <div className="kpi-card" style={{ padding: '16px' }}>
              <div className="kpi-card-top">
                <div className="kpi-icon-box purple" style={{ width: '38px', height: '38px' }}>
                  <UserCheck size={19} />
                </div>
              </div>
              <span className="kpi-title">Huéspedes en habitación</span>
              <div className="kpi-value" style={{ fontSize: '24px' }}>{checkinsHoyCount}</div>
              <span className="kpi-badge up" style={{ fontSize: '11px' }}>Actualmente alojados</span>
            </div>

            {/* 4. Check-out hoy */}
            <div className="kpi-card" style={{ padding: '16px' }}>
              <div className="kpi-card-top">
                <div className="kpi-icon-box orange" style={{ width: '38px', height: '38px' }}>
                  <LogOut size={19} />
                </div>
              </div>
              <span className="kpi-title">Check-outs finalizados</span>
              <div className="kpi-value" style={{ fontSize: '24px' }}>{checkoutsHoyCount}</div>
              <span className="kpi-badge up" style={{ fontSize: '11px' }}>Cuentas cerradas</span>
            </div>
          </div>

          {/* DISPONIBILIDAD EN TIEMPO REAL POR TIPO / TEMÁTICA */}
          <div className="dash-card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
            <div className="dash-card-header" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#2563eb" />
                <h3 style={{ fontSize: '16px' }}>Disponibilidad en Tiempo Real por Tipo y Temática</h3>
              </div>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                ● Stock sincronizado automáticamente ({safeRooms.length} habitaciones en 3 pisos)
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '12px',
              maxHeight: '260px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {stockPorTematica.map((t) => {
                const tieneLibres = t.libres > 0;
                return (
                  <div 
                    key={t.nombreTema}
                    style={{
                      background: '#f8fafc',
                      border: tieneLibres ? '1px solid #e2e8f0' : '1px solid #fecaca',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                        {t.nombreTema}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        {t.tipo} · Máx {t.capacidad} pers. · {t.total} habs.
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        background: tieneLibres ? '#ecfdf5' : '#fef2f2',
                        color: tieneLibres ? '#059669' : '#dc2626',
                        border: tieneLibres ? '1px solid #a7f3d0' : '1px solid #fecaca',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '999px'
                      }}>
                        {tieneLibres ? `${t.libres} libres` : 'Agotado'}
                      </span>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '3px' }}>
                        {t.ocupadas > 0 ? `${t.ocupadas} ocupadas` : '0 ocupadas'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Grid: Left Tabs Table + Right Sidebar Widgets */}
          <div className="grid-reception-layout" style={{ gap: '20px' }}>
            {/* Left: Tabbed Table */}
            <div className="dash-card" style={{ padding: '20px' }}>
              {/* Tabs */}
              <div className="dash-tabs-nav" style={{ marginBottom: '14px' }}>
                <button 
                  className={`dash-tab-btn ${activeTab === 'reservas-dia' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reservas-dia')}
                >
                  Reservas del día ({safeReservations.length})
                </button>
                <button 
                  className={`dash-tab-btn ${activeTab === 'checkins-pendientes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('checkins-pendientes')}
                >
                  Check-ins pendientes
                </button>
                <button 
                  className={`dash-tab-btn ${activeTab === 'checkouts-pendientes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('checkouts-pendientes')}
                >
                  Check-outs pendientes
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Mostrando <strong>{displayedReservations.length}</strong> de <strong>{safeReservations.length}</strong> reservas
                </span>
                <button 
                  className="btn-link-gold"
                  style={{ fontSize: '12.5px', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setCurrentTab('reservas')}
                >
                  Ver gestión completa de reservas →
                </button>
              </div>

              {/* Table con scroll contenido */}
              <div className="table-responsive" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>N° Reserva</th>
                      <th>Huésped</th>
                      <th>Habitación</th>
                      <th>Tipo</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedReservations.map((res) => {
                      const estadoLower = String(res.estado || '').toLowerCase();
                      const isPendiente = estadoLower === 'pendiente';
                      const isConfirmada = estadoLower === 'confirmada';
                      const isCheckin = estadoLower.includes('check');
                      const isEnHabitacion = estadoLower.includes('habitación') || estadoLower.includes('habitacion');

                      return (
                        <tr 
                          key={res.id} 
                          style={{ cursor: 'pointer', backgroundColor: selectedGuestReservation?.id === res.id ? '#f8fafc' : 'transparent' }}
                          onClick={() => setSelectedGuestReservation(res)}
                        >
                          <td style={{ fontWeight: '600', color: '#334155' }}>{res.codigo || res.idDisplay}</td>
                          <td style={{ fontWeight: '600' }}>{res.huesped}</td>
                          <td>
                            <strong>Hab. {res.habitacion}</strong>
                          </td>
                          <td>{res.tipo}</td>
                          <td>{res.checkInDisplay || res.checkIn}</td>
                          <td>{res.checkOutDisplay || res.checkOut}</td>
                          <td>
                            <span className={`badge-status ${estadoLower.replace(/[\s-]/g, '')}`}>
                              {isEnHabitacion ? 'En Habitación' : res.estado}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isConfirmada && (
                                <button 
                                  className="btn-checkin-action"
                                  title="Validar ingreso sin contacto (QR / GPS)"
                                  style={{ background: '#10b981', padding: '5px 10px', fontSize: '12px' }}
                                  onClick={(e) => { e.stopPropagation(); handleOpenValidatorForReservation(res); }}
                                >
                                  Validar Ingreso
                                </button>
                              )}

                              {isPendiente && (
                                <button 
                                  className="btn-confirm-action"
                                  style={{ padding: '5px 10px', fontSize: '12px' }}
                                  onClick={(e) => { e.stopPropagation(); handleConfirmReservation(res.id); }}
                                >
                                  Confirmar
                                </button>
                              )}

                              {(isCheckin || isEnHabitacion) && (
                                <>
                                  <button 
                                    className="btn-checkin-action" 
                                    style={{ backgroundColor: '#2563eb', padding: '5px 10px', fontSize: '12px' }}
                                    onClick={(e) => { e.stopPropagation(); handlePerformCheckout(res.id); }}
                                  >
                                    Check-out &gt;
                                  </button>
                                  <button
                                    className="btn-action-icon"
                                    title="Extender tiempo"
                                    onClick={(e) => { e.stopPropagation(); setReservaAExtender(res); }}
                                  >
                                    +⏱
                                  </button>
                                </>
                              )}

                              {['pendiente', 'confirmada'].includes(estadoLower) && (
                                <button 
                                  className="btn-action-icon"
                                  title={res.puedeCancelar !== false ? 'Cancelar reserva' : (res.motivoNoCancelable || 'No cancelable')}
                                  onClick={(e) => { e.stopPropagation(); handleCancelReservation(res.id); }}
                                >
                                  ✕
                                </button>
                              )}

                              <button 
                                className="btn-action-icon"
                                title="Ver ficha"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGuestReservation(res);
                                  setIsGuestDetailOpen(true);
                                }}
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Quick actions & Room status widgets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick Actions */}
              <div className="dash-card" style={{ padding: '18px' }}>
                <div className="dash-card-header" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '16px' }}>Acciones rápidas</h3>
                </div>
                <div className="quick-actions-grid">
                  <button 
                    className="btn-quick-action" 
                    onClick={() => { setReservaAValidar(null); setIsValidationModalOpen(true); }}
                    style={{ borderColor: '#10b981' }}
                  >
                    <QrCode color="#10b981" />
                    <span style={{ color: '#047857' }}>Validar QR Ingreso</span>
                  </button>
                  <button 
                    className="btn-quick-action" 
                    onClick={() => {
                      if (onOpenNewBooking) onOpenNewBooking();
                      else alert("Abriendo formulario de reserva en recepción...");
                    }}
                  >
                    <CalendarCheck />
                    <span>Nueva reserva</span>
                  </button>
                  <button 
                    className="btn-quick-action" 
                    onClick={() => setCurrentTab('checkin-checkout')}
                  >
                    <Bed />
                    <span>Check-in Express</span>
                  </button>
                  <button 
                    className="btn-quick-action" 
                    onClick={() => {
                      const alojados = safeReservations.filter(r => r.estado === 'Check-in' || r.estado === 'En Habitación');
                      if (alojados.length > 0) {
                        handlePerformCheckout(alojados[0].id);
                      } else {
                        alert("No hay habitaciones activas para check-out inmediato.");
                      }
                    }}
                  >
                    <LogOut />
                    <span>Check-out Rápido</span>
                  </button>
                </div>
              </div>

              {/* Room status gauge widget dinámico */}
              <div className="dash-card" style={{ padding: '18px' }}>
                <div className="dash-card-header" style={{ marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '16px' }}>Estado general del hotel</h3>
                </div>

                <div className="room-status-widget">
                  <div className="room-status-legend-item">
                    <div className="left">
                      <span className="status-dot green"></span>
                      <span>Disponibles / Listas</span>
                    </div>
                    <strong style={{ color: '#0f172a' }}>{disponiblesCount}</strong>
                  </div>

                  <div className="room-status-legend-item">
                    <div className="left">
                      <span className="status-dot blue"></span>
                      <span>Ocupadas / En habitación</span>
                    </div>
                    <strong style={{ color: '#0f172a' }}>{ocupadasCount}</strong>
                  </div>

                  <div className="room-status-legend-item">
                    <div className="left">
                      <span className="status-dot amber"></span>
                      <span>En proceso de limpieza</span>
                    </div>
                    <strong style={{ color: '#0f172a' }}>{limpiezaCount}</strong>
                  </div>

                  <div className="room-status-legend-item">
                    <div className="left">
                      <span className="status-dot red"></span>
                      <span>En mantenimiento</span>
                    </div>
                    <strong style={{ color: '#0f172a' }}>{mantenimientoCount}</strong>
                  </div>

                  {/* Gauge */}
                  <DonutChartSvg percent={porcentajeOcupacion} size={130} centerLabel="Ocupación" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Upcoming checkins & Guest profile info */}
          <div className="grid-2-col" style={{ gap: '20px' }}>
            {/* Left: Próximos check-ins reactivos */}
            <div className="dash-card" style={{ padding: '18px' }}>
              <div className="dash-card-header" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={17} color="#2563eb" />
                  <h3 style={{ fontSize: '16px' }}>Próximos check-ins</h3>
                </div>
                <span className="link-more" onClick={() => setCurrentTab('checkin-checkout')}>
                  Ver control de check-in →
                </span>
              </div>

              <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Huésped</th>
                      <th>Habitación</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingCheckinsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                          No hay check-ins pendientes próximos.
                        </td>
                      </tr>
                    ) : (
                      upcomingCheckinsList.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: '600' }}>{item.huesped}</td>
                          <td><strong>Hab. {item.habitacion}</strong></td>
                          <td>{item.tipo}</td>
                          <td>
                            <span className={`badge-status ${String(item.estado || '').toLowerCase()}`}>
                              {item.estado}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn-checkin-action"
                              style={{ padding: '4px 10px', fontSize: '11.5px', background: '#10b981' }}
                              onClick={() => handleOpenValidatorForReservation(item)}
                            >
                              Validar Ingreso
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Información del huésped */}
            <div className="dash-card" style={{ padding: '18px' }}>
              <div className="dash-card-header" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={17} color="#2563eb" />
                  <h3 style={{ fontSize: '16px' }}>Información del huésped seleccionado</h3>
                </div>
                <span className="link-more" onClick={() => selectedGuestReservation && setIsGuestDetailOpen(true)}>
                  Ver ficha completa
                </span>
              </div>

              {selectedGuestReservation ? (
                <div className="guest-info-card">
                  <div className="guest-info-header">
                    <div className="guest-avatar">
                      {selectedGuestReservation.huesped ? selectedGuestReservation.huesped.charAt(0) : 'H'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{selectedGuestReservation.huesped}</h4>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{selectedGuestReservation.codigo || selectedGuestReservation.idDisplay}</span>
                    </div>
                  </div>

                  <div className="guest-details-list">
                    <div className="guest-detail-row">
                      <span className="label">Habitación asignada</span>
                      <strong className="value" style={{ color: '#2563eb' }}>Hab. {selectedGuestReservation.habitacion}</strong>
                    </div>
                    <div className="guest-detail-row">
                      <span className="label">Temática / Tipo</span>
                      <span className="value">{selectedGuestReservation.tipo}</span>
                    </div>
                    <div className="guest-detail-row">
                      <span className="label">Estado de estancia</span>
                      <span className={`badge-status ${String(selectedGuestReservation.estado || '').toLowerCase().replace(/[\s-]/g, '')}`}>
                        {selectedGuestReservation.estado}
                      </span>
                    </div>
                    <div className="guest-detail-row">
                      <span className="label">Total de cuenta</span>
                      <strong className="value" style={{ color: '#059669' }}>
                        S/ {parseFloat(selectedGuestReservation.total || 0).toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="guest-action-buttons" style={{ marginTop: '14px' }}>
                    <button 
                      className="btn-guest-action blue"
                      onClick={() => setIsGuestDetailOpen(true)}
                    >
                      <Eye size={14} /> Ver detalle
                    </button>
                    <button 
                      className="btn-guest-action green"
                      onClick={() => handleOpenValidatorForReservation(selectedGuestReservation)}
                    >
                      <QrCode size={14} /> Validar Ingreso
                    </button>
                    <button 
                      className="btn-guest-action purple"
                      onClick={() => {
                        setIsGuestDetailOpen(true);
                        setTimeout(() => window.print(), 400);
                      }}
                    >
                      <Printer size={14} /> Imprimir ficha
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>
                  Selecciona una reserva para ver el perfil del huésped.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          VISTA 2: RESERVAS (currentTab === 'reservas')
      ======================================================== */}
      {currentTab === 'reservas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dash-card" style={{ padding: '18px 20px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                  <Filter size={16} />
                  <span>Filtrar por estado:</span>
                </div>
                <select
                  className="filter-select"
                  value={reservasStatusFilter}
                  onChange={(e) => setReservasStatusFilter(e.target.value)}
                >
                  <option value="ALL">Todas las reservas</option>
                  <option value="Confirmada">Confirmadas</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="En Habitación">En Habitación</option>
                  <option value="Check-in">Check-in</option>
                  <option value="Finalizada">Finalizadas</option>
                  <option value="Cancelada">Canceladas</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Total: <strong>{allFilteredReservations.length}</strong> reservas
                </span>
                {onOpenNewBooking && (
                  <button className="btn-primary" onClick={onOpenNewBooking}>
                    <PlusCircle size={15} /> Nueva Reserva
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="dash-card" style={{ padding: '20px' }}>
            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Huésped</th>
                    <th>Documento</th>
                    <th>Habitación</th>
                    <th>Temática / Tipo</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {allFilteredReservations.map(res => {
                    const estadoLower = String(res.estado || '').toLowerCase();
                    const isEnHabitacion = estadoLower.includes('habitación') || estadoLower.includes('habitacion');
                    return (
                      <tr key={res.id}>
                        <td style={{ fontWeight: 700, color: '#334155' }}>{res.codigo || res.idDisplay}</td>
                        <td style={{ fontWeight: 600 }}>{res.huesped}</td>
                        <td style={{ fontSize: '12.5px', color: '#64748b' }}>{res.documento || '70123456'}</td>
                        <td><strong style={{ color: '#2563eb' }}>Hab. {res.habitacion}</strong></td>
                        <td style={{ fontSize: '12.5px' }}>{res.tipo}</td>
                        <td style={{ fontSize: '12.5px' }}>{res.checkInDisplay || res.checkIn}</td>
                        <td style={{ fontSize: '12.5px' }}>{res.checkOutDisplay || res.checkOut}</td>
                        <td><strong style={{ color: '#059669' }}>S/ {parseFloat(res.total || 0).toFixed(2)}</strong></td>
                        <td>
                          <span className={`badge-status ${estadoLower.replace(/[\s-]/g, '')}`}>
                            {isEnHabitacion ? 'En Habitación' : res.estado}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {res.estado === 'Confirmada' && (
                              <button 
                                className="btn-checkin-action" 
                                style={{ background: '#10b981', padding: '4px 8px', fontSize: '11.5px' }}
                                onClick={() => handleOpenValidatorForReservation(res)}
                              >
                                Validar
                              </button>
                            )}
                            {res.estado === 'Pendiente' && (
                              <button 
                                className="btn-confirm-action" 
                                style={{ padding: '4px 8px', fontSize: '11.5px' }}
                                onClick={() => handleConfirmReservation(res.id)}
                              >
                                Confirmar
                              </button>
                            )}
                            {(isEnHabitacion || estadoLower === 'check-in') && (
                              <button 
                                className="btn-checkin-action" 
                                style={{ background: '#2563eb', padding: '4px 8px', fontSize: '11.5px' }}
                                onClick={() => handlePerformCheckout(res.id)}
                              >
                                Check-out
                              </button>
                            )}
                            <button 
                              className="btn-action-icon"
                              title="Editar reserva"
                              onClick={() => setReservaEnEdicion(res)}
                            >
                              <FileEdit size={15} />
                            </button>
                            <button 
                              className="btn-action-icon"
                              title="Ver ficha"
                              onClick={() => {
                                setSelectedGuestReservation(res);
                                setIsGuestDetailOpen(true);
                              }}
                            >
                              <Eye size={15} />
                            </button>
                            {['pendiente', 'confirmada'].includes(estadoLower) && (
                              <button 
                                className="btn-action-icon"
                                title="Cancelar reserva"
                                onClick={() => handleCancelReservation(res.id)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VISTA 3: CHECK-IN / CHECK-OUT (currentTab === 'checkin-checkout')
      ======================================================== */}
      {currentTab === 'checkin-checkout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Banner de Validación sin contacto */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b, #047857)',
            borderRadius: '12px',
            padding: '20px 24px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(6, 78, 59, 0.2)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#a7f3d0" />
                <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>
                  Validación de Ingreso Sin Contacto (Totem QR &amp; GPS)
                </h3>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#d1fae5' }}>
                Escanea el código QR de la boleta o ingresa el PIN del Totem para registrar el ingreso físico a la suite.
              </p>
            </div>
            <button
              className="btn-solid-gold"
              style={{ padding: '10px 20px', fontSize: '13.5px', fontWeight: 700 }}
              onClick={() => { setReservaAValidar(null); setIsValidationModalOpen(true); }}
            >
              <QrCode size={18} /> Iniciar Validación QR / PIN
            </button>
          </div>

          {/* Dos Columnas: Llegadas Pendientes y Salidas / Check-outs en Curso */}
          <div className="grid-2-col" style={{ gap: '20px' }}>
            {/* Columna 1: Llegadas Pendientes */}
            <div className="dash-card" style={{ padding: '20px' }}>
              <div className="dash-card-header" style={{ marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarCheck size={18} color="#2563eb" />
                    Llegadas Pendientes de Validación
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Huéspedes con reserva confirmada por ingresar</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
                {safeReservations.filter(r => r.estado === 'Confirmada' || r.estado === 'Pendiente').map(item => (
                  <div key={item.id} style={{
                    padding: '12px 14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{item.huesped}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Hab. <strong style={{ color: '#2563eb' }}>{item.habitacion}</strong> · {item.tipo} · {item.checkInDisplay || item.checkIn}
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ background: '#10b981', border: 'none', padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleOpenValidatorForReservation(item)}
                    >
                      <QrCode size={14} /> Validar Ingreso
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 2: En Habitación / Salidas Pendientes */}
            <div className="dash-card" style={{ padding: '20px' }}>
              <div className="dash-card-header" style={{ marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={18} color="#f59e0b" />
                    Huéspedes en Habitación / Check-Out
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Estancias activas listas para cierre o extensión</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
                {safeReservations.filter(r => r.estado === 'En Habitación' || r.estado === 'Check-in').map(item => (
                  <div key={item.id} style={{
                    padding: '12px 14px',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{item.huesped}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Hab. <strong style={{ color: '#2563eb' }}>{item.habitacion}</strong> · Total: S/ {parseFloat(item.total || 0).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-action-icon"
                        title="Extender tiempo de estancia"
                        onClick={() => setReservaAExtender(item)}
                      >
                        +⏱
                      </button>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handlePerformCheckout(item.id)}
                      >
                        Check-out &gt;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VISTA 4: HABITACIONES (currentTab === 'habitaciones')
      ======================================================== */}
      {currentTab === 'habitaciones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Barra de Filtros */}
          <div className="dash-card" style={{ padding: '16px 20px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className={`dash-tab-btn ${habitacionesPisoFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setHabitacionesPisoFilter('ALL')}
                >
                  Todos los Pisos (150 habs)
                </button>
                <button
                  className={`dash-tab-btn ${habitacionesPisoFilter === '1' ? 'active' : ''}`}
                  onClick={() => setHabitacionesPisoFilter('1')}
                >
                  Piso 1 (Hab. 101 - 150)
                </button>
                <button
                  className={`dash-tab-btn ${habitacionesPisoFilter === '2' ? 'active' : ''}`}
                  onClick={() => setHabitacionesPisoFilter('2')}
                >
                  Piso 2 (Hab. 201 - 250)
                </button>
                <button
                  className={`dash-tab-btn ${habitacionesPisoFilter === '3' ? 'active' : ''}`}
                  onClick={() => setHabitacionesPisoFilter('3')}
                >
                  Piso 3 (Hab. 301 - 350)
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  className="filter-select"
                  value={habitacionesStatusFilter}
                  onChange={(e) => setHabitacionesStatusFilter(e.target.value)}
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="DISPONIBLE">🟢 Disponibles</option>
                  <option value="LISTA">✅ Listas</option>
                  <option value="OCUPADA">🔵 Ocupadas</option>
                  <option value="RESERVADA">📌 Reservadas</option>
                  <option value="LIMPIEZA_PENDIENTE">⚠️ Limpieza Pendiente</option>
                  <option value="MANTENIMIENTO">🔧 Mantenimiento</option>
                </select>

                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Mostrando <strong>{filteredRoomsReception.length}</strong> habitaciones
                </span>
              </div>
            </div>
          </div>

          {/* Grilla de Habitaciones */}
          <div style={{ maxHeight: '680px', overflowY: 'auto', paddingRight: '4px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {filteredRoomsReception.map(room => {
                const isLibre = room.estado === 'DISPONIBLE' || room.estado === 'LISTA';
                const isOcupada = room.estado === 'OCUPADA';
                const isReservada = room.estado === 'RESERVADA';
                const isLimpieza = room.estado === 'LIMPIEZA_PENDIENTE' || room.estado === 'EN_PROCESO';
                const isMantenimiento = room.estado === 'MANTENIMIENTO';

                let borderColor = '#e2e8f0';
                let bgColor = '#ffffff';
                if (isLibre) { borderColor = '#86efac'; bgColor = '#f0fdf4'; }
                if (isOcupada) { borderColor = '#93c5fd'; bgColor = '#eff6ff'; }
                if (isReservada) { borderColor = '#fcd34d'; bgColor = '#fffbeb'; }
                if (isLimpieza) { borderColor = '#fdba74'; bgColor = '#fff7ed'; }
                if (isMantenimiento) { borderColor = '#fca5a5'; bgColor = '#fef2f2'; }

                return (
                  <div 
                    key={room.id}
                    style={{
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        Hab. {room.numero}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Piso {room.piso}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      {room.nombreTema || room.tipo}
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Tarifa: <strong>S/ {room.precioBloque?.toFixed(2) || '120.00'}</strong>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                      <span className={`badge-status ${room.estado.toLowerCase().replace(/[\s-]/g, '')}`} style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                        {isLibre && '🟢 Disponible'}
                        {isOcupada && '🔵 Ocupada'}
                        {isReservada && '📌 Reservada'}
                        {isLimpieza && '⚠️ Limpieza'}
                        {isMantenimiento && '🔧 Avería'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VISTA 5: HUÉSPEDES (currentTab === 'huespedes')
      ======================================================== */}
      {currentTab === 'huespedes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dash-card" style={{ padding: '16px 20px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '300px' }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI, teléfono o habitación..."
                  value={huespedesSearch}
                  onChange={(e) => setHuespedesSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px'
                  }}
                />
              </div>

              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Total registrados: <strong>{guestDirectoryList.length}</strong> clientes
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {guestDirectoryList.map(guest => (
              <div 
                key={guest.id}
                className="dash-card"
                style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', margin: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '16px'
                  }}>
                    {guest.huesped ? guest.huesped.charAt(0) : 'H'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>{guest.huesped}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>DNI / Doc: {guest.documento || '70123456'}</span>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="#64748b" />
                    <span>{guest.telefono || '+51 987 654 321'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="#64748b" />
                    <span>{guest.email || 'huesped@wimbledon.com'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Bed size={13} color="#2563eb" />
                    <span>Última Suite: <strong>Hab. {guest.habitacion}</strong> ({guest.tipo})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                    Total: S/ {parseFloat(guest.total || 0).toFixed(2)}
                  </span>
                  <button
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => {
                      setSelectedGuestReservation(guest);
                      setIsGuestDetailOpen(true);
                    }}
                  >
                    <Eye size={13} /> Ver Ficha
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          VISTA 6: REPORTES (currentTab === 'reportes')
      ======================================================== */}
      {currentTab === 'reportes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* KPIs Financieros y de Demanda */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-title">Ingresos Totales Hoy</span>
              <div className="kpi-value">
                S/ {safeReservations.reduce((acc, r) => acc + (parseFloat(r.total) || 0), 0).toFixed(2)}
              </div>
              <span className="kpi-badge up">Caja diaria activa</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Porcentaje de Ocupación</span>
              <div className="kpi-value">{porcentajeOcupacion}%</div>
              <span className="kpi-badge up">{ocupadasCount} de {totalHabitaciones} suites</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Habitaciones Disponibles</span>
              <div className="kpi-value">{disponiblesCount}</div>
              <span className="kpi-badge up">Listas para asignación</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Limpieza y Mantenimiento</span>
              <div className="kpi-value">{limpiezaCount + mantenimientoCount}</div>
              <span className="kpi-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                En acondicionamiento
              </span>
            </div>
          </div>

          {/* Desglose de Ocupación por Pisos */}
          <div className="dash-card" style={{ padding: '20px' }}>
            <div className="dash-card-header" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>Ocupación de los 3 Pisos del Hotel Wimbledon</h3>
              <button 
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '12.5px' }}
                onClick={() => window.print()}
              >
                <Printer size={15} /> Imprimir Cierre Diario
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { piso: 1, nombre: 'Piso 1 - Cochera Directa', total: 50 },
                { piso: 2, nombre: 'Piso 2 - Suites Sensuales', total: 50 },
                { piso: 3, nombre: 'Piso 3 - Nivel Presidencial & Vista Mar', total: 50 }
              ].map(p => {
                const ocupadasPiso = safeRooms.filter(r => r.piso === p.piso && r.estado === 'OCUPADA').length;
                const pct = Math.round((ocupadasPiso / p.total) * 100);
                return (
                  <div key={p.piso} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{p.nombre}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {ocupadasPiso} suites ocupadas de {p.total}
                    </div>
                    <div className="kpi-progress-bar-wrap" style={{ height: '6px', margin: '12px 0 6px 0' }}>
                      <div className="kpi-progress-bar-fill blue" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>
                      {pct}% ocupación
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <GuestDetailModal
        isOpen={isGuestDetailOpen}
        onClose={() => setIsGuestDetailOpen(false)}
        reservation={selectedGuestReservation}
      />

      <EditReservationModal
        isOpen={!!reservaEnEdicion}
        onClose={() => setReservaEnEdicion(null)}
        reservation={reservaEnEdicion}
        rooms={rooms}
        onSave={acciones.editarReserva}
      />

      <ExtendReservationModal
        isOpen={!!reservaAExtender}
        onClose={() => setReservaAExtender(null)}
        reservation={reservaAExtender}
        room={reservaAExtender ? rooms.find(r => String(r.numero) === String(reservaAExtender.habitacion)) : null}
        onExtend={acciones.extenderReserva}
      />

      {/* Validador de Ingreso sin contacto */}
      <CheckInValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => { setIsValidationModalOpen(false); setReservaAValidar(null); }}
        reservations={safeReservations}
        rooms={safeRooms}
        initialReservation={reservaAValidar}
        onValidateCheckIn={handleCompleteCheckInValidation}
      />
    </div>
  );
}
