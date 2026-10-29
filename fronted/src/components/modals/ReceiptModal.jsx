import React from 'react';
import { X, Printer, ArrowRight, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export default function ReceiptModal({
  isOpen,
  onClose,
  reservation,
  onGoToRole
}) {
  if (!isOpen || !reservation) return null;

  const total = parseFloat(reservation.total || 0);
  const subtotal = total / 1.18;
  const igv = total - subtotal;
  const boletaNum = reservation.boletaNum || `B001-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const fechaEmision = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1300 }}>
      <div
        className="modal-dialog print-area"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '95%',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '12px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Cabecera visual de éxito */}
        <div style={{
          backgroundColor: '#0c1e36',
          color: '#ffffff',
          padding: '20px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #D4AF37'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#D4AF37',
              color: '#0c1e36',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '20px',
              fontFamily: "'Playfair Display', serif"
            }}>
              W
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', letterSpacing: '0.05em' }}>HOTEL WIMBLEDON</h3>
              <span style={{ fontSize: '11px', color: '#cbd5e1', letterSpacing: '0.1em' }}>COMPROBANTE DE RESERVA &amp; BOLETA ELECTRÓNICA</span>
            </div>
          </div>
          <button
            className="btn-action-icon no-print"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Cuerpo de la Boleta */}
        <div style={{ padding: '24px 28px' }}>
          {/* Mensaje de Confirmación */}
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <CheckCircle2 color="#059669" size={20} />
            <div>
              <strong style={{ color: '#065f46', fontSize: '14px' }}>¡Reserva registrada y confirmada con éxito!</strong>
              <div style={{ color: '#047857', fontSize: '12px' }}>Tu estadía y adicionales ya se encuentran sincronizados en el sistema del hotel.</div>
            </div>
          </div>

          {/* Información de Emisor y Boleta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>HOTEL WIMBLEDON LIMA S.A.C.</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>R.U.C. 20608934512</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Av. Costanera 1250, San Miguel, Lima</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Teléfono: +51 987 654 321</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                border: '1px solid #0c1e36',
                borderRadius: '6px',
                padding: '8px 12px',
                display: 'inline-block',
                textAlign: 'center',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>BOLETA DE VENTA ELECTRÓNICA</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0c1e36' }}>{boletaNum}</div>
                <div style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 600 }}>CÓDIGO: {reservation.codigo}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Emisión: {fechaEmision}</div>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DATOS DEL CLIENTE / HUÉSPED
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px', fontSize: '13px' }}>
              <div><strong>Huésped:</strong> {reservation.huesped}</div>
              <div><strong>Documento (DNI/CE):</strong> {reservation.documento || '74829103'}</div>
              <div><strong>Teléfono:</strong> {reservation.telefono || '+51 987 654 321'}</div>
              <div><strong>Email:</strong> {reservation.email || 'huesped@wimbledon.com'}</div>
            </div>
          </div>

          {/* Tabla Desglose de Servicios y Productos */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0c1e36', color: '#ffffff' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '4px 0 0 0' }}>Descripción del Servicio / Consumo</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Cant.</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', borderRadius: '0 4px 0 0' }}>Precio (S/)</th>
              </tr>
            </thead>
            <tbody>
              {/* Ítem 1: Habitación */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    Estancia Suite {reservation.habitacion} ({reservation.tipo})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Check-in: {reservation.checkIn} · Check-out: {reservation.checkOut}
                  </div>
                  {reservation.bloque && (
                    <div style={{ fontSize: '11px', color: '#0284c7' }}>
                      Modalidad: {reservation.bloque}
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>1</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                  S/ {(reservation.tarifaBase || (total - (reservation.detallesBoleta?.precioAdicionales || 0))).toFixed(2)}
                </td>
              </tr>

              {/* Ítem 2: Paquete por Festividad si fue seleccionado */}
              {reservation.paqueteFestividad && (
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fffbeb' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#92400e' }}>
                      ★ {reservation.paqueteFestividad.nombre}
                    </div>
                    <div style={{ fontSize: '11px', color: '#b45309' }}>
                      Paquete especial con ambientación romántica y amenidades exclusivas.
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#92400e' }}>
                    S/ {parseFloat(reservation.paqueteFestividad.precio || 0).toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Ítem 3: Adicionales y Promociones de la Carta */}
              {reservation.itemsCarta && reservation.itemsCarta.length > 0 && reservation.itemsCarta.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      🍽 {item.nombre}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Servicio gastronómico a la suite
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.cantidad || 1}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                    S/ {parseFloat(item.precio || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales y QR */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
            {/* Token QR y Acceso */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <QrCode size={48} color="#0c1e36" />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0c1e36' }}>CHECK-IN DIGITAL AUTOMATIZADO</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Presenta este QR al ingresar para apertura autónoma de cochera y suite.
                </div>
              </div>
            </div>

            {/* Totales Monetarios */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                Op. Gravada: <span style={{ fontWeight: 600, color: '#0f172a' }}>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                I.G.V. (18%): <span style={{ fontWeight: 600, color: '#0f172a' }}>S/ {igv.toFixed(2)}</span>
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#0c1e36',
                borderTop: '2px solid #D4AF37',
                paddingTop: '6px',
                marginTop: '4px'
              }}>
                TOTAL: <span style={{ color: '#059669' }}>S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con Acciones */}
        <div className="no-print" style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <button
            onClick={handlePrint}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={16} /> Imprimir Boleta
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onGoToRole('RECEPCION')}
              style={{
                backgroundColor: '#10b981',
                border: 'none',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Comprobar en Recepción <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onGoToRole('ADMIN')}
              style={{
                backgroundColor: '#2563eb',
                border: 'none',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Ver en Administrador <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

