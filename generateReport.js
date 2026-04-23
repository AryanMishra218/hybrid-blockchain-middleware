// generateReport.js
// Run this AFTER the load test finishes
// It creates: report.csv and report_summary.json

const axios = require("axios");
const fs    = require("fs");

async function generateReport() {
  console.log("📄 Generating research report...\n");

  // Fetch all data from server
  const res      = metricsRes = await axios.get("http://localhost:3000/metrics");
  const { summary, all_records } = res.data;

  // ── 1. Save full CSV ──────────────────────────────────
  const csvHeader = "id,timestamp,target,operation,delay_ms,status,error\n";
  const csvRows   = all_records.map(r =>
    `${r.id},${r.timestamp},${r.target},${r.operation},${r.delay_ms},${r.status},${r.error || ""}`
  ).join("\n");

  fs.writeFileSync("report.csv", csvHeader + csvRows);
  console.log("✅ report.csv saved  →  open in Excel or Google Sheets");

  // ── 2. Save JSON summary ──────────────────────────────
  fs.writeFileSync("report_summary.json", JSON.stringify(summary, null, 2));
  console.log("✅ report_summary.json saved");

  // ── 3. Print table for paper ──────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("TABLE FOR RESEARCH PAPER:");
  console.log("=".repeat(60));
  console.log("Metric          | Polygon (ms) | Fabric (ms)");
  console.log("-".repeat(45));

  const p = summary.polygon || {};
  const f = summary.fabric  || {};

  const metrics = ["count","min_ms","max_ms","mean_ms","median_ms","p95_ms","p99_ms","stddev_ms"];
  metrics.forEach(key => {
    const label = key.padEnd(15);
    const pVal  = (p[key] ?? "N/A").toString().padEnd(13);
    const fVal  = (f[key] ?? "N/A").toString();
    console.log(`${label} | ${pVal} | ${fVal}`);
  });

  console.log("=".repeat(60));
  console.log("\n✅ Now run:  python analyze.py   (to generate graphs)\n");
}

generateReport().catch(console.error);