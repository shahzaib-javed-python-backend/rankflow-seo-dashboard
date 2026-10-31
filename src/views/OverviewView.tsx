import { useMemo } from 'react';
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis, Legend, ReferenceLine,
} from 'recharts';
import { Target, Trophy, Activity, Gauge, ArrowUpRight, Zap } from 'lucide-react';
import { Card, PageHeader, Badge, EmptyState } from '@/components/ui';
import { useData } from '@/components/DataProvider';
import { useClient } from '@/components/ClientProvider';
import { VolatilityGauge } from '@/views/VolatilityGauge';
import { CoreWebVitalsCard } from '@/views/CoreWebVitals';
import type { TrendDatum } from '@/types';

function StatCard({
  icon: Icon, label, value, delta, suffix, accent,
}: {
  icon: typeof Target; label: string; value: string; delta: number; suffix?: string; accent: string;
}) {
  return (
    <Card className="p-5 relative overflow-hidden group">
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full ${accent} opacity-[0.07] blur-2xl group-hover:opacity-[0.12] transition-opacity`} />
      <div className="flex items-start justify-between relative">
        <div className={`w-10 h-10 rounded-xl ${accent}/15 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${accent.replace('/15', '')}`} />
        </div>
        <Badge value={delta} />
      </div>
      <p className="text-sm text-slate-400 mt-4">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-3xl font-bold tracking-tight text-slate-50">{value}</span>
        {suffix && <span className="text-lg text-slate-400 font-medium">{suffix}</span>}
      </div>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2.5 text-xs">
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold text-slate-100">
            {p.name.includes('Clicks') ? p.value.toLocaleString() : p.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function OverviewView({ onGoKeywords }: { onGoKeywords: () => void }) {
  const { keywords: kwData, trendData } = useData();
  const { activeClient } = useClient();

  const stats = useMemo(() => {
    if (kwData.length === 0) return { avg: 0, top3: 0, movedUp: 0, movedDown: 0, visibility: 0, movedNet: 0 };
    const avg = kwData.reduce((s, k) => s + k.rank, 0) / kwData.length;
    const top3 = kwData.filter(k => k.rank <= 3).length;
    const movedUp = kwData.filter(k => k.rank < k.prevRank).length;
    const movedDown = kwData.filter(k => k.rank > k.prevRank).length;
    const visibility = Math.min(100, Math.round(100 - avg * 3.2));
    return { avg, top3, movedUp, movedDown, visibility, movedNet: movedUp - movedDown };
  }, [kwData]);

  if (kwData.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={`${activeClient.name} — Overview`} subtitle="Performance snapshot across all tracked keywords and locations" />
        <Card className="p-8">
          <EmptyState icon={Target} title="No data yet" hint="Toggle Demo Data in the top bar to populate all modules with sample data" />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${activeClient.name} — Overview`}
        subtitle={`${activeClient.industry} · ${activeClient.location} · ${activeClient.keywordsTracked} keywords tracked`}
        actions={
          <button className="btn-primary px-4 py-2.5" onClick={onGoKeywords}>
            <Zap className="w-4 h-4" /> Check Rankings (Demo)
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Target} label="Average Position" value={stats.avg.toFixed(1)} delta={-2} accent="text-brand-400" />
        <StatCard icon={Trophy} label="Top 3 Keywords" value={String(stats.top3)} delta={1} suffix="/ 10" accent="text-accent-400" />
        <StatCard icon={Activity} label="Rank Movement" value={`${stats.movedNet > 0 ? '+' : ''}${stats.movedNet}`} delta={stats.movedNet} suffix="net" accent="text-sky-400" />
        <StatCard icon={Gauge} label="Visibility Score" value={String(stats.visibility)} delta={8} suffix="%" accent="text-violet-400" />
      </div>

      <Card className="p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-semibold text-slate-100">Rank Trend vs Organic Clicks</h2>
            <p className="text-sm text-slate-400 mt-0.5">6-month average position vs Google Search Console clicks</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-400" /> Avg Position
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-400" /> GSC Clicks
            </span>
          </div>
        </div>

        <div className="h-[320px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData as TrendDatum[]} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d4a7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#34d4a7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f6a93b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#f6a93b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b2336" vertical={false} />
              <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} reversed />
              <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={10} yAxisId="left" stroke="#34d4a7" strokeDasharray="4 4" strokeOpacity={0.3} />
              <Area yAxisId="left" type="monotone" dataKey="avgPosition" name="Avg Position" stroke="#34d4a7" strokeWidth={2.5} fill="url(#posGrad)" dot={{ fill: '#34d4a7', r: 3 }} activeDot={{ r: 5 }} />
              <Area yAxisId="right" type="monotone" dataKey="gscClicks" name="GSC Clicks" stroke="#f6a93b" strokeWidth={2.5} fill="url(#clickGrad)" dot={{ fill: '#f6a93b', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Volatility + Web Vitals row */}
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4 mt-6">
        <VolatilityGauge />
        <CoreWebVitalsCard />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-100">Top Movers</h2>
            <button onClick={onGoKeywords} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {[...kwData].sort((a, b) => (a.rank - a.prevRank) - (b.rank - b.prevRank)).slice(0, 5).map(k => {
              const delta = k.prevRank - k.rank;
              return (
                <div key={k.id} className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{k.term}</p>
                    <p className="text-xs text-slate-500 truncate">{k.url}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-slate-100">#{k.rank}</span>
                    <Badge value={delta} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-slate-100 mb-4">Quick Snapshot</h2>
          <div className="space-y-3.5">
            {[
              { label: 'Keywords tracked', val: '10', sub: 'across 4 locations' },
              { label: 'SERP features captured', val: '23', sub: 'snippets, packs, videos' },
              { label: 'Local 3-Pack wins', val: '2', sub: 'Austin, Denver' },
              { label: 'Last full sync', val: '4m ago', sub: 'GSC healthy' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-[11px] text-slate-500">{item.sub}</p>
                </div>
                <span className="text-sm font-bold text-slate-100">{item.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
