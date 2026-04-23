// async function measure(fn) {
//   const start = Date.now();

//   const result = await fn();

//   const end = Date.now();

//   return {
//     result,
//     delay_ms: end - start
//   };
// }

// module.exports = { measure };
// performance.js
const metricsStore = require("./metricsStore");

async function measure(fn, target, operation) {
  const start = Date.now();
  
  try {
    const result  = await fn();
    const end     = Date.now();
    const delay_ms = end - start;

    // Save this transaction to our store
    metricsStore.record({ target, operation, delay_ms, status: "success" });

    return { result, delay_ms, status: "success" };

  } catch (err) {
    const end      = Date.now();
    const delay_ms = end - start;

    // Save failed transaction too — important for research
    metricsStore.record({ target, operation, delay_ms, status: "error", error: err.message });

    return { result: null, delay_ms, status: "error", error: err.message };
  }
}

module.exports = { measure };