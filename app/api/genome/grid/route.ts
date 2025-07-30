import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy to FastAPI backend on Render
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://creative-analytics-dashboard-3.onrender.com';
    const response = await fetch(`${apiUrl}/genome/grid`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from FastAPI');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching grid data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grid data' },
      { status: 500 }
    );
  }
}