import React, { useState, useEffect, useRef } from 'react';
import DashboardContainer from './views/DashboardContainer';
import { 
  Shield, 
  UserCheck, 
  Sparkles, 
  X, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  Utensils, 
  Gift, 
  Check, 
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  LoaderCircle,
  CircleAlert,
  Wrench
} from 'lucide-react';
import { INITIAL_ROOMS, INITIAL_RESERVATIONS, api, setPermisoReservas } from './services/api';
import useLiveSync from './services/useLiveSync';
import BookingModal from './components/modals/BookingModal';
import ReceiptModal from './components/modals/ReceiptModal';
import CheckInValidationModal from './components/modals/CheckInValidationModal';
import MenuDetailModal from './components/modals/MenuDetailModal';
import EfectosNavidad from './components/common/EfectosNavidad';
import RoomRatesPanel from './components/RoomRatesPanel';
import SoporteForm from './components/SoporteForm';
import FloatingSupportModal from './components/modals/FloatingSupportModal';
import HABITACIONES_REALES from './data/habitaciones.json';

/* ---------- DATOS COMPLETOS DE LA CARTA Y PROMOCIONES ---------- */
export const MENU_CATEGORIES_DATA = [
  {
    id: 'piqueos',
    nombre: 'Piqueos para Dos',
    tagline: 'Tablas artesanales y bocados calientes para compartir en la intimidad',
    img: '/menu-piqueos.jpg',
    promocion: {
      id: 'promo_piqueo',
      nombre: 'Promo Pareja: Piqueo Mixto + 2 Cervezas Artesanales',
      desc: 'Tequeños rellenos de queso andino, alitas glaseadas y 2 cervezas artesanales bien heladas.',
      precio: 48.00,
      badge: 'PROMO DESTACADA'
    },
    items: [
      { id: 'p1', nombre: 'Tequeños Wimbledon al Pisco', desc: 'Masa wantán crocante rellena de queso paria derretido, acompañada de guacamole rústico.', precio: 28.00 },
      { id: 'p2', nombre: 'Alitas Glaseadas Acevichadas o BBQ', desc: '8 piezas de alitas crujientes bañadas en nuestra salsa secreta con toques cítricos.', precio: 34.00 },
      { id: 'p3', nombre: 'Tabla Ibérica de Quesos y Jamones', desc: 'Selección de quesos madurados, prosciutto, salame, frutos secos y tostadas finas.', precio: 52.00 },
      { id: 'p4', nombre: 'Chicharrón de Calamar al Ajillo', desc: 'Calamares tiernos en tempura crujiente servidos con tártara de la casa y yucas doradas.', precio: 38.00 },
      { id: 'p5', nombre: 'Carpaccio de Lomo Fino con Alcaparras', desc: 'Láminas de lomo maceradas con aceite de oliva extravirgen, parmesano y reducción balsámica.', precio: 44.00 }
    ]
  },
  {
    id: 'fondos',
    nombre: 'Platos de Fondo',
    tagline: 'Cocina criolla e internacional preparada al momento con insumos premium',
    img: '/menu-fondos.jpg',
    promocion: {
      id: 'promo_cena',
      nombre: 'Cena Romántica Wimbledon: 2 Fondos + 2 Copas de Vino',
      desc: 'Elige 2 platos de fondo de autor y acompáñalos con 2 copas de vino tinto o blanco selección.',
      precio: 96.00,
      badge: 'RECOMENDADO PARA DOS'
    },
    items: [
      { id: 'f1', nombre: 'Lomo Saltado Gourmet al Wok', desc: 'Trozos de lomo fino salteados a fuego vivo con cebolla morada, tomate y ají amarillo, papas amarillas y arroz.', precio: 46.00 },
      { id: 'f2', nombre: 'Risotto al Funghi Porcini con Medallón de Lomo', desc: 'Arroz arborio cremoso con hongos silvestres, queso grana padano y jugoso medallón de lomo.', precio: 54.00 },
      { id: 'f3', nombre: 'Salmón a la Plancha en Reducción de Maracuyá', desc: 'Filete de salmón fresco sobre puré de camote rústico y reducción agridulce de maracuyá.', precio: 56.00 },
      { id: 'f4', nombre: 'Fettuccine a la Huancaína con Lomo Fino', desc: 'Pasta artesanal en salsa huancaína tradicional servida con tiras de lomo fino a la parrilla.', precio: 48.00 },
      { id: 'f5', nombre: 'Suprema Cordon Bleu Wimbledon', desc: 'Pechuga rellena de jamón ahumado y queso fundido, empanizada en panko con papas doradas.', precio: 40.00 }
    ]
  },
  {
    id: 'postres',
    nombre: 'Postres y Dulces',
    tagline: 'Tentaciones artesanales para endulzar momentos especiales',
    img: '/menu-postres.jpg',
    promocion: {
      id: 'promo_postre',
      nombre: 'Dúo Tentación: 2 Postres de Autor + 2 Cafés Express',
      desc: 'Elige dos postres artesanales para compartir con café espresso o americano caliente.',
      precio: 36.00,
      badge: 'DULCE EXPERIENCIA'
    },
    items: [
      { id: 'po1', nombre: 'Volcán de Chocolate Belga con Gelato', desc: 'Bizcocho tibio de chocolate fundido en su interior servido con helado artesanal de vainilla.', precio: 26.00 },
      { id: 'po2', nombre: 'Fresas Bañadas en Chocolate Belga', desc: 'Fresas frescas de huerto cubiertas de fino chocolate semiamargo y blanco con toques de menta.', precio: 28.00 },
      { id: 'po3', nombre: 'Suspiro Limeño Tradicional', desc: 'Manjar blanco de olla suave perfumado con oporto y merengue tostado a la canela.', precio: 20.00 },
      { id: 'po4', nombre: 'Cheesecake de Frutos Rojos', desc: 'Base crocante de galleta con crema de queso suave y jalea artesanal de arándanos y fresas.', precio: 24.00 }
    ]
  },
  {
    id: 'cocteles',
    nombre: 'Cócteles de Autor',
    tagline: 'Mixología moderna y coctelería clásica preparada por nuestros bartenders',
    img: '/menu-cocteles.jpg',
    promocion: {
      id: 'promo_coctel',
      nombre: 'Promo 2x1: Cócteles de Autor Seleccionados',
      desc: 'Pide 2 cócteles de autor (Pisco Sour Catedral, Wimbledon Passion o Chilcano de la Casa) por precio especial.',
      precio: 42.00,
      badge: '2X1 HAPPY NIGHT'
    },
    items: [
      { id: 'c1', nombre: 'Pisco Sour Catedral Wimbledon', desc: 'Pisco Quebranta premium, jugo de limón fresco, jarabe de goma y amargo de angostura.', precio: 28.00 },
      { id: 'c2', nombre: 'Wimbledon Passion (Cóctel de la Casa)', desc: 'Gin Bombay Sapphire, cordial de maracuyá, licor de flor de saúco y tónica premium.', precio: 32.00 },
      { id: 'c3', nombre: 'Chilcano de Frutos Rojos o Macerado', desc: 'Pisco macerado en frutos del bosque con ginger ale y rodaja de limón Tahití.', precio: 25.00 },
      { id: 'c4', nombre: 'Gin Tonic Premium con Botánicos', desc: 'Gin Hendrick\'s infusionado con rodajas de pepino, pimienta rosa y agua tónica aromatizada.', precio: 34.00 },
      { id: 'c5', nombre: 'Mojito Cubano con Ron Añejo', desc: 'Ron Havana Club, hierbabuena fresca, azúcar rubia, limón y toque de soda burbujeante.', precio: 26.00 }
    ]
  },
  {
    id: 'vinos',
    nombre: 'Espumantes y Vinos',
    tagline: 'Cava selecta de etiquetas peruanas, argentinas y champagnes franceses',
    img: '/menu-vinos.jpg',
    promocion: {
      id: 'promo_vino',
      nombre: 'Pack Brindis: Chandon Extra Brut + Copa de Fresas con Chocolate',
      desc: 'Botella fría de Chandon Extra Brut (750ml) con copa de fresas frescas para brindar.',
      precio: 125.00,
      badge: 'CELEBRACIÓN PRIVADA'
    },
    items: [
      { id: 'v1', nombre: 'Chandon Extra Brut (750ml)', desc: 'Espumante fresco y elegante de viñedos mendocinos con finas burbujas doradas.', precio: 120.00 },
      { id: 'v2', nombre: 'Riccadonna Asti D.O.C.G. (750ml)', desc: 'Espumante italiano dulce y aromático elaborado con uvas Moscatel de primera calidad.', precio: 98.00 },
      { id: 'v3', nombre: 'Navarro Correas Malbec (750ml)', desc: 'Vino tinto de cuerpo medio con aromas a ciruela madura, mora y sutil toque de roble.', precio: 85.00 },
      { id: 'v4', nombre: 'Casillero del Diablo Sauvignon Blanc (750ml)', desc: 'Vino blanco chileno fresco con notas cítricas y balanceada acidez.', precio: 78.00 },
      { id: 'v5', nombre: 'Moët & Chandon Brut Impérial (750ml)', desc: 'Champagne francés de prestigio mundial servido a la temperatura perfecta en cubitera.', precio: 390.00 }
    ]
  },
  {
    id: 'desayunos',
    nombre: 'Desayunos a la Suite',
    tagline: 'Comienza tu mañana con la mejor energía servida en la comodidad de tu cama',
    img: '/menu-desayunos.jpg',
    promocion: {
      id: 'promo_desayuno',
      nombre: 'Desayuno en la Cama para Dos Especial',
      desc: '2 desayunos completos a elección (americano o criollo) servidos a la hora que indiques en tu suite.',
      precio: 48.00,
      badge: 'MAÑANA PERFECTA'
    },
    items: [
      { id: 'd1', nombre: 'Desayuno Americano Wimbledon', desc: 'Huevos revueltos con tocino ahumado, pan tostado artesanal, mantequilla, mermelada, jugo de naranja y café.', precio: 28.00 },
      { id: 'd2', nombre: 'Desayuno Continental Clásico', desc: 'Cesta de panes calientes, queso fresco, jamón de pavita, frutas de estación picadas, jugo y café.', precio: 24.00 },
      { id: 'd3', nombre: 'Desayuno Criollo Tradicional', desc: 'Tamalito criollo, chicharrón de cerdo jugoso, camote frito, salsa criolla, pan francés y café pasado.', precio: 36.00 }
    ]
  }
];

