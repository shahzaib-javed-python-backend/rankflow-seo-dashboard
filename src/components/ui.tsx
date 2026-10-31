import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass glass-hover rounded-2xl ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Badge({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const flat = value === 0;
  const up = value > 0;
  const cls = flat
    ? 'bg-slate-700/40 text-slate-400'
    : up
      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
      : 'bg-rose-500/15 text-rose-300 border border-rose-500/20';
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const px = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`chip ${cls} ${px}`}>
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {flat ? '0' : `${up ? '+' : ''}${value}`}
    </span>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex bg-ink-800/60 border border-white/[0.06] rounded-lg p-1">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            value === o.value ? 'bg-brand-500/15 text-brand-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }: { icon: typeof TrendingUp; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-ink-700/60 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <p className="text-slate-300 font-medium">{title}</p>
      {hint && <p className="text-sm text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}
