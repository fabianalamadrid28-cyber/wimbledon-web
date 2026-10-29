import React from 'react';
import { X, Printer, User, Phone, Mail, Calendar, CreditCard, DoorClosed } from 'lucide-react';

export default function GuestDetailModal({ isOpen, onClose, reservation }) {
  if (!isOpen || !reservation) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} color="#2563eb" />
            <h3 style={{ margin: 0 }}>Ficha del Huésped - {reservation.codigo || reservation.idDisplay}</h3>
          </div>
          <button className="btn-action-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>
              {reservation.huesped ? reservation.huesped.charAt(0) : 'H'}
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a' }}>{reservation.huesped}</h3>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {reservation.email || 'huesped@wimbledon.com'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {reservation.telefono || '+51 987 654 321'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DoorClosed size={14} /> Habitación Asignada
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Hab. {reservation.habitacion} ({reservation.tipo})
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={14} /> Total a Pagar
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>
                S/ {parseFloat(reservation.total || 480).toFixed(2)}
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Check-in
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                {reservation.checkInDisplay || reservation.checkIn || '07/07/2025'}
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Check-out
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                {reservation.checkOutDisplay || reservation.checkOut || '10/07/2025'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '600' }}>CÓDIGO QR Y LLAVE DIGITAL V4</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontFamily: 'monospace', color: '#1e3a8a' }}>
              TOKEN-WBL-{reservation.id || 1025}-77B901C4892A
            </p>
          </div>
        </div>

        <div className="modal-footer">
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

