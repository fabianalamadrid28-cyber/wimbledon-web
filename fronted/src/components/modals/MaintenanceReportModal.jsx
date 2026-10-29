import React, { useState } from 'react';
import { X, Wrench, AlertTriangle } from 'lucide-react';

export default function MaintenanceReportModal({ isOpen, onClose, room, onSubmit }) {
  const [motivo, setMotivo] = useState('Avería en grifería / jacuzzi');
  const [prioridad, setPrioridad] = useState('Alta');
  const [detalles, setDetalles] = useState('');

  if (!isOpen || !room) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(room.id, { motivo, prioridad, detalles });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wrench size={20} color="#ef4444" />
            <h3 style={{ margin: 0 }}>Reportar Avería - Hab. {room.numero}</h3>
          </div>
          <button className="btn-action-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Tipo de problema / avería</label>
              <select className="form-control" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                <option value="Avería en grifería / jacuzzi">Avería en grifería / jacuzzi</option>
                <option value="Problema en aire acondicionado">Problema en aire acondicionado</option>
                <option value="Falla eléctrica o luminarias">Falla eléctrica o luminarias</option>
                <option value="Cerradura electrónica no responde">Cerradura electrónica no responde</option>
                <option value="Daño en mobiliario / cama">Daño en mobiliario / cama</option>
                <option value="Otro motivo técnico">Otro motivo técnico</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nivel de prioridad</label>
              <select className="form-control" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                <option value="Alta">Urgente (Bloquear habitación)</option>
                <option value="Media">Media (Atender en turno)</option>
                <option value="Baja">Baja (Mantenimiento preventivo)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Descripción detallada</label>
              <textarea 
                className="form-control" 
                rows={3} 
                required
                placeholder="Explica el fallo detectado..."
                value={detalles}
                onChange={(e) => setDetalles(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ backgroundColor: '#ef4444' }}>
              <AlertTriangle size={16} /> Enviar a Mantenimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

