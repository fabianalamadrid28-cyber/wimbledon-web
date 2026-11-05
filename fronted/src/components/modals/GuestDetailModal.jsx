import React from 'react';
import { X, Printer, User, Phone, Mail, Calendar, CreditCard, DoorClosed, IdCard, Clock, StickyNote, QrCode } from 'lucide-react';

const vacio = (v) => v === undefined || v === null || String(v).trim() === '';

// Muestra fechas ISO (2026-11-05) como 05/11/2026; si ya vienen formateadas las deja igual
const fmtFecha = (v) => {
  if (vacio(v)) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v);
};

const ESTADO_COLOR = {
  Confirmada: ['#dcfce7', '#15803d'],
  Pendiente: ['#fef3c7', '#b45309'],
  'Check-in': ['#dbeafe', '#1d4ed8'],
  Finalizada: ['#e2e8f0', '#475569'],
  Cancelada: ['#fee2e2', '#b91c1c']
};

function Campo({ icono: Icono, etiqueta, valor, destacado, color }) {
  return (
    <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icono size={14} /> {etiqueta}
      </span>
      <p style={{ margin: '4px 0 0 0', fontSize: destacado ? '16px' : '15px', fontWeight: destacado ? 700 : 600, color: valor ? (color || '#0f172a') : '#94a3b8' }}>
        {valor || 'No registrado'}
      </p>
    </div>
  );
}

export default function GuestDetailModal({ isOpen, onClose, reservation }) {
  if (!isOpen || !reservation) return null;

  const r = reservation;
  const email = r.emailReal || null;
  const telefono = r.telefonoReal || null;
  const horario = [r.horaEntrada, r.horaSalida].filter(Boolean).join(' - ');
  const total = Number.isFinite(parseFloat(r.total)) ? `S/ ${parseFloat(r.total).toFixed(2)}` : null;
  const [estadoBg, estadoFg] = ESTADO_COLOR[r.estado] || ['#e2e8f0', '#475569'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog print-area" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} color="#2563eb" />
            <h3 style={{ margin: 0 }}>Ficha del Huésped - {r.codigo || r.idDisplay}</h3>
          </div>
          <button className="btn-action-icon no-print" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', flexShrink: 0 }}>
              {r.huesped ? r.huesped.charAt(0).toUpperCase() : 'H'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{r.huesped}</h3>
                <span style={{ background: estadoBg, color: estadoFg, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>{r.estado}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {email || 'Sin correo'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {telefono || 'Sin teléfono'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '20px' }}>
            <Campo icono={IdCard} etiqueta="Documento (DNI/CE)" valor={r.documento} />
            <Campo icono={DoorClosed} etiqueta="Habitación asignada" valor={r.habitacion ? `Hab. ${r.habitacion}${r.tipo ? ` (${r.tipo})` : ''}` : null} destacado />
            <Campo icono={Calendar} etiqueta="Check-in" valor={fmtFecha(r.fechaCheckInISO) || fmtFecha(r.checkInDisplay)} />
            <Campo icono={Calendar} etiqueta="Check-out" valor={fmtFecha(r.fechaCheckOutISO) || fmtFecha(r.checkOutDisplay)} />
            <Campo icono={Clock} etiqueta="Bloque / horario" valor={[r.bloque, horario].filter(Boolean).join(' · ') || null} />
            <Campo icono={CreditCard} etiqueta="Método de pago" valor={r.metodoPago} />
            <Campo icono={CreditCard} etiqueta="N° de operación (verificar en la app)" valor={r.numeroOperacion} />
            <Campo icono={CreditCard} etiqueta="Total a pagar" valor={total} destacado color="#16a34a" />
            <Campo icono={Calendar} etiqueta="Reserva creada" valor={fmtFecha(r.creadaEn)} />
          </div>

          <div style={{ marginTop: '14px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <StickyNote size={14} /> Notas adicionales
            </span>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: r.notas ? '#0f172a' : '#94a3b8', whiteSpace: 'pre-wrap' }}>
              {r.notas || 'Sin notas'}
            </p>
          </div>

          {r.tokenQr && (
            <div style={{ marginTop: '14px', padding: '14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <QrCode size={14} /> CÓDIGO QR Y LLAVE DIGITAL
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontFamily: 'monospace', color: '#1e3a8a', wordBreak: 'break-all' }}>
                {r.tokenQr}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer no-print">
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir ficha
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
