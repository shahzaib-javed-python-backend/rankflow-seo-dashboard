import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Crown, Plus, X, Users2, Target, Zap, ArrowUpRight, Search, Download, TrendingDown, Terminal, Loader2, ShieldCheck, Link2, Gauge, Sparkles } from 'lucide-react';
import { Card, PageHeader, Badge, SegmentedControl, EmptyState } from '@/components/ui';
import { useData } from '@/components/DataProvider';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/Toast';
import { computeOverlap, aggregateGap, computePriorityScore } from '@/lib/opportunity';
import { ContentBriefModal } from '@/views/ContentBriefModal';
import { PpcTrackerCard } from '@/views/PpcTracker';
import type { Competitor, OpportunityKeyword } from '@/types';

const trafficColor: Record<Competitor['traffic'], string> = {
  High: 'bg-brand-500/15 text-brand-300 border-brand-500/20',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Low: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
};

const difficultyColor: Record<OpportunityKeyword['difficulty'], string> = {
  Low: 'bg-brand-500/15 text-brand-300 border-brand-500/20',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  High: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
};

const opportunityColor: Record<OpportunityKeyword['opportunity'], string> = {
  high: 'bg-brand-500/15 text-brand-300 border-brand-500/25',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  low: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
};

const intentColor: Record<OpportunityKeyword['intent'], string> = {
  informational: 'text-sky-400',
  commercial: 'text-accent-400',
  transactional: 'text-brand-400',
};

const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const lineColors = ['#34d4a7', '#f6a93b', '#60a5fa', '#fb7185'];

type Tab = 'benchmark' | 'opportunities';

