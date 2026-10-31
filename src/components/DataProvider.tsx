import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  keywords as demoKeywords, localListings as demoLocal, competitors as demoCompetitors,
  gscMetrics as demoGsc, alerts as demoAlerts, trendData as demoTrend,
  opportunityKeywords as demoOpps, buildGeoGrid, diagnoseKeyword,
} from '@/data';
import type {
  Keyword, LocalListing, Competitor, GscMetric, Alert, TrendDatum,
  GeoGridCell, AiDiagnosis, OpportunityKeyword,
} from '@/types';
import type { GridRadius } from '@/lib/geo';

interface DataContextValue {
  demoMode: boolean;
  toggleDemo: () => void;
  keywords: Keyword[];
  localListings: LocalListing[];
  competitors: Competitor[];
  gscMetrics: GscMetric[];
  alerts: Alert[];
  trendData: TrendDatum[];
  opportunityKeywords: OpportunityKeyword[];
  geoGrid: GeoGridCell[];
  buildGeoGrid: (centerLat?: number, centerLng?: number, grid?: number, radius?: GridRadius) => GeoGridCell[];
  diagnoseKeyword: typeof diagnoseKeyword;
}

const Ctx = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

const empty: Omit<DataContextValue, 'demoMode' | 'toggleDemo' | 'buildGeoGrid' | 'diagnoseKeyword'> = {
  keywords: [],
  localListings: [],
  competitors: [],
  gscMetrics: [],
  alerts: [],
  trendData: [],
  opportunityKeywords: [],
  geoGrid: [],
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoMode] = useState(true);

  const value: DataContextValue = demoMode
    ? {
        demoMode,
        toggleDemo: () => setDemoMode(false),
        keywords: demoKeywords,
        localListings: demoLocal,
        competitors: demoCompetitors,
        gscMetrics: demoGsc,
        alerts: demoAlerts,
        trendData: demoTrend,
        opportunityKeywords: demoOpps,
        geoGrid: buildGeoGrid(),
        buildGeoGrid,
        diagnoseKeyword,
      }
    : {
        demoMode,
        toggleDemo: () => setDemoMode(true),
        ...empty,
        buildGeoGrid,
        diagnoseKeyword,
      };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
