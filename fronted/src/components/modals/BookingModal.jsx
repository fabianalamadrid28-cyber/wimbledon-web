import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, FileText, Sparkles, Check, Gift, Utensils } from 'lucide-react';

export const FESTIVIDAD_PACKAGES = [
  { id: 'sanvalentin', nombre: 'San Valentín Inolvidable', precio: 299.00, desc: 'Pétalos, espumante Chandon, fresas con chocolate y late check-out.' },
  { id: 'halloween', nombre: 'Noche de Halloween', precio: 220.00, desc: 'Suite temática, cócteles de autor y ambientación especial para dos.' },
  { id: 'navidad', nombre: 'Navidad Privada', precio: 280.00, desc: 'Cena navideña para dos servida en la suite con brindis de medianoche.' },
  { id: 'anonuevo', nombre: 'Año Nuevo Wimbledon', precio: 350.00, desc: 'Pernocte, espumante frío, uvas y desayuno de bienvenida al nuevo año.' },
  { id: 'aniversario', nombre: 'Paquete Aniversario', precio: 320.00, desc: 'Decoración con globos y velas LED, torta artesanal, vino y fotos de recuerdo.' },
  { id: 'semana', nombre: 'Promo Entre Semana', precio: 99.00, desc: 'De lunes a jueves, bloque de 6 horas con cóctel de cortesía.' }
];

export const CARTA_PROMOTIONS = [
  { id: 'piqueos_promo', nombre: 'Promo Pareja: Piqueo Mixto + 2 Cervezas Artesanales', precio: 48.00 },
  { id: 'cena_romantica', nombre: 'Cena Romántica: 2 Fondos Gourmet + 2 Copas de Vino', precio: 96.00 },
  { id: 'cocteles_2x1', nombre: 'Promo 2x1: Cócteles de Autor Wimbledon', precio: 42.00 },
  { id: 'chandon_fresas', nombre: 'Pack Brindis: Chandon Extra Brut + Copa de Fresas con Chocolate', precio: 125.00 },
  { id: 'desayuno_cama', nombre: 'Desayuno en la Cama para Dos (Americano o Criollo)', precio: 48.00 },
  { id: 'postres_duo', nombre: 'Dúo Tentación: 2 Postres de Autor + 2 Cafés Express', precio: 36.00 }
];

