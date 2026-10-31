import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapPin, Star, BadgeCheck, Clock, AlertCircle, Loader2, Zap, Navigation, Search, Crosshair, X, ChevronUp, ChevronDown, Ruler } from 'lucide-react';
import { Card, PageHeader, EmptyState, SegmentedControl } from '@/components/ui';
import { useData } from '@/components/DataProvider';
import { useToast } from '@/components/Toast';
import { MapPackSoVCard } from '@/views/MapPackSoV';
import { getCityCenter, haversineKm, formatCoord, type GridRadius } from '@/lib/geo';
import type { LocalListing, GeoGridCell } from '@/types';

const statusConfig = {
  verified: { label: 'Verified', cls: 'text-brand-300 bg-brand-500/12 border-brand-500/20', icon: BadgeCheck },
  suspended: { label: 'Suspended', cls: 'text-rose-300 bg-rose-500/12 border-rose-500/20', icon: AlertCircle },
  pending: { label: 'Pending', cls: 'text-amber-300 bg-amber-500/12 border-amber-500/20', icon: Clock },
} as const;

function rankTone(rank: number): { bg: string; ring: string; label: string } {
  if (rank <= 3) return { bg: 'bg-brand-500/80', ring: 'ring-brand-400', label: `#${rank}` };
  if (rank <= 5) return { bg: 'bg-sky-500/60', ring: 'ring-sky-400', label: `#${rank}` };
  if (rank <= 10) return { bg: 'bg-amber-500/50', ring: 'ring-amber-400', label: `${rank}` };
  if (rank <= 20) return { bg: 'bg-orange-500/40', ring: 'ring-orange-400', label: `${rank}+` };
  return { bg: 'bg-rose-500/40', ring: 'ring-rose-400', label: '20+' };
}

