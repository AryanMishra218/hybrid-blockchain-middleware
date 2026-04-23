# analyze.py
# Generates graphs for your research paper
# Run: pip install pandas matplotlib seaborn
#      python analyze.py

import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
import json

# ── Load data ─────────────────────────────────────────────
df      = pd.read_csv("report.csv")
summary = json.load(open("report_summary.json"))

df_ok   = df[df["status"] == "success"]   # Only successful transactions
polygon = df_ok[df_ok["target"] == "polygon"]["delay_ms"]
fabric  = df_ok[df_ok["target"] == "fabric"]["delay_ms"]

# ── Figure setup ──────────────────────────────────────────
fig = plt.figure(figsize=(16, 12))
fig.suptitle(
    "Middleware Performance: Polygon vs Hyperledger Fabric\n"
    "Drug Authentication System — Transaction Delay Analysis",
    fontsize=14, fontweight="bold"
)
gs = gridspec.GridSpec(2, 2, figure=fig, hspace=0.4, wspace=0.35)

# ── Graph 1: Delay over time (line chart) ─────────────────
ax1 = fig.add_subplot(gs[0, :])  # Full width top row
polygon_data = df_ok[df_ok["target"] == "polygon"].reset_index()
fabric_data  = df_ok[df_ok["target"] == "fabric"].reset_index()

ax1.plot(polygon_data.index, polygon_data["delay_ms"], color="#3498db", label="Polygon", alpha=0.7, linewidth=0.8)
ax1.plot(fabric_data.index,  fabric_data["delay_ms"],  color="#e74c3c", label="Fabric",  alpha=0.7, linewidth=0.8)
ax1.set_title("Transaction Delay Over Time")
ax1.set_xlabel("Transaction Number")
ax1.set_ylabel("Delay (ms)")
ax1.legend()
ax1.grid(True, alpha=0.3)

# ── Graph 2: Box plot (spread comparison) ─────────────────
ax2 = fig.add_subplot(gs[1, 0])
ax2.boxplot([polygon.values, fabric.values], labels=["Polygon", "Fabric"],
            patch_artist=True,
            boxprops=dict(facecolor="#3498db", alpha=0.6),
            medianprops=dict(color="black", linewidth=2))
ax2.set_title("Delay Distribution (Box Plot)")
ax2.set_ylabel("Delay (ms)")
ax2.grid(True, alpha=0.3, axis="y")

# ── Graph 3: Histogram (distribution) ─────────────────────
ax3 = fig.add_subplot(gs[1, 1])
ax3.hist(polygon, bins=30, alpha=0.6, color="#3498db", label="Polygon", edgecolor="white")
ax3.hist(fabric,  bins=30, alpha=0.6, color="#e74c3c", label="Fabric",  edgecolor="white")
ax3.set_title("Delay Frequency Distribution")
ax3.set_xlabel("Delay (ms)")
ax3.set_ylabel("Number of Transactions")
ax3.legend()
ax3.grid(True, alpha=0.3)

plt.savefig("paper_graphs.png", dpi=150, bbox_inches="tight")
print("✅ paper_graphs.png saved  →  use this in your research paper")
plt.show()

# ── Print stats table ─────────────────────────────────────
print("\n" + "="*55)
print(f"{'Metric':<20} {'Polygon':>15} {'Fabric':>15}")
print("-"*55)
p = summary.get("polygon", {})
f = summary.get("fabric",  {})
for key in ["count","min_ms","max_ms","mean_ms","median_ms","p95_ms","p99_ms","stddev_ms"]:
    print(f"{key:<20} {str(p.get(key,'N/A')):>15} {str(f.get(key,'N/A')):>15}")
print("="*55)