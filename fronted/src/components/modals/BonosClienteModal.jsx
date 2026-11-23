import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Gift, 
  Sparkles, 
  Check, 
  Copy, 
  ArrowRight, 
  ShieldCheck, 
  Search,
  Award,
  Star
} from 'lucide-react';
import { bonosService, CATALOGO_BONOS_LOCAL } from '../../services/bonosService';

export default function BonosClienteModal({
  isOpen,
  onClose,
  onAplicarBonoEnReserva
}) {
  const [documento, setDocumento] = useState('');
  const [datosCliente, setDatosCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiadoCode, setCopiadoCode] = useState(null);

  // Cargar cliente previo de storage si existe
  useEffect(() => {
    if (isOpen) {
      const stored = bonosService.obtenerDeStorage();
      if (stored) {
        setDatosCliente(stored);
        if (stored.documento) setDocumento(stored.documento);
      } else {
        // Cargar por defecto
        bonosService.consultarCliente('').then(setDatosCliente);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConsultar = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const res = await bonosService.consultarCliente(documento);
    setDatosCliente(res);
    setLoading(false);
  };

  const handleCopiarCodigo = (codigo) => {
    navigator.clipboard?.writeText(codigo);
    setCopiadoCode(codigo);
    setTimeout(() => setCopiadoCode(null), 2500);
  };

  const handleCanjearDirecto = (bono) => {
    onClose();
    if (onAplicarBonoEnReserva) {
      onAplicarBonoEnReserva(bono.codigo);
    }
  };

  const getNivelBadgeColor = (nivel) => {
    switch (nivel) {
      case 'BLACK_VIP': return 'linear-gradient(135deg, #0f172a, #334155)';
      case 'ORO': return 'linear-gradient(135deg, #D4AF37, #996515)';
      case 'PLATA': return 'linear-gradient(135deg, #94a3b8, #64748b)';
      default: return 'linear-gradient(135deg, #b45309, #78350f)';
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1150,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#0b1324',
          border: '1px solid #D4AF37',
          borderRadius: '16px',
          width: '740px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{
          background: 'linear-gradient(135deg, #162444 0%, #0b1324 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37, #b8860b)',
              color: '#0b1324',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)'
            }}>
              <Crown size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Club Wimbledon VIP · Bonos de Cliente Frecuente
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Descuentos exclusivos, puntos acumulados y beneficios preferenciales para cada estancia
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {/* Barra de consulta de DNI */}
          <form 
            onSubmit={handleConsultar}
            style={{
              background: '#111e38',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            <Search size={18} color="#D4AF37" />
            <input 
              type="text"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="Ingresa tu DNI para consultar puntos y bonos acumulados..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #b8860b)',
                color: '#0b1324',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
          </form>

          {/* Tarjeta de Membresía VIP */}
          {datosCliente && (
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid #D4AF37',
              borderRadius: '14px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '24px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: getNivelBadgeColor(datosCliente.nivel),
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      letterSpacing: '0.08em',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      NIVEL {datosCliente.nivel.replace('_', ' ')}
                    </span>
                    {datosCliente.documento && (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        DNI: {datosCliente.documento}
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '8px 0 2px 0', fontSize: '18px', color: '#D4AF37' }}>
                    {datosCliente.nombreCliente}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>
                    {datosCliente.beneficioNivel}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '16px', textAlign: 'right' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>PUNTOS CLUB</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#D4AF37' }}>
                      {datosCliente.puntosFidelidad} <span style={{ fontSize: '11px' }}>pts</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>ESTANCIAS</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
                      {datosCliente.estanciasAcumuladas}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listado de Bonos Disponibles */}
          <h4 style={{ 
            fontSize: '13px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            color: '#D4AF37', 
            margin: '0 0 14px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Gift size={16} /> Bonos Disponibles para Canjear
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
            {CATALOGO_BONOS_LOCAL.map((bono) => {
              const esCopiado = copiadoCode === bono.codigo;
              return (
                <div 
                  key={bono.codigo}
                  style={{
                    background: '#111e38',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{
                          background: 'rgba(212, 175, 55, 0.15)',
                          color: '#D4AF37',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.05em'
                        }}>
                          {bono.nivelRequerido === 'TODOS' ? 'DISPONIBLE PARA TODOS' : `NIVEL ${bono.nivelRequerido}`}
                        </span>
                        <h5 style={{ margin: '6px 0 2px 0', fontSize: '15px', color: '#ffffff' }}>
                          {bono.titulo}
                        </h5>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
                          -S/ {bono.montoDescuento.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                      {bono.descripcion}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    borderTop: '1px solid #1e293b',
                    paddingTop: '12px',
                    marginTop: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <code style={{
                        background: '#0b1324',
                        color: '#D4AF37',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px dashed #D4AF37',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {bono.codigo}
                      </code>

                      <button
                        type="button"
                        onClick={() => handleCopiarCodigo(bono.codigo)}
                        title="Copiar código de bono"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: esCopiado ? '#10b981' : '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                      >
                        {esCopiado ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCanjearDirecto(bono)}
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37, #b8860b)',
                        color: '#0b1324',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Canjear</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(212, 175, 55, 0.2)',
          padding: '14px 24px',
          background: '#0f172a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Los bonos se validan y aplican instantáneamente en tu boleta electrónica.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              color: '#cbd5e1',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
