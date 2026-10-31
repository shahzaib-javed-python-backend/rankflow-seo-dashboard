import { useMemo, useState } from 'react';
import { FileCheck2, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Loader2, Building, MapPin, Phone } from 'lucide-react';
import { Card, PageHeader, EmptyState } from '@/components/ui';
import { useClient } from '@/components/ClientProvider';
import { useToast } from '@/components/Toast';
import { citations as allCitations, canonicalNAP, type Citation } from '@/data/citations';

const statusConfig = {
  consistent: { icon: CheckCircle2, color: 'text-brand-400', bg: 'bg-brand-500/12', border: 'border-brand-500/20', label: 'Consistent' },
  inconsistent: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/12', border: 'border-amber-500/20', label: 'Inconsistent' },
  missing: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/12', border: 'border-rose-500/20', label: 'Missing' },
} as const;

export function CitationsView() {
  const { activeClient } = useClient();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [rows, setRows] = useState<Citation[]>(allCitations);

  const healthScore = useMemo(() => {
    if (rows.length === 0) return 0;
    const points = rows.reduce((s, c) => {
      if (c.status === 'consistent') return s + 100;
      if (c.status === 'inconsistent') return s + 40;
      return s + 0;
    }, 0);
    return Math.round(points / rows.length);
  }, [rows]);

  const consistentCount = rows.filter(c => c.status === 'consistent').length;
  const inconsistentCount = rows.filter(c => c.status === 'inconsistent').length;
  const missingCount = rows.filter(c => c.status === 'missing').length;

  const syncOne = (id: string) => {
    setSyncing(s => new Set(s).add(id));
    setTimeout(() => {
      setRows(prev => prev.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          nameMatch: true,
          addressMatch: true,
          phoneMatch: true,
          businessName: canonicalNAP.businessName,
          address: canonicalNAP.address,
          phone: canonicalNAP.phone,
          status: 'consistent' as const,
          lastSynced: 'just now',
        };
      }));
      setSyncing(s => { const n = new Set(s); n.delete(id); return n; });
      const c = rows.find(r => r.id === id);
      if (c) toast('success', 'Citation synced', `${c.directory} NAP data corrected to canonical values`);
    }, 1400);
  };

  const syncAll = () => {
    setSyncing(new Set(rows.map(r => r.id)));
    toast('info', 'Syncing all citations', `Re-scanning ${rows.length} directories...`);
    setTimeout(() => {
      setRows(prev => prev.map(c => ({
        ...c,
        nameMatch: true,
        addressMatch: true,
        phoneMatch: true,
        businessName: canonicalNAP.businessName,
        address: canonicalNAP.address,
        phone: canonicalNAP.phone,
        status: 'consistent' as const,
        lastSynced: 'just now',
      })));
      setSyncing(new Set());
      toast('success', 'All citations synced', `${rows.length} directories now match canonical NAP`);
    }, 2200);
  };

  const healthColor = healthScore >= 80 ? 'text-brand-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400';
  const healthBar = healthScore >= 80 ? 'bg-brand-500' : healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Citations & NAP Auditor"
        subtitle={`Business name, address, and phone consistency across local directories for ${activeClient.name}`}
        actions={
          <button className="btn-primary px-4 py-2.5" onClick={syncAll} disabled={syncing.size > 0}>
            {syncing.size > 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync All Citations
          </button>
        }
      />

      {/* Health Score + Canonical NAP */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck2 className="w-5 h-5 text-brand-400" />
            <h2 className="font-semibold text-slate-100 text-sm">NAP Health Score</h2>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-ink-700" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6"
                  className={healthColor}
                  strokeDasharray={`${(healthScore / 100) * 213.6} 213.6`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${healthColor}`}>{healthScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-300 mb-1">
                {healthScore >= 80 ? 'Excellent NAP consistency' : healthScore >= 50 ? 'Some inconsistencies detected' : 'Poor consistency — fix urgently'}
              </p>
              <div className="h-2 rounded-full bg-ink-700/60 overflow-hidden">
                <div className={`h-full rounded-full ${healthBar} transition-all duration-700`} style={{ width: `${healthScore}%` }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Consistent', count: consistentCount, color: 'text-brand-400', bg: 'bg-brand-500/12' },
              { label: 'Inconsistent', count: inconsistentCount, color: 'text-amber-400', bg: 'bg-amber-500/12' },
              { label: 'Missing', count: missingCount, color: 'text-rose-400', bg: 'bg-rose-500/12' },
            ].map(s => (
              <div key={s.label} className={`rounded-lg ${s.bg} py-3 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-100 text-sm mb-4">Canonical NAP Reference</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <Building className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Business Name</p>
                <p className="text-sm text-slate-200 font-medium">{canonicalNAP.businessName}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Address</p>
                <p className="text-sm text-slate-200 font-medium">{canonicalNAP.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-accent-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Phone</p>
                <p className="text-sm text-slate-200 font-mono font-medium">{canonicalNAP.phone}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Citations Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Directory</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Business Name</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Address</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Phone</th>
                <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">NAP Match</th>
                <th className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Status</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">Last Synced</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.map(c => {
                const cfg = statusConfig[c.status];
                const StatusIcon = cfg.icon;
                const isSyncing = syncing.has(c.id);
                const matchCount = [c.nameMatch, c.addressMatch, c.phoneMatch].filter(Boolean).length;
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-100">{c.directory}</span>
                        <a href="#" onClick={e => e.preventDefault()} className="text-slate-500 hover:text-brand-400 transition-colors" title={c.url}>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {c.businessName ? (
                        <span className={`text-sm ${c.nameMatch ? 'text-slate-300' : 'text-rose-300'}`}>{c.businessName}</span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Not listed</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {c.address ? (
                        <span className={`text-xs ${c.addressMatch ? 'text-slate-400' : 'text-rose-300'}`}>{c.address}</span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {c.phone ? (
                        <span className={`text-xs font-mono ${c.phoneMatch ? 'text-slate-400' : 'text-rose-300'}`}>{c.phone}</span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {[c.nameMatch, c.addressMatch, c.phoneMatch].map((m, i) => (
                          <span key={i} className={`w-2 h-2 rounded-full ${m ? 'bg-brand-400' : 'bg-rose-400'}`} />
                        ))}
                        <span className="text-[10px] text-slate-500 ml-1">{matchCount}/3</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`chip ${cfg.bg} ${cfg.color} ${cfg.border} border text-[10px]`}>
                        <StatusIcon className="w-2.5 h-2.5" /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-500">{c.lastSynced}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => syncOne(c.id)}
                        disabled={isSyncing}
                        className={`btn px-3 py-1.5 text-xs font-medium ${
                          isSyncing
                            ? 'bg-ink-800/60 text-slate-500'
                            : c.status === 'consistent'
                              ? 'bg-ink-800/50 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                              : 'bg-brand-500/12 text-brand-300 hover:bg-brand-500/20 border border-brand-500/15'
                        }`}
                      >
                        {isSyncing ? <><Loader2 className="w-3 h-3 animate-spin" /> Syncing</> : <><RefreshCw className="w-3 h-3" /> Sync</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
        <FileCheck2 className="w-3.5 h-3.5" />
        NAP consistency is a key local SEO ranking factor. Inconsistent citations across directories confuse search engines and hurt local pack visibility.
      </p>
    </div>
  );
}
