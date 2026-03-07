export type {
  RiskLevel,
  RumourPrediction,
  HistoricalPattern,
  AnalyzeStep,
  DemoScenario,
  Language,
} from "@/data/demo-scenario";

export interface TopicExtraction {
  topics: string[];
  affectedCommunities: string[];
  emotionalTriggers: string[];
  searchQueries: string[];
}

export interface ScrapedSource {
  url: string;
  title: string;
  content: string;
  domain: string;
}

export interface AnalyzeRequest {
  text: string;
}

export interface AnalyzeResponse {
  predictions: import("@/data/demo-scenario").RumourPrediction[];
  historicalPatterns: import("@/data/demo-scenario").HistoricalPattern[];
  communityLeadersCount: number;
  constituencies: number;
  sources: { label: string; url: string }[];
  fallback?: boolean;
}
