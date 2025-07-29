import { AIAnalysis, ParsedStrategicSummary, CreativeWithAI } from './aiAnalysisTypes';

// Parse the Strategic_Summary field from Excel data
export function parseStrategicSummary(rawSummary: string): ParsedStrategicSummary {
  if (!rawSummary) {
    return {
      strengthsAndGaps: 'No analysis available',
      personaHeatmap: 'No persona analysis available',
      emotionalArc: 'No emotional analysis available',
      recommendations: ['Analysis not available']
    };
  }

  // Split the summary by the known sections
  const strengthsMatch = rawSummary.match(/\*\*Strengths & Gaps:\*\*([\s\S]*?)(?=\*\*|$)/);
  const personaMatch = rawSummary.match(/\*\*Persona Heatmap:\*\*([\s\S]*?)(?=\*\*|$)/);
  const emotionalMatch = rawSummary.match(/\*\*Emotional Arc:\*\*([\s\S]*?)(?=\*\*|$)/);
  const recommendationsMatch = rawSummary.match(/\*\*Top 3 Recommendations:\*\*([\s\S]*?)(?=\*\*|$)/);

  // Extract recommendations and split into array
  let recommendations: string[] = ['No specific recommendations available'];
  if (recommendationsMatch && recommendationsMatch[1]) {
    const recText = recommendationsMatch[1].trim();
    // Split by numbered points (1., 2., 3.)
    const recArray = recText.split(/\d+\./).filter(r => r.trim().length > 0);
    if (recArray.length > 0) {
      recommendations = recArray.map(r => r.trim()).filter(r => r.length > 0);
    }
  }

  return {
    strengthsAndGaps: strengthsMatch ? strengthsMatch[1].trim() : 'Analysis not available in this section',
    personaHeatmap: personaMatch ? personaMatch[1].trim() : 'Persona analysis not available in this section',
    emotionalArc: emotionalMatch ? emotionalMatch[1].trim() : 'Emotional analysis not available in this section',
    recommendations
  };
}

// Convert real creative data to AI Analysis format
export function createRealAIAnalysis(creative: any): AIAnalysis {
  const parsedSummary = parseStrategicSummary(creative.Strategic_Summary || '');
  const ctr = creative.CTR_pct || creative.CTR * 100;
  
  // Determine performance tier based on CTR
  const performanceTier = ctr > 2.5 ? 'Champion' : ctr > 1.5 ? 'Emerging' : 'Optimization Needed';
  
  return {
    id: `real_${creative.GRID_KEY}_${Date.now()}`,
    creativeId: creative.GRID_KEY,
    gridKey: creative.GRID_KEY,
    rawStrategicSummary: creative.Strategic_Summary || '',
    parsedSummary,
    creativeDetails: {
      concept: creative.CONCEPT || '',
      insight: creative.INSIGHT || '',
      length: creative.LENGTH || '',
      messagingTheme: creative.MESSAGING_THEME || '',
      financialEmotion: creative.FINANCIAL_EMOTION || '',
      s3Path: creative.S3PATH_SCF || '',
      highFidelityDescription: creative.High_Fidelity_Description || '',
      sceneBreakdown: creative.Scene_by_Scene_Breakdown || ''
    },
    performanceAnalysis: {
      tier: performanceTier,
      potential: performanceTier === 'Champion' ? 'High' : performanceTier === 'Emerging' ? 'Medium' : 'High',
      hasRecommendations: !!(creative.Strategic_Summary && creative.Strategic_Summary.length > 10),
      confidenceScore: 0.95 // High confidence since this is real analysis
    },
    metadata: {
      analyzedAt: new Date().toISOString(),
      version: '1.0.0',
      source: 'excel_data'
    }
  };
}

export function enhanceRealCreativeWithAI(creative: any): CreativeWithAI {
  const aiAnalysis = createRealAIAnalysis(creative);
  
  return {
    ...creative,
    aiAnalysis,
    performanceTier: aiAnalysis.performanceAnalysis.tier,
    hasAIRecommendations: aiAnalysis.performanceAnalysis.hasRecommendations,
    // Ensure S3 path is available for media display
    S3PATH_SCF: creative.S3PATH_SCF || '',
    NAME_SCF: creative.NAME_SCF || ''
  };
}

export function getPerformanceBadgeColor(tier: string): string {
  switch (tier) {
    case 'Champion': return 'bg-emerald-500';
    case 'Emerging': return 'bg-blue-500';
    case 'Optimization Needed': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
}

export function getPerformanceBorderColor(tier: string): string {
  switch (tier) {
    case 'Champion': return 'border-emerald-500/50';
    case 'Emerging': return 'border-blue-500/50';
    case 'Optimization Needed': return 'border-amber-500/50';
    default: return 'border-gray-500/50';
  }
}

// Get AI insight preview from real data
export function getAIInsightPreview(creative: any): string {
  if (!creative.Strategic_Summary) {
    return 'Strategic analysis available - click to view full insights...';
  }
  
  // Try to extract the first meaningful sentence from the summary
  const summary = creative.Strategic_Summary;
  
  // Look for the first sentence in Strengths & Gaps section
  const strengthsMatch = summary.match(/\*\*Strengths & Gaps:\*\*\s*([^.]*\.)/);
  if (strengthsMatch && strengthsMatch[1]) {
    const insight = strengthsMatch[1].trim();
    return insight.length > 80 ? insight.slice(0, 77) + '...' : insight;
  }
  
  // Fallback to first sentence of the whole summary
  const firstSentence = summary.split('.')[0];
  if (firstSentence && firstSentence.length > 10) {
    return firstSentence.length > 80 ? firstSentence.slice(0, 77) + '...' : firstSentence + '.';
  }
  
  return 'Comprehensive strategic analysis with actionable recommendations...';
}