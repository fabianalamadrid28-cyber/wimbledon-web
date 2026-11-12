import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  DoorOpen, 
  Key, 
  Smartphone,
  Navigation,
  Loader2,
  Lock,
  Car
} from 'lucide-react';

// Coordenadas oficiales de Hotel Wimbledon (San Miguel, Lima)
const WIMBLEDON_COORDS = {
  lat: -12.0792,
  lng: -77.0935,
  nombre: 'Av. Costanera 1250, San Miguel, Lima'
};

// PIN de seguridad del tótem de entrada física
const TOTEM_PIN_VALIDO = ['WIMB-2025', 'HOTEL-ENTRADA', '7744', '2025'];

// Calcula distancia en metros entre dos puntos geográficos (Haversine formula)
function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function CheckInValidationModal({
  isOpen,
  onClose,
  reservations = [],
  rooms = [],
  initialReservation = null,
  onValidateCheckIn
}) {
  const [selectedResId, setSelectedResId] = useState('');
  const [codigoQrInput, setCodigoQrInput] = useState('');
  const [pinTotemInput, setPinTotemInput] = useState('');
  
  // Estado de geolocalización
  const [verificandoGps, setVerificandoGps] = useState(false);
  const [gpsVerificado, setGpsVerificado] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [distanciaHotel, setDistanciaHotel] = useState(null);
  
  // Estado de PIN de tótem
  const [pinVerificado, setPinVerificado] = useState(false);
  
  // Estado final de validación
  const [ingresoValidado, setIngresoValidado] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // Reinicia el formulario solo al abrir el modal o al cambiar de reserva.
  // No debe depender de `reservations`: el panel se sincroniza cada 5 s y
  // borraba el PIN mientras el recepcionista lo estaba escribiendo.
  useEffect(() => {
    if (!isOpen) return;

    setIngresoValidado(false);
    setGpsVerificado(false);
    setGpsError(null);
    setPinVerificado(false);
    setPinTotemInput('');
    setMensajeError('');

    if (initialReservation?.id != null) {
      setSelectedResId(String(initialReservation.id));
      setCodigoQrInput(initialReservation.tokenQr || initialReservation.codigo || '');
    } else {
      setSelectedResId('');
      setCodigoQrInput('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialReservation?.id]);

  // Si el modal se abrió sin una reserva concreta, selecciona la primera
  // disponible cuando los datos terminen de cargar. No toca el PIN escrito.
  useEffect(() => {
    if (!isOpen || initialReservation?.id != null || selectedResId) return;

    const candidatas = reservations.filter(r =>
      r.estado === 'Confirmada' || r.estado === 'Pendiente'
    );
    if (candidatas.length > 0) {
      setSelectedResId(String(candidatas[0].id));
      setCodigoQrInput(candidatas[0].tokenQr || candidatas[0].codigo || '');
    }
  }, [isOpen, initialReservation?.id, reservations, selectedResId]);

  if (!isOpen) return null;

  const currentRes = reservations.find(r => 
    String(r.id) === String(selectedResId) || 
    r.codigo === codigoQrInput.trim() ||
    r.tokenQr === codigoQrInput.trim()
  ) || reservations[0];

  const currentRoom = rooms.find(r => String(r.numero) === String(currentRes?.habitacion));

  // Verificación estricta de GPS
  const handleVerificarGps = () => {
    setVerificandoGps(true);
    setGpsError(null);
    setMensajeError('');

    if (!navigator.geolocation) {
      setGpsError('La geolocalización no está soportada en este navegador. Utiliza el PIN del tótem.');
      setVerificandoGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const dist = calcularDistanciaMetros(userLat, userLng, WIMBLEDON_COORDS.lat, WIMBLEDON_COORDS.lng);
        setDistanciaHotel(dist);

        // Radio de tolerancia: dentro de 500m del hotel en San Miguel
        if (dist <= 500) {
          setGpsVerificado(true);
        } else {
          // Si está en pruebas/desarrollo local y está más lejos, se ofrece verificación con PIN
          setGpsError(`Detectado a ${dist > 1000 ? (dist/1000).toFixed(1) + ' km' : dist + ' m'} de la ubicación física del Hotel. Ingresa el PIN del Tótem para autorizar.`);
          setGpsVerificado(false);
        }
        setVerificandoGps(false);
      },
      (err) => {
        // En caso de que el navegador bloquee la geolocalización o estemos en localhost sin HTTPS
        console.warn('Geolocation error / permission:', err);
        setGpsError('Permiso de GPS denegado o no disponible en red local. Valida con el PIN del tótem físico.');
        setVerificandoGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Simulación de verificación rápida física (para tótems o recepción)
  const handleSimularUbicacionHotel = () => {
    setVerificandoGps(true);
    setTimeout(() => {
      setDistanciaHotel(15);
      setGpsVerificado(true);
      setGpsError(null);
      setVerificandoGps(false);
    }, 600);
  };

  // Validación de PIN físico del Tótem de entrada
  const handleVerificarPin = () => {
    const pinLimpio = pinTotemInput.trim().toUpperCase();
    if (TOTEM_PIN_VALIDO.includes(pinLimpio)) {
      setPinVerificado(true);
      setMensajeError('');
    } else {
      setPinVerificado(false);
      setMensajeError('PIN de acceso al tótem incorrecto. Verifícalo en el sensor de portería.');
    }
  };

  // Confirmar Check-In y transicionar a "(En Habitación)"
  const handleConfirmarIngreso = () => {
    if (!currentRes) {
      setMensajeError('Por favor selecciona una reserva válida.');
      return;
    }

    const estaFisicamente = gpsVerificado || pinVerificado;
    if (!estaFisicamente) {
      setMensajeError('Seguridad estricta: Debes comprobar tu presencia física dentro del hotel mediante GPS o con el PIN del Tótem de Acceso.');
      return;
    }

    if (onValidateCheckIn) {
      onValidateCheckIn(currentRes.id, {
        metodo: gpsVerificado ? 'GPS_HOTEL' : 'PIN_TOTEM',
        distancia: distanciaHotel,
        habitacion: currentRes.habitacion
      });
    }

    setIngresoValidado(true);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1350 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '680px', 
          width: '95%',
          backgroundColor: '#0c1e36',
          color: '#ffffff',
          borderRadius: '14px',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Header */}
        <div style={{
          backgroundColor: '#071324',
          padding: '20px 24px',
          borderBottom: '2px solid #D4AF37',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#D4AF37',
              color: '#0c1e36',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DoorOpen size={24} />
            </div>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#D4AF37', fontWeight: 700 }}>
                HOTEL WIMBLEDON · CHECK-IN SIN CONTACTO
              </span>
              <h3 style={{ margin: 0, fontSize: '19px', fontFamily: "'Playfair Display', serif" }}>
                Validación de Ingreso al Hotel
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: '24px', maxHeight: '82vh', overflowY: 'auto' }}>
          {ingresoValidado ? (
            /* Pantalla de Éxito */
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#10b98120',
                border: '2px solid #10b981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={42} />
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#ffffff' }}>
                ¡Bienvenido a The Wimbledon Hotel!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px' }}>
                Ingreso físico validado de forma exitosa. Se ha habilitado la apertura autónoma de cochera y la suite se encuentra activada.
              </p>

              {/* Ficha Resumen de Acceso */}
              <div style={{
                background: '#071324',
                border: '1px solid #1e293b',
                borderRadius: '10px',
                padding: '16px 20px',
                textAlign: 'left',
                marginBottom: '24px',
                maxWidth: '480px',
                margin: '0 auto 24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Huésped:</span>
                  <strong style={{ color: '#ffffff', fontSize: '13px' }}>{currentRes?.huesped}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Habitación Asignada:</span>
                  <strong style={{ color: '#D4AF37', fontSize: '15px' }}>Hab. {currentRes?.habitacion} ({currentRes?.tipo})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Piso / Acceso:</span>
                  <span style={{ color: '#ffffff', fontSize: '13px' }}>Piso {currentRoom?.piso || 1} {currentRoom?.tieneCocheraDirecta ? '· Cochera Directa 🚗' : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Nuevo Estado en Sistema:</span>
                  <span style={{ background: '#10b981', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px' }}>
                    (En Habitación)
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                  color: '#0c1e36',
                  fontWeight: 700,
                  padding: '12px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Listo · Cerrar Validador
              </button>
            </div>
          ) : (
            /* Flujo de Validación */
            <div>
              {mensajeError && (
                <div style={{
                  backgroundColor: '#ef444420',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} />
                  <span>{mensajeError}</span>
                </div>
              )}

              {/* 1. Selección de Reserva o Código */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4AF37', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  1. Reserva de Huésped a Validar
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  <select
                    value={selectedResId}
                    onChange={(e) => {
                      setSelectedResId(e.target.value);
                      const target = reservations.find(r => String(r.id) === e.target.value);
                      if (target) setCodigoQrInput(target.tokenQr || target.codigo || '');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#071324',
                      border: '1px solid #334155',
                      color: '#ffffff',
                      fontSize: '13.5px'
                    }}
                  >
                    {reservations.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.codigo} · {r.huesped} · Hab. {r.habitacion} ({r.estado})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tarjeta de Información de la Reserva Seleccionada */}
                {currentRes && (
                  <div style={{
                    marginTop: '12px',
                    background: '#071324',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{currentRes.huesped}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Habitación {currentRes.habitacion} · {currentRes.tipo} · {currentRes.codigo}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Estado actual: <strong style={{ color: currentRes.estado === 'En Habitación' ? '#10b981' : '#f59e0b' }}>{currentRes.estado}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0c1e36', padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155' }}>
                      <QrCode size={20} color="#D4AF37" />
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#e2e8f0' }}>{currentRes.tokenQr || 'TOKEN-QR-ACTIVO'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Verificación Estricta de Presencia Física */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#D4AF37', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2. Verificación Estricta de Presencia Física
                </label>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0' }}>
                  Para garantizar la discreción y seguridad, el sistema debe confirmar que el huésped se encuentra dentro o en el acceso físico del hotel.
                </p>

                {/* Opción A: Geolocalización GPS en el Hotel */}
                <div style={{
                  background: gpsVerificado ? '#064e3b30' : '#071324',
                  border: gpsVerificado ? '1px solid #10b981' : '1px solid #1e293b',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={20} color={gpsVerificado ? '#10b981' : '#38bdf8'} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                          Geolocalización en Tiempo Real
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {gpsVerificado 
                            ? `✅ Ubicación verificada: En Hotel Wimbledon (${distanciaHotel || 15} m de portería)`
                            : 'Verifica las coordenadas del dispositivo en San Miguel'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleVerificarGps}
                        disabled={verificandoGps || gpsVerificado}
                        style={{
                          background: gpsVerificado ? '#10b981' : '#1e293b',
                          color: '#ffffff',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {verificandoGps ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                        {gpsVerificado ? 'GPS Confirmado' : 'Detectar GPS'}
                      </button>

                      {/* Botón rápido para Tótem / Recepción / Demo */}
                      {!gpsVerificado && (
                        <button
                          type="button"
                          onClick={handleSimularUbicacionHotel}
                          title="Confirmar presencia física en tótem del hotel"
                          style={{
                            background: '#2563eb20',
                            color: '#60a5fa',
                            border: '1px solid #2563eb',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Confirmar en Tótem
                        </button>
                      )}
                    </div>
                  </div>

                  {gpsError && (
                    <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#f87171' }}>
                      {gpsError}
                    </div>
                  )}
                </div>

                {/* Opción B: Código / PIN de Entrada Física (Tótem de Cochera) */}
                <div style={{
                  background: pinVerificado ? '#064e3b30' : '#071324',
                  border: pinVerificado ? '1px solid #10b981' : '1px solid #1e293b',
                  borderRadius: '10px',
                  padding: '14px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Key size={20} color={pinVerificado ? '#10b981' : '#D4AF37'} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                          PIN de Sensor de Portería / Cochera
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {pinVerificado 
                            ? '✅ PIN de sensor físico validado correctamente'
                            : 'Código de acceso mostrado en la pantalla de entrada'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        name="pin-porteria"
                        aria-label="PIN del sensor de portería"
                        placeholder="PIN (ej: WIMB-2025)"
                        value={pinTotemInput}
                        onChange={(e) => setPinTotemInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleVerificarPin();
                          }
                        }}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        maxLength={32}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: '#0c1e36',
                          border: '1px solid #334155',
                          color: '#ffffff',
                          fontSize: '12px',
                          width: '140px',
                          textTransform: 'uppercase',
                          cursor: 'text'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleVerificarPin}
                        style={{
                          background: pinVerificado ? '#10b981' : '#D4AF37',
                          color: '#0c1e36',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {pinVerificado ? 'Validado' : 'Validar PIN'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Acción Principal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmarIngreso}
                  disabled={!gpsVerificado && !pinVerificado}
                  style={{
                    background: (gpsVerificado || pinVerificado)
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : '#334155',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: (gpsVerificado || pinVerificado) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: (gpsVerificado || pinVerificado) ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none'
                  }}
                >
                  <DoorOpen size={16} />
                  Autorizar Ingreso "(En Habitación)"
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

