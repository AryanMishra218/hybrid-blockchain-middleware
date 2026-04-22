async function measure(fn) {
  const start = Date.now();

  const result = await fn();

  const end = Date.now();

  return {
    result,
    delay_ms: end - start
  };
}

module.exports = { measure };