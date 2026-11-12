import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Sparkles, Loader2 } from 'lucide-react';

const TAREAS = [
  { key: 'bedding', texto: 'Cambio completo de sábanas, fundas y lencería blanca' },
  { key: 'bathroom', texto: 'Desinfección profunda de baño, ducha y jacuzzi' },
  { key: 'towels', texto: 'Reposición de toallas limpias, jabones y kit de amenities' },
  { key: 'surfaces', texto: 'Aspirado de alfombras, limpieza de espejos y superficies' },
  { key: 'minibar', texto: 'Revisión de frigobar, TV, aire acondicionado y luces' },
  { key: 'ventilation', texto: 'Aromatización y ventilación de la suite' }
];

const TAREAS_VACIAS = Object.fromEntries(TAREAS.map(t => [t.key, false]));

export default function HousekeepingChecklistModal({ isOpen, onClose, room, onComplete, busy = false }) {
  const [tasks, setTasks] = useState(TAREAS_VACIAS);
  const [notes, setNotes] = useState('');

  // Cada vez que se abre para una habitación el checklist empieza limpio
  // (antes conservaba lo marcado de la habitación anterior y traía 2 tareas marcadas de fábrica).
  useEffect(() => {
    if (isOpen) {
      setTasks(TAREAS_VACIAS);
      setNotes('');
    }
  }, [isOpen, room?.id]);

  if (!isOpen || !room) return null;

  const toggleTask = (key) => setTasks(prev => ({ ...prev, [key]: !prev[key] }));
  const allDone = Object.values(tasks).every(Boolean);

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!allDone || busy) return;
    const res = await onComplete(room.id, notes.trim());
    // Si el servidor rechaza el cambio el modal sigue abierto y el panel muestra el motivo
    if (!res || res.ok !== false) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#2563eb" />
            <h3 style={{ margin: 0 }}>Protocolo de Limpieza - Hab. {room.numero}</h3>
          </div>
          <button type="button" className="btn-action-icon" onClick={onClose} disabled={busy}><X size={20} /></button>
        </div>

        <form onSubmit={handleFinish}>
          <div className="modal-body">
            <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: 0 }}>
              Tipo: <strong>{room.tipo}</strong> · Piso: <strong>{room.piso || 1}</strong>. Marca cada tarea realizada para garantizar el estándar de calidad Wimbledon.
              Al terminar se registra el tiempo de la limpieza.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {TAREAS.map(t => (
                <label key={t.key} className="cleaning-checklist-item">
                  <input type="checkbox" checked={tasks[t.key]} onChange={() => toggleTask(t.key)} />
                  <span>{t.texto}</span>
                </label>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Observaciones o artículos olvidados</label>
              <textarea
                className="form-control"
                rows={2}
                maxLength={500}
                placeholder="Ninguna incidencia encontrada..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>Cancelar</button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!allDone || busy}
              style={{ backgroundColor: allDone ? '#10b981' : '#94a3b8' }}
            >
              {busy ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />} Marcar como Lista
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
