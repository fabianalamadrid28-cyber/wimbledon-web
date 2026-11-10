import React from 'react';
import { X, Wrench, PhoneCall, ShieldAlert, Sparkles, LifeBuoy } from 'lucide-react';
import SoporteForm from '../SoporteForm';

export default function FloatingSupportModal({
  isOpen,
  setIsOpen,
  rooms = []
}) {
  return (
    <>
      {/* Botón flotante tipo burbuja en la esquina inferior derecha */}
      <div 
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          title="Soporte y Asistencia en Habitación 24/7"
          aria-label="Abrir soporte de habitación"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #b8860b 100%)',
            color: '#0f172a',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '999px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(212, 175, 55, 0.45), 0 4px 10px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.03em'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(212, 175, 55, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.45), 0 4px 10px rgba(0, 0, 0, 0.3)';
          }}
        >
          <div style={{
            background: '#0f172a',
            color: '#D4AF37',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Wrench size={15} />
          </div>
          <span>Soporte 24/7</span>
          <span style={{
            background: '#ef4444',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '999px',
            letterSpacing: '0.05em'
          }}>
            SOS
          </span>
        </button>
      </div>

      {/* Ventana Modal Flotante (Pop-up) */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            style={{
              background: '#0f172a',
              border: '1px solid #D4AF37',
              borderRadius: '14px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 25px rgba(212, 175, 55, 0.25)',
              padding: '24px',
              position: 'relative',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de Cierre */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar soporte"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#D4AF37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = '#334155'; }}
            >
              <X size={17} />
            </button>

            {/* Cabecera del Modal */}
            <div style={{ marginBottom: '18px', paddingRight: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                <LifeBuoy size={14} /> Wimbledon Concierge &amp; Mantenimiento
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '19px', color: '#ffffff', fontWeight: 700 }}>
                ¿Inconveniente en tu habitación?
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.45 }}>
                Envía tu reporte y nuestro staff de mantenimiento o atención al huésped resolverá la situación sin interrumpir tu privacidad.
              </p>
            </div>

            {/* Banner Informativo y de Emergencia */}
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '12px'
            }}>
              <span style={{ color: '#cbd5e1' }}>
                ⏱ <strong>Respuesta estimada:</strong> menos de 30 min.
              </span>
              <a 
                href="tel:+51990123456" 
                style={{
                  color: '#D4AF37',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: 600
                }}
              >
                <PhoneCall size={13} /> SOS: +51 990 123 456
              </a>
            </div>

            {/* Formulario de Soporte */}
            <div style={{ marginTop: '10px' }}>
              <SoporteForm 
                origen="CLIENTE" 
                rooms={rooms}
                onCreated={() => {
                  setTimeout(() => {
                    // Da tiempo al usuario para leer la confirmación antes de cerrar
                  }, 1500);
                }}
                onCancel={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

