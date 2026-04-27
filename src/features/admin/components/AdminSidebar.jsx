import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  BarChart3, Settings, ChevronLeft, ChevronRight,
  Building2, CalendarRange, Star, LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';

const NAV = [
  { path: '/admin',            icon: LayoutDashboard, label: 'Panel'         },
  { path: '/admin/users',      icon: Users,           label: 'Usuarios'      },
  { path: '/admin/courses',    icon: BookOpen,        label: 'Cursos'        },
  { path: '/admin/grading',    icon: Star,            label: 'Calificación'  },
  { path: '/admin/periods',    icon: CalendarRange,   label: 'Periodos'      },
  { path: '/admin/reports',    icon: BarChart3,       label: 'Reportes'      },
  { path: '/admin/institution',icon: Building2,       label: 'Institución'   },
  { path: '/settings',         icon: Settings,        label: 'Ajustes'       },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <aside
      className={`flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="font-bold text-sm text-primary">Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-accent transition-colors ml-auto"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {NAV.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            title={collapsed ? label : ''}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Cerrar sesión' : ''}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
