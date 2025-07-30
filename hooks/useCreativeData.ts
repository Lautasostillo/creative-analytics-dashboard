'use client';
import { useState, useEffect, useMemo } from 'react';

interface CreativeData {
  GRID_KEY: string;
  CTR: number;
  SPEND: number;
  IMPRESSIONS: number;
  CTR_DELTA?: number;
  tone: string;
  persona: string;
  style: string;
  CPC: number;
  conversions?: number;
  "Ad Name"?: string;
  TONE?: string;
  PERSONA?: string;
  STYLE?: string;
}

// Data cleaning utilities
function cleanTone(tone: string): string {
  const cleaned = tone.toLowerCase().trim().replace(/[.,|→·]/g, ' ');
  
  // 8 Main tone categories - comprehensive grouping
  if (cleaned.includes('hopeful') || cleaned.includes('encouraging')) return 'Hopeful & Encouraging';
  if (cleaned.includes('positive') || cleaned.includes('empowering')) return 'Positive & Empowering';
  if (cleaned.includes('enthusiastic') || cleaned.includes('upbeat') || cleaned.includes('excited')) return 'Enthusiastic & Upbeat';
  if (cleaned.includes('humorous') || cleaned.includes('lighthearted') || cleaned.includes('playful')) return 'Humorous & Lighthearted';
  if (cleaned.includes('educational') || cleaned.includes('informative')) return 'Educational & Informative';
  if (cleaned.includes('reassuring') || cleaned.includes('empathetic') || cleaned.includes('trustworthy')) return 'Reassuring & Empathetic';
  if (cleaned.includes('casual') || cleaned.includes('relatable') || cleaned.includes('friendly')) return 'Casual & Relatable';
  if (cleaned.includes('uplifting') || cleaned.includes('inspiring') || cleaned.includes('warm')) return 'Uplifting';
  
  // Fallback for any unmapped tones
  return 'Casual & Relatable';
}

function cleanPersona(persona: string): string {
  const cleaned = persona.trim();
  
  // Standardize personas
  if (cleaned.includes('Rebuilder')) return 'Rebuilder';
  if (cleaned.includes('Student')) return 'Student';
  if (cleaned.includes('Young Professional')) return 'Young Professional';
  if (cleaned.includes('Other')) return 'General Audience';
  
  return cleaned;
}

function cleanStyle(style: string): string {
  const cleaned = style.trim().replace(/[.,]/g, ' ').toLowerCase();
  
  // 10 Main style categories - comprehensive grouping
  if (cleaned.includes('user generated content') || cleaned.includes('user-generated content') || cleaned.includes('ugc')) return 'User Generated Content';
  if (cleaned.includes('direct address') || cleaned.includes('direct-to-camera') || cleaned.includes('direct response')) return 'Direct Address';
  if (cleaned.includes('animation') || cleaned.includes('2d') || cleaned.includes('3d') || cleaned.includes('motion graphics') || cleaned.includes('animated')) return 'Animation & Motion Graphics';
  if (cleaned.includes('testimonial') || cleaned.includes('lifestyle') || cleaned.includes('slice') || cleaned.includes('authentic')) return 'Testimonial & Lifestyle';
  if (cleaned.includes('fast') || cleaned.includes('dynamic') || cleaned.includes('engaging')) return 'Fast-Paced Cuts';
  if (cleaned.includes('live action') || cleaned.includes('man-on-the-street') || cleaned.includes('interview') && !cleaned.includes('animation')) return 'Live Action';
  if (cleaned.includes('screen recording') || cleaned.includes('user interface') || cleaned.includes('app demo')) return 'Screen Recording';
  if (cleaned.includes('clean') || cleaned.includes('modern') || cleaned.includes('minimalist') || cleaned.includes('simple')) return 'Clean & Modern';
  if (cleaned.includes('casual') || cleaned.includes('relatable') || cleaned.includes('conversational')) return 'Authentic & Relatable';
  if (cleaned.includes('stop motion') || cleaned.includes('chalkboard') || cleaned.includes('whiteboard') || cleaned.includes('8-bit') || cleaned.includes('pixel') || cleaned.includes('detective') || cleaned.includes('flipbook') || cleaned.includes('evocative') || cleaned.includes('dramatic') || cleaned.includes('hand') || cleaned.includes('dark background') || cleaned.includes('visceral')) return 'Creative & Experimental';
  
  // Fallback for any unmapped styles
  return 'User Generated Content';
}

