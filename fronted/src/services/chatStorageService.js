// Servicio de persistencia y almacenamiento para el Chatbot de Wimbledon
const STORAGE_KEY_CHAT = 'wimbledon_chatbot_history';
const STORAGE_KEY_UNREAD = 'wimbledon_chatbot_unread';

const MENSAJE_INICIAL = {
  id: 'msg_welcome',
  sender: 'bot',
  text: '¡Hola! Bienvenido al **Hotel Wimbledon & Suites** 🏨✨. Soy tu *Concierge Virtual*. ¿En qué puedo ayudarte hoy?',
  timestamp: new Date().toISOString(),
  quickReplies: [
    'Ver Suites y Precios',
    'Tarifas por Bloques',
    'Paquetes Románticos',
    'Consultar mis Bonos VIP',
    'Formas de Pago',
    'Quiero Reservar'
  ]
};

export const chatStorageService = {
  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CHAT);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error leyendo chat storage:', e);
    }
    return [MENSAJE_INICIAL];
  },

  saveMessage(sender, text, extra = {}) {
    try {
      const history = this.getHistory();
      const newMsg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        sender,
        text,
        timestamp: new Date().toISOString(),
        ...extra
      };
      const updated = [...history, newMsg];
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Error guardando mensaje:', e);
      return [];
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY_CHAT);
      localStorage.removeItem(STORAGE_KEY_UNREAD);
    } catch (e) {
      console.warn('Error limpiando chat:', e);
    }
    return [MENSAJE_INICIAL];
  },

  getUnreadCount() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY_UNREAD) || '0', 10);
    } catch {
      return 0;
    }
  },

  setUnreadCount(count) {
    try {
      localStorage.setItem(STORAGE_KEY_UNREAD, String(count));
    } catch {
      // Ignore
    }
  }
};
