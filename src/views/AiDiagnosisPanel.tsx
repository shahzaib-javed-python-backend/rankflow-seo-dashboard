import { useEffect, useRef, useState } from 'react';
import {
  Sparkles, Activity, Users, Lightbulb, CheckCircle2, Loader2, TrendingDown, Brain, ArrowRight, X,
} from 'lucide-react';
import { SlideOver } from '@/components/SlideOver';
import { useData } from '@/components/DataProvider';
import { useToast } from '@/components/Toast';
import type { AiDiagnosis, Keyword } from '@/types';

const verdictConfig = {
  stable: { label: 'Stable', cls: 'text-brand-300 bg-brand-500/12 border-brand-500/20', dot: 'bg-brand-400' },
  elevated: { label: 'Elevated', cls: 'text-amber-300 bg-amber-500/12 border-amber-500/20', dot: 'bg-amber-400' },
  high: { label: 'High Volatility', cls: 'text-rose-300 bg-rose-500/12 border-rose-500/20', dot: 'bg-rose-400' },
} as const;

export function AiDiagnosisPanel({
  keyword, open, onClose,
}: {
  keyword: Keyword | null;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AiDiagnosis | null>(null);
  // Cache diagnoses per keyword term so repeated runs are stable & instant.
  const cacheRef = useRef<Record<string, AiDiagnosis>>({});
  const { diagnoseKeyword } = useData();
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !keyword) return;
    // Return cached result immediately for the same keyword
    const cached = cacheRef.current[keyword.term];
    if (cached) {
      setDiagnosis(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    setDiagnosis(null);
    const timer = setTimeout(() => {
      const result = diagnoseKeyword(keyword.term, keyword.prevRank, keyword.rank);
      cacheRef.current[keyword.term] = result;
      setDiagnosis(result);
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [open, keyword]);

  if (!keyword) return null;
  const drop = keyword.rank - keyword.prevRank;
  const Verdict = diagnosis ? verdictConfig[diagnosis.volatilityVerdict] : null;

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="AI Rank Drop Diagnosis"
      subtitle={`"${keyword.term}" · dropped ${drop} positions`}
      width="max-w-lg"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400/20 to-brand-600/10 flex items-center justify-center">
              <Brain className="w-8 h-8 text-brand-400 animate-pulse" />
            </div>
            <span className="absolute -inset-2 rounded-2xl border-2 border-brand-400/30 animate-pulse-ring" />
          </div>
          <p className="text-sm font-medium text-slate-200 mt-5">Analyzing rank drop...</p>
          <p className="text-xs text-slate-500 mt-1">Cross-referencing SERP volatility, competitor changes & content gaps</p>
          <div className="flex gap-1.5 mt-4">
            {['SERP scan', 'Competitor diff', 'Content audit'].map((s, i) => (
              <span
                key={s}
                className="text-[10px] px-2 py-1 rounded-md bg-ink-800/60 text-slate-400 animate-fade-in"
                style={{ animationDelay: `${i * 300}ms` }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ) : diagnosis && Verdict ? (
        <div className="space-y-5 animate-fade-in">
          {/* Header confidence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-medium text-slate-300">Diagnosis complete</span>
            </div>
            <span className="text-xs text-slate-500">
              Confidence: <span className="font-bold text-brand-300">{diagnosis.confidence}%</span>
            </span>
          </div>

          {/* 1. Algorithm Volatility Check */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/12 flex items-center justify-center">
                <Activity className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-100">Algorithm Volatility Check</p>
                <p className="text-[11px] text-slate-500">SERP fluctuation in last 7 days</p>
              </div>
              <span className={`chip ${Verdict.cls} border text-[10px]`}>
                <span className={`w-1.5 h-1.5 rounded-full ${Verdict.dot}`} /> {Verdict.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-2 rounded-full bg-ink-700/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${diagnosis.volatilityScore > 70 ? 'bg-rose-400' : diagnosis.volatilityScore > 40 ? 'bg-amber-400' : 'bg-brand-400'}`}
                  style={{ width: `${diagnosis.volatilityScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-100 tabular-nums w-9 text-right">{diagnosis.volatilityScore}%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {diagnosis.volatilityVerdict === 'high'
                ? 'Significant SERP reshuffling detected this week. Google likely pushed a core update affecting your query cluster.'
                : diagnosis.volatilityVerdict === 'elevated'
                  ? 'Moderate SERP movement observed. Several positions in the top 10 swapped, indicating a topical refresh.'
                  : 'SERP is relatively stable. The drop is more likely tied to on-page or competitor factors than algorithm shifts.'}
            </p>
          </div>

          {/* 2. Competitor Content Shift */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-500/12 flex items-center justify-center">
                <Users className="w-4 h-4 text-accent-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-100">Competitor Content Shift</p>
                <p className="text-[11px] text-slate-500">Who moved and why</p>
              </div>
            </div>
            <div className="rounded-lg bg-ink-800/50 p-3 border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-mono text-slate-200">{diagnosis.competitorShift.domain}</span>
                <span className="chip bg-brand-500/12 text-brand-300 text-[10px]">
                  <TrendingDown className="w-2.5 h-2.5 rotate-180" /> {diagnosis.competitorShift.shift}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{diagnosis.competitorShift.note}</p>
            </div>
          </div>

          {/* 3. Content Gap */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/12 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-100">Content Gap Analysis</p>
                <p className="text-[11px] text-slate-500">What your page is missing</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{diagnosis.contentGap}</p>
          </div>

          {/* 4. Actionable Recommendation */}
          <div className="rounded-xl p-4 bg-gradient-to-br from-brand-500/10 to-brand-600/5 border border-brand-500/20">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-300" />
              </div>
              <p className="text-sm font-semibold text-brand-200">Recommended Fix</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">{diagnosis.recommendation}</p>
            <div className="space-y-2">
              {diagnosis.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-brand-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-brand-300">{i + 1}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              className="btn-primary flex-1 py-2.5"
              onClick={() => { toast('success', 'Action plan saved', 'Diagnosis added to your task queue'); onClose(); }}
            >
              <CheckCircle2 className="w-4 h-4" /> Save Action Plan
            </button>
            <button className="btn-ghost px-4 py-2.5" onClick={onClose}>
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>
      ) : null}
    </SlideOver>
  );
}

// Trigger button to embed in the keywords table
export function AiAnalyzeButton({
  keyword, onClick,
}: {
  keyword: Keyword;
  onClick: (k: Keyword) => void;
}) {
  const drop = keyword.rank - keyword.prevRank;
  if (drop < 3) return null;
  return (
    <button
      onClick={() => onClick(keyword)}
      className="btn px-2.5 py-1.5 text-xs font-medium bg-violet-500/12 text-violet-300 hover:bg-violet-500/20 border border-violet-500/15 transition-all group"
      title={`AI diagnose ${drop}-position drop`}
    >
      <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" /> AI Analyze
    </button>
  );
}

// Simpler loading indicator export for reuse
export function AiLoadingIcon() {
  return <Loader2 className="w-3 h-3 animate-spin" />;
}

export function AiArrowRight() {
  return <ArrowRight className="w-3 h-3" />;
}
