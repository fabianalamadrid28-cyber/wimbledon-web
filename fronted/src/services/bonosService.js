// Servicio para gestión y persistencia de Bonos de Cliente Frecuente
import { API_BASE_URL } from './api';

const STORAGE_KEY_BONOS = 'wimbledon_bonos_cliente';
const STORAGE_KEY_CLIENTE = 'wimbledon_cliente_activo';

export const CATALOGO_BONOS_LOCAL = [
  {
    codigo: 'BIENVENIDA25',
    titulo: 'Bono Bienvenida VIP',
    descripcion: 'Descuento exclusivo de S/ 25.00 en cualquier suite de Hotel Wimbledon.',
    montoDescuento: 25.00,
    nivelRequerido: 'TODOS',
    puntosRequeridos: 0,
    vigencia: 'Permanente',
    activo: true
  },
  {
    codigo: 'FRECUENTE35',
    titulo: 'Bono Cliente Frecuente',
    descripcion: 'Descuento especial de S/ 35.00 para huéspedes recurrentes.',
    montoDescuento: 35.00,
    nivelRequerido: 'PLATA',
    puntosRequeridos: 200,
    vigencia: 'Permanente',
    activo: true
  },
  {
    codigo: 'ROMANTICO40',
    titulo: 'Bono Pareja Romántica',
    descripcion: 'Descuento de S/ 40.00 en paquetes de festividad, aniversarios o suites temáticas.',
    montoDescuento: 40.00,
    nivelRequerido: 'PLATA',
    puntosRequeridos: 250,
    vigencia: 'Permanente',
    activo: true
  },
  {
    codigo: 'VIP50',
    titulo: 'Bono Black Jacuzzi VIP',
    descripcion: 'Descuento exclusivo de S/ 50.00 en estancias pernocte con Jacuzzi.',
    montoDescuento: 50.00,
    nivelRequerido: 'ORO',
    puntosRequeridos: 450,
    vigencia: 'Permanente',
    activo: true
  },
  {
    codigo: 'DESAYUNO30',
    titulo: 'Bono Desayuno a la Suite',
    descripcion: 'Descuento de S/ 30.00 aplicable a consumos de la carta gastronómica o desayunos.',
    montoDescuento: 30.00,
    nivelRequerido: 'TODOS',
    puntosRequeridos: 100,
    vigencia: 'Permanente',
    activo: true
  }
];

