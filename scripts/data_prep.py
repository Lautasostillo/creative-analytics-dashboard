import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import duckdb

XLSX_PATH = "data/analisis_consolidado_v21.xlsx"  # cambia si tu archivo está en otra ruta
OUT_PARQUET = "public/data/creatives.parquet"
OUT_DUCKDB  = "public/data/creatives.duckdb"

# --- Load ---
xls = pd.ExcelFile(XLSX_PATH)
resumen = pd.read_excel(XLSX_PATH, sheet_name="Resumen")
full = pd.read_excel(XLSX_PATH, sheet_name="Full Analysis")

# --- Derive metrics ---
resumen["CPC"] = resumen["SPEND"] / resumen["CLICKS"].replace(0, np.nan)
resumen["CPM"] = resumen["SPEND"] / resumen["IMPRESSIONS"].replace(0, np.nan) * 1000
resumen["CTR_pct"] = np.where(resumen["CTR"] <= 1, resumen["CTR"] * 100, resumen["CTR"])

resumen["LENGTH"] = pd.to_numeric(resumen["LENGTH"], errors='coerce')
bins, labels = [0, 15, 30, 1e9], ["<=15s", "16-30s", ">=31s"]
resumen["LENGTH_BUCKET"] = pd.cut(resumen["LENGTH"], bins=bins, labels=labels, right=True)

# --- Merge texts ---
key = "Ad Name" if "Ad Name" in resumen.columns and "Ad Name" in full.columns else "Strategic_Summary"
df = resumen.merge(full, on=key, how="left", suffixes=("", "_TXT"))

# --- Generate GRID_KEY ---
df["GRID_KEY"] = (
    df["TONE"].str.lower().str.strip() + "|" +
    df["PERSONA"].str.strip() + "|" +
    df["STYLE"].str.strip()
)

# --- Clusters con métricas numéricas ---
num_cols = ["CTR_pct", "CPC", "CPM", "SPEND", "CLICKS", "IMPRESSIONS"]
X = df[num_cols].fillna(0).values
scaler = StandardScaler()
Xs = scaler.fit_transform(X)
k = 5
km = KMeans(n_clusters=k, n_init="auto", random_state=42)
df["cluster_id"] = km.fit_predict(Xs)

# --- Save parquet ---
Path("public/data").mkdir(parents=True, exist_ok=True)
df.to_parquet(OUT_PARQUET, index=False)

# --- Save duckdb ---
con = duckdb.connect(OUT_DUCKDB)
con.execute("CREATE OR REPLACE TABLE creatives AS SELECT * FROM read_parquet(?)", (OUT_PARQUET,))
con.close()

print("✅ parquet actualizado", OUT_PARQUET, "rows", len(df))
