import React, { useState } from 'react';
import { Smartphone, Landmark, Wallet, Copy, Check, Info } from 'lucide-react';
import { METODOS_PAGO, getMetodoPago, PAGO_YAPE, PAGO_PLIN, PAGO_TRANSFERENCIA } from '../../data/pagos';

const iconoDe = (id) => {
  if (id === PAGO_YAPE || id === PAGO_PLIN) return Smartphone;
  if (id === PAGO_TRANSFERENCIA) return Landmark;
  return Wallet;
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#ffffff',
  fontSize: '13px'
};

// Botón pequeño "copiar" para número de celular / cuentas
function CopiarBtn({ texto }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // sin permiso de portapapeles: el usuario puede copiar el texto a mano
    }
  };
  return (
    <button
      type="button"
      onClick={copiar}
      title="Copiar"
      style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
    >
      {copiado ? <Check size={12} /> : <Copy size={12} />} {copiado ? 'Copiado' : 'Copiar'}
    </button>
  );
}

// Imagen del QR con respaldo: si aún no está el archivo, se muestra el número para pagar igual
function QrPago({ metodo }) {
  const [fallo, setFallo] = useState(false);
  if (fallo) {
    return (
      <div style={{ width: '150px', height: '150px', borderRadius: '8px', border: '1px dashed #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '11px', color: '#94a3b8', padding: '8px' }}>
        QR no disponible. Paga al número indicado.
      </div>
    );
  }
  return (
    <img
      src={metodo.qr}
      alt={`Código QR de ${metodo.nombre}`}
      onError={() => setFallo(true)}
      style={{ width: '150px', height: '150px', objectFit: 'contain', background: '#ffffff', borderRadius: '8px', padding: '6px' }}
    />
  );
}

/**
 * Sección "Forma de pago" del formulario de reserva.
 * Props: metodoPago / numeroOperacion (valores actuales), onChangeMetodo, onChangeOperacion, total (número).
 */
export default function PaymentMethodSelector({ metodoPago, numeroOperacion, onChangeMetodo, onChangeOperacion, total }) {
  const activo = getMetodoPago(metodoPago);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        {METODOS_PAGO.map(m => {
          const Icono = iconoDe(m.id);
          const seleccionado = metodoPago === m.id;
          return (
            <div
              key={m.id}
              role="radio"
              aria-checked={seleccionado}
              tabIndex={0}
              onClick={() => onChangeMetodo(m.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChangeMetodo(m.id); } }}
              style={{
                background: seleccionado ? 'rgba(212, 175, 55, 0.15)' : '#1e293b',
                border: seleccionado ? `1px solid ${m.color}` : '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '13px' }}>
                <span style={{ background: m.color, borderRadius: '6px', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icono size={15} color="#ffffff" />
                </span>
                {m.nombre}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>{m.descripcion}</div>
            </div>
          );
        })}
      </div>

      {/* Detalle según el método elegido */}
      {activo && activo.digital && (
        <div style={{ marginTop: '14px', background: '#0b1324', border: `1px solid ${activo.color}`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '12px' }}>
            Monto a pagar: <strong style={{ color: '#D4AF37', fontSize: '15px' }}>S/ {Number(total || 0).toFixed(2)}</strong>
          </div>

          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {(activo.id === PAGO_YAPE || activo.id === PAGO_PLIN) && <QrPago metodo={activo} />}

            <div style={{ flex: 1, minWidth: '220px', fontSize: '13px', color: '#cbd5e1' }}>
              {activo.id !== PAGO_TRANSFERENCIA && (
                <>
                  <div>Titular: <strong>{activo.titular}</strong></div>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    Número {activo.nombre}: <strong style={{ fontSize: '16px', letterSpacing: '0.05em' }}>{activo.numero}</strong>
                    <CopiarBtn texto={activo.numero.replace(/\s/g, '')} />
                  </div>
                </>
              )}

              {activo.id === PAGO_TRANSFERENCIA && (
                <>
                  <div>Titular: <strong>{activo.titular}</strong></div>
                  {activo.cuentas.map(c => (
                    <div key={c.banco} style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                      <strong>{c.banco}</strong>
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        Cuenta: {c.cuenta} <CopiarBtn texto={c.cuenta} />
                      </div>
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        CCI: {c.cci} <CopiarBtn texto={c.cci} />
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div style={{ marginTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                  N° de operación * (aparece en tu constancia de pago)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={12}
                  placeholder="Ej: 12345678"
                  value={numeroOperacion}
                  onChange={(e) => onChangeOperacion(e.target.value.replace(/\D/g, ''))}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>Recepción verificará tu pago y confirmará la reserva. Hasta entonces figura como Pendiente.</span>
          </div>
        </div>
      )}

      {activo && !activo.digital && (
        <div style={{ marginTop: '14px', display: 'flex', gap: '6px', fontSize: '12px', color: '#94a3b8', background: '#0b1324', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px' }}>
          <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>Pagarás S/ {Number(total || 0).toFixed(2)} al llegar. Tu reserva queda Pendiente y se libera si no se confirma en 15 minutos.</span>
        </div>
      )}
    </div>
  );
}
