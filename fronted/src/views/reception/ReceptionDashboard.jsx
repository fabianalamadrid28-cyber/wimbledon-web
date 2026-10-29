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
  AlertCircle
} from 'lucide-react';
import { DonutChartSvg } from '../../components/common/Charts';
import GuestDetailModal from '../../components/modals/GuestDetailModal';

export default function ReceptionDashboard({
  currentTab = 'inicio',
  setCurrentTab,
  reservations = [],
  setReservations,
  rooms = [],
  setRooms,
  searchTerm = ''
}) {
  const [activeTab, setActiveTab] = useState('reservas-dia');
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const [selectedGuestReservation, setSelectedGuestReservation] = useState(safeReservations[0] || null);
  const [isGuestDetailOpen, setIsGuestDetailOpen] = useState(false);

  // Handle Check-in action
  const handlePerformCheckin = (resId) => {
    setReservations(prev => prev.map(r => {
      if (r.id === resId) {
        return { ...r, estado: 'Check-in' };
      }
      return r;
    }));
    alert("¡Check-in realizado con éxito! La habitación ahora figura como Ocupada.");
  };

  // Handle Confirm action
  const handleConfirmReservation = (resId) => {
    setReservations(prev => prev.map(r => {
      if (r.id === resId) {
        return { ...r, estado: 'Confirmada' };
      }
      return r;
    }));
    alert("¡Reserva confirmada exitosamente!");
  };

  // Filter reservations based on active tab
  const getTabFilteredReservations = () => {
    if (activeTab === 'checkins-pendientes') {
      return safeReservations.filter(r => String(r.estado || '').toLowerCase() === 'confirmada');
    }
    if (activeTab === 'checkouts-pendientes') {
      return safeReservations.filter(r => String(r.estado || '').toLowerCase().includes('check'));
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

  return (
    <div>
      {/* Top Welcome Header */}
      <div className="dash-page-header">
        <div>
          <h1>¡Hola, Ana!</h1>
          <p>Aquí tienes un resumen de la actividad del hotel hoy.</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#ffffff',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          fontSize: '13.5px',
          fontWeight: '500',
          color: '#334155'
        }}>
          <Calendar size={16} color="#2563eb" />
          <span>Hoy, 7 de julio de 2025</span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="kpi-grid">
        {/* 1. Habitaciones ocupadas */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-box blue">
              <Bed size={22} />
            </div>
          </div>
          <span className="kpi-title">Habitaciones ocupadas</span>
          <div className="kpi-value">12 / 20</div>
          <div className="kpi-progress-bar-wrap">
            <div className="kpi-progress-bar-fill blue" style={{ width: '60%' }}></div>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>60%</span>
        </div>

        {/* 2. Reservas de hoy */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-box green">
              <CalendarCheck size={22} />
            </div>
          </div>
          <span className="kpi-title">Reservas de hoy</span>
          <div className="kpi-value">8</div>
          <span className="kpi-badge up">↑ 2 vs. ayer</span>
        </div>

        {/* 3. Check-in hoy */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-box purple">
              <UserCheck size={22} />
            </div>
          </div>
          <span className="kpi-title">Check-in hoy</span>
          <div className="kpi-value">6</div>
          <span className="kpi-badge up">↑ 1 vs. ayer</span>
        </div>

        {/* 4. Check-out hoy */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-box orange">
              <LogOut size={22} />
            </div>
          </div>
          <span className="kpi-title">Check-out hoy</span>
          <div className="kpi-value">5</div>
          <span className="kpi-badge up">↑ 1 vs. ayer</span>
        </div>
      </div>

      {/* Main Grid: Left Tabs Table + Right Sidebar Widgets */}
      <div className="grid-reception-layout">
        {/* Left: Tabbed Table */}
        <div className="dash-card">
          {/* Tabs */}
          <div className="dash-tabs-nav">
            <button 
              className={`dash-tab-btn ${activeTab === 'reservas-dia' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservas-dia')}
            >
              Reservas del día
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Mostrando {displayedReservations.length} de 15 reservas
            </span>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>N° Reserva</th>
                  <th>Huésped</th>
                  <th>Habitación</th>
                  <th>Tipo</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedReservations.map((res) => (
                  <tr 
                    key={res.id} 
                    style={{ cursor: 'pointer', backgroundColor: selectedGuestReservation?.id === res.id ? '#f8fafc' : 'transparent' }}
                    onClick={() => setSelectedGuestReservation(res)}
                  >
                    <td style={{ fontWeight: '600', color: '#334155' }}>{res.codigo || res.idDisplay}</td>
                    <td style={{ fontWeight: '600' }}>{res.huesped}</td>
                    <td>{res.habitacion}</td>
                    <td>{res.tipo}</td>
                    <td>{res.checkInDisplay || res.checkIn}</td>
                    <td>{res.checkOutDisplay || res.checkOut}</td>
                    <td>
                      <span className={`badge-status ${String(res.estado || '').toLowerCase().replace('-', '')}`}>
                        {res.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {String(res.estado || '').toLowerCase() === 'confirmada' ? (
                          <button 
                            className="btn-checkin-action"
                            onClick={(e) => { e.stopPropagation(); handlePerformCheckin(res.id); }}
                          >
                            Check-in &gt;
                          </button>
                        ) : String(res.estado || '').toLowerCase() === 'pendiente' ? (
                          <button 
                            className="btn-confirm-action"
                            onClick={(e) => { e.stopPropagation(); handleConfirmReservation(res.id); }}
                          >
                            Confirmar
                          </button>
                        ) : (
                          <button 
                            className="btn-checkin-action" 
                            style={{ backgroundColor: '#10b981' }}
                            onClick={(e) => { e.stopPropagation(); alert(`Habitación ${res.habitacion} registrada correctamente.`); }}
                          >
                            Activa
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
                          <Eye size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="dash-pagination">
            <button className="dash-page-btn">‹</button>
            <button className="dash-page-btn active">1</button>
            <button className="dash-page-btn">2</button>
            <button className="dash-page-btn">3</button>
            <button className="dash-page-btn">›</button>
          </div>
        </div>

        {/* Right: Quick actions & Room status widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Actions */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>Acciones rápidas</h3>
            </div>
            <div className="quick-actions-grid">
              <button className="btn-quick-action" onClick={() => alert("Abriendo registro express de huésped...")}>
                <UserPlus />
                <span>Registrar huésped</span>
              </button>
              <button className="btn-quick-action" onClick={() => alert("Creando nueva reserva de suite...")}>
                <CalendarCheck />
                <span>Nueva reserva</span>
              </button>
              <button className="btn-quick-action" onClick={() => alert("Iniciando escáner de QR para Check-in...")}>
                <Bed />
                <span>Check-in</span>
              </button>
              <button className="btn-quick-action" onClick={() => alert("Procesando Check-out y cierre de cuenta...")}>
                <LogOut />
                <span>Check-out</span>
              </button>
            </div>
          </div>

          {/* Room status gauge widget */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>Estado de habitaciones</h3>
              <span className="link-more" onClick={() => alert("Mostrando mapa completo de habitaciones...")}>
                Ver todas →
              </span>
            </div>

            <div className="room-status-widget">
              <div className="room-status-legend-item">
                <div className="left">
                  <span className="status-dot green"></span>
                  <span>Disponibles</span>
                </div>
                <strong style={{ color: '#0f172a' }}>8</strong>
              </div>

              <div className="room-status-legend-item">
                <div className="left">
                  <span className="status-dot blue"></span>
                  <span>Ocupadas</span>
                </div>
                <strong style={{ color: '#0f172a' }}>12</strong>
              </div>

              <div className="room-status-legend-item">
                <div className="left">
                  <span className="status-dot red"></span>
                  <span>En mantenimiento</span>
                </div>
                <strong style={{ color: '#0f172a' }}>0</strong>
              </div>

              <div className="room-status-legend-item">
                <div className="left">
                  <span className="status-dot gray"></span>
                  <span>Bloqueadas</span>
                </div>
                <strong style={{ color: '#0f172a' }}>0</strong>
              </div>

              {/* Gauge */}
              <DonutChartSvg percent={60} size={140} centerLabel="Ocupación" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming checkins & Guest profile info */}
      <div className="grid-2-col">
        {/* Left: Próximos check-ins */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#2563eb" />
              <h3>Próximos check-ins</h3>
            </div>
            <span className="link-more" onClick={() => alert("Ver todos los check-ins de la tarde...")}>
              Ver todos →
            </span>
          </div>

          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Huésped</th>
                  <th>Habitación</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { hora: '14:00', huesped: 'Patricia Castillo', habitacion: '108', tipo: 'Suite' },
                  { hora: '15:00', huesped: 'Diego Vargas', habitacion: '203', tipo: 'Doble' },
                  { hora: '16:00', huesped: 'Sofía Herrera', habitacion: '305', tipo: 'Doble' },
                  { hora: '17:00', huesped: 'Alejandro Rojas', habitacion: '102', tipo: 'Simple' }
                ].map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '600', color: '#2563eb' }}>{item.hora}</td>
                    <td style={{ fontWeight: '600' }}>{item.huesped}</td>
                    <td>{item.habitacion}</td>
                    <td>{item.tipo}</td>
                    <td>
                      <button 
                        className="btn-checkin-action"
                        onClick={() => alert(`Iniciando registro de llegada para ${item.huesped} en habitación ${item.habitacion}...`)}
                      >
                        Registrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Información del huésped */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="#2563eb" />
              <h3>Información del huésped</h3>
            </div>
            <span className="link-more" onClick={() => alert("Abriendo historial de reservas del cliente...")}>
              Ver historial
            </span>
          </div>

          {selectedGuestReservation ? (
            <div>
              <div className="guest-info-profile">
                <div className="guest-avatar-large">
                  {selectedGuestReservation.huesped?.charAt(0) || 'H'}
                </div>
                <div className="guest-meta">
                  <h4>{selectedGuestReservation.huesped}</h4>
                  <p>{selectedGuestReservation.email || 'maria.lopez@email.com'}</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>{selectedGuestReservation.telefono || '+51 987 654 321'}</p>
                </div>
              </div>

              <div className="guest-details-grid">
                <div className="guest-detail-row">
                  <span className="label">Habitación</span>
                  <span className="value">{selectedGuestReservation.habitacion}</span>
                </div>
                <div className="guest-detail-row">
                  <span className="label">Tipo</span>
                  <span className="value">{selectedGuestReservation.tipo}</span>
                </div>
                <div className="guest-detail-row">
                  <span className="label">Check-in</span>
                  <span className="value">{selectedGuestReservation.checkInDisplay || selectedGuestReservation.checkIn}</span>
                </div>
                <div className="guest-detail-row">
                  <span className="label">Check-out</span>
                  <span className="value">{selectedGuestReservation.checkOutDisplay || selectedGuestReservation.checkOut}</span>
                </div>
              </div>

              <div className="guest-action-buttons">
                <button 
                  className="btn-guest-action blue"
                  onClick={() => setIsGuestDetailOpen(true)}
                >
                  <Eye size={15} /> Ver detalle
                </button>
                <button 
                  className="btn-guest-action green"
                  onClick={() => alert(`Editando datos de reserva para ${selectedGuestReservation.huesped}`)}
                >
                  <FileEdit size={15} /> Editar reserva
                </button>
                <button 
                  className="btn-guest-action purple"
                  onClick={() => window.print()}
                >
                  <Printer size={15} /> Imprimir ficha
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

      {/* Guest Detail Modal */}
      <GuestDetailModal
        isOpen={isGuestDetailOpen}
        onClose={() => setIsGuestDetailOpen(false)}
        reservation={selectedGuestReservation}
      />
    </div>
  );
}
