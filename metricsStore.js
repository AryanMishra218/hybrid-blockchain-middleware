// metricsStore.js
const metrics = [];

function record(entry) {
  metrics.push({
    id:         metrics.length + 1,
    timestamp:  new Date().toISOString(),
    drug_data:  entry.drug_data || null,     // ← medicine data saved here
    target:     entry.target,
    operation:  entry.operation,
    delay_ms:   entry.delay_ms,
    status:     entry.status,
    error:      entry.error || null
  });
}

function getAll()     { return metrics; }

function getSummary() {
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
  const delays   = data.map(d => d.delay_ms).sort((a, b) => a - b);
  const sum      = delays.reduce((a, b) => a + b, 0);
  const mean     = sum / delays.length;
  const variance = delays.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / delays.length;

  return {
    count:     delays.length,
    min_ms:    delays[0],
    max_ms:    delays[delays.length - 1],
    mean_ms:   parseFloat(mean.toFixed(2)),
    median_ms: delays[Math.floor(delays.length / 2)],
    p95_ms:    delays[Math.floor(delays.length * 0.95)],
    p99_ms:    delays[Math.floor(delays.length * 0.99)],
    stddev_ms: parseFloat(Math.sqrt(variance).toFixed(2))
  };
}

module.exports = { record, getAll, getSummary };