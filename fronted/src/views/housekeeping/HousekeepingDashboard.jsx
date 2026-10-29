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
  DoorClosed
} from 'lucide-react';
import HousekeepingChecklistModal from '../../components/modals/HousekeepingChecklistModal';
import MaintenanceReportModal from '../../components/modals/MaintenanceReportModal';

export default function HousekeepingDashboard({
  rooms,
  setRooms,
  searchTerm
}) {
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  // Transition: Iniciar Limpieza (moves to EN_PROCESO)
  const handleStartCleaning = (roomId) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, estado: 'EN_PROCESO' };
      }
      return r;
    }));
  };

  // Open checklist to finalize
  const handleOpenChecklist = (room) => {
    setSelectedRoom(room);
    setIsChecklistModalOpen(true);
  };

  // Complete cleaning from checklist
  const handleFinishCleaning = (roomId, notes) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, estado: 'DISPONIBLE' };
      }
      return r;
    }));
    alert(`¡Habitación lista e inspeccionada! Ahora figura como Disponible en Recepción.`);
  };

  // Open maintenance report
  const handleOpenMaintenance = (room) => {
    setSelectedRoom(room);
    setIsMaintenanceModalOpen(true);
  };

  // Submit maintenance
  const handleSubmitMaintenance = (roomId, reportData) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, estado: 'MANTENIMIENTO' };
      }
      return r;
    }));
    alert(`Habitación puesta en mantenimiento por: ${reportData.motivo}`);
  };

  // Reset to pending cleaning
  const handleMarkAsDirty = (roomId) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return { ...r, estado: 'LIMPIEZA_PENDIENTE' };
      }
      return r;
    }));
  };

  // Filters
  const filteredRooms = rooms.filter(room => {
    const matchesFloor = floorFilter === 'ALL' || room.piso === parseInt(floorFilter);
    const matchesStatus = statusFilter === 'ALL' || room.estado.toUpperCase() === statusFilter.toUpperCase();
    const matchesSearch = !searchTerm || 
      room.numero.includes(searchTerm) || 
      room.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFloor && matchesStatus && matchesSearch;
  });

  // Calculate Metrics
  const pendingCleaning = rooms.filter(r => r.estado === 'LIMPIEZA_PENDIENTE').length;
  const inProgressCleaning = rooms.filter(r => r.estado === 'EN_PROCESO').length;
  const readyRooms = rooms.filter(r => r.estado === 'DISPONIBLE' || r.estado === 'LISTA').length;
  const maintenanceRooms = rooms.filter(r => r.estado === 'MANTENIMIENTO').length;

  return (
    <div>
      {/* Page Header */}
      <div className="dash-page-header">
        <div>
          <h1>¡Hola, Rosa!</h1>
          <p>Control de estado, aseo y desinfección de habitaciones.</p>
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

      {/* Filter Toolbar */}
      <div className="dash-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div className="dash-filters-bar" style={{ margin: 0, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
              <Filter size={16} />
              <span>Filtrar por:</span>
            </div>

            <select 
              className="filter-select"
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
            >
              <option value="ALL">Todos los pisos</option>
              <option value="1">Piso 1</option>
              <option value="2">Piso 2</option>
              <option value="3">Piso 3</option>
            </select>

            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Todos los estados</option>
              <option value="LIMPIEZA_PENDIENTE">Limpieza Pendiente</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="DISPONIBLE">Disponibles / Listas</option>
              <option value="MANTENIMIENTO">En Mantenimiento</option>
            </select>
          </div>

          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Mostrando <strong>{filteredRooms.length}</strong> habitaciones
          </span>
        </div>
      </div>

      {/* Interactive Rooms Grid for Housekeeping */}
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
                      {room.tipo} · Piso {room.piso || 1}
                    </div>
                  </div>
                </div>

                <span className={`badge-status ${room.estado.toLowerCase()}`}>
                  {isPending && '⚠️ Pendiente'}
                  {isInProgress && '⏳ En proceso'}
                  {isReady && '✅ Lista'}
                  {isMaintenance && '🔧 Mantenimiento'}
                  {room.estado === 'OCUPADA' && '🔵 Ocupada'}
                </span>
              </div>

              {/* Room details */}
              <div style={{ fontSize: '13px', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px 0' }}>
                  {room.descripcion || 'Suite con comodidades y baño completo.'}
                </p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: '#475569', marginTop: '6px' }}>
                  {room.tieneJacuzzi && <span>♨ Jacuzzi</span>}
                  {room.tieneSauna && <span>✦ Sauna</span>}
                  {room.tieneCocheraDirecta && <span>🚗 Cochera Directa</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '6px' }}>
                {isPending && (
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px', justifyContent: 'center' }}
                    onClick={() => handleStartCleaning(room.id)}
                  >
                    <Play size={14} /> Iniciar Limpieza
                  </button>
                )}

                {isInProgress && (
                  <button 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px', backgroundColor: '#10b981', justifyContent: 'center' }}
                    onClick={() => handleOpenChecklist(room)}
                  >
                    <CheckSquare size={14} /> Finalizar Aseo
                  </button>
                )}

                {isReady && (
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px', justifyContent: 'center' }}
                    onClick={() => handleMarkAsDirty(room.id)}
                  >
                    <RotateCcw size={14} /> Marcar por Limpiar
                  </button>
                )}

                <button 
                  className="btn-secondary" 
                  title="Reportar Avería técnica"
                  style={{ padding: '8px 12px', color: '#ef4444' }}
                  onClick={() => handleOpenMaintenance(room)}
                >
                  <Wrench size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <HousekeepingChecklistModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        room={selectedRoom}
        onComplete={handleFinishCleaning}
      />

      <MaintenanceReportModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        room={selectedRoom}
        onSubmit={handleSubmitMaintenance}
      />
    </div>
  );
}

