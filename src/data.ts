import type { Keyword, LocalListing, Competitor, GscMetric, Alert, TrendDatum, SerpFeature, GeoGridCell, AiDiagnosis, OpportunityKeyword } from '@/types';
import { radiusToSpan, type GridRadius } from '@/lib/geo';
import { computePriorityScore } from '@/lib/opportunity';

export const trendData: TrendDatum[] = [
  { month: 'May', avgPosition: 24.6, gscClicks: 1820 },
  { month: 'Jun', avgPosition: 21.3, gscClicks: 2410 },
  { month: 'Jul', avgPosition: 18.9, gscClicks: 3120 },
  { month: 'Aug', avgPosition: 16.2, gscClicks: 4080 },
  { month: 'Sep', avgPosition: 14.7, gscClicks: 4960 },
  { month: 'Oct', avgPosition: 12.4, gscClicks: 6230 },
];

function genHistory(current: number, prev: number, seed: number): number[] {
  const hist: number[] = [];
  let val = prev;
  for (let i = 0; i < 14; i++) {
    const noise = Math.sin(seed + i * 1.7) * 2.5 + Math.cos(seed * 0.5 + i) * 1.8;
    val = Math.max(1, Math.round(val + noise));
    hist.push(val);
  }
  hist.push(current);
  return hist;
}

export const keywords: Keyword[] = [
  { id: 'k1', term: 'python developer hiring', url: 'rankflow.io/jobs/python', rank: 3, prevRank: 5, volume: 8100, features: ['featured-snippet', 'sitelinks'], device: 'desktop', location: 'United States', lastChecked: '2h ago', history: genHistory(3, 5, 1) },
  { id: 'k2', term: 'best seo rank tracker', url: 'rankflow.io/features', rank: 1, prevRank: 1, volume: 14600, features: ['local-pack', 'sitelinks', 'reviews'], device: 'desktop', location: 'United States', lastChecked: '4h ago', history: genHistory(1, 1, 2) },
  { id: 'k3', term: 'local seo monitoring tool', url: 'rankflow.io/local', rank: 7, prevRank: 4, volume: 3200, features: ['people-also-ask'], device: 'mobile', location: 'Austin, TX', lastChecked: '6h ago', history: genHistory(7, 4, 3) },
  { id: 'k4', term: 'serp tracking api', url: 'rankflow.io/api', rank: 12, prevRank: 18, volume: 5400, features: ['video', 'image'], device: 'desktop', location: 'United States', lastChecked: '1h ago', history: genHistory(12, 18, 4) },
  { id: 'k5', term: 'white label seo reports', url: 'rankflow.io/reports', rank: 5, prevRank: 6, volume: 2900, features: ['featured-snippet'], device: 'desktop', location: 'United States', lastChecked: '3h ago', history: genHistory(5, 6, 5) },
  { id: 'k6', term: 'competitor rank analysis', url: 'rankflow.io/competitors', rank: 9, prevRank: 14, volume: 4100, features: ['people-also-ask', 'video'], device: 'mobile', location: 'Denver, CO', lastChecked: '5h ago', history: genHistory(9, 14, 6) },
  { id: 'k7', term: 'google search console sync', url: 'rankflow.io/integrations', rank: 15, prevRank: 13, volume: 1200, features: ['knowledge-panel'], device: 'desktop', location: 'United States', lastChecked: '8h ago', history: genHistory(15, 13, 7) },
  { id: 'k8', term: 'keyword rank drop alert', url: 'rankflow.io/alerts', rank: 2, prevRank: 8, volume: 6700, features: ['sitelinks', 'reviews'], device: 'desktop', location: 'United States', lastChecked: '12m ago', history: genHistory(2, 8, 8) },
  { id: 'k9', term: 'maps 3 pack tracker', url: 'rankflow.io/maps', rank: 6, prevRank: 9, volume: 2200, features: ['local-pack', 'image'], device: 'mobile', location: 'Seattle, WA', lastChecked: '20m ago', history: genHistory(6, 9, 9) },
  { id: 'k10', term: 'organic visibility score', url: 'rankflow.io/visibility', rank: 11, prevRank: 11, volume: 1800, features: ['featured-snippet'], device: 'desktop', location: 'United States', lastChecked: '1h ago', history: genHistory(11, 11, 10) },
];

