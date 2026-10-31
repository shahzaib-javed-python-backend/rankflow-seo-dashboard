import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function SlideOver({
  open, onClose, title, subtitle, children, width = 'max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] bg-ink-950/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'} no-print`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 z-[85] h-full ${width} w-full glass border-l border-white/[0.08] shadow-2xl transition-transform duration-300 ease-out no-print
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-100 text-sm truncate">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-65px)] px-5 py-5">
          {children}
        </div>
      </aside>
    </>
  );
}
