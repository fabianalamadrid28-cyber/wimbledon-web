import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  DoorClosed, 
  BarChart3, 
  Settings, 
  LogOut, 
  Users, 
  CheckSquare, 
  Sparkles, 
  Wrench,
  KeyRound,
  Home
} from 'lucide-react';

export default function Sidebar({ currentRole, currentTab, setCurrentTab, onLogout, onGoToLogin, user }) {
  // Navigation menu items based on role
  const getNavItems = () => {
    switch (currentRole) {
      case 'ADMIN':
        return [
          { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
          { id: 'reservas', label: 'Reservas', icon: CalendarCheck },
          { id: 'habitaciones', label: 'Habitaciones', icon: DoorClosed },
          { id: 'reportes', label: 'Reportes', icon: BarChart3 }
        ];
      case 'RECEPCION':
        return [
          { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
          { id: 'reservas', label: 'Reservas', icon: CalendarCheck },
          { id: 'checkin-checkout', label: 'Check-in / Check-out', icon: Users },
          { id: 'habitaciones', label: 'Habitaciones', icon: DoorClosed },
          { id: 'huespedes', label: 'Huéspedes', icon: Users },
          { id: 'reportes', label: 'Reportes', icon: BarChart3 }
        ];
      case 'LIMPIEZA':
        return [
          { id: 'inicio', label: 'Tablero de Aseo', icon: Sparkles },
          { id: 'habitaciones', label: 'Habitaciones', icon: DoorClosed },
          { id: 'checklists', label: 'Checklists de Aseo', icon: CheckSquare },
          { id: 'mantenimiento', label: 'Reportes de Averías', icon: Wrench }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    if (currentRole === 'ADMIN') return 'Administrador';
    if (currentRole === 'RECEPCION') return 'Recepción';
    return 'Limpieza';
  };

  return (
    <aside className="dash-sidebar">
      {/* Brand Header - Dando clic en el propio logo se vuelve a la página principal */}
      <div 
        className="dash-sidebar-header" 
        onClick={onLogout}
        style={{ cursor: 'pointer' }}
        title="Volver a la página principal"
      >
        <div className="dash-logo-crest">W</div>
        <div className="dash-logo-text">
          <h2>Hotel Wimbledon</h2>
          <span>{currentRole === 'RECEPCION' ? 'Tu mejor estancia' : getRoleLabel()}</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="dash-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`dash-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="dash-sidebar-footer">
        <button className="dash-nav-btn" onClick={() => setCurrentTab('configuracion')}>
          <Settings size={18} />
          <span>Configuración</span>
        </button>

        {/* Botón para regresar al Login / Portal de Empleados */}
        <button 
          className="dash-nav-btn" 
          onClick={onGoToLogin || onLogout} 
          style={{ color: '#38bdf8', fontWeight: 600 }}
          title="Regresar a la selección de roles y login"
        >
          <KeyRound size={18} />
          <span>Regresar al Login</span>
        </button>

        {/* Botón para volver a la página web principal */}
        <button 
          className="dash-nav-btn" 
          onClick={onLogout} 
          style={{ color: '#94a3b8' }}
          title="Salir a la página principal"
        >
          <Home size={18} />
          <span>Ir a la Web Principal</span>
        </button>

        {/* Profile / Reception info box */}
        <div className="dash-sidebar-profile-card">
          <div className="dash-sidebar-profile-info">
            <div className="avatar-mini">
              {user?.nombre ? user.nombre.charAt(0) : 'W'}
            </div>
            <div className="text-wrap">
              <div className="name">{user?.nombre || 'Hotel Wimbledon'}</div>
              <div className="role">{user?.rol || getRoleLabel()}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
