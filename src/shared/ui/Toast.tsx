import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { generateId } from '@/shared/utils/id';

/**
 * Toast Notification System
 * Provides a global toast context and animated toast display
 */

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, description?: string) => string;
  error: (message: string, description?: string) => string;
  warning: (message: string, description?: string) => string;
  info: (message: string, description?: string) => string;
}

// Default duration in ms
const DEFAULT_DURATION = 5000;

// Context
const ToastContext = createContext<ToastContextValue | null>(null);

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Provider component
interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = generateId();
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? DEFAULT_DURATION,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }

      return id;
    },
    [removeToast],
  );

  // Convenience methods
  const success = useCallback(
    (message: string, description?: string) =>
      addToast({ type: 'success', message, description }),
    [addToast],
  );

  const error = useCallback(
    (message: string, description?: string) =>
      addToast({ type: 'error', message, description }),
    [addToast],
  );

  const warning = useCallback(
    (message: string, description?: string) =>
      addToast({ type: 'warning', message, description }),
    [addToast],
  );

  const info = useCallback(
    (message: string, description?: string) =>
      addToast({ type: 'info', message, description }),
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast container (renders at bottom-right)
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual toast item
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

// Icon and color mapping
const toastConfig: Record<
  ToastType,
  { icon: React.ElementType; bgClass: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle,
    bgClass: 'bg-success/10 border-success/30',
    iconClass: 'text-success',
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-error/10 border-error/30',
    iconClass: 'text-error',
  },
  warning: {
    icon: AlertCircle,
    bgClass: 'bg-warning/10 border-warning/30',
    iconClass: 'text-warning',
  },
  info: {
    icon: Info,
    bgClass: 'bg-primary/10 border-primary/30',
    iconClass: 'text-primary',
  },
};

// Animation variants
const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    x: 100,
    transition: { duration: 0.2 },
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-md p-4 rounded-lg border backdrop-blur-sm shadow-lg ${config.bgClass}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{toast.message}</p>
        {toast.description && (
          <p className="text-sm text-text-secondary mt-1">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
        type="button"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
