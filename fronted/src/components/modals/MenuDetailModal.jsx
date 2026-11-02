import React, { useState } from 'react';
import { X, Check, Utensils, Sparkles, Tag, Plus } from 'lucide-react';

export default function MenuDetailModal({ 
  isOpen, 
  onClose, 
  categoryData, 
  allCategories, 
  onSelectPromotion, 
  onSelectItem 
}) {
  const [selectedCatId, setSelectedCatId] = useState(categoryData ? categoryData.id : allCategories[0]?.id);
  const [addedItems, setAddedItems] = useState({});

  if (!isOpen) return null;

  const currentCategory = allCategories.find(c => c.id === selectedCatId) || allCategories[0];

  const handleAddPromo = (promo) => {
    setAddedItems(prev => ({ ...prev, [promo.nombre]: true }));
    if (onSelectPromotion) {
      onSelectPromotion(promo);
    }
  };

  const handleAddItem = (item) => {
    setAddedItems(prev => ({ ...prev, [item.nombre]: true }));
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '850px', 
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
        }}
      >
        {/* Header con tabs */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Utensils size={18} color="#D4AF37" />
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#D4AF37', fontWeight: 600 }}>
                  CARTA DE ALIMENTOS Y BEBIDAS · SERVICIO A LA HABITACIÓN 24 HORAS
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: '24px', fontFamily: "'Playfair Display', serif", color: '#ffffff' }}>
                {currentCategory?.nombre}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                {currentCategory?.tagline}
              </p>
            </div>
            <button 
              className="btn-action-icon" 
              onClick={onClose}
              style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Categorías Switcher */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '16px', paddingBottom: '4px' }}>
            {allCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                style={{
                  background: selectedCatId === cat.id ? '#D4AF37' : '#1e293b',
                  color: selectedCatId === cat.id ? '#0f172a' : '#cbd5e1',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Body scrollable */}
        <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {/* Banner de Promoción Especial Destacada */}
          {currentCategory?.promocion && (
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(30, 41, 59, 0.8) 100%)', 
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '10px',
              padding: '18px 20px',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  background: '#D4AF37', 
                  color: '#0f172a', 
                  padding: '3px 10px', 
                  borderRadius: '12px', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  letterSpacing: '0.08em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={12} /> {currentCategory.promocion.badge}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#D4AF37' }}>
                  S/ {currentCategory.promocion.precio.toFixed(2)}
                </span>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#ffffff' }}>
                  {currentCategory.promocion.nombre}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {currentCategory.promocion.desc}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  onClick={() => handleAddPromo(currentCategory.promocion)}
                  style={{
                    background: addedItems[currentCategory.promocion.nombre] ? '#10b981' : '#D4AF37',
                    color: addedItems[currentCategory.promocion.nombre] ? '#ffffff' : '#0f172a',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  {addedItems[currentCategory.promocion.nombre] ? (
                    <>
                      <Check size={16} /> ¡Añadido a mi reserva!
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Agregar promoción a mi reserva
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Listado de Platos e Ítems de la Carta */}
          <h4 style={{ 
            fontSize: '14px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em', 
            color: '#94a3b8', 
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Tag size={14} color="#D4AF37" /> Ítems y Platos Disponibles en {currentCategory?.nombre}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentCategory?.items?.map(item => (
              <div 
                key={item.id}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D4AF37'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#334155'}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h5 style={{ margin: 0, fontSize: '15px', color: '#ffffff', fontWeight: 600 }}>
                      {item.nombre}
                    </h5>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
                    {item.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#D4AF37' }}>
                    S/ {item.precio.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddItem(item)}
                    style={{
                      background: addedItems[item.nombre] ? '#10b981' : 'transparent',
                      color: addedItems[item.nombre] ? '#ffffff' : '#D4AF37',
                      border: addedItems[item.nombre] ? 'none' : '1px solid #D4AF37',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {addedItems[item.nombre] ? (
                      <>
                        <Check size={14} /> Añadido
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Agregar
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Los productos seleccionados se incluirán en tu reserva y se reflejarán en tu boleta de pago.
          </span>
          <button 
            className="btn-outline-gold" 
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: '12px' }}
          >
            Listo / Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

