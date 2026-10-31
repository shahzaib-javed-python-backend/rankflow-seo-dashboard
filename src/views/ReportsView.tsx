import { useRef, useState } from 'react';
import { Upload, Printer, FileText, Image as ImageIcon, Palette, Building2, User, Loader2, FileBarChart, TrendingUp, Users2, Target, Award, BarChart3, Calendar } from 'lucide-react';
import { Card, PageHeader, EmptyState } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { useData } from '@/components/DataProvider';

export function ReportsView() {
  const [agencyName, setAgencyName] = useState('Summit Digital');
  const [clientName, setClientName] = useState('RankFlow Inc.');
  const [primaryColor, setPrimaryColor] = useState('#14b88f');
  const [logo, setLogo] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { keywords, trendData, competitors, gscMetrics } = useData();

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
      toast('success', 'Logo uploaded', file.name);
    };
    reader.readAsDataURL(file);
  };

  const topKw = [...keywords].sort((a, b) => a.rank - b.rank).slice(0, 8);
  const avgPos = keywords.length ? (keywords.reduce((s, k) => s + k.rank, 0) / keywords.length).toFixed(1) : '0';
  const totalClicks = trendData.reduce((s, d) => s + d.gscClicks, 0).toLocaleString();
  const totalImpressions = gscMetrics.reduce((s, g) => s + g.impressions, 0).toLocaleString();
  const top3Count = keywords.filter(k => k.rank <= 3).length;
  const rival = competitors[1];
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (keywords.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="White-Label Report Builder" subtitle="Customize and export a client-ready SEO performance report" />
        <Card className="p-8">
          <EmptyState icon={FileBarChart} title="No report data available" hint="Toggle Demo Data in the top bar to generate a sample report" />
        </Card>
      </div>
    );
  }

  const print = () => {
    setGenerating(true);
    toast('info', 'Generating report', 'Preparing executive PDF...');
    setTimeout(() => {
      setGenerating(false);
      window.print();
      toast('success', 'Report ready', 'PDF sent to print dialog — choose "Save as PDF"');
    }, 1200);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="White-Label Report Builder"
        subtitle="Customize and export a client-ready SEO performance report"
        actions={
          <button className="btn-primary px-4 py-2.5 no-print" onClick={print} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            Generate PDF
          </button>
        }
      />

      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        <div className="space-y-4 no-print">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-100 text-sm mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-400" /> Branding
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Agency Logo</label>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-brand-500/40 hover:bg-brand-500/[0.03] transition-all group"
                >
                  {logo ? (
                    <img src={logo} alt="logo" className="max-h-16 max-w-full object-contain" />
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-lg bg-ink-700/60 flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                        <Upload className="w-4 h-4 text-slate-400 group-hover:text-brand-400" />
                      </div>
                      <span className="text-xs text-slate-400">Click to upload logo</span>
                    </>
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogo} />
                {logo && <button onClick={() => setLogo(null)} className="text-xs text-rose-400 hover:text-rose-300 mt-1.5">Remove</button>}
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Agency Name</label>
                <input value={agencyName} onChange={e => setAgencyName(e.target.value)} className="w-full bg-ink-800/50 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500/40 transition-all" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1.5"><User className="w-3 h-3" /> Client Name</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-ink-800/50 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500/40 transition-all" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1.5"><Palette className="w-3 h-3" /> Brand Color</label>
                <div className="flex items-center gap-2.5">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                  <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 bg-ink-800/50 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-brand-500/40" />
                </div>
                <div className="flex gap-2 mt-2">
                  {['#14b88f', '#3b82f6', '#ec8b1c', '#e11d48', '#8b5cf6'].map(c => (
                    <button key={c} onClick={() => setPrimaryColor(c)} className="w-6 h-6 rounded-md ring-2 ring-offset-2 ring-offset-ink-850 transition-all" style={{ background: c, boxShadow: primaryColor === c ? `0 0 0 2px ${c}` : 'none' }} />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-100 text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-400" /> Report Sections
            </h3>
            <div className="space-y-2">
              {['Executive Summary', 'Rank Trend Chart', 'Keyword Breakdown', 'Competitor Snapshot', 'GSC Performance'].map((s, i) => (
                <label key={s} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-brand-500" />
                  {s}
                  {i === 0 && <span className="chip bg-brand-500/12 text-brand-300 text-[9px] ml-auto">Required</span>}
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Executive PDF Document ── */}
        <div className="print-card bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl">
          {/* PAGE 1: COVER */}
          <div className="print-section min-h-[600px] flex flex-col" style={{ background: `linear-gradient(160deg, ${primaryColor}08, transparent 40%)` }}>
            <div className="p-10 border-b border-slate-200" style={{ background: `linear-gradient(135deg, ${primaryColor}12, transparent)` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {logo ? (
                    <img src={logo} alt="logo" className="max-h-12 max-w-[160px] object-contain" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: primaryColor }}>
                      {agencyName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{agencyName}</p>
                    <p className="text-xs text-slate-500">SEO Performance Report</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Prepared for</p>
                  <p className="font-semibold text-slate-900 text-lg">{clientName}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 justify-end"><Calendar className="w-3 h-3" /> {reportDate}</p>
                </div>
              </div>
            </div>

            <div className="p-10 flex-1 flex flex-col">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Executive SEO Report</h1>
                <p className="text-sm text-slate-500">Comprehensive performance analysis — October 2026</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {[
                  { label: 'Avg Position', value: avgPos, icon: Target, sub: 'across all tracked keywords' },
                  { label: 'Top 3 Keywords', value: top3Count, icon: Award, sub: 'ranking on page 1' },
                  { label: 'Total Clicks', value: totalClicks, icon: TrendingUp, sub: 'from Google Search' },
                  { label: 'Impressions', value: totalImpressions, icon: BarChart3, sub: 'search visibility' },
                ].map(kpi => (
                  <div key={kpi.label} className="rounded-xl border border-slate-200 p-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${primaryColor}15` }}>
                      <kpi.icon className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">{kpi.value}</p>
                    <p className="text-[10px] font-medium text-slate-600 mt-0.5">{kpi.label}</p>
                    <p className="text-[9px] text-slate-400">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Executive Summary */}
              <section className="print-section">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: primaryColor }}>Executive Summary</h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Over the past 6 months, <strong>{clientName}</strong> has improved its organic search presence significantly.
                  Average ranking position moved from <strong>24.6 to {avgPos}</strong>, while organic clicks from
                  Google Search Console reached <strong>{totalClicks}</strong> cumulative visits. {top3Count} keywords
                  now hold top-3 positions, and the overall visibility score climbed 8 points month-over-month.
                  The primary competitive gap is against <strong>{rival?.domain ?? 'N/A'}</strong>, with
                  <strong> {rival?.sharedKeywords.toLocaleString() ?? 0} shared keywords</strong> representing
                  actionable overlap for content strategy.
                </p>
              </section>

              {/* Rank Trend Chart */}
              <section className="mt-8 print-section">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: primaryColor }}>Rank Trend (6 Months)</h2>
                <div className="grid grid-cols-6 gap-2 items-end h-36 rounded-xl border border-slate-200 p-4">
                  {trendData.map(d => {
                    const h = Math.max(8, ((30 - d.avgPosition) / 30) * 100);
                    return (
                      <div key={d.month} className="flex flex-col items-center gap-1.5">
                        <span className="text-[9px] text-slate-500 font-medium tabular-nums">{d.avgPosition}</span>
                        <div className="w-full rounded-t-md transition-all" style={{ height: `${h}%`, background: primaryColor, opacity: 0.8 }} />
                        <span className="text-[10px] text-slate-600">{d.month}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Lower bar height = higher rank number (worse). Trend shows month-over-month improvement.</p>
              </section>

              <div className="mt-auto pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                <span>Generated by {agencyName} · Powered by RankFlow</span>
                <span>Page 1 of 3</span>
              </div>
            </div>
          </div>

          {/* PAGE 2: KEYWORD BREAKDOWN */}
          <div className="print-page-break print-section p-10 min-h-[500px]">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Keyword Performance Breakdown</h2>
            <p className="text-xs text-slate-500 mb-5">Top {topKw.length} performing keywords by current rank position</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Keyword</th>
                  <th className="py-2.5 font-semibold text-center">Rank</th>
                  <th className="py-2.5 font-semibold text-center">Change</th>
                  <th className="py-2.5 font-semibold text-center">Volume</th>
                  <th className="py-2.5 font-semibold text-center">Device</th>
                </tr>
              </thead>
              <tbody>
                {topKw.map(k => {
                  const change = k.prevRank - k.rank;
                  return (
                    <tr key={k.id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-700 font-medium">{k.term}</td>
                      <td className="py-3 text-center font-bold" style={{ color: primaryColor }}>#{k.rank}</td>
                      <td className="py-3 text-center">
                        {change > 0 ? (
                          <span className="text-green-600 font-medium text-xs">▲ {change}</span>
                        ) : change < 0 ? (
                          <span className="text-rose-600 font-medium text-xs">▼ {Math.abs(change)}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 text-center text-slate-600 tabular-nums">{k.volume.toLocaleString()}</td>
                      <td className="py-3 text-center text-slate-500 capitalize text-xs">{k.device}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-8 print-section">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: primaryColor }}>GSC Performance</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Clicks', value: gscMetrics.reduce((s, g) => s + g.clicks, 0).toLocaleString(), trend: '+12.4%' },
                  { label: 'Total Impressions', value: gscMetrics.reduce((s, g) => s + g.impressions, 0).toLocaleString(), trend: '+8.1%' },
                  { label: 'Avg CTR', value: `${(gscMetrics.reduce((s, g) => s + g.ctr, 0) / (gscMetrics.length || 1)).toFixed(2)}%`, trend: '+0.3%' },
                ].map(g => (
                  <div key={g.label} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{g.label}</p>
                    <p className="text-lg font-bold text-slate-900 mt-1 tabular-nums">{g.value}</p>
                    <p className="text-[10px] font-medium text-green-600">{g.trend} vs last period</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
              <span>Generated by {agencyName} · Powered by RankFlow</span>
              <span>Page 2 of 3</span>
            </div>
          </div>

          {/* PAGE 3: COMPETITOR SNAPSHOT */}
          <div className="print-page-break print-section p-10 min-h-[500px]">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Competitor Snapshot</h2>
            <p className="text-xs text-slate-500 mb-5">Benchmark analysis against tracked competitors</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {competitors.slice(0, 4).map((c, i) => (
                <div key={c.domain} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {i === 0 && <Award className="w-4 h-4" style={{ color: primaryColor }} />}
                    <p className="text-xs text-slate-500 font-medium">{c.domain}</p>
                    {i === 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: primaryColor }}>YOU</span>}
                  </div>
                  <p className="text-2xl font-bold text-slate-900">#{c.avgPosition.toFixed(1)}</p>
                  <p className="text-[11px] text-slate-500">avg position · {c.traffic} traffic</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.overlap}%`, background: i === 0 ? primaryColor : '#94a3b8' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{c.sharedKeywords.toLocaleString()} shared keywords · {c.overlap}% overlap</p>
                </div>
              ))}
            </div>

            <div className="print-section">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: primaryColor }}>Recommendations</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2"><span style={{ color: primaryColor }}>•</span> Prioritize content creation for unranked high-volume keywords where competitors hold Top 5 positions.</li>
                <li className="flex gap-2"><span style={{ color: primaryColor }}>•</span> Monitor rank volatility on keywords showing anomalous drops (Z-score &gt; 2) and investigate SERP feature changes.</li>
                <li className="flex gap-2"><span style={{ color: primaryColor }}>•</span> Expand local grid coverage in cells where average rank exceeds position 10 to improve 3-pack visibility.</li>
                <li className="flex gap-2"><span style={{ color: primaryColor }}>•</span> Leverage schema markup and featured snippet optimization for keywords currently ranking in positions 4–10.</li>
              </ul>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
              <span>Generated by {agencyName} · Powered by RankFlow</span>
              <span>Page 3 of 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
