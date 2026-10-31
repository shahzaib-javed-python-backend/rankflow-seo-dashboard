import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast { id: string; type: ToastType; title: string; message?: string; }

interface ToastCtx {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

const config: Record<ToastType, { icon: typeof CheckCircle2; ring: string; bar: string }> = {
  success: { icon: CheckCircle2, ring: 'text-brand-400', bar: 'bg-brand-400' },
  error: { icon: XCircle, ring: 'text-rose-400', bar: 'bg-rose-400' },
  warning: { icon: AlertTriangle, ring: 'text-amber-400', bar: 'bg-amber-400' },
  info: { icon: Info, ring: 'text-sky-400', bar: 'bg-sky-400' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, title, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-[360px] max-w-[calc(100vw-3rem)] no-print">
        {toasts.map(t => {
          const { icon: Icon, ring, bar } = config[t.type];
          return (
            <div key={t.id} className="glass rounded-xl p-3.5 pr-9 relative overflow-hidden animate-slide-in-right">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${bar}`} />
              <div className="flex gap-3 pl-2">
                <Icon className={`w-5 h-5 ${ring} mt-0.5 shrink-0`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100">{t.title}</p>
                  {t.message && <p className="text-xs text-slate-400 mt-0.5">{t.message}</p>}
                </div>
              </div>
              <button
                onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
                className="absolute top-2.5 right-2.5 text-slate-500 hover:text-slate-200 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
