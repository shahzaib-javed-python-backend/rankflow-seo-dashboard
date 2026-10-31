import { useEffect, useRef, useState } from 'react';
import { Bell, Search, Menu, ChevronDown, CheckCheck, TrendingDown, TrendingUp, MapPin, RefreshCw, Info, X, FlaskConical, Eye, Sun, Moon, Building2, Check } from 'lucide-react';
import { useData } from '@/components/DataProvider';
import { useTheme } from '@/components/ThemeProvider';
import { useClient } from '@/components/ClientProvider';
import type { Alert } from '@/types';
import { useToast } from './Toast';

const iconMap = {
  'rank-drop': { icon: TrendingDown, color: 'text-rose-400 bg-rose-500/12' },
  'rank-gain': { icon: TrendingUp, color: 'text-brand-400 bg-brand-500/12' },
  local: { icon: MapPin, color: 'text-amber-400 bg-amber-500/12' },
  gsc: { icon: RefreshCw, color: 'text-sky-400 bg-sky-500/12' },
  system: { icon: Info, color: 'text-slate-400 bg-slate-500/12' },
} as const;

export function Header({ onMenu, onBellNavigate }: { onMenu: () => void; onBellNavigate: () => void }) {
  const { alerts: ctxAlerts, demoMode, toggleDemo } = useData();
  const { theme, toggleTheme } = useTheme();
  const { clients, activeClient, setActiveClient } = useClient();
  const [alerts, setAlerts] = useState<Alert[]>(ctxAlerts);
  const [open, setOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const clientRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => { setAlerts(ctxAlerts); }, [ctxAlerts]);

  const unread = alerts.filter(a => !a.read).length;

  const handleToggleDemo = () => {
    toggleDemo();
    toast(demoMode ? 'info' : 'success', demoMode ? 'Demo data off' : 'Demo data enabled', demoMode ? 'Dashboard cleared — connect your data sources' : 'All modules populated with rich sample data');
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) setClientOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAll = () => {
    setAlerts(a => a.map(x => ({ ...x, read: true })));
    toast('success', 'All caught up', 'Marked all alerts as read');
  };

  const dismiss = (id: string) => setAlerts(a => a.filter(x => x.id !== id));

  const switchClient = (id: string, name: string) => {
    setActiveClient(id);
    setClientOpen(false);
    toast('success', 'Client workspace switched', `Now viewing ${name}`);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-ink-950/70 backdrop-blur-xl border-b border-white/[0.05] flex items-center gap-3 px-4 lg:px-6 no-print">
      <button onClick={onMenu} className="lg:hidden text-slate-300 hover:text-white">
        <Menu className="w-5 h-5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          placeholder="Search keywords, reports, competitors..."
          className="w-full bg-ink-800/50 border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10 transition-all"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg bg-ink-800/50 border border-white/[0.06] flex items-center justify-center text-slate-300 hover:text-brand-400 hover:bg-white/[0.05] transition-all"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* Demo Mode Toggle */}
        <button
          onClick={handleToggleDemo}
          className={`hidden sm:flex items-center gap-2 px-3 h-10 rounded-lg border transition-all ${
            demoMode
              ? 'bg-brand-500/12 border-brand-500/25 text-brand-300'
              : 'bg-ink-800/50 border-white/[0.06] text-slate-400 hover:text-slate-200'
          }`}
          title={demoMode ? 'Demo data is ON — click to turn off' : 'Demo data is OFF — click to populate with sample data'}
        >
          {demoMode ? <FlaskConical className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="text-xs font-medium">Demo Data</span>
          <span className={`relative inline-flex w-8 h-4.5 rounded-full transition-colors ${demoMode ? 'bg-brand-500' : 'bg-ink-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${demoMode ? 'translate-x-3.5' : ''}`} />
          </span>
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="relative w-10 h-10 rounded-lg bg-ink-800/50 border border-white/[0.06] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unread > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-ink-950" />
                <span className="absolute top-1 right-1 px-1.5 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              </>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] glass rounded-xl overflow-hidden animate-slide-up origin-top-right">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div>
                  <p className="font-semibold text-slate-100 text-sm">Notifications</p>
                  <p className="text-[11px] text-slate-500">{unread} unread</p>
                </div>
                <button onClick={markAll} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {alerts.length === 0 && (
                  <div className="py-10 text-center text-sm text-slate-500">No notifications</div>
                )}
                {alerts.map(a => {
                  const { icon: Icon, color } = iconMap[a.type];
                  return (
                    <div
                      key={a.id}
                      className={`group flex gap-3 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors ${!a.read ? 'bg-brand-500/[0.03]' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200">{a.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{a.detail}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{a.time}</p>
                      </div>
                      <button
                        onClick={() => dismiss(a.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-200 transition-all shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => { setOpen(false); onBellNavigate(); }}
                className="w-full py-3 text-xs font-medium text-slate-300 hover:bg-white/[0.04] border-t border-white/[0.06] transition-colors"
              >
                View all alerts
              </button>
            </div>
          )}
        </div>

        {/* Client Workspace Switcher */}
        <div className="relative" ref={clientRef}>
          <button
            onClick={() => setClientOpen(o => !o)}
            className="hidden sm:flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-white/[0.04] transition-colors"
            title="Switch client workspace"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-950 font-bold text-xs" style={{ background: `linear-gradient(135deg, ${activeClient.accent}, ${activeClient.accent}dd)` }}>
              {activeClient.initials}
            </div>
            <div className="hidden lg:block text-left max-w-[120px]">
              <p className="text-xs font-semibold text-slate-100 truncate leading-none">{activeClient.name}</p>
              <p className="text-[9px] text-slate-500 truncate mt-0.5">{activeClient.industry}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${clientOpen ? 'rotate-180' : ''}`} />
          </button>

          {clientOpen && (
            <div className="absolute right-0 mt-2 w-[300px] max-w-[calc(100vw-2rem)] glass rounded-xl overflow-hidden animate-slide-up origin-top-right">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-brand-400" />
                <p className="font-semibold text-slate-100 text-sm">Switch Client Workspace</p>
              </div>
              <div className="max-h-[340px] overflow-y-auto">
                {clients.map(c => {
                  const active = c.id === activeClient.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => switchClient(c.id, c.name)}
                      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors text-left ${active ? 'bg-brand-500/[0.04]' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-950 font-bold text-xs shrink-0" style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent}dd)` }}>
                        {c.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{c.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{c.industry} · {c.location}</p>
                      </div>
                      {active && <Check className="w-4 h-4 text-brand-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="px-4 py-2.5 border-t border-white/[0.06] text-[10px] text-slate-500">
                {activeClient.keywordsTracked} keywords · Avg pos {activeClient.avgPosition} · {activeClient.visibility}% visibility
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
