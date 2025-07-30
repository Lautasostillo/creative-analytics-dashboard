'use client';
import { useState, useEffect, useMemo } from 'react';
import { useDuckDB } from './useDuckDB';

interface RealCreativeData {
  "#": number;
  "Ad Name": string;
  LENGTH: string;
  PRODUCT: string;
  ICP: string;
  INSIGHT: string;
  CONCEPT: string;
  TONE: string;
  TYPE: string;
  STYLE: string;
  PERSONA: string;
  MESSAGING_THEME: string;
  DEMAND_STAGE: string;
  FUNNEL_STAGE: string;
  FINANCIAL_EMOTION: string;
  DELIVERY_NUMBER: string;
  CONCEPT_NAMING: string;
  SPEND: number;
  CLICKS: number;
  IMPRESSIONS: number;
  CTR: number;
  S3PATH_SCF: string;
  NAME_SCF: string;
  Strategic_Summary: string;
  CPC: number;
  CPM: number;
  GRID_KEY: string;
  High_Fidelity_Description?: string;
  Scene_by_Scene_Breakdown?: string;
  
  // Computed fields
  CTR_pct: number;
  performanceTier: 'Champion' | 'Optimization Needed' | 'Emerging';
  hasAIRecommendations: boolean;
  tone: string;
  persona: string;
  style: string;
}

// Data cleaning utilities (same as before but simplified)
function cleanTone(tone: string): string {
  const cleaned = tone.toLowerCase().trim().replace(/[.,|→·]/g, ' ');
  
  if (cleaned.includes('hopeful') || cleaned.includes('encouraging')) return 'Hopeful & Encouraging';
  if (cleaned.includes('positive') || cleaned.includes('empowering')) return 'Positive & Empowering';
  if (cleaned.includes('enthusiastic') || cleaned.includes('upbeat') || cleaned.includes('excited')) return 'Enthusiastic & Upbeat';
  if (cleaned.includes('humorous') || cleaned.includes('lighthearted') || cleaned.includes('playful')) return 'Humorous & Lighthearted';
  if (cleaned.includes('educational') || cleaned.includes('informative')) return 'Educational & Informative';
  if (cleaned.includes('reassuring') || cleaned.includes('empathetic') || cleaned.includes('trustworthy')) return 'Reassuring & Empathetic';
  if (cleaned.includes('casual') || cleaned.includes('relatable') || cleaned.includes('friendly')) return 'Casual & Relatable';
  if (cleaned.includes('uplifting') || cleaned.includes('inspiring') || cleaned.includes('warm')) return 'Uplifting';
  
  return 'Casual & Relatable';
}

function cleanPersona(persona: string): string {
  const cleaned = persona.trim();
  
  if (cleaned.includes('Rebuilder')) return 'Rebuilder';
  if (cleaned.includes('Student')) return 'Student';
  if (cleaned.includes('Young Professional')) return 'Young Professional';
  if (cleaned.includes('Mother')) return 'Mother';
  if (cleaned.includes('Other')) return 'General Audience';
  
  return cleaned;
}

function cleanStyle(style: string): string {
  const cleaned = style.trim().replace(/[.,]/g, ' ').toLowerCase();
  
  if (cleaned.includes('user generated content') || cleaned.includes('user-generated content') || cleaned.includes('ugc')) return 'User Generated Content';
  if (cleaned.includes('direct address') || cleaned.includes('direct-to-camera') || cleaned.includes('direct response')) return 'Direct Address';
  if (cleaned.includes('animation') || cleaned.includes('2d') || cleaned.includes('3d') || cleaned.includes('motion graphics') || cleaned.includes('animated')) return 'Animation & Motion Graphics';
  if (cleaned.includes('testimonial') || cleaned.includes('lifestyle') || cleaned.includes('slice')) return 'Testimonial & Lifestyle';
  if (cleaned.includes('fast') || cleaned.includes('dynamic') || cleaned.includes('engaging')) return 'Fast-Paced Cuts';
  if (cleaned.includes('live action') || cleaned.includes('man-on-the-street') || cleaned.includes('interview') && !cleaned.includes('animation')) return 'Live Action';
  if (cleaned.includes('screen recording') || cleaned.includes('user interface') || cleaned.includes('app demo')) return 'Screen Recording';
  if (cleaned.includes('clean') || cleaned.includes('modern') || cleaned.includes('minimalist') || cleaned.includes('simple')) return 'Clean & Modern';
  if (cleaned.includes('casual') || cleaned.includes('relatable') || cleaned.includes('conversational')) return 'Authentic & Relatable';
  
  return 'User Generated Content';
}

