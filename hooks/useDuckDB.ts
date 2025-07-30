"use client"

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Importar DuckDB de forma dinámica para evitar incluirlo en el bundle del servidor
const loadDuckDB = async () => {
  if (typeof window === 'undefined') return null;
  const duckdb = await import('@duckdb/duckdb-wasm');
  return duckdb;
};

export function useDuckDB() {
  const [db, setDb] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initDB() {
      try {
        console.log('🔄 Starting DuckDB initialization...');
        const duckdb = await loadDuckDB();
        if (!duckdb || !isMounted) {
          console.log('❌ DuckDB module failed to load');
          return;
        }
        console.log('✅ DuckDB module loaded');

        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
        console.log('✅ DuckDB bundle selected');
        
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
        );

        const worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();
        const newDb = new duckdb.AsyncDuckDB(logger, worker);
        console.log('✅ DuckDB worker created');
        
        await newDb.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(worker_url);
        console.log('✅ DuckDB instantiated');

        const conn = await newDb.connect();
        try {
          const creativesParquetUrl = `${window.location.origin}/data/creatives.parquet`;
          console.log('📂 Loading creatives.parquet from:', creativesParquetUrl);

          // First verify the file exists and get its size
          const response = await fetch(creativesParquetUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`Failed to load creatives.parquet: ${response.status} ${response.statusText}`);
          }
          
          const fileSize = response.headers.get('content-length');
          console.log(`📊 Parquet file size: ${fileSize} bytes`);
          
          if (!fileSize || parseInt(fileSize) < 1000) { // Less than 1KB is probably corrupted
            throw new Error('Parquet file appears to be corrupted or empty');
          }

          // Register and load the file
          await newDb.registerFileURL('creatives.parquet', creativesParquetUrl, duckdb.DuckDBDataProtocol.HTTP, false);
          console.log('✅ creatives.parquet registered');

          // Test query to verify data
          const testResult = await conn.query('SELECT COUNT(*) as count FROM read_parquet(\'creatives.parquet\')');
          const countColumn = testResult.getChild('count');
          if (!countColumn) throw new Error('Failed to get row count from parquet file');
          const rowCount = countColumn.toArray()[0];
          console.log(`✅ Verified parquet data: ${rowCount} rows found`);

          // Create the view
          await conn.query(`
            CREATE OR REPLACE VIEW v_creatives AS 
            SELECT * FROM read_parquet('creatives.parquet');
          `);
          console.log('✅ DuckDB view created successfully');

          if (isMounted) {
            setDb(newDb);
          }
        } catch (err) {
          const error = err as Error;
          console.error('Error initializing DuckDB:', error);
          if (isMounted) {
            setError(error);
            setLoading(false);
          }
          throw error;
        } finally {
          await conn.close();
        }
        await conn.close();
        console.log('✅ DuckDB view created successfully');
        
        if (isMounted) {
          setDb(newDb);
        }
      } catch (err) {
        if (isMounted) {
          console.error("❌ Failed to initialize DuckDB:", err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initDB();

    return () => {
      isMounted = false;
      db?.terminate();
    };
  }, []);

  return { db, loading, error };
}
