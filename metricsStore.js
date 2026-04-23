// metricsStore.js
// This stores every transaction result in memory
// When load test finishes, we export it all as CSV

const metrics = [];  // Array to hold all transaction records

function record(entry) {
  // entry = one transaction's full data
  metrics.push({
    id:            metrics.length + 1,           // Transaction number (1, 2, 3...)
    timestamp:     new Date().toISOString(),      // Exact time (e.g. 2024-05-01T10:23:45.123Z)
    target:        entry.target,                  // "polygon" or "fabric"
    operation:     entry.operation,               // "write" or "read"
    delay_ms:      entry.delay_ms,                // How long it took in milliseconds
    status:        entry.status,                  // "success" or "error"
    error:         entry.error || null            // Error message if failed
  });
}

function getAll() {
  return metrics;
}

function getSummary() {
  // Separate data by chain
  const polygon = metrics.filter(m => m.target === "polygon" && m.status === "success");
  const fabric  = metrics.filter(m => m.target === "fabric"  && m.status === "success");

  return {
    total_transactions: metrics.length,
    polygon: computeStats(polygon),
    fabric:  computeStats(fabric),
    errors:  metrics.filter(m => m.status === "error").length
  };
}

function computeStats(data) {
  if (data.length === 0) return null;

  const delays = data.map(d => d.delay_ms).sort((a, b) => a - b);
  const sum    = delays.reduce((a, b) => a + b, 0);
  const mean   = sum / delays.length;

  // Variance = average of squared differences from mean
  const variance = delays.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / delays.length;
  const stdDev   = Math.sqrt(variance);

  return {
    count:    delays.length,
    min_ms:   delays[0],
    max_ms:   delays[delays.length - 1],
    mean_ms:  parseFloat(mean.toFixed(2)),
    median_ms: delays[Math.floor(delays.length / 2)],
    p95_ms:   delays[Math.floor(delays.length * 0.95)],  // 95th percentile (important for papers)
    p99_ms:   delays[Math.floor(delays.length * 0.99)],  // 99th percentile
    stddev_ms: parseFloat(stdDev.toFixed(2))
  };
}

module.exports = { record, getAll, getSummary };