import React, { useState } from 'react';
import { X, CheckCircle, Sparkles } from 'lucide-react';

export default function HousekeepingChecklistModal({ isOpen, onClose, room, onComplete }) {
  const [tasks, setTasks] = useState({
    bedding: true,
    bathroom: false,
    towels: false,
    surfaces: false,
    minibar: false,
    ventilation: true
  });
  const [notes, setNotes] = useState('');

  if (!isOpen || !room) return null;

  const toggleTask = (key) => {
    setTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allDone = Object.values(tasks).every(Boolean);

  const handleFinish = (e) => {
    e.preventDefault();
    onComplete(room.id, notes);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#2563eb" />
            <h3 style={{ margin: 0 }}>Protocolo de Limpieza - Hab. {room.numero}</h3>
          </div>
          <button className="btn-action-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleFinish}>
          <div className="modal-body">
            <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: 0 }}>
              Tipo: <strong>{room.tipo}</strong> · Piso: <strong>{room.piso || 1}</strong>. Marca cada tarea realizada para garantizar el estándar de calidad Wimbledon.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <label className="cleaning-checklist-item">
                <input 
                  type="checkbox" 
                  checked={tasks.bedding} 
                  onChange={() => toggleTask('bedding')} 
                />
                <span>Cambio completo de sábanas, fundas y lencería blanca</span>
              </label>

              <label className="cleaning-checklist-item">
                <input 
                  type="checkbox" 
                  checked={tasks.bathroom} 
                  onChange={() => toggleTask('bathroom')} 
                />
                <span>Desinfección profunda de baño, ducha y jacuzzi</span>
              </label>

              <label className="cleaning-checklist-item">
                <input 
                  type="checkbox" 
                  checked={tasks.towels} 
                  onChange={() => toggleTask('towels')} 
                />
                <span>Reposición de toallas limpias, jabones y kit de amenities</span>
              </label>

              <label className="cleaning-checklist-item">
                <input 
                  type="checkbox" 
                  checked={tasks.surfaces} 
                  onChange={() => toggleTask('surfaces')} 
                />
                <span>Aspirado de alfombras, limpieza de espejos y superficies</span>
              </label>

              <label className="cleaning-checklist-item">
                <input 
                  type="checkbox" 
                  checked={tasks.minibar} 
                  onChange={() => toggleTask('minibar')} 
                />
                <span>Revisión de frigobar, TV, aire acondicionado y luces</span>
              </label>

              <label className="cleaning-checklist-item">
                <input 
                  type="checkbox" 
                  checked={tasks.ventilation} 
                  onChange={() => toggleTask('ventilation')} 
                />
                <span>Aromatización y ventilación de la suite</span>
              </label>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Observaciones o artículos olvidados</label>
              <textarea 
                className="form-control" 
                rows={2} 
                placeholder="Ninguna incidencia encontrada..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button 
              type="submit" 
              className="btn-primary"
              style={{ backgroundColor: allDone ? '#10b981' : '#2563eb' }}
            >
              <CheckCircle size={16} /> Marcar como Lista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