/* ---------- DATOS EDITABLES DE HABITACIONES Y OFERTAS ---------- */
const tipoDe = (nombre) => /presidencial/i.test(nombre) ? 'Presidencial' : /simple/i.test(nombre) ? 'Simple' : /delux/i.test(nombre) ? 'Delux' : 'Suite';
const tiposHabitaciones = HABITACIONES_REALES.map((h, index) => ({
  id: h.id,
  piso: (index % 3) + 1,
  numero: String(h.id),
  tipo: tipoDe(h.nombre),
  nombre: h.nombre,
  desc: `Incluye: ${h.equipamiento.join(', ')}.`,
  intro: h.intro,
  equipamiento: h.equipamiento,
  duracion: h.duracion,
  desde: `S/ ${Number(h.precio_exacto.replace(/[^\d.]/g, '')).toFixed(2)}`,
  precioExacto: h.precio_exacto,
  img: h.imagen_url,
}));

const ofertas = [
  { id: 'sanvalentin', etiqueta: 'Festividad', nombre: 'San Valentín Inolvidable', precio: 'S/ 299', valor: 299, desc: 'Suite decorada con pétalos, espumante, fresas con chocolate y late check-out.', img: '/oferta-sanvalentin.jpg' },
  { id: 'halloween', etiqueta: 'Festividad', nombre: 'Noche de Halloween', precio: 'S/ 220', valor: 220, desc: 'Suite temática, cócteles de temporada y sorpresas ambientadas para dos.', img: '/oferta-halloween.jpg' },
  { id: 'navidad', etiqueta: 'Festividad', nombre: 'Navidad Privada', precio: 'S/ 280', valor: 280, desc: 'Cena navideña para dos en tu suite con brindis de medianoche.', img: '/oferta-navidad.jpg' },
  { id: 'anonuevo', etiqueta: 'Festividad', nombre: 'Año Nuevo Wimbledon', precio: 'S/ 350', valor: 350, desc: 'Pernocte, botella de espumante y desayuno de bienvenida al nuevo año.', img: '/oferta-anonuevo.jpg' },
  { id: 'aniversario', etiqueta: 'Aniversario', nombre: 'Paquete Aniversario', precio: 'S/ 320', valor: 320, desc: 'Decoración romántica, torta personalizada, vino y fotografía instantánea.', img: '/oferta-aniversario.jpg' },
  { id: 'semana', etiqueta: 'Promoción', nombre: 'Promo Entre Semana', precio: 'S/ 99', valor: 99, desc: 'De lunes a jueves, bloque de 6 horas con cóctel de cortesía.', img: '/oferta-semana.jpg' }
];

