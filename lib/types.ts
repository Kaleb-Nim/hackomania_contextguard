import type { RumourPrediction, HistoricalPattern } from "@/data/demo-scenario";

export interface AnalyzeResponse {
  predictions: RumourPrediction[];
  historicalPatterns: HistoricalPattern[];
  communityLeadersCount: number;
  constituencies: number;
  sources: { label: string; url: string }[];
  fallback?: boolean;
}
