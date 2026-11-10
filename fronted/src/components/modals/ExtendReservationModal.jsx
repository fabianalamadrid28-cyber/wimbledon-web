import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

// Extiende una reserva con el huésped dentro (CHECKIN). El cobro sugerido es proporcional a la tarifa
// de la habitación (precioBloque / 6 h por hora); recepción puede cambiarlo. El servidor valida que
// la habitación no tenga otra reserva a continuación.
export default function ExtendReservationModal({ isOpen, onClose, reservation, room, onExtend }) {
  const [horas, setHoras] = useState(1);
  const [monto, setMonto] = useState('');
  const [montoEditado, setMontoEditado] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const sugerido = room && room.precioBloque ? ((room.precioBloque * horas) / 6).toFixed(2) : '';

  useEffect(() => { if (isOpen) { setHoras(1); setMontoEditado(false); setError(''); } }, [isOpen, reservation]);
  useEffect(() => { if (!montoEditado) setMonto(sugerido); }, [sugerido, montoEditado]);

  if (!isOpen || !reservation) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    const r = await onExtend(reservation.id, Number(horas), montoEditado ? monto : null);
    setGuardando(false);
    if (r && r.ok) onClose();
    else setError((r && r.error) || 'No se pudo extender.');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} /><h3 style={{ margin: 0 }}>Extender · Hab. {reservation.habitacion}</h3>
          </div>
          <button className="btn-action-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
              {reservation.huesped} · salida actual {reservation.horaSalida || '—'}
            </p>
            <div className="form-group"><label>Horas adicionales</label>
              <input className="form-control" type="number" min={1} max={12} value={horas}
                     onChange={(e) => setHoras(e.target.value)} required /></div>
            <div className="form-group"><label>Cobro adicional (S/)</label>
              <input className="form-control" type="number" min={0} step="0.01" value={monto}
                     onChange={(e) => { setMonto(e.target.value); setMontoEditado(true); }} />
              <small style={{ color: '#64748b' }}>Sugerido: S/ {sugerido || '—'} (tarifa de la habitación por hora)</small></div>
            {error && <p role="alert" style={{ color: '#b91c1c', fontSize: '13px', margin: '8px 0 0' }}>{error}</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando}>{guardando ? 'Extendiendo…' : 'Extender'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