export function useRealCreativeData() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [detailedData, setDetailedData] = useState<RealCreativeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { db, loading: dbLoading, error: dbError } = useDuckDB();

  useEffect(() => {
    if (dbLoading || !db || dbError) return;
    
    console.log('🔄 Starting data fetch from DuckDB...');
    
    async function loadData() {
      try {
        const conn = await db.connect();
        
        // Register grid.parquet file and query it
        const gridParquetUrl = `${window.location.origin}/data/grid.parquet`;
        console.log('📂 Loading parquet from:', gridParquetUrl);
        await db.registerFileURL('grid.parquet', gridParquetUrl);
        const result = await conn.query('SELECT * FROM read_parquet("grid.parquet")');
        const gridData = result.toArray().map((row: any) => row.toJSON());
        
        await conn.close();
        
        console.log('✅ Grid data fetched from DuckDB:', gridData.length, 'items');
        
        if (!Array.isArray(gridData)) throw new Error('Invalid data format');
        
        setRawData(gridData);
        
        // Process the data directly since it already contains all the fields we need
        console.log('🔄 Processing data...');
        const processedData = gridData.map((item: any, index: number) => {
          try {
            const ctrPct = (item.CTR || 0) * 100;
            const performanceTier = ctrPct > 2.5 ? 'Champion' : ctrPct > 1.5 ? 'Emerging' : 'Optimization Needed';
            
            const processed = {
              ...item,
              CTR_pct: ctrPct,
              performanceTier,
              hasAIRecommendations: !!(item.Strategic_Summary && item.Strategic_Summary.length > 10),
              tone: cleanTone(item.TONE || ''),
              persona: cleanPersona(item.PERSONA || ''),
              style: cleanStyle(item.STYLE || ''),
              // Ensure required fields exist
              SPEND: item.SPEND || 0,
              IMPRESSIONS: item.IMPRESSIONS || 0,
              CLICKS: item.CLICKS || 0,
              CPC: item.CPC || 0,
              CPM: item.CPM || 0
            };
            
            if (index < 3) {
              console.log(`📋 Processed item ${index + 1}:`, {
                name: processed["Ad Name"],
                tone: processed.tone,
                performanceTier: processed.performanceTier,
                hasAI: processed.hasAIRecommendations,
                hasVideo: !!(processed.S3PATH_SCF || processed.NAME_SCF)
              });
            }
            
            return processed;
          } catch (processingError) {
            console.error(`❌ Error processing item ${index}:`, processingError, item);
            // Return a minimal fallback
            return {
              ...item,
              CTR_pct: 0,
              performanceTier: 'Optimization Needed' as const,
              hasAIRecommendations: false,
              tone: 'Casual & Relatable',
              persona: 'General Audience',
              style: 'User Generated Content',
              SPEND: item.SPEND || 0,
              IMPRESSIONS: item.IMPRESSIONS || 0,
              CLICKS: item.CLICKS || 0,
              CPC: item.CPC || 0,
              CPM: item.CPM || 0
            };
          }
        });
        
        console.log('✅ Data processing complete:', processedData.length, 'items ready');
        setDetailedData(processedData);
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Data loading error:', err);
        setError(err);
        setLoading(false);
      }
    }
    
    loadData();
  }, [db, dbLoading, dbError]);

  return { data: detailedData, gridData: rawData, loading, error };
}

export function useFilteredRealCreativeData(filters: { tone?: string; persona?: string; style?: string }) {
  const { data, loading, error } = useRealCreativeData();
  
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