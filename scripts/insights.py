import duckdb, pandas as pd, pathlib, json

# Connect to the database
duck = duckdb.connect("public/data/creatives.duckdb")

# Get baseline CTR
base = duck.execute("SELECT AVG(CTR_pct) FROM creatives").fetchone()[0]

insights = []

# Performance insights by tone
tone_insights = duck.execute("""
SELECT TONE,
       COUNT(*) n,
       SUM(SPEND) spend,
       AVG(CTR_pct) ctr
FROM creatives
GROUP BY TONE HAVING n>=3
""").df()

for _, r in tone_insights.iterrows():
    if r.ctr >= 1.5 * base and r.spend >= 0.05 * duck.execute("SELECT SUM(SPEND) FROM creatives").fetchone()[0]:
        insights.append({
            "type": "tone_outperformer",
            "tone": r.TONE,
            "lift": round(r.ctr/base, 2),
            "ctr": round(r.ctr, 2),
            "spend": round(r.spend, 2)
        })

# Performance insights by persona
persona_insights = duck.execute("""
SELECT PERSONA,
       COUNT(*) n,
       SUM(SPEND) spend,
       AVG(CTR_pct) ctr
FROM creatives
GROUP BY PERSONA HAVING n>=3
""").df()

for _, r in persona_insights.iterrows():
    if r.ctr >= 1.5 * base and r.spend >= 0.05 * duck.execute("SELECT SUM(SPEND) FROM creatives").fetchone()[0]:
        insights.append({
            "type": "persona_outperformer",
            "persona": r.PERSONA,
            "lift": round(r.ctr/base, 2),
            "ctr": round(r.ctr, 2),
            "spend": round(r.spend, 2)
        })

# Performance insights by style
style_insights = duck.execute("""
SELECT STYLE,
       COUNT(*) n,
       SUM(SPEND) spend,
       AVG(CTR_pct) ctr
FROM creatives
GROUP BY STYLE HAVING n>=3
""").df()

for _, r in style_insights.iterrows():
    if r.ctr >= 1.5 * base and r.spend >= 0.05 * duck.execute("SELECT SUM(SPEND) FROM creatives").fetchone()[0]:
        insights.append({
            "type": "style_outperformer",
            "style": r.STYLE,
            "lift": round(r.ctr/base, 2),
            "ctr": round(r.ctr, 2),
            "spend": round(r.spend, 2)
        })

# Top performing creatives
top_creatives = duck.execute("""
SELECT "Ad Name", CTR_pct, SPEND, IMPRESSIONS
FROM creatives
WHERE CTR_pct > 2.0
ORDER BY CTR_pct DESC
LIMIT 5
""").df()

for _, r in top_creatives.iterrows():
    insights.append({
        "type": "top_performer",
        "ad_name": r["Ad Name"],
        "ctr": round(r.CTR_pct, 2),
        "spend": round(r.SPEND, 2),
        "impressions": int(r.IMPRESSIONS)
    })

# Save insights
pathlib.Path("public/data").mkdir(exist_ok=True, parents=True)
json.dump(insights, open("public/data/insights.json", "w"), indent=2)
print("✅ insights.json generado", len(insights), "insights")
