import { useQuery } from '@tanstack/react-query';
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import {
  AlertTriangle,
  Bell,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Truck,
  UserCog,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { Configuracion, Rol } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_private')({
  beforeLoad: () => {
    if (!useAuthStore.getState().token) throw redirect({ to: '/login' });
  },
  component: PrivateLayout,
});

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Rol[];
}

const ROLES_TODOS: Rol[] = ['admin', 'porteria', 'solicitante'];

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ROLES_TODOS },
  { to: '/registros', label: 'Registros', icon: ClipboardList, roles: ['admin', 'porteria'] },
  { to: '/avisos', label: 'Avisos de camiones', icon: Bell, roles: ROLES_TODOS },
  { to: '/incidencias', label: 'Incidencias', icon: AlertTriangle, roles: ['admin', 'porteria'] },
  { to: '/empresas', label: 'Empresas', icon: Building2, roles: ROLES_TODOS },
  { to: '/protocolo', label: 'Protocolo', icon: ShieldCheck, roles: ROLES_TODOS },
];

const NAV_BOTTOM: NavItem[] = [
  { to: '/usuarios', label: 'Usuarios', icon: UserCog, roles: ['admin'] },
];

function PrivateLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const { data: config } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => api.get<Configuracion[]>('/configuracion'),
    staleTime: 5 * 60_000,
  });
  const nombreEmpresa = config?.find((c) => c.clave === 'empresa.nombre')?.valor ?? 'Cooprinsem';

  const visible = (item: NavItem) => !!user && item.roles.includes(user.rol);
  const nav = NAV.filter(visible);
  const navBottom = NAV_BOTTOM.filter(visible);

  const enlaceNav = (item: NavItem) => (
    <Link
      key={item.to}
      to={item.to}
      onClick={() => setMenuAbierto(false)}
      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-forest-200 transition-colors hover:bg-forest-800 hover:text-white [&.active]:bg-brand-500/15 [&.active]:text-brand-300"
    >
      <item.icon className="size-4.5 shrink-0" />
      <span className="flex-1">{item.label}</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-forest-950/50 backdrop-blur-[2px] md:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Sidebar verde — drawer en móvil, fijo en escritorio */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-forest-900 text-forest-100 transition-transform duration-300 md:translate-x-0',
          menuAbierto ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between pr-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-5 py-5 transition-opacity hover:opacity-90"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500">
              <Truck className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-display block truncate text-[15px] font-bold text-white">
                {nombreEmpresa}
              </span>
              <span className="block truncate text-[11px] text-forest-300">Transportistas</span>
            </div>
          </Link>
          <button
            className="grid size-8 cursor-pointer place-items-center rounded-lg text-forest-300 hover:bg-forest-800 hover:text-white md:hidden"
            onClick={() => setMenuAbierto(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {nav.map(enlaceNav)}
          {navBottom.length > 0 && <div className="pt-2">{navBottom.map(enlaceNav)}</div>}
        </nav>

        <div className="border-t border-forest-800 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-forest-700 text-xs font-bold text-brand-300">
              {user?.nombre
                ?.split(' ')
                .slice(0, 2)
                .map((p) => p[0])
                .join('')
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.nombre}</p>
              <p className="truncate text-xs text-forest-400 capitalize">{user?.rol}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: '/login' });
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-forest-300 transition-colors hover:bg-forest-800 hover:text-white"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-1.5 border-b border-forest-100 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            className="grid size-10 cursor-pointer place-items-center rounded-xl text-forest-500 hover:bg-forest-50 hover:text-forest-800 md:hidden"
            onClick={() => setMenuAbierto(true)}
            title="Menú"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display truncate text-sm font-bold text-forest-900 md:hidden">
            {nombreEmpresa}
          </span>
          <div className="flex-1" />
          {user?.rol === 'admin' && (
            <Link
              to="/configuraciones"
              title="Configuraciones"
              className="grid size-10 place-items-center rounded-xl text-forest-500 transition-colors hover:bg-forest-50 hover:text-forest-800 [&.active]:bg-brand-50 [&.active]:text-brand-600"
            >
              <Settings className="size-5" />
            </Link>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
