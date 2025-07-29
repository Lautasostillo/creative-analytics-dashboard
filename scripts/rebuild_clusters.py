import pandas as pd, re, json, math, duckdb, pathlib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import MiniBatchKMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
import scipy.sparse as sp, numpy as np

PARQ = "public/data/creatives.parquet"
SYN  = "data/synonyms_draft.csv"
OUT_CL = "public/data/clusters_tags.parquet"

# ---------- 1. Cargar datos ---------------------------------------------------
df = pd.read_parquet(PARQ)
try:
    syn = pd.read_csv(SYN)
    mapping = dict(zip(syn.variant, syn.canonical))
except FileNotFoundError:
    mapping = {}

STOP_WORDS = {'and', 'the', 'with', 'for', 'on', 'in', 'a', 'an'}

# ---------- 2. Normalizar tags -----------------------------------------------
def norm(val:str):
    parts = re.split(r'[,\u00B7/→]', str(val))
    clean = []
    for p in parts:
        t = ' '.join(re.sub(r'[^A-Za-z0-9\- ]','',p).split()).lower().strip()
        if not t or t in STOP_WORDS: continue
        t = mapping.get(t, t)
        clean.extend(t.split('|'))
    return list({c for c in clean if c})

for col in ["TONE","PERSONA","STYLE"]:
    df[col+"_tags"] = df[col].fillna('').apply(norm)

df["tags"] = df[["TONE_tags","PERSONA_tags","STYLE_tags"]].sum(axis=1)

# ---------- 3. Vector de tags + métricas --------------------------------------
corpus = [' '.join(t) for t in df["tags"]]
tfidf = TfidfVectorizer(max_features=500)
X_text = tfidf.fit_transform(corpus)

metrics = df[["CTR_pct","CPC","CPM","SPEND"]].fillna(0)
X_num = StandardScaler().fit_transform(metrics)

X = sp.hstack([X_text, X_num])

# ---------- 4. Elegir k óptimo (3..8) por Silhouette --------------------------
best_k, best_s = 3, -1
for k in range(3,9):
    km = MiniBatchKMeans(n_clusters=k, random_state=42).fit(X)
    s  = silhouette_score(X, km.labels_, metric='cosine')
    if s > best_s:
        best_k, best_s, best_km = k, s, km
df["cluster_id"] = best_km.labels_
print(f"✅ Clustering dinámico: k={best_k}, silhouette={best_s:.3f}")

# ---------- 5. Resumen de clusters -------------------------------------------
exp = df.explode("tags")
top_tags = (exp.groupby(["cluster_id","tags"])
              .size().to_frame("c").reset_index()
              .sort_values(["cluster_id","c"], ascending=[True,False])
              .groupby("cluster_id").head(3)
              .groupby("cluster_id")["tags"].apply(lambda s:', '.join(s)))

kpi = df.groupby("cluster_id").agg(
    creatives=('Ad Name','count'),
    ctr=('CTR_pct','mean'),
    spend=('SPEND','sum')
)
summary = kpi.join(top_tags).reset_index()
pathlib.Path("public/data").mkdir(exist_ok=True, parents=True)
summary.to_parquet(OUT_CL, index=False)
df.to_parquet(PARQ, index=False)

# ---------- 6. Guardar tablas en DuckDB --------------------------------------
duck = duckdb.connect("public/data/creatives.duckdb")
duck.execute("CREATE OR REPLACE TABLE creatives AS SELECT * FROM read_parquet(?)", (PARQ,))
duck.execute("CREATE OR REPLACE TABLE clusters_tags AS SELECT * FROM read_parquet(?)", (OUT_CL,))
print("✅ clusters_tags.parquet guardado y tabla actualizada.")
