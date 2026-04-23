// generateReport.js
const axios = require("axios");
const fs    = require("fs");

async function generateReport() {
  console.log("📄 Generating research report...\n");

  const res = await axios.get("http://localhost:3000/metrics");
  const { summary, all_records } = res.data;

  // ── CSV with medicine data ────────────────────────────
  const csvHeader = "id,timestamp,drug_name,batch_number,manufacturer,target,operation,delay_ms,status\n";
  const csvRows   = all_records.map(r => {
    const drug = r.drug_data || {};
    return [
      r.id,
      r.timestamp,
      drug.drug_name    || "N/A",
      drug.batch_number || "N/A",
      drug.manufacturer || "N/A",
      r.target,
      r.operation,
      r.delay_ms,
      r.status
    ].join(",");
  }).join("\n");

  fs.writeFileSync("report.csv", csvHeader + csvRows);
  console.log("✅ report.csv saved");

  fs.writeFileSync("report_summary.json", JSON.stringify(summary, null, 2));
  console.log("✅ report_summary.json saved");

  // ── Print table ───────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("TABLE FOR RESEARCH PAPER:");
  console.log("=".repeat(60));
  console.log("Metric           | Polygon (ms) | Fabric (ms)");
  console.log("-".repeat(48));

  const p = summary.polygon || {};
  const f = summary.fabric  || {};

  const rows = ["count","min_ms","max_ms","mean_ms","median_ms","p95_ms","p99_ms","stddev_ms"];
  rows.forEach(key => {
    const label = key.padEnd(16);
    const pVal  = (p[key] ?? "N/A").toString().padEnd(13);
    const fVal  = (f[key] ?? "N/A").toString();
    console.log(`${label} | ${pVal} | ${fVal}`);
  });

  console.log("=".repeat(60));
  console.log("\n✅ Now run:  py -3.12 analyze.py\n");
}

generateReport().catch(console.error);