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
        const duckdb = await loadDuckDB();
        if (!duckdb || !isMounted) return;

        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
        
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
        );

        const worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();
        const newDb = new duckdb.AsyncDuckDB(logger, worker);
        
        await newDb.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(worker_url);

        await newDb.registerFileURL('creatives.parquet', '/data/creatives.parquet', duckdb.DuckDBDataProtocol.HTTP, false);
        
        const conn = await newDb.connect();
        await conn.query(`
          CREATE OR REPLACE VIEW v_creatives AS 
          SELECT * FROM read_parquet('creatives.parquet');
        `);
        await conn.close();
        
        if (isMounted) {
          setDb(newDb);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to initialize DuckDB:", err);
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
