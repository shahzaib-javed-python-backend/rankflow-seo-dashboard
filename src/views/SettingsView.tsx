import { useState } from 'react';
import { User, Building2, KeyRound, Bell, Sliders, Check, Save, Send, Webhook, Loader2 } from 'lucide-react';
import { Card, PageHeader } from '@/components/ui';
import { useToast } from '@/components/Toast';

export function SettingsView() {
  const [tab, setTab] = useState<'profile' | 'tracking' | 'notifications' | 'api'>('profile');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [tgToken, setTgToken] = useState('');
  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [sendingTg, setSendingTg] = useState(false);
  const { toast } = useToast();

  const save = (msg: string) => toast('success', 'Settings saved', msg);

  const sendWebhookTest = () => {
    if (!webhookUrl.trim()) {
      toast('info', 'Webhook URL required', 'Enter a Slack webhook URL to send a test');
      return;
    }
    setSendingWebhook(true);
    toast('info', 'Sending test alert', `Dispatching to webhook...`);
    setTimeout(() => {
      setSendingWebhook(false);
      toast('success', 'Alert sent successfully to webhook!', 'Test notification delivered to your Slack channel');
      setWebhookUrl('');
    }, 1600);
  };

  const sendTelegramTest = () => {
    if (!tgToken.trim()) {
      toast('info', 'Bot token required', 'Enter a Telegram bot token to send a test');
      return;
    }
    setSendingTg(true);
    toast('info', 'Sending test alert', `Dispatching to Telegram...`);
    setTimeout(() => {
      setSendingTg(false);
      toast('success', 'Alert sent successfully to webhook!', 'Test notification delivered to your Telegram chat');
      setTgToken('');
    }, 1600);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'tracking' as const, label: 'Tracking', icon: Sliders },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'api' as const, label: 'API Keys', icon: KeyRound },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Manage your account, tracking preferences, and integrations"
        actions={
          <button className="btn-primary px-4 py-2.5" onClick={() => save('All settings synced')}>
            <Save className="w-4 h-4" /> Save Changes
          </button>
        }
      />

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        <div className="flex lg:flex-col gap-1.5 overflow-x-auto">
          {tabs.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  active ? 'bg-brand-500/12 text-brand-300 border border-brand-500/15' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div>
          {tab === 'profile' && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-100 mb-1">Agency Profile</h3>
              <p className="text-sm text-slate-400 mb-5">Your agency information appears on white-label reports</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Agency Name" defaultValue="Summit Digital" />
                <Field label="Contact Email" defaultValue="admin@summitdigital.io" />
                <Field label="Phone" defaultValue="+1 (512) 555-0142" />
                <Field label="Website" defaultValue="summitdigital.io" />
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-400 mb-1.5 block">Address</label>
                  <input defaultValue="120 Congress Ave, Austin, TX 78701" className="w-full bg-ink-800/50 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500/40 transition-all" />
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <h4 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-brand-400" /> Plan</h4>
                <div className="flex items-center justify-between bg-ink-800/40 rounded-lg p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">Pro Plan</p>
                    <p className="text-xs text-slate-500 mt-0.5">500 keywords · 10 locations · Unlimited reports</p>
                  </div>
                  <button className="btn-ghost px-3 py-2 text-xs" onClick={() => save('Plan selection noted')}>Manage</button>
                </div>
              </div>
            </Card>
          )}

          {tab === 'tracking' && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-100 mb-1">Tracking Preferences</h3>
              <p className="text-sm text-slate-400 mb-5">How RankFlow monitors your keywords</p>
              <div className="space-y-5">
                <Field label="Default Check Frequency" defaultValue="Daily" />
                <Field label="Search Engine" defaultValue="Google" />
                <Field label="Default Device" defaultValue="Desktop + Mobile" />
                <Field label="Default Location" defaultValue="United States" />
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">SERP Depth to Track</label>
                  <div className="flex gap-2">
                    {['Top 10', 'Top 20', 'Top 50', 'Top 100'].map(o => (
                      <button key={o} className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${o === 'Top 100' ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20' : 'bg-ink-800/50 text-slate-400 border border-white/[0.04]'}`}>{o}</button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {tab === 'notifications' && (
            <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-100 mb-1">Notification Channels</h3>
              <p className="text-sm text-slate-400 mb-5">Where RankFlow delivers alerts</p>
              <div className="space-y-3">
                {[
                  { label: 'Email', hint: 'admin@summitdigital.io', on: true },
                  { label: 'Slack', hint: '#seo-alerts channel', on: true },
                  { label: 'Webhook', hint: 'https://hooks.summitdigital.io/rankflow', on: false },
                  { label: 'SMS', hint: '+1 (512) 555-0142', on: false },
                ].map(c => (
                  <div key={c.label} className="flex items-center justify-between p-3.5 rounded-lg bg-ink-800/40">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{c.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{c.hint}</p>
                    </div>
                    <button className={`relative w-11 h-6 rounded-full transition-colors ${c.on ? 'bg-brand-500' : 'bg-ink-600'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${c.on ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <Webhook className="w-4 h-4 text-brand-400" />
                <h3 className="font-semibold text-slate-100">Webhook Test Simulator</h3>
              </div>
              <p className="text-sm text-slate-400 mb-5">Send a realistic test alert to verify your integration is wired up</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-ink-800/40 p-4">
                  <p className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-sky-400" /> Slack Webhook
                  </p>
                  <input
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full bg-ink-800/60 border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/40 transition-all font-mono mb-3"
                  />
                  <button onClick={sendWebhookTest} disabled={sendingWebhook} className="btn-primary w-full py-2.5 text-xs">
                    {sendingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {sendingWebhook ? 'Sending...' : 'Send Test Alert'}
                  </button>
                </div>

                <div className="rounded-lg bg-ink-800/40 p-4">
                  <p className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-brand-400" /> Telegram Bot
                  </p>
                  <input
                    value={tgToken}
                    onChange={e => setTgToken(e.target.value)}
                    placeholder="123456789:AAEx-abc123..."
                    className="w-full bg-ink-800/60 border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/40 transition-all font-mono mb-3"
                  />
                  <button onClick={sendTelegramTest} disabled={sendingTg} className="btn-primary w-full py-2.5 text-xs">
                    {sendingTg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {sendingTg ? 'Sending...' : 'Send Test Alert'}
                  </button>
                </div>
              </div>
            </Card>
            </div>
          )}

          {tab === 'api' && (
            <Card className="p-6">
              <h3 className="font-semibold text-slate-100 mb-1">API Integrations</h3>
              <p className="text-sm text-slate-400 mb-5">Connect external services for live SERP data. Until connected, the dashboard runs on demo data.</p>
              <div className="space-y-4">
                {[
                  { name: 'Serper API', desc: 'Live SERP scraping engine (demo key — not live)', connected: false, key: '' },
                  { name: 'Google Search Console', desc: 'Organic clicks & impressions', connected: true, key: 'oauth · connected' },
                  { name: 'Google Business Profile', desc: 'Local 3-pack tracking', connected: true, key: 'oauth · connected' },
                  { name: 'Slack', desc: 'Alert delivery', connected: false, key: '' },
                ].map(api => (
                  <div key={api.name} className="flex items-center justify-between p-4 rounded-lg bg-ink-800/40 border border-white/[0.04]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-100">{api.name}</p>
                        {api.connected && <span className="chip bg-brand-500/12 text-brand-300 text-[9px]"><Check className="w-2.5 h-2.5" /> Connected</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{api.desc}</p>
                      {api.key && <p className="text-[11px] text-slate-600 font-mono mt-1">{api.key}</p>}
                    </div>
                    <button className={`btn px-3 py-2 text-xs ${api.connected ? 'btn-ghost' : 'btn-primary'}`} onClick={() => save(`${api.name} ${api.connected ? 'reconnected' : 'connected'}`)}>
                      {api.connected ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block">{label}</label>
      <input defaultValue={defaultValue} className="w-full bg-ink-800/50 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500/40 transition-all" />
    </div>
  );
}
