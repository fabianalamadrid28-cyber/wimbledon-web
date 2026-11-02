import React, { useState } from 'react';
import { 
  Bed, 
  CalendarCheck, 
  Users, 
  BarChart2, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  FileText, 
  Calendar, 
  Search,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { LineChartSvg, BarChartSvg, StatusDonutChartSvg } from '../../components/common/Charts';
import EditRoomModal from '../../components/modals/EditRoomModal';
import PdfReportModal from '../../components/modals/PdfReportModal';
import GuestDetailModal from '../../components/modals/GuestDetailModal';

export default function AdminDashboard({ 
  currentTab = 'inicio', 
  setCurrentTab, 
  rooms = [], 
  setRooms, 
  reservations = [], 
  setReservations,
  searchTerm = '' 
}) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roomSearch, setRoomSearch] = useState('');

  // Handle room edit/create
  const handleOpenEditRoom = (room = null) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (savedRoom) => {
    if (savedRoom.id) {
      setRooms(prev => prev.map(r => r.id === savedRoom.id ? savedRoom : r));
    } else {
      const newRoom = {
        ...savedRoom,
        id: Date.now(),
        numero: savedRoom.numero || '104'
      };
      setRooms(prev => [newRoom, ...prev]);
    }
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta habitación?")) {
      setRooms(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDeleteReservation = (id) => {
    if (window.confirm("¿Seguro que deseas cancelar/eliminar esta reserva?")) {
      setReservations(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleViewReservation = (res) => {
    setSelectedReservation(res);
    setIsGuestModalOpen(true);
  };

  // Defensive filtered reservations
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const filteredReservations = safeReservations.filter(res => {
    if (!res) return false;
    const huespedStr = String(res.huesped || '').toLowerCase();
    const habStr = String(res.habitacion || '');
    const codStr = String(res.codigo || res.idDisplay || '').toLowerCase();
    const estadoStr = String(res.estado || '');

    const term = (searchTerm || '').toLowerCase();
    const matchesSearch = !term || 
      huespedStr.includes(term) ||
      habStr.includes(term) ||
      codStr.includes(term);

    const matchesStatus = statusFilter === 'ALL' || 
      estadoStr.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Defensive filtered rooms
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const filteredRooms = safeRooms.filter(room => {
    if (!room) return false;
    const term = (roomSearch || searchTerm || '').toLowerCase();
    if (!term) return true;
    const numStr = String(room.numero || '').toLowerCase();
    const tipoStr = String(room.tipo || '').toLowerCase();
    const estadoStr = String(room.estado || '').toLowerCase();
    return numStr.includes(term) || tipoStr.includes(term) || estadoStr.includes(term);
  });

  // KPI Calculations
  const totalRooms = safeRooms.length > 0 ? safeRooms.length : 40;
  const activeReservationsCount = safeReservations.length > 0 ? safeReservations.length : 18;
  const hostedGuests = 25;
  const occupancyPercentage = 65;

  return (
    <div>
      {/* 1. TAB: PANEL PRINCIPAL (INICIO) */}
      {currentTab === 'inicio' && (
        <div>
          {/* Header */}
          <div className="dash-page-header">
            <div>
              <h1>¡Bienvenido, Administrador!</h1>
              <p>Aquí tienes un resumen del estado actual del hotel.</p>
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div className="kpi-grid">
            {/* Card 1: Habitaciones totales */}
            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box blue">
                  <Bed size={22} />
                </div>
              </div>
              <span className="kpi-title">Habitaciones totales</span>
              <div className="kpi-value">{totalRooms}</div>
              <div className="kpi-progress-bar-wrap">
                <div className="kpi-progress-bar-fill blue" style={{ width: '100%' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>100%</span>
            </div>

            {/* Card 2: Reservas activas */}
            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box green">
                  <CalendarCheck size={22} />
                </div>
              </div>
              <span className="kpi-title">Reservas activas</span>
              <div className="kpi-value">{activeReservationsCount}</div>
              <div className="kpi-progress-bar-wrap">
                <div className="kpi-progress-bar-fill green" style={{ width: '45%' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>45%</span>
            </div>

            {/* Card 3: Huéspedes alojados */}
            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box purple">
                  <Users size={22} />
                </div>
              </div>
              <span className="kpi-title">Huéspedes alojados</span>
              <div className="kpi-value">{hostedGuests}</div>
              <div className="kpi-progress-bar-wrap">
                <div className="kpi-progress-bar-fill purple" style={{ width: '63%' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>63%</span>
            </div>

            {/* Card 4: Ocupación del hotel */}
            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box orange">
                  <BarChart2 size={22} />
                </div>
              </div>
              <span className="kpi-title">Ocupación del hotel</span>
              <div className="kpi-value">{occupancyPercentage}%</div>
              <div className="kpi-progress-bar-wrap">
                <div className="kpi-progress-bar-fill orange" style={{ width: '65%' }}></div>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>65%</span>
            </div>
          </div>

          {/* Row with Revenue chart & Recent reservations */}
          <div className="grid-2-col">
            {/* Chart: Ingresos estimados */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Ingresos estimados (S/.)</h3>
              </div>
              <LineChartSvg />
            </div>

            {/* Table: Reservas recientes */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Reservas recientes</h3>
                <span className="link-more" onClick={() => setCurrentTab && setCurrentTab('reservas')}>
                  Ver todas →
                </span>
              </div>

              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Huésped</th>
                      <th>Habitación</th>
                      <th>Check-in</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeReservations.slice(0, 5).map((res) => (
                      <tr key={res.id}>
                        <td style={{ fontWeight: '600' }}>{res.huesped}</td>
                        <td>{res.habitacion}</td>
                        <td>{res.checkInDisplay || res.checkIn}</td>
                        <td>
                          <span className={`badge-status ${String(res.estado || '').toLowerCase().replace('-', '')}`}>
                            {res.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: GESTIÓN DE RESERVAS */}
      {currentTab === 'reservas' && (
        <div>
          <div className="dash-page-header">
            <div>
              <h1>Gestión de reservas</h1>
              <p>Consulta y administra todas las reservas del hotel.</p>
            </div>
            <button className="btn-primary" onClick={() => handleOpenEditRoom()}>
              <Plus size={18} /> Nueva reserva
            </button>
          </div>

          {/* Filters Bar */}
          <div className="dash-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div className="dash-filters-bar" style={{ margin: 0, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="dash-search-box" style={{ width: '220px', backgroundColor: '#fff' }}>
                  <Calendar size={16} color="#64748b" />
                  <input type="text" placeholder="Seleccionar fechas" defaultValue="12/07/2025 - 21/07/2025" />
                </div>

                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="Confirmada">Confirmadas</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="Check-in">Check-in</option>
                </select>
              </div>

              <div className="dash-search-box" style={{ maxWidth: '280px', backgroundColor: '#fff' }}>
                <Search size={16} color="#64748b" />
                <input 
                  type="text" 
                  placeholder="Buscar reserva o huésped..." 
                  value={searchTerm || ''}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="dash-card">
            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Huésped</th>
                    <th>Habitación</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((res) => (
                    <tr key={res.id}>
                      <td style={{ color: '#64748b', fontWeight: '500' }}>{res.idDisplay || res.codigo}</td>
                      <td style={{ fontWeight: '600' }}>{res.huesped}</td>
                      <td>{res.habitacion}</td>
                      <td>{res.checkInDisplay || res.checkIn}</td>
                      <td>{res.checkOutDisplay || res.checkOut}</td>
                      <td>
                        <span className={`badge-status ${String(res.estado || '').toLowerCase().replace('-', '')}`}>
                          {res.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="btn-action-icon" 
                            title="Ver detalle"
                            onClick={() => handleViewReservation(res)}
                          >
                            <Eye size={17} />
                          </button>
                          <button 
                            className="btn-action-icon" 
                            title="Editar"
                            onClick={() => handleViewReservation(res)}
                          >
                            <Edit2 size={17} />
                          </button>
                          <button 
                            className="btn-action-icon delete" 
                            title="Eliminar"
                            onClick={() => handleDeleteReservation(res.id)}
                          >
                            <Trash2 size={17} />
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
        </div>
      )}

      {/* 3. TAB: GESTIÓN DE HABITACIONES */}
      {currentTab === 'habitaciones' && (
        <div>
          <div className="dash-page-header">
            <div>
              <h1>Gestión de habitaciones</h1>
              <p>Administra la disponibilidad, precios y características de las habitaciones.</p>
            </div>
            <button className="btn-primary" onClick={() => handleOpenEditRoom()}>
              <Plus size={18} /> Nueva habitación
            </button>
          </div>

          {/* Search Box */}
          <div className="dash-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div className="dash-search-box" style={{ maxWidth: '380px', backgroundColor: '#fff' }}>
              <Search size={16} color="#64748b" />
              <input 
                type="text" 
                placeholder="Buscar habitación..." 
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Rooms Table */}
          <div className="dash-card">
            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Tipo</th>
                    <th>Precio/noche</th>
                    <th>Capacidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr key={room.id}>
                      <td style={{ fontWeight: '700' }}>{room.numero}</td>
                      <td>
                        <div className="room-thumb-col">
                          <img 
                            src={room.urlImagen || '/suite-simple.jpg'} 
                            alt={room.tipo} 
                            className="room-thumbnail-img"
                            onError={(e) => { e.target.style.opacity = 0.5; }}
                          />
                          <span style={{ fontWeight: '600' }}>{room.tipo}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>S/ {parseFloat(room.precioBloque || 120).toFixed(2)}</td>
                      <td>{room.capacidad || 2}</td>
                      <td>
                        <span className={`badge-status ${String(room.estado || 'DISPONIBLE').toLowerCase()}`}>
                          {room.estado ? room.estado.charAt(0) + room.estado.slice(1).toLowerCase().replace('_', ' ') : 'Disponible'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn-action-icon" 
                            title="Editar habitación"
                            onClick={() => handleOpenEditRoom(room)}
                          >
                            <Edit2 size={17} />
                          </button>
                          <button 
                            className="btn-action-icon delete" 
                            title="Eliminar habitación"
                            onClick={() => handleDeleteRoom(room.id)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: REPORTES Y ESTADÍSTICAS */}
      {currentTab === 'reportes' && (
        <div>
          <div className="dash-page-header">
            <div>
              <h1>Reportes y estadísticas</h1>
              <p>Visualiza el rendimiento del hotel y genera informes.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="dash-search-box" style={{ width: '230px', backgroundColor: '#fff' }}>
                <Calendar size={16} color="#64748b" />
                <input type="text" defaultValue="01/07/2025 - 31/07/2025" readOnly />
              </div>
              <button className="btn-primary" onClick={() => setIsPdfModalOpen(true)}>
                <FileText size={18} /> Generar reporte
              </button>
            </div>
          </div>

          {/* 3 Summary Cards */}
          <div className="grid-3-col">
            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box blue">
                  <TrendingUp size={22} />
                </div>
              </div>
              <span className="kpi-title">Ingresos totales</span>
              <div className="kpi-value">S/ 28,450.00</div>
              <span className="kpi-badge up">↑ 12% vs. mes anterior</span>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box green">
                  <CalendarCheck size={22} />
                </div>
              </div>
              <span className="kpi-title">Reservas realizadas</span>
              <div className="kpi-value">42</div>
              <span className="kpi-badge up">↑ 8% vs. mes anterior</span>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box teal">
                  <CheckCircle size={22} />
                </div>
              </div>
              <span className="kpi-title">Ocupación promedio</span>
              <div className="kpi-value">65%</div>
              <span className="kpi-badge up">↑ 5% vs. mes anterior</span>
            </div>
          </div>

          {/* 3 Analytics Charts */}
          <div className="grid-3-col" style={{ marginTop: '20px' }}>
            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Ocupación por tipo de habitación</h3>
              </div>
              <BarChartSvg />
            </div>

            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Ingresos por mes</h3>
              </div>
              <LineChartSvg />
            </div>

            <div className="dash-card">
              <div className="dash-card-header">
                <h3>Estado de reservas</h3>
              </div>
              <StatusDonutChartSvg />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditRoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        room={selectedRoom}
        onSave={handleSaveRoom}
      />

      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      <GuestDetailModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        reservation={selectedReservation}
      />
    </div>
  );
}
