import React, { useState, useEffect } from 'react';
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
  CheckCircle2 
} from 'lucide-react';
import { INITIAL_ROOMS, INITIAL_RESERVATIONS, api } from './services/api';
import BookingModal from './components/modals/BookingModal';
import ReceiptModal from './components/modals/ReceiptModal';
import MenuDetailModal from './components/modals/MenuDetailModal';
import EfectosNavidad from './components/common/EfectosNavidad';
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
const tiposHabitaciones = HABITACIONES_REALES.map((h) => ({
  id: h.id,
  numero: String(h.id),
  tipo: tipoDe(h.nombre),
  nombre: h.nombre,
  desc: `Incluye: ${h.equipamiento.join(', ')}.`,
  desde: `S/ ${Number(h.precio_exacto.replace(/[^\d.]/g, '')).toFixed(2)}`,
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

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [activeRole, setActiveRole] = useState('ADMIN'); // 'ADMIN' | 'RECEPCION' | 'LIMPIEZA'
  
  // Sincronización Central de Habitaciones y Reservas (Compartido entre Landing y Dashboards)
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);

  // Estados de Modales
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

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
  const [faqAbierta, setFaqAbierta] = useState(0);
  const [calendarioActivo, setCalendarioActivo] = useState(null);
  const [diaSeleccionadoCal, setDiaSeleccionadoCal] = useState(null);

  // Cargar datos iniciales del backend si está encendido
  useEffect(() => {
    async function initData() {
      const dbRooms = await api.getHabitaciones();
      if (dbRooms && dbRooms.length > 0) setRooms(dbRooms);

      const dbRes = await api.getReservas();
      if (dbRes && dbRes.length > 0) setReservations(dbRes);
    }
    initData();
  }, []);

  // Soporte directo para hash en la URL (ej: localhost:5173/#admin o /#recepcion)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (hash === 'admin') {
        setActiveRole('ADMIN');
        setCurrentView('dashboard');
      } else if (hash === 'recepcion' || hash === 'reception') {
        setActiveRole('RECEPCION');
        setCurrentView('dashboard');
      } else if (hash === 'limpieza' || hash === 'housekeeping') {
        setActiveRole('LIMPIEZA');
        setCurrentView('dashboard');
      } else if (hash === 'web' || hash === '') {
        setCurrentView('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEnterStaffPortal = (role) => {
    setActiveRole(role);
    setCurrentView('dashboard');
    setIsLoginModalOpen(false);
    if (role === 'ADMIN') window.location.hash = '#admin';
    else if (role === 'RECEPCION') window.location.hash = '#recepcion';
    else if (role === 'LIMPIEZA') window.location.hash = '#limpieza';
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
    setIsBookingModalOpen(false);

    // Guardar vía API (conecta a POST /api/v1/reservas o fallback local)
    const nuevaReserva = await api.createReserva(formData);

    // Agregar de inmediato a la lista reactiva de reservas
    setReservations(prev => [nuevaReserva, ...prev]);

    // Marcar habitación como OCUPADA si estaba disponible
    setRooms(prevRooms => prevRooms.map(r => {
      if (String(r.numero) === String(formData.habitacion)) {
        return { ...r, estado: 'OCUPADA' };
      }
      return r;
    }));

    // Abrir de inmediato la Boleta de Pago oficial
    setLatestReservation({
      ...nuevaReserva,
      boletaNum: `B001-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      paqueteFestividad: formData.paqueteFestividad,
      itemsCarta: formData.itemsCarta,
      tarifaBase: formData.tarifaBase,
      bloque: formData.bloque,
      documento: formData.documento
    });
    setIsReceiptModalOpen(true);
  };

  // Si estamos en el portal de empleados, renderizamos el Dashboard correspondiente con estado sincronizado
  if (currentView === 'dashboard') {
    return (
      <DashboardContainer 
        initialRole={activeRole} 
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
          <a href="#faq" className="nav-item">Preguntas</a>
        </nav>
        <button 
          className="btn-panel-login"
          onClick={() => setIsLoginModalOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          Panel Empleados
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

              {calendarioActivo === room.id && (
                <div className="calendar-dropdown-box">
                  <div className="calendars-flex-container">
                    <div className="month-box">
                      <h4>Octubre 2026</h4>
                      <div className="calendar-grid-header">
                        <span>Do</span><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span>
                      </div>
                      <div className="calendar-days-grid">
                        <span></span><span></span><span></span><span></span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('01/10/2026')}>1</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('02/10/2026')}>2</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('03/10/2026')}>3</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('04/10/2026')}>4</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('05/10/2026')}>5</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('06/10/2026')}>6</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('07/10/2026')}>7</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('08/10/2026')}>8</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('09/10/2026')}>9</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('10/10/2026')}>10</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('11/10/2026')}>11</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('12/10/2026')}>12</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('13/10/2026')}>13</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('14/10/2026')}>14</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('15/10/2026')}>15</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('16/10/2026')}>16</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('17/10/2026')}>17</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('18/10/2026')}>18</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('19/10/2026')}>19</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('20/10/2026')}>20</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('21/10/2026')}>21</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('22/10/2026')}>22</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('23/10/2026')}>23</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('24/10/2026')}>24</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('25/10/2026')}>25</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('26/10/2026')}>26</span>
                        <span className="day today" onClick={() => setDiaSeleccionadoCal('29/10/2026')}>29</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('30/10/2026')}>30</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('31/10/2026')}>31</span>
                      </div>
                    </div>

                    <div className="month-box">
                      <h4>Noviembre 2026</h4>
                      <div className="calendar-grid-header">
                        <span>Do</span><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span>
                      </div>
                      <div className="calendar-days-grid">
                        <span className="day" onClick={() => setDiaSeleccionadoCal('01/11/2026')}>1</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('02/11/2026')}>2</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('03/11/2026')}>3</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('04/11/2026')}>4</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('05/11/2026')}>5</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('06/11/2026')}>6</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('07/11/2026')}>7</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('08/11/2026')}>8</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('09/11/2026')}>9</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('10/11/2026')}>10</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('11/11/2026')}>11</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('12/11/2026')}>12</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('13/11/2026')}>13</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('14/11/2026')}>14</span>
                        <span className="day" onClick={() => setDiaSeleccionadoCal('15/11/2026')}>15</span>
                      </div>
                    </div>
                  </div>

                  {/* Banner si hace clic en un día del calendario */}
                  {diaSeleccionadoCal && (
                    <div className="calendar-action-banner">
                      <div>
                        <span style={{ fontSize: '11px', color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase' }}>FECHA SELECCIONADA</span>
                        <div style={{ color: '#ffffff', fontWeight: 600 }}>Día {diaSeleccionadoCal} en {room.nombre}</div>
                      </div>
                      <button 
                        className="btn-book-rate"
                        onClick={() => handleOpenBooking({ room, date: diaSeleccionadoCal.split('/').reverse().join('-') })}
                      >
                        Reservar para esta Fecha <ArrowRight size={14} />
                      </button>
                    </div>
                  )}

                  {/* Bloques de Tarifas Disponibles */}
                  <div className="rates-block-options">
                    <div className="rate-option-card">
                      <div className="rate-option-header">
                        <span className="rate-option-name">Bloque 6 Horas</span>
                        <span className="rate-option-price">{room.desde}</span>
                      </div>
                      <p className="rate-option-desc">Ideal para una estadía corta y reconfortante. Incluye amenidades y cochera.</p>
                      <button 
                        className="btn-book-rate"
                        onClick={() => handleOpenBooking({ room, rate: '6 HORAS' })}
                      >
                        Reservar Tarifa (6h)
                      </button>
                    </div>

                    <div className="rate-option-card">
                      <div className="rate-option-header">
                        <span className="rate-option-name">Bloque 12 Horas</span>
                        <span className="rate-option-price">S/ {parseInt(room.desde.replace('S/ ', '')) + 50}</span>
                      </div>
                      <p className="rate-option-desc">Mediodía de descanso pleno con room service y late check-out disponible.</p>
                      <button 
                        className="btn-book-rate"
                        onClick={() => handleOpenBooking({ room, rate: '12 HORAS' })}
                      >
                        Reservar Tarifa (12h)
                      </button>
                    </div>

                    <div className="rate-option-card">
                      <div className="rate-option-header">
                        <span className="rate-option-name">Pernocte Completo</span>
                        <span className="rate-option-price">S/ {parseInt(room.desde.replace('S/ ', '')) + 90}</span>
                      </div>
                      <p className="rate-option-desc">Noche completa de descanso ininterrumpido hasta el mediodía siguiente.</p>
                      <button 
                        className="btn-book-rate"
                        onClick={() => handleOpenBooking({ room, rate: 'PERNOCTE' })}
                      >
                        Reservar Pernocte
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
          <div className="all-rooms-grid max-container" style={{ marginTop: '2rem' }}>
            {tiposHabitaciones.map((t) => (
              <article key={t.id} className="type-card">
                <div className="media"><Img src={t.img} alt={t.nombre} /></div>
                <div className="type-body">
                  <h3>{t.nombre}</h3>
                  <p>{t.desc}</p>
                  <div className="type-foot">
                    <span className="price-tag">Desde {t.desde}</span>
                    <button 
                      className="btn-link-gold" 
                      onClick={() => handleOpenBooking({ room: t })}
                    >
                      Reservar esta Suite
                    </button>
                  </div>
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
          onGoToRole={(role) => {
            setIsReceiptModalOpen(false);
            handleEnterStaffPortal(role);
          }}
        />
      )}

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

      {/* MODAL 4: LOGIN / PORTAL DE EMPLEADOS */}
      {isLoginModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0c1e36', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  W
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Portal de Empleados - Hotel Wimbledon</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Selecciona el rol con el que deseas ingresar</span>
                </div>
              </div>
              <button className="btn-action-icon" onClick={() => setIsLoginModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. ADMINISTRADOR */}
                <div 
                  onClick={() => handleEnterStaffPortal('ADMIN')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>Panel de Administrador</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        Dashboard con KPIs, gestión de reservas, gestión de habitaciones y reportes PDF.
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={20} color="#2563eb" />
                </div>

                {/* 2. RECEPCIÓN */}
                <div 
                  onClick={() => handleEnterStaffPortal('RECEPCION')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>Panel de Recepción (Ana Torres)</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        Métricas de hoy, reservas del día, acciones rápidas, estado de habitaciones y ficha de huésped.
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={20} color="#10b981" />
                </div>

                {/* 3. LIMPIEZA */}
                <div 
                  onClick={() => handleEnterStaffPortal('LIMPIEZA')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.backgroundColor = '#fffbeb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>Panel de Limpieza (Rosa Flores)</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        Tablero de aseo por pisos, checklists interactivos y reporte de averías técnicas.
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={20} color="#f59e0b" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsLoginModalOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
