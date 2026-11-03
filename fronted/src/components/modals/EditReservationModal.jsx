import React, { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';

const BLOQUES = ['6 HORAS', '7 HORAS', 'PERNOCTE'];

// Edita una reserva. La regla (solo PENDIENTE/CONFIRMADA y antes de la hora de entrada) la aplica el servidor;
// aquí solo se refleja con reservation.puedeEditar / motivoNoEditable y se muestra el error si el servidor la rechaza.
export default function EditReservationModal({ isOpen, onClose, reservation, rooms = [], onSave }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!reservation) return;
    setError('');
    setForm({
      huesped: reservation.huesped || '',
      documento: reservation.documento || '',
      email: reservation.emailReal || '',
      telefono: reservation.telefonoReal || '',
      habitacionId: reservation.habitacionId || '',
      fechaCheckIn: reservation.fechaCheckInISO || '',
      horaEntrada: reservation.horaEntrada || '',
      fechaCheckOut: reservation.fechaCheckOutISO || '',
      horaSalida: reservation.horaSalida || '',
      bloque: reservation.bloque || '',
      notas: reservation.notas || ''
    });
  }, [reservation]);

  if (!isOpen || !reservation) return null;

  const bloqueado = !reservation.puedeEditar;
  const set = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    // Solo se envía lo que tiene valor: el servidor ignora los campos nulos
    const datos = {
      nombreHuesped: form.huesped,
      documentoHuesped: form.documento,
      emailHuesped: form.email || null,
      telefonoWhatsApp: form.telefono,
      fechaCheckIn: form.fechaCheckIn || null,
      horaEntradaProgramada: form.horaEntrada || null,
      fechaCheckOut: form.fechaCheckOut || null,
      horaSalidaProgramada: form.horaSalida || null,
      bloqueSeleccionado: form.bloque || null,
      notasAdicionales: form.notas
    };
    if (form.habitacionId) datos.habitacion = { id: Number(form.habitacionId) };
    const r = await onSave(reservation.id, datos);
    setGuardando(false);
    if (r && r.ok) onClose();
    else setError((r && r.error) || 'No se pudo guardar.');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h3>Editar reserva {reservation.codigo || reservation.idDisplay}</h3>
          <button className="btn-action-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            {bloqueado && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '13px' }}>
                <Lock size={16} /> {reservation.motivoNoEditable || 'Esta reserva ya no se puede editar.'}
              </div>
            )}

            <fieldset disabled={bloqueado || guardando} style={{ border: 0, padding: 0, margin: 0 }}>
              <div className="form-grid-2">
                <div>
                  <div className="form-group"><label>Huésped</label>
                    <input className="form-control" name="huesped" value={form.huesped || ''} onChange={set} required /></div>
                  <div className="form-group"><label>Documento (DNI / CE)</label>
                    <input className="form-control" name="documento" value={form.documento || ''} onChange={set} required /></div>
                  <div className="form-group"><label>Correo</label>
                    <input className="form-control" type="email" name="email" value={form.email || ''} onChange={set} /></div>
                  <div className="form-group"><label>Teléfono / WhatsApp</label>
                    <input className="form-control" name="telefono" value={form.telefono || ''} onChange={set} required /></div>
                </div>
                <div>
                  <div className="form-group"><label>Habitación</label>
                    <select className="form-control" name="habitacionId" value={form.habitacionId || ''} onChange={set}>
                      {rooms.map(r => <option key={r.id} value={r.id}>Hab. {r.numero} · {r.nombreTema || r.tipo}</option>)}
                    </select></div>
                  <div className="form-group"><label>Bloque</label>
                    <select className="form-control" name="bloque" value={form.bloque || ''} onChange={set}>
                      <option value="">—</option>
                      {BLOQUES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select></div>
                  <div className="form-group"><label>Check-in</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input className="form-control" type="date" name="fechaCheckIn" value={form.fechaCheckIn || ''} onChange={set} />
                      <input className="form-control" type="time" name="horaEntrada" value={form.horaEntrada || ''} onChange={set} />
                    </div></div>
                  <div className="form-group"><label>Check-out</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input className="form-control" type="date" name="fechaCheckOut" value={form.fechaCheckOut || ''} onChange={set} />
                      <input className="form-control" type="time" name="horaSalida" value={form.horaSalida || ''} onChange={set} />
                    </div></div>
                </div>
              </div>
              <div className="form-group"><label>Notas</label>
                <textarea className="form-control" name="notas" rows={2} value={form.notas || ''} onChange={set} /></div>
            </fieldset>

            {error && <p role="alert" style={{ color: '#b91c1c', fontSize: '13px', margin: '8px 0 0' }}>{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cerrar</button>
            <button type="submit" className="btn-primary" disabled={bloqueado || guardando}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
