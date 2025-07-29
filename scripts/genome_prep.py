import pandas as pd, numpy as np, pathlib
import os

# Get the absolute path of the project root
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = pathlib.Path(project_root) / "data/analisis_consolidado_v21.xlsx"
OUT_ADS  = pathlib.Path(project_root) / "public/data/ads.parquet"
OUT_GRID = pathlib.Path(project_root) / "public/data/grid.parquet"

df = pd.read_excel(SRC, sheet_name="Resumen")
df["CPC"] = df["SPEND"] / df["CLICKS"].replace(0, np.nan)
df["CPM"] = df["SPEND"] / (df["IMPRESSIONS"] / 1000).replace(0, np.nan)
df["GRID_KEY"] = (
    df["TONE"].str.lower().str.strip() + "|" +
    df["PERSONA"].str.strip() + "|" +
    df["STYLE"].str.strip()
)

baseline = df["CTR"].mean()
grid = (df.groupby("GRID_KEY")
          .agg(CTR=("CTR", "mean"),
               SPEND=("SPEND", "sum"),
               IMPRESSIONS=("IMPRESSIONS", "sum"))
          .assign(CTR_DELTA=lambda d: d["CTR"] - baseline)
          .reset_index())

df.to_parquet(OUT_ADS, index=False)
grid.to_parquet(OUT_GRID, index=False)
print("✅  ads.parquet & grid.parquet listos")
