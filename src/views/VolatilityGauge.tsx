import { useState, useEffect } from 'react';
import { Activity, Gauge, Zap, TrendingDown, TrendingUp, Wind } from 'lucide-react';
import { Card } from '@/components/ui';

type VolatilityLevel = 'low' | 'moderate' | 'storm';

interface VolatilityState {
  vScore: number;
  level: VolatilityLevel;
  label: string;
  description: string;
  affectedKeywords: number;
  algoUpdates: number;
  dayBreakdown: { day: string; volatility: number }[];
}

function levelFromScore(score: number): { level: VolatilityLevel; label: string; description: string; color: string; ringColor: string } {
  if (score < 30) return { level: 'low', label: 'Low', description: 'Stable SERP conditions — minimal algorithm fluctuation detected', color: 'text-brand-400', ringColor: 'stroke-brand-400' };
  if (score < 65) return { level: 'moderate', label: 'Moderate', description: 'Elevated SERP movement — some keywords experiencing position shifts', color: 'text-amber-400', ringColor: 'stroke-amber-400' };
  return { level: 'storm', label: 'High Storm', description: 'Severe algorithm turbulence — significant rank volatility across tracked keywords', color: 'text-rose-400', ringColor: 'stroke-rose-400' };
}

function generateState(seed: number): VolatilityState {
  const vScore = Math.round(15 + Math.abs(Math.sin(seed * 0.7)) * 75);
  const { level, label, description } = levelFromScore(vScore);
  const days = ['1d', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', '11d', '12d', '13d', '14d'];
  const dayBreakdown = days.map((d, i) => ({
    day: d,
    volatility: Math.max(5, Math.round(vScore + Math.sin(seed + i * 0.8) * 25)),
  }));
  return {
    vScore,
    level,
    label,
    description,
    affectedKeywords: Math.round(2 + (vScore / 100) * 8),
    algoUpdates: level === 'storm' ? 3 : level === 'moderate' ? 1 : 0,
    dayBreakdown,
  };
}

export function VolatilityGauge() {
  const [state, setState] = useState<VolatilityState>(() => generateState(Date.now() / 100000));
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsing(true);
      setTimeout(() => {
        setState(generateState(Date.now() / 100000));
        setPulsing(false);
      }, 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const cfg = levelFromScore(state.vScore);
  const maxBar = Math.max(...state.dayBreakdown.map(d => d.volatility));

  return (
    <Card className="p-5 relative overflow-hidden">
      <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full ${cfg.level === 'low' ? 'bg-brand-500' : cfg.level === 'moderate' ? 'bg-amber-500' : 'bg-rose-500'} opacity-[0.06] blur-3xl transition-all duration-500 ${pulsing ? 'scale-125' : ''}`} />

      <div className="flex items-center gap-2 mb-4 relative">
        <div className={`w-9 h-9 rounded-xl ${cfg.level === 'low' ? 'bg-brand-500/12' : cfg.level === 'moderate' ? 'bg-amber-500/12' : 'bg-rose-500/12'} flex items-center justify-center shrink-0`}>
          <Wind className={`w-4.5 h-4.5 ${cfg.color}`} />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-100 text-sm">Rank Volatility Index (V-Score)</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">14-day market algorithm fluctuation tracker</p>
        </div>
        <span className={`chip ${cfg.level === 'low' ? 'bg-brand-500/12 text-brand-300 border-brand-500/20' : cfg.level === 'moderate' ? 'bg-amber-500/12 text-amber-300 border-amber-500/20' : 'bg-rose-500/12 text-rose-300 border-rose-500/20'} border text-[10px]`}>
          {cfg.level === 'storm' && <Zap className="w-2.5 h-2.5" />} {cfg.label}
        </span>
      </div>

      <div className="flex items-center gap-5 relative">
        {/* Gauge */}
        <div className="relative shrink-0">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-ink-700" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
              className={`${cfg.ringColor} transition-all duration-700`}
              strokeDasharray={`${(state.vScore / 100) * 263.9} 263.9`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${cfg.color} tabular-nums ${pulsing ? 'scale-110' : ''} transition-transform`}>{state.vScore}</span>
            <span className="text-[8px] text-slate-500 uppercase tracking-wider">V-Score</span>
          </div>
        </div>

        {/* Stats + description */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-300 leading-relaxed mb-3">{state.description}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-ink-800/40 p-2.5">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-slate-500">Affected KWs</span>
              </div>
              <p className="text-sm font-bold text-slate-100 tabular-nums">{state.affectedKeywords}</p>
            </div>
            <div className="rounded-lg bg-ink-800/40 p-2.5">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-sky-400" />
                <span className="text-[10px] text-slate-500">Algo Updates</span>
              </div>
              <p className="text-sm font-bold text-slate-100 tabular-nums">{state.algoUpdates}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 14-day mini bar chart */}
      <div className="mt-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">14-Day Volatility Trend</span>
          <span className="text-[10px] text-slate-500">{cfg.level === 'storm' ? <TrendingDown className="w-3 h-3 inline text-rose-400" /> : <TrendingUp className="w-3 h-3 inline text-brand-400" />} live</span>
        </div>
        <div className="flex items-end gap-1 h-12">
          {state.dayBreakdown.map((d, i) => {
            const h = (d.volatility / maxBar) * 100;
            const barColor = d.volatility >= 65 ? 'bg-rose-400' : d.volatility >= 30 ? 'bg-amber-400' : 'bg-brand-400';
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                <div
                  className={`w-full rounded-sm ${barColor} opacity-70 group-hover:opacity-100 transition-all`}
                  style={{ height: `${Math.max(8, h)}%` }}
                  title={`${d.day}: ${d.volatility}`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-slate-600">14d ago</span>
          <span className="text-[8px] text-slate-600">today</span>
        </div>
      </div>
    </Card>
  );
}
