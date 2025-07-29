'use client';
import * as DuckDB from '@duckdb/duckdb-wasm';

let db: DuckDB.AsyncDuckDB | null = null;

async function init() {
  const JSDELIVR_BUNDLES = DuckDB.getJsDelivrBundles();
  const bundle = await DuckDB.selectBundle(JSDELIVR_BUNDLES);
  
  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], {type: 'text/javascript'})
  );

  const worker = new Worker(worker_url);
  const logger = new DuckDB.ConsoleLogger();
  db = new DuckDB.AsyncDuckDB(logger, worker);
  
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  const parquetUrl = `${window.location.origin}/data/creatives.parquet`;
  const res = await fetch(parquetUrl);
  const buf = await res.arrayBuffer();
  await db.registerFileBuffer('creatives.parquet', new Uint8Array(buf));

  const conn = await db.connect();
  await conn.query(`
    CREATE OR REPLACE VIEW v_creatives AS
    SELECT * FROM read_parquet('creatives.parquet')
  `);
  await conn.close();
}

export async function query(sql: string) {
  if (!db) await init();
  const conn = await db!.connect();
  const res  = await conn.query(sql);
  conn.close();
  return res.toArray().map((r: any) => r.toJSON());
}
