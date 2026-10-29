// API service for Hotel Wimbledon backend integration with robust normalization and offline fallback

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Initial fallback mock data matching the exact mockups
export const INITIAL_ROOMS = [
  { id: 1, numero: '101', tipo: 'Simple', nombreTema: 'Suite Simple', precioBloque: 120.00, capacidad: 1, piso: 1, estado: 'DISPONIBLE', descripcion: 'Habitación simple acogedora con cama queen y TV.', urlImagen: '/suite-simple.jpg' },
  { id: 2, numero: '102', tipo: 'Doble', nombreTema: 'Suite Doble', precioBloque: 160.00, capacidad: 2, piso: 1, estado: 'DISPONIBLE', descripcion: 'Habitación doble espaciosa con acabados de primera.', urlImagen: '/suite-tematica.jpg' },
  { id: 3, numero: '103', tipo: 'Doble', nombreTema: 'Suite Doble', precioBloque: 160.00, capacidad: 2, piso: 1, estado: 'DISPONIBLE', descripcion: 'Habitación doble con sala de descanso y balcón.', urlImagen: '/suite-tematica.jpg' },
  { id: 4, numero: '108', tipo: 'Suite', nombreTema: 'Suite Ejecutiva', precioBloque: 250.00, capacidad: 2, piso: 1, estado: 'DISPONIBLE', descripcion: 'Suite ejecutiva con jacuzzi y cochera directa.', urlImagen: '/suite-vip.jpg' },
  { id: 5, numero: '201', tipo: 'Suite', nombreTema: 'Suite Panorámica', precioBloque: 250.00, capacidad: 2, piso: 2, estado: 'DISPONIBLE', descripcion: 'Habitación suite con vista a la ciudad, cama king, TV y minibar.', urlImagen: '/suite-jacuzzi.jpg' },
  { id: 6, numero: '202', tipo: 'Suite', nombreTema: 'Suite Romántica', precioBloque: 250.00, capacidad: 2, piso: 2, estado: 'DISPONIBLE', descripcion: 'Suite con jacuzzi doble y ambientación romántica.', urlImagen: '/suite-vip.jpg' },
  { id: 7, numero: '203', tipo: 'Suite', nombreTema: 'Suite Presidencial', precioBloque: 250.00, capacidad: 2, piso: 2, estado: 'MANTENIMIENTO', descripcion: 'Suite presidencial en remodelación de jacuzzi.', urlImagen: '/suite-sauna.jpg' },
  { id: 8, numero: '205', tipo: 'Doble', nombreTema: 'Suite Deluxe', precioBloque: 160.00, capacidad: 2, piso: 2, estado: 'OCUPADA', descripcion: 'Habitación doble contemporánea.', urlImagen: '/suite-cochera.jpg' },
  { id: 9, numero: '301', tipo: 'Doble', nombreTema: 'Suite Terraza', precioBloque: 160.00, capacidad: 2, piso: 3, estado: 'DISPONIBLE', descripcion: 'Habitación doble en tercer nivel.', urlImagen: '/suite-tematica.jpg' },
  { id: 10, numero: '302', tipo: 'Doble', nombreTema: 'Suite Marítima', precioBloque: 160.00, capacidad: 2, piso: 3, estado: 'OCUPADA', descripcion: 'Habitación doble con vista exterior.', urlImagen: '/suite-simple.jpg' },
  { id: 11, numero: '304', tipo: 'Suite', nombreTema: 'Suite Imperial', precioBloque: 250.00, capacidad: 2, piso: 3, estado: 'OCUPADA', descripcion: 'Suite de alta gama con jacuzzi.', urlImagen: '/suite-vip.jpg' },
  { id: 12, numero: '305', tipo: 'Doble', nombreTema: 'Suite Confort', precioBloque: 160.00, capacidad: 2, piso: 3, estado: 'LIMPIEZA_PENDIENTE', descripcion: 'Habitación pendiente de aseo tras check-out.', urlImagen: '/suite-tematica.jpg' }
];

