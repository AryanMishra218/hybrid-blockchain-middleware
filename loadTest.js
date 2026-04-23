// loadTest.js
const axios             = require("axios");
const { getRandomMedicine } = require("./medicines");

const BASE_URL   = "http://localhost:3000";
const BATCH_SIZE = 20;

async function runLoadTest(count, target) {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 Starting Drug Authentication Load Test`);
  console.log(`   Transactions : ${count}`);
  console.log(`   Target       : ${target}`);
  console.log(`   Batch Size   : ${BATCH_SIZE}`);
  console.log("=".repeat(60) + "\n");

  const testStart = Date.now();
  let completed   = 0;
  let failed      = 0;

  // Build all requests using REAL medicine data
  const allRequests = [];
  for (let i = 0; i < count; i++) {
    const chainTarget = target === "both"
      ? (i % 2 === 0 ? "polygon" : "fabric")
      : target;

    allRequests.push({
      data:   getRandomMedicine(),   // ← real medicine data here
      target: chainTarget,
      index:  i
    });
  }

  // Run in batches
  for (let i = 0; i < allRequests.length; i += BATCH_SIZE) {
    const batch = allRequests.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (req) => {
      try {
        const res = await axios.post(`${BASE_URL}/write`, {
          data:   req.data,
          target: req.target
        });
        completed++;

        // Show first 3 transactions so you can see real data flowing
        if (req.index < 3) {
          console.log(`   ✅ TX #${req.index + 1} | ${req.target.toUpperCase().padEnd(7)} | ${req.data.drug_name.padEnd(20)} | Batch: ${req.data.batch_number} | Delay: ${res.data.delay_ms}ms`);
        }

        return { success: true };
      } catch (err) {
        failed++;
        return { success: false };
      }
    });

    await Promise.all(batchPromises);

    // Progress every 50 transactions
    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= count) {
      const pct = Math.min(100, Math.round(((i + BATCH_SIZE) / count) * 100));
      console.log(`   Progress: ${pct}% (${Math.min(i + BATCH_SIZE, count)}/${count})`);
    }
  }

  const testEnd    = Date.now();
  const totalTime  = testEnd - testStart;
  const throughput = (count / (totalTime / 1000)).toFixed(2);

  console.log("\n" + "=".repeat(60));
  console.log("📊 LOAD TEST COMPLETE");
  console.log("=".repeat(60));
  console.log(`   Total Time   : ${totalTime} ms`);
  console.log(`   Completed    : ${completed}`);
  console.log(`   Failed       : ${failed}`);
  console.log(`   Throughput   : ${throughput} tx/sec`);
  console.log("=".repeat(60));

  // Fetch and show metrics
  console.log("\n📈 Fetching metrics...\n");
  const metricsRes = await axios.get(`${BASE_URL}/metrics`);
  const { summary } = metricsRes.data;

  console.log("POLYGON STATS:");
  printStats(summary.polygon);
  console.log("\nFABRIC STATS:");
  printStats(summary.fabric);

  console.log("\n✅ Now run:  node generateReport.js\n");
}

function printStats(stats) {
  if (!stats) { console.log("   No data"); return; }
  console.log(`   Count      : ${stats.count}`);
  console.log(`   Min        : ${stats.min_ms} ms`);
  console.log(`   Max        : ${stats.max_ms} ms`);
  console.log(`   Mean       : ${stats.mean_ms} ms`);
  console.log(`   Median     : ${stats.median_ms} ms`);
  console.log(`   P95        : ${stats.p95_ms} ms`);
  console.log(`   P99        : ${stats.p99_ms} ms`);
  console.log(`   Std Dev    : ${stats.stddev_ms} ms`);
}

// ── Change 500 to 1000 for bigger test ──
runLoadTest(500, "both");