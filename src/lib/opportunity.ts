import type { OpportunityKeyword, Competitor } from '@/types';

/**
 * Compute a priority score (0–100) for a keyword opportunity using:
 * - Search volume (normalized log scale)
 * - Search intent (transactional > commercial > informational)
 * - Competitor rank proximity (closer to #1 = harder but more valuable)
 * - Difficulty (Low = easier to capture)
 * - Gap size (how far behind the client is)
 */
export function computePriorityScore(opp: OpportunityKeyword): number {
  const volumeScore = Math.min(40, Math.log10(opp.volume + 1) * 10);

  const intentWeights: Record<OpportunityKeyword['intent'], number> = {
    transactional: 25,
    commercial: 18,
    informational: 10,
  };
  const intentScore = intentWeights[opp.intent];

  // Closer competitor rank = more visible opportunity
  const rankProximity = Math.max(0, 15 - opp.competitorRank) / 15;
  const rankScore = rankProximity * 15;

  const difficultyScores: Record<OpportunityKeyword['difficulty'], number> = {
    Low: 12,
    Medium: 6,
    High: 0,
  };
  const difficultyScore = difficultyScores[opp.difficulty];

  // Larger gap = higher priority (client is further behind)
  const gap = opp.clientRank === null ? 30 : Math.min(20, opp.clientRank - opp.competitorRank);
  const gapScore = gap * 0.3;

  const total = volumeScore + intentScore + rankScore + difficultyScore + gapScore;
  return Math.min(100, Math.round(total));
}

export function scoreToTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

export interface OverlapResult {
  sharedKeywords: number;
  totalCompetitorKeywords: number;
  clientKeywords: number;
  overlapPercentage: number;
  missingCount: number;
  missingHighPriority: number;
}

/**
 * Compute keyword overlap between the client domain and a competitor.
 * Uses sharedKeywords from the competitor data and derives metrics.
 */
export function computeOverlap(competitor: Competitor, totalClientKeywords: number): OverlapResult {
  const shared = competitor.sharedKeywords;
  const overlapPct = totalClientKeywords > 0
    ? Math.round((shared / totalClientKeywords) * 100)
    : 0;
  const missing = Math.max(0, shared - Math.round(shared * (competitor.overlap / 100)));

  return {
    sharedKeywords: shared,
    totalCompetitorKeywords: shared,
    clientKeywords: totalClientKeywords,
    overlapPercentage: Math.min(100, overlapPct),
    missingCount: missing,
    missingHighPriority: Math.round(missing * 0.35),
  };
}

/**
 * Aggregate gap analysis across all competitors.
 */
export function aggregateGap(
  competitors: Competitor[],
  opportunities: OpportunityKeyword[],
  totalClientKeywords: number,
) {
  const overlaps = competitors.slice(1).map(c => computeOverlap(c, totalClientKeywords));
  const totalShared = overlaps.reduce((s, o) => s + o.sharedKeywords, 0);
  const avgOverlap = overlaps.length
    ? Math.round(overlaps.reduce((s, o) => s + o.overlapPercentage, 0) / overlaps.length)
    : 0;
  const totalMissing = overlaps.reduce((s, o) => s + o.missingCount, 0);
  const highPriority = opportunities.filter(o => scoreToTier(computePriorityScore(o)) === 'high').length;

  return {
    overlaps,
    totalShared,
    avgOverlap,
    totalMissing,
    highPriority,
    totalOpportunities: opportunities.length,
  };
}
