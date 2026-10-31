import { useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { RefreshCw, CheckCircle2, AlertCircle, Link2, Loader2, MousePointerClick, Eye, TrendingUp, Target } from 'lucide-react';
import { Card, PageHeader, SegmentedControl, EmptyState } from '@/components/ui';
import { useData } from '@/components/DataProvider';
import { useToast } from '@/components/Toast';

type Range = '3m' | '6m' | '1y';

export function GscView() {
  const { gscMetrics } = useData();
  const [range, setRange] = useState<Range>('6m');
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(true);
  const { toast } = useToast();

  const data = useMemo(() => {
    if (gscMetrics.length === 0) return [];
    const slice = range === '3m' ? 3 : range === '6m' ? 6 : 12;
    return gscMetrics.slice(-slice);
  }, [range, gscMetrics]);

  const totals = useMemo(() => ({
    clicks: data.reduce((s, d) => s + d.clicks, 0),
    impressions: data.reduce((s, d) => s + d.impressions, 0),
    ctr: data.length ? data.reduce((s, d) => s + d.ctr, 0) / data.length : 0,
    position: data.length ? data.reduce((s, d) => s + d.position, 0) / data.length : 0,
  }), [data]);

  const sync = () => {
    setSyncing(true);
    setSynced(false);
    toast('info', 'Syncing with Google', 'Pulling latest Search Console data...');
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
      toast('success', 'GSC synced', `${totals.clicks.toLocaleString()} clicks across ${data.length} months`);
    }, 1800);
  };

  const metrics = [
    { icon: MousePointerClick, label: 'Clicks', value: totals.clicks.toLocaleString(), color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { icon: Eye, label: 'Impressions', value: totals.impressions.toLocaleString(), color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { icon: Target, label: 'Avg CTR', value: `${totals.ctr.toFixed(2)}%`, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { icon: TrendingUp, label: 'Avg Position', value: totals.position.toFixed(1), color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Search Console Sync"
        subtitle="Google Search Console integration and historical analytics"
        actions={
          <button className="btn-primary px-4 py-2.5" onClick={sync} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync Now
          </button>
        }
      />

      <Card className="p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-100 text-sm">Google Search Console</p>
              <p className="text-xs text-slate-400">Connected to sc-domain: rankflow.io</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium ${synced ? 'text-brand-300' : 'text-amber-300'}`}>
              {synced ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {syncing ? 'Syncing...' : synced ? 'Connected · Healthy' : 'Pending'}
            </span>
            <span className="text-xs text-slate-500">Last sync: 4m ago</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap gap-x-8 gap-y-2 text-xs">
          <span className="text-slate-400">Property: <span className="text-slate-200 font-medium">rankflow.io</span></span>
          <span className="text-slate-400">Account: <span className="text-slate-200 font-medium">admin@summitdigital.io</span></span>
          <span className="text-slate-400">Scopes: <span className="text-slate-200 font-medium">webmasters.readonly</span></span>
        </div>
      </Card>

      {data.length === 0 ? (
        <Card className="p-8">
          <EmptyState icon={RefreshCw} title="No GSC data synced" hint="Toggle Demo Data in the top bar to see sample Search Console analytics" />
        </Card>
      ) : (
      <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-100">Historical Performance</h2>
        <SegmentedControl
          value={range}
          onChange={setRange}
          options={[{ label: '3 Months', value: '3m' }, { label: '6 Months', value: '6m' }, { label: '1 Year', value: '1y' }]}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map(m => (
          <Card key={m.label} className="p-5">
            <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
              <m.icon className={`w-4.5 h-4.5 ${m.color}`} />
            </div>
            <p className="text-xs text-slate-400">{m.label}</p>
            <p className="text-2xl font-bold text-slate-50 mt-0.5 tabular-nums">{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-100 text-sm mb-4">Clicks & Impressions</h3>
          <div className="h-[260px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2336" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0e1320', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="clicks" name="Clicks" fill="#34d4a7" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="impressions" name="Impressions" fill="#1b2336" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-100 text-sm mb-4">CTR & Average Position</h3>
          <div className="h-[260px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b2336" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="l" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="r" orientation="right" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} reversed />
                <Tooltip
                  contentStyle={{ background: '#0e1320', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line yAxisId="l" type="monotone" dataKey="ctr" name="CTR %" stroke="#f6a93b" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                <Line yAxisId="r" type="monotone" dataKey="position" name="Position" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      </>
      )}
    </div>
  );
}
