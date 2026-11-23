import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Crown, 
  Gift, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  ChevronRight,
  Bot
} from 'lucide-react';
import { chatStorageService } from '../../services/chatStorageService';
import { bonosService } from '../../services/bonosService';

export default function WimbledonChatbot({
  isOpen,
  setIsOpen,
  onOpenBooking,
  onOpenBonosModal,
  rooms = []
}) {
  const [messages, setMessages] = useState(() => chatStorageService.getHistory());
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll al final de mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      chatStorageService.setUnreadCount(0);
    }
  }, [isOpen, messages]);

  const handleClearHistory = () => {
    const fresh = chatStorageService.clearHistory();
    setMessages(fresh);
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    // Guardar mensaje de usuario en almacenamiento
    const updated = chatStorageService.saveMessage('user', text);
    setMessages(updated);
    if (!textToSend) setInputVal('');

    // Simular escritura del bot
    setIsTyping(true);

    setTimeout(async () => {
      const botReply = await generarRespuestaBot(text);
      const afterBot = chatStorageService.saveMessage('bot', botReply.text, {
        quickReplies: botReply.quickReplies || [],
        actionData: botReply.actionData || null
      });
      setMessages(afterBot);
      setIsTyping(false);
    }, 600);
  };

  // Motor conversacional inteligente de Wimbledon
  const generarRespuestaBot = async (query) => {
    const q = query.toLowerCase();

    // 1. Detectar si el usuario ingresó un DNI (8 dígitos) para consultar bonos
    const dniMatch = query.match(/\b\d{8}\b/);
    if (dniMatch) {
      const dni = dniMatch[0];
      const infoCliente = await bonosService.consultarCliente(dni);
      return {
        text: `👑 **¡Consulta de Membresía Exitosa!**\n\n` +
              `• **Documento:** ${dni}\n` +
              `• **Nivel Club:** **${infoCliente.nivel.replace('_', ' ')}**\n` +
              `• **Puntos acumulados:** **${infoCliente.puntosFidelidad} pts**\n` +
              `• **Estancias previas:** ${infoCliente.estanciasAcumuladas}\n\n` +
              `🎉 **Bonos disponibles para ti:**\n` +
              infoCliente.bonosDisponibles.map(b => `• **${b.codigo}**: ${b.titulo} (-S/ ${b.montoDescuento})`).join('\n') +
              `\n\n¿Deseas aplicar alguno de estos bonos a tu reserva ahora mismo?`,
        quickReplies: ['Canjear Bono en Reserva', 'Ver Catálogo de Bonos', 'Ver Precios de Suites'],
        actionData: {
          tipo: 'bono_encontrado',
          bono: infoCliente.bonosDisponibles[0]
        }
      };
    }

    // 2. Bonos / Puntos / Cliente frecuente
    if (q.includes('bono') || q.includes('frecuente') || q.includes('punto') || q.includes('descuento') || q.includes('club') || q.includes('vip')) {
      return {
        text: `👑 **Club Wimbledon & Bonos de Cliente Frecuente**\n\n` +
              `Premiamos tu preferencia con descuentos directos en cada estancia:\n\n` +
              `🎁 **Bono Bienvenida:** Código **BIENVENIDA25** (S/ 25.00 dscto)\n` +
              `🥇 **Bono Frecuente:** Código **FRECUENTE35** (S/ 35.00 dscto)\n` +
              `💎 **Bono Black VIP:** Código **VIP50** (S/ 50.00 dscto en suites con jacuzzi)\n` +
              `🍽 **Bono Desayuno:** Código **DESAYUNO30** (S/ 30.00 dscto en consumos)\n\n` +
              `💡 *Para consultar tu saldo de puntos acumulados, escribe tu número de DNI (8 dígitos).*`,
        quickReplies: ['Abrir Club de Bonos', 'Canjear Bono en Reserva', 'Ver Tarifas por Bloques'],
        actionData: { tipo: 'abrir_bonos' }
      };
    }

    // 3. Suites / Habitaciones / Precios
    if (q.includes('habitacion') || q.includes('suite') || q.includes('precio') || q.includes('cuanto') || q.includes('cuesta') || q.includes('jacuzzi') || q.includes('sauna')) {
      return {
        text: `✨ **Nuestras Suites Exclusivas en San Miguel**\n\n` +
              `🏨 **Suite Estándar / Delux:** Desde S/ 120 (Cama King, Smart TV, minibar, cochera).\n` +
              `♨ **Suite Temática con Jacuzzi:** Desde S/ 160 (Tina de hidromasaje, iluminación ambiental, sillón tántrico).\n` +
              `👑 **Suite Presidencial VIP:** Desde S/ 210 (Sauna seco, jacuzzi doble, pole dance y cochera privada).\n\n` +
              `¿Te gustaría reservar una suite en este momento?`,
        quickReplies: ['Reservar una Suite', 'Tarifas por Bloques', 'Paquetes Románticos'],
        actionData: { tipo: 'ver_habitaciones' }
      };
    }

    // 4. Bloques de estancia y horarios
    if (q.includes('bloque') || q.includes('hora') || q.includes('tarifa') || q.includes('pernocte') || q.includes('estancia')) {
      return {
        text: `⏰ **Modalidades de Estancia Disponibles:**\n\n` +
              `1️⃣ **Bloque 6 Horas:** Ideal para una escapada rápida y reconfortante. Incluye amenidades y cochera.\n` +
              `2️⃣ **Bloque 12 Horas:** Medio día de relajación y room service.\n` +
              `3️⃣ **Pernocte Completo:** Noche ininterrumpida hasta el mediodía siguiente.\n\n` +
              `Puedes seleccionar tu bloque preferido en el formulario de reserva con asignación automática de habitación.`,
        quickReplies: ['Reservar Bloque 6H', 'Reservar Pernocte', 'Consultar mis Bonos VIP'],
        actionData: { tipo: 'bloques' }
      };
    }

    // 5. Paquetes y festividades
    if (q.includes('paquete') || q.includes('romantico') || q.includes('aniversario') || q.includes('san valentin') || q.includes('cena') || q.includes('vino')) {
      return {
        text: `🥂 **Paquetes Especiales y Experiencias Románticas:**\n\n` +
              `🌹 **San Valentín Inolvidable (+S/ 299):** Pétalos, espumante Chandon, fresas con chocolate y late check-out.\n` +
              `🎂 **Paquete Aniversario (+S/ 320):** Globos, velas LED, torta artesanal y vino de autor.\n` +
              `🎄 **Navidad Privada (+S/ 280):** Cena servida en la suite con brindis a medianoche.\n` +
              `✨ **Promo Entre Semana (+S/ 99):** Lunes a jueves, bloque de 6 horas con cóctel de cortesía.\n\n` +
              `¡Puedes añadir cualquiera de estos paquetes al momento de hacer tu reserva!`,
        quickReplies: ['Reservar Paquete Romántico', 'Consultar mis Bonos', 'Ver Formas de Pago'],
        actionData: { tipo: 'paquetes' }
      };
    }

    // 6. Formas de Pago
    if (q.includes('pago') || q.includes('yape') || q.includes('plin') || q.includes('tarjeta') || q.includes('transferencia') || q.includes('efectivo')) {
      return {
        text: `💳 **Métodos de Pago 100% Seguros:**\n\n` +
              `• **Yape & Plin:** Pagos inmediatos con código QR y validación de N° de operación.\n` +
              `• **Transferencia Bancaria:** BCP, BBVA e Interbank.\n` +
              `• **Tarjetas de Débito y Crédito:** Visa y Mastercard.\n` +
              `• **Efectivo en Recepción:** Al momento de ingresar.\n\n` +
              `Todas las reservas digitales generan boleta electrónica inmediata con código QR para Check-In express.`,
        quickReplies: ['Quiero Reservar Ahora', 'Consultar mis Bonos VIP'],
        actionData: { tipo: 'pagos' }
      };
    }

    // 7. Check-in, ubicación o cochera
    if (q.includes('check') || q.includes('donde') || q.includes('direccion') || q.includes('ubicacion') || q.includes('cochera') || q.includes('llegar')) {
      return {
        text: `📍 **Ubicación & Check-In Discreto:**\n\n` +
              `• **Dirección:** San Miguel, Lima (Zona céntrica, segura y discreta).\n` +
              `• **Cochera Privada:** Acceso directo a suite sin contacto para máxima privacidad.\n` +
              `• **Check-In Digital:** Solo muestra tu código QR en portería y accede a tu suite al instante.`,
        quickReplies: ['Reservar una Suite', 'Ver Precios']
      };
    }

    // 8. Intención de reserva directa
    if (q.includes('reservar') || q.includes('quiero') || q.includes('separar') || q.includes('disponibilidad')) {
      return {
        text: `🏨 **¡Perfecto! Vamos a coordinar tu reserva:**\n\n` +
              `Elige el piso y temática que prefieras. Nuestro sistema asigna automáticamente una suite 100% desinfectada y lista.\n\n` +
              `¿Tienes un código de bono de cliente frecuente? Podrás aplicarlo para obtener tu descuento.`,
        quickReplies: ['Abrir Formulario de Reserva', 'Consultar mis Bonos'],
        actionData: { tipo: 'abrir_reserva' }
      };
    }

    // Respuesta por defecto con sugerencias
    return {
      text: `Entiendo tu consulta. Como tu **Concierge Virtual**, puedo ayudarte con:\n\n` +
            `• 🏨 **Consultar precios y suites con jacuzzi**\n` +
            `• ⏰ **Tarifas por bloque (6h, 12h, pernocte)**\n` +
            `• 👑 **Consultar y canjear tus Bonos de Cliente Frecuente**\n` +
            `• 🎁 **Paquetes románticos y aniversarios**\n` +
            `• 💳 **Formas de pago aceptadas**\n\n` +
            `¿Sobre cuál te gustaría conocer más detalles?`,
      quickReplies: ['Ver Suites y Precios', 'Tarifas por Bloques', 'Consultar mis Bonos VIP', 'Quiero Reservar']
    };
  };

  const handleActionClick = (actionData) => {
    if (!actionData) return;
    if (actionData.tipo === 'abrir_reserva' || actionData.tipo === 'ver_habitaciones') {
      setIsOpen(false);
      onOpenBooking();
    } else if (actionData.tipo === 'abrir_bonos') {
      if (onOpenBonosModal) onOpenBonosModal();
    } else if (actionData.tipo === 'bono_encontrado' && actionData.bono) {
      setIsOpen(false);
      onOpenBooking({ initialPromoCode: actionData.bono.codigo });
    }
  };

  return (
    <>
      {/* Botón Flotante del Chatbot */}
      <div 
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '185px',
          zIndex: 1040,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Asistente Virtual Wimbledon 24/7"
          aria-label="Abrir Asistente Virtual"
          style={{
            background: 'linear-gradient(135deg, #0b1324 0%, #1e293b 100%)',
            color: '#D4AF37',
            border: '2px solid #D4AF37',
            borderRadius: '999px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.3)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.03em'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(212, 175, 55, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(212, 175, 55, 0.3)';
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #D4AF37, #b8860b)',
            color: '#0b1324',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={17} />
          </div>
          <span>Chatbot Concierge</span>
          <span style={{
            background: '#10b981',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: '999px',
            letterSpacing: '0.05em'
          }}>
            AI 24/7
          </span>
        </button>
      </div>

      {/* Ventana Desplegable del Chatbot */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '28px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#0b1324',
            border: '1px solid #D4AF37',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1100,
            overflow: 'hidden',
            fontFamily: 'inherit',
            animation: 'fadeInUp 0.25s ease-out'
          }}
        >
          {/* Cabecera del Chat */}
          <div style={{
            background: 'linear-gradient(135deg, #111e38 0%, #0b1324 100%)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #D4AF37, #b8860b)',
                color: '#0b1324',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#ffffff' }}>Concierge Wimbledon</span>
                  <Sparkles size={13} color="#D4AF37" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#10b981' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  <span>En línea · Memoria activa</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handleClearHistory}
                title="Reiniciar conversación"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimizar chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.04) 0%, transparent 70%)'
          }}>
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div 
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '100%'
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: isBot ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                    background: isBot ? '#1e293b' : 'linear-gradient(135deg, #D4AF37 0%, #b8860b 100%)',
                    color: isBot ? '#f1f5f9' : '#0b1324',
                    border: isBot ? '1px solid #334155' : 'none',
                    fontSize: '13px',
                    lineHeight: '1.45',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {m.text}
                  </div>

                  {/* Acciones sugeridas incrustadas */}
                  {isBot && m.actionData && (
                    <div style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleActionClick(m.actionData)}
                        style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid #D4AF37',
                          color: '#D4AF37',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Sparkles size={13} />
                        <span>Realizar Acción en el Sitio</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}

                  {/* Botones de Respuesta Rápida */}
                  {isBot && m.quickReplies && m.quickReplies.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {m.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (reply === 'Abrir Club de Bonos' && onOpenBonosModal) {
                              onOpenBonosModal();
                            } else if (reply === 'Quiero Reservar' || reply === 'Reservar una Suite' || reply === 'Canjear Bono en Reserva') {
                              setIsOpen(false);
                              onOpenBooking();
                            } else {
                              handleSendMessage(reply);
                            }
                          }}
                          style={{
                            background: '#0f172a',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            color: '#cbd5e1',
                            borderRadius: '999px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#D4AF37';
                            e.currentTarget.style.color = '#D4AF37';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                            e.currentTarget.style.color = '#cbd5e1';
                          }}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  <span style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {/* Animación de respuesta escribiendo */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px' }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  display: 'flex',
                  gap: '4px'
                }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>●</span>
                  <span style={{ animation: 'pulse 1s infinite 0.2s' }}>●</span>
                  <span style={{ animation: 'pulse 1s infinite 0.4s' }}>●</span>
                </div>
                <span>Concierge respondiendo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px',
              borderTop: '1px solid #1e293b',
              background: '#0f172a',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input 
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Escribe tu consulta o tu DNI..."
              style={{
                flex: 1,
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
              onBlur={(e) => e.target.style.borderColor = '#334155'}
            />

            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              style={{
                background: inputVal.trim() ? 'linear-gradient(135deg, #D4AF37, #b8860b)' : '#334155',
                color: inputVal.trim() ? '#0b1324' : '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputVal.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
