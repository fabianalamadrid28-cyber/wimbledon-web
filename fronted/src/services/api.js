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

// Initial fallback mock data matching the exact 150 rooms distributed across 3 floors (50 per floor)
export const PISOS_INFO = [
  { piso: 1, nombre: 'Piso 1 - Cochera Directa & Suites Express (50 habs)', descripcion: 'Acceso vehicular directo y máxima discreción (Hab. 101 al 150).' },
  { piso: 2, nombre: 'Piso 2 - Suites Sensuales & Jacuzzi (50 habs)', descripcion: 'Ambientes íntimos con jacuzzi, sillón tántrico y pole dance (Hab. 201 al 250).' },
  { piso: 3, nombre: 'Piso 3 - Nivel Presidencial & Vista al Mar (50 habs)', descripcion: 'Suites de alta gama con sauna seco, jacuzzi doble y vista al mar (Hab. 301 al 350).' }
];

// Generador sistemático de 150 habitaciones reales (50 por piso)
function buildInitialRooms() {
  const rooms = [];

  // --- PISO 1: Cochera Directa y Suites Express (Hab. 101 - 150 = 50 habitaciones) ---
  // 101-110: Simple con Jacuzzi
  for (let i = 101; i <= 110; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Simple',
      nombreTema: 'Simple con Jacuzzi',
      precioBloque: 89.00,
      capacidad: 2,
      piso: 1,
      estado: 'DISPONIBLE',
      descripcion: 'Habitación con jacuzzi relajante, cama queen y acceso vehicular discreto.',
      urlImagen: '/suite-cochera.jpg',
      tieneJacuzzi: true,
      tieneCocheraDirecta: true
    });
  }
  // 111-120: Venetian Flowers
  for (let i = 111; i <= 120; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Suite',
      nombreTema: 'Venetian Flowers',
      precioBloque: 100.00,
      capacidad: 2,
      piso: 1,
      estado: i === 112 ? 'RESERVADA' : 'DISPONIBLE',
      descripcion: 'Suite temática floral ejecutiva con jacuzzi y cochera privada.',
      urlImagen: '/suite-tematica.jpg',
      tieneJacuzzi: true,
      tieneCocheraDirecta: true
    });
  }
  // 121-130: Habitación Delux
  for (let i = 121; i <= 130; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Simple',
      nombreTema: 'Habitación Delux',
      precioBloque: 55.00,
      capacidad: 2,
      piso: 1,
      estado: i === 124 ? 'OCUPADA' : 'DISPONIBLE',
      descripcion: 'Habitación contemporánea con cama queen y ducha española.',
      urlImagen: '/suite-simple.jpg',
      tieneJacuzzi: false,
      tieneCocheraDirecta: false
    });
  }
  // 131-140: Pacific Dreams
  for (let i = 131; i <= 140; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Suite',
      nombreTema: 'Pacific Dreams',
      precioBloque: 125.00,
      capacidad: 2,
      piso: 1,
      estado: i === 132 ? 'RESERVADA' : 'DISPONIBLE',
      descripcion: 'Suite de lujo con jacuzzi y cochera directa privada.',
      urlImagen: '/suite-vip.jpg',
      tieneJacuzzi: true,
      tienePoleDance: true,
      tieneCocheraDirecta: true
    });
  }
  // 141-150: Riverside Dreams
  for (let i = 141; i <= 150; i++) {
    let estado = 'DISPONIBLE';
    if (i === 145) estado = 'LIMPIEZA_PENDIENTE';
    if (i === 148) estado = 'MANTENIMIENTO';
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Suite',
      nombreTema: 'Riverside Dreams',
      precioBloque: 125.00,
      capacidad: 2,
      piso: 1,
      estado,
      descripcion: 'Suite romántica con jacuzzi doble, cochera y pole dance.',
      urlImagen: '/suite-vip.jpg',
      tieneJacuzzi: true,
      tienePoleDance: true,
      tieneCocheraDirecta: true
    });
  }

  // --- PISO 2: Suites Sensuales & Jacuzzi (Hab. 201 - 250 = 50 habitaciones) ---
  // 201-210: Riverside Dreams
  for (let i = 201; i <= 210; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Suite',
      nombreTema: 'Riverside Dreams',
      precioBloque: 125.00,
      capacidad: 2,
      piso: 2,
      estado: i === 202 ? 'LIMPIEZA_PENDIENTE' : 'DISPONIBLE',
      descripcion: 'Suite romántica con jacuzzi doble y barra de pole dance.',
      urlImagen: '/suite-vip.jpg',
      tieneJacuzzi: true,
      tienePoleDance: true
    });
  }
  // 211-220: Dark Fantasies
  for (let i = 211; i <= 220; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Suite',
      nombreTema: 'Dark Fantasies',
      precioBloque: 208.00,
      capacidad: 2,
      piso: 2,
      estado: i === 214 ? 'OCUPADA' : 'DISPONIBLE',
      descripcion: 'Suite sensual equipada con jacuzzi, sillón tántrico y pole dance.',
      urlImagen: '/suite-vip.jpg',
      tieneJacuzzi: true,
      tienePoleDance: true,
      tieneSillonTantrico: true
    });
  }
  // 221-230: Jacuzzi Deluxe
  for (let i = 221; i <= 230; i++) {
    let estado = 'DISPONIBLE';
    if (i === 222) estado = 'RESERVADA';
    if (i === 228) estado = 'EN_PROCESO';
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Doble',
      nombreTema: 'Jacuzzi Deluxe',
      precioBloque: 104.00,
      capacidad: 2,
      piso: 2,
      estado,
      descripcion: 'Habitación doble contemporánea con tina de hidromasaje.',
      urlImagen: '/suite-jacuzzi.jpg',
      tieneJacuzzi: true
    });
  }
  // 231-240: Tropical Dreams
  for (let i = 231; i <= 240; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Suite',
      nombreTema: 'Tropical Dreams',
      precioBloque: 125.00,
      capacidad: 2,
      piso: 2,
      estado: i === 238 ? 'MANTENIMIENTO' : 'DISPONIBLE',
      descripcion: 'Suite con ambientación tropical y jacuzzi doble.',
      urlImagen: '/suite-tematica.jpg',
      tieneJacuzzi: true
    });
  }
  // 241-250: Simple Vista al Mar
  for (let i = 241; i <= 250; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Simple',
      nombreTema: 'Simple Vista al Mar',
      precioBloque: 73.00,
      capacidad: 2,
      piso: 2,
      estado: 'DISPONIBLE',
      descripcion: 'Habitación confortable con vista exterior y cama queen.',
      urlImagen: '/suite-simple.jpg',
      tieneJacuzzi: false
    });
  }

  // --- PISO 3: Nivel Presidencial & Vista al Mar (Hab. 301 - 350 = 50 habitaciones) ---
  // 301-310: Simple Vista al Mar
  for (let i = 301; i <= 310; i++) {
    let estado = 'DISPONIBLE';
    if (i === 302) estado = 'RESERVADA';
    if (i === 305) estado = 'LIMPIEZA_PENDIENTE';
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Simple',
      nombreTema: 'Simple Vista al Mar',
      precioBloque: 73.00,
      capacidad: 2,
      piso: 3,
      estado,
      descripcion: 'Habitación con vista panorámica exterior al mar y cama king.',
      urlImagen: '/suite-simple.jpg'
    });
  }
  // 311-320: Hawaian Dreams
  for (let i = 311; i <= 320; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Doble',
      nombreTema: 'Hawaian Dreams',
      precioBloque: 73.00,
      capacidad: 2,
      piso: 3,
      estado: 'DISPONIBLE',
      descripcion: 'Habitación acogedora con estilo isleño y vista panorámica.',
      urlImagen: '/suite-tematica.jpg'
    });
  }
  // 321-330: Habitación Especial
  for (let i = 321; i <= 330; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Suite',
      nombreTema: 'Habitación Especial',
      precioBloque: 150.00,
      capacidad: 3,
      piso: 3,
      estado: 'DISPONIBLE',
      descripcion: 'Suite amplia de hasta 3 personas con sala de estar y jacuzzi.',
      urlImagen: '/suite-jacuzzi.jpg',
      tieneJacuzzi: true
    });
  }
  // 331-340: Pacific Dreams Presidencial
  for (let i = 331; i <= 340; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Presidencial',
      nombreTema: 'Pacific Dreams Presidencial',
      precioBloque: 177.00,
      capacidad: 4,
      piso: 3,
      estado: i === 332 ? 'RESERVADA' : 'DISPONIBLE',
      descripcion: 'Suite presidencial de máximo lujo: vista al mar, jacuzzi y pole dance.',
      urlImagen: '/suite-vip.jpg',
      tieneJacuzzi: true,
      tienePoleDance: true,
      tieneSillonTantrico: true
    });
  }
  // 341-350: Suite Presidencial con Cámara Seca
  for (let i = 341; i <= 350; i++) {
    rooms.push({
      id: i,
      numero: String(i),
      tipo: 'Presidencial',
      nombreTema: 'Suite Presidencial con Cámara Seca',
      precioBloque: 200.00,
      capacidad: 4,
      piso: 3,
      estado: i === 342 ? 'OCUPADA' : 'DISPONIBLE',
      descripcion: 'Master suite con sauna finlandés privado y tina circular de hidromasaje.',
      urlImagen: '/suite-sauna.jpg',
      tieneJacuzzi: true,
      tieneSauna: true,
      tieneSillonTantrico: true
    });
  }

  return rooms;
}

