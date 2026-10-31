import {
  LayoutDashboard, KeyRound, MapPinned, Users, RefreshCw, FileBarChart,
  BellRing, Settings, ChevronLeft, Activity, X, ArrowLeft, FileCheck2,
} from 'lucide-react';
import { useClient } from '@/components/ClientProvider';

export type ViewId =
  | 'overview' | 'keywords' | 'maps' | 'competitors'
  | 'gsc' | 'reports' | 'alerts' | 'citations' | 'settings';

const nav: { id: ViewId; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'keywords', label: 'Keywords', icon: KeyRound },
  { id: 'maps', label: 'Local Maps 3-Pack', icon: MapPinned, badge: 'USP' },
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'gsc', label: 'Search Console Sync', icon: RefreshCw },
  { id: 'citations', label: 'Citations & NAP', icon: FileCheck2 },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'alerts', label: 'Alerts', icon: BellRing, badge: '3' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  view, onNavigate, collapsed, setCollapsed, mobileOpen, setMobileOpen, onBackToLanding,
}: {
  view: ViewId;
  onNavigate: (v: ViewId) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
  onBackToLanding: () => void;
}) {
  const { activeClient } = useClient();
  const width = collapsed ? 'lg:w-[76px]' : 'lg:w-[248px]';

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm z-40 lg:hidden no-print" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-30 h-screen ${width} shrink-0 transition-[width] duration-300 ease-out
        bg-ink-900/80 backdrop-blur-xl border-r border-white/[0.05] flex flex-col
        ${mobileOpen ? 'left-0 w-[260px]' : '-left-80 lg:left-0'} no-print`}
      >
        <div className={`h-16 flex items-center gap-2.5 px-4 border-b border-white/[0.05] ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 shadow-glow">
            <Activity className="w-5 h-5 text-ink-950" strokeWidth={2.6} />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-50 tracking-tight leading-none">RankFlow</p>
              <p className="text-[10px] text-slate-500 mt-1 tracking-wide uppercase">SEO Rank Tracker</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={onBackToLanding} className="text-slate-500 hover:text-brand-300 transition-colors" title="Back to landing page">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {collapsed && (
          <button onClick={onBackToLanding} className="hidden lg:flex items-center justify-center mx-3 mt-2 p-2.5 rounded-lg text-slate-500 hover:text-brand-300 hover:bg-white/[0.04] transition-colors" title="Back to landing">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {nav.map(item => {
            const active = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${active
                  ? 'bg-brand-500/12 text-brand-300'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'}
                ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-400 rounded-r-full" />}
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-brand-400' : ''}`} />
                {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`chip text-[9px] px-1.5 py-0 ${item.badge === 'USP' ? 'bg-accent-500/20 text-accent-400' : 'bg-rose-500/20 text-rose-300'}`}>
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && (
                  <span className="hidden lg:block absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-400" />
                )}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="px-3 pb-4">
            <div className="glass rounded-xl p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-950 font-bold text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${activeClient.accent}, ${activeClient.accent}dd)` }}>
                  {activeClient.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-100 truncate">{activeClient.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{activeClient.industry} · {activeClient.location}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-2 mx-3 mb-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>
    </>
  );
}