export const localListings: LocalListing[] = [
  { id: 'l1', business: 'Summit Digital Agency', position: 1, rating: 4.9, reviews: 312, address: '120 Congress Ave, Austin, TX', category: 'Marketing Agency', status: 'verified', query: 'seo agency austin' },
  { id: 'l2', business: 'Lone Star SEO Co.', position: 2, rating: 4.6, reviews: 187, address: '45 Guadalupe St, Austin, TX', category: 'Marketing Agency', status: 'verified', query: 'seo agency austin' },
  { id: 'l3', business: 'Hill Country Marketing', position: 3, rating: 4.3, reviews: 96, address: '808 Rainey St, Austin, TX', category: 'Marketing Agency', status: 'verified', query: 'seo agency austin' },
  { id: 'l4', business: 'Summit Digital Agency', position: 1, rating: 4.9, reviews: 312, address: '120 Congress Ave, Austin, TX', category: 'Marketing Agency', status: 'verified', query: 'digital marketing austin tx' },
  { id: 'l5', business: 'Bright Web Studio', position: 2, rating: 4.7, reviews: 142, address: '301 W 6th St, Austin, TX', category: 'Web Designer', status: 'pending', query: 'digital marketing austin tx' },
  { id: 'l6', business: 'Lone Star SEO Co.', position: 3, rating: 4.6, reviews: 187, address: '45 Guadalupe St, Austin, TX', category: 'Marketing Agency', status: 'verified', query: 'digital marketing austin tx' },
];

export const competitors: Competitor[] = [
  { domain: 'rankflow.io', avgPosition: 12.4, sharedKeywords: 0, traffic: 'High', overlap: 100, trend: [24, 21, 18, 16, 14, 12] },
  { domain: 'semrush.com', avgPosition: 9.1, sharedKeywords: 847, traffic: 'High', overlap: 78, trend: [11, 10, 9, 9, 8, 9] },
  { domain: 'ahrefs.com', avgPosition: 10.8, sharedKeywords: 612, traffic: 'High', overlap: 64, trend: [13, 12, 11, 11, 10, 11] },
  { domain: 'seobserver.io', avgPosition: 18.3, sharedKeywords: 234, traffic: 'Medium', overlap: 31, trend: [22, 20, 19, 18, 18, 18] },
];

export const gscMetrics: GscMetric[] = (() => {
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  let clicks = 980, impressions = 42000;
  return months.map((m, i) => {
    clicks += Math.round(180 + Math.random() * 420);
    impressions += Math.round(2000 + Math.random() * 6000);
    return {
      date: m,
      clicks,
      impressions,
      ctr: +((clicks / impressions) * 100).toFixed(2),
      position: +(22 - i * 0.8 + (Math.random() - 0.5)).toFixed(1),
    };
  });
})();

export const alerts: Alert[] = [
  { id: 'a1', type: 'rank-drop', title: 'Keyword dropped', detail: '"local seo monitoring tool" dropped by 3 positions (4 → 7)', time: '12 min ago', read: false, severity: 'critical' },
  { id: 'a2', type: 'rank-gain', title: 'Keyword gained', detail: '"keyword rank drop alert" jumped 6 positions (8 → 2)', time: '1h ago', read: false, severity: 'info' },
  { id: 'a3', type: 'local', title: 'Local Pack change', detail: 'Summit Digital Agency dropped from #1 to #2 for "seo agency denver"', time: '3h ago', read: false, severity: 'warning' },
  { id: 'a4', type: 'gsc', title: 'GSC sync completed', detail: 'Search Console data synced — 6,230 new clicks recorded', time: '5h ago', read: true, severity: 'info' },
  { id: 'a5', type: 'rank-drop', title: 'Keyword dropped', detail: '"google search console sync" dropped by 2 positions', time: '8h ago', read: true, severity: 'warning' },
];

export const serpFeatureLabel: Record<SerpFeature, string> = {
  'featured-snippet': 'Featured Snippet',
  'local-pack': 'Local Pack',
  video: 'Video',
  image: 'Image',
  'people-also-ask': 'People Also Ask',
  'knowledge-panel': 'Knowledge Panel',
  sitelinks: 'Sitelinks',
  reviews: 'Reviews',
};

const businessNames = ['Summit Digital Agency', 'Lone Star SEO Co.', 'Hill Country Marketing', 'Bright Web Studio', 'Capital City Creative', 'ATX WebWorks'];
const categories = ['Marketing Agency', 'Web Designer', 'SEO Consultant', 'Advertising Agency'];
const statuses: LocalListing['status'][] = ['verified', 'verified', 'verified', 'pending', 'suspended'];
const streets = ['Congress Ave', 'Guadalupe St', 'Rainey St', 'W 6th St', 'E Cesar Chavez', 'S Lamar Blvd'];

export function buildGeoGrid(
  centerLat = 30.2672,
  centerLng = -97.7431,
  grid = 6,
  radius: GridRadius = 1,
): GeoGridCell[] {
  const span = radiusToSpan(radius, centerLat);
  const cells: GeoGridCell[] = [];
  const step = span / (grid - 1);
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const lat = +(centerLat - span / 2 + r * step).toFixed(4);
      const lng = +(centerLng - span / 2 + c * step).toFixed(4);
      const rank = Math.max(1, Math.round(((r * 6 + c) * 1.7) % 25) + 1);
      cells.push({
        id: r * grid + c,
        row: r,
        col: c,
        lat,
        lng,
        rank,
        business: businessNames[(r * 2 + c) % businessNames.length],
        rating: +(4 + ((r + c) % 10) / 10).toFixed(1),
        reviews: 40 + ((r * 7 + c * 13) % 280),
        address: `${100 + r * 20 + c} ${streets[(r + c) % streets.length]}, Austin, TX`,
        category: categories[(r + c) % categories.length],
        status: statuses[(r + c) % statuses.length],
      });
    }
  }
  return cells;
}