export const INITIAL_ROOMS = buildInitialRooms();

export const INITIAL_RESERVATIONS = [
  { id: 1, codigo: '#R-1025', idDisplay: '#001', huesped: 'María López', habitacion: '302', tipo: 'Simple Vista al Mar', checkIn: '12/07/2025', checkOut: '15/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '10/07/2025', estado: 'Confirmada', total: 480.00, email: 'maria.lopez@email.com', telefono: '+51 987 654 321', capacidad: 2, tokenQr: 'WIM-CHK-R1025-302' },
  { id: 2, codigo: '#R-1026', idDisplay: '#002', huesped: 'Carlos Ruiz', habitacion: '112', tipo: 'Venetian Flowers', checkIn: '14/07/2025', checkOut: '16/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '08/07/2025', estado: 'Pendiente', total: 120.00, email: 'carlos.ruiz@email.com', telefono: '+51 912 345 678', capacidad: 2, tokenQr: 'WIM-CHK-R1026-112' },
  { id: 3, codigo: '#R-1027', idDisplay: '#003', huesped: 'Ana Torres', habitacion: '222', tipo: 'Jacuzzi Deluxe', checkIn: '15/07/2025', checkOut: '18/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '15/07/2025', estado: 'Confirmada', total: 1280.00, email: 'ana.torres@gmail.com', telefono: '+51 998 877 665', capacidad: 2, tokenQr: 'WIM-CHK-R1027-222' },
  { id: 4, codigo: '#R-1028', idDisplay: '#004', huesped: 'Luis Pérez', habitacion: '214', tipo: 'Dark Fantasies', checkIn: '16/07/2025', checkOut: '19/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '10/07/2025', estado: 'En Habitación', total: 750.00, email: 'luis.perez@outlook.com', telefono: '+51 976 543 210', capacidad: 2, tokenQr: 'WIM-CHK-R1028-214' },
  { id: 5, codigo: '#R-1029', idDisplay: '#005', huesped: 'Valeria Gómez', habitacion: '124', tipo: 'Habitación Delux', checkIn: '17/07/2025', checkOut: '20/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '09/07/2025', estado: 'En Habitación', total: 500.00, email: 'valeria.g@hotmail.com', telefono: '+51 965 432 109', capacidad: 2, tokenQr: 'WIM-CHK-R1029-124' },
  { id: 6, codigo: '#R-1030', idDisplay: '#006', huesped: 'Jorge Silva', habitacion: '342', tipo: 'Suite Presidencial con Cámara Seca', checkIn: '18/07/2025', checkOut: '21/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '12/07/2025', estado: 'En Habitación', total: 800.00, email: 'jorge.silva@empresa.com', telefono: '+51 954 321 098', capacidad: 4, tokenQr: 'WIM-CHK-R1030-342' },
  { id: 7, codigo: '#R-1031', idDisplay: '#007', huesped: 'Patricia Castillo', habitacion: '132', tipo: 'Pacific Dreams', checkIn: '19/07/2025', checkOut: '20/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '08/07/2025', estado: 'Confirmada', total: 250.00, email: 'patricia.castillo@gmail.com', telefono: '+51 943 210 987', capacidad: 2, tokenQr: 'WIM-CHK-R1031-132' },
  { id: 8, codigo: '#R-1032', idDisplay: '#008', huesped: 'Roberto Mendoza', habitacion: '332', tipo: 'Pacific Dreams Presidencial', checkIn: '20/07/2025', checkOut: '22/07/2025', checkInDisplay: '07/07/2025', checkOutDisplay: '09/07/2025', estado: 'Pendiente', total: 531.00, email: 'roberto.m@hotmail.com', telefono: '+51 932 109 876', capacidad: 4, tokenQr: 'WIM-CHK-R1032-332' }
];

// Helper functions for realistic floor and theme assignment
export function getTematicasPorPiso(piso, rooms = INITIAL_ROOMS) {
  const pisoNum = parseInt(piso, 10);
  const roomsPiso = rooms.filter(r => r.piso === pisoNum);
  const temasMap = new Map();

  const isFree = (r) => {
    const st = String(r.estado || '').toUpperCase().trim();
    return st === 'DISPONIBLE' || st === 'LISTA';
  };

  roomsPiso.forEach(r => {
    const key = r.nombreTema || r.tipo;
    if (!temasMap.has(key)) {
      temasMap.set(key, {
        nombreTema: key,
        tipo: r.tipo,
        precioBloque: r.precioBloque,
        capacidad: r.capacidad || 2,
        urlImagen: r.urlImagen,
        tieneJacuzzi: Boolean(r.tieneJacuzzi),
        tieneSauna: Boolean(r.tieneSauna),
        tienePoleDance: Boolean(r.tienePoleDance),
        tieneSillonTantrico: Boolean(r.tieneSillonTantrico),
        tieneCocheraDirecta: Boolean(r.tieneCocheraDirecta),
        totalHabitaciones: 0,
        habitacionesLibres: 0,
        habitaciones: []
      });
    }
    const item = temasMap.get(key);
    item.totalHabitaciones++;
    item.habitaciones.push(r);
    if (isFree(r)) {
      item.habitacionesLibres++;
    }
  });

  return Array.from(temasMap.values());
}

export function asignarHabitacionAutomatica(piso, nombreTema, rooms = INITIAL_ROOMS) {
  const pisoNum = parseInt(piso, 10);
  const temaNorm = String(nombreTema || '').trim().toLowerCase();

  // Buscar todas las habitaciones del piso seleccionado
  const roomsPiso = rooms.filter(r => r.piso === pisoNum);

  // Filtrar candidatas por coincidencia flexible de temática o tipo
  let candidatas = roomsPiso.filter(r => {
    const tNom = String(r.nombreTema || '').trim().toLowerCase();
    const tTipo = String(r.tipo || '').trim().toLowerCase();
    return tNom === temaNorm || tTipo === temaNorm || (temaNorm && (tNom.includes(temaNorm) || temaNorm.includes(tNom)));
  });

  // Si no coincide exactamente con ninguna temática de este piso, usar la primera temática disponible del piso
  if (candidatas.length === 0 && roomsPiso.length > 0) {
    const primerTema = roomsPiso[0].nombreTema;
    candidatas = roomsPiso.filter(r => r.nombreTema === primerTema);
  }

  // Las habitaciones libres son aquellas en estado DISPONIBLE o LISTA (case-insensitive)
  const isFree = (r) => {
    const st = String(r.estado || '').toUpperCase().trim();
    return st === 'DISPONIBLE' || st === 'LISTA';
  };

  const disponibles = candidatas.filter(isFree);
  const asignada = disponibles.length > 0 ? disponibles[0] : null;

  return {
    asignada,
    totalTemaEnPiso: candidatas.length,
    libresTemaEnPiso: disponibles.length
  };
}

export function getStockPorTematica(rooms = INITIAL_ROOMS) {
  const stockMap = new Map();
  rooms.forEach(r => {
    const key = r.nombreTema || r.tipo;
    if (!stockMap.has(key)) {
      stockMap.set(key, {
        nombreTema: key,
        tipo: r.tipo,
        precioBloque: r.precioBloque,
        capacidad: r.capacidad || 2,
        total: 0,
        libres: 0,
        ocupadas: 0,
        limpieza: 0,
        mantenimiento: 0
      });
    }
    const item = stockMap.get(key);
    item.total++;
    const st = (r.estado || '').toUpperCase();
    if (st === 'DISPONIBLE' || st === 'LISTA') item.libres++;
    else if (st === 'OCUPADA' || st === 'RESERVADA') item.ocupadas++;
    else if (st === 'LIMPIEZA_PENDIENTE' || st === 'EN_PROCESO') item.limpieza++;
    else if (st === 'MANTENIMIENTO') item.mantenimiento++;
  });
  return Array.from(stockMap.values());
}

export const UPCOMING_CHECKINS = [
  { hora: '14:00', huesped: 'Patricia Castillo', habitacion: '132', tipo: 'Pacific Dreams' },
  { hora: '15:00', huesped: 'Diego Vargas', habitacion: '222', tipo: 'Jacuzzi Deluxe' },
  { hora: '16:00', huesped: 'Sofía Herrera', habitacion: '325', tipo: 'Habitación Especial' },
  { hora: '17:00', huesped: 'Alejandro Rojas', habitacion: '112', tipo: 'Venetian Flowers' }
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
    puedeEditar: item.puedeEditar !== false,
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

  // Format status cleanly (CONFIRMADA -> Confirmada, CHECKIN -> Check-in, EN HABITACIÓN -> En Habitación)
  let estadoStr = String(item.estado || 'Confirmada');
  if (estadoStr.toUpperCase() === 'CONFIRMADA') estadoStr = 'Confirmada';
  else if (estadoStr.toUpperCase() === 'PENDIENTE') estadoStr = 'Pendiente';
  else if (estadoStr.toUpperCase() === 'CHECKIN' || estadoStr.toUpperCase() === 'CHECK-IN') estadoStr = 'Check-in';
  else if (estadoStr.toUpperCase() === 'EN HABITACIÓN' || estadoStr.toUpperCase() === 'EN HABITACION' || estadoStr.toUpperCase() === 'EN_HABITACION') estadoStr = 'En Habitación';
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
  'En Habitación': 'CHECKIN',
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
    if (nuevoEstado === 'Check-in' || nuevoEstado === 'En Habitación' || nuevoEstado === 'CHECKIN') return { ...room, estado: 'OCUPADA' };
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
    try {
      const res = await apiFetch(`${API_BASE_URL}/habitaciones/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        return normalizeRoom(await res.json());
      }
    } catch (e) {
      console.warn('Backend API no disponible para updateEstadoHabitacion, actualizando estado en memoria local.', e);
    }
    return { id, estado: String(nuevoEstado).toUpperCase() };
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
    try {
      const res = await apiFetch(`${API_BASE_URL}/reservas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: ESTADO_RESERVA_API[nuevoEstado] || String(nuevoEstado).toUpperCase() })
      });
      if (res.ok) {
        return normalizeReservation(await res.json(), 0);
      }
    } catch (e) {
      console.warn('Backend API no disponible para updateEstadoReserva, actualizando estado en memoria local.', e);
    }
    return { id, estado: nuevoEstado };
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
       fechaCheckIn: reservaData.fechaCheckInISO || reservaData.fechaCheckIn,
       fechaCheckOut: reservaData.fechaCheckOutISO || reservaData.fechaCheckOut,
       horaEntradaProgramada: reservaData.horaEntradaProgramada || '14:00',
       horaSalidaProgramada: reservaData.horaSalidaProgramada || '12:00',
       totalPago: reservaData.total || reservaData.totalPago || 250.00,
        bloqueSeleccionado: reservaData.bloque || reservaData.bloqueSeleccionado || 'PERNOCTE',
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
  },

  // Soporte: reportar un inconveniente en una habitación (cliente o limpieza)
  async crearReporteSoporte(data) {
    const res = await apiFetch(`${API_BASE_URL}/soporte`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(data)
    });
    return jsonOrThrow(res, 'No se pudo crear el reporte de soporte.');
  },

  async listarReportesSoporte() {
    const res = await apiFetch(`${API_BASE_URL}/soporte`);
    return jsonOrThrow(res, 'No se pudieron cargar los reportes de soporte.');
  },

  async actualizarEstadoReporteSoporte(id, estado) {
    const res = await apiFetch(`${API_BASE_URL}/soporte/${id}/estado`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ estado })
    });
    return jsonOrThrow(res, 'No se pudo actualizar el estado del reporte.');
  }
};

