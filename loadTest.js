// const axios = require("axios");
// async function runTest(count) {
//   const start = Date.now();

//   let promises = [];

//   const batchSize = 10;

//     for (let i = 0; i < count; i += batchSize) {
//     let batch = [];

//     for (let j = i; j < i + batchSize && j < count; j++) {
//         batch.push(
//         axios.post("http://localhost:3000/write", {
//             data: "drug_" + j,
//             target: "polygon"
//         })
//         );
//     }
//     await Promise.all(batch);
//     }

//   await Promise.all(promises);

//   const end = Date.now();

//   console.log("Total Time:", end - start);
//   console.log("Avg Time:", (end - start) / count);
// }

// runTest(500); // change to 1000

// loadTest.js
// This runs 500 or 1000 transactions against BOTH chains
// and prints results for your research paper

const axios = require("axios");

const BASE_URL   = "http://localhost:3000";
const BATCH_SIZE = 10;   // How many requests run at the same time

// ─────────────────────────────────────────────────────────
// Main load test function
// count  = total transactions (500 or 1000)
// target = "polygon" | "fabric" | "both"
// ─────────────────────────────────────────────────────────
async function runLoadTest(count, target) {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 Starting Load Test`);
  console.log(`   Transactions : ${count}`);
  console.log(`   Target       : ${target}`);
  console.log(`   Batch Size   : ${BATCH_SIZE}`);
  console.log("=".repeat(60) + "\n");

  const testStart = Date.now();
  let completed   = 0;
  let failed      = 0;

  // Build all requests
  const allRequests = [];

  for (let i = 0; i < count; i++) {
    const chainTarget = target === "both"
      ? (i % 2 === 0 ? "polygon" : "fabric")  // alternate between chains
      : target;

    allRequests.push({ data: `drug_batch_${i}`, target: chainTarget, index: i });
  }

  // Run in batches (so we don't crash the server with 1000 simultaneous requests)
  for (let i = 0; i < allRequests.length; i += BATCH_SIZE) {
    const batch = allRequests.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (req) => {
      try {
        const res = await axios.post(`${BASE_URL}/write`, {
          data:   req.data,
          target: req.target
        });
        completed++;
        return { success: true, delay_ms: res.data.delay_ms, target: req.target };
      } catch (err) {
        failed++;
        return { success: false, error: err.message, target: req.target };
      }
    });

    await Promise.all(batchPromises);

    // Progress update every 50 transactions
    if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= count) {
      const pct = Math.min(100, Math.round(((i + BATCH_SIZE) / count) * 100));
      console.log(`   Progress: ${pct}% (${Math.min(i + BATCH_SIZE, count)}/${count} transactions)`);
    }
  }

  const testEnd    = Date.now();
  const totalTime  = testEnd - testStart;
  const throughput = (count / (totalTime / 1000)).toFixed(2);  // transactions per second

  console.log("\n" + "=".repeat(60));
  console.log("📊 LOAD TEST COMPLETE");
  console.log("=".repeat(60));
  console.log(`   Total Time   : ${totalTime} ms`);
  console.log(`   Completed    : ${completed}`);
  console.log(`   Failed       : ${failed}`);
  console.log(`   Throughput   : ${throughput} tx/sec`);
  console.log("=".repeat(60));

  // Now fetch full metrics from server
  console.log("\n📈 Fetching detailed metrics...\n");
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
  console.log(`   Count     : ${stats.count}`);
  console.log(`   Min       : ${stats.min_ms} ms`);
  console.log(`   Max       : ${stats.max_ms} ms`);
  console.log(`   Mean      : ${stats.mean_ms} ms`);
  console.log(`   Median    : ${stats.median_ms} ms`);
  console.log(`   P95       : ${stats.p95_ms} ms`);
  console.log(`   P99       : ${stats.p99_ms} ms`);
  console.log(`   Std Dev   : ${stats.stddev_ms} ms`);
}

// ─── RUN ─────────────────────────────────────────────────
// Change count to 500 or 1000
// Change target to "polygon", "fabric", or "both"
runLoadTest(1000, "both");