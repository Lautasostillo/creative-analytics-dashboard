import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key);
    
    // Proxy to FastAPI backend on Render
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://creative-analytics-dashboard-3.onrender.com';
    const response = await fetch(`${apiUrl}/genome/grid/${encodeURIComponent(key)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from FastAPI');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching cell data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cell data' },
      { status: 500 }
    );
  }
}