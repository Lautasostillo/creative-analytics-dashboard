'use client';
export async function testDuck() {
  const { query } = await import('../../src/lib/duckdb-client');
  const res = await query('SELECT 42 AS answer');
  console.log('Test DuckDB =>', res);
}
