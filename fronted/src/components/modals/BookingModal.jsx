import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, FileText, Sparkles, Check, Gift, Utensils, CreditCard, AlertTriangle, Layers, DoorClosed } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import { getMetodoPago, REGEX_NUMERO_OPERACION } from '../../data/pagos';
import { PISOS_INFO, getTematicasPorPiso, asignarHabitacionAutomatica } from '../../services/api';

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
  const [selectedPiso, setSelectedPiso] = useState(1);
  const [selectedTema, setSelectedTema] = useState('');
  const [selectedBloque, setSelectedBloque] = useState('PERNOCTE');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [nombreHuesped, setNombreHuesped] = useState('');
  const [documentoHuesped, setDocumentoHuesped] = useState('');
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedCartaPromos, setSelectedCartaPromos] = useState([]);
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Al abrir el modal, el pago empieza vacío
  useEffect(() => {
    if (isOpen) {
      setMetodoPago('');
      setNumeroOperacion('');
      setErrorMsg('');
    }
  }, [isOpen]);

  // Sincronizar estado inicial SOLO al abrir. No debe depender de `rooms`: esa lista se refresca
  // cada 10 s desde el backend y volver a ejecutar esto borraba el paquete y las promociones elegidas.
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const formatDateInput = (d) => d.toISOString().split('T')[0];

      setCheckIn(initialDate || formatDateInput(today));
      setCheckOut(formatDateInput(tomorrow));

      const initialPiso = initialRoom ? (initialRoom.piso || 1) : 1;
      setSelectedPiso(initialPiso);

      const tematicas = getTematicasPorPiso(initialPiso, rooms);
      let temaInit = '';
      if (initialRoom) {
        const buscado = String(initialRoom.nombreTema || initialRoom.nombre || initialRoom.tipo || '').trim();
        const match = tematicas.find(t => 
          t.nombreTema.toLowerCase() === buscado.toLowerCase() || 
          t.tipo.toLowerCase() === buscado.toLowerCase()
        );
        temaInit = match ? match.nombreTema : (tematicas.find(t => t.habitacionesLibres > 0)?.nombreTema || tematicas[0]?.nombreTema || '');
      } else {
        const primeraLibre = tematicas.find(t => t.habitacionesLibres > 0);
        temaInit = primeraLibre ? primeraLibre.nombreTema : (tematicas[0]?.nombreTema || '');
      }
      setSelectedTema(temaInit);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // Temáticas del piso seleccionado
  const tematicasPiso = getTematicasPorPiso(selectedPiso, rooms);

  // Asegurar que temaActivoNombre sea una temática válida del piso actual con disponibilidad
  let temaActivoNombre = selectedTema;
  if (!tematicasPiso.some(t => t.nombreTema.toLowerCase() === (temaActivoNombre || '').toLowerCase())) {
    const primeraLibre = tematicasPiso.find(t => t.habitacionesLibres > 0);
    temaActivoNombre = primeraLibre ? primeraLibre.nombreTema : (tematicasPiso[0]?.nombreTema || '');
  }

  // Asignación automática de habitación disponible basada en Piso + Temática
  const { asignada: roomAsignada, libresTemaEnPiso, totalTemaEnPiso } = asignarHabitacionAutomatica(
    selectedPiso, 
    temaActivoNombre, 
    rooms
  );

  // Habitación activa y datos para cotización
  const currentRoom = roomAsignada || tematicasPiso.find(t => t.nombreTema === temaActivoNombre) || rooms[0] || {
    numero: 'Sin asignar',
    tipo: 'Suite',
    nombreTema: temaActivoNombre,
    precioBloque: 125.00,
    capacidad: 2
  };

  const handlePisoChange = (pisoStr) => {
    const nuevoPiso = parseInt(pisoStr, 10);
    setSelectedPiso(nuevoPiso);
    const temasDelNuevoPiso = getTematicasPorPiso(nuevoPiso, rooms);
    if (temasDelNuevoPiso.length > 0) {
      // Intentar preservar temática si existe en el nuevo piso Y tiene stock libre > 0
      const mismaConStock = temasDelNuevoPiso.find(t => 
        t.nombreTema.toLowerCase() === selectedTema.toLowerCase() && t.habitacionesLibres > 0
      );
      if (mismaConStock) {
        setSelectedTema(mismaConStock.nombreTema);
      } else {
        // Seleccionar la primera temática con stock libre > 0 en el nuevo piso
        const primeraConStock = temasDelNuevoPiso.find(t => t.habitacionesLibres > 0);
        setSelectedTema(primeraConStock ? primeraConStock.nombreTema : temasDelNuevoPiso[0].nombreTema);
      }
    }
  };

  // Cálculo de tarifa base según bloque
  let basePrice = currentRoom.precioBloque || 125.00;
  if (selectedBloque === '6 HORAS') {
    basePrice = Math.round(basePrice * 0.65);
  } else if (selectedBloque === '12 HORAS') {
    basePrice = Math.round(basePrice * 0.85);
  }

  // Costo paquete festividad
  const activePackage = FESTIVIDAD_PACKAGES.find(p => p.id === selectedPackageId);
  const packagePrice = activePackage ? activePackage.precio : 0;

  // Costo adicionales de carta
  const cartaTotal = selectedCartaPromos.reduce((sum, item) => sum + (Number(item.precio) || 0), 0);

  // Un adicional elegido desde la carta puede traer otro id que el de esta lista: se compara también por nombre
  const esMismaPromo = (a, b) => a.id === b.id || a.nombre === b.nombre;
  // Lo elegido en la carta que no está en la lista fija también se muestra, para poder verlo y quitarlo
  const promosVisibles = [
    ...CARTA_PROMOTIONS,
    ...selectedCartaPromos.filter(sel => !CARTA_PROMOTIONS.some(p => esMismaPromo(p, sel)))
  ];

  // Total acumulado
  const totalEstimado = basePrice + packagePrice + cartaTotal;

  const togglePromo = (promo) => {
    setSelectedCartaPromos(prev => {
      const exists = prev.some(p => esMismaPromo(p, promo));
      if (exists) {
        return prev.filter(p => !esMismaPromo(p, promo));
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

    if (!roomAsignada) {
      setErrorMsg(`No hay habitaciones disponibles para la temática "${temaActivoNombre}" en el Piso ${selectedPiso}. Por favor selecciona otro piso o temática.`);
      return;
    }

    const metodo = getMetodoPago(metodoPago);
    if (!metodo) {
      setErrorMsg('Selecciona una forma de pago.');
      return;
    }
    if (metodo.digital && !REGEX_NUMERO_OPERACION.test(numeroOperacion.trim())) {
      setErrorMsg(`Ingresa el número de operación de tu pago con ${metodo.nombre} (entre 6 y 12 dígitos).`);
      return;
    }
    setErrorMsg('');

    const payload = {
      huesped: nombreHuesped.trim(),
      documento: documentoHuesped.trim(),
      telefono: telefonoWhatsApp.trim(),
      habitacion: roomAsignada.numero,
      habitacionId: roomAsignada.id,
      tipo: roomAsignada.nombreTema || roomAsignada.tipo || 'Suite',
      capacidad: roomAsignada.capacidad || 2,
      tarifaBase: basePrice,
      bloque: selectedBloque,
      checkIn: checkIn.split('-').reverse().join('/'),
      checkOut: checkOut.split('-').reverse().join('/'),
      fechaCheckInISO: checkIn,
      fechaCheckOutISO: checkOut,
      paqueteFestividad: activePackage || null,
      itemsCarta: selectedCartaPromos,
      total: totalEstimado,
      notasAdicionales: notasAdicionales.trim(),
      metodoPago: metodo.id,
      numeroOperacion: metodo.digital ? numeroOperacion.trim() : ''
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
                  maxLength={80}
                  placeholder="Ej: Carlos Mendoza Ruiz"
                  value={nombreHuesped}
                 onChange={(e) =>
                 setNombreHuesped(
                 e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '')
  )
}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>DNI / CE / Pasaporte *</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="Ej: 71234567"
                  value={documentoHuesped}
                  onChange={(e) =>
                  setDocumentoHuesped(
                  e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  )
}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  maxLength={18}
                  inputMode="tel"
                  required
                  placeholder="Ej: +51 987 654 321"
                  value={telefonoWhatsApp}
                  onChange={(e) => setTelefonoWhatsApp(e.target.value.replace(/[^0-9+\s-]/g, ''))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

            </div>
          </div>

          {/* Sección 2: Suite y Estancia (Flujo: Piso + Temática -> Asignación Automática) */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF37', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={15} /> 2. Elección de Piso, Temática y Modalidad
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* 1. Selección de Piso */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                  Piso Deseado *
                </label>
                <select
                  value={selectedPiso}
                  onChange={(e) => handlePisoChange(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                >
                  {PISOS_INFO.map(p => (
                    <option key={p.piso} value={p.piso}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                  {PISOS_INFO.find(p => p.piso === selectedPiso)?.descripcion}
                </span>
              </div>

              {/* 2. Selección de Temática */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                  Temática de Suite (Piso {selectedPiso}) *
                </label>
                <select
                  value={selectedTema}
                  onChange={(e) => setSelectedTema(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                >
                  {tematicasPiso.map(t => (
                    <option key={t.nombreTema} value={t.nombreTema}>
                      {t.nombreTema} (S/ {t.precioBloque.toFixed(2)} · {t.habitacionesLibres > 0 ? `${t.habitacionesLibres} libres` : 'Agotado'})
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                  {tematicasPiso.find(t => t.nombreTema === selectedTema)?.tipo} · Máx {tematicasPiso.find(t => t.nombreTema === selectedTema)?.capacidad || 2} personas
                </span>
              </div>

              {/* 3. Modalidad de Estancia */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '4px' }}>
                  Modalidad de Estancia
                </label>
                <select
                  value={selectedBloque}
                  onChange={(e) => setSelectedBloque(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '13px' }}
                >
                  <option value="6 HORAS">Bloque 6 Horas</option>
                  <option value="12 HORAS">Bloque 12 Horas</option>
                  <option value="PERNOCTE">Pernocte / 24 Horas</option>
                </select>
                <span style={{ fontSize: '11px', color: '#38bdf8', marginTop: '3px', display: 'block' }}>
                  Tarifa base estimada: S/ {basePrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Fila de Fechas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '14px' }}>
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

            {/* Asignación Automática de Habitación Disponible */}
            {roomAsignada ? (
              <div style={{
                marginTop: '16px',
                background: '#064e3b25',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#10b981', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.05em' }}>
                      ASIGNACIÓN AUTOMÁTICA
                    </span>
                    <strong style={{ fontSize: '15px', color: '#D4AF37' }}>
                      Habitación {roomAsignada.numero} (Piso {roomAsignada.piso})
                    </strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '4px' }}>
                    Temática: <strong>{roomAsignada.nombreTema}</strong> · Capacidad Máxima: <strong>{roomAsignada.capacidad} personas</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
                    {roomAsignada.tieneJacuzzi && <span>♨ Jacuzzi</span>}
                    {roomAsignada.tieneSauna && <span>✦ Sauna seco</span>}
                    {roomAsignada.tienePoleDance && <span>💃 Pole Dance</span>}
                    {roomAsignada.tieneSillonTantrico && <span>🛋 Sillón Tántrico</span>}
                    {roomAsignada.tieneCocheraDirecta && <span>🚗 Cochera Directa</span>}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Disponibilidad en este piso:</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                    {libresTemaEnPiso} {libresTemaEnPiso === 1 ? 'habitación libre' : 'habitaciones libres'} de {totalTemaEnPiso}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                marginTop: '16px',
                background: '#ef444420',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#fca5a5',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertTriangle size={18} color="#ef4444" />
                <div>
                  <strong>Stock agotado:</strong> No hay habitaciones disponibles para la temática "{temaActivoNombre}" en el Piso {selectedPiso}.
                  <div style={{ fontSize: '11.5px', color: '#fca5a5', marginTop: '2px' }}>
                    Por favor selecciona otro piso u otra temática que cuente con stock libre para poder continuar con la reserva.
                  </div>
                </div>
              </div>
            )}
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
              {promosVisibles.map(promo => {
                const isChecked = selectedCartaPromos.some(p => esMismaPromo(p, promo));
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
                      <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', marginTop: '2px' }}>+S/ {(Number(promo.precio) || 0).toFixed(2)}</div>
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

          {/* Sección 5: Forma de pago */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#D4AF37', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={15} /> 5. Forma de Pago *
            </h4>
            <PaymentMethodSelector
              metodoPago={metodoPago}
              numeroOperacion={numeroOperacion}
              onChangeMetodo={(id) => { setMetodoPago(id); setNumeroOperacion(''); setErrorMsg(''); }}
              onChangeOperacion={setNumeroOperacion}
              total={totalEstimado}
            />
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
              disabled={!roomAsignada}
              style={{ 
                background: roomAsignada ? 'linear-gradient(135deg, #D4AF37, #B8860B)' : '#334155', 
                border: 'none', 
                color: roomAsignada ? '#0c1e36' : '#94a3b8', 
                padding: '10px 24px', 
                borderRadius: '6px', 
                fontWeight: 'bold', 
                fontSize: '14px', 
                cursor: roomAsignada ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: roomAsignada ? '0 4px 14px rgba(212, 175, 55, 0.35)' : 'none'
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

