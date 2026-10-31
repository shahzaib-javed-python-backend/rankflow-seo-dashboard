import { useState } from 'react';
import {
  Activity, Zap, MapPin, Users, RefreshCw, FileBarChart, BellRing, Brain, Target,
  ArrowRight, Check, Star, TrendingUp, Globe, ChevronDown, ChevronRight, Sparkles, X,
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import type { ViewId } from '@/components/Sidebar';

const features = [
  { icon: Zap, title: 'Live SERP Tracker', desc: 'One-click "Check Now" per keyword simulates a real-time position refresh using demo SERP data.', color: 'text-brand-400 bg-brand-500/10', tab: 'keywords' as ViewId },
  { icon: MapPin, title: 'Local Maps 3-Pack', desc: 'Interactive geo-grid heatmap with per-cell 3-Pack drill-down and GBP status monitoring.', color: 'text-amber-400 bg-amber-500/10', tab: 'maps' as ViewId },
  { icon: Brain, title: 'AI Rank Drop Diagnosis', desc: 'AI-generated root-cause analysis: algorithm volatility, competitor content shifts, and fix recommendations.', color: 'text-violet-400 bg-violet-500/10', tab: 'keywords' as ViewId },
  { icon: Users, title: 'Competitor Benchmarking', desc: 'Side-by-side matrix with keyword opportunity gap analysis showing where competitors outrank you.', color: 'text-sky-400 bg-sky-500/10', tab: 'competitors' as ViewId },
  { icon: RefreshCw, title: 'Search Console Sync', desc: 'Historical GSC analytics with clicks, impressions, CTR, and average position across 3M/6M/1Y ranges.', color: 'text-rose-400 bg-rose-500/10', tab: 'gsc' as ViewId },
  { icon: FileBarChart, title: 'White-Label Reports', desc: 'Upload your logo, set brand colors, and generate client-ready PDF reports with live print preview.', color: 'text-accent-400 bg-accent-500/10', tab: 'reports' as ViewId },
];

const plans = [
  {
    id: 'starter', name: 'Starter', basePrice: 29, keywords: 100, locations: 3,
    features: ['100 tracked keywords', '3 geo locations', 'Daily rank checks', 'Email alerts', 'CSV export'],
  },
  {
    id: 'pro', name: 'Pro', basePrice: 79, keywords: 500, locations: 10, popular: true,
    features: ['500 tracked keywords', '10 geo locations', 'Hourly rank checks', 'AI rank diagnosis', 'White-label reports', 'Competitor tracking', 'GSC integration'],
  },
  {
    id: 'agency', name: 'Agency', basePrice: 199, keywords: 2500, locations: 50,
    features: ['2,500 tracked keywords', '50 geo locations', '15-minute checks', 'Unlimited reports', '5 competitor domains', 'API access', 'Priority support'],
  },
];

const stats = [
  { value: '2.4M+', label: 'Keywords tracked' },
  { value: '180K+', label: 'Local grid points' },
  { value: '12K+', label: 'Agencies powered' },
  { value: '99.9%', label: 'Uptime SLA' },
];

export function LandingPage({ onLaunch }: { onLaunch: (target?: ViewId) => void }) {
  const [extraKeywords, setExtraKeywords] = useState(0);
  const [extraLocations, setExtraLocations] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [modal, setModal] = useState<'privacy' | 'terms' | 'docs' | null>(null);
  const { toast } = useToast();

  const plan = plans.find(p => p.id === selectedPlan)!;
  const totalPrice = plan.basePrice + extraKeywords * 0.15 + extraLocations * 2;

  const faqs = [
    { q: 'How does the live SERP checking work?', a: 'Each keyword row has a "Check Now" button that simulates a real-time position refresh using demo SERP data. Results update instantly with an animated loading state, showing your new rank, change delta, and SERP features captured. Connect a Serper API key in Settings to enable live scraping.' },
    { q: 'What is the geo-grid heatmap?', a: 'The Local Maps module plots a 6×6 grid of geo-coordinate points across your target city. Each cell shows your rank at that exact location. Click any cell to drill into the local 3-Pack with full Google Business Profile details for that spot.' },
    { q: 'How does the AI rank drop diagnoser work?', a: 'When a keyword drops 3 or more positions, an "AI Analyze" button appears. It runs a multi-factor diagnosis covering SERP algorithm volatility, competitor content changes, and your content gaps — then outputs a numbered, actionable fix plan with a confidence score.' },
    { q: 'Can I white-label reports for my clients?', a: 'Yes. Upload your agency logo, set your brand primary color, and enter client details. The live print preview renders an executive summary, rank trend chart, and keyword breakdown — ready to export as PDF.' },
  ];

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 relative overflow-x-hidden">
      <div className="fixed inset-0 bg-grid-fade pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-ink-950/70 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-glow">
              <Activity className="w-5 h-5 text-ink-950" strokeWidth={2.6} />
            </div>
            <span className="font-bold text-lg tracking-tight">RankFlow</span>
            <span className="chip bg-brand-500/15 text-brand-300 text-[10px] ml-1">SEO Suite</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm text-slate-400">
            <a href="#features" className="hover:text-slate-100 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-100 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-100 transition-colors">FAQ</a>
          </div>
          <button
            onClick={() => onLaunch()}
            className="btn-primary px-4 py-2.5 text-sm"
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-24 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-7 animate-slide-up">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Rank Tracking with Local Maps Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] animate-slide-up">
            Real-time Local Maps &amp;<br className="hidden sm:block" />
            <span className="gradient-text">SERP Tracking Engine</span>
          </h1>
          <p className="text-lg text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '80ms' }}>
            Track keyword rankings across every geo-grid point, diagnose drops with AI,
            benchmark competitors, and generate white-label reports — all in one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9 animate-slide-up" style={{ animationDelay: '160ms' }}>
            <button
              onClick={() => onLaunch()}
              className="btn-primary px-6 py-3.5 text-base group"
            >
              Launch Live Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a href="#features" className="btn-ghost px-6 py-3.5 text-base">
              Explore Features
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div key={s.label} className="glass rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${240 + i * 80}ms` }}>
                <p className="text-2xl font-bold gradient-text">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="max-w-5xl mx-auto mt-16 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="glass rounded-2xl p-2 shadow-2xl">
            <div className="rounded-xl bg-ink-900/80 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-400/70" />
                <span className="text-xs text-slate-500 ml-3 font-mono">app.rankflow.io/overview</span>
              </div>
              <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Avg Position', val: '12.4', icon: Target, color: 'text-brand-400' },
                  { label: 'Top 3 Keywords', val: '3/10', icon: Star, color: 'text-accent-400' },
                  { label: 'Rank Movement', val: '+5', icon: TrendingUp, color: 'text-sky-400' },
                  { label: 'Visibility', val: '60%', icon: Globe, color: 'text-violet-400' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-ink-800/50 p-3.5">
                    <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
                    <p className="text-lg font-bold text-slate-50">{s.val}</p>
                    <p className="text-[10px] text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <div className="rounded-lg bg-ink-800/40 p-4 h-32 flex items-end gap-2">
                  {[40, 55, 48, 70, 62, 85, 78, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-brand-600/40 to-brand-400/80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature showcase */}
      <section id="features" className="py-20 px-5 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-2">Feature Showcase</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to dominate SERPs</h2>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">From rank tracking to AI-powered diagnosis and white-label reporting — RankFlow covers the full SEO workflow. Demo data is shown until you connect a live Serper API key.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass glass-hover rounded-2xl p-6 group animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-100 text-lg">{f.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
                <button
                  onClick={() => onLaunch(f.tab)}
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-4 font-medium group/btn"
                >
                  Try it live <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing simulator */}
      <section id="pricing" className="py-20 px-5 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-2">Pricing Simulator</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Build your perfect plan</h2>
            <p className="text-slate-400 mt-3">Pick a base plan and add extra keywords or locations. Prices update instantly.</p>
          </div>

          {/* Plan selector */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {plans.map(p => (
              <button
                key={p.id}
                onClick={() => { setSelectedPlan(p.id); setExtraKeywords(0); setExtraLocations(0); }}
                className={`glass rounded-2xl p-6 text-left transition-all relative ${
                  selectedPlan === p.id ? 'ring-2 ring-brand-500/40 bg-brand-500/[0.04]' : 'hover:bg-white/[0.03]'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 left-6 chip bg-brand-500 text-ink-950 text-[10px] font-bold px-2.5">POPULAR</span>
                )}
                <p className="font-semibold text-slate-100 text-lg">{p.name}</p>
                <p className="text-3xl font-bold text-slate-50 mt-2">
                  ${p.basePrice}<span className="text-sm font-normal text-slate-500">/mo</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">{p.keywords} keywords · {p.locations} locations</p>
                <div className="mt-4 space-y-1.5">
                  {p.features.slice(0, 4).map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" /> {f}
                    </div>
                  ))}
                  {p.features.length > 4 && <p className="text-xs text-slate-500 pl-5">+{p.features.length - 4} more</p>}
                </div>
              </button>
            ))}
          </div>

          {/* Add-ons */}
          <div className="glass rounded-2xl p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-200">Extra Keywords</label>
                  <span className="text-sm font-bold text-brand-300 tabular-nums">+{extraKeywords}</span>
                </div>
                <input
                  type="range" min={0} max={2000} step={100} value={extraKeywords}
                  onChange={e => setExtraKeywords(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <p className="text-xs text-slate-500 mt-1">$0.15 per keyword / month</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-200">Extra Locations</label>
                  <span className="text-sm font-bold text-brand-300 tabular-nums">+{extraLocations}</span>
                </div>
                <input
                  type="range" min={0} max={100} step={5} value={extraLocations}
                  onChange={e => setExtraLocations(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <p className="text-xs text-slate-500 mt-1">$2.00 per location / month</p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">Estimated monthly cost</p>
                <p className="text-3xl font-bold text-slate-50 tabular-nums">
                  ${totalPrice.toFixed(2)}<span className="text-sm font-normal text-slate-500">/mo</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {plan.keywords + extraKeywords} keywords · {plan.locations + extraLocations} locations
                </p>
              </div>
              <button
                onClick={() => { onLaunch(); toast('success', 'Plan selected', `${plan.name} plan loaded into your demo dashboard`); }}
                className="btn-primary px-6 py-3.5"
              >
                Start with {plan.name} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-5 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Questions, answered</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-slate-100">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed animate-fade-in">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto glass rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="relative">
            <BellRing className="w-10 h-10 text-brand-400 mx-auto mb-5" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to track your rankings?</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Launch the demo dashboard and explore all 8 modules with realistic SEO data — no signup required.</p>
            <button
              onClick={() => onLaunch()}
              className="btn-primary px-7 py-3.5 text-base mt-7 group"
            >
              Launch Live Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8 px-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-ink-950" strokeWidth={2.6} />
            </div>
            <span className="font-semibold text-sm text-slate-300">RankFlow</span>
            <span className="text-xs text-slate-600">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <button onClick={() => setModal('privacy')} className="hover:text-slate-300 transition-colors">Privacy</button>
            <button onClick={() => setModal('terms')} className="hover:text-slate-300 transition-colors">Terms</button>
            <button onClick={() => setModal('docs')} className="hover:text-slate-300 transition-colors">Docs</button>
          </div>
        </div>
      </footer>

      {/* Legal / Docs modals */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setModal(null)}
        >
          <div
            className="glass rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100 text-lg">
                {modal === 'privacy' ? 'Privacy Policy' : modal === 'terms' ? 'Terms of Service' : 'Documentation'}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-slate-400 leading-relaxed space-y-3">
              {modal === 'privacy' && <>
                <p>RankFlow is committed to protecting your privacy. This policy describes what data we collect and how we use it.</p>
                <p><strong className="text-slate-300">Data We Collect:</strong> Account email, tracked keyword lists, domain configurations, and usage analytics. We do not sell your data to third parties.</p>
                <p><strong className="text-slate-300">Data Storage:</strong> All data is encrypted at rest and in transit. API keys are stored securely and never exposed in client-side code.</p>
                <p><strong className="text-slate-300">Cookies:</strong> We use essential cookies for authentication and session management. No tracking or advertising cookies are deployed.</p>
                <p><strong className="text-slate-300">Your Rights:</strong> You may export or delete your data at any time from Settings. Deletion is permanent and irreversible.</p>
                <p className="text-xs text-slate-500 pt-2">Last updated: October 2026. Questions? Contact privacy@rankflow.io</p>
              </>}
              {modal === 'terms' && <>
                <p>By using RankFlow, you agree to the following terms and conditions.</p>
                <p><strong className="text-slate-300">Acceptable Use:</strong> You may track keywords for domains you own or manage. Scraping SERPs at excessive volumes or violating search engine ToS is prohibited.</p>
                <p><strong className="text-slate-300">Subscriptions:</strong> Plans are billed monthly and can be cancelled anytime. Refunds for partial months are not provided.</p>
                <p><strong className="text-slate-300">Service Availability:</strong> We strive for 99.9% uptime but do not guarantee uninterrupted service. Rate limits may apply during peak usage.</p>
                <p><strong className="text-slate-300">Liability:</strong> RankFlow is provided "as is" without warranties. We are not liable for ranking changes, traffic loss, or business decisions based on our data.</p>
                <p className="text-xs text-slate-500 pt-2">Last updated: October 2026. Questions? Contact legal@rankflow.io</p>
              </>}
              {modal === 'docs' && <>
                <p>Welcome to the RankFlow documentation. Here's a quick guide to get you started.</p>
                <p><strong className="text-slate-300">Getting Started:</strong> Click "Launch Dashboard" to enter the app. Use the sidebar to navigate between modules — Overview, Keywords, Local Maps, Competitors, Search Console, Citations, Reports, and Alerts.</p>
                <p><strong className="text-slate-300">Rank Tracking:</strong> Add keywords in the Keywords module. Each row has a "Check Now" button for a simulated position refresh. Historical data is synced from Google Search Console. Connect a Serper API key in Settings to enable live SERP scraping.</p>
                <p><strong className="text-slate-300">Local Maps:</strong> The geo-grid heatmap shows your rank at 36 points across your target city. Click any cell to drill into the local 3-Pack.</p>
                <p><strong className="text-slate-300">AI Diagnosis:</strong> When a keyword drops 3+ positions, an "AI Analyze" button appears. It produces a root-cause analysis with fix recommendations.</p>
                <p><strong className="text-slate-300">White-Label Reports:</strong> Upload your logo and set brand colors in Settings, then generate client-ready PDFs from the Reports module.</p>
                <p className="text-xs text-slate-500 pt-2">Full API documentation available at docs.rankflow.io. Need help? Email support@rankflow.io</p>
              </>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