const servicios = [
  { icono: '24h', titulo: 'Atención 24 horas', desc: 'Recepción y room service todos los días del año.' },
  { icono: 'P', titulo: 'Cochera directa', desc: 'Estacionamiento con acceso directo a algunas suites.' },
  { icono: 'Wi', titulo: 'Wifi de alta velocidad', desc: 'Conexión gratuita en todas las habitaciones.' },
  { icono: '✦', titulo: 'Check-in automatizado', desc: 'Ingreso con código QR, sin filas ni esperas.' },
  { icono: '◐', titulo: 'Privacidad total', desc: 'Accesos discretos y servicio sin contacto.' },
  { icono: '♨', titulo: 'Jacuzzi y sauna', desc: 'Suites con spa privado para relajarte.' }
];

const detalles = [
  { titulo: 'Horarios', texto: 'Bloques de 6 y 7 horas, y pernocte. Consulta disponibilidad según el día.' },
  { titulo: 'Reservas', texto: 'Confirma tu suite en línea y recibe tu boleta electrónica con código QR.' },
  { titulo: 'Medios de pago', texto: 'Efectivo, tarjetas Visa y Mastercard, Yape y Plin.' },
  { titulo: 'Documento', texto: 'Se requiere DNI o documento de identidad vigente, mayores de 18 años.' }
];

const preguntas = [
  { q: '¿Cómo funciona el check-in automatizado?', a: 'Al reservar recibes un código QR en tu boleta electrónica. Lo escaneas en el ingreso y accedes a tu suite sin pasar por recepción.' },
  { q: '¿Qué bloques de tiempo ofrecen?', a: 'Contamos con bloques de 6 horas, 12 horas y pernocte completo. Las tarifas varían según la suite seleccionada.' },
  { q: '¿Puedo pedir comida y bebidas a la habitación?', a: 'Sí. Nuestra carta completa está disponible las 24 horas y se entrega de forma rápida y discreta en tu suite.' },
  { q: '¿Tienen estacionamiento?', a: 'Sí, contamos con estacionamiento vigilado y algunas suites tienen cochera directa privada a la habitación.' },
  { q: '¿Cómo reservo un paquete por festividad?', a: 'Elige el paquete en la sección de ofertas y pulsa "Reservar paquete". Te redirige al formulario y se desglosa en tu boleta.' },
  { q: '¿Cuál es la política de cancelación?', a: 'Puedes reprogramar tu reserva sin costo hasta 24 horas antes comunicándote a nuestro WhatsApp.' }
];

function Img({ src, alt }) {
  const [error, setError] = useState(false);
  return error ? (
    <div className="img-fallback" role="img" aria-label={alt}><span>{alt}</span></div>
  ) : (
    <img src={src} alt={alt} loading="lazy" onError={() => setError(true)} />
  );
}

