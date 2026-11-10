import React, { useEffect, useState } from 'react';
import { Wrench, ShieldAlert, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const CATEGORIAS = [
  'Jacuzzi / sauna',
  'Grifería / agua caliente',
  'Aire acondicionado / ventilación',
  'Eléctrico / iluminación',
  'Cerradura / seguridad',
  'Mobiliario / cama',
  'Televisión / cable',
  'Limpieza de la habitación',
  'Otro inconveniente'
];

const ORIGENES = {
  CLIENTE: 'CLIENTE',
  LIMPIEZA: 'LIMPIEZA'
};

export default function SoporteForm({
  origen = ORIGENES.CLIENTE,
  rooms = [],
  initialRoom = '',
  compact = false,
  onCreated,
  onCancel
}) {
  const isCliente = origen === ORIGENES.CLIENTE;
  const roomOptions = rooms
    .map((room) => String(room.numero || room.name || '').trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

  const [habitacion, setHabitacion] = useState(initialRoom || roomOptions[0] || '');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [nombreContacto, setNombreContacto] = useState(isCliente ? '' : 'Personal de Limpieza');
  const [contacto, setContacto] = useState('');
  const [documento, setDocumento] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(null);

  useEffect(() => {
    if (initialRoom) setHabitacion(String(initialRoom));
  }, [initialRoom]);

  const isValid =
    habitacion &&
    categoria &&
    prioridad &&
    descripcion.trim().length >= 3 &&
    (!isCliente || (contacto.trim().length >= 5 && documento.trim().length >= 6));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!isValid) {
      setError(isCliente
        ? 'Completa habitación, documento de tu reserva, contacto y descripción.'
        : 'Completa habitación, categoría, prioridad y descripción.');
      return;
    }
    setSending(true);
    try {
      const payload = {
        origen,
        habitacion: habitacion.trim(),
        documento: isCliente ? documento.trim() : undefined,
        nombreContacto: nombreContacto.trim() || (isCliente ? 'Cliente' : 'Personal de Limpieza'),
        contacto: contacto.trim(),
        categoria,
        prioridad,
        descripcion: descripcion.trim()
      };
      const creado = await api.crearReporteSoporte(payload);
      setEnviado(creado);
      setDescripcion('');
      setContacto(isCliente ? '' : contacto);
      onCreated?.(creado);
    } catch (err) {
      setError(err.message || 'No se pudo enviar el reporte. Inténtalo nuevamente.');
    } finally {
      setSending(false);
    }
  }

  if (enviado) {
    return (
      <div className="soporte-sent" role="status">
        <CheckCircle size={32} className="soporte-sent-icon" />
        <h3>{isCliente ? '¡Recibido!' : 'Reporte enviado a Mantenimiento'}</h3>
        <p>
          Tu reporte <strong>#{enviado.id}</strong> para la habitación <strong>{enviado.habitacion}</strong> fue registrado.
          {isCliente
            ? ' El staff se comunicará contigo por WhatsApp o por el contacto indicado.'
            : ' Se marcará para atención en el tablero de limpieza.'}
        </p>
        <button className="btn-solid-gold" onClick={() => setEnviado(null)}>Reportar otro</button>
      </div>
    );
  }

  return (
    <form className={`soporte-form ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      <div className="soporte-form-header">
        <div className="soporte-form-icon"><Wrench size={20} /></div>
        <div>
          <h4>{isCliente ? 'Reporta un inconveniente' : 'Reportar desde limpieza'}</h4>
          <p>{isCliente
            ? 'Dinos qué ocurre en tu habitación. Verificamos tu reserva con el documento con el que reservaste.'
            : 'Registra la avería detectada en el aseo o en la inspección.'}</p>
        </div>
      </div>

      <div className="soporte-grid">
        <div className="form-group">
          <label htmlFor={`habitacion-${origen}`}>Habitación</label>
          <select
            id={`habitacion-${origen}`}
            className="form-control"
            required
            value={habitacion}
            onChange={(e) => setHabitacion(e.target.value)}
          >
            <option value="" disabled>Selecciona</option>
            {roomOptions.map((room) => <option key={room} value={room}>{room}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`categoria-${origen}`}>Problema</label>
          <select id={`categoria-${origen}`} className="form-control" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="soporte-grid">
        <div className="form-group">
          <label htmlFor={`prioridad-${origen}`}>Prioridad</label>
          <select id={`prioridad-${origen}`} className="form-control" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
            <option value="ALTA">Alta (urgente)</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={`nombre-${origen}`}>Nombre <span className="soporte-optional">(opcional)</span></label>
          <input
            id={`nombre-${origen}`}
            className="form-control"
            maxLength={255}
            placeholder={isCliente ? 'María López' : 'Personal de Limpieza'}
            value={nombreContacto}
            onChange={(e) => setNombreContacto(e.target.value)}
          />
        </div>
      </div>

      {isCliente && (
        <div className="form-group">
          <label htmlFor={`documento-${origen}`}>DNI / CE / Pasaporte de la reserva (obligatorio)</label>
          <input
            id={`documento-${origen}`}
            className="form-control"
            required
            minLength={6}
            maxLength={20}
            placeholder="El mismo documento con el que reservaste"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor={`contacto-${origen}`}>Contacto{isCliente ? ' (obligatorio)' : ''}</label>
        <input
          id={`contacto-${origen}`}
          className="form-control"
          required={isCliente}
          maxLength={255}
          placeholder="WhatsApp o correo para confirmar atención"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`descripcion-${origen}`}>Describe el inconveniente</label>
        <textarea
          id={`descripcion-${origen}`}
          className="form-control"
          rows={compact ? 3 : 4}
          required
          minLength={3}
          maxLength={2000}
          placeholder={isCliente ? 'Ej.: el jacuzzi no enciende / llave del lavatorio gotea / cerradura no responde' : 'Ej.: jacuzzi sin temperatura; cuarto con olor a humedad'}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      {error && (
        <div className="soporte-error" role="alert">
          <ShieldAlert size={16} /> {error}
        </div>
      )}

      <div className="soporte-actions">
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>}
        <button type="submit" className="btn-solid-gold" disabled={sending}>
          {sending ? <><Loader2 size={16} className="spin" /> Enviando...</> : 'Enviar reporte'}
        </button>
      </div>
    </form>
  );
}