export const bonosService = {
  // Obtiene el catálogo de bonos disponibles
  async obtenerCatalogo() {
    try {
      const res = await fetch(`${API_BASE_URL}/bonos/catalogo`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Fallback a almacenamiento local
    }
    return CATALOGO_BONOS_LOCAL;
  },

  // Consulta el estado de cliente frecuente por Documento o Teléfono
  async consultarCliente(documento) {
    const docLimpio = String(documento || '').trim();
    
    // Intento con backend
    if (docLimpio) {
      try {
        const res = await fetch(`${API_BASE_URL}/bonos/cliente?documento=${encodeURIComponent(docLimpio)}`);
        if (res.ok) {
          const data = await res.json();
          this.guardarEnStorage(data);
          return data;
        }
      } catch {
        // Fallback a cálculo local
      }
    }

    // Consulta en localStorage o simulación inteligente
    return this.consultarLocal(docLimpio);
  },

  // Cálculo local con persistencia en localStorage
  consultarLocal(documento) {
    const docLimpio = String(documento || '').trim();
    const stored = this.obtenerDeStorage(docLimpio);
    if (stored) return stored;

    let nivel = 'BRONCE';
    let estancias = 0;
    let puntos = 100;
    let nombre = 'Huésped Distinguido';

    if (docLimpio) {
      // Simulación basada en dígitos para demo interactiva
      const ultimos = parseInt(docLimpio.slice(-2), 10) || 12;
      estancias = (ultimos % 8) + 1;
      if (estancias >= 6) {
        nivel = 'BLACK_VIP';
        puntos = (estancias * 120) + 300;
      } else if (estancias >= 3) {
        nivel = 'ORO';
        puntos = (estancias * 100) + 150;
      } else if (estancias >= 1) {
        nivel = 'PLATA';
        puntos = (estancias * 100);
      }
      nombre = `Cliente #${docLimpio.slice(-4)}`;
    }

    const resultado = {
      documento: docLimpio,
      nombreCliente: nombre,
      nivel,
      estanciasAcumuladas: estancias,
      puntosFidelidad: puntos,
      beneficioNivel: nivel === 'BLACK_VIP'
        ? 'Nivel Black VIP: Máxima prioridad de suite, late check-out sin costo y 15% en carta.'
        : nivel === 'ORO'
        ? 'Nivel Oro: Descuentos en todas las suites temáticas y pernoctes con Jacuzzi.'
        : nivel === 'PLATA'
        ? 'Nivel Plata: Acceso a bonos de fidelidad de S/ 35 y S/ 40 en próximas visitas.'
        : 'Nivel Bronce: Bono de bienvenida activo de S/ 25.00 para tu próxima estancia.',
      bonosDisponibles: CATALOGO_BONOS_LOCAL.filter(b => {
        if (nivel === 'BLACK_VIP' || nivel === 'ORO') return true;
        if (nivel === 'PLATA') return b.nivelRequerido !== 'ORO' && b.nivelRequerido !== 'BLACK_VIP';
        return b.nivelRequerido === 'TODOS';
      }),
      mensaje: estancias > 0 
        ? `¡Tienes ${puntos} puntos de fidelidad acumulados por tus visitas anteriores!`
        : '¡Bienvenido al Club Wimbledon! Disfruta de tu bono de bienvenida.'
    };

    if (docLimpio) {
      this.guardarEnStorage(resultado);
    }

    return resultado;
  },

  // Valida un código de bono contra el backend o local
  async validarBono(codigo, documento = '', montoTotal = 0) {
    const cod = String(codigo || '').trim().toUpperCase();
    if (!cod) {
      return { valido: false, mensaje: 'Por favor ingresa un código de bono.', descuento: 0, nuevoTotal: montoTotal };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/bonos/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: cod, documento, montoTotal })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          valido: data.valido,
          mensaje: data.mensaje,
          descuento: Number(data.montoDescuento || 0),
          nuevoTotal: Number(data.nuevoTotal || montoTotal),
          bono: data.bono
        };
      }
    } catch {
      // Fallback
    }

    // Validación local
    const match = CATALOGO_BONOS_LOCAL.find(b => b.codigo.toUpperCase() === cod && b.activo);
    if (!match) {
      return {
        valido: false,
        mensaje: `El código "${cod}" no es válido o ha expirado.`,
        descuento: 0,
        nuevoTotal: montoTotal
      };
    }

    const desc = match.montoDescuento;
    const nuevoTotal = Math.max(0, montoTotal - desc);

    return {
      valido: true,
      mensaje: `¡Bono ${match.codigo} aplicado con éxito! Descuento de S/ ${desc.toFixed(2)}.`,
      descuento: desc,
      nuevoTotal,
      bono: match
    };
  },

  // Manejo de LocalStorage
  guardarEnStorage(datos) {
    try {
      localStorage.setItem(STORAGE_KEY_CLIENTE, JSON.stringify(datos));
      const mapa = JSON.parse(localStorage.getItem(STORAGE_KEY_BONOS) || '{}');
      if (datos.documento) {
        mapa[datos.documento] = datos;
        localStorage.setItem(STORAGE_KEY_BONOS, JSON.stringify(mapa));
      }
    } catch (e) {
      console.warn('Error guardando bonos en storage:', e);
    }
  },

  obtenerDeStorage(documento) {
    try {
      if (documento) {
        const mapa = JSON.parse(localStorage.getItem(STORAGE_KEY_BONOS) || '{}');
        if (mapa[documento]) return mapa[documento];
      }
      const actual = localStorage.getItem(STORAGE_KEY_CLIENTE);
      if (actual) {
        const parsed = JSON.parse(actual);
        if (!documento || parsed.documento === documento) return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }
};