const PANEL_BY_ROL = { ADMINISTRADOR: 'ADMIN', SUPER_ADMIN: 'ADMIN', RECEPCIONISTA: 'RECEPCION', LIMPIEZA: 'LIMPIEZA' };
const HASH_BY_PANEL = { ADMIN: '#admin', RECEPCION: '#recepcion', LIMPIEZA: '#limpieza' };
const PANEL_BY_HASH = { admin: 'ADMIN', recepcion: 'RECEPCION', reception: 'RECEPCION', limpieza: 'LIMPIEZA', housekeeping: 'LIMPIEZA' };

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  // Sesión: el usuario y su rol vienen del backend (nunca se eligen en la interfaz)
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const authUserRef = useRef(null);
  authUserRef.current = authUser;
  const panel = authUser ? PANEL_BY_ROL[authUser.rol] : null;
  setPermisoReservas(panel === 'ADMIN' || panel === 'RECEPCION'); // antes de que corran los efectos de carga
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Sincronización Central de Habitaciones y Reservas (Compartido entre Landing y Dashboards)
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);

  // Estados de Modales
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [reservaAValidar, setReservaAValidar] = useState(null);

  // Parámetros de Reserva Dinámicos
  const [bookingRoom, setBookingRoom] = useState(null);
  const [bookingPackage, setBookingPackage] = useState(null);
  const [bookingRate, setBookingRate] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingAddons, setBookingAddons] = useState([]);

  // Categoría seleccionada para desplegar carta
  const [selectedMenuCategory, setSelectedMenuCategory] = useState(MENU_CATEGORIES_DATA[0]);

  // Última reserva creada (para renderizar la Boleta de Pago)
  const [latestReservation, setLatestReservation] = useState(null);

  // UI Landing
  const [isSticky, setIsSticky] = useState(false);
  const [verTodasHab, setVerTodasHab] = useState(false);
