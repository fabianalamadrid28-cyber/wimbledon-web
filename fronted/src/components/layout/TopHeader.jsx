import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, CheckCircle2, Clock, Sparkles, Bed, AlertCircle, DoorOpen, Trash2, Check } from 'lucide-react';

export default function TopHeader({ 
  currentRole, 
  user, 
  onToggleSidebar, 
  searchTerm,
  setSearchTerm,
  notifications = [],
  onMarkAllRead,
  onClearNotifications,
  onOpenCheckInValidation
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getSearchPlaceholder = () => {
    if (currentRole === 'RECEPCION') return 'Buscar reservas, huéspedes o habitaciones...';
    if (currentRole === 'LIMPIEZA') return 'Buscar habitación, piso o estado de limpieza...';
    return 'Buscar reservas, habitaciones o reportes...';
  };

  const unreadCount = notifications.filter(n => !n.leida).length;

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'checkin':
        return <DoorOpen size={16} color="#10b981" />;
      case 'limpieza':
        return <Sparkles size={16} color="#f59e0b" />;
      case 'mantenimiento':
        return <AlertCircle size={16} color="#ef4444" />;
      case 'reserva':
      default:
        return <Bed size={16} color="#2563eb" />;
    }
  };

  return (
    <header className="dash-topbar">
      {/* Left side: Hamburger + Search */}
      <div className="dash-topbar-left">
        <button className="dash-toggle-btn" onClick={onToggleSidebar} title="Alternar menú">
          <Menu size={20} />
        </button>

        <div className="dash-search-box">
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder={getSearchPlaceholder()} 
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Right side: Notifications + Profile */}
      <div className="dash-topbar-right" style={{ position: 'relative' }} ref={dropdownRef}>
        {/* Notifications Bell */}
        <button 
          className="btn-icon-top" 
          title="Notificaciones en tiempo real"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="badge-dot" style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 700,
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #ffffff'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '52px',
            right: '0',
            width: '360px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#0c1e36',
              color: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={16} color="#D4AF37" />
                <strong style={{ fontSize: '14px' }}>Notificaciones</strong>
                {unreadCount > 0 && (
                  <span style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '999px'
                  }}>
                    {unreadCount} nuevas
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {unreadCount > 0 && onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    title="Marcar todas como leídas"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#cbd5e1',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Check size={12} /> Leídas
                  </button>
                )}
                {notifications.length > 0 && onClearNotifications && (
                  <button
                    onClick={onClearNotifications}
                    title="Limpiar todas"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8' }}>
                  <Bell size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>No tienes notificaciones pendientes.</p>
                  <span style={{ fontSize: '11.5px', color: '#cbd5e1' }}>Los nuevos eventos aparecerán aquí en tiempo real.</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      backgroundColor: n.leida ? '#ffffff' : '#f8fafc',
                      transition: 'background 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (n.tipo === 'checkin' && onOpenCheckInValidation) {
                        onOpenCheckInValidation();
                      }
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getNotificationIcon(n.tipo)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: n.leida ? 500 : 700, color: '#0f172a' }}>
                          {n.titulo}
                        </span>
                        {!n.leida && (
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }}></span>
                        )}
                      </div>
                      <p style={{ margin: '3px 0 4px', fontSize: '12px', color: '#475569', lineHeight: 1.35 }}>
                        {n.mensaje}
                      </p>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} /> {n.tiempo || 'Hace unos momentos'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 16px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              textAlign: 'center',
              fontSize: '11.5px',
              color: '#64748b'
            }}>
              Sistema de alertas en vivo · Hotel Wimbledon
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="dash-user-dropdown">
          <div className="dash-user-avatar">
            {user?.nombre ? user.nombre.charAt(0) : 'U'}
          </div>
          <div className="dash-user-meta">
            <span className="dash-user-name">{user?.nombre || 'Usuario'}</span>
            <span className="dash-user-email">{user?.email || 'admin@hotel.com'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
