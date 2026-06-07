import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export const useToast = create((set, get) => ({
  toasts: [],
  show: (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, duration);
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400" />,
  error: <XCircle size={16} className="text-red-400" />,
  info: <AlertCircle size={16} className="text-blue-400" />,
  warning: <AlertCircle size={16} className="text-yellow-400" />,
};

const styles = {
  success: 'border-emerald-800/60 bg-emerald-950/80',
  error: 'border-red-800/60 bg-red-950/80',
  info: 'border-blue-800/60 bg-blue-950/80',
  warning: 'border-yellow-800/60 bg-yellow-950/80',
};

export default function Toast() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl min-w-[280px] max-w-[380px] pointer-events-auto animate-slide-up ${styles[toast.type]}`}
        >
          <span className="mt-0.5">{icons[toast.type]}</span>
          <p className="text-sm text-white flex-1 leading-relaxed">{toast.message}</p>
          <button onClick={() => remove(toast.id)} className="text-ink-400 hover:text-white transition-colors mt-0.5">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
