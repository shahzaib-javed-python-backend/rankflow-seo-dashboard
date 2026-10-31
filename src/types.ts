export type TrendPoint = 'up' | 'down' | 'flat';

export interface Keyword {
  id: string;
  term: string;
  url: string;
  rank: number;
  prevRank: number;
  volume: number;
  features: SerpFeature[];
  device: 'desktop' | 'mobile';
  location: string;
  lastChecked: string;
  history: number[];
}

export type SerpFeature =
  | 'featured-snippet'
  | 'local-pack'
  | 'video'
  | 'image'
  | 'people-also-ask'
  | 'knowledge-panel'
  | 'sitelinks'
  | 'reviews';

export interface LocalListing {
  id: string;
  business: string;
  position: 1 | 2 | 3 | number;
  rating: number;
  reviews: number;
  address: string;
  category: string;
  status: 'verified' | 'suspended' | 'pending';
  query: string;
}

export interface Competitor {
  domain: string;
  avgPosition: number;
  sharedKeywords: number;
  traffic: 'High' | 'Medium' | 'Low';
  overlap: number;
  trend: number[];
}

export interface GscMetric {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface Alert {
  id: string;
  type: 'rank-drop' | 'rank-gain' | 'local' | 'gsc' | 'system';
  title: string;
  detail: string;
  time: string;
  read: boolean;
  severity: 'critical' | 'warning' | 'info';
}

export interface TrendDatum {
  month: string;
  avgPosition: number;
  gscClicks: number;
}

export interface GeoGridCell {
  id: number;
  row: number;
  col: number;
  lat: number;
  lng: number;
  rank: number;
  business: string;
  rating: number;
  reviews: number;
  address: string;
  category: string;
  status: 'verified' | 'suspended' | 'pending';
}

export interface AiDiagnosis {
  keywordId: string;
  volatilityScore: number;
  volatilityVerdict: 'stable' | 'elevated' | 'high';
  competitorShift: { domain: string; shift: string; note: string };
  contentGap: string;
  recommendation: string;
  steps: string[];
  confidence: number;
}

export interface OpportunityKeyword {
  id: string;
  term: string;
  competitor: string;
  competitorRank: number;
  clientRank: number | null;
  volume: number;
  difficulty: 'Low' | 'Medium' | 'High';
  intent: 'informational' | 'commercial' | 'transactional';
  opportunity: 'high' | 'medium' | 'low';
  priorityScore: number;
}

