// API service for Hotel Wimbledon backend integration with robust normalization and offline fallback

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Todas las llamadas envían la cookie de sesión. Si el backend responde 401 (sesión vencida), se avisa a la app.
const apiFetch = async (url, opts = {}) => {
  const res = await fetch(url, { ...opts, credentials: 'include' });
  if (res.status === 401 && !String(url).includes('/auth/')) {
    window.dispatchEvent(new Event('auth:expired'));
  }
  return res;
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function jsonOrThrow(res, fallbackMsg) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.mensaje || fallbackMsg);
  return data;
}

// Solo ADMIN y RECEPCION pueden leer reservas (lo valida el backend); App.jsx actualiza este permiso según la sesión.
let verReservas = false;
export function setPermisoReservas(valor) { verReservas = Boolean(valor); }

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

// Datos que el formulario de edición necesita y las reglas de tiempo que calcula el servidor (hora de Lima)
function camposEdicion(item) {
  const hhmm = (t) => (t ? String(t).slice(0, 5) : '');
  return {
    habitacionId: typeof item.habitacion === 'object' && item.habitacion ? item.habitacion.id : null,
    documento: item.documentoHuesped || item.documento || '',
    // Valores reales (sin relleno inventado): el formulario de edición no debe grabar un correo/teléfono falso
    emailReal: item.emailHuesped || '',
    telefonoReal: item.telefonoWhatsApp || '',
    fechaCheckInISO: item.fechaCheckIn || '',
    fechaCheckOutISO: item.fechaCheckOut || '',
    horaEntrada: hhmm(item.horaEntradaProgramada),
    horaSalida: hhmm(item.horaSalidaProgramada),
    bloque: item.bloqueSeleccionado || '',
    notas: item.notasAdicionales || '',
    puedeEditar: item.puedeEditar === true,
    motivoNoEditable: item.motivoNoEditable || null,
    puedeCancelar: item.puedeCancelar === true,
    motivoNoCancelable: item.motivoNoCancelable || null,
    excedida: item.excedida === true
  };
}