const [contenidoHabitacionActivo, setContenidoHabitacionActivo] = useState(null);
  const [faqAbierta, setFaqAbierta] = useState(0);
  const [calendarioActivo, setCalendarioActivo] = useState(null);
  const [diaSeleccionadoCal, setDiaSeleccionadoCal] = useState(null);

  // Datos del backend en vivo (carga inicial + refresco cada 10 s)
  useLiveSync(setRooms, setReservations);

  // Restaurar sesión al cargar y reaccionar a sesión vencida
  useEffect(() => {
    api.me().then((u) => { if (u) setAuthUser(u); setAuthChecked(true); });
    const onExpired = () => {
      if (!authUserRef.current) return;
      setAuthUser(null);
      setCurrentView('landing');
      window.location.hash = '';
      setLoginError('Tu sesión expiró. Inicia sesión nuevamente.');
      setIsLoginModalOpen(true);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  // Al cambiar de sesión, recargar de inmediato lo que el nuevo rol puede ver
  useEffect(() => {
    if (panel) api.syncAll(setRooms, setReservations);
  }, [panel]);

  // Navegación por hash: un panel solo se abre con sesión y únicamente el del rol del usuario
  useEffect(() => {
    if (!authChecked) return;
    const apply = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      const hashPanel = PANEL_BY_HASH[hash];
      const user = authUserRef.current; // el ref evita leer una sesión desactualizada
      const userPanel = user ? PANEL_BY_ROL[user.rol] : null;
      if (user) {
        if (hashPanel && hashPanel !== userPanel) { window.location.hash = HASH_BY_PANEL[userPanel]; return; }
        setCurrentView(hashPanel ? 'dashboard' : 'landing');
      } else {
        setCurrentView('landing');
        if (hashPanel) { window.location.hash = ''; setIsLoginModalOpen(true); }
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, [authUser, authChecked, panel]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Botón "Panel Empleados": con sesión va a su panel; sin sesión pide credenciales
  const handleOpenStaffPortal = () => {
    if (authUser) window.location.hash = HASH_BY_PANEL[panel];
    else { setLoginError(''); setIsLoginModalOpen(true); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const u = await api.login(loginEmail, loginPassword);
      authUserRef.current = u; // disponible al instante para el manejador del hash
      setAuthUser(u);
      setLoginPassword('');
      setIsLoginModalOpen(false);
      setCurrentView('dashboard');
      window.location.hash = HASH_BY_PANEL[PANEL_BY_ROL[u.rol]];
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    authUserRef.current = null;
    setAuthUser(null);
    setReservations(INITIAL_RESERVATIONS);
    setCurrentView('landing');
    window.location.hash = '';
  };

  const handleReturnToLanding = () => {
    setCurrentView('landing');
    window.location.hash = '';
  };

  // Abrir Formulario de Reserva desde una habitación específica o tarifa
  const handleOpenBooking = ({ room = null, rate = null, date = null, pkg = null, addons = [] }) => {
    setBookingRoom(room);
    setBookingRate(rate);
    setBookingDate(date);
    setBookingPackage(pkg);
    setBookingAddons(addons);
    setIsBookingModalOpen(true);
  };

  // Abrir Despliegue de la Carta
  const handleOpenMenuCategory = (category) => {
    const fullCat = MENU_CATEGORIES_DATA.find(c => c.id === category.id || c.nombre === category.nombre) || category;
    setSelectedMenuCategory(fullCat);
    setIsMenuModalOpen(true);
  };

  // Manejar cuando agregan un combo/plato desde el modal de la carta
  const handleSelectMenuPromoFromModal = (promo) => {
    setIsMenuModalOpen(false);
    handleOpenBooking({
      addons: [{ id: promo.id || 'promo', nombre: promo.nombre, precio: promo.precio }]
    });
  };

  // Confirmar y Guardar Reserva en Base de Datos y Estado Central
  const handleConfirmBooking = async (formData) => {
    // Guardar vía API (conecta a POST /api/v1/reservas o fallback local)
    let nuevaReserva;
    try {
      nuevaReserva = await api.createReserva(formData);
    } catch (e) {
      // Rechazada por el backend (p. ej. solapamiento): se mantiene el formulario abierto
      alert(e.message);
      api.syncAll(setRooms, setReservations);
      return;
    }
    setIsBookingModalOpen(false);

    // Agregar de inmediato a la lista reactiva de reservas
    setReservations(prev => [nuevaReserva, ...prev]);

    // La habitación deja de estar disponible mientras la reserva esté vigente
    setRooms(prevRooms => prevRooms.map(r => {
      if (String(r.numero) === String(formData.habitacion) && r.estado === 'DISPONIBLE') {
        return { ...r, estado: 'RESERVADA' };
      }
      return r;
    }));
    api.syncAll(setRooms, setReservations);

    // Abrir de inmediato la Boleta de Pago oficial
    setLatestReservation({
      ...nuevaReserva,
      boletaNum: `B001-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      paqueteFestividad: formData.paqueteFestividad,
      itemsCarta: formData.itemsCarta,
      tarifaBase: formData.tarifaBase,
      bloque: formData.bloque,
      documento: formData.documento,
      metodoPago: formData.metodoPago,
      numeroOperacion: formData.numeroOperacion
    });
    setIsReceiptModalOpen(true);
  };

  const handleValidateCheckInLanding = (resId, details) => {
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, estado: 'En Habitación' } : r));
    setRooms(prev => prev.map(room => {
      const target = reservations.find(r => r.id === resId);
      if (target && String(room.numero) === String(target.habitacion)) {
        return { ...room, estado: 'OCUPADA' };
      }
      return room;
    }));
    if (latestReservation && latestReservation.id === resId) {
      setLatestReservation(prev => ({ ...prev, estado: 'En Habitación' }));
    }
  };

  // Si estamos en el portal de empleados, renderizamos el Dashboard correspondiente con estado sincronizado
  if (!authChecked) return null;

  if (currentView === 'dashboard' && authUser) {
    return (
      <DashboardContainer 
        initialRole={panel} 
        user={authUser}
        onLogout={handleLogout}
        onGoToLanding={handleReturnToLanding}
        rooms={rooms}
        setRooms={setRooms}
        reservations={reservations}
        setReservations={setReservations}
      />
    );
  }

  return (
    <div className="hotel-container">
      <EfectosNavidad />
      {/* NAVBAR */}
      <header className="navbar">
        <div 
          className="logo-brand" 
          onClick={handleReturnToLanding}
          style={{ cursor: 'pointer' }}
          title="Hotel Wimbledon - Volver al Inicio"
        >
          WIMBLEDON
        </div>
        <nav className="nav-menu">
          <a href="#" className="nav-item active">Información general</a>
          <a href="#galeria" className="nav-item">Galería</a>
          <a href="#habitaciones" className="nav-item">Alojamientos</a>
          <a href="#carta" className="nav-item">Carta</a>
          <a href="#ofertas" className="nav-item">Ofertas</a>
          <a href="#servicios" className="nav-item">Servicios</a>
          <a href="#ubicacion" className="nav-item">Ubicación</a>
          <a href="#soporte" className="nav-item" onClick={(e) => { e.preventDefault(); setIsSupportModalOpen(true); }}>Soporte</a>
          <a href="#faq" className="nav-item">Preguntas</a>
        </nav>
        <button 
          className="btn-panel-login"
          onClick={handleOpenStaffPortal}
          style={{ cursor: 'pointer' }}
        >
          {authUser ? 'Mi panel' : 'Panel Empleados'}
        </button>
      </header>

      {/* HERO HERO-VIEWPORT (Fotografía Real Sin Texto Colisionado) */}
      <section className="hero-viewport">
        <div className="hero-background-carousel">
          <div className="hero-slide" style={{ backgroundImage: `url('/hero-bg.jpg')` }}></div>
        </div>
        <div className="hero-text-overlay">
          <span className="hero-gold-badge">HOTEL &amp; SUITES DE LUJO · SAN MIGUEL, LIMA</span>
          <h1 className="hotel-title">The Wimbledon Lima Hotel &amp; Suites</h1>
          <p className="hotel-subtitle">Discreción absoluta, máximo confort y automatización en el corazón de San Miguel</p>
        </div>
      </section>

      {/* BARRA DE RESERVA RÁPIDA INICIAL */}
      <div className={`booking-bar-wrapper ${isSticky ? 'sticky-active' : ''}`}>
        <div className="booking-bar-form">
          <div className="booking-field">
            <span className="field-title">Destino</span>
            <span className="field-value">San Miguel, Lima, Perú</span>
          </div>
          <div className="booking-field">
            <span className="field-title">Propuesta</span>
            <span className="field-value">Intimidad, Lujo y Confort</span>
          </div>
          <button 
            className="btn-action-rates" 
            onClick={() => handleOpenBooking({})}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={16} /> Reservar Ahora
          </button>
        </div>
      </div>

      {/* 1. GALERÍA DE IMÁGENES DEL HOTEL */}
      <section className="gallery-section" id="galeria">
        <span className="section-tagline">NUESTROS AMBIENTES</span>
        <div className="gallery-grid">
          <div className="gallery-item"><img src="/galeria1.jpg" alt="Ambiente 1" /></div>
          <div className="gallery-item"><img src="/galeria2.jpg" alt="Ambiente 2" /></div>
          <div className="gallery-item"><img src="/galeria3.jpg" alt="Ambiente 3" /></div>
          <div className="gallery-item"><img src="/galeria4.jpg" alt="Ambiente 4" /></div>
        </div>
      </section>

      {/* 2. BIENVENIDA */}
      <section className="welcome-section">
        <div className="welcome-content">
          <h2>Un Refugio Exclusivo Hecho Para Ti</h2>
          <p>En el Hotel Wimbledon rediseñamos el concepto de descanso. Un espacio sofisticado donde el lujo discreto y la tranquilidad absoluta se fusionan para regalarte momentos memorables e ininterrumpidos en cada visita.</p>
        </div>
      </section>

      {/* 3. DESCRIPCIÓN DEL HOTEL */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-image">
            <img src="/descripcion-hotel.jpg" alt="Instalaciones del Hotel" />
          </div>
          <div className="about-text">
            <span className="section-tagline">Wimbledon</span>
            <h3>Automatización y Privacidad</h3>
            <p>Hotel Wimbledon fusiona lo tradicional y lo imaginativo a través de sus más de 130 habitaciones. Contamos con habitaciones de lujo, habitaciones temáticas, servicio las 24 horas, estacionamiento directo a algunas habitaciones, Wifi de fibra óptica, y nuestra carta de comidas y bebidas que complementan tu apasionada estadía.
            Ofrecemos calidad de servicio que permiten a nuestros clientes pasar momentos apasionados e inolvidables en nuestras instalaciones con una vista privilegiada al mar.</p>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN HABITACIONES CON CALENDARIO INTERACTIVO Y ELECCIÓN DE TARIFAS */}
      <section className="rooms-custom-section" id="habitaciones">
        <div className="section-header-text">
          <span className="section-tagline">ALOJAMIENTOS DISPONIBLES</span>
          <h2>Selecciona tu Suite y Tarifa</h2>
          <p className="section-subtitle">Elige la modalidad que prefieras: 6 horas, 12 horas o pernocte completo con reserva inmediata.</p>
        </div>

        <div className="rooms-compact-list">
          {tiposHabitaciones.slice(0, 3).map((room) => (
            <div key={room.id} className="room-row-item">
              <div className="room-left-side">
                <div className="room-compact-img-box">
                  <img src={room.img} alt={room.nombre} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{room.nombre}</h3>
                  <span style={{ fontSize: '12px', color: '#D4AF37', fontWeight: 600 }}>{room.desde}</span>
                </div>
              </div>
              <div className="room-right-side" style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-view-rates-compact" 
                  onClick={() => setCalendarioActivo(calendarioActivo === room.id ? null : room.id)}
                >
                  {calendarioActivo === room.id ? 'Ocultar tarifas' : 'Ver las tarifas y fechas'}
                </button>
                <button 
                  className="btn-solid-gold"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderRadius: '2px' }}
                  onClick={() => handleOpenBooking({ room })}
                >
                  Reservar Suite
                </button>
              </div>

              {calendarioActivo === room.id && (<RoomRatesPanel room={room} selectedDate={diaSeleccionadoCal} onSelectDate={setDiaSeleccionadoCal} onBook={handleOpenBooking} />)}
            </div>
          ))}
        </div>
      </section>

      {/* BOTÓN: VER TODOS LOS TIPOS DE HABITACIONES */}
      <div className="view-rooms-container">
        <button className="btn-outline-gold" onClick={() => setVerTodasHab(!verTodasHab)} aria-expanded={verTodasHab}>
          {verTodasHab ? 'Ocultar tipos de habitaciones' : 'Ver todos los tipos de habitaciones'}
        </button>

        {verTodasHab && (
          <div className="menu-grid max-container rooms-grid" style={{ marginTop: '2rem' }}>
            {tiposHabitaciones.map((t) => (
              <article key={t.id} className="menu-card room-card">
                <div className="media"><Img src={t.img} alt={t.nombre} /></div>
                <div className="menu-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
                    <span style={{
                     display: 'block',
                     fontSize: '10px',
                     color: '#D4AF37',
                     letterSpacing: '1px',
                     fontWeight: 600,
                     marginBottom: '5px'
}}>
  PISO {t.piso}
</span>
                    <h3 className="card-title" style={{ margin: 0 }}>{t.nombre}</h3>
                    <span className="price-tag">Desde {t.precioExacto}</span>
                  </div>
                  <p className="card-desc">{t.intro}</p>
                  <div className="room-preview">
                    <span className="room-preview-label">Incluye</span>
                    <span className="room-preview-items">
                      {t.equipamiento.slice(0, 3).join(' · ')}{t.equipamiento.length > 3 ? ' · Y más' : ''}
                    </span>
                  </div>

                  <div className="room-action-row">
                    <button
                      className="btn-view-rates-compact"
                      aria-expanded={calendarioActivo === t.id}
                      onClick={() => setCalendarioActivo(calendarioActivo === t.id ? null : t.id)}
                    >
                      {calendarioActivo === t.id ? 'Ocultar tarifas' : 'Ver las tarifas y fechas'}
                    </button>
                    <button
                      className="btn-solid-gold"
                      onClick={() => handleOpenBooking({ room: t })}
                    >
                      Reservar Suite
                    </button>
                  </div>

                  {calendarioActivo === t.id && (
                    <RoomRatesPanel
                      room={t}
                      selectedDate={diaSeleccionadoCal}
                      onSelectDate={setDiaSeleccionadoCal}
                      onBook={handleOpenBooking}
                    />
                  )}

                  <button
                    className="btn-menu-expand"
                    aria-expanded={contenidoHabitacionActivo === t.id}
                    onClick={() => setContenidoHabitacionActivo(contenidoHabitacionActivo === t.id ? null : t.id)}
                  >
                    {contenidoHabitacionActivo === t.id ? 'Ocultar contenido' : 'Desplegar contenido'} {contenidoHabitacionActivo === t.id ? '↑' : '↓'}
                  </button>

                  {contenidoHabitacionActivo === t.id && (
                    <div className="room-content-panel">
                      <h4>Qué contiene</h4>
                      <ul className="room-content-list">
                        {t.equipamiento.map((item, index) => (
                          <li key={`${t.id}-${index}`}>{item}</li>
                        ))}
                      </ul>
                      <div className="room-content-meta">
                        <span>{t.duracion.replace(/[()]/g, '')}</span>
                        <span>IGV incluido</span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* CARTA DEL MENÚ (CON OPCIÓN DE DESPLIEGUE Y PROMOCIONES) */}
      <section className="menu-section" id="carta">
        <div className="max-container">
          <span className="section-tagline">EXPERIENCIA CULINARIA</span>
          <h2 className="section-title">Carta del Menú y Promociones</h2>
          <p className="section-subtitle">
            Sabores exclusivos para compartir en privado. Pulsa en cualquier concepto para desplegar todas sus promociones, cócteles y platos disponibles para tu reserva.
          </p>

          <div className="menu-grid">
            {MENU_CATEGORIES_DATA.map((c) => (
              <article key={c.id} className="menu-card" style={{ cursor: 'pointer' }} onClick={() => handleOpenMenuCategory(c)}>
                <div className="media"><Img src={c.img} alt={c.nombre} /></div>
                <div className="menu-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <h3 className="card-title" style={{ margin: 0 }}>{c.nombre}</h3>
                    <span className="price-tag">Promo: S/ {c.promocion.precio}</span>
                  </div>
                  <p className="card-desc">{c.tagline}</p>
                  <button 
                    className="btn-menu-expand"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMenuCategory(c);
                    }}
                  >
                    Desplegar carta y promociones →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTAS Y PAQUETES (FESTIVIDADES Y ANIVERSARIOS) */}
      <section className="offers-section" id="ofertas">
        <div className="max-container">
          <div className="section-header-text">
            <span className="section-tagline">OFERTAS Y PAQUETES</span>
            <h2 className="section-title">Festividades, aniversarios y promociones</h2>
            <p className="section-subtitle">Celebra cada fecha especial con paquetes pensados para dos. Al reservar se itemizará en tu boleta oficial.</p>
          </div>

          <div className="offers-grid">
            {ofertas.map((o) => (
              <article key={o.id} className="offer-card">
                <div className="media offer-media">
                  <Img src={o.img} alt={o.nombre} />
                  <span className="offer-badge">{o.etiqueta}</span>
                </div>
                <div className="offer-body">
                  <div className="offer-header">
                    <h3 className="offer-title">{o.nombre}</h3>
                    <span className="offer-price">{o.precio}</span>
                  </div>
                  <p className="offer-desc">{o.desc}</p>
                  <button 
                    className="btn-link-gold" 
                    onClick={() => handleOpenBooking({ pkg: { id: o.id, nombre: o.nombre, precio: o.valor } })}
                  >
                    Reservar paquete →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS DESTACADOS */}
      <section className="services-section" id="servicios">
        <div className="max-container">
          <span className="section-tagline">COMODIDADES</span>
          <h2 className="section-title">Servicios Destacados</h2>
          <div className="services-grid">
            {servicios.map((sv) => (
              <div key={sv.titulo} className="service-card">
                <span className="service-icon" aria-hidden="true">{sv.icono}</span>
                <h3>{sv.titulo}</h3>
                <p>{sv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}
      <section className="location-section" id="ubicacion">
        <div className="location-grid">
          <div className="location-text">
            <span className="section-tagline">CÓMO LLEGAR</span>
            <h2 className="section-title">Ubicación</h2>
            <p>En el corazón de San Miguel, con acceso rápido desde las principales avenidas de Lima y una vista privilegiada al mar.</p>
            <div className="location-details">
              <p><strong>Dirección:</strong> Av. Costanera 1250, San Miguel, Lima, Perú</p>
              <p><strong>Atención:</strong> 24 horas, todos los días</p>
              <p><strong>Teléfono / WhatsApp:</strong> +51 987 654 321</p>
            </div>
            <a className="btn-outline-gold link-btn" href="https://www.google.com/maps/search/?api=1&query=San+Miguel+Lima+Peru" target="_blank" rel="noreferrer">Abrir en Google Maps</a>
          </div>
          <div className="map-frame">
            <iframe
              title="Mapa de ubicación del Hotel Wimbledon"
              src="https://www.google.com/maps?q=San+Miguel,+Lima,+Peru&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* DETALLES */}
      <section className="details-section" id="detalles">
        <div className="max-container">
          <span className="section-tagline">TODO LO QUE DEBES SABER</span>
          <h2 className="section-title">Detalles</h2>
          <div className="details-grid">
            {detalles.map((d) => (
              <div key={d.titulo} className="detail-item">
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section className="faq-section" id="faq">
        <div className="max-container">
          <span className="section-tagline faq-tag">AYUDA</span>
          <h2 className="section-title">Preguntas Frecuentes</h2>
          <div className="faq-container">
            {preguntas.map((p, i) => (
              <div key={p.q} className="faq-item">
                <button className="faq-trigger" onClick={() => setFaqAbierta(faqAbierta === i ? null : i)} aria-expanded={faqAbierta === i}>
                  <span>{p.q}</span>
                  <span className="faq-icon">{faqAbierta === i ? '−' : '+'}</span>
                </button>
                {faqAbierta === i && <p className="faq-content">{p.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PIE DE PÁGINA */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3 onClick={handleReturnToLanding} style={{ cursor: 'pointer' }}>WIMBLEDON</h3>
            <p>The Wimbledon Lima Hotel &amp; Suites · San Miguel, Lima</p>
            <p>© {new Date().getFullYear()} Hotel Wimbledon. Todos los derechos reservados.</p>
          </div>
          <nav className="footer-links" aria-label="Enlaces del pie de página">
            <a href="#habitaciones">Habitaciones</a>
            <a href="#carta">Carta</a>
            <a href="#ofertas">Ofertas</a>
            <a href="#soporte">Soporte</a>
            <a href="#ubicacion">Ubicación</a>
            <a href="#faq">Preguntas</a>
            <a href="#">Términos y condiciones</a>
            <a href="#">Privacidad</a>
          </nav>
        </div>
      </footer>

      {/* MODAL 1: FORMULARIO DE RESERVA INTERACTIVO */}
      {isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          rooms={rooms}
          initialRoom={bookingRoom}
          initialPackage={bookingPackage}
          initialRate={bookingRate}
          initialDate={bookingDate}
          initialAddons={bookingAddons}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* MODAL 2: BOLETA DE PAGO ELECTRÓNICA Y COMPROBANTE CON CÓDIGO QR */}
      {isReceiptModalOpen && latestReservation && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          reservation={latestReservation}
          onGoToRole={() => {
            setIsReceiptModalOpen(false);
            handleOpenStaffPortal();
          }}
          onOpenCheckInValidation={(res) => {
            setIsReceiptModalOpen(false);
            setReservaAValidar(res || latestReservation);
            setIsValidationModalOpen(true);
          }}
        />
      )}

      {/* MODAL VALIDACIÓN DE INGRESO (CHECK-IN SIN CONTACTO / GPS / TÓTEM) */}
      <CheckInValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => { setIsValidationModalOpen(false); setReservaAValidar(null); }}
        reservations={reservations}
        rooms={rooms}
        initialReservation={reservaAValidar || latestReservation}
        onValidateCheckIn={handleValidateCheckInLanding}
      />

      {/* MODAL Y BOTÓN FLOTANTE: SOPORTE DE HABITACIONES */}
      <FloatingSupportModal
        isOpen={isSupportModalOpen}
        setIsOpen={setIsSupportModalOpen}
        rooms={rooms}
      />

      {/* MODAL 3: DESPLIEGUE COMPLETO DE CARTA DEL MENÚ Y PROMOCIONES */}
      {isMenuModalOpen && selectedMenuCategory && (
        <MenuDetailModal
          isOpen={isMenuModalOpen}
          onClose={() => setIsMenuModalOpen(false)}
          categoryData={selectedMenuCategory}
          allCategories={MENU_CATEGORIES_DATA}
          onSelectPromotion={handleSelectMenuPromoFromModal}
          onSelectItem={(item) => {
            setIsMenuModalOpen(false);
            handleOpenBooking({
              addons: [{ id: item.id, nombre: item.nombre, precio: item.precio }]
            });
          }}
        />
      )}

      {/* MODAL 4: INICIO DE SESIÓN (el rol lo determina el backend) */}
      {isLoginModalOpen && (
        <div className="login-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="login-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="login-close" onClick={() => setIsLoginModalOpen(false)} aria-label="Cerrar">
              <X size={18} />
            </button>

            <div className="login-brand">
              <div>
                <img src="/logo.svg" alt="Hotel Wimbledon" />
                <h2>Hotel Wimbledon</h2>
                <p>Portal interno del personal para gestionar reservas, habitaciones y operaciones del hotel.</p>
                <div className="login-roles">
                  <span>Administración</span>
                  <span>Recepción</span>
                  <span>Limpieza</span>
                </div>
              </div>
              <small>Acceso exclusivo para personal autorizado</small>
            </div>

            <form className="login-form-side" onSubmit={handleLogin}>
              <h3>Bienvenido</h3>
              <p className="login-sub">Ingresa con tu correo y contraseña</p>

              <div className="login-field">
                <label htmlFor="login-email">Correo electrónico</label>
                <div className="login-input-wrap">
                  <Mail size={18} className="login-ico" />
                  <input id="login-email" type="email" required autoFocus autoComplete="username"
                    placeholder="usuario@hotel.com" value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Contraseña</label>
                <div className="login-input-wrap">
                  <Lock size={18} className="login-ico" />
                  <input id="login-password" type={showLoginPassword ? 'text' : 'password'} required
                    autoComplete="current-password" placeholder="••••••••" value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)} />
                  <button type="button" className="login-eye" tabIndex={-1}
                    onClick={() => setShowLoginPassword((v) => !v)}
                    aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="login-error" role="alert">
                  <CircleAlert size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <button type="submit" className="login-submit" disabled={loginLoading}>
                {loginLoading ? (<><LoaderCircle size={18} className="login-spin" /> Ingresando...</>) : 'Iniciar sesión'}
              </button>

              <p className="login-foot"><ShieldCheck size={14} /> Conexión protegida · tu rol se asigna automáticamente</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

