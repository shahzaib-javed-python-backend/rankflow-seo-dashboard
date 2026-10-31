import { useState } from 'react';
import { Gauge, Zap, Clock, Layers, TrendingDown, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Loader2, Smartphone, Monitor } from 'lucide-react';
import { Card } from '@/components/ui';
import { useClient } from '@/components/ClientProvider';
import { useToast } from '@/components/Toast';

interface VitalMetric {
  key: 'lcp' | 'fid' | 'cls';
  label: string;
  fullName: string;
  value: number;
  unit: string;
  score: number;
  threshold: { good: number; needs: number };
  recommendation: string;
}

interface UrlAudit {
  url: string;
  device: 'desktop' | 'mobile';
  vitals: VitalMetric[];
  overallScore: number;
  lastChecked: string;
}

function genVitals(seed: number, device: 'desktop' | 'mobile'): VitalMetric[] {
  const mobilePenalty = device === 'mobile' ? 1.3 : 1;
  const lcp = +((1.8 + Math.sin(seed) * 0.8 + (device === 'mobile' ? 0.6 : 0)) * mobilePenalty).toFixed(2);
  const fid = +((40 + Math.cos(seed * 2) * 30 + (device === 'mobile' ? 20 : 0))).toFixed(0);
  const cls = +((0.05 + Math.abs(Math.sin(seed * 0.5)) * 0.15 + (device === 'mobile' ? 0.05 : 0))).toFixed(3);

  const lcpScore = lcp <= 2.5 ? 90 + Math.round((2.5 - lcp) * 20) : lcp <= 4 ? 60 + Math.round((4 - lcp) * 15) : 30;
  const fidScore = fid <= 100 ? 90 + Math.round((100 - fid) / 5) : fid <= 300 ? 60 + Math.round((300 - fid) / 12) : 35;
  const clsScore = cls <= 0.1 ? 90 + Math.round((0.1 - cls) * 200) : cls <= 0.25 ? 60 + Math.round((0.25 - cls) * 160) : 30;

  return [
    {
      key: 'lcp', label: 'LCP', fullName: 'Largest Contentful Paint', value: lcp, unit: 's', score: Math.min(100, lcpScore),
      threshold: { good: 2.5, needs: 4 },
      recommendation: lcp <= 2.5
        ? 'LCP is within good range. Maintain by keeping hero images optimized and server response under 200ms.'
        : 'Optimize hero image loading: use preload hints, serve WebP/AVIF formats, reduce server TTFB, and remove render-blocking CSS.',
    },
    {
      key: 'fid', label: 'FID', fullName: 'First Input Delay', value: Number(fid), unit: 'ms', score: Math.min(100, fidScore),
      threshold: { good: 100, needs: 300 },
      recommendation: fid <= 100
        ? 'FID is fast. Keep JavaScript bundles small to maintain responsiveness.'
        : 'Reduce JavaScript execution time: code-split large bundles, defer non-critical JS, and remove unused third-party scripts.',
    },
    {
      key: 'cls', label: 'CLS', fullName: 'Cumulative Layout Shift', value: cls, unit: '', score: Math.min(100, clsScore),
      threshold: { good: 0.1, needs: 0.25 },
      recommendation: cls <= 0.1
        ? 'Layout is stable. Continue setting explicit dimensions on images and ads.'
        : 'Set explicit width/height on images and embeds, reserve space for ads, and avoid injecting content above existing elements.',
    },
  ];
}

function buildAudits(clientDomain: string): UrlAudit[] {
  const baseSeed = clientDomain.length;
  const urls = [
    { path: '/', seed: baseSeed + 1 },
    { path: '/features', seed: baseSeed + 2 },
    { path: '/local', seed: baseSeed + 3 },
    { path: '/reports', seed: baseSeed + 4 },
  ];
  return urls.flatMap(u => [
    { url: u.path, device: 'desktop' as const, vitals: genVitals(u.seed, 'desktop'), overallScore: 0, lastChecked: '2h ago' },
    { url: u.path, device: 'mobile' as const, vitals: genVitals(u.seed + 10, 'mobile'), overallScore: 0, lastChecked: '2h ago' },
  ]).map(a => ({ ...a, overallScore: Math.round(a.vitals.reduce((s, v) => s + v.score, 0) / a.vitals.length) }));
}

function scoreColor(score: number): { text: string; bg: string; ring: string; label: string } {
  if (score >= 90) return { text: 'text-brand-400', bg: 'bg-brand-500/12', ring: 'stroke-brand-400', label: 'Good' };
  if (score >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500/12', ring: 'stroke-amber-400', label: 'Needs Work' };
  return { text: 'text-rose-400', bg: 'bg-rose-500/12', ring: 'stroke-rose-400', label: 'Poor' };
}

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const sc = scoreColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-ink-700" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="4" className={sc.ring} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${sc.text}`}>{score}</span>
      </div>
    </div>
  );
}