// dd/MM/yyyy -> yyyy-MM-dd (formato que acepta el backend); si ya viene en ISO o vacío, no se toca
function aFechaISO(fecha) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha || '');
  return m ? `${m[3]}-${m[2]}-${m[1]}` : fecha;
}

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
  else if (estadoStr.toUpperCase() === 'FINALIZADA') estadoStr = 'Finalizada';

  return {
    id: item.id || index + 1,
    codigo: item.codigo || `#R-${1025 + index}`,
    ...camposEdicion(item),
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
    telefono: item.telefonoWhatsApp || item.telefono || '+51 987 654 321',
    creadaEn: item.creadaEn || null,
    metodoPago: item.metodoPago || '',
    numeroOperacion: item.numeroOperacion || '',
    tokenQr: item.tokenAccesoQr || ''
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

// Etiqueta de la UI -> enum del backend
const ESTADO_RESERVA_API = {
  'Pendiente': 'PENDIENTE',
  'Confirmada': 'CONFIRMADA',
  'Check-in': 'CHECKIN',
  'Finalizada': 'FINALIZADA',
  'Cancelada': 'CANCELADA'
};

// Estado de habitación que corresponde a un estado de reserva (mismas reglas que el backend)
export function aplicarEstadoReservaLocal(setReservations, setRooms, reserva, nuevoEstado) {
  setReservations(prev => prev.map(r => r.id === reserva.id ? { ...r, estado: nuevoEstado } : r));
  setRooms(prev => prev.map(room => {
    if (String(room.numero) !== String(reserva.habitacion)) return room;
    if (nuevoEstado === 'Pendiente' || nuevoEstado === 'Confirmada') {
      return room.estado === 'DISPONIBLE' ? { ...room, estado: 'RESERVADA' } : room;
    }
    if (nuevoEstado === 'Check-in') return { ...room, estado: 'OCUPADA' };
    if (nuevoEstado === 'Finalizada') return { ...room, estado: 'LIMPIEZA_PENDIENTE' };
    if (nuevoEstado === 'Cancelada' && (room.estado === 'RESERVADA' || room.estado === 'OCUPADA')) {
      return { ...room, estado: 'DISPONIBLE' };
    }
    return room;
  }));
}

export const api = {
  // Autenticación (el rol lo determina el backend desde la base de datos)
  async login(email, password) {
    let res;
    try {
      res = await apiFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ email, password })
      });
    } catch (e) {
      throw new Error('No se pudo conectar con el servidor.');
    }
    return jsonOrThrow(res, 'No se pudo iniciar sesión.');
  },

  async me() {
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/me`);
      return res.ok ? await res.json() : null;
    } catch (e) { return null; }
  },

  async logout() {
    try { await apiFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' }); } catch (e) {}
  },

  // Gestión de cuentas (solo ADMIN)
  async getUsuarios() {
    const res = await apiFetch(`${API_BASE_URL}/usuarios`);
    return jsonOrThrow(res, 'No se pudieron cargar los usuarios.');
  },
  async createUsuario(data) {
    const res = await apiFetch(`${API_BASE_URL}/usuarios`, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(data) });
    return jsonOrThrow(res, 'No se pudo crear el usuario.');
  },
  async updateUsuario(id, data) {
    const res = await apiFetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(data) });
    return jsonOrThrow(res, 'No se pudo actualizar el usuario.');
  },

  // Recarga habitaciones y reservas desde el backend; si no responde, deja el estado local intacto
  async syncAll(setRooms, setReservations) {
    const [dbRooms, dbReservas] = await Promise.all([
      api.getHabitaciones({ strict: true }),
      api.getReservas({ strict: true })
    ]);
    if (dbRooms && dbRooms.length > 0) setRooms(dbRooms);
    if (dbReservas && dbReservas.length > 0) setReservations(dbReservas);
  },

  // Habitaciones
  async getHabitaciones({ strict = false } = {}) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/habitaciones`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeRoom);
        }
      }
    } catch (e) {
      // Backend not reached, fall back to mock
    }
    if (strict) return null;
    return INITIAL_ROOMS.map(normalizeRoom);
  },

  async updateHabitacion(id, roomData) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/habitaciones/${id}`, {
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

  async createHabitacion(roomData) {
    try {
      const res = await apiFetch(`${API_BASE_URL}/habitaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      if (res.ok) return normalizeRoom(await res.json());
    } catch (e) {}
    return normalizeRoom({ ...roomData, id: Date.now() });
  },

  async deleteHabitacion(id) {
    try {
      await apiFetch(`${API_BASE_URL}/habitaciones/${id}`, { method: 'DELETE' });
    } catch (e) {}
  },

  async updateEstadoHabitacion(id, nuevoEstado) {
    const res = await apiFetch(`${API_BASE_URL}/habitaciones/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    }).catch(() => { throw new Error('Sin conexión con el servidor'); });
    if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);
    return normalizeRoom(await res.json());
  },

  // Reservas
  async getReservas({ strict = false } = {}) {
    if (!verReservas) return strict ? null : INITIAL_RESERVATIONS.map((r, i) => normalizeReservation(r, i));
    try {
      const res = await apiFetch(`${API_BASE_URL}/reservas`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((r, i) => normalizeReservation(r, i));
        }
      }
    } catch (e) {}
    if (strict) return null;
    return INITIAL_RESERVATIONS.map((r, i) => normalizeReservation(r, i));
  },

  async updateEstadoReserva(id, nuevoEstado) {
    const res = await apiFetch(`${API_BASE_URL}/reservas/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: ESTADO_RESERVA_API[nuevoEstado] || String(nuevoEstado).toUpperCase() })
    }).catch(() => { throw new Error('Sin conexión con el servidor'); });
    if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);
    return normalizeReservation(await res.json(), 0);
  },

  // Editar datos de una reserva (el servidor valida: solo PENDIENTE/CONFIRMADA y antes de la hora de entrada)
  async editarReserva(id, datos) {
    const res = await apiFetch(`${API_BASE_URL}/reservas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    }).catch(() => { throw new Error('Sin conexión con el servidor'); });
    if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);
    return normalizeReservation(await res.json(), 0);
  },

  // Extender una reserva con el huésped dentro (CHECKIN): suma horas y cobro
  async extenderReserva(id, horas, monto) {
    const res = await apiFetch(`${API_BASE_URL}/reservas/${id}/extender`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ horas, monto: monto === '' || monto == null ? null : monto })
    }).catch(() => { throw new Error('Sin conexión con el servidor'); });
    if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);
    return normalizeReservation(await res.json(), 0);
  },

  // Lectura estricta para los paneles: sin datos de ejemplo si el servidor falla (lanza el error)
  async refrescarTodo() {
    const [hr, rr] = await Promise.all([
      apiFetch(`${API_BASE_URL}/habitaciones`),
      verReservas ? apiFetch(`${API_BASE_URL}/reservas`) : Promise.resolve(null)
    ]).catch(() => { throw new Error('Sin conexión con el servidor'); });
    if (!hr.ok || (rr && !rr.ok)) throw new Error(`El servidor respondió ${!hr.ok ? hr.status : rr.status}`);
    const [rooms, reservas] = await Promise.all([hr.json(), rr ? rr.json() : Promise.resolve([])]);
    return {
      rooms: rooms.map(normalizeRoom),
      reservas: reservas.map((r, i) => normalizeReservation(r, i))
    };
  },

  async createReserva(reservaData) {
    try {
      const payload = {
        nombreHuesped: reservaData.huesped || reservaData.nombreHuesped,
        documentoHuesped: reservaData.documento || reservaData.documentoHuesped || '70123456',
        emailHuesped: reservaData.email || reservaData.emailHuesped || 'cliente@wimbledon.com',
        telefonoWhatsApp: reservaData.telefono || reservaData.telefonoWhatsApp || '+51 900 000 000',
        // El backend (LocalDate) espera yyyy-MM-dd; el formulario guarda dd/MM/yyyy
        fechaCheckIn: aFechaISO(reservaData.checkIn || reservaData.fechaCheckIn),
        fechaCheckOut: aFechaISO(reservaData.checkOut || reservaData.fechaCheckOut),
        totalPago: reservaData.total || reservaData.totalPago || 250.00,
        bloqueSeleccionado: reservaData.bloqueSeleccionado || 'NOCHE COMPLETA',
        notasAdicionales: reservaData.notasAdicionales || '',
        metodoPago: reservaData.metodoPago || null,
        numeroOperacion: reservaData.numeroOperacion || null,
        habitacion: {
          id: reservaData.habitacionId || 1
        }
      };
      const res = await apiFetch(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        return normalizeReservation(saved, 0);
      }
      if (res.status === 400) throw new Error(await res.text());
    } catch (e) {
      if (!(e instanceof TypeError)) throw e;
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
      estado: 'Pendiente',
      total: parseFloat(reservaData.total || 250.00),
      email: reservaData.email || 'cliente@wimbledon.com',
      telefono: reservaData.telefono || '+51 987 654 321',
      notasAdicionales: reservaData.notasAdicionales || '',
      metodoPago: reservaData.metodoPago || '',
      numeroOperacion: reservaData.numeroOperacion || '',
      detallesBoleta: reservaData.detallesBoleta || null
    };
  }
};
