import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

export default function TopHeader({ 
  currentRole, 
  user, 
  onToggleSidebar, 
  searchTerm,
  setSearchTerm
}) {
  const getSearchPlaceholder = () => {
    if (currentRole === 'RECEPCION') return 'Buscar reservas, huéspedes o habitaciones...';
    if (currentRole === 'LIMPIEZA') return 'Buscar habitación, piso o estado de limpieza...';
    return 'Buscar reservas, habitaciones o reportes...';
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
      <div className="dash-topbar-right">
        {/* Notifications */}
        <button className="btn-icon-top" title="Notificaciones">
          <Bell size={18} />
          <span className="badge-dot">3</span>
        </button>

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
