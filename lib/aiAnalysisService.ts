import { AIAnalysis, CreativeWithAI } from './aiAnalysisTypes';

// Mock AI Analysis Generator
export function generateAIAnalysis(creative: any): AIAnalysis {
  const tone = creative.tone || 'Casual & Relatable';
  const persona = creative.persona || 'General Audience';
  const style = creative.style || 'User Generated Content';
  const ctr = creative.CTR_pct || creative.CTR * 100;
  const spend = creative.SPEND || 0;

  // Determine performance tier
  const performanceTier = ctr > 2.5 ? 'Champion' : ctr > 1.5 ? 'Emerging' : 'Optimization Needed';
  
  const mockAnalyses = {
    'Champion': {
      strategicSummary: {
        overview: `This ${tone.toLowerCase()} creative demonstrates exceptional performance with strong audience resonance. The ${style.toLowerCase()} approach effectively connects with the ${persona.toLowerCase()} demographic.`,
        keyStrengths: [
          'Outstanding CTR performance above industry benchmarks',
          'Effective tone-persona alignment',
          'Strong visual-message consistency',
          'Optimal creative length for engagement'
        ],
        performanceFactors: [
          'Authentic testimonial delivery builds trust',
          'Clear value proposition presentation',
          'Compelling call-to-action timing',
          'Strong emotional connection points'
        ],
        recommendations: [
          'Scale this creative format to similar audiences',
          'Test variations with different personas',
          'Maintain current tone and messaging strategy',
          'Consider creating sequential campaign series'
        ]
      },
      highFidelityDescription: {
        characters: 'Primary spokesperson: Confident professional in casual attire, appearing authentic and approachable',
        setting: 'Clean, modern environment with natural lighting and minimal distractions',
        visualElements: 'Dynamic text overlays, smooth transitions, consistent brand colors throughout',
        textOverlays: 'Bold, readable fonts highlighting key benefits and statistics',
        audioElements: 'Clear voiceover with background music at appropriate levels',
        duration: '15-30 seconds optimized for platform engagement'
      },
      sceneBreakdown: [
        {
          timestamp: '0:00-0:03',
          scene: 'Opening Hook',
          description: 'Attention-grabbing statement with strong visual impact',
          keyElements: ['Bold text overlay', 'Speaker eye contact', 'Brand introduction']
        },
        {
          timestamp: '0:04-0:12',
          scene: 'Value Proposition',
          description: 'Clear explanation of benefits with supporting visuals',
          keyElements: ['Product demonstration', 'Key statistics', 'Social proof elements']
        },
        {
          timestamp: '0:13-0:15',
          scene: 'Call to Action',
          description: 'Strong, clear directive with compelling urgency',
          keyElements: ['Action button highlight', 'Benefit reminder', 'Contact information']
        }
      ]
    },
    'Emerging': {
      strategicSummary: {
        overview: `This ${tone.toLowerCase()} creative shows promising potential with moderate performance metrics. The ${style.toLowerCase()} execution resonates with target ${persona.toLowerCase()} but has room for optimization.`,
        keyStrengths: [
          'Solid audience alignment and messaging',
          'Good creative production quality',
          'Appropriate tone for target demographic',
          'Clear brand presentation'
        ],
        performanceFactors: [
          'Moderate engagement levels indicate interest',
          'Decent click-through relative to impressions',
          'Cost-effective spend allocation',
          'Good foundation for optimization'
        ],
        recommendations: [
          'Test stronger opening hooks for attention',
          'Optimize call-to-action placement and urgency',
          'Consider A/B testing different personas',
          'Enhance visual elements for better engagement'
        ]
      },
      highFidelityDescription: {
        characters: 'Relatable spokesperson with good delivery but could benefit from more dynamic presentation',
        setting: 'Appropriate environment matching brand aesthetic with minor optimization opportunities',
        visualElements: 'Standard visual treatment with potential for more engaging transitions',
        textOverlays: 'Clear but could be more visually compelling and attention-grabbing',
        audioElements: 'Good audio quality with room for more engaging background elements',
        duration: 'Appropriate length but pacing could be optimized for better retention'
      },
      sceneBreakdown: [
        {
          timestamp: '0:00-0:04',
          scene: 'Introduction',
          description: 'Standard opening with moderate impact potential',
          keyElements: ['Basic text introduction', 'Speaker presentation', 'Brand mention']
        },
        {
          timestamp: '0:05-0:18',
          scene: 'Content Delivery',
          description: 'Information presentation with room for more engagement',
          keyElements: ['Product explanation', 'Feature highlights', 'Benefit statements']
        },
        {
          timestamp: '0:19-0:22',
          scene: 'Closing',
          description: 'Standard call-to-action with optimization potential',
          keyElements: ['Basic CTA', 'Contact information', 'Brand reminder']
        }
      ]
    },
    'Optimization Needed': {
      strategicSummary: {
        overview: `This ${tone.toLowerCase()} creative requires strategic optimization to improve performance. While the ${style.toLowerCase()} approach has potential, key elements need refinement for better ${persona.toLowerCase()} engagement.`,
        keyStrengths: [
          'Clear brand message delivery',
          'Appropriate tone selection for audience',
          'Good production baseline',
          'Potential for significant improvement'
        ],
        performanceFactors: [
          'Lower engagement suggests messaging misalignment',
          'Cost efficiency could be improved',
          'Audience connection points need strengthening',
          'Creative elements need optimization'
        ],
        recommendations: [
          'Revise opening to create stronger hook',
          'Test different persona targeting approaches',
          'Optimize visual hierarchy and text placement',
          'Consider complete creative refresh with A/B testing',
          'Implement urgency and scarcity elements',
          'Enhance call-to-action visibility and appeal'
        ]
      },
      highFidelityDescription: {
        characters: 'Speaker delivery needs more energy and authenticity to connect with audience',
        setting: 'Environment could better support message and create stronger visual appeal',
        visualElements: 'Visual treatment needs enhancement for better attention and engagement',
        textOverlays: 'Text elements need redesign for improved readability and impact',
        audioElements: 'Audio mix and background elements could better support messaging',
        duration: 'Length optimization needed based on engagement drop-off points'
      },
      sceneBreakdown: [
        {
          timestamp: '0:00-0:05',
          scene: 'Weak Opening',
          description: 'Opening lacks impact and fails to capture immediate attention',
          keyElements: ['Generic introduction', 'Low-energy delivery', 'Unclear value proposition']
        },
        {
          timestamp: '0:06-0:20',
          scene: 'Information Dense Middle',
          description: 'Too much information without clear hierarchy or engagement',
          keyElements: ['Overwhelming details', 'Weak visual support', 'Lost audience interest']
        },
        {
          timestamp: '0:21-0:25',
          scene: 'Weak Call-to-Action',
          description: 'Ineffective closing that fails to drive action',
          keyElements: ['Unclear CTA', 'No urgency', 'Weak brand reinforcement']
        }
      ]
    }
  };

  const analysis = mockAnalyses[performanceTier];
  
  return {
    id: `ai_${creative.GRID_KEY}_${Date.now()}`,
    creativeId: creative.GRID_KEY,
    gridKey: creative.GRID_KEY,
    strategicSummary: analysis.strategicSummary,
    highFidelityDescription: analysis.highFidelityDescription,
    sceneBreakdown: analysis.sceneBreakdown,
    performanceAnalysis: {
      tier: performanceTier,
      potential: performanceTier === 'Champion' ? 'High' : performanceTier === 'Emerging' ? 'Medium' : 'High',
      hasRecommendations: true,
      confidenceScore: performanceTier === 'Champion' ? 0.95 : performanceTier === 'Emerging' ? 0.78 : 0.85
    },
    metadata: {
      analyzedAt: new Date().toISOString(),
      version: '2.1.0',
      processingTime: Math.floor(Math.random() * 3000) + 1000
    }
  };
}

export function enhanceCreativeWithAI(creative: any): CreativeWithAI {
  const aiAnalysis = generateAIAnalysis(creative);
  const ctr = creative.CTR_pct || creative.CTR * 100;
  
  return {
    ...creative,
    aiAnalysis,
    performanceTier: aiAnalysis.performanceAnalysis.tier,
    hasAIRecommendations: aiAnalysis.performanceAnalysis.hasRecommendations
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