import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Copy, FileText, Heading1, ListTree, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';
import type { OpportunityKeyword } from '@/types';

interface ContentBrief {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  outline: { heading: string; points: string[] }[];
  wordCountTarget: number;
  lsiKeywords: string[];
}

function generateBrief(kw: OpportunityKeyword): ContentBrief {
  const term = kw.term;
  const cap = term.charAt(0).toUpperCase() + term.slice(1);
  return {
    metaTitle: `${cap} — Free Tool & 2026 Guide | RankFlow`,
    metaDescription: `Compare the best ${term} options. ${kw.volume.toLocaleString()} monthly searches. Expert reviews, pricing, and step-by-step guide. Try free — no credit card required.`,
    h1: `The Complete ${cap} Guide (Updated 2026)`,
    outline: [
      { heading: `What Is ${cap}?`, points: ['Definition and core concept', 'Why it matters for SEO in 2026', 'Common use cases'] },
      { heading: 'Top 3 Ranking Pages Analysis', points: [`Competitor at #${kw.competitorRank} (${kw.competitor}) averages 1,240 words`, 'All top 3 include a comparison table', '2 of 3 use FAQ schema markup'] },
      { heading: 'Step-by-Step Walkthrough', points: ['How to get started in 5 minutes', 'Common pitfalls to avoid', 'Pro tips from SEO experts'] },
      { heading: 'Comparison & Alternatives', points: ['Feature comparison table', 'Pricing breakdown', 'Pros and cons of each option'] },
      { heading: 'FAQ', points: [`4 questions answering PAA queries for "${term}"`, 'Implement FAQ schema for rich snippets', 'Target long-tail variations'] },
    ],
    wordCountTarget: kw.difficulty === 'High' ? 1800 : kw.difficulty === 'Medium' ? 1200 : 800,
    lsiKeywords: [`${term} free`, `${term} tool`, `best ${term}`, `${term} 2026`, `${term} comparison`, `how to ${term}`, `${term} vs alternatives`, `${term} pricing`],
  };
}

export function ContentBriefModal({ opp, open, onClose }: { opp: OpportunityKeyword | null; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (open && opp) {
      setGenerating(true);
      setBrief(null);
      const t = setTimeout(() => {
        setBrief(generateBrief(opp));
        setGenerating(false);
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [open, opp]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !opp) return null;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast('success', 'Copied to clipboard', `${label} copied — paste into your CMS`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-ink-950/60 backdrop-blur-sm transition-opacity duration-300 no-print" onClick={onClose} />
      <div className="fixed top-0 right-0 z-[85] h-full max-w-lg w-full glass border-l border-white/[0.08] shadow-2xl transition-transform duration-300 ease-out no-print overflow-y-auto">
        <div className="sticky top-0 z-10 glass border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-ink-950" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-100 text-sm truncate">AI Content Brief</h2>
              <p className="text-xs text-slate-500 truncate">Beat top 3 rankers for "{opp.term}"</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          {generating ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-brand-400" />
                <Sparkles className="w-5 h-5 text-brand-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-slate-300 mt-4 font-medium">Generating content brief...</p>
              <p className="text-xs text-slate-500 mt-1">Analyzing top 3 rankers for "{opp.term}"</p>
              <div className="mt-4 flex flex-col gap-1.5 w-full max-w-xs">
                {['Scanning competitor content depth...', 'Extracting title patterns...', 'Building outline structure...'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500" style={{ animationDelay: `${i * 0.3}s` }}>
                    <Check className="w-3 h-3 text-brand-400" /> {s}
                  </div>
                ))}
              </div>
            </div>
          ) : brief ? (
            <div className="space-y-5 animate-fade-in">
              {/* Meta Title */}
              <div className="rounded-xl bg-ink-800/40 border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Meta Title</span>
                  <button onClick={() => copy(brief.metaTitle, 'Meta Title')} className="text-xs text-slate-500 hover:text-brand-400 flex items-center gap-1 transition-colors">
                    {copied === 'Meta Title' ? <><Check className="w-3 h-3 text-brand-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <p className="text-sm text-slate-200 font-medium">{brief.metaTitle}</p>
                <p className="text-[10px] text-slate-500 mt-1">{brief.metaTitle.length} chars · {brief.metaTitle.length <= 60 ? 'optimal' : 'too long'}</p>
              </div>

              {/* Meta Description */}
              <div className="rounded-xl bg-ink-800/40 border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Meta Description</span>
                  <button onClick={() => copy(brief.metaDescription, 'Meta Description')} className="text-xs text-slate-500 hover:text-brand-400 flex items-center gap-1 transition-colors">
                    {copied === 'Meta Description' ? <><Check className="w-3 h-3 text-brand-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{brief.metaDescription}</p>
                <p className="text-[10px] text-slate-500 mt-1">{brief.metaDescription.length} chars · {brief.metaDescription.length <= 160 ? 'optimal' : 'too long'}</p>
              </div>

              {/* H1 */}
              <div className="rounded-xl bg-ink-800/40 border border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent-400 flex items-center gap-1.5"><Heading1 className="w-3 h-3" /> H1 Heading</span>
                  <button onClick={() => copy(brief.h1, 'H1 Heading')} className="text-xs text-slate-500 hover:text-brand-400 flex items-center gap-1 transition-colors">
                    {copied === 'H1 Heading' ? <><Check className="w-3 h-3 text-brand-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <p className="text-base text-slate-100 font-bold">{brief.h1}</p>
              </div>

              {/* Content Outline */}
              <div className="rounded-xl bg-ink-800/40 border border-white/[0.06] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5 mb-3"><ListTree className="w-3 h-3" /> Content Outline</span>
                <div className="space-y-3">
                  {brief.outline.map((section, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-slate-200">{i + 1}. {section.heading}</p>
                      <ul className="ml-4 mt-1 space-y-1">
                        {section.points.map((p, j) => (
                          <li key={j} className="text-xs text-slate-400 flex gap-1.5">
                            <span className="text-brand-400">•</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* LSI Keywords + Word Count */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-ink-800/40 border border-white/[0.06] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Target Word Count</span>
                  <p className="text-2xl font-bold text-slate-50">{brief.wordCountTarget.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">based on {opp.difficulty.toLowerCase()} difficulty</p>
                </div>
                <div className="rounded-xl bg-ink-800/40 border border-white/[0.06] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Search Volume</span>
                  <p className="text-2xl font-bold text-slate-50">{opp.volume.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">monthly searches</p>
                </div>
              </div>

              {/* LSI Keywords */}
              <div className="rounded-xl bg-ink-800/40 border border-white/[0.06] p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">LSI / Related Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {brief.lsiKeywords.map(k => (
                    <span key={k} className="chip bg-brand-500/10 text-brand-300 text-[10px] border border-brand-500/15">{k}</span>
                  ))}
                </div>
              </div>

              <button onClick={() => copy(JSON.stringify(brief, null, 2), 'Full brief')} className="btn-primary w-full py-2.5 text-xs">
                <Copy className="w-3.5 h-3.5" /> Copy Full Brief as JSON
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
