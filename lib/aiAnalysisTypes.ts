export interface RealAIAnalysis {
  strategic_summary: string; // Raw strategic summary from Excel
  concept: string;
  insight: string;
  tone: string;
  persona: string;
  style: string;
  messaging_theme: string;
  financial_emotion: string;
  s3_path: string;
  length: string;
  High_Fidelity_Description?: string; // High fidelity description from Excel
  Scene_by_Scene_Breakdown?: string; // Scene breakdown from Excel
}

// Parsed version of Strategic Summary
export interface ParsedStrategicSummary {
  strengthsAndGaps: string;
  personaHeatmap: string;
  emotionalArc: string;
  recommendations: string[];
}

export interface AIAnalysis {
  id: string;
  creativeId: string;
  gridKey: string;
  rawStrategicSummary: string;
  parsedSummary: ParsedStrategicSummary;
  creativeDetails: {
    concept: string;
    insight: string;
    length: string;
    messagingTheme: string;
    financialEmotion: string;
    s3Path: string;
    highFidelityDescription?: string; // High fidelity description from Excel
    sceneBreakdown?: string; // Scene breakdown from Excel
  };
  performanceAnalysis: {
    tier: 'Champion' | 'Optimization Needed' | 'Emerging';
    potential: 'High' | 'Medium' | 'Low';
    hasRecommendations: boolean;
    confidenceScore: number;
  };
  metadata: {
    analyzedAt: string;
    version: string;
    source: 'excel_data';
  };
}

export interface CreativeWithAI {
  [key: string]: any;
  "Ad Name": string;
  "SPEND": number;
  "IMPRESSIONS": number;
  "CLICKS": number;
  "CTR": number;
  "CPC": number;
  "CPM": number;
  "CTR_pct": number;
  "cluster_id": number;
  "High_Fidelity_Description"?: string; // High fidelity description from Excel
  "Scene_by_Scene_Breakdown"?: string; // Scene breakdown from Excel
  aiAnalysis?: AIAnalysis;
  performanceTier: 'Champion' | 'Optimization Needed' | 'Emerging';
  hasAIRecommendations: boolean;
}