export default function BookingModal({
  isOpen,
  onClose,
  rooms = [],
  initialRoom = null,
  initialPackage = null,
  initialRate = null,
  initialDate = null,
  initialAddons = [],
  onConfirmBooking
}) {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBloque, setSelectedBloque] = useState('PERNOCTE');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [nombreHuesped, setNombreHuesped] = useState('');
  const [documentoHuesped, setDocumentoHuesped] = useState('');
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState('');
  const [emailHuesped, setEmailHuesped] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedCartaPromos, setSelectedCartaPromos] = useState([]);
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar estado inicial al abrir
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const formatDateInput = (d) => d.toISOString().split('T')[0];

      setCheckIn(initialDate || formatDateInput(today));
      setCheckOut(formatDateInput(tomorrow));

      if (initialRoom) {
        setSelectedRoomId(String(initialRoom.id || initialRoom.numero));
      } else if (rooms.length > 0) {
        setSelectedRoomId(String(rooms[0].id || rooms[0].numero));
      }

      if (initialPackage) {
        setSelectedPackageId(initialPackage.id || '');
      } else {
        setSelectedPackageId('');
      }

      if (initialRate) {
        if (initialRate.includes('6')) setSelectedBloque('6 HORAS');
        else if (initialRate.includes('12')) setSelectedBloque('12 HORAS');
        else setSelectedBloque('PERNOCTE');
      }

      if (initialAddons && initialAddons.length > 0) {
        setSelectedCartaPromos(initialAddons);
      } else {
        setSelectedCartaPromos([]);
      }
    }
  }, [isOpen, initialRoom, initialPackage, initialRate, initialDate, rooms]);

  if (!isOpen) return null;

  // Habitación activa
  const currentRoom = rooms.find(r => String(r.id) === String(selectedRoomId) || String(r.numero) === String(selectedRoomId)) || rooms[0] || {
    numero: '201',
    tipo: 'Suite',
    nombreTema: 'Suite con Jacuzzi',
    precioBloque: 250.00
  };

  // Cálculo de tarifa base según bloque
  let basePrice = currentRoom.precioBloque || 220.00;
  if (selectedBloque === '6 HORAS') {
    basePrice = Math.round(basePrice * 0.65);
  } else if (selectedBloque === '12 HORAS') {
    basePrice = Math.round(basePrice * 0.85);
  }

  // Costo paquete festividad
  const activePackage = FESTIVIDAD_PACKAGES.find(p => p.id === selectedPackageId);
  const packagePrice = activePackage ? activePackage.precio : 0;

  // Costo adicionales de carta
  const cartaTotal = selectedCartaPromos.reduce((sum, item) => sum + (item.precio || 0), 0);

  // Total acumulado
  const totalEstimado = basePrice + packagePrice + cartaTotal;

  const togglePromo = (promo) => {
    setSelectedCartaPromos(prev => {
      const exists = prev.some(p => p.id === promo.id);
      if (exists) {
        return prev.filter(p => p.id !== promo.id);
      } else {
        return [...prev, promo];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombreHuesped.trim()) {
      setErrorMsg('Por favor ingrese el nombre del huésped.');
      return;
    }
    if (!documentoHuesped.trim()) {
      setErrorMsg('Por favor ingrese el documento de identidad (DNI o CE).');
      return;
    }
    if (!telefonoWhatsApp.trim()) {
      setErrorMsg('Por favor ingrese un número de teléfono o WhatsApp.');
      return;
    }

    const payload = {
      huesped: nombreHuesped.trim(),
      documento: documentoHuesped.trim(),
      email: emailHuesped.trim() || 'cliente@wimbledon.com',
      telefono: telefonoWhatsApp.trim(),
      habitacion: currentRoom.numero,
      habitacionId: currentRoom.id,
      tipo: currentRoom.tipo || 'Suite',
      tarifaBase: basePrice,
      bloque: selectedBloque,
      checkIn: checkIn.split('-').reverse().join('/'),
      checkOut: checkOut.split('-').reverse().join('/'),
      paqueteFestividad: activePackage || null,
      itemsCarta: selectedCartaPromos,
      total: totalEstimado,
      notasAdicionales: notasAdicionales.trim()
    };

    onConfirmBooking(payload);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1250 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '820px', 
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid #1e293b', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#0b1324'
        }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4AF37', fontWeight: 600 }}>
              HOTEL WIMBLEDON · RESERVA EN LÍNEA
            </span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontFamily: "'Playfair Display', serif" }}>
              Confirmación y Datos de la Reserva
            </h2>
          </div>
          <button 
            className="btn-action-icon" 
            onClick={onClose}
            style={{ background: '#1e293b', border: 'none', color: '#ffffff', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario scrollable */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {errorMsg && (
            <div style={{ backgroundColor: '#ef444420', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '6px', marginBottom: '18px', fontSize: '13px' }}>
              {errorMsg}
            </div>
          )}

          {/* Sección 1: Huésped */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF37', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={15} /> 1. Datos del Huésped Principal
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Mendoza Ruiz"
                  value={nombreHuesped}
                  onChange={(e) => setNombreHuesped(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>DNI / CE / Pasaporte *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 71234567"
                  value={documentoHuesped}
                  onChange={(e) => setDocumentoHuesped(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: +51 987 654 321"
                  value={telefonoWhatsApp}
                  onChange={(e) => setTelefonoWhatsApp(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="Ej: cliente@gmail.com"
                  value={emailHuesped}
                  onChange={(e) => setEmailHuesped(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Suite y Estancia */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF37', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} /> 2. Elección de Suite y Modalidad de Tarifa
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Suite Seleccionada</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                >
                  {rooms.map(r => (
                    <option key={r.id || r.numero} value={r.id || r.numero}>
                      Hab. {r.numero} - {r.nombreTema || r.tipo} (S/ {r.precioBloque})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Modalidad de Estancia</label>
                <select
                  value={selectedBloque}
                  onChange={(e) => setSelectedBloque(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                >
                  <option value="6 HORAS">Bloque 6 Horas</option>
                  <option value="12 HORAS">Bloque 12 Horas</option>
                  <option value="PERNOCTE">Pernocte / 24 Horas</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Fecha de Entrada (Check-In)</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Fecha de Salida (Check-Out)</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Paquete Festividad (Opcional) */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF37', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gift size={15} /> 3. Paquetes por Festividades y Aniversarios (Opcional)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <div 
                onClick={() => setSelectedPackageId('')}
                style={{
                  background: selectedPackageId === '' ? 'rgba(212, 175, 55, 0.15)' : '#1e293b',
                  border: selectedPackageId === '' ? '1px solid #D4AF37' : '1px solid #334155',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Sin paquete adicional</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Solo tarifa de habitación y amenidades estándar.</div>
              </div>

              {FESTIVIDAD_PACKAGES.map(pkg => (
                <div 
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  style={{
                    background: selectedPackageId === pkg.id ? 'rgba(212, 175, 55, 0.15)' : '#1e293b',
                    border: selectedPackageId === pkg.id ? '1px solid #D4AF37' : '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#ffffff' }}>{pkg.nombre}</span>
                    <span style={{ fontWeight: 'bold', color: '#D4AF37', fontSize: '13px' }}>+S/ {pkg.precio}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{pkg.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección 4: Promociones de la Carta a la Suite */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF37', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Utensils size={15} /> 4. Carta del Menú y Promociones Especiales (Opcional)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {CARTA_PROMOTIONS.map(promo => {
                const isChecked = selectedCartaPromos.some(p => p.id === promo.id || p.nombre === promo.nombre);
                return (
                  <div
                    key={promo.id}
                    onClick={() => togglePromo(promo)}
                    style={{
                      background: isChecked ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                      border: isChecked ? '1px solid #10b981' : '1px solid #334155',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{promo.nombre}</div>
                      <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', marginTop: '2px' }}>+S/ {promo.precio.toFixed(2)}</div>
                    </div>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '4px', 
                      background: isChecked ? '#10b981' : '#334155', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {isChecked && <Check size={14} color="#ffffff" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notas Adicionales */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Peticiones Especiales (Opcional)</label>
            <textarea
              rows="2"
              placeholder="Ej: Llegada discreta con cochera privada, cubitera adicional con hielo para medianoche, etc."
              value={notasAdicionales}
              onChange={(e) => setNotasAdicionales(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '12px' }}
            />
          </div>

          {/* Resumen de Tarifas en Vivo */}
          <div style={{ 
            backgroundColor: '#0b1324', 
            border: '1px solid #D4AF37', 
            borderRadius: '10px', 
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                DESGLOSE DE LA RESERVA
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>
                Tarifa Habitación ({selectedBloque}): <strong>S/ {basePrice.toFixed(2)}</strong>
                {packagePrice > 0 && <span> · Festividad: <strong>S/ {packagePrice.toFixed(2)}</strong></span>}
                {cartaTotal > 0 && <span> · Menú / Consumos: <strong>S/ {cartaTotal.toFixed(2)}</strong></span>}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>TOTAL ESTIMADO (INC. IGV)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D4AF37' }}>
                S/ {totalEstimado.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={{ 
                background: '#D4AF37', 
                border: 'none', 
                color: '#0f172a', 
                padding: '10px 24px', 
                borderRadius: '6px', 
                fontWeight: 'bold', 
                fontSize: '14px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} /> Confirmar Reserva y Ver Boleta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