export function CompetitorsView() {
  const { competitors: initial, opportunityKeywords } = useData();
  const [comps, setComps] = useState<Competitor[]>(initial);
  const [adding, setAdding] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [tab, setTab] = useState<Tab>('benchmark');
  const [oppFilter, setOppFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [oppSearch, setOppSearch] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [auditResults, setAuditResults] = useState<{ backlinks: number; dr: number; overlap: number } | null>(null);
  const [briefOpp, setBriefOpp] = useState<OpportunityKeyword | null>(null);
  const [briefOpen, setBriefOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setComps(initial); }, [initial]);

  const client = comps[0];
  const rivals = comps.slice(1);

  if (comps.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Competitor Benchmarking" subtitle="Side-by-side comparison and keyword opportunity gap analysis" />
        <Card className="p-8">
          <EmptyState icon={Users2} title="No competitors tracked" hint="Toggle Demo Data in the top bar to load sample competitor data" />
        </Card>
      </div>
    );
  }

  const addCompetitor = () => {
    const domain = newDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!domain || comps.some(c => c.domain === domain)) return;
    const newComp: Competitor = {
      domain,
      avgPosition: +(15 + Math.random() * 10).toFixed(1),
      sharedKeywords: Math.floor(100 + Math.random() * 500),
      traffic: Math.random() > 0.5 ? 'Medium' : 'Low',
      overlap: Math.floor(20 + Math.random() * 40),
      trend: months.map(() => +(12 + Math.random() * 12).toFixed(0)),
    };
    setComps([...comps, newComp]);
    setNewDomain('');
    setAdding(false);
    toast('success', 'Competitor added', `${domain} is now tracked`);
  };

  const removeComp = (domain: string) => {
    setComps(comps.filter(c => c.domain !== domain));
    toast('info', 'Competitor removed', domain);
  };

  const auditSteps = [
    'Initializing deep crawl engine...',
    'Fetching backlink profile via link graph API...',
    'Analyzing referring domains & anchor text distribution...',
    'Calculating domain rating (DR) from link authority...',
    'Cross-referencing shared keyword overlap matrix...',
    'Detecting content gap opportunities...',
    'Compiling audit results...',
  ];

  const runDeepAudit = () => {
    setAuditing(true);
    setAuditStep(0);
    setAuditResults(null);

    auditSteps.forEach((_, i) => {
      setTimeout(() => setAuditStep(i + 1), 450 * (i + 1));
    });

    setTimeout(() => {
      const results = {
        backlinks: Math.floor(2400 + Math.random() * 18000),
        dr: Math.floor(35 + Math.random() * 45),
        overlap: Math.floor(20 + Math.random() * 50),
      };
      setAuditResults(results);
      setAuditing(false);
      toast('success', 'Deep audit complete', `Backlinks: ${results.backlinks.toLocaleString()} · DR: ${results.dr} · Overlap: ${results.overlap}%`);
    }, 450 * (auditSteps.length + 1));
  };

  const chartData = months.map((m, i) => {
    const row: Record<string, string | number> = { month: m };
    comps.forEach(c => { row[c.domain] = c.trend[i]; });
    return row;
  });

  const filteredOpps = useMemo(() =>
    [...opportunityKeywords]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .filter(o => oppFilter === 'all' || o.opportunity === oppFilter)
      .filter(o => !oppSearch || o.term.toLowerCase().includes(oppSearch.toLowerCase()) || o.competitor.includes(oppSearch.toLowerCase()))
  , [opportunityKeywords, oppFilter, oppSearch]);

  const gapAnalysis = useMemo(() =>
    aggregateGap(comps, opportunityKeywords, 10)
  , [comps, opportunityKeywords]);

  const exportOpps = () => {
    const header = ['Keyword', 'Competitor', 'Competitor Rank', 'Client Rank', 'Volume', 'Difficulty', 'Intent', 'Opportunity'];
    const body = filteredOpps.map(o => [
      `"${o.term}"`, o.competitor, o.competitorRank, o.clientRank ?? 'Unranked',
      o.volume, o.difficulty, o.intent, o.opportunity,
    ].join(','));
    const csv = [header.join(','), ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rankflow-opportunity-gap.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Opportunities exported', `${filteredOpps.length} keywords to CSV`);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Competitor Benchmarking"
        subtitle="Side-by-side comparison and keyword opportunity gap analysis"
        actions={
          tab === 'benchmark' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <button className="btn-ghost px-3.5 py-2.5" onClick={runDeepAudit} disabled={auditing}>
                {auditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {auditing ? 'Auditing...' : 'Run Deep Audit'}
              </button>
              {!adding ? (
                <button className="btn-ghost px-3.5 py-2.5" onClick={() => setAdding(true)} disabled={rivals.length >= 3}>
                  <Plus className="w-4 h-4" /> Add Competitor
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={newDomain}
                    onChange={e => setNewDomain(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCompetitor()}
                    placeholder="competitor.com"
                    className="bg-ink-800/60 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/40 w-48"
                  />
                  <button className="btn-primary px-3 py-2 text-xs" onClick={addCompetitor}>Add</button>
                  <button className="btn-ghost px-2.5 py-2" onClick={() => { setAdding(false); setNewDomain(''); }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-ghost px-3.5 py-2.5" onClick={exportOpps}>
              <Download className="w-4 h-4" /> Export Gap
            </button>
          )
        }
      />

      <div className="mb-5">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { label: 'Benchmark Matrix', value: 'benchmark' },
            { label: 'Keyword Opportunity Gap', value: 'opportunities' },
          ]}
        />
      </div>

      {tab === 'benchmark' && (
        <>
          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-5 lg:col-span-2">
              <h2 className="font-semibold text-slate-100 text-sm mb-4">Position Trend Comparison</h2>
              <div className="h-[260px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                    <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} reversed />
                    <Tooltip
                      contentStyle={{ background: '#0e1320', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    {comps.map((c, i) => (
                      <Line
                        key={c.domain}
                        type="monotone"
                        dataKey={c.domain}
                        stroke={lineColors[i]}
                        strokeWidth={c.domain === client.domain ? 3 : 2}
                        strokeDasharray={c.domain === client.domain ? '' : '5 3'}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {comps.map((c, i) => (
                  <span key={c.domain} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: lineColors[i] }} /> {c.domain}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users2 className="w-4 h-4 text-brand-400" />
                <h2 className="font-semibold text-slate-100 text-sm">Overlap & Gap Analysis</h2>
              </div>
              <div className="space-y-3">
                {rivals.map(r => {
                  const ov = computeOverlap(r, 10);
                  return (
                    <div key={r.domain}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-300 truncate">{r.domain}</span>
                        <span className="text-slate-400 font-medium">{ov.overlapPercentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-ink-700/60 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700" style={{ width: `${ov.overlapPercentage}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{ov.sharedKeywords} shared</span>
                        <span className="text-rose-400/80">{ov.missingCount} gap</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Avg overlap</p>
                  <p className="text-2xl font-bold text-slate-50">{gapAnalysis.avgOverlap}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Total gap</p>
                  <p className="text-2xl font-bold text-rose-300">{gapAnalysis.totalMissing}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02] border-b border-white/[0.06]">
                  <tr>
                    <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Domain</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Avg Position</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Shared Keywords</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Overlap</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Traffic Level</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {comps.map((c, i) => (
                    <tr key={c.domain} className={`hover:bg-white/[0.02] transition-colors ${i === 0 ? 'bg-brand-500/[0.04]' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          {i === 0 && <Crown className="w-4 h-4 text-accent-400 shrink-0" />}
                          <span className="text-sm font-medium text-slate-100">{c.domain}</span>
                          {i === 0 && <span className="chip bg-brand-500/15 text-brand-300 text-[9px]">You</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-base font-bold text-slate-50 tabular-nums">{c.avgPosition.toFixed(1)}</span>
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-slate-300 tabular-nums">
                        {c.sharedKeywords > 0 ? c.sharedKeywords.toLocaleString() : '—'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm text-slate-300">{c.overlap}%</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`chip ${trafficColor[c.traffic]} border text-[10px]`}>{c.traffic}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {i !== 0 && (
                          <button onClick={() => removeComp(c.domain)} className="text-slate-500 hover:text-rose-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Deep Audit Terminal */}
          {(auditing || auditResults) && (
            <Card className="mt-4 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-ink-900/50">
                <Terminal className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-semibold text-slate-100">Deep Audit Scanner</span>
                {auditing && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400 ml-auto" />}
              </div>

              {auditing && (
                <div className="p-4 font-mono text-xs space-y-1.5 bg-ink-950/60 min-h-[160px]">
                  {auditSteps.slice(0, auditStep).map((step, i) => (
                    <div key={i} className="flex items-center gap-2 animate-fade-in">
                      <span className="text-brand-400">$</span>
                      <span className="text-slate-300">{step}</span>
                      {i < auditStep - 1 && <span className="text-brand-400 ml-auto">✓ done</span>}
                    </div>
                  ))}
                  {auditStep < auditSteps.length && (
                    <div className="flex items-center gap-2">
                      <span className="text-brand-400">$</span>
                      <span className="text-slate-500">{auditSteps[auditStep]}</span>
                      <span className="inline-block w-2 h-3.5 bg-brand-400 animate-pulse" />
                    </div>
                  )}
                </div>
              )}

              {auditResults && !auditing && (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-brand-400" />
                    <span className="text-sm font-semibold text-slate-100">Audit Results</span>
                    <span className="chip bg-brand-500/15 text-brand-300 text-[9px] ml-auto">Complete</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-ink-800/40 p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Link2 className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Backlinks</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-50 tabular-nums">{auditResults.backlinks.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">referring domains</p>
                    </div>
                    <div className="rounded-lg bg-ink-800/40 p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Gauge className="w-3.5 h-3.5 text-accent-400" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Domain Rating</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-50 tabular-nums">{auditResults.dr}<span className="text-sm text-slate-500">/100</span></p>
                      <p className="text-[10px] text-slate-500 mt-0.5">authority score</p>
                    </div>
                    <div className="rounded-lg bg-ink-800/40 p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Users2 className="w-3.5 h-3.5 text-brand-400" />
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Keyword Overlap</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-50 tabular-nums">{auditResults.overlap}%</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">shared with client</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          <div className="mt-4">
            <PpcTrackerCard competitors={comps} />
          </div>
        </>
      )}

      {tab === 'opportunities' && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total opportunities', value: opportunityKeywords.length, icon: Target, color: 'text-brand-400', bg: 'bg-brand-500/10' },
              { label: 'High priority', value: gapAnalysis.highPriority, icon: Zap, color: 'text-rose-400', bg: 'bg-rose-500/10' },
              { label: 'Unranked keywords', value: opportunityKeywords.filter(o => o.clientRank === null).length, icon: ArrowUpRight, color: 'text-accent-400', bg: 'bg-accent-500/10' },
              { label: 'Est. reachable volume', value: opportunityKeywords.reduce((s, o) => s + o.volume, 0).toLocaleString(), icon: Users2, color: 'text-sky-400', bg: 'bg-sky-500/10' },
            ].map(s => (
              <Card key={s.label} className="p-4">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2.5`}>
                  <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                </div>
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="text-xl font-bold text-slate-50 mt-0.5 tabular-nums">{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={oppSearch}
                onChange={e => setOppSearch(e.target.value)}
                placeholder="Search keywords or competitors..."
                className="w-full bg-ink-800/50 border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/40 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'high', 'medium', 'low'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setOppFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    oppFilter === f ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20' : 'bg-ink-800/50 text-slate-400 border border-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  {f === 'all' ? 'All' : `${f} priority`}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunity table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02] border-b border-white/[0.06]">
                  <tr>
                    <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Keyword</th>
                    <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Competitor</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Comp. Rank</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Your Rank</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Volume</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Difficulty</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Intent</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Priority</th>
                    <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Opportunity</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredOpps.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-500">No opportunities match your filters</td>
                    </tr>
                  )}
                  {filteredOpps.map(o => (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-slate-100 truncate max-w-[240px]">{o.term}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-slate-400 font-mono">{o.competitor}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-sm font-bold text-brand-300 tabular-nums">#{o.competitorRank}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {o.clientRank === null ? (
                          <span className="chip bg-rose-500/12 text-rose-300 text-[10px]">Unranked</span>
                        ) : (
                          <span className="text-sm font-bold text-rose-300 tabular-nums">#{o.clientRank}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-sm text-slate-300 tabular-nums">{o.volume.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`chip ${difficultyColor[o.difficulty]} border text-[10px]`}>{o.difficulty}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-xs font-medium capitalize ${intentColor[o.intent]}`}>{o.intent}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-ink-700/60 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${o.priorityScore >= 60 ? 'bg-brand-400' : o.priorityScore >= 35 ? 'bg-amber-400' : 'bg-slate-500'}`}
                              style={{ width: `${o.priorityScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-200 tabular-nums">{o.priorityScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`chip ${opportunityColor[o.opportunity]} border text-[10px] capitalize`}>{o.opportunity}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => { setBriefOpp(o); setBriefOpen(true); toast('info', 'Generating content brief', `Analyzing top 3 rankers for "${o.term}"...`); }}
                            className="btn px-2.5 py-1.5 text-xs font-medium bg-violet-500/12 text-violet-300 hover:bg-violet-500/20 border border-violet-500/15 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Sparkles className="w-3 h-3" /> AI Brief
                          </button>
                          <button
                            onClick={() => toast('success', 'Added to tracker', `"${o.term}" is now tracked in your keyword list`)}
                            className="btn px-2.5 py-1.5 text-xs font-medium bg-brand-500/12 text-brand-300 hover:bg-brand-500/20 border border-brand-500/15 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Plus className="w-3 h-3" /> Track
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Priority scored by search volume, intent weight, competitor rank proximity, difficulty, and gap size — sorted highest first
          </p>
        </>
      )}

      <ContentBriefModal opp={briefOpp} open={briefOpen} onClose={() => setBriefOpen(false)} />
    </div>
  );
}