// Deterministic hash so the same keyword always produces the same diagnosis,
// making repeated runs stable instead of random.
function hashTerm(term: string): number {
  let h = 2166136261;
  for (let i = 0; i < term.length; i++) {
    h ^= term.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function diagnoseKeyword(term: string, prevRank: number, rank: number): AiDiagnosis {
  const drop = prevRank - rank < 0 ? rank - prevRank : 0;
  const seed = hashTerm(term + '|' + prevRank + '|' + rank);
  const vol = Math.min(95, 30 + drop * 8 + (seed % 21));
  const verdict: AiDiagnosis['volatilityVerdict'] = vol < 40 ? 'stable' : vol < 70 ? 'elevated' : 'high';
  const compPool = ['semrush.com', 'ahrefs.com', 'seobserver.io'];
  const comp = compPool[seed % compPool.length];
  const recs: Record<string, string> = {
    'local seo monitoring tool': 'Your page lacks a comparison table and pricing section that the top 3 results now include. Add structured data (Product schema) and refresh the intro to directly answer the query intent.',
    'google search console sync': 'Two competitors published fresh guides on GSC API v3 in the last 14 days. Update your integration page with current API examples and a step-by-step walkthrough.',
  };
  const recommendation = recs[term] ?? `The top-ranking pages for "${term}" were recently updated with richer content. Refresh your title tag, add an FAQ block, and strengthen internal links from your top pages.`;
  return {
    keywordId: term,
    volatilityScore: vol,
    volatilityVerdict: verdict,
    competitorShift: {
      domain: comp,
      shift: `+${1 + (seed % 4)} positions`,
      note: `${comp} improved content depth and earned 3 new referring domains in the past week, pushing it above your URL.`,
    },
    contentGap: drop >= 5
      ? 'Your page is 480 words vs. competitors averaging 1,240 words. Missing: comparison table, screenshots, and a clear value proposition in the first 100 words.'
      : 'Your page matches competitors on length but is missing a comparison table and 2 outbound authority links.',
    recommendation,
    steps: [
      'Rewrite the H1 and meta title to include the exact query and a benefit modifier',
      'Add a comparison table or feature checklist near the top of the page',
      'Insert 3–5 internal links from related high-authority pages',
      'Implement FAQ schema with 4 questions answering common user intent',
      'Request 2 fresh referring domains via outreach in the next 7 days',
    ],
    confidence: 78 + (seed % 18),
  };
}

const rawOpps: Omit<OpportunityKeyword, 'priorityScore' | 'opportunity'>[] = [
  { id: 'o1', term: 'free keyword research tool', competitor: 'semrush.com', competitorRank: 2, clientRank: null, volume: 18300, difficulty: 'High', intent: 'commercial' },
  { id: 'o2', term: 'backlink checker free', competitor: 'ahrefs.com', competitorRank: 1, clientRank: null, volume: 9900, difficulty: 'High', intent: 'commercial' },
  { id: 'o3', term: 'seo audit tool', competitor: 'semrush.com', competitorRank: 4, clientRank: 28, volume: 7200, difficulty: 'Medium', intent: 'commercial' },
  { id: 'o4', term: 'google rank checker', competitor: 'ahrefs.com', competitorRank: 3, clientRank: 31, volume: 12400, difficulty: 'Medium', intent: 'informational' },
  { id: 'o5', term: 'schema markup generator', competitor: 'seobserver.io', competitorRank: 5, clientRank: null, volume: 5600, difficulty: 'Low', intent: 'transactional' },
  { id: 'o6', term: 'core web vitals checker', competitor: 'semrush.com', competitorRank: 7, clientRank: 22, volume: 4100, difficulty: 'Low', intent: 'informational' },
  { id: 'o7', term: 'serp simulator', competitor: 'ahrefs.com', competitorRank: 6, clientRank: null, volume: 3200, difficulty: 'Low', intent: 'transactional' },
  { id: 'o8', term: 'keyword density analyzer', competitor: 'seobserver.io', competitorRank: 8, clientRank: 25, volume: 2400, difficulty: 'Low', intent: 'informational' },
  { id: 'o9', term: 'internal link checker', competitor: 'semrush.com', competitorRank: 9, clientRank: null, volume: 1900, difficulty: 'Low', intent: 'transactional' },
  { id: 'o10', term: 'robots.txt generator', competitor: 'ahrefs.com', competitorRank: 10, clientRank: 34, volume: 3800, difficulty: 'Low', intent: 'transactional' },
];

function tier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

export const opportunityKeywords: OpportunityKeyword[] = rawOpps.map(o => {
  const priorityScore = computePriorityScore(o as OpportunityKeyword);
  return { ...o, priorityScore, opportunity: tier(priorityScore) };
});