export function CoreWebVitalsCard() {
  const { activeClient } = useClient();
  const { toast } = useToast();
  const [audits, setAudits] = useState<UrlAudit[]>(() => buildAudits(activeClient.id === 'c1' ? 'shaheen' : activeClient.id === 'c2' ? 'blendz' : 'electronics'));
  const [scanning, setScanning] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'desktop' | 'mobile'>('all');

  const runAudit = () => {
    setScanning(true);
    toast('info', 'Running PageSpeed audit', `Scanning ${audits.length} URLs via Lighthouse API...`);
    setTimeout(() => {
      const domain = activeClient.id === 'c1' ? 'shaheen' : activeClient.id === 'c2' ? 'blendz' : 'electronics';
      setAudits(buildAudits(domain));
      setScanning(false);
      toast('success', 'Audit complete', `Core Web Vitals refreshed for ${audits.length} URLs`);
    }, 2000);
  };

  const filtered = deviceFilter === 'all' ? audits : audits.filter(a => a.device === deviceFilter);
  const avgScore = audits.length ? Math.round(audits.reduce((s, a) => s + a.overallScore, 0) / audits.length) : 0;
  const goodCount = audits.filter(a => a.overallScore >= 90).length;
  const needsCount = audits.filter(a => a.overallScore >= 50 && a.overallScore < 90).length;
  const poorCount = audits.filter(a => a.overallScore < 50).length;

  const vitalIcons = { lcp: Zap, fid: Clock, cls: Layers };
  const vitalColors = { lcp: 'text-sky-400', fid: 'text-violet-400', cls: 'text-accent-400' };

  return (
    <Card className="p-5 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100">Core Web Vitals & Page Speed</h2>
            <p className="text-xs text-slate-400 mt-0.5">Lighthouse audit scores for {activeClient.name} URLs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'desktop', 'mobile'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDeviceFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                deviceFilter === d ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20' : 'bg-ink-800/50 text-slate-400 border border-white/[0.04] hover:text-slate-200'
              }`}
            >
              {d === 'all' ? 'All' : d}
            </button>
          ))}
          <button onClick={runAudit} disabled={scanning} className="btn-primary px-3.5 py-1.5 text-xs">
            {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Run Audit
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="rounded-lg bg-ink-800/40 p-3.5 text-center">
          <ScoreRing score={avgScore} size={56} />
          <p className="text-[10px] text-slate-500 mt-1.5">Avg Score</p>
        </div>
        <div className="rounded-lg bg-brand-500/[0.08] p-3.5 text-center flex flex-col justify-center">
          <p className="text-2xl font-bold text-brand-400">{goodCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Good</p>
        </div>
        <div className="rounded-lg bg-amber-500/[0.08] p-3.5 text-center flex flex-col justify-center">
          <p className="text-2xl font-bold text-amber-400">{needsCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Needs Work</p>
        </div>
        <div className="rounded-lg bg-rose-500/[0.08] p-3.5 text-center flex flex-col justify-center">
          <p className="text-2xl font-bold text-rose-400">{poorCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Poor</p>
        </div>
      </div>

      {/* Per-URL audit rows */}
      <div className="space-y-3">
        {filtered.map((a, idx) => {
          const sc = scoreColor(a.overallScore);
          const StatusIcon = sc.label === 'Good' ? CheckCircle2 : sc.label === 'Needs Work' ? AlertTriangle : XCircle;
          return (
            <div key={`${a.url}-${a.device}-${idx}`} className="rounded-xl bg-ink-800/40 border border-white/[0.04] p-4 hover:border-white/[0.08] transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <ScoreRing score={a.overallScore} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-slate-200 truncate">{a.url}</span>
                    <span className={`chip ${sc.bg} ${sc.text} border border-white/[0.06] text-[9px]`}>
                      <StatusIcon className="w-2.5 h-2.5" /> {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {a.device === 'mobile' ? <Smartphone className="w-3 h-3 text-violet-400" /> : <Monitor className="w-3 h-3 text-sky-400" />}
                  <span className="text-[10px] text-slate-500 capitalize">{a.device} · checked {a.lastChecked}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {a.vitals.map(v => {
                  const VIcon = vitalIcons[v.key];
                  const vsc = scoreColor(v.score);
                  return (
                    <div key={v.key} className="rounded-lg bg-ink-900/40 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <VIcon className={`w-3.5 h-3.5 ${vitalColors[v.key]}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{v.label}</span>
                      </div>
                      <p className={`text-lg font-bold ${vsc.text} tabular-nums`}>
                        {v.value}<span className="text-xs text-slate-500 ml-0.5">{v.unit}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex-1 h-1 rounded-full bg-ink-700/60 overflow-hidden">
                          <div className={`h-full rounded-full ${v.score >= 90 ? 'bg-brand-400' : v.score >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${v.score}%` }} />
                        </div>
                        <span className="text-[9px] text-slate-500 tabular-nums">{v.score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendations for poor vitals */}
              {a.vitals.filter(v => v.score < 90).length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Optimization Recommendations
                  </p>
                  <ul className="space-y-1.5">
                    {a.vitals.filter(v => v.score < 90).map(v => (
                      <li key={v.key} className="text-xs text-slate-400 flex gap-2">
                        <span className="text-amber-400 shrink-0">{v.label}:</span>
                        <span>{v.recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
