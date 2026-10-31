import { useMemo, useState, useEffect } from 'react';
import { Zap, Download, ArrowUpDown, Smartphone, Monitor, Loader2, TrendingDown, TrendingUp, AlertTriangle, GitCompare } from 'lucide-react';
import { Card, PageHeader, Badge, EmptyState } from '@/components/ui';
import { SlideOver } from '@/components/SlideOver';
import { serpFeatureLabel } from '@/data';
import { useData } from '@/components/DataProvider';
import { serpFeatureIcon, serpFeatureColor } from '@/components/serpFeatures';
import { useToast } from '@/components/Toast';
import { AiDiagnosisPanel, AiAnalyzeButton } from '@/views/AiDiagnosisPanel';
import { detectAnomaly } from '@/lib/stats';
import type { Keyword } from '@/types';

function exportCsv(rows: Keyword[]) {
  const header = ['Keyword', 'URL', 'Rank', 'Previous Rank', 'Change', 'Volume', 'Features', 'Device', 'Location', 'Last Checked'];
  const body = rows.map(k => [
    `"${k.term}"`, k.url, k.rank, k.prevRank, k.prevRank - k.rank, k.volume,
    `"${k.features.map(f => serpFeatureLabel[f]).join('; ')}"`, k.device, k.location, k.lastChecked,
  ].join(','));
  const csv = [header.join(','), ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rankflow-keywords.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function KeywordsView() {
  const { keywords: initialKw } = useData();
  const [rows, setRows] = useState<Keyword[]>(initialKw);
  const [checking, setChecking] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<'rank' | 'volume' | 'term'>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<'all' | 'desktop' | 'mobile'>('all');
  const [aiKeyword, setAiKeyword] = useState<Keyword | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [diffKeyword, setDiffKeyword] = useState<Keyword | null>(null);
  const [diffOpen, setDiffOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setRows(initialKw); }, [initialKw]);

  const sorted = useMemo(() => {
    let r = [...rows];
    if (filter !== 'all') r = r.filter(k => k.device === filter);
    r.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'rank') cmp = a.rank - b.rank;
      else if (sortKey === 'volume') cmp = a.volume - b.volume;
      else cmp = a.term.localeCompare(b.term);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return r;
  }, [rows, sortKey, sortDir, filter]);

  const anomalyMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof detectAnomaly>> = {};
    for (const k of rows) {
      map[k.id] = detectAnomaly(k.history, k.rank);
    }
    return map;
  }, [rows]);

  const anomalyCount = useMemo(() =>
    Object.values(anomalyMap).filter(a => a.isAnomaly).length
  , [anomalyMap]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const checkNow = (id: string) => {
    setChecking(s => new Set(s).add(id));
    setTimeout(() => {
      setRows(prev => prev.map(k => {
        if (k.id !== id) return k;
        const shift = Math.floor(Math.random() * 5) - 2;
        const newRank = Math.max(1, k.rank + shift);
        return { ...k, prevRank: k.rank, rank: newRank, lastChecked: 'just now' };
      }));
      setChecking(s => { const n = new Set(s); n.delete(id); return n; });
      const k = rows.find(x => x.id === id);
      if (k) toast('info', 'Demo SERP refreshed', `"${k.term}" position simulated (demo data)`);
    }, 1400);
  };

  const checkAll = () => {
    setChecking(new Set(rows.map(r => r.id)));
    toast('info', 'Running bulk check', `Simulating refresh for ${rows.length} keywords (demo data)...`);
    setTimeout(() => {
      setRows(prev => prev.map(k => {
        const shift = Math.floor(Math.random() * 5) - 2;
        return { ...k, prevRank: k.rank, rank: Math.max(1, k.rank + shift), lastChecked: 'just now' };
      }));
      setChecking(new Set());
      toast('success', 'Bulk check complete', `${rows.length} keywords simulated (demo data)`);
    }, 1800);
  };

  const openAi = (k: Keyword) => {
    setAiKeyword(k);
    setAiOpen(true);
    toast('info', 'AI diagnosis started', `Analyzing drop for "${k.term}"...`);
  };

  const openDiff = (k: Keyword) => {
    setDiffKeyword(k);
    setDiffOpen(true);
    toast('info', 'Loading SERP diff', `Comparing historical vs current SERP for "${k.term}"...`);
  };

  const Th = ({ label, sortK, className = '' }: { label: string; sortK?: typeof sortKey; className?: string }) => (
    <th className={`text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 ${className}`}>
      {sortK ? (
        <button onClick={() => toggleSort(sortK)} className="flex items-center gap-1 hover:text-slate-200 transition-colors">
          {label} <ArrowUpDown className="w-3 h-3" />
        </button>
      ) : label}
    </th>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Keywords"
        subtitle="Keyword rank tracking with one-click position refresh (demo data)"
        actions={
          <>
            <span className="chip bg-amber-500/12 text-amber-300 border border-amber-500/20 text-[10px]">Demo Data</span>
            <button className="btn-ghost px-3.5 py-2.5" onClick={() => { exportCsv(sorted); toast('success', 'Export ready', `${sorted.length} keywords exported to CSV`); }}>
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button className="btn-primary px-4 py-2.5" onClick={checkAll} disabled={checking.size > 0}>
              {checking.size > 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Check All
            </button>
          </>
        }
      />

      <div className="flex gap-2 mb-4 items-center">
        {(['all', 'desktop', 'mobile'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20' : 'bg-ink-800/50 text-slate-400 hover:text-slate-200 border border-white/[0.04]'
            }`}
          >
            {f === 'all' ? 'All devices' : f}
          </button>
        ))}
        {anomalyCount > 0 && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {anomalyCount} anomaly{anomalyCount !== 1 ? 'ies' : ''} detected (Z &gt; 2)
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <Card className="p-8">
          <EmptyState icon={Zap} title="No keywords tracked yet" hint="Toggle Demo Data in the top bar to load sample keywords, or add keywords from Settings" />
        </Card>
      ) : (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                <Th label="Keyword" sortK="term" />
                <Th label="Target URL" />
                <Th label="Rank" sortK="rank" />
                <Th label="Change" />
                <Th label="Volume" sortK="volume" />
                <Th label="SERP Features" />
                <Th label="Last Checked" />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sorted.map(k => {
                const delta = k.prevRank - k.rank;
                const isChecking = checking.has(k.id);
                return (
                  <tr key={k.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          k.device === 'mobile' ? 'bg-violet-500/10 text-violet-400' : 'bg-sky-500/10 text-sky-400'
                        }`}>
                          {k.device === 'mobile' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-100 truncate max-w-[220px]">{k.term}</p>
                            {anomalyMap[k.id]?.isAnomaly && (
                              <span
                                title={`Z-score: ${anomalyMap[k.id].zScore} · 14-day MA: ${anomalyMap[k.id].movingAvg} · σ: ${anomalyMap[k.id].std}`}
                                className="flex items-center gap-1 text-[9px] font-bold text-rose-300 bg-rose-500/15 border border-rose-500/25 rounded px-1.5 py-0.5 shrink-0"
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                ANOMALY
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{k.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-400 font-mono truncate max-w-[180px] block">{k.url}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <span className={`text-base font-bold ${isChecking ? 'text-slate-600' : 'text-slate-50'} tabular-nums transition-all`}>
                          {isChecking ? '?' : k.rank}
                        </span>
                        {isChecking && (
                          <span className="absolute -left-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {isChecking ? (
                        <span className="text-xs text-slate-500">updating…</span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          delta > 0 ? 'text-brand-300' : delta < 0 ? 'text-rose-300' : 'text-slate-500'
                        }`}>
                          {delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : delta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                          {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-300 tabular-nums">{k.volume.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 flex-wrap max-w-[180px]">
                        {k.features.slice(0, 3).map(f => {
                          const Icon = serpFeatureIcon[f];
                          return (
                            <span key={f} className={`w-6 h-6 rounded-md flex items-center justify-center ${serpFeatureColor[f]}`} title={serpFeatureLabel[f]}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                          );
                        })}
                        {k.features.length > 3 && (
                          <span className="text-[10px] text-slate-500 self-center">+{k.features.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-500">{k.lastChecked}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {delta <= -3 && !isChecking && (
                          <AiAnalyzeButton keyword={k} onClick={openAi} />
                        )}
                        <button
                          onClick={() => openDiff(k)}
                          className="btn px-3 py-1.5 text-xs font-medium bg-sky-500/12 text-sky-300 hover:bg-sky-500/20 border border-sky-500/15 transition-all"
                          title="View SERP visual diff"
                        >
                          <GitCompare className="w-3 h-3" /> Visual Diff
                        </button>
                        <button
                          onClick={() => checkNow(k.id)}
                          disabled={isChecking}
                          className={`btn px-3 py-1.5 text-xs font-medium ${
                            isChecking
                              ? 'bg-ink-800/60 text-slate-500'
                              : 'bg-brand-500/12 text-brand-300 hover:bg-brand-500/20 border border-brand-500/15'
                          }`}
                        >
                          {isChecking ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Checking</>
                          ) : (
                            <><Zap className="w-3 h-3" /> Check Now</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      <AiDiagnosisPanel keyword={aiKeyword} open={aiOpen} onClose={() => setAiOpen(false)} />
      <SerpDiffPanel keyword={diffKeyword} open={diffOpen} onClose={() => setDiffOpen(false)} />
    </div>
  );
}

function SerpDiffPanel({ keyword, open, onClose }: { keyword: Keyword | null; open: boolean; onClose: () => void }) {
  if (!keyword) return null;

  const prevRank = keyword.prevRank;
  const currRank = keyword.rank;
  const movedUp = currRank < prevRank;

  const oldTitle = `${keyword.term} | RankFlow`;
  const newTitle = `${keyword.term} — Free Tool & Guide | RankFlow`;
  const oldMeta = `Track your keyword rankings with RankFlow. Start monitoring your SEO performance today.`;
  const newMeta = `Compare your rankings with live SERP data. ${keyword.volume.toLocaleString()} monthly searches. See why top sites rank higher and what to fix. Try free.`;

  return (
    <SlideOver open={open} onClose={onClose} title="Visual SERP Diff" subtitle={`Comparing "${keyword.term}" — ${prevRank > currRank ? `${prevRank} → ${currRank} (gained ${prevRank - currRank})` : `${prevRank} → ${currRank} (lost ${currRank - prevRank})`}`} width="max-w-lg">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300 mb-1">Previous SERP</p>
            <p className="text-2xl font-bold text-slate-100">#{prevRank}</p>
            <p className="text-[10px] text-slate-500">captured 7 days ago</p>
          </div>
          <div className="rounded-xl border border-brand-500/20 bg-brand-500/[0.04] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-300 mb-1">Current SERP</p>
            <p className="text-2xl font-bold text-slate-100">#{currRank}</p>
            <p className="text-[10px] text-slate-500">captured just now</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <p className="text-xs font-semibold text-slate-300">Previous Snippet (Position #{prevRank})</p>
          </div>
          <div className="rounded-xl bg-ink-800/40 border border-white/[0.06] p-4 opacity-70">
            <p className="text-[10px] text-slate-500 font-mono truncate">{keyword.url}</p>
            <p className="text-sm text-sky-400 mt-1 truncate group-hover:underline">{oldTitle}</p>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{oldMeta}</p>
            <div className="flex gap-1.5 mt-2">
              {keyword.features.slice(0, 2).map(f => (
                <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">{serpFeatureLabel[f]}</span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-brand-400" />
            <p className="text-xs font-semibold text-slate-300">Current Snippet (Position #{currRank})</p>
            {movedUp && <span className="chip bg-brand-500/15 text-brand-300 text-[9px] ml-auto">▲ improved</span>}
          </div>
          <div className="rounded-xl bg-ink-800/40 border border-brand-500/20 p-4">
            <p className="text-[10px] text-slate-500 font-mono truncate">{keyword.url}</p>
            <p className="text-sm text-sky-400 mt-1 truncate font-medium">{newTitle}</p>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{newMeta}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {keyword.features.map(f => (
                <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300">{serpFeatureLabel[f]}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-ink-800/40 border border-white/[0.06] p-4">
          <p className="text-xs font-semibold text-slate-200 mb-2">Detected Changes</p>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex gap-2">
              <span className={movedUp ? 'text-brand-400' : 'text-rose-400'}>•</span>
              <span>Position {movedUp ? 'improved' : 'declined'} by {Math.abs(prevRank - currRank)} {movedUp ? 'places (gained)' : 'places (lost)'}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>Title tag expanded with benefit modifier "— Free Tool & Guide"</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>Meta description rewritten to include search volume and CTA</span>
            </li>
            {keyword.features.length > 2 && (
              <li className="flex gap-2">
                <span className="text-brand-400">•</span>
                <span>New SERP feature captured: {serpFeatureLabel[keyword.features[keyword.features.length - 1]]}</span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-sky-400">•</span>
              <span>Competitor snippet at #{currRank - 1} now includes FAQ schema</span>
            </li>
          </ul>
        </div>
      </div>
    </SlideOver>
  );
}