export function useCreativeData() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    fetch('/api/genome/grid')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Invalid data format');
        const processedData = data.map((item: any) => {
          // Handle both old grid.parquet format and new creatives.parquet format
          let rawTone, rawPersona, rawStyle;
          
          if (item.GRID_KEY) {
            // Old format: parse from GRID_KEY
            [rawTone, rawPersona, rawStyle] = item.GRID_KEY.split('|').map((s: string) => s.trim());
          } else {
            // New format: use individual fields
            rawTone = item.TONE || '';
            rawPersona = item.PERSONA || '';
            rawStyle = item.STYLE || '';
          }
          
          // Calculate CPC safely
          const spend = Number(item.SPEND || 0);
          const impressions = Number(item.IMPRESSIONS || 0);
          const ctr = Number(item.CTR || 0);
          const cpc = (impressions * ctr) > 0 ? spend / (impressions * ctr) : 0;
          
          return {
            ...item,
            tone: cleanTone(rawTone),
            persona: cleanPersona(rawPersona),
            style: cleanStyle(rawStyle),
            rawTone,
            rawPersona,
            rawStyle,
            CPC: cpc,
            conversions: Math.round(impressions * ctr * 0.15) // Estimated conversions
          };
        });
        setRawData(processedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Data loading error:', err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data: rawData, loading, error };
}

export function useFilteredCreativeData(filters: { tone?: string; persona?: string; style?: string }) {
  const { data, loading, error } = useCreativeData();
  
  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    return data.filter(item => {
      if (filters.tone && item.tone !== filters.tone) return false;
      if (filters.persona && item.persona !== filters.persona) return false;
      if (filters.style && item.style !== filters.style) return false;
      return true;
    });
  }, [data, filters]);

  return { data: filteredData, loading, error };
}

