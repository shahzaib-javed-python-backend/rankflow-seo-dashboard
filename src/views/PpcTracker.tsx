import { useState } from 'react';
import { DollarSign, TrendingUp, Eye, Target, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui';
import { useClient } from '@/components/ClientProvider';
import { useToast } from '@/components/Toast';
import type { Competitor } from '@/types';

interface PpcData {
  domain: string;
  hasAds: boolean;
  adKeywords: number;
  estMonthlySpend: number;
  avgAdPosition: number;
  adVisibility: number;
  topAds: { keyword: string; estCpc: number; position: number }[];
}

function genPpcData(comps: Competitor[]): PpcData[] {
  return comps.map((c, i) => {
    const hasAds = i > 0 && c.traffic !== 'Low';
    const adKeywords = hasAds ? Math.floor(50 + c.sharedKeywords * 0.3 + Math.random() * 200) : 0;
    const estMonthlySpend = hasAds ? Math.round(adKeywords * (8 + Math.random() * 15) * 30) : 0;
    const avgAdPosition = hasAds ? +(1 + Math.random() * 3).toFixed(1) : 0;
    const adVisibility = hasAds ? Math.round(20 + Math.random() * 60) : 0;
    const topAds = hasAds ? [
      { keyword: 'seo tool free trial', estCpc: +(3 + Math.random() * 8).toFixed(2), position: 1 },
      { keyword: 'rank tracker software', estCpc: +(5 + Math.random() * 10).toFixed(2), position: 2 },
      { keyword: 'serp analysis tool', estCpc: +(2 + Math.random() * 6).toFixed(2), position: 1 },
    ] : [];
    return { domain: c.domain, hasAds, adKeywords, estMonthlySpend, avgAdPosition, adVisibility, topAds };
  });
}

export function PpcTrackerCard({ competitors }: { competitors: Competitor[] }) {
  const { activeClient } = useClient();
  const { toast } = useToast();
  const [data, setData] = useState<PpcData[]>(() => genPpcData(competitors));
  const [scanning, setScanning] = useState(false);

  const rescan = () => {
    setScanning(true);
    toast('info', 'Scanning PPC landscape', 'Detecting paid search listings across competitors...');
    setTimeout(() => {
      setData(genPpcData(competitors));
      setScanning(false);
      const adCompetitors = data.filter(d => d.hasAds).length;
      toast('success', 'PPC scan complete', `Found ${adCompetitors} competitors running paid ads`);
    }, 1800);
  };

  const totalSpend = data.reduce((s, d) => s + d.estMonthlySpend, 0);
  const totalAdKws = data.reduce((s, d) => s + d.adKeywords, 0);
  const adCompetitors = data.filter(d => d.hasAds).length;

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">PPC Visibility & Ad Spend Tracker</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Competitor paid search detection for {activeClient.name}</p>
          </div>
        </div>
        <button onClick={rescan} disabled={scanning} className="btn-ghost px-3.5 py-2 text-xs">
          {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Rescan Ads
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg bg-amber-500/[0.08] p-3 text-center">
          <DollarSign className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-amber-300 tabular-nums">${(totalSpend / 1000).toFixed(1)}K</p>
          <p className="text-[9px] text-slate-500">Est. Monthly Spend</p>
        </div>
        <div className="rounded-lg bg-sky-500/[0.08] p-3 text-center">
          <Target className="w-4 h-4 text-sky-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-sky-300 tabular-nums">{totalAdKws}</p>
          <p className="text-[9px] text-slate-500">Ad Keywords</p>
        </div>
        <div className="rounded-lg bg-rose-500/[0.08] p-3 text-center">
          <Eye className="w-4 h-4 text-rose-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-rose-300 tabular-nums">{adCompetitors}</p>
          <p className="text-[9px] text-slate-500">Active Advertisers</p>
        </div>
      </div>

      {/* Per-competitor table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.04]">
        <table className="w-full">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr>
              <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">Domain</th>
              <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">PPC Active</th>
              <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">Ad Keywords</th>
              <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">Est. Spend/mo</th>
              <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">Avg Ad Pos</th>
              <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-2.5">Visibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {data.map(d => (
              <tr key={d.domain} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-slate-200 truncate block max-w-[160px]">{d.domain}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {d.hasAds ? (
                    <span className="chip bg-amber-500/12 text-amber-300 border border-amber-500/20 text-[10px]">
                      <DollarSign className="w-2.5 h-2.5" /> Bidding
                    </span>
                  ) : (
                    <span className="chip bg-slate-500/10 text-slate-500 border border-white/[0.06] text-[10px]">None</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-slate-300 tabular-nums">{d.adKeywords > 0 ? d.adKeywords.toLocaleString() : '—'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-bold text-amber-300 tabular-nums">{d.estMonthlySpend > 0 ? `$${d.estMonthlySpend.toLocaleString()}` : '—'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-slate-300 tabular-nums">{d.avgAdPosition > 0 ? `#${d.avgAdPosition}` : '—'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {d.adVisibility > 0 ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-14 h-1.5 rounded-full bg-ink-700/60 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${d.adVisibility}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-200 tabular-nums">{d.adVisibility}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top detected ad keywords */}
      {data.some(d => d.topAds.length > 0) && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-amber-400" /> Top Detected Ad Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {data.filter(d => d.topAds.length > 0).flatMap(d => d.topAds).slice(0, 8).map((ad, i) => (
              <span key={i} className="chip bg-amber-500/10 text-amber-300 border border-amber-500/15 text-[10px]">
                {ad.keyword} · ${ad.estCpc}/cpc
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
