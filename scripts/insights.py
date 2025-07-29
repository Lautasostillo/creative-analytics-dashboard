import duckdb, pandas as pd, pathlib, json
duck = duckdb.connect("public/data/creatives.duckdb")
base = duck.execute("SELECT AVG(CTR_pct) FROM creatives").fetchone()[0]

insights = []

# tag out‑performers
df = duck.execute("""
WITH exploded AS (
    SELECT UNNEST(tags) AS tag, spend, ctr_pct
    FROM creatives
)
SELECT tag,
       COUNT(*) n,
       SUM(spend) spend,
       AVG(ctr_pct) ctr
FROM exploded
GROUP BY tag HAVING n>=3
""").df()
for _,r in df.iterrows():
    if r.ctr >= 1.5*base and r.spend >= 0.05*duck.execute("SELECT SUM(spend) FROM creatives").fetchone()[0]:
        insights.append({
            "type":"tag_outperformer",
            "tag": r.tag,
            "lift": round(r.ctr/base,2),
            "ctr": round(r.ctr,2)
        })

pathlib.Path("public/data").mkdir(exist_ok=True, parents=True)
json.dump(insights, open("public/data/insights.json","w"), indent=2)
print("✅ insights.json generado", len(insights),"insights")