export function MapsView() {
  const { localListings: initial, geoGrid: initialGrid, buildGeoGrid } = useData();
  const queries = Array.from(new Set(initial.map(l => l.query)));
  const [activeQuery, setActiveQuery] = useState(queries[0] ?? '');
  const [listings, setListings] = useState<LocalListing[]>(initial);
  const [checking, setChecking] = useState(false);
  const [geo, setGeo] = useState('Austin, TX');
  const [geoInput, setGeoInput] = useState('Austin, TX');
  const [radius, setRadius] = useState<GridRadius>(1);
  const [grid, setGrid] = useState<GeoGridCell[]>(initialGrid);
  const [selected, setSelected] = useState<GeoGridCell | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const { toast } = useToast();

  const center = getCityCenter(geo);

  const rebuildGrid = useCallback((r: GridRadius, label: string) => {
    const c = getCityCenter(label);
    setGrid(buildGeoGrid(c.lat, c.lng, 6, r));
    setSelected(null);
    setDrawerOpen(false);
  }, [buildGeoGrid]);

  useEffect(() => {
    setListings(initial);
    setGrid(initialGrid);
    setSelected(null);
    setDrawerOpen(false);
  }, [initial, initialGrid]);

  const onRadiusChange = (r: GridRadius) => {
    setRadius(r);
    rebuildGrid(r, geo);
    toast('info', 'Grid radius updated', `Recalculated 36 cells within ${r}km using Haversine projection`);
  };

  const onGeoChange = (label: string) => {
    setGeo(label);
    rebuildGrid(radius, label);
  };

  const commitGeo = () => {
    const next = geoInput.trim();
    if (!next || next === geo) return;
    onGeoChange(next);
    toast('info', 'Grid relocated', `Centered on ${next} — coordinates updated`);
  };

  if (initial.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Local Maps 3-Pack" subtitle="Interactive geo-grid heatmap with per-cell 3-Pack drill-down" />
        <Card className="p-8">
          <EmptyState icon={MapPin} title="No local tracking data" hint="Toggle Demo Data in the top bar to load sample local maps data" />
        </Card>
      </div>
    );
  }

  const pack = listings
    .filter(l => l.query === activeQuery)
    .sort((a, b) => a.position - b.position)
    .filter((l, i, arr) => arr.findIndex(x => x.business === l.business) === i);

  const gridStats = useMemo(() => {
    if (!grid.length) return { top3: 0, top10: 0, avg: 0, total: 0, visibility: 0, top3Dominance: 0 };
    const top3 = grid.filter(c => c.rank <= 3).length;
    const top10 = grid.filter(c => c.rank <= 10).length;
    const avg = grid.reduce((s, c) => s + c.rank, 0) / grid.length;
    const visibility = Math.min(100, Math.round(100 - avg * 3.5));
    const top3Dominance = Math.round((top3 / grid.length) * 100);
    return { top3, top10, avg, total: grid.length, visibility, top3Dominance };
  }, [grid]);

  const runCheck = () => {
    setChecking(true);
    toast('info', 'Scanning local SERP', `Simulating 3-pack for "${activeQuery}" (demo data)...`);
    setTimeout(() => {
      setListings(prev => prev.map(l => {
        if (l.query !== activeQuery) return l;
        const shift = Math.floor(Math.random() * 3) - 1;
        return { ...l, position: Math.max(1, l.position + shift) };
      }));
      setGrid(buildGeoGrid());
      setChecking(false);
      toast('success', '3-Pack refreshed', 'Local grid and 3-Pack simulated (demo data)');
    }, 1600);
  };

  const selectCell = (cell: GeoGridCell) => {
    setSelected(cell);
    setDrawerOpen(true);
    setDrawerExpanded(true);
  };

  const posColors = ['from-brand-400 to-brand-600', 'from-sky-400 to-sky-600', 'from-accent-400 to-accent-600'];

  // Build a 3-pack for the selected cell using its business + neighbors
  const cellPack = useMemo(() => {
    if (!selected) return [];
    const ordered = [...grid].sort((a, b) => a.rank - b.rank);
    const nearby = ordered
      .filter(c => Math.abs(c.row - selected.row) <= 2 && Math.abs(c.col - selected.col) <= 2)
      .filter((c, i, arr) => arr.findIndex(x => x.business === c.business) === i)
      .slice(0, 3);
    if (nearby.length < 3) ordered.slice(0, 3).forEach(c => { if (!nearby.includes(c) && !nearby.find(n => n.business === c.business)) nearby.push(c); });
    return nearby.map((c, i) => ({ ...c, packPosition: i + 1, isPrimary: c.id === selected.id }));
  }, [selected, grid]);

  return (
    <div className="animate-fade-in pb-[420px]">
      <PageHeader
        title="Local Maps 3-Pack"
        subtitle="Interactive geo-grid heatmap with per-cell 3-Pack drill-down"
        actions={
          <div className="flex items-center gap-2">
            <span className="chip bg-amber-500/12 text-amber-300 border border-amber-500/20 text-[10px]">Demo Data</span>
            <button className="btn-primary px-4 py-2.5" onClick={runCheck} disabled={checking}>
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Refresh Grid
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={geoInput}
                onChange={e => setGeoInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitGeo(); } }}
                onBlur={commitGeo}
                placeholder="City, State (e.g. Phoenix, AZ)"
                className="w-full bg-ink-800/50 border border-white/[0.06] rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500/40 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Ruler className="w-3.5 h-3.5" />
              </div>
              {([0.5, 1, 5] as GridRadius[]).map(r => (
                <button
                  key={r}
                  onClick={() => onRadiusChange(r)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    radius === r ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20' : 'bg-ink-800/50 text-slate-400 border border-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {queries.map(q => (
                <button
                  key={q}
                  onClick={() => setActiveQuery(q)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeQuery === q ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20' : 'bg-ink-800/50 text-slate-400 border border-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {pack.map((l, i) => {
              const Status = statusConfig[l.status];
              return (
                <Card key={l.id} className={`p-5 relative overflow-hidden ${i === 0 ? 'ring-1 ring-brand-500/25' : ''}`}>
                  <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${posColors[i] ?? 'from-slate-600 to-slate-700'} opacity-[0.08] blur-2xl`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${posColors[i] ?? 'from-slate-600 to-slate-700'} flex items-center justify-center text-ink-950 font-extrabold text-lg shrink-0 shadow-lg`}>
                      {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : `#${i + 1}`}
                    </div>
                    <span className={`chip ${Status.cls} border text-[10px]`}>
                      <Status.icon className="w-3 h-3" /> {Status.label}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm truncate">{l.business}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{l.category}</p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-slate-200">{l.rating}</span>
                    <span className="text-xs text-slate-500">({l.reviews})</span>
                  </div>
                  <div className="flex items-start gap-1.5 mt-3 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-500" />
                    <span className="leading-relaxed">{l.address}</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Interactive Geo-Grid Heatmap */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-brand-400" />
                <h3 className="font-semibold text-slate-100 text-sm">Geo-Grid Heatmap</h3>
              </div>
              <span className="text-xs text-slate-500">{grid.length} grid points · {radius}km radius · click any cell</span>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-ink-950/60 p-4 border border-white/[0.04]">
              {/* Grid map backdrop with subtle gridlines */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'linear-gradient(rgba(20,184,143,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,143,0.08) 1px, transparent 1px)',
                  backgroundSize: 'calc(100%/6) calc(100%/6)',
                }}
              />
              {/* Center marker */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-3 h-3 rounded-full bg-accent-400 ring-4 ring-accent-400/20 animate-pulse-ring" />
              </div>

              <div className="grid grid-cols-6 gap-1.5 sm:gap-2 relative">
                {grid.map(cell => {
                  const tone = rankTone(cell.rank);
                  const isSelected = selected?.id === cell.id;
                  return (
                    <button
                      key={cell.id}
                      onClick={() => selectCell(cell)}
                      className={`aspect-square rounded-lg ${tone.bg} flex items-center justify-center text-[10px] sm:text-xs font-bold text-ink-950 transition-all duration-200 hover:scale-110 hover:z-10 relative
                      ${isSelected ? `ring-2 ${tone.ring} ring-offset-2 ring-offset-ink-950 scale-110 z-10` : 'hover:ring-2 hover:ring-white/30'}`}
                      title={`${cell.business} — rank #${cell.rank} @ ${cell.lat},${cell.lng}`}
                    >
                      {checking ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        tone.label
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mt-4 text-[11px] text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-500/80" /> #1–3</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-500/60" /> #4–5</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500/50" /> 6–10</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500/40" /> 11–20</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500/40" /> 20+</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="text-center">
                <p className="text-lg font-bold text-brand-300">{gridStats.top3}</p>
                <p className="text-[10px] text-slate-500">cells in Top 3</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-300">{gridStats.top10}</p>
                <p className="text-[10px] text-slate-500">cells in Top 10</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-100">{gridStats.avg.toFixed(1)}</p>
                <p className="text-[10px] text-slate-500">avg grid rank</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-sky-300">{gridStats.visibility}%</p>
                <p className="text-[10px] text-slate-500">visibility score</p>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-ink-800/40 p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Top-3 Dominance</span>
                <span className="font-bold text-brand-300">{gridStats.top3Dominance}%</span>
              </div>
              <div className="h-2 rounded-full bg-ink-700/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
                  style={{ width: `${gridStats.top3Dominance}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
              <Crosshair className="w-3 h-3" />
              <span>Center: {geo} ({formatCoord(center.lat, center.lng)}) · Radius: {radius}km · {grid.length} grid points</span>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <MapPackSoVCard />

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Navigation className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-slate-100 text-sm">GBP Status Overview</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Verified', count: listings.filter(l => l.status === 'verified').length, color: 'bg-brand-400' },
                { label: 'Pending', count: listings.filter(l => l.status === 'pending').length, color: 'bg-amber-400' },
                { label: 'Suspended', count: listings.filter(l => l.status === 'suspended').length, color: 'bg-rose-400' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${s.color}`} /> {s.label}
                  </span>
                  <span className="text-sm font-bold text-slate-100">{s.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Avg rating</span>
                <span className="flex items-center gap-1 font-bold text-slate-100">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {(listings.reduce((s, l) => s + l.rating, 0) / listings.length).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2.5">
                <span className="text-slate-400">Total reviews</span>
                <span className="font-bold text-slate-100">{listings.reduce((s, l) => s + l.reviews, 0).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-slate-100 text-sm mb-3">Tracking Locations</h3>
            <div className="space-y-2">
              {['Austin, TX', 'Denver, CO', 'Seattle, WA', 'Phoenix, AZ', 'United States'].map(loc => {
                const isActive = geo === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => { setGeoInput(loc); onGeoChange(loc); toast('info', 'Grid relocated', `Centered on ${loc}`); }}
                    className={`w-full flex items-center gap-2.5 py-2 px-2.5 -mx-2.5 rounded-lg transition-colors text-left ${
                      isActive ? 'bg-brand-500/10 ring-1 ring-brand-500/20' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                    <span className="text-sm text-slate-300 flex-1 truncate">{loc}</span>
                    {isActive && <span className="chip bg-brand-500/12 text-brand-300 text-[10px]">Active</span>}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Drawer for selected cell */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] glass border-t border-white/[0.08] shadow-2xl transition-transform duration-300 ease-out no-print
        ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setDrawerExpanded(e => !e)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors shrink-0"
            >
              {drawerExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            {selected ? (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">
                  Grid Point [{selected.row},{selected.col}] — Rank #{selected.rank}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {selected.lat}, {selected.lng} · {selected.address}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Select a grid cell to view local 3-Pack</p>
            )}
            <span className="chip bg-brand-500/12 text-brand-300 text-[10px] shrink-0">Local 3-Pack</span>
          </div>
          <button
            onClick={() => { setDrawerOpen(false); setDrawerExpanded(false); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {drawerExpanded && selected && (
          <div className="px-5 py-4 animate-slide-up">
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              {cellPack.map((c, i) => {
                const Status = statusConfig[c.status];
                const tone = rankTone(c.rank);
                return (
                  <div
                    key={c.id}
                    className={`rounded-xl p-4 border transition-all ${
                      c.isPrimary
                        ? 'bg-brand-500/[0.08] border-brand-500/25 ring-1 ring-brand-500/20'
                        : 'bg-ink-800/40 border-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-lg ${tone.bg} flex items-center justify-center text-ink-950 font-bold text-sm`}>
                        #{i + 1}
                      </div>
                      <span className={`chip ${Status.cls} border text-[9px]`}>
                        <Status.icon className="w-2.5 h-2.5" /> {Status.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 truncate">{c.business}</p>
                    <p className="text-[10px] text-slate-500 truncate">{c.category}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-slate-200">{c.rating}</span>
                      <span className="text-[11px] text-slate-500">({c.reviews})</span>
                    </div>
                    <div className="flex items-start gap-1.5 mt-2 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-slate-500" />
                      <span className="leading-relaxed truncate">{c.address}</span>
                    </div>
                    {c.isPrimary && (
                      <p className="text-[10px] text-brand-300 mt-2 font-medium">Selected grid point</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 pt-3 border-t border-white/[0.06]">
              <span>Query: <span className="text-slate-200 font-medium">{activeQuery}</span></span>
              <span>Grid rank: <span className="text-slate-200 font-medium">#{selected.rank}</span></span>
              <span>Coordinates: <span className="text-slate-200 font-mono">{selected.lat}, {selected.lng}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
