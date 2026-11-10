import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle, 
  Wrench, 
  Calendar, 
  Filter, 
  CheckSquare, 
  AlertTriangle,
  Play,
  RotateCcw,
  DoorClosed,
  ArrowRight,
  ShieldCheck,
  Check,
  Layers,
  Sparkle
} from 'lucide-react';
import { api } from '../../services/api';
import HousekeepingChecklistModal from '../../components/modals/HousekeepingChecklistModal';
import SoportePanel from './SoportePanel';

export default function HousekeepingDashboard({
  rooms = [],
  acciones,
  searchTerm = '',
  currentTab = 'inicio',
  setCurrentTab,
  onAddNotification
}) {
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [reportRoom, setReportRoom] = useState('');

  // Estado del verificador de checklist en la sección "Checklists de Aseo"
  const pendingOrProcessRooms = rooms.filter(r => r.estado === 'LIMPIEZA_PENDIENTE' || r.estado === 'EN_PROCESO');
  const [checklistActiveRoomId, setChecklistActiveRoomId] = useState(
    pendingOrProcessRooms[0]?.id || rooms[0]?.id || null
  );
  const [checklistTasks, setChecklistTasks] = useState({
    sabanas: false,
    jacuzzi: false,
    superficies: false,
    amenities: false,
    frigobar: false,
    aroma: false
  });
  const [checklistSuccessMsg, setChecklistSuccessMsg] = useState('');

  // Transición: Iniciar Limpieza (moves to EN_PROCESO)
  const handleStartCleaning = (roomId) => {
    acciones.cambiarEstadoHabitacion(roomId, 'EN_PROCESO');
    const target = rooms.find(r => r.id === roomId);
    if (onAddNotification && target) {
      onAddNotification({
        tipo: 'limpieza',
        titulo: 'Limpieza en Proceso',
        mensaje: `Personal inició el aseo en Habitación ${target.numero}.`
      });
    }
  };

  // Abrir checklist modal para finalizar
  const handleOpenChecklist = (room) => {
    setSelectedRoom(room);
    setIsChecklistModalOpen(true);
  };

  // Completar limpieza
  const handleFinishCleaning = async (roomId) => {
    await acciones.cambiarEstadoHabitacion(roomId, 'LISTA');
    const target = rooms.find(r => r.id === roomId) || selectedRoom;
    if (onAddNotification && target) {
      onAddNotification({
        tipo: 'limpieza',
        titulo: 'Habitación Lista para Huéspedes',
        mensaje: `Habitación ${target.numero} desinfectada y lista para nuevo check-in.`
      });
    }
  };

  // Abrir soporte técnico para una habitación
  const handleOpenMaintenance = (room) => {
    setReportRoom(room.numero);
    if (setCurrentTab) setCurrentTab('mantenimiento');
  };

  // Marcar como sucia
  const handleMarkAsDirty = (roomId) => {
    acciones.cambiarEstadoHabitacion(roomId, 'LIMPIEZA_PENDIENTE');
  };

  // Certificar desde la pestaña de Checklists
  const handleCertifyChecklist = async () => {
    if (!checklistActiveRoomId) return;
    await handleFinishCleaning(checklistActiveRoomId);
    setChecklistSuccessMsg(`¡Habitación #${rooms.find(r => r.id === checklistActiveRoomId)?.numero || ''} certificada con éxito como LISTA!`);
    setChecklistTasks({
      sabanas: false,
      jacuzzi: false,
      superficies: false,
      amenities: false,
      frigobar: false,
      aroma: false
    });
    setTimeout(() => setChecklistSuccessMsg(''), 4000);
  };

  // Filtros
  const filteredRooms = rooms.filter(room => {
    const matchesFloor = floorFilter === 'ALL' || room.piso === parseInt(floorFilter);
    const matchesStatus = statusFilter === 'ALL' || room.estado.toUpperCase() === statusFilter.toUpperCase();
    const matchesSearch = !searchTerm || 
      room.numero.includes(searchTerm) || 
      room.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.nombreTema && room.nombreTema.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFloor && matchesStatus && matchesSearch;
  });

  // Métricas
  const totalRooms = rooms.length;
  const pendingCleaning = rooms.filter(r => r.estado === 'LIMPIEZA_PENDIENTE').length;
  const inProgressCleaning = rooms.filter(r => r.estado === 'EN_PROCESO').length;
  const readyRooms = rooms.filter(r => r.estado === 'DISPONIBLE' || r.estado === 'LISTA').length;
  const maintenanceRooms = rooms.filter(r => r.estado === 'MANTENIMIENTO').length;
  const occupiedRooms = rooms.filter(r => r.estado === 'OCUPADA' || r.estado === 'RESERVADA').length;

  const urgentRooms = rooms.filter(r => r.estado === 'LIMPIEZA_PENDIENTE' || r.estado === 'EN_PROCESO');

  // Si la pestaña activa es Mantenimiento
  if (currentTab === 'mantenimiento') {
    return <SoportePanel rooms={rooms} initialRoom={reportRoom} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Encabezado General del Panel */}
      <div className="dash-page-header">
        <div>
          <h1>¡Hola, Rosa! (Panel de Limpieza)</h1>
          <p>
            {currentTab === 'inicio' && 'Tablero ejecutivo de aseo y desinfección de suites.'}
            {currentTab === 'habitaciones' && 'Inventario completo de 150 habitaciones por pisos.'}
            {currentTab === 'checklists' && 'Protocolos oficiales y certificación de bioseguridad.'}
          </p>
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
          <span>Hoy, {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* ========================================================
          SECCIÓN 1: TABLERO DE ASEO (currentTab === 'inicio')
      ======================================================== */}
      {currentTab === 'inicio' && (
        <>
          {/* 4 KPI Cards for Housekeeping */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box orange">
                  <Sparkles size={22} />
                </div>
              </div>
              <span className="kpi-title">Limpieza Pendiente</span>
              <div className="kpi-value">{pendingCleaning}</div>
              <span className="kpi-badge up" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                Requieren atención
              </span>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box blue">
                  <Clock size={22} />
                </div>
              </div>
              <span className="kpi-title">En proceso de aseo</span>
              <div className="kpi-value">{inProgressCleaning}</div>
              <span className="kpi-badge up" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                Personal en suite
              </span>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box green">
                  <CheckCircle size={22} />
                </div>
              </div>
              <span className="kpi-title">Limpias y listas</span>
              <div className="kpi-value">{readyRooms}</div>
              <span className="kpi-badge up">Listas para check-in</span>
            </div>

            <div className="kpi-card">
              <div className="kpi-card-top">
                <div className="kpi-icon-box" style={{ backgroundColor: '#ef4444' }}>
                  <Wrench size={22} />
                </div>
              </div>
              <span className="kpi-title">En mantenimiento</span>
              <div className="kpi-value">{maintenanceRooms}</div>
              <span className="kpi-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                Bloqueadas por avería
              </span>
            </div>
          </div>

          {/* Tablero de Aseo Urgente / Habitaciones prioritarias */}
          <div className="dash-card" style={{ padding: '20px' }}>
            <div className="dash-card-header" style={{ marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} color="#f59e0b" />
                  Habitaciones con Atención Prioritaria ({urgentRooms.length})
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Suites pendientes de aseo tras check-out o en preparación para nueva asignación.
                </span>
              </div>
              <button 
                className="btn-primary" 
                style={{ fontSize: '12.5px', padding: '6px 14px' }}
                onClick={() => setCurrentTab('habitaciones')}
              >
                Ver Todas las 150 Habitaciones →
              </button>
            </div>

            {urgentRooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>¡Excelente trabajo! No hay limpiezas pendientes</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Todas las habitaciones desocupadas han sido desinfectadas y están listas para recepción.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '14px',
                maxHeight: '440px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {urgentRooms.map(room => {
                  const isPending = room.estado === 'LIMPIEZA_PENDIENTE';
                  const isInProgress = room.estado === 'EN_PROCESO';

                  return (
                    <div 
                      key={room.id}
                      style={{
                        background: isPending ? '#fffbeb' : '#eff6ff',
                        border: isPending ? '1px solid #fde68a' : '1px solid #bfdbfe',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isPending ? '#fef3c7' : '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: isPending ? '#b45309' : '#1d4ed8'
                          }}>
                            {room.numero}
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>Piso {room.piso}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{room.nombreTema || room.tipo}</div>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: isPending ? '#fee2e2' : '#dbeafe',
                          color: isPending ? '#b91c1c' : '#1d4ed8'
                        }}>
                          {isPending ? '⚠️ Pendiente' : '⏳ En Proceso'}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        {room.tieneJacuzzi && <span style={{ marginRight: '8px' }}>♨ Jacuzzi</span>}
                        {room.tieneSauna && <span style={{ marginRight: '8px' }}>✦ Sauna</span>}
                        {room.tieneCocheraDirecta && <span>🚗 Cochera Directa</span>}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '4px' }}>
                        {isPending && (
                          <button 
                            className="btn-primary" 
                            style={{ flex: 1, padding: '7px 10px', fontSize: '12px', justifyContent: 'center' }}
                            onClick={() => handleStartCleaning(room.id)}
                          >
                            <Play size={13} /> Iniciar Limpieza
                          </button>
                        )}

                        {isInProgress && (
                          <button 
                            className="btn-primary" 
                            style={{ flex: 1, padding: '7px 10px', fontSize: '12px', backgroundColor: '#10b981', justifyContent: 'center' }}
                            onClick={() => handleOpenChecklist(room)}
                          >
                            <CheckSquare size={13} /> Finalizar Aseo
                          </button>
                        )}

                        <button 
                          className="btn-secondary"
                          title="Reportar avería técnica"
                          style={{ padding: '7px 10px', color: '#ef4444' }}
                          onClick={() => handleOpenMaintenance(room)}
                        >
                          <Wrench size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resumen Operativo de Turno */}
          <div className="grid-2-col" style={{ gap: '18px' }}>
            <div className="dash-card" style={{ padding: '18px' }}>
              <div className="dash-card-header" style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px' }}>Estado General del Inventario (150 Suites)</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Piso 1 - Cochera Directa (50 habs):</span>
                  <strong>{rooms.filter(r => r.piso === 1 && (r.estado === 'DISPONIBLE' || r.estado === 'LISTA')).length} listas</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Piso 2 - Suites Sensuales (50 habs):</span>
                  <strong>{rooms.filter(r => r.piso === 2 && (r.estado === 'DISPONIBLE' || r.estado === 'LISTA')).length} listas</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Piso 3 - Nivel Presidencial (50 habs):</span>
                  <strong>{rooms.filter(r => r.piso === 3 && (r.estado === 'DISPONIBLE' || r.estado === 'LISTA')).length} listas</strong>
                </div>
              </div>
            </div>

            <div className="dash-card" style={{ padding: '18px' }}>
              <div className="dash-card-header" style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px' }}>Accesos Rápidos de Limpieza</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className="btn-secondary" 
                  style={{ justifyContent: 'space-between', padding: '10px 14px', fontSize: '13px' }}
                  onClick={() => setCurrentTab('checklists')}
                >
                  <span>Protocolos y Checklists de Aseo</span>
                  <ArrowRight size={14} />
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ justifyContent: 'space-between', padding: '10px 14px', fontSize: '13px' }}
                  onClick={() => setCurrentTab('mantenimiento')}
                >
                  <span>Reportar o Ver Averías Técnicas (Soporte)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          SECCIÓN 2: HABITACIONES (currentTab === 'habitaciones')
      ======================================================== */}
      {currentTab === 'habitaciones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Barra de Filtros con Tabs de Pisos */}
          <div className="dash-card" style={{ padding: '16px 20px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {/* Botones de Piso */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className={`dash-tab-btn ${floorFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFloorFilter('ALL')}
                >
                  Todos los Pisos (150 habs)
                </button>
                <button
                  className={`dash-tab-btn ${floorFilter === '1' ? 'active' : ''}`}
                  onClick={() => setFloorFilter('1')}
                >
                  Piso 1 (101-150)
                </button>
                <button
                  className={`dash-tab-btn ${floorFilter === '2' ? 'active' : ''}`}
                  onClick={() => setFloorFilter('2')}
                >
                  Piso 2 (201-250)
                </button>
                <button
                  className={`dash-tab-btn ${floorFilter === '3' ? 'active' : ''}`}
                  onClick={() => setFloorFilter('3')}
                >
                  Piso 3 (301-350)
                </button>
              </div>

              {/* Filtro de Estado */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ minWidth: '170px' }}
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="LIMPIEZA_PENDIENTE">⚠️ Limpieza Pendiente</option>
                  <option value="EN_PROCESO">⏳ En Proceso</option>
                  <option value="LISTA">✅ Listas</option>
                  <option value="DISPONIBLE">🟢 Disponibles</option>
                  <option value="OCUPADA">🔵 Ocupadas</option>
                  <option value="RESERVADA">📌 Reservadas</option>
                  <option value="MANTENIMIENTO">🔧 En Mantenimiento</option>
                </select>

                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Mostrando <strong>{filteredRooms.length}</strong> de <strong>{rooms.length}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Grid de 150 Habitaciones con scroll contenido */}
          <div style={{ maxHeight: '680px', overflowY: 'auto', paddingRight: '4px' }}>
            <div className="cleaning-grid">
              {filteredRooms.map((room) => {
                const isPending = room.estado === 'LIMPIEZA_PENDIENTE';
                const isInProgress = room.estado === 'EN_PROCESO';
                const isReady = room.estado === 'DISPONIBLE' || room.estado === 'LISTA';
                const isMaintenance = room.estado === 'MANTENIMIENTO';

                let cardClass = 'cleaning-card';
                if (isPending) cardClass += ' urgent';
                if (isInProgress) cardClass += ' in-progress';
                if (isReady) cardClass += ' ready';

                return (
                  <div key={room.id} className={cardClass}>
                    <div className="cleaning-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                          <DoorClosed size={20} />
                        </div>
                        <div>
                          <span className="cleaning-room-num">Hab. {room.numero}</span>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {room.nombreTema || room.tipo} · Piso {room.piso || 1}
                          </div>
                        </div>
                      </div>

                      <span className={`badge-status ${room.estado.toLowerCase()}`}>
                        {isPending && '⚠️ Pendiente'}
                        {isInProgress && '⏳ En proceso'}
                        {isReady && (room.estado === 'LISTA' ? '✅ Lista' : '🟢 Disponible')}
                        {isMaintenance && '🔧 Mantenimiento'}
                        {room.estado === 'OCUPADA' && '🔵 Ocupada'}
                        {room.estado === 'RESERVADA' && '📌 Reservada'}
                      </span>
                    </div>

                    {/* Room details */}
                    <div style={{ fontSize: '12.5px', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 4px 0' }}>
                        {room.descripcion || 'Suite ejecutiva con baño completo y amenidades.'}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#475569', marginTop: '6px' }}>
                        {room.tieneJacuzzi && <span>♨ Jacuzzi</span>}
                        {room.tieneSauna && <span>✦ Sauna</span>}
                        {room.tienePoleDance && <span>💃 Pole Dance</span>}
                        {room.tieneCocheraDirecta && <span>🚗 Cochera</span>}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '6px' }}>
                      {isPending && (
                        <button 
                          className="btn-primary" 
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12.5px', justifyContent: 'center' }}
                          onClick={() => handleStartCleaning(room.id)}
                        >
                          <Play size={13} /> Iniciar Limpieza
                        </button>
                      )}

                      {isInProgress && (
                        <button 
                          className="btn-primary" 
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12.5px', backgroundColor: '#10b981', justifyContent: 'center' }}
                          onClick={() => handleOpenChecklist(room)}
                        >
                          <CheckSquare size={13} /> Finalizar Aseo
                        </button>
                      )}

                      {isReady && (
                        <button 
                          className="btn-secondary" 
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px', justifyContent: 'center' }}
                          onClick={() => handleMarkAsDirty(room.id)}
                        >
                          <RotateCcw size={13} /> Marcar por Limpiar
                        </button>
                      )}

                      <button 
                        className="btn-secondary" 
                        title="Reportar Avería técnica"
                        style={{ padding: '8px 12px', color: '#ef4444' }}
                        onClick={() => handleOpenMaintenance(room)}
                      >
                        <Wrench size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECCIÓN 3: CHECKLISTS DE ASEO (currentTab === 'checklists')
      ======================================================== */}
      {currentTab === 'checklists' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) 1fr', gap: '20px' }}>
          {/* Herramienta de Inspección y Certificación Activa */}
          <div className="dash-card" style={{ padding: '22px' }}>
            <div className="dash-card-header" style={{ marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckSquare size={18} color="#10b981" />
                  Certificación y Checklist de Suite
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Completa los 6 puntos obligatorios para certificar la suite como LISTA.
                </span>
              </div>
            </div>

            {/* Selector de Habitación a Inspeccionar */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Seleccionar Suite a Certificar:
              </label>
              <select
                className="filter-select"
                style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px' }}
                value={checklistActiveRoomId || ''}
                onChange={(e) => setChecklistActiveRoomId(Number(e.target.value))}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Habitación {r.numero} (Piso {r.piso}) · {r.nombreTema || r.tipo} · [{r.estado}]
                  </option>
                ))}
              </select>
            </div>

            {checklistSuccessMsg && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#065f46',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={18} />
                <strong>{checklistSuccessMsg}</strong>
              </div>
            )}

            {/* Lista de Verificación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {[
                { key: 'sabanas', title: '1. Ropa de Cama y Lencería', desc: 'Sábanas blancas desinfectadas a vapor, fundas y cubrecolchón renovados.' },
                { key: 'jacuzzi', title: '2. Desinfección de Jacuzzi y Ducha', desc: 'Circulación de pastilla desinfectante 5 min, secado y descalcificación.' },
                { key: 'superficies', title: '3. Esterilización de Mobiliario Íntimo', desc: 'Limpieza de sillón tántrico, barra de pole dance, veladores y controles.' },
                { key: 'amenities', title: '4. Reposición de Amenities y Toallas', desc: '3 toallas de cuerpo, 2 de mano, kit de higiene íntima, pantuflas y batas.' },
                { key: 'frigobar', title: '5. Frigobar y Menaje Sellado', desc: 'Reposición de bebidas y licores fríos, vasos higienizados con precinto.' },
                { key: 'aroma', title: '6. Climatización y Aromatización', desc: 'Aire acondicionado a 22°C, aromatizante Wimbledon y precinto en puerta.' }
              ].map(item => (
                <label 
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    background: checklistTasks[item.key] ? '#f0fdf4' : '#f8fafc',
                    border: checklistTasks[item.key] ? '1px solid #86efac' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checklistTasks[item.key]}
                    onChange={(e) => setChecklistTasks(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#10b981' }}
                  />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{item.title}</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <button
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                justifyContent: 'center',
                background: Object.values(checklistTasks).every(Boolean) ? '#10b981' : '#94a3b8',
                borderColor: Object.values(checklistTasks).every(Boolean) ? '#059669' : '#94a3b8'
              }}
              disabled={!Object.values(checklistTasks).every(Boolean)}
              onClick={handleCertifyChecklist}
            >
              <CheckCircle size={18} />
              Certificar Suite y Pasar a Estado LISTA
            </button>
          </div>

          {/* Tarjetas de Protocolos Oficiales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dash-card" style={{ padding: '18px' }}>
              <div className="dash-card-header" style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '15px' }}>✦ Protocolo de Jacuzzi &amp; Sauna</h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                1. Drenar completamente la tina tras salida del huésped.<br />
                2. Aplicar desengrasante antibacteriano y desinfectante hospitalario.<br />
                3. Activar hidromasaje durante 5 minutos para purgar conductos internos.<br />
                4. Enjuagar con agua caliente y secar con paño de microfibra esterilizado.
              </p>
            </div>

            <div className="dash-card" style={{ padding: '18px' }}>
              <div className="dash-card-header" style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '15px' }}>✦ Estándar de Privacidad y Silencio</h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                - El personal de aseo nunca ingresa a pasillos transitados sin carrito cubierto.<br />
                - Comunicar fin de limpieza a través del sistema móvil para no requerir llamadas.<br />
                - Mantener discreción absoluta en habitaciones con cochera directa privada.
              </p>
            </div>

            <div className="dash-card" style={{ padding: '18px' }}>
              <div className="dash-card-header" style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '15px' }}>✦ Reposición de Sellos Inviolables</h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Toda suite completada debe llevar precinto adhesivo en el frigobar y en el acceso principal, garantizando al huésped que nadie ha ingresado tras la desinfección.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Finalización Rápida de Limpieza */}
      <HousekeepingChecklistModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        room={selectedRoom}
        onComplete={handleFinishCleaning}
      />
    </div>
  );
}
