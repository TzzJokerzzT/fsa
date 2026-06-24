import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  GitBranch,
  Layers,
  LayoutGrid,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Plus,
  User,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  useAppStore,
  useArchitectureList,
  useArchitectureStore,
  useUser,
} from '@/app/store';
import logo from '@/assets/logo.png';
import { useLogout } from '@/shared/api/hooks';
import { cn } from '@/shared/lib/cn';
import { Button, Divider, Tooltip } from '@/shared/ui';

/**
 * Main Layout with Sidebar navigation
 * Follows consistent navigation patterns
 */

const navItems = [
  { path: '/', icon: LayoutGrid, label: 'Dashboard' },
  { path: '/builder', icon: GitBranch, label: 'Builder' },
  { path: '/compare', icon: Layers, label: 'Compare' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
];

export function MainLayout() {
  const location = useLocation();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const architectures = useArchitectureList();
  const setCurrentArchitecture = useArchitectureStore(
    (s) => s.setCurrentArchitecture,
  );
  const currentArchitectureId = useArchitectureStore(
    (s) => s.currentArchitectureId,
  );
  const user = useUser();
  const logout = useLogout();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-100">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 64 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="flex flex-col bg-surface-200 border-r border-surface-400 h-full"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 h-16">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
            <img
              src={logo}
              aria-label="Frontend Architecture Logo"
              className="rounded-lg"
            />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-text-primary whitespace-nowrap overflow-hidden"
              >
                FAS
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Tooltip
                key={item.path}
                content={item.label}
                position="right"
                className={sidebarOpen ? 'hidden' : ''}
              >
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-surface-300 hover:text-text-primary',
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        {/* Architectures List */}
        {sidebarOpen && (
          <div className="px-3 py-2 border-t border-surface-400">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Architectures
              </span>
              <Link to="/builder">
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {architectures.length === 0 ? (
                <p className="text-xs text-text-muted px-2 py-1">
                  No architectures yet
                </p>
              ) : (
                architectures.map((arch) => (
                  <button
                    key={arch.id}
                    onClick={() => setCurrentArchitecture(arch.id)}
                    className={cn(
                      'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left',
                      'text-sm transition-colors duration-150 cursor-pointer',
                      currentArchitectureId === arch.id
                        ? 'bg-surface-400 text-text-primary'
                        : 'text-text-secondary hover:bg-surface-300',
                    )}
                  >
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{arch.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <Divider />

        {/* User Info & Logout */}
        <div className="p-3 space-y-2">
          {/* User Info */}
          {sidebarOpen ? (
            <Link
              to="/profile"
              className={cn(
                'flex items-center gap-3 px-2 py-1.5 rounded-lg',
                'transition-colors duration-150',
                'hover:bg-surface-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                location.pathname === '/profile'
                  ? 'bg-primary/10'
                  : 'text-text-secondary',
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-400 text-text-secondary">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email}
                </p>
              </div>
            </Link>
          ) : (
            <Tooltip content={user?.name || 'User'} position="right">
              <Link
                to="/profile"
                className={cn(
                  'flex items-center justify-center w-full py-1.5 rounded-lg',
                  'transition-colors duration-150',
                  'hover:bg-surface-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  location.pathname === '/profile' && 'bg-primary/10',
                )}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-400 text-text-secondary">
                  <User className="w-4 h-4" />
                </div>
              </Link>
            </Tooltip>
          )}

          {/* Logout Button */}
          <Tooltip
            content="Sign out"
            position="right"
            className={sidebarOpen ? 'hidden' : ''}
          >
            <Button
              variant="ghost"
              size={sidebarOpen ? 'md' : 'icon'}
              onClick={() => logout.mutate()}
              loading={logout.isPending}
              className={cn(
                'w-full text-text-secondary hover:text-error hover:bg-error/10',
                sidebarOpen ? 'justify-start px-3' : 'justify-center',
              )}
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap ml-3"
                  >
                    Sign out
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Tooltip>

          {/* Toggle Button */}
          <Tooltip
            content={sidebarOpen ? 'Collapse' : 'Expand'}
            position="right"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="w-full justify-center"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </Button>
          </Tooltip>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