export const INITIAL_RESERVATIONS = [
  { id: 1, codigo: '#R-1025', idDisplay: '#001', huesped: 'María López', habitacion: '302', tipo: 'Doble', checkIn: '12/07/2025', checkOut: '15/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '10/07/2025', estado: 'Confirmada', total: 480.00, email: 'maria.lopez@email.com', telefono: '+51 987 654 321' },
  { id: 2, codigo: '#R-1026', idDisplay: '#002', huesped: 'Carlos Ruiz', habitacion: '101', tipo: 'Simple', checkIn: '14/07/2025', checkOut: '16/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '08/07/2025', estado: 'Pendiente', total: 120.00, email: 'carlos.ruiz@email.com', telefono: '+51 912 345 678' },
  { id: 3, codigo: '#R-1027', idDisplay: '#003', huesped: 'Ana Torres', habitacion: '205', tipo: 'Doble', checkIn: '15/07/2025', checkOut: '18/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '15/07/2025', estado: 'Confirmada', total: 1280.00, email: 'ana.torres@gmail.com', telefono: '+51 998 877 665' },
  { id: 4, codigo: '#R-1028', idDisplay: '#004', huesped: 'Luis Pérez', habitacion: '304', tipo: 'Suite', checkIn: '16/07/2025', checkOut: '19/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '10/07/2025', estado: 'Check-in', total: 750.00, email: 'luis.perez@outlook.com', telefono: '+51 976 543 210' },
  { id: 5, codigo: '#R-1029', idDisplay: '#005', huesped: 'Valeria Gómez', habitacion: '201', tipo: 'Simple', checkIn: '17/07/2025', checkOut: '20/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '09/07/2025', estado: 'Pendiente', total: 500.00, email: 'valeria.g@hotmail.com', telefono: '+51 965 432 109' },
  { id: 6, codigo: '#R-1030', idDisplay: '#006', huesped: 'Jorge Silva', habitacion: '103', tipo: 'Doble', checkIn: '18/07/2025', checkOut: '21/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '12/07/2025', estado: 'Confirmada', total: 800.00, email: 'jorge.silva@empresa.com', telefono: '+51 954 321 098' }
];

export const UPCOMING_CHECKINS = [
  { hora: '14:00', huesped: 'Patricia Castillo', habitacion: '108', tipo: 'Suite' },
  { hora: '15:00', huesped: 'Diego Vargas', habitacion: '203', tipo: 'Doble' },
  { hora: '16:00', huesped: 'Sofía Herrera', habitacion: '305', tipo: 'Doble' },
  { hora: '17:00', huesped: 'Alejandro Rojas', habitacion: '102', tipo: 'Simple' }
];

// Normalizer to safely transform backend DB models into UI models
export function normalizeReservation(item, index) {
  if (!item) return null;
  const habitacionNum = typeof item.habitacion === 'object' && item.habitacion !== null 
    ? (item.habitacion.numero || '101') 
    : String(item.habitacion || '101');

  const habitacionTipo = (typeof item.habitacion === 'object' && item.habitacion?.tipo) 
    ? item.habitacion.tipo 
    : (item.tipo || 'Simple');

  // Format status cleanly (CONFIRMADA -> Confirmada, CHECKIN -> Check-in)
  let estadoStr = String(item.estado || 'Confirmada');
  if (estadoStr.toUpperCase() === 'CONFIRMADA') estadoStr = 'Confirmada';
  else if (estadoStr.toUpperCase() === 'PENDIENTE') estadoStr = 'Pendiente';
  else if (estadoStr.toUpperCase() === 'CHECKIN' || estadoStr.toUpperCase() === 'CHECK-IN') estadoStr = 'Check-in';
  else if (estadoStr.toUpperCase() === 'CANCELADA') estadoStr = 'Cancelada';

  return {
    id: item.id || index + 1,
    codigo: item.codigo || `#R-${1025 + index}`,
    idDisplay: item.idDisplay || `#00${index + 1}`,
    huesped: item.nombreHuesped || item.huesped || 'Huésped',
    habitacion: habitacionNum,
    tipo: habitacionTipo,
    checkIn: item.fechaCheckIn || item.checkIn || '07/07/2025',
    checkOut: item.fechaCheckOut || item.checkOut || '10/07/2025',
    checkInDisplay: item.fechaCheckIn || item.checkInDisplay || item.checkIn || '07/07/2025',
    checkOutDisplay: item.fechaCheckOut || item.checkOutDisplay || item.checkOut || '10/07/2025',
    estado: estadoStr,
    total: item.totalPago != null ? parseFloat(item.totalPago) : (item.total || 480.00),
    email: item.emailHuesped || item.email || 'huesped@wimbledon.com',
    telefono: item.telefonoWhatsApp || item.telefono || '+51 987 654 321'
  };
}

export function normalizeRoom(room) {
  if (!room) return null;
  return {
    id: room.id || Date.now(),
    numero: String(room.numero || '101'),
    tipo: room.tipo || 'Simple',
    nombreTema: room.nombreTema || `Suite ${room.numero}`,
    precioBloque: room.precioBloque != null ? parseFloat(room.precioBloque) : 120.00,
    capacidad: room.capacidad || 2,
    piso: room.piso || parseInt(String(room.numero || '101').charAt(0)) || 1,
    estado: (room.estado || 'DISPONIBLE').toUpperCase(),
    descripcion: room.descripcion || 'Habitación con baño privado y comodidades.',
    urlImagen: room.urlImagen || '/suite-simple.jpg',
    tieneJacuzzi: Boolean(room.tieneJacuzzi),
    tieneSauna: Boolean(room.tieneSauna),
    tienePoleDance: Boolean(room.tienePoleDance),
    tieneSillonTantrico: Boolean(room.tieneSillonTantrico),
    tieneCocheraDirecta: Boolean(room.tieneCocheraDirecta)
  };
}

export const api = {
  // Habitaciones
  async getHabitaciones() {
    try {
      const res = await fetch(`${API_BASE_URL}/habitaciones`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeRoom);
        }
      }
    } catch (e) {
      // Backend not reached, fall back to mock
    }
    return INITIAL_ROOMS.map(normalizeRoom);
  },

  async updateHabitacion(id, roomData) {
    try {
      const res = await fetch(`${API_BASE_URL}/habitaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      if (res.ok) {
        const saved = await res.json();
        return normalizeRoom(saved);
      }
    } catch (e) {}
    return normalizeRoom({ ...roomData, id });
  },

  async updateEstadoHabitacion(id, nuevoEstado) {
    try {
      const res = await fetch(`${API_BASE_URL}/habitaciones/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        const saved = await res.json();
        return normalizeRoom(saved);
      }
    } catch (e) {}
    return { id, estado: nuevoEstado };
  },

  // Reservas
  async getReservas() {
    try {
      const res = await fetch(`${API_BASE_URL}/reservas`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((r, i) => normalizeReservation(r, i));
        }
      }
    } catch (e) {}
    return INITIAL_RESERVATIONS.map((r, i) => normalizeReservation(r, i));
  },

  async updateEstadoReserva(id, nuevoEstado) {
    try {
      const res = await fetch(`${API_BASE_URL}/reservas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        const saved = await res.json();
        return normalizeReservation(saved, 0);
      }
    } catch (e) {}
    return { id, estado: nuevoEstado };
  },

  async createReserva(reservaData) {
    try {
      const payload = {
        nombreHuesped: reservaData.huesped || reservaData.nombreHuesped,
        documentoHuesped: reservaData.documento || reservaData.documentoHuesped || '70123456',
        emailHuesped: reservaData.email || reservaData.emailHuesped || 'cliente@wimbledon.com',
        telefonoWhatsApp: reservaData.telefono || reservaData.telefonoWhatsApp || '+51 900 000 000',
        fechaCheckIn: reservaData.checkIn || reservaData.fechaCheckIn,
        fechaCheckOut: reservaData.checkOut || reservaData.fechaCheckOut,
        totalPago: reservaData.total || reservaData.totalPago || 250.00,
        bloqueSeleccionado: reservaData.bloqueSeleccionado || 'NOCHE COMPLETA',
        notasAdicionales: reservaData.notasAdicionales || '',
        habitacion: {
          id: reservaData.habitacionId || 1
        }
      };
      const res = await fetch(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        return normalizeReservation(saved, 0);
      }
    } catch (e) {
      console.warn('Backend API not reached for createReserva, using local mock store', e);
    }
    // Local fallback with complete details
    const randomCode = '#R-' + Math.floor(1031 + Math.random() * 500);
    const randomId = Date.now();
    return {
      id: randomId,
      codigo: randomCode,
      idDisplay: `#00${Math.floor(7 + Math.random() * 50)}`,
      huesped: reservaData.huesped || reservaData.nombreHuesped || 'Huésped Wimbledon',
      documento: reservaData.documento || reservaData.documentoHuesped || '70123456',
      habitacion: String(reservaData.habitacion || '201'),
      tipo: reservaData.tipo || 'Suite',
      checkIn: reservaData.checkIn || '29/10/2026',
      checkOut: reservaData.checkOut || '30/10/2026',
      checkInDisplay: reservaData.checkInDisplay || reservaData.checkIn || '29/10/2026',
      checkOutDisplay: reservaData.checkOutDisplay || reservaData.checkOut || '30/10/2026',
      estado: 'Confirmada',
      total: parseFloat(reservaData.total || 250.00),
      email: reservaData.email || 'cliente@wimbledon.com',
      telefono: reservaData.telefono || '+51 987 654 321',
      notasAdicionales: reservaData.notasAdicionales || '',
      detallesBoleta: reservaData.detallesBoleta || null
    };
  }
};