export function useCreativeInsights(data: CreativeData[]) {
  return useMemo(() => {
    if (!data.length) return {
      kpis: {
        totalSpend: 0,
        totalImpressions: 0,
        avgCTR: 0,
        avgCPC: 0,
        totalConversions: 0,
        totalConcepts: 0,
        costPerConversion: 0,
        roas: 0
      },
      tonePerformance: [],
      personaPerformance: [],
      stylePerformance: [],
      bestCreative: null,
      worstCreative: null,
      performanceSpread: { maxCTR: 0, minCTR: 0, ctrRange: 0 }
    };

    // Verified calculations
    const totalSpend = data.reduce((sum, item) => sum + Number(item.SPEND || 0), 0);
    const totalImpressions = data.reduce((sum, item) => sum + Number(item.IMPRESSIONS || 0), 0);
    const totalClicks = Math.round(data.reduce((sum, item) => sum + (Number(item.IMPRESSIONS || 0) * Number(item.CTR || 0)), 0));
    const totalConversions = data.reduce((sum, item) => sum + Number(item.conversions || 0), 0);
    
    // Accurate averages
    const avgCTR = totalClicks / totalImpressions * 100; // Weighted average
    const avgCPC = totalSpend / totalClicks; // True average CPC
    const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;
    
    // Estimated ROAS (assuming $50 avg order value)
    const avgOrderValue = 50;
    const roas = totalConversions > 0 ? (totalConversions * avgOrderValue) / totalSpend : 0;

    // Performance by Tone with accurate calculations
    const tonePerformance = data.reduce((acc, item) => {
      if (!acc[item.tone]) {
        acc[item.tone] = { 
          totalSpend: 0, 
          totalImpressions: 0, 
          totalClicks: 0, 
          count: 0,
          totalConversions: 0
        };
      }
      const clicks = Math.round(Number(item.IMPRESSIONS || 0) * Number(item.CTR || 0));
      acc[item.tone].totalSpend += Number(item.SPEND || 0);
      acc[item.tone].totalImpressions += Number(item.IMPRESSIONS || 0);
      acc[item.tone].totalClicks += clicks;
      acc[item.tone].totalConversions += Number(item.conversions || 0);
      acc[item.tone].count += 1;
      return acc;
    }, {} as any);

    const toneChartData = Object.entries(tonePerformance)
      .map(([tone, stats]: [string, any]) => ({
        tone,
        avgCTR: stats.totalImpressions > 0 ? (stats.totalClicks / stats.totalImpressions * 100) : 0,
        totalSpend: stats.totalSpend,
        avgCPC: stats.totalClicks > 0 ? (stats.totalSpend / stats.totalClicks) : 0,
        conversionRate: stats.totalClicks > 0 ? (stats.totalConversions / stats.totalClicks * 100) : 0,
        concepts: stats.count
      }))
      .filter(item => item.concepts > 0)
      .sort((a, b) => b.avgCTR - a.avgCTR);

    // Performance by Persona with accurate calculations
    const personaPerformance = data.reduce((acc, item) => {
      if (!acc[item.persona]) {
        acc[item.persona] = { 
          totalSpend: 0, 
          totalImpressions: 0, 
          totalClicks: 0, 
          count: 0,
          totalConversions: 0
        };
      }
      const clicks = Math.round(Number(item.IMPRESSIONS || 0) * Number(item.CTR || 0));
      acc[item.persona].totalSpend += Number(item.SPEND || 0);
      acc[item.persona].totalImpressions += Number(item.IMPRESSIONS || 0);
      acc[item.persona].totalClicks += clicks;
      acc[item.persona].totalConversions += Number(item.conversions || 0);
      acc[item.persona].count += 1;
      return acc;
    }, {} as any);

    const personaChartData = Object.entries(personaPerformance)
      .map(([persona, stats]: [string, any]) => ({
        persona,
        avgCTR: stats.totalImpressions > 0 ? (stats.totalClicks / stats.totalImpressions * 100) : 0,
        totalSpend: stats.totalSpend,
        avgCPC: stats.totalClicks > 0 ? (stats.totalSpend / stats.totalClicks) : 0,
        conversionRate: stats.totalClicks > 0 ? (stats.totalConversions / stats.totalClicks * 100) : 0,
        concepts: stats.count
      }))
      .filter(item => item.concepts > 0)
      .sort((a, b) => b.avgCTR - a.avgCTR);

    // Performance by Style
    const stylePerformance = data.reduce((acc, item) => {
      if (!acc[item.style]) {
        acc[item.style] = { 
          totalSpend: 0, 
          totalImpressions: 0, 
          totalClicks: 0, 
          count: 0,
          totalConversions: 0
        };
      }
      const clicks = Math.round(Number(item.IMPRESSIONS || 0) * Number(item.CTR || 0));
      acc[item.style].totalSpend += Number(item.SPEND || 0);
      acc[item.style].totalImpressions += Number(item.IMPRESSIONS || 0);
      acc[item.style].totalClicks += clicks;
      acc[item.style].totalConversions += Number(item.conversions || 0);
      acc[item.style].count += 1;
      return acc;
    }, {} as any);

    const styleChartData = Object.entries(stylePerformance)
      .map(([style, stats]: [string, any]) => ({
        style,
        avgCTR: stats.totalImpressions > 0 ? (stats.totalClicks / stats.totalImpressions * 100) : 0,
        totalSpend: stats.totalSpend,
        avgCPC: stats.totalClicks > 0 ? (stats.totalSpend / stats.totalClicks) : 0,
        conversionRate: stats.totalClicks > 0 ? (stats.totalConversions / stats.totalClicks * 100) : 0,
        concepts: stats.count
      }))
      .filter(item => item.concepts > 0)
      .sort((a, b) => b.avgCTR - a.avgCTR);

    // Best and worst performing creatives
    const validCreatives = data.filter(d => d.CTR > 0);
    const bestCreative = validCreatives.length > 0 ? 
      validCreatives.reduce((best, current) => current.CTR > best.CTR ? current : best) : null;
    const worstCreative = validCreatives.length > 0 ? 
      validCreatives.reduce((worst, current) => current.CTR < worst.CTR ? current : worst) : null;

    const ctrs = validCreatives.map(d => d.CTR * 100);
    const maxCTR = ctrs.length > 0 ? Math.max(...ctrs) : 0;
    const minCTR = ctrs.length > 0 ? Math.min(...ctrs) : 0;

    return {
      kpis: {
        totalSpend,
        totalImpressions,
        avgCTR: avgCTR || 0,
        avgCPC: avgCPC || 0,
        totalConversions,
        totalConcepts: data.length,
        costPerConversion,
        roas,
        totalClicks
      },
      tonePerformance: toneChartData,
      personaPerformance: personaChartData,
      stylePerformance: styleChartData,
      bestCreative,
      worstCreative,
      performanceSpread: {
        maxCTR,
        minCTR,
        ctrRange: maxCTR - minCTR,
      }
    };
  }, [data]);
}