import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Minus, 
  Maximize2,
  DoorOpen,
  MapPin,
  Check
} from 'lucide-react';
import { getMetodoPago } from '../../data/pagos';

export default function ReceiptModal({
  isOpen,
  onClose,
  reservation,
  onGoToRole,
  onOpenCheckInValidation
}) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen || !reservation) return null;

  const total = parseFloat(reservation.total || 0);
  const subtotal = total / 1.18;
  const igv = total - subtotal;
  const boletaNum = reservation.boletaNum || `B001-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const fechaEmision = new Date().toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const metodo = getMetodoPago(reservation.metodoPago);
  const pagoDigital = Boolean(metodo && metodo.digital);

  const handlePrint = () => {
    window.print();
  };

  // Si está minimizada, renderizar una barra flotante en la esquina inferior derecha
  if (isMinimized) {
    return (
      <div 
        className="no-print"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0c1e36',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '12px 18px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 2px #D4AF37',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 1400,
          fontFamily: "'Inter', sans-serif",
          cursor: 'pointer'
        }}
        onClick={() => setIsMinimized(false)}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: '#D4AF37',
          color: '#0c1e36',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '14px'
        }}>
          W
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            Boleta {boletaNum} · Hab. {reservation.habitacion}
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
            {reservation.huesped} · Total: S/ {total.toFixed(2)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginLeft: '6px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
            title="Restaurar boleta"
            style={{
              background: '#1e293b',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Maximize2 size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            title="Cerrar boleta"
            style={{
              background: '#ef4444',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1300 }}>
      <div
        className="modal-dialog print-area receipt-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '95%',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '12px',
          padding: '0',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Cabecera visual de éxito */}
        <div style={{
          backgroundColor: '#0c1e36',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #D4AF37'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#D4AF37',
              color: '#0c1e36',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '18px',
              fontFamily: "'Playfair Display', serif"
            }}>
              W
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', letterSpacing: '0.05em' }}>HOTEL WIMBLEDON</h3>
              <span style={{ fontSize: '11px', color: '#cbd5e1', letterSpacing: '0.08em' }}>
                COMPROBANTE DE RESERVA &amp; BOLETA ELECTRÓNICA
              </span>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimizar boleta"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Minus size={18} />
            </button>
            <button
              className="btn-action-icon"
              onClick={onClose}
              title="Cerrar"
              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Cuerpo de la Boleta */}
        <div style={{ padding: '20px 24px' }}>
          {/* Mensaje de Confirmación */}
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <CheckCircle2 color="#059669" size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#065f46', fontSize: '13.5px' }}>¡Reserva registrada y confirmada con éxito!</strong>
              <div style={{ color: '#047857', fontSize: '11.5px' }}>
                Tu estadía y adicionales ya se encuentran sincronizados en el sistema del hotel.
              </div>
            </div>
          </div>

          {/* Información de Emisor y Boleta (Responsive) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginBottom: '16px',
            borderBottom: '1px dashed #cbd5e1',
            paddingBottom: '14px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>HOTEL WIMBLEDON LIMA S.A.C.</div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>R.U.C. 20608934512</div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>Av. Costanera 1250, San Miguel, Lima</div>
              <div style={{ fontSize: '11.5px', color: '#64748b' }}>Central Telefónica: +51 987 654 321</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                border: '1px solid #0c1e36',
                borderRadius: '6px',
                padding: '6px 12px',
                display: 'inline-block',
                textAlign: 'center',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>BOLETA ELECTRÓNICA</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0c1e36' }}>{boletaNum}</div>
                <div style={{ fontSize: '10.5px', color: '#D4AF37', fontWeight: 700 }}>CÓDIGO: {reservation.codigo}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Emisión: {fechaEmision}</div>
            </div>
          </div>

          {/* Datos del Cliente (Responsive) */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DATOS DEL CLIENTE / HUÉSPED
            </span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '6px',
              marginTop: '6px',
              fontSize: '12.5px'
            }}>
              <div><strong>Huésped:</strong> {reservation.huesped}</div>
              <div><strong>Documento (DNI/CE):</strong> {reservation.documento || '74829103'}</div>
              <div><strong>Teléfono:</strong> {reservation.telefono || '+51 987 654 321'}</div>
              <div><strong>Email:</strong> {reservation.email || 'huesped@wimbledon.com'}</div>
            </div>
          </div>

          {/* Tabla Desglose de Servicios y Productos */}
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#0c1e36', color: '#ffffff' }}>
                  <th style={{ padding: '7px 10px', textAlign: 'left', borderRadius: '4px 0 0 0' }}>Descripción del Servicio</th>
                  <th style={{ padding: '7px 10px', textAlign: 'center' }}>Cant.</th>
                  <th style={{ padding: '7px 10px', textAlign: 'right', borderRadius: '0 4px 0 0' }}>Precio (S/)</th>
                </tr>
              </thead>
              <tbody>
                {/* Ítem 1: Habitación */}
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      Estancia Suite {reservation.habitacion} ({reservation.tipo})
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Check-in: {reservation.checkIn} · Check-out: {reservation.checkOut}
                      {reservation.bloque && <span> · Modalidad: {reservation.bloque}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>
                    S/ {(reservation.tarifaBase || (total - (reservation.detallesBoleta?.precioAdicionales || 0))).toFixed(2)}
                  </td>
                </tr>

                {/* Ítem 2: Paquete por Festividad si fue seleccionado */}
                {reservation.paqueteFestividad && (
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fffbeb' }}>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 600, color: '#92400e' }}>
                        ★ {reservation.paqueteFestividad.nombre}
                      </div>
                      <div style={{ fontSize: '11px', color: '#b45309' }}>
                        Paquete especial con ambientación romántica y amenidades exclusivas.
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>1</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#92400e' }}>
                      S/ {parseFloat(reservation.paqueteFestividad.precio || 0).toFixed(2)}
                    </td>
                  </tr>
                )}

                {/* Ítem 3: Adicionales y Promociones de la Carta */}
                {reservation.itemsCarta && reservation.itemsCarta.length > 0 && reservation.itemsCarta.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        🍽 {item.nombre}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Servicio gastronómico a la suite
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.cantidad || 1}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>
                      S/ {parseFloat(item.precio || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Forma de pago */}
          {metodo && (
            <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FORMA DE PAGO
              </span>
              <div style={{ marginTop: '4px' }}>
                <strong>{metodo.nombre}</strong>
                {pagoDigital && reservation.numeroOperacion && <span> · N° de operación: <strong>{reservation.numeroOperacion}</strong></span>}
              </div>
            </div>
          )}

          {/* Totales y QR (Totalmente Responsive) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            alignItems: 'center',
            borderTop: '1px solid #cbd5e1',
            paddingTop: '14px'
          }}>
            {/* Token QR y Acceso sin contacto */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#f1f5f9',
              padding: '10px 12px',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <QrCode size={42} color="#0c1e36" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0c1e36' }}>CHECK-IN DIGITAL AUTOMATIZADO</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Escanea al ingresar en portería o cochera.
                </div>
                {onOpenCheckInValidation && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenCheckInValidation(reservation); }}
                    className="no-print"
                    style={{
                      marginTop: '4px',
                      background: '#10b981',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <DoorOpen size={12} /> Validar Ingreso Ahora
                  </button>
                )}
              </div>
            </div>

            {/* Totales Monetarios */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '2px' }}>
                Op. Gravada: <span style={{ fontWeight: 600, color: '#0f172a' }}>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '4px' }}>
                I.G.V. (18%): <span style={{ fontWeight: 600, color: '#0f172a' }}>S/ {igv.toFixed(2)}</span>
              </div>
              <div style={{
                fontSize: '17px',
                fontWeight: 'bold',
                color: '#0c1e36',
                borderTop: '2px solid #D4AF37',
                paddingTop: '4px',
                marginTop: '2px'
              }}>
                TOTAL: <span style={{ color: '#059669' }}>S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con Acciones (Oculto en Impresión) */}
        <div className="no-print" style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={15} /> Imprimir Boleta
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Minimizar
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onGoToRole && (
              <>
                <button
                  onClick={() => onGoToRole('RECEPCION')}
                  style={{
                    backgroundColor: '#10b981',
                    border: 'none',
                    color: '#ffffff',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Ver en Recepción <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => onGoToRole('ADMIN')}
                  style={{
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Ver en Admin <ArrowRight size={15} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#64748b',
                border: 'none',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
