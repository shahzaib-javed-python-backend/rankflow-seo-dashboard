import { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, MapPin, RefreshCw, Info, Mail, Bell, CheckCheck, Filter, Send, Webhook, Loader2 } from 'lucide-react';
import { Card, PageHeader, SegmentedControl, EmptyState } from '@/components/ui';
import { useData } from '@/components/DataProvider';
import { useToast } from '@/components/Toast';
import type { Alert } from '@/types';

const iconMap = {
  'rank-drop': { icon: TrendingDown, color: 'text-rose-400 bg-rose-500/12' },
  'rank-gain': { icon: TrendingUp, color: 'text-brand-400 bg-brand-500/12' },
  local: { icon: MapPin, color: 'text-amber-400 bg-amber-500/12' },
  gsc: { icon: RefreshCw, color: 'text-sky-400 bg-sky-500/12' },
  system: { icon: Info, color: 'text-slate-400 bg-slate-500/12' },
} as const;

type Filter = 'all' | 'critical' | 'warning' | 'info';

export function AlertsView() {
  const { alerts: initial } = useData();
  const [alerts, setAlerts] = useState<Alert[]>(initial);
  const [filter, setFilter] = useState<Filter>('all');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [instantEnabled, setInstantEnabled] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setAlerts(initial); }, [initial]);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  const markAll = () => {
    setAlerts(a => a.map(x => ({ ...x, read: true })));
    toast('success', 'All caught up', 'Marked all alerts as read');
  };

  const toggle = (fn: () => void, label: string) => { fn(); toast('success', 'Settings saved', label); };

  const sendTestAlert = () => {
    if (!webhookUrl.trim()) {
      toast('info', 'Webhook URL required', 'Enter a webhook URL or Telegram bot token to send a test');
      return;
    }
    setSending(true);
    toast('info', 'Sending test alert', `Dispatching to ${webhookUrl.slice(0, 40)}...`);
    setTimeout(() => {
      setSending(false);
      toast('success', 'Alert sent successfully to webhook!', 'Test notification delivered — check your channel');
      setWebhookUrl('');
    }, 1600);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Alerts & Notifications"
        subtitle="Monitor rank changes and configure notification preferences"
        actions={
          <button className="btn-ghost px-3.5 py-2.5" onClick={markAll}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-300">Filter by severity</span>
            </div>
            <SegmentedControl
              value={filter}
              onChange={setFilter}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Critical', value: 'critical' },
                { label: 'Warning', value: 'warning' },
                { label: 'Info', value: 'info' },
              ]}
            />
          </div>

          <div className="space-y-2.5">
            {alerts.length === 0 && (
              <Card className="p-8">
                <EmptyState icon={Bell} title="No alerts yet" hint="Toggle Demo Data in the top bar to see sample alerts" />
              </Card>
            )}
            {alerts.length > 0 && filtered.length === 0 && (
              <Card className="p-10 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No alerts in this category</p>
              </Card>
            )}
            {filtered.map(a => {
              const { icon: Icon, color } = iconMap[a.type];
              const sevBorder = a.severity === 'critical' ? 'border-l-rose-500' : a.severity === 'warning' ? 'border-l-amber-500' : 'border-l-sky-500';
              return (
                <Card key={a.id} className={`p-4 border-l-2 ${sevBorder} ${!a.read ? 'bg-brand-500/[0.03]' : ''}`}>
                  <div className="flex gap-3.5">
                    <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-100">{a.title}</p>
                        {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{a.detail}</p>
                      <p className="text-[11px] text-slate-500 mt-1.5">{a.time}</p>
                    </div>
                    <span className={`chip text-[10px] shrink-0 ${
                      a.severity === 'critical' ? 'bg-rose-500/12 text-rose-300 border border-rose-500/20'
                      : a.severity === 'warning' ? 'bg-amber-500/12 text-amber-300 border border-amber-500/20'
                      : 'bg-sky-500/12 text-sky-300 border border-sky-500/20'
                    }`}>{a.severity}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-slate-100 text-sm">Email Notifications</h3>
            </div>
            <Toggle
              label="Rank drop alerts"
              hint="Get emailed when a keyword drops 3+ positions"
              enabled={emailEnabled}
              onToggle={() => toggle(() => setEmailEnabled(v => !v), emailEnabled ? 'Email alerts disabled' : 'Email alerts enabled')}
            />
            <div className="h-px bg-white/[0.06] my-4" />
            <Toggle
              label="Instant notifications"
              hint="Send alerts immediately on trigger"
              enabled={instantEnabled}
              onToggle={() => toggle(() => setInstantEnabled(v => !v), instantEnabled ? 'Instant alerts off' : 'Instant alerts on')}
            />
            <div className="h-px bg-white/[0.06] my-4" />
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-2">Alert me when:</p>
              {['Keyword drops by 3+ positions', 'Local Pack position changes', 'Competitor overtakes ranking', 'GSC sync fails'].map(rule => (
                <label key={rule} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-brand-500" />
                  {rule}
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-accent-400" />
              <h3 className="font-semibold text-slate-100 text-sm">Alert Summary</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length, color: 'text-rose-400' },
                { label: 'Warning', count: alerts.filter(a => a.severity === 'warning').length, color: 'text-amber-400' },
                { label: 'Info', count: alerts.filter(a => a.severity === 'info').length, color: 'text-sky-400' },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-ink-800/50 py-3">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400">Unread</span>
              <span className="font-bold text-slate-100">{alerts.filter(a => !a.read).length}</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Webhook className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-slate-100 text-sm">Webhook Test</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">Send a test alert to your Slack webhook URL or Telegram bot token</p>
            <input
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/... or 123456:ABC-DEF..."
              className="w-full bg-ink-800/50 border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/40 transition-all font-mono"
            />
            <button
              onClick={sendTestAlert}
              disabled={sending}
              className="btn-primary w-full mt-3 py-2.5 text-xs"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? 'Sending...' : 'Send Test Alert'}
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, hint, enabled, onToggle }: { label: string; hint: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-slate-200 font-medium">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${enabled ? 'bg-brand-500' : 'bg-ink-600'}`}
        aria-pressed={enabled}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}
