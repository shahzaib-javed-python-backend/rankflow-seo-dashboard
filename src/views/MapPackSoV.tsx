import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartPie, Crown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';
import { useClient } from '@/components/ClientProvider';

const sovColors = ['#34d4a7', '#60a5fa', '#f6a93b', '#fb7185', '#a78bfa', '#94a3b8'];

interface SoVEntry {
  name: string;
  share: number;
  listings: number;
  avgRank: number;
  isClient: boolean;
}

function computeSoV(clientName: string, listings: { business: string; position: number }[]): SoVEntry[] {
  const grouped: Record<string, { count: number; rankSum: number; positions: number[] }> = {};
  listings.forEach(l => {
    if (!grouped[l.business]) grouped[l.business] = { count: 0, rankSum: 0, positions: [] };
    grouped[l.business].count++;
    grouped[l.business].rankSum += l.position;
    grouped[l.business].positions.push(l.position);
  });

  const total = listings.length;
  const entries: SoVEntry[] = Object.entries(grouped).map(([name, data]) => ({
    name,
    share: Math.round((data.count / total) * 100),
    listings: data.count,
    avgRank: +(data.rankSum / data.count).toFixed(1),
    isClient: name === clientName,
  }));

  return entries.sort((a, b) => b.share - a.share);
}

export function MapPackSoVCard() {
  const { activeClient } = useClient();

  // Simulated local listing dataset for SoV calculation
  const mockListings = useMemo(() => {
    const businesses = [
      { name: 'Shaheen Print Hub', queries: 6 },
      { name: 'Faisal Print Services', queries: 4 },
      { name: 'Al-Madina Printing', queries: 3 },
      { name: 'City Print Center', queries: 2 },
      { name: 'Express Print Hub', queries: 1 },
    ];
    const clientName = activeClient.id === 'c1' ? 'Shaheen Print Hub' : activeClient.id === 'c2' ? 'Blendz Marketing' : 'Faisalabad Electronics';

    // Replace first business with client name for context
    if (activeClient.id !== 'c1') businesses[0].name = clientName;

    const listings: { business: string; position: number }[] = [];
    businesses.forEach(b => {
      for (let i = 0; i < b.queries; i++) {
        listings.push({ business: b.name, position: Math.max(1, ((i + businesses.indexOf(b)) % 3) + 1) });
      }
    });
    return listings;
  }, [activeClient.id]);

  const clientName = activeClient.id === 'c1' ? 'Shaheen Print Hub' : activeClient.id === 'c2' ? 'Blendz Marketing' : 'Faisalabad Electronics';
  const sovEntries = useMemo(() => computeSoV(clientName, mockListings), [clientName, mockListings]);
  const clientShare = sovEntries.find(e => e.isClient)?.share ?? 0;
  const competitorShare = 100 - clientShare;

  const chartData = sovEntries.map(e => ({ name: e.name, value: e.share }));

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shrink-0">
          <ChartPie className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-100 text-sm">Map Pack Share of Voice</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Brand dominance across local 3-Pack results</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[180px_1fr] gap-4 items-center">
        {/* Donut chart */}
        <div className="relative">
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={sovColors[i % sovColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0e1320', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v) => [`${v}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-50 tabular-nums">{clientShare}%</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider">Your SoV</span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-2.5">
          {sovEntries.map((e, i) => (
            <div key={e.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 truncate">
                  {e.isClient && <Crown className="w-3 h-3 text-accent-400 shrink-0" />}
                  <span className={`truncate ${e.isClient ? 'font-semibold text-slate-100' : ''}`}>{e.name}</span>
                </span>
                <span className="font-bold text-slate-100 tabular-nums shrink-0">{e.share}%</span>
              </div>
              <div className="h-2 rounded-full bg-ink-700/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${e.share}%`, background: sovColors[i % sovColors.length] }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 mt-0.5">
                <span>{e.listings} listing{e.listings !== 1 ? 's' : ''}</span>
                <span>avg rank #{e.avgRank}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-brand-300 tabular-nums">{clientShare}%</p>
          <p className="text-[9px] text-slate-500">Your Share</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-rose-300 tabular-nums">{competitorShare}%</p>
          <p className="text-[9px] text-slate-500">Competitor Share</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-sky-300 tabular-nums flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {Math.max(0, clientShare - Math.round(competitorShare / (sovEntries.length - 1)))}%
          </p>
          <p className="text-[9px] text-slate-500">vs Avg Comp</p>
        </div>
      </div>
    </Card>
  );
}
